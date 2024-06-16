export type ButtonProps = {
  text: string;
  variant?: 'contained' | 'outlined' | 'naked';
  color?: 'primary' | 'error';
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  startIcon?: React.ElementType;
  endIcon?: React.ElementType;
  noPadding?: boolean;
  className?: string;
  style?: React.CSSProperties;
  buttonRef?: React.Ref<HTMLButtonElement>;
  isSubmit?: boolean;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onBlur?: (e: React.FocusEvent<HTMLButtonElement>) => void;
  disableElevation?: boolean;
};

export default function Button({
  text = '',
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  onClick,
  disabled = false,
  startIcon: StartIcon,
  endIcon: EndIcon,
  noPadding = false, // Maybe a temporary hack. It's for IconButton.
  className,
  style = {},
  buttonRef,
  isSubmit = false,
  onMouseEnter,
  onMouseLeave,
  onBlur,
  disableElevation,
  ...props
}: ButtonProps) {
  let variantClassname = '';

  const paddingString = noPadding
    ? ''
    : variant === 'contained' || variant === 'naked'
      ? ' py-[6px] px-3 '
      : ' py-1 px-[10px] ';

  if (variant === 'contained' && color === 'primary') {
    variantClassname += ` bg-blue-weak-200 hover:bg-blue-weak-100 focus:bg-blue-weak-100
      dark:bg-blue-strong-200 dark:hover:bg-blue-strong-100 dark:focus:bg-blue-strong-100
      ${disableElevation ? '' : 'shadow hover:shadow-md focus:shadow-md'}
      text-white ${paddingString} `;
  }

  if (variant === 'outlined' && color === 'primary') {
    variantClassname += ` bg-transparent 
      hover:bg-blue-weak-200 focus:bg-blue-weak-200
      dark:hover:bg-blue-strong-200 dark:focus:bg-blue-strong-200
      hover:text-white focus:text-white border-2 border-blue-weak-200 dark:border-blue-strong-200
      dark:text-white text-blue-weak-200 ${paddingString} `;
  }

  if (variant === 'naked' && color === 'primary') {
    variantClassname += ` bg-transparent dark:text-blue-strong-300 text-blue-weak-200 ${paddingString} `;
  }

  if (variant === 'contained' && color === 'error') {
    variantClassname += ` bg-red-weak-200 hover:bg-red-weak-100 focus:bg-red-weak-100
      dark:bg-red-strong-200 dark:hover:bg-red-strong-100 dark:focus:bg-red-strong-100
      ${disableElevation ? '' : 'shadow hover:shadow-md focus:shadow-md'}
      text-white ${paddingString} `;
  }

  if (variant === 'outlined' && color === 'error') {
    variantClassname += ` bg-transparent hover:bg-red-weak-200 focus:bg-red-weak-200
      dark:hover:bg-red-strong-200 dark:focus:bg-red-strong-200
      hover:text-white focus:text-white dark:text-white text-red-weak-200
      border-2 border-red-weak-200 dark:border-red-strong-200 ${paddingString} `;
  }

  if (variant === 'naked' && color === 'error') {
    variantClassname += ` bg-transparent dark:text-white text-red-weak-200 ${paddingString} `;
  }

  if (disabled && variant === 'contained') {
    variantClassname += ` bg-gray-800 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-600
    text-gray-900 dark:text-gray-700 cursor-not-allowed `;
  }

  if (disabled && variant === 'outlined') {
    variantClassname += ` bg-transparent border-2 border-gray-800 dark:border-gray-600
    text-gray-800 dark:text-gray-700 cursor-not-allowed
    hover:bg-transparent focus:bg-transparent dark:hover:bg-transparent dark:focus:bg-transparent
    hover:text-gray-800 focus:text-gray-800 hover:border-gray-800 focus:border-gray-800`;
  }

  if (disabled && variant === 'naked') {
    variantClassname += ` text-gray-800 dark:text-gray-700 cursor-not-allowed `;
  }

  const widthClass = noPadding ? '' : fullWidth ? 'w-full' : 'w-fit';

  const fullClassName =
    `rounded ${paddingString} font-bold flex flex-nowrap justify-center ` +
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onBlur={onBlur}
    >
      {StartIcon ? <StartIcon style={text ? { marginRight: '4px' } : {}} /> : undefined}{' '}
      {text} {EndIcon ? <EndIcon style={text ? { marginLeft: '4px' } : {}} /> : undefined}
    </button>
  );
}
