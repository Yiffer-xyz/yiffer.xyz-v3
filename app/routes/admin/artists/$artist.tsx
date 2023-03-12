import { LoaderArgs } from '@remix-run/cloudflare';
import { useFetcher, useLoaderData, useRevalidator } from '@remix-run/react';
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
  const revalidator = useRevalidator();
  const { isMobile } = useWindowSize();
  const { artist } = useLoaderData<typeof loader>();
  const saveChangesFetcher = useFetcher();

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

  return (
    <>
      <h2 className="mb-2">{artist.name}</h2>

      {updatedArtistData && (
        <ArtistEditor
          newArtistData={updatedArtistData}
          existingArtist={artist}
          onUpdate={setUpdatedArtistData}
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

          {saveChangesFetcher.data?.error && (
            <InfoBox
              variant="error"
              className="mt-4 w-fit"
              text={saveChangesFetcher.data.error}
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
