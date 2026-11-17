# exchange-changelogs

A daily job that collects the API changelogs of the exchanges and prediction markets ccxt
supports, stores them as entries, and publishes the feeds rendered at
<https://docs.ccxt.com/docs/changelog-exchanges>.

It is deterministic: plain HTTP fetches and per-source adapters (RSS, Markdown, HTML, JSON,
page hash, API specs, GitHub commits), no browser and no LLM. Everything fetched is untrusted text: it is reduced to
plain text / light markdown, links are restricted to each venue's domains, and AI-agent
footers (GitBook "Agent Instructions") are stripped.

This directory is self-contained (its own `package.json` and lockfile) and is not part of the
ccxt build or transpilers.

```
exchange-changelogs/
  collector/            TypeScript collector (Node >= 22, run with tsx)
    src/                collect.ts, build-feed.ts, coverage.ts, adapters/, mappers/, types.ts (shared contract)
    spec/               offline specs + fixtures saved from real pages
  registry/             one JSON per venue: exchange/<id>.json, prediction/<id>.json (see registry/README.md)
  data/                 gitignored here; lives on the "changelog-data" branch
```

## Run it

```bash
cd exchange-changelogs/collector
npm ci
npm run run -- --venue bybit          # collect + build-feed for one venue (every kind with that id)
npm run run -- --venue prediction/binance   # one venue of one kind
npm run run                           # everything
npm run collect -- --source okx-log   # one source, no feed
npm run build-feed                    # rebuild data/feed/ from data/entries/
npm run coverage -- --exchanges ../../exchanges.json   # ccxt ids without a registry file (exit 1 if any)
npm run report -- --data ../data --fail-after 3        # health table of the last run (exit 1 on alerts)
npm run spec && npm run typecheck     # offline specs
```

Source types: `rss`, `md`, `html`, `json` (with a mapper), `hash` (page diff, `minChange` noise
threshold), `spec` (OpenAPI/Swagger, Postman, AsyncAPI or Redoc page reduced to `METHOD /path
(params)` lines; added/removed endpoints and parameter changes become entries) and `gh-commits`
(GitHub API commit list of a docs repository, `Authorization: Bearer $GITHUB_TOKEN` when set).
Venues with nothing to watch carry `"unmonitored": "<reason>"` and no sources. Field reference:
[registry/README.md](registry/README.md).

Options (all commands): `--venue a,b` (`id` or `kind/id`), `--source x,y`, `--data <dir>` (default
`exchange-changelogs/data`), `--registry <dir>` (default `exchange-changelogs/registry`).
`collect` prints a per-source table (status, entries, new, revised, removed, latest date,
error). It exits 0 even when sources fail (health records it) and 1 on registry errors.

Fetching is polite: User-Agent `ccxt-changelog-bot/1.0 (+https://github.com/ccxt/ccxt)`,
at most 2 concurrent requests per host and 8 overall, 30 s timeout, 2 retries with backoff,
`Retry-After` honored, conditional GET with the stored ETag / Last-Modified (304 = unchanged).
Validators are only sent while the source's registry entry and the collector's `PARSER_VERSION`
(`collector/src/collect.ts`) are the same as on the run that stored them, so a url, filter or
selector fix is applied on the next run; bump `PARSER_VERSION` when a parser change should
re-parse every source. Month-partitioned sources (`{yyyy}`/`{mm}` in `url`, `months`, default 2)
fetch one file per month without conditional GET; `discover` sources first fetch an index page to
find the current url (for hashed bundle names) and send validators only when that url did not
change. Bot-challenge markers fail a source on error statuses; a 2xx page only fails on
interstitial markers (e.g. `gokuProps`, `_cf_chl_opt`) and only when it is under 20 KB.

## Data layout (`data/`)

| Path | Content |
|---|---|
| `state/sources/<sourceId>.json` | ETag, Last-Modified, `configHash` (registry entry the validators belong to), content hash, run counters, ids of the last run, missing-run counters, health; `resolvedUrl` (discover) and `months` (ids per fetched month) |
| `snapshots/<sourceId>.txt` | normalized text of the last successful fetch (hash input, handy for debugging selectors) |
| `entries/<kind>/<venueId>.jsonl` | every entry ever seen for the venue (`ChangelogEntry`, full bodies), merged by id |
| `feed/latest.json` | `LatestFeed`: 90-day window, no bodies, newest first, at most 1.5 MB (oldest trimmed) |
| `feed/<kind>/<venueId>.json` | `VenueFeed`: last 365 days with bodies and revisions, including entries of other venues' sources shared with it (`sharedWith`); undated backfill entries and `removedAt` entries are left out, as in `latest.json`; at most 1.5 MB (oldest trimmed) |
| `feed/health.json` | `HealthFeed`: one row per registry source |
| `feed/sources.json` | registry summary for the UI (venues, domains, sources, links) |

Entry ids are `sha256("<sourceId>|<guid>")`, or `sha256("<sourceId>|<date>|<normalized title>")`
without a guid, where `date` comes from the configured place (title, anchor, pubDate, context)
but never from the body, so a body edit is a revision rather than a new id. When several entries
of one run share a key, the bottom-most keeps it and the others get `|b:<hash of the first 200
body characters>` (a position suffix, counted from the bottom, only for identical bodies), so a
new item on top of a newest-first page never takes over an older item's id. HTX and BingX guids
leave out the summary text for the same reason. Hash sources (`Docs changed: …`) are always
`dateKind: firstSeen`: dates inside the added lines are not the change date. A changed body
adds a `revisions[]` item; an id missing for 3 successful runs gets `removedAt`. For `rss`
sources only items dated after the oldest item still in the feed can go missing (feeds carry
the newest N items; rolling off the end is not a deletion). The first successful run of a
source marks everything `backfill`, as does the mass-new guard (> 25 new ids in a later run),
which also gives the absent ids they replace `removedAt` right away. Feeds are sorted by
`coalesce(effectiveDate, publishedAt, firstSeen)`, newest first. Venues are keyed by
kind + id everywhere (`exchange/binance` and `prediction/binance` are separate feed files);
`VenueSummary` carries the venue's registry `domains`, and its `sources`/`healthy` counts
include shared sources. Entries of sources no longer in the registry are left out of the
feeds. All shapes are in
[`collector/src/types.ts`](collector/src/types.ts) (`SCHEMA_VERSION` 1).

Synthetic entries (`hash` "Docs changed", `spec` endpoint changes) are always
`dateKind: firstSeen`; `spec` entries carry their own tags (`new-endpoint`, `breaking`,
`param-change`, `deprecation`, `websocket`) instead of the rule tags. `VenueSummary.unmonitored`
(and `sources.json`) carry the reason of venues with nothing to watch.

Rule tags (`collector/src/tags.ts`): `deprecation`, `breaking`, `new-endpoint`, `rate-limit`,
`websocket`, `auth`, `maintenance`, `param-change`, `market`, plus `link-rewritten` when an
entry link was replaced by the source link. `breaking` and `deprecation` ignore negated
phrasings ("No removed endpoints", "no breaking changes", "not removed", "non-breaking",
"no existing fields are modified or removed"; not across a sentence end or a "but"). `market`
means a listing change (new markets/symbols/contracts, listings, delistings), not a mention of
perpetuals, contracts or market data.

## How docs.ccxt.com consumes it

The docs site fetches `feed/latest.json` (and `feed/<kind>/<id>.json` when one venue is
selected) from the raw URL of the `changelog-data` branch with ISR
(`revalidate: 3600`, tag `exchange-changelogs`), validates it against the same schema and
renders text only (no HTML from entries; links pass a `safeHref()` check against the venue's
`domains` from `VenueSummary`, keyed by kind + id, falling back to the source-link domain for older
feeds except on shared hosts such as raw.githubusercontent.com; with no domain the entry links to
its source page). Venue filters accept `id` (every kind) or `kind/id`; `?exchange=<id>&full=1`
merges both kinds' files for an id that exists under both. The coverage table lists unmonitored venues as muted rows ("not monitored:
<reason>") and counts them apart from the monitored ones. After each run the workflow calls `POST https://docs.ccxt.com/api/revalidate/changelog` with the
`DOCS_REVALIDATE_SECRET` and makes one warm-up GET of the page (see [Deploy](#deploy)).

## Production

`.github/workflows/exchange-changelogs.yml` runs daily at 05:23 UTC (and on
`workflow_dispatch` with `venue` / `dry_run` / `allow_shrink` inputs), only on `ccxt/ccxt`:

1. job `collect` (read-only token): checks out the orphan branch `changelog-data` as a worktree
   at `exchange-changelogs/data` (created on the first run only: `git ls-remote --exit-code`
   exit 2 means the branch is missing; any other failure, such as a network or auth error, fails
   the job instead of starting over from an empty history), runs `npm ci`, then
   `npm run coverage` (`continue-on-error`: a ccxt id without a registry file shows as a warning
   but does not stop collection), then `npm run run` in `collector/` with `GITHUB_TOKEN` set to the
   job's read-only token (used by `gh-commits` sources for api.github.com only), and uploads
   `data/` as an artifact;
2. job `publish` (the only job with `contents: write`; runs no npm and no repository code):
   checks out `changelog-data` into a fresh repo (same exit-2 rule) and replaces its tree with the
   artifact. It **refuses to push** when the branch head is no longer the commit `collect` built
   on (the `base` job output, empty for an orphan start): that catches a collect run that started
   from an empty tree while the branch existed (counts barely move then, but `firstSeen` dates,
   revisions and backfill flags would be lost) and a push made between the two jobs. Before
   committing it also compares the new tree with the branch head and **refuses to
   push** when the non-empty lines of `entries/**/*.jsonl` or the number of `state/sources/*.json`
   files drop by more than 10% (a run that started from an empty or partial tree would otherwise
   wipe the history). After removing sources on purpose, re-run it from the Actions tab with
   `allow_shrink` checked (it overrides both checks). Otherwise it commits as `[Automated changes] changelog data <date>`
   with hooks disabled (the language CI workflows ignore `[Automated changes]` commits, and
   nothing lands on master);
3. waits ~5 minutes (raw.githubusercontent.com caches the branch for about 300 s) and
   revalidates docs.ccxt.com (a 401, 404 or other answer is a `::warning::` annotation, never a
   failure: the page refreshes within the hour anyway);
4. job `report` (runs unless the run was cancelled, read-only token): downloads the artifact and runs
   `npm run report -- --fail-after 3`, which writes a health table to the run summary.

### Alerting

`report` reads `feed/health.json` and puts every source in one of: `ok`, `expected-blocked`
(failing, but the registry marks it `expectBlocked`, e.g. Cloudflare or a geo-block against
datacenter IPs; such sources are fetched once, without retries), `failing` (fewer than 3 failed runs in a row), `alert` (3 or more, no
`expectBlocked`) or `not-run`. Any `alert` source, or a missing `health.json` (collect failed),
fails the job and so the run, and GitHub emails the run's owner (for scheduled runs, the user who
last edited the cron line; for manual runs, whoever started it). To clear an alert, fix the registry entry, or mark
the source `expectBlocked` with the reason when it cannot be fetched from GitHub's runners. The
summary page of each run shows the same table; `npm run report -- --data <dir> --all` prints it
locally with the ok rows too.

### Deploy

The docs server (the `ccxt-docs` container on the docs box, see
`.github/workflows/docs-fumadocs.yml`) reads its environment from `/root/ccxt-docs.env`
(root-only, passed with `--env-file`):

| Where | Name | Value | If unset |
|---|---|---|---|
| docs server env | `CHANGELOG_REVALIDATE_SECRET` | a random string, e.g. `openssl rand -hex 32` | `POST /api/revalidate/changelog` answers 404 (endpoint disabled); the page and feeds still refresh hourly (ISR) |
| docs server env | `EXCHANGE_CHANGELOGS_URL` (optional) | base URL of the `feed/` files (`latest.json`, `health.json`, `<kind>/<id>.json`) | `https://raw.githubusercontent.com/ccxt/ccxt/changelog-data/feed` (`EXCHANGE_CHANGELOGS_DIR` instead reads a local `feed/` directory, for previews) |
| GitHub secret (`ccxt/ccxt`) | `DOCS_REVALIDATE_SECRET` | the **same value** as `CHANGELOG_REVALIDATE_SECRET` | the revalidate step is skipped with a warning; data reaches the page within an hour |

The names differ on purpose (the GitHub secret is named after its target, the server variable
after its feature) but the values must match; a mismatch shows as an HTTP 401 warning on the
`publish` job. Set or rotate both together:

```bash
secret="$(openssl rand -hex 32)"
gh secret set DOCS_REVALIDATE_SECRET -R ccxt/ccxt --body "$secret"
# on the docs box, as root: replace the line (no duplicates on repeated rotations)
sed -i '/^CHANGELOG_REVALIDATE_SECRET=/d' /root/ccxt-docs.env
echo "CHANGELOG_REVALIDATE_SECRET=$secret" >> /root/ccxt-docs.env
```

Then redeploy the docs (run the `docs-fumadocs` workflow with `workflow_dispatch`): the env file
is read when a container is created, so `docker restart` keeps the old secret and every publish
gets the 401 warning until the next deploy. Unless the secret is printed in a terminal, `$secret`
must reach the docs box some other way than this shell (for example `ssh docs 'sed ...; echo ...'`).

The deploy canary (`changelog_smoke` in `docs-fumadocs.yml`) checks the new container before it
goes live. It asks `/changelog-exchanges.json` first: a 503 there means there is no data anywhere
(no `changelog-data` branch yet and no build-time snapshot), which is a warning, and then a 5xx from
`/docs/changelog-exchanges` is a warning too, so the docs can deploy before the branch exists
(the page answers 500 until the first publish). With data available, a 5xx from the page or any
other 5xx from the feed fails the canary; zero venues on the page or `count: 0` in the feed are
warnings. A `POST` with a wrong secret must get 401 (404 is a warning: the secret is not set in
`/root/ccxt-docs.env`).

The data can move to its own repository (`ccxt/exchange-changelogs`) later without code
changes: only the checkout/push steps and the docs data URL change. That move is worth doing
once the history grows: a default `git clone` of ccxt/ccxt fetches every branch head, so the
daily snapshots and entries reach every contributor clone (until then, squash the branch
yearly).

## Adding or fixing a source

1. Edit or add `registry/<kind>/<id>.json` (field reference: [registry/README.md](registry/README.md)).
2. `npm run run -- --venue <id> --data /tmp/changelog-scratch` and check the table,
   `data/snapshots/<sourceId>.txt` and `data/feed/<kind>/<id>.json`.
3. For a new adapter behaviour, save a trimmed real page under `collector/spec/fixtures/`
   and add a spec next to the existing ones.
4. `npm run coverage -- --exchanges ../../exchanges.json` lists the ccxt ids that still have no
   venue file, `subclasses` entry or `unmonitored` reason.
