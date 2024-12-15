import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import {
  createSuccessJson,
  logErrorExternally,
  noGetRoute,
  type ExternalLogError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const formDataBody = await args.request.formData();
  const url = formDataBody.get('url');
  const logMessage = formDataBody.get('logMessage');

  const errObj: ExternalLogError = {
    error: {
      isServerError: false,
      isClientError: true,
      logMessage: logMessage?.toString() ?? 'No log message',
      context: { url: url?.toString() ?? 'No url' },
    },
  };

  await logErrorExternally(errObj);

  return createSuccessJson();
}
