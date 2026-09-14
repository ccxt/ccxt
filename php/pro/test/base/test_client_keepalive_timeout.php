<?php
namespace ccxt\pro;

// native php regression test, hand-written.
//
// pins the teardown half of the base keepalive: when Client::on_ping_interval
// decides the peer is dead (lastPong older than keepAlive * maxPingPongMisses)
// it must not only reject the pending futures, it must close the socket.
// before this test the timeout left the connection open: on_error rejected
// the futures and the exchange dropped the client from its registry, the next
// watch call dialed a replacement, and the abandoned socket kept receiving
// and dispatching frames into the shared caches next to the new one.
// ts/src/base/ws/Client.ts got the same fix in ccxt/ccxt#30293 and flagged
// this client (hand-written, not transpiled) as carrying the same gap.
//
// a local rfc6455 server built on the vendored react/socket + ratchet/rfc6455
// stands in for the venue so the test is offline and deterministic; keepAlive
// is small so the timer fires within the test, and lastPong is pinned in the
// past so the very first tick trips the timeout.
//
// wired into `php/pro/test/base/tests_init.php`, which is hand-written.

include_once (__DIR__.'/../../../../ccxt.php');

use React\EventLoop\Loop;
use React\Socket\SocketServer;
use React\Socket\ConnectionInterface;
use Ratchet\RFC6455\Handshake\ServerNegotiator;
use Ratchet\RFC6455\Handshake\RequestVerifier;
use Ratchet\RFC6455\Messaging\MessageBuffer;
use Ratchet\RFC6455\Messaging\CloseFrameChecker;
use Ratchet\RFC6455\Messaging\Frame;
use GuzzleHttp\Psr7\Message as Psr7Message;
use GuzzleHttp\Psr7\HttpFactory;
use ccxt\RequestTimeout;

function keepalive_check($condition, $message) {
    if (!$condition) {
        throw new \Exception('php Client keepalive timeout regression FAILED: ' . $message);
    }
}

// a one-connection websocket server: completes the opening handshake, answers
// protocol pings with pongs the way every real venue does (so a healthy client
// keeps its lastPong fresh), and records whether the client ever sent a close
// frame or ended the stream.
class KeepAliveProbeServer {
    public $socket;
    public $url;
    public $handshakes = 0;
    public $pings = 0;
    public $closeFrames = 0;
    public $streamClosed = 0;
    public $connection = null;

    public function __construct() {
        $this->socket = new SocketServer('127.0.0.1:0');
        $address = $this->socket->getAddress(); // tcp://127.0.0.1:PORT
        $this->url = 'ws://' . substr($address, strlen('tcp://'));
        $this->socket->on('connection', function (ConnectionInterface $conn) {
            $this->connection = $conn;
            $negotiator = new ServerNegotiator(new RequestVerifier(), new HttpFactory());
            $buffer = '';
            $handshaken = false;
            $streamer = null;
            $conn->on('data', function ($data) use ($conn, $negotiator, &$buffer, &$handshaken, &$streamer) {
                if ($handshaken) {
                    $streamer->onData($data);
                    return;
                }
                $buffer .= $data;
                if (strpos($buffer, "\r\n\r\n") === false) {
                    return;
                }
                $request = Psr7Message::parseRequest($buffer);
                $response = $negotiator->handshake($request);
                $conn->write(Psr7Message::toString($response));
                $handshaken = true;
                $this->handshakes += 1;
                $streamer = new MessageBuffer(
                    new CloseFrameChecker(),
                    function ($message) { /* the probe never sends data frames */ },
                    function ($frame) use ($conn) {
                        if ($frame->getOpcode() === Frame::OP_PING) {
                            $this->pings += 1;
                            $conn->write((new Frame($frame->getPayload(), true, Frame::OP_PONG))->getContents());
                        } else if ($frame->getOpcode() === Frame::OP_CLOSE) {
                            $this->closeFrames += 1;
                            // answer the close so the client's stream can end cleanly
                            $conn->end((new Frame($frame->getPayload(), true, Frame::OP_CLOSE))->getContents());
                        }
                    },
                    true // frames from a client are masked
                );
            });
            $conn->on('close', function () {
                $this->streamClosed += 1;
            });
        });
    }

    public function stop() {
        if ($this->connection !== null) {
            $this->connection->close();
        }
        $this->socket->close();
    }
}

function run_loop_for($seconds) {
    $done = false;
    Loop::addTimer($seconds, function () use (&$done) { $done = true; });
    while (!$done) {
        // one iteration at a time so the timer above can stop the run without
        // Loop::stop() tearing down other tests' work on the shared loop
        Loop::futureTick(function () { Loop::stop(); });
        Loop::run();
    }
}

function test_ws_client_keepalive_timeout_closes_the_socket() {
    $server = new KeepAliveProbeServer();
    $errors = array();
    $closes = array();
    $noop = function () {};
    $client = new Client(
        $server->url,
        $noop,
        function ($c, $e) use (&$errors) { $errors[] = $e; },
        function ($c, $m) use (&$closes) { $closes[] = $m; },
        $noop,
        array('keepAlive' => 50, 'maxPingPongMisses' => 2, 'connectionTimeout' => 5000)
    );
    $client->set_ws_connector(); // what ClientTrait::client() does before the first connect
    $connected = false;
    $client->connect()->then(function () use (&$connected) { $connected = true; });
    run_loop_for(0.5);
    keepalive_check($connected, 'precondition: the client must connect to the local server');
    keepalive_check($server->handshakes === 1, 'precondition: the server must have completed one handshake');
    keepalive_check($client->connection !== null, 'precondition: the client must hold a connection');
    keepalive_check(count($errors) === 0, 'precondition: a socket whose pings are answered must not have errored, got ' . count($errors));
    keepalive_check($server->pings > 0, 'precondition: the client must have pinged and the server answered');
    // pin liveness in the past so the next keepalive tick trips the timeout
    $client->lastPong = $client->milliseconds() - $client->keepAlive * $client->maxPingPongMisses - 1000;
    $rejectedWith = null;
    $client->future('probe')->then(null, function ($e) use (&$rejectedWith) { $rejectedWith = $e; });
    // wait past one keepAlive tick plus the close round-trip
    run_loop_for(0.5);
    keepalive_check($rejectedWith instanceof RequestTimeout, 'the pending future must be rejected with RequestTimeout, got ' . (is_object($rejectedWith) ? get_class($rejectedWith) : var_export($rejectedWith, true)));
    keepalive_check(count($errors) === 1 && $errors[0] instanceof RequestTimeout, 'on_error must be raised exactly once with the RequestTimeout, got ' . count($errors));
    keepalive_check($server->closeFrames === 1, 'the server must receive exactly one close frame after the keepalive timeout, got ' . $server->closeFrames);
    keepalive_check($server->streamClosed === 1, 'the server side must see the connection end, got ' . $server->streamClosed);
    // the keepalive scheduler must be cleared on teardown: no further ping or
    // error may come out of the torn-down client
    $pingsAtTeardown = $server->pings;
    run_loop_for(0.3);
    keepalive_check($server->pings === $pingsAtTeardown, 'the keepalive scheduler must be cleared on teardown, saw more pings');
    keepalive_check(count($errors) === 1, 'no further error may be raised by a torn-down client, got ' . count($errors));
    $server->stop();
}

function test_ws_client_keepalive_healthy_pong_keeps_the_socket() {
    // the guard: a socket whose peer answers pings must not be closed by the
    // same tick
    $server = new KeepAliveProbeServer();
    $errors = array();
    $noop = function () {};
    $client = new Client(
        $server->url,
        $noop,
        function ($c, $e) use (&$errors) { $errors[] = $e; },
        $noop,
        $noop,
        array('keepAlive' => 50, 'maxPingPongMisses' => 2, 'connectionTimeout' => 5000)
    );
    $client->set_ws_connector();
    $client->connect();
    run_loop_for(0.3);
    keepalive_check($server->handshakes === 1, 'precondition: the server must have completed one handshake');
    run_loop_for(0.5);
    keepalive_check($server->pings >= 5, 'the client must keep pinging across the window, got ' . $server->pings);
    keepalive_check(count($errors) === 0, 'a socket whose peer answers pings must stay open across several keepalive ticks, got ' . count($errors) . ' error(s)');
    keepalive_check($server->closeFrames === 0, 'no close frame may be sent to a healthy peer, got ' . $server->closeFrames);
    keepalive_check($client->error === null, 'no error must be recorded on a healthy socket');
    $client->close();
    run_loop_for(0.2);
    $server->stop();
}

function test_ws_client_keepalive_timeout() {
    test_ws_client_keepalive_timeout_closes_the_socket();
    test_ws_client_keepalive_healthy_pong_keeps_the_socket();
}
