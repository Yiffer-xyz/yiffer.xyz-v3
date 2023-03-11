import { useState } from 'react';
import type { BaseRadioButtonGroupProps } from './RadioButtonGroup';

// IMPORTANT: SINCE THIS IS A TYPED COMPONENT,
// BUT INPUTS REQUIRE STRINGS OR NUMBERS AS VALUES,
// IF THE VALUE (T) IS NOT A STRING OR NUMBER,
// THE LABEL WILL BE USED INSTEAD.
export default function RadioButtonGroupUncontrolled<T>({
  options,
  title,
  name,
  direction = 'vertical',
  className = '',
}: BaseRadioButtonGroupProps<T>) {
  const [state, setState] = useState<T|null>(null);
  const isTypeLegalForInput = typeof options[0].value === 'string' || typeof options[0].value === 'number';

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-2">{title}</label>
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex flex-row items-center cursor-pointer outline-none"
            onClick={() => setState(option.value)}
          >
            <input
              type="radio"
              name={name}
              value={isTypeLegalForInput ? option.value as string|number : option.text}
              checked={state === option.value}
              onChange={() => {}}
            />
            <label className="ml-2">{option.text}</label>
          </div>
        ))}
      </div>
    </div>
  );
})
