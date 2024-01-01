import type { ButtonProps } from './Button';
import Button from './Button';

type GradientButtonProps = Omit<ButtonProps, 'color'>;

export default function GradientButton(props: GradientButtonProps) {
  return (
    <Button
      {...props}
      className={`${props.className} bg-gradient-to-r from-theme1-darker 
        to-theme2-darker text-text-light`}
      style={{ height: 42 }}
    />
  );
}
