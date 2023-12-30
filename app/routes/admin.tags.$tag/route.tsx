import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { MdArrowForward, MdCheck, MdClose, MdOpenInNew, MdReplay } from 'react-icons/md';
import ArtistEditor from '~/page-components/ComicManager/ArtistEditor';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Link from '~/ui-components/Link';
import { getArtistById } from '~/route-funcs/get-artist';
import { getComicsByArtistId } from '~/route-funcs/get-comics';
import type { NewArtist } from '../contribute_.upload/route';
import type { Artist, ComicTiny } from '~/types/types';
import type { FieldChange } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import useWindowSize from '~/utils/useWindowSize';
import { getTagById } from '~/route-funcs/get-tags';

export default function ManageArtist() {
  const { tag } = useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="mb-2">{tag.name}</h2>
      <pre>{JSON.stringify(tag, null, 2)}</pre>
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;
  const tagParam = args.params.tag as string;
  // TODO: Make it possible to use both id and tag name here. Check if parseable as number,
  // and if not, use as name.
  const tagId = parseInt(tagParam);

  const tagRes = await getTagById(urlBase, tagId);

  // There's also getTagByName api route already implemented.

  if (tagRes.err) {
    return processApiError('Error getting artist for admin>artist', tagRes.err);
  }
  if (tagRes.notFound) {
    throw new Response('Artist not found', {
      status: 404,
    });
  }

  return {
    tag: tagRes.result,
  };
}
