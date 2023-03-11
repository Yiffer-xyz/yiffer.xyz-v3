import { useEffect, useState } from 'react';
import { MdArrowForward, MdArrowRight, MdCheckCircle, MdForward } from 'react-icons/md';
import { useFetcher } from 'react-router-dom';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import TextInput from '~/components/TextInput/TextInput';
import { Comic, UserSession } from '~/types/types';

type LiveComicProps = {
  comic: Comic;
  user: UserSession;
  updateComic: () => void;
};

export default function LiveComic({ comic, user, updateComic }: LiveComicProps) {
  const unlistFetcher = useFetcher();
  const [isUnlisting, setIsUnlisting] = useState(false);
  const [unlistComment, setUnlistComment] = useState('');

  useEffect(() => {
    if (unlistFetcher.data?.success) {
      updateComic();
    }
  }, [unlistFetcher]);

  function unlistComic() {
    unlistFetcher.submit(
      { comicId: comic.id.toString(), unlistComment: unlistComment },
      { method: 'post', action: '/api/admin/unlist-comic' }
    );
  }

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

      <pre className="mt-32">{JSON.stringify(comic, null, 2)}</pre>
    </>
  );
}
