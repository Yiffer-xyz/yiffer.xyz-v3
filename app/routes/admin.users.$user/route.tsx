import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getUserById } from '~/route-funcs/get-user';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import Select from '~/ui-components/Select/Select'
import {useState} from 'react'
import Textarea from '~/ui-components/Textarea/Textarea'
import Button from '~/ui-components/Buttons/Button'
import {
  getContributionDetails,
  getContributionName,
  getContributionStatusColor, getDate,
  loader as contributionLoader
} from '~/routes/contribute_.your-contributions/route'
import {Table, TableBody, TableCell, TableHeadRow, TableRow} from '~/ui-components/Table'
import {capitalizeString} from '~/utils/general'
import TextInput from '~/ui-components/TextInput/TextInput'
import InfoBox from '~/ui-components/InfoBox'

export default function ManageSingleUser() {
  const { user, contributions } = useLoaderData<typeof loader>();
  const [ userType, setUserType ] = useState(user.userType.toString());
  const [ modNotes, setModNotes ] = useState(user.modNotes || '');
  const [ banReason, setBanReason ] = useState('');
  const [ banFlowActive, setBanFlowActive ] = useState(false);

  const userTypeOptions = [ "user", "admin", "moderator" ].map(c => ({
    value: c,
    text: c,
  }));

  function onUserTypeChanged(newType: string) {
    // TODO: Update user type on backend, toast success / error
    setUserType(newType);
  }

  function updateModNotes() {
    // TODO: Update mod notes on backend
  }

  function onBanUser() {
    // TODO: Submit ban note to backend
  }

  function unbanUser() {
    // TODO: Submit unban to backend
  }

  return (
    <>
      <h2 className="mb-2">User: {user.username}</h2>

      {user.isBanned && (
        <>
          <InfoBox variant="info">
            <h3>Banned user</h3>
            <p>User was banned WE_DONT_HAVE_BAN_TIME</p>
            <p>Reason: {user.banReason}</p>
            <Button className="mt-8" text="Unban" onClick={unbanUser}/>
          </InfoBox>
          <br/>
        </>
      )}

      <h3>General user info</h3>
      <p>Member since: {user.createdTime}</p>
      <p>Email: {user.email}</p>
      <p>Last action: WE DO NOT HAVE THIS DATA</p>

      <Select
        className="mt-4"
        onChange={onUserTypeChanged}
        options={userTypeOptions}
        name="role"
        title="Role"
        value={userType}
      />

      <Textarea
        className="mt-8 max-w-lg"
        value={modNotes}
        onChange={setModNotes}
        label="Mod notes"
        name="modNotes"
      />
      <Button
        className="mt-4"
        text="Update notes"
        onClick={updateModNotes}
      />

      {banFlowActive ? (
        <>
          <h3 className="mt-8">Ban user</h3>
          <TextInput
            value={banReason}
            onChange={setBanReason}
            label="Ban reason"
            name="banReason"
            className="max-w-lg"
          />
          <div className="flex flex-row mt-4">
            <Button
              text="Cancel"
              onClick={() => setBanFlowActive(false)}
              variant="outlined"
              color="error"
              className="mr-2"
            />
            <Button
              text="Ban user"
              onClick={onBanUser}
              color="error"
              disabled={banReason.length === 0}
            />
          </div>
        </>
      ) : (
        <Button
          text="Ban user"
          onClick={() => setBanFlowActive(true)}
          color="error"
          className="mt-8"
        />
      )}

      <br/>

      <h3>Contributions</h3>
      {contributions.length > 0 && (
        <Table horizontalScroll={true} className="mx-auto mt-8">
          <TableHeadRow isTableMaxHeight={false}>
            <TableCell>Contribution</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Points</TableCell>
            <TableCell>Mod comment</TableCell>
            <TableCell>Contribution Details</TableCell>
          </TableHeadRow>
          <TableBody>
            {contributions.map((contribution, index) => (
              <TableRow
                key={contribution.comicName + index}
                className="border-b border-gray-800 dark:border-gray-500"
              >
                <TableCell>
                  <p className="font-extralight">{getContributionName(contribution)}</p>
                </TableCell>
                <TableCell>
                  <p
                    className={`${getContributionStatusColor(
                      contribution.status
                    )} font-extralight`}
                  >
                    {capitalizeString(contribution.status)}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-extralight">{getDate(contribution.timestamp)}</p>
                </TableCell>
                <TableCell>
                  <p className="font-semibold">{contribution.points || '-'}</p>
                  <p className="font-extralight">{contribution.pointsDescription}</p>
                </TableCell>
                <TableCell>
                  <p className="font-extralight">{contribution.modComment || '-'}</p>
                </TableCell>
                <TableCell>
                  <p className="font-extralight">
                    {getContributionDetails(contribution)}
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {contributions.length === 0 && (
        <p>User has no contributions yet.</p>
      )}
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotMod(args);
  const { contributions } = await contributionLoader(args);

  const userIdParam = args.params.user as string;
  const userId = parseInt(userIdParam);

  const userRes = await getUserById(args.context.DB, userId);

  if (userRes.err) {
    return processApiError('Error getting user for admin>users', userRes.err);
  }

  return { user: userRes.result, contributions };
}
