import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import { authLoader } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { isMaliciousString } from '~/utils/string-utils';

export { noGetRoute as loader };

export type ComicProblemSubmission = {
  comicId: number;
  problemTitle: string;
  problemDescription: string;
};

export async function action(args: ActionFunctionArgs) {
  const user = await authLoader(args);

  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ComicProblemSubmission;

  if (!body.comicId) return create400Json('Missing comicId');

  if (!body.problemTitle || !body.problemDescription) {
    return create400Json('Missing problemTitle or problemDescription');
  }

  if (isMaliciousString(body.problemTitle, body.problemDescription)) {
    return create400Json('Malicious input detected');
  }

  const err = await submitComicProblem(
    args.context.cloudflare.env.DB,
    body.comicId,
    body.problemTitle,
    body.problemDescription,
    user?.userId ?? null,
    args.request.headers.get('CF-Connecting-IP') || 'unknown'
  );

  if (err) {
    return processApiError('Error in /submit-comic-problem', err);
  }
  return createSuccessJson();
}

export async function submitComicProblem(
  db: D1Database,
  comicId: number,
  problemTitle: string,
  problemDescription: string,
  userId: number | null,
  userIP: string
): Promise<ApiError | undefined> {
  const logCtx = { userId, userIP, comicId, problemTitle, problemDescription };

  const insertQuery = `INSERT INTO comicproblem (comicId, description, problemCategory, userId, userIP) VALUES (?, ?, ?, ?, ?)`;
  const insertParams = [comicId, problemDescription, problemTitle, userId, userIP];
  const dbRes = await queryDbExec(
    db,
    insertQuery,
    insertParams,
    'Comic problem submission'
  );
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error inserting comic problem', logCtx);
  }

  return;
}
