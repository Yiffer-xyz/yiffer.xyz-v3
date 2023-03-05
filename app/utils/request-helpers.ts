import { json, TypedResponse } from '@remix-run/cloudflare';

export enum ErrorCodes {
  EXISTING_SUGG_CHECK = '1000',
  EXISTING_COMIC_CHECK = '1001',
  COMIC_PROBLEM_SUBMIT = '1002',
  EXISTING_MODAPPL_SUMIT = '1003',
}

export function create500Json(message: string) {
  return json(
    {
      error: message,
      success: false,
    },
    { status: 500 }
  );
}

export function create400Json(message: string) {
  return json(
    {
      error: message,
      success: false,
    },
    { status: 400 }
  );
}

export function createGeneric500Json(errorCode: ErrorCodes) {
  return create500Json(
    `Something went wrong. Please report it to our Feedback page with error code: ${errorCode}`
  );
}

// This exists because it returns the correct response type,
// allowing us to infer a single type with useActionData<typeof action>()
// in the actual component.
export function createSuccessJson(): TypedResponse<{
  success: boolean;
  error: string | null;
}> {
  return json(
    {
      success: true,
      error: null,
    },
    { status: 200 }
  );
}
