export default function Link({ href, text, newTab, Icon }) {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href={href}
      target={newTab ? '_blank' : '_self'}
      className="w-fit h-fit"
      style={{ paddingBottom: '1px' }}
    >
      {Icon ? <Icon style={{ marginRight: '4px' }} /> : undefined}
      {text}
    </a>
  );
}
