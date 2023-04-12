import InfoBox from '~/components/InfoBox';
import { useEffect } from 'react';
import { logErrorBoundaryException } from '~/utils/request-helpers';
import { useCatch } from '@remix-run/react';

export const handledErrMsg = 'HANDLED server error';

export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return (
      <div>
        <h1>Not found</h1>
        <pre>404 - could not find the resource you were looking for!</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>{caught.status}</h1>
      <pre>Something went wrong!</pre>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: any }) {
  useEffect(() => {
    // If the message is handledErrMsg, then it's an api error that
    // has already been logged to Sentry. Otherwise, it's a front-end
    // crash that should be logged.
    if (error && error.message !== handledErrMsg) {
      logErrorBoundaryException(error);
    }
  }, [error]);

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
