import { Fragment, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { CONTRIBUTION_POINTS } from '~/types/contributions';

export default function ContributionPointInfo({
  showInfoAboutUploadedComics = false,
}: {
  showInfoAboutUploadedComics?: boolean;
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className={[
        showInfo ? 'border-2 border-theme1-primary px-3 py-2' : 'px-0 py-0',
        'transition-[padding]',
      ].join(' ')}
    >
      <p className="text-center sm:text-left">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
          bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
          dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
          focus:no-underline cursor-pointer bg-[length:0%_1px] transition-[background-size]
          duration-200 bg-[center_bottom] hover:bg-[length:100%_1px]`}
        >
          {showInfo ? 'Hide' : 'Show'} point info{' '}
          <FaChevronDown
            size={10}
            className={`mb-[2px] ml-0.5 inline-block transition-transform ${
              showInfo ? '-rotate-180' : ''
            }`}
          />
        </button>
      </p>

      {showInfo && (
        <>
          <p className="text-sm font-semibold mt-1">Comic uploads</p>

          <div
            className="grid gap-y-1 gap-x-2 w-fit mt-0.5"
            style={{ gridTemplateColumns: 'auto auto' }}
          >
            {nonRejectedUploads.map(({ points, text }) => (
              <Fragment key={points}>
                <p className="text-sm">
                  <b>{points}</b>
                </p>
                <p className="text-sm text-text-weakLight dark:text-text-weakDark">
                  {text}
                </p>
              </Fragment>
            ))}
          </div>

          <p className="text-sm mt-0.5 italic text-text-weakLight dark:text-text-weakDark">
            Note that even if your comic upload has the status Approved it might still not
            be available on the site. We queue comics to spread their distribution evenly
            over time.
          </p>

          <p className="text-sm font-semibold mt-4">Comic suggestions</p>

          <div
            className="grid gap-y-1 gap-x-2 w-fit mt-0.5"
            style={{ gridTemplateColumns: 'auto auto' }}
          >
            {nonRejectedSuggestions.map(({ points, text }) => (
              <Fragment key={points}>
                <p className="text-sm">
                  <b>{points}</b>
                </p>
                <p className="text-sm text-text-weakLight dark:text-text-weakDark">
                  {text}
                </p>
              </Fragment>
            ))}
          </div>

          <p className="text-sm font-semibold mt-4">Problem reports</p>

          <div
            className="grid gap-y-1 gap-x-2 w-fit mt-0.5"
            style={{ gridTemplateColumns: 'auto auto' }}
          >
            <p className="text-sm">
              <b>{CONTRIBUTION_POINTS.comicProblem.points}</b>
            </p>
            <p className="text-sm text-text-weakLight dark:text-text-weakDark">
              {CONTRIBUTION_POINTS.comicProblem.description}
            </p>
          </div>

          <p className="text-sm font-semibold mt-4">Tag suggestions</p>

          <div
            className="grid gap-y-1 gap-x-2 w-fit mt-0.5"
            style={{ gridTemplateColumns: 'auto auto' }}
          >
            <p className="text-sm">
              <b>{CONTRIBUTION_POINTS.tagSuggestion.points}</b>
            </p>
            <p className="text-sm text-text-weakLight dark:text-text-weakDark">
              {CONTRIBUTION_POINTS.tagSuggestion.description}
            </p>
          </div>

          <p className="text-sm mt-0.5 italic text-text-weakLight dark:text-text-weakDark">
            Sometimes good suggestions might show up as rejected, if someone else
            suggested the same before you.
          </p>
        </>
      )}
    </div>
  );
}

const nonRejectedUploads = Object.entries(CONTRIBUTION_POINTS.comicUpload)
  .filter(([verdict]) => verdict !== 'rejected' && verdict !== 'rejected-list')
  .map(([_, value]) => ({
    points: value.points,
    text: value.scoreListDescription,
  }));

const nonRejectedSuggestions = Object.entries(CONTRIBUTION_POINTS.comicSuggestion)
  .filter(([verdict]) => verdict !== 'rejected' && verdict !== 'rejected-list')
  .map(([_, value]) => ({
    points: value.points,
    text: value.description,
  }));
