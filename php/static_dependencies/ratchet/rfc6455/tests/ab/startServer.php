<?php

use GuzzleHttp\Psr7\Message;
use GuzzleHttp\Psr7\Response;
use Ratchet\RFC6455\Handshake\PermessageDeflateOptions;
use Ratchet\RFC6455\Messaging\MessageBuffer;
use Ratchet\RFC6455\Messaging\MessageInterface;
use Ratchet\RFC6455\Messaging\FrameInterface;
use Ratchet\RFC6455\Messaging\Frame;

require_once __DIR__ . "/../bootstrap.php";

$loop   = \React\EventLoop\Factory::create();

$socket = new \React\Socket\Server('0.0.0.0:9001', $loop);

$closeFrameChecker = new \Ratchet\RFC6455\Messaging\CloseFrameChecker;
$negotiator = new \Ratchet\RFC6455\Handshake\ServerNegotiator(new \Ratchet\RFC6455\Handshake\RequestVerifier, PermessageDeflateOptions::permessageDeflateSupported());

$uException = new \UnderflowException;


$socket->on('connection', function (React\Socket\ConnectionInterface $connection) use ($negotiator, $closeFrameChecker, $uException, $socket) {
    $headerComplete = false;
    $buffer = '';
    $parser = null;
    $connection->on('data', function ($data) use ($connection, &$parser, &$headerComplete, &$buffer, $negotiator, $closeFrameChecker, $uException, $socket) {
        if ($headerComplete) {
            $parser->onData($data);
            return;
        }

        $buffer .= $data;
        $parts = explode("\r\n\r\n", $buffer);
        if (count($parts) < 2) {
            return;
        }
        $headerComplete = true;
        $psrRequest = Message::parseRequest($parts[0] . "\r\n\r\n");
        $negotiatorResponse = $negotiator->handshake($psrRequest);

        $negotiatorResponse = $negotiatorResponse->withAddedHeader("Content-Length", "0");

        if ($negotiatorResponse->getStatusCode() !== 101 && $psrRequest->getUri()->getPath() === '/shutdown') {
            $connection->end(Message::toString(new Response(200, [], 'Shutting down echo server.' . PHP_EOL)));
            $socket->close();
            return;
        };

        $connection->write(Message::toString($negotiatorResponse));

        if ($negotiatorResponse->getStatusCode() !== 101) {
            $connection->end();
            return;
        }

        // there is no need to look through the client requests
        // we support any valid permessage deflate
        $deflateOptions = PermessageDeflateOptions::fromRequestOrResponse($psrRequest)[0];

        $parser = new \Ratchet\RFC6455\Messaging\MessageBuffer($closeFrameChecker,
            function (MessageInterface $message, MessageBuffer $messageBuffer) {
                $messageBuffer->sendMessage($message->getPayload(), true, $message->isBinary());
            }, function (FrameInterface $frame) use ($connection, &$parser) {
                switch ($frame->getOpCode()) {
                    case Frame::OP_CLOSE:
                        $connection->end($frame->getContents());
                        break;
                    case Frame::OP_PING:
                        $connection->write($parser->newFrame($frame->getPayload(), true, Frame::OP_PONG)->getContents());
                        break;
                }
            }, true, function () use ($uException) {
                return $uException;
            },
            null,
            null,
           [$connection, 'write'],
           $deflateOptions);

        array_shift($parts);
        $parser->onData(implode("\r\n\r\n", $parts));
    });
});

$loop->run();
