import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
  type ApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const formDataBody = await args.request.formData();
  const formAdId = formDataBody.get('adId');
  if (!formAdId) return create400Json('Missing adId');
  const adId = formAdId.toString();

  const formAmount = formDataBody.get('amount');
  if (!formAmount) return create400Json('Missing amount');
  const amount = parseInt(formAmount.toString());
  if (isNaN(amount)) return create400Json('Invalid amount');

  const err = await registerAdPayment(args.context.cloudflare.env.DB, adId, amount);
  if (err) {
    return processApiError('Error in /register-ad-payment (ad)', err, { adId, amount });
  }
  return createSuccessJson();
}

export async function registerAdPayment(
  db: D1Database,
  adId: string,
  amount: number
): Promise<ApiError | undefined> {
  const query = `INSERT INTO advertisementpayment (adId, amount) VALUES (?, ?)`;

  const params = [adId, amount];

  const dbRes = await queryDbExec(db, query, params, 'Ad payment registration');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error registering ad payment');
  }
}
