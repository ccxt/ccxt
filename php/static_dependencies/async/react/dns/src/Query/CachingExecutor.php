<?php

namespace React\Dns\Query;

use React\Cache\CacheInterface;
use React\Dns\Model\Message;
use React\Promise\Promise;

final class CachingExecutor implements ExecutorInterface
{
    /**
     * Default TTL for negative responses (NXDOMAIN etc.).
     *
     * @internal
     */
    const TTL = 60;

    private $executor;
    private $cache;

    public function __construct(ExecutorInterface $executor, CacheInterface $cache)
    {
        $this->executor = $executor;
        $this->cache = $cache;
    }

    public function query(Query $query)
    {
        $id = $query->name . ':' . $query->type . ':' . $query->class;
        $cache = $this->cache;
        $that = $this;
        $executor = $this->executor;

        $pending = $cache->get($id);
        return new Promise(function ($resolve, $reject) use ($query, $id, $cache, $executor, &$pending, $that) {
            $pending->then(
                function ($message) use ($query, $id, $cache, $executor, &$pending, $that) {
                    // return cached response message on cache hit
                    if ($message !== null) {
                        return $message;
                    }

                    // perform DNS lookup if not already cached
                    return $pending = $executor->query($query)->then(
                        function (Message $message) use ($cache, $id, $that) {
                            // DNS response message received => store in cache when not truncated and return
                            if (!$message->tc) {
                                $cache->set($id, $message, $that->ttl($message));
                            }

                            return $message;
                        }
                    );
                }
            )->then($resolve, function ($e) use ($reject, &$pending) {
                $reject($e);
                $pending = null;
            });
        }, function ($_, $reject) use (&$pending, $query) {
            $reject(new \RuntimeException('DNS query for ' . $query->name . ' has been cancelled'));
            $pending->cancel();
            $pending = null;
        });
    }

    /**
     * @param Message $message
     * @return int
     * @internal
     */
    public function ttl(Message $message)
    {
        // select TTL from answers (should all be the same), use smallest value if available
        // @link https://tools.ietf.org/html/rfc2181#section-5.2
        $ttl = null;
        foreach ($message->answers as $answer) {
            if ($ttl === null || $answer->ttl < $ttl) {
                $ttl = $answer->ttl;
            }
        }

        if ($ttl === null) {
            $ttl = self::TTL;
        }

        return $ttl;
    }
}
