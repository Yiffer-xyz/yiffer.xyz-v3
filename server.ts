import { logDevReady } from '@remix-run/cloudflare';
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '@remix-run/dev/server-build';
import type { Env } from '~/types/types';

type Context = EventContext<Env, string, unknown>;

declare module '@remix-run/server-runtime' {
  // TODO: can we fix?
  interface AppLoadContext extends Env {}
}

if (process.env.NODE_ENV === 'development') {
  logDevReady(build);
}

const handleRequest = createPagesFunctionHandler({
  build,
  mode: build.mode,
  getLoadContext: (context: Context) => ({
    ...context.env,
  }),
});

export function onRequest(context: Context) {
  return handleRequest(context);
}
