import { useState } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import type { Comic } from '~/types/types';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { format } from 'date-fns';
import RadioButtonGroup from '~/ui-components/RadioButton/RadioButtonGroup';
import TextInput from '~/ui-components/TextInput/TextInput';
import InfoBox from '~/ui-components/InfoBox';
import { CONTRIBUTION_POINTS } from '~/types/contributions';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Link from '~/ui-components/Link';

const reviewOptions = Object.entries(CONTRIBUTION_POINTS.comicUpload).map(
  ([verdict, value]) => ({
    value: verdict,
    text: value.modPanelDescription,
  })
);

type UserUploadSectionProps = {
  comicData: Comic;
  updateComic: () => void;
};

export default function UserUploadSection({
  comicData,
  updateComic,
}: UserUploadSectionProps) {
  const [verdict, setVerdict] = useState<string | null>();
  const [modComment, setModComment] = useState<string>('');

  const fetcher = useGoodFetcher({
    url: '/api/admin/process-user-upload',
    method: 'post',
    toastSuccessMessage: 'Comic processed',
    onFinish: updateComic,
  });

  function submitReview() {
    if (!verdict) return;

    const body = {
      comicId: comicData.id.toString(),
      comicName: comicData.name,
      verdict,
      uploaderId: comicData.metadata?.uploadUserId,
      ...(modComment && { modComment }),
    };

    fetcher.submit(body);
  }

  return (
    <>
      <p className="mt-2 text-sm">
        This comic is not live. It has been uploaded by a user and is now up for mod
        review.
      </p>
      <p className="mb-2">
        <Link
          href={`/c/${comicData.name}`}
          text="Preview comic page"
          showRightArrow
          isInsideParagraph
        />
      </p>
      <p>
        Uploaded by{' '}
        <Link
          text={comicData.metadata?.uploadUsername || 'Unknown'}
          href={`/admin/users/${comicData.metadata?.uploadUserId}`}
          showRightArrow
          isInsideParagraph
        />
        , {format(comicData.metadata?.timestamp || '', 'PPPPp')}
      </p>
      <p className="mt-4">
        <b>Source</b>: {comicData.metadata?.source ?? 'Not provided.'}
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
          disableElevation
        >
          <p className="mt-2">
            If the comic should not be on Yiffer.xyz at all - for example if the art
            quality is too bad, if it's a cub comic, if it's not in English, or if it's
            got censoring bars (etc.) - use the upper of the two reject options. This will
            add the comic's name to a <u>ban list</u>, preventing others from uploading
            it. It is therefore important that you <u>fix the name</u> in case it's
            misspelled.
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

      <fetcher.Form>
        <LoadingButton
          text="Save review and process comic"
          isLoading={fetcher.isLoading}
          onClick={submitReview}
          startIcon={IoCheckmark}
          className="mt-6"
          disabled={!verdict}
        />
      </fetcher.Form>
    </>
  );
}
