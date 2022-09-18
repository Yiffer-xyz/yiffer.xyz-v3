import { useState } from 'react';
import SearchableSelect, { BaseSearchableSelectProps } from './SearchableSelect';

export default function SearchableSelectUncontrolled({
  options,
  title = '',
  error = false,
  maxWidth = 999999,
  isFullWidth = false,
  initialWidth = 0, // TODO needed?
  name,
  className = '',
  ...props
}: BaseSearchableSelectProps) {
  const [state, setState] = useState(null);

  return (
    <SearchableSelect
      value={state}
      onChange={newVal => setState(newVal)}
      onValueCleared={() => setState(null)}
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
