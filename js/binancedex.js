'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class binancedex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binancedex',
            'name': 'Binance DEX',
            'countries': [ 'GB', 'EU' ],
            'rateLimit': 200,
            'version': 'v1',
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': false,
                'publicAPI': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': 'https://dex.binance.org/',
                'www': 'https://binance.org/',
                'doc': 'https://docs.binance.org/api-reference/',
                'fees': 'https://docs.binance.org/trading-spec.html',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                },
                'funding': {
                },
            },
            'exceptions': {
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'ticker/24hr',
                        'depth',
                        'klines',
                    ],
                },
            },
            'commonCurrencies': {
            },
            'precisionMode': TICK_SIZE,
            'options': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetMarkets (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseSymbol = this.safeString (market, 'base_asset_symbol');
            const quoteSymbol = this.safeString (market, 'quote_asset_symbol');
            const lotSize = this.safeFloat (market, 'lot_size');
            const tickSize = this.safeFloat (market, 'tick_size');
            const originalBaseSymbol = baseSymbol.split ('-')[0];
            const originalQuoteSymbol = quoteSymbol.split ('-')[0];
            const symbol = originalBaseSymbol + '/' + originalQuoteSymbol;
            const id = baseSymbol + '_' + quoteSymbol;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': originalBaseSymbol,
                'quote': originalQuoteSymbol,
                'baseId': baseSymbol,
                'quoteId': quoteSymbol,
                'info': market,
                'precision': {
                    'amount': lotSize,
                    'price': tickSize,
                },
                'limits': {
                    'amount': {
                        'min': lotSize,
                        'max': undefined,
                    },
                    'price': {
                        'min': tickSize,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const lastPrice = this.safeFloat (ticker, 'lastPrice');
        const weightedAvgPrice = this.safeFloat (ticker, 'weightedAvgPrice');
        const timestamp = this.safeInteger (ticker, 'closeTime');
        return {
            'symbol': this.markets_by_id[this.safeString (ticker, 'symbol')]['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highPrice'),
            'low': this.safeFloat (ticker, 'lowPrice'),
            'bid': this.safeFloat (ticker, 'bidPrice'),
            'bidVolume': this.safeFloat (ticker, 'bidQuantity'),
            'ask': this.safeFloat (ticker, 'askPrice'),
            'askVolume': this.safeFloat (ticker, 'askQuantity'),
            'vwap': weightedAvgPrice,
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': lastPrice,
            'last': lastPrice,
            'previousClose': this.safeFloat (ticker, 'prevClosePrice'),
            'change': this.safeFloat (ticker, 'priceChange'),
            'percentage': this.safeFloat (ticker, 'priceChangePercent'),
            'average': weightedAvgPrice,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const tickers = await this.publicGetTicker24hr (this.extend (request, params));
        return this.parseTicker (tickers[0], undefined);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTicker24hr (params);
        return this.parseTickers (tickers, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeFloat (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 7),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': timeframe,
        };
        // default = 300, max = 1000
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const orderbook = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 0, 1);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new NotSupported (this.id + ' createOrder not implemented yet');
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' createOrder not implemented yet');
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' createOrder not implemented yet');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + 'api/v1/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
