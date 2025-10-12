import { useMemo } from 'react';
import { SOCIALS } from '~/types/constants';
import Select from './Select/Select';
import TextInput from './TextInput/TextInput';
import IconButton from './Buttons/IconButton';
import { MdAdd, MdDelete } from 'react-icons/md';
import Button from './Buttons/Button';
import InfoBox from './InfoBox';
import type { UserSocialAccount } from '~/types/types';

export default function SocialsEditor({
  value,
  onChange,
}: {
  value: UserSocialAccount[];
  onChange: (value: UserSocialAccount[]) => void;
}) {
  function onNewSocialChange(
    index: number,
    key: 'platform' | 'username',
    newValue: string
  ) {
    const newSocials2 = [...value];
    newSocials2[index][key] = newValue;
    onChange(newSocials2);
  }

  function onNewSocialDelete(index: number) {
    const newSocials2 = [...value];
    newSocials2.splice(index, 1);
    onChange(newSocials2);
  }

  const availableSocials = useMemo(
    () => SOCIALS.filter(s => !value.find(v => v.platform === s.platform)),
    [value]
  );

  return (
    <>
      {value.length > 0 && (
        <div className="flex flex-col gap-4 mt-1">
          {value.map((option, index) => (
            <div className="flex flex-row gap-2 items-center" key={option.platform}>
              <Select
                minWidth={110}
                options={[
                  { text: option.platform, value: option.platform },
                  ...availableSocials.map(s => ({ text: s.platform, value: s.platform })),
                ]}
                onChange={value => onNewSocialChange(index, 'platform', value)}
                value={option.platform}
                name="newSocialPlatform"
                title="Platform"
              />
              <TextInput
                value={option.username}
                onChange={value => onNewSocialChange(index, 'username', value)}
                name="newSocialName"
                label="Username/ID"
              />
              <IconButton
                icon={MdDelete}
                onClick={() => onNewSocialDelete(index)}
                variant="naked"
                className="mt-4"
              />
            </div>
          ))}
        </div>
      )}

      {value.some(v => v.username.includes('@')) && (
        <InfoBox
          variant="error"
          boldText={false}
          text={`Don't include "@" in usernames.`}
          className="mt-4 w-full sm:w-fit"
        />
      )}

      {availableSocials.length > 0 && (
        <Button
          startIcon={MdAdd}
          text="Add"
          className={value.length > 0 ? 'mt-4' : ''}
          onClick={() => {
            onChange([...value, { username: '', platform: '' }]);
          }}
        />
      )}
    </>
  );
}
