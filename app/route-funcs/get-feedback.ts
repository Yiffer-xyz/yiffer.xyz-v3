import { makeDbErrObj, type ApiError } from '~/utils/request-helpers';
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

type Feedback = {
  id: number;
  text: string;
  type: FeedbackType;
  user: UserDataOrIP;
  isArchived: boolean;
  timestamp: string;
};

export async function getAllFeedback(
  urlBase: string
): Promise<{ feedback: Feedback[]; err?: undefined } | { err: ApiError }> {
  const query = `
    SELECT feedback.id, text, type, username, user.email AS userEmail, userId, userIP, isArchived, feedback.timestamp
      FROM feedback
      LEFT JOIN user ON (user.id = feedback.userId)
      ORDER BY feedback.timestamp DESC
  `;

  const dbRes = await queryDb<DbFeedback[]>(urlBase, query);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Could not get all feedback');
  }

  console.log(dbRes);

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
    timestamp: fbRow.timestamp,
  }));

  return { feedback };
}
