## Development

### Environment variables and such

Unless you want to use the database "locally", you only need one file, `.dev.vars`. Place this in your project root. Ask Melon or find the up-to-date one in discord.

### Running

After setting up the config file above, run `yarn dev`, and the site should be good to go at [http://127.0.0.1:8788](http://127.0.0.1:8788).

### Deploying

All pushes will generate a preview build on Cloudflare. To access this, go to [dash.cloudflare.com](https://dash.cloudflare.com), navigate to `Workers & Pages` in the left drawer, and find your deployment. The master branch is continuously deployed to [new.testyiffer.xyz](https://new.testyiffer.xyz).

## Database

If you do not wish to use and interact with the database locally, keep `DB_API_URL_BASE=https://testyiffer.xyz` in your `.dev.vars` file. If you do, see further down.

We don't have an actual local database setup yet, so we're all sharing the same test database. This is not ideal, and we should configure something better in the future.

### (Not really) local database

This config will connect you to the same test database as otherwise, but you'll be able to inspect calls to it, see errors, and connect to it with other programs.

### Bridge server

Until we have D1 SQL working, a local node server is required for the Remix repo to connect to the non-edge database. Clone and run [yiffer.xyz-remix-db-bridge](https://github.com/Yiffer-xyz/yiffer.xyz-remix-db-bridge). You'll need to add a `cfg.yml` to it (ask Melon). This will receive any db calls via the `queryDb` function of the Remix repo.

### DB proxy

You'll need to set up a google cloud proxy to connect to the database.

- Place the `cloud_sql_proxy` (ask Melon) binary somewhere outside of the project directory
- Run `./cloud-sql-proxy yifferxyz:us-central1:yifferdb` to start the proxy
- Requests will now connect to the database. You can also use programs like MySQL Workbench etc. to interact with the db, using `127.0.0.1:3306` and the credentials found in the `cfg.yml` file from above.
