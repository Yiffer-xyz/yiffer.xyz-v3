import Button from './Button';

type Props<T> = {
  buttons: {
    text: string;
    value: T;
  }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
};

function getButtonRoundedClass(i: number, numButtons: number) {
  if (i === 0) return 'rounded-r-none';
  if (i === numButtons - 1) return 'rounded-l-none';
  return 'rounded-none';
}

export default function ToggleButton<T>({
  buttons,
  value,
  onChange,
  className = '',
  disabled = false,
}: Props<T>) {
  const disabledActiveClass = `from-theme1-dark-faded to-theme2-dark-faded
    dark:from-theme1-dark-faded dark:to-theme2-dark-faded`;

  const enabledClass = `
    dark:text-gray-100 text-gray-100 bg-linear-to-r from-theme1-dark to-theme2-dark
    dark:from-theme1-darker dark:to-theme2-darker ${disabled ? disabledActiveClass : ''}
  `;
  const disabledClass = `
    dark:text-white dark:bg-gray-500 dark:hover:bg-gray-300 dark:focus:bg-gray-300
    text-white bg-gray-700 hover:bg-gray-600 focus:bg-gray-600
  `;

  return (
    <div className={`flex ${className}`}>
      {buttons.map((button, i) => (
        <Button
          key={button.text}
          text={button.text}
          variant="contained"
          color="primary"
          className={
            getButtonRoundedClass(i, buttons.length) +
            disabledClass +
            (value === button.value ? enabledClass : '')
          }
          disabled={disabled}
          onClick={() => {
            if (button.value !== value) onChange(button.value);
          }}
        />
      ))}
    </div>
  );
}
