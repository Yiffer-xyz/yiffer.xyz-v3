import { MdArrowBack } from 'react-icons/md';
import Link from '~/ui-components/Link';

export default function BackToContribute() {
  return <Link href="/contribute" text="Back" Icon={MdArrowBack} />;
}
