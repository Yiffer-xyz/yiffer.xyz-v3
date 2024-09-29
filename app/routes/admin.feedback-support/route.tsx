import { unstable_defineLoader } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getAllFeedback } from '~/route-funcs/get-feedback';
import { processApiError } from '~/utils/request-helpers';
import FeedbackItem from '~/page-components/UserFeedback/FeedbackItem'
import Button from '~/ui-components/Buttons/Button'
import {useState} from 'react'
import {useGoodFetcher} from '~/utils/useGoodFetcher'
import {ArchiveFeedbackBody} from '~/routes/api.admin.archive-feedback'
import {DeleteFeedbackBody} from '~/routes/api.admin.delete-feedback'

export const loader = unstable_defineLoader(async args => {
  const feedbackRes = await getAllFeedback(args.context.cloudflare.env.DB);
  if (feedbackRes.err) {
    return processApiError('Error getting data in admin feedback route', feedbackRes.err);
  }

  return { feedback: feedbackRes.result };
});

export default function AdminFeedback() {
  const { feedback } = useLoaderData<typeof loader>();

  const [ unprocessedSelected, setUnprocessedSelected ] = useState(true);

  const archiveFeedbackFetcher = useGoodFetcher({
    url: '/api/admin/archive-feedback',
    method: 'post'
  })
  const deleteFeedbackFetcher = useGoodFetcher({
    url: '/api/admin/delete-feedback',
    method: 'post'
  })

  function onArchiveClick(id: number) {
    const body: ArchiveFeedbackBody = {
      feedbackId: id
    }

    archiveFeedbackFetcher.submit({body: JSON.stringify(body)})
  }

  function onDeleteClick(id: number) {
    const body: DeleteFeedbackBody = {
      feedbackId: id
    }

    deleteFeedbackFetcher.submit({body: JSON.stringify(body)})
  }

  const feedbackToShow = unprocessedSelected ? feedback.filter(f => !f.isArchived) : feedback.filter(f => f.isArchived);

  const selectedButtonClass = "bg-gradient-to-r from-[#7FC7C4] to-[#9CEDCF]";
  const unselectedButtonClass = "bg-gray-700 dark:bg-gray-500";

  let unprocessedButtonClass = 'px-4 rounded-l-md rounded-r-none';
  let archivedButtonClass = 'px-8 rounded-r-md rounded-l-none';

  if (unprocessedSelected) {
    unprocessedButtonClass += ' ' + selectedButtonClass;
    archivedButtonClass += ' ' + unselectedButtonClass;
  } else {
    unprocessedButtonClass += ' ' + unselectedButtonClass;
    archivedButtonClass += ' ' + selectedButtonClass;
  }

  return (
    <>
      <h1>User feedback</h1>
      <div className="flex flex-row my-4">
        <Button className={unprocessedButtonClass} text="Unprocessed" onClick={() => setUnprocessedSelected(true)}/>
        <Button className={archivedButtonClass} text="Archived" onClick={() => setUnprocessedSelected(false)}/>
      </div>
      <section className="max-w-2xl">
        <p>
          To respond to support requests, go to the user's profile and send them an email via their account's associated
          address. Make sure to archive the issue here immediately, to prevent other mods from doing the same.
        </p>

        {feedbackToShow.map(feedback => (
          <div key={feedback.id} className="my-4">
            <FeedbackItem
              id={feedback.id}
              archived={feedback.isArchived}
              text={feedback.text}
              type={feedback.type}
              user={feedback.user}
              timestamp={feedback.timestamp}
              onArchiveClick={onArchiveClick}
              onDeleteClick={onDeleteClick}
            />
          </div>
        ))}
      </section>
    </>
  );
}
