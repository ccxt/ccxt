<?php

namespace React\Socket;

use React\EventLoop\LoopInterface;
use React\Promise;
use InvalidArgumentException;
use RuntimeException;

final class TcpConnector implements ConnectorInterface
{
    private $loop;
    private $context;

    public function __construct(LoopInterface $loop, array $context = array())
    {
        $this->loop = $loop;
        $this->context = $context;
    }

    public function connect($uri)
    {
        if (\strpos($uri, '://') === false) {
            $uri = 'tcp://' . $uri;
        }

        $parts = \parse_url($uri);
        if (!$parts || !isset($parts['scheme'], $parts['host'], $parts['port']) || $parts['scheme'] !== 'tcp') {
            return Promise\reject(new \InvalidArgumentException('Given URI "' . $uri . '" is invalid'));
        }

        $ip = \trim($parts['host'], '[]');
        if (false === \filter_var($ip, \FILTER_VALIDATE_IP)) {
            return Promise\reject(new \InvalidArgumentException('Given URI "' . $ip . '" does not contain a valid host IP'));
        }

        // use context given in constructor
        $context = array(
            'socket' => $this->context
        );

        // parse arguments from query component of URI
        $args = array();
        if (isset($parts['query'])) {
            \parse_str($parts['query'], $args);
        }

        // If an original hostname has been given, use this for TLS setup.
        // This can happen due to layers of nested connectors, such as a
        // DnsConnector reporting its original hostname.
        // These context options are here in case TLS is enabled later on this stream.
        // If TLS is not enabled later, this doesn't hurt either.
        if (isset($args['hostname'])) {
            $context['ssl'] = array(
                'SNI_enabled' => true,
                'peer_name' => $args['hostname']
            );

            // Legacy PHP < 5.6 ignores peer_name and requires legacy context options instead.
            // The SNI_server_name context option has to be set here during construction,
            // as legacy PHP ignores any values set later.
            // @codeCoverageIgnoreStart
            if (\PHP_VERSION_ID < 50600) {
                $context['ssl'] += array(
                    'SNI_server_name' => $args['hostname'],
                    'CN_match' => $args['hostname']
                );
            }
            // @codeCoverageIgnoreEnd
        }

        // latest versions of PHP no longer accept any other URI components and
        // HHVM fails to parse URIs with a query but no path, so let's simplify our URI here
        $remote = 'tcp://' . $parts['host'] . ':' . $parts['port'];

        $stream = @\stream_socket_client(
            $remote,
            $errno,
            $errstr,
            0,
            \STREAM_CLIENT_CONNECT | \STREAM_CLIENT_ASYNC_CONNECT,
            \stream_context_create($context)
        );

        if (false === $stream) {
            return Promise\reject(new \RuntimeException(
                \sprintf("Connection to %s failed: %s", $uri, $errstr),
                $errno
            ));
        }

        // wait for connection
        $loop = $this->loop;
        return new Promise\Promise(function ($resolve, $reject) use ($loop, $stream, $uri) {
            $loop->addWriteStream($stream, function ($stream) use ($loop, $resolve, $reject, $uri) {
                $loop->removeWriteStream($stream);

                // The following hack looks like the only way to
                // detect connection refused errors with PHP's stream sockets.
                if (false === \stream_socket_get_name($stream, true)) {
                    \fclose($stream);

                    $reject(new \RuntimeException('Connection to ' . $uri . ' failed: Connection refused'));
                } else {
                    $resolve(new Connection($stream, $loop));
                }
            });
        }, function () use ($loop, $stream, $uri) {
            $loop->removeWriteStream($stream);
            \fclose($stream);

            // @codeCoverageIgnoreStart
            // legacy PHP 5.3 sometimes requires a second close call (see tests)
            if (\PHP_VERSION_ID < 50400 && \is_resource($stream)) {
                \fclose($stream);
            }
            // @codeCoverageIgnoreEnd

            throw new \RuntimeException('Connection to ' . $uri . ' cancelled during TCP/IP handshake');
        });
    }
}
