import { json, TypedResponse } from '@remix-run/cloudflare';
import { DBResponse } from './database-facade';

export enum ErrorCodes {
  EXISTING_SUGG_CHECK = '1000',
  EXISTING_COMIC_CHECK = '1001',
  COMIC_PROBLEM_SUBMIT = '1002',
  EXISTING_MODAPPL_SUMIT = '1003',
  SIGNUP_ERROR_CHECK = '1004',
  SIGNUP_ERROR_INSERT = '1005',
  CREATECOMIC_TAGS = '1006',
  CREATECOMIC_LINKS = '1007',
  CREATECOMIC_UNPUBLISHED = '1008',
}

export type ApiResponse = {
  success: boolean;
  error: string | null;
};

export type ApiError = {
  error?: Error | DBResponse<any>;
  message?: string;
  clientMessage: string;
};

export type MaybeApiResponse = ApiResponse | undefined;

export function wrapApiError(err: ApiError, message: string): ApiError {
  return {
    message: message + ' >> ' + err.message,
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

export function createGeneric500Json(errorCode?: ErrorCodes): TypedResponse<ApiResponse> {
  if (!errorCode) return create500Json('Unknown error');
  return create500Json(
    `Something went wrong. Please report it to our Feedback page with error code: ${errorCode}`
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

export function logError(customMessage: string, err?: Error | DBResponse<any> | string) {
  console.log(customMessage, err);
}
