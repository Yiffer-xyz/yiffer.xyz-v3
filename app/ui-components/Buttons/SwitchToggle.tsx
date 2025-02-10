import type { HTMLAttributes } from 'react';

type SwitchToggleProps = {
  label?: string;
  title?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  className?: HTMLAttributes<HTMLDivElement>['className'];
};

export default function SwitchToggle({
  label,
  title,
  checked,
  disabled = false,
  onChange,
  className = '',
}: SwitchToggleProps) {
  return (
    <div className={`flex flex-col gap-2 w-fit ${className}`}>
      {title && <label className="text-sm">{title}</label>}

      <label className={`inline-flex items-center cursor-pointer`}>
        <input
          type="checkbox"
          className="peer hidden"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`relative w-8 h-5 bg-gray-700 peer-focus:outline-none 
            peer-focus:ring-2 peer-focus:ring-theme1-primary
            rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-3
            rtl:peer-checked:after:-translate-x-3 peer-checked:after:border-white
            after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white
            after:border-gray-700 after:border after:rounded-full after:h-4 after:w-4
            after:transition-all dark:border-gray-600 peer-checked:bg-theme1-darker`}
        />
        {label && <span className="ms-1 text-sm">{label}</span>}
      </label>
    </div>
  );
}
