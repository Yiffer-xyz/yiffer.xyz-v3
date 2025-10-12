import { useState } from 'react';
import { MdCheck, MdClose } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import TextInput from '~/ui-components/TextInput/TextInput';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import posthog from 'posthog-js';

export default function ChangeAccountData({
  isChangingPassword,
  isChangingEmail,
  isChangingUsername,
  onDone,
}: {
  isChangingPassword: boolean;
  isChangingEmail: boolean;
  isChangingUsername: boolean;
  onDone: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');

  const submitPasswordFetcher = useGoodFetcher({
    url: '/api/change-password',
    method: 'POST',
    toastError: false,
    toastSuccessMessage: 'Password changed',
    onFinish: onDone,
  });

  const submitEmailFetcher = useGoodFetcher({
    url: '/api/change-email',
    method: 'POST',
    toastError: false,
    toastSuccessMessage: 'Email changed',
    onFinish: onDone,
  });

  const submitUsernameFetcher = useGoodFetcher({
    url: '/api/change-username',
    method: 'POST',
    toastError: false,
    toastSuccessMessage: 'Username changed',
    onFinish: onDone,
  });

  async function submitPasswordChange() {
    if (submitPasswordFetcher.isLoading) return;

    posthog.capture('Password changed');

    submitPasswordFetcher.submit({
      currentPassword,
      newPassword,
      newPassword2,
    });
  }

  async function submitEmailChange() {
    if (submitEmailFetcher.isLoading) return;

    posthog.capture('Email changed');

    submitEmailFetcher.submit({
      currentPassword,
      newEmail,
    });
  }

  async function submitUsernameChange() {
    if (submitUsernameFetcher.isLoading) return;

    posthog.capture('Username changed');

    submitUsernameFetcher.submit({
      currentPassword,
      newUsername,
    });
  }

  function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (isChangingPassword) submitPasswordChange();
    else if (isChangingEmail) submitEmailChange();
    else if (isChangingUsername) submitUsernameChange();
  }

  const isChangingSomething = isChangingPassword || isChangingEmail || isChangingUsername;
  const isError =
    submitPasswordFetcher.isError ||
    submitEmailFetcher.isError ||
    submitUsernameFetcher.isError;
  const formHeader = isChangingSomething
    ? isChangingPassword
      ? 'Change password'
      : isChangingEmail
        ? 'Change email'
        : 'Change username'
    : '';

  if (!isChangingSomething) {
    return null;
  }

  return (
    <div className="mt-4">
      <TopGradientBox
        containerClassName="mt-2 w-full sm:w-[400px]"
        innerClassName="px-4 pb-4 pt-2"
      >
        <h3>{formHeader}</h3>

        {isChangingEmail && (
          <p className="text-sm">
            A verification link will be sent to the new email address.
          </p>
        )}

        <form onSubmit={onSubmit} onSubmitCapture={onSubmit}>
          {isChangingPassword && (
            <>
              <TextInput
                type="password"
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                name="current-password"
                className="mt-2"
              />
              <TextInput
                type="password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                name="new-password"
                className="mt-8"
              />

              <TextInput
                type="password"
                label="Confirm new password"
                value={newPassword2}
                onChange={setNewPassword2}
                name="new-password-again"
                className="mt-8"
              />
            </>
          )}

          {isChangingEmail && (
            <TextInput
              label="New email"
              value={newEmail}
              onChange={setNewEmail}
              className="mt-2"
            />
          )}

          {isChangingUsername && (
            <TextInput
              label="New username"
              value={newUsername}
              onChange={setNewUsername}
              className="mt-2"
            />
          )}

          {(isChangingEmail || isChangingUsername) && (
            <TextInput
              type="password"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              name="current-password"
              className="mt-8"
            />
          )}

          {isError && (
            <InfoBox
              variant="error"
              text={
                submitPasswordFetcher.errorMessage ||
                submitEmailFetcher.errorMessage ||
                submitUsernameFetcher.errorMessage
              }
              className="mt-4"
              disableElevation
            />
          )}

          <div className="flex gap-4 mt-8 justify-end">
            <Button
              text="Cancel"
              variant="outlined"
              onClick={onDone}
              startIcon={MdClose}
            />

            <LoadingButton
              text="Submit"
              startIcon={MdCheck}
              onClick={() => onSubmit()}
              isSubmit
              isLoading={
                isChangingPassword
                  ? submitPasswordFetcher.isLoading
                  : isChangingEmail
                    ? submitEmailFetcher.isLoading
                    : submitUsernameFetcher.isLoading
              }
            />
          </div>
        </form>
      </TopGradientBox>
    </div>
  );
}
