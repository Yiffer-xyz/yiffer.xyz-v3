import { unstable_defineLoader } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getAllModApplications } from '~/route-funcs/get-mod-application';
import { processApiError } from '~/utils/request-helpers';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const loader = unstable_defineLoader(async args => {
  const applicationsRes = await getAllModApplications(args.context.cloudflare.env.DB);
  if (applicationsRes.err) {
    return processApiError(
      'Error getting mod applications in admin route',
      applicationsRes.err
    );
  }

  return { applications: applicationsRes.result };
});

export default function AdminModApplications() {
  const { applications } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Mod applications</h1>
      <p className="font-bold">ℹ️ See the figma prototype.</p>

      {applications.map(appl => (
        <div key={appl.id} className="my-4">
          <pre>{JSON.stringify(appl, null, 2)}</pre>
        </div>
      ))}
    </>
  );
}
