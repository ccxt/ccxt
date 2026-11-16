## Summary

This adds a daily collector for the API changelogs of every exchange and prediction market CCXT supports, and publishes the result as a page and feeds at `docs.ccxt.com/docs/changelog-exchanges`. Issue creation is not in this PR: it comes in a follow-up, and the plan below aims to have it fully on within one week of merge.

Coverage: 102 registry venue files and 318 sources. All 112 CCXT ids are covered: 10 are mapped as subclasses of a parent venue, and one (latoken) is marked unmonitored with a reason. `npm run coverage` reports 0 missing.

No `ts/src/**` file changes, so nothing is transpiled.

## Screenshots

The page at `/docs/changelog-exchanges`, built from this branch with the data collected on 2026-11-15:

![Exchange API Changelogs page: Subscribe button, upcoming deadlines and timeline](https://raw.githubusercontent.com/pcriadoperez/ccxt/06aa414cd6cf92604ad9b334fbc973ab5823fada/exchange-changelogs/screenshots/desktop.png)

<details>
<summary>One venue (Kalshi), mobile in dark mode, and the full page</summary>

**One venue** (`?exchange=kalshi`): a venue header with health and feed links, and a full year of history.

![Single-venue view for Kalshi](https://raw.githubusercontent.com/pcriadoperez/ccxt/06aa414cd6cf92604ad9b334fbc973ab5823fada/exchange-changelogs/screenshots/desktop-single-venue.png)

**Mobile, dark mode:**

<img src="https://raw.githubusercontent.com/pcriadoperez/ccxt/06aa414cd6cf92604ad9b334fbc973ab5823fada/exchange-changelogs/screenshots/mobile-dark.png" width="390" alt="Mobile view in dark mode">

**Full page:** [full-page.png](https://raw.githubusercontent.com/pcriadoperez/ccxt/06aa414cd6cf92604ad9b334fbc973ab5823fada/exchange-changelogs/screenshots/full-page.png). It ends with Coverage, Feeds & API and Collector status.

</details>

## Release plan: fully on within one week

| Day | Step | Done when |
|---|---|---|
| 0 | Merge this PR. Set `DOCS_REVALIDATE_SECRET` (GitHub) and `CHANGELOG_REVALIDATE_SECRET` (docs server) to the same value. Run **Exchange changelogs** once by hand (`workflow_dispatch`): everything it finds is stored as history (`backfill`), so no old change ever opens an issue. | The page and feeds show data, and the deploy smoke check passes |
| 0 | Post the pilot: the 4 issues and 2 comments below, labelled `exchange-changelog`. | Posted |
| 1–2 | Follow-up PR: an `issues` job after `publish`, controlled by the repo variable `CHANGELOG_ISSUES` (`off` / `dry-run` / `on`). Merge it in `dry-run`. | Merged |
| 2–4 | Dry-run daily: the run's summary lists the issues and comments it *would* post. Compare them with a manual check, and see how the repo's triage AI handled the pilot issues. | No bad posts in 2 runs |
| 5 | Set `CHANGELOG_ISSUES=on`. Only changes first seen after this point can open issues. | — |
| 7 | Review what was opened and what triage decided, then tighten or widen the filter. | — |

**How the issue job decides.** Running the pilot by hand showed a tag filter alone is far too noisy: of 55 new tagged or dated entries over 5 days, only 4 needed an issue. So the job has two steps:
1. **Filter:** entries first seen in this run and not marked `backfill` that are tagged breaking, deprecation, param-change or auth, or carry an upcoming effective date.
2. **Check each one**, the same way as the pilot:
   - Does CCXT's code use what changes?
   - Does an open ccxt/ccxt issue or PR already cover it?

   The answer decides the action:
   - Affected and not covered: open a new issue.
   - Already covered: comment on that thread, linking the changelog entry.
   - Anything else: nothing is posted, and the entry stays on the page.

**Safety:**
- A hidden `exchange-changelog-entry: <id>` marker in every issue and comment, so a change is never posted twice.
- At most 5 posts per run.
- `CHANGELOG_ISSUES=off` stops everything without a code change.
- If the check step uses Claude in Actions, it needs an `ANTHROPIC_API_KEY` secret.

## Pilot: changes first seen 2026-11-11 to 2026-11-15

The collector found 73 new entries in this period. 55 of them were tagged or had a date, and each of those was checked against today's `master` and against ccxt/ccxt issues and PRs. Every proposed issue or comment was then challenged independently by skeptical reviewers, and none of them was overturned.

| Result | Count | Entries |
|---|---|---|
| New issue | 4 | kalshi `expiration_time` removed (2026-11-19) · krakenfutures `POST /withdrawal` removed (2026-11-30) · krakenfutures WS v1 shut down (2027-03-01) · polymarket `/data/orders` needs `market` (2026-12-14) |
| Comment on an existing thread | 2 | WOO X WS V2 off on 2026-11-19 → ccxt/ccxt#29578 · Indodax `/tapi` decommission → ccxt/ccxt#30311 |
| Already handled in CCXT | 8 | e.g. OKX ELP→RPI names, Bitget snapshot-frame change, Bithumb private WS v1 |
| CCXT doesn't use it | 14 | |
| Informational | 27 | |

### Example issue (as the job will open it) — opened as ccxt/ccxt#31221

<details>
<summary>[exchange-changelog] kalshi: market expiration_time removed on 2026-11-19, read latest_expiration_time</summary>

**Venue:** Kalshi (`kalshi`, prediction market) · **Effective:** 2026-11-19 · **Tags:** `deprecation`, `breaking`
**Source:** [Kalshi API changelog, November 19, 2026](https://docs.kalshi.com/changelog#november-19-2026), first seen by the CCXT changelog monitor on 2026-11-15

### What the exchange announced

Third-party text, quoted verbatim from the venue's changelog:

> The deprecated `expiration_time` field is removed from market objects, including markets nested in events. Read `latest_expiration_time` instead: it has always carried the same value. Order `expiration_time` is unrelated and unchanged.

### Where it touches CCXT

- `ts/src/prediction/kalshi.ts:563` reads only the field being removed: `const endDate = this.safeString (raw, 'expiration_time');`
- Lines 667–668 use it for the market's `expiry` and `expiryDatetime`.
- Every market goes through this `parseMarket`, so from 2026-11-19 `fetchMarkets`, `fetchMarket` and the markets nested in `fetchEvents` return no expiry.
- The static response fixtures (`ts/src/test/static/response/prediction/kalshi.json`, lines 22, 92 and 158) still contain `expiration_time`, so the tests won't catch this.

### Suggested fix

- Read `this.safeString2 (raw, 'latest_expiration_time', 'expiration_time')`.
- Drop `expiration_time` from at least one response fixture, so a test proves the new field is read.

### Related

None found: searched issues and PRs for kalshi expiration_time, latest_expiration_time, expiry and deprecat.

### Links

- All tracked Kalshi changes: https://docs.ccxt.com/docs/changelog-exchanges?exchange=kalshi

<!-- exchange-changelog-entry: cc4f5d2e52e5d321d153b5e045c8e609f456b51399aa1ed677762de759f44832 -->

---
_Opened from the CCXT exchange changelog monitor (pilot). Generated by [Claude Code](https://claude.ai/code)_

</details>

## Collector (`exchange-changelogs/`)

- **Collector:** TypeScript in `collector/`.
  - Source adapters: RSS, markdown, HTML, JSON via named mappers, page hash, API spec diffs (OpenAPI, Postman, AsyncAPI, Redoc) and GitHub commits.
  - It sends conditional GETs, keeps polite per-host limits and detects bot-challenge pages.
  - Entries have stable ids. The collector tracks revisions and removals and guards against backfill.
- **Dates:** each entry keeps `publishedAt`, `effectiveDate` and `firstSeen`. When a source gives both a demo or testnet date and a live date, the live date wins.
- **Tags:** rule-based, guarded by a golden set of 40 cases.
- **Registry:** `registry/<kind>/<id>.json`. The field reference is in `registry/README.md`.
- **Daily workflow:** `.github/workflows/exchange-changelogs.yml`.
  - `collect` has a read-only token.
  - `publish` runs no repository code and pushes to an orphan `changelog-data` branch.
  - `report` fails the run when a source has failed 3 runs in a row; sources expected to be blocked from CI runners are listed but don't trigger it.
  - **History guard:** it refuses to publish when the data branch can't be read, when entries or sources drop by more than 10%, or when the branch head moved during the run. The `allow_shrink` dispatch input overrides this.
  - The job condition is `github.repository == 'ccxt/ccxt'`.

## Docs page and feeds (`docs/website/`)

- **Page:** `/docs/changelog-exchanges`, regenerated hourly or on a secret-protected POST to `/api/revalidate/changelog`.
  - A Subscribe button at the top (RSS, Atom, JSON and Markdown, following the current filters), then Upcoming deadlines.
  - A filterable timeline with one-line rows that expand.
  - A single-venue view that shows a year of history, and a collapsed coverage table.
  - Collector status (venues, source health, entry counts, last update) at the end.
- **Feeds:**
  - `/changelog-exchanges.json`: filters, `full=1` for one venue, `seenSince`/`nextSince` polling.
  - `/changelog-exchanges.xml`: RSS, or Atom with `?format=atom`.
  - `/docs/changelog-exchanges.md` and an `llms.txt` section.
- **When the data is unavailable:** the page keeps its last good render, falling back to a snapshot baked in at build time (`npm prebuild`), and the feeds answer 503.
- **Deploy smoke check:** `docs-fumadocs.yml` now checks the page, the JSON feed and the revalidate endpoint.
- **Third-party text:** rendered as plain text only. Links must be https and on the venue's registry domains.

## Verification

- [x] Up to date with `master` (2026-11-15). It merged without conflicts, including the move to Node 24 and Next 16.4.4.
- [x] Collector: `npm run spec` passes 150/150, `npm run typecheck` is clean, and `npm run coverage` reports 0 missing of 112 ids.
- [x] Docs: `npx tsc --noEmit` is clean on Next 16.4.4 with Node 24.
- [x] Docs production build passes on Next 16.4.4 with Node 24, on a trimmed copy of the generated content (the full 1,228-page build runs out of memory in the build sandbox). The page and the JSON, RSS and Markdown routes return 200. The browser check shows no console errors and no horizontal scroll on desktop or mobile. Checked earlier: 503s with an empty data dir, and the old page kept after a failed refresh.
- [x] Both workflow files parse, and `bash -n` passes on every `run` block. The shrink and base guards were tested against scratch repositories.
- [x] Live collection (2026-11-15): 299 of 318 sources succeeded, and `latest.json` holds 639 entries (719 KB).
  - The 12 GitHub-commits sources failed with 401 in the build sandbox (token rejected); they should work in Actions.
  - 5 sources are blocked from datacenter IPs and marked as such.
- [ ] Transpile and build checks for the 7 languages don't apply: no `ts/src/**` files change. No committed path contains "test", so the full test matrix isn't triggered.

## Notes

- **First deploy:** until the first collector run publishes `changelog-data`, the page answers 500 and the feeds 503. The smoke check treats that as a warning. Step 0 of the plan fills it.
- **Collected data** is gitignored. It lives on the `changelog-data` branch.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01XpTLXWrcfvBPZBRGJqdWxL
