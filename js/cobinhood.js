'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class cobinhood extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cobinhood',
            'name': 'COBINHOOD',
            'countries': 'TW',
            'rateLimit': 1000 / 10,
            'has': {
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
                'fetchDepositAddress': true,
                'createDepositAddress': true,
                'withdraw': true,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'timeframes': {
                // the first two don't seem to work at all
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '7d': '7D',
                '14d': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/35755576-dee02e5c-0878-11e8-989f-1595d80ba47f.jpg',
                'api': {
                    'web': 'https://api.cobinhood.com/v1',
                    'ws': 'wss://feed.cobinhood.com',
                },
                'www': 'https://cobinhood.com',
                'doc': 'https://cobinhood.github.io/api-public',
            },
            'api': {
                'system': {
                    'get': [
                        'info',
                        'time',
                        'messages',
                        'messages/{message_id}',
                    ],
                },
                'admin': {
                    'get': [
                        'system/messages',
                        'system/messages/{message_id}',
                    ],
                    'post': [
                        'system/messages',
                    ],
                    'patch': [
                        'system/messages/{message_id}',
                    ],
                    'delete': [
                        'system/messages/{message_id}',
                    ],
                },
                'public': {
                    'get': [
                        'market/tickers',
                        'market/currencies',
                        'market/trading_pairs',
                        'market/orderbooks/{trading_pair_id}',
                        'market/stats',
                        'market/tickers/{trading_pair_id}',
                        'market/trades/{trading_pair_id}',
                        'chart/candles/{trading_pair_id}',
                    ],
                },
                'private': {
                    'get': [
                        'trading/orders/{order_id}',
                        'trading/orders/{order_id}/trades',
                        'trading/orders',
                        'trading/order_history',
                        'trading/trades/{trade_id}',
                        'wallet/balances',
                        'wallet/ledger',
                        'wallet/deposit_addresses',
                        'wallet/withdrawal_addresses',
                        'wallet/withdrawals/{withdrawal_id}',
                        'wallet/withdrawals',
                        'wallet/deposits/{deposit_id}',
                        'wallet/deposits',
                    ],
                    'post': [
                        'trading/orders',
                        'wallet/deposit_addresses',
                        'wallet/withdrawal_addresses',
                        'wallet/withdrawals',
                    ],
                    'delete': [
                        'trading/orders/{order_id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0,
                    'taker': 0.0,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'exceptions': {
                'insufficient_balance': InsufficientFunds,
            },
        });
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetMarketCurrencies (params);
        let currencies = response['result']['currencies'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['currency'];
            let code = this.commonCurrencyCode (id);
            let minUnit = this.safeFloat (currency, 'min_unit');
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': true,
                'status': 'ok',
                'fiat': false,
                'precision': this.precisionFromString (currency['min_unit']),
                'limits': {
                    'amount': {
                        'min': minUnit,
                        'max': undefined,
                    },
                    'price': {
                        'min': minUnit,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': minUnit,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': minUnit,
                        'max': undefined,
                    },
                },
                'funding': {
                    'withdraw': {
                        'fee': this.safeFloat (currency, 'withdrawal_fee'),
                    },
                    'deposit': {
                        'fee': this.safeFloat (currency, 'deposit_fee'),
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets () {
        let response = await this.publicGetMarketTradingPairs ();
        let markets = response['result']['trading_pairs'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'];
            let [ baseId, quoteId ] = id.split ('-');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': this.precisionFromString (market['quote_increment']),
            };
            let active = this.safeValue (market, 'is_active', true);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'base_min_size'),
                        'max': this.safeFloat (market, 'base_max_size'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
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
        if (typeof market === 'undefined') {
            let marketId = this.safeString (ticker, 'trading_pair_id');
            market = this.findMarket (marketId);
        }
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = this.safeInteger (ticker, 'timestamp');
        let last = this.safeFloat (ticker, 'last_trade_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, '24h_high'),
            'low': this.safeFloat (ticker, '24h_low'),
            'bid': this.safeFloat (ticker, 'highest_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowest_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'percentChanged24hr'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, '24h_volume'),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketTickersTradingPairId (this.extend ({
            'trading_pair_id': market['id'],
        }, params));
        let ticker = response['result']['ticker'];
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketTickers (params);
        let tickers = response['result']['tickers'];
        let result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.indexBy (result, 'symbol');
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'trading_pair_id': this.marketId (symbol),
        };
        if (typeof limit !== 'undefined')
            request['limit'] = limit; // 100
        let response = await this.publicGetMarketOrderbooksTradingPairId (this.extend (request, params));
        return this.parseOrderBook (response['result']['orderbook'], undefined, 'bids', 'asks', 0, 2);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = trade['timestamp'];
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'size');
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        let side = trade['maker_side'] === 'bid' ? 'sell' : 'buy';
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': trade['id'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketTradesTradingPairId (this.extend ({
            'trading_pair_id': market['id'],
            'limit': limit, // default 20, but that seems too little
        }, params));
        let trades = response['result']['trades'];
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            // they say that timestamps are Unix Timestamps in seconds, but in fact those are milliseconds
            ohlcv['timestamp'],
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['volume']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        //
        // they say in their docs that end_time defaults to current server time
        // but if you don't specify it, their range limits does not allow you to query anything
        //
        // they also say that start_time defaults to 0,
        // but most calls fail if you do not specify any of end_time
        //
        // to make things worse, their docs say it should be a Unix Timestamp
        // but with seconds it fails, so we set milliseconds (somehow it works that way)
        //
        let endTime = this.milliseconds ();
        let request = {
            'trading_pair_id': market['id'],
            'timeframe': this.timeframes[timeframe],
            'end_time': endTime,
        };
        if (typeof since !== 'undefined')
            request['start_time'] = since;
        let response = await this.publicGetChartCandlesTradingPairId (this.extend (request, params));
        let ohlcv = response['result']['candles'];
        return this.parseOHLCVs (ohlcv, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetWalletBalances (params);
        let result = { 'info': response };
        let balances = response['result']['balances'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currency = balance['currency'];
            if (currency in this.currencies_by_id)
                currency = this.currencies_by_id[currency]['code'];
            let account = {
                'used': parseFloat (balance['on_order']),
                'total': parseFloat (balance['total']),
            };
            account['free'] = parseFloat (account['total'] - account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (order, 'trading_pair');
            if (typeof marketId === 'undefined')
                marketId = this.safeString (order, 'trading_pair_id');
            market = this.markets_by_id[marketId];
        }
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = order['timestamp'];
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'size');
        let filled = this.safeFloat (order, 'filled');
        let remaining = amount - filled;
        // new, queued, open, partially_filled, filled, cancelled
        let status = order['state'];
        if (status === 'filled') {
            status = 'closed';
        } else if (status === 'cancelled') {
            status = 'canceled';
        } else {
            status = 'open';
        }
        let side = (order['side'] === 'bid') ? 'buy' : 'sell';
        return {
            'id': order['id'],
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': order['type'], // market, limit, stop, stop_limit, trailing_stop, fill_or_kill
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        side = (side === 'sell') ? 'ask' : 'bid';
        let request = {
            'trading_pair_id': market['id'],
            'type': type, // market, limit, stop, stop_limit
            'side': side,
            'size': this.amountToString (symbol, amount),
        };
        if (type !== 'market')
            request['price'] = this.priceToPrecision (symbol, price);
        let response = await this.privatePostTradingOrders (this.extend (request, params));
        let order = this.parseOrder (response['result']['order'], market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privateDeleteTradingOrdersOrderId (this.extend ({
            'order_id': id,
        }, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetTradingOrdersOrderId (this.extend ({
            'order_id': id.toString (),
        }, params));
        return this.parseOrder (response['result']['order']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let result = await this.privateGetTradingOrders (params);
        let orders = this.parseOrders (result['result']['orders'], undefined, since, limit);
        if (typeof symbol !== 'undefined')
            return this.filterBySymbol (orders, symbol);
        return orders;
    }

    async fetchOrderTrades (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetTradingOrdersOrderIdTrades (this.extend ({
            'order_id': id,
        }, params));
        let market = (typeof symbol === 'undefined') ? undefined : this.market (symbol);
        return this.parseTrades (response['result']['trades'], market);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostWalletDepositAddresses ({
            'currency': currency['id'],
        });
        let address = this.safeString (response['result']['deposit_address'], 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privateGetWalletDepositAddresses (this.extend ({
            'currency': currency['id'],
        }, params));
        let addresses = this.safeValue (response['result'], 'deposit_addresses', []);
        let address = undefined;
        if (addresses.length > 0) {
            address = this.safeString (addresses[0], 'address');
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async withdraw (code, amount, address, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostWalletWithdrawals (this.extend ({
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        }, params));
        return {
            'id': response['result']['withdrawal_id'],
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['web'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = {};
        if (api === 'private') {
            this.checkRequiredCredentials ();
            // headers['device_id'] = this.apiKey;
            headers['nonce'] = this.nonce ().toString ();
            headers['Authorization'] = this.apiKey;
        }
        if (method === 'GET') {
            query = this.urlencode (query);
            if (query.length)
                url += '?' + query;
        } else {
            headers['Content-type'] = 'application/json; charset=UTF-8';
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code < 400 || code >= 600) {
            return;
        }
        if (body[0] !== '{') {
            throw new ExchangeError (this.id + ' ' + body);
        }
        let response = JSON.parse (body);
        let errorCode = this.safeValue (response['error'], 'error_code');
        const feedback = this.id + ' ' + this.json (response);
        const exceptions = this.exceptions;
        if (errorCode in exceptions) {
            throw new exceptions[errorCode] (feedback);
        }
        throw new ExchangeError (feedback);
    }
};
