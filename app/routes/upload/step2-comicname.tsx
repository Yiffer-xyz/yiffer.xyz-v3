import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import Checkbox from '~/components/Checkbox/Checkbox';
import InfoBox from '~/components/InfoBox';
import TextInput from '~/components/TextInput/TextInput';

type Step2ComicnameProps = {
  comicName: string;
  setIsLegalComicnameState: (isLegal: boolean) => void;
  onUpdate: (newData: string) => void;
};

export default function Step2Comicname({
  comicName,
  setIsLegalComicnameState, // todo set true when checked and ok and stuff
  onUpdate,
}: Step2ComicnameProps) {
  const fetcher = useFetcher();
  const [hasConfirmedNewComic, setHasConfirmedNewComic] = useState(false);
  const [similarComicNames, setSimilarComicNames] = useState<string[]>([]);
  const [existingComicWithSameName, setExistingComicWithSameName] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(onComicNameChange, [comicName]);

  useEffect(() => {
    if (fetcher.data && fetcher.data.length) {
      const comicExists = fetcher.data.some(
        (existingComicName: string) => existingComicName === comicName
      );
      setExistingComicWithSameName(comicExists);
      setSimilarComicNames(fetcher.data);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (existingComicWithSameName) {
      setIsLegalComicnameState(false);
    }
    if (similarComicNames.length === 0 && comicName.length > 2) {
      setIsLegalComicnameState(true);
    }
    if (similarComicNames.length && hasConfirmedNewComic) {
      setIsLegalComicnameState(true);
    }
    setIsLegalComicnameState(false);
  }, [existingComicWithSameName, hasConfirmedNewComic]);

  function onComicNameChange() {
    setIsLegalComicnameState(false);
    setHasConfirmedNewComic(false);
    setSimilarComicNames([]);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (comicName.length < 3) {
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetcher.submit(
        { comicName },
        { method: 'post', action: '/action/search-similar-comic' }
      );
    }, 1500);
  }

  return (
    <>
      <div className="flex flex-row gap-4 flex-wrap">
        <TextInput
          label="Comic name"
          name="comicName"
          value={comicName}
          onChange={onUpdate}
        />
      </div>

      {similarComicNames.length > 0 &&
        (existingComicWithSameName ? (
          <InfoBox
            variant="error"
            text="A comic with this name already exists. Please choose a different name, and make sure that you are not uploading an already existing comic."
            boldText={false}
            className="mt-2 w-fit"
          />
        ) : (
          <>
            {!hasConfirmedNewComic && (
              <InfoBox variant="warning" boldText={false} className="mt-2 w-fit">
                <p>The following existing comics have similar names:</p>
                <ul>
                  {similarComicNames.map((comicName: string) => (
                    <li key={comicName}>{comicName}</li>
                  ))}
                </ul>
              </InfoBox>
            )}

            <Checkbox
              label="I confirm that this comic does not already exist"
              checked={hasConfirmedNewComic}
              onChange={setHasConfirmedNewComic}
              className="mt-2"
            />
          </>
        ))}
    </>
  );
}
