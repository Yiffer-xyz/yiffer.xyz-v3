import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Link from '~/ui-components/Link';
import { MdArrowBack } from 'react-icons/md';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { getUnreadInstructions } from '~/route-funcs/get-read-instructions';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Instructions | Yiffer.xyz` }];
};

const instructionId = 'modpanel';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const readContents = await getUnreadInstructions(
    args.context.cloudflare.env.DB,
    user.userId
  );

  if (readContents.err) {
    return processApiError('Error getting unread instructions', readContents.err);
  }

  return { isRead: !readContents.result.unreadInstructions.includes(instructionId) };
}

export default function ModPanelInstructions() {
  const { isRead } = useLoaderData<typeof loader>();

  const markReadFetcher = useGoodFetcher({
    url: '/api/admin/mark-mod-instruction-read',
    method: 'post',
  });

  function markRead() {
    const formData = new FormData();
    formData.append('instructionId', instructionId);
    markReadFetcher.submit(formData);
  }

  return (
    <div className="max-w-6xl">
      <h1>About the mod panel</h1>

      <div className="mt-1">
        <Link href="/admin/instructions" text="Back to instructions" Icon={MdArrowBack} />
      </div>

      {!isRead && (
        <div className="flex flex-col gap-y-2 mt-2">
          <LoadingButton
            text="Mark instruction as read"
            isLoading={markReadFetcher.isLoading}
            onClick={markRead}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-6 md:gap-4">
        <p>
          The new mod panel in this version of the site has consumed over half of the
          development time of the site. I hope it proves usable! I'm always open for
          suggestions on how to improve it, don't hesitate to suggest changes.
        </p>

        <p>
          If buttons are disabled, it's probably because you have unread
          instructions/messages, which will be shown in an orange warning box at the top
          of the whole mod panel.
        </p>

        <p>
          Below is a brief guide on what you should be doing here. Sections not described
          here should be self-explanatory or have instructions in the section itself.
        </p>

        <div>
          <h4>Action dashboard</h4>
          <p>
            This will probably be the main thing you use. Any user submitted stuff goes
            here. For things with an "I'm on it" button, you should <b>assign yourself</b>{' '}
            before you start working on the issue, to avoid others working on the same
            thing in parallel.
          </p>
          <p>
            When processing a user upload or suggestion with a comment, be{' '}
            <b>concise and professional</b>. For example, if there's a comic suggestion
            and you choose "Reject with comment", something as simple as "Too low
            quality", or "Foreign language" is enough.
          </p>
        </div>

        <div>
          <h4>User dashboard</h4>
          <p>
            You probably won't need to use this. Do not ban a user before consulting with
            an admin first.
          </p>
        </div>

        <div>
          <h4>Pending comics</h4>
          <p>
            The only thing that should be of consequence to you as a regular mod here will
            be the <b>"Problematic only"</b> filter view. These comics cannot be published
            yet and will each have a description of the problem blocking it from being
            published. Please help fix them!
          </p>
        </div>

        <div>
          <h4>Mod and Admin roles</h4>
          <p>
            Most of you are mods. This means you have access to most functionality, but
            not everything. Admins, of which there are only a few, have the following
            extra capabilities and responsibilities:
          </p>
          <ul>
            <li>Adding pending comics to the publishing queue, as a final 👍</li>
            <li>Removing comics and artists</li>
            <li>
              Managing ads and mod applications - though this should normally only be done
              by the owner, Melon
            </li>
          </ul>
          <p className="mt-2">
            To become an admin, you'll need to have proven yourself as a reliable mod. You
            must be capable of reliably catching mistakes in uploads, such as bad
            thumbnails, page errors, tags, and comic title spelling. This is important, as
            admins are the final quality control checkpoint before content is published.
            If you think you've got what it takes, you can contact Melon on Telegram.
          </p>
        </div>
      </div>
    </div>
  );
}
