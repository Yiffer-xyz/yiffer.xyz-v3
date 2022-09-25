import { useState } from 'react';
import { MdCancel, MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';

type InfoBoxProps = {
  variant: 'info' | 'success' | 'error' | 'warning';
  text?: string;
  title?: string;
  showIcon?: Boolean;
  closable?: Boolean;
  boldText?: Boolean;
  children?: React.ReactNode;
  className?: string;
};

export default function InfoBox({
  variant = 'info',
  title,
  text,
  showIcon = false,
  closable = false,
  boldText = true,
  children,
  className = '',
  ...props
}: InfoBoxProps) {
  const [hidden, setHidden] = useState(false);
  let variantClassname = '';
  let Icon = null;

  switch (variant) {
    case 'info':
      variantClassname = 'from-status-info1 to-status-info2 ';
      Icon = MdInfo;
      break;
    case 'error':
      variantClassname = 'from-status-error1 to-status-error2 ';
      Icon = MdError;
      break;
    case 'success':
      variantClassname = 'from-theme1-darker to-theme2-darker ';
      Icon = MdCheckCircle;
      break;
    case 'warning':
      variantClassname = 'from-status-warn1 to-status-warn2 ';
      Icon = MdWarning;
      break;
  }

  let fullClassname = `px-6 py-4 flex flex-row justify-between items-center gap-2
    rounded shadow-md bg-gradient-to-r text-white ${variantClassname} ${className}`;

  if (boldText) {
    fullClassname += ' font-semibold';
  }

  if (hidden) {
    fullClassname += ' hidden';
  }

  return (
    <div className={fullClassname} {...props}>
      {showIcon && <Icon size={36} className="-ml-2 flex-shrink-0 w-8 md:w-auto" />}
      <div className="flex flex-col flex-grow">
        {title ? <p className="text-xl">{title}</p> : undefined}
        {text ? <p>{text}</p> : undefined}
        {children}
      </div>
      {closable && (
        <MdCancel size={24} className="cursor-pointer flex-shrink-0 w-5 md:w-auto" onClick={() => setHidden(true)} />
      )}
    </div>
  );
}
