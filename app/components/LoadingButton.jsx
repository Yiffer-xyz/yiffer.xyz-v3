export default function LoadingButton({ text, isLoading, disabled, color, iconType }) {
  return (
    <button type="submit" disabled={disabled}>
      [ICON] {text}
    </button>
  );
}
