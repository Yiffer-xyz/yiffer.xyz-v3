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

const instructionId = 'tagging';

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

export default function TaggingInstructions() {
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
      <h1>How to tag comics</h1>

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
          Tagging comics correctly is important, but we also don't want to be <i>too</i>{' '}
          specific. One key thing to keep in mind here is that we are <i>not</i> e621. We
          don't need to include every possible attribute of every page of a comic. Tags
          should in a sense summarize the content of the comic, without expicitly
          describing every detail of it.
        </p>

        <div>
          <p>Examples of 👎unnecessary tags</p>
          <ul>
            <li>
              Body descriptions, such as <i>white hair</i>, <i>green eyes</i>
            </li>
            <li>
              Body parts appearing, such as <i>ass</i>, <i>feet</i>, <i>tail</i>
            </li>
            <li>OC or very niche character names</li>
            <li>
              Things describing gender interactions like <i>gay</i> - this is already
              covered by the comic's category
            </li>
          </ul>
        </div>

        <div>
          <p>Things that 👍should be tagged:</p>
          <ul>
            <li>
              Most comics should have either <i>anthro</i> or <i>feral</i> - if not both
            </li>
            <li>
              Species and sub-species, such as <i>canine</i>, <i>avian</i>, <i>scalie</i>{' '}
              and <i>dog</i>, <i>gryphon</i>, <i>snake</i>
            </li>
            <li>
              Well-known character names from movies, shows, or games. If the origin is
              frequently seen in furry, probably that too. Examples: <i>Rocket Raccoon</i>
              , <i>Umbreon</i> <i>Twilight Sparkle</i>, <i>My Little Pony</i>,{' '}
              <i>Warcraft</i>
            </li>
            <li>
              Some other tags that are commonly needed: <i>story</i> (if there's a longer
              story to the comic, not just porn), <i>group</i>, <i>outside</i>,{' '}
              <i>anal/vaginal/blowjob</i>. You should check out{' '}
              <Link href="/admin/tags" text="admin>tags" /> for an ordered list of all
              tags to see the more common ones.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
