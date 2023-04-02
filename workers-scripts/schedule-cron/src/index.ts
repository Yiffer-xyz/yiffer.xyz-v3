/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

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
  async scheduled(_: FetchEvent, env: any, __: ExecutionContext): Promise<void> {
    await callCronScheduleEndpoint(env);
  },

  async fetch(_: FetchEvent, env: any, __: ExecutionContext): Promise<Response> {
    const result = await callCronScheduleEndpoint(env);
    return new Response(result);
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
  const resultMessage = `Ran scheduled cron job. Status from yiffer endpoint: ${response.status} ${response.statusText} - ${responseText}`;
  console.log(resultMessage);
  return resultMessage;
}
