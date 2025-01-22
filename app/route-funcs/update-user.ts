import type { D1Database } from '@cloudflare/workers-types';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErr } from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';
import type { UserType } from '~/types/types';

export async function updateUser(
  db: D1Database,
  userId: number | null,
  updates: {
    userType?: UserType;
    isBanned?: number;
    banReason?: string;
    modNotes?: string;
    patreonEmail?: string;
  }
): Promise<ApiError | undefined> {
  updates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );

  let setStatement = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');

  if (updates.isBanned === 1) {
    setStatement += ', banTimestamp = CURRENT_TIMESTAMP';
  }

  const updateQuery = `UPDATE user SET ${setStatement} WHERE id = ?`;

  const updateQueryParams = [...Object.values(updates), userId];
  const updateDbRes = await queryDbExec(db, updateQuery, updateQueryParams);

  if (updateDbRes.isError) {
    return makeDbErr(updateDbRes, 'Error updating user', { userId });
  }
}
