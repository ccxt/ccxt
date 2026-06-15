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
            $res = Async\await(Promise\all(array( $this->load_markets($reload, $params), $this->loadEvents ($reload, $params) )));
            return array(
                'markets' => $res[0],
                'events' => $res[1],
            );
        }) ();
    }

    public function check_events_and_markets(?string $outcome = null) {
        if (!$this->events || $this->is_empty($this->events)) {
            throw new ArgumentsRequired('Events are required to be loaded, please fetch them first using fetchEvents');
        }
        if ($outcome !== null) {
            if (!(is_array($this->outcomes) && array_key_exists($outcome, $this->outcomes)) && !(is_array($this->outcomes_by_id) && array_key_exists($outcome, $this->outcomes_by_id))) {
                throw new ArgumentsRequired('The specified $outcome is not valid/available, please fetch events and outcomes first using fetchEvents');
            }
        }
    }

    public function fetch_events(?array $queries = null, $params = array ()) {
        throw new NotSupported($this->id . ' fetchEvents() is not supported yet');
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
            $events = Async\await($this->fetchEvents (null, $params));
            return $this->setEvents ($events);
        }) ();
    }

    public function load_events($reload = false, $params = array ()) {
        return Async\async(function () use ($reload, $params) {
            return Async\await($this->loadEventsHelper ($reload, $params));
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
        return array( 'id' => $outcomeIdOrSymbol, 'symbol' => $outcomeIdOrSymbol, 'marketSymbol' => null, 'label' => null, 'info' => array());
    }

    public function safe_outcome_symbol(?string $outcomeIdOrSymbol, mixed $outcomeObj = null) {
        $outcomeObj = $this->safeOutcome ($outcomeIdOrSymbol, $outcomeObj);
        return $outcomeObj['symbol'];
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
        return $this->shortenSlug ($marketSlug);
    }

    public function slug_to_outcome_symbol(string $eventSlug, string $marketSlug, string $outcome) {
        return $this->shortenSlug ($marketSlug) . ':' . strtoupper($outcome);
    }

    public function slug_to_market_id(string $eventSlug, string $marketSlug, string $outcome) {
        return $this->slugToOutcomeSymbol ($eventSlug, $marketSlug, $outcome);
    }

    public function fetch_ticker(string $outcome, $params = array ()) {
        return Async\async(function () use ($outcome, $params) {
            return Async\await(parent::fetchTicker ($outcome, $params));
        }) ();
    }

    public function fetch_order_book(string $outcome, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $limit, $params) {
            return Async\await(parent::fetchOrderBook ($outcome, $limit, $params));
        }) ();
    }

    public function fetch_ohlcv(string $outcome, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $timeframe, $since, $limit, $params) {
            return Async\await(parent::fetchOHLCV ($outcome, $timeframe, $since, $limit, $params));
        }) ();
    }

    public function fetch_trades(string $outcome, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $since, $limit, $params) {
            return Async\await(parent::fetchTrades ($outcome, $since, $limit, $params));
        }) ();
    }

    public function create_order(string $outcome, string $type, string $side, float $amount, ?float $price = null, $params = array ()) {
        return Async\async(function () use ($outcome, $type, $side, $amount, $price, $params) {
            return Async\await(parent::createOrder ($outcome, $type, $side, $amount, $price, $params));
        }) ();
    }

    public function cancel_order(string $id, ?string $outcome = null, $params = array ()) {
        return Async\async(function () use ($id, $outcome, $params) {
            return Async\await(parent::cancelOrder ($id, $outcome, $params));
        }) ();
    }

    public function watch_ticker(string $outcome, $params = array ()) {
        return Async\async(function () use ($outcome, $params) {
            return Async\await(parent::watchTicker ($outcome, $params));
        }) ();
    }

    public function watch_order_book(string $outcome, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $limit, $params) {
            return Async\await(parent::watchOrderBook ($outcome, $limit, $params));
        }) ();
    }

    public function watch_trades(string $outcome, ?int $since = null, ?int $limit = null, $params = array ()) {
        return Async\async(function () use ($outcome, $since, $limit, $params) {
            return Async\await(parent::watchTrades ($outcome, $since, $limit, $params));
        }) ();
    }
}
