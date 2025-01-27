import { ADMIN_INSTRUCTIONS } from '~/types/constants';
import { queryDbMultiple } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

const numDetailedInstructions = ADMIN_INSTRUCTIONS.length;

export async function getNumberOfUnreadInstructions(
  db: D1Database,
  userId: number
): ResultOrErrorPromise<number> {
  const numUnreadMessagesQuery = `SELECT COUNT(*) AS count FROM modmessage WHERE id NOT IN (SELECT messageId FROM modmessagereadreceipt WHERE userId = ?)`;
  const numReadInstructionsQuery = `SELECT COUNT(*) AS count FROM modinstructionsreadreceipt WHERE userId = ?`;

  const responses = await queryDbMultiple<[{ count: number }[], { count: number }[]]>(
    db,
    [
      { query: numUnreadMessagesQuery, params: [userId] },
      { query: numReadInstructionsQuery, params: [userId] },
    ]
  );

  if (responses.isError) {
    return makeDbErrObj(responses, 'Error getting number of unread mod messages', {
      userId,
    });
  }

  const numUnreadMessages = responses.result[0][0].count;
  const numReadInstructions = responses.result[1][0].count;

  return {
    result: numUnreadMessages + (numDetailedInstructions - numReadInstructions),
  };
}

export async function getUnreadInstructions(
  db: D1Database,
  userId: number
): ResultOrErrorPromise<{ unreadMessages: number[]; unreadInstructions: string[] }> {
  const unreadMessagesQuery = `SELECT id FROM modmessage WHERE id NOT IN (SELECT messageId FROM modmessagereadreceipt WHERE userId = ?)`;
  const readInstructionsQuery = `SELECT instructionId FROM modinstructionsreadreceipt WHERE userId = ?`;

  const responses = await queryDbMultiple<
    [{ id: number }[], { instructionId: string }[]]
  >(db, [
    { query: unreadMessagesQuery, params: [userId] },
    { query: readInstructionsQuery, params: [userId] },
  ]);

  if (responses.isError) {
    return makeDbErrObj(responses, 'Error getting number of unread mod messages', {
      userId,
    });
  }

  const unreadMessages = responses.result[0];
  const readInstructions = responses.result[1].map(
    instruction => instruction.instructionId
  );

  const unreadInstructions = ADMIN_INSTRUCTIONS.filter(
    instruction => !readInstructions.includes(instruction.id)
  ).map(instruction => instruction.id);

  return {
    result: {
      unreadMessages: unreadMessages.map(message => message.id),
      unreadInstructions,
    },
  };
}
