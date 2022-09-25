import { useMemo, useState } from 'react';
import CheckboxUncontrolled from '~/components/Checkbox/CheckboxUncontrolled';
import SearchableSelect from '~/components/SearchableSelect/SearchableSelect';
import Select from '~/components/Select/Select';
import { AnyKindOfArtist, AnyKindOfComic, NewComicData } from '.';
import Step2Comicname from './step2-comicname';
import Step2NewArtist from './step2-new-artist';

const categoryOptions = ['M', 'F', 'MF', 'MM', 'FF', 'MF+', 'I'].map(c => ({
  value: c,
  text: c,
}));
const classificationOptions = ['Furry', 'Pokemon', 'MLP', 'Other'].map(c => ({
  value: c,
  text: c,
}));
const stateOptions = ['Finished', 'WIP', 'Cancelled'].map(c => ({
  value: c,
  text: c,
}));

type Step2Props = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
  artists: AnyKindOfArtist[];
  comics: AnyKindOfComic[];
};

export default function Step2ComicData({ artists, comics, comicData, onUpdate }: Step2Props) {
  const [artistNotInList, setArtistNotInList] = useState(false);

  const artistOptions = useMemo(() => artists.map(a => ({ value: a.id, text: a.name })), [artists]);

  const allComicOptions = useMemo(() => {
    return comics.map(c => {
      if (c.isPending) {
        return { value: c, text: c.comicName + ' (PENDING)' };
      }
      if (c.isUpload) {
        return { value: c, text: c.comicName + ' (UPLOADED)' };
      }
      return { value: c, text: c.comicName };
    });
  }, []);

  return (
    <>
      <Step2Comicname
        comicName={comicData.comicName}
        setIsLegalComicnameState={isLegal =>
          onUpdate({
            ...comicData,
            validation: { ...comicData.validation, isLegalComicName: isLegal },
          })
        }
        onUpdate={newVal => onUpdate({ ...comicData, comicName: newVal })}
      />

      <div className="flex flex-row flex-wrap mt-6 items-end gap-4">
        <SearchableSelect
          value={comicData.artistId}
          onChange={newVal => onUpdate({ ...comicData, artistId: newVal })}
          onValueCleared={() => onUpdate({ ...comicData, artistId: undefined })}
          options={artistOptions}
          disabled={artistNotInList}
          title="Artist"
          name="artistId"
        />
        <CheckboxUncontrolled
          label="Artist is not in the list"
          name="artistNotInList"
          onChange={newVal => {
            setArtistNotInList(newVal);
            if (newVal === true) {
              onUpdate({ ...comicData, artistId: undefined });
            }
          }}
        />
      </div>

      {artistNotInList && (
        <Step2NewArtist artists={artists} comicData={comicData} onUpdate={onUpdate} />
      )}

      <div className="flex flex-row flex-wrap gap-4 mt-8">
        <Select
          title="Category"
          name="language"
          value={comicData.category}
          onChange={newVal => onUpdate({ ...comicData, category: newVal })}
          options={categoryOptions}
        />

        <Select
          title="Classification"
          name="classification"
          value={comicData.classification}
          onChange={newVal => onUpdate({ ...comicData, classification: newVal })}
          options={classificationOptions}
        />

        <Select
          title="State"
          name="state"
          value={comicData.state}
          onChange={newVal => onUpdate({ ...comicData, state: newVal })}
          options={stateOptions}
        />
      </div>

      <div style={{ fontSize: '0.75rem' }} className="mt-2">
        <p>M, F: Male only, female only.</p>
        <p>MF: One male on one female.</p>
        <p>MM, FF: Two or more males or females together.</p>
        <p>MF+: One or more male on one or more female action.</p>
        <p>I: Anything involving intersex characters or nonbinary genders.</p>
      </div>

      <h4 className="mt-8">Connected comics</h4>
      <p>
        If this is a standalone comic, leave these fields empty. If it's part of a series, fill in
        the previous and/or next comics.
      </p>
      <p>
        If you are uploading multiple chapters of a series, you can leave the "next comic" empty and
        only fill in the previous comic for each.
      </p>

      <div className="flex flex-row flex-wrap gap-4 mt-2">
        <SearchableSelect
          value={comicData.previousComic}
          onChange={newVal => onUpdate({ ...comicData, previousComic: newVal })}
          onValueCleared={() => onUpdate({ ...comicData, previousComic: undefined })}
          options={allComicOptions}
          title="Previous comic"
          name="previousComicId"
          placeholder="Leave blank if none"
          mobileCompact
        />
        <SearchableSelect
          value={comicData.nextComic}
          onChange={newVal => onUpdate({ ...comicData, nextComic: newVal })}
          onValueCleared={() => onUpdate({ ...comicData, nextComic: undefined })}
          options={allComicOptions}
          title="Next comic"
          name="nextComicId"
          placeholder="Leave blank if none"
          mobileCompact
        />
      </div>
    </>
  );
}
