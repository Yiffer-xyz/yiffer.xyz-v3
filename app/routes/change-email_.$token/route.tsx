import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import InfoBox from '~/ui-components/InfoBox';
import { queryDb } from '~/utils/database-facade';
import { logApiError, makeDbErr } from '~/utils/request-helpers';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Change email | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const query =
    'SELECT code, timestamp, isUsed, userId, newEmail FROM emailchangecode WHERE code = ? ORDER BY timestamp DESC LIMIT 1';
  const dbRes = await queryDb<
    {
      code: string;
      timestamp: string;
      isUsed: number;
      userId: number;
      newEmail: string;
    }[]
  >(args.context.cloudflare.env.DB, query, [args.params.token]);

  if (dbRes.isError) {
    logApiError(
      'Error in /change-email',
      makeDbErr(dbRes, 'Error getting email change code')
    );
    return { error: 'Error checking email change code' };
  }

  if (dbRes.result.length === 0) {
    return { error: 'Invalid or expired link' };
  }

  const { code, timestamp, isUsed, userId, newEmail } = dbRes.result[0];

  if (isUsed) {
    return { error: 'Link already used' };
  } else if (Date.now() - new Date(timestamp).getTime() > 1000 * 60 * 60 * 24) {
    return { error: 'Link expired' };
  }

  const userQuery = 'SELECT * FROM user WHERE id = ?';
  const userRes = await queryDb<any[]>(args.context.cloudflare.env.DB, userQuery, [
    userId,
  ]);

  if (userRes.isError) {
    logApiError('Error in /change-email', makeDbErr(userRes, 'Error getting user'));
    return { error: 'Error changing email' };
  }
  if (userRes.result.length === 0) {
    return { error: 'User not found' };
  }

  const setCodeUsedQuery = 'UPDATE emailchangecode SET isUsed = 1 WHERE code = ?';
  const setCodeUsedRes = await queryDb<{
    success: boolean;
  }>(args.context.cloudflare.env.DB, setCodeUsedQuery, [code]);

  if (setCodeUsedRes.isError) {
    logApiError(
      'Error in /change-email',
      makeDbErr(setCodeUsedRes, 'Error setting code used')
    );
    return { error: 'Error changing email' };
  }

  const updateUserQuery = 'UPDATE user SET email = ? WHERE id = ?';
  const updateRes = await queryDb<{
    success: boolean;
  }>(args.context.cloudflare.env.DB, updateUserQuery, [newEmail, userId]);

  if (updateRes.isError) {
    logApiError('Error in /change-email', makeDbErr(updateRes, 'Error updating user'));
    return { error: 'Error changing email' };
  }

  return { error: null };
}

export default function ChangeEmail() {
  const { error } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-8">
      <h1 className="mb-4">Email change</h1>
      {error ? (
        <InfoBox variant="error" title="Error" text={error} fitWidth />
      ) : (
        <InfoBox
          variant="success"
          title="Success"
          text="Your account's email has been updated."
          fitWidth
        />
      )}
    </div>
  );
}
