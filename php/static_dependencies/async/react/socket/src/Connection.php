<?php

namespace React\Socket;

use Evenement\EventEmitter;
use React\EventLoop\LoopInterface;
use React\Stream\DuplexResourceStream;
use React\Stream\Util;
use React\Stream\WritableResourceStream;
use React\Stream\WritableStreamInterface;

/**
 * The actual connection implementation for ConnectionInterface
 *
 * This class should only be used internally, see ConnectionInterface instead.
 *
 * @see ConnectionInterface
 * @internal
 */
class Connection extends EventEmitter implements ConnectionInterface
{
    /**
     * Internal flag whether this is a Unix domain socket (UDS) connection
     *
     * @internal
     */
    public $unix = false;

    /**
     * Internal flag whether encryption has been enabled on this connection
     *
     * Mostly used by internal StreamEncryption so that connection returns
     * `tls://` scheme for encrypted connections instead of `tcp://`.
     *
     * @internal
     */
    public $encryptionEnabled = false;

    /** @internal */
    public $stream;

    private $input;

    public function __construct($resource, LoopInterface $loop)
    {
        // PHP < 7.3.3 (and PHP < 7.2.15) suffers from a bug where feof() might
        // block with 100% CPU usage on fragmented TLS records.
        // We try to work around this by always consuming the complete receive
        // buffer at once to avoid stale data in TLS buffers. This is known to
        // work around high CPU usage for well-behaving peers, but this may
        // cause very large data chunks for high throughput scenarios. The buggy
        // behavior can still be triggered due to network I/O buffers or
        // malicious peers on affected versions, upgrading is highly recommended.
        // @link https://bugs.php.net/bug.php?id=77390
        $clearCompleteBuffer = \PHP_VERSION_ID < 70215 || (\PHP_VERSION_ID >= 70300 && \PHP_VERSION_ID < 70303);

        // PHP < 7.1.4 (and PHP < 7.0.18) suffers from a bug when writing big
        // chunks of data over TLS streams at once.
        // We try to work around this by limiting the write chunk size to 8192
        // bytes for older PHP versions only.
        // This is only a work-around and has a noticable performance penalty on
        // affected versions. Please update your PHP version.
        // This applies to all streams because TLS may be enabled later on.
        // See https://github.com/reactphp/socket/issues/105
        $limitWriteChunks = (\PHP_VERSION_ID < 70018 || (\PHP_VERSION_ID >= 70100 && \PHP_VERSION_ID < 70104));

        $this->input = new DuplexResourceStream(
            $resource,
            $loop,
            $clearCompleteBuffer ? -1 : null,
            new WritableResourceStream($resource, $loop, null, $limitWriteChunks ? 8192 : null)
        );

        $this->stream = $resource;

        Util::forwardEvents($this->input, $this, array('data', 'end', 'error', 'close', 'pipe', 'drain'));

        $this->input->on('close', array($this, 'close'));
    }

    public function isReadable()
    {
        return $this->input->isReadable();
    }

    public function isWritable()
    {
        return $this->input->isWritable();
    }

    public function pause()
    {
        $this->input->pause();
    }

    public function resume()
    {
        $this->input->resume();
    }

    public function pipe(WritableStreamInterface $dest, array $options = array())
    {
        return $this->input->pipe($dest, $options);
    }

    public function write($data)
    {
        return $this->input->write($data);
    }

    public function end($data = null)
    {
        $this->input->end($data);
    }

    public function close()
    {
        $this->input->close();
        $this->handleClose();
        $this->removeAllListeners();
    }

    public function handleClose()
    {
        if (!\is_resource($this->stream)) {
            return;
        }

        // Try to cleanly shut down socket and ignore any errors in case other
        // side already closed. Shutting down may return to blocking mode on
        // some legacy versions, so reset to non-blocking just in case before
        // continuing to close the socket resource.
        // Underlying Stream implementation will take care of closing file
        // handle, so we otherwise keep this open here.
        @\stream_socket_shutdown($this->stream, \STREAM_SHUT_RDWR);
        \stream_set_blocking($this->stream, false);
    }

    public function getRemoteAddress()
    {
        if (!\is_resource($this->stream)) {
            return null;
        }

        return $this->parseAddress(\stream_socket_get_name($this->stream, true));
    }

    public function getLocalAddress()
    {
        if (!\is_resource($this->stream)) {
            return null;
        }

        return $this->parseAddress(\stream_socket_get_name($this->stream, false));
    }

    private function parseAddress($address)
    {
        if ($address === false) {
            return null;
        }

        if ($this->unix) {
            // remove trailing colon from address for HHVM < 3.19: https://3v4l.org/5C1lo
            // note that technically ":" is a valid address, so keep this in place otherwise
            if (\substr($address, -1) === ':' && \defined('HHVM_VERSION_ID') && \HHVM_VERSION_ID < 31900) {
                $address = (string)\substr($address, 0, -1); // @codeCoverageIgnore
            }

            // work around unknown addresses should return null value: https://3v4l.org/5C1lo and https://bugs.php.net/bug.php?id=74556
            // PHP uses "\0" string and HHVM uses empty string (colon removed above)
            if ($address === '' || $address[0] === "\x00" ) {
                return null; // @codeCoverageIgnore
            }

            return 'unix://' . $address;
        }

        // check if this is an IPv6 address which includes multiple colons but no square brackets
        $pos = \strrpos($address, ':');
        if ($pos !== false && \strpos($address, ':') < $pos && \substr($address, 0, 1) !== '[') {
            $address = '[' . \substr($address, 0, $pos) . ']:' . \substr($address, $pos + 1); // @codeCoverageIgnore
        }

        return ($this->encryptionEnabled ? 'tls' : 'tcp') . '://' . $address;
    }
}
