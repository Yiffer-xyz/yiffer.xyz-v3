import { useLoaderData } from '@remix-run/react';
import { useMemo, useState } from 'react';
import { getAllModApplications } from '~/route-funcs/get-mod-application';
import type { ModApplication } from '~/types/types';
import DropdownButton from '~/ui-components/Buttons/DropdownButton';
import ToggleButton from '~/ui-components/Buttons/ToggleButton';
import Link from '~/ui-components/Link';
import { getTimeAgo } from '~/utils/date-utils';
import { parseFormJson } from '~/utils/formdata-parser';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import { MdOpenInNew } from 'react-icons/md';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

const statusOptions: { key: ModApplication['status']; text: string }[] = [
  { key: 'pending', text: 'Pending' },
  { key: 'approved', text: 'Approved' },
  { key: 'rejected', text: 'Rejected' },
  { key: 'on-hold', text: 'On hold' },
];

function statusToActionText(status: ModApplication['status']) {
  return statusOptions.find(opt => opt.key === status)?.text ?? 'Action';
}

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Mod applications | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const applicationsRes = await getAllModApplications(args.context.cloudflare.env.DB);
  if (applicationsRes.err) {
    return processApiError(
      'Error getting mod applications in admin route',
      applicationsRes.err
    );
  }

  return { applications: applicationsRes.result };
}

export default function AdminModApplications() {
  const { applications } = useLoaderData<typeof loader>();

  const [status, setStatus] = useState<ModApplication['status']>('pending');
  const [showAll, setShowAll] = useState(false);

  const updateStatusFetcher = useGoodFetcher({
    method: 'post',
  });

  function handleAction(applicationId: number, status: ModApplication['status']) {
    const body: ActionFields = {
      applicationId,
      status,
    };

    updateStatusFetcher.submit({ body: JSON.stringify(body) });
  }

  const filteredApplications = useMemo(
    () => (showAll ? applications : applications.filter(app => app.status === status)),
    [applications, status, showAll]
  );

  return (
    <>
      <h1>Mod applications</h1>

      <Checkbox
        label="Show all applications"
        checked={showAll}
        onChange={() => setShowAll(prev => !prev)}
        className="mt-4"
      />

      <ToggleButton
        buttons={statusOptions.map(status => ({ text: status.text, value: status.key }))}
        value={status}
        onChange={setStatus}
        className="mt-2 flex-wrap"
        disabled={showAll}
      />

      <div className="mt-4 mb-4 text-sm">
        <p>When accepting new mods:</p>
        <p>1. Set status to Approved</p>
        <p>2. Contact the user on Telegram</p>
        <p>3. With their permission, give them the mod role via the user manager</p>
      </div>

      <div className="flex flex-col gap-y-2 max-w-2xl">
        {filteredApplications.map(appl => (
          <ModApplicationCard
            key={appl.id}
            application={appl}
            onChangeStatus={handleAction}
            isLoading={updateStatusFetcher.isLoading}
          />
        ))}

        {filteredApplications.length === 0 && <p>No applications found.</p>}
      </div>
    </>
  );
}

export function ModApplicationCard({
  application,
  onChangeStatus,
  isLoading,
}: {
  application: ModApplication;
  onChangeStatus: (applicationId: number, status: ModApplication['status']) => void;
  isLoading: boolean;
}) {
  return (
    <div
      key={application.id}
      className={`flex flex-col shadow rounded-sm gap-y-1 px-3 py-3
        gap-6 justify-between bg-white dark:bg-gray-300`}
    >
      <div className="flex flex-row justify-between">
        <Link
          href={`/admin/users/${application.userId}`}
          text={application.username}
          showRightArrow
        />

        <p>{getTimeAgo(application.timestamp)}</p>
      </div>

      <Link
        href={`https://t.me/${application.telegramUsername}`}
        text={`Telegram: ${application.telegramUsername}`}
        newTab
        IconRight={MdOpenInNew}
      />

      <p>{application.notes}</p>

      <DropdownButton
        text={statusToActionText(application.status) ?? 'Choose action'}
        color="primary"
        isLoading={isLoading}
        options={[
          { text: 'Approve', onClick: () => onChangeStatus(application.id, 'approved') },
          { text: 'Reject', onClick: () => onChangeStatus(application.id, 'rejected') },
          {
            text: 'Put on hold',
            onClick: () => onChangeStatus(application.id, 'on-hold'),
          },
        ]}
        className="self-end"
      />
    </div>
  );
}

type ActionFields = {
  applicationId: number;
  status: ModApplication['status'];
};

export async function action(args: ActionFunctionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<ActionFields>(args, 'admin');
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });

  const query = `UPDATE modapplication SET status = ? WHERE id = ?`;
  const params = [fields.status, fields.applicationId];

  const db = args.context.cloudflare.env.DB;
  const res = await queryDbExec(db, query, params, 'Mod application update');

  if (res.isError) {
    return makeDbErr(res, 'Error setting mod application status', {
      applicationId: fields.applicationId,
      status: fields.status,
    });
  }

  return createSuccessJson();
}
