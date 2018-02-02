'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class cobinhood extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cobinhood',
            'name': 'COBINHOOD',
            'countries': 'TW',
            'rateLimit': 1000 / 10,
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'timeframes': {
                // the first two don't seem to work at all
                // '1m': '1m',
                // '5m': '5m',
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
                'test': {
                    'web': 'https://sandbox-api.cobinhood.com',
                    'ws': 'wss://sandbox-feed.cobinhood.com',
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
        });
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetMarketCurrencies (params);
        let currencies = response['result'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['currency'];
            let code = this.commonCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': true,
                'status': 'ok',
                'fiat': false,
                'lot': parseFloat (currency['min_unit']),
                'precision': 8,
                'funding': {
                    'withdraw': {
                        'active': true,
                        'fee': parseFloat (currency['withdrawal_fee']),
                    },
                    'deposit': {
                        'active': true,
                        'fee': parseFloat (currency['deposit_fee']),
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
            let [ base, quote ] = id.split ('-');
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': this.commonCurrencyCode (base),
                'quote': this.commonCurrencyCode (quote),
                'active': true,
                'lot': parseFloat (market['quote_increment']),
                'limits': {
                    'amount': {
                        'min': parseFloat (market['base_min_size']),
                        'max': parseFloat (market['base_max_size']),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = undefined;
        if ('timestamp' in ticker) {
            timestamp = ticker['timestamp'];
        } else {
            timestamp = this.milliseconds ();
        }
        let info = ticker;
        // from fetchTicker
        if ('info' in ticker)
            info = ticker['info'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high_24hr']),
            'low': parseFloat (ticker['low_24hr']),
            'bid': parseFloat (ticker['highest_bid']),
            'ask': parseFloat (ticker['lowest_ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last_price'),
            'change': this.safeFloat (ticker, 'percentChanged24hr'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['base_volume']),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume'),
            'info': info,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketTickersTradingPairId (this.extend ({
            'trading_pair_id': market['id'],
        }, params));
        let ticker = response['result']['ticker'];
        ticker = {
            'last_price': ticker['last_trade_price'],
            'highest_bid': ticker['highest_bid'],
            'lowest_ask': ticker['lowest_ask'],
            'base_volume': ticker['24h_volume'],
            'high_24hr': ticker['24h_high'],
            'low_24hr': ticker['24h_low'],
            'timestamp': ticker['timestamp'],
            'info': response,
        };
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketStats (params);
        let tickers = response['result'];
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'trading_pair_id': this.marketId (symbol),
        };
        if (typeof limit !== 'undefined')
            request['limit'] = limit; // 100
        let response = await this.publicGetMarketOrderbooksTradingPairId (this.extend (request, params));
        return this.parseOrderBook (response['result']['orderbook']);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = trade['timestamp'];
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['size']);
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

    async fetchOHLCV (symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let query = {
            'trading_pair_id': market['id'],
            'timeframe': this.timeframes[timeframe],
            // they say in their docs that end_time defaults to current server time
            // but if you don't specify it, their range limits does not allow you to query anything
            'end_time': this.milliseconds (),
        };
        if (since) {
            // in their docs they say that start_time defaults to 0, but, obviously it does not
            query['start_time'] = since;
        }
        let response = await this.publicGetChartCandlesTradingPairId (this.extend (query, params));
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
            let id = balance['currency'];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['total']),
                'used': parseFloat (balance['on_order']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (!market) {
            let marketId = order['trading_pair'];
            market = this.markets_by_id[marketId];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = order['timestamp'];
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['size']);
        let filled = parseFloat (order['filled']);
        let remaining = this.amountToPrecision (symbol, amount - filled);
        // new, queued, open, partially_filled, filled, cancelled
        let status = order['state'];
        if (status === 'filled') {
            status = 'closed';
        } else if (status === 'cancelled') {
            status = 'canceled';
        } else {
            status = 'open';
        }
        let side = order['side'] === 'bid' ? 'buy' : 'sell';
        return {
            'id': order['id'],
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            // market, limit, stop, stop_limit, trailing_stop, fill_or_kill
            'type': order['type'],
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
        side = (side === 'sell' ? 'ask' : 'bid');
        let request = {
            'trading_pair_id': market['id'],
            // market, limit, stop, stop_limit
            'type': type,
            'side': side,
            'size': this.amountToPrecision (symbol, amount),
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

    async fetchOrderTrades (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetTradingOrdersOrderIdTrades (this.extend ({
            'order_id': id,
        }, params));
        return this.parseTrades (response['result']);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostWalletDepositAddresses ({
            'currency': currency['id'],
        });
        let address = this.safeString (response['result']['deposit_address'], 'address');
        if (!address)
            throw new ExchangeError (this.id + ' createDepositAddress failed: ' + this.last_http_response);
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
        let address = this.safeString (response['result']['deposit_addresses'], 'address');
        if (!address)
            throw new ExchangeError (this.id + ' fetchDepositAddress failed: ' + this.last_http_response);
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
            headers['device_id'] = this.apiKey;
            headers['nonce'] = this.nonce ();
            headers['Authorization'] = this.jwt (query, this.secret);
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
        let response = this.unjson (body);
        let message = this.safeValue (response['error'], 'error_code');
        throw new ExchangeError (this.id + ' ' + message);
    }
};
