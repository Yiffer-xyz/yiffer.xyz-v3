import type { BaseTextInputProps } from './TextInput';
import TextInput from './TextInput';
import { useMemo, useState } from 'react';

type UncontrolledTextInputProps = {
  validatorFunc?: (val: string) => boolean;
  onErrorChange?: (newVal: boolean) => void;
} & BaseTextInputProps;

export default function TextInputUncontrolled({
  label,
  name,
  type = 'text',
  autocomplete,
  placeholder = '',
  disabled = false,
  clearable = false,
  helperText = '',
  errorText = '',
  error = false,
  validatorFunc,
  onErrorChange,
  className = '',
  ...props
}: UncontrolledTextInputProps) {
  const [state, setState] = useState('');
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);
  const [lastErrorUpdate, setLastErrorUpdate] = useState(false);

  const isInternalError = useMemo(() => {
    if (!validatorFunc) return false;

    const isError = !validatorFunc(state);
    if (onErrorChange && isError !== lastErrorUpdate) {
      onErrorChange(isError);
      setLastErrorUpdate(isError);
    }
    return isError;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, validatorFunc]);

  const shouldShowError = error || (hasBeenBlurred && isInternalError);

  return (
    <TextInput
      value={state}
      onChange={newVal => setState(newVal)}
      label={label}
      name={name}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      clearable={clearable}
      helperText={helperText}
      errorText={shouldShowError ? errorText : ''}
      error={shouldShowError}
      className={className}
      onBlur={() => setHasBeenBlurred(true)}
      {...props}
    />
  );
}
