import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import Button from '~/ui-components/Buttons/Button';
import { makeDbErr, processApiError } from '~/utils/request-helpers';
import { redirectIfNotMod } from '~/utils/loaders';
import { Table, TableBody, TableCell, TableRow } from '~/ui-components/Table';
import { queryDb } from '~/utils/database-facade';
import { useState } from 'react';
import TextInput from '~/ui-components/TextInput/TextInput';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: IP ban list | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotMod(args);

  const getIpBanList = await queryDb<{ ip: string }[]>(
    args.context.cloudflare.env.DB,
    'SELECT ip FROM ipban',
    null,
    'IP ban list'
  );
  if (getIpBanList.isError) {
    return processApiError('Error getting chat list admin', makeDbErr(getIpBanList));
  }

  return {
    ipBanList: getIpBanList.result,
  };
}

export default function IpBanList() {
  const { ipBanList } = useLoaderData<typeof loader>();

  const [isBanningNewIp, setIsBanningNewIp] = useState(false);
  const [ipUnbanLoading, setIpUnbanLoading] = useState('');
  const [newIpToBan, setNewIpToBan] = useState('');

  const banIpFetcher = useGoodFetcher({
    url: '/api/admin/ban-ip',
    method: 'post',
    toastSuccessMessage: 'IP banned',
    onFinish: () => {
      setIsBanningNewIp(false);
      setNewIpToBan('');
    },
  });

  const unbanIpFetcher = useGoodFetcher({
    url: '/api/admin/unban-ip',
    method: 'post',
    toastSuccessMessage: 'IP unbanned',
    onFinish: () => {
      setIpUnbanLoading('');
    },
  });

  function onBanNewIp() {
    banIpFetcher.submit({ ip: newIpToBan });
  }

  function onUnbanIp(ip: string) {
    setIpUnbanLoading(ip);
    unbanIpFetcher.submit({ ip });
  }

  return (
    <>
      <h1 className="mb-1">IP ban list</h1>

      {!isBanningNewIp && (
        <Button
          text="Ban new IP"
          className="mt-2"
          onClick={() => setIsBanningNewIp(true)}
        />
      )}

      {isBanningNewIp && (
        <>
          <h4>Ban new IP</h4>
          <TextInput className="max-w-xs" value={newIpToBan} onChange={setNewIpToBan} />

          <div className="flex flex-row gap-2 mt-3 mb-8">
            <Button
              text="Cancel"
              variant="outlined"
              onClick={() => setIsBanningNewIp(false)}
            />
            <LoadingButton
              text="Ban"
              onClick={onBanNewIp}
              isLoading={false}
              disabled={newIpToBan.length === 0}
            />
          </div>
        </>
      )}

      <h4 className="mt-4">IPs currently banned</h4>
      <Table className="mt-1">
        <TableBody>
          {ipBanList.map((ip, index) => (
            <TableRow key={ip.ip} includeBorderTop={index === 0}>
              <TableCell>{ip.ip}</TableCell>
              <TableCell>
                <LoadingButton
                  variant="naked"
                  className="py-0.5! p-2! -mr-2"
                  text="Unban"
                  onClick={() => onUnbanIp(ip.ip)}
                  isLoading={ipUnbanLoading === ip.ip}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
