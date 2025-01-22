import type { ApiError, ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErr, wrapApiError } from '~/utils/request-helpers';
import { getPatrons } from '~/route-funcs/get-patrons';
import { getUsersByPatreonEmails } from '~/route-funcs/get-user';
import { queryDbMultiple, type QueryWithParams } from '~/utils/database-facade';

type ActivePatreonAPIPatron = {
  email: string;
  amountDollars: number;
};

export async function syncPatreonTiers(
  db: D1Database,
  campaignId: string,
  creatorAccessToken: string
): Promise<ApiError | undefined> {
  const oldPatronsRes = await getPatrons(db);
  if (oldPatronsRes.err) {
    return wrapApiError(
      oldPatronsRes.err,
      'Error in syncPatreonTiers, failed getting old patrons'
    );
  }
  const oldPatrons = oldPatronsRes.result;
  const newPatronsRes = await getActivePatrons(campaignId, creatorAccessToken);
  if (newPatronsRes.err) {
    return wrapApiError(
      newPatronsRes.err,
      'Error in syncPatreonTiers, failed getting new patrons'
    );
  }

  const newFetchedPatrons = newPatronsRes.result;
  const expiredPatronUserIds: number[] = [];
  const unchangedPatronUserIds: number[] = [];
  const updatedTierUsers: { userId: number; newTier: number }[] = [];

  for (const oldPatron of oldPatrons) {
    const existingPatronMatch = newFetchedPatrons.find(
      newPatron => newPatron.email === oldPatron.patreonEmail
    );
    const isDollarMatch = existingPatronMatch?.amountDollars === oldPatron.patreonDollars;
    if (isDollarMatch) {
      unchangedPatronUserIds.push(oldPatron.userId);
    } else if (existingPatronMatch) {
      updatedTierUsers.push({
        userId: oldPatron.userId,
        newTier: existingPatronMatch.amountDollars,
      });
    } else {
      expiredPatronUserIds.push(oldPatron.userId);
    }
  }

  const oldPatronsPatreonEmails = oldPatrons.map(patron => patron.patreonEmail);
  const brandNewPatrons = newFetchedPatrons.filter(
    patron => !oldPatronsPatreonEmails.includes(patron.email)
  );

  const newPatronUserIdsRes = await getUsersByPatreonEmails(
    db,
    brandNewPatrons.map(patron => patron.email)
  );

  if (newPatronUserIdsRes.err) {
    return wrapApiError(
      newPatronUserIdsRes.err,
      'Error in syncPatreonTiers, failed getting new patron user IDs'
    );
  }

  const brandNewTierUsers: { userId: number; newTier: number }[] = [];
  for (const patron of brandNewPatrons) {
    const user = newPatronUserIdsRes.result.find(
      user => user.patreonEmail === patron.email
    );
    if (user) {
      brandNewTierUsers.push({ userId: user.id, newTier: patron.amountDollars });
    }
  }

  const newUsersCount = brandNewTierUsers.length;
  const removedUsersCount = expiredPatronUserIds.length;
  const updatedUsersCount = updatedTierUsers.length;
  const unchangedUsersCount = unchangedPatronUserIds.length;

  const queries: QueryWithParams[] = updatedTierUsers
    .concat(brandNewTierUsers)
    .map(user => ({
      query: `UPDATE user SET patreonDollars = ${user.newTier} WHERE id = ${user.userId}`,
      queryName: 'Update user patreon tier',
      extraInfo: `User ID: ${user.userId}, New tier: ${user.newTier}`,
    }));

  if (expiredPatronUserIds.length) {
    queries.push({
      query: `UPDATE user SET patreonDollars = NULL WHERE id IN (${expiredPatronUserIds.join(',')})`,
      queryName: 'Remove expired patrons',
      extraInfo: `User IDs: ${expiredPatronUserIds.join(', ')}`,
    });
  }

  console.log(queries);

  if (queries.length > 0) {
    const dbRes = await queryDbMultiple(db, queries);
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error updating users in syncPatreonTiers');
    }
  }

  console.log(
    `Cron patron sync finished. New users: ${newUsersCount}. Removed users: ${removedUsersCount}. Updated users: ${updatedUsersCount}. Unchanged users: ${unchangedUsersCount}.`
  );

  return;
}

async function getActivePatrons(
  campaignId: string,
  creatorAccessToken: string
): ResultOrErrorPromise<ActivePatreonAPIPatron[]> {
  const baseUrl = `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members?fields[member]=email,currently_entitled_amount_cents,patron_status&include=currently_entitled_tiers&fields[tier]=title,amount_cents`;

  const activePatrons: ActivePatreonAPIPatron[] = [];
  let nextLink: string | null = baseUrl;

  while (nextLink) {
    const pageRes = await fetchPatreonPage(nextLink, creatorAccessToken);

    if (pageRes.err) {
      return pageRes;
    }

    activePatrons.push(...pageRes.result.data);
    nextLink = pageRes.result.nextLink;
  }

  return { result: activePatrons };
}

async function fetchPatreonPage(
  url: string,
  creatorAccessToken: string
): ResultOrErrorPromise<{ data: ActivePatreonAPIPatron[]; nextLink: string | null }> {
  console.log('Fetching...');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${creatorAccessToken}`,
    },
  });

  if (!response.ok) {
    return {
      err: {
        logMessage: `Error fetching patreon page: ${response.statusText}`,
        context: { fullResponse: JSON.stringify(response) },
      },
    };
  }

  const data: any = await response.json();

  const members = data.data
    .map((member: any) => ({
      email: member.attributes.email,
      amountDollars: Math.ceil(member.attributes.currently_entitled_amount_cents / 100),
    }))
    .filter((member: ActivePatreonAPIPatron) => member.amountDollars > 0);

  console.log('Found', members.length, 'patrons');
  return { result: { data: members, nextLink: data.links?.next ?? null } };
}
