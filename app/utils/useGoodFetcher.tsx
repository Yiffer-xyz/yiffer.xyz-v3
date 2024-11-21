/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { FormEncType, FormMethod, SubmitOptions } from '@remix-run/react';
import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { ApiResponse } from './request-helpers';
import { useUIPreferences } from './theme-provider';

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
  url?: string;
  method?: FormMethod;
  onFinish?: () => void;
  onError?: (error: string) => void;
  toastSuccessMessage?: string;
  preventToastClose?: boolean;
  toastError?: boolean;
  fetchGetOnLoad?: boolean;
  encType?: FormEncType;
};

type JsonObject = {
  [Key in string]: JsonValue | undefined;
} & {
  [Key in string]?: JsonValue | undefined;
};
type JsonArray = JsonValue[] | readonly JsonValue[];
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | JsonValue
  | null;

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
  onError,
  toastSuccessMessage,
  preventToastClose = false,
  toastError = true, // TODO: Probably flip this
  fetchGetOnLoad = false,
  encType,
}: ToastFetcherArgs) {
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const fetcher = useFetcher<ApiResponse<T>>();
  const fetchingStateRef = useRef<'is-fetching' | 'not-started'>('not-started');
  const { theme } = useUIPreferences();

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

      if (fetcher.data) {
        if (toastSuccessMessage && fetcher.data.success && !fetcher.data.error) {
          showSuccessToast(toastSuccessMessage, preventToastClose, theme);
        } else if (toastError && fetcher.data.error) {
          let errMsg: string;
          if (typeof fetcher.data.error === 'string') {
            errMsg = fetcher.data.error;
          } else {
            errMsg =
              'errorMessage' in fetcher.data.error
                ? // @ts-ignore
                  fetcher.data.error.errorMessage
                : fetcher.data.error;
          }
          showErrorToast(errMsg, theme);
        }
      }

      if (onFinish && !fetcher.data?.error) {
        onFinish();
      }
      if (onError && fetcher.data?.error) {
        onError(fetcher.data.error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state]);

  // useEffect(() => {
  //   // The component can unmount before the state has gone 'idle'
  //   // (which can happen when revalidation automatically happens after)
  //   // a post, during which it'll be 'loading' and then whichever component
  //   // using useGoodFetcher unmounts because of changes.
  //   // If this happens and we should've toasted, do so!
  //   // 🚨 Weakness! If the component (intentionally) unmounts this way but
  //   // the fetch result is an ERROR, this will still toast success.
  //   // This, however, seems to be a bad situation. On errors, either crash
  //   // and let an error boundary catch, or keep whatever form it is open without
  //   // unmounting it.
  //   return () => {
  //     if (fetchingStateRef.current === 'is-fetching' && toastSuccessMessage) {
  //       showSuccessToast(toastSuccessMessage, preventToastClose, theme);
  //     }
  //   };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [toastSuccessMessage, theme]);

  useEffect(() => {
    if (fetchGetOnLoad && method === 'get') {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, url, fetchGetOnLoad]);

  let returnData: T | undefined;
  // @ts-ignore
  if (fetcher.data?.data) {
    // @ts-ignore
    returnData = fetcher.data.data;
  }

  const submit = useCallback(
    (body?: SubmitTarget) => {
      fetchingStateRef.current = 'is-fetching';
      const submitOptions: SubmitOptions = {
        method: method,
      };
      if (url) submitOptions.action = url;
      if (encType) submitOptions.encType = encType;
      // TODO: Not sure why this is whining. I extracted `SubmitTarget` by entering
      // the `fetcher.submit` method and literally copying the types...
      // @ts-ignore
      fetcher.submit(body, submitOptions);
    },
    [fetcher, method, url, encType]
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
    [fetcher, method, url]
  );

  return {
    data: returnData,
    isError: !!fetcher.data?.error && fetcher.state === 'idle',
    errorMessage: fetcher.data?.error || '',
    success: fetcher.data?.success,
    isLoading: fetcher.state !== 'idle',
    hasFetchedOnce: hasFetchedOnce,
    submit: submit,
    awaitSubmit: awaitSubmit,
    Form: form,
  };
}

export function showSuccessToast(
  message: string,
  preventClose: boolean,
  theme: string | null
) {
  toast.success(message, {
    position: 'top-right',
    theme: theme === 'dark' ? 'dark' : 'light',
    className(context?) {
      return context?.defaultClassName + ' dark:bg-gray-300';
    },
    style: { width: 'fit-content', minHeight: 'auto' },
    autoClose: preventClose ? false : 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    progress: undefined,
    closeButton: false,
  });
}

export function showErrorToast(message: string, theme: string | null) {
  toast.error(message, {
    position: 'top-right',
    theme: theme === 'dark' ? 'dark' : 'light',
    className(context?) {
      return context?.defaultClassName + ' dark:bg-gray-300';
    },
    style: { width: 'fit-content', minHeight: 'auto' },
    autoClose: false,
    hideProgressBar: true,
    closeOnClick: true,
    progress: undefined,
    closeButton: false,
  });
}
