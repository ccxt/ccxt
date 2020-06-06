<?php

/*

MIT License

Copyright (c) 2020 Paul Cook

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//-----------------------------------------------------------------------------

namespace ccxt_async;

use Clue\React\Buzz\Browser;
use \ccxt\NotSupported;
use \ccxt\ExchangeNotAvailable;
use \ccxt\ExchangeError;
use \ccxt\DDoSProtection;
use \ccxt\RequestTimeout;
use Generator;
use Psr\Http\Message\ResponseInterface;
use React\EventLoop\LoopInterface;
use React\Socket\Connector;
use Recoil\React\ReactKernel;
use Recoil\Recoil;

// handle CCXT namespace constants
foreach (get_defined_constants(true)['user'] as $const => $val) {
    if (strpos($const, 'ccxt\\') === 0) {
        define(str_replace('ccxt\\', '', $const), $val);
    }
}

$version = '1.28.94';

class Exchange extends \ccxt\Exchange {

    const VERSION = '1.28.94';

    /** @var Browser $browser */
    public $browser;
    /** @var LoopInterface $loop */
    public $loop;
    /** @var ReactKernel $kernel */
    public $kernel;

    public function __construct(LoopInterface $loop, ReactKernel $kernel, $options = array())
    {
        parent::__construct($options);

        $this->loop = $loop;
        $this->kernel = $kernel;
    }

    // this method is experimental
    public function throttle() {
        $now = $this->milliseconds();
        $elapsed = $now - $this->lastRestRequestTimestamp;
        if ($elapsed < $this->rateLimit) {
            $delay = $this->rateLimit - $elapsed;
            yield Recoil::sleep($delay / 1000);
        }
    }

    public function fetch2($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null) : Generator {
        $request = $this->sign($path, $api, $method, $params, $headers, $body);
        return yield $this->fetch($request['url'], $request['method'], $request['headers'], $request['body']);
    }

    public function request($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null) : Generator {
        return yield $this->fetch2($path, $api, $method, $params, $headers, $body);
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) : Generator {
        if ($this->enableRateLimit) {
            yield $this->throttle();
        }

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

        $verbose_headers = $headers;

        if (!$this->browser) {
            $connectorOptions = [
                'tls' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false
                ),
            ];
            if ($this->timeout) {
                $connectorOptions['timeout'] = $this->timeout;
            }

            if ($this->proxy) {
                $proxyClass = 'Clue\\React\\HttpProxy\\ProxyConnector';
                if (!class_exists($proxyClass)) {
                    throw new NotSupported('Using proxies for async PHP requires installing the clue/reactphp-http-proxy library (by eg running "composer require clue/reactphp-http-proxy"');
                }
                $proxy = new \Clue\React\HttpProxy\ProxyConnector($this->proxy, new Connector($this->loop, $connectorOptions));
                $connectorOptions['tcp'] = $proxy;
            }

            $connector = new Connector($this->loop, $connectorOptions);
            $this->browser = new Browser($this->loop);
        }

        if ($this->verbose) {
            $function = array($this, 'print');
            $function('Request:', $method, $url, $verbose_headers, $body);
        }

        $this->lastRestRequestTimestamp = $this->milliseconds();

        try {
            /** @var ResponseInterface $response */
            $response = NULL;
            if ($method == 'GET') {
                $response = yield $this->browser->get($url, $headers);
            } elseif ($method == 'POST') {
                $response = yield $this->browser->post($url, $headers, $body);
            } elseif ($method == 'PUT') {
                $response = yield $this->browser->put($url, $headers, $body);
            } elseif ($method == 'PATCH') {
                $response = yield $this->browser->patch($url, $headers, $body);
            } elseif ($method === 'DELETE') {
                $response = yield $this->browser->delete($url, $headers, $body);
            }
        } catch (\RuntimeException $e) {
            if (strpos($e->getMessage(), 'timed out') !== false) { //operation timed out. Currently not way to determine this easily https://github.com/clue/reactphp-buzz/issues/146
                throw new RequestTimeout(implode(' ', array($url, $method, 28, $e->getMessage()))); //28 for compatibility with the CURL error code for timeout
            }

            // all sorts of SSL problems, accessibility
            throw new ExchangeNotAvailable(implode(' ', array($url, $method, $e->getCode(), $e->getMessage())));
        }

        $http_status_text = '';

        if ($this->enableLastHttpResponse) {
            $this->last_http_response = $response;
        }

        if ($this->enableLastResponseHeaders) {
            $this->last_response_headers = $response->getHeaders();
        }

        $result = (string)$response->getBody();

        $json_response = null;

        if ($this->is_json_encoded_object($result)) {
            $json_response = $this->parse_json($result);

            if ($this->enableLastJsonResponse) {
                $this->last_json_response = $json_response;
            }
        }

        $error_reason = $response->getReasonPhrase();
        $http_status_code = $response->getStatusCode();

        if ($this->verbose) {
            $function = array($this, 'print');
            $function('Response:', $method, $url, $http_status_code, $error_reason, $response->getHeaders(), $result);
        }

        $this->handle_errors($http_status_code, $http_status_text, $url, $method, $response->getHeaders(), $result, $json_response, $headers, $body);

        $string_code = (string) $http_status_code;

        if (array_key_exists($string_code, $this->httpExceptions)) {
            $error_class = $this->httpExceptions[$string_code];
            if ($error_class === 'ExchangeNotAvailable') {
                if (preg_match('#cloudflare|incapsula|overload|ddos#i', $result)) {
                    throw new DDoSProtection(implode(' ', array($url, $method, $http_status_code, $result)));
                }
                $details = '(possible reasons: ' . implode(', ', array(
                        'invalid API keys',
                        'bad or old nonce',
                        'exchange is down or offline',
                        'on maintenance',
                        'DDoS protection',
                        'rate-limiting in effect',
                    )) . ')';
                throw new ExchangeNotAvailable(implode(' ', array($url, $method, $http_status_code, $result, $details)));
            }
            if (substr($error_class, 0, 6) !== '\\ccxt\\') {
                $error_class = '\\ccxt\\' . $error_class;
            }
            throw new $error_class(implode(' ', array($url, $method, $http_status_code, $result)));
        }

        if (!$json_response) {
            $details = '(possible reasons: ' . implode(', ', array(
                    'exchange is down or offline',
                    'on maintenance',
                    'DDoS protection',
                    'rate-limiting in effect',
                )) . ')';
            $error_class = null;
            if (preg_match('#offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing#i', $result)) {
                $error_class = 'ExchangeNotAvailable';
            }

            if (preg_match('#cloudflare|incapsula#i', $result)) {
                $error_class = 'DDosProtection';
            }
            if ($error_class !== null) {
                if (substr($error_class, 0, 6) !== '\\ccxt\\') {
                    $error_class = '\\ccxt\\' . $error_class;
                }
                throw new $error_class(implode(' ', array($url, $method, $http_status_code, 'not accessible from this location at the moment', $details)));
            }
        }

        return isset($json_response) ? $json_response : $result;
    }

    public function loadMarkets($reload = false, $params = array()) : Generator {
        return yield $this->load_markets($reload, $params);
    }

    public function load_markets($reload = false, $params = array()) : Generator {
        yield;
        if (!$reload && $this->markets) {
            if (!$this->markets_by_id) {
                return $this->set_markets($this->markets);
            }
            return $this->markets;
        }
        $currencies = null;
        if (array_key_exists('fetchCurrencies', $this->has) && $this->has['fetchCurrencies']) {
            $currencies = yield $this->fetch_currencies();
        }
        $markets = yield $this->fetch_markets($params);
        return $this->set_markets($markets, $currencies);
    }

    public function loadAccounts($reload = false, $params = array()) : Generator {
        return yield $this->load_accounts($reload, $params);
    }

    public function load_accounts($reload = false, $params = array()) : Generator {
        if ($reload) {
            $this->accounts = yield $this->fetch_accounts($params);
        } else {
            if ($this->accounts) {
                yield;
                return $this->accounts;
            } else {
                $this->accounts = yield $this->fetch_accounts($params);
            }
        }
        $this->accountsById = static::index_by($this->accounts, 'id');
        return $this->accounts;
    }

    public function fetch_l2_order_book($symbol, $limit = null, $params = array()) : Generator {
        $orderbook = yield $this->fetch_order_book($symbol, $limit, $params);
        return array_merge($orderbook, array(
            'bids' => $this->sort_by($this->aggregate($orderbook['bids']), 0, true),
            'asks' => $this->sort_by($this->aggregate($orderbook['asks']), 0),
        ));
    }

    public function fetchL2OrderBook($symbol, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_l2_order_book($symbol, $limit, $params);
    }

    public function fetch_partial_balance($part, $params = array()) : Generator {
        $balance = yield $this->fetch_balance($params);
        return $balance[$part];
    }

    public function fetch_free_balance($params = array()) : Generator {
        return yield $this->fetch_partial_balance('free', $params);
    }

    public function fetch_used_balance($params = array()) : Generator {
        return yield $this->fetch_partial_balance('used', $params);
    }

    public function fetch_total_balance($params = array()) : Generator {
        return yield $this->fetch_partial_balance('total', $params);
    }

    public function fetchFreeBalance($params = array()) : Generator {
        return yield $this->fetch_free_balance($params);
    }

    public function fetchUsedBalance($params = array()) : Generator {
        return yield $this->fetch_used_balance($params);
    }

    public function fetchTotalBalance($params = array()) : Generator {
        return yield $this->fetch_total_balance($params);
    }

    public function fetch_trading_fees($params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_trading_fees not supported yet');
    }

    public function fetch_trading_fee($symbol, $params = array()) : Generator {
        if (!$this->has['fetchTradingFees']) {
            throw new NotSupported($this->id . ' fetch_trading_fee not supported yet');
        }
        return $this->fetch_trading_fees($params);
    }

    public function load_trading_limits($symbols = null, $reload = false, $params = array()) : Generator {
        yield;
        if ($this->has['fetchTradingLimits']) {
            if ($reload || !(is_array($this->options) && array_key_exists('limitsLoaded', $this->options))) {
                $response = yield $this->fetch_trading_limits($symbols);
                // $limits = $response['limits'];
                // $keys = is_array ($limits) ? array_keys ($limits) : array ();
                for ($i = 0; $i < count($symbols); $i++) {
                    $symbol = $symbols[$i];
                    $this->markets[$symbol] = array_replace_recursive($this->markets[$symbol], $response[$symbol]);
                }
                $this->options['limitsLoaded'] = $this->milliseconds();
            }
        }
        return $this->markets;
    }

    public function fetch_bids_asks($symbols, $params = array()) : Generator { // stub
        throw new NotSupported($this->id . ' API does not allow to fetch all prices at once with a single call to fetch_bids_asks () for now');
    }

    public function fetchBidsAsks($symbols, $params = array()) : Generator {
        return $this->fetch_bids_asks($symbols, $params);
    }

    public function fetch_ticker($symbol, $params = array()) : Generator { // stub
        throw new NotSupported($this->id . ' fetchTicker not supported yet');
    }

    public function fetch_tickers($symbols, $params = array()) : Generator { // stub
        throw new NotSupported($this->id . ' API does not allow to fetch all tickers at once with a single call to fetch_tickers () for now');
    }

    public function fetchTickers($symbols = null, $params = array()) : Generator {
        return yield $this->fetch_tickers($symbols, $params);
    }

    public function fetch_order_status($id, $symbol = null, $params = array()) : Generator {
        $order = yield $this->fetch_order($id, $symbol, $params);
        return $order['status'];
    }

    public function fetchOrderStatus($id, $market = null) {
        return yield $this->fetch_order_status($id);
    }

    public function fetch_order($id, $symbol = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_order() not supported yet');
    }

    public function fetchOrder($id, $symbol = null, $params = array()) : Generator {
        return yield $this->fetch_order($id, $symbol, $params);
    }

    public function fetch_unified_order($order, $params = array ()) {
        return yield $this->fetch_order($this->safe_value($order, 'id'), $this->safe_value($order, 'symbol'), $params);
    }

    public function fetchUnifiedOrder($order, $params = array ()) {
        return yield $this->fetch_unified_order($order, $params);
    }

    public function fetch_order_trades($id, $symbol = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_order_trades() not supported yet');
    }

    public function fetchOrderTrades($id, $symbol = null, $params = array()) : Generator {
        return yield $this->fetch_order_trades($id, $symbol, $params);
    }

    public function fetch_orders($symbol = null, $since = null, $limit = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_orders() not supported yet');
    }

    public function fetchOrders($symbol = null, $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_orders($symbol, $since, $limit, $params);
    }

    public function fetch_open_orders($symbol = null, $since = null, $limit = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_open_orders() not supported yet');
    }

    public function fetchOpenOrders($symbol = null, $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_open_orders($symbol, $since, $limit, $params);
    }

    public function fetch_closed_orders($symbol = null, $since = null, $limit = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_closed_orders() not supported yet');
    }

    public function fetchClosedOrders($symbol = null, $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_closed_orders($symbol, $since, $limit, $params);
    }

    public function fetch_my_trades($symbol = null, $since = null, $limit = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_my_trades() not supported yet');
    }

    public function fetchMyTrades($symbol = null, $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_my_trades($symbol, $since, $limit, $params);
    }

    public function fetchTransactions($code = null, $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_transactions($code, $since, $limit, $params);
    }

    public function fetch_transactions($code = null, $since = null, $limit = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_transactions() not supported yet');
    }

    public function fetchDeposits($code = null, $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_deposits($code, $since, $limit, $params);
    }

    public function fetch_deposits($code = null, $since = null, $limit = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_deposits() not supported yet');
    }

    public function fetchWithdrawals($code = null, $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_withdrawals($code, $since, $limit, $params);
    }

    public function fetch_withdrawals($code = null, $since = null, $limit = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_withdrawals() not supported yet');
    }

    public function fetchDepositAddress($code, $params = array()) : Generator {
        return yield $this->fetch_deposit_address($code, $params);
    }

    public function fetch_deposit_address($code, $params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_deposit_address() not supported yet');
    }

    public function fetch_markets($params = array()) : Generator {
        yield; //done as a generator despite not needing it, to keep consistency that all fetch_ methods are generators
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return $this->markets ? array_values($this->markets) : array();
    }

    public function fetchMarkets($params = array()) : Generator {
        return yield $this->fetch_markets($params);
    }

    public function fetch_currencies($params = array()) : Generator {
        yield; //done as a generator despite not needing it, to keep consistency that all fetch_ methods are generators
        // markets are returned as a list
        // currencies are returned as a dict
        // this is for historical reasons
        // and may be changed for consistency later
        return $this->currencies ? $this->currencies : array();
    }

    public function fetchCurrencies($params = array()) : Generator {
        return yield $this->fetch_currencies();
    }

    public function fetchBalance($params = array()) : Generator {
        return yield $this->fetch_balance($params);
    }

    public function fetch_balance($params = array()) : Generator {
        throw new NotSupported($this->id . ' fetch_balance() not supported yet');
    }

    public function fetchOrderBook($symbol, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_order_book($symbol, $limit, $params);
    }

    public function fetchTicker($symbol, $params = array()) : Generator {
        return yield $this->fetch_ticker($symbol, $params);
    }

    public function fetchTrades($symbol, $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_trades($symbol, $since, $limit, $params);
    }

    public function fetch_ohlcv($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array()) : Generator {
        if (!$this->has['fetchTrades']) {
            throw new NotSupported($this->$id . ' fetch_ohlcv() not supported yet');
        }
        yield $this->load_markets();
        $trades = yield $this->fetch_trades($symbol, $since, $limit, $params);
        return $this->build_ohlcv($trades, $timeframe, $since, $limit);
    }

    public function fetchStatus($params = array()) : Generator {
        return yield $this->fetch_status($params);
    }

    public function fetch_status($params = array()) : Generator {
        if ($this->has['fetchTime']) {
            $time = yield $this->fetch_time($params);
            $this->status = array_merge($this->status, array(
                'updated' => $time,
            ));
        }
        return $this->status;
    }

    public function fetchOHLCV($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array()) : Generator {
        return yield $this->fetch_ohlcv($symbol, $timeframe, $since, $limit, $params);
    }

    public function edit_limit_buy_order($id, $symbol, $amount, $price, $params = array()) : Generator {
        return yield $this->edit_limit_order($id, $symbol, 'buy', $amount, $price, $params);
    }

    public function edit_limit_sell_order($id, $symbol, $amount, $price, $params = array()) : Generator {
        return yield $this->edit_limit_order($id, $symbol, 'sell', $amount, $price, $params);
    }

    public function edit_limit_order($id, $symbol, $side, $amount, $price, $params = array()) : Generator {
        return yield $this->edit_order($id, $symbol, 'limit', $side, $amount, $price, $params);
    }

    public function cancel_order($id, $symbol = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' cancel_order() not supported or not supported yet');
    }

    public function edit_order($id, $symbol, $type, $side, $amount, $price, $params = array()) : Generator {
        if (!$this->enableRateLimit) {
            throw new ExchangeError($this->id . ' edit_order() requires enableRateLimit = true');
        }
        yield $this->cancel_order($id, $symbol, $params);
        return yield $this->create_order($symbol, $type, $side, $amount, $price, $params);
    }

    public function cancelOrder($id, $symbol = null, $params = array()) : Generator {
        return yield $this->cancel_order($id, $symbol, $params);
    }

    public function cancel_unified_order($order, $params = array ()) {
        return yield $this->cancel_order($this->safe_value($order, 'id'), $this->safe_value($order, 'symbol'), $params);
    }

    public function cancelUnifiedOrder($order, $params = array ()) {
        return yield $this->cancel_unified_order($order, $params);
    }

    public function editLimitBuyOrder($id, $symbol, $amount, $price, $params = array()) : Generator {
        return yield $this->edit_limit_buy_order($id, $symbol, $amount, $price, $params);
    }

    public function editLimitSellOrder($id, $symbol, $amount, $price, $params = array()) : Generator {
        return yield $this->edit_limit_sell_order($id, $symbol, $amount, $price, $params);
    }

    public function editLimitOrder($id, $symbol, $side, $amount, $price, $params = array()) : Generator {
        return yield $this->edit_limit_order($id, $symbol, $side, $amount, $price, $params);
    }

    public function editOrder($id, $symbol, $type, $side, $amount, $price, $params = array()) : Generator {
        return yield $this->edit_order($id, $symbol, $type, $side, $amount, $price, $params);
    }

    public function create_order($symbol, $type, $side, $amount, $price = null, $params = array()) : Generator {
        throw new NotSupported($this->id . ' create_order() not supported yet');
    }

    public function create_limit_order($symbol, $side, $amount, $price, $params = array()) : Generator {
        return yield $this->create_order($symbol, 'limit', $side, $amount, $price, $params);
    }

    public function create_market_order($symbol, $side, $amount, $price = null, $params = array()) : Generator {
        return yield $this->create_order($symbol, 'market', $side, $amount, $price, $params);
    }

    public function create_limit_buy_order($symbol, $amount, $price, $params = array()) : Generator {
        return yield $this->create_order($symbol, 'limit', 'buy', $amount, $price, $params);
    }

    public function create_limit_sell_order($symbol, $amount, $price, $params = array()) : Generator {
        return yield $this->create_order($symbol, 'limit', 'sell', $amount, $price, $params);
    }

    public function create_market_buy_order($symbol, $amount, $params = array()) : Generator {
        return yield $this->create_order($symbol, 'market', 'buy', $amount, null, $params);
    }

    public function create_market_sell_order($symbol, $amount, $params = array()) : Generator {
        return yield $this->create_order($symbol, 'market', 'sell', $amount, null, $params);
    }

    public function createOrder($symbol, $type, $side, $amount, $price = null, $params = array()) : Generator {
        return yield $this->create_order($symbol, $type, $side, $amount, $price, $params);
    }

    public function createLimitOrder($symbol, $side, $amount, $price, $params = array()) : Generator {
        return yield $this->create_limit_order($symbol, $side, $amount, $price, $params);
    }

    public function createMarketOrder($symbol, $side, $amount, $price = null, $params = array()) : Generator {
        return yield $this->create_market_order($symbol, $side, $amount, $price, $params);
    }

    public function createLimitBuyOrder($symbol, $amount, $price, $params = array()) : Generator {
        return yield $this->create_limit_buy_order($symbol, $amount, $price, $params);
    }

    public function createLimitSellOrder($symbol, $amount, $price, $params = array()) : Generator {
        return yield $this->create_limit_sell_order($symbol, $amount, $price, $params);
    }

    public function createMarketBuyOrder($symbol, $amount, $params = array()) : Generator {
        return yield $this->create_market_buy_order($symbol, $amount, $params);
    }

    public function createMarketSellOrder($symbol, $amount, $params = array()) : Generator {
        return yield $this->create_market_sell_order($symbol, $amount, $params);
    }

    public function __call($function, $params) {
        if (array_key_exists($function, $this->defined_rest_api)) {
            $partial = $this->defined_rest_api[$function];
            $entry = $partial[3];
            $partial[3] = $params ? $params[0] : $params;
            return yield call_user_func_array(array($this, $entry), $partial);
        } else {
            /* handle errors */
            throw new ExchangeError($function . ' method not found, try underscore_notation instead of camelCase for the method being called');
        }
    }

}
