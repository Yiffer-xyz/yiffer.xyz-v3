import Link from '../../components/Link';
import { MdArrowBack } from 'react-icons/md';

export default function Upload() {
  return (
    <div className="container mx-auto">
      <h1>Become a mod</h1>
      <p className="mb-4">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>

      <p>
        Exact copy of today's one. Not a high priority, but also easy enough to be a good
        simple beginner practice.
      </p>
      <br />
      <p>
        Use the back-end for front-end API style for this one. Meaning: We already have
        all logic for handling this submission in today's API (not on the edge). When
        submitting this form, in the submit form handler, don't interact directly with a
        database or anything like that - instead, just ship off a request to the existing
        API endpoint and use its response to display a success/error message. So, here,
        only front-end logic, in addition to the very simple back-end task of taking the
        data, and sending it to the existing API.
      </p>
    </div>
  );
}
