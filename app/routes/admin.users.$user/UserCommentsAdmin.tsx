import { MdArrowForward } from 'react-icons/md';
import type { AdminPanelUserComment } from '~/types/types';
import Link from '~/ui-components/Link';

export default function UserCommentsAdmin({
  comments,
}: {
  comments: AdminPanelUserComment[];
}) {
  return (
    <div className="flex flex-col gap-y-4">
      {comments.map(comment => (
        <div
          key={comment.id}
          className={`border-l-2 pl-2 ${comment.isHidden ? 'border-red-strong-300' : 'border-gray-800 dark:border-gray-600'}`}
        >
          <div className="flex flex-row gap-x-3 flex-wrap">
            <p className="font-semibold">{comment.comicName}</p>
            <Link
              href={`/admin/comics/${comment.comicId}`}
              text="Admin"
              IconRight={MdArrowForward}
            />
            <Link href={`/c/${comment.comicName}`} text="Live" showRightArrow />
          </div>
          <p>{comment.comment}</p>
          {comment.isHidden && (
            <p className="text-red-strong-300 font-semibold">
              This comment has been removed
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
