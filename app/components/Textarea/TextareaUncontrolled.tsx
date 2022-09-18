import Textarea, { BaseTextareaProps } from './Textarea';

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
  const [state, setState] = React.useState('');
  const [hasBeenBlurred, setHasBeenBlurred] = React.useState(false);
  const [lastErrorUpdate, setLastErrorUpdate] = React.useState(false);

  const isInternalError = React.useMemo(() => {
    if (validatorFunc) {
      const isError = !validatorFunc(state);
      if (onErrorChange && isError !== lastErrorUpdate) {
        onErrorChange(isError);
        setLastErrorUpdate(isError);
      }
      return isError;
    }
    return false;
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
