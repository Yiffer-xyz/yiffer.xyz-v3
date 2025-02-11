import { ADVERTISEMENTS, EMAIL_ENDPOINT } from '~/types/constants';
import type { ApiError } from './request-helpers';
import type { AdType } from '~/types/types';

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
    Subject: 'Password reset | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createEmailChangeEmail(
  emailCode: string,
  recipient: string,
  frontEndUrlBase: string
): PostmarkEmail {
  const html = `
    <p>
      You have requested an email change for your account on Yiffer.xyz.
    </p>
    <p>
      Click the following link to change your email:<br/>
      <a href="${frontEndUrlBase}/change-email/${emailCode}">${frontEndUrlBase}/change-email/${emailCode}</a>
    </p>
    <p>Regards, Yiffer.xyz</p>
  `;
  return {
    To: recipient,
    From: `${EmailAccountSenders.account}@yiffer.xyz`,
    Subject: 'Email change | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createModActiveAdChangedEmail({
  adName,
  adType,
  adOwnerName,
  adId,
  changedText,
  frontEndUrlBase,
}: {
  adName: string;
  adType: AdType;
  adOwnerName: string;
  adId: string;
  changedText: string;
  frontEndUrlBase: string;
}) {
  const html = `
    <p>An ad of type <strong>${adType}</strong> has been edited while active.</p>
    <p>Ad name: ${adName}</p>
    <p>Ad ID: ${adId}</p>
    <p>Owner: ${adOwnerName}</p>
    <p><a href="${frontEndUrlBase}/admin/advertising/${adId}">View in admin panel</a></p>
    <p>Changes: <b>${changedText}</b></p>
  `;

  return {
    To: 'advertising@yiffer.xyz',
    From: 'advertising@yiffer.xyz',
    Subject: 'Active ad changed | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createModNewAdEmail({
  adName,
  adType,
  adOwnerName,
  adId,
  frontEndUrlBase,
}: {
  adName: string;
  adType: AdType;
  adOwnerName: string;
  adId: string;
  frontEndUrlBase: string;
}) {
  const html = `
    <p>A new ad of type <strong>${adType}</strong> has been created.</p>
    <p>Ad name: ${adName}</p>
    <p>Ad ID: ${adId}</p>
    <p>Owner: ${adOwnerName}</p>
    <p><a href="${frontEndUrlBase}/admin/advertising/${adId}">View in admin panel</a></p>
  `;

  return {
    To: 'advertising@yiffer.xyz',
    From: 'advertising@yiffer.xyz',
    Subject: 'New ad | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createModCorrectionAdEditedEmail({
  adName,
  adId,
  adType,
  adOwnerName,
  frontEndUrlBase,
}: {
  adName: string;
  adId: string;
  adType: AdType;
  adOwnerName: string;
  frontEndUrlBase: string;
}) {
  const html = `
    <p>An ad of type <strong>${adType}</strong> marked as needing correction has been edited.</p>
    <p>Ad name: ${adName}</p>
    <p>Ad ID: ${adId}</p>
    <p>Owner: ${adOwnerName}</p>
    <p><a href="${frontEndUrlBase}/admin/advertising/${adId}">View in admin panel</a></p>
  `;

  return {
    To: 'advertising@yiffer.xyz',
    From: 'advertising@yiffer.xyz',
    Subject: 'Correction ad edited | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createModEndedAdEditedEmail({
  adName,
  adId,
  adType,
  adOwnerName,
  frontEndUrlBase,
}: {
  adName: string;
  adId: string;
  adType: AdType;
  adOwnerName: string;
  frontEndUrlBase: string;
}) {
  const html = `
    <p>An ad of type <strong>${adType}</strong> marked as ended has been edited.</p>
    <p>Ad name: ${adName}</p>
    <p>Ad ID: ${adId}</p>
    <p>Owner: ${adOwnerName}</p>
    <p><a href="${frontEndUrlBase}/admin/advertising/${adId}">View in admin panel</a></p>
  `;

  return {
    To: 'advertising@yiffer.xyz',
    From: 'advertising@yiffer.xyz',
    Subject: 'Ended ad edited | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createModAdExpiredEmail({
  adName,
  adId,
  adType,
  adOwnerName,
  frontEndUrlBase,
}: {
  adName: string;
  adId: string;
  adType: AdType;
  adOwnerName: string;
  frontEndUrlBase: string;
}) {
  const html = `
    <p>An ad of type <strong>${adType}</strong> has expired.</p>
    <p>Ad name: ${adName}</p>
    <p>Ad ID: ${adId}</p>
    <p>Owner: ${adOwnerName}</p>
    <p><a href="${frontEndUrlBase}/admin/advertising/${adId}">View in admin panel</a></p>
  `;

  return {
    To: 'advertising@yiffer.xyz',
    From: 'advertising@yiffer.xyz',
    Subject: 'Ad expired | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createNotifyUserNewAdEmail({
  adName,
  adId,
  adType,
  recipientEmail,
  frontEndUrlBase,
}: {
  adName: string;
  adId: string;
  adType: AdType;
  recipientEmail: string;
  frontEndUrlBase: string;
}) {
  const html = `
    <p>A new ad of type <strong>${adType}</strong> has been created.</p>
    <p>Ad name: ${adName}</p>
    <p>Ad ID: ${adId}</p>
    <p><a href="${frontEndUrlBase}/advertising/dashboard/${adId}">View in advertising dashboard</a></p>

    <p style="margin-top: 1rem;">
      Your ad is currently pending approval. Once it is approved, you will receive an email with payment instructions.
    </p>

    <p style="margin-top: 1rem;">Regards,<br/> Yiffer.xyz</p>
  `;

  return {
    To: recipientEmail,
    From: 'advertising@yiffer.xyz',
    Subject: 'New ad | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createNotifyUserAdReadyForPaymentEmail({
  adName,
  adId,
  adType,
  recipientEmail,
  frontEndUrlBase,
}: {
  adName: string;
  adId: string;
  adType: AdType;
  recipientEmail: string;
  frontEndUrlBase: string;
}) {
  const prices = ADVERTISEMENTS.find(a => a.name === adType)?.pricesForMonths;
  if (!prices) throw new Error('No prices found for ad type');

  const html = `
    <p>Your ad <strong>${adName}</strong> has been approved and is ready for payment.</p>
    <p>Ad ID: <b>${adId}</b></p>
    <p><a href="${frontEndUrlBase}/advertising/dashboard/${adId}">View in advertising dashboard</a></p>

    <p style="margin-top: 1rem;">Payment is made via Paypal. <b>Make sure to include the ad ID in the payment description!</b></p>
    <p>Send the payment to <b>advertising@yiffer.xyz</b> on Paypal, or use the quick link at <a href="https://www.paypal.com/paypalme/yifferadvertising">paypal.me/yifferadvertising</a>.</p>
    <p>You can pay <b>$${prices[1]}</b> for 1 month, <b>$${prices[4]}</b> for 4 months, or <b>$${prices[12]}</b> for 12 months.</p>

    <p style="margin-top: 1rem;">Once we receive your payment, we will <b>manually activate your ad</b>. This usually takes up to 2 days. You will receive an email once your ad is active.</p>

    <p style="margin-top: 1rem;">
      If you have multiple ads pending payment, you can pay for all of them at once in a single Paypal transaction, as long as you include all ad IDs in the Paypal description.
    </p>

    <p style="margin-top: 1rem;">Regards,<br/> Yiffer.xyz</p>
  `;

  return {
    To: recipientEmail,
    From: 'advertising@yiffer.xyz',
    Subject: 'Ad ready for payment | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createNotifyUserAdActiveEmail({
  adName,
  adId,
  expiryDate,
  recipientEmail,
  frontEndUrlBase,
}: {
  adName: string;
  adId: string;
  expiryDate: string;
  recipientEmail: string;
  frontEndUrlBase: string;
}) {
  const html = `
    <p>Your ad <strong>${adName}</strong> has been activated. It will expire ${expiryDate}.</p>
    <p>Ad ID: <b>${adId}</b></p>
    <p><a href="${frontEndUrlBase}/advertising/dashboard/${adId}">View in advertising dashboard</a></p>
    <p style="margin-top: 1rem;">Regards,<br/> Yiffer.xyz</p>
  `;

  return {
    To: recipientEmail,
    From: 'advertising@yiffer.xyz',
    Subject: 'Ad activated | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createNotifyUserAdNeedsCorrectionEmail({
  adName,
  adId,
  correctionNote,
  recipientEmail,
  frontEndUrlBase,
}: {
  adName: string;
  adId: string;
  correctionNote: string;
  recipientEmail: string;
  frontEndUrlBase: string;
}) {
  const html = `
    <p>Your ad <strong>${adName}</strong> has been marked as needing correction.</p>
    <p>Ad ID: <b>${adId}</b></p>
    <p>Correction note: <b>${correctionNote}</b></p>
    <p><a href="${frontEndUrlBase}/advertising/dashboard/${adId}">View in advertising dashboard</a></p>
    <p style="margin-top: 1rem;">Regards,<br/> Yiffer.xyz</p>
  `;

  return {
    To: recipientEmail,
    From: 'advertising@yiffer.xyz',
    Subject: 'Ad needs correction | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}

export function createNotifyUserAdExpiredEmail({
  adName,
  adId,
  adType,
  recipientEmail,
  frontEndUrlBase,
}: {
  adName: string;
  adId: string;
  adType: AdType;
  recipientEmail: string;
  frontEndUrlBase: string;
}) {
  const prices = ADVERTISEMENTS.find(a => a.name === adType)?.pricesForMonths;
  if (!prices) throw new Error('No prices found for ad type');

  const html = `
    <p>Your ad <strong>${adName}</strong> has expired.</p>
    <p>Ad ID: <b>${adId}</b></p>
    <p><a href="${frontEndUrlBase}/advertising/dashboard/${adId}">View in advertising dashboard</a></p>

    <p style="margin-top: 1rem;">
      You can renew your ad at any time:
    </p>
    <p style="margin-top: 1rem;">Payment is made via Paypal. <b>Make sure to include the ad ID in the payment description!</b></p>
    <p>Send the payment to <b>advertising@yiffer.xyz</b> on Paypal, or use the quick link at <a href="https://www.paypal.com/paypalme/yifferadvertising">paypal.me/yifferadvertising</a>.</p>
    <p>You can pay <b>$${prices[1]}</b> for 1 month, <b>$${prices[4]}</b> for 4 months, or <b>$${prices[12]}</b> for 12 months.</p>

    <p style="margin-top: 1rem;">Once we receive your renewal payment, we will <b>manually activate your ad</b>. This usually takes up to 2 days. You will receive an email once your ad is active.</p>

    <p style="margin-top: 1rem;">You can also make changes to your ad before renewing, via the link above. It will then enter the PENDING state, and you will receive a follow-up email about payment.</p>

    <p style="margin-top: 1rem;">Regards,<br/> Yiffer.xyz</p>
  `;

  return {
    To: recipientEmail,
    From: 'advertising@yiffer.xyz',
    Subject: 'Ad expired | Yiffer.xyz',
    HtmlBody: html,
    MessageStream: 'outbound',
  };
}
