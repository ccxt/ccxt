<?php


namespace ccxt\async;

use ccxt;

// rounding mode
const TRUNCATE = ccxt\TRUNCATE;
const ROUND = ccxt\ROUND;
const ROUND_UP = ccxt\ROUND_UP;
const ROUND_DOWN = ccxt\ROUND_DOWN;

// digits counting mode
const DECIMAL_PLACES = ccxt\DECIMAL_PLACES;
const SIGNIFICANT_DIGITS = ccxt\SIGNIFICANT_DIGITS;
const TICK_SIZE = ccxt\TICK_SIZE;

// padding mode
const NO_PADDING = ccxt\NO_PADDING;
const PAD_WITH_ZERO = ccxt\PAD_WITH_ZERO;

use React;
use Recoil;

use Exception;

include 'throttle.php';

$version = '1.41.31';

class Exchange extends \ccxt\Exchange {

    const VERSION = '1.41.31';

    public static $loop;
    public static $kernel;
    public $browser;
    public $marketsLoading = null;
    public $reloadingMarkets = null;
    public $tokenBucket;
    public $throttle;

    public static function get_loop() {
        if (!static::$loop) {
            static::$loop = React\EventLoop\Factory::create();
        }
        return static::$loop;
    }

    public static function get_kernel() {
        if (!static::$kernel) {
            static::$kernel = Recoil\React\ReactKernel::create(static::get_loop());
        }
        return static::$kernel;
    }

    public static function execute_and_run($arg) {
        $kernel = static::get_kernel();
        $kernel->execute($arg);
        $kernel->run();
    }

    public function __construct($options = array()) {
        $config = $this->omit($options, array('loop', 'kernel'));
        parent::__construct($config);
        // we only want one instance of the loop and one instance of the kernel
        if (static::$loop === null) {
            if (array_key_exists('loop', $options)) {
                static::$loop = $options['loop'];
            } else {
                static::$loop = React\EventLoop\Factory::create();
            }
        } else if (array_key_exists('loop', $options)) {
            throw new Exception($this->id, ' cannot use two different loops');
        }

        if (static::$kernel === null) {
            if (array_key_exists('kernel', $options)) {
                static::$kernel = $options['kernel'];
            } else {
                static::$kernel = Recoil\React\ReactKernel::create(static::$loop);
            }
        } else if (array_key_exists('kernel', $options)) {
            throw new Exception($this->id, ' cannot use two different loops');
        }

        $connector = new React\Socket\Connector(static::$loop, array(
            'timeout' => $this->timeout,
        ));
        if ($this->browser === null) {
            $this->browser = (new React\Http\Browser(static::$loop, $connector))->withRejectErrorResponse(false);
        }
        $this->throttle = throttle($this->tokenBucket, static::$loop);
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) {

        $headers = array_merge($this->headers, $headers ? $headers : array());
        if (!$headers) {
            $headers = array();
        }

        if (strlen($this->proxy)) {
            $headers['Origin'] = $this->origin;
        }

        if ($this->userAgent) {
            if (gettype($this->userAgent) == 'string') {
                $headers['User-Agent'] = $this->userAgent;
            } elseif ((gettype($this->userAgent) == 'array') && array_key_exists('User-Agent', $this->userAgent)) {
                $headers['User-Agent'] = $this->userAgent['User-Agent'];
            }
        }

        // this name for the proxy string is deprecated
        // we should rename it to $this->cors everywhere
        $url = $this->proxy . $url;

        if ($this->verbose) {
            print_r(array('Request:', $method, $url, $headers, $body));
        }

        $this->lastRestRequestTimestamp = $this->milliseconds();

        try {
            $result = yield $this->browser->request($method, $url, $headers, $body);
        } catch (Exception $e) {
            $message = $e->getMessage();
            if (strpos($message, 'timed out') !== false) { // no way to determine this easily https://github.com/clue/reactphp-buzz/issues/146
                throw new RequestTimeout(implode(' ', array($url, $method, 28, $message))); // 28 for compatibility with CURL
            } else if (strpos($message, 'DNS query') !== false) {
                throw new ccxt\NetworkError($message);
            } else {
                throw new ccxt\ExchangeError($message);
            }
        }

        $response_body = trim(strval($result->getBody()));
        $raw_response_headers = $result->getHeaders();
        $raw_header_keys = array_keys($raw_response_headers);
        $response_headers = array();
        foreach ($raw_header_keys as $header) {
            $response_headers[$header] = $result->getHeaderLine($header);
        }
        $http_status_code = $result->getStatusCode();
        $http_status_text = $result->getReasonPhrase();

        if ($this->enableLastHttpResponse) {
            $this->last_http_response = $response_body;
        }

        if ($this->enableLastResponseHeaders) {
            $this->last_response_headers = $response_headers;
        }

        if ($this->verbose) {
            print_r(array('Response:', $method, $url, $http_status_code, $response_headers, $response_body));
        }

        $json_response = null;
        $is_json_encoded_response = $this->is_json_encoded_object($response_body);

        if ($is_json_encoded_response) {
            $json_response = $this->parse_json($response_body);
            if ($this->enableLastJsonResponse) {
                $this->last_json_response = $json_response;
            }
        }

        $this->handle_errors($http_status_code, $http_status_text, $url, $method, $response_headers, $response_body, $json_response, $headers, $body);
        $this->handle_http_status_code($http_status_code, $http_status_text, $url, $method, $response_body);

        return $json_response ? $json_response : $response_body;
    }

    public function fetch2($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null) {
        if ($this->enableRateLimit) {
            yield call_user_func($this->throttle, $this->rateLimit);
        }
        $request = $this->sign($path, $api, $method, $params, $headers, $body);
        return yield $this->fetch($request['url'], $request['method'], $request['headers'], $request['body']);
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
            $this->marketsLoading = static::$kernel->execute($this->load_markets_helper($reload, $params))->promise()->then(function ($resolved) {
                $this->reloadingMarkets = false;
                return $resolved;
            }, function ($error) {
                $this->reloadingMarkets = false;
                throw $error;
            });
        }
        return $this->marketsLoading;
    }
}
