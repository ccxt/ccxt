# Release Changelog Social Announcement Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** After a successful CCXT release and changelog pushback, generate a concise announcement for that exact version, highlighting new features and fixes, and publish it to Telegram and Discord from GitHub Actions.

**Architecture:** Extend the existing `.github/workflows/post-release.yml`, because it already runs only after the full `Release workflow` succeeds and updates `CHANGELOG.md`. Add a small dependency-free Node.js utility that extracts the newest release section, classifies changelog entries deterministically, formats one plain-text message within Discord's stricter size limit, and sends it through the Telegram Bot API and a Discord webhook. Keep parsing/formatting separate from transport so it can be unit-tested without network access.

**Tech Stack:** GitHub Actions, Node.js 18+ ESM, built-in `fetch`, built-in `node:test`/`node:assert`, Telegram Bot API, Discord incoming webhook API.

---

## Current Context and Assumptions

- `.github/workflows/release.yml` creates and publishes the version/tag and GitHub release.
- `.github/workflows/post-release.yml` is triggered with `workflow_run` after `Release workflow` completes successfully.
- `rhysd/changelog-from-release/action@v3` rewrites `CHANGELOG.md`, commits it as `Update changelog for <version>`, and pushes it before the next workflow step runs.
- The generated changelog puts the newest version first, beginning with an anchor and a heading such as:
  - `<a id="v4.5.65"></a>`
  - `# [v4.5.65](https://github.com/ccxt/ccxt/releases/tag/v4.5.65) - 2026-07-13`
- Changelog bullets are GitHub-generated PR titles. Most user-relevant entries use conventional prefixes such as `feat(...)` and `fix(...)`, but classification should also recognize common plain-language verbs (`add`, `implement`, `support`, `correct`, `prevent`).
- The first implementation should be deterministic rather than LLM-generated. This avoids another external API key, unpredictable wording, hallucinated release claims, and a new release-time failure mode. If editorial AI summaries are desired later, add them as an optional enhancement with deterministic fallback.
- One shared plain-text message will be generated for both platforms. It will be capped below 2,000 characters, satisfying Discord's message-content limit and remaining below Telegram's 4,096-character limit.
- Required repository/environment secrets:
  - `TELEGRAM_BOT_TOKEN`: token issued by BotFather.
  - `TELEGRAM_CHAT_ID`: target chat/channel ID; the bot must be a member/admin where required.
  - `DISCORD_WEBHOOK_URL`: incoming webhook URL for the target Discord channel.
- Delivery semantics are at-least-once. Manually rerunning the post-release workflow can repost an announcement. Cross-platform exactly-once delivery is intentionally out of scope because one platform can succeed while the other fails; the workflow will expose failures clearly instead of silently swallowing them.

## Proposed Announcement Shape

```text
🚀 CCXT v4.5.66 released

✨ New features
• bitget: auto detect UTA account (#29051)
• kucoin: add reduceMargin (#29135)

🐛 Fixes
• base: preserve legitimate zero ticker change (#29105)
• bingx: omit swap quantity when closePosition is true (#29106)

+ 12 more changes
🔗 Full changelog: https://github.com/ccxt/ccxt/releases/tag/v4.5.66
```

Formatting rules:

1. Preserve the version and release URL from the newest changelog heading.
2. Remove author boilerplate (`by @user in`) from each highlight while retaining the PR number/link information in compact form.
3. Prioritize features and fixes; omit chores, dependency bumps, tests, and broad refactors from highlight bullets.
4. Include up to a configurable/default number of feature and fix bullets, then report the count of additional release changes.
5. Use plain text rather than Telegram/Discord Markdown modes, avoiding platform-specific escaping and malformed-message failures.
6. Truncate individual titles and/or remove lowest-priority bullets until the complete message is at most 1,900 characters.

---

### Task 1: Add Parser and Classification Tests

**Objective:** Define the expected behavior for extracting only the newest release and identifying features/fixes before implementation.

**Files:**
- Create: `utils/release-announcement.test.js`
- Create: `utils/release-announcement.js` (initial exported stubs only, then completed in Task 2)

**Step 1: Create a representative inline changelog fixture**

The test fixture should contain two releases and include:

- A current version heading and release URL.
- Conventional `feat(scope): ...` and `fix(scope): ...` entries.
- Plain-language `Add ...` and `Correct ...` entries.
- `chore`, `test`, `docs`, dependency, and refactor entries.
- GitHub author and PR-link suffixes.
- A previous release with feature/fix bullets that must not leak into the result.

Keeping the fixture inline makes the unit test self-contained and avoids maintaining a second changelog-like file.

**Step 2: Write failing parser tests**

Import these named functions from `utils/release-announcement.js`:

- `extractLatestRelease(changelog)`
- `classifyChanges(entries)`

Assert that:

- `extractLatestRelease` returns the latest version, release URL, and only the first section's bullets.
- It tolerates CRLF input and blank lines.
- It throws a descriptive error if there is no release heading or no changelog bullets.
- `classifyChanges` puts `feat`/add/support/implement entries into `features`.
- `classifyChanges` puts `fix`/correct/prevent entries into `fixes`.
- Non-user-facing maintenance entries remain in `other` and are not highlighted.
- Conventional prefixes/scopes and author boilerplate are removed from display titles.
- PR number/link metadata remains available for compact rendering.

**Step 3: Run the focused test and verify failure**

Run:

```bash
node --test utils/release-announcement.test.js
```

Expected: FAIL because the exports are missing or still throw `Not implemented`.

**Step 4: Commit the red test**

```bash
git add utils/release-announcement.test.js utils/release-announcement.js
git commit -m "test(build): define release announcement parsing"
```

Do not create this commit unless the user explicitly asks for commits; it is a recommended implementation checkpoint.

---

### Task 2: Implement Latest-Release Extraction and Highlight Classification

**Objective:** Parse the generated `CHANGELOG.md` reliably without adding dependencies.

**Files:**
- Modify: `utils/release-announcement.js`
- Test: `utils/release-announcement.test.js`

**Step 1: Implement `extractLatestRelease`**

Use line-oriented parsing rather than a single large regular expression:

1. Normalize `\r\n` to `\n`.
2. Find the first release heading matching the generated form `# [<version>](<release-url>) - <date>`.
3. End the section at the next release anchor/heading or EOF.
4. Read only bullet lines beginning with `* ` or `- ` under that section.
5. Exclude `## New Contributors`, `**Full Changelog**`, and `[Changes][...]` metadata from entry parsing.
6. Return `{ version, releaseUrl, date, entries }`.
7. Throw an error containing the file/format expectation when required fields are absent. Do not silently produce an empty announcement.

**Step 2: Implement entry normalization**

For each changelog bullet:

- Extract the final PR reference from `in [#123](...)` when present.
- Strip `by [@name](...) in ...` author boilerplate.
- Preserve the original title for classification and a cleaned title for display.
- Parse a conventional prefix with an optional scope: `feat(scope):`, `fix(scope):`, including breaking `!` syntax.
- Do not dereference or fetch PR links; the changelog is the source of truth for this job.

**Step 3: Implement `classifyChanges`**

Classification precedence:

1. Explicit `feat` prefix -> feature.
2. Explicit `fix` prefix -> fix.
3. Leading verbs `add`, `implement`, `introduce`, `support`, `enable` -> feature.
4. Leading verbs `fix`, `correct`, `prevent`, `restore`, `resolve` -> fix.
5. Everything else -> other.

Do not classify `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `perf`, or dependency bumps as features/fixes merely because a later word contains one of the keywords.

**Step 4: Run tests and verify pass**

```bash
node --test utils/release-announcement.test.js
```

Expected: all parser/classification tests PASS.

**Step 5: Commit the parser implementation**

```bash
git add utils/release-announcement.js utils/release-announcement.test.js
git commit -m "feat(build): parse release changelog highlights"
```

Do not commit unless explicitly requested.

---

### Task 3: Add Message Formatting and Length-Boundary Tests

**Objective:** Produce a useful announcement that always fits both social APIs.

**Files:**
- Modify: `utils/release-announcement.test.js`
- Modify: `utils/release-announcement.js`

**Step 1: Write failing tests for `buildAnnouncement`**

Add tests for an exported `buildAnnouncement(release, options)` function. Assert that it:

- Includes `CCXT <version> released` and the exact release URL.
- Adds `New features` only when features exist.
- Adds `Fixes` only when fixes exist.
- Renders scope and compact PR information consistently.
- Reports the number of non-highlighted/omitted changes.
- Produces a valid minimal message when a release contains only features or only fixes.
- Falls back to a generic `See the full changelog` message if no items classify as features/fixes, rather than failing after a valid changelog parse.
- Never exceeds 1,900 Unicode code points/characters with many long fixture entries.
- Does not cut a surrogate pair or leave a malformed final line when truncating.

**Step 2: Run tests and verify failure**

```bash
node --test utils/release-announcement.test.js
```

Expected: FAIL because `buildAnnouncement` is not implemented.

**Step 3: Implement deterministic prioritization and formatting**

Recommended defaults:

- Maximum 5 feature bullets.
- Maximum 5 fix bullets.
- Maximum 180 characters per cleaned bullet before adding PR information.
- Maximum whole-message length 1,900 characters.

Build the header and release link first, then add feature/fix bullets in changelog order. If the result is too long, remove bullets from the end while keeping at least the header and release URL. Calculate the `+ N more changes` count from the total release entries minus actually rendered bullets.

**Step 4: Run tests and verify pass**

```bash
node --test utils/release-announcement.test.js
```

Expected: all formatting tests PASS.

**Step 5: Commit the formatter**

```bash
git add utils/release-announcement.js utils/release-announcement.test.js
git commit -m "feat(build): format concise release announcements"
```

Do not commit unless explicitly requested.

---

### Task 4: Add Telegram and Discord Delivery with Mocked Tests

**Objective:** Send the generated message securely and fail clearly when either destination rejects it.

**Files:**
- Modify: `utils/release-announcement.js`
- Modify: `utils/release-announcement.test.js`

**Step 1: Write failing transport tests**

Design the transport functions to accept an injected `fetchImpl` (defaulting to global `fetch`) so tests never contact real services.

Test exported functions:

- `sendTelegram({ botToken, chatId, message, fetchImpl })`
- `sendDiscord({ webhookUrl, message, fetchImpl })`
- `publishAnnouncement(config)`

Assert:

- Telegram uses `POST https://api.telegram.org/bot<TOKEN>/sendMessage` with JSON containing `chat_id`, `text`, and disabled link previews.
- Discord posts JSON `{ "content": message }` to the configured webhook URL.
- Tokens/webhook URLs never appear in thrown error messages.
- Missing configuration produces a descriptive list of missing environment variable names.
- Non-2xx responses include platform name, HTTP status, and a short sanitized response body.
- Both sends are attempted with `Promise.allSettled` or equivalent, so one platform failure does not prevent attempting the other.
- `publishAnnouncement` rejects if either delivery fails and identifies all failed destinations.

**Step 2: Run tests and verify failure**

```bash
node --test utils/release-announcement.test.js
```

Expected: FAIL because transport functions are absent.

**Step 3: Implement API clients**

Use built-in Node `fetch` and `Content-Type: application/json`; add no package dependency.

Security/error requirements:

- Read secrets only from environment variables in the CLI entry point.
- Never log the bot token or Discord webhook URL.
- Log only the release version and per-platform success/failure status.
- Apply an `AbortSignal.timeout(...)` timeout (for example, 15 seconds) to each request.
- Check `response.ok`; Discord may legitimately return an empty successful response.
- Limit logged error response text to a small, sanitized length.

**Step 4: Add the CLI entry point**

When run directly, the utility should:

1. Accept `--changelog <path>` with default `CHANGELOG.md`.
2. Support `--dry-run`, which prints the generated message and performs no network calls.
3. Read and parse the changelog.
4. Build the announcement.
5. Validate `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `DISCORD_WEBHOOK_URL` only when not in dry-run mode.
6. Attempt both deliveries.
7. Exit nonzero if parsing, configuration, or either delivery fails.

Avoid printing environment values during validation.

**Step 5: Run tests and dry-run against the real changelog**

```bash
node --test utils/release-announcement.test.js
node utils/release-announcement.js --changelog CHANGELOG.md --dry-run
```

Expected:

- Unit tests PASS with no outbound calls.
- Dry-run prints an announcement for the version at the top of the checked-out `CHANGELOG.md` (currently `v4.5.65`) and stays under 1,900 characters.

**Step 6: Commit delivery support**

```bash
git add utils/release-announcement.js utils/release-announcement.test.js
git commit -m "feat(build): publish release announcements to social channels"
```

Do not commit unless explicitly requested.

---

### Task 5: Wire Announcement Delivery into the Post-Release Workflow

**Objective:** Run announcement generation only after the changelog has been successfully regenerated and pushed.

**Files:**
- Modify: `.github/workflows/post-release.yml`

**Step 1: Make the checkout target explicit**

In the successful `changelog` job's `actions/checkout@v4` step, add:

```yaml
ref: master
```

Keep `token: ${{ secrets.GH_TOKEN }}` because the changelog action currently uses it to push. An explicit branch follows the upstream action's documented requirement and avoids relying on `workflow_run` checkout defaults.

**Step 2: Keep changelog generation before notification**

Leave `rhysd/changelog-from-release/action@v3` first. Give it a descriptive step name such as `Generate and push changelog`. The action updates the local `CHANGELOG.md` before committing/pushing it, so the following step can read the exact generated section without another checkout.

**Step 3: Add a local test/dry-run gate**

Before sending, run:

```yaml
- name: Validate release announcement
  run: |
    node --test utils/release-announcement.test.js
    node utils/release-announcement.js --changelog CHANGELOG.md --dry-run
```

This prevents malformed changelog output from reaching either channel.

**Step 4: Add the publishing step**

Add:

```yaml
- name: Publish release announcement
  env:
    TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
    DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
  run: node utils/release-announcement.js --changelog CHANGELOG.md
```

Do not pass secret values on the command line. Keep this in the success-only job so no announcement is sent for failed releases.

**Step 5: Add least-privilege workflow permissions**

Declare the workflow permission needed for checkout/changelog push explicitly:

```yaml
permissions:
  contents: write
```

`GH_TOKEN` remains the credential actually supplied to the third-party action, but explicit permissions document the expected scope and support migration to `GITHUB_TOKEN` later.

**Step 6: Add concurrency for simultaneous upstream completions**

Add a workflow-level concurrency group to prevent overlapping post-release updates from racing on `CHANGELOG.md`:

```yaml
concurrency:
  group: post-release-${{ github.event.workflow_run.head_branch }}
  cancel-in-progress: false
```

This serializes releases; it does not claim to provide duplicate suppression for manual reruns.

**Step 7: Validate YAML and inspect the diff**

Use the repository's available YAML parser/linter if present. At minimum run:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/post-release.yml'))"
git diff --check
git diff -- .github/workflows/post-release.yml utils/release-announcement.js utils/release-announcement.test.js
```

If PyYAML is unavailable, use Ruby's bundled YAML parser or an existing repository YAML lint command rather than installing globally.

Expected: YAML parses, `git diff --check` is clean, and only the intended workflow/utility/test files are shown (plus the pre-existing unrelated working-tree changes, which must not be modified or staged).

**Step 8: Commit workflow integration**

```bash
git add .github/workflows/post-release.yml
git commit -m "ci(release): announce changelog on Telegram and Discord"
```

Do not commit unless explicitly requested.

---

### Task 6: Configure Secrets and Perform Safe End-to-End Verification

**Objective:** Verify credentials and payloads without sending a production duplicate, then test one controlled real delivery.

**Files:**
- No repository file changes expected.
- GitHub repository settings: Actions secrets and variables.

**Step 1: Configure repository secrets**

In GitHub repository settings, add:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `DISCORD_WEBHOOK_URL`

Confirm the Telegram bot can post to the intended chat/channel and the Discord webhook belongs to the intended release channel. Never place these values in `keys.json`, workflow YAML, test fixtures, logs, or local committed files.

**Step 2: Verify locally without credentials**

```bash
node --test utils/release-announcement.test.js
node utils/release-announcement.js --changelog CHANGELOG.md --dry-run
```

Expected: all tests pass and dry-run prints the top release announcement without requiring secrets.

**Step 3: Validate API delivery in non-production destinations**

Use a temporary Telegram test chat and Discord test channel/webhook with environment variables supplied by the operator. Run the utility once without `--dry-run` and verify:

- Exactly one Telegram message arrives.
- Exactly one Discord message arrives.
- Version, categories, PR references, omitted-count line, and full release link render correctly.
- No credentials appear in the GitHub Actions/local logs.

Do not use the production release channels for iterative testing.

**Step 4: Trigger a controlled GitHub Actions verification**

Because `post-release.yml` is triggered by `workflow_run`, validate the workflow change on a safe branch/fork or temporarily point the test secrets at non-production channels before the next real release. Confirm the job order is:

1. Checkout `master`.
2. Generate/commit/push `CHANGELOG.md`.
3. Run unit tests and dry-run validation.
4. Publish to Telegram and Discord.

**Step 5: Verify production on the next real release**

After the next successful `Release workflow`:

- Confirm the changelog commit `Update changelog for <version>` exists on `master`.
- Confirm both messages refer to that same version.
- Confirm the job fails visibly if either API rejects the request.
- Do not blindly rerun a partially failed publish job without checking whether one platform already received the announcement; at-least-once delivery can produce a duplicate on the successful platform.

---

## Files Likely to Change

| Path | Change |
|---|---|
| `.github/workflows/post-release.yml` | Run validation and social publishing after changelog pushback; add secrets, permissions, explicit branch, and concurrency. |
| `utils/release-announcement.js` | New parser, classifier, formatter, Telegram/Discord clients, and CLI. |
| `utils/release-announcement.test.js` | New dependency-free unit tests using `node:test` and mocked `fetch`. |

No changes are needed in `.github/workflows/release.yml`: notification belongs in the existing post-release workflow so it only runs after all release publishing steps succeed and after `CHANGELOG.md` is generated.

## Validation Checklist

- [ ] `node --test utils/release-announcement.test.js`
- [ ] `node utils/release-announcement.js --changelog CHANGELOG.md --dry-run`
- [ ] Dry-run selects only the top changelog version.
- [ ] Feature/fix categories exclude maintenance noise.
- [ ] Output is at most 1,900 characters and always contains the release URL.
- [ ] Mock tests prove both APIs are attempted and errors are sanitized.
- [ ] `.github/workflows/post-release.yml` parses as YAML.
- [ ] `git diff --check`
- [ ] Test Telegram delivery in a non-production chat.
- [ ] Test Discord delivery in a non-production channel.
- [ ] Verify the next real release's changelog version matches both posted messages.

## Risks and Tradeoffs

1. **Conventional-title quality:** Deterministic classification depends on PR titles. Some meaningful changes without recognizable prefixes/verbs will be counted as “more changes” rather than highlighted. This is preferable to inventing significance; classification keywords can be expanded based on observed releases.
2. **Message limits:** Large releases routinely contain many entries. The formatter must prioritize and summarize rather than attempt to post the full changelog.
3. **Partial delivery:** Telegram may succeed while Discord fails, or vice versa. Both are attempted and the job fails if either fails, but a rerun can duplicate the successful destination. Exactly-once cross-platform delivery would require durable per-platform state and is deliberately deferred.
4. **Third-party action behavior:** The changelog action commits and force-pushes from its container. Keeping notification after that action ensures only successfully generated changelogs are announced, but changing/replacing that action later requires revalidating local file availability and ordering.
5. **Secret exposure:** Discord webhook URLs and Telegram tokens are credentials. They must remain GitHub Actions secrets, be passed only through `env`, and be redacted from all errors/logging.
6. **Channel permissions:** A valid token is insufficient if the Telegram bot lacks posting rights or the Discord webhook has been deleted. The workflow should fail loudly with a platform-specific status.
7. **No LLM prose:** The deterministic message is accurate and reliable but less editorial. An optional AI summarizer can be added later behind structured output, strict source grounding, a timeout, and deterministic fallback if product requirements demand more natural prose.

## Open Questions Before Implementation

These do not block the proposed default implementation, but the owner should confirm them before production rollout:

1. Should announcements go to one Telegram chat/channel and one Discord channel, or multiple destinations?
2. Is a deterministic feature/fix digest acceptable, or is an LLM-written editorial summary explicitly required?
3. Should a failed social post fail the overall `post-release` workflow (recommended), or be `continue-on-error` so changelog success remains green?
4. Is duplicate suppression on manual reruns required strongly enough to justify durable per-platform delivery state?
