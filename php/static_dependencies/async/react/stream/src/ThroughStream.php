<?php

namespace React\Stream;

use Evenement\EventEmitter;
use InvalidArgumentException;

/**
 * The `ThroughStream` implements the
 * [`DuplexStreamInterface`](#duplexstreaminterface) and will simply pass any data
 * you write to it through to its readable end.
 *
 * ```php
 * $through = new ThroughStream();
 * $through->on('data', $this->expectCallableOnceWith('hello'));
 *
 * $through->write('hello');
 * ```
 *
 * Similarly, the [`end()` method](#end) will end the stream and emit an
 * [`end` event](#end-event) and then [`close()`](#close-1) the stream.
 * The [`close()` method](#close-1) will close the stream and emit a
 * [`close` event](#close-event).
 * Accordingly, this is can also be used in a [`pipe()`](#pipe) context like this:
 *
 * ```php
 * $through = new ThroughStream();
 * $source->pipe($through)->pipe($dest);
 * ```
 *
 * Optionally, its constructor accepts any callable function which will then be
 * used to *filter* any data written to it. This function receives a single data
 * argument as passed to the writable side and must return the data as it will be
 * passed to its readable end:
 *
 * ```php
 * $through = new ThroughStream('strtoupper');
 * $source->pipe($through)->pipe($dest);
 * ```
 *
 * Note that this class makes no assumptions about any data types. This can be
 * used to convert data, for example for transforming any structured data into
 * a newline-delimited JSON (NDJSON) stream like this:
 *
 * ```php
 * $through = new ThroughStream(function ($data) {
 *     return json_encode($data) . PHP_EOL;
 * });
 * $through->on('data', $this->expectCallableOnceWith("[2, true]\n"));
 *
 * $through->write(array(2, true));
 * ```
 *
 * The callback function is allowed to throw an `Exception`. In this case,
 * the stream will emit an `error` event and then [`close()`](#close-1) the stream.
 *
 * ```php
 * $through = new ThroughStream(function ($data) {
 *     if (!is_string($data)) {
 *         throw new \UnexpectedValueException('Only strings allowed');
 *     }
 *     return $data;
 * });
 * $through->on('error', $this->expectCallableOnce()));
 * $through->on('close', $this->expectCallableOnce()));
 * $through->on('data', $this->expectCallableNever()));
 *
 * $through->write(2);
 * ```
 *
 * @see WritableStreamInterface::write()
 * @see WritableStreamInterface::end()
 * @see DuplexStreamInterface::close()
 * @see WritableStreamInterface::pipe()
 */
final class ThroughStream extends EventEmitter implements DuplexStreamInterface
{
    private $readable = true;
    private $writable = true;
    private $closed = false;
    private $paused = false;
    private $drain = false;
    private $callback;

    public function __construct($callback = null)
    {
        if ($callback !== null && !\is_callable($callback)) {
            throw new InvalidArgumentException('Invalid transformation callback given');
        }

        $this->callback = $callback;
    }

    public function pause()
    {
        $this->paused = true;
    }

    public function resume()
    {
        if ($this->drain) {
            $this->drain = false;
            $this->emit('drain');
        }
        $this->paused = false;
    }

    public function pipe(WritableStreamInterface $dest, array $options = array())
    {
        return Util::pipe($this, $dest, $options);
    }

    public function isReadable()
    {
        return $this->readable;
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

        if ($this->callback !== null) {
            try {
                $data = \call_user_func($this->callback, $data);
            } catch (\Exception $e) {
                $this->emit('error', array($e));
                $this->close();

                return false;
            }
        }

        $this->emit('data', array($data));

        if ($this->paused) {
            $this->drain = true;
            return false;
        }

        return true;
    }

    public function end($data = null)
    {
        if (!$this->writable) {
            return;
        }

        if (null !== $data) {
            $this->write($data);

            // return if write() already caused the stream to close
            if (!$this->writable) {
                return;
            }
        }

        $this->readable = false;
        $this->writable = false;
        $this->paused = true;
        $this->drain = false;

        $this->emit('end');
        $this->close();
    }

    public function close()
    {
        if ($this->closed) {
            return;
        }

        $this->readable = false;
        $this->writable = false;
        $this->closed = true;
        $this->paused = true;
        $this->drain = false;
        $this->callback = null;

        $this->emit('close');
        $this->removeAllListeners();
    }
}
