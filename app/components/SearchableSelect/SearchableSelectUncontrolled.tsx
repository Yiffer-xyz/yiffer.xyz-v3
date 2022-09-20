import { useState } from 'react';
import SearchableSelect, { BaseSearchableSelectProps } from './SearchableSelect';

type SearchableSelectUncontrolledProps = {
  onChange?: (value: any) => void;
} & BaseSearchableSelectProps;

export default function SearchableSelectUncontrolled({
  onChange,
  options,
  title = '',
  error = false,
  maxWidth = 999999,
  isFullWidth = false,
  initialWidth = 0, // TODO needed?
  name,
  disabled = false,
  className = '',
  ...props
}: SearchableSelectUncontrolledProps) {
  const [state, setState] = useState(null);

  return (
    <SearchableSelect
      value={state}
      onChange={newVal => {
        setState(newVal);
        if (onChange) {
          onChange(newVal);
        }
      }}
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
