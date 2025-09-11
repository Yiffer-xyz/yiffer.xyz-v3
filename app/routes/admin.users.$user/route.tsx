import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getUserByField } from '~/route-funcs/get-user';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ResultOrError, ResultOrNotFoundOrError } from '~/utils/request-helpers';
import { processApiError } from '~/utils/request-helpers';
import Select from '~/ui-components/Select/Select';
import { useMemo, useState } from 'react';
import Textarea from '~/ui-components/Textarea/Textarea';
import Button from '~/ui-components/Buttons/Button';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { UpdateUserBody } from '~/routes/api.admin.update-user';
import type {
  Contribution,
  User,
  UserType,
  Feedback,
  UserRestrictionType,
} from '~/types/types';
import { format } from 'date-fns';
import { Contributions } from '~/page-components/Contributions/Contributions';
import { getTimeAgo } from '~/utils/date-utils';
import { capitalizeString } from '~/utils/general';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { getContributions } from '~/route-funcs/get-contributions';
import { getFeedback } from '~/route-funcs/get-feedback';
import FeedbackItem from '~/page-components/UserFeedback/FeedbackItem';
import PublicProfile from '~/ui-components/PublicProfile/PublicProfile';
import PublicProfilePhotoEditor from '~/ui-components/PublicProfile/PublicProfilePhotoEditor';
import PublicProfileEdit from '~/ui-components/PublicProfile/PublicProfileEdit';
import SingleComment from '~/ui-components/Comments/SingleComment';
import RadioButtonGroup from '~/ui-components/RadioButton/RadioButtonGroup';
import InfoBox from '~/ui-components/InfoBox';
import type { ListButtonItem } from '~/ui-components/ListButtons/ListButtons';
import ListButtons from '~/ui-components/ListButtons/ListButtons';
import { MdEditDocument, MdEmail } from 'react-icons/md';
import { FaPatreon, FaSkull, FaUser } from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import { GoNoEntry } from 'react-icons/go';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const username = data?.user?.username;
  return [{ title: `Mod: ${username} (user) | Yiffer.xyz` }];
};

export default function ManageSingleUser() {
  const { user, contributions, feedback, pagesPath, imagesServerUrl, isAdmin } =
    useLoaderData<typeof loader>();

  const [userType, setUserType] = useState<UserType>(user.userType);
  const [modNotes, setModNotes] = useState(user.modNotes || '');
  const [banReason, setBanReason] = useState('');
  const [restrictionType, setRestrictionType] = useState<UserRestrictionType | null>(
    null
  );
  const [restrictionDuration, setRestrictionDuration] = useState<number | null>(null);
  const [mode, setMode] = useState<'edit' | 'change-photo' | 'view'>('view');
  const [isShowingComments, setIsShowingComments] = useState(false);

  const [activeFlow, setActiveFlow] = useState<
    null | 'restrict' | 'ban' | 'mod-comments' | 'user-type'
  >(null);

  const userTypeOptions = ['normal', 'admin', 'moderator'].map(c => ({
    value: c as UserType,
    text: capitalizeString(c),
  }));

  const updateUserFetcher = useGoodFetcher({
    url: '/api/admin/update-user',
    method: 'post',
    toastSuccessMessage: 'User updated',
    onFinish: () => setActiveFlow(null),
  });
  const banUserFetcher = useGoodFetcher({
    url: '/api/admin/update-user',
    method: 'post',
    toastSuccessMessage: 'User banned',
    onFinish: () => {
      setActiveFlow(null);
    },
  });
  const unbanUserFetcher = useGoodFetcher({
    url: '/api/admin/update-user',
    method: 'post',
    toastSuccessMessage: 'User unbanned',
  });
  const restrictUserFetcher = useGoodFetcher({
    url: '/api/admin/restrict-user',
    method: 'post',
    toastSuccessMessage: 'User restricted',
    onFinish: () => {
      setRestrictionType(null);
      setRestrictionDuration(null);
      setActiveFlow(null);
    },
  });

  function submitUserTypeChange() {
    const body: UpdateUserBody = {
      userId: user.id,
      userType,
    };

    updateUserFetcher.submit({ body: JSON.stringify(body) });

    setUserType(userType);
  }

  function updateModNotes() {
    const body: UpdateUserBody = {
      userId: user.id,
      modNotes,
    };

    updateUserFetcher.submit({ body: JSON.stringify(body) });
  }

  function onRestrictUser() {
    restrictUserFetcher.submit({
      restrictionType,
      durationDays: restrictionDuration,
      userId: user.id,
    });
  }

  function onBanUser() {
    const body: UpdateUserBody = {
      userId: user.id,
      isBanned: true,
      banReason,
    };

    banUserFetcher.submit({ body: JSON.stringify(body) });
  }

  function unbanUser() {
    const body: UpdateUserBody = {
      userId: user.id,
      isBanned: false,
      banReason: '',
    };

    unbanUserFetcher.submit({ body: JSON.stringify(body) });
  }

  const listButtonItems = useMemo(() => {
    const buttons: ListButtonItem[] = [
      { title: 'Email', text: user.email, Icon: MdEmail },
    ];
    if (user.patreonEmail) {
      buttons.push({ title: 'Patreon email', text: user.patreonEmail, Icon: FaPatreon });
    }
    if (user.lastActionTime) {
      buttons.push({
        title: 'Last action',
        text: `${getTimeAgo(user.lastActionTime)} (${format(user.lastActionTime, 'PPp')})`,
        Icon: IoMdTime,
      });
    }
    buttons.push({
      title: 'User type',
      text: capitalizeString(user.userType),
      Icon: FaUser,
      onClick: isAdmin ? () => setActiveFlow('user-type') : undefined,
    });
    buttons.push({
      title: 'Mod notes',
      text: user.modNotes ?? '-',
      Icon: MdEditDocument,
      onClick: () => setActiveFlow('mod-comments'),
      canVaryHeight: true,
    });
    buttons.push({
      text: 'Restrict user',
      Icon: GoNoEntry,
      onClick: () => setActiveFlow('restrict'),
      color: 'error',
    });
    buttons.push({
      Icon: FaSkull,
      text: user.isBanned ? 'Unban user' : 'Ban user',
      color: 'error',
      onClick: () => {
        if (user.isBanned) unbanUser();
        else setActiveFlow('ban');
      },
    });

    return buttons;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      {mode === 'view' && (
        <PublicProfile
          user={user}
          canEdit
          onChangePhoto={() => setMode('change-photo')}
          onEdit={() => setMode('edit')}
          pagesPath={pagesPath}
          isAdminPanel
          className="mb-4"
          isLoggedIn
          showModLinkType="public-profile"
        />
      )}
      {mode === 'edit' && (
        <PublicProfileEdit user={user} onFinish={() => setMode('view')} />
      )}
      {mode === 'change-photo' && (
        <PublicProfilePhotoEditor
          imagesServerUrl={imagesServerUrl}
          onFinish={() => setMode('view')}
          adminOverrideUserId={user.id}
          hasExistingPhoto={!!user.profilePictureToken}
        />
      )}

      {mode === 'view' && (
        <>
          {user.isBanned && (
            <div className="bg-red-trans p-4 pt-3 mt-1 mb-3 w-fit min-w-[280px]">
              <h3>Banned user</h3>
              <p>User was banned: {user.banTime ? format(user.banTime, 'PPp') : 'N/A'}</p>
              <p>Reason: {user.banReason}</p>
              <Button className="mt-2" text="Unban" onClick={unbanUser} />
            </div>
          )}

          {user.restrictions && user.restrictions.length > 0 && (
            <div className="bg-red-trans p-4 pt-3 mt-1 mb-3 w-fit min-w-[280px]">
              <h3>Restricted user</h3>
              <ul>
                {user.restrictions.map(restriction => (
                  <li key={restriction.id}>
                    <b>{capitalizeString(restriction.restrictionType)}</b>:{' '}
                    {format(restriction.startDate, 'PP')} -{' '}
                    {format(restriction.endDate, 'PP')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h3 className="mb-1">User info and actions</h3>

          {activeFlow === null && <ListButtons items={listButtonItems} />}

          {activeFlow === 'ban' && (
            <>
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
                  onClick={() => setActiveFlow(null)}
                  variant="outlined"
                  className="mr-2"
                />
                <LoadingButton
                  isLoading={banUserFetcher.isLoading}
                  text="Ban user"
                  onClick={onBanUser}
                  color="error"
                  disabled={banReason.length === 0}
                />
              </div>
            </>
          )}

          {activeFlow === 'restrict' && (
            <>
              <h4>Restrict user</h4>
              <RadioButtonGroup
                name="restrictionType"
                direction="horizontal"
                className="mt-2"
                options={['chat', 'contribute', 'comment'].map(type => ({
                  value: type as UserRestrictionType,
                  text: capitalizeString(type),
                }))}
                onChange={setRestrictionType}
                value={restrictionType}
              />
              <RadioButtonGroup
                name="restrictionDuration"
                direction="horizontal"
                className="mt-4"
                title="Duration"
                options={[
                  { text: '1 month', value: 30 },
                  { text: '6 months', value: 180 },
                  { text: '1 year', value: 365 },
                ]}
                onChange={setRestrictionDuration}
                value={restrictionDuration}
              />

              <InfoBox
                variant="info"
                boldText={false}
                fitWidth
                small
                disableElevation
                showIcon
                text="The user should be sent a system message informing them of the restriction."
                className="mt-4"
              />

              <div className="flex flex-row mt-4">
                <Button
                  text="Cancel"
                  onClick={() => {
                    setRestrictionType(null);
                    setRestrictionDuration(null);
                    setActiveFlow(null);
                  }}
                  variant="outlined"
                  className="mr-2"
                />
                <LoadingButton
                  isLoading={restrictUserFetcher.isLoading}
                  text="Restrict user"
                  onClick={onRestrictUser}
                  color="error"
                  disabled={restrictionType === null || restrictionDuration === null}
                />
              </div>
            </>
          )}

          {activeFlow === 'user-type' && (
            <>
              <Select
                onChange={v => setUserType(v)}
                options={userTypeOptions}
                name="role"
                title="Role"
                value={userType}
                disabled={!isAdmin}
              />
              <div className="flex flex-row gap-2 mt-4">
                <Button
                  text="Cancel"
                  onClick={() => setActiveFlow(null)}
                  variant="outlined"
                />
                <LoadingButton
                  text="Submit"
                  disabled={user.userType === userType}
                  isLoading={updateUserFetcher.isLoading}
                  onClick={submitUserTypeChange}
                />
              </div>
            </>
          )}

          {activeFlow === 'mod-comments' && (
            <>
              <Textarea
                className="max-w-lg"
                rows={2}
                value={modNotes}
                onChange={setModNotes}
                label="Mod notes"
                name="modNotes"
              />
              <div className="flex flex-row gap-2 mt-4">
                <Button
                  text="Cancel"
                  onClick={() => setActiveFlow(null)}
                  variant="outlined"
                />
                <LoadingButton
                  text="Save mod note"
                  onClick={updateModNotes}
                  isLoading={updateUserFetcher.isLoading}
                />
              </div>
            </>
          )}

          {user.comments && user.comments.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              <h3 className="-mb-2">{user.comments.length} comic comments</h3>
              {isShowingComments ? (
                user.comments.map(comment => (
                  <SingleComment
                    key={comment.id}
                    comment={comment}
                    pagesPath={pagesPath}
                    showLowScoreComments
                    isAdminPanel
                    isLoggedIn
                  />
                ))
              ) : (
                <Button text="Show comments" onClick={() => setIsShowingComments(true)} />
              )}
            </div>
          )}

          {feedback.length > 0 && (
            <div className="max-w-2xl mt-6">
              <h3>Feedback/support</h3>
              <div className="flex flex-col gap-4">
                {feedback.map(fb => (
                  <FeedbackItem feedback={fb} key={fb.id} />
                ))}
              </div>
            </div>
          )}

          {contributions.length > 0 && (
            <div className="max-w-4xl mt-6">
              <h3>Contributions</h3>
              <Contributions contributions={contributions} className="mt-2 md:mt-1" />
            </div>
          )}
        </>
      )}
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const { userType: loggedInUserType, userId: loggedInUserId } =
    await redirectIfNotMod(args);
  const db = args.context.cloudflare.env.DB;
  const userIdParam = args.params.user as string;
  const userId = parseInt(userIdParam);

  const userResPromise = getUserByField({
    db,
    field: 'id',
    value: userId,
    includeExtraFields: true,
    includeComments: true,
    includeRestrictions: true,
    currentUserId: loggedInUserId,
  });
  const contributionsResPromise = getContributions(db, userId);
  const feedbackResPromise = getFeedback({ db, userId });

  const responses: [
    ResultOrNotFoundOrError<User>,
    ResultOrError<Contribution[]>,
    ResultOrError<Feedback[]>,
  ] = await Promise.all([userResPromise, contributionsResPromise, feedbackResPromise]);

  responses.forEach(res => {
    if (res.err) {
      return processApiError('Error getting admin>users>user', res.err);
    }
  });

  const [userRes, contributionRes, feedbackRes] = responses as [
    { result: User },
    { result: Contribution[] },
    { result: Feedback[] },
  ];

  return {
    user: userRes.result,
    contributions: contributionRes.result,
    feedback: feedbackRes.result,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
    imagesServerUrl: args.context.cloudflare.env.IMAGES_SERVER_URL,
    isAdmin: loggedInUserType === 'admin',
  };
}
