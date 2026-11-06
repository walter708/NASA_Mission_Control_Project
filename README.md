# NASA Mission Control: disposable evaluation

Use Node.js 22 and MongoDB 7.0.16. This setup needs no Atlas account,
production database, API key, or live SpaceX service.

## Free online environment

Open the repository's **Actions → Disposable evaluation → Run workflow**.
Pushes and pull requests also run it. Standard GitHub-hosted runners are free
for this public repository. Each API job creates a fresh MongoDB service
container with temporary in-memory storage, runs the API tests, and starts
the app using bundled sample launches and the checked-in Kepler CSV.
External IPv4 and IPv6 traffic is blocked for the test and app processes
after dependency installation. The job verifies the block before testing.
MongoDB and the runner are discarded when the job ends; there is no persistent
database, public website URL, hosting subscription, or resource to clean up.
The job has a 15-minute time limit. Do not change to a paid/larger runner.

The separate client job installs locked dependencies, builds the frontend,
and runs its existing test command. The API smoke check serves the repository's
existing static HTML; the client job verifies a fresh frontend build.

## Reproduce locally

From the repository root:

```sh
docker compose -f compose.evaluation.yml up -d --wait
npm ci --prefix server
npm ci --prefix client
```

Copy `server/.env.example` to `server/.env`, then run:

```sh
npm run test --prefix server -- --runInBand
npm start --prefix server
```

Open http://localhost:8000 for the bundled UI or http://localhost:3000 after
running `npm run client` in another terminal. API routes use `/v1`.
For a fresh frontend build, run `npm run build --prefix client` in a POSIX
shell (for example Git Bash on Windows); its existing build command uses
POSIX environment-variable syntax.

Tests always override `MONGO_URL` with
`mongodb://127.0.0.1:27017/nasa_test`, regardless of shell variables or `.env`.
The API suite drops that disposable test database before and after the run.
Do not put useful data in it. Evaluation startup allows only the local
`nasa_evaluation` database. The two databases are separate.

Sample launches are the default. `LAUNCH_DATA_SOURCE=spacex` is an explicit
live-import opt-in and is rejected in evaluation and test modes. Keep
`EVALUATION_MODE=true` for this exercise. Example launch records are synthetic;
the Kepler planet data is bundled in `server/data/kepler_data.csv`.

## Reset and remove

Stop the app with Ctrl+C, then run:

```sh
docker compose -f compose.evaluation.yml down
```

The MongoDB data lives in a temporary filesystem, so stopping/removing the
container discards it. Run `up` again for a clean environment.

## Sensitive configuration

Only placeholder configuration belongs in Git. `.env` files are ignored and
excluded from Docker builds. The earlier `server/.env` remains in Git history:
the owner must revoke/rotate any credentials it contained before evaluation.
Removing a current file does not revoke a credential or erase old commits.
