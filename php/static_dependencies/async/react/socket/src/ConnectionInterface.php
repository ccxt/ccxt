<?php

namespace React\Socket;

use React\Stream\DuplexStreamInterface;

/**
 * Any incoming and outgoing connection is represented by this interface,
 * such as a normal TCP/IP connection.
 *
 * An incoming or outgoing connection is a duplex stream (both readable and
 * writable) that implements React's
 * [`DuplexStreamInterface`](https://github.com/reactphp/stream#duplexstreaminterface).
 * It contains additional properties for the local and remote address (client IP)
 * where this connection has been established to/from.
 *
 * Most commonly, instances implementing this `ConnectionInterface` are emitted
 * by all classes implementing the [`ServerInterface`](#serverinterface) and
 * used by all classes implementing the [`ConnectorInterface`](#connectorinterface).
 *
 * Because the `ConnectionInterface` implements the underlying
 * [`DuplexStreamInterface`](https://github.com/reactphp/stream#duplexstreaminterface)
 * you can use any of its events and methods as usual:
 *
 * ```php
 * $connection->on('data', function ($chunk) {
 *     echo $chunk;
 * });
 *
 * $connection->on('end', function () {
 *     echo 'ended';
 * });
 *
 * $connection->on('error', function (Exception $e) {
 *     echo 'error: ' . $e->getMessage();
 * });
 *
 * $connection->on('close', function () {
 *     echo 'closed';
 * });
 *
 * $connection->write($data);
 * $connection->end($data = null);
 * $connection->close();
 * // …
 * ```
 *
 * For more details, see the
 * [`DuplexStreamInterface`](https://github.com/reactphp/stream#duplexstreaminterface).
 *
 * @see DuplexStreamInterface
 * @see ServerInterface
 * @see ConnectorInterface
 */
interface ConnectionInterface extends DuplexStreamInterface
{
    /**
     * Returns the full remote address (URI) where this connection has been established with
     *
     * ```php
     * $address = $connection->getRemoteAddress();
     * echo 'Connection with ' . $address . PHP_EOL;
     * ```
     *
     * If the remote address can not be determined or is unknown at this time (such as
     * after the connection has been closed), it MAY return a `NULL` value instead.
     *
     * Otherwise, it will return the full address (URI) as a string value, such
     * as `tcp://127.0.0.1:8080`, `tcp://[::1]:80`, `tls://127.0.0.1:443`,
     * `unix://example.sock` or `unix:///path/to/example.sock`.
     * Note that individual URI components are application specific and depend
     * on the underlying transport protocol.
     *
     * If this is a TCP/IP based connection and you only want the remote IP, you may
     * use something like this:
     *
     * ```php
     * $address = $connection->getRemoteAddress();
     * $ip = trim(parse_url($address, PHP_URL_HOST), '[]');
     * echo 'Connection with ' . $ip . PHP_EOL;
     * ```
     *
     * @return ?string remote address (URI) or null if unknown
     */
    public function getRemoteAddress();

    /**
     * Returns the full local address (full URI with scheme, IP and port) where this connection has been established with
     *
     * ```php
     * $address = $connection->getLocalAddress();
     * echo 'Connection with ' . $address . PHP_EOL;
     * ```
     *
     * If the local address can not be determined or is unknown at this time (such as
     * after the connection has been closed), it MAY return a `NULL` value instead.
     *
     * Otherwise, it will return the full address (URI) as a string value, such
     * as `tcp://127.0.0.1:8080`, `tcp://[::1]:80`, `tls://127.0.0.1:443`,
     * `unix://example.sock` or `unix:///path/to/example.sock`.
     * Note that individual URI components are application specific and depend
     * on the underlying transport protocol.
     *
     * This method complements the [`getRemoteAddress()`](#getremoteaddress) method,
     * so they should not be confused.
     *
     * If your `TcpServer` instance is listening on multiple interfaces (e.g. using
     * the address `0.0.0.0`), you can use this method to find out which interface
     * actually accepted this connection (such as a public or local interface).
     *
     * If your system has multiple interfaces (e.g. a WAN and a LAN interface),
     * you can use this method to find out which interface was actually
     * used for this connection.
     *
     * @return ?string local address (URI) or null if unknown
     * @see self::getRemoteAddress()
     */
    public function getLocalAddress();
}
