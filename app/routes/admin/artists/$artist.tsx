import { LoaderArgs } from '@remix-run/cloudflare';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { MdArrowForward, MdCheck, MdReplay } from 'react-icons/md';
import ArtistEditor from '~/components/ArtistEditor';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import { getArtistById } from '~/routes/api/funcs/get-artist';
import { NewArtist } from '~/routes/contribute/upload';
import { Artist } from '~/types/types';
import { FieldChange } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import useWindowSize from '~/utils/useWindowSize';

export type ArtistDataChanges = {
  artistId: number;
  name?: string;
  e621Name?: string;
  patreonName?: string;
  links?: string[];
};

export async function loader(args: LoaderArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;
  const artistParam = args.params.artist as string;

  const artistId = parseInt(artistParam);

  const artist = await getArtistById(urlBase, artistId);
  return { artist, user };
}

export default function ManageComicInner() {
  const { isMobile } = useWindowSize();
  const { artist, user } = useLoaderData<typeof loader>();
  const saveChangesFetcher = useFetcher();
  const banArtistFetcher = useFetcher();

  const [updatedArtistData, setUpdatedArtistData] = useState<NewArtist>();
  const [needsUpdate, setNeedsUpdate] = useState(false);

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
            <LoadingButton
              onClick={toggleArtistBan}
              className="mt-2"
              isLoading={banArtistFetcher.state === 'submitting'}
              color="error"
              text="Unban artist"
            />
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
          <LoadingButton
            isLoading={banArtistFetcher.state === 'submitting'}
            text="Ban artist"
            onClick={toggleArtistBan}
            color="error"
            className="mt-2"
          />
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
