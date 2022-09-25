import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import Button from '~/components/Buttons/Button';
import Checkbox from '~/components/Checkbox/Checkbox';
import InfoBox from '~/components/InfoBox';
import TextInput from '~/components/TextInput/TextInput';
import { AnyKindOfArtist, NewArtist, NewComicData } from '.';
import { SimilarArtistResponse } from '../action/search-similar-artist';

type Step2NewArtistProps = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
  artists: AnyKindOfArtist[];
};

export default function Step2NewArtist({ comicData, onUpdate }: Step2NewArtistProps) {
  const similarArtistsFetcher = useFetcher();
  const [similarArtists, setSimilarArtists] = useState<SimilarArtistResponse>();
  const [hasConfirmedNewArtist, setHasConfirmedNewArtist] = useState(false);
  const [artistNotE621, setArtistNotE621] = useState(false);
  const [artistNotPatreon, setArtistNotPatreon] = useState(false);
  const [noLinks, setNoLinks] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (similarArtistsFetcher.data) {
      setSimilarArtists(similarArtistsFetcher.data);
    }
  }, [similarArtistsFetcher.data]);

  function updateArtist(newArtist: NewArtist) {
    onUpdate({ ...comicData, newArtist: newArtist });
  }

  useEffect(() => {
    setHasConfirmedNewArtist(false);
    setSimilarArtists(undefined);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (comicData.newArtist.artistName.length < 3) {
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      similarArtistsFetcher.submit(
        { artistName: comicData.newArtist.artistName },
        { method: 'post', action: '/action/search-similar-artist' }
      );
    }, 1000);
  }, [comicData.newArtist.artistName]);

  // Add new empty string link if all are filled
  useEffect(() => {
    const links = comicData.newArtist.links;
    if (links.length > 0 && links.every(l => l.length > 0)) {
      updateArtist({ ...comicData.newArtist, links: [...links, ''] });
    }
    if (!links.every(l => l.length === 0)) {
      setNoLinks(false);
    }
  }, [comicData.newArtist.links]);

  // Update validity of name, as this data only exists here locally. All other validation is done in submit logic.
  useEffect(() => {
    let isLegal = false;

    if (similarArtists) {
      const isExactMatch = similarArtists.exactMatchArtist || similarArtists.exactMatchBannedArtist;
      const isAnyKindOfSimilarArtist =
        similarArtists.similarArtists.length > 0 || similarArtists.similarBannedArtists.length > 0;

      if (!isExactMatch && comicData.newArtist.artistName.length > 2) {
        isLegal = !isAnyKindOfSimilarArtist || hasConfirmedNewArtist;
      }
    }

    onUpdate({ ...comicData, validation: { ...comicData.validation, isLegalNewArtist: isLegal } });
  }, [similarArtists, hasConfirmedNewArtist]);

  const isExactMatch =
    similarArtists && (similarArtists.exactMatchArtist || similarArtists.exactMatchBannedArtist);

  const isAnySimilar =
    !isExactMatch &&
    similarArtists &&
    (similarArtists.similarArtists.length > 0 || similarArtists.similarBannedArtists.length > 0);

  return (
    <div className="my-4 p-4 border border-4 border-theme1-primary flex flex-col">
      <h3>New artist</h3>
      <TextInput
        label="Artist name"
        name="artistName"
        value={comicData.newArtist.artistName}
        onChange={newVal => updateArtist({ ...comicData.newArtist, artistName: newVal })}
      />

      {isExactMatch && (
        <InfoBox
          variant="error"
          className="mt-2"
          text={
            similarArtists.exactMatchArtist
              ? 'An artist with this name already exists in the system'
              : 'An artist with this name has been banned or has requested their comics not be published here'
          }
        />
      )}

      {isAnySimilar && (
        <>
          {!hasConfirmedNewArtist && (
            <InfoBox variant="warning" className="mt-2">
              {similarArtists.similarArtists.length > 0 && (
                <>
                  <p>
                    The following existing artist names are somewhat similar to the one you entered:
                  </p>
                  <ul>
                    {similarArtists.similarArtists.map(name => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </>
              )}
              {similarArtists.similarBannedArtists.length > 0 && (
                <>
                  <p>
                    The artists are somewhat similar to the one you entered, and have been banned or
                    have requested their comics not be published here:
                  </p>
                  <ul>
                    {similarArtists.similarBannedArtists.map(name => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </>
              )}
            </InfoBox>
          )}

          <Checkbox
            label="This is not one of the above artists"
            checked={hasConfirmedNewArtist}
            onChange={setHasConfirmedNewArtist}
            className="mt-2"
          />
        </>
      )}

      <h4 className="mt-8">E621 and Patreon</h4>

      {!artistNotE621 && (
        <TextInput
          label="E621 name"
          name="e621Name"
          value={comicData.newArtist.e621Name}
          onChange={newVal => updateArtist({ ...comicData.newArtist, e621Name: newVal })}
          className="mt-2"
          helperText="Only the name - not the full link"
          placeholder='e.g. "braeburned"'
          disabled={artistNotE621}
        />
      )}

      <Checkbox
        label="Artist is not on e621 (this is unlikely!)"
        checked={artistNotE621}
        onChange={newVal => {
          setArtistNotE621(newVal);
          if (newVal) {
            updateArtist({ ...comicData.newArtist, e621Name: '' });
          }
        }}
        className="mt-2"
      />

      {!artistNotPatreon && (
        <TextInput
          label="Patreon name"
          name="patreonName"
          value={comicData.newArtist.patreonName}
          onChange={newVal => updateArtist({ ...comicData.newArtist, patreonName: newVal })}
          className="mt-4"
          helperText="Only the name - not the full link"
          placeholder='e.g. "braeburned"'
          disabled={artistNotPatreon}
        />
      )}

      <Checkbox
        label="Artist is not on Patreon"
        checked={artistNotPatreon}
        onChange={newVal => {
          setArtistNotPatreon(newVal);
          if (newVal) {
            updateArtist({ ...comicData.newArtist, patreonName: '' });
          }
        }}
        className="mt-2"
      />

      <h4 className="mt-8">Other links</h4>
      <p>
        It's important to be on good terms with artists. Links to their profiles are vital. If you
        do not provide any links, or vastly insufficient ones, the comic might be rejected. Any
        website links go below here. Examples: Twitter, FurAffinity, Inkbunny, personal websites,
        etc. Full URLs.
      </p>

      <p className="mt-4">
        Tips for finding good links: Check FurAffinity, and check the e621 artist page, by clicking
        the “?” next to the artist's name in the top left of any post tagged by them, as illustrated
        in the picture below. If you cannot find any other sites, make one last attempt by Googling
        "furry &lt;artist name&gt;"".
      </p>

      <p>!!!!e621 pic here!!!!</p>

      <div className="flex flex-col gap-2 mt-4">
        {!noLinks && (
          <>
            {comicData.newArtist.links.map((link, i) => (
              <div className="flex flex-row -mt-1 items-end">
                <TextInput
                  key={i}
                  label={`Link:`}
                  name={`otherLink${i}`}
                  value={link}
                  placeholder="e.g. https://twitter.com/braeburned"
                  onChange={newVal => {
                    const newLinks = [...comicData.newArtist.links];
                    newLinks[i] = newVal;
                    updateArtist({ ...comicData.newArtist, links: newLinks });
                  }}
                  className="mt-2 grow"
                  disabled={noLinks}
                />

                {comicData.newArtist.links.length > 1 && (
                  <Button
                    className="ml-2 mt-4 h-fit"
                    color="primary"
                    variant="outlined"
                    text="del"
                    onClick={() => {
                      const newLinks = [...comicData.newArtist.links];
                      newLinks.splice(i, 1);
                      updateArtist({ ...comicData.newArtist, links: newLinks });
                    }}
                  />
                )}
              </div>
            ))}
          </>
        )}

        {comicData.newArtist.links.every(l => l.length === 0) && (
          <Checkbox
            label="Artist has no other links (unlikely!)"
            checked={noLinks}
            onChange={setNoLinks}
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}
