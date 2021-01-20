<?php

namespace React\Stream;

use Evenement\EventEmitterInterface;

/**
 * The `ReadableStreamInterface` is responsible for providing an interface for
 * read-only streams and the readable side of duplex streams.
 *
 * Besides defining a few methods, this interface also implements the
 * `EventEmitterInterface` which allows you to react to certain events:
 *
 * data event:
 *     The `data` event will be emitted whenever some data was read/received
 *     from this source stream.
 *     The event receives a single mixed argument for incoming data.
 *
 *     ```php
 *     $stream->on('data', function ($data) {
 *         echo $data;
 *     });
 *     ```
 *
 *     This event MAY be emitted any number of times, which may be zero times if
 *     this stream does not send any data at all.
 *     It SHOULD not be emitted after an `end` or `close` event.
 *
 *     The given `$data` argument may be of mixed type, but it's usually
 *     recommended it SHOULD be a `string` value or MAY use a type that allows
 *     representation as a `string` for maximum compatibility.
 *
 *     Many common streams (such as a TCP/IP connection or a file-based stream)
 *     will emit the raw (binary) payload data that is received over the wire as
 *     chunks of `string` values.
 *
 *     Due to the stream-based nature of this, the sender may send any number
 *     of chunks with varying sizes. There are no guarantees that these chunks
 *     will be received with the exact same framing the sender intended to send.
 *     In other words, many lower-level protocols (such as TCP/IP) transfer the
 *     data in chunks that may be anywhere between single-byte values to several
 *     dozens of kilobytes. You may want to apply a higher-level protocol to
 *     these low-level data chunks in order to achieve proper message framing.
 *
 * end event:
 *     The `end` event will be emitted once the source stream has successfully
 *     reached the end of the stream (EOF).
 *
 *     ```php
 *     $stream->on('end', function () {
 *         echo 'END';
 *     });
 *     ```
 *
 *     This event SHOULD be emitted once or never at all, depending on whether
 *     a successful end was detected.
 *     It SHOULD NOT be emitted after a previous `end` or `close` event.
 *     It MUST NOT be emitted if the stream closes due to a non-successful
 *     end, such as after a previous `error` event.
 *
 *     After the stream is ended, it MUST switch to non-readable mode,
 *     see also `isReadable()`.
 *
 *     This event will only be emitted if the *end* was reached successfully,
 *     not if the stream was interrupted by an unrecoverable error or explicitly
 *     closed. Not all streams know this concept of a "successful end".
 *     Many use-cases involve detecting when the stream closes (terminates)
 *     instead, in this case you should use the `close` event.
 *     After the stream emits an `end` event, it SHOULD usually be followed by a
 *     `close` event.
 *
 *     Many common streams (such as a TCP/IP connection or a file-based stream)
 *     will emit this event if either the remote side closes the connection or
 *     a file handle was successfully read until reaching its end (EOF).
 *
 *     Note that this event should not be confused with the `end()` method.
 *     This event defines a successful end *reading* from a source stream, while
 *     the `end()` method defines *writing* a successful end to a destination
 *     stream.
 *
 * error event:
 *     The `error` event will be emitted once a fatal error occurs, usually while
 *     trying to read from this stream.
 *     The event receives a single `Exception` argument for the error instance.
 *
 *     ```php
 *     $stream->on('error', function (Exception $e) {
 *         echo 'Error: ' . $e->getMessage() . PHP_EOL;
 *     });
 *     ```
 *
 *     This event SHOULD be emitted once the stream detects a fatal error, such
 *     as a fatal transmission error or after an unexpected `data` or premature
 *     `end` event.
 *     It SHOULD NOT be emitted after a previous `error`, `end` or `close` event.
 *     It MUST NOT be emitted if this is not a fatal error condition, such as
 *     a temporary network issue that did not cause any data to be lost.
 *
 *     After the stream errors, it MUST close the stream and SHOULD thus be
 *     followed by a `close` event and then switch to non-readable mode, see
 *     also `close()` and `isReadable()`.
 *
 *     Many common streams (such as a TCP/IP connection or a file-based stream)
 *     only deal with data transmission and do not make assumption about data
 *     boundaries (such as unexpected `data` or premature `end` events).
 *     In other words, many lower-level protocols (such as TCP/IP) may choose
 *     to only emit this for a fatal transmission error once and will then
 *     close (terminate) the stream in response.
 *
 *     If this stream is a `DuplexStreamInterface`, you should also notice
 *     how the writable side of the stream also implements an `error` event.
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
 *     After the stream is closed, it MUST switch to non-readable mode,
 *     see also `isReadable()`.
 *
 *     Unlike the `end` event, this event SHOULD be emitted whenever the stream
 *     closes, irrespective of whether this happens implicitly due to an
 *     unrecoverable error or explicitly when either side closes the stream.
 *     If you only want to detect a *successful* end, you should use the `end`
 *     event instead.
 *
 *     Many common streams (such as a TCP/IP connection or a file-based stream)
 *     will likely choose to emit this event after reading a *successful* `end`
 *     event or after a fatal transmission `error` event.
 *
 *     If this stream is a `DuplexStreamInterface`, you should also notice
 *     how the writable side of the stream also implements a `close` event.
 *     In other words, after receiving this event, the stream MUST switch into
 *     non-writable AND non-readable mode, see also `isWritable()`.
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
 */
interface ReadableStreamInterface extends EventEmitterInterface
{
    /**
     * Checks whether this stream is in a readable state (not closed already).
     *
     * This method can be used to check if the stream still accepts incoming
     * data events or if it is ended or closed already.
     * Once the stream is non-readable, no further `data` or `end` events SHOULD
     * be emitted.
     *
     * ```php
     * assert($stream->isReadable() === false);
     *
     * $stream->on('data', assertNeverCalled());
     * $stream->on('end', assertNeverCalled());
     * ```
     *
     * A successfully opened stream always MUST start in readable mode.
     *
     * Once the stream ends or closes, it MUST switch to non-readable mode.
     * This can happen any time, explicitly through `close()` or
     * implicitly due to a remote close or an unrecoverable transmission error.
     * Once a stream has switched to non-readable mode, it MUST NOT transition
     * back to readable mode.
     *
     * If this stream is a `DuplexStreamInterface`, you should also notice
     * how the writable side of the stream also implements an `isWritable()`
     * method. Unless this is a half-open duplex stream, they SHOULD usually
     * have the same return value.
     *
     * @return bool
     */
    public function isReadable();

    /**
     * Pauses reading incoming data events.
     *
     * Removes the data source file descriptor from the event loop. This
     * allows you to throttle incoming data.
     *
     * Unless otherwise noted, a successfully opened stream SHOULD NOT start
     * in paused state.
     *
     * Once the stream is paused, no futher `data` or `end` events SHOULD
     * be emitted.
     *
     * ```php
     * $stream->pause();
     *
     * $stream->on('data', assertShouldNeverCalled());
     * $stream->on('end', assertShouldNeverCalled());
     * ```
     *
     * This method is advisory-only, though generally not recommended, the
     * stream MAY continue emitting `data` events.
     *
     * You can continue processing events by calling `resume()` again.
     *
     * Note that both methods can be called any number of times, in particular
     * calling `pause()` more than once SHOULD NOT have any effect.
     *
     * @see self::resume()
     * @return void
     */
    public function pause();

    /**
     * Resumes reading incoming data events.
     *
     * Re-attach the data source after a previous `pause()`.
     *
     * ```php
     * $stream->pause();
     *
     * $loop->addTimer(1.0, function () use ($stream) {
     *     $stream->resume();
     * });
     * ```
     *
     * Note that both methods can be called any number of times, in particular
     * calling `resume()` without a prior `pause()` SHOULD NOT have any effect.
     *
     * @see self::pause()
     * @return void
     */
    public function resume();

    /**
     * Pipes all the data from this readable source into the given writable destination.
     *
     * Automatically sends all incoming data to the destination.
     * Automatically throttles the source based on what the destination can handle.
     *
     * ```php
     * $source->pipe($dest);
     * ```
     *
     * Similarly, you can also pipe an instance implementing `DuplexStreamInterface`
     * into itself in order to write back all the data that is received.
     * This may be a useful feature for a TCP/IP echo service:
     *
     * ```php
     * $connection->pipe($connection);
     * ```
     *
     * This method returns the destination stream as-is, which can be used to
     * set up chains of piped streams:
     *
     * ```php
     * $source->pipe($decodeGzip)->pipe($filterBadWords)->pipe($dest);
     * ```
     *
     * By default, this will call `end()` on the destination stream once the
     * source stream emits an `end` event. This can be disabled like this:
     *
     * ```php
     * $source->pipe($dest, array('end' => false));
     * ```
     *
     * Note that this only applies to the `end` event.
     * If an `error` or explicit `close` event happens on the source stream,
     * you'll have to manually close the destination stream:
     *
     * ```php
     * $source->pipe($dest);
     * $source->on('close', function () use ($dest) {
     *     $dest->end('BYE!');
     * });
     * ```
     *
     * If the source stream is not readable (closed state), then this is a NO-OP.
     *
     * ```php
     * $source->close();
     * $source->pipe($dest); // NO-OP
     * ```
     *
     * If the destinantion stream is not writable (closed state), then this will simply
     * throttle (pause) the source stream:
     *
     * ```php
     * $dest->close();
     * $source->pipe($dest); // calls $source->pause()
     * ```
     *
     * Similarly, if the destination stream is closed while the pipe is still
     * active, it will also throttle (pause) the source stream:
     *
     * ```php
     * $source->pipe($dest);
     * $dest->close(); // calls $source->pause()
     * ```
     *
     * Once the pipe is set up successfully, the destination stream MUST emit
     * a `pipe` event with this source stream an event argument.
     *
     * @param WritableStreamInterface $dest
     * @param array $options
     * @return WritableStreamInterface $dest stream as-is
     */
    public function pipe(WritableStreamInterface $dest, array $options = array());

    /**
     * Closes the stream (forcefully).
     *
     * This method can be used to (forcefully) close the stream.
     *
     * ```php
     * $stream->close();
     * ```
     *
     * Once the stream is closed, it SHOULD emit a `close` event.
     * Note that this event SHOULD NOT be emitted more than once, in particular
     * if this method is called multiple times.
     *
     * After calling this method, the stream MUST switch into a non-readable
     * mode, see also `isReadable()`.
     * This means that no further `data` or `end` events SHOULD be emitted.
     *
     * ```php
     * $stream->close();
     * assert($stream->isReadable() === false);
     *
     * $stream->on('data', assertNeverCalled());
     * $stream->on('end', assertNeverCalled());
     * ```
     *
     * If this stream is a `DuplexStreamInterface`, you should also notice
     * how the writable side of the stream also implements a `close()` method.
     * In other words, after calling this method, the stream MUST switch into
     * non-writable AND non-readable mode, see also `isWritable()`.
     * Note that this method should not be confused with the `end()` method.
     *
     * @return void
     * @see WritableStreamInterface::close()
     */
    public function close();
}
