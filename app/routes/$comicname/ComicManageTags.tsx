import { useEffect, useMemo, useState } from 'react';
import { MdArrowForward, MdCheck, MdClear } from 'react-icons/md';
import TagsEditor from '~/page-components/ComicManager/Tags';
import type { Tag, Comic } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type ComicContributeProps = {
  comic: Comic;
  setIsManagingTags: (isManagingTags: boolean) => void;
  isLoggedIn: boolean;
  isMod: boolean;
  infoBoxesExtraMarginClass: string;
};

export default function ComicManageTags({
  comic,
  setIsManagingTags,
  isLoggedIn,
  isMod,
  infoBoxesExtraMarginClass,
}: ComicContributeProps) {
  const [newTagList, setNewTagList] = useState<Tag[]>(comic.tags);
  const [isSuccess, setIsSuccess] = useState(false);

  const { submit: fetchAllTags, data: allTags } = useGoodFetcher<Tag[]>({
    url: '/api/tags',
    fetchGetOnLoad: false,
  });

  const { isLoading, submit: submitTags } = useGoodFetcher({
    url: '/api/submit-tag-changes',
    method: 'post',
    onFinish: () => setIsSuccess(true),
  });

  function onCancel() {
    setIsManagingTags(false);
    setNewTagList(comic.tags);
  }

  useEffect(() => {
    if (!allTags) fetchAllTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { newTags, removedTags, areChanges } = useMemo(() => {
    const newTags: Tag[] = [];
    const removedTags: Tag[] = [];

    for (const tag of newTagList) {
      if (!comic.tags.find(t => t.id === tag.id)) {
        newTags.push(tag);
      }
    }

    for (const tag of comic.tags) {
      if (!newTagList.find(t => t.id === tag.id)) {
        removedTags.push(tag);
      }
    }

    return {
      newTags,
      removedTags,
      areChanges: newTags.length > 0 || removedTags.length > 0,
    };
  }, [comic.tags, newTagList]);

  function onSubmit() {
    submitTags({
      body: JSON.stringify({
        comicId: comic.id,
        newTagIDs: newTags.map(tag => tag.id),
        removedTagIDs: removedTags.map(tag => tag.id),
      }),
    });
  }

  if (isSuccess) {
    return (
      <InfoBox
        variant="success"
        className={`mt-4 w-fit md:w-[728px] ${infoBoxesExtraMarginClass}`}
        closable
        fitWidth
        overrideOnCloseFunc={onCancel}
      >
        <p className="font-normal">Thanks for your suggestion!</p>
        {isLoggedIn && !isMod && (
          <p className="font-normal">
            You can follow your submission's progress on the{' '}
            <Link
              isInsideParagraph
              href="/contribute/your-contributions"
              text="Your contributions page"
              className="!text-white"
              IconRight={MdArrowForward}
            />
          </p>
        )}

        {isMod && (
          <p className="font-normal">
            Since you're a mod, your changes have been applied immediately.
          </p>
        )}

        {!isLoggedIn && (
          <p className="font-normal">
            Next time, if you log in, you can follow your submission's progress and earn
            contribution points for it.
          </p>
        )}
      </InfoBox>
    );
  }

  return (
    <TopGradientBox
      containerClassName={`mt-4 max-w-4xl md:w-[728px] ${infoBoxesExtraMarginClass}`}
      innerClassName="p-4 flex flex-col"
    >
      <p className="font-semibold text-lg">Manage tags</p>
      <p className="text-sm mb-2">Your suggestion will be reviewed by mods.</p>
      {!isLoggedIn && (
        <p className="text-sm mb-3">
          Log in or sign up to earn contribution points and track your suggestion's
          progress!
        </p>
      )}

      <TagsEditor
        allTags={allTags ?? newTagList}
        tags={newTagList}
        onUpdate={setNewTagList}
        className=""
      />

      {areChanges && (
        <>
          <div className="bg-theme1-primaryTrans p-2 mt-4 w-full">
            {newTags.length > 0 && (
              <p>
                <span className="font-bold">
                  {newTags.length} new tag{newTags.length > 1 ? 's' : ''}:
                </span>{' '}
                {newTags.map(tag => tag.name).join(', ')}
              </p>
            )}

            {removedTags.length > 0 && (
              <p>
                <span className="font-bold">
                  {removedTags.length} removed tag{removedTags.length > 1 ? 's' : ''}:
                </span>{' '}
                {removedTags.map(tag => tag.name).join(', ')}
              </p>
            )}
          </div>
        </>
      )}

      <div className="mt-4 flex flex-row gap-2 self-end">
        <Button text="Cancel" variant="outlined" onClick={onCancel} startIcon={MdClear} />
        <LoadingButton
          text="Submit for review"
          startIcon={MdCheck}
          isLoading={isLoading}
          disableElevation
          onClick={onSubmit}
          disabled={!areChanges}
        />
      </div>
    </TopGradientBox>
  );
}
