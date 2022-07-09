import Button, { ButtonProps } from './Button';

// TODO actually use isLoading to display the spinner as a start icon on the Button

type LoadingButtonProps = {
  isLoading: boolean;
} & ButtonProps;

export default function LoadingButton({ isLoading, ...props }: LoadingButtonProps) {
  return <Button {...props} />;
}
