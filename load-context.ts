import { type PlatformProxy } from 'wrangler';

// Run `yarn typegen` to generate the Env interface, from .dev.vars,
// and probably wranger.toml if/when that is used.
// That output file is worker-configuration.d.ts.

type Cloudflare = Omit<PlatformProxy<Env>, 'dispose'>;

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}
