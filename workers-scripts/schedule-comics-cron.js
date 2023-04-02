export default {
  async scheduled(event, env, ctx) {
    console.log(event, env, ctx);
    const scheduleEndpoint = 'http://localhost:8788/api/admin/publish-comic-cron';
    ctx.waitUntil(callCronScheduleEndpoint(env.CRON_KEY, scheduleEndpoint));
  },
};

async function callCronScheduleEndpoint(cronKey, scheduleEndpoint) {
  console.log('Calling cron schedule endpoint', scheduleEndpoint, cronKey);

  const response = await fetch(scheduleEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cronKey: cronKey }),
  });
  const data = await response.json();
  return data;
}
