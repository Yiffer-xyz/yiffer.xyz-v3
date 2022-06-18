import { json, redirect } from '@remix-run/cloudflare';

export const action = async function ({ request }) {
  const reqBody = await request.formData();
  const { username, password } = Object.fromEntries(reqBody);
  console.log(username, password);

  try {
    console.log('HELLO IM RETURNING');
    return json({ username: username, userType: 'admin' });
  } catch (error) {
    return json({ error: error.message });
  }
};

const loader = function () {
  return redirect('/', { status: 404 });
};
