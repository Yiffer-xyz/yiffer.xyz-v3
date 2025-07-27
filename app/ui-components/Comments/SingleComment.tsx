import { useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { COMMENT_HIDE_THRESHOLD, R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import type { ComicComment } from '~/types/types';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Username from '../Username';
import Link from '../Link';
import { format, formatDistanceToNow } from 'date-fns';
import IconButton from '../Buttons/IconButton';
import { MdArrowDownward, MdArrowUpward, MdCheck, MdClose } from 'react-icons/md';
import Button from '../Buttons/Button';

export default function SingleComment({
  comment,
  pagesPath,
  isAdminPanel,
  showLowScoreComments,
  isLoggedIn,
}: {
  comment: ComicComment;
  pagesPath: string;
  isAdminPanel?: boolean;
  showLowScoreComments: boolean;
  isLoggedIn: boolean;
}) {
  const navigate = useNavigate();

  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const reportCommentFetcher = useGoodFetcher({
    url: '/api/report-comment',
    method: 'post',
  });

  const commentVoteFetcher = useGoodFetcher({
    url: '/api/add-comment-vote',
    method: 'post',
  });

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
    setIsReporting(false);
  }

  if (comment.score && comment.score < COMMENT_HIDE_THRESHOLD && !showLowScoreComments) {
    return null;
  }

  const bottomTextClass = 'text-gray-600 dark:text-gray-750';

  return (
    <div className="pb-[4px] flex flex-row gap-x-2 w-full">
      {comment.user.profilePictureToken ? (
        <img
          src={`${pagesPath}/${R2_PROFILE_PICTURES_FOLDER}/${comment.user.profilePictureToken}.jpg`}
          className="w-[68px] h-[68px] mt-[3px] rounded"
          alt={comment.user.username}
        />
      ) : (
        <div className="w-[68px] h-[68px] mt-[3px] rounded bg-gray-800 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <FaUser className="text-3xl" color="#666" />
        </div>
      )}

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

        <p className="whitespace-pre-wrap mt-1 mb-1.5">{comment.comment}</p>

        <div className="flex flex-row gap-x-4 gap-y-1 md:justify-start w-full flex-wrap">
          {!isReporting && !isReported && (
            <>
              <p className={`text-xs ${bottomTextClass}`}>
                {format(comment.timestamp, 'MMM do')} (
                {formatDistanceToNow(comment.timestamp)})
              </p>

              <div className="flex flex-row -mx-2">
                <IconButton
                  variant="naked"
                  className={`
                    text-xs font-normal !w-6 !h-6 -mt-1 -mb-1 ${bottomTextClass}
                    ${comment.yourVote === true ? 'text-theme1-dark' : ''}
                  `}
                  noPadding
                  icon={MdArrowUpward}
                  onClick={() => onVote(true)}
                  disabled={commentVoteFetcher.isLoading}
                />
                {comment.score !== 0 && (
                  <p className={`text-xs font-normal mt-[1px] ${bottomTextClass}`}>
                    {comment.score}
                  </p>
                )}
                <IconButton
                  variant="naked"
                  className={`
                    text-xs font-normal !w-6 !h-6 -mt-1 -mb-1 ${bottomTextClass}
                    ${comment.yourVote === false ? 'text-theme1-dark' : ''}
                  `}
                  noPadding
                  icon={MdArrowDownward}
                  onClick={() => onVote(false)}
                  disabled={commentVoteFetcher.isLoading}
                />
              </div>
            </>
          )}

          {isReporting && !isReported && (
            <div className="flex flex-row gap-x-4 ">
              <Button
                text="Cancel"
                variant="naked"
                className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}
                noPadding
                startIcon={MdClose}
                onClick={() => {
                  setIsReporting(false);
                }}
              />
              <Button
                text={isAdminPanel ? 'Delete' : 'Report'}
                variant="naked"
                className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}
                noPadding
                startIcon={MdCheck}
                onClick={onReport}
              />
            </div>
          )}

          {!isReporting && !isReported && !comment.isHidden && (
            <Button
              text={isAdminPanel ? 'Delete' : 'Report'}
              variant="naked"
              className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}
              noPadding
              onClick={() => {
                setIsReporting(true);
              }}
            />
          )}

          {isReported && !comment.isHidden && (
            <p className={`text-xs font-normal p-0 -mb-[1.25px] ${bottomTextClass}`}>
              Reported - mods will review this comment.
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
