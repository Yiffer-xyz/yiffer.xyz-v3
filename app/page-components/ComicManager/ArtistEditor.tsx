import { useEffect, useRef, useState } from 'react';
import { MdDelete, MdOpenInNew } from 'react-icons/md';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import InfoBox from '~/ui-components/InfoBox';
import TextInput from '~/ui-components/TextInput/TextInput';
import type { SimilarArtistResponse } from '~/routes/api.search-similar-artist';
import type { Artist } from '~/types/types';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { NewArtist } from '~/routes/contribute_.upload/route';
import IconButton from '~/ui-components/Buttons/IconButton';
import e621Pic from '~/assets/misc/e621-instruction.png';
import Link from '~/ui-components/Link';

type ArtistEditorProps = {
  newArtistData: NewArtist;
  existingArtist?: Artist;
  onUpdate: (newData: NewArtist) => void;
  hideBorderTitle?: boolean;
  className?: string;
};

export default function ArtistEditor({
  newArtistData,
  existingArtist,
  onUpdate,
  hideBorderTitle = false,
  className = '',
}: ArtistEditorProps) {
  const similarArtistsFetcher = useGoodFetcher<SimilarArtistResponse>({
    url: '/api/search-similar-artist',
    method: 'post',
    onFinish: () => {
      setSimilarArtists(similarArtistsFetcher.data);
    },
  });

  const [similarArtists, setSimilarArtists] = useState<SimilarArtistResponse>();
  const [hasConfirmedNewArtist, setHasConfirmedNewArtist] = useState(false);
  const [noLinks, setNoLinks] = useState(false);
  const [isLinksError, setIsLinksError] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function updateArtist(newArtist: NewArtist) {
    onUpdate(newArtist);
  }

  // Fetch similar artists
  useEffect(() => {
    setHasConfirmedNewArtist(false);
    setSimilarArtists(undefined);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (
      newArtistData.artistName.length < 3 ||
      newArtistData.artistName === existingArtist?.name
    ) {
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const body = {
        artistName: newArtistData.artistName,
        ...(existingArtist && { excludeName: existingArtist.name }),
      };

      similarArtistsFetcher.submit(body);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newArtistData.artistName, existingArtist?.name]);

  function onLinkChanged(linkIndex: number, newVal: string) {
    const newLinks = [...newArtistData.links];
    newLinks[linkIndex] = newVal;
    onLinksChange(newLinks);
  }

  function onDeleteLink(linkIndex: number) {
    const newLinks = [...newArtistData.links];
    newLinks.splice(linkIndex, 1);
    onLinksChange(newLinks);
  }

  function onLinksChange(newLinks: string[]) {
    // Add new empty link if all links are filled
    if (newLinks.length > 0 && newLinks.every(l => l.length > 0)) {
      newLinks.push('');
    }

    if (!newLinks.every(l => l.length === 0)) {
      setNoLinks(false);
    }

    const isLinksError = newLinks.some(
      l => l.length && !l.startsWith('http://') && !l.startsWith('https://')
    );
    setIsLinksError(isLinksError);

    updateArtist({ ...newArtistData, links: newLinks, areLinksValid: !isLinksError });
  }

  // Update validity of name, as this data only exists here locally. All other validation is done in submit logic.
  useEffect(() => {
    let isLegal = false;

    if (similarArtists) {
      const isExactMatch =
        similarArtists.exactMatchArtist || similarArtists.exactMatchBannedArtist;
      const isAnyKindOfSimilarArtist =
        similarArtists.similarArtists.length > 0 ||
        similarArtists.similarBannedArtists.length > 0;

      if (!isExactMatch && newArtistData.artistName.length > 2) {
        isLegal = !isAnyKindOfSimilarArtist || hasConfirmedNewArtist;
      }
    }

    updateArtist({
      ...newArtistData,
      isValidName: isLegal,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [similarArtists, hasConfirmedNewArtist]);

  const isExactMatch =
    similarArtists &&
    (similarArtists.exactMatchArtist || similarArtists.exactMatchBannedArtist);

  const isAnySimilar =
    !isExactMatch &&
    similarArtists &&
    (similarArtists.similarArtists.length > 0 ||
      similarArtists.similarBannedArtists.length > 0);

  const uploadClassname = 'my-4 p-4 border border-4 border-theme1-primary flex flex-col';
  const adminPanelClassname = 'flex flex-col';

  return (
    <div
      className={`${
        hideBorderTitle ? adminPanelClassname : uploadClassname
      } ${className}`}
    >
      {!hideBorderTitle && <h3>New artist</h3>}

      <TextInput
        label="Artist name"
        name="artistName"
        value={newArtistData.artistName}
        onChange={newVal => updateArtist({ ...newArtistData, artistName: newVal })}
        className="max-w-full sm:max-w-[290px]"
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
            <InfoBox variant="warning" className="mt-2" boldText={false}>
              {similarArtists.similarArtists.length > 0 && (
                <>
                  <p>
                    The following existing artist names are somewhat similar to the one
                    you entered:
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
                    The artists are somewhat similar to the one you entered, and have been
                    banned or have requested their comics not be published here:
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

      <h4 className="mt-10">E621 and Patreon</h4>

      {!newArtistData.hasConfirmedNoE621Name && (
        <div className="flex flex-row gap-3 items-end">
          <TextInput
            label="E621 name"
            name="e621Name"
            value={newArtistData.e621Name}
            onChange={newVal => updateArtist({ ...newArtistData, e621Name: newVal })}
            className="mt-2 h-auto"
            helperText="Only the name - not the full link"
            placeholder='e.g. "meesh"'
            disabled={newArtistData.hasConfirmedNoE621Name}
            style={{ maxWidth: 240 }}
          />
          {newArtistData.e621Name && (
            <div className="mb-6">
              <Link
                href={`https://e621.net/posts?tags=${newArtistData.e621Name}`}
                text="View"
                newTab
                IconRight={MdOpenInNew}
              />
            </div>
          )}
        </div>
      )}

      <Checkbox
        label="Artist is not on e621 (this is unlikely!)"
        checked={!!newArtistData.hasConfirmedNoE621Name}
        onChange={newVal => {
          const newArtist = { ...newArtistData, hasConfirmedNoE621Name: newVal };
          if (newVal) {
            newArtist.e621Name = '';
          }
          updateArtist(newArtist);
        }}
        className="mt-2"
      />

      {!newArtistData.hasConfirmedNoPatreonName && (
        <div className="flex flex-row gap-3 items-end">
          <TextInput
            label="Patreon name"
            name="patreonName"
            value={newArtistData.patreonName}
            onChange={newVal => updateArtist({ ...newArtistData, patreonName: newVal })}
            className="mt-6 h-auto"
            helperText="Only the name - not the full link"
            placeholder='e.g. "meesh"'
            disabled={newArtistData.hasConfirmedNoPatreonName}
          />
          {newArtistData.patreonName && (
            <div className="mb-6">
              <Link
                href={`https://www.patreon.com/${newArtistData.patreonName}`}
                text="View"
                newTab
                IconRight={MdOpenInNew}
              />
            </div>
          )}
        </div>
      )}

      <Checkbox
        label="Artist is not on Patreon"
        checked={!!newArtistData.hasConfirmedNoPatreonName}
        onChange={newVal => {
          const newArtist = { ...newArtistData, hasConfirmedNoPatreonName: newVal };
          if (newVal) {
            newArtist.patreonName = '';
          }
          updateArtist(newArtist);
        }}
        className="mt-2"
      />

      <h4 className="mt-10">Other links - important!</h4>
      {!hideBorderTitle && (
        <p className="mb-4">
          It's important to be on good terms with artists. Links to their profiles are
          vital. If you do not provide any links, or vastly insufficient ones, the comic
          might be rejected. Any website links go below here. Examples: Twitter,
          FurAffinity, Inkbunny, personal websites, etc. Full URLs.
        </p>
      )}

      <p className="text-sm">
        <b>Tips for finding good links</b>: Check FurAffinity, and check the e621 artist
        page, by clicking the “?” next to the artist's name in the top left of any post
        tagged by them, as illustrated in the picture below. If you cannot find any other
        sites, make one last attempt by Googling "furry &lt;artist name&gt;".
      </p>

      <img src={e621Pic} alt="e621 instruction" className="mt-2" style={{ width: 260 }} />

      <div className="flex flex-col gap-2 mt-4">
        {!noLinks && (
          <>
            {newArtistData.links.map((link, i) => {
              const isLastLink = i === newArtistData.links.length - 1;
              return (
                <div
                  className={`flex flex-row -mt-1 items-end ${isLastLink ? 'mr-10' : ''}`}
                  key={i}
                >
                  <TextInput
                    key={i}
                    label={`Link:`}
                    name={`otherLink${i}`}
                    value={link}
                    placeholder="e.g. https://twitter.com/meesh"
                    onChange={newVal => onLinkChanged(i, newVal)}
                    className="mt-2 grow"
                    disabled={noLinks}
                  />

                  {!isLastLink && (
                    <IconButton
                      className="ml-2 mt-4"
                      color="primary"
                      variant="naked"
                      icon={MdDelete}
                      onClick={() => onDeleteLink(i)}
                    />
                  )}
                </div>
              );
            })}

            {isLinksError && (
              <InfoBox
                variant="error"
                className="mt-2"
                fitWidth
                text='Links must include "http://" or "https://"'
                showIcon
              />
            )}
          </>
        )}

        {newArtistData.links.every(l => l.length === 0) && (
          <Checkbox
            label="Artist has no links (extremely unlikely!)"
            checked={noLinks}
            onChange={setNoLinks}
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}
