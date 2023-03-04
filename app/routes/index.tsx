import { MdStar } from 'react-icons/md';
import Link from '~/components/Link';

export default function Index() {
  return (
    <div>
      <h1 className="text-center">Yes hello this is Yiffer</h1>
      <p className="text-center mx-auto">
        <Link
          href="/contribute"
          text="Contribute!"
          Icon={MdStar}
          style={{ fontSize: '6rem' }}
        />
      </p>
    </div>
  );
}
