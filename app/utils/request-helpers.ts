import { json, TypedResponse } from '@remix-run/cloudflare';
import { DBResponse } from './database-facade';

export type ApiResponse = {
  success: boolean;
  error: string | null;
};

export type ApiError = {
  error?: Error | DBResponse<any>;
  logMessage: string;
  clientMessage: string;
};

export function wrapApiError(err: ApiError, message: string): ApiError {
  return {
    logMessage: message + ' >> ' + err.logMessage,
    error: err.error,
    clientMessage: err.clientMessage,
  };
}

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
export function createSuccessJson(): TypedResponse<ApiResponse> {
  return json(
    {
      success: true,
      error: null,
    },
    { status: 200 }
  );
}

// TODO: dont use this
export function logError(
  prependMessage: string,
  err: ApiError | DBResponse<any> | string
) {
  // TODO: If ApiError, combine prependMessage with err.logMessage, with ' >> ' in between.
  // TODO: if DBResponse, and no errorMessage, the result will be undefined.
  //    this is also an error as this should be handled where it could happen.
  console.log(prependMessage, err);
}

export async function noGetRoute() {
  return new Response('Cannot GET this route', { status: 405 });
}
