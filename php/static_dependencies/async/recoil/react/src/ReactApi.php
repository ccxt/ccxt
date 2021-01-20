<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\React;

use ErrorException;
use React\EventLoop\LoopInterface;
use Recoil\Kernel\Api;
use Recoil\Kernel\ApiTrait;
use Recoil\Kernel\Strand;
use Recoil\Kernel\SystemStrand;
use RuntimeException;

/**
 * A kernel API based on the React event loop.
 */
final class ReactApi implements Api
{
    /**
     * @param LoopInterface $eventLoop The event loop.
     */
    public function __construct(
        LoopInterface $eventLoop,
        StreamQueue $streamQueue = null
    ) {
        $this->eventLoop = $eventLoop;
        $this->streamQueue = $streamQueue ?: new StreamQueue($eventLoop);
    }

    /**
     * Force the current strand to cooperate.
     *
     * @see Recoil::cooperate() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     */
    public function cooperate(SystemStrand $strand)
    {
        $this->eventLoop->futureTick(
            static function () use ($strand) {
                $strand->send();
            }
        );
    }

    /**
     * Suspend the current strand for a fixed interval.
     *
     * @see Recoil::sleep() for the full specification.
     *
     * @param SystemStrand $strand   The strand executing the API call.
     * @param float        $interval The interval to wait, in seconds.
     */
    public function sleep(SystemStrand $strand, float $interval)
    {
        if ($interval > 0) {
            $timer = $this->eventLoop->addTimer(
                $interval,
                static function () use ($strand) {
                    $strand->send();
                }
            );

            $strand->setTerminator(
                function () use ($timer) {
                    $this->eventLoop->cancelTimer($timer);
                }
            );
        } else {
            $this->eventLoop->futureTick(
                static function () use ($strand) {
                    $strand->send();
                }
            );
        }
    }

    /**
     * Execute a coroutine with a cap on execution time.
     *
     * @see Recoil::timeout() for the full specification.
     *
     * @param SystemStrand $strand    The strand executing the API call.
     * @param float        $timeout   The interval to allow for execution, in seconds.
     * @param mixed        $coroutine The coroutine to execute.
     */
    public function timeout(SystemStrand $strand, float $timeout, $coroutine)
    {
        $substrand = $strand->kernel()->execute($coroutine);
        assert($substrand instanceof SystemStrand);

        (new StrandTimeout($this->eventLoop, $timeout, $substrand))->await($strand);
    }

    /**
     * Read data from a stream.
     *
     * @see Recoil::read() for the full specification.
     *
     * @param SystemStrand $strand    The strand executing the API call.
     * @param resource     $stream    A readable stream resource.
     * @param int          $minLength The minimum number of bytes to read.
     * @param int          $maxLength The maximum number of bytes to read.
     */
    public function read(
        SystemStrand $strand,
        $stream,
        int $minLength,
        int $maxLength
    ) {
        assert($minLength >= 1, 'minimum length must be at least one');
        assert($minLength <= $maxLength, 'minimum length must not exceed maximum length');

        $buffer = '';
        $done = null;
        $done = $this->streamQueue->read(
            $stream,
            function ($stream) use (
                $strand,
                &$minLength,
                &$maxLength,
                &$done,
                &$buffer
            ) {
                $chunk = @\fread(
                    $stream,
                    $maxLength < self::MAX_READ_LENGTH
                        ? $maxLength
                        : self::MAX_READ_LENGTH
                );

                if ($chunk === false) {
                    // @codeCoverageIgnoreStart
                    $done();
                    $error = \error_get_last();
                    $strand->throw(
                        new ErrorException(
                            $error['message'],
                            $error['type'],
                            1, // severity
                            $error['file'],
                            $error['line']
                        )
                    );
                    // @codeCoverageIgnoreEnd
                } elseif ($chunk === '') {
                    $done();
                    $strand->send($buffer);
                } else {
                    $buffer .= $chunk;
                    $length = \strlen($chunk);

                    if ($length >= $minLength || $length === $maxLength) {
                        $done();
                        $strand->send($buffer);
                    } else {
                        $minLength -= $length;
                        $maxLength -= $length;
                    }
                }
            }
        );

        $strand->setTerminator($done);
    }

    /**
     * Write data to a stream.
     *
     * @see Recoil::write() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     * @param resource     $stream A writable stream resource.
     * @param string       $buffer The data to write to the stream.
     * @param int          $length The maximum number of bytes to write.
     */
    public function write(
        SystemStrand $strand,
        $stream,
        string $buffer,
        int $length = PHP_INT_MAX
    ) {
        $bufferLength = \strlen($buffer);

        if ($bufferLength < $length) {
            $length = $bufferLength;
        }

        if ($length == 0) {
            $strand->send();

            return;
        }

        $done = null;
        $done = $this->streamQueue->write(
            $stream,
            function ($stream) use (
                $strand,
                &$done,
                &$buffer,
                &$length
            ) {
                \error_clear_last();
                $bytes = @\fwrite($stream, $buffer, $length);

                // Zero is returned by fwrite() when a stream error occurs, such
                // as EPIPE. We *assume* that all of React's event loop
                // implementations only call the write callback when the stream
                // buffer is (partially) drained and hence the 0 does not
                // indicate a genuine short-write.
                //
                // Furthermore, when 0 is used to indicate an error, fwrite()
                // does not produce any PHP error, so we can not be sure what
                // exactly went wrong.
                //
                // http://php.net/manual/en/function.fwrite.php#96951
                if ($bytes === 0 || $bytes === false) {
                    // @codeCoverageIgnoreStart
                    $done();
                    $error = \error_get_last();

                    if ($error !== null) {
                        $strand->throw(
                            new ErrorException(
                                $error['message'],
                                $error['type'],
                                1, // severity
                                $error['file'],
                                $error['line']
                            )
                        );
                    } else {
                        $md = \stream_get_meta_data($stream);
                        $message = 'an unknown error has occurred writing to ' . $md['uri'];
                        if (!$md['seekable']) {
                            $message .= ', the remote end may have closed the connection';
                        }
                        $strand->throw(new RuntimeException($message));
                    }
                    // @codeCoverageIgnoreEnd
                } elseif ($bytes === $length) {
                    $done();
                    $strand->send();
                } else {
                    $length -= $bytes;
                    $buffer = \substr($buffer, $bytes);
                }
            }
        );

        $strand->setTerminator($done);
    }

    /**
     * Wait for one or more streams to become readable or writable.
     *
     * @see Recoil::select() for the full specification.
     *
     * @param SystemStrand    $strand The strand executing the API call.
     * @param array<resource> $read   The set of readable streams.
     * @param array<resource> $read   The set of writable streams.
     *
     * @return Generator|null
     */
    public function select(SystemStrand $strand, array $read, array $write)
    {
        $done = function () use ($read, $write) {
            foreach ($read as $stream) {
                $this->eventLoop->removeReadStream($stream);
            }
            foreach ($write as $stream) {
                $this->eventLoop->removeWriteStream($stream);
            }
        };

        $readFn = function ($stream) use ($done, $strand) {
            $done();
            $strand->send([[$stream], []]);
        };
        foreach ($read as $stream) {
            $this->eventLoop->addReadStream($stream, $readFn);
        }

        $writeFn = function ($stream) use ($done, $strand) {
            $done();
            $strand->send([[], [$stream]]);
        };
        foreach ($write as $stream) {
            $this->eventLoop->addWriteStream($stream, $writeFn);
        }

        $strand->setTerminator($done);
    }

    /**
     * Get the event loop.
     *
     * This is operation is NON-COOPERATIVE.
     * This operation is NON-STANDARD.
     *
     * The caller is resumed with the event loop used by this API.
     *
     * @param SystemStrand $strand The strand executing the API call.
     */
    public function eventLoop(SystemStrand $strand)
    {
        $strand->send($this->eventLoop);
    }

    use ApiTrait;

    const MAX_READ_LENGTH = 32768;

    /**
     * @var LoopInterface The event loop.
     */
    private $eventLoop;

    /**
     * @var StreamQueue The stream queue, used to control sequential access
     *                  to streams.
     */
    private $streamQueue;
}
