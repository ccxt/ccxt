# Changelog

## 1.4.0 (2020-09-18)

*   Feature: Support upcoming PHP 8.
    (#168 by @clue)

*   Improve test suite and update to PHPUnit 9.3.
    (#164 by @clue, #165 and #166 by @SimonFrings and #167 by @WyriHaximus)

## 1.3.0 (2020-07-10)

*   Feature: Forward compatibility with react/promise v3.
    (#153 by @WyriHaximus)

*   Feature: Support parsing `OPT` records (EDNS0).
    (#157 by @clue)

*   Fix: Avoid PHP warnings due to lack of args in exception trace on PHP 7.4.
    (#160 by @clue)

*   Improve test suite and add `.gitattributes` to exclude dev files from exports.
    Run tests on PHPUnit 9 and PHP 7.4 and clean up test suite.
    (#154 by @reedy, #156 by @clue and #163 by @SimonFrings)

## 1.2.0 (2019-08-15)

*   Feature: Add `TcpTransportExecutor` to send DNS queries over TCP/IP connection,
    add `SelectiveTransportExecutor` to retry with TCP if UDP is truncated and
    automatically select transport protocol when no explicit `udp://` or `tcp://` scheme is given in `Factory`.
    (#145, #146, #147 and #148 by @clue)

*   Feature: Support escaping literal dots and special characters in domain names.
    (#144 by @clue)

## 1.1.0 (2019-07-18)

*   Feature: Support parsing `CAA` and `SSHFP` records.
    (#141 and #142 by @clue)

*   Feature: Add `ResolverInterface` as common interface for `Resolver` class.
    (#139 by @clue)

*   Fix: Add missing private property definitions and
    remove unneeded dependency on `react/stream`.
    (#140 and #143 by @clue)

## 1.0.0 (2019-07-11)

*   First stable LTS release, now following [SemVer](https://semver.org/).
    We'd like to emphasize that this component is production ready and battle-tested.
    We plan to support all long-term support (LTS) releases for at least 24 months,
    so you have a rock-solid foundation to build on top of.

This update involves a number of BC breaks due to dropped support for
deprecated functionality and some internal API cleanup. We've tried hard to
avoid BC breaks where possible and minimize impact otherwise. We expect that
most consumers of this package will actually not be affected by any BC
breaks, see below for more details:

*   BC break: Delete all deprecated APIs, use `Query` objects for `Message` questions
    instead of nested arrays and increase code coverage to 100%.
    (#130 by @clue)

*   BC break: Move `$nameserver` from `ExecutorInterface` to `UdpTransportExecutor`,
    remove advanced/internal `UdpTransportExecutor` args for `Parser`/`BinaryDumper` and
    add API documentation for `ExecutorInterface`.
    (#135, #137 and #138 by @clue)

*   BC break: Replace `HeaderBag` attributes with simple `Message` properties.
    (#132 by @clue)

*   BC break: Mark all `Record` attributes as required, add documentation vs `Query`.
    (#136 by @clue)

*   BC break: Mark all classes as final to discourage inheritance
    (#134 by @WyriHaximus)

## 0.4.19 (2019-07-10)

*   Feature: Avoid garbage references when DNS resolution rejects on legacy PHP <= 5.6.
    (#133 by @clue)

## 0.4.18 (2019-09-07)

*   Feature / Fix: Implement `CachingExecutor` using cache TTL, deprecate old `CachedExecutor`,
    respect TTL from response records when caching and do not cache truncated responses.
    (#129 by @clue)

*   Feature: Limit cache size to 256 last responses by default. 
    (#127 by @clue)

*   Feature: Cooperatively resolve hosts to avoid running same query concurrently.
    (#125 by @clue)

## 0.4.17 (2019-04-01)

*   Feature: Support parsing `authority` and `additional` records from DNS response.
    (#123 by @clue)

*   Feature: Support dumping records as part of outgoing binary DNS message.
    (#124 by @clue)

*   Feature: Forward compatibility with upcoming Cache v0.6 and Cache v1.0
    (#121 by @clue)

*   Improve test suite to add forward compatibility with PHPUnit 7,
    test against PHP 7.3 and use legacy PHPUnit 5 on legacy HHVM.
    (#122 by @clue)

## 0.4.16 (2018-11-11)

*   Feature: Improve promise cancellation for DNS lookup retries and clean up any garbage references.
    (#118 by @clue)

*   Fix: Reject parsing malformed DNS response messages such as incomplete DNS response messages,
    malformed record data or malformed compressed domain name labels.
    (#115 and #117 by @clue)

*   Fix: Fix interpretation of TTL as UINT32 with most significant bit unset.
    (#116 by @clue)

*   Fix: Fix caching advanced MX/SRV/TXT/SOA structures.
    (#112 by @clue)

## 0.4.15 (2018-07-02)

*   Feature: Add `resolveAll()` method to support custom query types in `Resolver`.
    (#110 by @clue and @WyriHaximus)

    ```php
    $resolver->resolveAll('reactphp.org', Message::TYPE_AAAA)->then(function ($ips) {
        echo 'IPv6 addresses for reactphp.org ' . implode(', ', $ips) . PHP_EOL;
    });
    ```

*   Feature: Support parsing `NS`, `TXT`, `MX`, `SOA` and `SRV` records.
    (#104, #105, #106, #107 and #108 by @clue)

*   Feature: Add support for `Message::TYPE_ANY` and parse unknown types as binary data.
    (#104 by @clue)

*   Feature: Improve error messages for failed queries and improve documentation.
    (#109 by @clue)

*   Feature: Add reverse DNS lookup example.
    (#111 by @clue)

## 0.4.14 (2018-06-26)

*   Feature: Add `UdpTransportExecutor`, validate incoming DNS response messages
    to avoid cache poisoning attacks and deprecate legacy `Executor`.
    (#101 and #103 by @clue)

*   Feature: Forward compatibility with Cache 0.5
    (#102 by @clue)

*   Deprecate legacy `Query::$currentTime` and binary parser data attributes to clean up and simplify API.
    (#99 by @clue)

## 0.4.13 (2018-02-27)

*   Add `Config::loadSystemConfigBlocking()` to load default system config
    and support parsing DNS config on all supported platforms
    (`/etc/resolv.conf` on Unix/Linux/Mac and WMIC on Windows)
    (#92, #93, #94 and #95 by @clue)

    ```php
    $config = Config::loadSystemConfigBlocking();
    $server = $config->nameservers ? reset($config->nameservers) : '8.8.8.8';
    ```

*   Remove unneeded cyclic dependency on react/socket
    (#96 by @clue)

## 0.4.12 (2018-01-14)

*   Improve test suite by adding forward compatibility with PHPUnit 6,
    test against PHP 7.2, fix forward compatibility with upcoming EventLoop releases,
    add test group to skip integration tests relying on internet connection
    and add minor documentation improvements.
    (#85 and #87 by @carusogabriel, #88 and #89 by @clue and #83 by @jsor)

## 0.4.11 (2017-08-25)

*   Feature: Support resolving from default hosts file
    (#75, #76 and #77 by @clue)

    This means that resolving hosts such as `localhost` will now work as
    expected across all platforms with no changes required:

    ```php
    $resolver->resolve('localhost')->then(function ($ip) {
        echo 'IP: ' . $ip;
    });
    ```

    The new `HostsExecutor` exists for advanced usage and is otherwise used
    internally for this feature.

## 0.4.10 (2017-08-10)

* Feature: Forward compatibility with EventLoop v1.0 and v0.5 and 
  lock minimum dependencies and work around circular dependency for tests
  (#70 and #71 by @clue)

* Fix: Work around DNS timeout issues for Windows users
  (#74 by @clue)

* Documentation and examples for advanced usage
  (#66 by @WyriHaximus)

* Remove broken TCP code, do not retry with invalid TCP query
  (#73 by @clue)

* Improve test suite by fixing HHVM build for now again and ignore future HHVM build errors and
  lock Travis distro so new defaults will not break the build and
  fix failing tests for PHP 7.1
  (#68 by @WyriHaximus and #69 and #72 by @clue)

## 0.4.9 (2017-05-01)

* Feature: Forward compatibility with upcoming Socket v1.0 and v0.8
  (#61 by @clue)

## 0.4.8 (2017-04-16)

* Feature: Add support for the AAAA record type to the protocol parser
  (#58 by @othillo)

* Feature: Add support for the PTR record type to the protocol parser
  (#59 by @othillo)

## 0.4.7 (2017-03-31)

* Feature: Forward compatibility with upcoming Socket v0.6 and v0.7 component
  (#57 by @clue)

## 0.4.6 (2017-03-11)

* Fix: Fix DNS timeout issues for Windows users and add forward compatibility
  with Stream v0.5 and upcoming v0.6
  (#53 by @clue)

* Improve test suite by adding PHPUnit to `require-dev`
  (#54 by @clue)

## 0.4.5 (2017-03-02)

* Fix: Ensure we ignore the case of the answer
  (#51 by @WyriHaximus)

* Feature: Add `TimeoutExecutor` and simplify internal APIs to allow internal
  code re-use for upcoming versions.
  (#48 and #49 by @clue)

## 0.4.4 (2017-02-13)

* Fix: Fix handling connection and stream errors
  (#45 by @clue)

* Feature: Add examples and forward compatibility with upcoming Socket v0.5 component
  (#46 and #47 by @clue)

## 0.4.3 (2016-07-31)

* Feature: Allow for cache adapter injection (#38 by @WyriHaximus)

  ```php
  $factory = new React\Dns\Resolver\Factory();

  $cache = new MyCustomCacheInstance();
  $resolver = $factory->createCached('8.8.8.8', $loop, $cache);
  ```

* Feature: Support Promise cancellation (#35 by @clue)

  ```php
  $promise = $resolver->resolve('reactphp.org');

  $promise->cancel();
  ```

## 0.4.2 (2016-02-24)

* Repository maintenance, split off from main repo, improve test suite and documentation
* First class support for PHP7 and HHVM (#34 by @clue)
* Adjust compatibility to 5.3 (#30 by @clue)

## 0.4.1 (2014-04-13)

* Bug fix: Fixed PSR-4 autoload path (@marcj/WyriHaximus)

## 0.4.0 (2014-02-02)

* BC break: Bump minimum PHP version to PHP 5.4, remove 5.3 specific hacks
* BC break: Update to React/Promise 2.0
* Bug fix: Properly resolve CNAME aliases
* Dependency: Autoloading and filesystem structure now PSR-4 instead of PSR-0
* Bump React dependencies to v0.4

## 0.3.2 (2013-05-10)

* Feature: Support default port for IPv6 addresses (@clue)

## 0.3.0 (2013-04-14)

* Bump React dependencies to v0.3

## 0.2.6 (2012-12-26)

* Feature: New cache component, used by DNS

## 0.2.5 (2012-11-26)

* Version bump

## 0.2.4 (2012-11-18)

* Feature: Change to promise-based API (@jsor)

## 0.2.3 (2012-11-14)

* Version bump

## 0.2.2 (2012-10-28)

* Feature: DNS executor timeout handling (@arnaud-lb)
* Feature: DNS retry executor (@arnaud-lb)

## 0.2.1 (2012-10-14)

* Minor adjustments to DNS parser

## 0.2.0 (2012-09-10)

* Feature: DNS resolver
