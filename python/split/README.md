# Per-exchange Python packages

`import ccxt` runs `python/ccxt/__init__.py`, which imports all 104 exchanges. An
application that talks to one venue pays for all of them — import time, resident
memory, and the review surface of every exchange module it will never call.

`split_packages.py` rewrites the generated Python tree into one distribution per
exchange, plus a shared core:

```
ccxt-core          ->  ccxt_core            base Exchange, errors, Precise, ws
                                            client. No exchanges, no vendored code.
ccxt-binance       ->  ccxt_binance         binance, in every flavour upstream ships
ccxt-okx           ->  ccxt_okx             okx
...                                         one distribution per exchange id
ccxt-core-starknet ->  ccxt_core_starknet   vendored third-party code, pulled in only
ccxt-core-msgpack  ->  ccxt_core_msgpack    by the exchanges that reach it
...
```

```python
import ccxt_binance

exchange = ccxt_binance.binance()
print(exchange.fetch_ticker('BTC/USDT'))
```

```python
import ccxt_binance.pro as binance_pro       # websockets
import ccxt_binance.async_support as binance_async
```

The API inside each package is byte-for-byte the upstream implementation, so
`ccxt_binance.binance` behaves exactly like `ccxt.binance`.

## Running it

```console
$ python python/split/split_packages.py --out python/split-dist
generated 116 packages into python/split-dist

$ python python/split/verify_packages.py --out python/split-dist --compare-upstream
verified 108 exchange packages
```

Useful flags:

| Flag | Effect |
| --- | --- |
| `--only binance,okx` | generate a subset; parent exchanges are pulled in automatically |
| `--build` | also run `python -m build`, producing wheels and sdists |
| `--dist-prefix` / `--module-prefix` | rename `ccxt-`/`ccxt_` if PyPI names are taken |
| `--vendored core` | keep the vendored trees inside `ccxt-core` instead of splitting them out |
| `--source` | split a different checkout of `python/ccxt` |

Publishing is the usual `twine` invocation over the built distributions:

```console
$ python python/split/split_packages.py --out python/split-dist --build
$ twine upload python/split-dist/dist/* -u __token__ -p "$PYPI_TOKEN"
```

`ccxt-core` must land on the index before the exchange packages, since each of
them pins `ccxt-core==<version>`.

## How the split works

Nothing is hand-maintained per exchange. Every input is read out of the source
tree, so the same command works on the next ccxt release without edits.

1. **Discovery.** The exchange list for each flavour (`sync`, `async_support`,
   `pro`, `prediction`) is read from that flavour's `__init__.py` `exchanges`
   list, and the version from `__version__`.
2. **Rewriting.** Every `ccxt.…` module path in the copied sources is rewritten
   to its new home. This is done over the *token stream*, not with a text regex,
   which is what keeps the ~6000 `ccxt.com` URLs inside docstrings and
   `describe()` blocks untouched. `ccxt.base.*`, `ccxt.static_dependencies.*`,
   `ccxt.protobuf.*` and `ccxt.async_support.base.*` go to `ccxt_core`;
   `ccxt.<id>`, `ccxt.abstract.<id>` and the flavour variants go to `ccxt_<id>`.
3. **Entry points.** Each generated `__init__.py` is the upstream one with the
   per-exchange import lines it does not own removed and `exchanges` shrunk to
   what it ships. The licence header, `__version__`, error re-exports and
   `__all__` carry over verbatim.
4. **Inheritance.** `binanceus` subclasses `binance`, so `ccxt-binanceus`
   *depends on* `ccxt-binance` rather than vendoring a second copy. Those edges
   are discovered from the imports, not from a hard-coded table. Eleven
   exchanges have a parent today.
5. **Vendored code.** `static_dependencies` and `protobuf` are 1.7 MB of
   third-party code that `base/exchange.py` imports *inside* the few methods
   that need it. Each goes into its own distribution, and an exchange package
   depends only on what its call graph reaches — 82 of 108 exchanges reach none
   of it. See below.
6. **Metadata.** Each `pyproject.toml` inherits licence, authors, classifiers
   and `requires-python` from the root `pyproject.toml`; `ccxt-core` inherits
   the pinned runtime dependencies, and exchange packages depend only on
   `ccxt-core` plus any parent and vendored bundle.

Because errors live in `ccxt_core`, `except ccxt_core.NetworkError` catches
failures raised by every installed exchange package, and `isinstance` still
works across them.

## The vendored bundles

`ccxt-core` would otherwise carry 1.7 MB of vendored third-party code to every
install, most of which most exchanges never touch. Splitting it out halves the
median single-exchange install:

| distribution | ships | reached by |
| --- | --- | ---: |
| `ccxt-core-starknet` | starknet, starkware, marshmallow, marshmallow_oneofschema, lark | 2 exchanges |
| `ccxt-core-dydx-v4-client` | dydx_v4_client | 1 |
| `ccxt-core-msgpack` | msgpack | 1 |
| `ccxt-core-protobuf` | protobuf/mexc | 1 |
| `ccxt-core-keccak` | keccak | 25 |
| `ccxt-core-ethabi` | ethabi | 12 |
| `ccxt-core-lighter-client` | lighter_client | 1 |

The grouping is derived rather than declared. Every vendored directory gets a
signature — the set of `base/exchange.py` entry points that can reach it through
the vendored import graph — and directories with the same signature ship
together. That is why `lark`, which exists only to parse Cairo ABIs, travels
with starknet, while `keccak`, reachable on its own as well as through `ethabi`
and `starknet`, stays separate and is depended on by both.

Which exchange needs what comes from the base-method call graph: methods are
mapped to the vendored directories they import, closed over the `self.…` calls
between them, then matched against each exchange module. The mapping
over-approximates where it is unsure — an exchange that calls `hash()` gets
`ccxt-core-keccak` (7 KB) whether or not it ever passes `'keccak'` — because an
extra dependency is harmless and a missing one is not.

Two consequences worth knowing:

- Cross-bundle relative imports inside the vendored code are rewritten to
  absolute ones. `starknet/hash/utils.py` used to reach its sibling with
  `from ... import keccak`; it now says `from ccxt_core_keccak import keccak`.
- Calling a base method directly that the analysis did not attribute to your
  exchange raises `ModuleNotFoundError`. `ccxt-core` exposes each bundle as an
  extra for that case: `pip install ccxt-core[starknet]`, or `ccxt-core[all]`
  for the lot. `--vendored core` puts everything back inside `ccxt-core`.

Because these imports run inside methods, nothing about them shows up at import
time — so `verify_packages.py` executes them. For each exchange it collects the
vendored import statements from the base methods that package actually calls,
and runs them in a child interpreter that can see *only* the package's declared
dependencies. A missing bundle fails there instead of failing a user mid-order.
Third-party modules that ccxt itself does not declare (`google.protobuf`, needed
by `mexc` and `dydx`) are reported separately and not treated as failures: they
are missing from a plain `pip install ccxt` too.

## Verifying it

`verify_packages.py` imports each package in a *fresh interpreter*, instantiates
the exchange in every flavour it ships, and asserts that the only `ccxt_*`
modules in `sys.modules` afterwards are the package itself, `ccxt_core`, and the
parents it declares. A leak surfaces as an extra module name rather than as an
import time nobody measures.

With `--compare-upstream` it additionally asserts, against the monolithic
package in the same interpreter, that `describe()`, the attribute surface and
the MRO of the split class match upstream exactly.

The pytest suite in `tests/` covers the rewriter's unit behaviour and runs the
same verification over a representative subset (`binance` for size, `binanceus`
for cross-package inheritance, `hyperliquid` for all four flavours, `kalshi` for
prediction-only, `bit2c` for the ordinary case):

```console
$ pytest python/split/tests                     # subset, a few seconds
$ CCXT_SPLIT_FULL=1 pytest python/split/tests   # every exchange, what CI runs
```

## Notes

- The generator reads only `python/ccxt`, and writes only to `--out`. It never
  modifies the monolithic package, which keeps shipping unchanged.
- `python/ccxt/test` is deliberately not packaged: the upstream test harness
  imports the whole library by design.
- Regenerate after every release. `python/split-dist/` is gitignored — the
  packages are build output, not source.
