<?php
namespace ccxt\pro;

// native php test, hand-written: the ws base test transpile stage is
// per-file hardcoded and the Client is a hand-written base class per lane,
// mirrors python/ccxt/pro/test/base/test_client_retention.py from
// https://github.com/ccxt/ccxt/pull/29720 and the ts and cs native siblings

use function React\Async\await;

function create_retention_test_client() {
    $noop = function () {};
    return new Client('ws://localhost:1234', $noop, $noop, $noop, $noop, array());
}

function test_ws_client_retention() {

    // baseline: the waiter-present path is unchanged
    $client = create_retention_test_client();
    $waited = $client->future('a');
    $client->resolve('first', 'a');
    assert(await($waited) === 'first', 'waiter-present resolve must deliver');
    assert(!array_key_exists('a', $client->pending_results), 'waiter-present resolve must not retain');

    // latest-wins: values resolved without a waiter are retained, latest only
    $client = create_retention_test_client();
    $client->resolve('stale', 'b');
    $client->resolve('fresh', 'b');
    assert(await($client->future('b')) === 'fresh', 'retained value must be the latest');

    // drain-once: the retained value is delivered exactly once, the spent
    // future stays out of the map, the next consumer waits for fresh data
    assert(!array_key_exists('b', $client->pending_results), 'drain must clear the retained value');
    $second = $client->future('b');
    assert(array_key_exists('b', $client->futures), 'post-drain future must wait in the map');
    $client->resolve('third', 'b');
    assert(await($second) === 'third', 'post-drain future must receive fresh data');

    // reject-clears-value: stale pre-error values must not satisfy
    // post-error consumers
    $client = create_retention_test_client();
    $client->resolve('preError', 'c');
    $error = new \RuntimeException('rejected');
    $client->reject($error, 'c');
    assert(!array_key_exists('c', $client->pending_results), 'reject must clear the retained value');
    $thrown = null;
    try {
        await($client->future('c'));
    } catch (\Throwable $e) {
        $thrown = $e;
    }
    assert($thrown === $error, 'future after reject must throw the retained rejection');

    // resolve-supersedes-stale-rejection: a recovered stream must not fail
    // a later waiter with a stale error
    $client = create_retention_test_client();
    $client->reject(new \RuntimeException('stale'), 'd');
    $client->resolve('recovered', 'd');
    assert(!array_key_exists('d', $client->rejections), 'resolve retention must clear the stale rejection');
    assert(await($client->future('d')) === 'recovered', 'recovered stream must deliver the value');

    // broadcast wipe: a broadcast reject fails live waiters and wipes every
    // retained value
    $client = create_retention_test_client();
    $client->resolve('retained', 'e');
    $live = $client->future('f');
    $broadcast_error = new \RuntimeException('broadcast');
    $client->reject($broadcast_error);
    $thrown = null;
    try {
        await($live);
    } catch (\Throwable $e) {
        $thrown = $e;
    }
    assert($thrown === $broadcast_error, 'broadcast reject must fail live waiters');
    assert(count($client->pending_results) === 0, 'broadcast reject must wipe retained values');
    $client->future('e');
    assert(array_key_exists('e', $client->futures), 'post-broadcast consumer must wait for fresh data');
}
