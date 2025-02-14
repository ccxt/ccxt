# Pawl

[![Autobahn Testsuite](https://img.shields.io/badge/Autobahn-passing-brightgreen.svg)](http://socketo.me/reports/pawl/index.html)
[![CI status](https://github.com/ratchetphp/Pawl/workflows/CI/badge.svg)](https://github.com/ratchetphp/Pawl/actions)

An asynchronous WebSocket client in PHP

#### Install via composer:
    composer require ratchet/pawl

#### Usage
Pawl as a standalone app: Connect to an echo server, send a message, display output, close connection:

```php
<?php

require __DIR__ . '/vendor/autoload.php';

\Ratchet\Client\connect('wss://echo.websocket.org:443')->then(function($conn) {
    $conn->on('message', function($msg) use ($conn) {
        echo "Received: {$msg}\n";
        $conn->close();
    });

    $conn->send('Hello World!');
}, function ($e) {
    echo "Could not connect: {$e->getMessage()}\n";
});
```

#### Classes

There are 3 primary classes to be aware of and use in Pawl:

##### Connector:

Makes HTTP requests to servers returning a promise that, if successful, will resolve to a WebSocket object.
 A connector is configured via its constructor and a request is made by invoking the class. Multiple connections can be established through a single connector. The invoke mehtod has 3 parameters:
* **$url**: String; A valid uri string (starting with ws:// or wss://) to connect to (also accepts PSR-7 Uri object)
* **$subProtocols**: Array; An optional indexed array of WebSocket sub-protocols to negotiate to the server with. The connection will fail if the client and server can not agree on one if any are provided
* **$headers**: Array; An optional associative array of additional headers requests to use when initiating the handshake. A common header to set is `Origin`

##### WebSocket:

This is the object used to interact with a WebSocket server. It has two methods: `send` and `close`.
It has two public properties: `request` and `response` which are PSR-7 objects representing the client and server side HTTP handshake headers used to establish the WebSocket connection.

##### Message:

This is the object received from a WebSocket server. It has a `__toString` method which is how most times you will want to access the data received.
If you need to do binary messaging you will most likely need to use methods on the object.

#### Example

A more in-depth example using explicit interfaces: Requesting sub-protocols, and sending custom headers while using a specific React Event Loop:
```php
<?php

require __DIR__ . '/vendor/autoload.php';

$reactConnector = new \React\Socket\Connector([
    'dns' => '8.8.8.8',
    'timeout' => 10
]);
$loop = \React\EventLoop\Loop::get();
$connector = new \Ratchet\Client\Connector($loop, $reactConnector);

$connector('ws://127.0.0.1:9000', ['protocol1', 'subprotocol2'], ['Origin' => 'http://localhost'])
->then(function(\Ratchet\Client\WebSocket $conn) {
    $conn->on('message', function(\Ratchet\RFC6455\Messaging\MessageInterface $msg) use ($conn) {
        echo "Received: {$msg}\n";
        $conn->close();
    });

    $conn->on('close', function($code = null, $reason = null) {
        echo "Connection closed ({$code} - {$reason})\n";
    });

    $conn->send('Hello World!');
}, function(\Exception $e) use ($loop) {
    echo "Could not connect: {$e->getMessage()}\n";
    $loop->stop();
});
```
