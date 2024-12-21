export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  CRON_KEY: string;
  SCHEDULE_URL_BASE: string;
}

export default {
  async scheduled(_: FetchEvent, env: Env, __: ExecutionContext): Promise<void> {
    await callCronScheduleEndpoint(env);
  },

  async fetch(_: FetchEvent, env: Env, __: ExecutionContext): Promise<Response> {
    const scheduleResult = await callCronScheduleEndpoint(env);
    const expiredResult = await callCronUpdateExpiredAdsEndpoint(env);
    return new Response(JSON.stringify({ scheduleResult, expiredResult }));
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
