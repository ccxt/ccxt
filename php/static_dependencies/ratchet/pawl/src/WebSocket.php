<?php
namespace Ratchet\Client;
use Evenement\EventEmitterTrait;
use Evenement\EventEmitterInterface;
use React\Socket\ConnectionInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Ratchet\RFC6455\Messaging\MessageBuffer;
use Ratchet\RFC6455\Messaging\CloseFrameChecker;
use Ratchet\RFC6455\Messaging\MessageInterface;
use Ratchet\RFC6455\Messaging\FrameInterface;
use Ratchet\RFC6455\Messaging\Frame;

class WebSocket implements EventEmitterInterface {
    use EventEmitterTrait;

    /**
     * The request headers sent to establish the connection
     * @var \Psr\Http\Message\RequestInterface
     */
    public $request;

    /**
     * The response headers received from the server to establish the connection
     * @var \Psr\Http\Message\ResponseInterface
     */
    public $response;

    /**
     * @var \React\Socket\ConnectionInterface
     */
    protected $_stream;

    /**
     * @var \Closure
     */
    protected $_close;

    /**
     * WebSocket constructor.
     * @param \React\Socket\ConnectionInterface $stream
     * @param \Psr\Http\Message\ResponseInterface $response
     * @param \Psr\Http\Message\RequestInterface  $request
     * @event message
     * @event ping
     * @event pong
     * @event close
     * @event error
     */
    public function __construct(ConnectionInterface $stream, ResponseInterface $response, RequestInterface $request) {
        $this->_stream  = $stream;
        $this->response = $response;
        $this->request  = $request;

        $self = $this;
        $this->_close = function($code = null, $reason = null) use ($self) {
            static $sent = false;

            if ($sent) {
                return;
            }
            $sent = true;

            $self->emit('close', [$code, $reason, $self]);
        };

        $reusableUAException = new \UnderflowException;

        $streamer = new MessageBuffer(
            new CloseFrameChecker,
            function(MessageInterface $msg) {
                $this->emit('message', [$msg, $this]);
            },
            function(FrameInterface $frame) use (&$streamer) {
                switch ($frame->getOpcode()) {
                    case Frame::OP_CLOSE:
                        $frameContents = $frame->getPayload();

                        $reason = '';
                        $code = unpack('n', substr($frameContents, 0, 2));
                        $code = reset($code);

                        if (($frameLen = strlen($frameContents)) > 2) {
                            $reason = substr($frameContents, 2, $frameLen);
                        }

                        $closeFn = $this->_close;
                        $closeFn($code, $reason);

                        return $this->_stream->end($streamer->newFrame($frame->getPayload(), true, Frame::OP_CLOSE)->maskPayload()->getContents());
                    case Frame::OP_PING:
                        $this->emit('ping', [$frame, $this]);
                        return $this->send($streamer->newFrame($frame->getPayload(), true, Frame::OP_PONG));
                    case Frame::OP_PONG:
                        return $this->emit('pong', [$frame, $this]);
                    default:
                        return $this->close(Frame::CLOSE_PROTOCOL);
                }
            },
            false,
            function() use ($reusableUAException) {
                return $reusableUAException;
            }
        );

        $stream->on('data', [$streamer, 'onData']);

        $stream->on('close', function () {
            $close = $this->_close;
            $close(Frame::CLOSE_ABNORMAL, 'Underlying connection closed');
        });

        $stream->on('error', function($error) {
            $this->emit('error', [$error, $this]);
        });

        $stream->on('drain', function () {
            $this->emit('drain');
        });
    }

    public function send($msg) {
        if ($msg instanceof MessageInterface) {
            foreach ($msg as $frame) {
                $frame->maskPayload();
            }
        } else {
            if (!($msg instanceof Frame)) {
                $msg = new Frame($msg);
            }
            $msg->maskPayload();
        }

        return $this->_stream->write($msg->getContents());
    }

    public function close($code = 1000, $reason = '') {
        $frame = new Frame(pack('n', $code) . $reason, true, Frame::OP_CLOSE);
        $frame->maskPayload();
        $this->_stream->write($frame->getContents());

        $closeFn = $this->_close;
        $closeFn($code, $reason);

        $this->_stream->end();
    }

    public function pause()
    {
        $this->_stream->pause();
    }

    public function resume()
    {
        $this->_stream->resume();
    }
}
