import type { Route } from './+types/log-client-error';
import {
  createSuccessJson,
  logErrorExternally,
  noGetRoute,
  type ExternalLogError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
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

  await logErrorExternally(errObj, args.context.cloudflare.env.DB);

  return createSuccessJson();
}
