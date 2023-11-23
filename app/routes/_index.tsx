import { MdStar } from 'react-icons/md';
import Link from '~/ui-components/Link';

export default function Index() {
  return (
    <div>
      <h1 className="text-center">Yes hello this is Yiffer</h1>
      <p className="text-2xl text-center">
        <Link href="/contribute" text="Contribute!" Icon={MdStar} />
      </p>
    </div>
  );
}
