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

    public function load_markets_and_events($reload = false, $params = array ()) {
        return Async\async(function () use ($reload, $params) {
            $res = Async\await(Promise\all(array( $this->load_markets($reload, $params), $this->load_events($reload, $params) )));
            return array(
                'markets' => $res[0],
                'events' => $res[1],
            );
        }) ();
    }

    public function check_events_and_markets(?string $outcome = null) {
        // outcomes are the real dependency for resolving a symbol; they are populated by
        // fetchEvents and also rebuilt from cached markets (loadMarkets), so accept either
        if (!$this->outcomes || $this->is_empty($this->outcomes)) {
            throw new ArgumentsRequired('Outcomes are required to be loaded, please fetch them first using fetchEvents (or loadMarkets)');
        }
        if ($outcome !== null) {
            if (!(is_array($this->outcomes) && array_key_exists($outcome, $this->outcomes)) && !(is_array($this->outcomes_by_id) && array_key_exists($outcome, $this->outcomes_by_id))) {
                throw new ArgumentsRequired('The specified $outcome is not valid/available, please fetch events and outcomes first using fetchEvents');
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

    public function fetch_events($params = array ()) {
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
        // rebuild the outcome lookup caches so cached $market data works offline
        $this->outcomes = array();
        $this->outcomes_by_id = array();
        $marketKeys = is_array($this->markets) ? array_keys($this->markets) : array();
        for ($i = 0; $i < count($marketKeys); $i++) {
            $market = $this->markets[$marketKeys[$i]];
            $outcomesList = $this->safe_list($market, 'outcomes', array());
            for ($j = 0; $j < count($outcomesList); $j++) {
                $oc = $outcomesList[$j];
                $ocSymbol = $this->safe_string($oc, 'outcome');
                if ($ocSymbol !== null) {
                    $this->outcomes[$ocSymbol] = $oc;
                }
                $ocId = $this->safe_string($oc, 'outcomeId');
                if ($ocId !== null) {
                    $this->outcomes_by_id[$ocId] = $oc;
                }
            }
        }
    }

    public function fetch_ticker(string $outcome, $params = array ()) {
        return Async\async(function () use ($outcome, $params) {
            return Async\await(parent::fetch_ticker($outcome, $params));
        }) ();
    }

    public function fetch_order_book(string $outcome, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $limit, $params) {
            return Async\await(parent::fetch_order_book($outcome, $limit, $params));
        }) ();
    }

    public function fetch_ohlcv(string $outcome, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $timeframe, $since, $limit, $params) {
            return Async\await(parent::fetch_ohlcv($outcome, $timeframe, $since, $limit, $params));
        }) ();
    }

    public function fetch_trades(string $outcome, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $since, $limit, $params) {
            return Async\await(parent::fetch_trades($outcome, $since, $limit, $params));
        }) ();
    }

    public function create_order(string $outcome, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($outcome, $type, $side, $amount, $price, $params) {
            return Async\await(parent::create_order($outcome, $type, $side, $amount, $price, $params));
        }) ();
    }

    public function cancel_order(string $id, ?string $outcome = null, $params = array ()) {
        return Async\async(function () use ($id, $outcome, $params) {
            return Async\await(parent::cancel_order($id, $outcome, $params));
        }) ();
    }

    public function watch_ticker(string $outcome, $params = array ()) {
        return Async\async(function () use ($outcome, $params) {
            return Async\await(parent::watch_ticker($outcome, $params));
        }) ();
    }

    public function watch_order_book(string $outcome, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $limit, $params) {
            return Async\await(parent::watch_order_book($outcome, $limit, $params));
        }) ();
    }

    public function watch_trades(string $outcome, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $since, $limit, $params) {
            return Async\await(parent::watch_trades($outcome, $since, $limit, $params));
        }) ();
    }

    public function safe_prediction_order(array $order, $market = null) {
        $parsed = parent::safe_order($order, $market);
        return $this->to_prediction_structure($parsed, $order);
    }

    public function safe_prediction_trade(array $trade, $market = null) {
        $parsed = parent::safe_trade($trade, $market);
        return $this->to_prediction_structure($parsed, $trade);
    }

    public function safe_prediction_ticker(array $ticker, $market = null) {
        $parsed = parent::safe_ticker($ticker, $market);
        return $this->to_prediction_structure($parsed, $ticker);
    }

    public function safe_prediction_position(array $position) {
        $parsed = parent::safe_position($position);
        return $this->to_prediction_structure($parsed, $position);
    }

    public function to_prediction_structure(array $parsed, array $raw) {
        // rename the unified `symbol` to the prediction `outcome` handle and attach the
        // prediction identity fields ($raw exchange id, label, parent market/event) that the
        // base safe* helpers drop. the exchange parser passes them on the $raw input dict.
        $outcomeSymbol = $this->safe_string_2($raw, 'outcome', 'symbol');
        $parsed['outcome'] = $outcomeSymbol;
        $parsed['outcomeId'] = $this->safe_string($raw, 'outcomeId');
        $parsed['label'] = $this->safe_string($raw, 'label');
        $parsed['market'] = $this->safe_string($raw, 'market');
        $parsed['event'] = $this->safe_string($raw, 'event');
        unset($parsed['symbol']);
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
