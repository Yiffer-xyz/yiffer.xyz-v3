import { useLoaderData, useNavigate } from '@remix-run/react';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useState } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Button from '~/ui-components/Buttons/Button';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import Textarea from '~/ui-components/Textarea/Textarea';
import { redirectIfNotAdmin } from '~/utils/loaders';
import { getBlogById } from '~/route-funcs/get-blogs';
import { MdArrowBack, MdDelete } from 'react-icons/md';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const blogTitle = data?.blog?.title;
  return [{ title: `Mod: ${blogTitle} (blog) | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotAdmin(args);

  if (!args.params.id || isNaN(parseInt(args.params.id))) {
    return { blog: undefined };
  }

  const blogRes = await getBlogById(
    args.context.cloudflare.env.DB,
    parseInt(args.params.id)
  );

  if (blogRes.err) {
    return processApiError('Error in /admin/blogs/:id', blogRes.err);
  }
  if (!blogRes.result) {
    return { blog: undefined };
  }

  return { blog: blogRes.result };
}

export default function BlogManager() {
  const navigate = useNavigate();
  const { blog } = useLoaderData<typeof loader>();

  const [content, setContent] = useState(blog?.content ?? '');
  const [title, setTitle] = useState(blog?.title ?? '');

  const submitFetcher = useGoodFetcher({
    method: 'post',
    toastSuccessMessage: `Blog created`,
    toastError: true,
    onFinish: () => {
      navigate('/admin/blogs');
    },
  });

  const deleteFetcher = useGoodFetcher({
    method: 'post',
    url: `/api/admin/delete-blog`,
    toastSuccessMessage: `Blog deleted`,
    toastError: true,
    onFinish: () => {
      navigate('/admin/blogs');
    },
  });

  async function onSubmit() {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    await submitFetcher.awaitSubmit(formData);
  }

  async function onDelete() {
    deleteFetcher.awaitSubmit({
      id: blog?.id?.toString() ?? '',
    });
  }

  function onCancel() {
    navigate('/admin/blogs');
  }

  return (
    <div className="mt-2">
      <h2>Manage blog</h2>

      <TextInput
        label="Title"
        value={title}
        onChange={setTitle}
        className="max-w-xs mt-4"
      />

      <Textarea
        label="Blog text"
        value={content}
        onChange={setContent}
        name="blogText"
        className="mt-8 max-w-4xl"
      />

      <div className="flex flex-row gap-3">
        <Button
          text="Back"
          variant="outlined"
          onClick={onCancel}
          className="mt-4"
          startIcon={MdArrowBack}
        />

        <LoadingButton
          isLoading={false}
          text="Update blog"
          onClick={onSubmit}
          className="mt-4"
          disabled={content.length < 5 || title.length < 2}
        />
      </div>

      <LoadingButton
        isLoading={deleteFetcher.isLoading}
        text="Delete blog"
        color="error"
        onClick={onDelete}
        className="mt-4"
        startIcon={MdDelete}
      />
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotAdmin(args);

  const data = await args.request.formData();
  const title = data.get('title');
  const content = data.get('content');
  const id = args.params.id;

  if (!title) return create400Json('Title is required');
  if (!content) return create400Json('Blog text is required');

  const query = 'UPDATE blog SET title = ?, content = ? WHERE id = ?';
  const params = [title.toString(), content.toString(), id];

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    query,
    params,
    'Blog update'
  );
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating blog', {
      title: title.toString(),
      content: content.toString(),
    });
  }

  return createSuccessJson();
}
