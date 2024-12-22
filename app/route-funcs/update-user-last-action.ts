import { queryDbExec } from '~/utils/database-facade';

// It's async, but generally, don't await this. Call it at the start of
// whatever other route/action the user is doing so it'll fire before that
// route's action is done, though.
export default async function updateUserLastActionTime({
  db,
  userId,
  username,
}: {
  db: D1Database;
  userId?: number;
  username?: string;
}) {
  const column = userId ? 'id' : 'username';
  const query = `UPDATE user SET lastActionTimestamp = CURRENT_TIMESTAMP WHERE ${column} = ?`;
  await queryDbExec(db, query, [userId ?? username], 'User last action update');
}
