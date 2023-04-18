interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export default function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}
