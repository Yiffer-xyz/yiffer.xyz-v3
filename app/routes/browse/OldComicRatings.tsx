import { CLOSED_SEARCHFILTER_WIDTH } from './SearchFilter/SearchFilterContainer';
import { MdError } from 'react-icons/md';
import Link from '~/ui-components/Link';

export default function OldComicRatingsInfo() {
  return (
    <div
      className={`rounded shadow mt-4 text-text-white
        bg-red-strong-300 dark:bg-red-strong-200 mx-auto px-3 py-2`}
      style={{ width: CLOSED_SEARCHFILTER_WIDTH }}
    >
      <p className="font-bold">
        <MdError className="mr-1 -mt-[1px]" />
        Rating conversion from old Yiffer
      </p>

      <p className="mt-2 text-sm">
        The new version of the site has a new rating system. Choose what happens to your
        comic ratings from the old system. Decide soon - we won't keep old ratings
        forever.
      </p>

      <p className="mt-1.5">
        <Link
          href="/rating-conversion"
          text="Set up comic rating conversions"
          color="white"
          showRightArrow
          isInsideParagraph
        />
      </p>
    </div>
  );
}
