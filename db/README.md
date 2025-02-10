### Set up the database
If you haven't yet, log in to Cloudflare via `wrangler login`. Install wrangler or run via `npx wrangler <command>`.

1. First, run `wrangler d1 create yiffer-dev-2`. Have a look at the resulting `database_id` uuid.
2. You'll need to modify your `wrangler.toml`'s `database_id` to match the one above.

This should be made more easily configurable in the future, of course. Ideas for how to, or contributions, are very welcome. Probably some task running tool.

### Set up tables and test data, and running queries

```sh
# For local development
wrangler d1 execute yiffer-dev-2 --file=db/schema.sql
wrangler d1 execute yiffer-dev-2 --file=db/testdata.sql

# For live testdata on new.testyiffer.xyz
wrangler d1 execute yiffer-dev-2 --file=db/schema.sql --remote
wrangler d1 execute yiffer-dev-2 --file=db/testdata.sql --remote

# Making general sql queries
wrangler d1 execute yiffer-dev-2 --command "SELECT * FROM user" [--remote]
```

### Users
<!-- All users have the password 'asdasd' (after de-hashing).
Easy test users have the name `test`, `admin` (admin), `mod` (moderator), `normal`, `user` (normal user).
The `test` user has the most data on it, like assigned mod tasks etc. Recommended test user. -->
TODO: This.

### Test data
<!-- There's some test data, but not enough yet. With time, more tables will get test data to play with. -->
TODO: Write this.

### Using the database functions
Currently, use the methods found in `database-facade.ts`:
- `queryDb<T>` for a single query whose results you want.
- `queryDbExec` for a single query that doesn't return anything (INSERT/UPDATE/DELETE).
- `queryDbMultiple` for a batch of queries. This'll run them in one transaction. Error handling/input for this one will be reworked in the near future, it's a bit wonky today.

### Migrations
Not set up, for now changes are just done manually via the cli.