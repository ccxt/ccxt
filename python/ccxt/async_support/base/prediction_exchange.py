# -*- coding: utf-8 -*-

# ----------------------------------------------------------------------------
# base class for prediction-market exchanges (Polymarket, Kalshi, Limitless, ...)
# the top of this file is hand-written; the methods below the delimiter are
# transpiled from ts/src/base/PredictionExchange.ts
# ----------------------------------------------------------------------------

import asyncio
from typing import Any, List
from ccxt.async_support.base.exchange import Exchange
from ccxt.base.types import Str, Strings, Int, Num, OrderType, OrderSide
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import BadSymbol
from ccxt.base.errors import NotSupported
from ccxt.base.errors import ArgumentsRequired


class PredictionExchange(Exchange):
    outcomes = None
    outcomes_by_id = None
    events = None
    events_by_slug = None
    reloadingEvents = None
    eventsLoading = None

    # METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

    def is_prediction(self) -> bool:
        return self.safe_bool(self.has, 'prediction', False)

    async def load_markets_and_events(self, reload=False, params={}):
        res = await asyncio.gather(*[self.load_markets(reload, params), self.loadEvents(reload, params)])
        return {
            'markets': res[0],
            'events': res[1],
        }

    async def check_events_and_markets(self, outcome: Str = None):
        if not self.events or self.is_empty(self.events):
            raise ArgumentsRequired('Events are required to be loaded, please fetch them first using fetchEvents')
        if outcome is not None:
            if not (outcome in self.outcomes) and not (outcome in self.outcomes_by_id):
                raise ArgumentsRequired('The specified outcome is not valid/available, please fetch events and outcomes first using fetchEvents')

    async def fetch_events(self, queries: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchEvents() is not supported yet')

    def set_events(self, events: List[Any]):
        self.events = {}
        self.events_by_slug = {}
        for i in range(0, len(events)):
            event = events[i]
            id = self.safe_string(event, 'id')
            slug = self.safe_string(event, 'slug')
            if id is not None:
                self.events[id] = event
            if slug is not None:
                self.events_by_slug[slug] = event
        return self.events

    async def load_events_helper(self, reload=False, params={}):
        if not reload and self.events:
            return self.events
        events = await self.fetchEvents(None, params)
        return self.setEvents(events)

    async def load_events(self, reload=False, params={}):
        return await self.loadEventsHelper(reload, params)

    def outcome(self, outcomeSymbol: str):
        if self.outcomes is None:
            raise ExchangeError(self.id + ' outcomes not loaded')
        if outcomeSymbol in self.outcomes:
            return self.outcomes[outcomeSymbol]
        if outcomeSymbol in self.outcomes_by_id:
            return self.outcomes_by_id[outcomeSymbol]
        raise BadSymbol(self.id + ' does not have outcome symbol ' + outcomeSymbol)

    def safe_outcome(self, outcomeIdOrSymbol: Str, outcomeObj: Any = None):
        if outcomeIdOrSymbol is not None:
            if (self.outcomes is not None) and (outcomeIdOrSymbol in self.outcomes):
                return self.outcomes[outcomeIdOrSymbol]
            if (self.outcomes_by_id is not None) and (outcomeIdOrSymbol in self.outcomes_by_id):
                return self.outcomes_by_id[outcomeIdOrSymbol]
        if outcomeObj is not None:
            return outcomeObj
        return {'id': outcomeIdOrSymbol, 'symbol': outcomeIdOrSymbol, 'marketSymbol': None, 'label': None, 'info': {}}

    def safe_outcome_symbol(self, outcomeIdOrSymbol: Str, outcomeObj: Any = None):
        outcomeObj = self.safeOutcome(outcomeIdOrSymbol, outcomeObj)
        return outcomeObj['symbol']

    def shorten_slug(self, slug: str):
        replacements = {
            'federal-reserve': 'fed',
            'interest-rates': 'rates',
            'interest-rate': 'rate',
            'basis-points': 'bps',
            'basis-point': 'bp',
            'executive-order': 'eo',
            'united-states': 'us',
            'united-kingdom': 'uk',
            'european-union': 'eu',
            'artificial-intelligence': 'ai',
            'republican-party': 'gop',
            'democratic-party': 'dems',
            'stock-market': 'market',
            'price-target': 'pt',
            'market-cap': 'mcap',
            'increase': 'hike',
            'decrease': 'cut',
            'higher': 'up',
            'lower': 'down',
            'greater': 'gt',
            'less': 'lt',
            'million': 'M',
            'billion': 'B',
            'trillion': 'T',
            'percent': 'pct',
        }
        stopWords = [
            'will', 'the', 'a', 'an', 'after', 'before', 'in', 'at', 'by',
            'of', 'there', 'be', 'to', 'or', 'and', 'for', 'on', 'its',
            'that', 'this', 'from', 'with', 'as', 'is', 'are', 'was', 'were', '?', 'how', 'many', 'who', 'what', 'when', 'where', 'which', 'much',
        ]
        lower = '' if (slug is None) else slug.lower()
        allowed = 'abcdefghijklmnopqrstuvwxyz0123456789'
        chars = self.string_to_chars_array(lower)
        s = ''
        lastDash = True  # start True to drop leading separators
        for i in range(0, len(chars)):
            ch = chars[i]
            if allowed.find(ch) >= 0:
                s = s + ch
                lastDash = False
            elif not lastDash:
                s = s + '-'
                lastDash = True
        replacementKeys = list(replacements.keys())
        for i in range(0, len(replacementKeys)):
            replacementKey = replacementKeys[i]
            replacementValue = self.safe_string(replacements, replacementKey)
            s = s.replace(replacementKey, replacementValue)
        rawParts = s.split('-')
        parts = []
        for i in range(0, len(rawParts)):
            w = rawParts[i]
            if len(w) > 0 and not self.in_array(w, stopWords):
                parts.append(w)
        joined = '_'.join(parts)
        return joined.upper()

    def slug_to_market_symbol(self, eventSlug: str, marketSlug: str):
        return self.shortenSlug(marketSlug)

    def slug_to_outcome_symbol(self, eventSlug: str, marketSlug: str, outcome: str):
        return self.shortenSlug(marketSlug) + ':' + outcome.upper()

    def slug_to_market_id(self, eventSlug: str, marketSlug: str, outcome: str):
        return self.slugToOutcomeSymbol(eventSlug, marketSlug, outcome)

    async def fetch_ticker(self, outcome: str, params={}):
        return await super(PredictionExchange, self).fetchTicker(outcome, params)

    async def fetch_order_book(self, outcome: str, limit: Int = None, params={}):
        return await super(PredictionExchange, self).fetchOrderBook(outcome, limit, params)

    async def fetch_ohlcv(self, outcome: str, timeframe: str = '1m', since: Int = None, limit: Int = None, params={}):
        return await super(PredictionExchange, self).fetchOHLCV(outcome, timeframe, since, limit, params)

    async def fetch_trades(self, outcome: str, since: Int = None, limit: Int = None, params={}):
        return await super(PredictionExchange, self).fetchTrades(outcome, since, limit, params)

    async def create_order(self, outcome: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, params={}):
        return await super(PredictionExchange, self).createOrder(outcome, type, side, amount, price, params)

    async def cancel_order(self, id: str, outcome: Str = None, params={}):
        return await super(PredictionExchange, self).cancelOrder(id, outcome, params)

    async def watch_ticker(self, outcome: str, params={}):
        return await super(PredictionExchange, self).watchTicker(outcome, params)

    async def watch_order_book(self, outcome: str, limit: Int = None, params={}):
        return await super(PredictionExchange, self).watchOrderBook(outcome, limit, params)

    async def watch_trades(self, outcome: str, since: Int = None, limit: Int = None, params={}):
        return await super(PredictionExchange, self).watchTrades(outcome, since, limit, params)
