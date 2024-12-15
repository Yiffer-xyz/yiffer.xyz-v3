import { redirect, useLoaderData, useNavigate } from '@remix-run/react';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';
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
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function ManageTag() {
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
      <h2 className="mb-1">{capitalizeString(tag.name)}</h2>

      {!isEditing && !isDeleting && (
        <div className="flex flex-row gap-3">
          <Button
            text="Back"
            onClick={() => navigate('/admin/tags')}
            startIcon={MdArrowBack}
            variant="outlined"
          />
          <Button text="Edit tag" onClick={() => setIsEditing(true)} />
          <Button text="Delete tag" onClick={() => setIsDeleting(true)} color="error" />
        </div>
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
  const data = await args.request.formData();
  const tagId = parseInt(args.params.tag as string);
  const formNewName = data.get('newName');
  const formIsDeleting = data.get('isDeleting');

  if (formIsDeleting && formIsDeleting === 'true') {
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
    const dbRes = await queryDbExec(args.context.cloudflare.env.DB, query, params);
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error updating tag name', { formNewName });
    }
  }

  return createSuccessJson();
}
