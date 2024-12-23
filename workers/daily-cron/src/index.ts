export interface Env {
  CRON_KEY: string;
  SCHEDULE_URL_BASE: string;
}

export default {
  async scheduled(_: FetchEvent, env: Env, __: ExecutionContext): Promise<void> {
    await callCronScheduleEndpoint(env);
    await callCronUpdateExpiredAdsEndpoint(env);
    await callClearSpammableActionsEndpoint(env);
  },

  async fetch(_: FetchEvent, env: Env, __: ExecutionContext): Promise<Response> {
    const scheduleResult = await callCronScheduleEndpoint(env);
    const expiredResult = await callCronUpdateExpiredAdsEndpoint(env);
    const clearSpammableResult = await callClearSpammableActionsEndpoint(env);
    return new Response(
      JSON.stringify({ scheduleResult, expiredResult, clearSpammableResult })
    );
  },
};

async function callCronScheduleEndpoint(env: Env) {
  const response = await fetch(`${env.SCHEDULE_URL_BASE}/api/admin/publish-comics-cron`, {
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
  const response = await fetch(`${env.SCHEDULE_URL_BASE}/api/admin/update-expired-ads`, {
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
  const response = await fetch(
    `${env.SCHEDULE_URL_BASE}/api/admin/clear-spammable-actions`,
    {
      method: 'GET',
      headers: {
        'x-yiffer-api-key': env.CRON_KEY,
      },
    }
  );

  const responseText = await response.text();
  const resultMessage = `Ran clear spammable actions cron job. Status from yiffer endpoint: ${response.status} ${response.statusText} - ${responseText}`;
  console.log(resultMessage);
  return resultMessage;
}
