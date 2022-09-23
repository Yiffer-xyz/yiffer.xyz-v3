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
        Lots of text. Lots of text. Lots of text. Lots of text. Lots of text. Lots of of
        text.
      </p>
      <p>
        Lots of text. Lots of text. Lots of text. Lots of text. Lots of text. Lots of
        text. Lots of text. Lots of text. Lots of text.
      </p>

      <h2 className="mt-4">Before you begin: requirements</h2>
      <ul>
        <li>asd asd asda sdasd asdasd.</li>
        <li>asd asd asda sdasd asdasd.</li>
        <li>asd asd asda sdasd asdasd.</li>
        <li>asd asd asda sdasd asdasd.</li>
        <li>asd asd asda sdasd asdasd.</li>
        <li>asd asd asda sdasd asdasd.</li>
      </ul>

      <h2 className="mt-4">Checklist</h2>
      <p>
        All pages uploaded must be publicly visible. A comic with some of its pages
        exclusive to Patreon or similar services will be rejected.
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
