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

const emailEndpoint = 'https://api.postmarkapp.com/email';

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

export async function sendEmail(email: PostmarkEmail, postmarkToken: string) {
  await fetch(emailEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': postmarkToken,
    },
    body: JSON.stringify(email),
  });
}
