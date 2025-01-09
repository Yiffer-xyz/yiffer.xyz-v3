import { useMemo, useState } from 'react';
import { MdArrowForward, MdCheck, MdClear } from 'react-icons/md';
import { COMIC_PROBLEM_CATEGORIES } from '~/types/constants';
import type { Comic } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';
import Select from '~/ui-components/Select/Select';
import Textarea from '~/ui-components/Textarea/Textarea';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { ComicProblemSubmission } from '../api.submit-comic-problem';

type ComicReportProblemProps = {
  comic: Comic;
  setIsReportingProblem: (isManagingTags: boolean) => void;
  isLoggedIn: boolean;
  infoBoxesExtraMarginClass: string;
};

export default function ComicReportProblem({
  comic,
  setIsReportingProblem,
  isLoggedIn,
  infoBoxesExtraMarginClass,
}: ComicReportProblemProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [problemType, setProblemType] = useState<string | undefined>();
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [hasChecked, setHasChecked] = useState(false);

  const { fullProblem, requiresCheckbox } = useMemo(() => {
    return {
      fullProblem: COMIC_PROBLEM_CATEGORIES.find(c => c.title === problemType),
      requiresCheckbox: problemType === 'Update missing',
    };
  }, [problemType]);

  const { submit: submitProblem, isLoading } = useGoodFetcher({
    url: '/api/submit-comic-problem',
    method: 'post',
    onFinish: () => setIsSuccess(true),
  });

  function onCancel() {
    setIsReportingProblem(false);
  }

  function onSubmit() {
    const body: ComicProblemSubmission = {
      comicId: comic.id,
      problemTitle: problemType!,
      problemDescription,
    };
    submitProblem({
      body: JSON.stringify(body),
    });
  }

  if (isSuccess) {
    return (
      <InfoBox
        variant="success"
        className={`mt-4 w-fit md:w-[728px] ${infoBoxesExtraMarginClass}`}
        closable
        overrideOnCloseFunc={onCancel}
      >
        <p className="font-normal">Thanks for your report!</p>
        {isLoggedIn ? (
          <p className="font-normal">
            You can follow your submission's progress on the{' '}
            <Link
              isInsideParagraph
              href="/contribute/your-contributions"
              text="Your contributions page"
              className="!text-white"
              IconRight={MdArrowForward}
            />
          </p>
        ) : (
          <p className="font-normal">
            Next time, if you log in, you can follow your submission's progress and earn
            contribution points for it.
          </p>
        )}
      </InfoBox>
    );
  }

  return (
    <TopGradientBox
      containerClassName={`mt-4 max-w-2xl md:max-w-none md:w-[728px] ${infoBoxesExtraMarginClass}`}
      innerClassName="p-4 flex flex-col"
    >
      <p className="font-semibold text-lg">Report problem</p>
      <p className="text-sm mb-2">Your contribution will be reviewed by mods.</p>
      {!isLoggedIn && (
        <p className="text-sm mb-3">
          Log in or sign up to earn contribution points and track your suggestion's
          progress!
        </p>
      )}

      <Select
        options={COMIC_PROBLEM_CATEGORIES.map(c => ({ text: c.title, value: c.title }))}
        name="Problem type"
        title="Problem type"
        value={problemType}
        onChange={setProblemType}
        className="mt-2"
      />

      {problemType && fullProblem && (
        <>
          <InfoBox
            variant="info"
            className="mt-3 !px-3 !py-2"
            boldText={false}
            disableElevation
            fitWidth
          >
            <p className="text-sm">{fullProblem.description}</p>
          </InfoBox>

          <Textarea
            name="problemDescription"
            onChange={setProblemDescription}
            value={problemDescription}
            placeholder="Describe the issue or provide info"
            className="mt-3"
          />

          {requiresCheckbox && (
            <Checkbox
              checked={hasChecked}
              onChange={setHasChecked}
              label="I confirm that the pages in the links above are intended by the artist to be publicly available"
              className="mt-4"
            />
          )}
        </>
      )}

      <div className="mt-4 flex flex-row gap-2 self-end">
        <Button text="Cancel" variant="outlined" onClick={onCancel} startIcon={MdClear} />
        <LoadingButton
          text="Submit for review"
          startIcon={MdCheck}
          isLoading={isLoading}
          onClick={onSubmit}
          disableElevation
          disabled={
            !problemType || !problemDescription || (requiresCheckbox && !hasChecked)
          }
        />
      </div>
    </TopGradientBox>
  );
}
