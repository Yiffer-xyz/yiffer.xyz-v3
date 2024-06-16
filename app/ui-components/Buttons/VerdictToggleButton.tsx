import { MdCheck, MdClose } from 'react-icons/md';
import IconButton from './IconButton';

type Props = {
  value: boolean | null;
  onChange: (newVal: boolean) => void;
  small?: boolean;
  disableElevation?: boolean;
  className?: string;
};

export default function VerdictToggleButton({
  value,
  onChange,
  small,
  disableElevation = false,
  className = '',
}: Props) {
  const disabledClass = `
    dark:text-white dark:bg-gray-500 dark:hover:bg-gray-300 dark:focus:bg-gray-300
    text-white bg-gray-700 hover:bg-gray-600 focus:bg-gray-600
  `;

  const enabledNoClass = `
    text-white bg-red-weak-200 hover:bg-red-weak-100 focus:bg-red-weak-100
    dark:bg-red-strong-200 dark:hover:bg-red-strong-100 dark:focus:bg-red-strong-100
  `;

  const smallClassName = small ? '!w-7 !h-7' : '';

  return (
    <div className={`flex ${className}`}>
      <IconButton
        icon={MdCheck}
        variant="contained"
        color="primary"
        className={`${smallClassName} rounded-l rounded-r-none ${
          value === true ? '' : disabledClass
        }`}
        onClick={() => {
          if (value !== true) onChange(true);
        }}
        disableElevation={disableElevation}
      />
      <IconButton
        icon={MdClose}
        variant="contained"
        color="primary" // not really
        className={`${smallClassName} rounded-r rounded-l-none ${
          value === false ? enabledNoClass : disabledClass
        }`}
        onClick={() => {
          if (value !== false) onChange(false);
        }}
        disableElevation={disableElevation}
      />
    </div>
  );
}
