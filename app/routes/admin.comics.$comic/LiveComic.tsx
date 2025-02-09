import { Fragment, useEffect, useState } from 'react';
import { MdArrowForward, MdCheck, MdReplay } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import ComicDataEditor from '~/page-components/ComicManager/ComicData';
import TagsEditor from '~/page-components/ComicManager/Tags';
import type { NewArtist, NewComicData } from '~/routes/contribute_.upload/route';
import type { ArtistTiny, Comic, ComicTiny, Tag, UserSession } from '~/types/types';
import type { FieldChange } from '~/utils/general';
import { showErrorToast, useGoodFetcher } from '~/utils/useGoodFetcher';
import useWindowSize from '~/utils/useWindowSize';
import ManagePagesAdmin from './ManagePagesAdmin';
import { useUIPreferences } from '~/utils/theme-provider';
import LiveComicThumbnailManager from './LiveComicThumbnailManager';
import AdminTools from './AdminTools';

type LiveComicProps = {
  comic: Comic;
  user: UserSession;
  allComics: ComicTiny[];
  allArtists: ArtistTiny[];
  allTags: Tag[];
  blockActions?: boolean;
  PAGES_PATH: string;
  IMAGES_SERVER_URL: string;
};

export default function LiveComic({
  comic,
  user,
  allComics,
  allArtists,
  allTags,
  blockActions,
  PAGES_PATH,
  IMAGES_SERVER_URL,
}: LiveComicProps) {
  const saveChangesFetcher = useGoodFetcher({
    url: '/api/admin/update-comic-data',
    method: 'post',
    toastSuccessMessage: 'Changes saved',
    onFinish: () => setNeedsUpdate(true),
  });
  const { isMobile } = useWindowSize();
  const { theme } = useUIPreferences();

  const [updatedComicData, setUpdatedComicData] = useState<NewComicData>();
  const [comicDataChanges, setComicDataChanges] = useState<FieldChange[]>([]);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  useEffect(() => {
    setComicDataChanges(
      getComicDataChanges(updatedComicData, comic, allArtists, allComics)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedComicData]);

  useEffect(() => {
    if (!updatedComicData?.name || needsUpdate || comic.id !== updatedComicData.id) {
      setInitialComicData();
      setNeedsUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comic, needsUpdate]);

  function setInitialComicData() {
    const newUpdatedComicData = setupInitialUpdatedComic(comic);
    setUpdatedComicData(newUpdatedComicData);
  }

  async function saveComicDataChanges() {
    if (!comicDataChanges) return;

    const body: ComicDataChanges = {
      comicId: comic.id,
    };
    for (const change of comicDataChanges) {
      if (change.field === 'Name') {
        body.name = change.newDataValue;
      } else if (change.field === 'Artist') {
        body.artistId = change.newDataValue;
      } else if (change.field === 'New tags' || change.field === 'Removed tags') {
        body.tagIds = change.newDataValue;
      } else if (change.field === 'Category') {
        body.category = change.newDataValue;
      } else if (change.field === 'State') {
        body.state = change.newDataValue;
      } else if (change.field === 'Previous comic') {
        body.previousComicId = change.newDataValue;
      } else if (change.field === 'Next comic') {
        body.nextComicId = change.newDataValue;
      }
    }

    if (body.name) {
      setIsUpdatingName(true);
      const response = await fetch(`${IMAGES_SERVER_URL}/rename-comic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prevComicName: comic.name,
          newComicName: body.name,
          numPages: comic.numberOfPages,
        }),
      });

      if (!response.ok) {
        showErrorToast('Failed to rename comic pages', theme);
        setIsUpdatingName(false);
        return;
      }
    }

    await saveChangesFetcher.awaitSubmit({ body: JSON.stringify(body) });
    setIsUpdatingName(false);
  }

  const isNameChangedAndInvalid =
    comicDataChanges.some(change => change.field === 'Name') &&
    !updatedComicData?.validation.isLegalComicName;

  const canSave =
    !isNameChangedAndInvalid && updatedComicData?.artistId && updatedComicData.name;

  return (
    <>
      <div className="mt-8">
        <h4 className="mb-1">Comic data</h4>
        {updatedComicData && (
          <>
            <ComicDataEditor
              comicData={updatedComicData}
              artists={allArtists}
              comics={allComics}
              onUpdate={setUpdatedComicData}
              existingComic={comic}
              isAdminPanel={true}
            />

            <h4 className="mt-10">Tags</h4>
            <TagsEditor
              allTags={allTags}
              tags={updatedComicData.tags}
              onUpdate={tags => setUpdatedComicData({ ...updatedComicData, tags })}
              includeClearAll
              className="max-w-5xl"
            />
          </>
        )}

        {comicDataChanges.length > 0 && (
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
                {comicDataChanges.map(change => {
                  const hasDetails = !!change.newValue;

                  return isMobile ? (
                    <div key={change.field}>
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
                onClick={setInitialComicData}
                startIcon={MdReplay}
              />
              <LoadingButton
                text="Save changes"
                isLoading={saveChangesFetcher.isLoading || isUpdatingName}
                onClick={saveComicDataChanges}
                startIcon={MdCheck}
                disabled={!canSave || blockActions}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-8">
        <h3>Thumbnail</h3>
        <LiveComicThumbnailManager
          comicData={comic}
          PAGES_PATH={PAGES_PATH}
          IMAGES_SERVER_URL={IMAGES_SERVER_URL}
          blockActions={blockActions}
        />
      </div>

      <div className="mt-8">
        <h3>Pages</h3>

        <ManagePagesAdmin
          comic={comic}
          blockActions={blockActions}
          PAGES_PATH={PAGES_PATH}
          IMAGES_SERVER_URL={IMAGES_SERVER_URL}
        />
      </div>

      {user.userType === 'admin' && <AdminTools comic={comic} />}
    </>
  );
}

const emptyUnusedNewArtist: NewArtist = {
  artistName: '',
  e621Name: '',
  patreonName: '',
  links: [],
};

export type ComicDataChanges = {
  comicId: number;
  name?: string;
  artistId?: number;
  tagIds?: number[];
  category?: string;
  state?: string;
  numberOfPages?: number;
  previousComicId?: number | null;
  nextComicId?: number | null;
  updateUpdatedTime?: boolean;
};

function setupInitialUpdatedComic(comic: Comic): NewComicData {
  const newComicData: NewComicData = {
    id: comic.id,
    name: comic.name,
    artistId: comic.artist.id,
    category: comic.category,
    state: comic.state,
    validation: {
      isLegalComicName: true,
    },
    tags: comic.tags,
    previousComic: comicLinkToTinyComic(comic.previousComic),
    nextComic: comicLinkToTinyComic(comic.nextComic),
    files: [],
    newArtist: emptyUnusedNewArtist,
  };

  return newComicData;
}

function comicLinkToTinyComic(comic?: {
  name: string;
  id: number;
}): ComicTiny | undefined {
  if (!comic) return undefined;
  if (comic) {
    const tinyComic: ComicTiny = {
      id: comic.id,
      name: comic.name,
      publishStatus: 'published',
    };
    return tinyComic;
  }
}

function getComicDataChanges(
  updatedComicData: NewComicData | undefined,
  comic: Comic,
  allArtists: ArtistTiny[],
  allComics: ComicTiny[]
): FieldChange[] {
  if (!updatedComicData) return [];
  const changes: FieldChange[] = [];

  if (comic.name !== updatedComicData.name) {
    changes.push({
      field: 'Name',
      oldValue: comic.name,
      newValue: updatedComicData.name,
      newDataValue: updatedComicData.name,
    });
  }
  if (comic.artist.id !== updatedComicData.artistId) {
    changes.push({
      field: 'Artist',
      oldValue: comic.artist.name,
      newValue: allArtists.find(a => a.id === updatedComicData.artistId)?.name,
      newDataValue: updatedComicData.artistId,
    });
  }
  if (comic.category !== updatedComicData.category) {
    changes.push({
      field: 'Category',
      oldValue: comic.category,
      newValue: updatedComicData.category,
      newDataValue: updatedComicData.category,
    });
  }
  if (comic.state !== updatedComicData.state) {
    changes.push({
      field: 'State',
      oldValue: comic.state,
      newValue: updatedComicData.state,
      newDataValue: updatedComicData.state,
    });
  }
  if (comic.previousComic?.id !== updatedComicData.previousComic?.id) {
    changes.push({
      field: 'Previous comic',
      oldValue: comic.previousComic?.name || 'None',
      newValue:
        allComics.find(c => c.id === updatedComicData.previousComic?.id)?.name || 'None',
      newDataValue: updatedComicData.previousComic?.id ?? null,
    });
  }
  if (comic.nextComic?.id !== updatedComicData.nextComic?.id) {
    changes.push({
      field: 'Next comic',
      oldValue: comic.nextComic?.name || 'None',
      newValue:
        allComics.find(c => c.id === updatedComicData.nextComic?.id)?.name || 'None',
      newDataValue: updatedComicData.nextComic?.id ?? null,
    });
  }

  const newTags: Tag[] = [];
  const removedTags: Tag[] = [];
  for (const tag of comic.tags) {
    if (!updatedComicData.tags.find(t => t.id === tag.id)) {
      removedTags.push(tag);
    }
  }
  for (const tag of updatedComicData.tags) {
    if (!comic.tags.find(t => t.id === tag.id)) {
      newTags.push(tag);
    }
  }
  if (newTags.length > 0) {
    changes.push({
      field: 'New tags',
      oldValue: undefined,
      newValue: `${newTags.length}: ${newTags.map(t => t.name).join(', ')}`,
      newDataValue: updatedComicData.tags.map(t => t.id),
    });
  }
  if (removedTags.length > 0) {
    changes.push({
      field: 'Removed tags',
      oldValue: undefined,
      newValue: `${removedTags.length}: ${removedTags.map(t => t.name).join(', ')}`,
      newDataValue: updatedComicData.tags.map(t => t.id),
    });
  }

  return changes;
}
