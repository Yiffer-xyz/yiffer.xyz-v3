interface TableRowProps {
  includeBorderTop?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function TableRow({
  includeBorderTop,
  children,
  className = '',
}: TableRowProps) {
  return (
    <tr
      className={`border-b border-gray-border-light ${includeBorderTop ? 'border-t' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}
