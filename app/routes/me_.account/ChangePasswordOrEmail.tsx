import { useState } from 'react';
import { MdCheck, MdClose } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import TextInput from '~/ui-components/TextInput/TextInput';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import posthog from 'posthog-js';

export default function ChangePasswordOrEmail() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const submitPasswordFetcher = useGoodFetcher({
    url: '/api/change-password',
    method: 'post',
  });

  const submitEmailFetcher = useGoodFetcher({
    url: '/api/change-email',
    method: 'post',
  });

  function cancel() {
    setIsChangingPassword(false);
    setIsChangingEmail(false);
    setCurrentPassword('');
    setNewPassword('');
    setNewPassword2('');
    setNewEmail('');
  }

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

  if (!isChangingPassword && !isChangingEmail) {
    return (
      <div className="flex flex-row flex-wrap gap-4 mt-4">
        <Button text="Change password" onClick={() => setIsChangingPassword(true)} />
        <Button text="Change email" onClick={() => setIsChangingEmail(true)} />
      </div>
    );
  }

  if (submitPasswordFetcher.success) {
    return (
      <InfoBox
        variant="success"
        text="Password changed successfully"
        className="mt-4 w-full sm:w-fit"
      />
    );
  }

  if (submitEmailFetcher.success) {
    return (
      <InfoBox
        variant="success"
        text={`A verification link has been sent to ${newEmail.trim().toLowerCase()}.`}
        className="mt-4 w-full sm:w-fit"
        closable
        overrideOnCloseFunc={() => {
          cancel();
        }}
      />
    );
  }
  return (
    <div className="mt-4">
      <TopGradientBox
        containerClassName="mt-2 w-full sm:w-[400px]"
        innerClassName="px-4 pb-4 pt-2"
      >
        <h3>Change {isChangingPassword ? 'password' : 'email'}</h3>

        {isChangingEmail && (
          <p className="text-sm">
            A verification link will be sent to the new email address.
          </p>
        )}

        <form>
          <TextInput
            type="password"
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            name="current-password"
            className="mt-2"
          />

          {isChangingPassword && (
            <>
              <TextInput
                type="password"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                name="new-password"
                className="mt-10"
              />

              <TextInput
                type="password"
                label="Confirm new password"
                value={newPassword2}
                onChange={setNewPassword2}
                name="new-password-again"
                className="mt-10"
              />
            </>
          )}

          {isChangingEmail && (
            <TextInput
              label="New email"
              value={newEmail}
              onChange={setNewEmail}
              className="mt-10"
            />
          )}

          {(submitPasswordFetcher.isError || submitEmailFetcher.isError) && (
            <InfoBox
              variant="error"
              text={submitPasswordFetcher.errorMessage || submitEmailFetcher.errorMessage}
              className="mt-4"
              disableElevation
            />
          )}

          <div className="flex gap-4 mt-8 justify-end">
            <Button
              text="Cancel"
              variant="outlined"
              onClick={cancel}
              startIcon={MdClose}
            />

            <LoadingButton
              text="Submit"
              startIcon={MdCheck}
              onClick={isChangingPassword ? submitPasswordChange : submitEmailChange}
              isLoading={
                isChangingPassword
                  ? submitPasswordFetcher.isLoading
                  : submitEmailFetcher.isLoading
              }
            />
          </div>
        </form>
      </TopGradientBox>
    </div>
  );
}
