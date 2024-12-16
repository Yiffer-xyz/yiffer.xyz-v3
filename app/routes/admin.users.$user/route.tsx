import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getUserById } from '~/route-funcs/get-user';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const username = data?.user?.username;
  return [{ title: `Mod: ${username} (user) - Yiffer.xyz` }];
};

export default function ManageSingleUser() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="mb-2">{user.username}</h2>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotMod(args);
  const userIdParam = args.params.user as string;
  const userId = parseInt(userIdParam);

  const userRes = await getUserById(args.context.cloudflare.env.DB, userId);

  if (userRes.err) {
    return processApiError('Error getting user for admin>users', userRes.err);
  }

  return { user: userRes.result };
}
