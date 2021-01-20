<?php

namespace React\Promise\Stream;

use Evenement\EventEmitterInterface;
use React\Promise;
use React\Promise\PromiseInterface;
use React\Stream\ReadableStreamInterface;
use React\Stream\WritableStreamInterface;

/**
 * Creates a `Promise` which resolves with the stream data buffer.
 *
 * ```php
 * $stream = accessSomeJsonStream();
 *
 * Stream\buffer($stream)->then(function ($contents) {
 *     var_dump(json_decode($contents));
 * });
 * ```
 *
 * The promise will resolve with all data chunks concatenated once the stream closes.
 *
 * The promise will resolve with an empty string if the stream is already closed.
 *
 * The promise will reject if the stream emits an error.
 *
 * The promise will reject if it is cancelled.
 *
 * The optional `$maxLength` argument defaults to no limit. In case the maximum
 * length is given and the stream emits more data before the end, the promise
 * will be rejected with an `\OverflowException`.
 *
 * ```php
 * $stream = accessSomeToLargeStream();
 *
 * Stream\buffer($stream, 1024)->then(function ($contents) {
 *     var_dump(json_decode($contents));
 * }, function ($error) {
 *     // Reaching here when the stream buffer goes above the max size,
 *     // in this example that is 1024 bytes,
 *     // or when the stream emits an error.
 * });
 * ```
 *
 * @param ReadableStreamInterface<string> $stream
 * @param ?int                            $maxLength Maximum number of bytes to buffer or null for unlimited.
 * @return PromiseInterface<string,Exception>
 */
function buffer(ReadableStreamInterface $stream, $maxLength = null)
{
    // stream already ended => resolve with empty buffer
    if (!$stream->isReadable()) {
        return Promise\resolve('');
    }

    $buffer = '';

    $promise = new Promise\Promise(function ($resolve, $reject) use ($stream, $maxLength, &$buffer, &$bufferer) {
        $bufferer = function ($data) use (&$buffer, $reject, $maxLength) {
            $buffer .= $data;

            if ($maxLength !== null && isset($buffer[$maxLength])) {
                $reject(new \OverflowException('Buffer exceeded maximum length'));
            }
        };

        $stream->on('data', $bufferer);

        $stream->on('error', function ($error) use ($reject) {
            $reject(new \RuntimeException('An error occured on the underlying stream while buffering', 0, $error));
        });

        $stream->on('close', function () use ($resolve, &$buffer) {
            $resolve($buffer);
        });
    }, function ($_, $reject) {
        $reject(new \RuntimeException('Cancelled buffering'));
    });

    return $promise->then(null, function ($error) use (&$buffer, $bufferer, $stream) {
        // promise rejected => clear buffer and buffering
        $buffer = '';
        $stream->removeListener('data', $bufferer);

        throw $error;
    });
}

/**
 * Creates a `Promise` which resolves once the given event triggers for the first time.
 *
 * ```php
 * $stream = accessSomeJsonStream();
 *
 * Stream\first($stream)->then(function ($chunk) {
 *     echo 'The first chunk arrived: ' . $chunk;
 * });
 * ```
 *
 * The promise will resolve with whatever the first event emitted or `null` if the
 * event does not pass any data.
 * If you do not pass a custom event name, then it will wait for the first "data"
 * event and resolve with a string containing the first data chunk.
 *
 * The promise will reject if the stream emits an error – unless you're waiting for
 * the "error" event, in which case it will resolve.
 *
 * The promise will reject once the stream closes – unless you're waiting for the
 * "close" event, in which case it will resolve.
 *
 * The promise will reject if the stream is already closed.
 *
 * The promise will reject if it is cancelled.
 *
 * @param ReadableStreamInterface|WritableStreamInterface $stream
 * @param string                                          $event
 * @return PromiseInterface<mixed,Exception>
 */
function first(EventEmitterInterface $stream, $event = 'data')
{
    if ($stream instanceof ReadableStreamInterface) {
        // readable or duplex stream not readable => already closed
        // a half-open duplex stream is considered closed if its readable side is closed
        if (!$stream->isReadable()) {
            return Promise\reject(new \RuntimeException('Stream already closed'));
        }
    } elseif ($stream instanceof WritableStreamInterface) {
        // writable-only stream (not duplex) not writable => already closed
        if (!$stream->isWritable()) {
            return Promise\reject(new \RuntimeException('Stream already closed'));
        }
    }

    return new Promise\Promise(function ($resolve, $reject) use ($stream, $event, &$listener) {
        $listener = function ($data = null) use ($stream, $event, &$listener, $resolve) {
            $stream->removeListener($event, $listener);
            $resolve($data);
        };
        $stream->on($event, $listener);

        if ($event !== 'error') {
            $stream->on('error', function ($error) use ($stream, $event, $listener, $reject) {
                $stream->removeListener($event, $listener);
                $reject(new \RuntimeException('An error occured on the underlying stream while waiting for event', 0, $error));
            });
        }

        $stream->on('close', function () use ($stream, $event, $listener, $reject) {
            $stream->removeListener($event, $listener);
            $reject(new \RuntimeException('Stream closed'));
        });
    }, function ($_, $reject) use ($stream, $event, &$listener) {
        $stream->removeListener($event, $listener);
        $reject(new \RuntimeException('Operation cancelled'));
    });
}

/**
 * Creates a `Promise` which resolves with an array of all the event data.
 *
 * ```php
 * $stream = accessSomeJsonStream();
 *
 * Stream\all($stream)->then(function ($chunks) {
 *     echo 'The stream consists of ' . count($chunks) . ' chunk(s)';
 * });
 * ```
 *
 * The promise will resolve with an array of whatever all events emitted or `null` if the
 * events do not pass any data.
 * If you do not pass a custom event name, then it will wait for all the "data"
 * events and resolve with an array containing all the data chunks.
 *
 * The promise will resolve with an array once the stream closes.
 *
 * The promise will resolve with an empty array if the stream is already closed.
 *
 * The promise will reject if the stream emits an error.
 *
 * The promise will reject if it is cancelled.
 *
 * @param ReadableStreamInterface|WritableStreamInterface $stream
 * @param string                                          $event
 * @return PromiseInterface<array,Exception>
 */
function all(EventEmitterInterface $stream, $event = 'data')
{
    // stream already ended => resolve with empty buffer
    if ($stream instanceof ReadableStreamInterface) {
        // readable or duplex stream not readable => already closed
        // a half-open duplex stream is considered closed if its readable side is closed
        if (!$stream->isReadable()) {
            return Promise\resolve(array());
        }
    } elseif ($stream instanceof WritableStreamInterface) {
        // writable-only stream (not duplex) not writable => already closed
        if (!$stream->isWritable()) {
            return Promise\resolve(array());
        }
    }

    $buffer = array();
    $bufferer = function ($data = null) use (&$buffer) {
        $buffer []= $data;
    };
    $stream->on($event, $bufferer);

    $promise = new Promise\Promise(function ($resolve, $reject) use ($stream, &$buffer) {
        $stream->on('error', function ($error) use ($reject) {
            $reject(new \RuntimeException('An error occured on the underlying stream while buffering', 0, $error));
        });

        $stream->on('close', function () use ($resolve, &$buffer) {
            $resolve($buffer);
        });
    }, function ($_, $reject) {
        $reject(new \RuntimeException('Cancelled buffering'));
    });

    return $promise->then(null, function ($error) use (&$buffer, $bufferer, $stream, $event) {
        // promise rejected => clear buffer and buffering
        $buffer = array();
        $stream->removeListener($event, $bufferer);

        throw $error;
    });
}

/**
 * Unwraps a `Promise` which resolves with a `ReadableStreamInterface`.
 *
 * This function returns a readable stream instance (implementing `ReadableStreamInterface`)
 * right away which acts as a proxy for the future promise resolution.
 * Once the given Promise resolves with a `ReadableStreamInterface`, its data will
 * be piped to the output stream.
 *
 * ```php
 * //$promise = someFunctionWhichResolvesWithAStream();
 * $promise = startDownloadStream($uri);
 *
 * $stream = Stream\unwrapReadable($promise);
 *
 * $stream->on('data', function ($data) {
 *     echo $data;
 * });
 *
 * $stream->on('end', function () {
 *     echo 'DONE';
 * });
 * ```
 *
 * If the given promise is either rejected or fulfilled with anything but an
 * instance of `ReadableStreamInterface`, then the output stream will emit
 * an `error` event and close:
 *
 * ```php
 * $promise = startDownloadStream($invalidUri);
 *
 * $stream = Stream\unwrapReadable($promise);
 *
 * $stream->on('error', function (Exception $error) {
 *     echo 'Error: ' . $error->getMessage();
 * });
 * ```
 *
 * The given `$promise` SHOULD be pending, i.e. it SHOULD NOT be fulfilled or rejected
 * at the time of invoking this function.
 * If the given promise is already settled and does not resolve with an
 * instance of `ReadableStreamInterface`, then you will not be able to receive
 * the `error` event.
 *
 * You can `close()` the resulting stream at any time, which will either try to
 * `cancel()` the pending promise or try to `close()` the underlying stream.
 *
 * ```php
 * $promise = startDownloadStream($uri);
 *
 * $stream = Stream\unwrapReadable($promise);
 *
 * $loop->addTimer(2.0, function () use ($stream) {
 *     $stream->close();
 * });
 * ```
 *
 * @param PromiseInterface<ReadableStreamInterface,Exception> $promise
 * @return ReadableStreamInterface
 */
function unwrapReadable(PromiseInterface $promise)
{
    return new UnwrapReadableStream($promise);
}

/**
 * Unwraps a `Promise` which resolves with a `WritableStreamInterface`.
 *
 * This function returns a writable stream instance (implementing `WritableStreamInterface`)
 * right away which acts as a proxy for the future promise resolution.
 * Any writes to this instance will be buffered in memory for when the promise resolves.
 * Once the given Promise resolves with a `WritableStreamInterface`, any data you
 * have written to the proxy will be forwarded transparently to the inner stream.
 *
 * ```php
 * //$promise = someFunctionWhichResolvesWithAStream();
 * $promise = startUploadStream($uri);
 *
 * $stream = Stream\unwrapWritable($promise);
 *
 * $stream->write('hello');
 * $stream->end('world');
 *
 * $stream->on('close', function () {
 *     echo 'DONE';
 * });
 * ```
 *
 * If the given promise is either rejected or fulfilled with anything but an
 * instance of `WritableStreamInterface`, then the output stream will emit
 * an `error` event and close:
 *
 * ```php
 * $promise = startUploadStream($invalidUri);
 *
 * $stream = Stream\unwrapWritable($promise);
 *
 * $stream->on('error', function (Exception $error) {
 *     echo 'Error: ' . $error->getMessage();
 * });
 * ```
 *
 * The given `$promise` SHOULD be pending, i.e. it SHOULD NOT be fulfilled or rejected
 * at the time of invoking this function.
 * If the given promise is already settled and does not resolve with an
 * instance of `WritableStreamInterface`, then you will not be able to receive
 * the `error` event.
 *
 * You can `close()` the resulting stream at any time, which will either try to
 * `cancel()` the pending promise or try to `close()` the underlying stream.
 *
 * ```php
 * $promise = startUploadStream($uri);
 *
 * $stream = Stream\unwrapWritable($promise);
 *
 * $loop->addTimer(2.0, function () use ($stream) {
 *     $stream->close();
 * });
 * ```
 *
 * @param PromiseInterface<WritableStreamInterface,Exception> $promise
 * @return WritableStreamInterface
 */
function unwrapWritable(PromiseInterface $promise)
{
    return new UnwrapWritableStream($promise);
}
