import { FormMethod, useFetcher } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ApiResponse } from './request-helpers';

// For some reason, Remix doesn't export SubmitTarget, so redeclare it...
type RemixSubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | {
      [name: string]: string;
    }
  | null;

type ToastFetcherArgs = {
  url: string;
  method?: FormMethod;
  toastSuccessMessage?: string;
  toastError?: boolean;
  fetchGetOnLoad?: boolean;
};

// Not a huge fan of the way Remix' fetchers are called.
// Imo, much cleaner to initialize it with a url and method, and
// then only call on it with the optional body.
// Also wrapping our own ApiResponse inside internally here,
// Just to have a bit more control over types.
// A little gotcha: This MUST be used with stuff returning ApiResponse,
// but it'll be very evident if it's not, stuff will fail fast.
export function useGoodFetcher<T = void>({
  url,
  method = 'get',
  toastSuccessMessage,
  toastError = false,
  fetchGetOnLoad = false,
}: ToastFetcherArgs) {
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const fetcher = useFetcher<ApiResponse<T>>();
  const hasSubmitFinishedRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    const stateToCheck = method === 'get' ? 'idle' : 'loading';

    if (fetcher.state === stateToCheck && hasSubmitFinishedRef.current === false) {
      hasSubmitFinishedRef.current = true;
      setHasFetchedOnce(true);
    }

    if (fetcher.state === stateToCheck && fetcher.data) {
      if (toastSuccessMessage && fetcher.data.success) {
        showSuccessToast(toastSuccessMessage);
      } else if (toastError && fetcher.data.error) {
        showErrorToast(fetcher.data.error);
      }
    }
  }, [fetcher.state, toastSuccessMessage]);

  useEffect(() => {
    if (fetchGetOnLoad && method === 'get') {
      submit();
    }
  }, [method, url, fetchGetOnLoad]);

  let returnData: T | undefined;
  // @ts-ignore
  if (fetcher.data?.data) {
    // @ts-ignore
    returnData = fetcher.data.data;
  }

  const submit = useCallback(
    (body?: RemixSubmitTarget) => {
      hasSubmitFinishedRef.current = false;
      fetcher.submit(body ?? null, {
        method: method,
        action: url,
      });
    },
    [fetcher, method]
  );

  // Because Remix FORCES you to use useEffect to respond to fetches,
  // which is just terrible. With this, you can await a fetch.
  const awaitSubmit = useCallback(
    async (body?: RemixSubmitTarget) => {
      submit(body);
      while (hasSubmitFinishedRef.current === false) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    },
    [submit]
  );

  return {
    state: fetcher.state,
    data: returnData,
    error: fetcher.data?.error,
    hasFetchedOnce: hasFetchedOnce,
    submit: submit,
    awaitSubmit: awaitSubmit,
  };
}

export function showSuccessToast(message: string) {
  toast.success(message, {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    progress: undefined,
    closeButton: false,
  });
}

export function showErrorToast(message: string) {
  toast.error(message, {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: true,
    progress: undefined,
    closeButton: false,
  });
}
