import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { processApiError } from '~/utils/request-helpers';
import { getTagById } from '~/route-funcs/get-tags';

export default function ManageTag() {
  const { tag } = useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="mb-2">{tag.name}</h2>
      <pre>{JSON.stringify(tag, null, 2)}</pre>
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const tagParam = args.params.tag as string;
  // TODO: Make it possible to use both id and tag name here. Check if parseable as number,
  // and if not, use as name.
  const tagId = parseInt(tagParam);

  const tagRes = await getTagById(args.context.DB, tagId);

  // There's also getTagByName api route already implemented.

  if (tagRes.err) {
    return processApiError('Error getting tag for admin>tags', tagRes.err);
  }
  if (tagRes.notFound) {
    throw new Response('Tag not found', {
      status: 404,
    });
  }

  return {
    tag: tagRes.result,
  };
}
