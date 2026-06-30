<?php

namespace ccxt\prediction;

// ----------------------------------------------------------------------------
// base class for prediction-market exchanges (Polymarket, Kalshi, Limitless, ...)
// prediction is async-only (ReactPHP); the top of this file is hand-written and
// the methods below the delimiter are transpiled from ts/src/base/PredictionExchange.ts
// ----------------------------------------------------------------------------

use Exception; // a common import
use ccxt\ExchangeError;
use ccxt\BadSymbol;
use ccxt\NotSupported;
use ccxt\ArgumentsRequired;
use React\Async;
use React\Promise;

class PredictionExchange extends \ccxt\async\Exchange {
    public $outcomes = null;
    public $outcomes_by_id = null;
    public $events = null;
    public $events_by_slug = null;
    public $reloadingEvents = null;
    public $eventsLoading = null;

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

    public function is_prediction(): bool {
        return $this->safe_bool($this->has, 'prediction', false);
    }

    public function check_events(?string $outcome = null) {
        // pure synchronous guard (no I/O) — callers invoke it without await, so leaving it
        // async would make the coroutine never run in Python/PHP and silently skip validation.
        // outcomes are the real dependency for resolving a symbol; they are populated by
        // fetchEvents and also rebuilt from cached markets (loadMarkets), so accept either.
        // rebuild lazily from cached markets here because the setMarkets override that
        // normally does it is not dispatched by the base loadMarkets under the AST languages.
        if ((!$this->outcomes || $this->is_empty($this->outcomes)) && !$this->is_empty($this->markets)) {
            $this->set_outcomes_from_markets();
        }
        if (!$this->outcomes || $this->is_empty($this->outcomes)) {
            throw new ArgumentsRequired('Outcomes are required to be loaded, please fetch them first using fetchEvents (or loadMarkets)');
        }
        if ($outcome !== null) {
            if (!(is_array($this->outcomes) && array_key_exists($outcome, $this->outcomes)) && !(is_array($this->outcomes_by_id) && array_key_exists($outcome, $this->outcomes_by_id))) {
                throw new BadSymbol($this->id . ' the specified $outcome is not valid/available, please fetch events and outcomes first using fetchEvents');
            }
        }
    }

    public function parse_search_queries($params = array ()) {
        // accepts either `query` (a single search string) or `queries` (a list of strings)
        $singleQuery = $this->safe_string($params, 'query');
        if ($singleQuery !== null) {
            return array( $singleQuery );
        }
        return $this->safe_list($params, 'queries', array());
    }

    public function require_event_query($params = array ()) {
        // fetchEvents must be scoped by at least one selector — an unfiltered call would page the
        // entire exchange. require one of $query / $queries / $tags / $eventId / $slug
        $query = $this->safe_string($params, 'query');
        $queries = $this->safe_list($params, 'queries', array());
        $tags = $this->safe_list($params, 'tags', array());
        $eventId = $this->safe_string($params, 'eventId');
        $slug = $this->safe_string($params, 'slug');
        if (($query === null) && (strlen($queries) === 0) && (strlen($tags) === 0) && ($eventId === null) && ($slug === null)) {
            throw new ArgumentsRequired($this->id . ' fetchEvents() requires at least one of $query, $queries, $tags, $eventId or $slug to scope the search');
        }
        return null;
    }

    public function apply_event_fetch_params(array $events, $params = array (), ?array $queries = null) {
        // applies the unified fetchEvents options client-side (eventId/slug/status/searchIn/sort/limit)
        // so exchanges whose API can't filter natively still support them consistently
        $result = $events;
        $eventId = $this->safe_string($params, 'eventId');
        $slug = $this->safe_string($params, 'slug');
        if (($eventId !== null) || ($slug !== null)) {
            $filtered = array();
            for ($i = 0; $i < count($result); $i++) {
                $event = $result[$i];
                $idMatch = ($eventId !== null) && ($this->safe_string($event, 'id') === $eventId);
                $slugMatch = ($slug !== null) && ($this->safe_string($event, 'slug') === $slug);
                if ($idMatch || $slugMatch) {
                    $filtered[] = $event;
                }
            }
            $result = $filtered;
        }
        $result = $this->filter_events_by_status($result, $this->safe_string($params, 'status'));
        // own-line length read so the regex transpiler treats `$queries` array (count())
        // and not a string (strlen()); guard null since the default is null
        $queriesLength = 0;
        if ($queries !== null) {
            $queriesLength = count($queries);
        }
        if ($queriesLength > 0) {
            $result = $this->filter_events_by_search_in($result, $queries, $this->safe_string($params, 'searchIn'));
        }
        $sort = $this->safe_string($params, 'sort');
        if ($sort !== null) {
            $sortKey = null;
            if ($sort === 'volume') {
                $sortKey = 'volume';
            } elseif ($sort === 'liquidity') {
                $sortKey = 'liquidity';
            } elseif ($sort === 'newest') {
                $sortKey = 'created';
            }
            if ($sortKey !== null) {
                $result = $this->sort_by($result, $sortKey, true, 0);
            }
        }
        $limit = $this->safe_integer($params, 'limit');
        if ($limit !== null) {
            $result = $this->array_slice($result, 0, $limit);
        }
        return $result;
    }

    public function filter_events_by_status(array $events, ?string $status = null) {
        // 'active' | 'inactive' | 'closed' | 'all' — 'inactive' and 'closed' are interchangeable
        if (($status === null) || ($status === 'all')) {
            return $events;
        }
        $wantActive = ($status === 'active');
        $result = array();
        for ($i = 0; $i < count($events); $i++) {
            $event = $events[$i];
            $isActive = $this->safe_bool($event, 'active');
            // keep $events whose $status is unknown (already filtered server-side, no `active` field)
            if (($isActive === null) || ($isActive === $wantActive)) {
                $result[] = $event;
            }
        }
        return $result;
    }

    public function filter_events_by_search_in(array $events, array $queries, ?string $searchIn = null) {
        // keep $events whose $title and/or $description contains one of the $queries ($searchIn defaults to 'both')
        // own-line length read so the regex transpiler uses count() (array) not strlen() (string)
        $queriesLength = 0;
        if ($queries !== null) {
            $queriesLength = count($queries);
        }
        if (($searchIn === null) || ($queries === null) || ($queriesLength === 0)) {
            return $events;
        }
        $checkTitle = ($searchIn === 'title') || ($searchIn === 'both');
        $checkDescription = ($searchIn === 'description') || ($searchIn === 'both');
        $result = array();
        for ($i = 0; $i < count($events); $i++) {
            $event = $events[$i];
            $title = $this->safe_string_lower($event, 'title', '');
            $description = $this->safe_string_lower($event, 'description', '');
            $matched = false;
            for ($qi = 0; $qi < count($queries); $qi++) {
                $q = strtolower($queries[$qi]);
                if ($checkTitle && (mb_strpos($title, $q) !== false)) {
                    $matched = true;
                    break;
                }
                if ($checkDescription && (mb_strpos($description, $q) !== false)) {
                    $matched = true;
                    break;
                }
            }
            if ($matched) {
                $result[] = $event;
            }
        }
        return $result;
    }

    public function fetch_events(array $params = array ()) {
        throw new NotSupported($this->id . ' fetchEvents() is not supported yet');
    }

    public function fetch_event(string $id, $params = array ()) {
        throw new NotSupported($this->id . ' fetchEvent() is not supported yet');
    }

    public function set_events(array $events) {
        $this->events = array();
        $this->events_by_slug = array();
        for ($i = 0; $i < count($events); $i++) {
            $event = $events[$i];
            $id = $this->safe_string($event, 'id');
            $slug = $this->safe_string($event, 'slug');
            if ($id !== null) {
                $this->events[$id] = $event;
            }
            if ($slug !== null) {
                $this->events_by_slug[$slug] = $event;
            }
        }
        return $this->events;
    }

    public function load_events_helper($reload = false, $params = array ()) {
        return Async\async(function () use ($reload, $params) {
            if (!$reload && $this->events) {
                return $this->events;
            }
            $events = Async\await($this->fetch_events($params));
            return $this->set_events($events);
        }) ();
    }

    public function load_events($reload = false, $params = array ()) {
        return Async\async(function () use ($reload, $params) {
            return Async\await($this->load_events_helper($reload, $params));
        }) ();
    }

    public function outcome(string $outcomeSymbol) {
        if ($this->outcomes === null) {
            throw new ExchangeError($this->id . ' outcomes not loaded');
        }
        if (is_array($this->outcomes) && array_key_exists($outcomeSymbol, $this->outcomes)) {
            return $this->outcomes[$outcomeSymbol];
        }
        if (is_array($this->outcomes_by_id) && array_key_exists($outcomeSymbol, $this->outcomes_by_id)) {
            return $this->outcomes_by_id[$outcomeSymbol];
        }
        throw new BadSymbol($this->id . ' does not have outcome symbol ' . $outcomeSymbol);
    }

    public function safe_outcome(?string $outcomeIdOrSymbol, mixed $outcomeObj = null) {
        if ($outcomeIdOrSymbol !== null) {
            if (($this->outcomes !== null) && (is_array($this->outcomes) && array_key_exists($outcomeIdOrSymbol, $this->outcomes))) {
                return $this->outcomes[$outcomeIdOrSymbol];
            }
            if (($this->outcomes_by_id !== null) && (is_array($this->outcomes_by_id) && array_key_exists($outcomeIdOrSymbol, $this->outcomes_by_id))) {
                return $this->outcomes_by_id[$outcomeIdOrSymbol];
            }
        }
        if ($outcomeObj !== null) {
            return $outcomeObj;
        }
        return array( 'outcome' => $outcomeIdOrSymbol, 'outcomeId' => $outcomeIdOrSymbol, 'market' => null, 'label' => null, 'info' => array());
    }

    public function safe_outcome_symbol(?string $outcomeIdOrSymbol, mixed $outcomeObj = null) {
        $outcomeObj = $this->safe_outcome($outcomeIdOrSymbol, $outcomeObj);
        return $outcomeObj['outcome'];
    }

    public function shorten_slug(string $slug) {
        $replacements = array(
            'federal-reserve' => 'fed',
            'interest-rates' => 'rates',
            'interest-rate' => 'rate',
            'basis-points' => 'bps',
            'basis-point' => 'bp',
            'executive-order' => 'eo',
            'united-states' => 'us',
            'united-kingdom' => 'uk',
            'european-union' => 'eu',
            'artificial-intelligence' => 'ai',
            'republican-party' => 'gop',
            'democratic-party' => 'dems',
            'stock-market' => 'market',
            'price-target' => 'pt',
            'market-cap' => 'mcap',
            'increase' => 'hike',
            'decrease' => 'cut',
            'higher' => 'up',
            'lower' => 'down',
            'greater' => 'gt',
            'less' => 'lt',
            'million' => 'M',
            'billion' => 'B',
            'trillion' => 'T',
            'percent' => 'pct',
        );
        $stopWords = array(
            'will', 'the', 'a', 'an', 'after', 'before', 'in', 'at', 'by',
            'of', 'there', 'be', 'to', 'or', 'and', 'for', 'on', 'its',
            'that', 'this', 'from', 'with', 'as', 'is', 'are', 'was', 'were', '?', 'how', 'many', 'who', 'what', 'when', 'where', 'which', 'much',
        );
        $lower = ($slug === null) ? '' : strtolower($slug);
        $allowed = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $chars = $this->string_to_chars_array($lower);
        $s = '';
        $lastDash = true; // start true to drop leading separators
        for ($i = 0; $i < count($chars); $i++) {
            $ch = $chars[$i];
            if (mb_strpos($allowed, $ch) !== false) {
                $s = $s . $ch;
                $lastDash = false;
            } elseif (!$lastDash) {
                $s = $s . '-';
                $lastDash = true;
            }
        }
        $replacementKeys = is_array($replacements) ? array_keys($replacements) : array();
        for ($i = 0; $i < count($replacementKeys); $i++) {
            $replacementKey = $replacementKeys[$i];
            $replacementValue = $this->safe_string($replacements, $replacementKey);
            $s = str_replace($replacementKey, $replacementValue, $s);
        }
        $rawParts = explode('-', $s);
        $parts = array();
        for ($i = 0; $i < count($rawParts); $i++) {
            $w = $rawParts[$i];
            if (strlen($w) > 0 && !$this->in_array($w, $stopWords)) {
                $parts[] = $w;
            }
        }
        $joined = implode('_', $parts);
        return strtoupper($joined);
    }

    public function slug_to_market_symbol(string $eventSlug, string $marketSlug) {
        return $this->shorten_slug($marketSlug);
    }

    public function slug_to_outcome_symbol(string $eventSlug, string $marketSlug, string $outcome) {
        return $this->shorten_slug($marketSlug) . ':' . strtoupper($outcome);
    }

    public function slug_to_market_id(string $eventSlug, string $marketSlug, string $outcome) {
        return $this->slug_to_outcome_symbol($eventSlug, $marketSlug, $outcome);
    }

    public function set_markets($markets, $currencies = null) {
        $result = parent::set_markets($markets, $currencies);
        $this->set_outcomes_from_markets();
        return $result;
    }

    public function set_outcomes_from_markets() {
        // prediction markets carry their outcome tokens under the outcomes key,
        // rebuild the outcome lookup caches so cached $market data works offline.
        // normalize each outcome object to the canonical identity keys (outcome /
        // outcomeId / $market) so consumers and the safe* helpers are uniform even when
        // an exchange's parseMarket still emits the legacy symbol / id / marketSymbol keys.
        $this->outcomes = array();
        $this->outcomes_by_id = array();
        $marketKeys = is_array($this->markets) ? array_keys($this->markets) : array();
        for ($i = 0; $i < count($marketKeys); $i++) {
            $market = $this->markets[$marketKeys[$i]];
            $outcomesList = $this->safe_list($market, 'outcomes', array());
            for ($j = 0; $j < count($outcomesList); $j++) {
                $oc = $outcomesList[$j];
                $ocSymbol = $this->safe_string_2($oc, 'outcome', 'symbol');
                $ocId = $this->safe_string_2($oc, 'outcomeId', 'id');
                // assign unconditionally — safeString2 keeps the canonical key when present
                // and falls back to the legacy one, so this never clobbers and avoids a
                // missing-key access (which throws in Python/PHP, unlike TS null)
                $oc['outcome'] = $ocSymbol;
                $oc['outcomeId'] = $ocId;
                $oc['market'] = $this->safe_string_2($oc, 'market', 'marketSymbol');
                if ($ocSymbol !== null) {
                    $this->outcomes[$ocSymbol] = $oc;
                }
                if ($ocId !== null) {
                    $this->outcomes_by_id[$ocId] = $oc;
                }
            }
        }
    }

    public function fetch_ticker(string $outcome, $params = array ()) {
        return Async\async(function () use ($outcome, $params) {
            /**
             * fetches a price ticker for a single prediction $outcome
             * @param {string} $outcome unified $outcome handle
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
             */
            return Async\await(parent::fetch_ticker($outcome, $params));
        }) ();
    }

    public function fetch_order_book(string $outcome, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $limit, $params) {
            /**
             * fetches the order book for a prediction $outcome
             * @param {string} $outcome unified $outcome handle
             * @param {int} [$limit] the maximum number of order book entries to return
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
             */
            return Async\await(parent::fetch_order_book($outcome, $limit, $params));
        }) ();
    }

    public function fetch_ohlcv(string $outcome, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $timeframe, $since, $limit, $params) {
            /**
             * fetches historical candlestick data for a prediction $outcome
             * @param {string} $outcome unified $outcome handle
             * @param {string} $timeframe the length of time each candle represents
             * @param {int} [$since] timestamp in ms of the earliest candle to fetch
             * @param {int} [$limit] the maximum number of candles to fetch
             * @param {array} [$params] extra exchange-specific parameters
             * @return {int[][]} a list of candles ordered, open, high, low, close, volume
             */
            return Async\await(parent::fetch_ohlcv($outcome, $timeframe, $since, $limit, $params));
        }) ();
    }

    public function fetch_trades(string $outcome, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $since, $limit, $params) {
            /**
             * get the list of most recent trades for a prediction $outcome
             * @param {string} $outcome unified $outcome handle
             * @param {int} [$since] timestamp in ms of the earliest trade to fetch
             * @param {int} [$limit] the maximum number of trades to fetch
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
             */
            return Async\await(parent::fetch_trades($outcome, $since, $limit, $params));
        }) ();
    }

    public function create_order(string $outcome, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($outcome, $type, $side, $amount, $price, $params) {
            /**
             * create a trade order on a prediction $outcome
             * @param {string} $outcome unified $outcome handle
             * @param {string} $type 'market' or 'limit'
             * @param {string} $side 'buy' or 'sell'
             * @param {float} $amount how many shares of the $outcome to trade
             * @param {float} [$price] the $price at which the order is to be filled, in cost per share
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
             */
            return Async\await(parent::create_order($outcome, $type, $side, $amount, $price, $params));
        }) ();
    }

    public function cancel_order(string $id, ?string $outcome = null, $params = array ()) {
        return Async\async(function () use ($id, $outcome, $params) {
            /**
             * cancels an open order
             * @param {string} $id order $id
             * @param {string} [$outcome] unified $outcome handle
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [order structure](https://docs.ccxt.com/#/?$id=order-structure)
             */
            return Async\await(parent::cancel_order($id, $outcome, $params));
        }) ();
    }

    public function watch_ticker(string $outcome, $params = array ()) {
        return Async\async(function () use ($outcome, $params) {
            /**
             * watches a price ticker for a single prediction $outcome
             * @param {string} $outcome unified $outcome handle
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
             */
            return Async\await(parent::watch_ticker($outcome, $params));
        }) ();
    }

    public function watch_order_book(string $outcome, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $limit, $params) {
            /**
             * watches the order book for a prediction $outcome
             * @param {string} $outcome unified $outcome handle
             * @param {int} [$limit] the maximum number of order book entries to return
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
             */
            return Async\await(parent::watch_order_book($outcome, $limit, $params));
        }) ();
    }

    public function watch_trades(string $outcome, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $since, $limit, $params) {
            /**
             * watches the most recent trades for a prediction $outcome
             * @param {string} $outcome unified $outcome handle
             * @param {int} [$since] timestamp in ms of the earliest trade to fetch
             * @param {int} [$limit] the maximum number of trades to fetch
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
             */
            return Async\await(parent::watch_trades($outcome, $since, $limit, $params));
        }) ();
    }

    public function fetch_orders(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches information on multiple orders made by the user
         * @param {string} [$outcome] unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest order to fetch
         * @param {int} [$limit] the maximum number of orders to fetch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
         */
        throw new NotSupported($this->id . ' fetchOrders() is not supported yet');
    }

    public function fetch_closed_orders(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetches information on multiple closed orders made by the user
         * @param {string} [$outcome] unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest order to fetch
         * @param {int} [$limit] the maximum number of orders to fetch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
         */
        throw new NotSupported($this->id . ' fetchClosedOrders() is not supported yet');
    }

    public function fetch_order_trades(string $id, ?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetch all the trades made from a single order
         * @param {string} $id order $id
         * @param {string} [$outcome] unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest trade to fetch
         * @param {int} [$limit] the maximum number of trades to fetch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?$id=trade-structure)
         */
        throw new NotSupported($this->id . ' fetchOrderTrades() is not supported yet');
    }

    public function fetch_my_trades(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * fetch all trades made by the user
         * @param {string} [$outcome] unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest trade to fetch
         * @param {int} [$limit] the maximum number of trades to fetch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
         */
        throw new NotSupported($this->id . ' fetchMyTrades() is not supported yet');
    }

    public function fetch_position(string $outcome, $params = array ()) {
        /**
         * fetch the open position held on a single prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
         */
        throw new NotSupported($this->id . ' fetchPosition() is not supported yet');
    }

    public function fetch_trading_fee(string $outcome, $params = array ()) {
        /**
         * fetch the trading fee for a prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
         */
        throw new NotSupported($this->id . ' fetchTradingFee() is not supported yet');
    }

    public function fetch_open_interest(string $outcome, $params = array ()) {
        /**
         * fetch the open interest of a prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
         */
        throw new NotSupported($this->id . ' fetchOpenInterest() is not supported yet');
    }

    public function create_orders(array $orders, $params = array ()) {
        /**
         * create a list of trade $orders
         * @param {array[]} $orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
         */
        throw new NotSupported($this->id . ' createOrders() is not supported yet');
    }

    public function cancel_orders(array $ids, ?string $outcome = null, $params = array ()) {
        /**
         * cancel multiple orders
         * @param {string[]} $ids order $ids
         * @param {string} [$outcome] unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
         */
        throw new NotSupported($this->id . ' cancelOrders() is not supported yet');
    }

    public function create_market_buy_order_with_cost(string $outcome, float $cost, $params = array ()) {
        return Async\async(function () use ($outcome, $cost, $params) {
            /**
             * create a market buy order on a prediction $outcome by providing the $cost
             * @param {string} $outcome unified $outcome handle
             * @param {float} $cost how much you want to spend, in $cost terms
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
             */
            if ($this->options['createMarketBuyOrderRequiresPrice'] || $this->has['createMarketBuyOrderWithCost']) {
                return Async\await($this->create_order($outcome, 'market', 'buy', $cost, 1, $params));
            }
            throw new NotSupported($this->id . ' createMarketBuyOrderWithCost() is not supported yet');
        }) ();
    }

    public function create_market_sell_order_with_cost(string $outcome, float $cost, $params = array ()) {
        return Async\async(function () use ($outcome, $cost, $params) {
            /**
             * create a market sell order on a prediction $outcome by providing the $cost
             * @param {string} $outcome unified $outcome handle
             * @param {float} $cost how much you want to receive, in $cost terms
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
             */
            if ($this->options['createMarketSellOrderRequiresPrice'] || $this->has['createMarketSellOrderWithCost']) {
                return Async\await($this->create_order($outcome, 'market', 'sell', $cost, 1, $params));
            }
            throw new NotSupported($this->id . ' createMarketSellOrderWithCost() is not supported yet');
        }) ();
    }

    public function watch_tickers(?array $outcomes = null, $params = array ()) {
        /**
         * watches price tickers for multiple prediction $outcomes
         * @param {string[]} [$outcomes] unified outcome handles to watch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
         */
        throw new NotSupported($this->id . ' watchTickers() is not supported yet');
    }

    public function watch_orders(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * watches information on multiple orders made by the user
         * @param {string} [$outcome] unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest order to watch
         * @param {int} [$limit] the maximum number of orders to watch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
         */
        throw new NotSupported($this->id . ' watchOrders() is not supported yet');
    }

    public function watch_my_trades(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * watches all trades made by the user
         * @param {string} [$outcome] unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest trade to watch
         * @param {int} [$limit] the maximum number of trades to watch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
         */
        throw new NotSupported($this->id . ' watchMyTrades() is not supported yet');
    }

    public function watch_positions(?array $outcomes = null, ?int $since = null, ?int $limit = null, $params = array ()) {
        /**
         * watches the open positions held by the user
         * @param {string[]} [$outcomes] unified outcome handles to watch
         * @param {int} [$since] timestamp in ms of the earliest position to watch
         * @param {int} [$limit] the maximum number of positions to watch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
         */
        throw new NotSupported($this->id . ' watchPositions() is not supported yet');
    }

    public function safe_prediction_order(array $order, $market = null) {
        // the prediction identity is the `outcome` handle carried on the raw dict (read by
        // toPredictionStructure), not a ccxt `symbol`, so don't pass an outcome object $market
        $parsed = parent::safe_order($order);
        return $this->to_prediction_structure($parsed, $order);
    }

    public function safe_prediction_trade(array $trade, $market = null) {
        $parsed = parent::safe_trade($trade);
        return $this->to_prediction_structure($parsed, $trade);
    }

    public function safe_prediction_ticker(array $ticker, $market = null) {
        $parsed = parent::safe_ticker($ticker);
        return $this->to_prediction_structure($parsed, $ticker);
    }

    public function safe_prediction_position(array $position) {
        $parsed = parent::safe_position($position);
        return $this->to_prediction_structure($parsed, $position);
    }

    public function safe_prediction_order_book(array $orderbook, ?array $outcomeObj = null) {
        // normalize a parsed order book to the prediction shape => replace the unified
        // `symbol` with the `outcome` handle and attach the outcome identity fields
        // (outcomeId / market) so books match the PredictionOrderBook structure.
        $fallback = $this->safe_string_2($orderbook, 'outcome', 'symbol');
        $orderbook['outcome'] = ($outcomeObj === null) ? $fallback : $this->safe_string($outcomeObj, 'outcome', $fallback);
        $orderbook['outcomeId'] = ($outcomeObj === null) ? $this->safe_string($orderbook, 'outcomeId') : $this->safe_string($outcomeObj, 'outcomeId');
        $orderbook['market'] = ($outcomeObj === null) ? $this->safe_string($orderbook, 'market') : $this->safe_string($outcomeObj, 'market');
        // omit (not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return $this->omit($orderbook, 'symbol');
    }

    public function to_prediction_structure(array $parsed, array $raw) {
        // the prediction identity is the `outcome` handle (never the base `symbol`); attach it
        // and the other prediction fields ($raw exchange id, label, parent market/event) that the
        // base safe* helpers drop. the exchange parser passes them on the $raw input dict.
        $parsed['outcome'] = $this->safe_string($raw, 'outcome');
        $parsed['outcomeId'] = $this->safe_string($raw, 'outcomeId');
        $parsed['label'] = $this->safe_string($raw, 'label');
        $parsed['market'] = $this->safe_string($raw, 'market');
        $parsed['event'] = $this->safe_string($raw, 'event');
        // guard the delete => a bare `delete` is a no-op on a missing key in JS, but transpiles to
        // `del`/`unset` which raises in Python when the inherited `symbol` was never set
        if (is_array($parsed) && array_key_exists('symbol', $parsed)) {
            unset($parsed['symbol']);
        }
        return $parsed;
    }

    public function filter_by_outcome_since_limit($array, ?string $outcome = null, ?int $since = null, ?int $limit = null, $tail = false) {
        return $this->filter_by_value_since_limit($array, 'outcome', $outcome, $since, $limit, 'timestamp', $tail);
    }

    public function filter_by_outcomes_since_limit($array, ?array $outcomes = null, ?int $since = null, ?int $limit = null, $tail = false) {
        $result = $this->filter_by_array($array, 'outcome', $outcomes, false);
        return $this->filter_by_since_limit($result, $since, $limit, 'timestamp', $tail);
    }

    public function amount_to_prediction_precision(string $outcome, $amount) {
        $outcomeObj = $this->outcome($outcome);
        $marketSymbol = $this->safe_string($outcomeObj, 'market');
        return $this->amount_to_precision($marketSymbol, $amount);
    }

    public function price_to_prediction_precision(string $outcome, $price) {
        $outcomeObj = $this->outcome($outcome);
        $marketSymbol = $this->safe_string($outcomeObj, 'market');
        return $this->price_to_precision($marketSymbol, $price);
    }

    public function cost_to_prediction_precision(string $outcome, $cost) {
        $outcomeObj = $this->outcome($outcome);
        $marketSymbol = $this->safe_string($outcomeObj, 'market');
        return $this->cost_to_precision($marketSymbol, $cost);
    }
}
