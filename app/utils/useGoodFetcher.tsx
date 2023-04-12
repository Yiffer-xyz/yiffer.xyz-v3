import { FormEncType, FormMethod, SubmitOptions, useFetcher } from '@remix-run/react';
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

type ToastFetcherArgs<T = void> = {
  url?: string;
  method?: FormMethod;
  onFinish?: () => void;
  toastSuccessMessage?: string;
  preventToastClose?: boolean;
  toastError?: boolean;
  fetchGetOnLoad?: boolean;
  encType?: FormEncType;
};

// Not a huge fan of the way Remix' fetchers are called.
// Imo, much cleaner to initialize it with a url and method, and
// then only call on it with the optional body.
// Also wrapping our own ApiResponse inside internally here,
// Just to have a bit more control over types.
// A little gotcha: This MUST be used with stuff returning ApiResponse,
// but it'll be very evident if it's not, stuff will fail fast.

// The submit function can be awaited, OR an onFinish callback can be passed in.
export function useGoodFetcher<T = void>({
  url,
  method = 'get',
  onFinish,
  toastSuccessMessage,
  preventToastClose = false,
  toastError = true, // TODO: Probably flip this
  fetchGetOnLoad = false,
  encType,
}: ToastFetcherArgs<T>) {
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const fetcher = useFetcher<ApiResponse<T>>();
  const fetchingStateRef = useRef<'is-fetching' | 'not-started'>('not-started');

  useEffect(() => {
    // Technically if it's a POST, the fetch itself is done at 'loading',
    // but waiting until 'idle' is better UX, to avoid a flicker.
    const stateToCheck = 'idle';

    // This happens when using fetcher.Form, as the submit method is not actively
    // invoked in that case.
    const didJustInitiateNativeFormSubmit =
      fetcher.state === 'submitting' && fetchingStateRef.current === 'not-started';
    if (didJustInitiateNativeFormSubmit) {
      fetchingStateRef.current = 'is-fetching';
      return;
    }

    const didJustFinish =
      fetcher.state === stateToCheck && fetchingStateRef.current === 'is-fetching';

    if (didJustFinish) {
      fetchingStateRef.current = 'not-started';
      setHasFetchedOnce(true);
      if (onFinish) {
        onFinish();
      }

      if (fetcher.data) {
        if (toastSuccessMessage && fetcher.data.success) {
          showSuccessToast(toastSuccessMessage, preventToastClose);
        } else if (toastError && fetcher.data.error) {
          showErrorToast(fetcher.data.error);
        }
      }
    }
  }, [fetcher.state]);

  useEffect(() => {
    // The component can unmount before the state has gone 'idle'
    // (which can happen when revalidation automatically happens after)
    // a post, during which it'll be 'loading' and then whichever component
    // using useGoodFetcher unmounts because of changes.
    // If this happens and we should've toasted, do so!
    // 🚨Weakness! If the component (intentionally) unmounts this way but
    // the fetch result is an ERROR, this will still toast success.
    // This, however, seems to be a bad situation. On errors, either crash
    // and let an error boundary catch, or keep whatever form it is open without
    // unmounting it.
    return () => {
      if (fetchingStateRef.current === 'is-fetching' && toastSuccessMessage) {
        showSuccessToast(toastSuccessMessage, preventToastClose);
      }
    };
  }, [toastSuccessMessage]);

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
      fetchingStateRef.current = 'is-fetching';
      const submitOptions: SubmitOptions = {
        method: method,
      };
      if (url) submitOptions.action = url;
      if (encType) submitOptions.encType = encType;
      fetcher.submit(body ?? null, submitOptions);
    },
    [fetcher, method]
  );

  // Because Remix FORCES you to use useEffect to respond to fetches,
  // which is just terrible. With this, you can await a fetch.
  // Preferable alternative to this: use the onFinish callback.
  const awaitSubmit = useCallback(
    async (body?: RemixSubmitTarget) => {
      submit(body);
      while (fetchingStateRef.current === 'is-fetching') {
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    },
    [submit]
  );

  // Allows for using fetcher.Form for uncontrolled forms, but without
  // having to supply url and action, since we already have that from fetcher init.
  const form = useCallback(
    ({ children, className }: { children: React.ReactNode; className?: string }) => {
      return (
        <fetcher.Form action={url} method={method} className={className}>
          {children}
        </fetcher.Form>
      );
    },
    []
  );

  return {
    data: returnData,
    error: fetcher.data?.error,
    success: fetcher.data?.success,
    isLoading: fetcher.state !== 'idle',
    hasFetchedOnce: hasFetchedOnce,
    submit: submit,
    awaitSubmit: awaitSubmit,
    Form: form,
  };
}

export function showSuccessToast(message: string, preventClose: boolean) {
  toast.success(message, {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: preventClose ? false : 3000,
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
