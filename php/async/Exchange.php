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

use ccxt\Precise;
use ccxt\AuthenticationError;
use ccxt\ExchangeError;
use ccxt\ProxyError;
use ccxt\NotSupported;
use ccxt\BadSymbol;
use ccxt\ArgumentsRequired;
use ccxt\pro\ClientTrait;
use ccxt\RateLimitExceeded;
use ccxt\NullResponse;
use ccxt\InvalidAddress;
use ccxt\InvalidOrder;
use ccxt\BadResponse;
use ccxt\BadRequest;
use React\Promise;

use React;
use React\Async;
use React\EventLoop\Loop;

use Exception;

$version = '4.2.61';

class Exchange extends \ccxt\Exchange {

    const VERSION = '4.2.61';

    public $browser;
    public $marketsLoading = null;
    public $reloadingMarkets = null;
    public $tokenBucket;
    public Throttler $throttler;
    public $default_connector = null;

    public $streaming = array(
        'keepAlive' => 30000,
        'heartbeat' => true,
        'ping' => null,
        'maxPingPongMisses' => 2.0,
    );

    public $proxy_files_dir = __DIR__ . '/../static_dependencies/proxies/';

    use ClientTrait;

    public function __construct($options = array()) {
        parent::__construct($options);
        $this->default_connector = $this->create_connector();
        $this->set_request_browser($this->default_connector);
        $this->throttler = new Throttler($this->tokenBucket);
    }

    public function set_request_browser($connector) {
        $this->browser = (new React\Http\Browser($connector, Loop::get()))->withRejectErrorResponse(false);
    }

    public function create_connector ($connector_options = array()){
        $connector = new React\Socket\Connector(array_merge(array(
            'timeout' => $this->timeout,
        ), $connector_options), Loop::get());
        return $connector;
    }

    private $proxyDictionaries = [];

    public function setProxyAgents($httpProxy, $httpsProxy, $socksProxy) {
        $connection_options_for_proxy = null;
        if ($httpProxy) {
            if (!array_key_exists($httpProxy, $this->proxyDictionaries)) {
                include_once ($this->proxy_files_dir. 'reactphp-http-proxy/src/ProxyConnector.php');
                $instance = new \Clue\React\HttpProxy\ProxyConnector($httpProxy);
                $this->proxyDictionaries[$httpProxy] = ['tcp' => $instance, 'dns' => false];
            }
            $connection_options_for_proxy = $this->proxyDictionaries[$httpProxy];
        }  else if ($httpsProxy) {
            if (!array_key_exists($httpsProxy, $this->proxyDictionaries)) {
                include_once ($this->proxy_files_dir. 'reactphp-http-proxy/src/ProxyConnector.php');
                $instance = new \Clue\React\HttpProxy\ProxyConnector($httpsProxy);
                $this->proxyDictionaries[$httpsProxy] = ['tcp' => $instance, 'dns' => false];
            }
            $connection_options_for_proxy = $this->proxyDictionaries[$httpsProxy];
        } else if ($socksProxy) {
            $className = '\\Clue\\React\\Socks\\Client';
            if (!class_exists($className)) {
                throw new NotSupported($this->id . ' - to use SOCKS proxy with ccxt, at first you need install module "composer require clue/socks-react"');
            }
            if (!array_key_exists($socksProxy, $this->proxyDictionaries)) {
                $instance = new $className($socksProxy);
                $this->proxyDictionaries[$socksProxy] = ['tcp' => $instance, 'dns' => false];
            }
            $connection_options_for_proxy = $this->proxyDictionaries[$socksProxy];
        }
        if ($connection_options_for_proxy) {
            $connector = $this->create_connector($connection_options_for_proxy);
            return $connector;
        }
        return null;
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) {
        // wrap this in as a promise so it executes asynchronously
        return React\Async\async(function () use ($url, $method, $headers, $body) {

            $this->last_request_headers = $headers;

            // ##### PROXY & HEADERS #####
            $headers = array_merge($this->headers, $headers ? $headers : array());
            // proxy-url
            $proxyUrl = $this->check_proxy_url_settings($url, $method, $headers, $body);
            if ($proxyUrl !== null) {
                $headers['Origin'] = $this->origin;
                $url = $proxyUrl . $url;
            }
            // proxy agents
            [ $httpProxy, $httpsProxy, $socksProxy ] = $this->check_proxy_settings($url, $method, $headers, $body);
            $this->checkConflictingProxies($httpProxy || $httpsProxy || $socksProxy, $proxyUrl);
            $connector = $this->setProxyAgents($httpProxy, $httpsProxy, $socksProxy);
            if ($connector) {
                $this->set_request_browser($connector);
            } else {
                $this->set_request_browser($this->default_connector);
            }
            // user-agent
            $userAgent = ($this->userAgent !== null) ? $this->userAgent : $this->user_agent;
            if ($userAgent) {
                if (gettype($userAgent) === 'string') {
                    $headers = array_merge(['User-Agent' => $userAgent], $headers);
                } elseif ((gettype($userAgent) === 'array') && array_key_exists('User-Agent', $userAgent)) {
                    $headers = array_merge($userAgent, $headers);
                }
            }
            // set final headers
            $headers = $this->set_headers($headers);
            // log
            if ($this->verbose) {
                print_r(array('fetch Request:', $this->id, $method, $url, 'RequestHeaders:', $headers, 'RequestBody:', $body));
            }
            // end of proxies & headers

            $this->lastRestRequestTimestamp = $this->milliseconds();

            try {
                $body = $body ?? ''; // https://github.com/ccxt/ccxt/pull/16555
                $result = React\Async\await($this->browser->request($method, $url, $headers, $body));
            } catch (Exception $e) {
                $message = $e->getMessage();
                if (strpos($message, 'timed out') !== false) { // no way to determine this easily https://github.com/clue/reactphp-buzz/issues/146
                    throw new ccxt\RequestTimeout(implode(' ', array($url, $method, 28, $message))); // 28 for compatibility with CURL
                } else if (strpos($message, 'DNS query') !== false) {
                    throw new ccxt\NetworkError($message);
                } else {
                    throw new ccxt\NetworkError($message);
                }
            }

            $raw_response_headers = $result->getHeaders();
            $raw_header_keys = array_keys($raw_response_headers);
            $response_headers = array();
            foreach ($raw_header_keys as $header) {
                $response_headers[$header] = $result->getHeaderLine($header);
            }
            $http_status_code = $result->getStatusCode();
            $http_status_text = $result->getReasonPhrase();
            $response_body = strval($result->getBody());

            $response_body = $this->on_rest_response($http_status_code, $http_status_text, $url, $method, $response_headers, $response_body, $headers, $body);

            if ($this->enableLastHttpResponse) {
                $this->last_http_response = $response_body;
            }

            if ($this->enableLastResponseHeaders) {
                $this->last_response_headers = $response_headers;
            }

            if ($this->verbose) {
                print_r(array('fetch Response:', $this->id, $method, $url, $http_status_code, 'ResponseHeaders:', $response_headers, 'ResponseBody:', $response_body));
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

            return isset($json_response) ? $json_response : $response_body;
        }) ();
    }

    public function fetch_currencies($params = array()) {
        return React\Async\async(function () use ($params) {
            return parent::fetch_currencies($params);
        }) ();
    }

    public function load_markets_helper($reload = false, $params = array()) {
        // copied from js
        return React\Async\async(function () use ($reload, $params) {
            if (!$reload && $this->markets) {
                if (!$this->markets_by_id) {
                    return $this->set_markets ($this->markets);
                }
                return $this->markets;
            }
            $currencies = null;
            if (array_key_exists('fetchCurrencies', $this->has) && $this->has['fetchCurrencies'] === true) {
                $currencies = React\Async\await($this->fetch_currencies());
            }
            $markets = React\Async\await($this->fetch_markets($params));
            return $this->set_markets ($markets, $currencies);
        }) ();
    }

    public function loadMarkets($reload = false, $params = array()) {
        // returns a promise
        return $this->load_markets($reload, $params);
    }

    public function load_markets($reload = false, $params = array()) {
        if (($reload && !$this->reloadingMarkets) || !$this->marketsLoading) {
            $this->reloadingMarkets = true;
            $this->marketsLoading = $this->load_markets_helper($reload, $params)->then(function ($resolved) {
                $this->reloadingMarkets = false;
                return $resolved;
            }, function ($error) {
                $this->reloadingMarkets = false;
                throw $error;
            });
        }
        return $this->marketsLoading;
    }

    public function loadAccounts($reload = false, $params = array()) {
        return $this->load_accounts($reload, $params);
    }

    public function fetch_markets($params = array()) {
        return Async\async(function () use ($params) {
            return parent::fetch_markets($params);
        }) ();
    }

    public function sleep($milliseconds) {
        $time = $milliseconds / 1000;
        return new React\Promise\Promise(function ($resolve) use ($time) {
            React\EventLoop\Loop::addTimer($time, function () use ($resolve) {
                $resolve(null);
            });
        });
    }

    public function throttle($cost = null) {
        // stub so the async throttler gets called instead of the sync throttler
        return call_user_func($this->throttler, $cost);
    }

    // the ellipsis packing/unpacking requires PHP 5.6+ :(
    function spawn($method, ... $args) {
        return Async\async(function () use ($method, $args) {
            return Async\await($method(...$args));
        }) ();
    }

    function delay($timeout, $method, ... $args) {
        Loop::addTimer($timeout / 1000, function () use ($method, $args) {
            $this->spawn($method, ...$args);
        });
    }

    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########        ########################        ########################
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########                        ########                        ########
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ########        ########        ########                        ########
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ################        ########################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########        ########        ################        ################
    // ########################################################################
    // ########################################################################
    // ########################################################################
    // ########################################################################

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM JAVASCRIPT TO PYTHON AND PHP

    public function safe_bool_n($dictionaryOrList, array $keys, ?bool $defaultValue = null) {
        /**
         * @ignore
         * safely extract boolean $value from dictionary or list
         * @return array(bool | null)
         */
        $value = $this->safe_value_n($dictionaryOrList, $keys, $defaultValue);
        if (is_bool($value)) {
            return $value;
        }
        return $defaultValue;
    }

    public function safe_bool_2($dictionary, int|string $key1, int|string $key2, ?bool $defaultValue = null) {
        /**
         * @ignore
         * safely extract boolean value from $dictionary or list
         * @return array(bool | null)
         */
        return $this->safe_bool_n($dictionary, array( $key1, $key2 ), $defaultValue);
    }

    public function safe_bool($dictionary, int|string $key, ?bool $defaultValue = null) {
        /**
         * @ignore
         * safely extract boolean value from $dictionary or list
         * @return array(bool | null)
         */
        return $this->safe_bool_n($dictionary, array( $key ), $defaultValue);
    }

    public function safe_dict_n($dictionaryOrList, array $keys, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract a dictionary from dictionary or list
         * @return array(object | null)
         */
        $value = $this->safe_value_n($dictionaryOrList, $keys, $defaultValue);
        if ($value === null) {
            return $defaultValue;
        }
        if (gettype($value) === 'array') {
            return $value;
        }
        return $defaultValue;
    }

    public function safe_dict($dictionary, int|string $key, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract a $dictionary from $dictionary or list
         * @return array(object | null)
         */
        return $this->safe_dict_n($dictionary, array( $key ), $defaultValue);
    }

    public function safe_dict_2($dictionary, int|string $key1, string $key2, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract a $dictionary from $dictionary or list
         * @return array(object | null)
         */
        return $this->safe_dict_n($dictionary, array( $key1, $key2 ), $defaultValue);
    }

    public function safe_list_n($dictionaryOrList, array $keys, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract an Array from dictionary or list
         * @return array(Array | null)
         */
        $value = $this->safe_value_n($dictionaryOrList, $keys, $defaultValue);
        if ($value === null) {
            return $defaultValue;
        }
        if (gettype($value) === 'array' && array_keys($value) === array_keys(array_keys($value))) {
            return $value;
        }
        return $defaultValue;
    }

    public function safe_list_2($dictionaryOrList, int|string $key1, string $key2, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract an Array from dictionary or list
         * @return array(Array | null)
         */
        return $this->safe_list_n($dictionaryOrList, array( $key1, $key2 ), $defaultValue);
    }

    public function safe_list($dictionaryOrList, int|string $key, ?array $defaultValue = null) {
        /**
         * @ignore
         * safely extract an Array from dictionary or list
         * @return array(Array | null)
         */
        return $this->safe_list_n($dictionaryOrList, array( $key ), $defaultValue);
    }

    public function handle_deltas($orderbook, $deltas) {
        for ($i = 0; $i < count($deltas); $i++) {
            $this->handle_delta($orderbook, $deltas[$i]);
        }
    }

    public function handle_delta($bookside, $delta) {
        throw new NotSupported($this->id . ' handleDelta not supported yet');
    }

    public function get_cache_index($orderbook, $deltas) {
        // return the first index of the cache that can be applied to the $orderbook or -1 if not possible
        return -1;
    }

    public function find_timeframe($timeframe, $timeframes = null) {
        if ($timeframes === null) {
            $timeframes = $this->timeframes;
        }
        $keys = is_array($timeframes) ? array_keys($timeframes) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if ($timeframes[$key] === $timeframe) {
                return $key;
            }
        }
        return null;
    }

    public function check_proxy_url_settings(?string $url = null, ?string $method = null, $headers = null, $body = null) {
        $usedProxies = array();
        $proxyUrl = null;
        if ($this->proxyUrl !== null) {
            $usedProxies[] = 'proxyUrl';
            $proxyUrl = $this->proxyUrl;
        }
        if ($this->proxy_url !== null) {
            $usedProxies[] = 'proxy_url';
            $proxyUrl = $this->proxy_url;
        }
        if ($this->proxyUrlCallback !== null) {
            $usedProxies[] = 'proxyUrlCallback';
            $proxyUrl = $this->proxyUrlCallback ($url, $method, $headers, $body);
        }
        if ($this->proxy_url_callback !== null) {
            $usedProxies[] = 'proxy_url_callback';
            $proxyUrl = $this->proxy_url_callback ($url, $method, $headers, $body);
        }
        // backwards-compatibility
        if ($this->proxy !== null) {
            $usedProxies[] = 'proxy';
            if (is_callable($this->proxy)) {
                $proxyUrl = $this->proxy ($url, $method, $headers, $body);
            } else {
                $proxyUrl = $this->proxy;
            }
        }
        $length = count($usedProxies);
        if ($length > 1) {
            $joinedProxyNames = implode(',', $usedProxies);
            throw new ProxyError($this->id . ' you have multiple conflicting proxy settings (' . $joinedProxyNames . '), please use only one from : $proxyUrl, proxy_url, proxyUrlCallback, proxy_url_callback');
        }
        return $proxyUrl;
    }

    public function check_proxy_settings(?string $url = null, ?string $method = null, $headers = null, $body = null) {
        $usedProxies = array();
        $httpProxy = null;
        $httpsProxy = null;
        $socksProxy = null;
        // $httpProxy
        if ($this->valueIsDefined ($this->httpProxy)) {
            $usedProxies[] = 'httpProxy';
            $httpProxy = $this->httpProxy;
        }
        if ($this->valueIsDefined ($this->http_proxy)) {
            $usedProxies[] = 'http_proxy';
            $httpProxy = $this->http_proxy;
        }
        if ($this->httpProxyCallback !== null) {
            $usedProxies[] = 'httpProxyCallback';
            $httpProxy = $this->httpProxyCallback ($url, $method, $headers, $body);
        }
        if ($this->http_proxy_callback !== null) {
            $usedProxies[] = 'http_proxy_callback';
            $httpProxy = $this->http_proxy_callback ($url, $method, $headers, $body);
        }
        // $httpsProxy
        if ($this->valueIsDefined ($this->httpsProxy)) {
            $usedProxies[] = 'httpsProxy';
            $httpsProxy = $this->httpsProxy;
        }
        if ($this->valueIsDefined ($this->https_proxy)) {
            $usedProxies[] = 'https_proxy';
            $httpsProxy = $this->https_proxy;
        }
        if ($this->httpsProxyCallback !== null) {
            $usedProxies[] = 'httpsProxyCallback';
            $httpsProxy = $this->httpsProxyCallback ($url, $method, $headers, $body);
        }
        if ($this->https_proxy_callback !== null) {
            $usedProxies[] = 'https_proxy_callback';
            $httpsProxy = $this->https_proxy_callback ($url, $method, $headers, $body);
        }
        // $socksProxy
        if ($this->valueIsDefined ($this->socksProxy)) {
            $usedProxies[] = 'socksProxy';
            $socksProxy = $this->socksProxy;
        }
        if ($this->valueIsDefined ($this->socks_proxy)) {
            $usedProxies[] = 'socks_proxy';
            $socksProxy = $this->socks_proxy;
        }
        if ($this->socksProxyCallback !== null) {
            $usedProxies[] = 'socksProxyCallback';
            $socksProxy = $this->socksProxyCallback ($url, $method, $headers, $body);
        }
        if ($this->socks_proxy_callback !== null) {
            $usedProxies[] = 'socks_proxy_callback';
            $socksProxy = $this->socks_proxy_callback ($url, $method, $headers, $body);
        }
        // check
        $length = count($usedProxies);
        if ($length > 1) {
            $joinedProxyNames = implode(',', $usedProxies);
            throw new ProxyError($this->id . ' you have multiple conflicting proxy settings (' . $joinedProxyNames . '), please use only one from => $httpProxy, $httpsProxy, httpProxyCallback, httpsProxyCallback, $socksProxy, socksProxyCallback');
        }
        return array( $httpProxy, $httpsProxy, $socksProxy );
    }

    public function check_ws_proxy_settings() {
        $usedProxies = array();
        $wsProxy = null;
        $wssProxy = null;
        $wsSocksProxy = null;
        // ws proxy
        if ($this->valueIsDefined ($this->wsProxy)) {
            $usedProxies[] = 'wsProxy';
            $wsProxy = $this->wsProxy;
        }
        if ($this->valueIsDefined ($this->ws_proxy)) {
            $usedProxies[] = 'ws_proxy';
            $wsProxy = $this->ws_proxy;
        }
        // wss proxy
        if ($this->valueIsDefined ($this->wssProxy)) {
            $usedProxies[] = 'wssProxy';
            $wssProxy = $this->wssProxy;
        }
        if ($this->valueIsDefined ($this->wss_proxy)) {
            $usedProxies[] = 'wss_proxy';
            $wssProxy = $this->wss_proxy;
        }
        // ws socks proxy
        if ($this->valueIsDefined ($this->wsSocksProxy)) {
            $usedProxies[] = 'wsSocksProxy';
            $wsSocksProxy = $this->wsSocksProxy;
        }
        if ($this->valueIsDefined ($this->ws_socks_proxy)) {
            $usedProxies[] = 'ws_socks_proxy';
            $wsSocksProxy = $this->ws_socks_proxy;
        }
        // check
        $length = count($usedProxies);
        if ($length > 1) {
            $joinedProxyNames = implode(',', $usedProxies);
            throw new ProxyError($this->id . ' you have multiple conflicting proxy settings (' . $joinedProxyNames . '), please use only one from => $wsProxy, $wssProxy, wsSocksProxy');
        }
        return array( $wsProxy, $wssProxy, $wsSocksProxy );
    }

    public function check_conflicting_proxies($proxyAgentSet, $proxyUrlSet) {
        if ($proxyAgentSet && $proxyUrlSet) {
            throw new ProxyError($this->id . ' you have multiple conflicting proxy settings, please use only one from : proxyUrl, httpProxy, httpsProxy, socksProxy');
        }
    }

    public function find_message_hashes($client, string $element) {
        $result = array();
        $messageHashes = is_array($client->futures) ? array_keys($client->futures) : array();
        for ($i = 0; $i < count($messageHashes); $i++) {
            $messageHash = $messageHashes[$i];
            if (mb_strpos($messageHash, $element) !== false) {
                $result[] = $messageHash;
            }
        }
        return $result;
    }

    public function filter_by_limit(mixed $array, ?int $limit = null, int|string $key = 'timestamp', bool $fromStart = false) {
        if ($this->valueIsDefined ($limit)) {
            $arrayLength = count($array);
            if ($arrayLength > 0) {
                $ascending = true;
                if ((is_array($array[0]) && array_key_exists($key, $array[0]))) {
                    $first = $array[0][$key];
                    $last = $array[$arrayLength - 1][$key];
                    if ($first !== null && $last !== null) {
                        $ascending = $first <= $last;  // true if $array is sorted in $ascending order based on 'timestamp'
                    }
                }
                if ($fromStart) {
                    if ($limit > $arrayLength) {
                        $limit = $arrayLength;
                    }
                    $array = $ascending ? $this->arraySlice ($array, 0, $limit) : $this->arraySlice ($array, -$limit);
                } else {
                    $array = $ascending ? $this->arraySlice ($array, -$limit) : $this->arraySlice ($array, 0, $limit);
                }
            }
        }
        return $array;
    }

    public function filter_by_since_limit(mixed $array, ?int $since = null, ?int $limit = null, int|string $key = 'timestamp', $tail = false) {
        $sinceIsDefined = $this->valueIsDefined ($since);
        $parsedArray = $this->to_array($array);
        $result = $parsedArray;
        if ($sinceIsDefined) {
            $result = [ ];
            for ($i = 0; $i < count($parsedArray); $i++) {
                $entry = $parsedArray[$i];
                $value = $this->safe_value($entry, $key);
                if ($value && ($value >= $since)) {
                    $result[] = $entry;
                }
            }
        }
        if ($tail && $limit !== null) {
            return $this->arraySlice ($result, -$limit);
        }
        // if the user provided a 'since' argument
        // we want to $limit the $result starting from the 'since'
        $shouldFilterFromStart = !$tail && $sinceIsDefined;
        return $this->filter_by_limit($result, $limit, $key, $shouldFilterFromStart);
    }

    public function filter_by_value_since_limit(mixed $array, int|string $field, $value = null, ?int $since = null, ?int $limit = null, $key = 'timestamp', $tail = false) {
        $valueIsDefined = $this->valueIsDefined ($value);
        $sinceIsDefined = $this->valueIsDefined ($since);
        $parsedArray = $this->to_array($array);
        $result = $parsedArray;
        // single-pass filter for both symbol and $since
        if ($valueIsDefined || $sinceIsDefined) {
            $result = [ ];
            for ($i = 0; $i < count($parsedArray); $i++) {
                $entry = $parsedArray[$i];
                $entryFiledEqualValue = $entry[$field] === $value;
                $firstCondition = $valueIsDefined ? $entryFiledEqualValue : true;
                $entryKeyValue = $this->safe_value($entry, $key);
                $entryKeyGESince = ($entryKeyValue) && $since && ($entryKeyValue >= $since);
                $secondCondition = $sinceIsDefined ? $entryKeyGESince : true;
                if ($firstCondition && $secondCondition) {
                    $result[] = $entry;
                }
            }
        }
        if ($tail && $limit !== null) {
            return $this->arraySlice ($result, -$limit);
        }
        return $this->filter_by_limit($result, $limit, $key, $sinceIsDefined);
    }

    public function set_sandbox_mode(bool $enabled) {
        if ($enabled) {
            if (is_array($this->urls) && array_key_exists('test', $this->urls)) {
                if (gettype($this->urls['api']) === 'string') {
                    $this->urls['apiBackup'] = $this->urls['api'];
                    $this->urls['api'] = $this->urls['test'];
                } else {
                    $this->urls['apiBackup'] = $this->clone ($this->urls['api']);
                    $this->urls['api'] = $this->clone ($this->urls['test']);
                }
            } else {
                throw new NotSupported($this->id . ' does not have a sandbox URL');
            }
        } elseif (is_array($this->urls) && array_key_exists('apiBackup', $this->urls)) {
            if (gettype($this->urls['api']) === 'string') {
                $this->urls['api'] = $this->urls['apiBackup'];
            } else {
                $this->urls['api'] = $this->clone ($this->urls['apiBackup']);
            }
            $newUrls = $this->omit ($this->urls, 'apiBackup');
            $this->urls = $newUrls;
        }
    }

    public function sign($path, mixed $api = 'public', $method = 'GET', $params = array (), mixed $headers = null, mixed $body = null) {
        return array();
    }

    public function fetch_accounts($params = array ()) {
        throw new NotSupported($this->id . ' fetchAccounts() is not supported yet');
    }

    public function fetch_trades(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTrades() is not supported yet');
    }

    public function fetch_trades_ws(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTradesWs() is not supported yet');
    }

    public function watch_trades(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchTrades() is not supported yet');
    }

    public function watch_trades_for_symbols(array $symbols, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchTradesForSymbols() is not supported yet');
    }

    public function watch_my_trades_for_symbols(array $symbols, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchMyTradesForSymbols() is not supported yet');
    }

    public function watch_orders_for_symbols(array $symbols, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrdersForSymbols() is not supported yet');
    }

    public function watch_ohlcv_for_symbols(array $symbolsAndTimeframes, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOHLCVForSymbols() is not supported yet');
    }

    public function watch_order_book_for_symbols(array $symbols, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrderBookForSymbols() is not supported yet');
    }

    public function fetch_deposit_addresses(?array $codes = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositAddresses() is not supported yet');
    }

    public function fetch_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderBook() is not supported yet');
    }

    public function fetch_margin_mode(string $symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if ($this->has['fetchMarginModes']) {
                $marginModes = Async\await($this->fetchMarginModes (array( $symbol ), $params));
                return $this->safe_dict($marginModes, $symbol);
            } else {
                throw new NotSupported($this->id . ' fetchMarginMode() is not supported yet');
            }
        }) ();
    }

    public function fetch_margin_modes(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMarginModes () is not supported yet');
    }

    public function fetch_rest_order_book_safe($symbol, $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $limit, $params) {
            $fetchSnapshotMaxRetries = $this->handleOption ('watchOrderBook', 'maxRetries', 3);
            for ($i = 0; $i < $fetchSnapshotMaxRetries; $i++) {
                try {
                    $orderBook = Async\await($this->fetch_order_book($symbol, $limit, $params));
                    return $orderBook;
                } catch (Exception $e) {
                    if (($i + 1) === $fetchSnapshotMaxRetries) {
                        throw $e;
                    }
                }
            }
            return null;
        }) ();
    }

    public function watch_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrderBook() is not supported yet');
    }

    public function fetch_time($params = array ()) {
        throw new NotSupported($this->id . ' fetchTime() is not supported yet');
    }

    public function fetch_trading_limits(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTradingLimits() is not supported yet');
    }

    public function parse_market($market) {
        throw new NotSupported($this->id . ' parseMarket() is not supported yet');
    }

    public function parse_markets($markets) {
        $result = array();
        for ($i = 0; $i < count($markets); $i++) {
            $result[] = $this->parse_market($markets[$i]);
        }
        return $result;
    }

    public function parse_ticker(array $ticker, ?array $market = null) {
        throw new NotSupported($this->id . ' parseTicker() is not supported yet');
    }

    public function parse_deposit_address($depositAddress, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseDepositAddress() is not supported yet');
    }

    public function parse_trade(array $trade, ?array $market = null) {
        throw new NotSupported($this->id . ' parseTrade() is not supported yet');
    }

    public function parse_transaction($transaction, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseTransaction() is not supported yet');
    }

    public function parse_transfer($transfer, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseTransfer() is not supported yet');
    }

    public function parse_account($account) {
        throw new NotSupported($this->id . ' parseAccount() is not supported yet');
    }

    public function parse_ledger_entry($item, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseLedgerEntry() is not supported yet');
    }

    public function parse_order($order, ?array $market = null) {
        throw new NotSupported($this->id . ' parseOrder() is not supported yet');
    }

    public function fetch_cross_borrow_rates($params = array ()) {
        throw new NotSupported($this->id . ' fetchCrossBorrowRates() is not supported yet');
    }

    public function fetch_isolated_borrow_rates($params = array ()) {
        throw new NotSupported($this->id . ' fetchIsolatedBorrowRates() is not supported yet');
    }

    public function parse_market_leverage_tiers($info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseMarketLeverageTiers() is not supported yet');
    }

    public function fetch_leverage_tiers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLeverageTiers() is not supported yet');
    }

    public function parse_position($position, ?array $market = null) {
        throw new NotSupported($this->id . ' parsePosition() is not supported yet');
    }

    public function parse_funding_rate_history($info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseFundingRateHistory() is not supported yet');
    }

    public function parse_borrow_interest($info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseBorrowInterest() is not supported yet');
    }

    public function parse_ws_trade($trade, ?array $market = null) {
        throw new NotSupported($this->id . ' parseWsTrade() is not supported yet');
    }

    public function parse_ws_order($order, ?array $market = null) {
        throw new NotSupported($this->id . ' parseWsOrder() is not supported yet');
    }

    public function parse_ws_order_trade($trade, ?array $market = null) {
        throw new NotSupported($this->id . ' parseWsOrderTrade() is not supported yet');
    }

    public function parse_ws_ohlcv($ohlcv, ?array $market = null) {
        return $this->parse_ohlcv($ohlcv, $market);
    }

    public function fetch_funding_rates(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchFundingRates() is not supported yet');
    }

    public function transfer(string $code, float $amount, string $fromAccount, string $toAccount, $params = array ()) {
        throw new NotSupported($this->id . ' transfer() is not supported yet');
    }

    public function withdraw(string $code, float $amount, string $address, $tag = null, $params = array ()) {
        throw new NotSupported($this->id . ' withdraw() is not supported yet');
    }

    public function create_deposit_address(string $code, $params = array ()) {
        throw new NotSupported($this->id . ' createDepositAddress() is not supported yet');
    }

    public function set_leverage(?int $leverage, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' setLeverage() is not supported yet');
    }

    public function fetch_leverage(string $symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if ($this->has['fetchLeverages']) {
                $leverages = Async\await($this->fetchLeverages (array( $symbol ), $params));
                return $this->safe_dict($leverages, $symbol);
            } else {
                throw new NotSupported($this->id . ' fetchLeverage() is not supported yet');
            }
        }) ();
    }

    public function fetch_leverages(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLeverages() is not supported yet');
    }

    public function set_position_mode(bool $hedged, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' setPositionMode() is not supported yet');
    }

    public function add_margin(string $symbol, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' addMargin() is not supported yet');
    }

    public function reduce_margin(string $symbol, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' reduceMargin() is not supported yet');
    }

    public function set_margin(string $symbol, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' setMargin() is not supported yet');
    }

    public function set_margin_mode(string $marginMode, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' setMarginMode() is not supported yet');
    }

    public function fetch_deposit_addresses_by_network(string $code, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositAddressesByNetwork() is not supported yet');
    }

    public function fetch_open_interest_history(string $symbol, $timeframe = '1h', ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOpenInterestHistory() is not supported yet');
    }

    public function fetch_open_interest(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOpenInterest() is not supported yet');
    }

    public function sign_in($params = array ()) {
        throw new NotSupported($this->id . ' signIn() is not supported yet');
    }

    public function fetch_payment_methods($params = array ()) {
        throw new NotSupported($this->id . ' fetchPaymentMethods() is not supported yet');
    }

    public function parse_to_int($number) {
        // Solve Common intvalmisuse ex => intval((since / (string) 1000))
        // using a $number which is not valid in ts
        $stringifiedNumber = (string) $number;
        $convertedNumber = floatval($stringifiedNumber);
        return intval($convertedNumber);
    }

    public function parse_to_numeric($number) {
        $stringVersion = $this->number_to_string($number); // this will convert 1.0 and 1 to "1" and 1.1 to "1.1"
        // keep this in mind:
        // in JS => 1 == 1.0 is true;  1 === 1.0 is true
        // in Python => 1 == 1.0 is true
        // in PHP 1 == 1.0 is true, but 1 === 1.0 is false
        if (mb_strpos($stringVersion, '.') !== false) {
            return floatval($stringVersion);
        }
        return intval($stringVersion);
    }

    public function is_round_number($value) {
        // this method is similar to isInteger, but this is more loyal and does not check for types.
        // i.e. isRoundNumber(1.000) returns true, while isInteger(1.000) returns false
        $res = $this->parse_to_numeric((fmod($value, 1)));
        return $res === 0;
    }

    public function after_construct() {
        $this->create_networks_by_id_object();
    }

    public function create_networks_by_id_object() {
        // automatically generate network-id-to-code mappings
        $networkIdsToCodesGenerated = $this->invert_flat_string_dictionary($this->safe_value($this->options, 'networks', array())); // invert defined networks dictionary
        $this->options['networksById'] = array_merge($networkIdsToCodesGenerated, $this->safe_value($this->options, 'networksById', array())); // support manually overriden "networksById" dictionary too
    }

    public function get_default_options() {
        return array(
            'defaultNetworkCodeReplacements' => array(
                'ETH' => array( 'ERC20' => 'ETH' ),
                'TRX' => array( 'TRC20' => 'TRX' ),
                'CRO' => array( 'CRC20' => 'CRONOS' ),
            ),
        );
    }

    public function safe_ledger_entry(array $entry, ?array $currency = null) {
        $currency = $this->safe_currency(null, $currency);
        $direction = $this->safe_string($entry, 'direction');
        $before = $this->safe_string($entry, 'before');
        $after = $this->safe_string($entry, 'after');
        $amount = $this->safe_string($entry, 'amount');
        if ($amount !== null) {
            if ($before === null && $after !== null) {
                $before = Precise::string_sub($after, $amount);
            } elseif ($before !== null && $after === null) {
                $after = Precise::string_add($before, $amount);
            }
        }
        if ($before !== null && $after !== null) {
            if ($direction === null) {
                if (Precise::string_gt($before, $after)) {
                    $direction = 'out';
                }
                if (Precise::string_gt($after, $before)) {
                    $direction = 'in';
                }
            }
        }
        $fee = $this->safe_value($entry, 'fee');
        if ($fee !== null) {
            $fee['cost'] = $this->safe_number($fee, 'cost');
        }
        $timestamp = $this->safe_integer($entry, 'timestamp');
        $info = $this->safe_dict($entry, 'info', array());
        return array(
            'id' => $this->safe_string($entry, 'id'),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'direction' => $direction,
            'account' => $this->safe_string($entry, 'account'),
            'referenceId' => $this->safe_string($entry, 'referenceId'),
            'referenceAccount' => $this->safe_string($entry, 'referenceAccount'),
            'type' => $this->safe_string($entry, 'type'),
            'currency' => $currency['code'],
            'amount' => $this->parse_number($amount),
            'before' => $this->parse_number($before),
            'after' => $this->parse_number($after),
            'status' => $this->safe_string($entry, 'status'),
            'fee' => $fee,
            'info' => $info,
        );
    }

    public function safe_currency_structure(array $currency) {
        return array_merge(array(
            'active' => null,
            'code' => null,
            'deposit' => null,
            'fee' => null,
            'fees' => array(),
            'id' => null,
            'info' => null,
            'limits' => array(
                'deposit' => array(
                    'min' => null,
                    'max' => null,
                ),
                'withdraw' => array(
                    'min' => null,
                    'max' => null,
                ),
            ),
            'name' => null,
            'networks' => array(),
            'numericId' => null,
            'precision' => null,
            'type' => null,
            'withdraw' => null,
        ), $currency);
    }

    public function safe_market_structure($market = null) {
        $cleanStructure = array(
            'active' => null,
            'base' => null,
            'baseId' => null,
            'contract' => null,
            'contractSize' => null,
            'expiry' => null,
            'expiryDatetime' => null,
            'future' => null,
            'id' => null,
            'index' => null,
            'inverse' => null,
            'limits' => array(
                'leverage' => array(
                    'max' => null,
                    'min' => null,
                ),
                'amount' => array(
                    'max' => null,
                    'min' => null,
                ),
                'price' => array(
                    'max' => null,
                    'min' => null,
                ),
                'cost' => array(
                    'max' => null,
                    'min' => null,
                ),
            ),
            'linear' => null,
            'lowercaseId' => null,
            'maker' => null,
            'margin' => null,
            'option' => null,
            'optionType' => null,
            'precision' => array(
                'amount' => null,
                'base' => null,
                'cost' => null,
                'price' => null,
                'quote' => null,
            ),
            'quote' => null,
            'quoteId' => null,
            'settle' => null,
            'settleId' => null,
            'spot' => null,
            'strike' => null,
            'subType' => null,
            'swap' => null,
            'symbol' => null,
            'taker' => null,
            'type' => null,
            'created' => null,
            'info' => null,
        );
        if ($market !== null) {
            $result = array_merge($cleanStructure, $market);
            // set null swap/future/etc
            if ($result['spot']) {
                if ($result['contract'] === null) {
                    $result['contract'] = false;
                }
                if ($result['swap'] === null) {
                    $result['swap'] = false;
                }
                if ($result['future'] === null) {
                    $result['future'] = false;
                }
                if ($result['option'] === null) {
                    $result['option'] = false;
                }
                if ($result['index'] === null) {
                    $result['index'] = false;
                }
            }
            return $result;
        }
        return $cleanStructure;
    }

    public function set_markets($markets, $currencies = null) {
        $values = array();
        $this->markets_by_id = array();
        // handle marketId conflicts
        // we insert spot $markets first
        $marketValues = $this->sort_by($this->to_array($markets), 'spot', true, true);
        for ($i = 0; $i < count($marketValues); $i++) {
            $value = $marketValues[$i];
            if (is_array($this->markets_by_id) && array_key_exists($value['id'], $this->markets_by_id)) {
                ($this->markets_by_id[$value['id']])[] = $value;
            } else {
                $this->markets_by_id[$value['id']] = array( $value );
            }
            $market = $this->deep_extend($this->safe_market_structure(), array(
                'precision' => $this->precision,
                'limits' => $this->limits,
            ), $this->fees['trading'], $value);
            if ($market['linear']) {
                $market['subType'] = 'linear';
            } elseif ($market['inverse']) {
                $market['subType'] = 'inverse';
            } else {
                $market['subType'] = null;
            }
            $values[] = $market;
        }
        $this->markets = $this->index_by($values, 'symbol');
        $marketsSortedBySymbol = $this->keysort ($this->markets);
        $marketsSortedById = $this->keysort ($this->markets_by_id);
        $this->symbols = is_array($marketsSortedBySymbol) ? array_keys($marketsSortedBySymbol) : array();
        $this->ids = is_array($marketsSortedById) ? array_keys($marketsSortedById) : array();
        if ($currencies !== null) {
            // $currencies is always null when called in constructor but not when called from loadMarkets
            $this->currencies = $this->deep_extend($this->currencies, $currencies);
        } else {
            $baseCurrencies = array();
            $quoteCurrencies = array();
            for ($i = 0; $i < count($values); $i++) {
                $market = $values[$i];
                $defaultCurrencyPrecision = ($this->precisionMode === DECIMAL_PLACES) ? 8 : $this->parse_number('1e-8');
                $marketPrecision = $this->safe_dict($market, 'precision', array());
                if (is_array($market) && array_key_exists('base', $market)) {
                    $currency = $this->safe_currency_structure(array(
                        'id' => $this->safe_string_2($market, 'baseId', 'base'),
                        'numericId' => $this->safe_integer($market, 'baseNumericId'),
                        'code' => $this->safe_string($market, 'base'),
                        'precision' => $this->safe_value_2($marketPrecision, 'base', 'amount', $defaultCurrencyPrecision),
                    ));
                    $baseCurrencies[] = $currency;
                }
                if (is_array($market) && array_key_exists('quote', $market)) {
                    $currency = $this->safe_currency_structure(array(
                        'id' => $this->safe_string_2($market, 'quoteId', 'quote'),
                        'numericId' => $this->safe_integer($market, 'quoteNumericId'),
                        'code' => $this->safe_string($market, 'quote'),
                        'precision' => $this->safe_value_2($marketPrecision, 'quote', 'price', $defaultCurrencyPrecision),
                    ));
                    $quoteCurrencies[] = $currency;
                }
            }
            $baseCurrencies = $this->sort_by($baseCurrencies, 'code', false, '');
            $quoteCurrencies = $this->sort_by($quoteCurrencies, 'code', false, '');
            $this->baseCurrencies = $this->index_by($baseCurrencies, 'code');
            $this->quoteCurrencies = $this->index_by($quoteCurrencies, 'code');
            $allCurrencies = $this->array_concat($baseCurrencies, $quoteCurrencies);
            $groupedCurrencies = $this->group_by($allCurrencies, 'code');
            $codes = is_array($groupedCurrencies) ? array_keys($groupedCurrencies) : array();
            $resultingCurrencies = array();
            for ($i = 0; $i < count($codes); $i++) {
                $code = $codes[$i];
                $groupedCurrenciesCode = $this->safe_list($groupedCurrencies, $code, array());
                $highestPrecisionCurrency = $this->safe_value($groupedCurrenciesCode, 0);
                for ($j = 1; $j < count($groupedCurrenciesCode); $j++) {
                    $currentCurrency = $groupedCurrenciesCode[$j];
                    if ($this->precisionMode === TICK_SIZE) {
                        $highestPrecisionCurrency = ($currentCurrency['precision'] < $highestPrecisionCurrency['precision']) ? $currentCurrency : $highestPrecisionCurrency;
                    } else {
                        $highestPrecisionCurrency = ($currentCurrency['precision'] > $highestPrecisionCurrency['precision']) ? $currentCurrency : $highestPrecisionCurrency;
                    }
                }
                $resultingCurrencies[] = $highestPrecisionCurrency;
            }
            $sortedCurrencies = $this->sort_by($resultingCurrencies, 'code');
            $this->currencies = $this->deep_extend($this->currencies, $this->index_by($sortedCurrencies, 'code'));
        }
        $this->currencies_by_id = $this->index_by($this->currencies, 'id');
        $currenciesSortedByCode = $this->keysort ($this->currencies);
        $this->codes = is_array($currenciesSortedByCode) ? array_keys($currenciesSortedByCode) : array();
        return $this->markets;
    }

    public function get_describe_for_extended_ws_exchange(mixed $currentRestInstance, mixed $parentRestInstance, array $wsBaseDescribe) {
        $extendedRestDescribe = $this->deep_extend($parentRestInstance->describe (), $currentRestInstance->describe ());
        $superWithRestDescribe = $this->deep_extend($extendedRestDescribe, $wsBaseDescribe);
        return $superWithRestDescribe;
    }

    public function safe_balance(array $balance) {
        $balances = $this->omit ($balance, array( 'info', 'timestamp', 'datetime', 'free', 'used', 'total' ));
        $codes = is_array($balances) ? array_keys($balances) : array();
        $balance['free'] = array();
        $balance['used'] = array();
        $balance['total'] = array();
        $debtBalance = array();
        for ($i = 0; $i < count($codes); $i++) {
            $code = $codes[$i];
            $total = $this->safe_string($balance[$code], 'total');
            $free = $this->safe_string($balance[$code], 'free');
            $used = $this->safe_string($balance[$code], 'used');
            $debt = $this->safe_string($balance[$code], 'debt');
            if (($total === null) && ($free !== null) && ($used !== null)) {
                $total = Precise::string_add($free, $used);
            }
            if (($free === null) && ($total !== null) && ($used !== null)) {
                $free = Precise::string_sub($total, $used);
            }
            if (($used === null) && ($total !== null) && ($free !== null)) {
                $used = Precise::string_sub($total, $free);
            }
            $balance[$code]['free'] = $this->parse_number($free);
            $balance[$code]['used'] = $this->parse_number($used);
            $balance[$code]['total'] = $this->parse_number($total);
            $balance['free'][$code] = $balance[$code]['free'];
            $balance['used'][$code] = $balance[$code]['used'];
            $balance['total'][$code] = $balance[$code]['total'];
            if ($debt !== null) {
                $balance[$code]['debt'] = $this->parse_number($debt);
                $debtBalance[$code] = $balance[$code]['debt'];
            }
        }
        $debtBalanceArray = is_array($debtBalance) ? array_keys($debtBalance) : array();
        $length = count($debtBalanceArray);
        if ($length) {
            $balance['debt'] = $debtBalance;
        }
        return $balance;
    }

    public function safe_order(array $order, ?array $market = null) {
        // parses numbers
        // * it is important pass the $trades $rawTrades
        $amount = $this->omit_zero($this->safe_string($order, 'amount'));
        $remaining = $this->safe_string($order, 'remaining');
        $filled = $this->safe_string($order, 'filled');
        $cost = $this->safe_string($order, 'cost');
        $average = $this->omit_zero($this->safe_string($order, 'average'));
        $price = $this->omit_zero($this->safe_string($order, 'price'));
        $lastTradeTimeTimestamp = $this->safe_integer($order, 'lastTradeTimestamp');
        $symbol = $this->safe_string($order, 'symbol');
        $side = $this->safe_string($order, 'side');
        $status = $this->safe_string($order, 'status');
        $parseFilled = ($filled === null);
        $parseCost = ($cost === null);
        $parseLastTradeTimeTimestamp = ($lastTradeTimeTimestamp === null);
        $fee = $this->safe_value($order, 'fee');
        $parseFee = ($fee === null);
        $parseFees = $this->safe_value($order, 'fees') === null;
        $parseSymbol = $symbol === null;
        $parseSide = $side === null;
        $shouldParseFees = $parseFee || $parseFees;
        $fees = $this->safe_list($order, 'fees', array());
        $trades = array();
        if ($parseFilled || $parseCost || $shouldParseFees) {
            $rawTrades = $this->safe_value($order, 'trades', $trades);
            $oldNumber = $this->number;
            // we parse $trades here!
            $this->number = 'strval';
            $firstTrade = $this->safe_value($rawTrades, 0);
            // parse $trades if they haven't already been parsed
            $tradesAreParsed = (($firstTrade !== null) && (is_array($firstTrade) && array_key_exists('info', $firstTrade)) && (is_array($firstTrade) && array_key_exists('id', $firstTrade)));
            if (!$tradesAreParsed) {
                $trades = $this->parse_trades($rawTrades, $market);
            } else {
                $trades = $rawTrades;
            }
            $this->number = $oldNumber;
            $tradesLength = 0;
            $isArray = gettype($trades) === 'array' && array_keys($trades) === array_keys(array_keys($trades));
            if ($isArray) {
                $tradesLength = count($trades);
            }
            if ($isArray && ($tradesLength > 0)) {
                // move properties that are defined in $trades up into the $order
                if ($order['symbol'] === null) {
                    $order['symbol'] = $trades[0]['symbol'];
                }
                if ($order['side'] === null) {
                    $order['side'] = $trades[0]['side'];
                }
                if ($order['type'] === null) {
                    $order['type'] = $trades[0]['type'];
                }
                if ($order['id'] === null) {
                    $order['id'] = $trades[0]['order'];
                }
                if ($parseFilled) {
                    $filled = '0';
                }
                if ($parseCost) {
                    $cost = '0';
                }
                for ($i = 0; $i < count($trades); $i++) {
                    $trade = $trades[$i];
                    $tradeAmount = $this->safe_string($trade, 'amount');
                    if ($parseFilled && ($tradeAmount !== null)) {
                        $filled = Precise::string_add($filled, $tradeAmount);
                    }
                    $tradeCost = $this->safe_string($trade, 'cost');
                    if ($parseCost && ($tradeCost !== null)) {
                        $cost = Precise::string_add($cost, $tradeCost);
                    }
                    if ($parseSymbol) {
                        $symbol = $this->safe_string($trade, 'symbol');
                    }
                    if ($parseSide) {
                        $side = $this->safe_string($trade, 'side');
                    }
                    $tradeTimestamp = $this->safe_value($trade, 'timestamp');
                    if ($parseLastTradeTimeTimestamp && ($tradeTimestamp !== null)) {
                        if ($lastTradeTimeTimestamp === null) {
                            $lastTradeTimeTimestamp = $tradeTimestamp;
                        } else {
                            $lastTradeTimeTimestamp = max ($lastTradeTimeTimestamp, $tradeTimestamp);
                        }
                    }
                    if ($shouldParseFees) {
                        $tradeFees = $this->safe_value($trade, 'fees');
                        if ($tradeFees !== null) {
                            for ($j = 0; $j < count($tradeFees); $j++) {
                                $tradeFee = $tradeFees[$j];
                                $fees[] = array_merge(array(), $tradeFee);
                            }
                        } else {
                            $tradeFee = $this->safe_value($trade, 'fee');
                            if ($tradeFee !== null) {
                                $fees[] = array_merge(array(), $tradeFee);
                            }
                        }
                    }
                }
            }
        }
        if ($shouldParseFees) {
            $reducedFees = $this->reduceFees ? $this->reduce_fees_by_currency($fees) : $fees;
            $reducedLength = count($reducedFees);
            for ($i = 0; $i < $reducedLength; $i++) {
                $reducedFees[$i]['cost'] = $this->safe_number($reducedFees[$i], 'cost');
                if (is_array($reducedFees[$i]) && array_key_exists('rate', $reducedFees[$i])) {
                    $reducedFees[$i]['rate'] = $this->safe_number($reducedFees[$i], 'rate');
                }
            }
            if (!$parseFee && ($reducedLength === 0)) {
                // copy $fee to avoid modification by reference
                $feeCopy = $this->deep_extend($fee);
                $feeCopy['cost'] = $this->safe_number($feeCopy, 'cost');
                if (is_array($feeCopy) && array_key_exists('rate', $feeCopy)) {
                    $feeCopy['rate'] = $this->safe_number($feeCopy, 'rate');
                }
                $reducedFees[] = $feeCopy;
            }
            $order['fees'] = $reducedFees;
            if ($parseFee && ($reducedLength === 1)) {
                $order['fee'] = $reducedFees[0];
            }
        }
        if ($amount === null) {
            // ensure $amount = $filled . $remaining
            if ($filled !== null && $remaining !== null) {
                $amount = Precise::string_add($filled, $remaining);
            } elseif ($status === 'closed') {
                $amount = $filled;
            }
        }
        if ($filled === null) {
            if ($amount !== null && $remaining !== null) {
                $filled = Precise::string_sub($amount, $remaining);
            } elseif ($status === 'closed' && $amount !== null) {
                $filled = $amount;
            }
        }
        if ($remaining === null) {
            if ($amount !== null && $filled !== null) {
                $remaining = Precise::string_sub($amount, $filled);
            } elseif ($status === 'closed') {
                $remaining = '0';
            }
        }
        // ensure that the $average field is calculated correctly
        $inverse = $this->safe_bool($market, 'inverse', false);
        $contractSize = $this->number_to_string($this->safe_value($market, 'contractSize', 1));
        // $inverse
        // $price = $filled * contract size / $cost
        //
        // linear
        // $price = $cost / ($filled * contract size)
        if ($average === null) {
            if (($filled !== null) && ($cost !== null) && Precise::string_gt($filled, '0')) {
                $filledTimesContractSize = Precise::string_mul($filled, $contractSize);
                if ($inverse) {
                    $average = Precise::string_div($filledTimesContractSize, $cost);
                } else {
                    $average = Precise::string_div($cost, $filledTimesContractSize);
                }
            }
        }
        // similarly
        // $inverse
        // $cost = $filled * contract size / $price
        //
        // linear
        // $cost = $filled * contract size * $price
        $costPriceExists = ($average !== null) || ($price !== null);
        if ($parseCost && ($filled !== null) && $costPriceExists) {
            $multiplyPrice = null;
            if ($average === null) {
                $multiplyPrice = $price;
            } else {
                $multiplyPrice = $average;
            }
            // contract trading
            $filledTimesContractSize = Precise::string_mul($filled, $contractSize);
            if ($inverse) {
                $cost = Precise::string_div($filledTimesContractSize, $multiplyPrice);
            } else {
                $cost = Precise::string_mul($filledTimesContractSize, $multiplyPrice);
            }
        }
        // support for $market orders
        $orderType = $this->safe_value($order, 'type');
        $emptyPrice = ($price === null) || Precise::string_equals($price, '0');
        if ($emptyPrice && ($orderType === 'market')) {
            $price = $average;
        }
        // we have $trades with string values at this point so we will mutate them
        for ($i = 0; $i < count($trades); $i++) {
            $entry = $trades[$i];
            $entry['amount'] = $this->safe_number($entry, 'amount');
            $entry['price'] = $this->safe_number($entry, 'price');
            $entry['cost'] = $this->safe_number($entry, 'cost');
            $tradeFee = $this->safe_dict($entry, 'fee', array());
            $tradeFee['cost'] = $this->safe_number($tradeFee, 'cost');
            if (is_array($tradeFee) && array_key_exists('rate', $tradeFee)) {
                $tradeFee['rate'] = $this->safe_number($tradeFee, 'rate');
            }
            $entryFees = $this->safe_list($entry, 'fees', array());
            for ($j = 0; $j < count($entryFees); $j++) {
                $entryFees[$j]['cost'] = $this->safe_number($entryFees[$j], 'cost');
            }
            $entry['fees'] = $entryFees;
            $entry['fee'] = $tradeFee;
        }
        $timeInForce = $this->safe_string($order, 'timeInForce');
        $postOnly = $this->safe_value($order, 'postOnly');
        // timeInForceHandling
        if ($timeInForce === null) {
            if ($this->safe_string($order, 'type') === 'market') {
                $timeInForce = 'IOC';
            }
            // allow $postOnly override
            if ($postOnly) {
                $timeInForce = 'PO';
            }
        } elseif ($postOnly === null) {
            // $timeInForce is not null here
            $postOnly = $timeInForce === 'PO';
        }
        $timestamp = $this->safe_integer($order, 'timestamp');
        $lastUpdateTimestamp = $this->safe_integer($order, 'lastUpdateTimestamp');
        $datetime = $this->safe_string($order, 'datetime');
        if ($datetime === null) {
            $datetime = $this->iso8601 ($timestamp);
        }
        $triggerPrice = $this->parse_number($this->safe_string_2($order, 'triggerPrice', 'stopPrice'));
        $takeProfitPrice = $this->parse_number($this->safe_string($order, 'takeProfitPrice'));
        $stopLossPrice = $this->parse_number($this->safe_string($order, 'stopLossPrice'));
        return array_merge($order, array(
            'amount' => $this->parse_number($amount),
            'average' => $this->parse_number($average),
            'clientOrderId' => $this->safe_string($order, 'clientOrderId'),
            'cost' => $this->parse_number($cost),
            'datetime' => $datetime,
            'fee' => $this->safe_value($order, 'fee'),
            'filled' => $this->parse_number($filled),
            'id' => $this->safe_string($order, 'id'),
            'lastTradeTimestamp' => $lastTradeTimeTimestamp,
            'lastUpdateTimestamp' => $lastUpdateTimestamp,
            'postOnly' => $postOnly,
            'price' => $this->parse_number($price),
            'reduceOnly' => $this->safe_value($order, 'reduceOnly'),
            'remaining' => $this->parse_number($remaining),
            'side' => $side,
            'status' => $status,
            'stopLossPrice' => $stopLossPrice,
            'stopPrice' => $triggerPrice, // ! deprecated, use $triggerPrice instead
            'symbol' => $symbol,
            'takeProfitPrice' => $takeProfitPrice,
            'timeInForce' => $timeInForce,
            'timestamp' => $timestamp,
            'trades' => $trades,
            'triggerPrice' => $triggerPrice,
            'type' => $this->safe_string($order, 'type'),
        ));
    }

    public function parse_orders(array $orders, ?array $market = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        //
        // the value of $orders is either a dict or a list
        //
        // dict
        //
        //     {
        //         'id1' => array( ... ),
        //         'id2' => array( ... ),
        //         'id3' => array( ... ),
        //         ...
        //     }
        //
        // list
        //
        //     array(
        //         array( 'id' => 'id1', ... ),
        //         array( 'id' => 'id2', ... ),
        //         array( 'id' => 'id3', ... ),
        //         ...
        //     )
        //
        $results = array();
        if (gettype($orders) === 'array' && array_keys($orders) === array_keys(array_keys($orders))) {
            for ($i = 0; $i < count($orders); $i++) {
                $order = array_merge($this->parse_order($orders[$i], $market), $params);
                $results[] = $order;
            }
        } else {
            $ids = is_array($orders) ? array_keys($orders) : array();
            for ($i = 0; $i < count($ids); $i++) {
                $id = $ids[$i];
                $order = array_merge($this->parse_order(array_merge(array( 'id' => $id ), $orders[$id]), $market), $params);
                $results[] = $order;
            }
        }
        $results = $this->sort_by($results, 'timestamp');
        $symbol = ($market !== null) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit($results, $symbol, $since, $limit);
    }

    public function calculate_fee(string $symbol, string $type, string $side, float $amount, float $price, $takerOrMaker = 'taker', $params = array ()) {
        if ($type === 'market' && $takerOrMaker === 'maker') {
            throw new ArgumentsRequired($this->id . ' calculateFee() - you have provided incompatible arguments - "market" $type order can not be "maker". Change either the "type" or the "takerOrMaker" argument to calculate the fee.');
        }
        $market = $this->markets[$symbol];
        $feeSide = $this->safe_string($market, 'feeSide', 'quote');
        $useQuote = null;
        if ($feeSide === 'get') {
            // the fee is always in the currency you get
            $useQuote = $side === 'sell';
        } elseif ($feeSide === 'give') {
            // the fee is always in the currency you give
            $useQuote = $side === 'buy';
        } else {
            // the fee is always in $feeSide currency
            $useQuote = $feeSide === 'quote';
        }
        $cost = $this->number_to_string($amount);
        $key = null;
        if ($useQuote) {
            $priceString = $this->number_to_string($price);
            $cost = Precise::string_mul($cost, $priceString);
            $key = 'quote';
        } else {
            $key = 'base';
        }
        // for derivatives, the fee is in 'settle' currency
        if (!$market['spot']) {
            $key = 'settle';
        }
        // even if `$takerOrMaker` argument was set to 'maker', for 'market' orders we should forcefully override it to 'taker'
        if ($type === 'market') {
            $takerOrMaker = 'taker';
        }
        $rate = $this->safe_string($market, $takerOrMaker);
        $cost = Precise::string_mul($cost, $rate);
        return array(
            'cost' => $this->parse_number($cost),
            'currency' => $market[$key],
            'rate' => $this->parse_number($rate),
            'type' => $takerOrMaker,
        );
    }

    public function safe_liquidation(array $liquidation, ?array $market = null) {
        $contracts = $this->safe_string($liquidation, 'contracts');
        $contractSize = $this->safe_string($market, 'contractSize');
        $price = $this->safe_string($liquidation, 'price');
        $baseValue = $this->safe_string($liquidation, 'baseValue');
        $quoteValue = $this->safe_string($liquidation, 'quoteValue');
        if (($baseValue === null) && ($contracts !== null) && ($contractSize !== null) && ($price !== null)) {
            $baseValue = Precise::string_mul($contracts, $contractSize);
        }
        if (($quoteValue === null) && ($baseValue !== null) && ($price !== null)) {
            $quoteValue = Precise::string_mul($baseValue, $price);
        }
        $liquidation['contracts'] = $this->parse_number($contracts);
        $liquidation['contractSize'] = $this->parse_number($contractSize);
        $liquidation['price'] = $this->parse_number($price);
        $liquidation['baseValue'] = $this->parse_number($baseValue);
        $liquidation['quoteValue'] = $this->parse_number($quoteValue);
        return $liquidation;
    }

    public function safe_trade(array $trade, ?array $market = null) {
        $amount = $this->safe_string($trade, 'amount');
        $price = $this->safe_string($trade, 'price');
        $cost = $this->safe_string($trade, 'cost');
        if ($cost === null) {
            // contract trading
            $contractSize = $this->safe_string($market, 'contractSize');
            $multiplyPrice = $price;
            if ($contractSize !== null) {
                $inverse = $this->safe_bool($market, 'inverse', false);
                if ($inverse) {
                    $multiplyPrice = Precise::string_div('1', $price);
                }
                $multiplyPrice = Precise::string_mul($multiplyPrice, $contractSize);
            }
            $cost = Precise::string_mul($multiplyPrice, $amount);
        }
        $parseFee = $this->safe_value($trade, 'fee') === null;
        $parseFees = $this->safe_value($trade, 'fees') === null;
        $shouldParseFees = $parseFee || $parseFees;
        $fees = array();
        $fee = $this->safe_value($trade, 'fee');
        if ($shouldParseFees) {
            $reducedFees = $this->reduceFees ? $this->reduce_fees_by_currency($fees) : $fees;
            $reducedLength = count($reducedFees);
            for ($i = 0; $i < $reducedLength; $i++) {
                $reducedFees[$i]['cost'] = $this->safe_number($reducedFees[$i], 'cost');
                if (is_array($reducedFees[$i]) && array_key_exists('rate', $reducedFees[$i])) {
                    $reducedFees[$i]['rate'] = $this->safe_number($reducedFees[$i], 'rate');
                }
            }
            if (!$parseFee && ($reducedLength === 0)) {
                // copy $fee to avoid modification by reference
                $feeCopy = $this->deep_extend($fee);
                $feeCopy['cost'] = $this->safe_number($feeCopy, 'cost');
                if (is_array($feeCopy) && array_key_exists('rate', $feeCopy)) {
                    $feeCopy['rate'] = $this->safe_number($feeCopy, 'rate');
                }
                $reducedFees[] = $feeCopy;
            }
            if ($parseFees) {
                $trade['fees'] = $reducedFees;
            }
            if ($parseFee && ($reducedLength === 1)) {
                $trade['fee'] = $reducedFees[0];
            }
            $tradeFee = $this->safe_value($trade, 'fee');
            if ($tradeFee !== null) {
                $tradeFee['cost'] = $this->safe_number($tradeFee, 'cost');
                if (is_array($tradeFee) && array_key_exists('rate', $tradeFee)) {
                    $tradeFee['rate'] = $this->safe_number($tradeFee, 'rate');
                }
                $trade['fee'] = $tradeFee;
            }
        }
        $trade['amount'] = $this->parse_number($amount);
        $trade['cost'] = $this->parse_number($cost);
        $trade['price'] = $this->parse_number($price);
        return $trade;
    }

    public function invert_flat_string_dictionary($dict) {
        $reversed = array();
        $keys = is_array($dict) ? array_keys($dict) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            $value = $dict[$key];
            if (gettype($value) === 'string') {
                $reversed[$value] = $key;
            }
        }
        return $reversed;
    }

    public function reduce_fees_by_currency($fees) {
        //
        // this function takes a list of $fee structures having the following format
        //
        //     string = true
        //
        //     array(
        //         array( 'currency' => 'BTC', 'cost' => '0.1' ),
        //         array( 'currency' => 'BTC', 'cost' => '0.2'  ),
        //         array( 'currency' => 'BTC', 'cost' => '0.2', 'rate' => '0.00123' ),
        //         array( 'currency' => 'BTC', 'cost' => '0.4', 'rate' => '0.00123' ),
        //         array( 'currency' => 'BTC', 'cost' => '0.5', 'rate' => '0.00456' ),
        //         array( 'currency' => 'USDT', 'cost' => '12.3456' ),
        //     )
        //
        //     string = false
        //
        //     array(
        //         array( 'currency' => 'BTC', 'cost' => 0.1 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.2 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.2, 'rate' => 0.00123 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.4, 'rate' => 0.00123 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.5, 'rate' => 0.00456 ),
        //         array( 'currency' => 'USDT', 'cost' => 12.3456 ),
        //     )
        //
        // and returns a $reduced $fee list, where $fees are summed per currency and $rate (if any)
        //
        //     string = true
        //
        //     array(
        //         array( 'currency' => 'BTC', 'cost' => '0.4'  ),
        //         array( 'currency' => 'BTC', 'cost' => '0.6', 'rate' => '0.00123' ),
        //         array( 'currency' => 'BTC', 'cost' => '0.5', 'rate' => '0.00456' ),
        //         array( 'currency' => 'USDT', 'cost' => '12.3456' ),
        //     )
        //
        //     string  = false
        //
        //     array(
        //         array( 'currency' => 'BTC', 'cost' => 0.3  ),
        //         array( 'currency' => 'BTC', 'cost' => 0.6, 'rate' => 0.00123 ),
        //         array( 'currency' => 'BTC', 'cost' => 0.5, 'rate' => 0.00456 ),
        //         array( 'currency' => 'USDT', 'cost' => 12.3456 ),
        //     )
        //
        $reduced = array();
        for ($i = 0; $i < count($fees); $i++) {
            $fee = $fees[$i];
            $feeCurrencyCode = $this->safe_string($fee, 'currency');
            if ($feeCurrencyCode !== null) {
                $rate = $this->safe_string($fee, 'rate');
                $cost = $this->safe_value($fee, 'cost');
                if (Precise::string_eq($cost, '0')) {
                    // omit zero $cost $fees
                    continue;
                }
                if (!(is_array($reduced) && array_key_exists($feeCurrencyCode, $reduced))) {
                    $reduced[$feeCurrencyCode] = array();
                }
                $rateKey = ($rate === null) ? '' : $rate;
                if (is_array($reduced[$feeCurrencyCode]) && array_key_exists($rateKey, $reduced[$feeCurrencyCode])) {
                    $reduced[$feeCurrencyCode][$rateKey]['cost'] = Precise::string_add($reduced[$feeCurrencyCode][$rateKey]['cost'], $cost);
                } else {
                    $reduced[$feeCurrencyCode][$rateKey] = array(
                        'cost' => $cost,
                        'currency' => $feeCurrencyCode,
                    );
                    if ($rate !== null) {
                        $reduced[$feeCurrencyCode][$rateKey]['rate'] = $rate;
                    }
                }
            }
        }
        $result = array();
        $feeValues = is_array($reduced) ? array_values($reduced) : array();
        for ($i = 0; $i < count($feeValues); $i++) {
            $reducedFeeValues = is_array($feeValues[$i]) ? array_values($feeValues[$i]) : array();
            $result = $this->array_concat($result, $reducedFeeValues);
        }
        return $result;
    }

    public function safe_ticker(array $ticker, ?array $market = null) {
        $open = $this->omit_zero($this->safe_string($ticker, 'open'));
        $close = $this->omit_zero($this->safe_string($ticker, 'close'));
        $last = $this->omit_zero($this->safe_string($ticker, 'last'));
        $change = $this->omit_zero($this->safe_string($ticker, 'change'));
        $percentage = $this->omit_zero($this->safe_string($ticker, 'percentage'));
        $average = $this->omit_zero($this->safe_string($ticker, 'average'));
        $vwap = $this->omit_zero($this->safe_string($ticker, 'vwap'));
        $baseVolume = $this->safe_string($ticker, 'baseVolume');
        $quoteVolume = $this->safe_string($ticker, 'quoteVolume');
        if ($vwap === null) {
            $vwap = Precise::string_div($this->omit_zero($quoteVolume), $baseVolume);
        }
        if (($last !== null) && ($close === null)) {
            $close = $last;
        } elseif (($last === null) && ($close !== null)) {
            $last = $close;
        }
        if (($last !== null) && ($open !== null)) {
            if ($change === null) {
                $change = Precise::string_sub($last, $open);
            }
            if ($average === null) {
                $average = Precise::string_div(Precise::string_add($last, $open), '2');
            }
        }
        if (($percentage === null) && ($change !== null) && ($open !== null) && Precise::string_gt($open, '0')) {
            $percentage = Precise::string_mul(Precise::string_div($change, $open), '100');
        }
        if (($change === null) && ($percentage !== null) && ($open !== null)) {
            $change = Precise::string_div(Precise::string_mul($percentage, $open), '100');
        }
        if (($open === null) && ($last !== null) && ($change !== null)) {
            $open = Precise::string_sub($last, $change);
        }
        // timestamp and symbol operations don't belong in safeTicker
        // they should be done in the derived classes
        return array_merge($ticker, array(
            'ask' => $this->parse_number($this->omit_zero($this->safe_number($ticker, 'ask'))),
            'askVolume' => $this->safe_number($ticker, 'askVolume'),
            'average' => $this->parse_number($average),
            'baseVolume' => $this->parse_number($baseVolume),
            'bid' => $this->parse_number($this->omit_zero($this->safe_number($ticker, 'bid'))),
            'bidVolume' => $this->safe_number($ticker, 'bidVolume'),
            'change' => $this->parse_number($change),
            'close' => $this->parse_number($this->omit_zero($this->parse_number($close))),
            'high' => $this->parse_number($this->omit_zero($this->safe_string($ticker, 'high'))),
            'last' => $this->parse_number($this->omit_zero($this->parse_number($last))),
            'low' => $this->parse_number($this->omit_zero($this->safe_number($ticker, 'low'))),
            'open' => $this->parse_number($this->omit_zero($this->parse_number($open))),
            'percentage' => $this->parse_number($percentage),
            'previousClose' => $this->safe_number($ticker, 'previousClose'),
            'quoteVolume' => $this->parse_number($quoteVolume),
            'vwap' => $this->parse_number($vwap),
        ));
    }

    public function fetch_borrow_rate(string $code, $amount, $params = array ()) {
        throw new NotSupported($this->id . ' fetchBorrowRate is deprecated, please use fetchCrossBorrowRate or fetchIsolatedBorrowRate instead');
    }

    public function repay_cross_margin(string $code, $amount, $params = array ()) {
        throw new NotSupported($this->id . ' repayCrossMargin is not support yet');
    }

    public function repay_isolated_margin(string $symbol, string $code, $amount, $params = array ()) {
        throw new NotSupported($this->id . ' repayIsolatedMargin is not support yet');
    }

    public function borrow_cross_margin(string $code, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' borrowCrossMargin is not support yet');
    }

    public function borrow_isolated_margin(string $symbol, string $code, float $amount, $params = array ()) {
        throw new NotSupported($this->id . ' borrowIsolatedMargin is not support yet');
    }

    public function borrow_margin(string $code, $amount, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' borrowMargin is deprecated, please use borrowCrossMargin or borrowIsolatedMargin instead');
    }

    public function repay_margin(string $code, $amount, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' repayMargin is deprecated, please use repayCrossMargin or repayIsolatedMargin instead');
    }

    public function fetch_ohlcv(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        $message = '';
        if ($this->has['fetchTrades']) {
            $message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file';
        }
        throw new NotSupported($this->id . ' fetchOHLCV() is not supported yet' . $message);
    }

    public function fetch_ohlcv_ws(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        $message = '';
        if ($this->has['fetchTradesWs']) {
            $message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file';
        }
        throw new NotSupported($this->id . ' fetchOHLCVWs() is not supported yet. Try using fetchOHLCV instead.' . $message);
    }

    public function watch_ohlcv(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOHLCV() is not supported yet');
    }

    public function convert_trading_view_to_ohlcv($ohlcvs, $timestamp = 't', $open = 'o', $high = 'h', $low = 'l', $close = 'c', $volume = 'v', $ms = false) {
        $result = array();
        $timestamps = $this->safe_list($ohlcvs, $timestamp, array());
        $opens = $this->safe_list($ohlcvs, $open, array());
        $highs = $this->safe_list($ohlcvs, $high, array());
        $lows = $this->safe_list($ohlcvs, $low, array());
        $closes = $this->safe_list($ohlcvs, $close, array());
        $volumes = $this->safe_list($ohlcvs, $volume, array());
        for ($i = 0; $i < count($timestamps); $i++) {
            $result[] = array(
                $ms ? $this->safe_integer($timestamps, $i) : $this->safe_timestamp($timestamps, $i),
                $this->safe_value($opens, $i),
                $this->safe_value($highs, $i),
                $this->safe_value($lows, $i),
                $this->safe_value($closes, $i),
                $this->safe_value($volumes, $i),
            );
        }
        return $result;
    }

    public function convert_ohlcv_to_trading_view($ohlcvs, $timestamp = 't', $open = 'o', $high = 'h', $low = 'l', $close = 'c', $volume = 'v', $ms = false) {
        $result = array();
        $result[$close] = array();
        $result[$high] = array();
        $result[$low] = array();
        $result[$open] = array();
        $result[$timestamp] = array();
        $result[$volume] = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $ts = $ms ? $ohlcvs[$i][0] : $this->parseToInt ($ohlcvs[$i][0] / 1000);
            $result[$timestamp][] = $ts;
            $result[$open][] = $ohlcvs[$i][1];
            $result[$high][] = $ohlcvs[$i][2];
            $result[$low][] = $ohlcvs[$i][3];
            $result[$close][] = $ohlcvs[$i][4];
            $result[$volume][] = $ohlcvs[$i][5];
        }
        return $result;
    }

    public function fetch_web_endpoint($method, $endpointMethod, $returnAsJson, $startRegex = null, $endRegex = null) {
        return Async\async(function () use ($method, $endpointMethod, $returnAsJson, $startRegex, $endRegex) {
            $errorMessage = '';
            $options = $this->safe_value($this->options, $method, array());
            $muteOnFailure = $this->safe_bool($options, 'webApiMuteFailure', true);
            try {
                // if it was not explicitly disabled, then don't fetch
                if ($this->safe_bool($options, 'webApiEnable', true) !== true) {
                    return null;
                }
                $maxRetries = $this->safe_value($options, 'webApiRetries', 10);
                $response = null;
                $retry = 0;
                while ($retry < $maxRetries) {
                    try {
                        $response = Async\await($this->$endpointMethod (array()));
                        break;
                    } catch (Exception $e) {
                        $retry = $retry + 1;
                        if ($retry === $maxRetries) {
                            throw $e;
                        }
                    }
                }
                $content = $response;
                if ($startRegex !== null) {
                    $splitted_by_start = explode($startRegex, $content);
                    $content = $splitted_by_start[1]; // we need second part after start
                }
                if ($endRegex !== null) {
                    $splitted_by_end = explode($endRegex, $content);
                    $content = $splitted_by_end[0]; // we need first part after start
                }
                if ($returnAsJson && (gettype($content) === 'string')) {
                    $jsoned = $this->parse_json(trim($content)); // $content should be trimmed before json parsing
                    if ($jsoned) {
                        return $jsoned; // if parsing was not successfull, exception should be thrown
                    } else {
                        throw new BadResponse('could not parse the $response into json');
                    }
                } else {
                    return $content;
                }
            } catch (Exception $e) {
                $errorMessage = $this->id . ' ' . $method . '() failed to fetch correct data from website. Probably webpage markup has been changed, breaking the page custom parser.';
            }
            if ($muteOnFailure) {
                return null;
            } else {
                throw new BadResponse($errorMessage);
            }
        }) ();
    }

    public function market_ids($symbols) {
        if ($symbols === null) {
            return $symbols;
        }
        $result = array();
        for ($i = 0; $i < count($symbols); $i++) {
            $result[] = $this->market_id($symbols[$i]);
        }
        return $result;
    }

    public function market_symbols($symbols, ?string $type = null, $allowEmpty = true, $sameTypeOnly = false, $sameSubTypeOnly = false) {
        if ($symbols === null) {
            if (!$allowEmpty) {
                throw new ArgumentsRequired($this->id . ' empty list of $symbols is not supported');
            }
            return $symbols;
        }
        $symbolsLength = count($symbols);
        if ($symbolsLength === 0) {
            if (!$allowEmpty) {
                throw new ArgumentsRequired($this->id . ' empty list of $symbols is not supported');
            }
            return $symbols;
        }
        $result = array();
        $marketType = null;
        $isLinearSubType = null;
        for ($i = 0; $i < count($symbols); $i++) {
            $market = $this->market ($symbols[$i]);
            if ($sameTypeOnly && ($marketType !== null)) {
                if ($market['type'] !== $marketType) {
                    throw new BadRequest($this->id . ' $symbols must be of the same $type, either ' . $marketType . ' or ' . $market['type'] . '.');
                }
            }
            if ($sameSubTypeOnly && ($isLinearSubType !== null)) {
                if ($market['linear'] !== $isLinearSubType) {
                    throw new BadRequest($this->id . ' $symbols must be of the same subType, either linear or inverse.');
                }
            }
            if ($type !== null && $market['type'] !== $type) {
                throw new BadRequest($this->id . ' $symbols must be of the same $type ' . $type . '. If the $type is incorrect you can change it in options or the params of the request');
            }
            $marketType = $market['type'];
            if (!$market['spot']) {
                $isLinearSubType = $market['linear'];
            }
            $symbol = $this->safe_string($market, 'symbol', $symbols[$i]);
            $result[] = $symbol;
        }
        return $result;
    }

    public function market_codes($codes) {
        if ($codes === null) {
            return $codes;
        }
        $result = array();
        for ($i = 0; $i < count($codes); $i++) {
            $result[] = $this->common_currency_code($codes[$i]);
        }
        return $result;
    }

    public function parse_bids_asks($bidasks, int|string $priceKey = 0, int|string $amountKey = 1, int|string $countOrIdKey = 2) {
        $bidasks = $this->to_array($bidasks);
        $result = array();
        for ($i = 0; $i < count($bidasks); $i++) {
            $result[] = $this->parse_bid_ask($bidasks[$i], $priceKey, $amountKey, $countOrIdKey);
        }
        return $result;
    }

    public function fetch_l2_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $limit, $params) {
            $orderbook = Async\await($this->fetch_order_book($symbol, $limit, $params));
            return array_merge($orderbook, array(
                'asks' => $this->sort_by($this->aggregate ($orderbook['asks']), 0),
                'bids' => $this->sort_by($this->aggregate ($orderbook['bids']), 0, true),
            ));
        }) ();
    }

    public function filter_by_symbol($objects, ?string $symbol = null) {
        if ($symbol === null) {
            return $objects;
        }
        $result = array();
        for ($i = 0; $i < count($objects); $i++) {
            $objectSymbol = $this->safe_string($objects[$i], 'symbol');
            if ($objectSymbol === $symbol) {
                $result[] = $objects[$i];
            }
        }
        return $result;
    }

    public function parse_ohlcv($ohlcv, ?array $market = null): array {
        if (gettype($ohlcv) === 'array' && array_keys($ohlcv) === array_keys(array_keys($ohlcv))) {
            return array(
                $this->safe_integer($ohlcv, 0), // timestamp
                $this->safe_number($ohlcv, 1), // open
                $this->safe_number($ohlcv, 2), // high
                $this->safe_number($ohlcv, 3), // low
                $this->safe_number($ohlcv, 4), // close
                $this->safe_number($ohlcv, 5), // volume
            );
        }
        return $ohlcv;
    }

    public function network_code_to_id(string $networkCode, ?string $currencyCode = null) {
        /**
         * @ignore
         * tries to convert the provided $networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {string} $networkCode unified network code
         * @param {string} $currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass $currencyCode argument additionally
         * @return {string|null} exchange-specific network id
         */
        if ($networkCode === null) {
            return null;
        }
        $networkIdsByCodes = $this->safe_value($this->options, 'networks', array());
        $networkId = $this->safe_string($networkIdsByCodes, $networkCode);
        // for example, if 'ETH' is passed for $networkCode, but 'ETH' $key not defined in `options->networks` object
        if ($networkId === null) {
            if ($currencyCode === null) {
                // if $currencyCode was not provided, then we just set passed $value to $networkId
                $networkId = $networkCode;
            } else {
                // if $currencyCode was provided, then we try to find if that $currencyCode has a replacement ($i->e. ERC20 for ETH)
                $defaultNetworkCodeReplacements = $this->safe_value($this->options, 'defaultNetworkCodeReplacements', array());
                if (is_array($defaultNetworkCodeReplacements) && array_key_exists($currencyCode, $defaultNetworkCodeReplacements)) {
                    // if there is a replacement for the passed $networkCode, then we use it to find network-id in `options->networks` object
                    $replacementObject = $defaultNetworkCodeReplacements[$currencyCode]; // $i->e. array( 'ERC20' => 'ETH' )
                    $keys = is_array($replacementObject) ? array_keys($replacementObject) : array();
                    for ($i = 0; $i < count($keys); $i++) {
                        $key = $keys[$i];
                        $value = $replacementObject[$key];
                        // if $value matches to provided unified $networkCode, then we use it's $key to find network-id in `options->networks` object
                        if ($value === $networkCode) {
                            $networkId = $this->safe_string($networkIdsByCodes, $key);
                            break;
                        }
                    }
                }
                // if it wasn't found, we just set the provided $value to network-id
                if ($networkId === null) {
                    $networkId = $networkCode;
                }
            }
        }
        return $networkId;
    }

    public function network_id_to_code(string $networkId, ?string $currencyCode = null) {
        /**
         * @ignore
         * tries to convert the provided exchange-specific $networkId to an unified network Code. In order to achieve this, derived class needs to have "options['networksById']" defined.
         * @param {string} $networkId exchange specific network id/title, like => TRON, Trc-20, usdt-erc20, etc
         * @param {string|null} $currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass $currencyCode argument additionally
         * @return {string|null} unified network code
         */
        if ($networkId === null) {
            return null;
        }
        $networkCodesByIds = $this->safe_dict($this->options, 'networksById', array());
        $networkCode = $this->safe_string($networkCodesByIds, $networkId, $networkId);
        // replace mainnet network-codes (i.e. ERC20->ETH)
        if ($currencyCode !== null) {
            $defaultNetworkCodeReplacements = $this->safe_dict($this->options, 'defaultNetworkCodeReplacements', array());
            if (is_array($defaultNetworkCodeReplacements) && array_key_exists($currencyCode, $defaultNetworkCodeReplacements)) {
                $replacementObject = $this->safe_dict($defaultNetworkCodeReplacements, $currencyCode, array());
                $networkCode = $this->safe_string($replacementObject, $networkCode, $networkCode);
            }
        }
        return $networkCode;
    }

    public function handle_network_code_and_params($params) {
        $networkCodeInParams = $this->safe_string_2($params, 'networkCode', 'network');
        if ($networkCodeInParams !== null) {
            $params = $this->omit ($params, array( 'networkCode', 'network' ));
        }
        // if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return array( $networkCodeInParams, $params );
    }

    public function default_network_code(string $currencyCode) {
        $defaultNetworkCode = null;
        $defaultNetworks = $this->safe_dict($this->options, 'defaultNetworks', array());
        if (is_array($defaultNetworks) && array_key_exists($currencyCode, $defaultNetworks)) {
            // if currency had set its network in "defaultNetworks", use it
            $defaultNetworkCode = $defaultNetworks[$currencyCode];
        } else {
            // otherwise, try to use the global-scope 'defaultNetwork' value (even if that network is not supported by currency, it doesn't make any problem, this will be just used "at first" if currency supports this network at all)
            $defaultNetwork = $this->safe_dict($this->options, 'defaultNetwork');
            if ($defaultNetwork !== null) {
                $defaultNetworkCode = $defaultNetwork;
            }
        }
        return $defaultNetworkCode;
    }

    public function select_network_code_from_unified_networks($currencyCode, $networkCode, $indexedNetworkEntries) {
        return $this->select_network_key_from_networks($currencyCode, $networkCode, $indexedNetworkEntries, true);
    }

    public function select_network_id_from_raw_networks($currencyCode, $networkCode, $indexedNetworkEntries) {
        return $this->select_network_key_from_networks($currencyCode, $networkCode, $indexedNetworkEntries, false);
    }

    public function select_network_key_from_networks($currencyCode, $networkCode, $indexedNetworkEntries, $isIndexedByUnifiedNetworkCode = false) {
        // this method is used against raw & unparse network entries, which are just indexed by network id
        $chosenNetworkId = null;
        $availableNetworkIds = is_array($indexedNetworkEntries) ? array_keys($indexedNetworkEntries) : array();
        $responseNetworksLength = count($availableNetworkIds);
        if ($networkCode !== null) {
            if ($responseNetworksLength === 0) {
                throw new NotSupported($this->id . ' - ' . $networkCode . ' network did not return any result for ' . $currencyCode);
            } else {
                // if $networkCode was provided by user, we should check it after response, referenced exchange doesn't support network-code during request
                $networkId = $isIndexedByUnifiedNetworkCode ? $networkCode : $this->network_code_to_id($networkCode, $currencyCode);
                if (is_array($indexedNetworkEntries) && array_key_exists($networkId, $indexedNetworkEntries)) {
                    $chosenNetworkId = $networkId;
                } else {
                    throw new NotSupported($this->id . ' - ' . $networkId . ' network was not found for ' . $currencyCode . ', use one of ' . implode(', ', $availableNetworkIds));
                }
            }
        } else {
            if ($responseNetworksLength === 0) {
                throw new NotSupported($this->id . ' - no networks were returned for ' . $currencyCode);
            } else {
                // if $networkCode was not provided by user, then we try to use the default network (if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                $defaultNetworkCode = $this->default_network_code($currencyCode);
                $defaultNetworkId = $isIndexedByUnifiedNetworkCode ? $defaultNetworkCode : $this->network_code_to_id($defaultNetworkCode, $currencyCode);
                $chosenNetworkId = (is_array($indexedNetworkEntries) && array_key_exists($defaultNetworkId, $indexedNetworkEntries)) ? $defaultNetworkId : $availableNetworkIds[0];
            }
        }
        return $chosenNetworkId;
    }

    public function safe_number_2(array $dictionary, int|string $key1, int|string $key2, $d = null) {
        $value = $this->safe_string_2($dictionary, $key1, $key2);
        return $this->parse_number($value, $d);
    }

    public function parse_order_book(array $orderbook, string $symbol, ?int $timestamp = null, $bidsKey = 'bids', $asksKey = 'asks', int|string $priceKey = 0, int|string $amountKey = 1, int|string $countOrIdKey = 2) {
        $bids = $this->parse_bids_asks($this->safe_value($orderbook, $bidsKey, array()), $priceKey, $amountKey, $countOrIdKey);
        $asks = $this->parse_bids_asks($this->safe_value($orderbook, $asksKey, array()), $priceKey, $amountKey, $countOrIdKey);
        return array(
            'asks' => $this->sort_by($asks, 0),
            'bids' => $this->sort_by($bids, 0, true),
            'datetime' => $this->iso8601 ($timestamp),
            'nonce' => null,
            'symbol' => $symbol,
            'timestamp' => $timestamp,
        );
    }

    public function parse_ohlcvs(mixed $ohlcvs, mixed $market = null, string $timeframe = '1m', ?int $since = null, ?int $limit = null) {
        $results = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $results[] = $this->parse_ohlcv($ohlcvs[$i], $market);
        }
        $sorted = $this->sort_by($results, 0);
        return $this->filter_by_since_limit($sorted, $since, $limit, 0);
    }

    public function parse_leverage_tiers(mixed $response, ?array $symbols = null, $marketIdKey = null) {
        // $marketIdKey should only be null when $response is a dictionary
        $symbols = $this->market_symbols($symbols);
        $tiers = array();
        for ($i = 0; $i < count($response); $i++) {
            $item = $response[$i];
            $id = $this->safe_string($item, $marketIdKey);
            $market = $this->safe_market($id, null, null, 'swap');
            $symbol = $market['symbol'];
            $contract = $this->safe_bool($market, 'contract', false);
            if ($contract && (($symbols === null) || $this->in_array($symbol, $symbols))) {
                $tiers[$symbol] = $this->parse_market_leverage_tiers($item, $market);
            }
        }
        return $tiers;
    }

    public function load_trading_limits(?array $symbols = null, $reload = false, $params = array ()) {
        return Async\async(function () use ($symbols, $reload, $params) {
            if ($this->has['fetchTradingLimits']) {
                if ($reload || !(is_array($this->options) && array_key_exists('limitsLoaded', $this->options))) {
                    $response = Async\await($this->fetch_trading_limits($symbols));
                    for ($i = 0; $i < count($symbols); $i++) {
                        $symbol = $symbols[$i];
                        $this->markets[$symbol] = $this->deep_extend($this->markets[$symbol], $response[$symbol]);
                    }
                    $this->options['limitsLoaded'] = $this->milliseconds ();
                }
            }
            return $this->markets;
        }) ();
    }

    public function safe_position($position) {
        // simplified version of => /pull/12765/
        $unrealizedPnlString = $this->safe_string($position, 'unrealisedPnl');
        $initialMarginString = $this->safe_string($position, 'initialMargin');
        //
        // PERCENTAGE
        //
        $percentage = $this->safe_value($position, 'percentage');
        if (($percentage === null) && ($unrealizedPnlString !== null) && ($initialMarginString !== null)) {
            // was done in all implementations ( aax, btcex, bybit, deribit, ftx, gate, kucoinfutures, phemex )
            $percentageString = Precise::string_mul(Precise::string_div($unrealizedPnlString, $initialMarginString, 4), '100');
            $position['percentage'] = $this->parse_number($percentageString);
        }
        // if $contractSize is null get from $market
        $contractSize = $this->safe_number($position, 'contractSize');
        $symbol = $this->safe_string($position, 'symbol');
        $market = null;
        if ($symbol !== null) {
            $market = $this->safe_value($this->markets, $symbol);
        }
        if ($contractSize === null && $market !== null) {
            $contractSize = $this->safe_number($market, 'contractSize');
            $position['contractSize'] = $contractSize;
        }
        return $position;
    }

    public function parse_positions(array $positions, ?array $symbols = null, $params = array ()) {
        $symbols = $this->market_symbols($symbols);
        $positions = $this->to_array($positions);
        $result = array();
        for ($i = 0; $i < count($positions); $i++) {
            $position = array_merge($this->parse_position($positions[$i], null), $params);
            $result[] = $position;
        }
        return $this->filter_by_array_positions($result, 'symbol', $symbols, false);
    }

    public function parse_accounts(array $accounts, $params = array ()) {
        $accounts = $this->to_array($accounts);
        $result = array();
        for ($i = 0; $i < count($accounts); $i++) {
            $account = array_merge($this->parse_account($accounts[$i]), $params);
            $result[] = $account;
        }
        return $result;
    }

    public function parse_trades(array $trades, ?array $market = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $trades = $this->to_array($trades);
        $result = array();
        for ($i = 0; $i < count($trades); $i++) {
            $trade = array_merge($this->parse_trade($trades[$i], $market), $params);
            $result[] = $trade;
        }
        $result = $this->sort_by_2($result, 'timestamp', 'id');
        $symbol = ($market !== null) ? $market['symbol'] : null;
        return $this->filter_by_symbol_since_limit($result, $symbol, $since, $limit);
    }

    public function parse_transactions(array $transactions, ?array $currency = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $transactions = $this->to_array($transactions);
        $result = array();
        for ($i = 0; $i < count($transactions); $i++) {
            $transaction = array_merge($this->parse_transaction($transactions[$i], $currency), $params);
            $result[] = $transaction;
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function parse_transfers(array $transfers, ?array $currency = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $transfers = $this->to_array($transfers);
        $result = array();
        for ($i = 0; $i < count($transfers); $i++) {
            $transfer = array_merge($this->parse_transfer($transfers[$i], $currency), $params);
            $result[] = $transfer;
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function parse_ledger($data, ?array $currency = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        $result = array();
        $arrayData = $this->to_array($data);
        for ($i = 0; $i < count($arrayData); $i++) {
            $itemOrItems = $this->parse_ledger_entry($arrayData[$i], $currency);
            if (gettype($itemOrItems) === 'array' && array_keys($itemOrItems) === array_keys(array_keys($itemOrItems))) {
                for ($j = 0; $j < count($itemOrItems); $j++) {
                    $result[] = array_merge($itemOrItems[$j], $params);
                }
            } else {
                $result[] = array_merge($itemOrItems, $params);
            }
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit);
    }

    public function nonce() {
        return $this->seconds ();
    }

    public function set_headers($headers) {
        return $headers;
    }

    public function market_id(string $symbol) {
        $market = $this->market ($symbol);
        if ($market !== null) {
            return $market['id'];
        }
        return $symbol;
    }

    public function symbol(string $symbol) {
        $market = $this->market ($symbol);
        return $this->safe_string($market, 'symbol', $symbol);
    }

    public function handle_param_string(array $params, string $paramName, $defaultValue = null) {
        $value = $this->safe_string($params, $paramName, $defaultValue);
        if ($value !== null) {
            $params = $this->omit ($params, $paramName);
        }
        return array( $value, $params );
    }

    public function resolve_path($path, $params) {
        return array(
            $this->implode_params($path, $params),
            $this->omit ($params, $this->extract_params($path)),
        );
    }

    public function get_list_from_object_values($objects, int|string $key) {
        $newArray = $this->to_array($objects);
        $results = array();
        for ($i = 0; $i < count($newArray); $i++) {
            $results[] = $newArray[$i][$key];
        }
        return $results;
    }

    public function get_symbols_for_market_type(?string $marketType = null, ?string $subType = null, bool $symbolWithActiveStatus = true, bool $symbolWithUnknownStatus = true) {
        $filteredMarkets = $this->markets;
        if ($marketType !== null) {
            $filteredMarkets = $this->filter_by($filteredMarkets, 'type', $marketType);
        }
        if ($subType !== null) {
            $this->check_required_argument('getSymbolsForMarketType', $subType, 'subType', array( 'linear', 'inverse', 'quanto' ));
            $filteredMarkets = $this->filter_by($filteredMarkets, 'subType', $subType);
        }
        $activeStatuses = array();
        if ($symbolWithActiveStatus) {
            $activeStatuses[] = true;
        }
        if ($symbolWithUnknownStatus) {
            $activeStatuses[] = null;
        }
        $filteredMarkets = $this->filter_by_array($filteredMarkets, 'active', $activeStatuses, false);
        return $this->get_list_from_object_values($filteredMarkets, 'symbol');
    }

    public function filter_by_array($objects, int|string $key, $values = null, $indexed = true) {
        $objects = $this->to_array($objects);
        // return all of them if no $values were passed
        if ($values === null || !$values) {
            return $indexed ? $this->index_by($objects, $key) : $objects;
        }
        $results = array();
        for ($i = 0; $i < count($objects); $i++) {
            if ($this->in_array($objects[$i][$key], $values)) {
                $results[] = $objects[$i];
            }
        }
        return $indexed ? $this->index_by($results, $key) : $results;
    }

    public function fetch2($path, mixed $api = 'public', $method = 'GET', $params = array (), mixed $headers = null, mixed $body = null, $config = array ()) {
        return Async\async(function () use ($path, $api, $method, $params, $headers, $body, $config) {
            if ($this->enableRateLimit) {
                $cost = $this->calculate_rate_limiter_cost($api, $method, $path, $params, $config);
                Async\await($this->throttle ($cost));
            }
            $this->lastRestRequestTimestamp = $this->milliseconds ();
            $request = $this->sign ($path, $api, $method, $params, $headers, $body);
            $this->last_request_headers = $request['headers'];
            $this->last_request_body = $request['body'];
            $this->last_request_url = $request['url'];
            return Async\await($this->fetch ($request['url'], $request['method'], $request['headers'], $request['body']));
        }) ();
    }

    public function request($path, mixed $api = 'public', $method = 'GET', $params = array (), mixed $headers = null, mixed $body = null, $config = array ()) {
        return Async\async(function () use ($path, $api, $method, $params, $headers, $body, $config) {
            return Async\await($this->fetch2 ($path, $api, $method, $params, $headers, $body, $config));
        }) ();
    }

    public function load_accounts($reload = false, $params = array ()) {
        return Async\async(function () use ($reload, $params) {
            if ($reload) {
                $this->accounts = Async\await($this->fetch_accounts($params));
            } else {
                if ($this->accounts) {
                    return $this->accounts;
                } else {
                    $this->accounts = Async\await($this->fetch_accounts($params));
                }
            }
            $this->accountsById = $this->index_by($this->accounts, 'id');
            return $this->accounts;
        }) ();
    }

    public function build_ohlcvc(array $trades, string $timeframe = '1m', float $since = 0, float $limit = 2147483647) {
        // given a sorted arrays of $trades (recent last) and a $timeframe builds an array of OHLCV candles
        // note, default $limit value (2147483647) is max int32 value
        $ms = $this->parse_timeframe($timeframe) * 1000;
        $ohlcvs = array();
        $i_timestamp = 0;
        // $open = 1;
        $i_high = 2;
        $i_low = 3;
        $i_close = 4;
        $i_volume = 5;
        $i_count = 6;
        $tradesLength = count($trades);
        $oldest = min ($tradesLength, $limit);
        for ($i = 0; $i < $oldest; $i++) {
            $trade = $trades[$i];
            $ts = $trade['timestamp'];
            if ($ts < $since) {
                continue;
            }
            $openingTime = (int) floor($ts / $ms) * $ms; // shift to the edge of m/h/d (but not M)
            if ($openingTime < $since) { // we don't need bars, that have opening time earlier than requested
                continue;
            }
            $ohlcv_length = count($ohlcvs);
            $candle = $ohlcv_length - 1;
            if (($candle === -1) || ($openingTime >= $this->sum ($ohlcvs[$candle][$i_timestamp], $ms))) {
                // moved to a new $timeframe -> create a new $candle from opening $trade
                $ohlcvs[] = [
                    $openingTime, // timestamp
                    $trade['price'], // O
                    $trade['price'], // H
                    $trade['price'], // L
                    $trade['price'], // C
                    $trade['amount'], // V
                    1, // count
                ];
            } else {
                // still processing the same $timeframe -> update opening $trade
                $ohlcvs[$candle][$i_high] = max ($ohlcvs[$candle][$i_high], $trade['price']);
                $ohlcvs[$candle][$i_low] = min ($ohlcvs[$candle][$i_low], $trade['price']);
                $ohlcvs[$candle][$i_close] = $trade['price'];
                $ohlcvs[$candle][$i_volume] = $this->sum ($ohlcvs[$candle][$i_volume], $trade['amount']);
                $ohlcvs[$candle][$i_count] = $this->sum ($ohlcvs[$candle][$i_count], 1);
            }
        }
        return $ohlcvs;
    }

    public function parse_trading_view_ohlcv($ohlcvs, $market = null, $timeframe = '1m', ?int $since = null, ?int $limit = null) {
        $result = $this->convert_trading_view_to_ohlcv($ohlcvs);
        return $this->parse_ohlcvs($result, $market, $timeframe, $since, $limit);
    }

    public function edit_limit_buy_order(string $id, string $symbol, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $amount, $price, $params) {
            return Async\await($this->edit_limit_order($id, $symbol, 'buy', $amount, $price, $params));
        }) ();
    }

    public function edit_limit_sell_order(string $id, string $symbol, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $amount, $price, $params) {
            return Async\await($this->edit_limit_order($id, $symbol, 'sell', $amount, $price, $params));
        }) ();
    }

    public function edit_limit_order(string $id, string $symbol, string $side, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $side, $amount, $price, $params) {
            return Async\await($this->edit_order($id, $symbol, 'limit', $side, $amount, $price, $params));
        }) ();
    }

    public function edit_order(string $id, string $symbol, string $type, string $side, ?float $amount = null, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $type, $side, $amount, $price, $params) {
            Async\await($this->cancelOrder ($id, $symbol));
            return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $params));
        }) ();
    }

    public function edit_order_ws(string $id, string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $type, $side, $amount, $price, $params) {
            Async\await($this->cancelOrderWs ($id, $symbol));
            return Async\await($this->createOrderWs ($symbol, $type, $side, $amount, $price, $params));
        }) ();
    }

    public function fetch_permissions($params = array ()) {
        throw new NotSupported($this->id . ' fetchPermissions() is not supported yet');
    }

    public function fetch_position(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPosition() is not supported yet');
    }

    public function watch_position(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchPosition() is not supported yet');
    }

    public function watch_positions(?array $symbols = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchPositions() is not supported yet');
    }

    public function watch_position_for_symbols(?array $symbols = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbols, $since, $limit, $params) {
            return Async\await($this->watchPositions ($symbols, $since, $limit, $params));
        }) ();
    }

    public function fetch_positions_for_symbol(string $symbol, $params = array ()) {
        /**
         * fetches all open positions for specific $symbol, unlike fetchPositions (which is designed to work with multiple symbols) so this method might be preffered for one-market position, because of less rate-limit consumption and speed
         * @param {string} $symbol unified market $symbol
         * @param {array} $params extra parameters specific to the endpoint
         * @return {array[]} a list of ~@link https://docs.ccxt.com/#/?id=position-structure position structure~ with maximum 3 items - possible one position for "one-way" mode, and possible two positions (long & short) for "two-way" (a.k.a. hedge) mode
         */
        throw new NotSupported($this->id . ' fetchPositionsForSymbol() is not supported yet');
    }

    public function fetch_positions(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositions() is not supported yet');
    }

    public function fetch_positions_risk(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositionsRisk() is not supported yet');
    }

    public function fetch_bids_asks(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchBidsAsks() is not supported yet');
    }

    public function fetch_borrow_interest(?string $code = null, ?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchBorrowInterest() is not supported yet');
    }

    public function fetch_ledger(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLedger() is not supported yet');
    }

    public function fetch_ledger_entry(string $id, ?string $code = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLedgerEntry() is not supported yet');
    }

    public function parse_bid_ask($bidask, int|string $priceKey = 0, int|string $amountKey = 1, int|string $countOrIdKey = 2) {
        $price = $this->safe_number($bidask, $priceKey);
        $amount = $this->safe_number($bidask, $amountKey);
        $countOrId = $this->safe_integer($bidask, $countOrIdKey);
        $bidAsk = array( $price, $amount );
        if ($countOrId !== null) {
            $bidAsk[] = $countOrId;
        }
        return $bidAsk;
    }

    public function safe_currency(?string $currencyId, ?array $currency = null) {
        if (($currencyId === null) && ($currency !== null)) {
            return $currency;
        }
        if (($this->currencies_by_id !== null) && (is_array($this->currencies_by_id) && array_key_exists($currencyId, $this->currencies_by_id)) && ($this->currencies_by_id[$currencyId] !== null)) {
            return $this->currencies_by_id[$currencyId];
        }
        $code = $currencyId;
        if ($currencyId !== null) {
            $code = $this->common_currency_code(strtoupper($currencyId));
        }
        return array(
            'id' => $currencyId,
            'code' => $code,
            'precision' => null,
        );
    }

    public function safe_market(?string $marketId, ?array $market = null, ?string $delimiter = null, ?string $marketType = null) {
        $result = $this->safe_market_structure(array(
            'symbol' => $marketId,
            'marketId' => $marketId,
        ));
        if ($marketId !== null) {
            if (($this->markets_by_id !== null) && (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id))) {
                $markets = $this->markets_by_id[$marketId];
                $numMarkets = count($markets);
                if ($numMarkets === 1) {
                    return $markets[0];
                } else {
                    if ($marketType === null) {
                        if ($market === null) {
                            throw new ArgumentsRequired($this->id . ' safeMarket() requires a fourth argument for ' . $marketId . ' to disambiguate between different $markets with the same $market id');
                        } else {
                            $marketType = $market['type'];
                        }
                    }
                    for ($i = 0; $i < count($markets); $i++) {
                        $currentMarket = $markets[$i];
                        if ($currentMarket[$marketType]) {
                            return $currentMarket;
                        }
                    }
                }
            } elseif ($delimiter !== null && $delimiter !== '') {
                $parts = explode($delimiter, $marketId);
                $partsLength = count($parts);
                if ($partsLength === 2) {
                    $result['baseId'] = $this->safe_string($parts, 0);
                    $result['quoteId'] = $this->safe_string($parts, 1);
                    $result['base'] = $this->safe_currency_code($result['baseId']);
                    $result['quote'] = $this->safe_currency_code($result['quoteId']);
                    $result['symbol'] = $result['base'] . '/' . $result['quote'];
                    return $result;
                } else {
                    return $result;
                }
            }
        }
        if ($market !== null) {
            return $market;
        }
        return $result;
    }

    public function check_required_credentials($error = true) {
        $keys = is_array($this->requiredCredentials) ? array_keys($this->requiredCredentials) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if ($this->requiredCredentials[$key] && !$this->$key) {
                if ($error) {
                    throw new AuthenticationError($this->id . ' requires "' . $key . '" credential');
                } else {
                    return false;
                }
            }
        }
        return true;
    }

    public function oath() {
        if ($this->twofa !== null) {
            return $this->totp($this->twofa);
        } else {
            throw new ExchangeError($this->id . ' exchange.twofa has not been set for 2FA Two-Factor Authentication');
        }
    }

    public function fetch_balance($params = array ()) {
        throw new NotSupported($this->id . ' fetchBalance() is not supported yet');
    }

    public function fetch_balance_ws($params = array ()) {
        throw new NotSupported($this->id . ' fetchBalanceWs() is not supported yet');
    }

    public function parse_balance($response) {
        throw new NotSupported($this->id . ' parseBalance() is not supported yet');
    }

    public function watch_balance($params = array ()) {
        throw new NotSupported($this->id . ' watchBalance() is not supported yet');
    }

    public function fetch_partial_balance($part, $params = array ()) {
        return Async\async(function () use ($part, $params) {
            $balance = Async\await($this->fetch_balance($params));
            return $balance[$part];
        }) ();
    }

    public function fetch_free_balance($params = array ()) {
        return Async\async(function () use ($params) {
            return Async\await($this->fetch_partial_balance('free', $params));
        }) ();
    }

    public function fetch_used_balance($params = array ()) {
        return Async\async(function () use ($params) {
            return Async\await($this->fetch_partial_balance('used', $params));
        }) ();
    }

    public function fetch_total_balance($params = array ()) {
        return Async\async(function () use ($params) {
            return Async\await($this->fetch_partial_balance('total', $params));
        }) ();
    }

    public function fetch_status($params = array ()) {
        throw new NotSupported($this->id . ' fetchStatus() is not supported yet');
    }

    public function fetch_funding_fee(string $code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            $warnOnFetchFundingFee = $this->safe_bool($this->options, 'warnOnFetchFundingFee', true);
            if ($warnOnFetchFundingFee) {
                throw new NotSupported($this->id . ' fetchFundingFee() method is deprecated, it will be removed in July 2022, please, use fetchTransactionFee() or set exchange.options["warnOnFetchFundingFee"] = false to suppress this warning');
            }
            return Async\await($this->fetch_transaction_fee($code, $params));
        }) ();
    }

    public function fetch_funding_fees(?array $codes = null, $params = array ()) {
        return Async\async(function () use ($codes, $params) {
            $warnOnFetchFundingFees = $this->safe_bool($this->options, 'warnOnFetchFundingFees', true);
            if ($warnOnFetchFundingFees) {
                throw new NotSupported($this->id . ' fetchFundingFees() method is deprecated, it will be removed in July 2022. Please, use fetchTransactionFees() or set exchange.options["warnOnFetchFundingFees"] = false to suppress this warning');
            }
            return Async\await($this->fetch_transaction_fees($codes, $params));
        }) ();
    }

    public function fetch_transaction_fee(string $code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            if (!$this->has['fetchTransactionFees']) {
                throw new NotSupported($this->id . ' fetchTransactionFee() is not supported yet');
            }
            return Async\await($this->fetch_transaction_fees(array( $code ), $params));
        }) ();
    }

    public function fetch_transaction_fees(?array $codes = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTransactionFees() is not supported yet');
    }

    public function fetch_deposit_withdraw_fees(?array $codes = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositWithdrawFees() is not supported yet');
    }

    public function fetch_deposit_withdraw_fee(string $code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            if (!$this->has['fetchDepositWithdrawFees']) {
                throw new NotSupported($this->id . ' fetchDepositWithdrawFee() is not supported yet');
            }
            $fees = Async\await($this->fetchDepositWithdrawFees (array( $code ), $params));
            return $this->safe_value($fees, $code);
        }) ();
    }

    public function get_supported_mapping($key, $mapping = array ()) {
        if (is_array($mapping) && array_key_exists($key, $mapping)) {
            return $mapping[$key];
        } else {
            throw new NotSupported($this->id . ' ' . $key . ' does not have a value in mapping');
        }
    }

    public function fetch_cross_borrow_rate(string $code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            Async\await($this->load_markets());
            if (!$this->has['fetchBorrowRates']) {
                throw new NotSupported($this->id . ' fetchCrossBorrowRate() is not supported yet');
            }
            $borrowRates = Async\await($this->fetchCrossBorrowRates ($params));
            $rate = $this->safe_value($borrowRates, $code);
            if ($rate === null) {
                throw new ExchangeError($this->id . ' fetchCrossBorrowRate() could not find the borrow $rate for currency $code ' . $code);
            }
            return $rate;
        }) ();
    }

    public function fetch_isolated_borrow_rate(string $symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            Async\await($this->load_markets());
            if (!$this->has['fetchBorrowRates']) {
                throw new NotSupported($this->id . ' fetchIsolatedBorrowRate() is not supported yet');
            }
            $borrowRates = Async\await($this->fetchIsolatedBorrowRates ($params));
            $rate = $this->safe_dict($borrowRates, $symbol);
            if ($rate === null) {
                throw new ExchangeError($this->id . ' fetchIsolatedBorrowRate() could not find the borrow $rate for market $symbol ' . $symbol);
            }
            return $rate;
        }) ();
    }

    public function handle_option_and_params(array $params, string $methodName, string $optionName, $defaultValue = null) {
        // This method can be used to obtain method specific properties, i.e => $this->handle_option_and_params($params, 'fetchPosition', 'marginMode', 'isolated')
        $defaultOptionName = 'default' . $this->capitalize ($optionName); // we also need to check the 'defaultXyzWhatever'
        // check if $params contain the key
        $value = $this->safe_value_2($params, $optionName, $defaultOptionName);
        if ($value !== null) {
            $params = $this->omit ($params, array( $optionName, $defaultOptionName ));
        } else {
            // handle routed methods like "watchTrades > watchTradesForSymbols" (or "watchTicker > watchTickers")
            list($methodName, $params) = $this->handleParamString ($params, 'callerMethodName', $methodName);
            // check if exchange has properties for this method
            $exchangeWideMethodOptions = $this->safe_value($this->options, $methodName);
            if ($exchangeWideMethodOptions !== null) {
                // check if the option is defined inside this method's props
                $value = $this->safe_value_2($exchangeWideMethodOptions, $optionName, $defaultOptionName);
            }
            if ($value === null) {
                // if it's still null, check if global exchange-wide option exists
                $value = $this->safe_value_2($this->options, $optionName, $defaultOptionName);
            }
            // if it's still null, use the default $value
            $value = ($value !== null) ? $value : $defaultValue;
        }
        return array( $value, $params );
    }

    public function handle_option_and_params_2(array $params, string $methodName, string $methodName2, string $optionName, $defaultValue = null) {
        // This method can be used to obtain method specific properties, i.e => $this->handle_option_and_params($params, 'fetchPosition', 'marginMode', 'isolated')
        $defaultOptionName = 'default' . $this->capitalize ($optionName); // we also need to check the 'defaultXyzWhatever'
        // check if $params contain the key
        $value = $this->safe_value_2($params, $optionName, $defaultOptionName);
        if ($value !== null) {
            $params = $this->omit ($params, array( $optionName, $defaultOptionName ));
        } else {
            // check if exchange has properties for this method
            $exchangeWideMethodOptions = $this->safe_value_2($this->options, $methodName, $methodName2);
            if ($exchangeWideMethodOptions !== null) {
                // check if the option is defined inside this method's props
                $value = $this->safe_value_2($exchangeWideMethodOptions, $optionName, $defaultOptionName);
            }
            if ($value === null) {
                // if it's still null, check if global exchange-wide option exists
                $value = $this->safe_value_2($this->options, $optionName, $defaultOptionName);
            }
            // if it's still null, use the default $value
            $value = ($value !== null) ? $value : $defaultValue;
        }
        return array( $value, $params );
    }

    public function handle_option(string $methodName, string $optionName, $defaultValue = null) {
        // eslint-disable-next-line no-unused-vars
        list($result, $empty) = $this->handle_option_and_params(array(), $methodName, $optionName, $defaultValue);
        return $result;
    }

    public function handle_market_type_and_params(string $methodName, ?array $market = null, $params = array ()) {
        $defaultType = $this->safe_string_2($this->options, 'defaultType', 'type', 'spot');
        $methodOptions = $this->safe_dict($this->options, $methodName);
        $methodType = $defaultType;
        if ($methodOptions !== null) {
            if (gettype($methodOptions) === 'string') {
                $methodType = $methodOptions;
            } else {
                $methodType = $this->safe_string_2($methodOptions, 'defaultType', 'type', $methodType);
            }
        }
        $marketType = ($market === null) ? $methodType : $market['type'];
        $type = $this->safe_string_2($params, 'defaultType', 'type', $marketType);
        $params = $this->omit ($params, array( 'defaultType', 'type' ));
        return array( $type, $params );
    }

    public function handle_sub_type_and_params(string $methodName, $market = null, $params = array (), $defaultValue = null) {
        $subType = null;
        // if set in $params, it takes precedence
        $subTypeInParams = $this->safe_string_2($params, 'subType', 'defaultSubType');
        // avoid omitting if it's not present
        if ($subTypeInParams !== null) {
            $subType = $subTypeInParams;
            $params = $this->omit ($params, array( 'subType', 'defaultSubType' ));
        } else {
            // at first, check from $market object
            if ($market !== null) {
                if ($market['linear']) {
                    $subType = 'linear';
                } elseif ($market['inverse']) {
                    $subType = 'inverse';
                }
            }
            // if it was not defined in $market object
            if ($subType === null) {
                $values = $this->handle_option_and_params(array(), $methodName, 'subType', $defaultValue); // no need to re-test $params here
                $subType = $values[0];
            }
        }
        return array( $subType, $params );
    }

    public function handle_margin_mode_and_params(string $methodName, $params = array (), $defaultValue = null) {
        /**
         * @ignore
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {Array} the marginMode in lowercase by $params["marginMode"], $params["defaultMarginMode"] $this->options["marginMode"] or $this->options["defaultMarginMode"]
         */
        return $this->handle_option_and_params($params, $methodName, 'marginMode', $defaultValue);
    }

    public function throw_exactly_matched_exception($exact, $string, $message) {
        if ($string === null) {
            return;
        }
        if (is_array($exact) && array_key_exists($string, $exact)) {
            throw new $exact[$string]($message);
        }
    }

    public function throw_broadly_matched_exception($broad, $string, $message) {
        $broadKey = $this->find_broadly_matched_key($broad, $string);
        if ($broadKey !== null) {
            throw new $broad[$broadKey]($message);
        }
    }

    public function find_broadly_matched_key($broad, $string) {
        // a helper for matching error strings exactly vs broadly
        $keys = is_array($broad) ? array_keys($broad) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if ($string !== null) { // #issues/12698
                if (mb_strpos($string, $key) !== false) {
                    return $key;
                }
            }
        }
        return null;
    }

    public function handle_errors($statusCode, $statusText, $url, $method, $responseHeaders, $responseBody, $response, $requestHeaders, $requestBody) {
        // it is a stub $method that must be overrided in the derived exchange classes
        // throw new NotSupported($this->id . ' handleErrors() not implemented yet');
        return null;
    }

    public function calculate_rate_limiter_cost($api, $method, $path, $params, $config = array ()) {
        return $this->safe_value($config, 'cost', 1);
    }

    public function fetch_ticker(string $symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if ($this->has['fetchTickers']) {
                Async\await($this->load_markets());
                $market = $this->market ($symbol);
                $symbol = $market['symbol'];
                $tickers = Async\await($this->fetch_tickers(array( $symbol ), $params));
                $ticker = $this->safe_dict($tickers, $symbol);
                if ($ticker === null) {
                    throw new NullResponse($this->id . ' fetchTickers() could not find a $ticker for ' . $symbol);
                } else {
                    return $ticker;
                }
            } else {
                throw new NotSupported($this->id . ' fetchTicker() is not supported yet');
            }
        }) ();
    }

    public function watch_ticker(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' watchTicker() is not supported yet');
    }

    public function fetch_tickers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTickers() is not supported yet');
    }

    public function fetch_order_books(?array $symbols = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderBooks() is not supported yet');
    }

    public function watch_tickers(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchTickers() is not supported yet');
    }

    public function fetch_order(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrder() is not supported yet');
    }

    public function fetch_order_ws(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderWs() is not supported yet');
    }

    public function fetch_order_status(string $id, ?string $symbol = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $params) {
            // TODO => TypeScript => change method signature by replacing
            // Promise<string> with Promise<Order['status']>.
            $order = Async\await($this->fetch_order($id, $symbol, $params));
            return $order['status'];
        }) ();
    }

    public function fetch_unified_order($order, $params = array ()) {
        return Async\async(function () use ($order, $params) {
            return Async\await($this->fetch_order($this->safe_string($order, 'id'), $this->safe_string($order, 'symbol'), $params));
        }) ();
    }

    public function create_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        throw new NotSupported($this->id . ' createOrder() is not supported yet');
    }

    public function create_trailing_amount_order(string $symbol, string $type, string $side, $amount, $price = null, $trailingAmount = null, $trailingTriggerPrice = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $trailingAmount, $trailingTriggerPrice, $params) {
            /**
             * create a trailing order by providing the $symbol, $type, $side, $amount, $price and $trailingAmount
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {string} $type 'market' or 'limit'
             * @param {string} $side 'buy' or 'sell'
             * @param {float} $amount how much you want to trade in units of the base currency, or number of contracts
             * @param {float} [$price] the $price for the order to be filled at, in units of the quote currency, ignored in market orders
             * @param {float} $trailingAmount the quote $amount to trail away from the current market $price
             * @param {float} [$trailingTriggerPrice] the $price to activate a trailing order, default uses the $price argument
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if ($trailingAmount === null) {
                throw new ArgumentsRequired($this->id . ' createTrailingAmountOrder() requires a $trailingAmount argument');
            }
            $params['trailingAmount'] = $trailingAmount;
            if ($trailingTriggerPrice !== null) {
                $params['trailingTriggerPrice'] = $trailingTriggerPrice;
            }
            if ($this->has['createTrailingAmountOrder']) {
                return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $params));
            }
            throw new NotSupported($this->id . ' createTrailingAmountOrder() is not supported yet');
        }) ();
    }

    public function create_trailing_percent_order(string $symbol, string $type, string $side, $amount, $price = null, $trailingPercent = null, $trailingTriggerPrice = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $trailingPercent, $trailingTriggerPrice, $params) {
            /**
             * create a trailing order by providing the $symbol, $type, $side, $amount, $price and $trailingPercent
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {string} $type 'market' or 'limit'
             * @param {string} $side 'buy' or 'sell'
             * @param {float} $amount how much you want to trade in units of the base currency, or number of contracts
             * @param {float} [$price] the $price for the order to be filled at, in units of the quote currency, ignored in market orders
             * @param {float} $trailingPercent the percent to trail away from the current market $price
             * @param {float} [$trailingTriggerPrice] the $price to activate a trailing order, default uses the $price argument
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if ($trailingPercent === null) {
                throw new ArgumentsRequired($this->id . ' createTrailingPercentOrder() requires a $trailingPercent argument');
            }
            $params['trailingPercent'] = $trailingPercent;
            if ($trailingTriggerPrice !== null) {
                $params['trailingTriggerPrice'] = $trailingTriggerPrice;
            }
            if ($this->has['createTrailingPercentOrder']) {
                return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $params));
            }
            throw new NotSupported($this->id . ' createTrailingPercentOrder() is not supported yet');
        }) ();
    }

    public function create_market_order_with_cost(string $symbol, string $side, float $cost, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $cost, $params) {
            /**
             * create a market order by providing the $symbol, $side and $cost
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {string} $side 'buy' or 'sell'
             * @param {float} $cost how much you want to trade in units of the quote currency
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if ($this->has['createMarketOrderWithCost'] || ($this->has['createMarketBuyOrderWithCost'] && $this->has['createMarketSellOrderWithCost'])) {
                return Async\await($this->create_order($symbol, 'market', $side, $cost, 1, $params));
            }
            throw new NotSupported($this->id . ' createMarketOrderWithCost() is not supported yet');
        }) ();
    }

    public function create_market_buy_order_with_cost(string $symbol, float $cost, $params = array ()) {
        return Async\async(function () use ($symbol, $cost, $params) {
            /**
             * create a market buy order by providing the $symbol and $cost
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {float} $cost how much you want to trade in units of the quote currency
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if ($this->options['createMarketBuyOrderRequiresPrice'] || $this->has['createMarketBuyOrderWithCost']) {
                return Async\await($this->create_order($symbol, 'market', 'buy', $cost, 1, $params));
            }
            throw new NotSupported($this->id . ' createMarketBuyOrderWithCost() is not supported yet');
        }) ();
    }

    public function create_market_sell_order_with_cost(string $symbol, float $cost, $params = array ()) {
        return Async\async(function () use ($symbol, $cost, $params) {
            /**
             * create a market sell order by providing the $symbol and $cost
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {float} $cost how much you want to trade in units of the quote currency
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if ($this->options['createMarketSellOrderRequiresPrice'] || $this->has['createMarketSellOrderWithCost']) {
                return Async\await($this->create_order($symbol, 'market', 'sell', $cost, 1, $params));
            }
            throw new NotSupported($this->id . ' createMarketSellOrderWithCost() is not supported yet');
        }) ();
    }

    public function create_trigger_order(string $symbol, string $type, string $side, $amount, $price = null, $triggerPrice = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $triggerPrice, $params) {
            /**
             * create a trigger stop order ($type 1)
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {string} $type 'market' or 'limit'
             * @param {string} $side 'buy' or 'sell'
             * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} $triggerPrice the $price to trigger the stop order, in units of the quote currency
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if ($triggerPrice === null) {
                throw new ArgumentsRequired($this->id . ' createTriggerOrder() requires a $triggerPrice argument');
            }
            $params['triggerPrice'] = $triggerPrice;
            if ($this->has['createTriggerOrder']) {
                return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $params));
            }
            throw new NotSupported($this->id . ' createTriggerOrder() is not supported yet');
        }) ();
    }

    public function create_stop_loss_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $stopLossPrice = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $stopLossPrice, $params) {
            /**
             * create a trigger stop loss order ($type 2)
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {string} $type 'market' or 'limit'
             * @param {string} $side 'buy' or 'sell'
             * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} $stopLossPrice the $price to trigger the stop loss order, in units of the quote currency
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if ($stopLossPrice === null) {
                throw new ArgumentsRequired($this->id . ' createStopLossOrder() requires a $stopLossPrice argument');
            }
            $params['stopLossPrice'] = $stopLossPrice;
            if ($this->has['createStopLossOrder']) {
                return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $params));
            }
            throw new NotSupported($this->id . ' createStopLossOrder() is not supported yet');
        }) ();
    }

    public function create_take_profit_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $takeProfitPrice = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $takeProfitPrice, $params) {
            /**
             * create a trigger take profit order ($type 2)
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {string} $type 'market' or 'limit'
             * @param {string} $side 'buy' or 'sell'
             * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} $takeProfitPrice the $price to trigger the take profit order, in units of the quote currency
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if ($takeProfitPrice === null) {
                throw new ArgumentsRequired($this->id . ' createTakeProfitOrder() requires a $takeProfitPrice argument');
            }
            $params['takeProfitPrice'] = $takeProfitPrice;
            if ($this->has['createTakeProfitOrder']) {
                return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $params));
            }
            throw new NotSupported($this->id . ' createTakeProfitOrder() is not supported yet');
        }) ();
    }

    public function create_order_with_take_profit_and_stop_loss(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $takeProfit = null, ?float $stopLoss = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $takeProfit, $stopLoss, $params) {
            /**
             * create an order with a stop loss or take profit attached ($type 3)
             * @param {string} $symbol unified $symbol of the market to create an order in
             * @param {string} $type 'market' or 'limit'
             * @param {string} $side 'buy' or 'sell'
             * @param {float} $amount how much you want to trade in units of the base currency or the number of contracts
             * @param {float} [$price] the $price to fulfill the order, in units of the quote currency, ignored in market orders
             * @param {float} [$takeProfit] the take profit $price, in units of the quote currency
             * @param {float} [$stopLoss] the stop loss $price, in units of the quote currency
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @param {string} [$params->takeProfitType] *not available on all exchanges* 'limit' or 'market'
             * @param {string} [$params->stopLossType] *not available on all exchanges* 'limit' or 'market'
             * @param {string} [$params->takeProfitPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
             * @param {string} [$params->stopLossPriceType] *not available on all exchanges* 'last', 'mark' or 'index'
             * @param {float} [$params->takeProfitLimitPrice] *not available on all exchanges* limit $price for a limit take profit order
             * @param {float} [$params->stopLossLimitPrice] *not available on all exchanges* stop loss for a limit stop loss order
             * @param {float} [$params->takeProfitAmount] *not available on all exchanges* the $amount for a take profit
             * @param {float} [$params->stopLossAmount] *not available on all exchanges* the $amount for a stop loss
             * @return {array} an ~@link https://docs.ccxt.com/#/?id=order-structure order structure~
             */
            if (($takeProfit === null) && ($stopLoss === null)) {
                throw new ArgumentsRequired($this->id . ' createOrderWithTakeProfitAndStopLoss() requires either a $takeProfit or $stopLoss argument');
            }
            if ($takeProfit !== null) {
                $params['takeProfit'] = array(
                    'triggerPrice' => $takeProfit,
                );
            }
            if ($stopLoss !== null) {
                $params['stopLoss'] = array(
                    'triggerPrice' => $stopLoss,
                );
            }
            $takeProfitType = $this->safe_string($params, 'takeProfitType');
            $takeProfitPriceType = $this->safe_string($params, 'takeProfitPriceType');
            $takeProfitLimitPrice = $this->safe_string($params, 'takeProfitLimitPrice');
            $takeProfitAmount = $this->safe_string($params, 'takeProfitAmount');
            $stopLossType = $this->safe_string($params, 'stopLossType');
            $stopLossPriceType = $this->safe_string($params, 'stopLossPriceType');
            $stopLossLimitPrice = $this->safe_string($params, 'stopLossLimitPrice');
            $stopLossAmount = $this->safe_string($params, 'stopLossAmount');
            if ($takeProfitType !== null) {
                $params['takeProfit']['type'] = $takeProfitType;
            }
            if ($takeProfitPriceType !== null) {
                $params['takeProfit']['priceType'] = $takeProfitPriceType;
            }
            if ($takeProfitLimitPrice !== null) {
                $params['takeProfit']['price'] = $this->parse_to_numeric($takeProfitLimitPrice);
            }
            if ($takeProfitAmount !== null) {
                $params['takeProfit']['amount'] = $this->parse_to_numeric($takeProfitAmount);
            }
            if ($stopLossType !== null) {
                $params['stopLoss']['type'] = $stopLossType;
            }
            if ($stopLossPriceType !== null) {
                $params['stopLoss']['priceType'] = $stopLossPriceType;
            }
            if ($stopLossLimitPrice !== null) {
                $params['stopLoss']['price'] = $this->parse_to_numeric($stopLossLimitPrice);
            }
            if ($stopLossAmount !== null) {
                $params['stopLoss']['amount'] = $this->parse_to_numeric($stopLossAmount);
            }
            $params = $this->omit ($params, array( 'takeProfitType', 'takeProfitPriceType', 'takeProfitLimitPrice', 'takeProfitAmount', 'stopLossType', 'stopLossPriceType', 'stopLossLimitPrice', 'stopLossAmount' ));
            if ($this->has['createOrderWithTakeProfitAndStopLoss']) {
                return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $params));
            }
            throw new NotSupported($this->id . ' createOrderWithTakeProfitAndStopLoss() is not supported yet');
        }) ();
    }

    public function create_orders(array $orders, $params = array ()) {
        throw new NotSupported($this->id . ' createOrders() is not supported yet');
    }

    public function create_order_ws(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        throw new NotSupported($this->id . ' createOrderWs() is not supported yet');
    }

    public function cancel_order(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrder() is not supported yet');
    }

    public function cancel_order_ws(string $id, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrderWs() is not supported yet');
    }

    public function cancel_orders_ws(array $ids, ?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrdersWs() is not supported yet');
    }

    public function cancel_all_orders(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelAllOrders() is not supported yet');
    }

    public function cancel_all_orders_ws(?string $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelAllOrdersWs() is not supported yet');
    }

    public function cancel_unified_order($order, $params = array ()) {
        return $this->cancelOrder ($this->safe_string($order, 'id'), $this->safe_string($order, 'symbol'), $params);
    }

    public function fetch_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        if ($this->has['fetchOpenOrders'] && $this->has['fetchClosedOrders']) {
            throw new NotSupported($this->id . ' fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead');
        }
        throw new NotSupported($this->id . ' fetchOrders() is not supported yet');
    }

    public function fetch_orders_ws(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrdersWs() is not supported yet');
    }

    public function fetch_order_trades(string $id, ?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrderTrades() is not supported yet');
    }

    public function watch_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchOrders() is not supported yet');
    }

    public function fetch_open_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $since, $limit, $params) {
            if ($this->has['fetchOrders']) {
                $orders = Async\await($this->fetch_orders($symbol, $since, $limit, $params));
                return $this->filter_by($orders, 'status', 'open');
            }
            throw new NotSupported($this->id . ' fetchOpenOrders() is not supported yet');
        }) ();
    }

    public function fetch_open_orders_ws(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $since, $limit, $params) {
            if ($this->has['fetchOrdersWs']) {
                $orders = Async\await($this->fetchOrdersWs ($symbol, $since, $limit, $params));
                return $this->filter_by($orders, 'status', 'open');
            }
            throw new NotSupported($this->id . ' fetchOpenOrdersWs() is not supported yet');
        }) ();
    }

    public function fetch_closed_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $since, $limit, $params) {
            if ($this->has['fetchOrders']) {
                $orders = Async\await($this->fetch_orders($symbol, $since, $limit, $params));
                return $this->filter_by($orders, 'status', 'closed');
            }
            throw new NotSupported($this->id . ' fetchClosedOrders() is not supported yet');
        }) ();
    }

    public function fetch_canceled_and_closed_orders(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchCanceledAndClosedOrders() is not supported yet');
    }

    public function fetch_closed_orders_ws(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $since, $limit, $params) {
            if ($this->has['fetchOrdersWs']) {
                $orders = Async\await($this->fetchOrdersWs ($symbol, $since, $limit, $params));
                return $this->filter_by($orders, 'status', 'closed');
            }
            throw new NotSupported($this->id . ' fetchClosedOrdersWs() is not supported yet');
        }) ();
    }

    public function fetch_my_trades(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMyTrades() is not supported yet');
    }

    public function fetch_my_liquidations(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMyLiquidations() is not supported yet');
    }

    public function fetch_liquidations(string $symbol, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLiquidations() is not supported yet');
    }

    public function fetch_my_trades_ws(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMyTradesWs() is not supported yet');
    }

    public function watch_my_trades(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' watchMyTrades() is not supported yet');
    }

    public function fetch_greeks(string $symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchGreeks() is not supported yet');
    }

    public function fetch_deposits_withdrawals(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetch history of deposits and withdrawals
         * @param {string} [$code] unified currency $code for the currency of the deposit/withdrawals, default is null
         * @param {int} [$since] timestamp in ms of the earliest deposit/withdrawal, default is null
         * @param {int} [$limit] max number of deposit/withdrawals to return, default is null
         * @param {array} [$params] extra parameters specific to the exchange API endpoint
         * @return {array} a list of ~@link https://docs.ccxt.com/#/?id=transaction-structure transaction structures~
         */
        throw new NotSupported($this->id . ' fetchDepositsWithdrawals() is not supported yet');
    }

    public function fetch_deposits(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDeposits() is not supported yet');
    }

    public function fetch_withdrawals(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchWithdrawals() is not supported yet');
    }

    public function fetch_deposits_ws(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDepositsWs() is not supported yet');
    }

    public function fetch_withdrawals_ws(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchWithdrawalsWs() is not supported yet');
    }

    public function fetch_funding_rate_history(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchFundingRateHistory() is not supported yet');
    }

    public function fetch_funding_history(?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchFundingHistory() is not supported yet');
    }

    public function close_position(string $symbol, ?string $side = null, $params = array ()) {
        throw new NotSupported($this->id . ' closePosition() is not supported yet');
    }

    public function close_all_positions($params = array ()) {
        throw new NotSupported($this->id . ' closeAllPositions() is not supported yet');
    }

    public function fetch_l3_order_book(string $symbol, ?int $limit = null, $params = array ()) {
        throw new BadRequest($this->id . ' fetchL3OrderBook() is not supported yet');
    }

    public function parse_last_price($price, ?array $market = null) {
        throw new NotSupported($this->id . ' parseLastPrice() is not supported yet');
    }

    public function fetch_deposit_address(string $code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            if ($this->has['fetchDepositAddresses']) {
                $depositAddresses = Async\await($this->fetchDepositAddresses (array( $code ), $params));
                $depositAddress = $this->safe_value($depositAddresses, $code);
                if ($depositAddress === null) {
                    throw new InvalidAddress($this->id . ' fetchDepositAddress() could not find a deposit address for ' . $code . ', make sure you have created a corresponding deposit address in your wallet on the exchange website');
                } else {
                    return $depositAddress;
                }
            } elseif ($this->has['fetchDepositAddressesByNetwork']) {
                $network = $this->safe_string($params, 'network');
                $params = $this->omit ($params, 'network');
                $addressStructures = Async\await($this->fetchDepositAddressesByNetwork ($code, $params));
                if ($network !== null) {
                    return $this->safe_dict($addressStructures, $network);
                } else {
                    $keys = is_array($addressStructures) ? array_keys($addressStructures) : array();
                    $key = $this->safe_string($keys, 0);
                    return $this->safe_dict($addressStructures, $key);
                }
            } else {
                throw new NotSupported($this->id . ' fetchDepositAddress() is not supported yet');
            }
        }) ();
    }

    public function account(): array {
        return array(
            'free' => null,
            'used' => null,
            'total' => null,
        );
    }

    public function common_currency_code(string $currency) {
        if (!$this->substituteCommonCurrencyCodes) {
            return $currency;
        }
        return $this->safe_string($this->commonCurrencies, $currency, $currency);
    }

    public function currency(string $code) {
        if ($this->currencies === null) {
            throw new ExchangeError($this->id . ' currencies not loaded');
        }
        if (gettype($code) === 'string') {
            if (is_array($this->currencies) && array_key_exists($code, $this->currencies)) {
                return $this->currencies[$code];
            } elseif (is_array($this->currencies_by_id) && array_key_exists($code, $this->currencies_by_id)) {
                return $this->currencies_by_id[$code];
            }
        }
        throw new ExchangeError($this->id . ' does not have currency $code ' . $code);
    }

    public function market(string $symbol) {
        if ($this->markets === null) {
            throw new ExchangeError($this->id . ' $markets not loaded');
        }
        if (is_array($this->markets) && array_key_exists($symbol, $this->markets)) {
            return $this->markets[$symbol];
        } elseif (is_array($this->markets_by_id) && array_key_exists($symbol, $this->markets_by_id)) {
            $markets = $this->markets_by_id[$symbol];
            $defaultType = $this->safe_string_2($this->options, 'defaultType', 'defaultSubType', 'spot');
            for ($i = 0; $i < count($markets); $i++) {
                $market = $markets[$i];
                if ($market[$defaultType]) {
                    return $market;
                }
            }
            return $markets[0];
        } elseif ((str_ends_with($symbol, '-C')) || (str_ends_with($symbol, '-P')) || (str_starts_with($symbol, 'C-')) || (str_starts_with($symbol, 'P-'))) {
            return $this->createExpiredOptionMarket ($symbol);
        }
        throw new BadSymbol($this->id . ' does not have $market $symbol ' . $symbol);
    }

    public function create_expired_option_market(string $symbol) {
        throw new NotSupported($this->id . ' createExpiredOptionMarket () is not supported yet');
    }

    public function handle_withdraw_tag_and_params($tag, $params) {
        if (($tag !== null) && (gettype($tag) === 'array')) {
            $params = array_merge($tag, $params);
            $tag = null;
        }
        if ($tag === null) {
            $tag = $this->safe_string($params, 'tag');
            if ($tag !== null) {
                $params = $this->omit ($params, 'tag');
            }
        }
        return array( $tag, $params );
    }

    public function create_limit_order(string $symbol, string $side, float $amount, float $price, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $amount, $price, $params) {
            return Async\await($this->create_order($symbol, 'limit', $side, $amount, $price, $params));
        }) ();
    }

    public function create_market_order(string $symbol, string $side, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $amount, $price, $params) {
            return Async\await($this->create_order($symbol, 'market', $side, $amount, $price, $params));
        }) ();
    }

    public function create_limit_buy_order(string $symbol, float $amount, float $price, $params = array ()) {
        return Async\async(function () use ($symbol, $amount, $price, $params) {
            return Async\await($this->create_order($symbol, 'limit', 'buy', $amount, $price, $params));
        }) ();
    }

    public function create_limit_sell_order(string $symbol, float $amount, float $price, $params = array ()) {
        return Async\async(function () use ($symbol, $amount, $price, $params) {
            return Async\await($this->create_order($symbol, 'limit', 'sell', $amount, $price, $params));
        }) ();
    }

    public function create_market_buy_order(string $symbol, float $amount, $params = array ()) {
        return Async\async(function () use ($symbol, $amount, $params) {
            return Async\await($this->create_order($symbol, 'market', 'buy', $amount, null, $params));
        }) ();
    }

    public function create_market_sell_order(string $symbol, float $amount, $params = array ()) {
        return Async\async(function () use ($symbol, $amount, $params) {
            return Async\await($this->create_order($symbol, 'market', 'sell', $amount, null, $params));
        }) ();
    }

    public function cost_to_precision(string $symbol, $cost) {
        $market = $this->market ($symbol);
        return $this->decimal_to_precision($cost, TRUNCATE, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function price_to_precision(string $symbol, $price) {
        $market = $this->market ($symbol);
        $result = $this->decimal_to_precision($price, ROUND, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
        if ($result === '0') {
            throw new InvalidOrder($this->id . ' $price of ' . $market['symbol'] . ' must be greater than minimum $price precision of ' . $this->number_to_string($market['precision']['price']));
        }
        return $result;
    }

    public function amount_to_precision(string $symbol, $amount) {
        $market = $this->market ($symbol);
        $result = $this->decimal_to_precision($amount, TRUNCATE, $market['precision']['amount'], $this->precisionMode, $this->paddingMode);
        if ($result === '0') {
            throw new InvalidOrder($this->id . ' $amount of ' . $market['symbol'] . ' must be greater than minimum $amount precision of ' . $this->number_to_string($market['precision']['amount']));
        }
        return $result;
    }

    public function fee_to_precision(string $symbol, $fee) {
        $market = $this->market ($symbol);
        return $this->decimal_to_precision($fee, ROUND, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function currency_to_precision(string $code, $fee, $networkCode = null) {
        $currency = $this->currencies[$code];
        $precision = $this->safe_value($currency, 'precision');
        if ($networkCode !== null) {
            $networks = $this->safe_dict($currency, 'networks', array());
            $networkItem = $this->safe_dict($networks, $networkCode, array());
            $precision = $this->safe_value($networkItem, 'precision', $precision);
        }
        if ($precision === null) {
            return $this->forceString ($fee);
        } else {
            return $this->decimal_to_precision($fee, ROUND, $precision, $this->precisionMode, $this->paddingMode);
        }
    }

    public function force_string($value) {
        if (gettype($value) !== 'string') {
            return $this->number_to_string($value);
        }
        return $value;
    }

    public function is_tick_precision() {
        return $this->precisionMode === TICK_SIZE;
    }

    public function is_decimal_precision() {
        return $this->precisionMode === DECIMAL_PLACES;
    }

    public function is_significant_precision() {
        return $this->precisionMode === SIGNIFICANT_DIGITS;
    }

    public function safe_number(array $obj, int|string $key, ?float $defaultNumber = null) {
        $value = $this->safe_string($obj, $key);
        return $this->parse_number($value, $defaultNumber);
    }

    public function safe_number_n(array $obj, array $arr, ?float $defaultNumber = null) {
        $value = $this->safe_string_n($obj, $arr);
        return $this->parse_number($value, $defaultNumber);
    }

    public function parse_precision(?string $precision) {
        /**
         * @ignore
         * @param {string} $precision The number of digits to the right of the decimal
         * @return {string} a string number equal to 1e-$precision
         */
        if ($precision === null) {
            return null;
        }
        $precisionNumber = intval($precision);
        if ($precisionNumber === 0) {
            return '1';
        }
        $parsedPrecision = '0.';
        for ($i = 0; $i < $precisionNumber - 1; $i++) {
            $parsedPrecision = $parsedPrecision . '0';
        }
        return $parsedPrecision . '1';
    }

    public function load_time_difference($params = array ()) {
        return Async\async(function () use ($params) {
            $serverTime = Async\await($this->fetch_time($params));
            $after = $this->milliseconds ();
            $this->options['timeDifference'] = $after - $serverTime;
            return $this->options['timeDifference'];
        }) ();
    }

    public function implode_hostname(string $url) {
        return $this->implode_params($url, array( 'hostname' => $this->hostname ));
    }

    public function fetch_market_leverage_tiers(string $symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if ($this->has['fetchLeverageTiers']) {
                $market = $this->market ($symbol);
                if (!$market['contract']) {
                    throw new BadSymbol($this->id . ' fetchMarketLeverageTiers() supports contract markets only');
                }
                $tiers = Async\await($this->fetch_leverage_tiers(array( $symbol )));
                return $this->safe_value($tiers, $symbol);
            } else {
                throw new NotSupported($this->id . ' fetchMarketLeverageTiers() is not supported yet');
            }
        }) ();
    }

    public function create_post_only_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $params) {
            if (!$this->has['createPostOnlyOrder']) {
                throw new NotSupported($this->id . 'createPostOnlyOrder() is not supported yet');
            }
            $query = array_merge($params, array( 'postOnly' => true ));
            return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $query));
        }) ();
    }

    public function create_reduce_only_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $params) {
            if (!$this->has['createReduceOnlyOrder']) {
                throw new NotSupported($this->id . 'createReduceOnlyOrder() is not supported yet');
            }
            $query = array_merge($params, array( 'reduceOnly' => true ));
            return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $query));
        }) ();
    }

    public function create_stop_order(string $symbol, string $type, string $side, float $amount, ?float $price = null, ?float $stopPrice = null, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $stopPrice, $params) {
            if (!$this->has['createStopOrder']) {
                throw new NotSupported($this->id . ' createStopOrder() is not supported yet');
            }
            if ($stopPrice === null) {
                throw new ArgumentsRequired($this->id . ' create_stop_order() requires a $stopPrice argument');
            }
            $query = array_merge($params, array( 'stopPrice' => $stopPrice ));
            return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $query));
        }) ();
    }

    public function create_stop_limit_order(string $symbol, string $side, float $amount, float $price, float $stopPrice, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $amount, $price, $stopPrice, $params) {
            if (!$this->has['createStopLimitOrder']) {
                throw new NotSupported($this->id . ' createStopLimitOrder() is not supported yet');
            }
            $query = array_merge($params, array( 'stopPrice' => $stopPrice ));
            return Async\await($this->create_order($symbol, 'limit', $side, $amount, $price, $query));
        }) ();
    }

    public function create_stop_market_order(string $symbol, string $side, float $amount, float $stopPrice, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $amount, $stopPrice, $params) {
            if (!$this->has['createStopMarketOrder']) {
                throw new NotSupported($this->id . ' createStopMarketOrder() is not supported yet');
            }
            $query = array_merge($params, array( 'stopPrice' => $stopPrice ));
            return Async\await($this->create_order($symbol, 'market', $side, $amount, null, $query));
        }) ();
    }

    public function safe_currency_code(?string $currencyId, ?array $currency = null) {
        $currency = $this->safe_currency($currencyId, $currency);
        return $currency['code'];
    }

    public function filter_by_symbol_since_limit($array, ?string $symbol = null, ?int $since = null, ?int $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'symbol', $symbol, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_currency_since_limit($array, $code = null, ?int $since = null, ?int $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'currency', $code, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_symbols_since_limit($array, ?array $symbols = null, ?int $since = null, ?int $limit = null, $tail = false) {
        $result = $this->filter_by_array($array, 'symbol', $symbols, false);
        return $this->filter_by_since_limit($result, $since, $limit, 'timestamp', $tail);
    }

    public function parse_last_prices($pricesData, ?array $symbols = null, $params = array ()) {
        //
        // the value of tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1' => array( ... ),
        //         'marketId2' => array( ... ),
        //         ...
        //     }
        //
        // list
        //
        //     array(
        //         array( 'market' => 'marketId1', ... ),
        //         array( 'market' => 'marketId2', ... ),
        //         ...
        //     )
        //
        $results = array();
        if (gettype($pricesData) === 'array' && array_keys($pricesData) === array_keys(array_keys($pricesData))) {
            for ($i = 0; $i < count($pricesData); $i++) {
                $priceData = array_merge($this->parseLastPrice ($pricesData[$i]), $params);
                $results[] = $priceData;
            }
        } else {
            $marketIds = is_array($pricesData) ? array_keys($pricesData) : array();
            for ($i = 0; $i < count($marketIds); $i++) {
                $marketId = $marketIds[$i];
                $market = $this->safe_market($marketId);
                $priceData = array_merge($this->parseLastPrice ($pricesData[$marketId], $market), $params);
                $results[] = $priceData;
            }
        }
        $symbols = $this->market_symbols($symbols);
        return $this->filter_by_array($results, 'symbol', $symbols);
    }

    public function parse_tickers($tickers, ?array $symbols = null, $params = array ()) {
        //
        // the value of $tickers is either a dict or a list
        //
        // dict
        //
        //     {
        //         'marketId1' => array( ... ),
        //         'marketId2' => array( ... ),
        //         'marketId3' => array( ... ),
        //         ...
        //     }
        //
        // list
        //
        //     array(
        //         array( 'market' => 'marketId1', ... ),
        //         array( 'market' => 'marketId2', ... ),
        //         array( 'market' => 'marketId3', ... ),
        //         ...
        //     )
        //
        $results = array();
        if (gettype($tickers) === 'array' && array_keys($tickers) === array_keys(array_keys($tickers))) {
            for ($i = 0; $i < count($tickers); $i++) {
                $ticker = array_merge($this->parse_ticker($tickers[$i]), $params);
                $results[] = $ticker;
            }
        } else {
            $marketIds = is_array($tickers) ? array_keys($tickers) : array();
            for ($i = 0; $i < count($marketIds); $i++) {
                $marketId = $marketIds[$i];
                $market = $this->safe_market($marketId);
                $ticker = array_merge($this->parse_ticker($tickers[$marketId], $market), $params);
                $results[] = $ticker;
            }
        }
        $symbols = $this->market_symbols($symbols);
        return $this->filter_by_array($results, 'symbol', $symbols);
    }

    public function parse_deposit_addresses($addresses, ?array $codes = null, $indexed = true, $params = array ()) {
        $result = array();
        for ($i = 0; $i < count($addresses); $i++) {
            $address = array_merge($this->parse_deposit_address($addresses[$i]), $params);
            $result[] = $address;
        }
        if ($codes !== null) {
            $result = $this->filter_by_array($result, 'currency', $codes, false);
        }
        if ($indexed) {
            return $this->index_by($result, 'currency');
        }
        return $result;
    }

    public function parse_borrow_interests($response, ?array $market = null) {
        $interests = array();
        for ($i = 0; $i < count($response); $i++) {
            $row = $response[$i];
            $interests[] = $this->parse_borrow_interest($row, $market);
        }
        return $interests;
    }

    public function parse_funding_rate_histories($response, $market = null, ?int $since = null, ?int $limit = null) {
        $rates = array();
        for ($i = 0; $i < count($response); $i++) {
            $entry = $response[$i];
            $rates[] = $this->parse_funding_rate_history($entry, $market);
        }
        $sorted = $this->sort_by($rates, 'timestamp');
        $symbol = ($market === null) ? null : $market['symbol'];
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function safe_symbol(?string $marketId, ?array $market = null, ?string $delimiter = null, ?string $marketType = null) {
        $market = $this->safe_market($marketId, $market, $delimiter, $marketType);
        return $market['symbol'];
    }

    public function parse_funding_rate(string $contract, ?array $market = null) {
        throw new NotSupported($this->id . ' parseFundingRate() is not supported yet');
    }

    public function parse_funding_rates($response, ?array $market = null) {
        $result = array();
        for ($i = 0; $i < count($response); $i++) {
            $parsed = $this->parse_funding_rate($response[$i], $market);
            $result[$parsed['symbol']] = $parsed;
        }
        return $result;
    }

    public function is_trigger_order($params) {
        $isTrigger = $this->safe_bool_2($params, 'trigger', 'stop');
        if ($isTrigger) {
            $params = $this->omit ($params, array( 'trigger', 'stop' ));
        }
        return array( $isTrigger, $params );
    }

    public function is_post_only(bool $isMarketOrder, $exchangeSpecificParam, $params = array ()) {
        /**
         * @ignore
         * @param {string} type Order type
         * @param {boolean} $exchangeSpecificParam exchange specific $postOnly
         * @param {array} [$params] exchange specific $params
         * @return {boolean} true if a post only order, false otherwise
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce');
        $postOnly = $this->safe_bool_2($params, 'postOnly', 'post_only', false);
        // we assume $timeInForce is uppercase from safeStringUpper ($params, 'timeInForce')
        $ioc = $timeInForce === 'IOC';
        $fok = $timeInForce === 'FOK';
        $timeInForcePostOnly = $timeInForce === 'PO';
        $postOnly = $postOnly || $timeInForcePostOnly || $exchangeSpecificParam;
        if ($postOnly) {
            if ($ioc || $fok) {
                throw new InvalidOrder($this->id . ' $postOnly orders cannot have $timeInForce equal to ' . $timeInForce);
            } elseif ($isMarketOrder) {
                throw new InvalidOrder($this->id . ' market orders cannot be postOnly');
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    public function handle_post_only(bool $isMarketOrder, bool $exchangeSpecificPostOnlyOption, mixed $params = array ()) {
        /**
         * @ignore
         * @param {string} type Order type
         * @param {boolean} exchangeSpecificBoolean exchange specific $postOnly
         * @param {array} [$params] exchange specific $params
         * @return {Array}
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce');
        $postOnly = $this->safe_bool($params, 'postOnly', false);
        $ioc = $timeInForce === 'IOC';
        $fok = $timeInForce === 'FOK';
        $po = $timeInForce === 'PO';
        $postOnly = $postOnly || $po || $exchangeSpecificPostOnlyOption;
        if ($postOnly) {
            if ($ioc || $fok) {
                throw new InvalidOrder($this->id . ' $postOnly orders cannot have $timeInForce equal to ' . $timeInForce);
            } elseif ($isMarketOrder) {
                throw new InvalidOrder($this->id . ' market orders cannot be postOnly');
            } else {
                if ($po) {
                    $params = $this->omit ($params, 'timeInForce');
                }
                $params = $this->omit ($params, 'postOnly');
                return array( true, $params );
            }
        }
        return array( false, $params );
    }

    public function fetch_last_prices(?array $symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchLastPrices() is not supported yet');
    }

    public function fetch_trading_fees($params = array ()) {
        throw new NotSupported($this->id . ' fetchTradingFees() is not supported yet');
    }

    public function fetch_trading_fees_ws($params = array ()) {
        throw new NotSupported($this->id . ' fetchTradingFeesWs() is not supported yet');
    }

    public function fetch_trading_fee(string $symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if (!$this->has['fetchTradingFees']) {
                throw new NotSupported($this->id . ' fetchTradingFee() is not supported yet');
            }
            return Async\await($this->fetch_trading_fees($params));
        }) ();
    }

    public function parse_open_interest($interest, ?array $market = null) {
        throw new NotSupported($this->id . ' parseOpenInterest () is not supported yet');
    }

    public function parse_open_interests($response, $market = null, ?int $since = null, ?int $limit = null) {
        $interests = array();
        for ($i = 0; $i < count($response); $i++) {
            $entry = $response[$i];
            $interest = $this->parse_open_interest($entry, $market);
            $interests[] = $interest;
        }
        $sorted = $this->sort_by($interests, 'timestamp');
        $symbol = $this->safe_string($market, 'symbol');
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function fetch_funding_rate(string $symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if ($this->has['fetchFundingRates']) {
                Async\await($this->load_markets());
                $market = $this->market ($symbol);
                $symbol = $market['symbol'];
                if (!$market['contract']) {
                    throw new BadSymbol($this->id . ' fetchFundingRate() supports contract markets only');
                }
                $rates = Async\await($this->fetchFundingRates (array( $symbol ), $params));
                $rate = $this->safe_value($rates, $symbol);
                if ($rate === null) {
                    throw new NullResponse($this->id . ' fetchFundingRate () returned no data for ' . $symbol);
                } else {
                    return $rate;
                }
            } else {
                throw new NotSupported($this->id . ' fetchFundingRate () is not supported yet');
            }
        }) ();
    }

    public function fetch_mark_ohlcv($symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $timeframe, $since, $limit, $params) {
            /**
             * fetches historical mark price candlestick data containing the open, high, low, and close price of a market
             * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
             * @param {string} $timeframe the length of time each candle represents
             * @param {int} [$since] timestamp in ms of the earliest candle to fetch
             * @param {int} [$limit] the maximum amount of candles to fetch
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {float[][]} A list of candles ordered, open, high, low, close, null
             */
            if ($this->has['fetchMarkOHLCV']) {
                $request = array(
                    'price' => 'mark',
                );
                return Async\await($this->fetch_ohlcv($symbol, $timeframe, $since, $limit, array_merge($request, $params)));
            } else {
                throw new NotSupported($this->id . ' fetchMarkOHLCV () is not supported yet');
            }
        }) ();
    }

    public function fetch_index_ohlcv(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $timeframe, $since, $limit, $params) {
            /**
             * fetches historical index price candlestick data containing the open, high, low, and close price of a market
             * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
             * @param {string} $timeframe the length of time each candle represents
             * @param {int} [$since] timestamp in ms of the earliest candle to fetch
             * @param {int} [$limit] the maximum amount of candles to fetch
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return array() A list of candles ordered, open, high, low, close, null
             */
            if ($this->has['fetchIndexOHLCV']) {
                $request = array(
                    'price' => 'index',
                );
                return Async\await($this->fetch_ohlcv($symbol, $timeframe, $since, $limit, array_merge($request, $params)));
            } else {
                throw new NotSupported($this->id . ' fetchIndexOHLCV () is not supported yet');
            }
        }) ();
    }

    public function fetch_premium_index_ohlcv(string $symbol, $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $timeframe, $since, $limit, $params) {
            /**
             * fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
             * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
             * @param {string} $timeframe the length of time each candle represents
             * @param {int} [$since] timestamp in ms of the earliest candle to fetch
             * @param {int} [$limit] the maximum amount of candles to fetch
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {float[][]} A list of candles ordered, open, high, low, close, null
             */
            if ($this->has['fetchPremiumIndexOHLCV']) {
                $request = array(
                    'price' => 'premiumIndex',
                );
                return Async\await($this->fetch_ohlcv($symbol, $timeframe, $since, $limit, array_merge($request, $params)));
            } else {
                throw new NotSupported($this->id . ' fetchPremiumIndexOHLCV () is not supported yet');
            }
        }) ();
    }

    public function handle_time_in_force($params = array ()) {
        /**
         * @ignore
         * Must add $timeInForce to $this->options to use this method
         * @return {string} returns the exchange specific value for $timeInForce
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce'); // supported values GTC, IOC, PO
        if ($timeInForce !== null) {
            $exchangeValue = $this->safe_string($this->options['timeInForce'], $timeInForce);
            if ($exchangeValue === null) {
                throw new ExchangeError($this->id . ' does not support $timeInForce "' . $timeInForce . '"');
            }
            return $exchangeValue;
        }
        return null;
    }

    public function convert_type_to_account($account) {
        /**
         * @ignore
         * Must add $accountsByType to $this->options to use this method
         * @param {string} $account key for $account name in $this->options['accountsByType']
         * @return the exchange specific $account name or the isolated margin id for transfers
         */
        $accountsByType = $this->safe_dict($this->options, 'accountsByType', array());
        $lowercaseAccount = strtolower($account);
        if (is_array($accountsByType) && array_key_exists($lowercaseAccount, $accountsByType)) {
            return $accountsByType[$lowercaseAccount];
        } elseif ((is_array($this->markets) && array_key_exists($account, $this->markets)) || (is_array($this->markets_by_id) && array_key_exists($account, $this->markets_by_id))) {
            $market = $this->market ($account);
            return $market['id'];
        } else {
            return $account;
        }
    }

    public function check_required_argument(string $methodName, $argument, $argumentName, $options = []) {
        /**
         * @ignore
         * @param {string} $methodName the name of the method that the $argument is being checked for
         * @param {string} $argument the argument's actual value provided
         * @param {string} $argumentName the name of the $argument being checked (for logging purposes)
         * @param {string[]} $options a list of $options that the $argument can be
         * @return {null}
         */
        $optionsLength = count($options);
        if (($argument === null) || (($optionsLength > 0) && (!($this->in_array($argument, $options))))) {
            $messageOptions = implode(', ', $options);
            $message = $this->id . ' ' . $methodName . '() requires a ' . $argumentName . ' argument';
            if ($messageOptions !== '') {
                $message .= ', one of ' . '(' . $messageOptions . ')';
            }
            throw new ArgumentsRequired($message);
        }
    }

    public function check_required_margin_argument(string $methodName, ?string $symbol, string $marginMode) {
        /**
         * @ignore
         * @param {string} $symbol unified $symbol of the market
         * @param {string} $methodName name of the method that requires a $symbol
         * @param {string} $marginMode is either 'isolated' or 'cross'
         */
        if (($marginMode === 'isolated') && ($symbol === null)) {
            throw new ArgumentsRequired($this->id . ' ' . $methodName . '() requires a $symbol argument for isolated margin');
        } elseif (($marginMode === 'cross') && ($symbol !== null)) {
            throw new ArgumentsRequired($this->id . ' ' . $methodName . '() cannot have a $symbol argument for cross margin');
        }
    }

    public function parse_deposit_withdraw_fees($response, ?array $codes = null, $currencyIdKey = null) {
        /**
         * @ignore
         * @param {object[]|array} $response unparsed $response from the exchange
         * @param {string[]|null} $codes the unified $currency $codes to fetch transactions fees for, returns all currencies when null
         * @param {str} $currencyIdKey *should only be null when $response is a $dictionary* the object key that corresponds to the $currency id
         * @return {array} objects with withdraw and deposit fees, indexed by $currency $codes
         */
        $depositWithdrawFees = array();
        $codes = $this->marketCodes ($codes);
        $isArray = gettype($response) === 'array' && array_keys($response) === array_keys(array_keys($response));
        $responseKeys = $response;
        if (!$isArray) {
            $responseKeys = is_array($response) ? array_keys($response) : array();
        }
        for ($i = 0; $i < count($responseKeys); $i++) {
            $entry = $responseKeys[$i];
            $dictionary = $isArray ? $entry : $response[$entry];
            $currencyId = $isArray ? $this->safe_string($dictionary, $currencyIdKey) : $entry;
            $currency = $this->safe_value($this->currencies_by_id, $currencyId);
            $code = $this->safe_string($currency, 'code', $currencyId);
            if (($codes === null) || ($this->in_array($code, $codes))) {
                $depositWithdrawFees[$code] = $this->parseDepositWithdrawFee ($dictionary, $currency);
            }
        }
        return $depositWithdrawFees;
    }

    public function parse_deposit_withdraw_fee($fee, ?array $currency = null) {
        throw new NotSupported($this->id . ' parseDepositWithdrawFee() is not supported yet');
    }

    public function deposit_withdraw_fee($info) {
        return array(
            'deposit' => array(
                'fee' => null,
                'percentage' => null,
            ),
            'info' => $info,
            'networks' => array(),
            'withdraw' => array(
                'fee' => null,
                'percentage' => null,
            ),
        );
    }

    public function assign_default_deposit_withdraw_fees($fee, $currency = null) {
        /**
         * @ignore
         * Takes a depositWithdrawFee structure and assigns the default values for withdraw and deposit
         * @param {array} $fee A deposit withdraw $fee structure
         * @param {array} $currency A $currency structure, the response from $this->currency ()
         * @return {array} A deposit withdraw $fee structure
         */
        $networkKeys = is_array($fee['networks']) ? array_keys($fee['networks']) : array();
        $numNetworks = count($networkKeys);
        if ($numNetworks === 1) {
            $fee['withdraw'] = $fee['networks'][$networkKeys[0]]['withdraw'];
            $fee['deposit'] = $fee['networks'][$networkKeys[0]]['deposit'];
            return $fee;
        }
        $currencyCode = $this->safe_string($currency, 'code');
        for ($i = 0; $i < $numNetworks; $i++) {
            $network = $networkKeys[$i];
            if ($network === $currencyCode) {
                $fee['deposit'] = $fee['networks'][$networkKeys[$i]]['deposit'];
                $fee['withdraw'] = $fee['networks'][$networkKeys[$i]]['withdraw'];
            }
        }
        return $fee;
    }

    public function parse_income($info, ?array $market = null) {
        throw new NotSupported($this->id . ' parseIncome () is not supported yet');
    }

    public function parse_incomes($incomes, $market = null, ?int $since = null, ?int $limit = null) {
        /**
         * @ignore
         * parses funding fee info from exchange response
         * @param {array[]} $incomes each item describes once instance of currency being received or paid
         * @param {array} $market ccxt $market
         * @param {int} [$since] when defined, the response items are filtered to only include items after this timestamp
         * @param {int} [$limit] limits the number of items in the response
         * @return {array[]} an array of ~@link https://docs.ccxt.com/#/?id=funding-history-structure funding history structures~
         */
        $result = array();
        for ($i = 0; $i < count($incomes); $i++) {
            $entry = $incomes[$i];
            $parsed = $this->parse_income($entry, $market);
            $result[] = $parsed;
        }
        $sorted = $this->sort_by($result, 'timestamp');
        return $this->filter_by_since_limit($sorted, $since, $limit);
    }

    public function get_market_from_symbols(?array $symbols = null) {
        if ($symbols === null) {
            return null;
        }
        $firstMarket = $this->safe_string($symbols, 0);
        $market = $this->market ($firstMarket);
        return $market;
    }

    public function parse_ws_ohlcvs(mixed $ohlcvs, mixed $market = null, string $timeframe = '1m', ?int $since = null, ?int $limit = null) {
        $results = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $results[] = $this->parse_ws_ohlcv($ohlcvs[$i], $market);
        }
        return $results;
    }

    public function fetch_transactions(?string $code = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($code, $since, $limit, $params) {
            /**
             * @deprecated
             * *DEPRECATED* use fetchDepositsWithdrawals instead
             * @param {string} $code unified currency $code for the currency of the deposit/withdrawals, default is null
             * @param {int} [$since] timestamp in ms of the earliest deposit/withdrawal, default is null
             * @param {int} [$limit] max number of deposit/withdrawals to return, default is null
             * @param {array} [$params] extra parameters specific to the exchange API endpoint
             * @return {array} a list of ~@link https://docs.ccxt.com/#/?id=transaction-structure transaction structures~
             */
            if ($this->has['fetchDepositsWithdrawals']) {
                return Async\await($this->fetchDepositsWithdrawals ($code, $since, $limit, $params));
            } else {
                throw new NotSupported($this->id . ' fetchTransactions () is not supported yet');
            }
        }) ();
    }

    public function filter_by_array_positions($objects, int|string $key, $values = null, $indexed = true) {
        /**
         * @ignore
         * Typed wrapper for filterByArray that returns a list of positions
         */
        return $this->filter_by_array($objects, $key, $values, $indexed);
    }

    public function filter_by_array_tickers($objects, int|string $key, $values = null, $indexed = true) {
        /**
         * @ignore
         * Typed wrapper for filterByArray that returns a dictionary of tickers
         */
        return $this->filter_by_array($objects, $key, $values, $indexed);
    }

    public function create_ohlcv_object(string $symbol, string $timeframe, $data) {
        $res = array();
        $res[$symbol] = array();
        $res[$symbol][$timeframe] = $data;
        return $res;
    }

    public function handle_max_entries_per_request_and_params(string $method, ?int $maxEntriesPerRequest = null, $params = array ()) {
        $newMaxEntriesPerRequest = null;
        list($newMaxEntriesPerRequest, $params) = $this->handle_option_and_params($params, $method, 'maxEntriesPerRequest');
        if (($newMaxEntriesPerRequest !== null) && ($newMaxEntriesPerRequest !== $maxEntriesPerRequest)) {
            $maxEntriesPerRequest = $newMaxEntriesPerRequest;
        }
        if ($maxEntriesPerRequest === null) {
            $maxEntriesPerRequest = 1000; // default to 1000
        }
        return array( $maxEntriesPerRequest, $params );
    }

    public function fetch_paginated_call_dynamic(string $method, ?string $symbol = null, ?int $since = null, ?int $limit = null, $params = array (), ?int $maxEntriesPerRequest = null) {
        return Async\async(function () use ($method, $symbol, $since, $limit, $params, $maxEntriesPerRequest) {
            $maxCalls = null;
            list($maxCalls, $params) = $this->handle_option_and_params($params, $method, 'paginationCalls', 10);
            $maxRetries = null;
            list($maxRetries, $params) = $this->handle_option_and_params($params, $method, 'maxRetries', 3);
            $paginationDirection = null;
            list($paginationDirection, $params) = $this->handle_option_and_params($params, $method, 'paginationDirection', 'backward');
            $paginationTimestamp = null;
            $calls = 0;
            $result = array();
            $errors = 0;
            $until = $this->safe_integer_2($params, 'untill', 'till'); // do not omit it from $params here
            list($maxEntriesPerRequest, $params) = $this->handle_max_entries_per_request_and_params($method, $maxEntriesPerRequest, $params);
            if (($paginationDirection === 'forward')) {
                if ($since === null) {
                    throw new ArgumentsRequired($this->id . ' pagination requires a $since argument when $paginationDirection set to forward');
                }
                $paginationTimestamp = $since;
            }
            while (($calls < $maxCalls)) {
                $calls += 1;
                try {
                    if ($paginationDirection === 'backward') {
                        // do it backwards, starting from the $last
                        // UNTIL filtering is required in order to work
                        if ($paginationTimestamp !== null) {
                            $params['until'] = $paginationTimestamp - 1;
                        }
                        $response = Async\await($this->$method ($symbol, null, $maxEntriesPerRequest, $params));
                        $responseLength = count($response);
                        if ($this->verbose) {
                            $backwardMessage = 'Dynamic pagination call ' . $calls . ' $method ' . $method . ' $response length ' . $responseLength . ' timestamp ' . $paginationTimestamp;
                            $this->log ($backwardMessage);
                        }
                        if ($responseLength === 0) {
                            break;
                        }
                        $errors = 0;
                        $result = $this->array_concat($result, $response);
                        $firstElement = $this->safe_value($response, 0);
                        $paginationTimestamp = $this->safe_integer_2($firstElement, 'timestamp', 0);
                        if (($since !== null) && ($paginationTimestamp <= $since)) {
                            break;
                        }
                    } else {
                        // do it forwards, starting from the $since
                        $response = Async\await($this->$method ($symbol, $paginationTimestamp, $maxEntriesPerRequest, $params));
                        $responseLength = count($response);
                        if ($this->verbose) {
                            $forwardMessage = 'Dynamic pagination call ' . $calls . ' $method ' . $method . ' $response length ' . $responseLength . ' timestamp ' . $paginationTimestamp;
                            $this->log ($forwardMessage);
                        }
                        if ($responseLength === 0) {
                            break;
                        }
                        $errors = 0;
                        $result = $this->array_concat($result, $response);
                        $last = $this->safe_value($response, $responseLength - 1);
                        $paginationTimestamp = $this->safe_integer($last, 'timestamp') - 1;
                        if (($until !== null) && ($paginationTimestamp >= $until)) {
                            break;
                        }
                    }
                } catch (Exception $e) {
                    $errors += 1;
                    if ($errors > $maxRetries) {
                        throw $e;
                    }
                }
            }
            $uniqueResults = $this->remove_repeated_elements_from_array($result);
            $key = ($method === 'fetchOHLCV') ? 0 : 'timestamp';
            return $this->filter_by_since_limit($uniqueResults, $since, $limit, $key);
        }) ();
    }

    public function safe_deterministic_call(string $method, ?string $symbol = null, ?int $since = null, ?int $limit = null, ?string $timeframe = null, $params = array ()) {
        return Async\async(function () use ($method, $symbol, $since, $limit, $timeframe, $params) {
            $maxRetries = null;
            list($maxRetries, $params) = $this->handle_option_and_params($params, $method, 'maxRetries', 3);
            $errors = 0;
            try {
                if ($timeframe && $method !== 'fetchFundingRateHistory') {
                    return Async\await($this->$method ($symbol, $timeframe, $since, $limit, $params));
                } else {
                    return Async\await($this->$method ($symbol, $since, $limit, $params));
                }
            } catch (Exception $e) {
                if ($e instanceof RateLimitExceeded) {
                    throw $e; // if we are rate limited, we should not retry and fail fast
                }
                $errors += 1;
                if ($errors > $maxRetries) {
                    throw $e;
                }
            }
            return null;
        }) ();
    }

    public function fetch_paginated_call_deterministic(string $method, ?string $symbol = null, ?int $since = null, ?int $limit = null, ?string $timeframe = null, $params = array (), $maxEntriesPerRequest = null) {
        return Async\async(function () use ($method, $symbol, $since, $limit, $timeframe, $params, $maxEntriesPerRequest) {
            $maxCalls = null;
            list($maxCalls, $params) = $this->handle_option_and_params($params, $method, 'paginationCalls', 10);
            list($maxEntriesPerRequest, $params) = $this->handle_max_entries_per_request_and_params($method, $maxEntriesPerRequest, $params);
            $current = $this->milliseconds ();
            $tasks = array();
            $time = $this->parse_timeframe($timeframe) * 1000;
            $step = $time * $maxEntriesPerRequest;
            $currentSince = $current - ($maxCalls * $step) - 1;
            if ($since !== null) {
                $currentSince = max ($currentSince, $since);
            }
            $until = $this->safe_integer_2($params, 'until', 'till'); // do not omit it here
            if ($until !== null) {
                $requiredCalls = (int) ceil(($until - $since) / $step);
                if ($requiredCalls > $maxCalls) {
                    throw new BadRequest($this->id . ' the number of required calls is greater than the max number of calls allowed, either increase the paginationCalls or decrease the $since-$until gap. Current paginationCalls $limit is ' . (string) $maxCalls . ' required calls is ' . (string) $requiredCalls);
                }
            }
            for ($i = 0; $i < $maxCalls; $i++) {
                if (($until !== null) && ($currentSince >= $until)) {
                    break;
                }
                $tasks[] = $this->safe_deterministic_call($method, $symbol, $currentSince, $maxEntriesPerRequest, $timeframe, $params);
                $currentSince = $this->sum ($currentSince, $step) - 1;
            }
            $results = Async\await(Promise\all($tasks));
            $result = array();
            for ($i = 0; $i < count($results); $i++) {
                $result = $this->array_concat($result, $results[$i]);
            }
            $uniqueResults = $this->remove_repeated_elements_from_array($result);
            $key = ($method === 'fetchOHLCV') ? 0 : 'timestamp';
            return $this->filter_by_since_limit($uniqueResults, $since, $limit, $key);
        }) ();
    }

    public function fetch_paginated_call_cursor(string $method, ?string $symbol = null, $since = null, $limit = null, $params = array (), $cursorReceived = null, $cursorSent = null, $cursorIncrement = null, $maxEntriesPerRequest = null) {
        return Async\async(function () use ($method, $symbol, $since, $limit, $params, $cursorReceived, $cursorSent, $cursorIncrement, $maxEntriesPerRequest) {
            $maxCalls = null;
            list($maxCalls, $params) = $this->handle_option_and_params($params, $method, 'paginationCalls', 10);
            $maxRetries = null;
            list($maxRetries, $params) = $this->handle_option_and_params($params, $method, 'maxRetries', 3);
            list($maxEntriesPerRequest, $params) = $this->handle_max_entries_per_request_and_params($method, $maxEntriesPerRequest, $params);
            $cursorValue = null;
            $i = 0;
            $errors = 0;
            $result = array();
            while ($i < $maxCalls) {
                try {
                    if ($cursorValue !== null) {
                        if ($cursorIncrement !== null) {
                            $cursorValue = $this->parseToInt ($cursorValue) . $cursorIncrement;
                        }
                        $params[$cursorSent] = $cursorValue;
                    }
                    $response = null;
                    if ($method === 'fetchAccounts') {
                        $response = Async\await($this->$method ($params));
                    } else {
                        $response = Async\await($this->$method ($symbol, $since, $maxEntriesPerRequest, $params));
                    }
                    $errors = 0;
                    $responseLength = count($response);
                    if ($this->verbose) {
                        $iteration = ($i . (string) 1);
                        $cursorMessage = 'Cursor pagination call ' . $iteration . ' $method ' . $method . ' $response length ' . (string) $responseLength . ' cursor ' . $cursorValue;
                        $this->log ($cursorMessage);
                    }
                    if ($responseLength === 0) {
                        break;
                    }
                    $result = $this->array_concat($result, $response);
                    $last = $this->safe_value($response, $responseLength - 1);
                    $cursorValue = $this->safe_value($last['info'], $cursorReceived);
                    if ($cursorValue === null) {
                        break;
                    }
                    $lastTimestamp = $this->safe_integer($last, 'timestamp');
                    if ($lastTimestamp !== null && $lastTimestamp < $since) {
                        break;
                    }
                } catch (Exception $e) {
                    $errors += 1;
                    if ($errors > $maxRetries) {
                        throw $e;
                    }
                }
                $i += 1;
            }
            $sorted = $this->sortCursorPaginatedResult ($result);
            $key = ($method === 'fetchOHLCV') ? 0 : 'timestamp';
            return $this->filter_by_since_limit($sorted, $since, $limit, $key);
        }) ();
    }

    public function fetch_paginated_call_incremental(string $method, ?string $symbol = null, $since = null, $limit = null, $params = array (), $pageKey = null, $maxEntriesPerRequest = null) {
        return Async\async(function () use ($method, $symbol, $since, $limit, $params, $pageKey, $maxEntriesPerRequest) {
            $maxCalls = null;
            list($maxCalls, $params) = $this->handle_option_and_params($params, $method, 'paginationCalls', 10);
            $maxRetries = null;
            list($maxRetries, $params) = $this->handle_option_and_params($params, $method, 'maxRetries', 3);
            list($maxEntriesPerRequest, $params) = $this->handle_max_entries_per_request_and_params($method, $maxEntriesPerRequest, $params);
            $i = 0;
            $errors = 0;
            $result = array();
            while ($i < $maxCalls) {
                try {
                    $params[$pageKey] = $i + 1;
                    $response = Async\await($this->$method ($symbol, $since, $maxEntriesPerRequest, $params));
                    $errors = 0;
                    $responseLength = count($response);
                    if ($this->verbose) {
                        $iteration = ($i . (string) 1);
                        $incrementalMessage = 'Incremental pagination call ' . $iteration . ' $method ' . $method . ' $response length ' . (string) $responseLength;
                        $this->log ($incrementalMessage);
                    }
                    if ($responseLength === 0) {
                        break;
                    }
                    $result = $this->array_concat($result, $response);
                } catch (Exception $e) {
                    $errors += 1;
                    if ($errors > $maxRetries) {
                        throw $e;
                    }
                }
                $i += 1;
            }
            $sorted = $this->sortCursorPaginatedResult ($result);
            $key = ($method === 'fetchOHLCV') ? 0 : 'timestamp';
            return $this->filter_by_since_limit($sorted, $since, $limit, $key);
        }) ();
    }

    public function sort_cursor_paginated_result($result) {
        $first = $this->safe_value($result, 0);
        if ($first !== null) {
            if (is_array($first) && array_key_exists('timestamp', $first)) {
                return $this->sort_by($result, 'timestamp', true);
            }
            if (is_array($first) && array_key_exists('id', $first)) {
                return $this->sort_by($result, 'id', true);
            }
        }
        return $result;
    }

    public function remove_repeated_elements_from_array($input) {
        $uniqueResult = array();
        for ($i = 0; $i < count($input); $i++) {
            $entry = $input[$i];
            $id = $this->safe_string($entry, 'id');
            if ($id !== null) {
                if ($this->safe_string($uniqueResult, $id) === null) {
                    $uniqueResult[$id] = $entry;
                }
            } else {
                $timestamp = $this->safe_integer_2($entry, 'timestamp', 0);
                if ($timestamp !== null) {
                    if ($this->safe_string($uniqueResult, $timestamp) === null) {
                        $uniqueResult[$timestamp] = $entry;
                    }
                }
            }
        }
        $values = is_array($uniqueResult) ? array_values($uniqueResult) : array();
        $valuesLength = count($values);
        if ($valuesLength > 0) {
            return $values;
        }
        return $input;
    }

    public function handle_until_option(string $key, $request, $params, $multiplier = 1) {
        $until = $this->safe_integer_2($params, 'until', 'till');
        if ($until !== null) {
            $request[$key] = $this->parseToInt ($until * $multiplier);
            $params = $this->omit ($params, array( 'until', 'till' ));
        }
        return array( $request, $params );
    }

    public function safe_open_interest($interest, ?array $market = null) {
        return array_merge($interest, array(
            'baseVolume' => $this->safe_number($interest, 'baseVolume'), // deprecated
            'datetime' => $this->safe_string($interest, 'datetime'),
            'info' => $this->safe_value($interest, 'info'),
            'openInterestAmount' => $this->safe_number($interest, 'openInterestAmount'),
            'openInterestValue' => $this->safe_number($interest, 'openInterestValue'),
            'quoteVolume' => $this->safe_number($interest, 'quoteVolume'), // deprecated
            'symbol' => $this->safe_string($market, 'symbol'),
            'timestamp' => $this->safe_integer($interest, 'timestamp'),
        ));
    }

    public function parse_liquidation($liquidation, ?array $market = null) {
        throw new NotSupported($this->id . ' parseLiquidation () is not supported yet');
    }

    public function parse_liquidations($liquidations, $market = null, ?int $since = null, ?int $limit = null) {
        /**
         * @ignore
         * parses liquidation info from the exchange response
         * @param {array[]} $liquidations each item describes an instance of a liquidation event
         * @param {array} $market ccxt $market
         * @param {int} [$since] when defined, the response items are filtered to only include items after this timestamp
         * @param {int} [$limit] limits the number of items in the response
         * @return {array[]} an array of ~@link https://docs.ccxt.com/#/?id=liquidation-structure liquidation structures~
         */
        $result = array();
        for ($i = 0; $i < count($liquidations); $i++) {
            $entry = $liquidations[$i];
            $parsed = $this->parseLiquidation ($entry, $market);
            $result[] = $parsed;
        }
        $sorted = $this->sort_by($result, 'timestamp');
        $symbol = $this->safe_string($market, 'symbol');
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function parse_greeks($greeks, ?array $market = null) {
        throw new NotSupported($this->id . ' parseGreeks () is not supported yet');
    }

    public function parse_margin_modes(mixed $response, ?array $symbols = null, ?string $symbolKey = null, ?string $marketType = null) {
        $marginModeStructures = array();
        for ($i = 0; $i < count($response); $i++) {
            $info = $response[$i];
            $marketId = $this->safe_string($info, $symbolKey);
            $market = $this->safe_market($marketId, null, null, $marketType);
            if (($symbols === null) || $this->in_array($market['symbol'], $symbols)) {
                $marginModeStructures[$market['symbol']] = $this->parse_margin_mode($info, $market);
            }
        }
        return $marginModeStructures;
    }

    public function parse_margin_mode($marginMode, ?array $market = null) {
        throw new NotSupported($this->id . ' parseMarginMode () is not supported yet');
    }

    public function parse_leverages(mixed $response, ?array $symbols = null, ?string $symbolKey = null, ?string $marketType = null) {
        $leverageStructures = array();
        for ($i = 0; $i < count($response); $i++) {
            $info = $response[$i];
            $marketId = $this->safe_string($info, $symbolKey);
            $market = $this->safe_market($marketId, null, null, $marketType);
            if (($symbols === null) || $this->in_array($market['symbol'], $symbols)) {
                $leverageStructures[$market['symbol']] = $this->parse_leverage($info, $market);
            }
        }
        return $leverageStructures;
    }

    public function parse_leverage($leverage, ?array $market = null) {
        throw new NotSupported($this->id . ' parseLeverage() is not supported yet');
    }
}
