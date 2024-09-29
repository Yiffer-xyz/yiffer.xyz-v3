import { unstable_defineLoader } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getUserById } from '~/route-funcs/get-user';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function ManageSingleUser() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="mb-2">{user.username}</h2>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export const loader = unstable_defineLoader(async args => {
  await redirectIfNotMod(args);
  const userIdParam = args.params.user as string;
  const userId = parseInt(userIdParam);

  const userRes = await getUserById(args.context.cloudflare.env.DB, userId);

  if (userRes.err) {
    return processApiError('Error getting user for admin>users', userRes.err);
  }

  return { user: userRes.result };
});
