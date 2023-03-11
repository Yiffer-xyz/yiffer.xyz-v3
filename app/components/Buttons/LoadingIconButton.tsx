import { ButtonProps } from './Button';
import IconButton from './IconButton';

type LoadingButtonProps = {
  icon: React.ElementType;
  isLoading: boolean;
} & Omit<ButtonProps, 'startIcon' | 'endIcon' | 'fullWidth' | 'text'>;

export default function LoadingIconButton({
  isLoading,
  variant = 'contained',
  color = 'primary',
  icon,
  onClick,
  ...props
}: LoadingButtonProps) {
  const className = (isLoading ? 'opacity-70 ' : '') + props.className;

  return (
    <IconButton
      {...props}
      variant={variant}
      color={color}
      className={className}
      icon={isLoading ? Spinner(variant, color) : icon}
      onClick={isLoading ? () => {} : onClick}
    />
  );
}

const Spinner = (
  variant: 'contained' | 'outlined' | 'naked',
  color: 'primary' | 'error'
) => {
  let borderRightColor = '';

  if (variant === 'contained') {
    borderRightColor = 'border-r-white';
  } else {
    borderRightColor = 'dark:border-r-white';
    if (color === 'error') {
      borderRightColor += ' border-r-red-weak-200';
      if (variant !== 'naked') borderRightColor += ' hover:border-r-white';
    } else {
      borderRightColor += ' border-r-blue-weak-200';
      if (variant !== 'naked') borderRightColor += ' hover:border-r-white';
    }
  }

  return () => (
    <div
      className={`w-4 h-4 animate-spin border-solid border-transparent ${borderRightColor} border border-r-2 rounded-full`}
    />
  );
};
