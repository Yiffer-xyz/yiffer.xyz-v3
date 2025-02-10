## Architecture

This is a Remix app, running on Cloudflare Pages. It's serverless and server-side rendered. Additional components:

- Cloudflare D1 SQL database (sqlite)
- Cloudflare R2 storage
- Posthog for analytics (also Google Analytics)
- Postmark for emailss
- Cloudflare CDN
- A cloudflare worker for running crons (in the `workers` folder)

There's also a small "normal" node+express server running on a VM in Vultr, which you'll need to run alongside this project when developing locally. The repo for this is [yiffer.xyz-v3-imageserver](https://github.com/Yiffer-xyz/yiffer.xyz-v3-imageserver). This is used for:
- Processing images - Sharp is not available on the Cloudflare VMs. Comic pages, thumbnails, and advertisements.
- Some page management, like renaming/reordering, though this should ideally be moved to this project, as has been started in for example `api.admin.rename-comic-files.ts`.
- In local development, used to serve images.

## Development

### Setup

All environment variables should be put in `.dev.vars`, in project root. Ask Melon for values. These are set in the Cloudflare dashboard for the main/dev sites. `wrangler.toml` also includes a few bindings that are available (R2, D1).

### Running

See `db/README.md` for database setup instructions.

After setting up the config file above, run `yarn dev`, and the site should be good to go at [http://localhost:5173](http://localhost:5173).

### Deploying

All pushes will generate a preview build on Cloudflare. You can access these in the cloudflare dashboard (if you have permission). For PRs, you can also check on Github by checking the PR's ✅checkmark after a minute or two. It'll show a "Cloudflare Pages — Deployed successfully" which you can expand to get the preview link. The master branch is continuously deployed to [new.yiffer.xyz](https://new.yiffer.xyz). The `beta` branch is continuously deployed to [new.testyiffer.xyz](https://new.testyiffer.xyz).

## Coding

### Random tips/info
- Of course, prettier and eslint are used. I recommend a lint-on-save rule.
- Since everything is SSR'd, make sure to avoid hydration mismatches (will show up in the browser console). Prefer using tailwind classes to show/hide things rather than show/hiding them via js.
- Console.logs from loaders and actions (aka server-side code) show up in the cli you're running the dev command from - not in the browser console.
- Generally, if unsure of how to do things, take inspiration from other code already there.
- If you don't have it already, get the `Tailwind CSS IntelliSense` extension for VSCode.

### Fetching

For routes that are as simple as [fetch data, render page], or even [fetch data, render page, submit data], Remix makes it easy by providing `loader` and `action` functions.

Sometimes, particularly when making async calls prompted by user actions without leaving the page, it's not that easy. In these cases, I'm not a fan of how Remix deals with fetching. For these situations, use the `useGoodFetcher` hook.

Pitfall: If you make a route func that's supposed to be a GET route, you must export a `loader`, not an `action`.

API Routes that are not tied to a single component are still `action`s. These have their own routes starting with `/api/<routename>`, and the files are therefore named `.api.<routename>`. For these, the action function is often slim, only dealing with the request/response un/packing, using a helper function to do the actual work. This is for reusability's sake - other actions can also use this helper function.

### Dates

Every database date is stored as UTC. This used to be more convoluted, but with the newer Remix versions, dates can be sent as Date objects from the back-end to the front-end. It is, however, important to call `parseDbDateStr` on them when they are encountered from the database - otherwise, the date will be off in any time zone that's not UTC. In theory, the user's location could be in a different time zone than the cloudflare edge instance, but this should be quite rare, and even so the date will only be off by an hour at worst. The alternative would be to not convert any dates until they're on the front-end.

## Error handling

To make logging and tracing errors as easy as possible, and to force us to catch errors as they arise, there is a system in place. It might take a little getting used to, but it is extremely handy, also for ensuring correct typing. There are quite a few helper types and functions mentioned below, they are all exported from `request-helpers.ts`. This is inspired by how Go forces error handling explicitly.

When wrapping errors and adding messages, they'll appear in the final log in the format `outer message >> inner message >> (db message if the original error was a db one)` - with zero to any number of inner messages/levels. This makes tracing errors very pleasant.

### Error boundaries, catching, logging
There are no easy solutions for catching server logs in Cloudflare Pages. Therefore, we try to secure all routes by enforcing the return of error objects in all paths. These errors are processed in `utils/request-helpers.ts`. Here, they're shipped off to an error logging service - currently the multi-purpose images server (the non-edge VM). The sending of the error over there is awaited, because otherwise the edge instance shuts down before properly sending it. Additionally, we throw a limited version of the error to be caught by the error boundary in `app/utils/error.tsx`.

We have one root error boundary in `root.tsx`. This is a last resort, as it will not have theming/session data. Ideally, put the same error boundary in all top level routes. The line `export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';` does exactly this.

There are quite a few return types and functions below. It's a little messy... sorry! But it works, and makes tracing easy. Look at usage elsewhere in the code base if unsure.

### Returning errors: No return value

Api routes that only _do_ something but don't return anything useful, should return `Promise<ApiError | undefined>`.

### Returning errors: Return values

When returning something, say, a list of users, the return type should be `ResultOrErrorPromise<SomeReturnType>` - in this case, the return type would be `User[]`. You can inspect the construction of this type. In short, it ensures that the `err` field is checked before the `result` field can be used - otherwise resulting in a compilation error.

### Dealing with the errors when they show up

So, how to deal with errors when they occur? It depends on whether you're in a "top level" function or somewhere down the chain. For all of the examples below, please see examples in the code on how they're used if uncertain. It's important to note that all of these are _returned_, to stop the execution flow.

#### Top level returns

These are actions and loaders. Places where you want to return an HTTP response to the client, or to "crash" the site - aka throwing a fatal error and showing the error boundary ("something went wrong") page. The latter is the normal case. Our aim is to have this happen extremely rarely and to fix it as it happens. It also saves us from having to write front-end error handlers everywhere.

- `processApiError` - for the most part, this is what you want. It'll catch your error, log it, and crash the page into an error boundary. This requires an error object to have appeared from somewhere, but in the top-level handler this is mostly the case. Add a message for the logs to the `prependMessage` field, and any useful context to the `context` field - like a comic id, etc.
- `create400Json` and `create500Json` - for when you shouldn't crash the page, like if the user has put lots of work into filling out a form. It'll return a 4/500 error to the client, but not crash the page. If it's a server error, rather than a user error, you should probably also log it with `logApiError`.

#### Down the chain

These are functions that are called by the top level handlers. These should not throw errors directly themselves, but rather return error objects with information to the caller. The idea is that the caller will _always_ handle these errors explicitly. Again, see code examples if unsure.

- `wrapApiError` - if you have an error object from somewhere else already, wrap it with this function, add a message and optional context, and return.
- `makeDbErr` - if the database returns an error, wrap it in this function, add a message and optional context, and return. This is meant to be used in functions returning `Promise<ApiError | undefined>`.
- `makeDbErrObj` - the same as above, but meant to be used in functions returning `ResultOrErrorPromise<T>`.
