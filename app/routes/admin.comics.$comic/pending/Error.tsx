import { IoCheckmark, IoClose } from 'react-icons/io5';
import { MdCheck, MdError } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import TextInputUncontrolled from '~/ui-components/TextInput/TextInputUncontrolled';
import type { Comic } from '~/types/types';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import InfoBox from '~/ui-components/InfoBox';

type PendingComicErrorParams = {
  comicData: Comic;
  onCancel: () => void;
  onFinish: () => void;
};

export function SetError({ comicData, onCancel, onFinish }: PendingComicErrorParams) {
  const fetcher = useGoodFetcher({
    url: '/api/admin/set-comic-error',
    method: 'post',
    onFinish: onFinish,
    toastSuccessMessage: 'Error set',
  });

  return (
    <>
      <h4>Set error</h4>
      <fetcher.Form>
        <input type="hidden" name="comicId" value={comicData.id} />

        <InfoBox
          variant="info"
          text="Ideally, fix the error yourself instead of setting it here."
          small
          boldText={false}
          fitWidth
          className="mt-1 mb-2"
        />

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
            isLoading={fetcher.isLoading}
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
  const fetcher = useGoodFetcher({
    url: '/api/admin/set-comic-error',
    method: 'post',
    onFinish: onFinish,
    toastSuccessMessage: 'Error removed',
  });

  return (
    <>
      <div className="mt-2 mb-4">
        <p>
          <b>
            <MdError /> Error: {comicData.metadata?.errorText}
          </b>
        </p>
        {comicData.metadata?.pendingProblemModId && (
          <p>
            <MdCheck /> A mod has been assigned to fix this problem
          </p>
        )}
      </div>

      <fetcher.Form>
        <input type="hidden" name="comicId" value={comicData.id} />
        <input type="hidden" name="errorText" value={''} />
        <LoadingButton
          text="Remove error status"
          isLoading={fetcher.isLoading}
          isSubmit
        />
      </fetcher.Form>
    </>
  );
}
