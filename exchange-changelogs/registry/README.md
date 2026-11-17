# Changelog source registry

One JSON file per venue: `registry/exchange/<id>.json` or `registry/prediction/<id>.json`.
The file name must equal `id`, and `kind` must match the directory. A venue is identified by
kind + id: `exchange/binance.json` and `prediction/binance.json` are two venues (each with its own
entries and feed file); source ids stay globally unique. The shape is
`VenueConfig` / `SourceConfig` in [`../collector/src/types.ts`](../collector/src/types.ts);
the collector validates every file on each run (`src/registry.ts`) and refuses to run on
any error, including unknown fields, so typos fail loudly.

Check a file without fetching anything:

```bash
cd exchange-changelogs/collector
npm run collect -- --venue bybit --data /tmp/changelog-scratch   # validates the whole registry first
```

`--venue` takes `id` (every kind with that id) or `kind/id` (`--venue prediction/binance`).

## Venue fields

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | ccxt id (`bybit`; prediction venues: the id under `ts/src/prediction/`). Lowercase letters/digits. |
| `kind` | yes | `exchange` or `prediction` (must match the directory). |
| `name` | yes | Display name (`"Bybit"`). |
| `subclasses` | no | ccxt ids that inherit this venue's changes (`["bybiteu", "bybitid"]`). They are added to each entry's `affects`. |
| `domains` | yes | Hostnames entry links may point to, no scheme (`["bybit.com", "bybit-exchange.github.io"]`). A domain also allows its subdomains. Entry links outside these domains, or not `https:`, are replaced by the source link (tag `link-rewritten`). The host of each source's `link ?? url` must be listed. |
| `sources` | yes | Array of sources. May be `[]` only when `unmonitored` is set, or when another venue's source lists this venue in `sharedWith` (`krakenfutures`). |
| `unmonitored` | no | Reason the venue has nothing monitorable (`"No public changelog; API docs are behind a login"`). Requires `"sources": []`; at most 300 characters. The venue still gets a feed file and appears on docs.ccxt.com as a muted coverage row "not monitored: <reason>", counted separately. Use it only after checking every option in "Finding a source" below. |

## Source fields

| Field | Types | Meaning |
|---|---|---|
| `id` | all | Globally unique, `<venue>-<slug>` (`bybit-v5`, `okx-log`). Never rename: it is part of every entry id. |
| `type` | all | `rss`, `md`, `html`, `json`, `hash`, `spec` or `gh-commits` (see below). |
| `url` | all but gh-commits | What is fetched. https only. For GitHub files use `raw.githubusercontent.com`. May contain `{yyyy}` and `{mm}` (UTC year/month) for month-partitioned changelogs (see `months`; not for `spec`/`gh-commits`). `gh-commits` sources must leave it out (built from `repo`/`ref`/`path`). |
| `link` | all | Human-facing page (defaults to `url`; gh-commits: `https://github.com/<repo>/commits/<ref>/<path>`). Entry anchors are appended to it. Must be on a venue domain. Same `{yyyy}`/`{mm}` placeholders. |
| `months` | all | With `{yyyy}`/`{mm}` in `url`: how many months to fetch, the current UTC month and the `months - 1` before it (default 2, max 12; with `months: 1` the 404 current month on the 1st is an empty run, not drift). The files are parsed newest first and combined; each entry links to its own month's `link`. A 404 for the current month counts as empty (the new file may not exist yet on the 1st); any other failure fails the source. No conditional GET. A month leaving the window never marks its entries removed (only ids of the fetched months are tracked), and the drift check compares against the previous run's entries of the months still fetched. Bitget: `"url": ".../changelog/{yyyy}-{mm}.md", "months": 2`. |
| `discover` | all | `{ "url": ..., "pattern": ... }` for files whose name changes per deploy (hashed JS bundles). The collector fetches `discover.url`, takes the first capture group of `pattern` (absolute or relative to `discover.url`) and fetches that instead of `url`; `url` then only records the last known value. Validators (ETag) are sent only when the discovered url is the same as last run. Pattern not found = failure. BingX: `"discover": { "url": "https://bingx-api.github.io/docs-v3/", "pattern": "src=[\"']?(\\./static/js/app\\.[0-9a-f]+\\.js)" }`. |
| `role` | all | `primary` (default) or `secondary` (testnet changelogs, help-center announcements, blogs). |
| `scope` | all | Free text shown in the UI: `spot`, `derivatives`, `websocket`, `all` ... |
| `headers` | all | Extra request headers, e.g. `{ "Accept-Language": "en-US" }`. |
| `sharedWith` | all | Other venues this changelog also covers (`kraken` source with `["krakenfutures"]`): `"id"` (resolved in the source's own kind first, then the other kind) or `"kind/id"` (`"exchange/hyperliquid"`). They and their subclasses go into `affects`, the entries also appear in their per-venue feed files, and the source counts in their `sources`/`healthy` summary. Must exist in the registry and not be the venue itself. |
| `expectBlocked` | all | Known reason the source cannot be fetched from a datacenter (Cloudflare, geo-block). Still attempted once (no retries); shown as degraded, not alerted. |
| `slice.from` / `slice.to` | md | Regexes matched against whole lines: content starts at the first `from` line (inclusive) and ends before the first `to` line after it. `from` not found = parse failure. |
| `slice` | md, html, hash | Not allowed on `rss`, `json`, `spec` and `gh-commits` sources. |
| `slice.selector` | html, hash | CSS selector of the container holding the changelog (first match). Not found = parse failure. Default: `body`. |
| `split.heading` | md | Regex tested against ATX heading lines (`"^##\\s+\\d{4}-\\d{2}-\\d{2}"`). Default `"^##\\s+"`. Every matching heading starts an entry that runs until the next matching heading or the next heading with fewer `#`. Non-matching deeper headings (`### REST API`) stay in the body. Headings inside code fences (also fences opened inside list items, `  - ```json`) are ignored. Anchors are GitHub-style slugs, unique per file (`rest`, `rest-1`, `rest-2`); `_` is kept, and so is `/` in Mintlify `.md` exports (recognised by their "> ## Documentation Index" preamble: `adding-new-put-/address-book/id-rest-endpoint`). Front matter, `import`/`export` lines and JSX tags are dropped; links become their text and autolinks (`<https://...>`) their url; markdown backslash escapes (`transfer\_id`, `\[NEW]`) are undone and a trailing `\` (hard line break) dropped, outside code. |
| `split.heading` | html | CSS selector list of entry headings (`"h2"`, `"h2, h3"`). Default `"h2"`. Entry = heading + following siblings until the next matching element or any real heading `h1`-`h6` of the same or higher level. The split element may be a non-heading (`"p:has(> strong:only-child)"`, `"p > strong"`): ordinary siblings (`p`, `ul`, `table` ...) stay in the entry and any real heading ends it; an inline match (`strong`, `b`, `span` ...) stands for its block (the rest of that block is the start of the body). Heading `id` (or the id/anchor inside it) becomes the entry anchor. |
| `split.item` | html | CSS selector for row-style changelogs (`"table tr:has(td)"`, `".release-card"`). Each match is one entry; title = first `h1-h6/strong/b` inside it (left out of the body, with a ` - ` separator right after an inline title), else the first line of its text. Use `heading` or `item`, not both. |
| `date.from` | all | Where the entry date lives: `title`, `body`, `pubDate` (rss/json `dateText`) or `anchor` (heading id). Default: rss `pubDate`; others try `dateText` → title → enclosing higher-level heading → anchor → body. With an explicit `from`, only that place (then the enclosing heading) is used. A date read from the body dates the entry but is not part of its id (a body edit is a revision). Hash sources are never dated. |
| `date.pattern` | all | Regex with one capture group holding the date text, applied to the `from` text (`"^(\\d{4}-\\d{2}-\\d{2})"` on OKX anchors). A future date read with a pattern is the entry's `effectiveDate` even when the body names an earlier effective date (Bitget preview: `live trading expected on <date>` wins over `Effective date: demo trading on <date>`). |
| `date.order` | all | `ymd`, `mdy` or `dmy`: disambiguates numeric dates like `03/04/2026`. Default: `/` = mdy, `.` and `-` = dmy; impossible readings (day > 12) are fixed automatically. |
| `titleFilter` | all | Regex (case-insensitive): keep only entries whose title (or an rss `<category>`) matches. |
| `excludeFilter` | all | Regex (case-insensitive): drop entries whose title matches. |
| `section` | md, html, rss, json | Regex (case-insensitive) tested against the text of the headings inside each entry body: the body is cut to the matching sections (heading included, up to the next heading of the same or a higher level) and entries without one are dropped. Paradex daily notes have `#### UI` and `#### API` sections: `"section": "^API$"`. |
| `mapper` | json | File name in `collector/src/mappers/` (without `.ts`). Required for json. The body does not have to be JSON (see below). |
| `strip` | html, hash | CSS selectors removed before extraction (`script`, `style`, `nav`, `noscript`, `template`, `iframe`, `svg` are always removed). |
| `minEntries` | all | Fewer parsed entries than this = "parser drift" failure. Default 1 (`hash`, `spec`, `gh-commits`: 0). The "fewer than half of the previous run" drift check does not apply to `hash`, `spec` and `gh-commits` either. |
| `minChange` | hash | Integer >= 0, default 40: a page change produces an entry only when the added lines, or the removed lines, total at least this many characters. Smaller changes (a version string, a counter) still update the snapshot, so they never pile up into a later entry. `0` = every added or removed line counts. |
| `specFormat` | spec | `openapi` (OpenAPI 3.x and Swagger 2.0, JSON or YAML), `postman` (Postman v2.0/v2.1 collection JSON), `asyncapi` (AsyncAPI 2.x/3.x, JSON or YAML) or `redoc` (HTML page rendered by Redoc, spec read from its embedded `__redoc_state`). Default: auto-detect (`openapi`/`swagger` key, `asyncapi` key, top-level `item` array = Postman; an HTML body containing `__redoc_state` = redoc). |
| `repo` | gh-commits | Required. `"owner/name"` of the GitHub repository. |
| `ref` | gh-commits | Branch, tag or sha (default: the repository's default branch). |
| `path` | gh-commits | Only commits touching this file or directory (`"docs/changelog.md"`, `"openapi"`). |

Dates understood: ISO (`2026-11-05`, with or without time), `2026/11/05`, `2026.11.05`, mixed
separators (`2026.05-12`), `2026-OCT-01` / `2026-Mar-9`, `05.11.2026`, `11/05/2026`,
`Nov 5, 2026`, `5 Nov 2026`, `November 5th, 2026`, `2026年11月5日`, `2026년 11월 5일`, RFC 822 pubDates,
and headings that are only a month (`## Nov 2025`, `December 2025`: the 1st of that month; a month
named inside a sentence never counts). Years
outside 2015..next year are ignored. A date after today becomes `effectiveDate` (scheduled
change). Phrases followed closely by a date set `effectiveDate` too: "Effective date:",
"Effective Time:", "Effective <date>", "effective from", "will take effect on",
"Release <date>", "To Be Released: <date>", "go live on", "will be (fully) deprecated/removed/retired/
discontinued/disabled/shut down on", "discontinued on", "discontinuation on", "sunset on", "expected to
launch ... on", "stop(s) accepting ... on",
Korean "적용 예정일" / "적용 일시" / "시행" before the date and "적용될 예정" / "지원 종료" after a
Korean date (`2026년 11월 13일 오전 11시 이후 적용될 예정`), Chinese "生效时间" / "生效日期". When the date after a
phrase is labelled demo/testnet/sandbox and the same line names a live/production/mainnet date, the
live date wins (Bitget "Effective date: demo trading on November 4, 2026; live trading expected on
November 17, 2026" -> 2026-11-17); a demo date followed by a production mention without a day
("... in the production environment in early December 2026", in the same sentence) sets no
`effectiveDate`; "...; production is not affected" keeps the demo/testnet date. Without any
phrase, rollout lines give the earliest live date (`- Public internet: October 31, 2026`,
`* **Mainnet:** Jun 2nd, 2026`, `- Production, from <date>`; testnet/demo/Colo lines are ignored). For rss sources, a
dated link fragment that differs from pubDate (Kalshi `#november-12-2026`) is the
`effectiveDate`; the fragment is also the entry anchor.

Titles are plain text: HTML, markdown emphasis (`**`, `*`, `__`, backticks), blockquote/alert
markers (`> [!WARNING]`) and zero-width characters are removed. Titles that are only a date or
a version (`## 2026-11-05`, `Release Note 2026-03-20`), or only a section label or product name
(`REST API`, `Exchange API`, `Docs`, `Derivatives REST v1`), are displayed with a summary of the body
cut at the last sentence end within 140 characters (else at a word boundary with "…", never on
"the/in/of"; a short unclosed "(" group is dropped, a long one is closed after the "…"). A leading date that repeats the entry's date is dropped
(`2026-10-30: X`, `September 1, 2026 — X`, `[November 4, 2026] X` -> `X`; the timeline already shows
the day; numeric dates are read in the source's `date.order`), a different date stays (`Release
11.08.2026: ...` on an entry published later), a leading date with a clock time stays whole
(`2026-11-05 10:00 UTC: System maintenance`), and a leading version is dropped except for SDK
sources (id says sdk/pypi/npm, scope names one SDK and not generated SDK artifacts, PyPI/npm feeds,
GitHub `releases.atom`: `1.6.1: Modified response ...`, `2025-06-11(1.3.0): X` -> `1.3.0: X`). Imperative labels read as past
tense (HTX `Add: /path` -> `Added: /path`, KuCoin `[Modify] X` -> `Modified: X`). The id and the
content hash still use the raw heading, so these display rules never re-key or revise an entry. The summary is a short
heading-like first paragraph before any list (Deribit: "Delayed publication of large Block RFQ
trades"; not a sentence, a `Label:` line, a bare date or a generic label), else the sub-heading the
body opens with (Coinbase International `#### Underlying Security Type`, Aster `### Added` then
`#### nonceWindow — ...`), else the first top-level list item that is not a rollout schedule line
(`Testnet: <date>`, `Mainnet: <date>`) or a bare bold label (`* **REST API**`), wrapped lines
joined, else the first paragraph. Throughout, metadata lines (`**Release Date:** ...`,
`**Breaking Changes:** No`), blockquote notes before a sub-heading and list labels (`**Docs**` or a
short `Authentication` line right above a list) are skipped. Table-row items (`split.item: "tbody tr"`)
are displayed without pipes and date cells: `| 2026.07.13 | /v2/x.do | Added | User adds ... |`
becomes `/v2/x.do (Added): User adds ...`. Excerpts drop letter openings ("Dear developers, this is
the ... team.", "안녕하세요. ...입니다."), table pipes (`a · b`) and GitHub emoji shortcodes
(`:warning:`). `---` separator lines are dropped from bodies and excerpts. Tags (`collector/src/tags.ts`,
checked against 40 judged entries in `collector/spec/tags-golden.spec.ts`): `Breaking Changes: No` /
`Deprecations: No` label lines and negations ("no breaking changes", "is not removed") do not fire
`breaking` / `deprecation`; `breaking` needs "breaking", a removal that names an API object (field,
endpoint, channel, parameter, enum value, `` `name` ``, a `### Removed` section; not when the
sentence names a requirement, restriction or limit being removed: "the rate limit on X has been
removed" relaxes), "incompatible", or "no longer" + supported/accepted/returned/available/works/...
("no longer required" relaxes and does not count); the weaker signals ("no longer ...", "will be
changed", "now fail", "will be rejected", "will result in an error") yield to an entry-wide "No
action required" / "will not affect your existing" / `Breaking Changes: No`, and to a "backward
compatible" or "No action needed to ..." in the same sentence only. `auth` ignores negated mentions
within three words ("without an API key", "does not require authentication", "non-authenticated";
not "non-tradable assets requires ... API Key") and "(authenticated)" markers; `market` needs a listing change ("listed" alone does
not count). Korean/Japanese/Chinese keywords: deprecation 지원 종료 (not 거래지원 종료 / 거래 지원 종료), 서비스/API 종료, 폐지, 廃止,
提供終了, 下线, 停止支持/服务, 废弃, 弃用; maintenance 정기/서버/시스템 점검, メンテナンス, 系统维护. Display
fields (title, excerpt, tags, dates) are refreshed from every parse, so a rule fix reaches stored
entries without a revision.

## Finding a source (in this order)

1. A real changelog: RSS/Atom feed, `CHANGELOG.md` on GitHub (`md` via raw.githubusercontent.com), a
   changelog page (`html`), or the `.md` export of a docs page (`<page>.md`, `llms.txt`).
2. A machine-readable API description: OpenAPI/Swagger, Postman collection or AsyncAPI document
   (often in the venue's GitHub org or linked from the docs as "Download OpenAPI"), or a Redoc page:
   `spec` reports added/removed endpoints and parameter changes even when the venue writes no changelog.
3. The GitHub history of a docs repository: prefer a `md`/`hash` source on the raw.githubusercontent.com
   file itself; `gh-commits` is for repositories whose commit messages describe the changes (it needs
   the GitHub API, see below).
4. The API reference page itself: `hash` (with `slice.selector`, `strip` and `minChange` to keep noise out).
5. Nothing reachable without a login, a browser or a CAPTCHA: `"unmonitored": "<reason>"` with `"sources": []`.

Every id in the repository's `exchanges.json` (`ids` -> exchange, `prediction` -> prediction) needs a venue
file of that kind or a `subclasses` entry in one (an unmonitored venue file counts). Check with:

```bash
cd exchange-changelogs/collector
npm run coverage -- --exchanges ../../exchanges.json        # missing ids only; --all lists every id
```

It prints the missing ids (with an `extends <parent>` hint read from `ts/src/<id>.ts`: such ids usually
belong in the parent's `subclasses`), lists registry venues ccxt no longer has, and exits 1 when an id
is missing or the registry has errors. The daily workflow runs it before collecting (a failure only warns).

## Examples per type

### rss (RSS 2.0, RDF or Atom)

```json
{
    "id": "kalshi",
    "kind": "prediction",
    "name": "Kalshi",
    "domains": ["kalshi.com"],
    "sources": [
        { "id": "kalshi-changelog", "type": "rss", "url": "https://docs.kalshi.com/changelog/rss.xml", "link": "https://docs.kalshi.com/changelog" }
    ]
}
```

Blog feeds that mix announcements with API changes: add `"titleFilter": "API|Change ?Log"`
and `"role": "secondary"`. The item `guid` (Atom `id`) is the stable entry key.

### md (GitHub CHANGELOG.md, Docusaurus .mdx, docs `.md` exports)

```json
{
    "id": "bybit-v5",
    "type": "md",
    "url": "https://raw.githubusercontent.com/bybit-exchange/docs/master/docs/changelog/v5.mdx",
    "link": "https://bybit-exchange.github.io/docs/changelog/v5",
    "split": { "heading": "^##\\s+\\d{4}-\\d{2}-\\d{2}" }
}
```

Only part of a file: `"slice": { "from": "^## Changelog", "to": "^## Appendix" }`.
Entries are anchored with a GitHub/Docusaurus slug of the heading (`#2026-11-05`).

### html (server-rendered pages: Slate, ReadMe, Mintlify, GitBook ...)

```json
{
    "id": "okx-log",
    "type": "html",
    "url": "https://www.okx.com/docs-v5/log_en/",
    "slice": { "selector": ".content" },
    "split": { "heading": "h2" }
}
```

On OKX (Slate) each `h1` is a date and each `h2` a change: the `h1` above an `h2` dates it.
`"date": { "from": "anchor", "pattern": "^(\\d{4}-\\d{2}-\\d{2})" }` would read the date from
ids like `2026-10-27-new-bbo-...` instead, but leaves the "Upcoming Changes" entries undated.
Tables or cards: `"split": { "item": "table tbody tr" }`.
Client-side rendered pages (empty `<body>` without JavaScript) do not work: look for an RSS
feed, a `.md` export (`<page>.md`, `llms.txt`), the GitHub source, or fall back to `hash`.

### json (APIs)

```json
{
    "id": "htx-updates",
    "type": "json",
    "url": "https://www.htx.com/oplt/api/open_api/update_record?pageNum=1&pageSize=10000",
    "headers": { "Accept-Language": "en-us" },
    "mapper": "htx"
}
```

A mapper is `export default function (data: unknown, raw: string, ctx: MapperContext): RawEntry[]`
in `collector/src/mappers/<name>.ts` (see `htx.ts`). `data` is the parsed JSON, or `undefined`
when the body is not JSON (a JS bundle, CSV ...: parse `raw` then, as `bingx.ts` does);
`ctx` is `{ source, url, now }`. It is loaded by name; no registration needed.
Return `dateText` (raw date string) and a stable `guid` when the API has one.

### hash (no changelog: watch the page itself)

```json
{
    "id": "bit2c-api",
    "type": "hash",
    "url": "https://bit2c.co.il/home/api",
    "slice": { "selector": "main" },
    "strip": ["#server_timestamp_clock", ".cookie-banner"]
}
```

The first run stores a snapshot. Afterwards each change of the normalized text that adds or
removes lines produces one "Docs changed: <scope, else the link path>" entry
(`dateKind: firstSeen`) listing the added lines; a pure reordering produces nothing, and so does
a change under `minChange` characters (default 40, counted over the added lines or the removed
lines, whichever is larger). Give each hash source a short `scope` so these titles tell pages
apart. ISO timestamps, clock times, unix times, long hex ids and csrf/nonce tokens are ignored;
add `strip` selectors for anything else that changes on every request.

### spec (OpenAPI / Swagger / Postman / AsyncAPI / Redoc: watch the API surface)

```json
{
    "id": "binance-spot-openapi",
    "type": "spec",
    "url": "https://raw.githubusercontent.com/binance/binance-api-swagger/master/spot_api.yaml",
    "link": "https://github.com/binance/binance-api-swagger",
    "scope": "spot REST (OpenAPI)"
}
```

The document is reduced to one line per operation, sorted, stored as `snapshots/<sourceId>.txt`:
`GET /api/v3/depth (limit, symbol)`, `DELETE /api/v3/order (orderId, symbol) [deprecated]`.
Parameters are the query, path and formData parameter names plus the top-level properties of the
request body (`$ref`, `allOf`/`oneOf`/`anyOf` resolved; header and cookie parameters left out).
Postman: method + url path (`:id` becomes `{id}`, `{{baseUrl}}` dropped), query/variable keys and
urlencoded/formdata/raw-JSON body keys. AsyncAPI: one `CHANNEL <name>` line per channel (v3: its
`address`), with the channel parameters and message names as its parameters.

The first run only stores the snapshot. Later runs compare with it and emit synthetic entries
(`dateKind: firstSeen`, `publishedAt: null`, rule tags replaced by these):

| Change | Title | Tags |
|---|---|---|
| operation added | `Endpoint added: GET /x` (AsyncAPI: `Channel added: <name>`) | `new-endpoint` |
| operation removed | `Endpoint removed: DELETE /y` (`Channel removed: <name>`) | `breaking` |
| parameters added/removed | `Parameters changed: POST /z (+foo, -bar)` (`Channel changed: <name> (+a, -b)`) | `param-change` |
| `deprecated: true` set | `Endpoint deprecated: GET /w` (`Channel deprecated: <name>`) | `deprecation` |

AsyncAPI entries also get `websocket`. More than 10 changes in one run become a single entry
`N endpoint changes: 12 added, 3 removed, 1 with parameter changes` listing every change in its
body (tags: the union). Entry ids come from `spec:<snapshot hash>:<change>`, so the same change
seen again later is a new entry. A document without operations, or with less than half of the
previous snapshot's operations (when it had at least 10), is a failure ("spec drift") and keeps
the old snapshot. Redoc pages: `"specFormat": "redoc"` on the docs page url (combine with
`discover` when the page links a hashed spec file instead: then the discovered file is fetched).

### gh-commits (commit history of a docs repository, via the GitHub API)

```json
{
    "id": "example-docs-commits",
    "type": "gh-commits",
    "repo": "example/api-docs",
    "ref": "main",
    "path": "source/includes",
    "role": "secondary",
    "scope": "docs repository commits"
}
```

Fetches `https://api.github.com/repos/<repo>/commits?sha=<ref>&path=<path>&per_page=30` (no `url`
in the file), with `Authorization: Bearer $GITHUB_TOKEN` when that variable is set (the workflow
passes its read-only token; the token is only ever sent to api.github.com). Each commit is an
entry: title = first line of the message, body = the rest without trailers (`Signed-off-by`,
`Co-authored-by` ...), `publishedAt` = committer date, link = `https://github.com/<repo>/commit/<sha>`,
guid = sha. Commits whose first line matches typo / README / format(ting) / "Merge pull request" /
"Merge branch" are skipped unless the source sets its own `titleFilter` (which then decides alone;
`excludeFilter` still applies). The venue's `domains` must include `github.com` (the commit links
and the default `link`). The API is unreachable from some networks (403): the source is then a
failed source in health, never a crash. Prefer an `md` or `hash` source on the raw file
(raw.githubusercontent.com) when the repository has one file worth watching.

### unmonitored venue

```json
{
    "id": "examplex",
    "kind": "exchange",
    "name": "ExampleX",
    "domains": ["examplex.com"],
    "sources": [],
    "unmonitored": "API docs are a client-side app with no changelog, spec or GitHub repository"
}
```

## Failure rules (per source, recorded in `feed/health.json`)

- HTTP error, timeout, challenge/WAF page (202 empty body, 403, 451, 429, Cloudflare/Akamai/AWS
  WAF/Imperva markers) → failure; previous data is kept.
- Parse error (bad feed, `slice.from`/`slice.selector` not found, mapper error, spec document
  without operations or not JSON/YAML, GitHub API error message) → failure.
- `spec` sources: fewer than half of the previous snapshot's operations → "spec drift" failure.
- `discover` pattern not found, or a 404 for any month but the current one → failure.
- Fewer than `minEntries` entries, or fewer than half of the previous run's count (not for `hash`,
  `spec`, `gh-commits`) → "parser drift" failure.
- First successful run of a source: all entries are `backfill: true`. Later, more than 25 new
  ids in one run are also marked backfill (a re-keyed parser, not 25 real changes).
- An id absent for 3 consecutive successful runs gets `removedAt` (never deleted).
- Reparse: the first run after the source's registry entry changed, or after `PARSER_VERSION`
  (`src/collect.ts`) was bumped for a parser fix, re-parses without HTTP validators. Body changes
  then refresh entries without a `revisions[]` item, new ids are `backfill: true`, absent ids get
  `removedAt` right away (a re-keyed or re-filtered parse), and `hash`/`spec` sources re-baseline
  (the snapshot is replaced and no "Docs changed"/endpoint entry is emitted, since a `strip` or
  parser change alters the text without the page changing). After a registry change the
  "fewer than half of the previous run" check is skipped (a new filter may drop most entries).
- Entries of a source that was deleted from the registry (or of a deleted venue) are kept in
  `data/entries/` but left out of every feed file.
