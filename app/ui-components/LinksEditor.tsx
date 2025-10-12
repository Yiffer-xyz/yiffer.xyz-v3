import { useState } from 'react';
import TextInput from './TextInput/TextInput';
import { MdAdd, MdDelete } from 'react-icons/md';
import IconButton from './Buttons/IconButton';
import InfoBox from './InfoBox';
import Button from './Buttons/Button';

export default function LinksEditor({
  links,
  onChange,
  variant,
  onIsError,
  disabled,
  placeholder,
  maxCount,
  inputLabel,
}: {
  links: string[];
  onChange: (newLinks: string[]) => void;
  variant: 'auto-adding' | 'button-adding';
  onIsError?: (isError: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxCount?: number;
  inputLabel?: string;
}) {
  const [isError, setIsError] = useState(false);
  const isAtMax = maxCount && links.length >= maxCount;
  const hasEmptyLink = links.some(l => l.length === 0);

  function onLinkChanged(linkIndex: number, newVal: string) {
    const newLinks = [...links];
    newLinks[linkIndex] = newVal;
    onLinksChange(newLinks);
  }

  function onDeleteLink(linkIndex: number) {
    const newLinks = [...links];
    newLinks.splice(linkIndex, 1);
    onLinksChange(newLinks);
  }

  function onAddEmptyLink() {
    const newLinks = [...links];
    newLinks.push('');
    onLinksChange(newLinks);
  }

  function onLinksChange(newLinks: string[]) {
    // Add new empty link if all links are filled
    if (variant === 'auto-adding' && newLinks.every(l => l.length > 0) && !isAtMax) {
      newLinks.push('');
    }

    const isLinksError = newLinks.some(
      l => l.length && !l.startsWith('http://') && !l.startsWith('https://')
    );
    setIsError(isLinksError);
    onIsError?.(isLinksError);
    onChange(newLinks);
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {links.map((link, i) => {
          const isLastLink = i === links.length - 1;

          return (
            <div
              className={`flex flex-row -mt-1 items-end ${isLastLink && variant === 'auto-adding' ? 'mr-10' : ''}`}
              key={i}
            >
              <TextInput
                key={i}
                label={inputLabel}
                name={`link-${i}`}
                value={link}
                placeholder={placeholder}
                onChange={newVal => onLinkChanged(i, newVal)}
                className="mt-2 grow"
                disabled={disabled}
              />

              {(!isLastLink || variant === 'button-adding') && (
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
      </div>

      {isError && (
        <InfoBox
          variant="error"
          className="mt-4"
          fitWidth
          text='Links must start "http://" or "https://"'
          showIcon
        />
      )}

      {variant === 'button-adding' && !isAtMax && (
        <Button
          text="Link"
          onClick={onAddEmptyLink}
          startIcon={MdAdd}
          variant="outlined"
          className={links.length > 0 ? 'mt-4' : ''}
          disabled={hasEmptyLink}
        />
      )}
    </>
  );
}
