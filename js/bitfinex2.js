"use strict";

// ---------------------------------------------------------------------------

const bitfinex = require ('./bitfinex.js');
const { ExchangeError, NotSupported, InsufficientFunds } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bitfinex2 extends bitfinex {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex2',
            'name': 'Bitfinex v2',
            'countries': 'VG',
            'version': 'v2',
            // new metainfo interface
            'has': {
                'CORS': true,
                'createOrder': false,
                'fetchOHLCV': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOpenOrders': false,
                'fetchClosedOrders': false,
                'withdraw': true,
                'deposit': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://bitfinex.readme.io/v2/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
                'fees': 'https://www.bitfinex.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'platform/status',
                        'tickers',
                        'ticker/{symbol}',
                        'trades/{symbol}/hist',
                        'book/{symbol}/{precision}',
                        'book/{symbol}/P0',
                        'book/{symbol}/P1',
                        'book/{symbol}/P2',
                        'book/{symbol}/P3',
                        'book/{symbol}/R0',
                        'symbols_details',
                        'stats1/{key}:{size}:{symbol}/{side}/{section}',
                        'stats1/{key}:{size}:{symbol}/long/last',
                        'stats1/{key}:{size}:{symbol}/long/hist',
                        'stats1/{key}:{size}:{symbol}/short/last',
                        'stats1/{key}:{size}:{symbol}/short/hist',
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ],
                    'post': [
                        'calc/trade/avg',
                    ],
                },
                'private': {
                    'post': [
                        'auth/r/wallets',
                        'auth/r/orders/{symbol}',
                        'auth/r/orders/{symbol}/new',
                        'auth/r/orders/{symbol}/hist',
                        'auth/r/order/{symbol}:{id}/trades',
                        'auth/r/trades/{symbol}/hist',
                        'auth/r/positions',
                        'auth/r/funding/offers/{symbol}',
                        'auth/r/funding/offers/{symbol}/hist',
                        'auth/r/funding/loans/{symbol}',
                        'auth/r/funding/loans/{symbol}/hist',
                        'auth/r/funding/credits/{symbol}',
                        'auth/r/funding/credits/{symbol}/hist',
                        'auth/r/funding/trades/{symbol}/hist',
                        'auth/r/info/margin/{key}',
                        'auth/r/info/funding/{key}',
                        'auth/r/movements/{currency}/hist',
                        'auth/r/stats/perf:{timeframe}/hist',
                        'auth/r/alerts',
                        'auth/w/alert/set',
                        'auth/w/alert/{type}:{symbol}:{price}/del',
                        'auth/calc/order/avail',
                    ],
                },
            },
            'markets': {
                'AVT/BTC': { 'id': 'tAVTBTC', 'symbol': 'AVT/BTC', 'base': 'AVT', 'quote': 'BTC', 'baseId': 'tAVT', 'quoteId': 'tBTC' },
                'AVT/ETH': { 'id': 'tAVTETH', 'symbol': 'AVT/ETH', 'base': 'AVT', 'quote': 'ETH', 'baseId': 'tAVT', 'quoteId': 'tETH' },
                'AVT/USD': { 'id': 'tAVTUSD', 'symbol': 'AVT/USD', 'base': 'AVT', 'quote': 'USD', 'baseId': 'tAVT', 'quoteId': 'zUSD' },
                'CST_BCC/BTC': { 'id': 'tBCCBTC', 'symbol': 'CST_BCC/BTC', 'base': 'CST_BCC', 'quote': 'BTC', 'baseId': 'tBCC', 'quoteId': 'tBTC' },
                'CST_BCC/USD': { 'id': 'tBCCUSD', 'symbol': 'CST_BCC/USD', 'base': 'CST_BCC', 'quote': 'USD', 'baseId': 'tBCC', 'quoteId': 'zUSD' },
                'BCH/BTC': { 'id': 'tBCHBTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'baseId': 'tBCH', 'quoteId': 'tBTC' },
                'BCH/ETH': { 'id': 'tBCHETH', 'symbol': 'BCH/ETH', 'base': 'BCH', 'quote': 'ETH', 'baseId': 'tBCH', 'quoteId': 'tETH' },
                'BCH/USD': { 'id': 'tBCHUSD', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD', 'baseId': 'tBCH', 'quoteId': 'zUSD' },
                'CST_BCU/BTC': { 'id': 'tBCUBTC', 'symbol': 'CST_BCU/BTC', 'base': 'CST_BCU', 'quote': 'BTC', 'baseId': 'tBCU', 'quoteId': 'tBTC' },
                'CST_BCU/USD': { 'id': 'tBCUUSD', 'symbol': 'CST_BCU/USD', 'base': 'CST_BCU', 'quote': 'USD', 'baseId': 'tBCU', 'quoteId': 'zUSD' },
                'BT1/BTC': { 'id': 'tBT1BTC', 'symbol': 'BT1/BTC', 'base': 'BT1', 'quote': 'BTC', 'baseId': 'tBT1', 'quoteId': 'tBTC' },
                'BT1/USD': { 'id': 'tBT1USD', 'symbol': 'BT1/USD', 'base': 'BT1', 'quote': 'USD', 'baseId': 'tBT1', 'quoteId': 'zUSD' },
                'BT2/BTC': { 'id': 'tBT2BTC', 'symbol': 'BT2/BTC', 'base': 'BT2', 'quote': 'BTC', 'baseId': 'tBT2', 'quoteId': 'tBTC' },
                'BT2/USD': { 'id': 'tBT2USD', 'symbol': 'BT2/USD', 'base': 'BT2', 'quote': 'USD', 'baseId': 'tBT2', 'quoteId': 'zUSD' },
                'BTC/USD': { 'id': 'tBTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'tBTC', 'quoteId': 'zUSD' },
                'BTC/EUR': { 'id': 'tBTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'tBTC', 'quoteId': 'zEUR' },
                'BTG/BTC': { 'id': 'tBTGBTC', 'symbol': 'BTG/BTC', 'base': 'BTG', 'quote': 'BTC', 'baseId': 'tBTG', 'quoteId': 'tBTC' },
                'BTG/USD': { 'id': 'tBTGUSD', 'symbol': 'BTG/USD', 'base': 'BTG', 'quote': 'USD', 'baseId': 'tBTG', 'quoteId': 'zUSD' },
                'DASH/BTC': { 'id': 'tDSHBTC', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'tDASH', 'quoteId': 'tBTC' },
                'DASH/USD': { 'id': 'tDSHUSD', 'symbol': 'DASH/USD', 'base': 'DASH', 'quote': 'USD', 'baseId': 'tDASH', 'quoteId': 'zUSD' },
                'DAT/BTC': { 'id': 'tDATBTC', 'symbol': 'DAT/BTC', 'base': 'DAT', 'quote': 'BTC', 'baseId': 'tDAT', 'quoteId': 'tBTC' },
                'DAT/ETH': { 'id': 'tDATETH', 'symbol': 'DAT/ETH', 'base': 'DAT', 'quote': 'ETH', 'baseId': 'tDAT', 'quoteId': 'tETH' },
                'DAT/USD': { 'id': 'tDATUSD', 'symbol': 'DAT/USD', 'base': 'DAT', 'quote': 'USD', 'baseId': 'tDAT', 'quoteId': 'zUSD' },
                'EDO/BTC': { 'id': 'tEDOBTC', 'symbol': 'EDO/BTC', 'base': 'EDO', 'quote': 'BTC', 'baseId': 'tEDO', 'quoteId': 'tBTC' },
                'EDO/ETH': { 'id': 'tEDOETH', 'symbol': 'EDO/ETH', 'base': 'EDO', 'quote': 'ETH', 'baseId': 'tEDO', 'quoteId': 'tETH' },
                'EDO/USD': { 'id': 'tEDOUSD', 'symbol': 'EDO/USD', 'base': 'EDO', 'quote': 'USD', 'baseId': 'tEDO', 'quoteId': 'zUSD' },
                'EOS/BTC': { 'id': 'tEOSBTC', 'symbol': 'EOS/BTC', 'base': 'EOS', 'quote': 'BTC', 'baseId': 'tEOS', 'quoteId': 'tBTC' },
                'EOS/ETH': { 'id': 'tEOSETH', 'symbol': 'EOS/ETH', 'base': 'EOS', 'quote': 'ETH', 'baseId': 'tEOS', 'quoteId': 'tETH' },
                'EOS/USD': { 'id': 'tEOSUSD', 'symbol': 'EOS/USD', 'base': 'EOS', 'quote': 'USD', 'baseId': 'tEOS', 'quoteId': 'zUSD' },
                'ETC/BTC': { 'id': 'tETCBTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'baseId': 'tETC', 'quoteId': 'tBTC' },
                'ETC/USD': { 'id': 'tETCUSD', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD', 'baseId': 'tETC', 'quoteId': 'zUSD' },
                'ETH/BTC': { 'id': 'tETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'tETH', 'quoteId': 'tBTC' },
                'ETH/USD': { 'id': 'tETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'tETH', 'quoteId': 'zUSD' },
                'ETP/BTC': { 'id': 'tETPBTC', 'symbol': 'ETP/BTC', 'base': 'ETP', 'quote': 'BTC', 'baseId': 'tETP', 'quoteId': 'tBTC' },
                'ETP/ETH': { 'id': 'tETPETH', 'symbol': 'ETP/ETH', 'base': 'ETP', 'quote': 'ETH', 'baseId': 'tETP', 'quoteId': 'tETH' },
                'ETP/USD': { 'id': 'tETPUSD', 'symbol': 'ETP/USD', 'base': 'ETP', 'quote': 'USD', 'baseId': 'tETP', 'quoteId': 'zUSD' },
                'IOTA/BTC': { 'id': 'tIOTBTC', 'symbol': 'IOTA/BTC', 'base': 'IOTA', 'quote': 'BTC', 'baseId': 'tIOTA', 'quoteId': 'tBTC' },
                'IOTA/ETH': { 'id': 'tIOTETH', 'symbol': 'IOTA/ETH', 'base': 'IOTA', 'quote': 'ETH', 'baseId': 'tIOTA', 'quoteId': 'tETH' },
                'IOTA/USD': { 'id': 'tIOTUSD', 'symbol': 'IOTA/USD', 'base': 'IOTA', 'quote': 'USD', 'baseId': 'tIOTA', 'quoteId': 'zUSD' },
                'LTC/BTC': { 'id': 'tLTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'tLTC', 'quoteId': 'tBTC' },
                'LTC/USD': { 'id': 'tLTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'baseId': 'tLTC', 'quoteId': 'zUSD' },
                'NEO/BTC': { 'id': 'tNEOBTC', 'symbol': 'NEO/BTC', 'base': 'NEO', 'quote': 'BTC', 'baseId': 'tNEO', 'quoteId': 'tBTC' },
                'NEO/ETH': { 'id': 'tNEOETH', 'symbol': 'NEO/ETH', 'base': 'NEO', 'quote': 'ETH', 'baseId': 'tNEO', 'quoteId': 'tETH' },
                'NEO/USD': { 'id': 'tNEOUSD', 'symbol': 'NEO/USD', 'base': 'NEO', 'quote': 'USD', 'baseId': 'tNEO', 'quoteId': 'zUSD' },
                'OMG/BTC': { 'id': 'tOMGBTC', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC', 'baseId': 'tOMG', 'quoteId': 'tBTC' },
                'OMG/ETH': { 'id': 'tOMGETH', 'symbol': 'OMG/ETH', 'base': 'OMG', 'quote': 'ETH', 'baseId': 'tOMG', 'quoteId': 'tETH' },
                'OMG/USD': { 'id': 'tOMGUSD', 'symbol': 'OMG/USD', 'base': 'OMG', 'quote': 'USD', 'baseId': 'tOMG', 'quoteId': 'zUSD' },
                'QTUM/BTC': { 'id': 'tQTMBTC', 'symbol': 'QTUM/BTC', 'base': 'QTUM', 'quote': 'BTC', 'baseId': 'tQTUM', 'quoteId': 'tBTC' },
                'QTUM/ETH': { 'id': 'tQTMETH', 'symbol': 'QTUM/ETH', 'base': 'QTUM', 'quote': 'ETH', 'baseId': 'tQTUM', 'quoteId': 'tETH' },
                'QTUM/USD': { 'id': 'tQTMUSD', 'symbol': 'QTUM/USD', 'base': 'QTUM', 'quote': 'USD', 'baseId': 'tQTUM', 'quoteId': 'zUSD' },
                'RRT/BTC': { 'id': 'tRRTBTC', 'symbol': 'RRT/BTC', 'base': 'RRT', 'quote': 'BTC', 'baseId': 'tRRT', 'quoteId': 'tBTC' },
                'RRT/USD': { 'id': 'tRRTUSD', 'symbol': 'RRT/USD', 'base': 'RRT', 'quote': 'USD', 'baseId': 'tRRT', 'quoteId': 'zUSD' },
                'SAN/BTC': { 'id': 'tSANBTC', 'symbol': 'SAN/BTC', 'base': 'SAN', 'quote': 'BTC', 'baseId': 'tSAN', 'quoteId': 'tBTC' },
                'SAN/ETH': { 'id': 'tSANETH', 'symbol': 'SAN/ETH', 'base': 'SAN', 'quote': 'ETH', 'baseId': 'tSAN', 'quoteId': 'tETH' },
                'SAN/USD': { 'id': 'tSANUSD', 'symbol': 'SAN/USD', 'base': 'SAN', 'quote': 'USD', 'baseId': 'tSAN', 'quoteId': 'zUSD' },
                'XMR/BTC': { 'id': 'tXMRBTC', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC', 'baseId': 'tXMR', 'quoteId': 'tBTC' },
                'XMR/USD': { 'id': 'tXMRUSD', 'symbol': 'XMR/USD', 'base': 'XMR', 'quote': 'USD', 'baseId': 'tXMR', 'quoteId': 'zUSD' },
                'XRP/BTC': { 'id': 'tXRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'tXRP', 'quoteId': 'tBTC' },
                'XRP/USD': { 'id': 'tXRPUSD', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD', 'baseId': 'tXRP', 'quoteId': 'zUSD' },
                'ZEC/BTC': { 'id': 'tZECBTC', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC', 'baseId': 'tZEC', 'quoteId': 'tBTC' },
                'ZEC/USD': { 'id': 'tZECUSD', 'symbol': 'ZEC/USD', 'base': 'ZEC', 'quote': 'USD', 'baseId': 'tZEC', 'quoteId': 'zUSD' },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0005,
                        'BCH': 0.0005,
                        'ETH': 0.01,
                        'EOS': 0.1,
                        'LTC': 0.001,
                        'OMG': 0.1,
                        'IOT': 0.0,
                        'NEO': 0.0,
                        'ETC': 0.01,
                        'XRP': 0.02,
                        'ETP': 0.01,
                        'ZEC': 0.001,
                        'BTG': 0.0,
                        'DASH': 0.01,
                        'XMR': 0.04,
                        'QTM': 0.01,
                        'EDO': 0.5,
                        'DAT': 1.0,
                        'AVT': 0.5,
                        'SAN': 0.1,
                        'USDT': 5.0,
                    },
                },
            },
        });
    }

    commonCurrencyCode (currency) {
        const currencies = {
            'DSH': 'DASH', // Bitfinex names Dash as DSH, instead of DASH
            'QTM': 'QTUM',
            'BCC': 'CST_BCC',
            'BCU': 'CST_BCU',
            'IOT': 'IOTA',
            'DAT': 'DATA',
        };
        return (currency in currencies) ? currencies[currency] : currency;
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostAuthRWallets ();
        let balanceType = this.safeString (params, 'type', 'exchange');
        let result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            let balance = response[b];
            let [ accountType, currency, total, interest, available ] = balance;
            if (accountType == balanceType) {
                if (currency[0] == 't')
                    currency = currency.slice (1);
                let uppercase = currency.toUpperCase ();
                uppercase = this.commonCurrencyCode (uppercase);
                let account = this.account ();
                account['free'] = available;
                account['total'] = total;
                if (account['free'])
                    account['used'] = account['total'] - account['free'];
                result[uppercase] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let orderbook = await this.publicGetBookSymbolPrecision (this.extend ({
            'symbol': this.marketId (symbol),
            'precision': 'R0',
        }, params));
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < orderbook.length; i++) {
            let order = orderbook[i];
            let price = order[1];
            let amount = order[2];
            let side = (amount > 0) ? 'bids' : 'asks';
            amount = Math.abs (amount);
            result[side].push ([ price, amount ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let length = ticker.length;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker[length - 2],
            'low': ticker[length - 1],
            'bid': ticker[length - 10],
            'ask': ticker[length - 8],
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': ticker[length - 4],
            'change': ticker[length - 6],
            'percentage': ticker[length - 5],
            'average': undefined,
            'baseVolume': ticker[length - 3],
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let tickers = await this.publicGetTickers (this.extend ({
            'symbols': this.ids.join (','),
        }, params));
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker[0];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.markets[symbol];
        let ticker = await this.publicGetTickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let [ id, timestamp, amount, price ] = trade;
        let side = (amount < 0) ? 'sell' : 'buy';
        if (amount < 0) {
            amount = -amount;
        }
        return {
            'id': id.toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since) {
            request['start'] = since;
        }
        if (limit) {
            request['limit'] = limit;
        }
        let response = await this.publicGetTradesSymbolHist (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
            'sort': 1,
        };
        if (limit)
            request['limit'] = limit;
        if (since)
            request['start'] = since;
        request = this.extend (request, params);
        let response = await this.publicGetCandlesTradeTimeframeSymbolHist (request);
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new NotSupported (this.id + ' createOrder not implemented yet');
    }

    cancelOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' cancelOrder not implemented yet');
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder not implemented yet');
    }

    async withdraw (currency, amount, address, params = {}) {
        throw new NotSupported (this.id + ' withdraw not implemented yet');
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + request;
        if (api == 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.json (query);
            let auth = '/api' + '/' + request + nonce + body;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha384');
            headers = {
                'bfx-nonce': nonce,
                'bfx-apikey': this.apiKey,
                'bfx-signature': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (response) {
            if ('message' in response) {
                if (response['message'].indexOf ('not enough exchange balance') >= 0)
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
            return response;
        } else if (response == '') {
            throw new ExchangeError (this.id + ' returned empty response');
        }
        return response;
    }
}
