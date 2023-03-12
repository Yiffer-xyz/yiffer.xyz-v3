import { useEffect, useMemo, useState } from 'react';
import { MdCheck, MdReplay } from 'react-icons/md';
import { useFetcher } from 'react-router-dom';
import ArtistEditor from '~/components/ArtistEditor';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import { NewArtist } from '~/routes/contribute/upload';
import { useNavigate } from '@remix-run/react';

const emptyNewArtist: NewArtist = {
  artistName: '',
  e621Name: '',
  patreonName: '',
  links: [''],
  isValidName: false,
  hasConfirmedNoE621Name: false,
  hasConfirmedNoPatreonName: false,
};

export type NewArtistData = {
  artistName: string;
  e621Name?: string;
  patreonName?: string;
  links: string[];
};

export default function AddNewArtist({}) {
  const fetcher = useFetcher();
  const [artist, setArtist] = useState<NewArtist>(emptyNewArtist);
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.artistId) {
      navigate(`/admin/artists/${fetcher.data.artistId}`);
    }
  }, [fetcher]);

  const canSave = useMemo(() => {
    if (!artist.isValidName) return false;
    if (!artist.e621Name && !artist.hasConfirmedNoE621Name) {
      return false;
    }
    if (!artist.patreonName && !artist.hasConfirmedNoPatreonName) {
      return false;
    }

    return true;
  }, [artist]);

  function saveChanges() {
    const body: NewArtistData = {
      artistName: artist.artistName,
      e621Name: artist.e621Name,
      patreonName: artist.patreonName,
      links: artist.links.filter(link => link),
    };

    fetcher.submit(
      { body: JSON.stringify(body) },
      {
        method: 'post',
        action: '/api/admin/create-artist',
      }
    );
  }

  return (
    <>
      <h1>New artist</h1>
      <ArtistEditor
        newArtistData={artist}
        onUpdate={setArtist}
        hideBorderTitle
        className="max-w-3xl"
      />

      {fetcher.data?.error && (
        <InfoBox
          variant="error"
          className="mt-4 w-fit"
          text={fetcher.data.error}
          showIcon
        />
      )}

      <div className="flex flex-row gap-2 mt-8">
        <Button
          variant="outlined"
          text="Reset"
          onClick={() => setArtist(emptyNewArtist)}
          startIcon={MdReplay}
        />
        <LoadingButton
          text="Create artist"
          isLoading={fetcher.state === 'submitting'}
          onClick={saveChanges}
          startIcon={MdCheck}
          disabled={!canSave}
        />
      </div>
    </>
  );
}
