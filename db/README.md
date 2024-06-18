### Set up the database
If you haven't yet, log in to Cloudflare via `wrangler login`. Install wrangler or run via `npx wrangler <command>`.

1. First, run `wrangler d1 create yiffer-local-dev`. Have a look at the resulting `database_id` uuid.
2. You'll need to modify your `package.json` `start` script to have this `DB` flag.
3. Add the database id to `wrangler.toml` as well.

Should make this more easily configurable in the future, of course. Ideas for how to, or contributions, are very welcome. Probably some task running tool.

### Set up tables and test data
⚠️ For interacting with database on cloudflare non-locally, replace `yiffer-local-dev` with `yiffer-d1-test`!
With the new version of wrangler, commands are local by default. To run against live data, add `--remote` to your commands.

```sh
# For local development
wrangler d1 execute yiffer-local-dev --file=db/schema.sql
wrangler d1 execute yiffer-local-dev --file=db/testdata.sql

# For live testdata on new.testyiffer.xyz
wrangler d1 execute yiffer-d1-test --file=db/schema.sql --remote
wrangler d1 execute yiffer-d1-test --file=db/testdata.sql --remote
```

If you've already got data but want to reset it, `wrangler d1 execute yiffer-local-dev --file=db/delete.sql --local`. This is very flaky/unreliable at the moment, often throwing dumb errors like `table main.XXXX does not exist`. Will figure out something more stable in the future.

### Manually query
`wrangler d1 execute yiffer-local-dev --local --command="<SELECT blah blah...">`

### Users
All users have the password 'asdasd' (after de-hashing).
Easy test users have the name `test`, `admin` (admin), `mod` (moderator), `normal`, `user` (normal user).
The `test` user has the most data on it, like assigned mod tasks etc. Recommended test user.

### Test data
There's some test data, but not enough yet. With time, more tables will get test data to play with.

### Using the database functions
Currently, use the methods found in `database-facade.ts`:
- `queryDb<T>` for a single query whose results you want.
- `queryDbExec` for a single query that doesn't return anything (INSERT/UPDATE/DELETE).
- `queryDbMultiple` for a batch of queries. This'll run them in one transaction. Error handling/input for this one will be reworked in the near future, it's a bit wonky today.

### Migrations
Not set up yet, but will be.