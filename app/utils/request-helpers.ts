import { json, TypedResponse } from '@remix-run/cloudflare';
import { DBResponse } from './database-facade';
import * as Sentry from '@sentry/browser';
import { handledErrMsg } from '~/routes/error';

export type ApiResponse<T = void> = {
  success: boolean;
  error: string | null;
  data?: T;
};

export type ApiError = {
  error?: DBResponse<any>;
  logMessage: string;
  context?: { [key: string]: any };
};

export async function processApiError(
  prependMessage: string | undefined,
  err: ApiError,
  context?: { [key: string]: any }
): Promise<never> {
  logApiError(prependMessage, {
    ...err,
    context: {
      ...(err.context || {}),
      ...(context || {}),
    },
  });

  throw new Error(handledErrMsg);
}

// Use this when not wanting to throw an error (when you want
// to show a nice error message to the user), but still need to log it.
export function logApiError(
  prependMessage: string | undefined,
  err: ApiError,
  context?: { [key: string]: any }
) {
  const fullErrMsg = prependMessage
    ? prependMessage + ' >> ' + err.logMessage
    : err.logMessage;

  console.log('ERROR, message: ', fullErrMsg);
  console.log(err);

  const extra: any = {
    ...(err.context || {}),
    ...(context || {}),
  };
  if (err.error) {
    extra.dbResponse = err.error;
  }

  Sentry.captureMessage(fullErrMsg, {
    extra,
    level: 'error',
  });
}

export function logApiErrorMessage(message: string, context?: { [key: string]: any }) {
  Sentry.captureMessage(message, {
    extra: {
      ...(context || {}),
    },
    level: 'error',
  });
}

export function makeDbErrObj(
  err: DBResponse<any>,
  message: string,
  context?: { [key: string]: any }
): { err: ApiError } {
  return {
    err: {
      error: err,
      logMessage: message,
      context: context || {},
    },
  };
}

export function makeDbErr(
  err: DBResponse<any>,
  message: string,
  context?: { [key: string]: any }
): ApiError {
  return {
    error: err,
    logMessage: message,
    context: context || {},
  };
}

export function logErrorBoundaryException(err: Error) {
  console.log('Error boundary captured and logging exception!');
  console.log(err);
  Sentry.captureException(err, {
    tags: {
      errorBoundary: 'true',
    },
  });
}

export function wrapApiError(
  err: ApiError,
  message: string,
  additionalContext?: { [key: string]: any }
): ApiError {
  const newErr = {
    ...err,
    logMessage: message + ' >> ' + err.logMessage,
  };
  if (additionalContext) {
    newErr.context = {
      ...(err.context || {}),
      ...additionalContext,
    };
  }

  return newErr;
}

// TODO: remove this.
export function logErrorOLD_DONOTUSE(
  prependMessage: string,
  err?: ApiError | DBResponse<any> | Error
) {}

// TODO: Phase this out - we're gonna use processApiError instead
export function create500Json(message?: string): TypedResponse<ApiResponse> {
  return json(
    {
      error:
        message ||
        'Server error. Site admins have been notified of and will look into it.',
      success: false,
    },
    { status: 500 }
  );
}

export function create400Json(message: string): TypedResponse<ApiResponse> {
  return json(
    {
      error: message,
      success: false,
    },
    { status: 400 }
  );
}

// This exists because it returns the correct response type,
// allowing us to infer a single type with useActionData<typeof action>()
// in the actual component.
export function createSuccessJson(data?: any): TypedResponse<ApiResponse> {
  return json(
    {
      success: true,
      error: null,
      data: data,
    },
    { status: 200 }
  );
}

export async function noGetRoute() {
  return new Response('Cannot GET this route', { status: 405 });
}
