import TextInput from './TextInput';
import { useState } from 'react';

/**
 *
 * @param {{
 * label: string;
 * name: string;
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

export default function TextInputUncontrolled({
  label,
  name,
  autocomplete = 'on',
  type = 'text',
  placeholder = '',
  clearable = false,
  helperText = '',
  error = false,
  className = '',
  ...props
}) {
  const [state, setState] = useState('');

  return (
    <TextInput
      label={label}
      name={name}
      value={state}
      onChange={newVal => setState(newVal)}
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
