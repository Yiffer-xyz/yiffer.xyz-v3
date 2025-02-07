import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { MdArrowBack, MdArrowForward, MdCheck, MdClose, MdReplay } from 'react-icons/md';
import ArtistEditor from '~/page-components/ComicManager/ArtistEditor';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Link from '~/ui-components/Link';
import { getArtistAndComicsByField } from '~/route-funcs/get-artist';
import type { NewArtist } from '../contribute_.upload/route';
import type { Artist } from '~/types/types';
import type { FieldChange } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import useWindowSize from '~/utils/useWindowSize';
import ComicAdminLink from '~/ui-components/ComicAdminLink/ComicAdminLink';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import type { GlobalAdminContext } from '../admin/route';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const artistName = data?.artist?.name;
  return [{ title: `Mod: ${artistName} (artist) | Yiffer.xyz` }];
};

export default function ManageArtist() {
  const { isMobile } = useWindowSize();
  const { artist, comics, user } = useLoaderData<typeof loader>();
  const globalContext = useOutletContext<GlobalAdminContext>();
  const blockActions = globalContext.numUnreadContent > 0;

  const banArtistFetcher = useGoodFetcher({
    url: '/api/admin/toggle-artist-ban',
    method: 'post',
    toastSuccessMessage: 'Artist ban status updated',
  });
  const saveChangesFetcher = useGoodFetcher({
    url: '/api/admin/update-artist-data',
    method: 'post',
    toastSuccessMessage: 'Artist updated',
    onFinish: () => {
      setNeedsUpdate(true);
      setIsBanning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const [updatedArtistData, setUpdatedArtistData] = useState<NewArtist>();
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isBanning, setIsBanning] = useState(false);

  useEffect(() => {
    if (
      !updatedArtistData?.artistName ||
      updatedArtistData.id !== artist?.id ||
      needsUpdate
    ) {
      setInitialArtistData();
      setNeedsUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist, needsUpdate]);

  function setInitialArtistData() {
    const newUpdatedArtistData = setupInitialUpdatedArtist(artist);
    setUpdatedArtistData(newUpdatedArtistData);
  }

  const artistChanges = useMemo(() => {
    if (!updatedArtistData) return [];
    return getChanges(artist, updatedArtistData);
  }, [updatedArtistData, artist]);

  function saveChanges() {
    if (!artistChanges) return;

    const body: ArtistDataChanges = {
      artistId: artist.id,
    };
    for (const change of artistChanges) {
      if (change.field === 'Name') {
        body.name = change.newDataValue;
      } else if (change.field === 'E621 name') {
        body.e621Name = change.newDataValue;
      } else if (change.field === 'Patreon name') {
        body.patreonName = change.newDataValue;
      } else if (change.field === 'Links') {
        body.links = change.newDataValue;
      }
    }

    saveChangesFetcher.submit({ body: JSON.stringify(body) });
  }

  const canSave = useMemo(() => {
    if (!updatedArtistData) return false;
    if (updatedArtistData.artistName !== artist.name && !updatedArtistData.isValidName)
      return false;
    if (!updatedArtistData.e621Name && !updatedArtistData.hasConfirmedNoE621Name) {
      return false;
    }
    if (!updatedArtistData.patreonName && !updatedArtistData.hasConfirmedNoPatreonName) {
      return false;
    }
    if (updatedArtistData.areLinksValid === false) {
      return false;
    }

    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistChanges, updatedArtistData]);

  function toggleArtistBan() {
    banArtistFetcher.submit({
      isBanned: artist.isBanned ? 'false' : 'true',
      artistId: artist.id.toString(),
    });
  }

  return (
    <>
      <h2 className="mt-1">{artist.name}</h2>
      <div className="mb-2">
        <Link href="/admin/artists" text="Back" Icon={MdArrowBack} />
      </div>

      {artist.isBanned && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit mb-6">
          <h3>Banned artist</h3>
          <p>
            This artist cannot be chosen for new/existing comics, and cannot be suggested.
            The reasons could be that they've asked not to be featured on the site, or
            anything else.
          </p>

          {user.userType === 'admin' ? (
            <>
              <p className="mt-4 mb-2">
                If unbanning an artist with unlisted comics, you will still have to
                re-list the comics individually if they should be shown on the site.
              </p>
              <LoadingButton
                onClick={toggleArtistBan}
                className="mt-2"
                isLoading={banArtistFetcher.isLoading}
                color="error"
                text="Unban artist"
              />
            </>
          ) : (
            <p>Only admins can unban artists.</p>
          )}
        </div>
      )}

      {artist.isPending && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit mb-6">
          <h3>Pending artist</h3>
          <p>
            This artist is pending. This means that a user has uploaded a comic and in the
            same process created a new artist. If the comic is approved, the artist stops
            being pending. If the comic is rejected, this artist is deleted (fully - not
            banned, actually deleted).
          </p>
        </div>
      )}

      {!artist.isBanned && (
        <div className="mb-4 mt-2">
          {!artist.isPending && (
            <p className="text-theme1-darker dark:text-theme1-dark font-bold">
              This artist is live!
              <Link
                href={`/artist/${artist.name}`}
                className="ml-2"
                text="View artist page"
                showRightArrow
                isInsideParagraph
              />
            </p>
          )}
        </div>
      )}

      <h4 className="mt-2">Comics</h4>
      <div className="flex flex-wrap gap-x-3 gap-y-2 mb-6">
        {comics.length ? (
          comics.map(comic => <ComicAdminLink comic={comic} key={comic.id} />)
        ) : (
          <p>This artist has no comics that are uploaded, pending, or live.</p>
        )}
      </div>

      {updatedArtistData && (
        <ArtistEditor
          newArtistData={updatedArtistData}
          existingArtist={artist}
          onUpdate={setUpdatedArtistData}
          hideBorderTitle
          className="max-w-3xl"
        />
      )}

      {artistChanges.length > 0 && (
        <>
          <div
            className={`py-2 px-4 bg-theme1-primaryTrans flex flex-col gap-1 mt-6 ${
              isMobile ? '' : 'w-fit'
            }`}
          >
            <h4>Changes</h4>
            <div
              className={`grid ${isMobile ? 'gap-y-2' : 'gap-x-4'}`}
              style={{ gridTemplateColumns: isMobile ? 'auto' : 'auto auto' }}
            >
              {artistChanges.map(change => {
                const hasDetails = !!change.newValue;

                return isMobile ? (
                  <div key={change.field} className="grid gap-y-2">
                    <p className={hasDetails ? '' : 'col-span-2'}>
                      <b>{change.field}:</b>
                    </p>
                    {hasDetails && (
                      <p>
                        {change.oldValue ? (
                          <>
                            {change.oldValue} <MdArrowForward /> {change.newValue}
                          </>
                        ) : (
                          change.newValue
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <Fragment key={change.field}>
                    <p className={hasDetails ? '' : 'col-span-2'}>
                      <b>{change.field}</b>
                    </p>
                    {hasDetails && (
                      <p>
                        {change.oldValue ? (
                          <>
                            {change.oldValue} <MdArrowForward /> {change.newValue}
                          </>
                        ) : (
                          change.newValue
                        )}
                      </p>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex flex-row gap-2 mt-4">
            <Button
              variant="outlined"
              text="Revert changes"
              onClick={setInitialArtistData}
              startIcon={MdReplay}
            />
            <LoadingButton
              text="Save changes"
              isLoading={saveChangesFetcher.isLoading}
              onClick={saveChanges}
              startIcon={MdCheck}
              disabled={!canSave || blockActions}
            />
          </div>
        </>
      )}

      {user.userType === 'admin' && !artist.isBanned && (
        <div className="mt-10 pb-20">
          <h3>Admin tools</h3>
          {!isBanning && (
            <Button
              text="Ban artist"
              onClick={() => setIsBanning(true)}
              color="error"
              className="mt-2"
            />
          )}
          {isBanning && (
            <>
              <h4>Ban artist</h4>
              <p className="mt-2">
                Banning an artist will unlist any comics they have, and prevent users from
                suggesting or uploading comics by them. It will also reject any pending
                and user uploaded comic by them.
              </p>
              <div className="flex flex-row gap-2 flex-wrap mt-2">
                <Button
                  variant="outlined"
                  text="Cancel"
                  onClick={() => setIsBanning(false)}
                  startIcon={MdClose}
                />
                <LoadingButton
                  isLoading={banArtistFetcher.isLoading}
                  text="Ban artist"
                  onClick={toggleArtistBan}
                  color="error"
                  startIcon={MdCheck}
                />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export type ArtistDataChanges = {
  artistId: number;
  name?: string;
  e621Name?: string;
  patreonName?: string;
  links?: string[];
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const db = args.context.cloudflare.env.DB;
  const artistParam = args.params.artist as string;
  const artistId = parseInt(artistParam);

  if (isNaN(artistId)) {
    throw new Response('Invalid artist ID', { status: 404 });
  }
  const combinedRes = await getArtistAndComicsByField(db, 'id', artistId);
  if (combinedRes.err) {
    return processApiError('Error getting data for admin>artist', combinedRes.err);
  }
  if (combinedRes.notFound) {
    throw new Response('Artist not found', {
      status: 404,
    });
  }

  return {
    artist: combinedRes.result.artist,
    comics: combinedRes.result.comics,
    user,
  };
}

function getChanges(initialArtist: Artist, updatedArtist: NewArtist): FieldChange[] {
  const changes: FieldChange[] = [];

  if (initialArtist.name !== updatedArtist.artistName) {
    changes.push({
      field: 'Name',
      oldValue: initialArtist.name,
      newValue: updatedArtist.artistName,
      newDataValue: updatedArtist.artistName,
    });
  }

  if (initialArtist.e621Name !== updatedArtist.e621Name) {
    changes.push({
      field: 'E621 name',
      oldValue: initialArtist.e621Name || 'None',
      newValue: updatedArtist.e621Name || 'None',
      newDataValue: updatedArtist.e621Name,
    });
  }

  if (initialArtist.patreonName !== updatedArtist.patreonName) {
    changes.push({
      field: 'Patreon name',
      oldValue: initialArtist.patreonName || 'None',
      newValue: updatedArtist.patreonName || 'None',
      newDataValue: updatedArtist.patreonName,
    });
  }

  const realNewLinks = updatedArtist.links.filter(link => link !== '');
  if (initialArtist.links.length !== realNewLinks.length) {
    changes.push({
      field: 'Links',
      newDataValue: realNewLinks,
    });
  } else {
    for (let i = 0; i < initialArtist.links.length; i++) {
      if (initialArtist.links[i] !== realNewLinks[i]) {
        changes.push({
          field: 'Links',
          newDataValue: realNewLinks,
        });
        break;
      }
    }
  }

  return changes;
}

function setupInitialUpdatedArtist(artist: Artist): NewArtist {
  const newArtist: NewArtist = {
    id: artist.id,
    artistName: artist.name,
    e621Name: artist.e621Name,
    patreonName: artist.patreonName,
    links: [...artist.links, ''],
  };
  if (!artist.e621Name) {
    newArtist.hasConfirmedNoE621Name = true;
  }
  if (!artist.patreonName) {
    newArtist.hasConfirmedNoPatreonName = true;
  }

  return newArtist;
}
