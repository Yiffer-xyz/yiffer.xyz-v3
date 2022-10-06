interface TableCellProps {
  /** A style string that'll be directly applied. Longer text will wrap. */
  maxWidth?: string;
  children: React.ReactNode;
  className?: string;
}

export default function TableCell({ maxWidth, children, className = '' }: TableCellProps) {
  const style = maxWidth ? { maxWidth } : {};
  const fullClassName = `py-2 px-3 ${maxWidth ? 'whitespace-pre-wrap' : ''} ${className}`;
  return (
    <td className={fullClassName} style={style}>
      {children}
    </td>
  );
}
