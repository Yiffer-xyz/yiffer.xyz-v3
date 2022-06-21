import { useRef, useEffect } from 'react';

export default function TextInput({
  label,
  name,
  value = '',
  autocomplete = 'on',
  type = 'text',
  ...props
}) {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.value = value;
  }, [value]);

  return (
    <div>
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
