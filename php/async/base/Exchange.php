<?php


namespace ccxt\async;

use React;
use Recoil\React\ReactKernel;

use Exception;

class Exchange extends \ccxt\Exchange {
    public static $loop;
    public static $kernel;
    public $client;
    public $marketsLoading = null;
    public $reloadingMarkets = null;

    public function __construct($options = array()) {
        parent::__construct($options);
        // we only want one instance of the loop and one instance of the kernel
        if (static::$loop === null) {
            static::$loop = React\EventLoop\Factory::create();
        }
        if (static::$kernel === null) {
            static::$kernel = ReactKernel::create(static::$loop);
        }
        $connector = new React\Socket\Connector(static::$loop, array(
            'timeout' => $this->timeout,
        ));
        if ($this->client === null) {
            $this->client = new React\Http\Browser(static::$loop, $connector);
        }
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) {
        // returns a react promise
        $headers = $headers ? $headers : array();
        if ($this->verbose) {
            print_r(array('Request:', $method, $url, $headers, $body));
        }
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

        if ($this->verbose) {
            print_r(array('Response:', $method, $url, $http_status_code, $response_headers, $response_body));
        }
        $json_response = $this->parse_json($response_body);
        $this->handle_errors($http_status_code, $http_status_text, $url, $method, $response_headers, $response_body, $json_response, $headers, $body);
        $this->handle_http_status_code($http_status_code, $http_status_text, $url, $method, $result);
        return $json_response ? $json_response : $response_body;
    }

    public function load_markets_helper($reload = false, $params = array()) {
        // copied from js
        if (!$reload && $this->markets) {
            if (!$this->markets_by_id) {
                return $this->set_markets ($this->markets);
            }
            return $this->markets;
        }
        $currencies = null;
        if ($this->has['fetchCurrencies']) {
            $currencies = yield $this->fetch_currencies ();
        }
        $markets = yield $this->fetch_markets ($params);
        return $this->set_markets ($markets, $currencies);
    }

    public function load_markets($reload = false, $params = array()) {
        if (($reload && !$this->reloadingMarkets) || !$this->marketsLoading) {
            $this->reloadingMarkets = true;
            $this->marketsLoading = static::wrap_promise($this->load_markets_helper($reload, $params))->then(function ($resolved) {
                $this->reloadingMarkets = false;
                return $resolved;
            }, function ($error) {
                $this->reloadingMarkets = false;
                throw $error;
            });
        }
        return $this->marketsLoading;
    }

    public static function wrap_promise($generator) {
        return new React\Promise\Promise(function ($resolve, $reject) use ($generator) {
            static::$kernel->execute(function () use ($resolve, $reject, $generator) {
                try {
                    $result = yield $generator;
                    $resolve($result);
                } catch (Exception $e) {
                    $reject($e);
                }
            });
        });
    }
}
