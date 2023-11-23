import { useState } from 'react';
import type { BaseCheckboxProps } from './Checkbox';
import Checkbox from './Checkbox';

type CheckboxUncontrolledProps = BaseCheckboxProps & {
  onChange?: (newVal: boolean) => void;
  name: string;
};

export default function CheckboxUncontrolled({
  label,
  className = '',
  onChange,
  ...props
}: CheckboxUncontrolledProps) {
  const [state, setState] = useState(false);

  return (
    <Checkbox
      label={label}
      className={className}
      checked={state}
      onChange={newVal => {
        setState(newVal);
        if (onChange) {
          onChange(newVal);
        }
      }}
      {...props}
    />
  );
}
