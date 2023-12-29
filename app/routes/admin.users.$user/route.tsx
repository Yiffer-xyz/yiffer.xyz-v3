import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getUserById } from '~/route-funcs/get-user';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';

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
  const urlBase = args.context.DB_API_URL_BASE;
  const userIdParam = args.params.user as string;
  const userId = parseInt(userIdParam);

  const userRes = await getUserById(urlBase, userId);

  if (userRes.err) {
    return processApiError('Error getting user for admin>users', userRes.err);
  }

  return { user: userRes.result };
}
