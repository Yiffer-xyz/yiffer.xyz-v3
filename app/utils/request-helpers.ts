import type { TypedResponse } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import type {
  DBResponse,
  ExecDBResponse,
  QueryWithParams,
} from '~/utils/database-facade';
import { HANDLED_ERR_MSG } from '~/utils/error';
// import * as Sentry from '@sentry/browser';

export type ResultOrErrorPromise<T> = Promise<
  { result: T; err?: undefined } | { err: ApiError }
>;

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
  logApiError(prependMessage, {
    ...err,
    context: {
      ...(err.context || {}),
      ...(context || {}),
    },
  });

  throw new Error(HANDLED_ERR_MSG);
}

// Use this when not wanting to throw an error (when you want
// to show a nice error message to the user), but still need to log it.
export async function logApiError(
  prependMessage: string | undefined,
  err: ApiError,
  context?: { [key: string]: any }
) {
  const fullErrMsg = prependMessage
    ? prependMessage + ' >> ' + err.logMessage
    : err.logMessage;

  console.log('⛔');
  console.log(fullErrMsg);
  console.log('⛔');
  console.log(err.context);
  console.log('⛔');
  console.log(err.error);
  console.log('⛔');

  const extra: any = {
    ...(err.context || {}),
    ...(context || {}),
  };
  if (err.error) {
    extra.dbResponse = err.error;
  }

  try {
    await fetch('https://images-srv.testyiffer.xyz/error-log', {
      // await fetch('http://localhost:8770/error-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: err,
      }),
    });
  } catch (e) {
    console.log('Error logging error', e);
  }

  // Sentry.captureMessage(fullErrMsg, {
  //   extra,
  //   level: 'error',
  // });
}

// Log a message when something fails drastically but there's no error object
export function logApiErrorMessage(message: string, context?: { [key: string]: any }) {
  // Sentry.captureMessage(message, {
  //   extra: {
  //     ...(context || {}),
  //   },
  //   level: 'error',
  // });
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

// This is for front-end errors that are thrown and thus not handled by
// the API's error handling. Not to be called from anything other than
// an error boundary.
export function logErrorBoundaryException(err: Error) {
  console.log('Error boundary captured and logging exception!');
  console.log(err);
  // Sentry.captureException(err, {
  //   tags: {
  //     errorBoundary: 'true',
  //   },
  // });
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

// Use when the user has made an error, meaning it's not a server error. Message
// should typically always be shown in an infobox.
export function create400Json(message: string): TypedResponse<ApiResponse> {
  return json(
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
  return json(
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

// Put this in all api routes that don't support GET requests, otherwise
// we'll get an exception for "not exporting a get route".
// Like this: export { noGetRoute } as loader
export async function noGetRoute() {
  return new Response('Cannot GET this route', { status: 405 });
}
