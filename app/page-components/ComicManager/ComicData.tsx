import { useMemo, useState } from 'react';
import CheckboxUncontrolled from '~/ui-components/Checkbox/CheckboxUncontrolled';
import SearchableSelect from '~/ui-components/SearchableSelect/SearchableSelect';
import Select from '~/ui-components/Select/Select';
import type { ArtistTiny, Comic, ComicTiny } from '~/types/types';
import type { NewComicData } from '~/routes/contribute_.upload/route';
import ComicNameEditor from './ComicNameEditor';
import Step2NewArtist from './ArtistEditor';
import Link from '~/ui-components/Link';
import { MdArrowForward, MdOpenInNew } from 'react-icons/md';
import { toTitleCase } from '~/utils/string-utils';

const categoryOptions = ['M', 'F', 'MF', 'MM', 'FF', 'MF+', 'I'].map(c => ({
  value: c,
  text: c,
}));
const stateOptions = [
  { text: 'Finished', value: 'finished' },
  { text: 'WIP', value: 'wip' },
  { text: 'Cancelled', value: 'cancelled' },
];

type ComicDataEditorProps = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
  artists: ArtistTiny[];
  comics: ComicTiny[];
  existingComic?: Comic;
  isAdminPanel?: boolean;
};

export default function ComicDataEditor({
  artists,
  comics,
  comicData,
  onUpdate,
  existingComic,
  isAdminPanel = false,
}: ComicDataEditorProps) {
  const [artistNotInList, setArtistNotInList] = useState(false);

  const artistOptions = useMemo(
    () => artists.map(a => ({ value: a.id, text: a.name })),
    [artists]
  );

  const allComicOptions = useMemo(() => {
    return comics.map(c => ({ value: c, text: c.name }));
  }, [comics]);

  function getComicLink(comic: ComicTiny) {
    if (comic.publishStatus === 'published') {
      return `/${comic.name}`;
    }
    if (comic.publishStatus === 'pending' || comic.publishStatus === 'uploaded') {
      if (isAdminPanel) {
        return `/admin/comics/${comic.id}`;
      }
    }

    return undefined;
  }

  return (
    <>
      <ComicNameEditor
        comicName={comicData.name}
        setIsLegalComicnameState={isLegal =>
          onUpdate({
            ...comicData,
            validation: { ...comicData.validation, isLegalComicName: isLegal },
          })
        }
        onUpdate={newVal => onUpdate({ ...comicData, name: toTitleCase(newVal) })}
        existingComic={existingComic}
      />

      <div className="flex flex-col md:flex-row flex-wrap mt-6 gap-4">
        <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 items-end">
          <SearchableSelect
            value={comicData.artistId}
            onChange={newVal => onUpdate({ ...comicData, artistId: newVal })}
            onValueCleared={() => onUpdate({ ...comicData, artistId: undefined })}
            options={artistOptions}
            disabled={artistNotInList}
            title="Artist"
            name="artistId"
            mobileFullWidth
          />
          {comicData.artistId && (
            <div>
              <ViewArtistLink
                artist={artists.find(a => a.id === comicData.artistId)}
                isAdminPanel={isAdminPanel}
              />
            </div>
          )}
        </div>
        {!isAdminPanel && (
          <CheckboxUncontrolled
            label="Artist is not in the list"
            name="artistNotInList"
            className="self-start md:self-end"
            onChange={newVal => {
              setArtistNotInList(newVal);
              if (newVal === true) {
                onUpdate({ ...comicData, artistId: undefined });
              }
            }}
          />
        )}
      </div>

      {artistNotInList && (
        <Step2NewArtist
          newArtistData={comicData.newArtist}
          onUpdate={newArtist => onUpdate({ ...comicData, newArtist })}
        />
      )}

      <div className="flex flex-row flex-wrap gap-4 mt-8">
        <Select
          title="Category"
          name="language"
          value={comicData.category}
          onChange={newVal => onUpdate({ ...comicData, category: newVal })}
          options={categoryOptions}
          minWidth={72}
        />

        <Select
          title="State"
          name="state"
          value={comicData.state}
          onChange={newVal => onUpdate({ ...comicData, state: newVal })}
          options={stateOptions}
          minWidth={111}
        />
      </div>

      {!isAdminPanel && (
        <div style={{ fontSize: '0.75rem' }} className="mt-2">
          <p>M, F: Male only, female only.</p>
          <p>MF: One male on one female.</p>
          <p>MM, FF: Two or more males or females together.</p>
          <p>MF+: One or more male on one or more female action.</p>
          <p>I: Anything involving intersex characters or nonbinary genders.</p>
        </div>
      )}

      <h4 className="mt-8">Connected comics</h4>
      {!isAdminPanel && (
        <>
          <p className="text-sm">
            If this is a standalone comic, leave these fields empty. If it's part of a
            series, fill in the previous and/or next comics.
          </p>
          <p className="text-sm">
            If you are uploading multiple chapters of a series, you can leave the "next
            comic" empty and only fill in the previous comic for each.
          </p>
        </>
      )}

      <div className="flex flex-row flex-wrap gap-4 mt-2">
        <div className="w-full">
          <SearchableSelect
            value={comicData.previousComic}
            onChange={newVal => onUpdate({ ...comicData, previousComic: newVal })}
            onValueCleared={() => onUpdate({ ...comicData, previousComic: undefined })}
            options={allComicOptions}
            title="Previous comic"
            name="previousComicId"
            placeholder="Leave blank if none"
            equalValueFunc={(a, b) => a.id === b?.id}
            mobileFullWidth
          />
          {comicData.previousComic && getComicLink(comicData.previousComic) && (
            <div className="mt-1">
              <ViewComicLink
                comic={comicData.previousComic}
                isAdminPanel={isAdminPanel}
              />
            </div>
          )}
        </div>

        <div className="w-full">
          <SearchableSelect
            value={comicData.nextComic}
            onChange={newVal => onUpdate({ ...comicData, nextComic: newVal })}
            onValueCleared={() => onUpdate({ ...comicData, nextComic: undefined })}
            options={allComicOptions}
            title="Next comic"
            name="nextComicId"
            placeholder="Leave blank if none"
            equalValueFunc={(a, b) => a.id === b?.id}
            mobileFullWidth
          />
          {comicData.nextComic && getComicLink(comicData.nextComic) && (
            <div className="mt-1">
              <ViewComicLink comic={comicData.nextComic} isAdminPanel={isAdminPanel} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function findArtistNameById(artists: ArtistTiny[], id: number) {
  const artist = artists.find(a => a.id === id);
  return artist ? artist.name : '';
}

function ViewArtistLink({
  artist,
  isAdminPanel,
}: {
  artist: ArtistTiny | undefined;
  isAdminPanel: boolean;
}) {
  if (!artist) return null;

  if (isAdminPanel) {
    if (isAdminPanel && !artist.isPending && !artist.isBanned) {
      return (
        <div className="flex flex-row gap-x-4 gap-y-0 flex-wrap">
          <Link
            href={`/admin/artists/${artist.id}`}
            text="View admin"
            IconRight={MdArrowForward}
          />
          <Link href={`/artist/${artist.name}`} text="View live" showRightArrow />
          {artist.e621Name && (
            <Link
              href={`https://e621.net/posts?tags=${artist.e621Name}`}
              text="e621"
              newTab
              IconRight={MdOpenInNew}
            />
          )}
        </div>
      );
    }
  }

  if (isAdminPanel) {
    return (
      <Link
        href={`/admin/artists/${artist.id}`}
        text="View admin"
        IconRight={MdArrowForward}
        className="ml-2"
      />
    );
  }

  if (!artist.isPending && !artist.isBanned) {
    return (
      <Link
        href={`/artist/${artist.name}`}
        text="View artist"
        IconRight={MdOpenInNew}
        newTab
      />
    );
  }

  return null;
}

function ViewComicLink({
  comic,
  isAdminPanel,
}: {
  comic: ComicTiny;
  isAdminPanel: boolean;
}) {
  if (isAdminPanel && comic.publishStatus === 'published') {
    return (
      <>
        <Link
          href={`/admin/comics/${comic.id}`}
          text="View admin"
          IconRight={MdArrowForward}
          className="ml-2"
        />
        <Link
          href={`/c/${comic.name}`}
          text="View live"
          showRightArrow
          className="ml-4"
        />
      </>
    );
  }

  if (isAdminPanel) {
    return (
      <Link
        href={`/admin/comics/${comic.id}`}
        text="View admin"
        IconRight={MdArrowForward}
        className="ml-2"
      />
    );
  }

  if (comic.publishStatus === 'published') {
    return (
      <Link
        href={`/c/${comic.name}`}
        text="View comic"
        IconRight={MdOpenInNew}
        newTab
        className="ml-2"
      />
    );
  }

  return null;
}
