import { MdStar } from 'react-icons/md';
import Link from '~/components/Link';
import { authLoader, mergeLoaders } from '~/utils/loaders';

export const loader = mergeLoaders(authLoader);

export default function Index() {
  return (
    <div>
      <h1 className="text-center">Yes hello this is Yiffer</h1>
      <p className="text-center mx-auto">
        <Link href="/contribute" text="Contribute!" Icon={MdStar} style={{ fontSize: '6rem' }} />
      </p>
    </div>
  );
}
