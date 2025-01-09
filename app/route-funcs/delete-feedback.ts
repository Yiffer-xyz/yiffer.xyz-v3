import type { ApiError } from '~/utils/request-helpers';
import { makeDbErr } from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';

export async function deleteFeedback(
  db: D1Database,
  feedbackId: number
): Promise<ApiError | undefined> {
  const logCtx = { feedbackId };

  const query = `
    DELETE FROM feedback
    WHERE id = ?
  `;

  const queryParams = [feedbackId];
  const dbRes = await queryDbExec(db, query, queryParams);

  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error deleting feedback', logCtx);
  }
}
