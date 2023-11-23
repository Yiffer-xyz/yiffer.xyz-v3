import { useMemo } from 'react';
import type { ButtonProps } from './Button';
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

  // Memoize to avoid resetting the spinner spinny on every render
  const Spinner = useMemo(() => getSpinner(variant, color), [variant, color]);

  return (
    <IconButton
      {...props}
      variant={variant}
      color={color}
      className={className}
      icon={isLoading ? Spinner : icon}
      onClick={isLoading ? () => null : onClick}
    />
  );
}

const getSpinner = (
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

  const Spinner = () => (
    <div
      className={`w-4 h-4 animate-spin border-solid border-transparent ${borderRightColor} border border-r-2 rounded-full`}
    />
  );

  return Spinner;
};
