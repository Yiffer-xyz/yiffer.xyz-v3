import { useNavigate } from 'react-router';
import { useState } from 'react';
import { COMMENT_HIDE_THRESHOLD, MAX_COMMENT_LENGTH } from '~/types/constants';
import type { ComicComment } from '~/types/types';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Username from './Username';
import Link from './Link';
import { format, formatDistanceToNow } from 'date-fns';
import IconButton from './Buttons/IconButton';
import {
  MdArrowDownward,
  MdArrowUpward,
  MdCheck,
  MdClose,
  MdDelete,
  MdEdit,
} from 'react-icons/md';
import Button from './Buttons/Button';
import ProfilePicture from './ProfilePicture';
import Textarea from './Textarea/Textarea';
import useWindowSize from '~/utils/useWindowSize';
import LoadingButton from './Buttons/LoadingButton';

export default function SingleComment({
  comment,
  pagesPath,
  isAdminPanel,
  showLowScoreComments,
  isLoggedIn,
  currentUserId,
  shouldDisableOtherActions,
  onShouldDisableOtherActions,
}: {
  comment: ComicComment;
  pagesPath: string;
  isAdminPanel?: boolean;
  showLowScoreComments: boolean;
  isLoggedIn: boolean;
  currentUserId?: number;
  shouldDisableOtherActions?: boolean;
  onShouldDisableOtherActions?: (shouldDisable: boolean) => void;
}) {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  const [actionState, setActionState] = useState<'reporting' | 'editing' | null>(null);
  const [isReported, setIsReported] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);

  const reportCommentFetcher = useGoodFetcher({
    url: '/api/report-comment',
    method: 'POST',
  });

  const commentVoteFetcher = useGoodFetcher({
    url: '/api/add-comment-vote',
    method: 'POST',
  });

  const editCommentFetcher = useGoodFetcher({
    url: '/api/edit-comment',
    method: 'POST',
    onFinish: () => {
      onShouldDisableOtherActions?.(false);
      setActionState(null);
    },
  });

  const isCommentOwner = currentUserId === comment.user.id;

  function onVote(isUpvote: boolean) {
    commentVoteFetcher.submit({
      commentId: comment.id,
      isUpvote,
      comicId: comment.comicId,
    });
  }

  function onReport() {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }

    reportCommentFetcher.submit({ commentId: comment.id });
    setIsReported(true);
    setActionState(null);
  }

  function submitEdit() {
    editCommentFetcher.submit({ commentId: comment.id, newComment: editedComment });
  }

  if (comment.score && comment.score < COMMENT_HIDE_THRESHOLD && !showLowScoreComments) {
    return null;
  }

  const bottomTextClass = 'text-gray-600 dark:text-gray-750';

  return (
    <div className="pb-[4px] flex flex-row gap-x-2 w-full">
      <ProfilePicture
        user={comment.user}
        pagesPath={pagesPath}
        className="w-[70px] h-[70px]"
      />

      <div className="w-full">
        <div className="flex flex-row gap-x-4 items-end">
          <Username
            username={comment.user.username}
            id={comment.user.id}
            pagesPath={pagesPath}
            showRightArrow={false}
            className="-mb-[3px]"
          />
        </div>

        {isAdminPanel && comment.comicId && comment.comicName && (
          <div className="-mb-1 mt-1">
            <Link
              href={`/admin/comics/${comment.comicId}`}
              text={comment.comicName}
              showRightArrow
            />
          </div>
        )}

        {actionState !== 'editing' && (
          <p className="whitespace-pre-wrap mt-1 mb-1 text-sm">{comment.comment}</p>
        )}

        {actionState === 'editing' && (
          <>
            <Textarea
              value={editedComment}
              onChange={setEditedComment}
              name="newComment"
              label="Edit comment"
              className="mt-2 text-sm"
              rows={isMobile ? 8 : 3}
              helperText={
                editedComment.length
                  ? `${editedComment.length} / ${MAX_COMMENT_LENGTH}`
                  : ''
              }
              placeholder={` Harmful comments will be removed and might result in a ban.`}
            />

            <div className="flex flex-row gap-x-4 w-full justify-end">
              <Button
                text="Cancel"
                variant="naked"
                className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}
                noPadding
                onClick={() => {
                  onShouldDisableOtherActions?.(false);
                  setActionState(null);
                }}
                disabled={editCommentFetcher.isLoading}
              />
              <LoadingButton
                isLoading={editCommentFetcher.isLoading}
                text="Save"
                variant="naked"
                className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}
                noPadding
                onClick={() => {
                  submitEdit();
                }}
                smallSpinner
              />
            </div>
          </>
        )}

        <div className="flex flex-row gap-x-4 gap-y-1 md:justify-start w-full flex-wrap">
          {!actionState && !isReported && (
            <>
              <p className={`text-xs ${bottomTextClass}`}>
                {format(comment.timestamp, 'MMM do')} (
                {formatDistanceToNow(comment.timestamp)})
              </p>

              {!isCommentOwner && (
                <div className="flex flex-row -mx-2">
                  <IconButton
                    variant="naked"
                    className={`
                      text-xs font-normal w-6! h-6! -mt-1 -mb-1 ${bottomTextClass}
                      ${comment.yourVote === true ? 'text-theme1-dark dark:text-theme1-dark' : ''}
                    `}
                    noPadding
                    icon={MdArrowUpward}
                    onClick={() => onVote(true)}
                    disabled={commentVoteFetcher.isLoading}
                  />
                  {comment.score !== 0 && (
                    <p className={`text-xs font-normal mt-px ${bottomTextClass}`}>
                      {comment.score}
                    </p>
                  )}
                  <IconButton
                    variant="naked"
                    className={`
                      text-xs font-normal w-6! h-6! -mt-1 -mb-1 ${bottomTextClass}
                      ${comment.yourVote === false ? 'text-theme1-dark dark:text-theme1-dark' : ''}
                    `}
                    noPadding
                    icon={MdArrowDownward}
                    onClick={() => onVote(false)}
                    disabled={commentVoteFetcher.isLoading}
                  />
                </div>
              )}
            </>
          )}

          {actionState === 'reporting' && !isReported && (
            <div className="flex flex-row gap-x-4">
              <Button
                text="Cancel"
                variant="naked"
                className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}
                noPadding
                startIcon={MdClose}
                onClick={() => {
                  setActionState(null);
                }}
              />
              <Button
                text={isAdminPanel || isCommentOwner ? 'Delete' : 'Report'}
                variant="naked"
                className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}
                noPadding
                startIcon={MdCheck}
                onClick={onReport}
              />
            </div>
          )}

          {!actionState &&
            !isReported &&
            !comment.isHidden &&
            (isAdminPanel || !isCommentOwner) && (
              <Button
                text={isAdminPanel ? 'Delete' : 'Report'}
                variant="naked"
                className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}
                disabled={shouldDisableOtherActions}
                noPadding
                onClick={() => {
                  setActionState('reporting');
                }}
              />
            )}

          {!actionState && isCommentOwner && !isReported && (
            <div className="flex flex-row -mx-2">
              <p className={`text-xs font-normal mt-px mx-2.5 ${bottomTextClass}`}>
                {comment.score}
              </p>

              <IconButton
                icon={MdEdit}
                className={`text-xs font-normal w-6! h-6! -mt-1 -mb-1 ${bottomTextClass}`}
                noPadding
                variant="naked"
                disabled={shouldDisableOtherActions}
                onClick={() => {
                  onShouldDisableOtherActions?.(true);
                  setActionState('editing');
                }}
              />

              <IconButton
                icon={MdDelete}
                className={`text-xs font-normal w-6! h-6! -mt-1 -mb-1 ${bottomTextClass}`}
                noPadding
                variant="naked"
                disabled={shouldDisableOtherActions}
                onClick={() => {
                  setActionState('reporting');
                }}
              />
            </div>
          )}

          {isReported && !comment.isHidden && (
            <p className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}>
              {isAdminPanel || isCommentOwner
                ? 'Deleting...'
                : 'Reported - mods will review this comment.'}
            </p>
          )}
        </div>

        {isAdminPanel && comment.isHidden && (
          <p className="text-red-strong-300 font-semibold text-xs mt-0.5">
            This comment has been removed
          </p>
        )}
      </div>
    </div>
  );
}
