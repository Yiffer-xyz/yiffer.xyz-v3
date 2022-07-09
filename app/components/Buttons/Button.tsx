export type ButtonProps = {
  text: string;
  variant: 'contained' | 'outlined';
  color: 'primary' | 'error';
  startIcon?: React.ElementType;
  endIcon?: React.ElementType;
  className?: string;
};

export default function Button({
  text,
  variant = 'contained',
  color = 'primary',
  startIcon: StartIcon,
  endIcon: EndIcon,
  className,
  ...props
}: ButtonProps) {
  let variantClassname = '';

  if (variant === 'contained' && color === 'primary') {
    variantClassname += ` bg-blue-weak-200 hover:bg-blue-weak-100 focus:bg-blue-weak-100
      dark:bg-blue-strong-200 dark:hover:bg-blue-strong-100 dark:focus:bg-blue-strong-100
      shadow hover:shadow-md focus:shadow-md
      text-white
      py-1.25 px-3 `;
  }

  if (variant === 'outlined' && color === 'primary') {
    variantClassname += ` bg-transparent hover:bg-blue-weak-200 focus:bg-blue-weak-200
      dark:hover:bg-blue-strong-200 dark:focus:bg-blue-strong-200
      border-2 border-blue-weak-200 dark:border-blue-strong-200
      hover:text-white focus:text-white dark:text-white text-blue-weak-200
      py-1 px-2.75 `;
  }

  // TODO: Add error color for both variants

  const fullClassName =
    'rounded py-1.5 px-3 font-bold w-fit flex flex-nowrap justify-center ' +
    'items-center transition-all duration-100 break-all text-sm' +
    ` ${variantClassname} ${className} `;

  return (
    <button className={fullClassName} {...props}>
      {StartIcon ? <StartIcon /> : undefined} {text} {EndIcon ? <EndIcon /> : undefined}
    </button>
  );
}
