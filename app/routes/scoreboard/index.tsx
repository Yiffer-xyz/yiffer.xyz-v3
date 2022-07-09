import Link from '../../components/Link';
import { MdArrowBack } from 'react-icons/md';

import { defaultquery, yearquery } from '../../mock-data/top-contributions';

export default function Upload() {
  return (
    <div className="container mx-auto">
      <h1>Contributions scoreboard</h1>
      <p className="mb-4">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>

      <p>
        See the imported code for the mocked responses to the database queries for month
        and year to use.
      </p>
    </div>
  );
}
