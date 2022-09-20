type InfoBoxProps = {
  variant: 'info' | 'success' | 'error' | 'warning';
  text?: string;
  title?: string;
  showIcon?: Boolean; // TODO implement
  boldText?: Boolean;
  children?: React.ReactNode;
  className?: string;
};

export default function InfoBox({
  variant = 'info',
  title,
  text,
  showIcon = false,
  boldText = true,
  children,
  className = '',
  ...props
}: InfoBoxProps) {
  let variantClassname = '';

  if (variant === 'info') {
    variantClassname = 'from-status-info1 to-status-info2 ';
  }
  if (variant === 'error') {
    variantClassname = 'from-status-error1 to-status-error2 ';
  }
  if (variant === 'success') {
    variantClassname = 'from-theme1-darker to-theme2-darker ';
  }
  if (variant === 'warning') {
    variantClassname = 'from-status-warn1 to-status-warn2 ';
  }

  let fullClassname = `p-4 flex flex-col rounded shadow-md bg-gradient-to-r text-white ${variantClassname} ${className}`;
  if (boldText) {
    fullClassname += ' font-semibold';
  }

  return (
    <div className={fullClassname} {...props}>
      {title ? <p className="text-xl">{title}</p> : undefined}
      {text ? <p>{text}</p> : undefined}
      {children}
    </div>
  );
}
