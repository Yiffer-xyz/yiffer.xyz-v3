import Link from '../../components/Link';
import { MdArrowBack } from 'react-icons/md';

export default function Upload() {
  return (
    <div className="container mx-auto">
      <h1>Upload a comic</h1>
      <p className="mb-4">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>
      <p>
        To complete this one, components will need to exist for checkbox, searchable
        selects, dropdown selects, fileUpload, thumbnail cropper. It might be wise to
        implement most of these first, as they'll definitely function differently from
        native ones in terms of props and all that.
      </p>
      <br />
      <p>
        Of course, it is possible to get started on for example the page manager (purple
        rectangles and their surroundings in the mock) isolated from the rest.
      </p>
      <br />
      <p>
        I think the same logic described in{' '}
        <Link href="/suggest-comic" text="Suggest a comic" /> should be used here - both
        the artist and duplicate stuff.
      </p>
    </div>
  );
}
