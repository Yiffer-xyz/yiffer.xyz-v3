import { useState } from "react";
import { MdCancel, MdCheckCircle, MdError, MdInfo, MdWarning } from "react-icons/md";

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

  let fullClassname = `p-7 py-6 flex flex-row justify-between items-center
    rounded shadow-md bg-gradient-to-r text-white ${variantClassname} ${className}`;
  
  if (boldText) {
    fullClassname += ' font-semibold';
  }

  if (hidden) {
    fullClassname += ' hidden';
  }

  return (
    <div className={fullClassname} {...props}>
      {showIcon && <Icon />}
      <div className="flex flex-col ml-4 mr-auto">
        {title ? <p className="text-xl">{title}</p> : undefined}
        {text ? <p>{text}</p> : undefined}
      </div>
      {children}
      {closable && (
        <MdCancel
          className="cursor-pointer"
          onClick={() => setHidden(true)}
        />
      )}
    </div>
  );
}
