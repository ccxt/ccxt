<?php

namespace React\Stream;

use Evenement\EventEmitter;
use React\EventLoop\LoopInterface;
use InvalidArgumentException;

final class DuplexResourceStream extends EventEmitter implements DuplexStreamInterface
{
    private $stream;
    private $loop;

    /**
     * Controls the maximum buffer size in bytes to read at once from the stream.
     *
     * This can be a positive number which means that up to X bytes will be read
     * at once from the underlying stream resource. Note that the actual number
     * of bytes read may be lower if the stream resource has less than X bytes
     * currently available.
     *
     * This can be `-1` which means read everything available from the
     * underlying stream resource.
     * This should read until the stream resource is not readable anymore
     * (i.e. underlying buffer drained), note that this does not neccessarily
     * mean it reached EOF.
     *
     * @var int
     */
    private $bufferSize;
    private $buffer;

    private $readable = true;
    private $writable = true;
    private $closing = false;
    private $listening = false;

    public function __construct($stream, LoopInterface $loop, $readChunkSize = null, WritableStreamInterface $buffer = null)
    {
        if (!\is_resource($stream) || \get_resource_type($stream) !== "stream") {
             throw new InvalidArgumentException('First parameter must be a valid stream resource');
        }

        // ensure resource is opened for reading and wrting (fopen mode must contain "+")
        $meta = \stream_get_meta_data($stream);
        if (isset($meta['mode']) && $meta['mode'] !== '' && \strpos($meta['mode'], '+') === false) {
            throw new InvalidArgumentException('Given stream resource is not opened in read and write mode');
        }

        // this class relies on non-blocking I/O in order to not interrupt the event loop
        // e.g. pipes on Windows do not support this: https://bugs.php.net/bug.php?id=47918
        if (\stream_set_blocking($stream, false) !== true) {
            throw new \RuntimeException('Unable to set stream resource to non-blocking mode');
        }

        // Use unbuffered read operations on the underlying stream resource.
        // Reading chunks from the stream may otherwise leave unread bytes in
        // PHP's stream buffers which some event loop implementations do not
        // trigger events on (edge triggered).
        // This does not affect the default event loop implementation (level
        // triggered), so we can ignore platforms not supporting this (HHVM).
        // Pipe streams (such as STDIN) do not seem to require this and legacy
        // PHP versions cause SEGFAULTs on unbuffered pipe streams, so skip this.
        if (\function_exists('stream_set_read_buffer') && !$this->isLegacyPipe($stream)) {
            \stream_set_read_buffer($stream, 0);
        }

        if ($buffer === null) {
            $buffer = new WritableResourceStream($stream, $loop);
        }

        $this->stream = $stream;
        $this->loop = $loop;
        $this->bufferSize = ($readChunkSize === null) ? 65536 : (int)$readChunkSize;
        $this->buffer = $buffer;

        $that = $this;

        $this->buffer->on('error', function ($error) use ($that) {
            $that->emit('error', array($error));
        });

        $this->buffer->on('close', array($this, 'close'));

        $this->buffer->on('drain', function () use ($that) {
            $that->emit('drain');
        });

        $this->resume();
    }

    public function isReadable()
    {
        return $this->readable;
    }

    public function isWritable()
    {
        return $this->writable;
    }

    public function pause()
    {
        if ($this->listening) {
            $this->loop->removeReadStream($this->stream);
            $this->listening = false;
        }
    }

    public function resume()
    {
        if (!$this->listening && $this->readable) {
            $this->loop->addReadStream($this->stream, array($this, 'handleData'));
            $this->listening = true;
        }
    }

    public function write($data)
    {
        if (!$this->writable) {
            return false;
        }

        return $this->buffer->write($data);
    }

    public function close()
    {
        if (!$this->writable && !$this->closing) {
            return;
        }

        $this->closing = false;

        $this->readable = false;
        $this->writable = false;

        $this->emit('close');
        $this->pause();
        $this->buffer->close();
        $this->removeAllListeners();

        if (\is_resource($this->stream)) {
            \fclose($this->stream);
        }
    }

    public function end($data = null)
    {
        if (!$this->writable) {
            return;
        }

        $this->closing = true;

        $this->readable = false;
        $this->writable = false;
        $this->pause();

        $this->buffer->end($data);
    }

    public function pipe(WritableStreamInterface $dest, array $options = array())
    {
        return Util::pipe($this, $dest, $options);
    }

    /** @internal */
    public function handleData($stream)
    {
        $error = null;
        \set_error_handler(function ($errno, $errstr, $errfile, $errline) use (&$error) {
            $error = new \ErrorException(
                $errstr,
                0,
                $errno,
                $errfile,
                $errline
            );
        });

        $data = \stream_get_contents($stream, $this->bufferSize);

        \restore_error_handler();

        if ($error !== null) {
            $this->emit('error', array(new \RuntimeException('Unable to read from stream: ' . $error->getMessage(), 0, $error)));
            $this->close();
            return;
        }

        if ($data !== '') {
            $this->emit('data', array($data));
        } elseif (\feof($this->stream)) {
            // no data read => we reached the end and close the stream
            $this->emit('end');
            $this->close();
        }
    }

    /**
     * Returns whether this is a pipe resource in a legacy environment
     *
     * This works around a legacy PHP bug (#61019) that was fixed in PHP 5.4.28+
     * and PHP 5.5.12+ and newer.
     *
     * @param resource $resource
     * @return bool
     * @link https://github.com/reactphp/child-process/issues/40
     *
     * @codeCoverageIgnore
     */
    private function isLegacyPipe($resource)
    {
        if (\PHP_VERSION_ID < 50428 || (\PHP_VERSION_ID >= 50500 && \PHP_VERSION_ID < 50512)) {
            $meta = \stream_get_meta_data($resource);

            if (isset($meta['stream_type']) && $meta['stream_type'] === 'STDIO') {
                return true;
            }
        }
        return false;
    }
}
