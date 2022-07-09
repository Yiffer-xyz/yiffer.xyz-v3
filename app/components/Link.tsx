type LinkProps = {
  href: string;
  text: string;
  newTab?: boolean;
  Icon?: React.ElementType;
  className?: string;
};

export default function Link({ href, text, newTab, Icon, className }: LinkProps) {
  return (
    <a
      href={href}
      target={newTab ? '_blank' : '_self'}
      className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold ${className}`}
      style={{ paddingBottom: '1px' }}
    >
      {Icon ? <Icon style={{ marginRight: '4px' }} /> : undefined}
      {text}
    </a>
  );
}
