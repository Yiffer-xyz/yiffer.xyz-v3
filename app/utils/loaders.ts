import { DataFunctionArgs, LoaderFunction, redirect } from "@remix-run/cloudflare";
import { getUserSessionData } from "./auth.server";

export const mergeLoaders = (...loaders: LoaderFunction[]) => {
  return async (loaderArgs: DataFunctionArgs) => {
    return loaders.reduce(async (acc, loader) => {
      return {
        ...acc,
        ...(await loader(loaderArgs) || {}),
      };
    }, {});
  }
}

export const authLoader: LoaderFunction = async function ({ request }) {
  const userSession = await getUserSessionData(request);
  const data = {
    user: userSession,
  };
  return data;
};

export const redirectNoAuth = (to: string) => {
  return async (loaderArgs: DataFunctionArgs) => {
    const { user } = await authLoader(loaderArgs);
    if (!user) return redirect(to);
    else return null;
  }
}
