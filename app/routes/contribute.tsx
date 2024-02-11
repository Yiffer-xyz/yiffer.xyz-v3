import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { MdHome } from 'react-icons/md';
import YifferLink from '~/ui-components/Link';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
import { authLoader } from '~/utils/loaders';

export async function loader(args: LoaderFunctionArgs) {
  return await authLoader(args);
}

export default function Index() {
  const user = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-center">Contribute</h1>
      <YifferLink
        href="/"
        text="To main page"
        Icon={MdHome}
        className="mx-auto block w-fit"
      />

      <div className="max-w-4xl mx-auto mt p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-8 sm:p-8">
        <LinkCard
          title="Upload a comic yourself"
          description="Upload a full comic yourself, including both files and comic info."
          href="upload"
          className="h-full"
          includeRightArrow
        />
        <LinkCard
          title="Suggest a comic"
          description="Suggest a comic for the mod team to upload, providing what information you can."
          href="suggest-comic"
          className="h-full"
          includeRightArrow
        />
        <LinkCard
          title="Contributions scoreboard"
          description="See the monthly and all-time top contributors."
          href="scoreboard"
          className="h-full"
          includeRightArrow
        />
        <LinkCard
          title="Your contributions"
          description="Status and history of your contributions."
          href="your-contributions"
          className="h-full"
          includeRightArrow
          disabled={!user}
        />
        <LinkCard
          title="Become a mod"
          description="Be a part of the incredible team that keeps this site running!"
          href="join-us"
          className="h-full"
          includeRightArrow
        />
        <LinkCard
          title="Feedback &amp; Support"
          description="Have any tips for how Yiffer.xyz could be better? Need help?"
          href="feedback"
          className="h-full"
          includeRightArrow
        />
      </div>
    </div>
  );
}
