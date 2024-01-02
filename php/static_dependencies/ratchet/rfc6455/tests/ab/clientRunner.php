<?php

use GuzzleHttp\Psr7\Message;
use GuzzleHttp\Psr7\Uri;
use Ratchet\RFC6455\Handshake\InvalidPermessageDeflateOptionsException;
use Ratchet\RFC6455\Handshake\PermessageDeflateOptions;
use Ratchet\RFC6455\Messaging\MessageBuffer;
use Ratchet\RFC6455\Handshake\ClientNegotiator;
use Ratchet\RFC6455\Messaging\CloseFrameChecker;
use Ratchet\RFC6455\Messaging\MessageInterface;
use React\Promise\Deferred;
use Ratchet\RFC6455\Messaging\Frame;
use React\Socket\ConnectionInterface;
use React\Socket\Connector;

require __DIR__ . '/../bootstrap.php';

define('AGENT', 'RatchetRFC/0.3');

$testServer = $argc > 1 ? $argv[1] : "127.0.0.1";

$loop = React\EventLoop\Factory::create();

$connector = new Connector($loop);

function echoStreamerFactory($conn, $permessageDeflateOptions = null)
{
    $permessageDeflateOptions = $permessageDeflateOptions ?: PermessageDeflateOptions::createDisabled();

    return new \Ratchet\RFC6455\Messaging\MessageBuffer(
        new \Ratchet\RFC6455\Messaging\CloseFrameChecker,
        function (\Ratchet\RFC6455\Messaging\MessageInterface $msg, MessageBuffer $messageBuffer) use ($conn) {
            $messageBuffer->sendMessage($msg->getPayload(), true, $msg->isBinary());
        },
        function (\Ratchet\RFC6455\Messaging\FrameInterface $frame, MessageBuffer $messageBuffer) use ($conn) {
            switch ($frame->getOpcode()) {
                case Frame::OP_PING:
                    return $conn->write((new Frame($frame->getPayload(), true, Frame::OP_PONG))->maskPayload()->getContents());
                    break;
                case Frame::OP_CLOSE:
                    return $conn->end((new Frame($frame->getPayload(), true, Frame::OP_CLOSE))->maskPayload()->getContents());
                    break;
            }
        },
        false,
        null,
        null,
        null,
        [$conn, 'write'],
        $permessageDeflateOptions
    );
}

function getTestCases() {
    global $testServer;
    global $connector;

    $deferred = new Deferred();

    $connector->connect($testServer . ':9002')->then(function (ConnectionInterface $connection) use ($deferred, $testServer) {
        $cn = new ClientNegotiator();
        $cnRequest = $cn->generateRequest(new Uri('ws://' . $testServer . ':9002/getCaseCount'));

        $rawResponse = "";
        $response = null;

        /** @var MessageBuffer $ms */
        $ms = null;

        $connection->on('data', function ($data) use ($connection, &$rawResponse, &$response, &$ms, $cn, $deferred, &$context, $cnRequest) {
            if ($response === null) {
                $rawResponse .= $data;
                $pos = strpos($rawResponse, "\r\n\r\n");
                if ($pos) {
                    $data = substr($rawResponse, $pos + 4);
                    $rawResponse = substr($rawResponse, 0, $pos + 4);
                    $response = Message::parseResponse($rawResponse);

                    if (!$cn->validateResponse($cnRequest, $response)) {
                        $connection->end();
                        $deferred->reject();
                    } else {
                        $ms = new MessageBuffer(
                            new CloseFrameChecker,
                            function (MessageInterface $msg) use ($deferred, $connection) {
                                $deferred->resolve($msg->getPayload());
                                $connection->close();
                            },
                            null,
                            false,
                            null,
                            null,
                            null,
                            function () {}
                        );
                    }
                }
            }

            // feed the message streamer
            if ($ms) {
                $ms->onData($data);
            }
        });

        $connection->write(Message::toString($cnRequest));
    });

    return $deferred->promise();
}

$cn = new \Ratchet\RFC6455\Handshake\ClientNegotiator(
    PermessageDeflateOptions::permessageDeflateSupported() ? PermessageDeflateOptions::createEnabled() : null);

function runTest($case)
{
    global $connector;
    global $testServer;
    global $cn;

    $casePath = "/runCase?case={$case}&agent=" . AGENT;

    $deferred = new Deferred();

    $connector->connect($testServer . ':9002')->then(function (ConnectionInterface $connection) use ($deferred, $casePath, $case, $testServer) {
        $cn = new ClientNegotiator(
            PermessageDeflateOptions::permessageDeflateSupported() ? PermessageDeflateOptions::createEnabled() : null);
        $cnRequest = $cn->generateRequest(new Uri('ws://' . $testServer . ':9002' . $casePath));

        $rawResponse = "";
        $response = null;

        $ms = null;

        $connection->on('data', function ($data) use ($connection, &$rawResponse, &$response, &$ms, $cn, $deferred, &$context, $cnRequest) {
            if ($response === null) {
                $rawResponse .= $data;
                $pos = strpos($rawResponse, "\r\n\r\n");
                if ($pos) {
                    $data = substr($rawResponse, $pos + 4);
                    $rawResponse = substr($rawResponse, 0, $pos + 4);
                    $response = Message::parseResponse($rawResponse);

                    if (!$cn->validateResponse($cnRequest, $response)) {
                        echo "Invalid response.\n";
                        $connection->end();
                        $deferred->reject();
                    } else {
                        try {
                            $permessageDeflateOptions = PermessageDeflateOptions::fromRequestOrResponse($response)[0];
                            $ms = echoStreamerFactory(
                                $connection,
                                $permessageDeflateOptions
                            );
                        } catch (InvalidPermessageDeflateOptionsException $e) {
                            $connection->end();
                        }
                    }
                }
            }

            // feed the message streamer
            if ($ms) {
                $ms->onData($data);
            }
        });

        $connection->on('close', function () use ($deferred) {
            $deferred->resolve();
        });

        $connection->write(Message::toString($cnRequest));
    });

    return $deferred->promise();
}

function createReport() {
    global $connector;
    global $testServer;

    $deferred = new Deferred();

    $connector->connect($testServer . ':9002')->then(function (ConnectionInterface $connection) use ($deferred, $testServer) {
        // $reportPath = "/updateReports?agent=" . AGENT . "&shutdownOnComplete=true";
        // we will stop it using docker now instead of just shutting down
        $reportPath = "/updateReports?agent=" . AGENT;
        $cn = new ClientNegotiator();
        $cnRequest = $cn->generateRequest(new Uri('ws://' . $testServer . ':9002' . $reportPath));

        $rawResponse = "";
        $response = null;

        /** @var MessageBuffer $ms */
        $ms = null;

        $connection->on('data', function ($data) use ($connection, &$rawResponse, &$response, &$ms, $cn, $deferred, &$context, $cnRequest) {
            if ($response === null) {
                $rawResponse .= $data;
                $pos = strpos($rawResponse, "\r\n\r\n");
                if ($pos) {
                    $data = substr($rawResponse, $pos + 4);
                    $rawResponse = substr($rawResponse, 0, $pos + 4);
                    $response = Message::parseResponse($rawResponse);

                    if (!$cn->validateResponse($cnRequest, $response)) {
                        $connection->end();
                        $deferred->reject();
                    } else {
                        $ms = new MessageBuffer(
                            new CloseFrameChecker,
                            function (MessageInterface $msg) use ($deferred, $connection) {
                                $deferred->resolve($msg->getPayload());
                                $connection->close();
                            },
                            null,
                            false,
                            null,
                            null,
                            null,
                            function () {}
                        );
                    }
                }
            }

            // feed the message streamer
            if ($ms) {
                $ms->onData($data);
            }
        });

        $connection->write(Message::toString($cnRequest));
    });

    return $deferred->promise();
}


$testPromises = [];

getTestCases()->then(function ($count) use ($loop) {
    $allDeferred = new Deferred();

    $runNextCase = function () use (&$i, &$runNextCase, $count, $allDeferred) {
        $i++;
        if ($i > $count) {
            $allDeferred->resolve();
            return;
        }
        echo "Running test $i/$count...";
        $startTime = microtime(true);
        runTest($i)
            ->then(function () use ($startTime) {
                echo " completed " . round((microtime(true) - $startTime) * 1000) . " ms\n";
            })
            ->then($runNextCase);
    };

    $i = 0;
    $runNextCase();

    $allDeferred->promise()->then(function () {
        createReport();
    });
});

$loop->run();
