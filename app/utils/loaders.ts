import { DataFunctionArgs, LoaderFunction, redirect } from '@remix-run/cloudflare';
import { getUserSessionData } from './auth.server';

/**
 * Merge loader functions into a single loader function that can be used in a route.
 * @param loaders - The loader functions to merge.
 * @returns A loader function that calls all the loader functions.
 * @example
 * ```ts
 * export const loader = mergeLoaders(
 *  someLoader,
 *  anotherLoader,
 * );
 * ```
 */
export const mergeLoaders = (...loaders: LoaderFunction[]): LoaderFunction => {
  return async (loaderArgs: DataFunctionArgs) => {
    const loaderPromises = loaders.map(loader => loader(loaderArgs));
    const loaderResults = await Promise.all(loaderPromises);
    const mergedData = loaderResults.reduce((acc, data) => ({ ...acc, ...(data || {}) }), {});
    return mergedData;
  };
};

/**
 * Load the user session data.
 * @example
 * ```ts
 * export { authLoader as loader } from "~/utils/loaders";
 * ```
 */
export const authLoader: LoaderFunction = async ({ request, context }) => {
  const userSession = await getUserSessionData(request, context.JWT_CONFIG_STR);
  const data = {
    user: userSession,
  };
  return data;
};

/**
 * Redirect to another route if the user is not logged in.
 * @param to - The route to redirect to.
 * @returns A loader function that redirects to the given route if the user is not logged in.
 * @example
 * ```ts
 * export const loader = redirectNoAuth('/login');
 * ```
 */
export const redirectNoAuth = (to: string): LoaderFunction => {
  return async (loaderArgs: DataFunctionArgs) => {
    const { user } = await authLoader(loaderArgs);
    if (!user) return redirect(to);
    else return null;
  };
};
