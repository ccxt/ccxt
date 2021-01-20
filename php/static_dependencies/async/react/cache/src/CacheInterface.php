<?php

namespace React\Cache;

use React\Promise\PromiseInterface;

interface CacheInterface
{
    /**
     * Retrieves an item from the cache.
     *
     * This method will resolve with the cached value on success or with the
     * given `$default` value when no item can be found or when an error occurs.
     * Similarly, an expired cache item (once the time-to-live is expired) is
     * considered a cache miss.
     *
     * ```php
     * $cache
     *     ->get('foo')
     *     ->then('var_dump');
     * ```
     *
     * This example fetches the value of the key `foo` and passes it to the
     * `var_dump` function. You can use any of the composition provided by
     * [promises](https://github.com/reactphp/promise).
     *
     * @param string $key
     * @param mixed  $default Default value to return for cache miss or null if not given.
     * @return PromiseInterface
     */
    public function get($key, $default = null);

    /**
     * Stores an item in the cache.
     *
     * This method will resolve with `true` on success or `false` when an error
     * occurs. If the cache implementation has to go over the network to store
     * it, it may take a while.
     *
     * The optional `$ttl` parameter sets the maximum time-to-live in seconds
     * for this cache item. If this parameter is omitted (or `null`), the item
     * will stay in the cache for as long as the underlying implementation
     * supports. Trying to access an expired cache item results in a cache miss,
     * see also [`get()`](#get).
     *
     * ```php
     * $cache->set('foo', 'bar', 60);
     * ```
     *
     * This example eventually sets the value of the key `foo` to `bar`. If it
     * already exists, it is overridden.
     *
     * This interface does not enforce any particular TTL resolution, so special
     * care may have to be taken if you rely on very high precision with
     * millisecond accuracy or below. Cache implementations SHOULD work on a
     * best effort basis and SHOULD provide at least second accuracy unless
     * otherwise noted. Many existing cache implementations are known to provide
     * microsecond or millisecond accuracy, but it's generally not recommended
     * to rely on this high precision.
     *
     * This interface suggests that cache implementations SHOULD use a monotonic
     * time source if available. Given that a monotonic time source is only
     * available as of PHP 7.3 by default, cache implementations MAY fall back
     * to using wall-clock time.
     * While this does not affect many common use cases, this is an important
     * distinction for programs that rely on a high time precision or on systems
     * that are subject to discontinuous time adjustments (time jumps).
     * This means that if you store a cache item with a TTL of 30s and then
     * adjust your system time forward by 20s, the cache item SHOULD still
     * expire in 30s.
     *
     * @param string $key
     * @param mixed  $value
     * @param ?float $ttl
     * @return PromiseInterface Returns a promise which resolves to `true` on success or `false` on error
     */
    public function set($key, $value, $ttl = null);

    /**
     * Deletes an item from the cache.
     *
     * This method will resolve with `true` on success or `false` when an error
     * occurs. When no item for `$key` is found in the cache, it also resolves
     * to `true`. If the cache implementation has to go over the network to
     * delete it, it may take a while.
     *
     * ```php
     * $cache->delete('foo');
     * ```
     *
     * This example eventually deletes the key `foo` from the cache. As with
     * `set()`, this may not happen instantly and a promise is returned to
     * provide guarantees whether or not the item has been removed from cache.
     *
     * @param string $key
     * @return PromiseInterface Returns a promise which resolves to `true` on success or `false` on error
     */
    public function delete($key);

    /**
     * Retrieves multiple cache items by their unique keys.
     *
     * This method will resolve with an array of cached values on success or with the
     * given `$default` value when an item can not be found or when an error occurs.
     * Similarly, an expired cache item (once the time-to-live is expired) is
     * considered a cache miss.
     *
     * ```php
     * $cache->getMultiple(array('name', 'age'))->then(function (array $values) {
     *     $name = $values['name'] ?? 'User';
     *     $age = $values['age'] ?? 'n/a';
     *
     *     echo $name . ' is ' . $age . PHP_EOL;
     * });
     * ```
     *
     * This example fetches the cache items for the `name` and `age` keys and
     * prints some example output. You can use any of the composition provided
     * by [promises](https://github.com/reactphp/promise).
     *
     * @param string[] $keys A list of keys that can obtained in a single operation.
     * @param mixed $default Default value to return for keys that do not exist.
     * @return PromiseInterface<array> Returns a promise which resolves to an `array` of cached values
     */
    public function getMultiple(array $keys, $default = null);

    /**
     * Persists a set of key => value pairs in the cache, with an optional TTL.
     *
     * This method will resolve with `true` on success or `false` when an error
     * occurs. If the cache implementation has to go over the network to store
     * it, it may take a while.
     *
     * The optional `$ttl` parameter sets the maximum time-to-live in seconds
     * for these cache items. If this parameter is omitted (or `null`), these items
     * will stay in the cache for as long as the underlying implementation
     * supports. Trying to access an expired cache items results in a cache miss,
     * see also [`get()`](#get).
     *
     * ```php
     * $cache->setMultiple(array('foo' => 1, 'bar' => 2), 60);
     * ```
     *
     * This example eventually sets the list of values - the key `foo` to 1 value
     * and the key `bar` to 2. If some of the keys already exist, they are overridden.
     *
     * @param array  $values A list of key => value pairs for a multiple-set operation.
     * @param ?float $ttl    Optional. The TTL value of this item.
     * @return PromiseInterface<bool> Returns a promise which resolves to `true` on success or `false` on error
     */
    public function setMultiple(array $values, $ttl = null);

    /**
     * Deletes multiple cache items in a single operation.
     *
     * @param string[] $keys A list of string-based keys to be deleted.
     * @return PromiseInterface<bool> Returns a promise which resolves to `true` on success or `false` on error
     */
    public function deleteMultiple(array $keys);

    /**
     * Wipes clean the entire cache.
     *
     * @return PromiseInterface<bool> Returns a promise which resolves to `true` on success or `false` on error
     */
    public function clear();

    /**
     * Determines whether an item is present in the cache.
     *
     * This method will resolve with `true` on success or `false` when no item can be found
     * or when an error occurs. Similarly, an expired cache item (once the time-to-live
     * is expired) is considered a cache miss.
     *
     * ```php
     * $cache
     *     ->has('foo')
     *     ->then('var_dump');
     * ```
     *
     * This example checks if the value of the key `foo` is set in the cache and passes
     * the result to the `var_dump` function. You can use any of the composition provided by
     * [promises](https://github.com/reactphp/promise).
     *
     * NOTE: It is recommended that has() is only to be used for cache warming type purposes
     * and not to be used within your live applications operations for get/set, as this method
     * is subject to a race condition where your has() will return true and immediately after,
     * another script can remove it making the state of your app out of date.
     *
     * @param string $key The cache item key.
     * @return PromiseInterface<bool> Returns a promise which resolves to `true` on success or `false` on error
     */
    public function has($key);
}
