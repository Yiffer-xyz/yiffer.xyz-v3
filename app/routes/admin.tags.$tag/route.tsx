import { redirect, useLoaderData, useNavigate, useOutletContext } from '@remix-run/react';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { getTagById } from '~/route-funcs/get-tags';
import { capitalizeString } from '~/utils/general';
import { getComicNamesAndIDs } from '~/route-funcs/get-comics';
import ComicAdminLink from '~/ui-components/ComicAdminLink/ComicAdminLink';
import Button from '~/ui-components/Buttons/Button';
import { useState } from 'react';
import TextInput from '~/ui-components/TextInput/TextInput';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { queryDbExec, queryDbMultiple } from '~/utils/database-facade';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { MdArrowBack } from 'react-icons/md';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import type { GlobalAdminContext } from '../admin/route';
import Link from '~/ui-components/Link';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';
import { redirectIfNotMod } from '~/utils/loaders';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const tagName = data?.tag?.name;
  return [{ title: `Mod: ${tagName} (tag) | Yiffer.xyz` }];
};

export default function ManageTag() {
  const globalContext: GlobalAdminContext = useOutletContext();
  const blockActions = globalContext.numUnreadContent > 0;
  const navigate = useNavigate();
  const { tag, comics } = useLoaderData<typeof loader>();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newName, setNewName] = useState(tag.name + '');

  const deleteFetcher = useGoodFetcher({
    method: 'post',
    toastSuccessMessage: 'Tag deleted',
    onFinish: () => {
      navigate('/admin/tags');
    },
  });

  const updateFetcher = useGoodFetcher({
    method: 'post',
    toastSuccessMessage: 'Tag updated',
    onFinish: () => {
      setIsEditing(false);
    },
  });

  return (
    <>
      <h2 className="mt-2">{capitalizeString(tag.name)}</h2>

      {!isEditing && !isDeleting && (
        <>
          <div className="mb-2">
            <Link href="/admin/tags" text="Back" Icon={MdArrowBack} />
          </div>

          <div className="flex flex-row gap-3">
            <Button
              text="Edit tag"
              onClick={() => setIsEditing(true)}
              disabled={blockActions}
            />
            <Button
              text="Delete tag"
              onClick={() => setIsDeleting(true)}
              color="error"
              disabled={blockActions}
            />
          </div>
        </>
      )}

      {isEditing && (
        <>
          <TextInput
            label="New name"
            value={newName}
            onChange={setNewName}
            className="max-w-xs"
          />

          <div className="flex flex-row gap-3 mt-4">
            <Button
              text="Cancel"
              onClick={() => {
                setIsEditing(false);
                setNewName(tag.name);
              }}
              variant="outlined"
            />
            <LoadingButton
              isLoading={updateFetcher.isLoading}
              text="Save changes"
              onClick={() => {
                const formData = new FormData();
                formData.append('newName', newName);
                updateFetcher.submit(formData);
              }}
              disabled={newName === tag.name}
            />
          </div>
        </>
      )}

      {isDeleting && (
        <>
          <p>Are you sure you want to delete this tag?</p>
          <div className="flex flex-row gap-3 mt-2">
            <Button text="No - keep tag" onClick={() => setIsDeleting(false)} />
            <LoadingButton
              isLoading={deleteFetcher.isLoading}
              text="Yes - delete tag"
              onClick={() => {
                const formData = new FormData();
                formData.append('isDeleting', 'true');
                deleteFetcher.submit(formData);
              }}
              color="error"
            />
          </div>
        </>
      )}

      <div className="mt-6">
        {comics.length > 0 ? (
          <>
            <h4>Comics with this tag</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2 mb-6">
              {comics.map(comic => (
                <ComicAdminLink comic={comic} key={comic.id} />
              ))}
            </div>
          </>
        ) : (
          <p>No comics found for this tag</p>
        )}
      </div>
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const tagParam = args.params.tag as string;
  const tagId = parseInt(tagParam);

  const tagRes = await getTagById(args.context.cloudflare.env.DB, tagId);

  if (tagRes.err) {
    return processApiError('Error getting tag for admin>tags', tagRes.err);
  }
  if (tagRes.notFound) {
    throw new Response('Tag not found', {
      status: 404,
    });
  }

  const comicsRes = await getComicNamesAndIDs(args.context.cloudflare.env.DB, {
    includeRejectedList: true,
    includeUnlisted: true,
    modifyNameIncludeType: true,
    tagIDFilter: tagId,
  });

  if (comicsRes.err) {
    return processApiError('Error getting comics for tag', comicsRes.err);
  }

  return {
    tag: tagRes.result,
    comics: comicsRes.result,
  };
}

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const data = await args.request.formData();
  const tagId = parseInt(args.params.tag as string);
  const formNewName = data.get('newName');
  const formIsDeleting = data.get('isDeleting');
  const isDeleting = formIsDeleting && formIsDeleting === 'true';

  const fullTagRes = await getTagById(args.context.cloudflare.env.DB, tagId);
  if (fullTagRes.err) {
    return processApiError('Error getting tag when editing/deleting', fullTagRes.err);
  }
  if (fullTagRes.notFound) {
    return create400Json('Tag not found');
  }
  const fullTag = fullTagRes.result;

  if (isDeleting) {
    const deleteTagLinkQuery = 'DELETE FROM comicKeyword WHERE keywordId = ?';
    const deleteTagQuery = 'DELETE FROM keyword WHERE id = ?';
    const params = [tagId];
    const dbRes = await queryDbMultiple(args.context.cloudflare.env.DB, [
      { query: deleteTagLinkQuery, params },
      { query: deleteTagQuery, params },
    ]);
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error deleting tag', { tagId });
    }

    return redirect(`/admin/tags`);
  }

  if (formNewName) {
    const fixedName = formNewName.toString().trim().toLowerCase();
    const query = 'UPDATE keyword SET keywordName = ? WHERE id = ?';
    const params = [fixedName, tagId];
    const dbRes = await queryDbExec(
      args.context.cloudflare.env.DB,
      query,
      params,
      'Tag name update'
    );
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error updating tag name', { formNewName });
    }
  }

  let text = '';
  if (isDeleting) {
    text = `Tag ${fullTag.name} deleted`;
  } else {
    text = `Tag ${fullTag.name} -> ${formNewName}`;
  }
  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    actionType: 'tag-updated',
    text,
  });
  if (modLogErr) {
    return processApiError('Error logging in tag update/delete', modLogErr, { tagId });
  }

  return createSuccessJson();
}
