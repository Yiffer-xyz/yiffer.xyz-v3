import { useMemo } from 'react';
import type { ButtonProps } from './Button';
import Button from './Button';

type LoadingButtonProps = {
  isLoading: boolean;
} & ButtonProps;

export default function LoadingButton({
  isLoading,
  variant = 'contained',
  color = 'primary',
  onClick,
  ...props
}: LoadingButtonProps) {
  const className = (isLoading ? 'opacity-70 ' : '') + props.className;

  // Memoize to avoid resetting the spinner spinny on every render
  const Spinner = useMemo(() => getSpinner(variant, color), [variant, color]);

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
      className={`mr-3 w-4 h-4 animate-spin border-solid border-transparent ${borderRightColor} border border-r-2 rounded-full`}
    />
  );

  return Spinner;
};
