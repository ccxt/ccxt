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

use \ccxt\Precise;
use \ccxt\AuthenticationError;
use \ccxt\ExchangeError;
use \ccxt\NotSupported;
use \ccxt\BadSymbol;

use React;
use React\Async;
use React\EventLoop\Loop;

use Exception;

include 'Throttle.php';

$version = '2.4.79';

class Exchange extends \ccxt\Exchange {

    const VERSION = '2.4.79';

    public $browser;
    public $marketsLoading = null;
    public $reloadingMarkets = null;
    public $tokenBucket;
    public $throttle;

    public function __construct($options = array()) {
        parent::__construct($options);
        $connector = new React\Socket\Connector(Loop::get(), array(
            'timeout' => $this->timeout,
        ));
        if ($this->browser === null) {
            $this->browser = (new React\Http\Browser(Loop::get(), $connector))->withRejectErrorResponse(false);
        }
        $this->throttle = new Throttle($this->tokenBucket);
    }

    public static function execute_and_run($closure) {
        $promise = Async\coroutine($closure);
        Async\await($promise);
    }

    public function fetch($url, $method = 'GET', $headers = null, $body = null) {
        // wrap this in as a promise so it executes asynchronously
        return React\Async\async(function () use ($url, $method, $headers, $body) {

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
                print_r(array('fetch Request:', $this->id, $method, $url, 'RequestHeaders:', $headers, 'RequestBody:', $body));
            }

            $this->lastRestRequestTimestamp = $this->milliseconds();

            try {
                $result = React\Async\await($this->browser->request($method, $url, $headers, $body));
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
        return call_user_func($this->throttle, $cost);
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

    public function get_default_options() {
        return array(
            'defaultNetworkCodeReplacements' => array(
                'ETH' => array( 'ERC20' => 'ETH' ),
                'TRX' => array( 'TRC20' => 'TRX' ),
                'CRO' => array( 'CRC20' => 'CRONOS' ),
            ),
        );
    }

    public function safe_ledger_entry($entry, $currency = null) {
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
            'info' => $entry,
        );
    }

    public function set_markets($markets, $currencies = null) {
        $values = array();
        $this->markets_by_id = array();
        // handle marketId conflicts
        // we insert spot $markets first
        $marketValues = $this->sort_by($this->to_array($markets), 'spot', true);
        for ($i = 0; $i < count($marketValues); $i++) {
            $value = $marketValues[$i];
            if (is_array($this->markets_by_id) && array_key_exists($value['id'], $this->markets_by_id)) {
                $this->markets_by_id[$value['id']][] = $value;
            } else {
                $this->markets_by_id[$value['id']] = array( $value );
            }
            $market = $this->deep_extend($this->safe_market(), array(
                'precision' => $this->precision,
                'limits' => $this->limits,
            ), $this->fees['trading'], $value);
            $values[] = $market;
        }
        $this->markets = $this->index_by($values, 'symbol');
        $marketsSortedBySymbol = $this->keysort ($this->markets);
        $marketsSortedById = $this->keysort ($this->markets_by_id);
        $this->symbols = is_array($marketsSortedBySymbol) ? array_keys($marketsSortedBySymbol) : array();
        $this->ids = is_array($marketsSortedById) ? array_keys($marketsSortedById) : array();
        if ($currencies !== null) {
            $this->currencies = $this->deep_extend($this->currencies, $currencies);
        } else {
            $baseCurrencies = array();
            $quoteCurrencies = array();
            for ($i = 0; $i < count($values); $i++) {
                $market = $values[$i];
                $defaultCurrencyPrecision = ($this->precisionMode === DECIMAL_PLACES) ? 8 : $this->parse_number('1e-8');
                $marketPrecision = $this->safe_value($market, 'precision', array());
                if (is_array($market) && array_key_exists('base', $market)) {
                    $currencyPrecision = $this->safe_value_2($marketPrecision, 'base', 'amount', $defaultCurrencyPrecision);
                    $currency = array(
                        'id' => $this->safe_string_2($market, 'baseId', 'base'),
                        'numericId' => $this->safe_string($market, 'baseNumericId'),
                        'code' => $this->safe_string($market, 'base'),
                        'precision' => $currencyPrecision,
                    );
                    $baseCurrencies[] = $currency;
                }
                if (is_array($market) && array_key_exists('quote', $market)) {
                    $currencyPrecision = $this->safe_value_2($marketPrecision, 'quote', 'price', $defaultCurrencyPrecision);
                    $currency = array(
                        'id' => $this->safe_string_2($market, 'quoteId', 'quote'),
                        'numericId' => $this->safe_string($market, 'quoteNumericId'),
                        'code' => $this->safe_string($market, 'quote'),
                        'precision' => $currencyPrecision,
                    );
                    $quoteCurrencies[] = $currency;
                }
            }
            $baseCurrencies = $this->sort_by($baseCurrencies, 'code');
            $quoteCurrencies = $this->sort_by($quoteCurrencies, 'code');
            $this->baseCurrencies = $this->index_by($baseCurrencies, 'code');
            $this->quoteCurrencies = $this->index_by($quoteCurrencies, 'code');
            $allCurrencies = $this->array_concat($baseCurrencies, $quoteCurrencies);
            $groupedCurrencies = $this->group_by($allCurrencies, 'code');
            $codes = is_array($groupedCurrencies) ? array_keys($groupedCurrencies) : array();
            $resultingCurrencies = array();
            for ($i = 0; $i < count($codes); $i++) {
                $code = $codes[$i];
                $groupedCurrenciesCode = $this->safe_value($groupedCurrencies, $code, array());
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

    public function safe_balance($balance) {
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

    public function safe_order($order, $market = null) {
        // parses numbers as strings
        // it is important pass the $trades as unparsed $rawTrades
        $amount = $this->omit_zero($this->safe_string($order, 'amount'));
        $remaining = $this->safe_string($order, 'remaining');
        $filled = $this->safe_string($order, 'filled');
        $cost = $this->safe_string($order, 'cost');
        $average = $this->omit_zero($this->safe_string($order, 'average'));
        $price = $this->omit_zero($this->safe_string($order, 'price'));
        $lastTradeTimeTimestamp = $this->safe_integer($order, 'lastTradeTimestamp');
        $symbol = $this->safe_string($order, 'symbol');
        $side = $this->safe_string($order, 'side');
        $parseFilled = ($filled === null);
        $parseCost = ($cost === null);
        $parseLastTradeTimeTimestamp = ($lastTradeTimeTimestamp === null);
        $fee = $this->safe_value($order, 'fee');
        $parseFee = ($fee === null);
        $parseFees = $this->safe_value($order, 'fees') === null;
        $parseSymbol = $symbol === null;
        $parseSide = $side === null;
        $shouldParseFees = $parseFee || $parseFees;
        $fees = $this->safe_value($order, 'fees', array());
        $trades = array();
        if ($parseFilled || $parseCost || $shouldParseFees) {
            $rawTrades = $this->safe_value($order, 'trades', $trades);
            $oldNumber = $this->number;
            // we parse $trades as strings here!
            $this->number = 'strval';
            $trades = $this->parse_trades($rawTrades, $market);
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
                $fee['cost'] = $this->safe_number($fee, 'cost');
                if (is_array($fee) && array_key_exists('rate', $fee)) {
                    $fee['rate'] = $this->safe_number($fee, 'rate');
                }
                $reducedFees[] = $fee;
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
            } elseif ($this->safe_string($order, 'status') === 'closed') {
                $amount = $filled;
            }
        }
        if ($filled === null) {
            if ($amount !== null && $remaining !== null) {
                $filled = Precise::string_sub($amount, $remaining);
            }
        }
        if ($remaining === null) {
            if ($amount !== null && $filled !== null) {
                $remaining = Precise::string_sub($amount, $filled);
            }
        }
        // ensure that the $average field is calculated correctly
        $inverse = $this->safe_value($market, 'inverse', false);
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
            $fee = $this->safe_value($entry, 'fee', array());
            $fee['cost'] = $this->safe_number($fee, 'cost');
            if (is_array($fee) && array_key_exists('rate', $fee)) {
                $fee['rate'] = $this->safe_number($fee, 'rate');
            }
            $entry['fee'] = $fee;
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
        return array_merge($order, array(
            'symbol' => $symbol,
            'side' => $side,
            'lastTradeTimestamp' => $lastTradeTimeTimestamp,
            'price' => $this->parse_number($price),
            'amount' => $this->parse_number($amount),
            'cost' => $this->parse_number($cost),
            'average' => $this->parse_number($average),
            'filled' => $this->parse_number($filled),
            'remaining' => $this->parse_number($remaining),
            'timeInForce' => $timeInForce,
            'postOnly' => $postOnly,
            'trades' => $trades,
        ));
    }

    public function parse_orders($orders, $market = null, $since = null, $limit = null, $params = array ()) {
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
        $tail = $since === null;
        return $this->filter_by_symbol_since_limit($results, $symbol, $since, $limit, $tail);
    }

    public function calculate_fee($symbol, $type, $side, $amount, $price, $takerOrMaker = 'taker', $params = array ()) {
        if ($type === 'market' && $takerOrMaker === 'maker') {
            throw new ArgumentsRequired($this->id . ' calculateFee() - you have provided incompatible arguments - "market" $type order can not be "maker". Change either the "type" or the "takerOrMaker" argument to calculate the fee.');
        }
        $market = $this->markets[$symbol];
        $feeSide = $this->safe_string($market, 'feeSide', 'quote');
        $key = 'quote';
        $cost = null;
        $amountString = $this->number_to_string($amount);
        $priceString = $this->number_to_string($price);
        if ($feeSide === 'quote') {
            // the fee is always in quote currency
            $cost = Precise::string_mul($amountString, $priceString);
        } elseif ($feeSide === 'base') {
            // the fee is always in base currency
            $cost = $amountString;
        } elseif ($feeSide === 'get') {
            // the fee is always in the currency you get
            $cost = $amountString;
            if ($side === 'sell') {
                $cost = Precise::string_mul($cost, $priceString);
            } else {
                $key = 'base';
            }
        } elseif ($feeSide === 'give') {
            // the fee is always in the currency you give
            $cost = $amountString;
            if ($side === 'buy') {
                $cost = Precise::string_mul($cost, $priceString);
            } else {
                $key = 'base';
            }
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
        if ($cost !== null) {
            $cost = Precise::string_mul($cost, $rate);
        }
        return array(
            'type' => $takerOrMaker,
            'currency' => $market[$key],
            'rate' => $this->parse_number($rate),
            'cost' => $this->parse_number($cost),
        );
    }

    public function safe_trade($trade, $market = null) {
        $amount = $this->safe_string($trade, 'amount');
        $price = $this->safe_string($trade, 'price');
        $cost = $this->safe_string($trade, 'cost');
        if ($cost === null) {
            // contract trading
            $contractSize = $this->safe_string($market, 'contractSize');
            $multiplyPrice = $price;
            if ($contractSize !== null) {
                $inverse = $this->safe_value($market, 'inverse', false);
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
                $fee['cost'] = $this->safe_number($fee, 'cost');
                if (is_array($fee) && array_key_exists('rate', $fee)) {
                    $fee['rate'] = $this->safe_number($fee, 'rate');
                }
                $reducedFees[] = $fee;
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
        $trade['price'] = $this->parse_number($price);
        $trade['cost'] = $this->parse_number($cost);
        return $trade;
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
        //         array( 'currency' => 'BTC', 'cost' => '0.3'  ),
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
                        'currency' => $feeCurrencyCode,
                        'cost' => $cost,
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

    public function safe_ticker($ticker, $market = null) {
        $open = $this->safe_value($ticker, 'open');
        $close = $this->safe_value($ticker, 'close');
        $last = $this->safe_value($ticker, 'last');
        $change = $this->safe_value($ticker, 'change');
        $percentage = $this->safe_value($ticker, 'percentage');
        $average = $this->safe_value($ticker, 'average');
        $vwap = $this->safe_value($ticker, 'vwap');
        $baseVolume = $this->safe_value($ticker, 'baseVolume');
        $quoteVolume = $this->safe_value($ticker, 'quoteVolume');
        if ($vwap === null) {
            $vwap = Precise::string_div($quoteVolume, $baseVolume);
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
            'bid' => $this->safe_number($ticker, 'bid'),
            'bidVolume' => $this->safe_number($ticker, 'bidVolume'),
            'ask' => $this->safe_number($ticker, 'ask'),
            'askVolume' => $this->safe_number($ticker, 'askVolume'),
            'high' => $this->safe_number($ticker, 'high'),
            'low' => $this->safe_number($ticker, 'low'),
            'open' => $this->parse_number($open),
            'close' => $this->parse_number($close),
            'last' => $this->parse_number($last),
            'change' => $this->parse_number($change),
            'percentage' => $this->parse_number($percentage),
            'average' => $this->parse_number($average),
            'vwap' => $this->parse_number($vwap),
            'baseVolume' => $this->parse_number($baseVolume),
            'quoteVolume' => $this->parse_number($quoteVolume),
            'previousClose' => $this->safe_number($ticker, 'previousClose'),
        ));
    }

    public function fetch_ohlcv($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $timeframe, $since, $limit, $params) {
            if (!$this->has['fetchTrades']) {
                throw new NotSupported($this->id . ' fetchOHLCV() is not supported yet');
            }
            Async\await($this->load_markets());
            $trades = Async\await($this->fetchTrades ($symbol, $since, $limit, $params));
            $ohlcvc = $this->build_ohlcvc($trades, $timeframe, $since, $limit);
            $result = array();
            for ($i = 0; $i < count($ohlcvc); $i++) {
                $result[] = [
                    $this->safe_integer($ohlcvc[$i], 0),
                    $this->safe_number($ohlcvc[$i], 1),
                    $this->safe_number($ohlcvc[$i], 2),
                    $this->safe_number($ohlcvc[$i], 3),
                    $this->safe_number($ohlcvc[$i], 4),
                    $this->safe_number($ohlcvc[$i], 5),
                ];
            }
            return $result;
        }) ();
    }

    public function convert_trading_view_to_ohlcv($ohlcvs, $timestamp = 't', $open = 'o', $high = 'h', $low = 'l', $close = 'c', $volume = 'v', $ms = false) {
        $result = array();
        $timestamps = $this->safe_value($ohlcvs, $timestamp, array());
        $opens = $this->safe_value($ohlcvs, $open, array());
        $highs = $this->safe_value($ohlcvs, $high, array());
        $lows = $this->safe_value($ohlcvs, $low, array());
        $closes = $this->safe_value($ohlcvs, $close, array());
        $volumes = $this->safe_value($ohlcvs, $volume, array());
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
        $result[$timestamp] = array();
        $result[$open] = array();
        $result[$high] = array();
        $result[$low] = array();
        $result[$close] = array();
        $result[$volume] = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $ts = $ms ? $ohlcvs[$i][0] : intval($ohlcvs[$i][0] / 1000);
            $result[$timestamp][] = $ts;
            $result[$open][] = $ohlcvs[$i][1];
            $result[$high][] = $ohlcvs[$i][2];
            $result[$low][] = $ohlcvs[$i][3];
            $result[$close][] = $ohlcvs[$i][4];
            $result[$volume][] = $ohlcvs[$i][5];
        }
        return $result;
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

    public function market_symbols($symbols) {
        if ($symbols === null) {
            return $symbols;
        }
        $result = array();
        for ($i = 0; $i < count($symbols); $i++) {
            $result[] = $this->symbol ($symbols[$i]);
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

    public function parse_bids_asks($bidasks, $priceKey = 0, $amountKey = 1) {
        $bidasks = $this->to_array($bidasks);
        $result = array();
        for ($i = 0; $i < count($bidasks); $i++) {
            $result[] = $this->parse_bid_ask($bidasks[$i], $priceKey, $amountKey);
        }
        return $result;
    }

    public function fetch_l2_order_book($symbol, $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $limit, $params) {
            $orderbook = Async\await($this->fetch_order_book($symbol, $limit, $params));
            return array_merge($orderbook, array(
                'asks' => $this->sort_by($this->aggregate ($orderbook['asks']), 0),
                'bids' => $this->sort_by($this->aggregate ($orderbook['bids']), 0, true),
            ));
        }) ();
    }

    public function filter_by_symbol($objects, $symbol = null) {
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

    public function parse_ohlcv($ohlcv, $market = null) {
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

    public function get_network($network, $code) {
        $network = strtoupper($network);
        $aliases = array(
            'ETHEREUM' => 'ETH',
            'ETHER' => 'ETH',
            'ERC20' => 'ETH',
            'ETH' => 'ETH',
            'TRC20' => 'TRX',
            'TRON' => 'TRX',
            'TRX' => 'TRX',
            'BEP20' => 'BSC',
            'BSC' => 'BSC',
            'HRC20' => 'HT',
            'HECO' => 'HT',
            'SPL' => 'SOL',
            'SOL' => 'SOL',
            'TERRA' => 'LUNA',
            'LUNA' => 'LUNA',
            'POLYGON' => 'MATIC',
            'MATIC' => 'MATIC',
            'EOS' => 'EOS',
            'WAVES' => 'WAVES',
            'AVALANCHE' => 'AVAX',
            'AVAX' => 'AVAX',
            'QTUM' => 'QTUM',
            'CHZ' => 'CHZ',
            'NEO' => 'NEO',
            'ONT' => 'ONT',
            'RON' => 'RON',
        );
        if ($network === $code) {
            return $network;
        } elseif (is_array($aliases) && array_key_exists($network, $aliases)) {
            return $aliases[$network];
        } else {
            throw new NotSupported($this->id . ' $network ' . $network . ' is not yet supported');
        }
    }

    public function network_code_to_id($networkCode, $currencyCode = null) {
        /**
         * @ignore
         * tries to convert the provided $networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {string} $networkCode unified network code
         * @param {string|null} $currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass $currencyCode argument additionally
         * @return {[string|null]} exchange-specific network id
         */
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

    public function network_id_to_code($networkId, $currencyCode = null) {
        /**
         * @ignore
         * tries to convert the provided exchange-specific $networkId to an unified network Code. In order to achieve this, derived class needs to have 'options->networksById' defined.
         * @param {string} $networkId unified network code
         * @param {string|null} $currencyCode unified currency code, but this argument is not required by default, unless there is an exchange (like huobi) that needs an override of the method to be able to pass $currencyCode argument additionally
         * @return {[string|null]} unified network code
         */
        $networkCodesByIds = $this->safe_value($this->options, 'networksById', array());
        $networkCode = $this->safe_string($networkCodesByIds, $networkId, $networkId);
        // replace mainnet network-codes (i.e. ERC20->ETH)
        if ($currencyCode !== null) {
            $defaultNetworkCodeReplacements = $this->safe_value($this->options, 'defaultNetworkCodeReplacements', array());
            if (is_array($defaultNetworkCodeReplacements) && array_key_exists($currencyCode, $defaultNetworkCodeReplacements)) {
                $replacementObject = $this->safe_value($defaultNetworkCodeReplacements, $currencyCode, array());
                $networkCode = $this->safe_string($replacementObject, $networkCode, $networkCode);
            }
        }
        return $networkCode;
    }

    public function network_codes_to_ids($networkCodes = null) {
        /**
         * @ignore
         * tries to convert the provided $networkCode (which is expected to be an unified network code) to a network id. In order to achieve this, derived class needs to have 'options->networks' defined.
         * @param {[string]|null} $networkCodes unified network codes
         * @return {[string|null]} exchange-specific network $ids
         */
        if ($networkCodes === null) {
            return null;
        }
        $ids = array();
        for ($i = 0; $i < count($networkCodes); $i++) {
            $networkCode = $networkCodes[$i];
            $ids[] = $this->networkCodeToId ($networkCode);
        }
        return $ids;
    }

    public function handle_network_code_and_params($params) {
        $networkCodeInParams = $this->safe_string_2($params, 'networkCode', 'network');
        if ($networkCodeInParams !== null) {
            $params = $this->omit ($params, array( 'networkCode', 'network' ));
        }
        // if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return array( $networkCodeInParams, $params );
    }

    public function default_network_code($currencyCode) {
        $defaultNetworkCode = null;
        $defaultNetworks = $this->safe_value($this->options, 'defaultNetworks', array());
        if (is_array($defaultNetworks) && array_key_exists($currencyCode, $defaultNetworks)) {
            // if currency had set its network in "defaultNetworks", use it
            $defaultNetworkCode = $defaultNetworks[$currencyCode];
        } else {
            // otherwise, try to use the global-scope 'defaultNetwork' value (even if that network is not supported by currency, it doesn't make any problem, this will be just used "at first" if currency supports this network at all)
            $defaultNetwork = $this->safe_value($this->options, 'defaultNetwork');
            if ($defaultNetwork !== null) {
                $defaultNetworkCode = $defaultNetwork;
            }
        }
        return $defaultNetworkCode;
    }

    public function select_network_code_from_unified_networks($currencyCode, $networkCode, $indexedNetworkEntries) {
        return $this->selectNetworkKeyFromNetworks ($currencyCode, $networkCode, $indexedNetworkEntries, true);
    }

    public function select_network_id_from_raw_networks($currencyCode, $networkCode, $indexedNetworkEntries) {
        return $this->selectNetworkKeyFromNetworks ($currencyCode, $networkCode, $indexedNetworkEntries, false);
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
                // if $networkCode was provided by user, we should check it after response, as the referenced exchange doesn't support network-code during request
                $networkId = $isIndexedByUnifiedNetworkCode ? $networkCode : $this->networkCodeToId ($networkCode, $currencyCode);
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
                $defaultNetworkCode = $this->defaultNetworkCode ($currencyCode);
                $defaultNetworkId = $isIndexedByUnifiedNetworkCode ? $defaultNetworkCode : $this->networkCodeToId ($defaultNetworkCode, $currencyCode);
                $chosenNetworkId = (is_array($indexedNetworkEntries) && array_key_exists($defaultNetworkId, $indexedNetworkEntries)) ? $defaultNetworkId : $availableNetworkIds[0];
            }
        }
        return $chosenNetworkId;
    }

    public function safe_number_2($dictionary, $key1, $key2, $d = null) {
        $value = $this->safe_string_2($dictionary, $key1, $key2);
        return $this->parse_number($value, $d);
    }

    public function parse_order_book($orderbook, $symbol, $timestamp = null, $bidsKey = 'bids', $asksKey = 'asks', $priceKey = 0, $amountKey = 1) {
        $bids = $this->parse_bids_asks($this->safe_value($orderbook, $bidsKey, array()), $priceKey, $amountKey);
        $asks = $this->parse_bids_asks($this->safe_value($orderbook, $asksKey, array()), $priceKey, $amountKey);
        return array(
            'symbol' => $symbol,
            'bids' => $this->sort_by($bids, 0, true),
            'asks' => $this->sort_by($asks, 0),
            'timestamp' => $timestamp,
            'datetime' => $this->iso8601 ($timestamp),
            'nonce' => null,
        );
    }

    public function parse_ohlcvs($ohlcvs, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        $results = array();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            $results[] = $this->parse_ohlcv($ohlcvs[$i], $market);
        }
        $sorted = $this->sort_by($results, 0);
        $tail = ($since === null);
        return $this->filter_by_since_limit($sorted, $since, $limit, 0, $tail);
    }

    public function parse_leverage_tiers($response, $symbols = null, $marketIdKey = null) {
        // $marketIdKey should only be null when $response is a dictionary
        $symbols = $this->market_symbols($symbols);
        $tiers = array();
        for ($i = 0; $i < count($response); $i++) {
            $item = $response[$i];
            $id = $this->safe_string($item, $marketIdKey);
            $market = $this->safe_market($id);
            $symbol = $market['symbol'];
            $contract = $this->safe_value($market, 'contract', false);
            if ($contract && (($symbols === null) || $this->in_array($symbol, $symbols))) {
                $tiers[$symbol] = $this->parse_market_leverage_tiers($item, $market);
            }
        }
        return $tiers;
    }

    public function load_trading_limits($symbols = null, $reload = false, $params = array ()) {
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

    public function parse_positions($positions, $symbols = null, $params = array ()) {
        $symbols = $this->market_symbols($symbols);
        $positions = $this->to_array($positions);
        $result = array();
        for ($i = 0; $i < count($positions); $i++) {
            $position = array_merge($this->parse_position($positions[$i], null), $params);
            $result[] = $position;
        }
        return $this->filter_by_array($result, 'symbol', $symbols, false);
    }

    public function parse_accounts($accounts, $params = array ()) {
        $accounts = $this->to_array($accounts);
        $result = array();
        for ($i = 0; $i < count($accounts); $i++) {
            $account = array_merge($this->parse_account($accounts[$i]), $params);
            $result[] = $account;
        }
        return $result;
    }

    public function parse_trades($trades, $market = null, $since = null, $limit = null, $params = array ()) {
        $trades = $this->to_array($trades);
        $result = array();
        for ($i = 0; $i < count($trades); $i++) {
            $trade = array_merge($this->parse_trade($trades[$i], $market), $params);
            $result[] = $trade;
        }
        $result = $this->sort_by_2($result, 'timestamp', 'id');
        $symbol = ($market !== null) ? $market['symbol'] : null;
        $tail = ($since === null);
        return $this->filter_by_symbol_since_limit($result, $symbol, $since, $limit, $tail);
    }

    public function parse_transactions($transactions, $currency = null, $since = null, $limit = null, $params = array ()) {
        $transactions = $this->to_array($transactions);
        $result = array();
        for ($i = 0; $i < count($transactions); $i++) {
            $transaction = array_merge($this->parse_transaction($transactions[$i], $currency), $params);
            $result[] = $transaction;
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        $tail = ($since === null);
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit, $tail);
    }

    public function parse_transfers($transfers, $currency = null, $since = null, $limit = null, $params = array ()) {
        $transfers = $this->to_array($transfers);
        $result = array();
        for ($i = 0; $i < count($transfers); $i++) {
            $transfer = array_merge($this->parse_transfer($transfers[$i], $currency), $params);
            $result[] = $transfer;
        }
        $result = $this->sort_by($result, 'timestamp');
        $code = ($currency !== null) ? $currency['code'] : null;
        $tail = ($since === null);
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit, $tail);
    }

    public function parse_ledger($data, $currency = null, $since = null, $limit = null, $params = array ()) {
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
        $tail = ($since === null);
        return $this->filter_by_currency_since_limit($result, $code, $since, $limit, $tail);
    }

    public function nonce() {
        return $this->seconds ();
    }

    public function set_headers($headers) {
        return $headers;
    }

    public function market_id($symbol) {
        $market = $this->market ($symbol);
        if ($market !== null) {
            return $market['id'];
        }
        return $symbol;
    }

    public function symbol($symbol) {
        $market = $this->market ($symbol);
        return $this->safe_string($market, 'symbol', $symbol);
    }

    public function resolve_path($path, $params) {
        return array(
            $this->implode_params($path, $params),
            $this->omit ($params, $this->extract_params($path)),
        );
    }

    public function filter_by_array($objects, $key, $values = null, $indexed = true) {
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

    public function fetch2($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null, $config = array (), $context = array ()) {
        return Async\async(function () use ($path, $api, $method, $params, $headers, $body, $config, $context) {
            if ($this->enableRateLimit) {
                $cost = $this->calculate_rate_limiter_cost($api, $method, $path, $params, $config, $context);
                Async\await($this->throttle ($cost));
            }
            $this->lastRestRequestTimestamp = $this->milliseconds ();
            $request = $this->sign ($path, $api, $method, $params, $headers, $body);
            return Async\await($this->fetch ($request['url'], $request['method'], $request['headers'], $request['body']));
        }) ();
    }

    public function request($path, $api = 'public', $method = 'GET', $params = array (), $headers = null, $body = null, $config = array (), $context = array ()) {
        return Async\async(function () use ($path, $api, $method, $params, $headers, $body, $config, $context) {
            return Async\await($this->fetch2 ($path, $api, $method, $params, $headers, $body, $config, $context));
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

    public function fetch_trades($symbol, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTrades() is not supported yet');
    }

    public function fetch_ohlcvc($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $timeframe, $since, $limit, $params) {
            if (!$this->has['fetchTrades']) {
                throw new NotSupported($this->id . ' fetchOHLCV() is not supported yet');
            }
            Async\await($this->load_markets());
            $trades = Async\await($this->fetchTrades ($symbol, $since, $limit, $params));
            return $this->build_ohlcvc($trades, $timeframe, $since, $limit);
        }) ();
    }

    public function parse_trading_view_ohlcv($ohlcvs, $market = null, $timeframe = '1m', $since = null, $limit = null) {
        $result = $this->convert_trading_view_to_ohlcv($ohlcvs);
        return $this->parse_ohlcvs($result, $market, $timeframe, $since, $limit);
    }

    public function edit_limit_buy_order($id, $symbol, $amount, $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $amount, $price, $params) {
            return Async\await($this->edit_limit_order($id, $symbol, 'buy', $amount, $price, $params));
        }) ();
    }

    public function edit_limit_sell_order($id, $symbol, $amount, $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $amount, $price, $params) {
            return Async\await($this->edit_limit_order($id, $symbol, 'sell', $amount, $price, $params));
        }) ();
    }

    public function edit_limit_order($id, $symbol, $side, $amount, $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $side, $amount, $price, $params) {
            return Async\await($this->edit_order($id, $symbol, 'limit', $side, $amount, $price, $params));
        }) ();
    }

    public function edit_order($id, $symbol, $type, $side, $amount, $price = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $type, $side, $amount, $price, $params) {
            Async\await($this->cancelOrder ($id, $symbol));
            return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $params));
        }) ();
    }

    public function fetch_permissions($params = array ()) {
        throw new NotSupported($this->id . ' fetchPermissions() is not supported yet');
    }

    public function fetch_position($symbol, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPosition() is not supported yet');
    }

    public function fetch_positions($symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositions() is not supported yet');
    }

    public function fetch_positions_risk($symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchPositionsRisk() is not supported yet');
    }

    public function fetch_bids_asks($symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchBidsAsks() is not supported yet');
    }

    public function parse_bid_ask($bidask, $priceKey = 0, $amountKey = 1) {
        $price = $this->safe_number($bidask, $priceKey);
        $amount = $this->safe_number($bidask, $amountKey);
        return array( $price, $amount );
    }

    public function safe_currency($currencyId, $currency = null) {
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
        );
    }

    public function safe_market($marketId = null, $market = null, $delimiter = null, $marketType = null) {
        $result = array(
            'id' => $marketId,
            'symbol' => $marketId,
            'base' => null,
            'quote' => null,
            'baseId' => null,
            'quoteId' => null,
            'active' => null,
            'type' => null,
            'linear' => null,
            'inverse' => null,
            'spot' => false,
            'swap' => false,
            'future' => false,
            'option' => false,
            'margin' => false,
            'contract' => false,
            'contractSize' => null,
            'expiry' => null,
            'expiryDatetime' => null,
            'optionType' => null,
            'strike' => null,
            'settle' => null,
            'settleId' => null,
            'precision' => array(
                'amount' => null,
                'price' => null,
            ),
            'limits' => array(
                'amount' => array(
                    'min' => null,
                    'max' => null,
                ),
                'price' => array(
                    'min' => null,
                    'max' => null,
                ),
                'cost' => array(
                    'min' => null,
                    'max' => null,
                ),
            ),
            'info' => null,
        );
        if ($marketId !== null) {
            if (($this->markets_by_id !== null) && (is_array($this->markets_by_id) && array_key_exists($marketId, $this->markets_by_id))) {
                $markets = $this->markets_by_id[$marketId];
                $length = count($markets);
                if ($length === 1) {
                    return $markets[0];
                } else {
                    if ($marketType === null) {
                        throw new ArgumentsRequired($this->id . ' safeMarket() requires a fourth argument for ' . $marketId . ' to disambiguate between different $markets with the same $market id');
                    }
                    for ($i = 0; $i < count($markets); $i++) {
                        $market = $markets[$i];
                        if ($market[$marketType]) {
                            return $market;
                        }
                    }
                }
            } elseif ($delimiter !== null) {
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
            return $this->totp ($this->twofa);
        } else {
            throw new ExchangeError($this->id . ' exchange.twofa has not been set for 2FA Two-Factor Authentication');
        }
    }

    public function fetch_balance($params = array ()) {
        throw new NotSupported($this->id . ' fetchBalance() is not supported yet');
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
        return Async\async(function () use ($params) {
            if ($this->has['fetchTime']) {
                $time = Async\await($this->fetchTime ($params));
                $this->status = array_merge($this->status, array(
                    'updated' => $time,
                ));
            }
            return $this->status;
        }) ();
    }

    public function fetch_funding_fee($code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            $warnOnFetchFundingFee = $this->safe_value($this->options, 'warnOnFetchFundingFee', true);
            if ($warnOnFetchFundingFee) {
                throw new NotSupported($this->id . ' fetchFundingFee() method is deprecated, it will be removed in July 2022, please, use fetchTransactionFee() or set exchange.options["warnOnFetchFundingFee"] = false to suppress this warning');
            }
            return Async\await($this->fetch_transaction_fee($code, $params));
        }) ();
    }

    public function fetch_funding_fees($codes = null, $params = array ()) {
        return Async\async(function () use ($codes, $params) {
            $warnOnFetchFundingFees = $this->safe_value($this->options, 'warnOnFetchFundingFees', true);
            if ($warnOnFetchFundingFees) {
                throw new NotSupported($this->id . ' fetchFundingFees() method is deprecated, it will be removed in July 2022. Please, use fetchTransactionFees() or set exchange.options["warnOnFetchFundingFees"] = false to suppress this warning');
            }
            return Async\await($this->fetch_transaction_fees($codes, $params));
        }) ();
    }

    public function fetch_transaction_fee($code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            if (!$this->has['fetchTransactionFees']) {
                throw new NotSupported($this->id . ' fetchTransactionFee() is not supported yet');
            }
            return Async\await($this->fetch_transaction_fees(array( $code ), $params));
        }) ();
    }

    public function fetch_transaction_fees($codes = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTransactionFees() is not supported yet');
    }

    public function fetch_deposit_withdraw_fee($code, $params = array ()) {
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

    public function fetch_borrow_rate($code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            Async\await($this->load_markets());
            if (!$this->has['fetchBorrowRates']) {
                throw new NotSupported($this->id . ' fetchBorrowRate() is not supported yet');
            }
            $borrowRates = Async\await($this->fetch_borrow_rates($params));
            $rate = $this->safe_value($borrowRates, $code);
            if ($rate === null) {
                throw new ExchangeError($this->id . ' fetchBorrowRate() could not find the borrow $rate for currency $code ' . $code);
            }
            return $rate;
        }) ();
    }

    public function handle_option_and_params($params, $methodName, $optionName, $defaultValue = null) {
        // This method can be used to obtain method specific properties, i.e => $this->handleOptionAndParams ($params, 'fetchPosition', 'marginMode', 'isolated')
        $defaultOptionName = 'default' . $this->capitalize ($optionName); // we also need to check the 'defaultXyzWhatever'
        // check if $params contain the key
        $value = $this->safe_string_2($params, $optionName, $defaultOptionName);
        if ($value !== null) {
            $params = $this->omit ($params, array( $optionName, $defaultOptionName ));
        } else {
            // check if exchange has properties for this method
            $exchangeWideMethodOptions = $this->safe_value($this->options, $methodName);
            if ($exchangeWideMethodOptions !== null) {
                // check if the option is defined in this method's props
                $value = $this->safe_string_2($exchangeWideMethodOptions, $optionName, $defaultOptionName);
            }
            if ($value === null) {
                // if it's still null, check if global exchange-wide option exists
                $value = $this->safe_string_2($this->options, $optionName, $defaultOptionName);
            }
            // if it's still null, use the default $value
            $value = ($value !== null) ? $value : $defaultValue;
        }
        return array( $value, $params );
    }

    public function handle_market_type_and_params($methodName, $market = null, $params = array ()) {
        $defaultType = $this->safe_string_2($this->options, 'defaultType', 'type', 'spot');
        $methodOptions = $this->safe_value($this->options, $methodName);
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

    public function handle_sub_type_and_params($methodName, $market = null, $params = array (), $defaultValue = 'linear') {
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
                $values = $this->handleOptionAndParams (null, $methodName, 'subType', $defaultValue); // no need to re-test $params here
                $subType = $values[0];
            }
        }
        return array( $subType, $params );
    }

    public function handle_margin_mode_and_params($methodName, $params = array (), $defaultValue = null) {
        /**
         * @ignore
         * @param {array} $params extra parameters specific to the exchange api endpoint
         * @return array([string|null, object]) the marginMode in lowercase as specified by $params["marginMode"], $params["defaultMarginMode"] $this->options["marginMode"] or $this->options["defaultMarginMode"]
         */
        return $this->handleOptionAndParams ($params, $methodName, 'marginMode', $defaultValue);
    }

    public function throw_exactly_matched_exception($exact, $string, $message) {
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
    }

    public function calculate_rate_limiter_cost($api, $method, $path, $params, $config = array (), $context = array ()) {
        return $this->safe_value($config, 'cost', 1);
    }

    public function fetch_ticker($symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if ($this->has['fetchTickers']) {
                $tickers = Async\await($this->fetch_tickers(array( $symbol ), $params));
                $ticker = $this->safe_value($tickers, $symbol);
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

    public function fetch_tickers($symbols = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTickers() is not supported yet');
    }

    public function fetch_order($id, $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrder() is not supported yet');
    }

    public function fetch_order_status($id, $symbol = null, $params = array ()) {
        return Async\async(function () use ($id, $symbol, $params) {
            $order = Async\await($this->fetch_order($id, $symbol, $params));
            return $order['status'];
        }) ();
    }

    public function fetch_unified_order($order, $params = array ()) {
        return Async\async(function () use ($order, $params) {
            return Async\await($this->fetch_order($this->safe_value($order, 'id'), $this->safe_value($order, 'symbol'), $params));
        }) ();
    }

    public function create_order($symbol, $type, $side, $amount, $price = null, $params = array ()) {
        throw new NotSupported($this->id . ' createOrder() is not supported yet');
    }

    public function cancel_order($id, $symbol = null, $params = array ()) {
        throw new NotSupported($this->id . ' cancelOrder() is not supported yet');
    }

    public function cancel_unified_order($order, $params = array ()) {
        return $this->cancelOrder ($this->safe_value($order, 'id'), $this->safe_value($order, 'symbol'), $params);
    }

    public function fetch_orders($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOrders() is not supported yet');
    }

    public function fetch_open_orders($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchOpenOrders() is not supported yet');
    }

    public function fetch_closed_orders($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchClosedOrders() is not supported yet');
    }

    public function fetch_my_trades($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchMyTrades() is not supported yet');
    }

    public function fetch_transactions($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchTransactions() is not supported yet');
    }

    public function fetch_deposits($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchDeposits() is not supported yet');
    }

    public function fetch_withdrawals($symbol = null, $since = null, $limit = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchWithdrawals() is not supported yet');
    }

    public function fetch_deposit_address($code, $params = array ()) {
        return Async\async(function () use ($code, $params) {
            if ($this->has['fetchDepositAddresses']) {
                $depositAddresses = Async\await($this->fetchDepositAddresses (array( $code ), $params));
                $depositAddress = $this->safe_value($depositAddresses, $code);
                if ($depositAddress === null) {
                    throw new InvalidAddress($this->id . ' fetchDepositAddress() could not find a deposit address for ' . $code . ', make sure you have created a corresponding deposit address in your wallet on the exchange website');
                } else {
                    return $depositAddress;
                }
            } else {
                throw new NotSupported($this->id . ' fetchDepositAddress() is not supported yet');
            }
        }) ();
    }

    public function account() {
        return array(
            'free' => null,
            'used' => null,
            'total' => null,
        );
    }

    public function common_currency_code($currency) {
        if (!$this->substituteCommonCurrencyCodes) {
            return $currency;
        }
        return $this->safe_string($this->commonCurrencies, $currency, $currency);
    }

    public function currency($code) {
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

    public function market($symbol) {
        if ($this->markets === null) {
            throw new ExchangeError($this->id . ' $markets not loaded');
        }
        if (gettype($symbol) === 'string') {
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
            }
        }
        throw new BadSymbol($this->id . ' does not have $market $symbol ' . $symbol);
    }

    public function handle_withdraw_tag_and_params($tag, $params) {
        if (gettype($tag) === 'array') {
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

    public function create_limit_order($symbol, $side, $amount, $price, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $amount, $price, $params) {
            return Async\await($this->create_order($symbol, 'limit', $side, $amount, $price, $params));
        }) ();
    }

    public function create_market_order($symbol, $side, $amount, $price = null, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $amount, $price, $params) {
            return Async\await($this->create_order($symbol, 'market', $side, $amount, $price, $params));
        }) ();
    }

    public function create_limit_buy_order($symbol, $amount, $price, $params = array ()) {
        return Async\async(function () use ($symbol, $amount, $price, $params) {
            return Async\await($this->create_order($symbol, 'limit', 'buy', $amount, $price, $params));
        }) ();
    }

    public function create_limit_sell_order($symbol, $amount, $price, $params = array ()) {
        return Async\async(function () use ($symbol, $amount, $price, $params) {
            return Async\await($this->create_order($symbol, 'limit', 'sell', $amount, $price, $params));
        }) ();
    }

    public function create_market_buy_order($symbol, $amount, $params = array ()) {
        return Async\async(function () use ($symbol, $amount, $params) {
            return Async\await($this->create_order($symbol, 'market', 'buy', $amount, null, $params));
        }) ();
    }

    public function create_market_sell_order($symbol, $amount, $params = array ()) {
        return Async\async(function () use ($symbol, $amount, $params) {
            return Async\await($this->create_order($symbol, 'market', 'sell', $amount, null, $params));
        }) ();
    }

    public function cost_to_precision($symbol, $cost) {
        $market = $this->market ($symbol);
        return $this->decimal_to_precision($cost, TRUNCATE, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function price_to_precision($symbol, $price) {
        $market = $this->market ($symbol);
        $result = $this->decimal_to_precision($price, ROUND, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
        if ($result === '0') {
            throw new ArgumentsRequired($this->id . ' $price of ' . $market['symbol'] . ' must be greater than minimum $price precision of ' . $this->number_to_string($market['precision']['price']));
        }
        return $result;
    }

    public function amount_to_precision($symbol, $amount) {
        $market = $this->market ($symbol);
        $result = $this->decimal_to_precision($amount, TRUNCATE, $market['precision']['amount'], $this->precisionMode, $this->paddingMode);
        if ($result === '0') {
            throw new ArgumentsRequired($this->id . ' $amount of ' . $market['symbol'] . ' must be greater than minimum $amount precision of ' . $this->number_to_string($market['precision']['amount']));
        }
        return $result;
    }

    public function fee_to_precision($symbol, $fee) {
        $market = $this->market ($symbol);
        return $this->decimal_to_precision($fee, ROUND, $market['precision']['price'], $this->precisionMode, $this->paddingMode);
    }

    public function currency_to_precision($code, $fee, $networkCode = null) {
        $currency = $this->currencies[$code];
        $precision = $this->safe_value($currency, 'precision');
        if ($networkCode !== null) {
            $networks = $this->safe_value($currency, 'networks', array());
            $networkItem = $this->safe_value($networks, $networkCode, array());
            $precision = $this->safe_value($networkItem, 'precision', $precision);
        }
        if ($precision === null) {
            return $fee;
        } else {
            return $this->decimal_to_precision($fee, ROUND, $precision, $this->precisionMode, $this->paddingMode);
        }
    }

    public function safe_number($object, $key, $d = null) {
        $value = $this->safe_string($object, $key);
        return $this->parse_number($value, $d);
    }

    public function safe_number_n($object, $arr, $d = null) {
        $value = $this->safe_string_n($object, $arr);
        return $this->parse_number($value, $d);
    }

    public function parse_precision($precision) {
        if ($precision === null) {
            return null;
        }
        return '1e' . Precise::string_neg($precision);
    }

    public function load_time_difference($params = array ()) {
        return Async\async(function () use ($params) {
            $serverTime = Async\await($this->fetchTime ($params));
            $after = $this->milliseconds ();
            $this->options['timeDifference'] = $after - $serverTime;
            return $this->options['timeDifference'];
        }) ();
    }

    public function implode_hostname($url) {
        return $this->implode_params($url, array( 'hostname' => $this->hostname ));
    }

    public function fetch_market_leverage_tiers($symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if ($this->has['fetchLeverageTiers']) {
                $market = Async\await($this->market ($symbol));
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

    public function create_post_only_order($symbol, $type, $side, $amount, $price, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $params) {
            if (!$this->has['createPostOnlyOrder']) {
                throw new NotSupported($this->id . 'createPostOnlyOrder() is not supported yet');
            }
            $query = array_merge($params, array( 'postOnly' => true ));
            return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $query));
        }) ();
    }

    public function create_reduce_only_order($symbol, $type, $side, $amount, $price, $params = array ()) {
        return Async\async(function () use ($symbol, $type, $side, $amount, $price, $params) {
            if (!$this->has['createReduceOnlyOrder']) {
                throw new NotSupported($this->id . 'createReduceOnlyOrder() is not supported yet');
            }
            $query = array_merge($params, array( 'reduceOnly' => true ));
            return Async\await($this->create_order($symbol, $type, $side, $amount, $price, $query));
        }) ();
    }

    public function create_stop_order($symbol, $type, $side, $amount, $price = null, $stopPrice = null, $params = array ()) {
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

    public function create_stop_limit_order($symbol, $side, $amount, $price, $stopPrice, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $amount, $price, $stopPrice, $params) {
            if (!$this->has['createStopLimitOrder']) {
                throw new NotSupported($this->id . ' createStopLimitOrder() is not supported yet');
            }
            $query = array_merge($params, array( 'stopPrice' => $stopPrice ));
            return Async\await($this->create_order($symbol, 'limit', $side, $amount, $price, $query));
        }) ();
    }

    public function create_stop_market_order($symbol, $side, $amount, $stopPrice, $params = array ()) {
        return Async\async(function () use ($symbol, $side, $amount, $stopPrice, $params) {
            if (!$this->has['createStopMarketOrder']) {
                throw new NotSupported($this->id . ' createStopMarketOrder() is not supported yet');
            }
            $query = array_merge($params, array( 'stopPrice' => $stopPrice ));
            return Async\await($this->create_order($symbol, 'market', $side, $amount, null, $query));
        }) ();
    }

    public function safe_currency_code($currencyId, $currency = null) {
        $currency = $this->safe_currency($currencyId, $currency);
        return $currency['code'];
    }

    public function filter_by_symbol_since_limit($array, $symbol = null, $since = null, $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'symbol', $symbol, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_currency_since_limit($array, $code = null, $since = null, $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'currency', $code, $since, $limit, 'timestamp', $tail);
    }

    public function parse_tickers($tickers, $symbols = null, $params = array ()) {
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

    public function parse_deposit_addresses($addresses, $codes = null, $indexed = true, $params = array ()) {
        $result = array();
        for ($i = 0; $i < count($addresses); $i++) {
            $address = array_merge($this->parse_deposit_address($addresses[$i]), $params);
            $result[] = $address;
        }
        if ($codes !== null) {
            $result = $this->filter_by_array($result, 'currency', $codes, false);
        }
        $result = $indexed ? $this->index_by($result, 'currency') : $result;
        return $result;
    }

    public function parse_borrow_interests($response, $market = null) {
        $interests = array();
        for ($i = 0; $i < count($response); $i++) {
            $row = $response[$i];
            $interests[] = $this->parse_borrow_interest($row, $market);
        }
        return $interests;
    }

    public function parse_funding_rate_histories($response, $market = null, $since = null, $limit = null) {
        $rates = array();
        for ($i = 0; $i < count($response); $i++) {
            $entry = $response[$i];
            $rates[] = $this->parse_funding_rate_history($entry, $market);
        }
        $sorted = $this->sort_by($rates, 'timestamp');
        $symbol = ($market === null) ? null : $market['symbol'];
        return $this->filter_by_symbol_since_limit($sorted, $symbol, $since, $limit);
    }

    public function safe_symbol($marketId, $market = null, $delimiter = null, $marketType = null) {
        $market = $this->safe_market($marketId, $market, $delimiter, $marketType);
        return $market['symbol'];
    }

    public function parse_funding_rate($contract, $market = null) {
        throw new NotSupported($this->id . ' parseFundingRate() is not supported yet');
    }

    public function parse_funding_rates($response, $market = null) {
        $result = array();
        for ($i = 0; $i < count($response); $i++) {
            $parsed = $this->parse_funding_rate($response[$i], $market);
            $result[$parsed['symbol']] = $parsed;
        }
        return $result;
    }

    public function is_trigger_order($params) {
        $isTrigger = $this->safe_value_2($params, 'trigger', 'stop');
        if ($isTrigger) {
            $params = $this->omit ($params, array( 'trigger', 'stop' ));
        }
        return array( $isTrigger, $params );
    }

    public function is_post_only($isMarketOrder, $exchangeSpecificParam, $params = array ()) {
        /**
         * @ignore
         * @param {string} type Order type
         * @param {boolean} $exchangeSpecificParam exchange specific $postOnly
         * @param {array} $params exchange specific $params
         * @return {boolean} true if a post only order, false otherwise
         */
        $timeInForce = $this->safe_string_upper($params, 'timeInForce');
        $postOnly = $this->safe_value_2($params, 'postOnly', 'post_only', false);
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

    public function fetch_trading_fees($params = array ()) {
        throw new NotSupported($this->id . ' fetchTradingFees() is not supported yet');
    }

    public function fetch_trading_fee($symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if (!$this->has['fetchTradingFees']) {
                throw new NotSupported($this->id . ' fetchTradingFee() is not supported yet');
            }
            return Async\await($this->fetch_trading_fees($params));
        }) ();
    }

    public function parse_open_interest($interest, $market = null) {
        throw new NotSupported($this->id . ' parseOpenInterest () is not supported yet');
    }

    public function parse_open_interests($response, $market = null, $since = null, $limit = null) {
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

    public function fetch_funding_rate($symbol, $params = array ()) {
        return Async\async(function () use ($symbol, $params) {
            if ($this->has['fetchFundingRates']) {
                Async\await($this->load_markets());
                $market = $this->market ($symbol);
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

    public function fetch_mark_ohlcv($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $timeframe, $since, $limit, $params) {
            /**
             * fetches historical mark price candlestick data containing the open, high, low, and close price of a market
             * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
             * @param {string} $timeframe the length of time each candle represents
             * @param {int|null} $since timestamp in ms of the earliest candle to fetch
             * @param {int|null} $limit the maximum amount of candles to fetch
             * @param {array} $params extra parameters specific to the exchange api endpoint
             * @return {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, null
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

    public function fetch_index_ohlcv($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $timeframe, $since, $limit, $params) {
            /**
             * fetches historical index price candlestick data containing the open, high, low, and close price of a market
             * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
             * @param {string} $timeframe the length of time each candle represents
             * @param {int|null} $since timestamp in ms of the earliest candle to fetch
             * @param {int|null} $limit the maximum amount of candles to fetch
             * @param {array} $params extra parameters specific to the exchange api endpoint
             * @return {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, null
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

    public function fetch_premium_index_ohlcv($symbol, $timeframe = '1m', $since = null, $limit = null, $params = array ()) {
        return Async\async(function () use ($symbol, $timeframe, $since, $limit, $params) {
            /**
             * fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
             * @param {string} $symbol unified $symbol of the market to fetch OHLCV data for
             * @param {string} $timeframe the length of time each candle represents
             * @param {int|null} $since timestamp in ms of the earliest candle to fetch
             * @param {int|null} $limit the maximum amount of candles to fetch
             * @param {array} $params extra parameters specific to the exchange api endpoint
             * @return {[[int|float]]} A list of candles ordered as timestamp, open, high, low, close, null
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
         * * Must add $timeInForce to $this->options to use this method
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
         * * Must add $accountsByType to $this->options to use this method
         * @param {string} $account key for $account name in $this->options['accountsByType']
         * @return the exchange specific $account name or the isolated margin id for transfers
         */
        $accountsByType = $this->safe_value($this->options, 'accountsByType', array());
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

    public function check_required_argument($methodName, $argument, $argumentName, $options = []) {
        /**
         * @ignore
         * @param {string} $argument the $argument to check
         * @param {string} $argumentName the name of the $argument to check
         * @param {string} $methodName the name of the method that the $argument is being checked for
         * @param {[string]} $options a list of $options that the $argument can be
         * @return {null}
         */
        if (($argument === null) || ((strlen($options) > 0) && (!($this->in_array($argument, $options))))) {
            $messageOptions = implode(', ', $options);
            $message = $this->id . ' ' . $methodName . '() requires a ' . $argumentName . ' argument';
            if ($messageOptions !== '') {
                $message .= ', one of ' . '(' . $messageOptions . ')';
            }
            throw new ArgumentsRequired($message);
        }
    }

    public function check_required_margin_argument($methodName, $symbol, $marginMode) {
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

    public function check_required_symbol($methodName, $symbol) {
        /**
         * @ignore
         * @param {string} $symbol unified $symbol of the market
         * @param {string} $methodName name of the method that requires a $symbol
         */
        $this->checkRequiredArgument ($methodName, $symbol, 'symbol');
    }

    public function parse_deposit_withdraw_fees($response, $codes = null, $currencyIdKey = null) {
        /**
         * @ignore
         * @param {[object]|array} $response unparsed $response from the exchange
         * @param {[string]|null} $codes the unified $currency $codes to fetch transactions fees for, returns all currencies when null
         * @param {str|null} $currencyIdKey *should only be null when $response is a $dictionary* the object key that corresponds to the $currency id
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

    public function deposit_withdraw_fee($info) {
        return array(
            'info' => $info,
            'withdraw' => array(
                'fee' => null,
                'percentage' => null,
            ),
            'deposit' => array(
                'fee' => null,
                'percentage' => null,
            ),
            'networks' => array(),
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
                $fee['withdraw'] = $fee['networks'][$networkKeys[$i]]['withdraw'];
                $fee['deposit'] = $fee['networks'][$networkKeys[$i]]['deposit'];
            }
        }
        return $fee;
    }
}
