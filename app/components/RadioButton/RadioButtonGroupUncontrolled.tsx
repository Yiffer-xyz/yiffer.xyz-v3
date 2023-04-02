import { useState } from 'react';
import type { BaseRadioButtonGroupProps } from './RadioButtonGroup';
import RadioButtonGroup from './RadioButtonGroup';

export default function RadioButtonGroupUncontrolled<T>({
  options,
  title,
  name,
  direction = 'vertical',
  className = '',
}: BaseRadioButtonGroupProps<T>) {
  const [state, setState] = useState<T>();
  return (
    <RadioButtonGroup
      options={options}
      title={title}
      name={name}
      direction={direction}
      value={state}
      onChange={(newVal: T) => setState(newVal)}
      className={className}
    />
  );
}
