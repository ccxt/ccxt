# Changelog

## 1.1.0 (2020-09-18)

*   Feature: Forward compatibility with react/promise 3.
    (#39 by @WyriHaximus)

*   Add `.gitattributes` to exclude dev files from exports.
    (#40 by @reedy)

*   Improve test suite, update to support PHP 8 and PHPUnit 9.3.
    (#41 and #43 by @SimonFrings and #42 by @WyriHaximus)

## 1.0.0 (2019-07-11)

*   First stable LTS release, now following [SemVer](https://semver.org/).
    We'd like to emphasize that this component is production ready and battle-tested.
    We plan to support all long-term support (LTS) releases for at least 24 months,
    so you have a rock-solid foundation to build on top of.

>   Contains no other changes, so it's actually fully compatible with the v0.6.0 release.

## 0.6.0 (2019-07-04)

*   Feature / BC break: Add support for `getMultiple()`, `setMultiple()`, `deleteMultiple()`, `clear()` and `has()`
    supporting multiple cache items (inspired by PSR-16).
    (#32 by @krlv and #37 by @clue)

*   Documentation for TTL precision with millisecond accuracy or below and
    use high-resolution timer for cache TTL on PHP 7.3+.
    (#35 and #38 by @clue)

*   Improve API documentation and allow legacy HHVM to fail in Travis CI config.
    (#34 and #36 by @clue)

*   Prefix all global functions calls with \ to skip the look up and resolve process and go straight to the global function.
    (#31 by @WyriHaximus)

## 0.5.0 (2018-06-25)

* Improve documentation by describing what is expected of a class implementing `CacheInterface`. 
  (#21, #22, #23, #27 by @WyriHaximus)

* Implemented (optional) Least Recently Used (LRU) cache algorithm for `ArrayCache`. 
  (#26 by @clue)

* Added support for cache expiration (TTL).
  (#29 by @clue and @WyriHaximus)

* Renamed `remove` to `delete` making it more in line with `PSR-16`. 
  (#30 by @clue)

## 0.4.2 (2017-12-20)

*   Improve documentation with usage and installation instructions
    (#10 by @clue)

*   Improve test suite by adding PHPUnit to `require-dev` and
    add forward compatibility with PHPUnit 5 and PHPUnit 6 and
    sanitize Composer autoload paths
    (#14 by @shaunbramley and #12 and #18 by @clue)

## 0.4.1 (2016-02-25)

* Repository maintenance, split off from main repo, improve test suite and documentation
* First class support for PHP7 and HHVM (#9 by @clue)
* Adjust compatibility to 5.3 (#7 by @clue)

## 0.4.0 (2014-02-02)

* BC break: Bump minimum PHP version to PHP 5.4, remove 5.3 specific hacks
* BC break: Update to React/Promise 2.0
* Dependency: Autoloading and filesystem structure now PSR-4 instead of PSR-0

## 0.3.2 (2013-05-10)

* Version bump

## 0.3.0 (2013-04-14)

* Version bump

## 0.2.6 (2012-12-26)

* Feature: New cache component, used by DNS
