import {
  comicProblemsQueryRes,
  keywordSuggestionQueryRes,
  comicSuggestionsQueryRes,
  uploadedComicsQueryRes,
} from '../../mock-data/your-contributions';
import Link from '../../components/Link';
import { MdArrowBack } from 'react-icons/md';

export default function Upload() {
  return (
    <div className="container mx-auto">
      <h1>Your contributions</h1>
      <p className="mb-4">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>

      <p>
        How to: See in this file, the four imported lists. These are examples of how the
        data returned from db queries (to be constructed later) will look. Since there are
        already existing tables for three of the four contribution types, data will, at
        least initially, have to be fetched from all these sources and "merged" in this
        view. In this view's loader, create functions that pretend to call the DB but
        really just return these values, and then merge them into one list sorted by
        timestamp and display.
      </p>
    </div>
  );
}
