import { useEffect, useRef, useState } from 'react';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import InfoBox from '~/ui-components/InfoBox';
import TextInput from '~/ui-components/TextInput/TextInput';
import type { Comic } from '~/types/types';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { SimilarComicResponse } from '~/routes/api.search-similarly-named-comic';

type ComicNameEditor = {
  comicName: string;
  setIsLegalComicnameState: (isLegal: boolean) => void;
  onUpdate: (newData: string) => void;
  existingComic?: Comic;
};

export default function ComicNameEditor({
  comicName,
  setIsLegalComicnameState, // For parent component, validation
  onUpdate,
  existingComic,
}: ComicNameEditor) {
  const similarComicsFetcher = useGoodFetcher<SimilarComicResponse>({
    url: '/api/search-similarly-named-comic',
    method: 'post',
    onFinish: () => {
      setSimilarComics(similarComicsFetcher.data);
    },
  });
  const [similarComics, setSimilarComics] = useState<SimilarComicResponse>();
  const [hasConfirmedNewComic, setHasConfirmedNewComic] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onComicNameChange, [comicName]);

  // Update validity of name, as this data only exists here locally. All other validation is done in submit logic.
  useEffect(() => {
    if (!similarComics) {
      setIsLegalComicnameState(false);
      return;
    }
    const isExactMatch =
      similarComics.exactMatchComic || similarComics.exactMatchRejectedComic;
    const isAnySimilar =
      similarComics.similarComics.length > 0 ||
      similarComics.similarRejectedComics.length > 0;

    let isLegal = false;
    if (!isExactMatch && comicName.length > 2) {
      isLegal = !isAnySimilar || hasConfirmedNewComic;
    }

    setIsLegalComicnameState(isLegal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [similarComics, hasConfirmedNewComic]);

  function onComicNameChange() {
    setIsLegalComicnameState(false);
    setHasConfirmedNewComic(false);
    setSimilarComics(undefined);

    if (existingComic && existingComic.name === comicName) {
      setIsLegalComicnameState(true);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (comicName.length < 3) {
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const body = {
        comicName,
        ...(existingComic && { excludeName: existingComic.name }),
      };
      similarComicsFetcher.submit(body);
    }, 1000);
  }

  const isExactMath =
    similarComics?.exactMatchComic || similarComics?.exactMatchRejectedComic;
  const isAnySimilar =
    similarComics &&
    !isExactMath &&
    (similarComics.similarComics.length > 0 ||
      similarComics.similarRejectedComics.length > 0);

  return (
    <>
      <TextInput
        label="Comic name"
        name="comicName"
        value={comicName}
        onChange={onUpdate}
        className="w-full md:w-[350px]"
      />

      {similarComics && (
        <>
          {isAnySimilar && (
            <>
              {!hasConfirmedNewComic && (
                <InfoBox variant="warning" boldText={false} className="mt-2 w-fit">
                  {similarComics.similarComics.length > 0 && (
                    <>
                      <p>
                        The following comics with similar names already exist in the
                        system:
                      </p>
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
                        The following comics with similar names have been rejected. If one
                        of these is your comic, do not upload it:
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
              text={`A comic with this name already exists in the system. You cannot submit this comic name. If you think this is a different comic with the same name, you can add "(<artistname>)" to the end of the comic's name. Please verify that this is not a duplicate before submitting.`}
              variant="error"
              fitWidth
              className="mt-2"
            />
          )}
          {similarComics.exactMatchRejectedComic && (
            <InfoBox
              text="A comic with this name has been rejected. You cannot submit this comic name."
              variant="error"
              fitWidth
              className="mt-2"
            />
          )}
        </>
      )}
    </>
  );
}
