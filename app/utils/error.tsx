import InfoBox from '~/ui-components/InfoBox';
import { useEffect } from 'react';
import { logErrorBoundaryException } from '~/utils/request-helpers';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

export const HANDLED_ERR_MSG = 'HANDLED server error';

export function ErrorBoundary() {
  const error = useRouteError();

  return isRouteErrorResponse(error) ? (
    <CatchBoundary status={error.data} />
  ) : (
    <ErrorBoundaryInner error={error} />
  );
}

function CatchBoundary({ status }: { status?: number }) {
  if (status === 404) {
    return (
      <div>
        <h1>Not found</h1>
        <pre>404 - could not find the resource you were looking for!</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>{status}</h1>
      <pre>Something went wrong!</pre>
    </div>
  );
}

// TODO: Verify working
function ErrorBoundaryInner({ error }: { error: any }) {
  useEffect(() => {
    // If the message is handledErrMsg, then it's an api error that
    // has already been logged to Sentry. Otherwise, it's a front-end
    // crash that should be logged.
    if (error && error.message !== HANDLED_ERR_MSG) {
      logErrorBoundaryException(error);
    }
  }, [error]);

  return (
    <div role="alert">
      <InfoBox variant="error" showIcon disableElevation className="mx-auto" fitWidth>
        Something went wrong in this beloved admin panel of ours :(
      </InfoBox>

      {['clientMessage', 'message', 'errorCode']
        .filter(errField => error && error[errField])
        .map(errField => {
          return (
            <p
              className="mt-4 p-4 bg-theme1-primaryTrans max-w-xl mx-auto"
              key={errField}
            >
              {error[errField]}
            </p>
          );
        })}
    </div>
  );
}
