import type { BaseTextareaProps } from './Textarea';
import Textarea from './Textarea';
import { useMemo, useState } from 'react';

type UncontrolledTextareaProps = {
  validatorFunc?: (val: string) => boolean;
  onErrorChange?: (newVal: boolean) => void;
} & BaseTextareaProps;

export default function TextareaUncontrolled({
  label,
  name,
  rows = 4,
  placeholder = '',
  disabled = false,
  helperText = '',
  errorText = '',
  error = false,
  validatorFunc,
  onErrorChange,
  className = '',
  ...props
}: UncontrolledTextareaProps) {
  const [state, setState] = useState('');
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);
  const [lastErrorUpdate, setLastErrorUpdate] = useState(false);

  const isInternalError = useMemo(() => {
    if (validatorFunc) {
      const isError = !validatorFunc(state);
      if (onErrorChange && isError !== lastErrorUpdate) {
        onErrorChange(isError);
        setLastErrorUpdate(isError);
      }
      return isError;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, validatorFunc]);

  const shouldShowError = error || (hasBeenBlurred && isInternalError);

  return (
    <Textarea
      value={state}
      onChange={newVal => setState(newVal)}
      label={label}
      name={name}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      helperText={helperText}
      errorText={shouldShowError ? errorText : ''}
      error={shouldShowError}
      className={className}
      onBlur={() => setHasBeenBlurred(true)}
      {...props}
    />
  );
}
