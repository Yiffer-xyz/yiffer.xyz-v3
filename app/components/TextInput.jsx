import { useRef, useEffect } from 'react';

/**
 *
 * @param {{
 * label: string;
 * name: string;
 * value: string;
 * autocomplete: string=on;
 * type: "text" | "password";
 * className: string;
 * }} props
 *
 */
export default function TextInput({
  label,
  name,
  value = '',
  autocomplete = 'on',
  type = 'text',
  className = '',
  ...props
}) {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.value = value;
  }, [value]);

  return (
    <div className={className}>
      {label && <p>{label}</p>}
      <input
        type={type}
        name={name}
        ref={inputRef}
        autoComplete={autocomplete}
        {...props}
      />
      <p className="text-xs">TODO make this nice&fancy</p>
    </div>
  );
}
