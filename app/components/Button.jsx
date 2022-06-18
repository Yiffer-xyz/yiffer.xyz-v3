export default function Button({
  text,
  startIcon: StartIcon,
  endIcon: EndIcon,
  variant = 'contained',
  color = 'primary',
  ...props
}) {
  let variantClassname = '';

  if (variant === 'contained' && color === 'primary') {
    variantClassname = `bg-blue-weak-200 hover:bg-blue-weak-100 focus:bg-blue-weak-100
      dark:bg-blue-strong-200 dark:hover:bg-blue-strong-100 dark:focus:bg-blue-strong-100
      shadow hover:shadow-md focus:shadow-md
      text-white
      py-1.25 px-3`;
  }

  if (variant === 'outlined' && color === 'primary') {
    variantClassname = `bg-transparent hover:bg-blue-weak-200 focus:bg-blue-weak-200
      dark:hover:bg-blue-strong-200 dark:focus:bg-blue-strong-200
      border-2 border-blue-weak-200 dark:border-blue-strong-200
      hover:text-white focus:text-white dark:text-white text-blue-weak-200
      py-1 px-2.75`;
  }

  const className =
    'rounded py-1.5 px-3 font-bold w-fit flex flex-nowrap justify-center ' +
    'items-center transition-all duration-100 ' +
    variantClassname;

  const styles = { fontSize: '0.875rem', wordBreak: 'break-all' };

  return (
    <button style={styles} className={className} {...props}>
      {StartIcon ? <StartIcon /> : undefined} {text} {EndIcon ? <EndIcon /> : undefined}
    </button>
  );
}
