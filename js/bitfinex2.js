"use strict";

// ---------------------------------------------------------------------------

const bitfinex = require ('./bitfinex.js')
const { ExchangeError, NotSupported, InsufficientFunds } = require ('./base/errors')

// ---------------------------------------------------------------------------

module.exports = class bitfinex2 extends bitfinex {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex2',
            'name': 'Bitfinex v2',
            'countries': 'US',
            'version': 'v2',
            'hasCORS': true,
            // old metainfo interface
            'hasFetchOrder': true,
            'hasFetchTickers': true,
            'hasFetchOHLCV': true,
            'hasWithdraw': true,
            'hasDeposit': false,
            'hasFetchOpenOrders': false,
            'hasFetchClosedOrders': false,
            // new metainfo interface
            'has': {
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
                'AVT/BTC': { 'id': 'tAVTBTC', 'symbol': 'AVT/BTC', 'base': 'AVT', 'quote': 'BTC' },
                'AVT/ETH': { 'id': 'tAVTETH', 'symbol': 'AVT/ETH', 'base': 'AVT', 'quote': 'ETH' },
                'AVT/USD': { 'id': 'tAVTUSD', 'symbol': 'AVT/USD', 'base': 'AVT', 'quote': 'USD' },
                'CST_BCC/BTC': { 'id': 'tBCCBTC', 'symbol': 'CST_BCC/BTC', 'base': 'CST_BCC', 'quote': 'BTC' },
                'CST_BCC/USD': { 'id': 'tBCCUSD', 'symbol': 'CST_BCC/USD', 'base': 'CST_BCC', 'quote': 'USD' },
                'BCH/BTC': { 'id': 'tBCHBTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC' },
                'BCH/ETH': { 'id': 'tBCHETH', 'symbol': 'BCH/ETH', 'base': 'BCH', 'quote': 'ETH' },
                'BCH/USD': { 'id': 'tBCHUSD', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD' },
                'CST_BCU/BTC': { 'id': 'tBCUBTC', 'symbol': 'CST_BCU/BTC', 'base': 'CST_BCU', 'quote': 'BTC' },
                'CST_BCU/USD': { 'id': 'tBCUUSD', 'symbol': 'CST_BCU/USD', 'base': 'CST_BCU', 'quote': 'USD' },
                'BT1/BTC': { 'id': 'tBT1BTC', 'symbol': 'BT1/BTC', 'base': 'BT1', 'quote': 'BTC' },
                'BT1/USD': { 'id': 'tBT1USD', 'symbol': 'BT1/USD', 'base': 'BT1', 'quote': 'USD' },
                'BT2/BTC': { 'id': 'tBT2BTC', 'symbol': 'BT2/BTC', 'base': 'BT2', 'quote': 'BTC' },
                'BT2/USD': { 'id': 'tBT2USD', 'symbol': 'BT2/USD', 'base': 'BT2', 'quote': 'USD' },
                'BTC/USD': { 'id': 'tBTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTG/BTC': { 'id': 'tBTGBTC', 'symbol': 'BTG/BTC', 'base': 'BTG', 'quote': 'BTC' },
                'BTG/USD': { 'id': 'tBTGUSD', 'symbol': 'BTG/USD', 'base': 'BTG', 'quote': 'USD' },
                'DASH/BTC': { 'id': 'tDSHBTC', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
                'DASH/USD': { 'id': 'tDSHUSD', 'symbol': 'DASH/USD', 'base': 'DASH', 'quote': 'USD' },
                'DAT/BTC': { 'id': 'tDATBTC', 'symbol': 'DAT/BTC', 'base': 'DAT', 'quote': 'BTC' },
                'DAT/ETH': { 'id': 'tDATETH', 'symbol': 'DAT/ETH', 'base': 'DAT', 'quote': 'ETH' },
                'DAT/USD': { 'id': 'tDATUSD', 'symbol': 'DAT/USD', 'base': 'DAT', 'quote': 'USD' },
                'EDO/BTC': { 'id': 'tEDOBTC', 'symbol': 'EDO/BTC', 'base': 'EDO', 'quote': 'BTC' },
                'EDO/ETH': { 'id': 'tEDOETH', 'symbol': 'EDO/ETH', 'base': 'EDO', 'quote': 'ETH' },
                'EDO/USD': { 'id': 'tEDOUSD', 'symbol': 'EDO/USD', 'base': 'EDO', 'quote': 'USD' },
                'EOS/BTC': { 'id': 'tEOSBTC', 'symbol': 'EOS/BTC', 'base': 'EOS', 'quote': 'BTC' },
                'EOS/ETH': { 'id': 'tEOSETH', 'symbol': 'EOS/ETH', 'base': 'EOS', 'quote': 'ETH' },
                'EOS/USD': { 'id': 'tEOSUSD', 'symbol': 'EOS/USD', 'base': 'EOS', 'quote': 'USD' },
                'ETC/BTC': { 'id': 'tETCBTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC' },
                'ETC/USD': { 'id': 'tETCUSD', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD' },
                'ETH/BTC': { 'id': 'tETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
                'ETH/USD': { 'id': 'tETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
                'ETP/BTC': { 'id': 'tETPBTC', 'symbol': 'ETP/BTC', 'base': 'ETP', 'quote': 'BTC' },
                'ETP/ETH': { 'id': 'tETPETH', 'symbol': 'ETP/ETH', 'base': 'ETP', 'quote': 'ETH' },
                'ETP/USD': { 'id': 'tETPUSD', 'symbol': 'ETP/USD', 'base': 'ETP', 'quote': 'USD' },
                'IOT/BTC': { 'id': 'tIOTBTC', 'symbol': 'IOT/BTC', 'base': 'IOT', 'quote': 'BTC' },
                'IOT/ETH': { 'id': 'tIOTETH', 'symbol': 'IOT/ETH', 'base': 'IOT', 'quote': 'ETH' },
                'IOT/USD': { 'id': 'tIOTUSD', 'symbol': 'IOT/USD', 'base': 'IOT', 'quote': 'USD' },
                'LTC/BTC': { 'id': 'tLTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'LTC/USD': { 'id': 'tLTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
                'NEO/BTC': { 'id': 'tNEOBTC', 'symbol': 'NEO/BTC', 'base': 'NEO', 'quote': 'BTC' },
                'NEO/ETH': { 'id': 'tNEOETH', 'symbol': 'NEO/ETH', 'base': 'NEO', 'quote': 'ETH' },
                'NEO/USD': { 'id': 'tNEOUSD', 'symbol': 'NEO/USD', 'base': 'NEO', 'quote': 'USD' },
                'OMG/BTC': { 'id': 'tOMGBTC', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC' },
                'OMG/ETH': { 'id': 'tOMGETH', 'symbol': 'OMG/ETH', 'base': 'OMG', 'quote': 'ETH' },
                'OMG/USD': { 'id': 'tOMGUSD', 'symbol': 'OMG/USD', 'base': 'OMG', 'quote': 'USD' },
                'QTUM/BTC': { 'id': 'tQTMBTC', 'symbol': 'QTUM/BTC', 'base': 'QTUM', 'quote': 'BTC' },
                'QTUM/ETH': { 'id': 'tQTMETH', 'symbol': 'QTUM/ETH', 'base': 'QTUM', 'quote': 'ETH' },
                'QTUM/USD': { 'id': 'tQTMUSD', 'symbol': 'QTUM/USD', 'base': 'QTUM', 'quote': 'USD' },
                'RRT/BTC': { 'id': 'tRRTBTC', 'symbol': 'RRT/BTC', 'base': 'RRT', 'quote': 'BTC' },
                'RRT/USD': { 'id': 'tRRTUSD', 'symbol': 'RRT/USD', 'base': 'RRT', 'quote': 'USD' },
                'SAN/BTC': { 'id': 'tSANBTC', 'symbol': 'SAN/BTC', 'base': 'SAN', 'quote': 'BTC' },
                'SAN/ETH': { 'id': 'tSANETH', 'symbol': 'SAN/ETH', 'base': 'SAN', 'quote': 'ETH' },
                'SAN/USD': { 'id': 'tSANUSD', 'symbol': 'SAN/USD', 'base': 'SAN', 'quote': 'USD' },
                'XMR/BTC': { 'id': 'tXMRBTC', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC' },
                'XMR/USD': { 'id': 'tXMRUSD', 'symbol': 'XMR/USD', 'base': 'XMR', 'quote': 'USD' },
                'XRP/BTC': { 'id': 'tXRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
                'XRP/USD': { 'id': 'tXRPUSD', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD' },
                'ZEC/BTC': { 'id': 'tZECBTC', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC' },
                'ZEC/USD': { 'id': 'tZECUSD', 'symbol': 'ZEC/USD', 'base': 'ZEC', 'quote': 'USD' },
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
        // issue #4 Bitfinex names Dash as DSH, instead of DASH
        if (currency == 'DSH')
            return 'DASH';
        if (currency == 'QTM')
            return 'QTUM';
        return currency;
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
        let response = await this.publicGetTradesSymbolHist (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
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
