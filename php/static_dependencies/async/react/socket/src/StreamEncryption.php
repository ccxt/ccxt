<?php

namespace React\Socket;

use React\EventLoop\LoopInterface;
use React\Promise\Deferred;
use RuntimeException;
use UnexpectedValueException;

/**
 * This class is considered internal and its API should not be relied upon
 * outside of Socket.
 *
 * @internal
 */
class StreamEncryption
{
    private $loop;
    private $method;
    private $server;

    public function __construct(LoopInterface $loop, $server = true)
    {
        $this->loop = $loop;
        $this->server = $server;

        // support TLSv1.0+ by default and exclude legacy SSLv2/SSLv3.
        // As of PHP 7.2+ the main crypto method constant includes all TLS versions.
        // As of PHP 5.6+ the crypto method is a bitmask, so we explicitly include all TLS versions.
        // For legacy PHP < 5.6 the crypto method is a single value only and this constant includes all TLS versions.
        // @link https://3v4l.org/9PSST
        if ($server) {
            $this->method = \STREAM_CRYPTO_METHOD_TLS_SERVER;

            if (\PHP_VERSION_ID < 70200 && \PHP_VERSION_ID >= 50600) {
                $this->method |= \STREAM_CRYPTO_METHOD_TLSv1_0_SERVER | \STREAM_CRYPTO_METHOD_TLSv1_1_SERVER | \STREAM_CRYPTO_METHOD_TLSv1_2_SERVER; // @codeCoverageIgnore
            }
        } else {
            $this->method = \STREAM_CRYPTO_METHOD_TLS_CLIENT;

            if (\PHP_VERSION_ID < 70200 && \PHP_VERSION_ID >= 50600) {
                $this->method |= \STREAM_CRYPTO_METHOD_TLSv1_0_CLIENT | \STREAM_CRYPTO_METHOD_TLSv1_1_CLIENT | \STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT; // @codeCoverageIgnore
            }
        }
    }

    public function enable(Connection $stream)
    {
        return $this->toggle($stream, true);
    }

    public function toggle(Connection $stream, $toggle)
    {
        // pause actual stream instance to continue operation on raw stream socket
        $stream->pause();

        // TODO: add write() event to make sure we're not sending any excessive data

        // cancelling this leaves this stream in an inconsistent state…
        $deferred = new Deferred(function () {
            throw new \RuntimeException();
        });

        // get actual stream socket from stream instance
        $socket = $stream->stream;

        // get crypto method from context options or use global setting from constructor
        $method = $this->method;
        $context = \stream_context_get_options($socket);
        if (isset($context['ssl']['crypto_method'])) {
            $method = $context['ssl']['crypto_method'];
        }

        $that = $this;
        $toggleCrypto = function () use ($socket, $deferred, $toggle, $method, $that) {
            $that->toggleCrypto($socket, $deferred, $toggle, $method);
        };

        $this->loop->addReadStream($socket, $toggleCrypto);

        if (!$this->server) {
            $toggleCrypto();
        }

        $loop = $this->loop;

        return $deferred->promise()->then(function () use ($stream, $socket, $loop, $toggle) {
            $loop->removeReadStream($socket);

            $stream->encryptionEnabled = $toggle;
            $stream->resume();

            return $stream;
        }, function($error) use ($stream, $socket, $loop) {
            $loop->removeReadStream($socket);
            $stream->resume();
            throw $error;
        });
    }

    public function toggleCrypto($socket, Deferred $deferred, $toggle, $method)
    {
        $error = null;
        \set_error_handler(function ($_, $errstr) use (&$error) {
            $error = \str_replace(array("\r", "\n"), ' ', $errstr);

            // remove useless function name from error message
            if (($pos = \strpos($error, "): ")) !== false) {
                $error = \substr($error, $pos + 3);
            }
        });

        $result = \stream_socket_enable_crypto($socket, $toggle, $method);

        \restore_error_handler();

        if (true === $result) {
            $deferred->resolve();
        } else if (false === $result) {
            // overwrite callback arguments for PHP7+ only, so they do not show
            // up in the Exception trace and do not cause a possible cyclic reference.
            $d = $deferred;
            $deferred = null;

            if (\feof($socket) || $error === null) {
                // EOF or failed without error => connection closed during handshake
                $d->reject(new \UnexpectedValueException(
                    'Connection lost during TLS handshake',
                    \defined('SOCKET_ECONNRESET') ? \SOCKET_ECONNRESET : 0
                ));
            } else {
                // handshake failed with error message
                $d->reject(new \UnexpectedValueException(
                    'Unable to complete TLS handshake: ' . $error
                ));
            }
        } else {
            // need more data, will retry
        }
    }
}
