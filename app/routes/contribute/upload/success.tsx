import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';

type SuccessMessageProps = {
  isLoggedIn: boolean;
};

export default function SuccessMessage({ isLoggedIn }: SuccessMessageProps) {
  return (
    <InfoBox variant="success" title="Upload successful!" boldText={false}>
      <p className="my-4">
        Your comic has been uploaded successfully. It will be reviewed by our moderator team
        shortly.
      </p>
      {isLoggedIn ? (
        <p>
          You can view the status of your submission at the{' '}
          <Link href="/contribute/your-contributions" text="your contributions" /> page.
        </p>
      ) : (
        <p>
          Since you are not logged in, you cannot track the status of your submission. We recommend
          logging in or creating a user for next time! This will also allow you to collect reward
          points for your submissions.
        </p>
      )}
    </InfoBox>
  );
}
