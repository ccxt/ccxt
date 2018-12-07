'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, PermissionDenied, InvalidOrder, DDoSProtection, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

// UNSUPPORTED DATA:
//      describe:
//      - exact rate-limit rules
//      tickers:
//      - Ask/Bid total-volume
//      - Volume-weighted avg price
//      - Average price
//      order-book:
//      - time/nonce
//      my-trades:
//      - order-id & order-type
//      order:
//      - type (only supports LIMIT, LIMIT_MAKER)
//      - fee when (partially) filled
//      - filled trade details
//      transaction:
//      - updated timestamp (withdrawal)

module.exports = class xs2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xs2',
            'name': 'XS2',
            'countries': [ 'AU' ], // Australia
            'rateLimit': 500,
            'has': {
                'CORS': true,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                // 'cancelOrders': false,
                // 'createDepositAddress': false,
                'createOrder': true,
                'createMarketOrder': false,
                // 'createLimitOrder': true,
                // 'deposit': false,
                // 'editOrder': 'emulated',
                'fetchBalance': true,
                // 'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                // 'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': true,
                // 'fetchL2OrderBook': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                // 'fetchTradingFees': false,
                // 'fetchTradingLimits': false,
                // 'fetchTransactions': false,
                'fetchWithdrawals': true,
                // 'withdraw': false,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '2h': 120,
                '3h': 180,
                '6h': 360,
                '12h': 720,
                '1d': 1440,
                '1w': 10080,
            },
            'urls': {
                'logo': 'https://xs2.exchange/img/xs2_logo.svg',
                'api': {
                    'public': 'https://xs2.exchange/API/V1',
                    'private': 'https://xs2.exchange/API/V1',
                },
                'www': 'https://xs2.exchange',
                'doc': 'https://xs2.exchange/apidocs',
                'fees': 'https://xs2.exchange/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'Ping',
                        'Time',
                        'GetInfoPack',
                        'GetCoin',
                        'GetTransparencyInfo',
                        'Get24HrSummaries',
                        'Get24HrSummary',
                        'GetOrderBook',
                        'GetHistoricTrades',
                        'GetChart',
                    ],
                },
                'private': {
                    'get': [
                        'GetCustomerInfo',
                        'GetWallets',
                        'GetDeposits',
                        'GetWithdrawals',
                        'PlaceBuyOrder',
                        'PlaceBuyOrderWithOutcome',
                        'PlaceSellOrder',
                        'PlaceSellOrderWithOutcome',
                        'PlaceBuyLiquidityOrder',
                        'PlaceBuyLiquidityOrderWithOutcome',
                        'PlaceSellLiquidityOrder',
                        'PlaceSellLiquidityOrderWithOutcome',
                        'CancelBuyOrder',
                        'CancelBuyOrderWithOutcome',
                        'CancelSellOrder',
                        'CancelSellOrderWithOutcome',
                        'CancelAllOrders',
                        'GetWalletAddress',
                        'CancelWithdrawal',
                        'GetOrder',
                        'GetOrders',
                        'GetOrdersWithTop',
                        'GetTrades',
                        'GetTradesWithTop',
                        'GetTax',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'uid': false,
                'login': false,
                'password': false,
                'twofa': false, // 2-factor authentication (one-time password key)
                'privateKey': false, // a "0x"-prefixed hexstring private key for a wallet
                'walletAddress': false, // the wallet address "0x"-prefixed hexstring
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': undefined,
                    'maker': undefined,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'commonCurrencies': {
            },
            // exchange-specific options
            'options': {
            },
            'ORDER_STATUS_MAP': {
                'A': 'open',
                'P': 'open',
                'F': 'closed',
                'C': 'canceled',
            },
            'WITHDRAWAL_STATUS_MAP': {
                'P': 'pending',
                'E': 'pending',
                'S': 'pending',
                'D': 'canceled',
                'R': 'canceled',
                'I': 'failed',
                'C': 'ok',
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetGetInfoPack ();
        let markets = response['data']['markets'];
        let coins = response['data']['trade_coins'];
        let coin_info = {};
        for (let c = 0; c < coins.length; c++) {
            coin_info[coins[c]['symbol']] = coins[c];
        }
        let result = [];
        for (let m = 0; m < markets.length; m++) {
            let market = markets[m];
            let id = market['label'];
            let baseId = market['coin'];
            let quoteId = market['base_coin'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let base_info = coin_info[baseId];
            let quote_info = coin_info[quoteId];
            let active = (market['trading_enabled']);
            let entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': {
                    'market': market,
                    'base': base_info,
                    'quote': quote_info,
                },
                'active': active,
                'precision': {
                    'base': base_info['decimals'],
                    'quote': quote_info['decimals'],
                    'amount': base_info['decimals'],
                    'price': quote_info['decimals'],
                },
                'limits': {
                    'amount': {
                        'min': market['coin_min_trade_volume'],
                        'max': undefined,
                    },
                    'price': {
                        'min': market['min_rate'],
                        'max': market['max_rate'],
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'taker': market['taker_fee_multiplier'],
                'maker': market['maker_fee_multiplier'],
            };
            result.push (entry);
        }
        return result;
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        let withdrawFees = {};
        let markets = this.toArray (this.markets);
        for (let i = 0; i < markets.length; i++) {
            let code = markets[i].base;
            if (codes === undefined || this.inArray (code, codes)) {
                let base_info = markets[i]['info']['base'];
                withdrawFees[code] = this.safeFloat (base_info, 'withdrawal_fee');
            }
        }
        return {
            'info': undefined,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetGetWallets (params);
        let result = { 'info': response };
        let wallets = response['data']['wallets'];
        for (let w = 0; w < wallets.length; w++) {
            let wallet = wallets[w];
            let currency = wallet['coin'];
            if (currency in this.currencies_by_id) {
                currency = this.currencies_by_id[currency]['code'];
            }
            let account = {
                'free': parseFloat (wallet['available']),
                'used': parseFloat (wallet['reserved_trading'] + wallet['reserved_withdrawal']),
                'total': parseFloat (wallet['balance']),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'Market': market['id'],
        };
        if (limit !== undefined) {
            request['Top'] = limit;
        }
        let response = await this.publicGetGetOrderBook (this.extend (request, params));
        let orderbook = this.parseOrderBook (response['data'], undefined, 'bids', 'asks', 'rate', 'volume');
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.parse8601 (this.safeString (ticker, 'utc'));
        let symbol = market['symbol'];
        let open = this.safeFloat (ticker, 'open');
        let high = this.safeFloat (ticker, 'high');
        let low = this.safeFloat (ticker, 'low');
        let price = this.safeFloat (ticker, 'price');
        let prev_price = this.safeFloat (ticker, 'prev_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': (high !== undefined) ? high : price,
            'low': (low !== undefined) ? low : price,
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': (open !== undefined) ? open : price,
            'close': price,
            'last': price,
            'previousClose': prev_price,
            'change': (prev_price && price) ? price - prev_price : undefined,
            'percentage': (prev_price && price) ? (price - prev_price) / prev_price : undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'base_vol'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'Market': market['id'],
        };
        let response = await this.publicGetGet24HrSummary (this.extend (request, params));
        return this.parseTicker (response['data'], market);
    }

    parseTickers (raw_tickers, symbols = undefined) {
        let tickers = [];
        let labels = Object.keys (raw_tickers);
        for (let i = 0; i < labels.length; i++) {
            let symbol = this.findSymbol (labels[i]);
            tickers.push (this.parseTicker (raw_tickers[labels[i]], this.market (symbol)));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetGet24HrSummaries (params);
        return this.parseTickers (response['data'], symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let utc = this.parse8601 (this.safeString (ohlcv, 'utc'));
        let volume = this.safeFloat (ohlcv, 'volume');
        let open = this.safeFloat (ohlcv, 'open');
        let high = this.safeFloat (ohlcv, 'high');
        let low = this.safeFloat (ohlcv, 'low');
        let price = this.safeFloat (ohlcv, 'price');
        return [
            utc,
            (open !== undefined) ? open : price,
            (high !== undefined) ? high : price,
            (low !== undefined) ? low : price,
            price,
            volume,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a symbol argument');
        }
        if (!(timeframe in this.timeframes)) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV timeframe ' + timeframe + ' is not supported');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'Market': market['id'],
            'Interval': this.timeframes[timeframe],
        };
        if (since !== undefined && since !== 0) {
            request['Start'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['Top'] = limit;
        }
        let response = await this.publicGetGetChart (this.extend (request, params));
        return this.parseOHLCVs (response['data']['Stats'], market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (this.safeString (trade, 'created'));
        let id = this.safeInteger (trade, 'id');
        let side = this.safeString (trade, 'side');
        let isSell = side === 'S';
        let order_type = this.safeString (trade, 'order_type');
        let takerOrMaker = undefined;
        if (order_type !== undefined) {
            if (isSell) {
                takerOrMaker = (order_type === 'Sell') ? 'taker' : 'maker';
            } else {
                takerOrMaker = (order_type === 'Buy') ? 'taker' : 'maker';
            }
        }
        let symbol = undefined;
        if ('market' in trade) {
            let label = this.safeString (trade, 'market');
            symbol = this.findSymbol (label);
        } else if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id.toString (),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': isSell ? 'sell' : 'buy',
            'price': this.safeFloat (trade, 'rate'),
            'cost': this.safeFloat (trade, 'base_amount'),
            'amount': this.safeFloat (trade, 'amount'),
            'fee': {
                'cost': this.safeFloat (trade, 'fees'),
                'currency': this.commonCurrencyCode (this.safeString (trade, 'fee_coin')),
            },
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'Market': market['id'],
        };
        if (since !== undefined && since !== 0) {
            request['Start'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['Top'] = limit;
        }
        let response = await this.publicGetGetHistoricTrades (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let id = this.safeInteger (order, 'id');
        let side = this.safeString (order, 'order_type');
        if (id !== undefined && side !== undefined) {
            id = side.slice (0, 1) + id.toString ();
            side = side.toLowerCase ();
        }
        let timestamp = this.parse8601 (this.safeString (order, 'created'));
        let symbol = undefined;
        if ('market' in order) {
            let label = this.safeString (order, 'market');
            symbol = this.findSymbol (label);
        } else if (market !== undefined) {
            symbol = market['symbol'];
        }
        let status = this.safeString (order, 'status');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': this.safeFloat (order, 'rate'),
            'amount': this.safeFloat (order, 'volume'),
            'cost': this.safeFloat (order, 'cost_pays'),
            'average': this.safeFloat (order, 'avg_rate'),
            'filled': this.safeFloat (order, 'filled'),
            'remaining': this.safeFloat (order, 'remaining'),
            'status': (status in this.ORDER_STATUS_MAP) ? this.ORDER_STATUS_MAP[status] : status,
            'fee': undefined,
            'trades': undefined,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a symbol argument');
        }
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a type argument');
        }
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires a side argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires an amount argument');
        }
        let uppercaseType = type.toUpperCase ();
        let liquidity = '';
        if (uppercaseType === 'LIMIT_MAKER') {
            liquidity = 'Liquidity';
        } else if (uppercaseType !== 'LIMIT') {
            throw new InvalidOrder (this.id + ' createOrder method does not support type "' + type + '"');
        }
        let capitalizedSide = this.capitalize (side.toLowerCase ());
        if (capitalizedSide !== 'Sell' && capitalizedSide !== 'Buy') {
            throw new InvalidOrder (this.id + ' createOrder method does not support side "' + side + '"');
        }
        if (price === undefined) {
            throw new InvalidOrder (this.id + ' createOrder method requires a price argument for a ' + type + ' order');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'Market': market['id'],
            'Amount': this.amountToPrecision (symbol, amount),
            'Price': this.priceToPrecision (symbol, price),
        };
        let method = 'privateGetPlace' + this.capitalize (side.toLowerCase ()) + liquidity + 'OrderWithOutcome';
        let response = await this[method] (this.extend (request, params));
        return this.parseOrder (response['data'], market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires an id argument');
        }
        await this.loadMarkets ();
        let order_id = parseInt (id.slice (1));
        let response = await this.privateGetGetOrder ({ 'OrderType': id.slice (0, 1), 'OrderID': order_id });
        return this.parseOrder (response['data']);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'Market': market['id'],
        };
        if (since !== undefined && since !== 0) {
            request['CreatedFrom'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['Top'] = limit;
        }
        let response = await this.privateGetGetOrdersWithTop (this.extend (request, params));
        return this.parseOrders (response['data']['orders'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend (params, { 'OrderStatus': 'A' }));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, undefined, params);
        return this.filterByValueSinceLimit (orders, 'status', 'closed', undefined, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires an id argument');
        }
        await this.loadMarkets ();
        let isSell = id.slice (0, 1) === 'S';
        let order_id = parseInt (id.slice (1));
        let method = isSell ? 'privateGetCancelSellOrderWithOutcome' : 'privateGetCancelBuyOrderWithOutcome';
        let response = await this[method] (this.extend ({ 'OrderID': order_id }, params));
        return this.parseOrder (response['data']);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['Market'] = market['id'];
        }
        if (since !== undefined && since !== 0) {
            request['CreatedFrom'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['Top'] = limit;
        }
        let response = await this.privateGetGetTradesWithTop (this.extend (request, params));
        return this.parseTrades (response['data']['trades'], market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (code !== undefined) {
            request['Symbol'] = this.currencyId (code);
        }
        if (since !== undefined && since !== 0) {
            request['CreatedFrom'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['Top'] = limit;
        }
        let response = await this.privateGetGetDeposits (this.extend (request, params));
        return this.parseTransactions (response['data']['deposits'], undefined, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (code !== undefined) {
            request['Symbol'] = this.currencyId (code);
        }
        if (since !== undefined && since !== 0) {
            request['CreatedFrom'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['Top'] = limit;
        }
        let response = await this.privateGetGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response['data']['withdrawals'], undefined, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        let type = ('from_address' in transaction) ? 'deposit' : 'withdrawal';
        let id = type.slice (0, 1).toUpperCase () + this.safeString (transaction, 'id');
        let addressField = (type === 'deposit') ? 'from_address' : 'to_address';
        let address = this.safeString (transaction, addressField);
        let tag = this.safeString (transaction, 'to_memo'); // only set for withdrawals
        let txid = this.safeValue (transaction, 'transaction_id');
        let code = undefined;
        let currencyId = this.safeString (transaction, 'coin');
        if (currencyId in this.currencies_by_id) {
            code = this.currencies_by_id[currencyId]['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        let feeCode = undefined;
        let feeCurrencyId = this.safeString (transaction, 'fee_coin');
        if (feeCurrencyId in this.currencies_by_id) {
            feeCode = this.currencies_by_id[feeCurrencyId]['code'];
        } else {
            feeCode = this.commonCurrencyCode (feeCurrencyId);
        }
        let timestamp = this.parse8601 (this.safeString (transaction, 'created'));
        let status = undefined;
        if (type === 'deposit') {
            if (transaction['deposited']) {
                status = 'ok';
            } else {
                status = transaction['pending'] ? 'pending' : 'failed';
            }
        } else {
            let state = this.safeString (transaction, 'state');
            status = (state in this.WITHDRAWAL_STATUS_MAP) ? this.WITHDRAWAL_STATUS_MAP[state] : state;
        }
        let amount = this.safeFloat (transaction, 'amount');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': (type === 'deposit') ? undefined : {
                'cost': this.safeFloat (transaction, 'fee'),
                'currency': feeCode,
            },
        };
    }

    async fetchDepositAddress (code, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress requires a code argument');
        }
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privateGetGetWalletAddress (this.extend ({
            'Coin': currency['id'],
        }, params));
        let address = this.safeString (response['data'], 'deposit_address');
        let tag = this.safeString (response['data'], 'deposit_memo');
        return {
            'info': response,
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
        }
        if (this.apiKey !== undefined) {
            let query = this.urlencode (this.extend ({
                'key': this.apiKey,
            }, params));
            url += '?' + query;
        } else if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (body.length > 0 && body.slice (0, 1) === '{') {
            response = JSON.parse (body);
            let success = this.safeValue (response, 'success', false);
            if (!success) {
                let message = this.safeString (response, 'message');
                if (message.indexOf ('Rate limit exceeded.') >= 0) {
                    throw new DDoSProtection (this.id + ' ' + message);
                }
                if (message.indexOf ('available through the API') >= 0 || message.indexOf ('Oops, looks like you can') >= 0) {
                    throw new PermissionDenied (this.id + ' ' + message);
                }
                throw new ExchangeError (this.id + ' ' + message);
            } else {
                let route = this.safeString (response, 'route');
                if (route === '/login' || route === '/message/restricted') {
                    let message = this.safeString (response, 'message');
                    throw new AuthenticationError (this.id + ' ' + message);
                }
            }
        }
    }
};
