import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { UserSession } from '~/types/types';
import { authLoader } from './loaders';

export type ParsedFormdataJson<T> = {
  fields: T;
  user: UserSession | null;
  isUnauthorized: boolean;
};

// This function is used to parse JSON sent as {body: <stringifiedStuff>}
// in formdata requests. Can also validate user type.
export async function parseFormJson<T>(
  args: ActionFunctionArgs,
  validateUser: 'normal' | 'mod' | 'admin' | 'none' = 'none'
): Promise<ParsedFormdataJson<T>> {
  const user = await authLoader(args);

  if (validateUser === 'normal' && !user) {
    return makeUnauthorizedResponse(user);
  }

  if (
    validateUser === 'mod' &&
    user?.userType !== 'moderator' &&
    user?.userType !== 'admin'
  ) {
    return makeUnauthorizedResponse(user);
  }

  if (validateUser === 'admin' && user?.userType !== 'admin') {
    return makeUnauthorizedResponse(user);
  }

  const formDataBody = await args.request.formData();
  const body = formDataBody.get('body') as string;
  const parsedBody = JSON.parse(body) as T;
  return {
    fields: parsedBody,
    user,
    isUnauthorized: false,
  };
}

function makeUnauthorizedResponse<T>(user: UserSession | null): ParsedFormdataJson<T> {
  return {
    fields: {} as T,
    user,
    isUnauthorized: true,
  };
}
