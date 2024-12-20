import Checkbox from '~/ui-components/Checkbox/Checkbox';
import Button from '~/ui-components/Buttons/Button';
import { RiArrowRightLine } from 'react-icons/ri';
import { useState } from 'react';
import Textarea from '~/ui-components/Textarea/Textarea';
import InfoBox from '~/ui-components/InfoBox';

export type Step1Props = {
  isMod: boolean;
  onNext: (source: string) => void;
};

export default function Step1({ onNext, isMod }: Step1Props) {
  const [hasCheckedPublic, setHasCheckedPublic] = useState(false);
  const [hasCheckedResolution, setHasCheckedResolution] = useState(false);
  const [source, setSource] = useState('');

  return (
    <>
      <h2>Introduction</h2>
      <p>
        Thank you for helping out! We believe in the community, and allow anyone to
        contribute. If this feature is abused, we will have to restrict it. Please help us
        make this site even better by following the rules below carefully. If we
        repeatedly have to reject your suggestions, you will be prohibited from suggesting
        comics.
      </p>
      <p className="mt-4">
        If you would like to follow your suggestion’s status, create an account! You can
        then follow updates in the “view your contributions” section above. Having a user
        will also earn you points in the scoreboard on the previous page. The more
        accurate the information you provide is, the higher your contribution score will
        be.
      </p>

      <h2 className="mt-6">Before you begin: requirements</h2>
      <ul>
        <li>The comic must be at least four pages long.</li>
        <li>
          The comic must be a <i>comic</i>, not a collage (group of pictures with no
          story).
        </li>
        <li>The comic cannot have censoring bars.</li>
        <li>Colored comics are preferred. If not, it must be of good quality.</li>
        <li>In general, low quality (“poorly drawn”) comics will not be accepted.</li>
        <li>No cub comics.</li>
        <li>Pages must be in jpg og png format.</li>
      </ul>

      <h2 className="mt-6">Checklist</h2>
      <p>
        <u>All</u> uploaded pages uploaded must be publicly available. A comic with some
        of its pages exclusive to subscription services (eg. Patreon, Subscribestar) will
        be rejected.
      </p>
      <Checkbox
        label="I confirm that the pages are publicly available"
        checked={hasCheckedPublic}
        onChange={v => setHasCheckedPublic(v)}
        className="mt-2"
      />

      <p className="mt-4">
        The pages uploaded must be of the highest possible resolution that is publicly
        available. Resized and compressed pages, often found on third-party websites, we
        not be accepted. Please check the artist's public galleries (like FurAffinity) to
        ensure that the page resolution is correct.
      </p>
      <Checkbox
        label="I confirm that the pages are in the highest resolution publicly available"
        checked={hasCheckedResolution}
        onChange={v => setHasCheckedResolution(v)}
        className="mt-2"
      />

      <h2 className="mt-6">Source</h2>
      {isMod && (
        <InfoBox
          variant="info"
          text={`As a mod, prviding the source is optional. It doesn't hurt to supply the link regardless, though!`}
          boldText={false}
          fitWidth
          className="mb-4"
        />
      )}

      <p>
        Where did you find the comic's pages? Please provide a link to and/or description
        of the source. If the pages are on individual links, a link to one page is enough
        - we don't need one for every page.
      </p>
      <p className="mt-4">
        If your answer is "google", or "on my computer", we will reject your upload, as it
        is harder for us to verify the page quality and availability (the "Checklist"
        checkboxes above).
      </p>
      <Textarea
        value={source}
        onChange={setSource}
        name="source"
        label="Source link or description"
        className="mt-4"
      />

      <Button
        text="Continue"
        disabled={
          !hasCheckedPublic || !hasCheckedResolution || (source.length < 3 && !isMod)
        }
        endIcon={RiArrowRightLine}
        variant="contained"
        color="primary"
        onClick={() => onNext(source || 'Mod upload')}
        className="mt-6"
      />
    </>
  );
}
