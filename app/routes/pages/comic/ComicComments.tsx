import { useState } from 'react';
import { type Comic } from '~/types/types';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Textarea from '~/ui-components/Textarea/Textarea';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { COMMENT_HIDE_THRESHOLD, MAX_COMMENT_LENGTH } from '~/types/constants';
import Button from '~/ui-components/Buttons/Button';
import Link from '~/ui-components/Link';
import SingleComment from '~/ui-components/SingleComment';

export default function ComicComments({
  comic,
  pagesPath,
  isLoggedIn,
  className,
  isAdminPanel,
  userId,
}: {
  comic: Comic;
  pagesPath: string;
  isLoggedIn: boolean;
  className?: string;
  isAdminPanel?: boolean;
  userId: number | undefined;
}) {
  const [newComment, setNewComment] = useState('');
  const [showLowScoreComments, setShowLowScoreComments] = useState(false);
  const [shouldDisableOtherActions, setShouldDisableOtherActions] = useState(false);

  const hiddenComments = comic.comments.filter(
    comment => comment.score && comment.score < COMMENT_HIDE_THRESHOLD
  );

  const addCommentFetcher = useGoodFetcher({
    url: '/api/add-comment',
    method: 'POST',
    onFinish: () => {
      setNewComment('');
    },
  });

  return (
    <div className={`w-full md:w-[728px]  flex flex-col ${className ?? ''}`}>
      {!isAdminPanel && (
        <h3>
          {comic.comments.length > 0 ? `${comic.comments.length} comments` : 'Comments'}
        </h3>
      )}

      {comic.comments.length > 0 ? (
        <div className="flex flex-col gap-4 mt-1 mb-6 md:mb-4">
          {comic.comments.map(comment => (
            <SingleComment
              key={comment.id}
              comment={comment}
              pagesPath={pagesPath}
              isAdminPanel={isAdminPanel}
              showLowScoreComments={showLowScoreComments}
              isLoggedIn={isLoggedIn}
              currentUserId={userId}
              shouldDisableOtherActions={shouldDisableOtherActions}
              onShouldDisableOtherActions={setShouldDisableOtherActions}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm my-2">No comments yet.</p>
      )}

      {hiddenComments.length > 0 && !showLowScoreComments && (
        <div className="flex flex-row gap-x-2 items-center mb-4 -mt-4 md:-mt-2">
          <p className="text-sm">{hiddenComments.length} hidden due to low score.</p>
          <Button
            variant="naked"
            text="Show"
            noPadding
            className="h-6"
            onClick={() => setShowLowScoreComments(true)}
          />
        </div>
      )}

      {!isAdminPanel && isLoggedIn && (
        <>
          <Textarea
            value={newComment}
            onChange={setNewComment}
            name="newComment"
            label="Add a comment"
            className="mt-2 text-sm"
            rows={3}
            disabled={shouldDisableOtherActions}
            helperText={
              newComment.length ? `${newComment.length} / ${MAX_COMMENT_LENGTH}` : ''
            }
            placeholder={` Harmful comments will be removed and might result in a ban.`}
          />

          <p className="text-xs text-gray-600 dark:text-gray-750 italic mt-1 mb-1">
            Want to report a problem with this comic? Use the "Contribute" button at the
            top instead of commenting.
          </p>

          <p className="text-sm text-red-strong-200 italic mt-1 mb-1 font-bold">
            We're glad some users are enjoying commenting a lot, but please, keep them
            somewhat meaningful. Comments last forever, and other future users are not
            interested in seeing "firsts", single emoji comments, or chatting you can do
            in DMs instead. If all you have to say is "X/10", refrain from commenting. We{' '}
            <u>will</u> be removing low quality or pointless comments. Help keep the site
            a fun place for everyone, and help not wasting mod time.
          </p>

          <LoadingButton
            text="Submit comment"
            disabled={
              newComment.length === 0 ||
              newComment.length > MAX_COMMENT_LENGTH ||
              shouldDisableOtherActions
            }
            disableElevation={
              newComment.length === 0 || newComment.length > MAX_COMMENT_LENGTH
            }
            className="mt-2"
            isLoading={addCommentFetcher.isLoading}
            onClick={() => {
              addCommentFetcher.submit({ comment: newComment, comicId: comic.id });
            }}
          />
        </>
      )}

      {!isAdminPanel && !isLoggedIn && (
        <p className="mt-0 md:mt-2">
          <Link href="/login" text="Log in" /> to comment.
        </p>
      )}
    </div>
  );
}
