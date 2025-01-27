import { getModActionPoints } from '~/types/constants';
import type { ModActionType } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { makeDbErr, type ApiError } from '~/utils/request-helpers';

type Args = {
  db: D1Database;
  userId: number;
  comicId?: number;
  artistId?: number;
  dashboardActionId?: number;
  text?: string;
  actionType: ModActionType;
};

export async function addModLogAndPoints({
  db,
  userId,
  comicId,
  artistId,
  dashboardActionId,
  text,
  actionType,
}: Args): Promise<ApiError | undefined> {
  const points = getModActionPoints(actionType);

  let query = `INSERT INTO modaction (userId`;
  const params: any[] = [userId];
  let valuesQuestionmarks = '?';

  if (comicId) {
    query += `, comicId`;
    params.push(comicId);
    valuesQuestionmarks += ', ?';
  }
  if (artistId) {
    query += `, artistId`;
    params.push(artistId);
    valuesQuestionmarks += ', ?';
  }
  if (text) {
    query += `, text`;
    params.push(text);
    valuesQuestionmarks += ', ?';
  }
  if (dashboardActionId) {
    query += `, dashboardActionId`;
    params.push(dashboardActionId);
    valuesQuestionmarks += ', ?';
  }

  query += `, actionType, points) VALUES (${valuesQuestionmarks}, ?, ?)`;
  params.push(actionType, points);

  const dbRes = await queryDbExec(db, query, params, 'Add mod log');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error adding mod log', {
      userId,
      comicId,
      artistId,
      text,
      actionType,
      dashboardActionId,
    });
  }

  return;
}
