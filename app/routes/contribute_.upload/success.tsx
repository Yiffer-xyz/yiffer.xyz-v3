import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';

type SuccessMessageProps = {
  isLoggedIn: boolean;
  isModOrAdmin: boolean;
};

export default function SuccessMessage({
  isLoggedIn,
  isModOrAdmin,
}: SuccessMessageProps) {
  return (
    <InfoBox variant="success" title="Upload successful!" boldText={false}>
      {!isModOrAdmin && (
        <p className="my-4">
          Your comic has been uploaded successfully. It will be reviewed by our moderator
          team shortly.
        </p>
      )}

      {!isLoggedIn && (
        <p>
          Since you are not logged in, you cannot track the status of your submission. We
          recommend logging in or creating a user for next time! This will also allow you
          to collect reward points for your submissions.
        </p>
      )}

      {isLoggedIn && !isModOrAdmin && (
        <p>
          You can view the status of your submission on the{' '}
          <Link
            href="/contribute/your-contributions"
            text="your contributions page"
            className="!text-white"
            isInsideParagraph
            showRightArrow
          />
        </p>
      )}

      {isModOrAdmin && (
        <p className="mt-2">
          <Link
            href="/admin/pending-comics"
            text="View in mod pending comics list"
            className="!text-white"
            showRightArrow
            isInsideParagraph
          />
        </p>
      )}
    </InfoBox>
  );
}
