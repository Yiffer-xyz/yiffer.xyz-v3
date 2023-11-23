import type { ButtonProps } from './Button';
import Button from './Button';

type IconButtonProps = {
  icon: React.ElementType;
} & Omit<ButtonProps, 'startIcon' | 'endIcon' | 'fullWidth' | 'text'>;

export default function IconButton({ icon, className, ...props }: IconButtonProps) {
  return (
    <Button
      {...props}
      startIcon={icon}
      noPadding
      className={`rounded-full w-8 h-8 p-0 text-base ${className}`}
      text=""
      style={{ paddingTop: '2px' }}
    />
  );
}
