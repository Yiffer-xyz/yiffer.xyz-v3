import type { Route } from './+types/set-allow-messages';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';

export async function action(args: Route.ActionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const formData = await args.request.formData();
  const allowMessages = formData.get('allowMessages');

  let newValue = false;
  if (allowMessages?.toString() === 'true') {
    newValue = true;
  } else if (allowMessages?.toString() === 'false') {
    newValue = false;
  } else {
    return create400Json('Invalid allowMessages value');
  }

  const query = `UPDATE user SET allowMessages = ? WHERE id = ?`;
  const result = await queryDbExec(args.context.cloudflare.env.DB, query, [
    newValue ? 1 : 0,
    user.userId,
  ]);
  if (result.isError) {
    return processApiError(
      'Error in /set-allow-messages',
      makeDbErr(result, 'Error updating allowMessages'),
      { userId: user.userId }
    );
  }

  return createSuccessJson();
}
