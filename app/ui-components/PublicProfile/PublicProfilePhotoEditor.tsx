import Button from '../Buttons/Button';
import { FaXmark } from 'react-icons/fa6';
import { useRef, useState } from 'react';
import FileInput from '../FileInput';
import type { ComicImage } from '~/utils/general';
import { getFileWithBase64 } from '~/utils/general';
import ThumbnailCropper from '~/page-components/ThumbnailCropper/ThumbnailCropper';
import { PROFILE_PIC_SIZE } from '~/types/constants';
import { showErrorToast, useGoodFetcher } from '~/utils/useGoodFetcher';
import { useUIPreferences } from '~/utils/theme-provider';
import { FaTrash } from 'react-icons/fa';

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
  const [fileToCrop, setFileToCrop] = useState<ComicImage | undefined>(undefined);
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

  async function onCropFinished(croppedImage: ComicImage) {
    setIsSubmitting(true);
    if (!croppedImage.file) return;

    const formData = new FormData();
    formData.append('file', croppedImage.file);

    const res = await fetch(`${imagesServerUrl}/upload-file`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const resText = await res.text();
      showErrorToast('Error changing profile photo: ' + resText, theme);
      return;
    }

    const resJson = (await res.json()) as { tempToken: string };
    const tempToken = resJson.tempToken;
    if (!tempToken) {
      showErrorToast('Error: No token returned', theme);
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
