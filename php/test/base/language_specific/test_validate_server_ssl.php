<?php
namespace ccxt;

// hand-written php-only test: validateServerSsl = false must let sync REST (curl), async REST
// (react/http) and WS (ratchet/pawl) connect to a server whose certificate is self-signed, expired
// and issued for another hostname. by default async REST and WS must reject it, sync curl keeps
// its legacy lax peer check (validateClientSsl) but still verifies the hostname, so it fails too.
// the shared server lives in ts/src/test/static/ssl/server.cjs

use React\EventLoop\Loop;
use React\Promise\Deferred;

function validate_server_ssl_check($condition, $message) {
    if (!$condition) {
        throw new \Exception('validateServerSsl test FAILED: ' . $message);
    }
}

function validate_server_ssl_start_server() {
    $script = __DIR__ . '/../../../../ts/src/test/static/ssl/server.cjs';
    $pipes = array();
    $process = proc_open(array('node', $script), array(0 => array('pipe', 'r'), 1 => array('pipe', 'w')), $pipes);
    validate_server_ssl_check(is_resource($process), 'could not start the ssl test server');
    $port = intval(trim(fgets($pipes[1])));
    validate_server_ssl_check($port > 0, 'the ssl test server did not report its port');
    return array($process, $pipes, $port);
}

function validate_server_ssl_stop_server($process, $pipes) {
    foreach ($pipes as $pipe) {
        fclose($pipe);
    }
    proc_terminate($process);
    proc_close($process);
}

function validate_server_ssl_sync_rest($url, $config) {
    $exchange = new \ccxt\Exchange($config);
    return $exchange->fetch($url);
}

function validate_server_ssl_async_rest($url, $config) {
    $exchange = new \ccxt\async\Exchange($config);
    try {
        return \React\Async\await($exchange->fetch($url));
    } finally {
        $exchange->close();
    }
}

function validate_server_ssl_ws($url, $config) {
    $deferred = new Deferred();
    $exchange = new class($config) extends \ccxt\async\Exchange {
        public $deferred = null;
        public function handle_message($client, $message) {
            $this->deferred->resolve($message);
        }
        public function on_error($client, $error) {
            $this->deferred->reject($error);
        }
    };
    $exchange->deferred = $deferred;
    $timer = Loop::addTimer(10, function () use ($deferred) {
        $deferred->reject(new \Exception('ws test timed out'));
    });
    try {
        $client = $exchange->client($url);
        $client->connect();
        return \React\Async\await($deferred->promise());
    } finally {
        Loop::cancelTimer($timer);
        $exchange->close();
    }
}

function validate_server_ssl_fails($callable) {
    try {
        $callable();
    } catch (\ccxt\NetworkError $e) {
        return true;
    }
    return false;
}

function test_validate_server_ssl() {
    list($process, $pipes, $port) = validate_server_ssl_start_server();
    $rest_url = 'https://127.0.0.1:' . $port . '/ping';
    $ws_url = 'wss://127.0.0.1:' . $port . '/ws';
    $strict = array('id' => 'ssltest', 'timeout' => 5000);
    $lax = array('id' => 'ssltest', 'timeout' => 5000, 'validateServerSsl' => false);
    try {
        $default = new \ccxt\Exchange($strict);
        validate_server_ssl_check($default->validateServerSsl === true, 'validateServerSsl must default to true');
        // sync REST
        validate_server_ssl_check(validate_server_ssl_fails(function () use ($rest_url, $strict) { validate_server_ssl_sync_rest($rest_url, $strict); }), 'sync REST must fail against an invalid certificate by default');
        validate_server_ssl_check(validate_server_ssl_sync_rest($rest_url, $lax) === array('ok' => true), 'sync REST must succeed with validateServerSsl = false');
        // async REST
        validate_server_ssl_check(validate_server_ssl_fails(function () use ($rest_url, $strict) { validate_server_ssl_async_rest($rest_url, $strict); }), 'async REST must fail against an invalid certificate by default');
        validate_server_ssl_check(validate_server_ssl_async_rest($rest_url, $lax) === array('ok' => true), 'async REST must succeed with validateServerSsl = false');
        // async REST, flag flipped after construction
        $flipped = new \ccxt\async\Exchange($strict);
        $flipped->validateServerSsl = false;
        validate_server_ssl_check(\React\Async\await($flipped->fetch($rest_url)) === array('ok' => true), 'async REST must honor validateServerSsl set after construction');
        $flipped->close();
        // WS
        validate_server_ssl_check(validate_server_ssl_fails(function () use ($ws_url, $strict) { validate_server_ssl_ws($ws_url, $strict); }), 'WS must fail against an invalid certificate by default');
        validate_server_ssl_check(validate_server_ssl_ws($ws_url, $lax) === array('ok' => true), 'WS must succeed with validateServerSsl = false');
    } finally {
        validate_server_ssl_stop_server($process, $pipes);
    }
}
