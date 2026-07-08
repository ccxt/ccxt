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

class PredictionExchange extends \ccxt\async\BaseExchange {
    public $outcomes = null;
    public $outcomes_by_id = null;
    public $events = null;
    public $events_by_slug = null;
    public $reloadingEvents = null;
    public $eventsLoading = null;

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

    public function describe(): mixed {
        return $this->deep_extend(parent::describe(), array(
            'has' => array(
                'prediction' => true,
                'CORS' => null,
                'spot' => false,
                'margin' => false,
                'swap' => false,
                'future' => false,
                'option' => false,
                'approve' => false,
                'redeem' => false,
                'fetchEvent' => false,
                'fetchEvents' => false,
                'fetchOutcome' => false,
                'fetchSettlements' => false,
                'createOrder' => false,
                'createOrders' => false,
                'createLimitOrder' => false,
                'createMarketOrder' => false,
                'createMarketOrderWs' => false,
                'createMarketBuyOrderWithCost' => false,
                'cancelOrder' => false,
                'cancelOrders' => false,
                'cancelAllOrders' => false,
                'editOrder' => false,
                'fetchBalance' => false,
                'fetchOrder' => false,
                'fetchOrders' => false,
                'fetchOrdersByIds' => false,
                'fetchOrderTrades' => false,
                'fetchOpenOrders' => false,
                'fetchClosedOrders' => false,
                'fetchCanceledOrders' => false,
                'fetchMyTrades' => false,
                'fetchPosition' => false,
                'fetchPositions' => false,
                'fetchAccounts' => false,
                'fetchLedger' => false,
                'fetchDeposits' => false,
                'fetchWithdrawals' => false,
                'fetchMarkets' => false,
                'fetchCurrencies' => false,
                'fetchTicker' => false,
                'fetchTickers' => false,
                'fetchOrderBook' => false,
                'fetchL2OrderBook' => false,
                'fetchOHLCV' => false,
                'fetchTrades' => false,
                'fetchStatus' => false,
                'fetchTime' => false,
                'fetchOpenInterest' => false,
                'fetchTradingFee' => false,
                'watchTicker' => false,
                'watchTickers' => false,
                'watchOrderBook' => false,
                'watchTrades' => false,
                'watchOrders' => false,
                'watchMyTrades' => false,
                'watchOHLCV' => false,
                'watchPositions' => false,
            ),
        ));
    }

    public function is_prediction(): bool {
        return $this->safe_bool($this->has, 'prediction', false);
    }

    public function parse_search_queries($params = array()) {
        // accepts either `query` (a single search string) or `queries` (a list of strings)
        $singleQuery = $this->safe_string($params, 'query');
        if ($singleQuery !== null) {
            return array( $singleQuery );
        }
        return $this->safe_list($params, 'queries', array());
    }

    public function require_event_query($params = array()) {
        // fetchEvents must be scoped by at least one selector — an unfiltered call would page the
        // entire exchange. require one of $query / $queries / $tags / $eventId / $slug
        $query = $this->safe_string($params, 'query');
        $queries = $this->safe_list($params, 'queries', array());
        $tags = $this->safe_list($params, 'tags', array());
        $eventId = $this->safe_string($params, 'eventId');
        $slug = $this->safe_string($params, 'slug');
        $queriesLength = count($queries);
        $tagsLength = count($tags);
        if (($query === null) && ($queriesLength === 0) && ($tagsLength === 0) && ($eventId === null) && ($slug === null)) {
            throw new ArgumentsRequired($this->id . ' fetchEvents() requires at least one of $query, $queries, $tags, $eventId or $slug to scope the search');
        }
        return null;
    }

    public function apply_event_fetch_params(array $events, $params = array(), ?array $queries = null) {
        // applies the unified fetchEvents options client-side (eventId/slug/status/searchIn/sort/limit)
        // so exchanges whose API can't filter natively still support them consistently.
        // every fetched $event lands in the cache before filtering, so loadEvents()/event()
        // serve them later without another request
        $this->set_events($events);
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
        $result = $this->filter_events_by_tags($result, $this->safe_list($params, 'tags'));
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
            // clamp to the $result length => arraySlice(x, 0, $limit) with $limit > length panics in Go
            // via reflect Slice, and throws in C#, unlike JS/Python which return the whole array
            $resultLength = count($result);
            $sliceEnd = $limit;
            if ($sliceEnd > $resultLength) {
                $sliceEnd = $resultLength;
            }
            $result = $this->array_slice($result, 0, $sliceEnd);
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

    public function filter_events_by_tags(array $events, ?array $tags = null) {
        // keep $events carrying one of the requested $tags; tolerant to string $tags and to
        // object $tags (array( slug, title, ... )) since venues differ. no-op when no $tags requested
        $tagsLength = 0;
        if ($tags !== null) {
            $tagsLength = count($tags);
        }
        if ($tagsLength === 0) {
            return $events;
        }
        $wanted = array();
        for ($i = 0; $i < count($tags); $i++) {
            $wanted[] = strtolower($tags[$i]);
        }
        $result = array();
        for ($i = 0; $i < count($events); $i++) {
            $event = $events[$i];
            $eventTags = $this->safe_list($event, 'tags', array());
            $matched = false;
            for ($ti = 0; $ti < count($eventTags); $ti++) {
                $tag = $eventTags[$ti];
                $tagLabel = null;
                if (gettype($tag) === 'string') {
                    $tagLabel = $tag;
                } else {
                    $tagLabel = $this->safe_string_2($tag, 'slug', 'title');
                }
                if ($tagLabel !== null) {
                    $tagLower = strtolower($tagLabel);
                    for ($wi = 0; $wi < count($wanted); $wi++) {
                        if (mb_strpos($tagLower, $wanted[$wi]) !== false) {
                            $matched = true;
                            break;
                        }
                    }
                }
                if ($matched) {
                    break;
                }
            }
            if ($matched) {
                $result[] = $event;
            }
        }
        return $result;
    }

    public function fetch_events(array $params = array()) {
        throw new NotSupported($this->id . ' fetchEvents() is not supported yet');
    }

    public function fetch_event(string $id, $params = array()) {
        throw new NotSupported($this->id . ' fetchEvent() is not supported yet');
    }

    public function set_events(array $events) {
        // merge (not reset) so successive scoped fetchEvents calls accumulate into the cache.
        // index by the unified `$event` $handle too (that's the identifier every outcome's `$event`
        // field carries), so getEvent ($handle) resolves without each exchange hand-writing it
        if ($this->events === null) {
            $this->events = array();
        }
        if ($this->events_by_slug === null) {
            $this->events_by_slug = array();
        }
        for ($i = 0; $i < count($events); $i++) {
            $event = $events[$i];
            $id = $this->safe_string($event, 'id');
            $slug = $this->safe_string($event, 'slug');
            $handle = $this->safe_string($event, 'event');
            if ($id !== null) {
                $this->events[$id] = $event;
            }
            if ($handle !== null) {
                $this->events[$handle] = $event;
            }
            if ($slug !== null) {
                $this->events_by_slug[$slug] = $event;
            }
        }
        return $this->events;
    }

    public function events_list(): array {
        // the cached events list; empty on a cold instance ($this->events is keyed by both
        // id and handle, so de-duplicate by $identity before returning)
        if ($this->events === null) {
            return array();
        }
        $result = array();
        $seen = array();
        $keys = is_array($this->events) ? array_keys($this->events) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $event = $this->events[$keys[$i]];
            $identity = $this->safe_string_2($event, 'id', 'event', $keys[$i]);
            if (!(is_array($seen) && array_key_exists($identity, $seen))) {
                $seen[$identity] = true;
                $result[] = $event;
            }
        }
        return $result;
    }

    public function load_events_helper($reload = false, $params = array()) {
        return Async\async(function () use ($reload, $params) {
            // note => the cache-hit shortcut ignores $params, so $events fetched under one scope are
            // returned for a later differently-scoped call. $events are scoped (unlike global
            // markets), so prefer fetchEvents ($params) directly when you need a specific scope
            if (!$reload && $this->events) {
                return $this->events;
            }
            $events = Async\await($this->fetch_events($params));
            return $this->set_events($events);
        })();
    }

    public function load_events($reload = false, $params = array()) {
        return Async\async(function () use ($reload, $params) {
            // cached entry point mirroring loadMarkets. unlike loadMarkets there is no cross-call
            // promise coalescing => the promise-sharing idiom is not expressible in the transpiled
            // base, so two truly concurrent first calls may fetch twice (both land in the cache)
            return Async\await($this->load_events_helper($reload, $params));
        })();
    }

    public function get_event(string $eventIdOrSlug) {
        // cache-only event resolver (the event analogue of array($this, 'outcome')) - the cache fills
        // through fetchEvents; this never fetches
        if (($this->events !== null) && (is_array($this->events) && array_key_exists($eventIdOrSlug, $this->events))) {
            return $this->events[$eventIdOrSlug];
        }
        if (($this->events_by_slug !== null) && (is_array($this->events_by_slug) && array_key_exists($eventIdOrSlug, $this->events_by_slug))) {
            return $this->events_by_slug[$eventIdOrSlug];
        }
        throw new BadSymbol($this->id . ' has no cached event ' . $eventIdOrSlug . " - call fetchEvents (array( 'query' => ... )) first");
    }

    public function outcome(string $outcomeSymbol) {
        if (($this->outcomes === null) || $this->is_empty($this->outcomes)) {
            throw new ExchangeError($this->id . ' outcomes not loaded - call loadOutcomes () or an outcome-addressed method first');
        }
        if (is_array($this->outcomes) && array_key_exists($outcomeSymbol, $this->outcomes)) {
            return $this->outcomes[$outcomeSymbol];
        }
        if (($this->outcomes_by_id !== null) && (is_array($this->outcomes_by_id) && array_key_exists($outcomeSymbol, $this->outcomes_by_id))) {
            return $this->outcomes_by_id[$outcomeSymbol];
        }
        throw new BadSymbol($this->id . ' does not have outcome ' . $outcomeSymbol . ' - pass a known outcome handle or outcomeId, or call fetchEvents ()/loadOutcomes () first');
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
        return array( 'outcome' => $outcomeIdOrSymbol, 'outcomeId' => $outcomeIdOrSymbol, 'market' => null, 'label' => null, 'event' => null, 'info' => array());
    }

    public function safe_outcome_symbol(?string $outcomeIdOrSymbol, mixed $outcomeObj = null) {
        $outcomeObj = $this->safe_outcome($outcomeIdOrSymbol, $outcomeObj);
        return $outcomeObj['outcome'];
    }

    public function shorten_slug(?string $slug) {
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

    public function slug_to_market_symbol(?string $eventSlug, string $marketSlug) {
        // $eventSlug is nullable (Str) => markets without a parent event (e.g. myriad's 1:1 markets)
        // pass null — the body already collapses an absent event to just the market part.
        // a strict `string` param would make PHP/typed transpilers throw on null before the body runs.
        // qualify the market handle with its event so two events that share a market label
        // — e.g. kalshi's KXFEDDECISION-28JAN and -27OCT both list "Cut 25bps" — do NOT collapse
        // to the same handle — a collision silently overwrites markets in $this->markets and would
        // resolve an outcome to the wrong event (wrong-market trade). skip the prefix when the
        // event slug is absent or identical to the market slug (e.g. myriad's 1:1 markets), so
        // already-unique handles stay clean.
        $marketPart = $this->shorten_slug($marketSlug);
        $eventPart = $this->shorten_slug($eventSlug);
        if (($eventPart === null) || ($eventPart === '') || ($eventPart === $marketPart)) {
            return $marketPart;
        }
        return $eventPart . '_' . $marketPart;
    }

    public function slug_to_outcome_symbol(?string $eventSlug, string $marketSlug, string $outcome) {
        // build on slugToMarketSymbol so the $outcome handle stays consistent with the market symbol
        // — both event-qualified or both not — otherwise a qualified market . unqualified $outcome mismatch
        return $this->slug_to_market_symbol($eventSlug, $marketSlug) . ':' . strtoupper($outcome);
    }

    public function set_markets($markets, $currencies = null) {
        $result = parent::set_markets($markets, $currencies);
        $this->populate_outcomes();
        return $result;
    }

    public function index_market_outcomes($market) {
        // index one market's outcome tokens into $this->outcomes / $this->outcomes_by_id,
        // normalizing each to the canonical identity keys (outcome / outcomeId / $market) so
        // consumers and the safe* helpers stay uniform even when an exchange's parseMarket
        // still emits the legacy symbol / id / marketSymbol keys. used both by populateOutcomes
        // for a full rebuild and by on-demand single-$market fetches (kalshi fetchOutcome), so a
        // cache miss doesn't force a full O(markets x outcomes) rebuild per new outcome
        if ($this->outcomes === null) {
            $this->outcomes = array();
        }
        if ($this->outcomes_by_id === null) {
            $this->outcomes_by_id = array();
        }
        $outcomesList = $this->safe_list($market, 'outcomes', array());
        for ($j = 0; $j < count($outcomesList); $j++) {
            $oc = $outcomesList[$j];
            $ocSymbol = $this->safe_string_2($oc, 'outcome', 'symbol');
            $ocId = $this->safe_string_2($oc, 'outcomeId', 'id');
            // assign unconditionally — safeString2 keeps the canonical key when present
            // and falls back to the legacy one, so this never clobbers and avoids a
            // missing-key access that throws in Python/PHP, unlike TS null
            $oc['outcomeId'] = $ocId;
            $oc['market'] = $this->safe_string_2($oc, 'market', 'marketSymbol');
            if ($ocSymbol !== null) {
                // shortenSlug is lossy, so two different markets can produce the same handle.
                // on a real collision of same handle but different outcomeId, disambiguate the
                // second one deterministically instead of silently overwriting the first —
                // trading the wrong $market would otherwise be indistinguishable
                $existing = $this->safe_value($this->outcomes, $ocSymbol);
                if ($existing !== null) {
                    $existingId = $this->safe_string($existing, 'outcomeId');
                    if (($existingId !== null) && ($ocId !== null) && ($existingId !== $ocId)) {
                        $idLen = count($ocId);
                        $suffix = $ocId;
                        if ($idLen > 6) {
                            $suffix = mb_substr($ocId, $idLen - 6);
                        }
                        $ocSymbol = $ocSymbol . '_' . strtoupper($suffix);
                    }
                }
                $oc['outcome'] = $ocSymbol;
                $this->outcomes[$ocSymbol] = $oc;
            } else {
                $oc['outcome'] = $ocSymbol;
            }
            if ($ocId !== null) {
                $this->outcomes_by_id[$ocId] = $oc;
            }
        }
    }

    public function populate_outcomes() {
        // rebuild the whole outcome lookup cache from $this->markets(each market carries its
        // outcome tokens under the outcomes key) so cached market data works offline. no-op on
        // a cold instance where markets are not loaded yet (avoids a null-access crash on the
        // eventId/slug-only fetchEvents path)
        $this->outcomes = array();
        $this->outcomes_by_id = array();
        if ($this->markets === null) {
            return;
        }
        $marketKeys = is_array($this->markets) ? array_keys($this->markets) : array();
        for ($i = 0; $i < count($marketKeys); $i++) {
            $this->index_market_outcomes($this->markets[$marketKeys[$i]]);
        }
    }

    public function index_event_outcomes(mixed $event) {
        // register a single event's $markets into $this->markets and rebuild the outcome cache so the
        // handles fetchEvent() returns resolve immediately in outcome-addressed methods (fetchTicker,
        // createOrder, ...). without this, on a cold instance or a loadAllOutcomes:false venue
        // such, the returned handles are unusable — fetchTicker(ev.markets[0].outcomes[0].outcome)
        // '\\ccxt\\BadSymbol's because the outcome was never cached
        if ($this->markets === null) {
            $this->markets = $this->create_safe_dictionary();
        }
        $markets = $this->safe_list($event, 'markets', array());
        $marketsLength = count($markets);
        for ($i = 0; $i < $marketsLength; $i++) {
            $m = $markets[$i];
            $symbol = $this->safe_string($m, 'symbol');
            if ($symbol !== null) {
                $this->markets[$symbol] = $m;
            }
        }
        $this->populate_outcomes();
    }

    public function load_outcomes($reload = false, $params = array()) {
        return Async\async(function () use ($reload, $params) {
            // outcome-addressed methods (fetchTicker/createOrder/...) call this first, mirroring how
            // every regular ccxt method calls loadMarkets(). reload/params mirror loadMarkets => $reload
            // true refetches and rebuilds. idempotent otherwise => once outcomes are populated (here, or
            // already by an explicit fetchEvents/loadMarkets), later calls no-op and return the cache.
            // loadMarkets() does the actual fetch; populateOutcomes() then rebuilds the lookup caches
            // from the loaded markets (the setMarkets override that normally does this is not dispatched
            // by the base loadMarkets under the Go/C#/Java transpilers).
            if (!$reload && ($this->outcomes !== null) && !$this->is_empty($this->outcomes)) {
                return $this->outcomes;
            }
            Async\await($this->load_markets($reload, $params));
            $this->populate_outcomes();
            return $this->outcomes;
        })();
    }

    public function load_outcome(string $outcomeSymbol) {
        return Async\async(function () use ($outcomeSymbol) {
            // resolve a single outcome — the per-outcome analogue of loadMarkets()+market(). a cache hit
            // returns at once. on a miss, options.loadAllOutcomes (default true) bulk-loads the whole set
            // once so later lookups are 0-network hits; exchanges with too many markets to bulk-load
            // kalshi sets it false and overrides fetchOutcome to fetch just the requested one on demand.
            if ($this->outcomes !== null) {
                if (is_array($this->outcomes) && array_key_exists($outcomeSymbol, $this->outcomes)) {
                    return $this->outcomes[$outcomeSymbol];
                }
                if (($this->outcomes_by_id !== null) && (is_array($this->outcomes_by_id) && array_key_exists($outcomeSymbol, $this->outcomes_by_id))) {
                    return $this->outcomes_by_id[$outcomeSymbol];
                }
            }
            $wasWarm = ($this->outcomes !== null) && !$this->is_empty($this->outcomes);
            // if markets are already loaded (offline-injected, or loaded by loadMarkets/fetchEvents)
            // but the outcome cache is cold, index them for free before hitting the network — this
            // makes cold-cache resolution consistent across languages regardless of loadAllOutcomes
            if (!$wasWarm && ($this->markets !== null) && !$this->is_empty($this->markets)) {
                $this->populate_outcomes();
                if ($this->outcomes !== null) {
                    if (is_array($this->outcomes) && array_key_exists($outcomeSymbol, $this->outcomes)) {
                        return $this->outcomes[$outcomeSymbol];
                    }
                    if (($this->outcomes_by_id !== null) && (is_array($this->outcomes_by_id) && array_key_exists($outcomeSymbol, $this->outcomes_by_id))) {
                        return $this->outcomes_by_id[$outcomeSymbol];
                    }
                }
            }
            $loadAll = $this->safe_bool($this->options, 'loadAllOutcomes', true);
            if ($loadAll && !$wasWarm) {
                // a miss on a cold cache => bulk-load once so later lookups are 0-network hits.
                // a miss on an already-warm cache is authoritative — the outcome genuinely isn't
                // listed, so fall through to fetchOutcome (a real BadSymbol) rather than refetching
                // the whole listing (which would mask typos and clobber offline-injected markets)
                Async\await($this->load_outcomes());
                if ($this->outcomes !== null) {
                    if (is_array($this->outcomes) && array_key_exists($outcomeSymbol, $this->outcomes)) {
                        return $this->outcomes[$outcomeSymbol];
                    }
                    if (($this->outcomes_by_id !== null) && (is_array($this->outcomes_by_id) && array_key_exists($outcomeSymbol, $this->outcomes_by_id))) {
                        return $this->outcomes_by_id[$outcomeSymbol];
                    }
                }
            }
            return Async\await($this->fetch_outcome($outcomeSymbol));
        })();
    }

    public function fetch_outcome(string $outcomeSymbol) {
        return Async\async(function () use ($outcomeSymbol) {
            // fetch just one outcome on demand. the base has no generic single-outcome endpoint, so it
            // resolves from the already-loaded set (loadOutcomes() is a cached no-op once warmed, and
            // this throws BadSymbol if the outcome is absent); exchanges with a by-id market fetch (kalshi)
            // override this to fetch and cache only the requested outcome — the "always fetch one" path.
            Async\await($this->load_outcomes());
            return $this->outcome($outcomeSymbol);
        })();
    }

    public function fetch_ticker(string $outcome, $params = array()) {
        /**
         * fetches a price ticker for a single prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
         */
        throw new NotSupported($this->id . ' fetchTicker() is not supported yet');
    }

    public function fetch_order_book(string $outcome, ?int $limit = null, $params = array()) {
        /**
         * fetches the order book for a prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {int} [$limit] the maximum number of order book entries to return
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
         */
        throw new NotSupported($this->id . ' fetchOrderBook() is not supported yet');
    }

    public function fetch_ohlcv(string $outcome, string $timeframe = '1m', ?int $since = null, ?int $limit = null, $params = array()) {
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
        })();
    }

    public function fetch_trades(string $outcome, ?int $since = null, ?int $limit = null, $params = array()) {
        /**
         * get the list of most recent trades for a prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest trade to fetch
         * @param {int} [$limit] the maximum number of trades to fetch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
         */
        throw new NotSupported($this->id . ' fetchTrades() is not supported yet');
    }

    public function create_order(string $outcome, string $type, string $side, float $amount, ?float $price = null, $params = array()) {
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
        throw new NotSupported($this->id . ' createOrder() is not supported yet');
    }

    public function cancel_order(string $id, ?string $outcome = null, $params = array()) {
        /**
         * cancels an open order
         * @param {string} $id order $id
         * @param {string} [$outcome] unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [order structure](https://docs.ccxt.com/#/?$id=order-structure)
         */
        throw new NotSupported($this->id . ' cancelOrder() is not supported yet');
    }

    public function watch_ticker(string $outcome, $params = array()) {
        /**
         * watches a price ticker for a single prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
         */
        throw new NotSupported($this->id . ' watchTicker() is not supported yet');
    }

    public function watch_order_book(string $outcome, ?int $limit = null, $params = array()) {
        /**
         * watches the order book for a prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {int} [$limit] the maximum number of order book entries to return
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
         */
        throw new NotSupported($this->id . ' watchOrderBook() is not supported yet');
    }

    public function watch_trades(string $outcome, ?int $since = null, ?int $limit = null, $params = array()) {
        /**
         * watches the most recent trades for a prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest trade to fetch
         * @param {int} [$limit] the maximum number of trades to fetch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
         */
        throw new NotSupported($this->id . ' watchTrades() is not supported yet');
    }

    public function fetch_orders(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array()) {
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

    public function fetch_closed_orders(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array()) {
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

    public function fetch_order_trades(string $id, ?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array()) {
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

    public function fetch_my_trades(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array()) {
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

    public function fetch_position(string $outcome, $params = array()) {
        /**
         * fetch the open position held on a single prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
         */
        throw new NotSupported($this->id . ' fetchPosition() is not supported yet');
    }

    public function fetch_trading_fee(string $outcome, $params = array()) {
        /**
         * fetch the trading fee for a prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
         */
        throw new NotSupported($this->id . ' fetchTradingFee() is not supported yet');
    }

    public function fetch_open_interest(string $outcome, $params = array()) {
        /**
         * fetch the open interest of a prediction $outcome
         * @param {string} $outcome unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
         */
        throw new NotSupported($this->id . ' fetchOpenInterest() is not supported yet');
    }

    public function create_orders(array $orders, $params = array()) {
        /**
         * create a list of trade $orders
         * @param {array[]} $orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
         */
        throw new NotSupported($this->id . ' createOrders() is not supported yet');
    }

    public function cancel_orders(array $ids, ?string $outcome = null, $params = array()) {
        /**
         * cancel multiple orders
         * @param {string[]} $ids order $ids
         * @param {string} [$outcome] unified $outcome handle
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
         */
        throw new NotSupported($this->id . ' cancelOrders() is not supported yet');
    }

    public function create_market_buy_order_with_cost(string $outcome, float $cost, $params = array()) {
        return Async\async(function () use ($outcome, $cost, $params) {
            /**
             * create a market buy order on a prediction $outcome by providing the $cost
             * @param {string} $outcome unified $outcome handle
             * @param {float} $cost how much you want to spend, in $cost terms
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
             */
            // safeBool, not $this->options['...'] — a raw missing-key access throws KeyError in Python/PHP
            // when the option is undeclared (it is for every prediction exchange)
            if ($this->safe_bool($this->options, 'createMarketBuyOrderRequiresPrice', false) || $this->safe_bool($this->has, 'createMarketBuyOrderWithCost', false)) {
                return Async\await($this->create_order($outcome, 'market', 'buy', $cost, 1, $params));
            }
            throw new NotSupported($this->id . ' createMarketBuyOrderWithCost() is not supported yet');
        })();
    }

    public function create_market_sell_order_with_cost(string $outcome, float $cost, $params = array()) {
        return Async\async(function () use ($outcome, $cost, $params) {
            /**
             * create a market sell order on a prediction $outcome by providing the $cost
             * @param {string} $outcome unified $outcome handle
             * @param {float} $cost how much you want to receive, in $cost terms
             * @param {array} [$params] extra exchange-specific parameters
             * @return {array} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
             */
            if ($this->safe_bool($this->options, 'createMarketSellOrderRequiresPrice', false) || $this->safe_bool($this->has, 'createMarketSellOrderWithCost', false)) {
                return Async\await($this->create_order($outcome, 'market', 'sell', $cost, 1, $params));
            }
            throw new NotSupported($this->id . ' createMarketSellOrderWithCost() is not supported yet');
        })();
    }

    public function watch_tickers(?array $outcomes = null, $params = array()) {
        /**
         * watches price tickers for multiple prediction $outcomes
         * @param {string[]} [$outcomes] unified outcome handles to watch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
         */
        throw new NotSupported($this->id . ' watchTickers() is not supported yet');
    }

    public function watch_orders(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array()) {
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

    public function watch_my_trades(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array()) {
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

    public function watch_positions(?array $outcomes = null, ?int $since = null, ?int $limit = null, $params = array()) {
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

    public function fetch_settlements(?string $outcome = null, ?int $since = null, ?int $limit = null, $params = array()) {
        /**
         * fetches the user's settled (resolved) positions — the "close the loop" record after
         * markets resolve, with the collateral paid out and the realized pnl
         * @param {string} [$outcome] filter to a single unified $outcome handle
         * @param {int} [$since] timestamp in ms of the earliest settlement to fetch
         * @param {int} [$limit] the maximum number of settlements to fetch
         * @param {array} [$params] extra exchange-specific parameters
         * @return {array[]} a list of prediction settlement structures
         */
        throw new NotSupported($this->id . ' fetchSettlements() is not supported yet');
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
        // outcomeId and market - so books match the PredictionOrderBook structure.
        $fallback = $this->safe_string_2($orderbook, 'outcome', 'symbol');
        $orderbook['outcome'] = ($outcomeObj === null) ? $fallback : $this->safe_string($outcomeObj, 'outcome', $fallback);
        $orderbook['outcomeId'] = ($outcomeObj === null) ? $this->safe_string($orderbook, 'outcomeId') : $this->safe_string($outcomeObj, 'outcomeId');
        $orderbook['market'] = ($outcomeObj === null) ? $this->safe_string($orderbook, 'market') : $this->safe_string($outcomeObj, 'market');
        // omit (not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return $this->omit($orderbook, 'symbol');
    }

    public function parse_prediction_ticker(array $ticker, ?array $market = null) {
        throw new NotSupported($this->id . ' parsePredictionTicker() is not supported yet');
    }

    public function parse_prediction_order(array $order, ?array $market = null) {
        throw new NotSupported($this->id . ' parsePredictionOrder() is not supported yet');
    }

    public function parse_prediction_trade(array $trade, ?array $market = null) {
        throw new NotSupported($this->id . ' parsePredictionTrade() is not supported yet');
    }

    public function parse_prediction_position(array $position, ?array $market = null) {
        throw new NotSupported($this->id . ' parsePredictionPosition() is not supported yet');
    }

    public function parse_prediction_open_interest(array $interest, ?array $market = null) {
        throw new NotSupported($this->id . ' parsePredictionOpenInterest() is not supported yet');
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

    public function parse_prediction_trades(array $trades, mixed $outcomeObj = null, ?int $since = null, ?int $limit = null, $params = array()) {
        /**
         * @ignore
         * parses a list of raw $trades with the exchange's parsePredictionTrade, sorts them and filters by the outcome handle — the prediction analogue of the base parseTrades
         * @param {array[]} $trades the raw $trades
         * @param {array} [$outcomeObj] the resolved outcome object the $trades belong to
         * @param {int} [$since] timestamp in ms of the earliest $trade to return
         * @param {int} [$limit] the maximum number of $trades to return
         * @param {array} [$params] extra fields to merge into every $parsed $trade
         * @return {array[]} a list of prediction [$trade structures](https://docs.ccxt.com/#/?id=public-$trades)
         */
        // prediction-market analogue of the base parseTrades => the base aggregator post-filters
        // by the market's `symbol` key, but prediction structures carry an `outcome` handle
        // instead — and an outcome object rebuilt from cached markets may still hold a legacy
        // `symbol` key, which would silently drop every $parsed row
        $rows = $this->to_array($trades);
        $results = array();
        for ($i = 0; $i < count($rows); $i++) {
            $parsed = $this->parse_prediction_trade($rows[$i], $outcomeObj);
            $trade = $this->extend($parsed, $params);
            $results[] = $trade;
        }
        $results = $this->sort_by_2($results, 'timestamp', 'id');
        $outcomeHandle = $this->safe_string($outcomeObj, 'outcome');
        return $this->filter_by_outcome_since_limit($results, $outcomeHandle, $since, $limit);
    }

    public function parse_prediction_orders(array $orders, mixed $outcomeObj = null, ?int $since = null, ?int $limit = null, $params = array()) {
        /**
         * @ignore
         * parses a list of raw $orders with the exchange's parsePredictionOrder, sorts them and filters by the outcome handle — the prediction analogue of the base parseOrders
         * @param {array[]} $orders the raw $orders
         * @param {array} [$outcomeObj] the resolved outcome object the $orders belong to
         * @param {int} [$since] timestamp in ms of the earliest $order to return
         * @param {int} [$limit] the maximum number of $orders to return
         * @param {array} [$params] extra fields to merge into every $parsed $order
         * @return {array[]} a list of prediction [$order structures](https://docs.ccxt.com/#/?id=$order-structure)
         */
        // prediction-market analogue of the base parseOrders — see parsePredictionTrades
        $rows = $this->to_array($orders);
        $results = array();
        for ($i = 0; $i < count($rows); $i++) {
            $parsed = $this->parse_prediction_order($rows[$i], $outcomeObj);
            $order = $this->extend($parsed, $params);
            $results[] = $order;
        }
        $results = $this->sort_by($results, 'timestamp');
        $outcomeHandle = $this->safe_string($outcomeObj, 'outcome');
        return $this->filter_by_outcome_since_limit($results, $outcomeHandle, $since, $limit);
    }

    public function parse_prediction_positions(array $positions, $params = array()) {
        /**
         * @ignore
         * parses a list of raw $positions with the exchange's parsePredictionPosition — the prediction analogue of the base parsePositions
         * @param {array[]} $positions the raw $positions
         * @param {array} [$params] extra fields to merge into every $parsed $position
         * @return {array[]} a list of prediction [$position structures](https://docs.ccxt.com/#/?id=$position-structure)
         */
        // prediction-market analogue of the base parsePositions, which resolves its `symbols`
        // argument through marketSymbols() and would throw BadSymbol on outcome handles.
        // venue-specific outcome filtering stays in the exchange ($position identity differs
        // per venue => kalshi $positions are market-level, polymarket ones are per token)
        $rows = $this->to_array($positions);
        $results = array();
        for ($i = 0; $i < count($rows); $i++) {
            $parsed = $this->parse_prediction_position($rows[$i]);
            $position = $this->extend($parsed, $params);
            $results[] = $position;
        }
        return $results;
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

    public function pad_hex_to_even(string $hex) {
        // prepend a nibble so the $hex has an even number of characters (whole bytes)
        $hexLength = count($hex);
        if ((fmod($hexLength, 2)) !== 0) {
            return '0' . $hex;
        }
        return $hex;
    }

    public function pad_hex_address(string $address) {
        // left-pads a 20-byte $address to a 32-byte ABI word (24 leading zero bytes)
        $stripped = $this->remove0x_prefix($address);
        return '000000000000000000000000' . $stripped;
    }

    public function rlp_encode_bytes(string $hex) {
        // RLP-encodes a single byte string ($hex without 0x) per the Ethereum RLP spec
        $byteLength = $this->parse_to_int(strlen($hex) / 2);
        if ($byteLength === 0) {
            return '80';
        }
        if (($byteLength === 1) && ($hex < '80')) {
            return $hex;
        }
        if ($byteLength < 56) {
            return $this->int_to_base16(128 . $byteLength) . $hex;
        }
        $lengthHex = $this->int_to_base16($byteLength);
        $lengthHex = $this->pad_hex_to_even($lengthHex);
        $lengthOfLength = $this->parse_to_int(strlen($lengthHex) / 2);
        return $this->int_to_base16(183 . $lengthOfLength) . $lengthHex . $hex;
    }

    public function rlp_encode_list(array $items) {
        $concatenated = '';
        for ($i = 0; $i < count($items); $i++) {
            $concatenated = $concatenated . $items[$i];
        }
        $byteLength = $this->parse_to_int(strlen($concatenated) / 2);
        if ($byteLength < 56) {
            return $this->int_to_base16(192 . $byteLength) . $concatenated;
        }
        $lengthHex = $this->int_to_base16($byteLength);
        $lengthHex = $this->pad_hex_to_even($lengthHex);
        $lengthOfLength = $this->parse_to_int(strlen($lengthHex) / 2);
        return $this->int_to_base16(247 . $lengthOfLength) . $lengthHex . $concatenated;
    }

    public function int_to_rlp_hex(float $value) {
        // an integer minimal big-endian byte $hex; 0 is the empty byte string
        if ($value === 0) {
            return '';
        }
        $hex = $this->int_to_base16($value);
        $hex = $this->pad_hex_to_even($hex);
        return $hex;
    }

    public function hex_to_rlp_bytes(string $hexValue) {
        // a hex value (e.g. an RPC result) big-endian byte hex; leading zero bytes
        // are stripped and 0 becomes the empty byte string (RLP integer encoding)
        $h = $this->remove0x_prefix($hexValue);
        $start = 0;
        $total = count($h);
        while (($start < $total) && (mb_substr($h, $start, $start + 1 - $start) === '0')) {
            $start = $start + 1;
        }
        $h = mb_substr($h, $start);
        if ($h === '') {
            return '';
        }
        $h = $this->pad_hex_to_even($h);
        return $h;
    }

    public function sign_evm_transaction(array $tx, string $privateKey) {
        // per-exchange override — needs the noble crypto imports. the base declares it so
        // sendEvmTransaction below can call it; a call on the base itself is unsupported
        throw new NotSupported($this->id . ' signEvmTransaction() must be overridden by the exchange');
    }

    public function eth_rpc(string $rpcUrl, string $method, array $rpcParams) {
        return Async\async(function () use ($rpcUrl, $method, $rpcParams) {
            $payload = array( 'jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => $rpcParams );
            $headers = array( 'Content-Type' => 'application/json' );
            $response = Async\await($this->fetch($rpcUrl, 'POST', $headers, $this->json($payload)));
            $rpcError = $this->safe_value($response, 'error');
            if ($rpcError !== null) {
                throw new ExchangeError($this->id . ' rpc ' . $method . ' error => ' . $this->json($rpcError));
            }
            // the result is either a hex string (nonce/gasPrice/txhash) or an object (receipt) —
            // safeString would coerce a receipt object to "[object Object]"
            return $this->safe_value($response, 'result');
        })();
    }

    public function send_evm_transaction(string $rpcUrl, float $chainId, string $fromAddress, string $to, string $value, string $data, string $gasLimit) {
        return Async\async(function () use ($rpcUrl, $chainId, $fromAddress, $to, $value, $data, $gasLimit) {
            $nonce = Async\await($this->eth_rpc($rpcUrl, 'eth_getTransactionCount', array( $fromAddress, 'pending' )));
            $gasPrice = Async\await($this->eth_rpc($rpcUrl, 'eth_gasPrice', array()));
            $tx = array(
                'chainId' => $chainId,
                'nonce' => $nonce,
                'maxPriorityFeePerGas' => $gasPrice,
                'maxFeePerGas' => $gasPrice,
                'gasLimit' => $gasLimit,
                'to' => $to,
                'value' => $value,
                'data' => $data,
            );
            $signed = $this->sign_evm_transaction($tx, $this->privateKey);
            return Async\await($this->eth_rpc($rpcUrl, 'eth_sendRawTransaction', array( $signed )));
        })();
    }

    public function wait_for_transaction_receipt(string $rpcUrl, string $txHash, $timeout = 60000) {
        return Async\async(function () use ($rpcUrl, $txHash, $timeout) {
            $start = $this->milliseconds();
            while (($this->milliseconds() - $start) < $timeout) {
                $receipt = Async\await($this->eth_rpc($rpcUrl, 'eth_getTransactionReceipt', array( $txHash )));
                if ($receipt) {
                    return $receipt;
                }
                Async\await($this->sleep(2000));
            }
            throw new ExchangeError($this->id . ' transaction ' . $txHash . ' not mined within timeout');
        })();
    }
}
