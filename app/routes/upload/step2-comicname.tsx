import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import Checkbox from '~/components/Checkbox/Checkbox';
import InfoBox from '~/components/InfoBox';
import TextInput from '~/components/TextInput/TextInput';
import { SimilarComicResponse } from '../action/search-similar-comic';

type Step2ComicnameProps = {
  comicName: string;
  setIsLegalComicnameState: (isLegal: boolean) => void;
  onUpdate: (newData: string) => void;
};

export default function Step2Comicname({
  comicName,
  setIsLegalComicnameState, // For parent component, validation
  onUpdate,
}: Step2ComicnameProps) {
  const similarComicsFetcher = useFetcher();
  const [similarComics, setSimilarComics] = useState<SimilarComicResponse>();
  const [hasConfirmedNewComic, setHasConfirmedNewComic] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(onComicNameChange, [comicName]);

  useEffect(() => {
    if (similarComicsFetcher.data) {
      setSimilarComics(similarComicsFetcher.data);
    }
  }, [similarComicsFetcher.data]);

  // Update validity of name, as this data only exists here locally. All other validation is done in submit logic.
  useEffect(() => {
    if (!similarComics) {
      setIsLegalComicnameState(false);
      return;
    }
    const isExactMath = similarComics.exactMatchComic || similarComics.exactMatchRejectedComic;
    const isAnySimilar =
      similarComics.similarComics.length > 0 || similarComics.similarRejectedComics.length > 0;

    let isLegal = false;
    if (!isExactMath && comicName.length > 2) {
      isLegal = !isAnySimilar || hasConfirmedNewComic;
    }

    setIsLegalComicnameState(isLegal);
  }, [similarComics, hasConfirmedNewComic]);

  function onComicNameChange() {
    setIsLegalComicnameState(false);
    setHasConfirmedNewComic(false);
    setSimilarComics(undefined);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (comicName.length < 3) {
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      similarComicsFetcher.submit(
        { comicName },
        { method: 'post', action: '/action/search-similar-comic' }
      );
    }, 1000);
  }

  const isExactMath = similarComics?.exactMatchComic || similarComics?.exactMatchRejectedComic;
  const isAnySimilar =
    similarComics &&
    !isExactMath &&
    (similarComics.similarComics.length > 0 || similarComics.similarRejectedComics.length > 0);

  return (
    <>
      <div className="flex flex-row gap-4 flex-wrap">
        <TextInput label="Comic name" name="comicName" value={comicName} onChange={onUpdate} />
      </div>

      {similarComics && (
        <>
          {isAnySimilar && (
            <>
              {!hasConfirmedNewComic && (
                <InfoBox variant="warning" boldText={false} className="mt-2 w-fit">
                  {similarComics.similarComics.length > 0 && (
                    <>
                      <p>The following comics with similar names already exist in the system:</p>
                      <ul>
                        {similarComics.similarComics.map((comicName: string) => (
                          <li key={comicName}>{comicName}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {similarComics.similarRejectedComics.length > 0 && (
                    <>
                      <p>
                        The following comics with similar names have been rejected. If one of these
                        is your comic, do not upload it:
                      </p>
                      <ul>
                        {similarComics.similarRejectedComics.map((comicName: string) => (
                          <li key={comicName}>{comicName}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </InfoBox>
              )}

              <Checkbox
                label="This is not one of the above comics"
                checked={hasConfirmedNewComic}
                onChange={setHasConfirmedNewComic}
                className="mt-2"
              />
            </>
          )}

          {similarComics.exactMatchComic && (
            <InfoBox
              text="A comic with this name already exists in the system. You cannot submit this comic name."
              variant="error"
              className="mt-2 w-fit"
            />
          )}
          {similarComics.exactMatchRejectedComic && (
            <InfoBox
              text="A comic with this name has been rejected. You cannot submit this comic name."
              variant="error"
              className="mt-2 w-fit"
            />
          )}
        </>
      )}
    </>
  );
}
