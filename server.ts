import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '@remix-run/dev/server-build';
import { Env } from '~/types/types';

type Context = EventContext<Env, string, unknown>;

declare module '@remix-run/server-runtime' {
  interface AppLoadContext extends Env {}
}

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (context: Context) => ({
    ...context.env,
  }),
});

export function onRequest(context: Context) {
  return handleRequest(context);
}
