import { useMemo } from 'react';
import type { ButtonProps } from './Button';
import Button from './Button';

type LoadingButtonProps = {
  isLoading: boolean;
  smallSpinner?: boolean;
} & ButtonProps;

export default function LoadingButton({
  isLoading,
  variant = 'contained',
  color = 'primary',
  smallSpinner = false,
  onClick,
  ...props
}: LoadingButtonProps) {
  const className = (isLoading ? 'opacity-70 ' : '') + props.className;

  // Memoize to avoid resetting the spinner spinny on every render
  const Spinner = useMemo(
    () => getSpinner(variant, color, smallSpinner),
    [variant, color, smallSpinner]
  );

  return (
    <Button
      {...props}
      startIcon={isLoading ? Spinner : props.startIcon}
      variant={variant}
      color={color}
      className={className}
      onClick={isLoading ? () => null : onClick}
    />
  );
}

const getSpinner = (
  variant: 'contained' | 'outlined' | 'naked',
  color: 'primary' | 'error',
  smallSpinner: boolean
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

  const marginWidthHeightClass = smallSpinner ? 'mr-2 w-3 h-3' : 'mr-3 w-4 h-4';

  const Spinner = () => (
    <div
      className={`${marginWidthHeightClass} animate-spin border-solid border-transparent ${borderRightColor} border border-r-2 rounded-full`}
    />
  );

  return Spinner;
};
