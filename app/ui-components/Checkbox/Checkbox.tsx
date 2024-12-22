import { FaCheck } from 'react-icons/fa';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';

export type BaseCheckboxProps = {
  label?: string;
  disabled?: boolean;
  className?: string;
};

type ChecboxProps = BaseCheckboxProps & {
  checked: boolean;
  onChange: (newVal: boolean) => void;
};

// TODO figure out some UX-friendly way to indicate focus.
// Ideally, a theme1-primaryTrans background color on the square element.
// Might require some light javascript.

export default function Checkbox({
  label,
  checked,
  disabled,
  onChange,
  className = '',
  ...props
}: ChecboxProps) {
  // Maybe kinda hacky, but this is to prevent double state changes. It works.
  const [lastChange, setLastChange] = useState({
    type: '',
    time: 0,
  });

  const disabledClass = disabled ? 'text-gray-700' : 'hover:cursor-pointer';
  const fullClassname = `block relative select-none pl-7
    outline-none w-fit ${disabledClass} ${className} `;

  function onKeyPressed(keyEvent: KeyboardEvent<HTMLLabelElement>) {
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      onChange(!checked);
      setLastChange({
        type: 'key',
        time: Date.now(),
      });
    }
  }

  function onStateChange(newVal: boolean) {
    if (lastChange.type === 'key' && Date.now() - lastChange.time < 300) {
      return;
    }
    onChange(newVal);
    setLastChange({
      type: 'internal',
      time: Date.now(),
    });
  }

  return (
    <label
      className={fullClassname}
      {...props}
      onKeyPress={e => onKeyPressed(e)}
      style={{ minHeight: 22 }}
    >
      {label}

      <input
        type="checkbox"
        checked={checked}
        onChange={e => onStateChange(e.target.checked)}
        disabled={disabled}
        className="absolute opacity-0 cursor-pointer h-0 w-0 peer"
      />

      <span className="absolute top-[0.5px] left-0 h-[22px] w-[22px] border-[1.5px] border-gray-800 dark:border-gray-600 peer-focus:bg-theme1-primaryTrans rounded-sm flex justify-center items-center peer-disabled:bg-trans peer-disabled:bg-gray-900 dark:peer-disabled:border-gray-500 dark:peer-disabled:bg-gray-300">
        {checked && (
          <FaCheck
            className="mt-0.5 text-theme1-dark dark:text-theme1-primary"
            size={16}
          />
        )}
      </span>
    </label>
  );
}
