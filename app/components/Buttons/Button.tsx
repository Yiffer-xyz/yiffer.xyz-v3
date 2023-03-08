export interface ButtonProps {
  text: string;
  variant?: 'contained' | 'outlined';
  color?: 'primary' | 'error';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  startIcon?: React.ElementType;
  endIcon?: React.ElementType;
  noPadding?: boolean;
  className?: string;
  style?: React.CSSProperties;
  buttonRef?: React.Ref<HTMLButtonElement>;
  isSubmit?: boolean;
}

export default function Button({
  text = '',
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  onClick,
  disabled = false,
  startIcon: StartIcon,
  endIcon: EndIcon,
  noPadding = false, // TODO: Maybe a temporary hack. It's for IconButton.
  className,
  style = {},
  buttonRef,
  isSubmit = false,
  ...props
}: ButtonProps) {
  let variantClassname = '';

  if (variant === 'contained' && color === 'primary') {
    variantClassname += ` bg-blue-weak-200 hover:bg-blue-weak-100 focus:bg-blue-weak-100
      dark:bg-blue-strong-200 dark:hover:bg-blue-strong-100 dark:focus:bg-blue-strong-100
      shadow hover:shadow-md focus:shadow-md
      text-white
      ${noPadding ? '' : ' py-1.25 px-3 '} `;
  }

  if (variant === 'outlined' && color === 'primary') {
    variantClassname += ` bg-transparent hover:bg-blue-weak-200 focus:bg-blue-weak-200
      dark:hover:bg-blue-strong-200 dark:focus:bg-blue-strong-200
      border-2 border-blue-weak-200 dark:border-blue-strong-200
      hover:text-white focus:text-white dark:text-white text-blue-weak-200
      ${noPadding ? '' : ' py-1 px-2.75 '}`;
  }

  if (variant === 'contained' && color === 'error') {
    variantClassname += ` bg-red-weak-200 hover:bg-red-weak-100 focus:bg-red-weak-100
      dark:bg-red-strong-200 dark:hover:bg-red-strong-100 dark:focus:bg-red-strong-100
      shadow hover:shadow-md focus:shadow-md
      text-white
      ${noPadding ? '' : ' py-1.25 px-3 '} `;
  }

  if (variant === 'outlined' && color === 'error') {
    variantClassname += ` bg-transparent hover:bg-red-weak-200 focus:bg-red-weak-200
      dark:hover:bg-red-strong-200 dark:focus:bg-red-strong-200
      border-2 border-red-weak-200 dark:border-red-strong-200
      hover:text-white focus:text-white dark:text-white text-red-weak-200
      ${noPadding ? '' : ' py-1 px-2.75 '}`;
  }

  if (disabled) {
    variantClassname += ` bg-gray-800 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-600
    text-gray-900 dark:text-gray-700 cursor-not-allowed `;
  }

  const widthClass = noPadding ? '' : fullWidth ? 'w-full' : 'w-fit';

  const fullClassName =
    `rounded ${
      noPadding ? '' : 'py-1.5 px-3'
    } font-bold flex flex-nowrap justify-center ` +
    `items-center transition-all duration-100 break-all text-sm` +
    ` ${widthClass}` +
    ` ${variantClassname} ${className} `;

  return (
    <button
      className={fullClassName}
      disabled={disabled}
      onClick={onClick}
      {...props}
      style={style}
      ref={buttonRef}
      type={isSubmit ? 'submit' : 'button'}
    >
      {StartIcon ? <StartIcon style={{ marginRight: '4px' }} /> : undefined} {text}{' '}
      {EndIcon ? <EndIcon style={{ marginLeft: '4px' }} /> : undefined}
    </button>
  );
}
