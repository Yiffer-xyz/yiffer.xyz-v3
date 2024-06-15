## Development

### Environment variables and such

Unless you want to use the database "locally", you only need one file, `.dev.vars`. Place this in your project root. Ask Melon or find the up-to-date one in discord.

### Running

See `db/README.md` for database setup instructions.

After setting up the config file above, run `yarn dev`, and the site should be good to go at [http://127.0.0.1:8788](http://127.0.0.1:8788).

### Deploying

All pushes will generate a preview build on Cloudflare. You can access these in the cloudflare dashboard (if you have permission), or, more easily, via Github by checking the commit's ✅checkmark after a minute or two. It'll show a "Cloudflare Pages — Deployed successfully" which you can expand to get the preview link. The master branch is continuously deployed to [new.testyiffer.xyz](https://new.testyiffer.xyz).

## Coding

Of course, prettier and eslint are used. I recommend a lint-on-save rule. Generally, if unsure of how to do things, take inspiration from other code already there.

### Fetching

For routes that are as simple as [fetch data, render page], or even [fetch data, render page, submit data], Remix makes it easy by providing `loader` and `action` functions.

Sometimes, particularly when making async calls prompted by user actions without leaving the page, it's not that easy. In these cases, I'm not a fan of how Remix deals with fetching. For these situations, use the `useGoodFetcher` hook.

Pitfall: If you make a route func that's supposed to be a GET route, you must export a `loader`, not an `action`.

API Routes that are not tied to a single component are still `action`s. These have their own routes starting with `/api/<routename>`, and the files are therefore named `.api.<routename>`. For these, the action function is often slim, only dealing with the request/response un/packing, using a helper function to do the actual work. This is for reusability's sake - other actions can also use this helper function.

### Dates

Unfortunately, sqlite does not support time zones in their dates. Therefore, every date is stored as UTC. When displaying dates, they should be converted to the user's timezone _on the front-end only_. The CF workers run anywhere, so we must treat everything as UTC there (i.e. no `new Date()` -> `toDateString()` etc. in the api). Additionally, when going from back-end to front-end in Remix, dates are serialized as strings. So, in the front-end, whenever a date is encountered, run it through `UTCTimeStrToLocalDate` to get a correct `Date` object. Whenever a date is sent to the back-end, it should be serialized as a string using `localDateToUTCTimeStr`.

## Error handling

To make logging and tracing(invaluable!) errors as easy as possible, and to force us to catch errors as they arise, there is a system in place. It might take a little getting used to, but it is extremely handy, also for ensuring correct typing. There are quite a few helper types and functions mentioned below, they are all exported from `request-helpers.ts`.

When wrapping errors and adding messages, they'll appear in the final log in the format `outer message >> inner message >> (db message if the original error was a db one)` - with 0-any levels of inner messages. This makes tracing errors very pleasant.

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
