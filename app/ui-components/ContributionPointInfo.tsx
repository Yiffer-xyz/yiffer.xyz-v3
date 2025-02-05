import { Fragment } from 'react';
import { CONTRIBUTION_POINTS } from '~/types/contributions';
import ShowHideBox from './ShowHideBox/ShowHideBox';

export default function ContributionPointInfo() {
  return (
    <ShowHideBox showButtonText="Show point info" hideButtonText="Hide point info">
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
          Sometimes good suggestions might show up as rejected, if someone else suggested
          the same before you.
        </p>

        <p className="text-sm mt-4 italic text-text-weakLight dark:text-text-weakDark">
          Mods have different scoring criteria and actions.
        </p>
      </>
    </ShowHideBox>
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
