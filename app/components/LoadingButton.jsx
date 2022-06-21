import Button from './Button';

/**
 *
 * @param {{
 * isLoading: boolean
 * }} props Otherwise, see Button's props
 *
 */
export default function LoadingButton({ isLoading, ...props }) {
  return <Button {...props} />;
}
