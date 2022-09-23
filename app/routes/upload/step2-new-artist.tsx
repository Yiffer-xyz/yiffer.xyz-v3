import { useEffect, useRef, useState } from 'react';
import Button from '~/components/Buttons/Button';
import Checkbox from '~/components/Checkbox/Checkbox';
import InfoBox from '~/components/InfoBox';
import TextInput from '~/components/TextInput/TextInput';
import { Artist } from '~/types/types';
import stringDistance from '~/utils/string-distance';
import { NewArtist, NewComicData } from '.';

type Step2NewArtistProps = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
  artists: Artist[];
};

function similarArtists(artists: Artist[], newArtistName: string) {
  if (newArtistName.length < 3) {
    return [];
  }
  return artists.filter(artist => {
    const dist = stringDistance(artist.name, newArtistName);
    return dist <= 2;
  });
}

export default function Step2NewArtist({
  artists,
  comicData,
  onUpdate,
}: Step2NewArtistProps) {
  const [similarArtistNames, setSimilarArtistNames] = useState<string[]>([]);
  const [hasConfirmedNewArtist, setHasConfirmedNewArtist] = useState(false);
  const [artistNotE621, setArtistNotE621] = useState(false);
  const [artistNotPatreon, setArtistNotPatreon] = useState(false);
  const [noLinks, setNoLinks] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function updateArtist(newArtist: NewArtist) {
    onUpdate({ ...comicData, newArtist: newArtist });
  }

  useEffect(() => {
    setHasConfirmedNewArtist(false);
    setSimilarArtistNames([]);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const similar = similarArtists(artists, comicData.newArtist.artistName);
      setSimilarArtistNames(similar.map(a => a.name));
    }, 1500);
  }, [comicData.newArtist.artistName]);

  useEffect(() => {
    // add new empty string link if all are filled
    const links = comicData.newArtist.links;
    if (links.length > 0 && links.every(l => l.length > 0)) {
      updateArtist({ ...comicData.newArtist, links: [...links, ''] });
    }
    if (!links.every(l => l.length === 0)) {
      setNoLinks(false);
    }
  }, [comicData.newArtist.links]);

  return (
    <div className="my-4 p-4 border border-4 border-theme1-primary flex flex-col">
      <h3>New artist</h3>
      <TextInput
        label="Artist name"
        name="artistName"
        value={comicData.newArtist.artistName}
        onChange={newVal => updateArtist({ ...comicData.newArtist, artistName: newVal })}
      />

      {similarArtistNames.length > 0 && (
        <>
          {!hasConfirmedNewArtist && (
            <InfoBox variant="warning" className="mt-2">
              <p>
                The following existing artist names are somewhat similar to the one you
                entered:
              </p>
              <ul>
                {similarArtistNames.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </InfoBox>
          )}

          <Checkbox
            label="I'm sure this is a new artist"
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
          onChange={newVal =>
            updateArtist({ ...comicData.newArtist, patreonName: newVal })
          }
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
        It's important to be on good terms with artists. Links to their profiles are
        vital. If you do not provide any links, or vastly insufficient ones, the comic
        might be rejected. Any website links go below here. Examples: Twitter,
        FurAffinity, Inkbunny, personal websites, etc. Full URLs.
      </p>

      <p className="mt-4">
        Tips for finding good links: Check FurAffinity, and check the e621 artist page, by
        clicking the “?” next to the artist's name in the top left of any post tagged by
        them, as illustrated in the picture below. If you cannot find any other sites,
        make one last attempt by Googling "furry &lt;artist name&gt;"".
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
