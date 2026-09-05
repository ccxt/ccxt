<!-- title: CCXT vs the alternatives: every crypto library and exchange SDK, compared -->
<!-- description: One honest comparison per alternative — CCXT against sixteen multi-exchange libraries, bots and engines, and against the official SDK of every one of the 104 exchanges it supports. -->
<!-- weight: 0 -->

# CCXT vs the alternatives

Every crypto integration starts with the same decision: call the exchange's API directly, use its official SDK, reach for a specialist library — or build on [CCXT](/docs/manual), which speaks all of them behind one API.

This is the index of that comparison, done one alternative at a time. **There is a page for every single exchange CCXT supports**, plus sixteen for the multi-exchange libraries, trading bots, engines and data services people weigh CCXT against.

They are written to be useful rather than promotional. Each one puts the same task side by side in both libraries, tables the concrete differences, and carries a section on **what the alternative does better**. Where a venue has no maintained SDK at all — which turned out to be true for a surprising number — the page says so and compares against the raw REST API instead of inventing a rival to knock down.

## How to choose, in three questions

**1. Will you ever add a second venue?**
If yes, the cost of an exchange-specific integration is not the first one — it is the translation layer you write when the second arrives, and maintain forever after. That layer is what CCXT already is, across 104 exchanges.

**2. Do you need to trade, or only to read?**
Several excellent libraries normalise market data and stop there. If your system places, edits and cancels orders, manages positions or moves funds, the set of real alternatives narrows sharply.

**3. What does your licence review allow?**
CCXT is MIT. Some alternatives are AGPL, which for commercial and SaaS work is a legal question before it is an engineering one.

## What CCXT brings to every one of these comparisons

| | |
| --- | --- |
| **104 exchanges** | one API across spot, margin, swaps, futures, options and prediction markets |
| **8 languages** | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java and Rust — identical method names and return structures |
| **REST + WebSocket** | `fetch*` and `watch*` return the same structures; 76 exchanges stream |
| **Trading, not just data** | orders, trigger/stop/trailing types, positions, leverage, margin mode, transfers, funding |
| **Built-in rate limiting** | per-endpoint request weights, token bucket on by default |
| **Precision handling** | tick/step/notional rounding with string arithmetic, no float drift |
| **41 typed errors** | one exception hierarchy that behaves the same on every venue |
| **Nothing hidden** | every raw exchange endpoint callable as an implicit method |
| **MIT licence** | including WebSocket support — no paid tier |
| **Same-day support** | [Discord](https://discord.gg/dhzSKYU), [Telegram](https://t.me/ccxt_chat) and GitHub issues, answered by the people who wrote the integration |

## Every comparison

Three kinds of page. **Multi-exchange libraries and frameworks** are the tools people genuinely weigh CCXT against when choosing an architecture rather than a venue — libraries that do the same job in another language, bots and engines that ship their own venue adapters, and data services that solve a neighbouring problem. **Exchange APIs and official SDKs** is one page per venue, comparing CCXT with whatever that exchange actually publishes. **Regional entities and product lines** covers the ten classes that inherit a parent exchange’s implementation.

<!-- comparisons:list -->

## Not sure where to start?

- [Install CCXT](/docs/install) — pick your language
- [Manual](/docs/manual) — the unified API and its structures
- [Supported exchanges](/docs/exchange-markets) — the full list
- [CCXT Pro manual](/docs/pro-manual) — WebSocket streaming
- [FAQ](/docs/faq)

Spotted something inaccurate or out of date on one of these pages? Alternatives improve, and we would rather be corrected than wrong — [open an issue](https://github.com/ccxt/ccxt/issues) or say so on [Discord](https://discord.gg/dhzSKYU).
