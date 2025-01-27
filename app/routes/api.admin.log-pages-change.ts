import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';
import { parseFormJson } from '~/utils/formdata-parser';
import { capitalizeString } from '~/utils/general';
import {
  createSuccessJson,
  processApiError,
  type noGetRoute,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export type LogPagesChangeBody = {
  comicId: number;
  numNewPages: number;
  numDeletedPages: number;
};

export async function action(args: ActionFunctionArgs) {
  const { fields, isUnauthorized, user } = await parseFormJson<LogPagesChangeBody>(
    args,
    'mod'
  );
  if (isUnauthorized || !user) return new Response('Unauthorized', { status: 401 });

  const texts: string[] = [];
  if (fields.numNewPages > 0) texts.push(`added ${fields.numNewPages} pages`);
  if (fields.numDeletedPages > 0) texts.push(`deleted ${fields.numDeletedPages} pages`);
  if (texts.length === 0) texts.push('rearranged pages');

  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    comicId: fields.comicId,
    actionType: 'comic-pages-changed',
    text: capitalizeString(texts.join(', ')),
  });
  if (modLogErr) {
    return processApiError('Error in /log-pages-change', modLogErr);
  }

  return createSuccessJson();
}
