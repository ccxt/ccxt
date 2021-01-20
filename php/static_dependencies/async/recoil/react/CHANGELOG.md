# Changelog

## 1.0.2 (2018-04-30)

- **[FIX]** Handle `fwrite()` error conditions that do not produce a PHP error (thanks [@tsufeki](https://github.com/tsufeki))
- **[IMPROVED]** Add support for [`react/event-loop`](https://github.com/reactphp/event-loop) v0.5 (thanks [@WyriHaximus](https://github.com/WyriHaximus))

## 1.0.1 (2018-04-06)

- **[FIX]** Handle `fwrite()` error conditions indicated by `0` return value ([#6](https://github.com/recoilphp/react#6))

## 1.0.0 (2017-10-18)

This is the first stable release of `recoil/react`. There have been no changes
to the API since the `1.0.0-alpha.2` release. This package is being used in
production systems.

Please note that although this version is based on a "pre-release" tag of
[`react/event-loop`](https://github.com/reactphp/event-loop), the event loop has
been stable for a long time. The [v1 roadmap](https://github.com/reactphp/event-loop/issues/101)
for `react/event-loop` will likely introduce some BC breaks, however this should
not prevent future `recoil/react` versions from adhering to
[`recoil/api`](https://github.com/recoilphp/api) v1.

## 1.0.0-alpha.2 (2017-01-10)

- **[NEW]** Add `select()` API operation

## 1.0.0-alpha.1 (2016-12-15)

- Initial release
