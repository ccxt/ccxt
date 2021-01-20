<?php

namespace React\Socket;

use Evenement\EventEmitter;
use Exception;
use OverflowException;

/**
 * The `LimitingServer` decorator wraps a given `ServerInterface` and is responsible
 * for limiting and keeping track of open connections to this server instance.
 *
 * Whenever the underlying server emits a `connection` event, it will check its
 * limits and then either
 * - keep track of this connection by adding it to the list of
 *   open connections and then forward the `connection` event
 * - or reject (close) the connection when its limits are exceeded and will
 *   forward an `error` event instead.
 *
 * Whenever a connection closes, it will remove this connection from the list of
 * open connections.
 *
 * ```php
 * $server = new React\Socket\LimitingServer($server, 100);
 * $server->on('connection', function (React\Socket\ConnectionInterface $connection) {
 *     $connection->write('hello there!' . PHP_EOL);
 *     …
 * });
 * ```
 *
 * See also the `ServerInterface` for more details.
 *
 * @see ServerInterface
 * @see ConnectionInterface
 */
class LimitingServer extends EventEmitter implements ServerInterface
{
    private $connections = array();
    private $server;
    private $limit;

    private $pauseOnLimit = false;
    private $autoPaused = false;
    private $manuPaused = false;

    /**
     * Instantiates a new LimitingServer.
     *
     * You have to pass a maximum number of open connections to ensure
     * the server will automatically reject (close) connections once this limit
     * is exceeded. In this case, it will emit an `error` event to inform about
     * this and no `connection` event will be emitted.
     *
     * ```php
     * $server = new React\Socket\LimitingServer($server, 100);
     * $server->on('connection', function (React\Socket\ConnectionInterface $connection) {
     *     $connection->write('hello there!' . PHP_EOL);
     *     …
     * });
     * ```
     *
     * You MAY pass a `null` limit in order to put no limit on the number of
     * open connections and keep accepting new connection until you run out of
     * operating system resources (such as open file handles). This may be
     * useful if you do not want to take care of applying a limit but still want
     * to use the `getConnections()` method.
     *
     * You can optionally configure the server to pause accepting new
     * connections once the connection limit is reached. In this case, it will
     * pause the underlying server and no longer process any new connections at
     * all, thus also no longer closing any excessive connections.
     * The underlying operating system is responsible for keeping a backlog of
     * pending connections until its limit is reached, at which point it will
     * start rejecting further connections.
     * Once the server is below the connection limit, it will continue consuming
     * connections from the backlog and will process any outstanding data on
     * each connection.
     * This mode may be useful for some protocols that are designed to wait for
     * a response message (such as HTTP), but may be less useful for other
     * protocols that demand immediate responses (such as a "welcome" message in
     * an interactive chat).
     *
     * ```php
     * $server = new React\Socket\LimitingServer($server, 100, true);
     * $server->on('connection', function (React\Socket\ConnectionInterface $connection) {
     *     $connection->write('hello there!' . PHP_EOL);
     *     …
     * });
     * ```
     *
     * @param ServerInterface $server
     * @param int|null        $connectionLimit
     * @param bool            $pauseOnLimit
     */
    public function __construct(ServerInterface $server, $connectionLimit, $pauseOnLimit = false)
    {
        $this->server = $server;
        $this->limit = $connectionLimit;
        if ($connectionLimit !== null) {
            $this->pauseOnLimit = $pauseOnLimit;
        }

        $this->server->on('connection', array($this, 'handleConnection'));
        $this->server->on('error', array($this, 'handleError'));
    }

    /**
     * Returns an array with all currently active connections
     *
     * ```php
     * foreach ($server->getConnection() as $connection) {
     *     $connection->write('Hi!');
     * }
     * ```
     *
     * @return ConnectionInterface[]
     */
    public function getConnections()
    {
        return $this->connections;
    }

    public function getAddress()
    {
        return $this->server->getAddress();
    }

    public function pause()
    {
        if (!$this->manuPaused) {
            $this->manuPaused = true;

            if (!$this->autoPaused) {
                $this->server->pause();
            }
        }
    }

    public function resume()
    {
        if ($this->manuPaused) {
            $this->manuPaused = false;

            if (!$this->autoPaused) {
                $this->server->resume();
            }
        }
    }

    public function close()
    {
        $this->server->close();
    }

    /** @internal */
    public function handleConnection(ConnectionInterface $connection)
    {
        // close connection if limit exceeded
        if ($this->limit !== null && \count($this->connections) >= $this->limit) {
            $this->handleError(new \OverflowException('Connection closed because server reached connection limit'));
            $connection->close();
            return;
        }

        $this->connections[] = $connection;
        $that = $this;
        $connection->on('close', function () use ($that, $connection) {
            $that->handleDisconnection($connection);
        });

        // pause accepting new connections if limit exceeded
        if ($this->pauseOnLimit && !$this->autoPaused && \count($this->connections) >= $this->limit) {
            $this->autoPaused = true;

            if (!$this->manuPaused) {
                $this->server->pause();
            }
        }

        $this->emit('connection', array($connection));
    }

    /** @internal */
    public function handleDisconnection(ConnectionInterface $connection)
    {
        unset($this->connections[\array_search($connection, $this->connections)]);

        // continue accepting new connection if below limit
        if ($this->autoPaused && \count($this->connections) < $this->limit) {
            $this->autoPaused = false;

            if (!$this->manuPaused) {
                $this->server->resume();
            }
        }
    }

    /** @internal */
    public function handleError(\Exception $error)
    {
        $this->emit('error', array($error));
    }
}
