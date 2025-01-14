import { useState } from 'react';
import { MdCancel, MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';

type InfoBoxProps = {
  variant: 'info' | 'success' | 'error' | 'warning';
  text?: string;
  title?: string;
  showIcon?: boolean;
  closable?: boolean;
  overrideOnCloseFunc?: () => void;
  boldText?: boolean;
  centerText?: boolean;
  disableElevation?: boolean;
  fitWidth?: boolean;
  small?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function InfoBox({
  variant = 'info',
  title,
  text,
  showIcon = false,
  closable = false, // Shows an X
  overrideOnCloseFunc, // Works with closable=true, called when X is pressed
  boldText = true,
  centerText = false,
  disableElevation = false,
  fitWidth = false,
  small = false,
  children,
  className = '',
  style = {},
  ...props
}: InfoBoxProps) {
  const [hidden, setHidden] = useState(false);
  let variantClassname = '';
  let Icon = null;

  switch (variant) {
    case 'info':
      variantClassname = 'from-status-info2 to-status-info1 ';
      Icon = MdInfo;
      break;
    case 'error':
      variantClassname = 'from-red-strong-300 to-status-error2 ';
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

  const paddingClassName = small ? 'px-4 py-2' : 'px-6 py-4';

  let fullClassname = `${paddingClassName} flex flex-row justify-between items-center gap-2
    rounded ${disableElevation ? '' : 'shadow-md'} bg-gradient-to-r 
    text-white ${variantClassname} ${className}`;

  if (boldText) {
    fullClassname += ' font-semibold';
  }
  if (fitWidth) {
    fullClassname += ' w-fit';
  }

  if (hidden) {
    fullClassname += ' hidden';
  }

  const textClassName = centerText ? 'text-center' : '';

  return (
    <div className={fullClassname} {...props} style={style}>
      {showIcon && (
        <Icon
          size={small ? 20 : 36}
          className={`${small ? '-ml-1 mt-[1px]' : '-ml-2'} flex-shrink-0 w-8 md:w-auto`}
        />
      )}
      <div className={`${textClassName} flex flex-col flex-grow`}>
        {title ? <p className="text-xl">{title}</p> : undefined}
        {text ? <p className={small ? 'text-sm' : ''}>{text}</p> : undefined}
        {children}
      </div>
      {closable && (
        <div
          className="cursor-pointer p-2 -mr-2 flex items-center justify-center"
          onClick={() => (overrideOnCloseFunc ? overrideOnCloseFunc() : setHidden(true))}
        >
          <MdCancel
            size={18}
            className="cursor-pointer flex-shrink-0 w-5 md:w-auto mt-1"
          />
        </div>
      )}
    </div>
  );
}
