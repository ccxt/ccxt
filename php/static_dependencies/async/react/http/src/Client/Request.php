<?php

namespace React\Http\Client;

use Evenement\EventEmitter;
use React\Promise;
use React\Socket\ConnectionInterface;
use React\Socket\ConnectorInterface;
use React\Stream\WritableStreamInterface;
use RingCentral\Psr7 as gPsr;

/**
 * @event response
 * @event drain
 * @event error
 * @event end
 * @internal
 */
class Request extends EventEmitter implements WritableStreamInterface
{
    const STATE_INIT = 0;
    const STATE_WRITING_HEAD = 1;
    const STATE_HEAD_WRITTEN = 2;
    const STATE_END = 3;

    private $connector;
    private $requestData;

    private $stream;
    private $buffer;
    private $responseFactory;
    private $state = self::STATE_INIT;
    private $ended = false;

    private $pendingWrites = '';

    public function __construct(ConnectorInterface $connector, RequestData $requestData)
    {
        $this->connector = $connector;
        $this->requestData = $requestData;
    }

    public function isWritable()
    {
        return self::STATE_END > $this->state && !$this->ended;
    }

    private function writeHead()
    {
        $this->state = self::STATE_WRITING_HEAD;

        $requestData = $this->requestData;
        $streamRef = &$this->stream;
        $stateRef = &$this->state;
        $pendingWrites = &$this->pendingWrites;
        $that = $this;

        $promise = $this->connect();
        $promise->then(
            function (ConnectionInterface $stream) use ($requestData, &$streamRef, &$stateRef, &$pendingWrites, $that) {
                $streamRef = $stream;

                $stream->on('drain', array($that, 'handleDrain'));
                $stream->on('data', array($that, 'handleData'));
                $stream->on('end', array($that, 'handleEnd'));
                $stream->on('error', array($that, 'handleError'));
                $stream->on('close', array($that, 'handleClose'));

                $headers = (string) $requestData;

                $more = $stream->write($headers . $pendingWrites);

                $stateRef = Request::STATE_HEAD_WRITTEN;

                // clear pending writes if non-empty
                if ($pendingWrites !== '') {
                    $pendingWrites = '';

                    if ($more) {
                        $that->emit('drain');
                    }
                }
            },
            array($this, 'closeError')
        );

        $this->on('close', function() use ($promise) {
            $promise->cancel();
        });
    }

    public function write($data)
    {
        if (!$this->isWritable()) {
            return false;
        }

        // write directly to connection stream if already available
        if (self::STATE_HEAD_WRITTEN <= $this->state) {
            return $this->stream->write($data);
        }

        // otherwise buffer and try to establish connection
        $this->pendingWrites .= $data;
        if (self::STATE_WRITING_HEAD > $this->state) {
            $this->writeHead();
        }

        return false;
    }

    public function end($data = null)
    {
        if (!$this->isWritable()) {
            return;
        }

        if (null !== $data) {
            $this->write($data);
        } else if (self::STATE_WRITING_HEAD > $this->state) {
            $this->writeHead();
        }

        $this->ended = true;
    }

    /** @internal */
    public function handleDrain()
    {
        $this->emit('drain');
    }

    /** @internal */
    public function handleData($data)
    {
        $this->buffer .= $data;

        // buffer until double CRLF (or double LF for compatibility with legacy servers)
        if (false !== strpos($this->buffer, "\r\n\r\n") || false !== strpos($this->buffer, "\n\n")) {
            try {
                $response = gPsr\parse_response($this->buffer);
                $bodyChunk = (string) $response->getBody();
            } catch (\InvalidArgumentException $exception) {
                $this->emit('error', array($exception));
            }

            $this->buffer = null;

            $this->stream->removeListener('drain', array($this, 'handleDrain'));
            $this->stream->removeListener('data', array($this, 'handleData'));
            $this->stream->removeListener('end', array($this, 'handleEnd'));
            $this->stream->removeListener('error', array($this, 'handleError'));
            $this->stream->removeListener('close', array($this, 'handleClose'));

            if (!isset($response)) {
                return;
            }

            $this->stream->on('close', array($this, 'handleClose'));

            $this->emit('response', array($response, $this->stream));

            $this->stream->emit('data', array($bodyChunk));
        }
    }

    /** @internal */
    public function handleEnd()
    {
        $this->closeError(new \RuntimeException(
            "Connection ended before receiving response"
        ));
    }

    /** @internal */
    public function handleError(\Exception $error)
    {
        $this->closeError(new \RuntimeException(
            "An error occurred in the underlying stream",
            0,
            $error
        ));
    }

    /** @internal */
    public function handleClose()
    {
        $this->close();
    }

    /** @internal */
    public function closeError(\Exception $error)
    {
        if (self::STATE_END <= $this->state) {
            return;
        }
        $this->emit('error', array($error));
        $this->close();
    }

    public function close()
    {
        if (self::STATE_END <= $this->state) {
            return;
        }

        $this->state = self::STATE_END;
        $this->pendingWrites = '';

        if ($this->stream) {
            $this->stream->close();
        }

        $this->emit('close');
        $this->removeAllListeners();
    }

    protected function connect()
    {
        $scheme = $this->requestData->getScheme();
        if ($scheme !== 'https' && $scheme !== 'http') {
            return Promise\reject(
                new \InvalidArgumentException('Invalid request URL given')
            );
        }

        $host = $this->requestData->getHost();
        $port = $this->requestData->getPort();

        if ($scheme === 'https') {
            $host = 'tls://' . $host;
        }

        return $this->connector
            ->connect($host . ':' . $port);
    }
}
