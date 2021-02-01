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

use Generator;
use Exception;

include 'throttle.php';

$version = '1.41.33';

class Exchange extends \ccxt\Exchange {

    const VERSION = '1.41.33';

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

    public function fetch($url, $method = 'GET', $headers = null, $body = null) : Generator {

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
                throw new ccxt\RequestTimeout(implode(' ', array($url, $method, 28, $message))); // 28 for compatibility with CURL
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

    public function fetch2($path, $api = 'public', $method = 'GET', $params = array(), $headers = null, $body = null) : Generator {
        if ($this->enableRateLimit) {
            yield call_user_func($this->throttle, $this->rateLimit);
        }
        $request = $this->sign($path, $api, $method, $params, $headers, $body);
        return yield $this->fetch($request['url'], $request['method'], $request['headers'], $request['body']);
    }

    public function load_markets_helper($reload = false, $params = array()) : Generator {
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

    public function loadMarkets($reload = false, $params = array()) : Generator {
        return yield $this->load_markets($reload, $params);
    }

    public function load_markets($reload = false, $params = array()) : Generator {
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
        yield; //done as a generator despite not necessarily needing it, to keep consistency that all fetch_ methods are generators
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
}
