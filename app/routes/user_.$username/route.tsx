import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { getUserByField } from '~/route-funcs/get-user';
import PublicProfileEdit from '~/ui-components/PublicProfile/PublicProfileEdit';
import PublicProfile from '~/ui-components/PublicProfile/PublicProfile';
import { authLoader } from '~/utils/loaders';
import { getSourceFromRequest, processApiError } from '~/utils/request-helpers';
import { fullUserToPublicUser } from '~/utils/user-utils';
import PublicProfilePhotoEditor from '~/ui-components/PublicProfile/PublicProfilePhotoEditor';
import '~/utils/cropper.min.css';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import { isModOrAdmin } from '~/types/types';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = ({ params }) => {
  return [{ title: `${params.username} | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const userParam = args.params.username as string;
  const source = getSourceFromRequest(args.request);

  const currentUser = await authLoader(args);

  const userRes = await getUserByField({
    db: args.context.cloudflare.env.DB,
    field: 'username',
    value: userParam,
    includeExtraFields: true,
    includeCurrentUserFields: !!currentUser,
    currentUserId: currentUser?.userId,
  });

  if (userRes.err) {
    return processApiError('Error getting user in /user/username', userRes.err);
  }
  if (userRes.notFound) {
    return { notFound: true, user: null, userParam, isOwner: false };
  }

  return {
    user: fullUserToPublicUser(userRes.result),
    userParam,
    notFound: false,
    isOwner: currentUser?.userId === userRes.result.id,
    imagesServerUrl: args.context.cloudflare.env.IMAGES_SERVER_URL,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
    showMeCrumbs: source === 'me',
    isAdmin: isModOrAdmin({ userType: currentUser?.userType }),
  };
}

export default function UserProfilePage() {
  const {
    user,
    notFound,
    isOwner,
    imagesServerUrl,
    pagesPath,
    showMeCrumbs,
    userParam,
    isAdmin,
  } = useLoaderData<typeof loader>();

  const [mode, setMode] = useState<'edit' | 'change-photo' | 'view'>('view');

  return (
    <div className="container mx-auto pb-8">
      {notFound || !user ? (
        <>
          <h1>{userParam}</h1>
          <p>User not found.</p>
        </>
      ) : (
        <>
          {showMeCrumbs && (
            <Breadcrumbs
              prevRoutes={[{ href: '/me', text: 'Me' }]}
              currentRoute="Profile"
              className="mb-2!"
            />
          )}

          {mode === 'view' && (
            <PublicProfile
              user={user}
              pagesPath={pagesPath}
              canEdit={isOwner}
              onEdit={() => setMode('edit')}
              onChangePhoto={() => setMode('change-photo')}
              showModLinkType={isAdmin ? 'admin-panel' : undefined}
            />
          )}
          {mode === 'edit' && (
            <PublicProfileEdit user={user} onFinish={() => setMode('view')} />
          )}
          {mode === 'change-photo' && (
            <PublicProfilePhotoEditor
              imagesServerUrl={imagesServerUrl}
              onFinish={() => setMode('view')}
              hasExistingPhoto={!!user.profilePictureToken}
            />
          )}
        </>
      )}
    </div>
  );
}
