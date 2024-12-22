import { queryDb } from '~/utils/database-facade';

export default async function isAdOwner(
  db: D1Database,
  userId: number,
  adId: string
): Promise<boolean> {
  const fetchUserQuery = `SELECT userId FROM advertisement WHERE id = ?`;
  const userRes = await queryDb<{ userId: number }[]>(
    db,
    fetchUserQuery,
    [adId],
    'Ad owner check'
  );

  if (userRes.isError) return false;
  if (userRes.result.length === 0) return false;
  if (userRes.result[0].userId !== userId) return false;

  return true;
}
