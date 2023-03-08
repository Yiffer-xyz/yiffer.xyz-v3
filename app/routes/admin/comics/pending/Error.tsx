import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import { Comic } from '~/types/types';

type PendingComicErrorParams = {
  comicData: Comic;
  onCancel: () => void;
  onFinish: () => void;
};

export function SetError({ comicData, onCancel, onFinish }: PendingComicErrorParams) {
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data?.success) {
      onFinish();
    }
  }, [fetcher]);

  return (
    <>
      <h4>Set error</h4>
      <fetcher.Form action="/api/admin/set-comic-error" method="post">
        <input type="hidden" name="comicId" value={comicData.id} />

        <TextInputUncontrolled
          label="Short error text"
          placeholder={`Eg. "low page res", "bad thumbnail"`}
          name="errorText"
          className="max-w-sm"
        />
        <div className="flex flex-row gap-4 mt-4">
          <Button
            text="Cancel"
            variant="outlined"
            onClick={onCancel}
            startIcon={IoClose}
          />
          <LoadingButton
            text="Save"
            startIcon={IoCheckmark}
            isLoading={fetcher.state === 'submitting'}
            isSubmit
          />
        </div>
      </fetcher.Form>
    </>
  );
}

type PendingComicHasErrorParams = {
  comicData: Comic;
  onFinish: () => void;
};

export function HasError({ comicData, onFinish }: PendingComicHasErrorParams) {
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data?.success) {
      onFinish();
    }
  }, [fetcher]);

  return (
    <>
      <p className="mt-2 mb-4">
        <b>Error: {comicData.unpublishedData?.errorText}</b>
      </p>

      <fetcher.Form action="/api/admin/set-comic-error" method="post">
        <input type="hidden" name="comicId" value={comicData.id} />
        <input type="hidden" name="errorText" value={''} />
        <LoadingButton
          text="Remove error status"
          isLoading={fetcher.state === 'submitting'}
          isSubmit
        />
      </fetcher.Form>
    </>
  );
}
