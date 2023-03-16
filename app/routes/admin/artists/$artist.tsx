import { LoaderArgs } from '@remix-run/cloudflare';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { MdArrowForward, MdCheck, MdClose, MdOpenInNew, MdReplay } from 'react-icons/md';
import ArtistEditor from '~/components/ArtistEditor';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import { getArtistById } from '~/routes/api/funcs/get-artist';
import { getComicsByArtistId } from '~/routes/api/funcs/get-comics';
import { NewArtist } from '~/routes/contribute/upload';
import { Artist, ComicTiny, UserSession } from '~/types/types';
import { FieldChange } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import { create400Json, create500Json, logError } from '~/utils/request-helpers';
import useWindowSize from '~/utils/useWindowSize';

export type ArtistDataChanges = {
  artistId: number;
  name?: string;
  e621Name?: string;
  patreonName?: string;
  links?: string[];
};

type LoaderData = {
  artist: Artist;
  comics: ComicTiny[];
  user: UserSession;
};

export async function loader(args: LoaderArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;
  const artistParam = args.params.artist as string;
  const artistId = parseInt(artistParam);

  const artistPromise = getArtistById(urlBase, artistId);
  const comicsPromise = getComicsByArtistId(urlBase, artistId, { includeUnlisted: true });
  const [artistRes, comicsRes] = await Promise.all([artistPromise, comicsPromise]);

  if (artistRes.err) {
    logError(`Error getting artist for admin>artist. Id ${artistId}`, artistRes.err);
    throw create500Json('Error getting artist data');
  }
  if (comicsRes.err) {
    logError(`Error getting comic for admin>artist. Id ${artistId}`, comicsRes.err);
    throw create500Json(`Error getting artist's comics`);
  }
  if (artistRes.notFound || !artistRes.artist) {
    throw create400Json('Artist not found');
  }

  return {
    artist: artistRes.artist,
    comics: comicsRes.comics as ComicTiny[],
    user,
  };
}

export default function ManageArtist() {
  const { isMobile } = useWindowSize();
  const { artist, comics, user } = useLoaderData<typeof loader>();
  const saveChangesFetcher = useFetcher();
  const banArtistFetcher = useFetcher();

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
  }, [artist]);

  useEffect(() => {
    if (saveChangesFetcher.data?.success && saveChangesFetcher.state === 'loading') {
      setNeedsUpdate(true);
      setIsBanning(false);
    }
  }, [saveChangesFetcher]);

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

    saveChangesFetcher.submit(
      { body: JSON.stringify(body) },
      {
        method: 'post',
        action: '/api/admin/update-artist-data',
      }
    );
  }

  const canSave = useMemo(() => {
    if (!updatedArtistData) return false;
    if (!updatedArtistData.isValidName) return false;
    if (!updatedArtistData.e621Name && !updatedArtistData.hasConfirmedNoE621Name) {
      return false;
    }
    if (!updatedArtistData.patreonName && !updatedArtistData.hasConfirmedNoPatreonName) {
      return false;
    }

    return true;
  }, [artistChanges]);

  function toggleArtistBan() {
    banArtistFetcher.submit(
      { isBanned: artist.isBanned ? 'false' : 'true', artistId: artist.id.toString() },
      {
        method: 'post',
        action: `/api/admin/toggle-artist-ban`,
      }
    );
  }

  return (
    <>
      <h2 className="mb-2">{artist.name}</h2>

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
                isLoading={banArtistFetcher.state === 'submitting'}
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
        <div className="mb-6">
          {!artist.isPending && (
            <p className="text-lg text-theme1-darker">
              This artist is live!
              <Link
                href={`/artist/${artist.name}`}
                className="ml-2"
                text="View live artist page"
                IconRight={MdOpenInNew}
                newTab
              />
            </p>
          )}
        </div>
      )}

      <h4 className="mt-2">Comics</h4>
      <div className="flex flex-wrap gap-x-3 gap-y-2 mb-6">
        {comics.length ? (
          comics.map(comic => (
            <div className="px-2 py-1 bg-theme1-primaryTrans dark:bg-theme1-primaryMoreTrans flex flex-row flex-wrap gap-x-3">
              <p>{comic.name}</p>
              <div className="flex flex-row gap-3">
                {comic.publishStatus === 'published' && (
                  <Link
                    href={`/${comic.name}`}
                    text="Live"
                    newTab
                    IconRight={MdOpenInNew}
                  />
                )}
                <Link
                  href={`/admin/comics/${comic.id}`}
                  text="Admin"
                  IconRight={MdArrowForward}
                />
              </div>
            </div>
          ))
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
                  <div>
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
                  <>
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
                  </>
                );
              })}
            </div>
          </div>

          {(saveChangesFetcher.data?.error || banArtistFetcher.data?.error) && (
            <InfoBox
              variant="error"
              className="mt-4 w-fit"
              text={saveChangesFetcher.data.error || banArtistFetcher.data.error}
              showIcon
            />
          )}

          <div className="flex flex-row gap-2 mt-4">
            <Button
              variant="outlined"
              text="Revert changes"
              onClick={setInitialArtistData}
              startIcon={MdReplay}
            />
            <LoadingButton
              text="Save changes"
              isLoading={saveChangesFetcher.state === 'submitting'}
              onClick={saveChanges}
              startIcon={MdCheck}
              disabled={!canSave}
            />
          </div>
        </>
      )}

      {user.userType === 'admin' && !artist.isBanned && (
        <div className="mt-10">
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
                  isLoading={banArtistFetcher.state === 'submitting'}
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
