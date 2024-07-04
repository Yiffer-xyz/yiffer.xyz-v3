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
      className={`border-b border-gray-borderLight ${includeBorderTop ? 'border-t' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}
