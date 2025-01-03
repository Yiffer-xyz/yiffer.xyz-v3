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
    <>
      <h1>Update old thumbnails</h1>
      <p className="mb-2">
        Thumbnails uploaded to old Yiffer were converted to a too low resolution. We
        should work on replacing them with higher res ones until all have been replaced.
        Doing so will give you points in the contributions score system.
      </p>
      <p className="mb-2">
        <b>
          Current progress: {numMissingComics}/{numTotalComics} need fixing.
        </b>
      </p>

      <p className="mb-2">
        Ordered by time since published date. More recent = more important.
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
    </>
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
