<?php


namespace ccxt;

require 'Exchange.php';
require '../../vendor/autoload.php';

class AsyncExchange extends Exchange {
    public $loop;
    public $client;
    public $kernel;

    public function __construct($options = array()) {
        parent::__construct($options);
        if ($this->loop === null) {
            $this->loop = \React\EventLoop\Factory::create();
        }
        $connector = new \React\Socket\Connector($this->loop, array(
            'timeout' => $this->timeout,
        ));
        if ($this->client === null) {
            $this->client = new \React\Http\Browser($this->loop, $connector);
        }
        if ($this->kernel === null) {
            $this->kernel = \Recoil\React\ReactKernel::create($this->loop);
        }
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) {
        // returns a react promise
        $headers = $headers ? $headers : array();
        $result = yield $this->client->request($method, $url, $headers, $body);
        $response_body = strval($result->getBody());
        $raw_response_headers = $result->getHeaders();
        $raw_header_keys = array_keys($raw_response_headers);
        $response_headers = array();
        foreach ($raw_header_keys as $header) {
            $response_headers[$header] = $result->getHeaderLine($header);
        }
        $http_status_code = $result->getStatusCode();
        $http_status_text = $result->getReasonPhrase();
        $json_response = $this->parse_json($response_body);
        $this->handle_errors($http_status_code, $http_status_text, $url, $method, $response_headers, $response_body, $json_response, $headers, $body);
        $this->handle_http_status_code($http_status_code, $http_status_text, $url, $method, $result);
        return $json_response ? $json_response : $response_body;
    }
}


$x = new AsyncExchange();

$x->kernel->execute(function () use ($x) {
    $r = yield $x->fetch('https://google.com');
    var_dump($r);
});

$x->kernel->run();
