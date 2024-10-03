import InfoBox from '~/ui-components/InfoBox';
import type { ErrorResponse } from '@remix-run/react';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { colors } from 'tailwind.config';
import Link from '~/ui-components/Link';
import { useGoodFetcher } from './useGoodFetcher';
import { useEffect } from 'react';

export const HANDLED_ERR_MSG = 'HANDLED server error';

export function YifferErrorBoundary() {
  const error = useRouteError();

  return isRouteErrorResponse(error) ? (
    <UnthemedErrorBoundary error={error} />
  ) : (
    <ErrorBoundaryInner error={error} isAdmin={false} />
  );
}

export function AdminErrorBoundary() {
  const error = useRouteError();

  return isRouteErrorResponse(error) ? (
    <CatchBoundary error={error} />
  ) : (
    <ErrorBoundaryInner error={error} isAdmin />
  );
}

function CatchBoundary({ error }: { error: ErrorResponse }) {
  return (
    <div>
      <h1>{error.status}</h1>
      <pre>Something went wrong!</pre>
    </div>
  );
}

function ErrorBoundaryInner({ error, isAdmin }: { error: any; isAdmin: boolean }) {
  const clientErrLogFetcher = useGoodFetcher({
    url: '/api/log-client-error',
    method: 'post',
    toastError: false,
  });
  const errors: string[] = [];

  for (const errField of ['clientMessage', 'message', 'errorCode', 'sqlErrorShort']) {
    if (error[errField]) {
      errors.push(error[errField]);
    }
  }

  const isWindowAndJsWorking = typeof window !== 'undefined';
  const isLocalhost = isWindowAndJsWorking && window.location.hostname === 'localhost';

  useEffect(() => {
    maybeLogClientErr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function maybeLogClientErr() {
    if (isWindowAndJsWorking) {
      console.log('🆎 ERROR FROM maybeLogClientErr');
      console.error(errors);

      try {
        for (const errStr of errors) {
          const isStr = typeof errStr === 'string';
          let parsedAndNotServer = false;
          // I think they're always string, but just in case
          if (!isStr) {
            const parsed = JSON.parse(errStr);
            parsedAndNotServer = !parsed?.error?.isFromServer;
          }
          if (isStr || parsedAndNotServer) {
            const formData = new FormData();
            formData.append('url', window.location.toString());
            formData.append('logMessage', errStr);
            clientErrLogFetcher.submit(formData);
          }
        }
      } catch (e) {}
    }
  }

  return (
    <div className="container mx-auto">
      <InfoBox
        variant="error"
        showIcon
        disableElevation
        className="mx-auto mt-8 md:mt-16 max-w-90p md:max-w-xxl"
        title="Uh-oh..."
        boldText={false}
      >
        <p className="mt-1">
          Something's gone wrong. We've been notified and will fix it as soon as we can.
        </p>
        <p className="mb-2">
          If it keeps happening, feel free to quickly report it in the{' '}
          <Link
            href="/contribute/feedback"
            text="feedback section"
            color="white"
            isInsideParagraph
            showRightArrow
          />
          .
        </p>

        <Link href="/" text="To home page" color="white" showRightArrow />

        {isWindowAndJsWorking && (
          <div
            className="cursor-pointer mt-2 w-fit"
            onClick={() => window.location.reload()}
          >
            <Link text="Reload this page" color="white" showRightArrow href="#" />
          </div>
        )}
      </InfoBox>

      {(isAdmin || isLocalhost) && (
        <div className="mt-6 max-w-90p md:max-w-xxl p-4 pt-3 bg-theme1-primaryTrans mx-auto flex flex-col gap-4">
          <p className="font-semibold">
            Some details - only because this is{' '}
            {isLocalhost ? 'localhost dev' : 'the admin panel'}:
          </p>
          {errors.map(err => {
            return (
              <p className="pre-wrap break-word" key={err}>
                {err}
              </p>
            );
          })}
          <p>
            Full details are kept in the error logs
            {isLocalhost ? ' and in your console logs' : ''}.
          </p>
        </div>
      )}
    </div>
  );
}

function UnthemedErrorBoundary({ error }: { error: ErrorResponse }) {
  const navStyle = {
    display: 'flex',
    background: `linear-gradient(to right, ${colors.theme1.primary}, ${colors.theme2.primary})`,
    padding: '0.375rem 1rem', // Equivalent to px-4 py-1.5
    justifyContent: 'space-between',
    marginBottom: '1rem',
    color: '#e5e7eb', // Equivalent to text-gray-200
    width: '100%',
    zIndex: 20,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Approximation of nav-shadowing
    height: 42,
  };

  return (
    <div style={{ padding: 0, margin: 0 }}>
      <nav style={navStyle}> </nav>
      <h1>{error.status}</h1>
      <pre>Something went wrong!</pre>
    </div>
  );
}
