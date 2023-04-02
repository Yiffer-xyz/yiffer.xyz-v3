# Yiffer.xyz - readme WIP!

## Development

You will be utilizing Wrangler for local development to emulate the Cloudflare runtime.

Environment variables are put in th `.dev.vars` file on the root of this project and must be updated in the cloudflare dashboard.

```sh
# start the remix dev server and wrangler, plus tailwind
yarn dev
```

Open up [http://127.0.0.1:8788](http://127.0.0.1:8788) and you should be ready to go!

## Cloudflare workers

Cloudflare workers scripts are in the `workers-scripts` folder. Env variables are put in `.dev.vars` in the worker's folder and must be updated in the cloudflare dashboard. A worker is updated via `wrangler publish`, NOT on push.
