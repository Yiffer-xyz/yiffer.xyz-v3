import type { PublicUser } from '~/types/types';
import Button from '../Buttons/Button';
import { FaSave } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { useMemo, useState } from 'react';
import Textarea from '../Textarea/Textarea';
import LinksEditor from '../LinksEditor/LinksEditor';
import { MAX_USER_BIO_LENGTH } from '~/types/constants';
import useWindowSize from '~/utils/useWindowSize';
import countryList from 'react-select-country-list';
import SearchableSelect from '../SearchableSelect/SearchableSelect';
import LoadingButton from '../Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function PublicProfileEdit({
  user,
  onFinish,
}: {
  user: PublicUser;
  onFinish: () => void;
}) {
  const { isMobile } = useWindowSize();

  const options = useMemo(
    () =>
      countryList()
        .getData()
        .map(country => ({
          text: country.label,
          value: country.value,
        })),
    []
  );

  const [editedUser, setEditedUser] = useState(user);

  const editFetcher = useGoodFetcher({
    url: `/api/edit-public-profile`,
    method: 'post',
    toastSuccessMessage: 'Profile updated',
    toastError: true,
    onFinish: () => {
      onFinish();
    },
  });

  async function onSaveEdit(newUser: PublicUser) {
    editFetcher.submit({ body: JSON.stringify(newUser) });
  }

  function onLinksChange(newLinks: string[]) {
    setEditedUser({ ...editedUser, publicProfileLinks: newLinks });
  }

  return (
    <div className="mt-2 mb-4 flex flex-col">
      <h3 className="text-lg font-bold">Edit profile</h3>
      <div className="flex flex-row gap-4 mt-2 mb-2">
        <Button variant="outlined" text="Cancel" startIcon={FaXmark} onClick={onFinish} />
        <LoadingButton
          text="Save profile"
          startIcon={FaSave}
          onClick={() => onSaveEdit(editedUser)}
          isLoading={editFetcher.isLoading}
        />
      </div>

      <Textarea
        value={editedUser.bio ?? ''}
        onChange={newText => setEditedUser({ ...editedUser, bio: newText })}
        name="bio"
        label="Bio"
        rows={isMobile ? 5 : 3}
        className="max-w-[500px] mt-4"
        placeholder="Describe yourself!"
      />
      {editedUser.bio && editedUser.bio.length > 0 && (
        <p className="text-xs mb-2">
          {editedUser.bio.length} / {MAX_USER_BIO_LENGTH}
        </p>
      )}

      <SearchableSelect
        title="Nationality"
        className="mt-4"
        options={options}
        value={editedUser.nationality}
        onChange={newNationality =>
          setEditedUser({ ...editedUser, nationality: newNationality })
        }
        placeholder="Find country"
        onValueCleared={() => setEditedUser({ ...editedUser, nationality: null })}
      />

      <p className="mb-0 font-semibold mt-8">Links</p>
      <p className="text-sm mb-2">
        Display up to 4 links - social media, websites, telegram handles, etc.
      </p>

      <LinksEditor
        links={editedUser.publicProfileLinks}
        onChange={onLinksChange}
        maxCount={4}
        variant="button-adding"
      />
    </div>
  );
}
