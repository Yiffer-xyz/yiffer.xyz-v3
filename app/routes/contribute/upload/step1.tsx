import Checkbox from '~/components/Checkbox/Checkbox';
import Button from '~/components/Buttons/Button';
import { RiArrowRightLine } from 'react-icons/ri';
import { useState } from 'react';

export type Step1Props = {
  onNext: () => void;
};

export default function Step1({ onNext }: Step1Props) {
  const [hasCheckedPublic, setHasCheckedPublic] = useState(false);
  const [hasCheckedResolution, setHasCheckedResolution] = useState(false);

  return (
    <>
      <h2>Introduction</h2>
      <p>
        Thank you for helping out! We believe in the community, and allow anyone to contribute. If
        this feature is abused, we will have to restrict it. Please help us make this site even
        better by following the rules below carefully. If we repeatedly have to reject your
        suggestions, you will be prohibited from suggesting comics.
      </p>
      <p className="mt-4">
        If you would like to follow your suggestion’s status, create an account! You can then follow
        updates in the “view your contributions” section above. Having a user will also earn you
        points in the scoreboard on the previous page. The more accurate the information you provide
        is, the higher your contribution score will be.
      </p>

      <h2 className="mt-4">Before you begin: requirements</h2>
      <ul>
        <li>The comic must be at least four pages long.</li>
        <li>
          The comic must be a <i>comic</i>, not a collage (group of pictures with no story).
        </li>
        <li>The comic cannot have censoring bars.</li>
        <li>Colored comics are preferred. If not, it must be of good quality.</li>
        <li>In general, low quality (“poorly drawn”) comics will not be accepted.</li>
        <li>No cub comics.</li>
        <li>Pages must be in jpg og png format.</li>
      </ul>

      <h2 className="mt-4">Checklist</h2>
      <p>
        <u>All</u> pages uploaded must be publicly visible. A comic with some of its pages exclusive
        to Patreon or similar services will be rejected.
      </p>
      <Checkbox
        label="I confirm that the pages are publicly available"
        checked={hasCheckedPublic}
        onChange={v => setHasCheckedPublic(v)}
        className="mt-2"
      />

      <p className="mt-4">
        The pages uploaded must be of the highest possible resolution that is publicly available.
        Resized and compressed pages, often found on third-party websites, we not be accepted.
        Please check the artist's public galleries (like FurAffinity) to ensure that the page
        resolution is correct.
      </p>
      <Checkbox
        label="I confirm that the pages are in the highest resolution publicly available"
        checked={hasCheckedResolution}
        onChange={v => setHasCheckedResolution(v)}
        className="mt-2"
      />

      <Button
        text="Continue"
        disabled={!hasCheckedPublic || !hasCheckedResolution}
        endIcon={RiArrowRightLine}
        variant="contained"
        color="primary"
        onClick={onNext}
        className="mt-6"
      />
    </>
  );
}
