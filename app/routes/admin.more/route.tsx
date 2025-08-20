import type { MetaFunction } from '@remix-run/cloudflare';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
import type { GlobalAdminContext } from '../admin/route';
import { useOutletContext } from '@remix-run/react';
import { isAdmin as isAdminFunc } from '~/types/types';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: More | Yiffer.xyz` }];
};

export default function More() {
  const globalContext: GlobalAdminContext = useOutletContext();

  const isAdmin = isAdminFunc(globalContext.user);

  return (
    <div className="flex flex-col gap-2">
      <h1>More</h1>

      <LinkCard
        href="/admin/more/comment-list"
        title="Comment list"
        className="w-fit"
        includeRightArrow
      />

      <LinkCard
        href="/admin/more/chat-list"
        title="User chat list"
        className="w-fit"
        includeRightArrow
        disabled={!isAdmin}
        description={!isAdmin ? 'Admin only' : undefined}
      />
    </div>
  );
}
