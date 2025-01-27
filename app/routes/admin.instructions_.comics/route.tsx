import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Link from '~/ui-components/Link';
import { MdArrowBack } from 'react-icons/md';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { getUnreadInstructions } from '~/route-funcs/get-read-instructions';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import ThumbnailGuidelines from '~/page-components/ThumbnailGuidelines';

export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Instructions | Yiffer.xyz` }];
};

const instructionId = 'comics';

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

export default function ComicsInstructions() {
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
      <h1>Comic guidelines</h1>

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

      <p className="mt-4">
        If you're uncertain of whether a comic should be on the site, ask in our Telegram
        channel!
      </p>

      <h2 className="mt-6 md:mt-4">General guidelines</h2>
      <div className="flex flex-col gap-6 md:gap-4">
        <p>
          The most important rule will always be:{' '}
          <b>Do not add paywalled content to this site</b>! Nothing that's behind Patreon
          or any similar service. Everything here must be available via the artist's own
          channels. If you've found something on another 3rd party site, that's not good
          enough, it might be there illegally too.
        </p>
        <p>
          The above is not just true for entire comics, but also{' '}
          <b>new pages of WIP comics</b>. Only add/approve new pages if they're publicly
          available. It's important to verify this when users upload.
        </p>
        <p>
          When adding pages or processing suggestions, make sure that the pages are of the{' '}
          <b>highest publicly available quality</b>. Often, users will find pages on
          various suboptimal sites and upload them. Check the artist's Furaffinity, e621,
          or similar reputable sources.
        </p>
        <p>
          Even though we now have user comic suggestions, you're always free to add
          whatever content you'd like yourself, at any time. Check the suggestion and
          upload lists first though - if the comic you have in mind is already there, the
          suggestion should be processed and contribution points awarded.
        </p>
        <p>
          If there's a new comic in the making, wait until it has at least 4 pages before
          adding it.
        </p>
        <p>
          <b>Quality control</b>: We could host all comics on Yiffer.xyz, but we don't. We
          stick to a minimum level of quality in the artwork. Comics that are poorly drawn
          should not be accepted. Uncolored comics <i>can</i> be accepted, but the quality
          threshold is a little higher for these.
        </p>
        <p>Comics not in English should not be added under any circumstance.</p>
        <p>
          If there is a cover page that isn't really "part of the comic", you should still
          add it as page 1.
        </p>
      </div>

      <h2 className="mt-6 md:mt-4">Titles</h2>
      <p>
        Titles should be capitalized correctly. It's very simple: every word should start
        with a capital letter, except prepositions like "the", "of", "and", etc. If you're
        unsure, use <Link href="https://capitalizemytitle.com/" text="this tool" /> to do
        it for you. For example, notice the "o" and "t" in "Queen of the Pride Lands".
      </p>

      <h2 className="mt-6 md:mt-4">Thumbnails</h2>
      <ThumbnailGuidelines isModPanel />
    </div>
  );
}
