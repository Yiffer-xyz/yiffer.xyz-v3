import { useState } from 'react';
import { type Comic, type ComicComment } from '~/types/types';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Textarea from '~/ui-components/Textarea/Textarea';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { MAX_COMMENT_LENGTH, R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import Username from '~/ui-components/Username';
import { format, formatDistanceToNow } from 'date-fns';
import Button from '~/ui-components/Buttons/Button';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from '@remix-run/react';
import { MdCheck, MdClose } from 'react-icons/md';
import Link from '~/ui-components/Link';

export default function ComicComments({
  comic,
  pagesPath,
  isLoggedIn,
  className,
  isAdminPanel,
}: {
  comic: Comic;
  pagesPath: string;
  isLoggedIn: boolean;
  className?: string;
  isAdminPanel?: boolean;
}) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');

  const addCommentFetcher = useGoodFetcher({
    url: '/api/add-comment',
    method: 'post',
    onFinish: () => {
      setNewComment('');
    },
  });

  const reportCommentFetcher = useGoodFetcher({
    url: '/api/report-comment',
    method: 'post',
  });

  function onReport(commentId: number) {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }

    reportCommentFetcher.submit({ commentId });
  }

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
              onReport={onReport}
              isAdminPanel={isAdminPanel}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm my-2">No comments yet.</p>
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
            helperText={
              newComment.length ? `${newComment.length} / ${MAX_COMMENT_LENGTH}` : ''
            }
            placeholder="Harmful comments will be removed and might result in a ban."
          />

          <LoadingButton
            text="Submit comment"
            disabled={newComment.length === 0 || newComment.length > MAX_COMMENT_LENGTH}
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

export function SingleComment({
  comment,
  pagesPath,
  onReport,
  isAdminPanel,
}: {
  comment: ComicComment;
  pagesPath: string;
  onReport: (commentId: number) => void;
  isAdminPanel?: boolean;
}) {
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);

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

        <div className="flex flex-row gap-x-6 justify-between md:justify-start w-full">
          {!isReporting && !isReported && (
            <p className={`text-xs ${bottomTextClass}`}>
              {format(comment.timestamp, 'P')} (
              {formatDistanceToNow(comment.timestamp, { addSuffix: true })})
            </p>
          )}

          {isReporting && !isReported && (
            <div className="flex flex-row gap-x-4">
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
                onClick={() => {
                  onReport(comment.id);
                  setIsReported(true);
                  setIsReporting(false);
                }}
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
