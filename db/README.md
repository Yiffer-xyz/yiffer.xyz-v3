### Set up the database
If you haven't yet, log in to Cloudflare via `wrangler login`. Install wrangler or run via `npx wrangler <command>`.

1. First, run `wrangler d1 create yiffer-dev-2`. Have a look at the resulting `database_id` uuid.
2. You'll need to modify your `wrangler.toml`'s `database_id` to match the one above.

This should be made more easily configurable in the future, of course. Ideas for how to, or contributions, are very welcome. Probably some task running tool.

### Set up tables and test data, and running queries
The test data is realistic - it's more or less the state of the site before v3 was launched, in late Jan 2025.

```sh
# For local development
wrangler d1 execute yiffer-dev-2 --file=db/schema.sql
wrangler d1 execute yiffer-dev-2 --file=db/testdata.sql

# Making general sql queries
wrangler d1 execute yiffer-dev-2 --command "SELECT * FROM user" [--local or --remote]
```

### Test files
Since local dev should ideally be done with a realistic amount of data, there's quite a few comic pages to download - about 30GB. 

The page data can be downloaded from GCP, ask Melon to be added to the project. GCP is not actually used in running the site, but downloading from GCP via CLI is much, much faster than via Google Drive or similar services.

If 30GB is a dealbreaker, I suggest you download all 30GB anyway, and then write a script to both modify `testdata.sql` and also delete downloaded comics accordingly.

### Users
The user `malann` with password `asdasd` is an admin, giving you full access to the mod panel. Mod stuff should also be tested with a normal mod user (not admin).

### Using the database functions
Currently, use the methods found in `database-facade.ts`:
- `queryDb<T>` for a single query whose results you want.
- `queryDbExec` for a single query that doesn't return anything (INSERT/UPDATE/DELETE).
- `queryDbMultiple` for a batch of queries. This'll run them in one transaction. Error handling/input for this one will be reworked in the near future, it's a bit wonky today.

### Migrations
Not set up, for now changes are just done manually via the cli.