import { MdClear } from 'react-icons/md';

export type BaseTextInputProps = {
  label: string;
  name: string;
  type?: 'text' | 'password';
  autocomplete?: string;
  placeholder?: string;
  clearable?: boolean;
  helperText?: string;
  errorText?: string;
  error?: boolean;
  className?: string;
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
  placeholder = '',
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

  const borderStyle = error
    ? ''
    : { borderImage: 'linear-gradient(to right, #9aebe7, #adfee0) 1' };

  const borderClass = error ? 'border-status-error1' : '';

  return (
    <div className={`flex flex-col ${className}`} {...props}>
      {label && (
        <label className={`${error ? 'text-status-error1' : ''} text-sm`}>{label}</label>
      )}
      <div className={`-mt-1 relative`}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          type={type}
          name={name}
          autoComplete={autocomplete || undefined}
          placeholder={placeholder || undefined}
          className={`w-full bg-transparent p-1.5 outline-none border border-0 border-b-2 
            border-gradient-to-r from-theme1 to-theme2 ${borderClass}`}
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
        <p className="text-sm py-0.5 px-2 text-status-error1">{errorText}</p>
      )}
      {!(errorText && error) && helperText && (
        <label className="text-sm py-0.5 px-2">{helperText}</label>
      )}
    </div>
  );
}
