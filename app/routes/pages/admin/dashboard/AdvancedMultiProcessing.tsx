import { useMemo, useState } from 'react';
import TextInput from '~/ui-components/TextInput/TextInput';
import type { DashboardAction } from '~/routes/api/admin/dashboard-data';
import pluralize from 'pluralize';
import RadioButtonGroup from '~/ui-components/RadioButton/RadioButtonGroup';
import Button from '~/ui-components/Buttons/Button';
import Username from '~/ui-components/Username';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function AdvancedMultiProcessing({
  search,
  onSearchChange,
  foundResults,
  pagesPath,
}: {
  search: string;
  onSearchChange: (newSearch: string) => void;
  foundResults: DashboardAction[];
  pagesPath: string;
}) {
  const [isRejectingAll, setIsRejectingAll] = useState(false);
  const [keptUser, setKeptUser] = useState<{ username: string; id: number } | null>(null);
  const [ipOption, setIpOption] = useState<'reject' | 'reject-and-ban' | null>(null);

  const numFoundResults = foundResults.length;
  const areItemsFromUser = foundResults.every(i => i.user?.userId);

  const user = useMemo(() => {
    if (!areItemsFromUser || foundResults.length === 0) return null;
    return foundResults[0].user!;
  }, [areItemsFromUser, foundResults]);

  const ip = useMemo(() => {
    if (foundResults.length === 0 || areItemsFromUser) return null;
    return foundResults[0].user.ip;
  }, [areItemsFromUser, foundResults]);

  const rejectAllFetcher = useGoodFetcher({
    url: '/api/admin/reject-all-action-items',
    method: 'POST',
  });

  function onRejectAll() {
    if (user) {
      setKeptUser({ id: user.userId!, username: user.username! });
    }
    rejectAllFetcher.submit({
      actionsToRejectJson: JSON.stringify(
        foundResults.map(r => ({
          type: r.type,
          id: r.id,
        }))
      ),
      banIP: ipOption === 'reject-and-ban' ? ip : null,
    });
  }

  return (
    <div className="bg-theme1-primary-trans p-4 pt-3 w-fit mb-4">
      <h4>Advanced multi-rejection/ban</h4>

      {!rejectAllFetcher.success && (
        <>
          <p>
            Find all contributions by a user/IP and immediately reject all of them, and
            ban. To be used in cases of spammy behavior.
          </p>
          <p>Only items with an exact search match will show when using this.</p>

          <TextInput
            value={search}
            onChange={onSearchChange}
            label="Search username/IP"
            name="search"
            className="max-w-sm mt-4"
          />

          <p className="font-bold mt-4">
            {pluralize('Item', numFoundResults, true)} found
          </p>

          {user && (
            <>
              <div className="flex flex-row">
                From user
                <Username
                  username={user!.username ?? 'Unknown'}
                  id={user.userId!}
                  className="ml-1"
                  pagesPath={pagesPath}
                />
              </div>

              <p className="my-2">
                If this is obvious abuse, and you reject all items, you should most likely
                either restrict or ban this user. This can be done via the mod panel's
                User Manager.
              </p>
            </>
          )}

          {ip && (
            <>
              <RadioButtonGroup
                options={[
                  { text: 'Reject all', value: 'reject' },
                  { text: 'Reject all and ban IP address', value: 'reject-and-ban' },
                ]}
                name="ipOptions"
                onChange={setIpOption}
                value={ipOption}
                className="mt-2"
              />

              {ipOption && (
                <LoadingButton
                  text={`Confirm ${ipOption.replaceAll('-', ' ')}`}
                  disabled={!ipOption}
                  color="error"
                  className="mt-4"
                  isLoading={rejectAllFetcher.isLoading}
                  onClick={onRejectAll}
                />
              )}
            </>
          )}

          {numFoundResults > 0 && areItemsFromUser && !isRejectingAll && (
            <Button
              color="error"
              text="Reject all items"
              className="mt-4"
              onClick={() => setIsRejectingAll(true)}
            />
          )}

          {isRejectingAll && (
            <div className="flex flex-row gap-2 mt-4">
              <Button
                variant="outlined"
                text="Cancel"
                onClick={() => setIsRejectingAll(false)}
              />
              <LoadingButton
                color="error"
                text="Reject all"
                isLoading={false}
                onClick={onRejectAll}
              />
            </div>
          )}
        </>
      )}

      {rejectAllFetcher.success && (
        <>
          <p>Success!</p>
          {keptUser && (
            <>
              <p>You should most likely ban or restrict this user.</p>
              <Username
                pagesPath={pagesPath}
                id={keptUser.id}
                username={keptUser.username}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
