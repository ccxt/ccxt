<?php

namespace React\Dns\Query;

use React\Promise\Promise;

/**
 * Cooperatively resolves hosts via the given base executor to ensure same query is not run concurrently
 *
 * Wraps an existing `ExecutorInterface` to keep tracking of pending queries
 * and only starts a new query when the same query is not already pending. Once
 * the underlying query is fulfilled/rejected, it will forward its value to all
 * promises awaiting the same query.
 *
 * This means it will not limit concurrency for queries that differ, for example
 * when sending many queries for different host names or types.
 *
 * This is useful because all executors are entirely async and as such allow you
 * to execute any number of queries concurrently. You should probably limit the
 * number of concurrent queries in your application or you're very likely going
 * to face rate limitations and bans on the resolver end. For many common
 * applications, you may want to avoid sending the same query multiple times
 * when the first one is still pending, so you will likely want to use this in
 * combination with some other executor like this:
 *
 * ```php
 * $executor = new CoopExecutor(
 *     new RetryExecutor(
 *         new TimeoutExecutor(
 *             new UdpTransportExecutor($nameserver, $loop),
 *             3.0,
 *             $loop
 *         )
 *     )
 * );
 * ```
 */
final class CoopExecutor implements ExecutorInterface
{
    private $executor;
    private $pending = array();
    private $counts = array();

    public function __construct(ExecutorInterface $base)
    {
        $this->executor = $base;
    }

    public function query(Query $query)
    {
        $key = $this->serializeQueryToIdentity($query);
        if (isset($this->pending[$key])) {
            // same query is already pending, so use shared reference to pending query
            $promise = $this->pending[$key];
            ++$this->counts[$key];
        } else {
            // no such query pending, so start new query and keep reference until it's fulfilled or rejected
            $promise = $this->executor->query($query);
            $this->pending[$key] = $promise;
            $this->counts[$key] = 1;

            $pending =& $this->pending;
            $counts =& $this->counts;
            $promise->then(function () use ($key, &$pending, &$counts) {
                unset($pending[$key], $counts[$key]);
            }, function () use ($key, &$pending, &$counts) {
                unset($pending[$key], $counts[$key]);
            });
        }

        // Return a child promise awaiting the pending query.
        // Cancelling this child promise should only cancel the pending query
        // when no other child promise is awaiting the same query.
        $pending =& $this->pending;
        $counts =& $this->counts;
        return new Promise(function ($resolve, $reject) use ($promise) {
            $promise->then($resolve, $reject);
        }, function () use (&$promise, $key, $query, &$pending, &$counts) {
            if (--$counts[$key] < 1) {
                unset($pending[$key], $counts[$key]);
                $promise->cancel();
                $promise = null;
            }
            throw new \RuntimeException('DNS query for ' . $query->name . ' has been cancelled');
        });
    }

    private function serializeQueryToIdentity(Query $query)
    {
        return sprintf('%s:%s:%s', $query->name, $query->type, $query->class);
    }
}
