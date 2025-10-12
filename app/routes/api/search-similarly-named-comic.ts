import type { Route } from './+types/search-similarly-named-comic';
import { noGetRoute } from '~/utils/request-helpers';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';
import { getSimilarlyNamedComics } from '~/route-funcs/get-similarly-named-comic';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const body = await args.request.formData();
  const comicName = body.get('comicName') as string;
  const excludeName = body.get('excludeName');

  const comicsRes = await getSimilarlyNamedComics(
    args.context.cloudflare.env.DB,
    comicName,
    excludeName ? excludeName.toString() : undefined
  );
  if (comicsRes.err) {
    return processApiError('Error in /search-similarly-named-comics', comicsRes.err, {
      comicName,
      excludeName,
    });
  }
  return createSuccessJson(comicsRes.result);
}
