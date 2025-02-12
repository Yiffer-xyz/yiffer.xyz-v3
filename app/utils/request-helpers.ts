import type { TypedResponse } from '@remix-run/cloudflare';
import type {
  DBResponse,
  ExecDBResponse,
  QueryWithParams,
} from '~/utils/database-facade';

export type ResultOrErrorPromise<T> = Promise<
  { result: T; err?: undefined } | { err: ApiError }
>;
export type ResultOrError<T> = { result: T; err?: undefined } | { err: ApiError };

export type ResultOrNotFoundOrErrorPromise<T> = Promise<
  | { err: ApiError }
  | { notFound: true; err?: undefined }
  | { result: T; notFound?: undefined; err?: undefined }
>;

export type ApiResponse<T = void> = {
  success: boolean;
  error: string | null;
  data?: T;
};

export type ApiError = {
  error?: DBResponse<any> | ExecDBResponse;
  logMessage: string;
  context?: { [key: string]: any };
  dbQueries?: QueryWithParams[];
};

// Logs and throws an error to be caught by error boundary. Use for server errors.
export async function processApiError(
  prependMessage: string | undefined,
  err: ApiError,
  context?: { [key: string]: any }
): Promise<never> {
  await logApiError(prependMessage, err, context);

  const logError = errToExternalLogError(prependMessage, err, context);
  delete logError.error.errorJSONStr;
  throw new Error(JSON.stringify(logError));
}

export type ExternalLogError = {
  error: {
    logMessage: string;
    context?: any;
    dbQueries?: any;
    errorJSONStr?: string;
    sqlErrorShort?: string;
    isServerError: boolean;
    isClientError: boolean;
  };
};

// Use this when not wanting to throw an error (when you want
// to show a nice error message to the user), but still need to log it.
export async function logApiError(
  prependMessage: string | undefined,
  err: ApiError,
  context?: { [key: string]: any }
) {
  console.log('🆎 ERROR from logApiError');
  console.error(prependMessage, err, context);
  console.log(JSON.stringify(err, null, 2));
  const logError = errToExternalLogError(prependMessage, err, context);
  await logErrorExternally(logError);
}

function errToExternalLogError(
  prependMessage: string | undefined,
  err: ApiError,
  context?: { [key: string]: any }
): ExternalLogError {
  const fullErrMsg = prependMessage
    ? prependMessage + ' >> ' + err.logMessage
    : err.logMessage;
  const extra: any = {
    ...(err.context || {}),
    ...(context || {}),
  };
  if (err.error) {
    extra.dbResponse = err.error;
  }

  const logContext: any = {
    ...(err.context || {}),
    ...(context || {}),
  };

  const logError: ExternalLogError = {
    error: {
      logMessage: fullErrMsg,
      context: logContext,
      dbQueries: err.dbQueries,
      errorJSONStr: JSON.stringify(err),
      sqlErrorShort: err.error?.errorMessage,
      isServerError: true,
      isClientError: false,
    },
  };

  return logError;
}

// Wrap a DBResponse and return an ApiError.
// Meant to be used in functions that return Promise<ApiError | undefined>.
export function makeDbErr(
  err: DBResponse<any> | ExecDBResponse,
  message?: string,
  context?: { [key: string]: any }
): ApiError {
  if (!err.isError) throw new Error('makeDbErr called with non-error response');

  return {
    error: err,
    logMessage: message ?? 'No log message supplied (bad!)',
    context: context || {},
  };
}

// Same as above but wrapped in { err }.
// Meant to be used in functions that use ResultOrErrorPromise.
export function makeDbErrObj(
  err: DBResponse<any> | ExecDBResponse,
  message?: string,
  context?: { [key: string]: any }
): { err: ApiError } {
  return {
    err: makeDbErr(err, message, context),
  };
}

// Wraps an api error with an additional level of message, plus optional context fields
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

// Use when we want to not throw "ugly" to an error boundary, but rather display
// this generic error message typically in an infobox instead. Use this in submit
// routes where we don't want the user to lose all their "work" if something fails.
// Eg. comic upload, mod applications form, and other places where they've spent
// time filling out a form and don't want to just lose all their work.
export function create500Json(message?: string): TypedResponse<ApiResponse> {
  return Response.json(
    {
      error:
        message ||
        'Server error. Site admins have been notified of and will look into it.',
      success: false,
    },
    { status: 500 }
  );
}

// Use when the user has made an error, meaning it's not a server error. Message
// should typically always be shown in an infobox.
export function create400Json(message: string): TypedResponse<ApiResponse> {
  return Response.json(
    {
      error: message,
      success: false,
    },
    { status: 400 }
  );
}

// Same as create400Json, but with any status code. For example, 401 for failed auth.
export function createAnyErrorCodeJson(
  code: number,
  message: string
): TypedResponse<ApiResponse> {
  return Response.json(
    {
      error: message,
      success: false,
    },
    { status: code }
  );
}

// This exists because it returns the correct response type,
// allowing us to infer a single type with useActionData<typeof action>()
// in the actual component.
export function createSuccessJson(data?: any): ApiResponse {
  return {
    success: true,
    error: null,
    data: data,
  };
}

// Put this in all api routes that don't support GET requests, otherwise
// we'll get an exception for "not exporting a get route".
// Like this: export { noGetRoute } as loader
export async function noGetRoute() {
  return new Response('Cannot GET this route', { status: 405 });
}

export async function logErrorExternally(logError: ExternalLogError) {
  if (
    errMessagePatternsToIgnore.some(pattern =>
      logError.error.logMessage.includes(pattern)
    )
  ) {
    return;
  }

  try {
    console.log('Logging error...');
    await fetch('https://images-srv.yiffer.xyz/error-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logError),
    });
    console.log('Error logged');
  } catch (e) {
    console.log('Error logging error', e);
  }
}

const errMessagePatternsToIgnore = [
  'NetworkError when attempting to fetch resource',
  'Failed to fetch',
  "Cannot read properties of null (reading 'useContext')",
  '(intermediate value)() is null',
  "(evaluating 'Be.current.useContext')",
  'Load failed',
];
