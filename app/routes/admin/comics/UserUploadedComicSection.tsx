import { useEffect, useState } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { Comic } from '~/types/types';
import { useFetcher } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { format } from 'date-fns';
import RadioButtonGroup from '~/components/RadioButton/RadioButtonGroup';
import TextInput from '~/components/TextInput/TextInput';
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import { ApiResponse, MaybeApiResponse } from '~/utils/request-helpers';
import InfoBox from '~/components/InfoBox';

type UserUploadSectionProps = {
  comicData: Comic;
  updateComic: () => void;
};

const reviewOptions = [
  { value: 'excellent', text: 'No issues found' },
  {
    value: 'minor-issues',
    text: 'Minor issues (e.g. incorrect category/classification, name spelling error)',
  },
  {
    value: 'major-issues',
    text: 'Major issues (e.g. lacking artist links, poor tagging, bad thumbnail)',
  },
  {
    value: 'page-issues',
    text: 'Poor resolution, wrong ordering, premium pages uploaded',
  },
  { value: 'rejected', text: 'Not usable, reject submission' },
];

export default function UserUploadSection({
  comicData,
  updateComic,
}: UserUploadSectionProps) {
  const fetcher = useFetcher<MaybeApiResponse>();
  const [verdict, setVerdict] = useState<string | null>();
  const [modComment, setModComment] = useState<string>('');

  useEffect(() => {
    if (fetcher.data?.success) {
      updateComic();
    }
  }, [fetcher]);

  function submitReview() {
    if (!verdict) return;

    const body: any = {
      comicId: comicData.id.toString(),
      verdict,
    };
    if (modComment) body.modComment = modComment;

    fetcher.submit(body, {
      action: '/api/admin/process-user-upload',
      method: 'post',
    });
  }

  return (
    <>
      <p className="mt-2">
        This comic is not live. It has been uploaded by a user and is now up for mod
        review.
      </p>
      <p>Uploaded by {comicData.unpublishedData?.uploadUsername}.</p>
      <p>
        Uploaded {format(new Date(comicData.unpublishedData?.timestamp || ''), 'PPPPp')}
      </p>

      <h4 className="mt-4">Review submission</h4>
      <p>
        You should <b>fix errors before you submit the review</b>. Submitting the review
        will turn the comic into a pending one, unless you reject it.
      </p>

      <RadioButtonGroup
        options={reviewOptions}
        name="review"
        value={verdict}
        onChange={setVerdict}
        className="mt-2"
      />

      <p className="mt-4">
        You can add a comment for the user to see. Keep it <u>short</u> and constructive!
        The goal is to help the user do better next time.
      </p>
      <p>
        You <i>can</i> leave it blank even if there are issues, but helping the user helps
        us in the long run.
      </p>

      <TextInput
        name="modComment"
        label="Comment - optional"
        className="mt-4"
        value={modComment}
        onChange={setModComment}
      />

      {fetcher.data?.error && (
        <InfoBox variant="error" text={fetcher.data.error} showIcon className="mt-4" />
      )}

      <fetcher.Form>
        <LoadingButton
          text="Save review and process comic"
          isLoading={fetcher.state === 'submitting'}
          onClick={submitReview}
          startIcon={IoCheckmark}
          className="mt-6"
          disabled={!verdict}
        />
      </fetcher.Form>
    </>
  );
}
