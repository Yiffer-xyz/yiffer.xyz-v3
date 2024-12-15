import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return new Response('Missing comicId', { status: 400 });

  const formErrorText = formDataBody.get('errorText');
  let errorText = formErrorText ? formErrorText.toString() : null;
  if (errorText === '') errorText = null;

  const comicId = parseInt(formComicId.toString());
  const err = await setComicError(args.context.cloudflare.env.DB, comicId, errorText);
  if (err) {
    return processApiError('Error in /set-comic-error', err, { comicId, errorText });
  }
  return createSuccessJson();
}

export async function setComicError(
  db: D1Database,
  comicId: number,
  errorText: string | null
): Promise<ApiError | undefined> {
  const updateActionQuery = `UPDATE comicmetadata SET errorText = ? WHERE comicId = ?`;
  const updateActionQueryParams = [errorText, comicId];

  const dbStatements: QueryWithParams[] = [
    {
      query: updateActionQuery,
      params: updateActionQueryParams,
    },
  ];

  if (!errorText) {
    const removeModQuery =
      'UPDATE comicmetadata SET pendingProblemModId = NULL WHERE comicId = ?';
    const removeModQueryParams = [comicId];

    dbStatements.push({
      query: removeModQuery,
      params: removeModQueryParams,
    });
  }

  const dbRes = await queryDbMultiple(db, dbStatements);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating action+remove mod in setComicError');
  }
}
