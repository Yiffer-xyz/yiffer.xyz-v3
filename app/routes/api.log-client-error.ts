import { unstable_defineAction } from '@remix-run/cloudflare';
import {
  createSuccessJson,
  logErrorExternally,
  noGetRoute,
  type ExternalLogError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export const action = unstable_defineAction(async args => {
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
});
