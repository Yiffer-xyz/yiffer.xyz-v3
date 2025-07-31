import type { PublicUser } from '~/types/types';
import Button from '../Buttons/Button';
import { FaSave } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { useMemo, useState } from 'react';
import Textarea from '../Textarea/Textarea';
import { MAX_USER_BIO_LENGTH } from '~/types/constants';
import useWindowSize from '~/utils/useWindowSize';
import countryList from 'react-select-country-list';
import SearchableSelect from '../SearchableSelect/SearchableSelect';
import LoadingButton from '../Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import SocialsEditor from '../SocialsEditor/SocialsEditor';

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
    toastError: true,
    onFinish: () => {
      onFinish();
    },
  });

  async function onSaveEdit(newUser: PublicUser) {
    const userToSubmit = {
      ...newUser,
      socialLinks: newUser.socialLinks.filter(
        social => social.platform.length > 0 && social.username.length > 0
      ),
    };
    editFetcher.submit({ body: JSON.stringify(userToSubmit) });
  }

  return (
    <div className="mt-2 mb-4 flex flex-col">
      <h3 className="font-bold">Edit profile</h3>
      <div className="flex flex-row gap-4 mt-2 mb-2">
        <Button variant="outlined" text="Cancel" startIcon={FaXmark} onClick={onFinish} />
        <LoadingButton
          text="Save profile"
          startIcon={FaSave}
          onClick={() => onSaveEdit(editedUser)}
          isLoading={editFetcher.isLoading}
        />
      </div>

      <p className="font-semibold mt-4">Bio</p>
      <Textarea
        value={editedUser.bio ?? ''}
        onChange={newText => setEditedUser({ ...editedUser, bio: newText })}
        name="bio"
        rows={isMobile ? 5 : 3}
        className="max-w-[500px]"
        placeholder="Describe yourself!"
      />
      {editedUser.bio && editedUser.bio.length > 0 && (
        <p className="text-xs mb-2">
          {editedUser.bio.length} / {MAX_USER_BIO_LENGTH}
        </p>
      )}

      <p className="font-semibold mt-8 -mb-2">Nationality</p>
      <SearchableSelect
        options={options}
        value={editedUser.nationality}
        onChange={newNationality =>
          setEditedUser({ ...editedUser, nationality: newNationality })
        }
        placeholder="Find country"
        onValueCleared={() => setEditedUser({ ...editedUser, nationality: null })}
      />

      <p className="font-semibold mt-12">Social links</p>

      {editedUser.socialLinks.length === 0 ? (
        <p className="text-sm mb-2">No social links yet</p>
      ) : (
        <p className="text-sm mb-4">
          Don't insert the full url - use the ID/username/etc only. For example, for a
          FurAffinity profile of "furaffinity.net/user/my-username", only insert
          "my-username".
        </p>
      )}

      <SocialsEditor
        value={editedUser.socialLinks}
        onChange={newSocials => setEditedUser({ ...editedUser, socialLinks: newSocials })}
      />
    </div>
  );
}
