import InfoBox from '~/components/InfoBox';

export function ErrorBoundary({ error }: { error: any }) {
  return (
    <div role="alert">
      <InfoBox variant="error" showIcon disableElevation className="mx-auto w-fit">
        Something went wrong in this beloved admin panel of ours :(
      </InfoBox>

      {['clientMessage', 'message', 'errorCode'].map(errField => {
        if (error[errField]) {
          return (
            <p className="mt-4 p-4 bg-theme1-primaryTrans max-w-xl mx-auto">
              {error[errField]}
            </p>
          );
        }
      })}
    </div>
  );
}
