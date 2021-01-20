<?php

namespace React\Stream;

use Evenement\EventEmitterInterface;

/**
 * The `WritableStreamInterface` is responsible for providing an interface for
 * write-only streams and the writable side of duplex streams.
 *
 * Besides defining a few methods, this interface also implements the
 * `EventEmitterInterface` which allows you to react to certain events:
 *
 * drain event:
 *     The `drain` event will be emitted whenever the write buffer became full
 *     previously and is now ready to accept more data.
 *
 *     ```php
 *     $stream->on('drain', function () use ($stream) {
 *         echo 'Stream is now ready to accept more data';
 *     });
 *     ```
 *
 *     This event SHOULD be emitted once every time the buffer became full
 *     previously and is now ready to accept more data.
 *     In other words, this event MAY be emitted any number of times, which may
 *     be zero times if the buffer never became full in the first place.
 *     This event SHOULD NOT be emitted if the buffer has not become full
 *     previously.
 *
 *     This event is mostly used internally, see also `write()` for more details.
 *
 * pipe event:
 *     The `pipe` event will be emitted whenever a readable stream is `pipe()`d
 *     into this stream.
 *     The event receives a single `ReadableStreamInterface` argument for the
 *     source stream.
 *
 *     ```php
 *     $stream->on('pipe', function (ReadableStreamInterface $source) use ($stream) {
 *         echo 'Now receiving piped data';
 *
 *         // explicitly close target if source emits an error
 *         $source->on('error', function () use ($stream) {
 *             $stream->close();
 *         });
 *     });
 *
 *     $source->pipe($stream);
 *     ```
 *
 *     This event MUST be emitted once for each readable stream that is
 *     successfully piped into this destination stream.
 *     In other words, this event MAY be emitted any number of times, which may
 *     be zero times if no stream is ever piped into this stream.
 *     This event MUST NOT be emitted if either the source is not readable
 *     (closed already) or this destination is not writable (closed already).
 *
 *     This event is mostly used internally, see also `pipe()` for more details.
 *
 * error event:
 *     The `error` event will be emitted once a fatal error occurs, usually while
 *     trying to write to this stream.
 *     The event receives a single `Exception` argument for the error instance.
 *
 *     ```php
 *     $stream->on('error', function (Exception $e) {
 *         echo 'Error: ' . $e->getMessage() . PHP_EOL;
 *     });
 *     ```
 *
 *     This event SHOULD be emitted once the stream detects a fatal error, such
 *     as a fatal transmission error.
 *     It SHOULD NOT be emitted after a previous `error` or `close` event.
 *     It MUST NOT be emitted if this is not a fatal error condition, such as
 *     a temporary network issue that did not cause any data to be lost.
 *
 *     After the stream errors, it MUST close the stream and SHOULD thus be
 *     followed by a `close` event and then switch to non-writable mode, see
 *     also `close()` and `isWritable()`.
 *
 *     Many common streams (such as a TCP/IP connection or a file-based stream)
 *     only deal with data transmission and may choose
 *     to only emit this for a fatal transmission error once and will then
 *     close (terminate) the stream in response.
 *
 *     If this stream is a `DuplexStreamInterface`, you should also notice
 *     how the readable side of the stream also implements an `error` event.
 *     In other words, an error may occur while either reading or writing the
 *     stream which should result in the same error processing.
 *
 * close event:
 *     The `close` event will be emitted once the stream closes (terminates).
 *
 *     ```php
 *     $stream->on('close', function () {
 *         echo 'CLOSED';
 *     });
 *     ```
 *
 *     This event SHOULD be emitted once or never at all, depending on whether
 *     the stream ever terminates.
 *     It SHOULD NOT be emitted after a previous `close` event.
 *
 *     After the stream is closed, it MUST switch to non-writable mode,
 *     see also `isWritable()`.
 *
 *     This event SHOULD be emitted whenever the stream closes, irrespective of
 *     whether this happens implicitly due to an unrecoverable error or
 *     explicitly when either side closes the stream.
 *
 *     Many common streams (such as a TCP/IP connection or a file-based stream)
 *     will likely choose to emit this event after flushing the buffer from
 *     the `end()` method, after receiving a *successful* `end` event or after
 *     a fatal transmission `error` event.
 *
 *     If this stream is a `DuplexStreamInterface`, you should also notice
 *     how the readable side of the stream also implements a `close` event.
 *     In other words, after receiving this event, the stream MUST switch into
 *     non-writable AND non-readable mode, see also `isReadable()`.
 *     Note that this event should not be confused with the `end` event.
 *
 * The event callback functions MUST be a valid `callable` that obeys strict
 * parameter definitions and MUST accept event parameters exactly as documented.
 * The event callback functions MUST NOT throw an `Exception`.
 * The return value of the event callback functions will be ignored and has no
 * effect, so for performance reasons you're recommended to not return any
 * excessive data structures.
 *
 * Every implementation of this interface MUST follow these event semantics in
 * order to be considered a well-behaving stream.
 *
 * > Note that higher-level implementations of this interface may choose to
 *   define additional events with dedicated semantics not defined as part of
 *   this low-level stream specification. Conformance with these event semantics
 *   is out of scope for this interface, so you may also have to refer to the
 *   documentation of such a higher-level implementation.
 *
 * @see EventEmitterInterface
 * @see DuplexStreamInterface
 */
interface WritableStreamInterface extends EventEmitterInterface
{
    /**
     * Checks whether this stream is in a writable state (not closed already).
     *
     * This method can be used to check if the stream still accepts writing
     * any data or if it is ended or closed already.
     * Writing any data to a non-writable stream is a NO-OP:
     *
     * ```php
     * assert($stream->isWritable() === false);
     *
     * $stream->write('end'); // NO-OP
     * $stream->end('end'); // NO-OP
     * ```
     *
     * A successfully opened stream always MUST start in writable mode.
     *
     * Once the stream ends or closes, it MUST switch to non-writable mode.
     * This can happen any time, explicitly through `end()` or `close()` or
     * implicitly due to a remote close or an unrecoverable transmission error.
     * Once a stream has switched to non-writable mode, it MUST NOT transition
     * back to writable mode.
     *
     * If this stream is a `DuplexStreamInterface`, you should also notice
     * how the readable side of the stream also implements an `isReadable()`
     * method. Unless this is a half-open duplex stream, they SHOULD usually
     * have the same return value.
     *
     * @return bool
     */
    public function isWritable();

    /**
     * Write some data into the stream.
     *
     * A successful write MUST be confirmed with a boolean `true`, which means
     * that either the data was written (flushed) immediately or is buffered and
     * scheduled for a future write. Note that this interface gives you no
     * control over explicitly flushing the buffered data, as finding the
     * appropriate time for this is beyond the scope of this interface and left
     * up to the implementation of this interface.
     *
     * Many common streams (such as a TCP/IP connection or file-based stream)
     * may choose to buffer all given data and schedule a future flush by using
     * an underlying EventLoop to check when the resource is actually writable.
     *
     * If a stream cannot handle writing (or flushing) the data, it SHOULD emit
     * an `error` event and MAY `close()` the stream if it can not recover from
     * this error.
     *
     * If the internal buffer is full after adding `$data`, then `write()`
     * SHOULD return `false`, indicating that the caller should stop sending
     * data until the buffer drains.
     * The stream SHOULD send a `drain` event once the buffer is ready to accept
     * more data.
     *
     * Similarly, if the the stream is not writable (already in a closed state)
     * it MUST NOT process the given `$data` and SHOULD return `false`,
     * indicating that the caller should stop sending data.
     *
     * The given `$data` argument MAY be of mixed type, but it's usually
     * recommended it SHOULD be a `string` value or MAY use a type that allows
     * representation as a `string` for maximum compatibility.
     *
     * Many common streams (such as a TCP/IP connection or a file-based stream)
     * will only accept the raw (binary) payload data that is transferred over
     * the wire as chunks of `string` values.
     *
     * Due to the stream-based nature of this, the sender may send any number
     * of chunks with varying sizes. There are no guarantees that these chunks
     * will be received with the exact same framing the sender intended to send.
     * In other words, many lower-level protocols (such as TCP/IP) transfer the
     * data in chunks that may be anywhere between single-byte values to several
     * dozens of kilobytes. You may want to apply a higher-level protocol to
     * these low-level data chunks in order to achieve proper message framing.
     *
     * @param mixed|string $data
     * @return bool
     */
    public function write($data);

    /**
     * Successfully ends the stream (after optionally sending some final data).
     *
     * This method can be used to successfully end the stream, i.e. close
     * the stream after sending out all data that is currently buffered.
     *
     * ```php
     * $stream->write('hello');
     * $stream->write('world');
     * $stream->end();
     * ```
     *
     * If there's no data currently buffered and nothing to be flushed, then
     * this method MAY `close()` the stream immediately.
     *
     * If there's still data in the buffer that needs to be flushed first, then
     * this method SHOULD try to write out this data and only then `close()`
     * the stream.
     * Once the stream is closed, it SHOULD emit a `close` event.
     *
     * Note that this interface gives you no control over explicitly flushing
     * the buffered data, as finding the appropriate time for this is beyond the
     * scope of this interface and left up to the implementation of this
     * interface.
     *
     * Many common streams (such as a TCP/IP connection or file-based stream)
     * may choose to buffer all given data and schedule a future flush by using
     * an underlying EventLoop to check when the resource is actually writable.
     *
     * You can optionally pass some final data that is written to the stream
     * before ending the stream. If a non-`null` value is given as `$data`, then
     * this method will behave just like calling `write($data)` before ending
     * with no data.
     *
     * ```php
     * // shorter version
     * $stream->end('bye');
     *
     * // same as longer version
     * $stream->write('bye');
     * $stream->end();
     * ```
     *
     * After calling this method, the stream MUST switch into a non-writable
     * mode, see also `isWritable()`.
     * This means that no further writes are possible, so any additional
     * `write()` or `end()` calls have no effect.
     *
     * ```php
     * $stream->end();
     * assert($stream->isWritable() === false);
     *
     * $stream->write('nope'); // NO-OP
     * $stream->end(); // NO-OP
     * ```
     *
     * If this stream is a `DuplexStreamInterface`, calling this method SHOULD
     * also end its readable side, unless the stream supports half-open mode.
     * In other words, after calling this method, these streams SHOULD switch
     * into non-writable AND non-readable mode, see also `isReadable()`.
     * This implies that in this case, the stream SHOULD NOT emit any `data`
     * or `end` events anymore.
     * Streams MAY choose to use the `pause()` method logic for this, but
     * special care may have to be taken to ensure a following call to the
     * `resume()` method SHOULD NOT continue emitting readable events.
     *
     * Note that this method should not be confused with the `close()` method.
     *
     * @param mixed|string|null $data
     * @return void
     */
    public function end($data = null);

    /**
     * Closes the stream (forcefully).
     *
     * This method can be used to forcefully close the stream, i.e. close
     * the stream without waiting for any buffered data to be flushed.
     * If there's still data in the buffer, this data SHOULD be discarded.
     *
     * ```php
     * $stream->close();
     * ```
     *
     * Once the stream is closed, it SHOULD emit a `close` event.
     * Note that this event SHOULD NOT be emitted more than once, in particular
     * if this method is called multiple times.
     *
     * After calling this method, the stream MUST switch into a non-writable
     * mode, see also `isWritable()`.
     * This means that no further writes are possible, so any additional
     * `write()` or `end()` calls have no effect.
     *
     * ```php
     * $stream->close();
     * assert($stream->isWritable() === false);
     *
     * $stream->write('nope'); // NO-OP
     * $stream->end(); // NO-OP
     * ```
     *
     * Note that this method should not be confused with the `end()` method.
     * Unlike the `end()` method, this method does not take care of any existing
     * buffers and simply discards any buffer contents.
     * Likewise, this method may also be called after calling `end()` on a
     * stream in order to stop waiting for the stream to flush its final data.
     *
     * ```php
     * $stream->end();
     * $loop->addTimer(1.0, function () use ($stream) {
     *     $stream->close();
     * });
     * ```
     *
     * If this stream is a `DuplexStreamInterface`, you should also notice
     * how the readable side of the stream also implements a `close()` method.
     * In other words, after calling this method, the stream MUST switch into
     * non-writable AND non-readable mode, see also `isReadable()`.
     *
     * @return void
     * @see ReadableStreamInterface::close()
     */
    public function close();
}
