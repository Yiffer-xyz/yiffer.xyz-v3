type ChipProps = {
  text: string;
  color: string;
  className?: string;
};

export default function Chip({ text, color, className = '' }: ChipProps) {
  return (
    <div
      className={`w-fit px-2 rounded-xl whitespace-nowrap ${className}`}
      style={{ backgroundColor: color, paddingTop: '2px', paddingBottom: '2px' }}
    >
      <p className="text-sm text-white">{text}</p>
    </div>
  );
}
