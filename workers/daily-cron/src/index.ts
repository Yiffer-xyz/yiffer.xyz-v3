export interface Env {
  CRON_KEY: string;
  SCHEDULE_URL_BASE: string;
}

export default {
  async scheduled(_: FetchEvent, env: Env, __: ExecutionContext): Promise<void> {
    await callCronScheduleEndpoint(env);
    await callCronUpdateExpiredAdsEndpoint(env);
    await callClearSpammableActionsEndpoint(env);
    await syncPatreonTiers(env);
  },

  async fetch(_: FetchEvent, env: Env, __: ExecutionContext): Promise<Response> {
    const scheduleResult = await callCronScheduleEndpoint(env);
    const expiredResult = await callCronUpdateExpiredAdsEndpoint(env);
    const clearSpammableResult = await callClearSpammableActionsEndpoint(env);
    const syncPatreonResult = await syncPatreonTiers(env);
    return new Response(
      JSON.stringify({
        scheduleResult,
        expiredResult,
        clearSpammableResult,
        syncPatreonResult,
      })
    );
  },
};

async function callCronScheduleEndpoint(env: Env) {
  const endpoint = `${env.SCHEDULE_URL_BASE}/api/admin/publish-comics-cron`;
  console.log('Calling', endpoint, 'with key', env.CRON_KEY);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'x-yiffer-api-key': env.CRON_KEY,
    },
  });

  const responseText = await response.text();
  const resultMessage = `Ran comic scheduling cron job. Status from yiffer endpoint: ${response.status} ${response.statusText} - ${responseText}`;
  console.log(resultMessage);
  return resultMessage;
}

async function callCronUpdateExpiredAdsEndpoint(env: Env) {
  const endpoint = `${env.SCHEDULE_URL_BASE}/api/admin/update-expired-ads`;
  console.log('Calling', endpoint, 'with key', env.CRON_KEY);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'x-yiffer-api-key': env.CRON_KEY,
    },
  });

  const responseText = await response.text();
  const resultMessage = `Ran expired ads cron job. Status from yiffer endpoint: ${response.status} ${response.statusText} - ${responseText}`;
  console.log(resultMessage);
  return resultMessage;
}

async function callClearSpammableActionsEndpoint(env: Env) {
  const endpoint = `${env.SCHEDULE_URL_BASE}/api/admin/clear-spammable-actions`;
  console.log('Calling', endpoint, 'with key', env.CRON_KEY);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'x-yiffer-api-key': env.CRON_KEY,
    },
  });

  const responseText = await response.text();
  const resultMessage = `Ran clear spammable actions cron job. Status from yiffer endpoint: ${response.status} ${response.statusText} - ${responseText}`;
  console.log(resultMessage);
  return resultMessage;
}

async function syncPatreonTiers(env: Env) {
  const endpoint = `${env.SCHEDULE_URL_BASE}/api/sync-patrons`;
  console.log('Calling', endpoint, 'with key', env.CRON_KEY);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'x-yiffer-api-key': env.CRON_KEY,
    },
  });

  const responseText = await response.text();
  const resultMessage = `Ran sync patrons cron job. Status from yiffer endpoint: ${response.status} ${response.statusText} - ${responseText}`;
  console.log(resultMessage);
  return resultMessage;
}
