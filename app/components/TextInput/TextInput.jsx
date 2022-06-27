import { MdClear } from 'react-icons/md';

/**
 *
 * @param {{
 * label: string;
 * name: string;
 * value: string;
 * onChange: function;
 * autocomplete: string=on;
 * type: "text" | "password";
 * placeholder: string;
 * clearable: boolean;
 * helperText: string;
 * error: boolean;
 * className: string;
 * }} props
 *
 */
export default function TextInput({
  label,
  name,
  value = '',
  onChange = () => {},
  autocomplete = 'on',
  type = 'text',
  placeholder = '',
  clearable = false,
  helperText = '',
  error = false,
  className = '',
  ...props
}) {
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
          autoComplete={autocomplete}
          placeholder={placeholder}
          className={`w-full bg-transparent p-1.5 outline-none border border-0 border-b-2 
            border-gradient-to-r from-theme1 to-theme2 ${borderClass}`}
          style={{
            appearance: 'textfield',
            ...borderStyle,
          }}
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
      {helperText && <label className="text-sm py-0.5 px-2">{helperText}</label>}
    </div>
  );
}
