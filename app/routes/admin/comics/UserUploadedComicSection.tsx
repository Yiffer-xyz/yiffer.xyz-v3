import { useEffect, useState } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { Comic } from '~/types/types';
import { useFetcher } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { format } from 'date-fns';
import RadioButtonGroup from '~/components/RadioButton/RadioButtonGroup';
import TextInput from '~/components/TextInput/TextInput';
import { MaybeApiResponse } from '~/utils/request-helpers';
import InfoBox from '~/components/InfoBox';
import { CONTRIBUTION_POINTS } from '~/types/contributions';

type UserUploadSectionProps = {
  comicData: Comic;
  updateComic: () => void;
};

const reviewOptions = Object.entries(CONTRIBUTION_POINTS.comicUpload).map(
  ([verdict, value]) => ({
    value: verdict,
    text: value.modPanelDescription,
  })
);

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
      comicName: comicData.name,
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

      {(verdict === 'rejected' || verdict === 'rejected-list') && (
        <InfoBox
          variant="info"
          title="Rejecting"
          showIcon
          className="mt-4 max-w-4xl"
          boldText={false}
        >
          <p className="mt-2">
            If the comic should not be on Yiffer.xyz at all - for example if the art
            quality is too bad, if it's a cub comic, if it's not in English, or if it's
            got censoring bars (etc.) - use the upper of the two reject options. This will
            add the comic's name to a <u>ban list</u>, preventing others from uploading
            it. It is therefore important that you <u>fix the name</u> in case it's
            misspelled. If choosing this, you should absolutely leave a brief comment
            explaining why.
          </p>
          <p className="mt-4">
            If the comic could be on Yiffer.xyz but the quality upload is garbage, use the
            lower of the two options. Use this one if it's spam/trolling as well.
          </p>
        </InfoBox>
      )}

      <p className="mt-4">
        You can add a comment for the user to see. Keep it <u>short</u> and constructive!
        The goal is to help the user do better next time.
      </p>
      <p>
        You <i>can</i> leave it blank even if there are issues, but helping the user helps
        us in the long run. Do not comment on obvious trolling.
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
