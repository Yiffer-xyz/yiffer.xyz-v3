import Button from '../Buttons/Button';
import { FaXmark } from 'react-icons/fa6';
import { useRef, useState } from 'react';
import FileInput from '../FileInput';
import type { ImageFileOrUrl } from '~/utils/general';
import { getFileExtension, getFileWithBase64 } from '~/utils/general';
import ThumbnailCropper from '~/page-components/ThumbnailCropper/ThumbnailCropper';
import { PROFILE_PIC_SIZE } from '~/types/constants';
import { showErrorToast, useGoodFetcher } from '~/utils/useGoodFetcher';
import { useUIPreferences } from '~/utils/theme-provider';
import { FaTrash } from 'react-icons/fa';
import type { ProcessFilesArgs } from '~/types/types';
import { generateToken } from '~/utils/string-utils';

export default function PublicProfilePhotoEditor({
  imagesServerUrl,
  hasExistingPhoto,
  adminOverrideUserId,
  onFinish,
}: {
  imagesServerUrl: string;
  hasExistingPhoto: boolean;
  adminOverrideUserId?: number;
  onFinish: () => void;
}) {
  const { theme } = useUIPreferences();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileToCrop, setFileToCrop] = useState<ImageFileOrUrl | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProfilePicFetcher = useGoodFetcher({
    url: '/api/update-profile-photo',
    method: 'post',
    toastError: true,
    onFinish: () => {
      setIsSubmitting(false);
      onFinish();
    },
  });

  const removeProfilePicFetcher = useGoodFetcher({
    url: '/api/remove-profile-photo',
    method: 'post',
    toastError: true,
    onFinish: () => {
      setIsSubmitting(false);
      onFinish();
    },
  });

  async function onThumbnailFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length) {
      const fileStr = await getFileWithBase64(files[0]);
      setFileToCrop(fileStr);
    }
  }

  function onCancelCrop() {
    setFileToCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function onCropFinished(croppedImage: ImageFileOrUrl) {
    setIsSubmitting(true);
    if (!croppedImage.file) return;

    const processFilesArgs: ProcessFilesArgs = {
      formats: ['jpg', 'webp'],
      resizes: [{ width: PROFILE_PIC_SIZE, height: PROFILE_PIC_SIZE }],
    };

    const tempToken = generateToken();

    const formData = new FormData();
    formData.append(
      'files',
      croppedImage.file,
      `${tempToken}.${getFileExtension(croppedImage.file.name)}`
    );
    formData.append('argsJson', JSON.stringify(processFilesArgs));

    const res = await fetch(`${imagesServerUrl}/process-files`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const resText = await res.text();
      showErrorToast('Error changing profile photo: ' + resText, theme);
      return;
    }

    updateProfilePicFetcher.submit({ tempToken });
  }

  async function onRemoveProfilePhoto() {
    setIsSubmitting(true);
    removeProfilePicFetcher.submit({ userId: adminOverrideUserId });
  }

  return (
    <div className="mt-2 mb-4 flex flex-col items-start">
      <h3 className="text-lg font-bold">Change profile photo</h3>
      <div className="flex flex-col gap-2 mt-1 mb-2">
        {!adminOverrideUserId && (
          <FileInput
            onChange={onThumbnailFileUpload}
            ref={fileInputRef}
            accept="image/*"
          />
        )}
        {hasExistingPhoto && (
          <Button
            text="Remove photo"
            color="error"
            startIcon={FaTrash}
            className="!w-[180px]"
            onClick={onRemoveProfilePhoto}
            disabled={isSubmitting}
          />
        )}
        <Button
          variant="outlined"
          text="Cancel"
          startIcon={FaXmark}
          onClick={onFinish}
          className="!w-[180px]"
        />
      </div>

      {fileToCrop && (
        <ThumbnailCropper
          mode="inline"
          minHeight={PROFILE_PIC_SIZE}
          minWidth={PROFILE_PIC_SIZE}
          image={fileToCrop}
          onComplete={onCropFinished}
          onClose={onCancelCrop}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
