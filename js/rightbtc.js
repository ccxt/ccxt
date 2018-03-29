'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class rightbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'rightbtc',
            'name': 'RightBTC',
            'countries': 'AE',
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
                'logo': 'https://www.rightbtc.com/assets/images/hftlogo@2x.png',
                'api': 'https://www.rightbtc.com/api',
                'www': 'https://www.rightbtc.com',
                'doc': 'https://www.rightbtc.com/api/public/',
                'fees': 'https://www.rightbtc.com/#!/support/fee',
            },
            'api': {
                'public': {
                    'get': [
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
            },
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
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetTradingPairs ();
        let markets = response['status']['message'];
        let marketIds = Object.keys (response['status']['message']);
        let result = [];
        for (let i = 0; i < marketIds.length; i++) {
            let id = marketIds[i];
            let market = markets[id];
            let base = this.commonCurrencyCode (market['bid_asset_symbol']);
            let quote = this.commonCurrencyCode (market['ask_asset_symbol']);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': parseInt (market['bid_asset_decimals']),
                'price': parseInt (market['ask_asset_decimals']),
            };
            let lot = Math.pow (10, -precision['amount']);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'lot': lot,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
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
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high') / 1e8,
            'low': this.safeFloat (ticker, 'low') / 1e8,
            'bid': this.safeFloat (ticker, 'buy') / 1e8,
            'ask': this.safeFloat (ticker, 'sell') / 1e8,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last') / 1e8,
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/' + api + '/' + this.implodeParams (path, params);
        if (Object.keys (query).length)
            url += '?' + this.urlencode (query);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (!('status' in response)) {
            throw new ExchangeError ('Invalid response.');
        }
        let success = this.safeInteger (response['status'], 'success');
        if (success !== 1) {
            let message = this.safeString (response['status'], 'message');
            throw new ExchangeError (message);
        }
        return response;
    }
};
