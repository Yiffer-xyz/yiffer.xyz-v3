import Select from './Select';
import { useState } from 'react';

export default function SelectUncontrolled({
  options,
  title = '',
  value,
  onChange,
  error = false,
  maxWidth = 999999,
  isFullWidth = false,
  initialWidth = 0, // TODO needed?
  className = '',
  ...props
}) {
  const [state, setState] = useState(null);

  return (
    <Select
      value={state}
      onChange={newVal => setState(newVal)}
      options={options}
      title={title}
      error={error}
      maxWidth={maxWidth}
      isFullWidth={isFullWidth}
      initialWidth={initialWidth}
      className={className}
      {...props}
    />
  );
}
