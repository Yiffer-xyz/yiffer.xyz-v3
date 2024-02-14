import {D1Database} from '@cloudflare/workers-types'
import {ApiError, makeDbErr} from '~/utils/request-helpers'
import {queryDbExec} from '~/utils/database-facade'

export async function updateUser(
  db: D1Database,
  userId: number | null,
  updates: {
    userType?: string;
    isBanned?: number;
    banReason?: string;
    modNotes?: string;
  }
): Promise<ApiError | undefined> {

  // Create new object and remove all undefined values from the updates object
  updates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))

  const updateQuery = `
    UPDATE user
    SET ${Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ')}
    WHERE id = ?
  `;
  const updateQueryParams = [...Object.values(updates), userId];
  const updateDbRes = await queryDbExec(db, updateQuery, updateQueryParams);

  if (updateDbRes.isError) {
    return makeDbErr(updateDbRes, 'Error updating user', { userId });
  }
}
