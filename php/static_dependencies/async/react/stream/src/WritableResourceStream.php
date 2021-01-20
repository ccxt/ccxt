<?php

namespace React\Stream;

use Evenement\EventEmitter;
use React\EventLoop\LoopInterface;

final class WritableResourceStream extends EventEmitter implements WritableStreamInterface
{
    private $stream;
    private $loop;

    /**
     * @var int
     */
    private $softLimit;

    /**
     * @var int
     */
    private $writeChunkSize;

    private $listening = false;
    private $writable = true;
    private $closed = false;
    private $data = '';

    public function __construct($stream, LoopInterface $loop, $writeBufferSoftLimit = null, $writeChunkSize = null)
    {
        if (!\is_resource($stream) || \get_resource_type($stream) !== "stream") {
            throw new \InvalidArgumentException('First parameter must be a valid stream resource');
        }

        // ensure resource is opened for writing (fopen mode must contain either of "waxc+")
        $meta = \stream_get_meta_data($stream);
        if (isset($meta['mode']) && $meta['mode'] !== '' && \strtr($meta['mode'], 'waxc+', '.....') === $meta['mode']) {
            throw new \InvalidArgumentException('Given stream resource is not opened in write mode');
        }

        // this class relies on non-blocking I/O in order to not interrupt the event loop
        // e.g. pipes on Windows do not support this: https://bugs.php.net/bug.php?id=47918
        if (\stream_set_blocking($stream, false) !== true) {
            throw new \RuntimeException('Unable to set stream resource to non-blocking mode');
        }

        $this->stream = $stream;
        $this->loop = $loop;
        $this->softLimit = ($writeBufferSoftLimit === null) ? 65536 : (int)$writeBufferSoftLimit;
        $this->writeChunkSize = ($writeChunkSize === null) ? -1 : (int)$writeChunkSize;
    }

    public function isWritable()
    {
        return $this->writable;
    }

    public function write($data)
    {
        if (!$this->writable) {
            return false;
        }

        $this->data .= $data;

        if (!$this->listening && $this->data !== '') {
            $this->listening = true;

            $this->loop->addWriteStream($this->stream, array($this, 'handleWrite'));
        }

        return !isset($this->data[$this->softLimit - 1]);
    }

    public function end($data = null)
    {
        if (null !== $data) {
            $this->write($data);
        }

        $this->writable = false;

        // close immediately if buffer is already empty
        // otherwise wait for buffer to flush first
        if ($this->data === '') {
            $this->close();
        }
    }

    public function close()
    {
        if ($this->closed) {
            return;
        }

        if ($this->listening) {
            $this->listening = false;
            $this->loop->removeWriteStream($this->stream);
        }

        $this->closed = true;
        $this->writable = false;
        $this->data = '';

        $this->emit('close');
        $this->removeAllListeners();

        if (\is_resource($this->stream)) {
            \fclose($this->stream);
        }
    }

    /** @internal */
    public function handleWrite()
    {
        $error = null;
        \set_error_handler(function ($_, $errstr) use (&$error) {
            $error = $errstr;
        });

        if ($this->writeChunkSize === -1) {
            $sent = \fwrite($this->stream, $this->data);
        } else {
            $sent = \fwrite($this->stream, $this->data, $this->writeChunkSize);
        }

        \restore_error_handler();

        // Only report errors if *nothing* could be sent and an error has been raised.
        // Ignore non-fatal warnings if *some* data could be sent.
        // Any hard (permanent) error will fail to send any data at all.
        // Sending excessive amounts of data will only flush *some* data and then
        // report a temporary error (EAGAIN) which we do not raise here in order
        // to keep the stream open for further tries to write.
        // Should this turn out to be a permanent error later, it will eventually
        // send *nothing* and we can detect this.
        if (($sent === 0 || $sent === false) && $error !== null) {
            $this->emit('error', array(new \RuntimeException('Unable to write to stream: ' . $error)));
            $this->close();

            return;
        }

        $exceeded = isset($this->data[$this->softLimit - 1]);
        $this->data = (string) \substr($this->data, $sent);

        // buffer has been above limit and is now below limit
        if ($exceeded && !isset($this->data[$this->softLimit - 1])) {
            $this->emit('drain');
        }

        // buffer is now completely empty => stop trying to write
        if ($this->data === '') {
            // stop waiting for resource to be writable
            if ($this->listening) {
                $this->loop->removeWriteStream($this->stream);
                $this->listening = false;
            }

            // buffer is end()ing and now completely empty => close buffer
            if (!$this->writable) {
                $this->close();
            }
        }
    }
}
