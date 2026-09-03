<!--
  AUTHORING TEMPLATE — not published.

  Files in wiki/comparisons/ whose name starts with `_` are skipped by
  build/wiki-to-fumadocs.ts. Copy this file to `ccxt-vs-<slug>.md` and fill it in.

  ---------------------------------------------------------------------------
  METADATA (HTML comments — invisible on the Docsify site, read by the converter)
  ---------------------------------------------------------------------------
    title       required. The <title> tag and sidebar/SEO title. Lead with
                "CCXT vs <thing>" so it matches how people search.
    description required. 120-165 chars. Becomes <meta name="description"> and
                the OpenGraph description. Say what the page compares and the
                axes it compares on — no marketing adjectives.
    group       required. Section heading on the /docs/comparisons hub. Use one
                of the existing groups; a new value creates a new section.
    summary     required. One or two sentences shown under the link on the hub.
                Make it the actual finding, not "a comparison of X and Y".
    weight      optional (default 100). Sort order inside the group; ties break
                alphabetically. The hub page itself is weight 0.

  ---------------------------------------------------------------------------
  RULES FOR THESE PAGES — they are the reason the pages are worth reading
  ---------------------------------------------------------------------------
  1. EVERY NUMBER MUST BE VERIFIED. Capability counts come from the CCXT source
     tree, not from memory:
         node build/comparisons-facts.cjs <exchange>
     Competitor figures come from that project's own repo/docs on the day you
     write. Add the "Figures verified <Month Year>" line under the table.
     Popularity: quote GitHub stars AND package installs — stars measure
     attention, installs measure use, and they often disagree. Sources:
         https://api.npmjs.org/downloads/point/last-month/<pkg>
         https://pypistats.org/api/packages/<pkg>/recent
     Compare like with like, and say which package each number is for: CCXT is
     one package covering every venue, a vendor SDK is one package covering
     one product line.
     Use the literal token {{CCXT_VERSION}} in the "Figures verified" line —
     the converter substitutes the version from package.json at build time, so
     a page always states which library version its numbers were measured
     against and that can never drift from what ships.
  2. THE "WHAT THE ALTERNATIVE DOES BETTER" SECTION IS MANDATORY and must contain
     real advantages. A page with no honest concessions reads as marketing, gets
     treated as marketing by readers and search engines, and will be wrong within
     a year anyway. If you cannot find three, you have not understood the tool.
  3. CODE MUST RUN. Both sides. Take the competitor snippet from their current
     README or docs, not from memory — APIs churn. Take the CCXT snippet from
     examples/ where one exists.
  4. NO DEAD LINKS. Internal links are absolute (`/docs/manual`,
     `/docs/exchanges/<id>`), never relative `.md` paths — the converter rewrites
     unknown relative links to the wrong route.
  5. NO CLAIMS ABOUT THE COMPETITOR'S QUALITY, ROADMAP OR MOTIVES. Compare
     observable properties: licence, languages, coverage, features, release
     cadence, support channels.

  ---------------------------------------------------------------------------
  DOCSIFY/FUMADOCS MARKDOWN NOTES
  ---------------------------------------------------------------------------
  - Tab blocks: `<!-- tabs:start -->`, then `#### **Label**` immediately followed
    by a fenced code block, repeated, then `<!-- tabs:end -->`. NOTHING may sit
    between the `#### **Label**` line and its fence or the tabs will not render.
    Labels can be languages ("Python", "Go") or sides ("CCXT", "pybit").
  - Only Shiki-known fence languages survive; anything else renders unhighlighted.
  - The first `# H1` is stripped by the converter (the page title renders it).
-->

<!-- title: CCXT vs <Thing> -->
<!-- description: <120-165 chars: what is compared and on which axes> -->
<!-- group: <Exchange APIs and official SDKs | Multi-exchange libraries and frameworks | Market data platforms> -->
<!-- summary: <one or two sentences: the actual finding> -->
<!-- weight: 100 -->

# CCXT vs <Thing>

<Two or three sentences: what <Thing> is, what it overlaps with CCXT on, and the
single question that decides between them.>

## TL;DR

- **Pick <Thing>** if <the honest case for it>.
- **Pick CCXT** if <the case for CCXT>.
- <The point that dissolves the usual false dilemma — e.g. that the implicit API
  means choosing CCXT does not lock you out of venue-specific endpoints.>

## At a glance

| | **CCXT** | **<Thing>** |
| --- | --- | --- |
| Exchanges covered | 104 | |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java | |
| Packages to install | 1 (`ccxt`) | |
| Unified market data + trading API | yes | |
| WebSockets | yes, `watch*` methods | |
| Raw endpoint access | yes — <N> endpoints as implicit methods | |
| Built-in rate limiter | yes, per-endpoint weights, on by default | |
| Unified error types | yes — 41 typed exceptions | |
| Testnet / sandbox | `setSandboxMode(true)` | |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | |
| Licence | MIT | |
| Support | Discord, Telegram, GitHub — usually same-day | |

<sub>Figures verified <Month Year> against CCXT v{{CCXT_VERSION}} and <Thing>'s published repository.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
```

#### **<Thing>**

```python
```

<!-- tabs:end -->

<One or two sentences on what the difference in the two snippets actually means.>

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
```

#### **<Thing>**

```python
```

<!-- tabs:end -->

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
```

#### **<Thing>**

```python
```

<!-- tabs:end -->

## Where the differences actually bite

<Keep only the sections that are true and material for this comparison. Delete
the rest — a padded page is worse than a short one.>

### Portability is the whole point
### One package versus many
### Seven languages, one API
### WebSockets that look like REST
### Rate limits you do not have to model
### Precision, rounding and string math
### One error hierarchy
### Testnet without a second code path
### Nothing is hidden — the implicit API
### Maintenance and support

## What <Thing> does better

<MANDATORY. Three or more real, specific advantages. Then one sentence naming the
reader for whom <Thing> is genuinely the better choice.>

## Migrating from <Thing> to CCXT

| What you are doing | <Thing> | CCXT |
| --- | --- | --- |
| Symbols | | `'BTC/USDT'` |
| Ticker | | `fetch_ticker()` |
| Order book | | `fetch_order_book()` |
| Candles | | `fetch_ohlcv()` |
| New order | | `create_order()` |
| Cancel order | | `cancel_order()` |
| Open orders | | `fetch_open_orders()` |
| Balance | | `fetch_balance()` |
| Streams | | `watch_*` on `ccxt.pro.<id>` |
| Anything not listed | | the same endpoint as an implicit method |

## FAQ

<Four to six real questions, phrased the way someone would type them into a
search box. Answer each in two to four sentences. This section is what gets
quoted by search engines and AI assistants, so make the answers self-contained.>

**Is CCXT slower than <Thing>?**

**Does CCXT support <the thing people assume it does not>?**

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.<id>` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual)
- [<id> unified API reference](/docs/exchanges/<id>)
- [<id> implicit API](/docs/exchanges/<id>/implicit-api)
- [CCXT Pro manual](/docs/pro-manual)
- [More comparisons](/docs/comparisons)
