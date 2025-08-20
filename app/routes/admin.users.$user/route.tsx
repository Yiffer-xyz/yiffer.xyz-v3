import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getUserByField } from '~/route-funcs/get-user';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ResultOrError, ResultOrNotFoundOrError } from '~/utils/request-helpers';
import { processApiError } from '~/utils/request-helpers';
import Select from '~/ui-components/Select/Select';
import { useState } from 'react';
import Textarea from '~/ui-components/Textarea/Textarea';
import Button from '~/ui-components/Buttons/Button';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { UpdateUserBody } from '~/routes/api.admin.update-user';
import type { Contribution, User, UserType, Feedback } from '~/types/types';
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
  const [banFlowActive, setBanFlowActive] = useState(false);
  const [mode, setMode] = useState<'edit' | 'change-photo' | 'view'>('view');
  const [isShowingComments, setIsShowingComments] = useState(false);

  const userTypeOptions = ['normal', 'admin', 'moderator'].map(c => ({
    value: c as UserType,
    text: capitalizeString(c),
  }));

  const updateUserFetcher = useGoodFetcher({
    url: '/api/admin/update-user',
    method: 'post',
    toastSuccessMessage: 'User updated',
  });
  const banUserFetcher = useGoodFetcher({
    url: '/api/admin/update-user',
    method: 'post',
    toastSuccessMessage: 'User banned',
  });
  const unbanUserFetcher = useGoodFetcher({
    url: '/api/admin/update-user',
    method: 'post',
    toastSuccessMessage: 'User unbanned',
  });

  function onUserTypeChanged(newType: UserType) {
    const body: UpdateUserBody = {
      userId: user.id,
      userType: newType,
    };

    updateUserFetcher.submit({ body: JSON.stringify(body) });

    setUserType(newType);
  }

  function updateModNotes() {
    const body: UpdateUserBody = {
      userId: user.id,
      modNotes,
    };

    updateUserFetcher.submit({ body: JSON.stringify(body) });
  }

  function onBanUser() {
    const body: UpdateUserBody = {
      userId: user.id,
      isBanned: true,
      banReason,
    };

    banUserFetcher.submit({ body: JSON.stringify(body) });

    setBanFlowActive(false);
  }

  function unbanUser() {
    const body: UpdateUserBody = {
      userId: user.id,
      isBanned: false,
      banReason: '',
    };

    unbanUserFetcher.submit({ body: JSON.stringify(body) });
  }

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

          <p>Email: {user.email}</p>
          {user.patreonEmail && <p>Patreon email: {user.patreonEmail}</p>}
          {user.lastActionTime && (
            <p>
              Last action: {getTimeAgo(user.lastActionTime)} (
              {format(user.lastActionTime, 'PPp')})
            </p>
          )}

          <Select
            className="mt-4"
            onChange={onUserTypeChanged}
            options={userTypeOptions}
            name="role"
            title="Role"
            value={userType}
            disabled={!isAdmin}
          />

          <Textarea
            className="mt-8 max-w-lg"
            rows={2}
            value={modNotes}
            onChange={setModNotes}
            label="Mod notes"
            name="modNotes"
          />
          {modNotes !== user.modNotes && (
            <LoadingButton
              className="mt-1"
              text="Update notes"
              onClick={updateModNotes}
              isLoading={updateUserFetcher.isLoading}
            />
          )}

          {user.comments && user.comments.length > 0 && (
            <div className="mt-6">
              <h3>{user.comments.length} comic comments</h3>
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

          {!user.isBanned && (
            <>
              <h3 className="mt-6">Actions</h3>
              {banFlowActive ? (
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
                      onClick={() => setBanFlowActive(false)}
                      variant="outlined"
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
                <div className="flex flex-row gap-2 flex-wrap">
                  <Button
                    text="Ban user"
                    onClick={() => setBanFlowActive(true)}
                    color="error"
                  />
                </div>
              )}
            </>
          )}

          <div className="max-w-2xl mt-6">
            <h3>Feedback/support</h3>
            {feedback.length > 0 ? (
              <div className="flex flex-col gap-4">
                {feedback.map(fb => (
                  <FeedbackItem feedback={fb} key={fb.id} />
                ))}
              </div>
            ) : (
              <p>User has not submitted any feedback/support.</p>
            )}
          </div>

          <div className="max-w-4xl mt-6">
            <h3>Contributions</h3>
            {contributions.length > 0 ? (
              <Contributions contributions={contributions} className="mt-2 md:mt-1" />
            ) : (
              <p>User has no contributions yet.</p>
            )}
          </div>
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
