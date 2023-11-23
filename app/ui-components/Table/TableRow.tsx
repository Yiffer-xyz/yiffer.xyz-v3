interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export default function TableRow({ children, className = '' }: TableRowProps) {
  return <tr className={`border-b border-gray-borderLight ${className}`}>{children}</tr>;
}
