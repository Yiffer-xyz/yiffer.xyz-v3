import type { MetaFunction } from '@remix-run/cloudflare';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: More | Yiffer.xyz` }];
};

export default function More() {
  return (
    <>
      <h1 className="mb-2">More</h1>

      <LinkCard
        href="/admin/more/comment-list"
        title="Comment list"
        className="w-fit"
        includeRightArrow
      />
    </>
  );
}
