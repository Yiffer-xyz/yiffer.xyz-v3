import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
import { authLoader } from '~/utils/loaders';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Contribute | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  return await authLoader(args);
}

export default function Index() {
  const user = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-8">
      <h1>Contribute</h1>

      <Breadcrumbs prevRoutes={[]} currentRoute="Contribute" />

      <div className="mt grid gap-4 grid-cols-1 sm:grid-cols-2 mt-2 sm:mt-4 w-fit">
        <LinkCard
          title="Upload a comic yourself"
          description="Upload a full comic yourself, including both files and comic info."
          href="upload"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
        <LinkCard
          title="Suggest a comic"
          description="Suggest a comic for the mod team to upload, providing what information you can."
          href="suggest-comic"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
        <LinkCard
          title="Contributions scoreboard"
          description="See the monthly and all-time top contributors."
          href="scoreboard"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
        <LinkCard
          title="Your contributions"
          description="Status and history of your contributions."
          href="your-contributions"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
          disabled={!user}
        />
        <LinkCard
          title="Become a mod"
          description="Be a part of the incredible team that keeps this site running!"
          href="join-us"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
        <LinkCard
          title="Feedback &amp; Support"
          description="Have any tips for how Yiffer.xyz could be better? Need help?"
          href="feedback"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
      </div>
    </div>
  );
}
