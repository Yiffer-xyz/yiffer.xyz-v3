import { useNavigate, useSearchParams } from '@remix-run/react';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useState } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Button from '~/ui-components/Buttons/Button';
import { create400Json, createSuccessJson, makeDbErr } from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Textarea from '~/ui-components/Textarea/Textarea';
import { redirectIfNotAdmin } from '~/utils/loaders';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: New blog | Yiffer.xyz` }];
};

export default function NewBlog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const isModMessage = type === 'mod-message';

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const submitFetcher = useGoodFetcher({
    method: 'post',
    toastSuccessMessage: `Blog created`,
    toastError: true,
    onFinish: () => {
      navigate('/admin/blogs');
    },
  });

  async function onSubmit() {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('type', isModMessage ? 'mod-message' : 'blog');
    await submitFetcher.awaitSubmit(formData);
  }

  function onCancel() {
    navigate('/admin/blogs');
  }

  return (
    <div className="mt-2">
      <h2>{isModMessage ? 'New mod message' : 'New blog'}</h2>

      <TextInput
        label="Title"
        value={title}
        onChange={setTitle}
        className="max-w-xs mt-4"
      />

      <Textarea
        label={isModMessage ? 'Message' : 'Blog text'}
        value={content}
        onChange={setContent}
        name="blogText"
        className="mt-8 max-w-4xl"
      />

      <div className="flex flex-row gap-3">
        <Button text="Cancel" variant="outlined" onClick={onCancel} className="mt-4" />

        <LoadingButton
          isLoading={false}
          text={isModMessage ? 'Create message' : 'Create blog'}
          onClick={onSubmit}
          className="mt-4"
          disabled={content.length < 5 || title.length < 2}
        />
      </div>
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotAdmin(args);

  const data = await args.request.formData();
  const title = data.get('title');
  const content = data.get('content');
  const type = data.get('type');

  if (!title) return create400Json('Title is required');
  if (!content) return create400Json('Blog text is required');

  const isModMessage = type?.toString() === 'mod-message';

  const query = isModMessage
    ? 'INSERT INTO modmessage (title, message) VALUES (?, ?)'
    : 'INSERT INTO blog (title, content, author) VALUES (?, ?, ?)';
  const params = isModMessage
    ? [title.toString(), content.toString()]
    : [title.toString(), content.toString(), user.userId];

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    query,
    params,
    isModMessage ? 'Mod message creation' : 'Blog creation'
  );
  if (dbRes.isError) {
    return makeDbErr(
      dbRes,
      isModMessage ? 'Error creating mod message' : 'Error creating blog',
      {
        title: title.toString(),
        content: content.toString(),
      }
    );
  }

  return createSuccessJson();
}
