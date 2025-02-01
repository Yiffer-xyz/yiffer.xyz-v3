import type { ComicTiny } from '~/types/types';
import Link from '../Link';
import { MdArrowForward, MdOpenInNew } from 'react-icons/md';

export default function ComicAdminLink({ comic }: { comic: ComicTiny }) {
  return (
    <div
      className="px-2 py-1 bg-theme1-primaryTrans dark:bg-theme1-primaryMoreTrans flex flex-row flex-wrap gap-x-3"
      key={comic.id}
    >
      <p>{comic.name}</p>
      <div className="flex flex-row gap-3">
        {comic.publishStatus === 'published' && (
          <Link href={`/c/${comic.name}`} text="Live" newTab IconRight={MdOpenInNew} />
        )}
        <Link
          href={`/admin/comics/${comic.id}`}
          text="Admin"
          IconRight={MdArrowForward}
        />
      </div>
    </div>
  );
}
