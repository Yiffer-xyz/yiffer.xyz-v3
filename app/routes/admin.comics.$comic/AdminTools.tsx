import { useState } from 'react';
import type { Comic } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function AdminTools({ comic }: { comic: Comic }) {
  const [isUnlisting, setIsUnlisting] = useState(false);
  const [unlistComment, setUnlistComment] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const unlistFetcher = useGoodFetcher({
    url: '/api/admin/unlist-comic',
    method: 'post',
    toastSuccessMessage: 'Comic unlisted',
    onFinish: cancelUnlisting,
  });

  const deleteFetcher = useGoodFetcher({
    url: '/api/admin/delete-comic',
    method: 'post',
    toastSuccessMessage: 'Comic deleted',
  });

  function unlistComic() {
    unlistFetcher.submit({ comicId: comic.id.toString(), unlistComment: unlistComment });
  }

  function cancelUnlisting() {
    setIsUnlisting(false);
    setUnlistComment('');
  }

  function deleteComic() {
    deleteFetcher.submit({ comicId: comic.id.toString() });
  }

  return (
    <div className="mt-8 pb-16">
      <h3>Admin tools</h3>

      {!isUnlisting && !isDeleting && (
        <div className="flex flex-row gap-2 flex-wrap">
          {comic.publishStatus !== 'unlisted' && (
            <Button
              text="Unlist comic"
              className="mt-2"
              onClick={() => setIsUnlisting(true)}
              color="error"
            />
          )}
          <Button
            text="Delete comic"
            className="mt-2"
            onClick={() => setIsDeleting(true)}
            color="error"
          />
        </div>
      )}

      {isUnlisting && (
        <div className="mt-2">
          <h4>Unlist comic</h4>
          <p className="mb-1">
            This is to be used when the comic exists live, but should be taken down for
            some reason. For example, if the artist requests it, or if the quality is
            deemed too low. Do not use if the comic is not published yet.
          </p>
          <TextInput
            label="Reason for unlisting"
            value={unlistComment}
            onChange={setUnlistComment}
            className="mb-2 max-w-lg"
            name="unlistComment"
          />
          <div className="flex flex-row gap-2 mt-2">
            <Button text="Cancel" onClick={cancelUnlisting} variant="outlined" />
            <LoadingButton
              text="Confirm unlisting"
              isLoading={unlistFetcher.isLoading}
              onClick={unlistComic}
              color="error"
            />
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="mt-2">
          <h4>Delete comic</h4>
          <p>
            Should usually only be done before a comic is published. Another use case is
            if the comic is a duplicate - though usually, comic ratings and bookmarks
            should be manually transferred before deleting (ask Melon).
          </p>
          <div className="flex flex-row gap-2 mt-1">
            <Button
              text="Cancel, keep comic"
              onClick={() => setIsDeleting(false)}
              variant="outlined"
            />
            <LoadingButton
              text="Delete comic"
              isLoading={deleteFetcher.isLoading}
              onClick={deleteComic}
              color="error"
            />
          </div>
        </div>
      )}
    </div>
  );
}
