import type { MetaFunction } from 'react-router';
import LinkCard from '~/ui-components/LinkCard';
import type { GlobalAdminContext } from '../AdminPage';
import { useOutletContext } from 'react-router';
import { isAdmin as isAdminFunc } from '~/types/types';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: More | Yiffer.xyz` }];
};

export default function MorePage() {
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

      <LinkCard
        href="/admin/more/restricted-users"
        title="Restricted users"
        className="w-fit"
        includeRightArrow
      />

      <LinkCard
        href="/admin/more/ip-ban"
        title="Ban IPs & see ban list"
        className="w-fit"
        includeRightArrow
        disabled={!isAdmin}
        description={!isAdmin ? 'Admin only' : undefined}
      />
    </div>
  );
}
