# Changelog

## 1.0.3 (2020-08-25)

- Relax version constraint for `icecave/repr` dependency

## 1.0.2 (2019-10-31)

- Bumped dependencies for compatibility with PHP 7.4

## 1.0.1 (2017-12-13)

- **[FIXED]** Fix `all()`, `any()`, `some()` and `first()` when called without
  providing any coroutines

## 1.0.0 (2017-10-18)

This is the first stable release of `recoil/kernel`. There have been no changes
to the API since the `1.0.0-alpha.2` release.

## 1.0.0-alpha.2 (2017-01-09)

- **[NEW]**, **[BC]** Add `Api::select()`

## 1.0.0-alpha.1 (2016-12-14)

- **[BC]** Remove public `cancel()` method from `StrandWait*` classes

## 0.2.1 (2016-12-13)

- **[FIX]** Allow callables to be yielded as dispatchable values

## 0.2.0 (2016-12-13)

- **[BC]** Added abstract method `KernelTrait::create()`
- **[NEW]** Added method `KernelTrait::start()`

## 0.1.0 (2016-12-12)

- Initial release
