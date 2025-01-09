import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';
import type { FeedbackType } from '~/types/types';
import { queryDb } from '~/utils/database-facade';

type DbFeedback = {
  id: number;
  text: string;
  type: FeedbackType;
  username?: string;
  userEmail?: string;
  userId?: number;
  userIP?: string;
  isArchived: number;
  timestamp: string;
};

type UserDataOrIP = {
  username?: string;
  userId?: number;
  userEmail?: string;
  ip?: string;
};

export type Feedback = {
  id: number;
  text: string;
  type: FeedbackType;
  user: UserDataOrIP;
  isArchived: boolean;
  timestamp: Date;
};

export async function getFeedback({
  db,
  userId,
}: {
  db: D1Database;
  userId?: number;
}): ResultOrErrorPromise<Feedback[]> {
  const query = `
    SELECT feedback.id, text, type, username, user.email AS userEmail, userId, userIP, isArchived, feedback.timestamp
      FROM feedback
      LEFT JOIN user ON (user.id = feedback.userId)
      ${userId ? 'WHERE user.id = ?' : ''}
      ORDER BY feedback.timestamp DESC
  `;
  const params = userId ? [userId] : [];

  const dbRes = await queryDb<DbFeedback[]>(
    db,
    query,
    params,
    userId ? 'Feedback for user' : 'Feedback, all'
  );
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Could not get all feedback');
  }

  const feedback: Feedback[] = dbRes.result.map(fbRow => ({
    id: fbRow.id,
    text: fbRow.text,
    type: fbRow.type,
    user: {
      username: fbRow.username,
      userId: fbRow.userId,
      userEmail: fbRow.userEmail,
      ip: fbRow.userIP,
    },
    isArchived: fbRow.isArchived === 1,
    timestamp: new Date(fbRow.timestamp),
  }));

  return { result: feedback };
}
