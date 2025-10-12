import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { redirect } from 'react-router';
import { Outlet, useLoaderData, useMatches } from 'react-router';
import type { ArtistTiny, ComicTiny, Tag, User } from '~/types/types';
import { fullUserLoader } from '~/utils/loaders';
import useWindowSize from '~/utils/useWindowSize';
import { getAllArtistsQuery, mapArtistTiny } from '~/route-funcs/get-artists';
import type { DbComicTiny } from '~/route-funcs/get-comics';
import { getAllComicNamesAndIDsQuery, mapDBComicTiny } from '~/route-funcs/get-comics';
import { getAllTagsQuery } from '~/route-funcs/get-tags';
import { makeDbErr, processApiError } from '~/utils/request-helpers';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import AdminSidebar, {
  mobileClosedBarW as mobileClosedSidebarW,
  sidebarWidth,
} from './AdminSidebar';
import { useEffect, useState } from 'react';
import { ADMIN_INSTRUCTIONS } from '~/types/constants';
import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';
import '~/utils/cropper.min.css';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export type GlobalAdminContext = {
  comics: ComicTiny[];
  artists: ArtistTiny[];
  tags: Tag[];
  user: User;
  numUnreadContent: number;
  hasUnreadSystemChats: boolean;
};

export const meta: MetaFunction = () => {
  return [{ title: `Mod | Yiffer.xyz` }];
};

export default function Admin() {
  const { isLgUp, width } = useWindowSize();
  const globalContext = useLoaderData<typeof loader>();
  const matches = useMatches();

  // Little hack to avoid hydration errors & UI flickering while still
  // having the sidebar behave nicely on both mobile and desktop
  const [delay, setDelay] = useState(true);
  useEffect(() => {
    setTimeout(() => setDelay(false), 10);
  }, []);

  const hideInfoBox = matches.some(match => match.pathname.includes('instructions'));

  const pbClass = matches.some(
    match =>
      match.pathname.includes('admin/chats/') ||
      match.pathname.includes('admin/system-chats')
  )
    ? 'pb-0'
    : 'pb-20';

  return (
    <div className={`pt-16 ${pbClass}`}>
      {!delay && (
        <>
          <AdminSidebar
            alwaysShow={isLgUp}
            delay={!width}
            userType={globalContext.user.userType}
            hasUnreadSystemChats={globalContext.hasUnreadSystemChats}
          />

          <div
            className="pb-4 px-6 lg:px-8"
            style={{ marginLeft: isLgUp ? sidebarWidth : mobileClosedSidebarW }}
          >
            {globalContext.numUnreadContent > 0 && !hideInfoBox && (
              <InfoBox
                variant="warning"
                title="Unread messages"
                text={`You have unread instructions or messages. You cannot make changes to the site until you've read them.`}
                fitWidth
                className="mb-2"
                showIcon
              >
                <Link
                  href="/admin/instructions"
                  text="Go to instructions"
                  showRightArrow
                  color="white"
                />
              </InfoBox>
            )}

            <Outlet context={globalContext} />
          </div>
        </>
      )}
    </div>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const user = await fullUserLoader(args);
  if (user?.userType !== 'moderator' && user?.userType !== 'admin') {
    throw redirect('/');
  }

  const url = new URL(args.request.url);
  if (url.pathname === '/admin' || url.pathname === '/admin/') {
    return redirect('/admin/dashboard');
  }

  const numUnreadMessagesQuery = `SELECT COUNT(*) AS count FROM modmessage WHERE id NOT IN (SELECT messageId FROM modmessagereadreceipt WHERE userId = ?)`;
  const numReadInstructionsQuery = `SELECT COUNT(*) AS count FROM modinstructionsreadreceipt WHERE userId = ?`;
  // Get whether there is any chat that is isSystemChat, isRead=0, and where last message's sender id is not null
  // will need to join
  const unreadSystemChatsQuery = `
    SELECT EXISTS (
      SELECT 1 
      FROM chat c
      INNER JOIN chatmessage cm ON c.token = cm.chatToken
      WHERE c.isSystemChat = 1 
        AND c.isRead = 0
        AND cm.senderId IS NOT NULL
        AND cm.id = (
          SELECT MAX(cm2.id) 
          FROM chatmessage cm2 
          WHERE cm2.chatToken = c.token
        )
    ) AS hasUnreadSystemChat
  `;

  const dbStatements: QueryWithParams[] = [
    getAllArtistsQuery({
      includePending: true,
      includeBanned: true,
      modifyNameIncludeType: true,
    }),
    getAllComicNamesAndIDsQuery({
      modifyNameIncludeType: true,
      includeUnlisted: true,
    }),
    getAllTagsQuery(),
    {
      query: numUnreadMessagesQuery,
      params: [user.id],
      queryName: 'Unread mod msg count',
    },
    {
      query: numReadInstructionsQuery,
      params: [user.id],
      queryName: 'Unread mod intrx count',
    },
  ];
  if (user.userType === 'admin') {
    dbStatements.push({
      query: unreadSystemChatsQuery,
      queryName: 'Unread system chat count',
    });
  }

  const dbRes = await queryDbMultiple<
    [
      ArtistTiny[],
      DbComicTiny[],
      Tag[],
      { count: number }[],
      { count: number }[],
      { hasUnreadSystemChat: 0 | 1 }[] | undefined,
    ]
  >(args.context.cloudflare.env.DB, dbStatements);

  if (dbRes.isError) {
    return processApiError(
      'Error in admin top level getter',
      makeDbErr(dbRes, 'Error getting artist+dbComic+tags')
    );
  }

  const [allDbArtists, allDbComics, tags, unreadMessages, unreadInstructions] =
    dbRes.result;
  const artists = mapArtistTiny(allDbArtists, true);
  const comics = mapDBComicTiny(allDbComics, true);

  const numUnreadContent =
    unreadMessages[0].count + (ADMIN_INSTRUCTIONS.length - unreadInstructions[0].count);

  let hasUnreadSystemChats = false;
  if (user.userType === 'admin' && dbRes.result[5]) {
    hasUnreadSystemChats = dbRes.result[5][0].hasUnreadSystemChat === 1;
  }

  const globalContext: GlobalAdminContext = {
    comics,
    artists,
    tags,
    user,
    numUnreadContent,
    hasUnreadSystemChats,
  };

  return globalContext;
}
