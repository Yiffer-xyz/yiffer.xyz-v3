import type { MetaFunction } from '@remix-run/react';
import { useOutletContext } from '@remix-run/react';
import React from 'react';
import { MdArrowForward } from 'react-icons/md';
import Link from '~/ui-components/Link';
import type { GlobalAdminContext } from '../admin/route';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Thumbnails | Yiffer.xyz` }];
};

export default function UpdateThumbnails() {
  const globalContext: GlobalAdminContext = useOutletContext();
  const numTotalComics = globalContext.comics.length;
  const numMissingComics =
    numTotalComics -
    globalContext.comics.filter(comic => comic.temp_hasHighresThumbnail).length;

  const orderedMissingComics = globalContext.comics
    .filter(comic => !comic.temp_hasHighresThumbnail)
    .sort((a, b) => {
      if (!a.temp_published || !b.temp_published) return 0;
      return b.temp_published.getTime() - a.temp_published.getTime();
    })
    .map(comic => ({
      id: comic.id,
      name: comic.name,
      daysSincePublished: comic.temp_published
        ? Math.floor(
            (Date.now() - comic.temp_published.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0,
    }));

  return (
    <div className="max-w-6xl flex flex-col gap-4">
      <h1>Update old thumbnails</h1>
      <p>
        Thumbnails uploaded to old Yiffer were saved in a too low resolution. We should
        work on replacing them with higher res ones until all have been replaced.
      </p>

      <div>
        <p className="font-bold">
          Current progress: {numMissingComics}/{numTotalComics} need fixing.
        </p>
        <p>More recent = more important.</p>
      </div>

      <p>
        ℹ️ Unless you see room for improvement, you can simply make another thumbnail
        that's <b>exactly the same as the existing one</b> - this will fix the low res
        issue. If you see room for improvement based on the rules in the mod instructions
        page, feel free to make a new thumbnail.
      </p>

      <p>
        ℹ️ If the comic's thumbnail is a <b>cover page</b> which is currently not part of
        the comic's pages, you should find the cover page and make a new thumbnail of it,
        but <b>also add the cover page as the comic's first full page</b>. This is
        unfortunately the case with many existing comics.
      </p>

      <div
        className="grid gap-x-3 gap-y-2 w-fit"
        style={{ gridTemplateColumns: 'auto auto' }}
      >
        {orderedMissingComics.map(comic => (
          <React.Fragment key={comic.id}>
            <p>{getTimeSincePublishString(comic.daysSincePublished)}</p>
            <Link
              href={`/admin/comics/${comic.id}`}
              text={comic.name}
              IconRight={MdArrowForward}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function getTimeSincePublishString(daysSincePublished: number) {
  if (daysSincePublished < 32) {
    return `${daysSincePublished} days`;
  } else if (daysSincePublished < 365) {
    const months = Math.floor(daysSincePublished / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(daysSincePublished / 365);
    const months = Math.floor((daysSincePublished % 365) / 30);
    return `${years}y` + (months > 0 ? ` ${months}m` : '');
  }
}
