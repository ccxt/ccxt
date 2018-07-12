'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InsufficientFunds, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class rightbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'rightbtc',
            'name': 'RightBTC',
            'countries': [ 'AE' ],
            'has': {
                'privateAPI': false,
                'fetchTickers': true,
                'fetchOHLCV': true,
            },
            'timeframes': {
                '1m': 'min1',
                '5m': 'min5',
                '15m': 'min15',
                '30m': 'min30',
                '1h': 'hr1',
                '1d': 'day1',
                '1w': 'week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42633917-7d20757e-85ea-11e8-9f53-fffe9fbb7695.jpg',
                'api': 'https://www.rightbtc.com/api',
                'www': 'https://www.rightbtc.com',
                'doc': [
                    'https://www.rightbtc.com/api/trader',
                    'https://www.rightbtc.com/api/public',
                ],
                'fees': 'https://www.rightbtc.com/\#\!/support/fee', // eslint-disable-line no-useless-escape
            },
            'api': {
                'public': {
                    'get': [
                        'getAssetsTradingPairs/zh',
                        'trading_pairs',
                        'ticker/{trading_pair}',
                        'tickers',
                        'depth/{trading_pair}',
                        'depth/{trading_pair}/{count}',
                        'trades/{trading_pair}',
                        'trades/{trading_pair}/{count}',
                        'candlestick/latest/{trading_pair}',
                        'candlestick/{timeSymbol}/{trading_pair}',
                        'candlestick/{timeSymbol}/{trading_pair}/{count}',
                    ],
                },
                'trader': {
                    'get': [
                        'balance/{symbol}',
                        'balances',
                        'deposits/{asset}/{page}',
                        'withdrawals/{asset}/{page}',
                        'orderpage/{trading_pair/{cursor}',
                        'orders/{trading_pair}/{ids}', // ids are a slash-separated list of {id}/{id}/{id}/...
                        'history/{trading_pair}/{ids}',
                        'historys/{trading_pair}/{page}',
                        'trading_pairs',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order/{trading_pair}/{ids}',
                    ],
                },
            },
            // HARDCODING IS DEPRECATED, THE FEES BELOW SHOULD BE REWRITTEN
            'fees': {
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                    // min trading fees
                    // 0.0001 BTC
                    // 0.01 ETP
                    // 0.001 ETH
                    // 0.1 BITCNY
                },
                'funding': {
                    'withdraw': {
                        'ETP': 0.01,
                        // 'BTM': n => 3 + n * (1 / 100),
                        'BTC': 0.001,
                        // 'ZDC': n => 1 + n * (0.5 / 100),
                        // 'ZGC': n => 0.5 + n * (0.5 / 100),
                        'ETH': 0.01,
                        // 'BTS': n => 1 + n * (1 / 100),
                        // 'DLT': n => 3 + n * (1 / 100),
                        'ETC': 0.01,
                        'STORJ': 3,
                        // 'SNT': n => 10 + n * (1 / 100),
                        'LTC': 0.001,
                        'ZEC': 0.001,
                        'BCC': 0.001,
                        // 'XNC': n => 1 + n * (1 / 100),
                        // 'ICO': n => 3 + n * (1 / 100),
                        // 'CMC': n => 1 + n * (0.5 / 100),
                        // 'GXS': n => 0.2 + n * (1 / 100),
                        // 'OBITS': n => 0.3 + n * (1 / 100),
                        // 'ICS': n => 2 + n * (1 / 100),
                        // 'TIC': n => 2 + n * (1 / 100),
                        // 'IND': n => 20 + n * (1 / 100),
                        // 'MVC': n => 20 + n * (1 / 100),
                        'XRB': 0,
                        'NXS': 0.1,
                        // 'BitCNY': n => 0.1 + n * (1 / 100),
                        // 'MTX': n => 1 + n * (1 / 100),
                    },
                },
            },
            'exceptions': {
                'ERR_USERTOKEN_NOT_FOUND': AuthenticationError,
                'ERR_ASSET_NOT_EXISTS': ExchangeError,
                'ERR_ASSET_NOT_AVAILABLE': ExchangeError,
                'ERR_BALANCE_NOT_ENOUGH': InsufficientFunds,
                'ERR_CREATE_ORDER': InvalidOrder,
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetTradingPairs ();
        let zh = await this.publicGetGetAssetsTradingPairsZh ();
        let markets = this.extend (zh['result'], response['status']['message']);
        let marketIds = Object.keys (markets);
        let result = [];
        for (let i = 0; i < marketIds.length; i++) {
            let id = marketIds[i];
            let market = markets[id];
            let baseId = market['bid_asset_symbol'];
            let quoteId = market['ask_asset_symbol'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': parseInt (market['bid_asset_decimals']),
                'price': parseInt (market['ask_asset_decimals']),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = ticker['date'];
        let last = this.safeFloat (ticker, 'last') / 1e8;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high') / 1e8,
            'low': this.safeFloat (ticker, 'low') / 1e8,
            'bid': this.safeFloat (ticker, 'buy') / 1e8,
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell') / 1e8,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol24h') / 1e8,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTickerTradingPair (this.extend ({
            'trading_pair': market['id'],
        }, params));
        return this.parseTicker (response['result'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetTickers (params);
        let tickers = response['result'];
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker['market'];
            if (!(id in this.marketsById)) {
                continue;
            }
            let market = this.marketsById[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetDepthTradingPair (this.extend ({
            'trading_pair': this.marketId (symbol),
        }, params));
        let bidsasks = {};
        let types = ['bid', 'ask'];
        for (let ti = 0; ti < types.length; ti++) {
            let type = types[ti];
            bidsasks[type] = [];
            for (let i = 0; i < response['result'][type].length; i++) {
                let [ price, amount, total ] = response['result'][type][i];
                bidsasks[type].push ([
                    price / 1e8,
                    amount / 1e8,
                    total / 1e8,
                ]);
            }
        }
        return this.parseOrderBook (bidsasks, undefined, 'bid', 'ask');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = parseInt (trade['date']);
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let symbol = market['symbol'];
        let cost = this.costToPrecision (symbol, price * amount);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, 'tid'),
            'order': undefined,
            'type': 'limit',
            'side': trade['side'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': parseFloat (cost),
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesTradingPair (this.extend ({
            'trading_pair': market['id'],
        }, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            ohlcv[2] / 1e8,
            ohlcv[3] / 1e8,
            ohlcv[4] / 1e8,
            ohlcv[5] / 1e8,
            ohlcv[1] / 1e8,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetCandlestickTimeSymbolTradingPair (this.extend ({
            'trading_pair': market['id'],
            'timeSymbol': this.timeframes[timeframe],
        }, params));
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.traderGetBalances (params);
        //
        //     {
        //         "status": {
        //             "success": 1,
        //             "message": "GET_BALANCES"
        //         },
        //         "result": [
        //             {
        //                 "asset": "ETP",
        //                 "balance": "5000000000000",
        //                 "frozen": "0",
        //                 "state": "1"
        //             },
        //             {
        //                 "asset": "CNY",
        //                 "balance": "10000000000000",
        //                 "frozen": "240790000",
        //                 "state": "1"
        //             }
        //         ]
        //     }
        //
        let result = { 'info': response };
        let balances = response['result'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = balance['asset'];
            let code = this.commonCurrencyCode (currencyId);
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            }
            let total = this.safeFloat (balance, 'balance');
            let used = this.safeFloat (balance, 'frozen');
            let free = undefined;
            if (typeof total !== 'undefined') {
                total = total / 1e8;
                if (typeof used !== 'undefined') {
                    used = used / 1e8;
                    free = total - used;
                }
            }
            let account = {
                'free': free,
                'used': used,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'trading_pair': market['id'],
            'quantity': parseInt (amount * 1e8),
            'limit': parseInt (price * 1e8),
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        let response = await this.traderPostOrder (this.extend (order, params));
        return this.parseOrder (response);
    }



// quantity	Number
// buy/sell quantity, max decimal digits list at /trading_pairs, should multiply by 1E8

// limit	Number
// buy/sell at price, max decimal digits list at /trading_pairs, should multiply by 1E8

// type	String
// "LIMIT"

// side	String
// "BUY" or "SELL"

// Success 200
// Field	Type	Description
// order_id	Number
// order id.

// message	String
// error type: ERR_ASSET_NOT_EXISTS|ERR_ASSET_NOT_AVAILABLE|ERR_BALANCE_NOT_ENOUGH|ERR_CREATE_ORDER

// frozen	Number
// frozen amount, should divide by 1E8.


    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + api + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            headers = {
                'apikey': this.apiKey,
                'signature': this.secret,
            };
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('success' in response) {
                //
                //     {"status":{"success":0,"message":"ERR_USERTOKEN_NOT_FOUND"}}
                //
                let success = this.safeString (response, 'success');
                if (success !== '1') {
                    const message = this.safeString (response, 'message');
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (message in exceptions) {
                        throw new exceptions[message] (feedback);
                    }
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
