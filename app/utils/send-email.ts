import { EMAIL_ENDPOINT } from '~/types/constants';
import type { ApiError } from './request-helpers';

type PostmarkEmail = {
  To: string;
  From: string;
  Subject: string;
  HtmlBody: string;
  MessageStream: string;
};

enum EmailAccountSenders {
  account = 'account',
  advertising = 'advertising',
}

export async function sendEmail(
  email: PostmarkEmail,
  postmarkToken: string
): Promise<ApiError | undefined> {
  const res = await fetch(EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': postmarkToken,
    },
    body: JSON.stringify(email),
  });

  if (res.ok) return;

  return {
    logMessage: `Error sending email: ${res.status} - ${res.statusText}`,
    context: email,
  };
}

export function createWelcomeEmail(username: string, recipient: string): PostmarkEmail {
  const html = `
    <p>
      Your account on <a href="https://yiffer.xyz">Yiffer.xyz</a> has successfully been created.
      We are happy to have you, <strong>${username}</strong>!
    </p>
    <p>Regards, Yiffer.xyz</p>
  `;
  return {
    To: recipient,
    From: `${EmailAccountSenders.account}@yiffer.xyz`,
    Subject: 'Welcome to Yiffer.xyz!',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createPasswordResetEmail(
  resetToken: string,
  recipient: string,
  frontEndUrlBase: string
): PostmarkEmail {
  const html = `
    <p>
      You have requested a password reset for your account on Yiffer.xyz.
      If you did not request this, please change your password immediately.
    </p>
    <p>
      Click the following link to reset your password:<br/>
      <a href="${frontEndUrlBase}/reset-password/${resetToken}">${frontEndUrlBase}/reset-password/${resetToken}</a>
    </p>
    <p>Regards, Yiffer.xyz</p>
  `;
  return {
    To: recipient,
    From: `${EmailAccountSenders.account}@yiffer.xyz`,
    Subject: 'Password reset - Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}
