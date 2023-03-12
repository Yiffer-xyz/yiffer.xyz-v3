import { useEffect, useState } from 'react';
import { MdArrowForward, MdCheck, MdReplay } from 'react-icons/md';
import { useFetcher } from 'react-router-dom';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import ComicDataEditor from '~/components/ComicManager/ComicData';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import TextInput from '~/components/TextInput/TextInput';
import { NewArtist, NewComicData } from '~/routes/contribute/upload';
import { Artist, Comic, ComicTiny, Tag, UserSession } from '~/types/types';
import useWindowSize from '~/utils/useWindowSize';

type LiveComicProps = {
  comic: Comic;
  user: UserSession;
  updateComic: () => void;
  allComics: ComicTiny[];
  allArtists: Artist[];
  allTags: Tag[];
};

type ComicDataChange = {
  field: string;
  oldValue?: string;
  newValue?: string;
  newDataValue?: any;
};

const emptyUnusedNewArtist: NewArtist = {
  artistName: '',
  e621Name: '',
  patreonName: '',
  links: [],
};

export default function LiveComic({
  comic,
  user,
  updateComic,
  allComics,
  allArtists,
  allTags,
}: LiveComicProps) {
  const unlistFetcher = useFetcher();
  const saveChangesFetcher = useFetcher();
  const { isMobile } = useWindowSize();

  const [isUnlisting, setIsUnlisting] = useState(false);
  const [unlistComment, setUnlistComment] = useState('');
  const [updatedComicData, setUpdatedComicData] = useState<NewComicData>();
  const [comicDataChanges, setComicDataChanges] = useState<ComicDataChange[]>([]);

  useEffect(() => {
    if (unlistFetcher.data?.success || saveChangesFetcher.data?.success) {
      updateComic();
      setupInitialUpdatedComic(comic);
    }
  }, [unlistFetcher]);

  useEffect(() => {
    setComicDataChanges(
      getComicDataChanges(updatedComicData, comic, allArtists, allComics)
    );
  }, [updatedComicData]);

  useEffect(setInitialComicData, [comic.id]);

  function setInitialComicData() {
    const newUpdatedComicData = setupInitialUpdatedComic(comic);
    setUpdatedComicData(newUpdatedComicData);
  }

  function saveComicDataChanges() {
    if (!comicDataChanges) return;

    const body: any = {
      comicId: comic.id.toString(),
    };
    for (const change of comicDataChanges) {
      if (change.field === 'Name') {
        body.name = change.newDataValue;
      } else if (change.field === 'Artist') {
        body.newArtistId = change.newDataValue;
      } else if (change.field === 'Tags' || change.field === 'Number of tags') {
        body.newTagIds = change.newDataValue;
      } else if (change.field === 'Category') {
        body.category = change.newDataValue;
      } else if (change.field === 'Classification') {
        body.classification = change.newDataValue;
      } else if (change.field === 'State') {
        body.state = change.newDataValue;
      } else if (change.field === 'Previous comic') {
        body.previousComicId = change.newDataValue;
      } else if (change.field === 'Next comic') {
        body.nextComicId = change.newDataValue;
      }
    }

    if (comicDataChanges)
      saveChangesFetcher.submit(body, {
        method: 'post',
        action: '/api/admin/update-comic-data',
      });
  }

  function unlistComic() {
    unlistFetcher.submit(
      { comicId: comic.id.toString(), unlistComment: unlistComment },
      { method: 'post', action: '/api/admin/unlist-comic' }
    );
  }

  const isNameChangedAndInvalid =
    comicDataChanges.some(change => change.field === 'Name') &&
    !updatedComicData?.validation.isLegalComicName;

  return (
    <>
      <p className="text-lg text-theme1-darker">
        This comic is live!
        <Link
          href={`/${comic.id}`}
          className="ml-2"
          text="Go to live comic"
          IconRight={MdArrowForward}
        />
      </p>

      {unlistFetcher.data?.error && (
        <InfoBox
          variant="error"
          className="mt-2 w-fit"
          text={unlistFetcher.data.error}
          showIcon
        />
      )}

      {user.userType === 'admin' && !isUnlisting && (
        <Button
          text="Unlist comic"
          className="mt-2"
          onClick={() => setIsUnlisting(true)}
          color="error"
        />
      )}
      {isUnlisting && (
        <div className="mt-2">
          <h3>Unlist comic</h3>
          <TextInput
            label="Reason for unlisting"
            value={unlistComment}
            onChange={setUnlistComment}
            className="mb-2 max-w-lg"
            name="unlistComment"
          />
          <div className="flex flex-row gap-2 mt-2">
            <Button
              text="Cancel"
              onClick={() => setIsUnlisting(false)}
              variant="outlined"
            />
            <LoadingButton
              text="Confirm unlisting"
              isLoading={unlistFetcher.state === 'submitting'}
              onClick={unlistComic}
              color="error"
            />
          </div>
        </div>
      )}

      <div className="mt-4">
        <h4 className="mb-1">Comic data</h4>
        {updatedComicData && (
          <ComicDataEditor
            comicData={updatedComicData}
            artists={allArtists}
            comics={allComics}
            onUpdate={setUpdatedComicData}
            existingComic={comic}
            isAdminPanel={true}
          />
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
                  const hasDetails = change.oldValue && change.newValue;
                  return isMobile ? (
                    <div>
                      <p className={hasDetails ? '' : 'col-span-2'}>
                        <b>{change.field}:</b>
                      </p>
                      {hasDetails && (
                        <p>
                          {change.oldValue} <MdArrowForward /> {change.newValue}
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
                          {change.oldValue} <MdArrowForward /> {change.newValue}
                        </p>
                      )}
                    </>
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
                isLoading={saveChangesFetcher.state === 'submitting'}
                onClick={saveComicDataChanges}
                startIcon={MdCheck}
                disabled={isNameChangedAndInvalid}
              />
            </div>
          </>
        )}
      </div>

      <pre className="mt-32">{JSON.stringify(comic, null, 2)}</pre>
    </>
  );
}

function setupInitialUpdatedComic(comic: Comic): NewComicData {
  const newComicData: NewComicData = {
    comicName: comic.name,
    artistId: comic.artist.id,
    category: comic.category,
    classification: comic.classification,
    state: comic.state,
    validation: {
      isLegalComicName: true,
    },
    tagIds: comic.tags.map(tag => tag.id),
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
  allArtists: Artist[],
  allComics: ComicTiny[]
): ComicDataChange[] {
  if (!updatedComicData) return [];
  const changes: ComicDataChange[] = [];

  if (comic.name !== updatedComicData.comicName) {
    changes.push({
      field: 'Name',
      oldValue: comic.name,
      newValue: updatedComicData.comicName,
      newDataValue: updatedComicData.comicName,
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
  if (comic.classification !== updatedComicData.classification) {
    changes.push({
      field: 'Classification',
      oldValue: comic.classification,
      newValue: updatedComicData.classification,
      newDataValue: updatedComicData.classification,
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
  if (comic.tags.length !== updatedComicData.tagIds.length) {
    changes.push({
      field: 'Number of tags',
      oldValue: comic.tags.length.toString(),
      newValue: updatedComicData.tagIds.length.toString(),
      newDataValue: updatedComicData.tagIds.join(','),
    });
  }
  if (comic.previousComic?.id !== updatedComicData.previousComic?.id) {
    changes.push({
      field: 'Previous comic',
      oldValue: comic.previousComic?.name || 'None',
      newValue:
        allComics.find(c => c.id === updatedComicData.previousComic?.id)?.name || 'None',
      newDataValue: updatedComicData.previousComic?.id,
    });
  }
  if (comic.nextComic?.id !== updatedComicData.nextComic?.id) {
    changes.push({
      field: 'Next comic',
      oldValue: comic.nextComic?.name || 'None',
      newValue:
        allComics.find(c => c.id === updatedComicData.nextComic?.id)?.name || 'None',
      newDataValue: updatedComicData.nextComic?.id,
    });
  }

  let tagsInnerChanged = false;
  if (comic.tags.length === updatedComicData.tagIds.length) {
    for (const tag of comic.tags) {
      if (!updatedComicData.tagIds.includes(tag.id)) {
        tagsInnerChanged = true;
        break;
      }
    }
  }
  if (tagsInnerChanged) {
    changes.push({
      field: 'Tags',
      newDataValue: updatedComicData.tagIds.join(','),
    });
  }

  return changes;
}
