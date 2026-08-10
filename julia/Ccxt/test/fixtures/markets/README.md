# Recorded markets and currencies

`markets/<id>.json` and `currencies/<id>.json` hold the market and currency sets
that `test/fixtures/static_init_offline.jl` feeds to `setMarkets`, so the suite
can exercise the library without a network.

There are two kinds of file here, and they are maintained differently.

## Curated — `binance`, `bybit`, `coinbase`, `kraken`, `okx`

Hand-picked to match the recorded `request/<id>.json` and `response/<id>.json`
fixtures: those tests reference specific symbols (dated futures, options, an
inverse swap) and assert on exact URLs and signed bodies, so the market set is
part of the fixture contract.

**Do not regenerate these.** Changing a market id or precision here silently
changes the request a test builds, and the failure surfaces as an unrelated
assertion in `request_<id>` — for instance a strike price appearing in an option
symbol, or a leverage tier resolving differently. Edit them only alongside the
request/response fixtures they serve.

## Generated — everything else

Captured from the built JS CCXT (`js/ccxt.js`), the same source-of-truth
transpile the Julia sources come from, then trimmed to a handful of markets per
exchange. Consumed by the `load_all` group, which checks that every generated
exchange constructs, indexes its markets and resolves a symbol.

The trim keeps up to two markets per market *type* the exchange supports (spot,
swap, future, option), preferring liquid quote assets. Types are what select
between divergent code paths in `setMarkets` and the parsers, so covering the
types an exchange offers is worth far more than covering many symbols of one
type — and it is the difference between 2 MB of fixtures and 200 MB.

Four exchanges have no file, because enumerating their markets needs a live
authorised call that cannot be recorded offline:

| Exchange   | Reason                                                |
|------------|-------------------------------------------------------|
| `alpaca`   | `loadMarkets` requires an apiKey credential            |
| `extended` | market endpoint returns 403 to unauthenticated clients |
| `gate`     | market endpoint TLS chain is not verifiable offline    |
| `mudrex`   | `loadMarkets` requires a secret credential             |

`load_all` still constructs those four and asserts the file is absent, so the
list stays honest: delete a fixture by accident and the suite fails rather than
quietly covering less.

To re-capture the generated set, regenerate from `js/ccxt.js` and re-trim. Any
tool that does this **must skip the five curated exchanges above.**
