import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getComicNamesAndIDs } from '~/route-funcs/get-comics';
import { getAllOldComicRatingsForUser } from '~/route-funcs/get-old-comic-ratings';
import { queryDbExec } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import type { ApiError } from '~/utils/request-helpers';
import {
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export type ConvertOldRatingsBody = {
  conversions: {
    oldRating: number;
    newRating: number;
    bookmark: boolean;
  }[];
};

export async function action(args: ActionFunctionArgs) {
  const { fields, user, isUnauthorized } = await parseFormJson<ConvertOldRatingsBody>(
    args,
    'normal'
  );

  if (isUnauthorized || !user) return new Response('Unauthorized', { status: 401 });

  const err = await convertOldRatings(
    args.context.cloudflare.env.DB,
    fields.conversions,
    user.userId
  );
  if (err) {
    return processApiError('Error in /convert-old-ratings', err);
  }
  return createSuccessJson();
}

async function convertOldRatings(
  db: D1Database,
  conversions: ConvertOldRatingsBody['conversions'],
  userId: number
): Promise<ApiError | undefined> {
  const logCtx = { conversions };

  if (conversions.length > 0) {
    const allOldRatingsRes = await getAllOldComicRatingsForUser(db, userId);
    if (allOldRatingsRes.err) {
      return processApiError('Error in /convert-old-ratings', allOldRatingsRes.err);
    }

    const allComicsRes = await getComicNamesAndIDs(db, {});
    if (allComicsRes.err) {
      return processApiError('Error in /convert-old-ratings', allComicsRes.err);
    }
    const allComicIds = new Set(allComicsRes.result.map(c => c.id));

    let updateRatingsQuery =
      'INSERT OR IGNORE INTO comicrating (userId, comicId, rating) VALUES ';
    const updateRatingsParams: any[] = [];

    let updateBookmarksQuery =
      'INSERT OR IGNORE INTO comicbookmark (userId, comicId) VALUES ';
    const updateBookmarksParams: any[] = [];

    let hasAnyConversion = false;
    let hasAnyBookmark = false;

    for (const oldRating of allOldRatingsRes.result) {
      const newRating = conversions.find(
        c => c.oldRating === oldRating.rating
      )?.newRating;
      if (!allComicIds.has(oldRating.comicId)) {
        continue;
      }
      if (!conversions.find(c => c.oldRating === oldRating.rating)) {
        continue;
      }
      if (!newRating) {
        continue;
      }

      updateRatingsQuery += `(?, ?, ?), `;
      updateRatingsParams.push(userId, oldRating.comicId, newRating);
      hasAnyConversion = true;

      if (conversions.find(c => c.oldRating === oldRating.rating)?.bookmark) {
        updateBookmarksQuery += `(?, ?), `;
        updateBookmarksParams.push(userId, oldRating.comicId);
        hasAnyBookmark = true;
      }
    }

    if (hasAnyConversion) {
      updateRatingsQuery = updateRatingsQuery.slice(0, -2);
      const updateRes = await queryDbExec(
        db,
        updateRatingsQuery,
        updateRatingsParams,
        'Convert old comic ratings'
      );
      if (updateRes.isError) {
        return makeDbErr(updateRes, 'Could not convert old comic ratings', logCtx);
      }
    }

    if (hasAnyBookmark) {
      updateBookmarksQuery = updateBookmarksQuery.slice(0, -2);
      const updateRes = await queryDbExec(
        db,
        updateBookmarksQuery,
        updateBookmarksParams,
        'Convert old comic bookmarks'
      );
      if (updateRes.isError) {
        return makeDbErr(updateRes, 'Could not convert old comic bookmarks', logCtx);
      }
    }
  }

  const deleteQuery = 'DELETE FROM oldcomicrating WHERE userId = ?';
  const deleteRes = await queryDbExec(
    db,
    deleteQuery,
    [userId],
    'Delete old comic ratings'
  );
  if (deleteRes.isError) {
    return makeDbErr(deleteRes, 'Could not delete old comic ratings', logCtx);
  }

  const updateQuery = 'UPDATE user SET hasCompletedConversion = 1 WHERE id = ?';
  const updateRes = await queryDbExec(
    db,
    updateQuery,
    [userId],
    'Update user hasCompletedConversion'
  );
  if (updateRes.isError) {
    return makeDbErr(
      updateRes,
      'Could not update user in hasCompletedConversion',
      logCtx
    );
  }
}
