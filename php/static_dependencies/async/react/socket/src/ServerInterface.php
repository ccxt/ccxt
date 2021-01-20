<?php

namespace React\Socket;

use Evenement\EventEmitterInterface;

/**
 * The `ServerInterface` is responsible for providing an interface for accepting
 * incoming streaming connections, such as a normal TCP/IP connection.
 *
 * Most higher-level components (such as a HTTP server) accept an instance
 * implementing this interface to accept incoming streaming connections.
 * This is usually done via dependency injection, so it's fairly simple to actually
 * swap this implementation against any other implementation of this interface.
 * This means that you SHOULD typehint against this interface instead of a concrete
 * implementation of this interface.
 *
 * Besides defining a few methods, this interface also implements the
 * `EventEmitterInterface` which allows you to react to certain events:
 *
 * connection event:
 *     The `connection` event will be emitted whenever a new connection has been
 *     established, i.e. a new client connects to this server socket:
 *
 *     ```php
 *     $server->on('connection', function (React\Socket\ConnectionInterface $connection) {
 *         echo 'new connection' . PHP_EOL;
 *     });
 *     ```
 *
 *     See also the `ConnectionInterface` for more details about handling the
 *     incoming connection.
 *
 * error event:
 *     The `error` event will be emitted whenever there's an error accepting a new
 *     connection from a client.
 *
 *     ```php
 *     $server->on('error', function (Exception $e) {
 *         echo 'error: ' . $e->getMessage() . PHP_EOL;
 *     });
 *     ```
 *
 *     Note that this is not a fatal error event, i.e. the server keeps listening for
 *     new connections even after this event.
 *
 * @see ConnectionInterface
 */
interface ServerInterface extends EventEmitterInterface
{
    /**
     * Returns the full address (URI) this server is currently listening on
     *
     * ```php
     * $address = $server->getAddress();
     * echo 'Server listening on ' . $address . PHP_EOL;
     * ```
     *
     * If the address can not be determined or is unknown at this time (such as
     * after the socket has been closed), it MAY return a `NULL` value instead.
     *
     * Otherwise, it will return the full address (URI) as a string value, such
     * as `tcp://127.0.0.1:8080`, `tcp://[::1]:80` or `tls://127.0.0.1:443`.
     * Note that individual URI components are application specific and depend
     * on the underlying transport protocol.
     *
     * If this is a TCP/IP based server and you only want the local port, you may
     * use something like this:
     *
     * ```php
     * $address = $server->getAddress();
     * $port = parse_url($address, PHP_URL_PORT);
     * echo 'Server listening on port ' . $port . PHP_EOL;
     * ```
     *
     * @return ?string the full listening address (URI) or NULL if it is unknown (not applicable to this server socket or already closed)
     */
    public function getAddress();

    /**
     * Pauses accepting new incoming connections.
     *
     * Removes the socket resource from the EventLoop and thus stop accepting
     * new connections. Note that the listening socket stays active and is not
     * closed.
     *
     * This means that new incoming connections will stay pending in the
     * operating system backlog until its configurable backlog is filled.
     * Once the backlog is filled, the operating system may reject further
     * incoming connections until the backlog is drained again by resuming
     * to accept new connections.
     *
     * Once the server is paused, no futher `connection` events SHOULD
     * be emitted.
     *
     * ```php
     * $server->pause();
     *
     * $server->on('connection', assertShouldNeverCalled());
     * ```
     *
     * This method is advisory-only, though generally not recommended, the
     * server MAY continue emitting `connection` events.
     *
     * Unless otherwise noted, a successfully opened server SHOULD NOT start
     * in paused state.
     *
     * You can continue processing events by calling `resume()` again.
     *
     * Note that both methods can be called any number of times, in particular
     * calling `pause()` more than once SHOULD NOT have any effect.
     * Similarly, calling this after `close()` is a NO-OP.
     *
     * @see self::resume()
     * @return void
     */
    public function pause();

    /**
     * Resumes accepting new incoming connections.
     *
     * Re-attach the socket resource to the EventLoop after a previous `pause()`.
     *
     * ```php
     * $server->pause();
     *
     * $loop->addTimer(1.0, function () use ($server) {
     *     $server->resume();
     * });
     * ```
     *
     * Note that both methods can be called any number of times, in particular
     * calling `resume()` without a prior `pause()` SHOULD NOT have any effect.
     * Similarly, calling this after `close()` is a NO-OP.
     *
     * @see self::pause()
     * @return void
     */
    public function resume();

    /**
     * Shuts down this listening socket
     *
     * This will stop listening for new incoming connections on this socket.
     *
     * Calling this method more than once on the same instance is a NO-OP.
     *
     * @return void
     */
    public function close();
}
