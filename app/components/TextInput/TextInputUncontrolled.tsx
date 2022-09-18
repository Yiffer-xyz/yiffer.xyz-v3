import type { BaseTextInputProps } from './TextInput';
import TextInput from './TextInput';
import { useState } from 'react';

export default function TextInputUncontrolled({
  label,
  name,
  type = 'text',
  autocomplete,
  placeholder = '',
  clearable = false,
  helperText = '',
  error = false,
  className = '',
  onChange,
  ...props
}: BaseTextInputProps) {
  const [state, setState] = useState('');

  return (
    <TextInput
      value={state}
      onChange={newVal => {
        setState(newVal);
        onChange?.(newVal);
      }}
      label={label}
      name={name}
      type={type}
      placeholder={placeholder}
      clearable={clearable}
      helperText={helperText}
      error={error}
      className={className}
      {...props}
    />
  );
}
