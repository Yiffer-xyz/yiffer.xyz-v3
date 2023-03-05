import Button, { ButtonProps } from './Button';

type LoadingButtonProps = {
  isLoading: boolean;
} & ButtonProps;

export default function LoadingButton({
  isLoading,
  onClick,
  ...props
}: LoadingButtonProps) {
  const className = (isLoading ? 'opacity-70 ' : '') + props.className;

  return (
    <Button
      {...props}
      startIcon={isLoading ? Spinner : props.startIcon}
      className={className}
      onClick={isLoading ? () => {} : onClick}
    />
  );
}

const Spinner = () => (
  <div className="mr-3 w-4 h-4 animate-spin border-solid border-transparent border-r-white border rounded-full" />
);
