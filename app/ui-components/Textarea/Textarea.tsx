import { useMemo } from 'react';
import { colors } from 'tailwind.config';

export type BaseTextareaProps = {
  label?: string;
  name: string;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
  errorText?: string;
  error?: boolean;
  className?: string;
};

type FullTextInputProps = {
  value: string;
  onChange: (newVal: string) => void;
  onBlur?: () => void;
} & BaseTextareaProps;

export default function Textarea({
  value,
  onChange,
  label,
  name,
  rows = 4,
  placeholder,
  disabled = false,
  helperText = '',
  errorText = '',
  error = false,
  className = '',
  onBlur,
  ...props
}: FullTextInputProps) {
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
    <div className={`flex flex-col ${className}`} {...props}>
      {label && (
        <label className={`${error ? 'text-red-strong-300' : ''} text-sm`}>{label}</label>
      )}
      <div className={`-mt-1 relative`}>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          name={name}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-transparent p-1.5 outline-none border-0 border-b-2 
            placeholder-gray-800 dark:placeholder-gray-700 ${borderClass}`}
          style={{
            appearance: 'textfield',
            ...borderStyle,
          }}
          onBlur={onBlur}
        />
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
