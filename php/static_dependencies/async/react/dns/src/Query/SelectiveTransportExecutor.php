<?php

namespace React\Dns\Query;

use React\Promise\Promise;

/**
 * Send DNS queries over a UDP or TCP/IP stream transport.
 *
 * This class will automatically choose the correct transport protocol to send
 * a DNS query to your DNS server. It will always try to send it over the more
 * efficient UDP transport first. If this query yields a size related issue
 * (truncated messages), it will retry over a streaming TCP/IP transport.
 *
 * For more advanced usages one can utilize this class directly.
 * The following example looks up the `IPv6` address for `reactphp.org`.
 *
 * ```php
 * $executor = new SelectiveTransportExecutor($udpExecutor, $tcpExecutor);
 *
 * $executor->query(
 *     new Query($name, Message::TYPE_AAAA, Message::CLASS_IN)
 * )->then(function (Message $message) {
 *     foreach ($message->answers as $answer) {
 *         echo 'IPv6: ' . $answer->data . PHP_EOL;
 *     }
 * }, 'printf');
 * ```
 *
 * Note that this executor only implements the logic to select the correct
 * transport for the given DNS query. Implementing the correct transport logic,
 * implementing timeouts and any retry logic is left up to the given executors,
 * see also [`UdpTransportExecutor`](#udptransportexecutor) and
 * [`TcpTransportExecutor`](#tcptransportexecutor) for more details.
 *
 * Note that this executor is entirely async and as such allows you to execute
 * any number of queries concurrently. You should probably limit the number of
 * concurrent queries in your application or you're very likely going to face
 * rate limitations and bans on the resolver end. For many common applications,
 * you may want to avoid sending the same query multiple times when the first
 * one is still pending, so you will likely want to use this in combination with
 * a `CoopExecutor` like this:
 *
 * ```php
 * $executor = new CoopExecutor(
 *     new SelectiveTransportExecutor(
 *         $datagramExecutor,
 *         $streamExecutor
 *     )
 * );
 * ```
 */
class SelectiveTransportExecutor implements ExecutorInterface
{
    private $datagramExecutor;
    private $streamExecutor;

    public function __construct(ExecutorInterface $datagramExecutor, ExecutorInterface $streamExecutor)
    {
        $this->datagramExecutor = $datagramExecutor;
        $this->streamExecutor = $streamExecutor;
    }

    public function query(Query $query)
    {
        $stream = $this->streamExecutor;
        $pending = $this->datagramExecutor->query($query);

        return new Promise(function ($resolve, $reject) use (&$pending, $stream, $query) {
            $pending->then(
                $resolve,
                function ($e) use (&$pending, $stream, $query, $resolve, $reject) {
                    if ($e->getCode() === (\defined('SOCKET_EMSGSIZE') ? \SOCKET_EMSGSIZE : 90)) {
                        $pending = $stream->query($query)->then($resolve, $reject);
                    } else {
                        $reject($e);
                    }
                }
            );
        }, function () use (&$pending) {
            $pending->cancel();
            $pending = null;
        });
    }
}
