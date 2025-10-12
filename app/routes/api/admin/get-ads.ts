import type { Route } from './+types/get-ads';
import { getAds } from '~/route-funcs/get-ads';
import type { AdStatus, AdType } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();

  const formStatusFilter = formDataBody.get('statusFilter');
  if (!formStatusFilter) return create400Json('Missing statusFilter');
  const statusFilter = formStatusFilter.toString().split(',') as AdStatus[];

  const formTypeFilter = formDataBody.get('adTypeFilter');
  if (!formTypeFilter) return create400Json('Missing adTypeFilter');
  const typeFilter = formTypeFilter.toString().split(',') as AdType[];

  const adsRes = await getAds({
    db: args.context.cloudflare.env.DB,
    statusFilter,
    typeFilter,
  });

  if (adsRes.err) {
    return processApiError('Error in /get-ads', adsRes.err);
  }

  return createSuccessJson(adsRes.result);
}
