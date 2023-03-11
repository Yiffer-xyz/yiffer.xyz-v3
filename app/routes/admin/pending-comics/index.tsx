import { LoaderArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { MdCheck, MdError } from 'react-icons/md';
import Link from '~/components/Link';
import RadioButtonGroup from '~/components/RadioButton/RadioButtonGroup';
import { ComicPublishStatus } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';
import useWindowSize from '~/utils/useWindowSize';

type PendingComicsFilter = 'all' | 'scheduled' | 'unscheduled' | 'problematic';
const filterOptions: { value: PendingComicsFilter; text: string }[] = [
  { value: 'all', text: 'All' },
  { value: 'scheduled', text: 'Publishing queue' },
  { value: 'unscheduled', text: 'Unscheduled only' },
  { value: 'problematic', text: 'Problematic only' },
];

type DbPendingComic = {
  comicName: string;
  comicId: number;
  publishStatus: ComicPublishStatus;
  artistName: string;
  numberOfTags: number;
  timestamp: string;
  errorText?: string;
  publishDate?: string;
  uploadUserId?: number;
  uploadUserIP?: string;
  uploadUsername?: string;
  reviewerModId?: number;
  reviewerModName?: string;
  scheduleModId?: number;
  scheduleModName?: string;
};

export async function loader(args: LoaderArgs) {
  let pendingComicsQuery = `
    SELECT Q2.*, user.username AS scheduleModName FROM (
      SELECT Q1.*, user.username AS reviewerModName 
        FROM (
          SELECT
              comic.name AS comicName,
              comic.id AS comicId,
              comic.publishStatus,
              artist.name AS artistName,
              COUNT(*) AS numberOfTags,
              timestamp,
              errorText,
              uploadUserId,
              uploadUserIP,
              publishDate,
              user.username AS uploadUsername,
              modId AS reviewerModId,
              scheduleModId
            FROM comic
            INNER JOIN unpublishedcomic ON (comic.id = unpublishedcomic.comicId)
            INNER JOIN artist ON (artist.id = comic.artist)
            INNER JOIN comickeyword ON (comic.id = comickeyword.comicId)
            LEFT JOIN user ON (user.id = uploadUserId)
            GROUP BY comic.id, timestamp, errorText, uploadUserId, uploadUserIP, publishDate, modId, scheduleModId
        ) AS Q1
      LEFT JOIN user ON (Q1.reviewerModId = user.id)
      WHERE publishStatus = 'pending' OR publishStatus = 'scheduled' OR publishStatus = 'published'
    ) AS Q2
    LEFT JOIN user ON (Q2.scheduleModId = user.id)
    ORDER BY timestamp ASC
  `;

  const result = await queryDbDirect<DbPendingComic[]>(
    args.context.DB_API_URL_BASE as string,
    pendingComicsQuery
  );

  return {
    pendingComics: result,
  };
}

function getBgColor(pendingComic: DbPendingComic) {
  if (pendingComic.publishStatus === 'scheduled') {
    return 'bg-theme1-primaryMoreTrans dark:bg-theme1-primaryTrans';
  }
  if (pendingComic.errorText || pendingComic.numberOfTags === 0) {
    return 'bg-red-moreTrans dark:bg-red-trans';
  }

  return 'bg-blue-moreTrans dark:bg-blue-trans';
}

function isProblematic(pendingComic: DbPendingComic): boolean {
  return !!pendingComic.errorText || pendingComic.numberOfTags === 0;
}

export default function PendingComics({}) {
  const { pendingComics } = useLoaderData<typeof loader>();
  const { isMobile } = useWindowSize();

  const [filter, setFilter] = useState<PendingComicsFilter>('all');

  const filteredComics = useMemo(() => {
    if (filter === 'all') {
      return pendingComics;
    }

    if (filter === 'scheduled') {
      return pendingComics.filter(comic => comic.publishStatus === 'scheduled');
    }

    if (filter === 'unscheduled') {
      return pendingComics.filter(
        comic => comic.publishStatus === 'pending' && !isProblematic(comic)
      );
    }

    if (filter === 'problematic') {
      return pendingComics.filter(comic => isProblematic(comic));
    }

    return pendingComics;
  }, [filter, pendingComics]);

  return (
    <>
      <h1>Pending comics</h1>
      <p>
        This is the home of comics that have been uploaded by mods, or by users and then
        passed a mod review.
      </p>
      <p>Only admins can set schedule pending comics for publishing.</p>

      <div className="flex flex-row flex-wrap my-4">
        <RadioButtonGroup
          direction={isMobile ? 'vertical' : 'horizontal'}
          options={filterOptions}
          value={filter}
          onChange={val => setFilter(val)}
          name="filter"
        />
      </div>

      <div className={`flex flex-col gap-2 ${isMobile ? 'w-full' : 'w-fit'}`}>
        {filteredComics.map(comic => {
          const nameLink = (
            <Link
              href={`/admin/comics/${comic.comicId}`}
              text={`${comic.comicName} - ${comic.artistName}`}
            />
          );

          const publishedP = comic.publishStatus === 'scheduled' && comic.publishDate && (
            <p>
              <MdCheck /> Scheduled: {format(new Date(comic.publishDate), 'MMM do')}
            </p>
          );

          const scheduledP = comic.publishStatus === 'scheduled' &&
            !comic.publishDate && (
              <p>
                <MdCheck /> In publishing queue
              </p>
            );

          const noTagsP = comic.numberOfTags === 0 && (
            <p>
              <MdError /> No tags
            </p>
          );

          const errorP = comic.errorText && (
            <p>
              <MdError /> Error: {comic.errorText}
            </p>
          );

          const addedReviewerP = (
            <p>
              Added by {comic.uploadUsername || comic.uploadUserIP},{' '}
              {format(new Date(comic.timestamp), 'MMM do')}
              {comic.reviewerModName && <> - reviewer: {comic.reviewerModName}</>}
            </p>
          );

          const scheduledByP = comic.scheduleModName && (
            <p>Scheduled by: {comic.scheduleModName}</p>
          );

          return (
            <div
              className={`flex flex-row shadow rounded-sm justify-between gap-x-6 px-3 py-2 ${getBgColor(
                comic
              )}`}
            >
              {isMobile ? (
                <div>
                  {nameLink}
                  {publishedP}
                  {scheduledP}
                  {noTagsP}
                  {errorP}
                  <p>
                    Added by {comic.uploadUsername || comic.uploadUserIP},{' '}
                    {format(new Date(comic.timestamp), 'MMM do')}
                  </p>
                  {comic.reviewerModName && <p>Reviewer: {comic.reviewerModName}</p>}
                  {scheduledByP}
                </div>
              ) : (
                <>
                  <div className="w-fit">
                    {nameLink}
                    {publishedP}
                    {scheduledP}
                    {noTagsP}
                    {errorP}
                  </div>

                  <div className="w-fit flex flex-col items-end text-end">
                    {addedReviewerP}
                    {scheduledByP}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
