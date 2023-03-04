import type { BaseSelectProps } from './Select';
import Select from './Select';
import { useState } from 'react';

export default function SelectUncontrolled<T>({
  options,
  title = '',
  error = false,
  maxWidth = 999999,
  isFullWidth = false,
  initialWidth = 0, // TODO needed?
  name,
  className = '',
  ...props
}: BaseSelectProps<T>) {
  const [state, setState] = useState<T | null>(null);

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
      name={name}
      className={className}
      {...props}
    />
  );
}
