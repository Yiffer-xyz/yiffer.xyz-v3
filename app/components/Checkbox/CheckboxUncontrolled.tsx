import type { BaseCheckboxProps } from './Checkbox';
import Checkbox from './Checkbox';

export default function CheckboxUncontrolled({
  label,
  className = '',
  ...props
}: BaseCheckboxProps) {
  const [state, setState] = React.useState(false);

  return (
    <Checkbox
      label={label}
      className={className}
      checked={state}
      onChange={newVal => setState(newVal)}
      {...props}
    />
  );
}
