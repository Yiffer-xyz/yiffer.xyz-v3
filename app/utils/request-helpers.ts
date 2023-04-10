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
  client400Message?: string;
};

// If clientMessage, return nicely to client.
// Otherwise, log and fail hard.
export async function processApiError(
  prependMessage: string,
  err: ApiError
): Promise<never> {
  console.log(prependMessage);
  console.log(err);
  if (err.client400Message) {
    throw create400Json(err.client400Message);
  } else {
    logApiError(prependMessage, err);
    throw new Error(handledErrMsg);
  }
}

function logApiError(prependMessage: string, err: ApiError) {
  Sentry.captureMessage(prependMessage + ' >> ' + err.logMessage, {
    extra: {
      sql: err.error?.sql,
      sqlErrorCode: err.error?.errorCode,
      sqlErrorMessage: err.error?.errorMessage,
      ...(err.context || {}),
    },
    level: 'error',
  });
}

export function dbErrObj(
  err: DBResponse<any>,
  message: string,
  context?: { [key: string]: any },
  client400Message?: string
): { err: ApiError } {
  return {
    err: {
      error: err,
      logMessage: message,
      client400Message,
      context: context || {},
    },
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
      error: message || 'Unknown error',
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
