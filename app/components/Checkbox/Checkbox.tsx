import { FaCheck } from 'react-icons/fa';
export type BaseCheckboxProps = {
  label: string;
  className?: string;
};

type ChecboxProps = BaseCheckboxProps & {
  checked: boolean;
  onChange: (newVal: boolean) => void;
};

// TODO figure out some UX-friendly way to indicate focus.
// Ideally, a theme1-primaryTrans background color on the square element.
// Might require some light javascript.

export default function Checkbox({
  label,
  checked,
  onChange,
  className = '',
  ...props
}: ChecboxProps) {
  // Maybe kinda hacky, but this is to prevent double state changes. It works.
  const [lastChange, setLastChange] = React.useState({
    type: '',
    time: 0,
  });

  const fullClassname = `block relative hover:cursor-pointer select-none pl-8 
    outline-none w-fit ${className}`;

  function onKeyPressed(keyEvent: React.KeyboardEvent<HTMLLabelElement>) {
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      onChange(!checked);
      setLastChange({
        type: 'key',
        time: Date.now(),
      });
    }
  }

  function onStateChange(newVal: boolean) {
    if (lastChange.type === 'key' && Date.now() - lastChange.time < 300) {
      return;
    }
    onChange(newVal);
    setLastChange({
      type: 'internal',
      time: Date.now(),
    });
  }

  return (
    <label
      className={fullClassname}
      {...props}
      tabIndex={0}
      onKeyPress={e => onKeyPressed(e)}
    >
      {label}

      <input
        type="checkbox"
        checked={checked}
        onChange={e => onStateChange(e.target.checked)}
        className="absolute opacity-0 cursor-pointer h-0 w-0 peer"
      />

      <span className="absolute top-0 left-0 h-6 w-6 border-2 border-theme1-primary peer-checked:bg-theme1-primary rounded-sm flex justify-center items-center ">
        {checked && <FaCheck className="mt-0.5 text-white" size={16} />}
      </span>
    </label>
  );
}
