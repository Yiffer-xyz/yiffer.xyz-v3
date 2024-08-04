import { MdClear } from 'react-icons/md';
import type { HTMLAttributes } from 'react';
import { useMemo } from 'react';
import { colors } from 'tailwind.config';

export type BaseTextInputProps = {
  label?: string;
  name?: string;
  type?: 'text' | 'password';
  autocomplete?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  helperText?: string;
  errorText?: string;
  error?: boolean;
  className?: HTMLAttributes<HTMLDivElement>['className'];
  style?: React.CSSProperties;
};

type FullTextInputProps = {
  value: string;
  onChange: (newVal: string) => void;
  onBlur?: () => void;
} & BaseTextInputProps;

export default function TextInput({
  value,
  onChange,
  label,
  name,
  type = 'text',
  autocomplete,
  placeholder,
  disabled = false,
  clearable = false,
  helperText = '',
  errorText = '',
  error = false,
  className = '',
  onBlur,
  ...props
}: FullTextInputProps) {
  function clear() {
    onChange('');
  }
  const borderClass = useMemo(() => {
    if (error) {
      return 'border-red-strong-300';
    }
    if (disabled) {
      return 'border-gray-800 dark:border-gray-600';
    }
    return '';
  }, [error, disabled]);

  const borderStyle = borderClass
    ? ''
    : {
        borderImage: `linear-gradient(to right, ${colors.theme1.primary}, ${colors.theme2.primary}) 1`,
      };

  return (
    <div
      className={`flex flex-col ${label ? 'pt-3' : ''} h-9 leading-9 box-content relative ${className}`}
      {...props}
    >
      {label && (
        <label
          className={`${
            error ? 'text-red-strong-300' : ''
          } text-sm absolute top-0 left-1`}
        >
          {label}
        </label>
      )}
      <div className={`-mt-1 relative`}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          type={type}
          name={name}
          autoComplete={autocomplete || undefined}
          placeholder={placeholder}
          disabled={disabled}
          className={`text-text-light dark:text-text-dark bg-transparent border-0 border-b-2 px-2 after:absolute
          disabled:border-gray-800 dark:disabled:border-gray-600 pt-1
          after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
          after:border-t-text-light dark:after:border-t-text-dark after:right-3
          placeholder-gray-800 dark:placeholder-gray-700 w-full outline-none ${borderClass}`}
          style={{
            appearance: 'textfield',
            ...borderStyle,
          }}
          onBlur={onBlur}
        />
        {clearable && value && (
          <span
            onClick={clear}
            className="absolute block top-1.5 right-2 hover:cursor-pointer"
          >
            <MdClear className="text-red hover:fill-theme2-darker" />
            {/* TODO: make ^ work */}
          </span>
        )}
      </div>
      {errorText && error && (
        <p className="text-sm py-0.5 px-2 text-red-strong-300">{errorText}</p>
      )}
      {!(errorText && error) && helperText && (
        <label className="text-sm py-0.5 px-2">{helperText}</label>
      )}
    </div>
  );
}
