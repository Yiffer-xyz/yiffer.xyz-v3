/**
 *
 * @param {{
 * href: string;
 * text: string;
 * newTab: boolean;
 * Icon: React.ReactNode;
 * className: string;
 * }} props
 *
 */
export default function Link({ href, text, newTab, Icon, className }) {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
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
