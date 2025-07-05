'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadRequest,
    RateLimitExceeded,
    AuthenticationError,
    PermissionDenied,
    ArgumentsRequired,
    ExchangeError,
    InvalidAddress,
    BadSymbol,
    InsufficientFunds,
    InvalidOrder,
    OrderNotFound,
    DuplicateOrderId,
    InvalidNonce } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class nominex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'nominex',
            'name': 'Nominex',
            'countries': [ 'SC' ],
            'rateLimit': 1500,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': false,
                'fetchCurrencies': true,
                'fetchOHLCV': true,
                'cancelAllOrders': false,
                'createDepositAddress': true,
                'deposit': false,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchTradingFees': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'TF1M',
                '5m': 'TF5M',
                '15m': 'TF15M',
                '30m': 'TF30M',
                '1h': 'TF1H',
                '3h': 'TF3H',
                '6h': 'TF6H',
                '12h': 'TF12H',
                '1d': 'TF1D',
                '1w': 'TF7D',
                '2w': 'TF14D',
                '1M': 'TF1MO',
            },
            'urls': {
                'logo': 'https://nominex.io/media/nominex-logo.png',
                'api': {
                    'public': 'https://nominex.io/api/rest/v1',
                    'private': 'https://nominex.io/api/rest/v1/private',
                },
                'demo': {
                    'public': 'https://demo.nominex.io/api/rest/v1',
                    'private': 'https://demo.nominex.io/api/rest/v1/private',
                },
                'www': 'https://nominex.io',
                'doc': [
                    'https://developer.nominex.io/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'pairs',
                        'ticker/{symbol}',
                        'ticker',
                        'orderbook/{symbol}',
                        'candles/{symbol}/{timeframe}',
                        'trades/{symbol}',
                    ],
                },
                'private': {
                    'get': [
                        'trading-fee-rates',
                        'deposits',
                        'withdrawals',
                        'orders',
                        'orders/{id}',
                        'orders/{symbol}',
                        'trades/{symbol}',
                        'wallets',
                        'wallets/{currency}/address',
                        'wallets/{currency}/deposits',
                        'wallets/{currency}/withdrawals',
                    ],
                    'post': [
                        'orders',
                        'wallets/{currency}/address',
                        'withdrawals',
                    ],
                    'put': [
                        'orders/{id}',
                        'orders/by-client-id/{cid}',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                },
                'funding': {
                    'tierBased': false, // true for tier-based/progressive
                },
            },
            'exceptions': {
                '100.2': BadSymbol,
                '101': InvalidNonce,
                '103': AuthenticationError,
                '103.4': InvalidOrder,
                '104.4': InvalidOrder,
                '110.110': RateLimitExceeded,
                '121': PermissionDenied,
                '601': BadRequest,
                '1101': InsufficientFunds,
                '1102': DuplicateOrderId,
                '1106': OrderNotFound,
                '20002': InvalidAddress,
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'tradeSides': {
                    'buy': 'BUY',
                    'sell': 'SELL',
                },
                'paths': {
                    'public': '/api/rest/v1',
                    'private': '/api/rest/v1/private',
                },
            },
        });
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetTradingFeeRates (params);
        return {
            'info': response,
            'maker': this.safeFloat (response, 'makerFeeFactor') * 100.0,
            'taker': this.safeFloat (response, 'takerFeeFactor') * 100.0,
        };
    }

    async fetchCurrencies (params = {}) {
        const currencies = await this.publicGetCurrencies (params);
        const result = {};
        for (let i = 0; i < currencies.length; ++i) {
            const currency = this.parseCurrency (currencies[i]);
            const currencyCode = this.safeString (currency, 'code');
            result[currencyCode] = currency;
        }
        return result;
    }

    parseCurrency (currency) {
        const currencyId = this.safeString (currency, 'code');
        return {
            'id': currencyId,
            'code': this.safeCurrencyCode (currencyId),
            'name': this.safeString (currency, 'name'),
            'active': true,
            'fee': this.safeFloat (currency, 'withdrawalFee'),
            'precision': this.safeInteger (currency, 'scale'),
            'info': currency,
        };
    }

    async fetchMarkets (params = {}) {
        const pairs = await this.publicGetPairs (params);
        const result = [];
        for (let i = 0; i < pairs.length; i++) {
            const market = pairs[i];
            const id = this.safeString (market, 'name');
            const parts = id.split ('/');
            const baseId = parts[0];
            const quoteId = parts[1];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeFloat (market, 'quoteStep'),
                'amount': this.safeFloat (market, 'baseStep'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minBaseAmount'),
                    'max': this.safeFloat (market, 'maxBaseAmount'),
                },
                'cost': {
                    'min': this.safeFloat (market, 'minQuoteAmount'),
                    'max': this.safeFloat (market, 'maxQuoteAmount'),
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': this.safeValue (market, 'active'),
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balanceType = this.safeString (params, 'type', 'SPOT');
        const request = this.omit (params, 'type');
        const response = await this.privateGetWallets (request);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            if (balance['type'] === balanceType) {
                const currencyId = this.safeString (balance, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                if (!(code in result)) {
                    const account = this.account ();
                    account['free'] = this.safeFloat (balance, 'balanceAvailable');
                    account['total'] = this.safeFloat (balance, 'balance');
                    result[code] = account;
                }
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetOrderbookSymbol (this.extend (request, params));
        const asks = this.filterBy (response, 'side', 'SELL');
        const bids = this.filterBy (response, 'side', 'BUY');
        return this.parseOrderBook ({ 'asks': asks, 'bids': bids }, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = [];
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; ++i) {
                const symbol = symbols[i];
                ids.push (this.marketId (symbol));
            }
        } else {
            ids = Object.keys (this.markets);
        }
        const request = { 'pairs': ids.join (',') };
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const marketId = ids[i];
            const market = this.markets[marketId];
            const ticker = this.parseTicker (response[i], market);
            const symbol = market['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetTickerSymbol (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'price');
        const open = last - this.safeFloat (ticker, 'dailyChange');
        const baseVolume = this.safeFloat (ticker, 'baseVolume');
        const quoteVolume = this.safeFloat (ticker, 'quoteVolume');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': this.safeFloat (ticker, 'bidSize'),
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': this.safeFloat (ticker, 'askSize'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': open,
            'change': this.safeFloat (ticker, 'dailyChange'),
            'percentage': this.safeFloat (ticker, 'dailyChangeP'),
            'average': this.sum (open, last) / 2,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetCandlesSymbolTimeframe (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market) {
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const type = undefined;
        const side = this.safeStringLower (trade, 'side').toLowerCase ();
        let orderId = undefined;
        if ('orderId' in trade) {
            orderId = this.safeString (trade, 'orderId');
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let takerOrMaker = undefined;
        if ('maker' in trade) {
            const maker = this.safeValue (trade, 'maker');
            takerOrMaker = maker ? 'maker' : 'taker';
        }
        const feeAmount = this.safeFloat (trade, 'fee');
        const fee = feeAmount === undefined ? undefined : {
            'cost': feeAmount,
            'currency': this.safeString (trade, 'feeCurrencyCode'),
        };
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'order': orderId,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (this.safeValue (response, 'items'), market, since, limit);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let key = 'quote';
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        const code = market[key];
        const currency = this.safeValue (this.currencies, code);
        if (currency !== undefined) {
            const precision = this.safeInteger (currency, 'precision');
            if (precision !== undefined) {
                cost = parseFloat (this.currencyToPrecision (code, cost));
            }
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start'] = parseInt (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (this.safeValue (response, 'items'), market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'pairName': marketId,
            'side': this.toUpperCase (side),
            'amount': this.amountToPrecision (symbol, amount),
            'type': this.toUpperCase (type),
            'walletType': this.safeString (params, 'walletType', 'SPOT'),
        };
        if ('clientOrderId' in params) {
            request['cid'] = this.safeInteger (params, 'clientOrderId');
        }
        if (type === 'limit') {
            request['limitPrice'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (response);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'walletType': this.safeString (params, 'walletType', 'SPOT'),
        };
        if (price !== undefined) {
            request['limitPrice'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (symbol !== undefined) {
            request['pairName'] = this.marketId (symbol);
        }
        if (side !== undefined) {
            request['side'] = this.toUpperCase (side);
        }
        if (type !== undefined) {
            request['type'] = this.toUpperCase (type);
        }
        if (id !== undefined) {
            request['id'] = id;
            const response = await this.privatePutOrdersId (this.extend (request, params));
            return this.parseOrder (response);
        } else if ('clientOrderId' in params) {
            request['cid'] = this.safeInteger (params, 'clientOrderId');
            const response = await this.privatePutOrdersByClientIdCid (this.extend (request, params));
            return this.parseOrder (response);
        } else {
            throw new ArgumentsRequired (this.id + ' editOrder requires an `id` argument or `clientOrderId` value in params ');
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (id !== undefined) {
            request['id'] = parseInt (id);
            return await this.privateDeleteOrdersId (this.extend (request, params));
        } else if ('clientOrderId' in params) {
            request['cid'] = this.safeInteger (params, 'clientOrderId');
            return await this.privateDeleteOrdersByClientIdCid (this.extend (request, params));
        } else {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires an `id` argument or `clientOrderId` value in params ');
        }
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (id !== undefined) {
            request['id'] = parseInt (id);
            const response = await this.privateGetOrdersId (this.extend (request, params));
            return this.parseOrder (response);
        } else if ('clientOrderId' in params) {
            request['cid'] = this.safeInteger (params, 'clientOrderId');
            const response = await this.privateGetOrdersByClientIdCid (this.extend (request, params));
            return this.parseOrder (response);
        } else {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires an `id` argument or `clientOrderId` value in params ');
        }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            if (!(symbol in this.markets)) {
                throw new ExchangeError (this.id + ' has no symbol ' + symbol);
            }
        }
        const request = { 'active': true };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            response = await this.privateGetOrdersSymbol (this.extend (request, params));
        } else {
            response = await this.privateGetOrders (this.extend (request, params));
        }
        return this.parseOrders (this.safeValue (response, 'items'), market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { 'active': false };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            response = await this.privateGetOrdersSymbol (this.extend (request, params));
        } else {
            response = await this.privateGetOrders (this.extend (request, params));
        }
        return this.parseOrders (this.safeValue (response, 'items'), market, since, limit);
    }

    parseOrder (order, market = undefined) {
        const side = this.safeStringLower (order, 'side');
        const open = this.safeValue (order, 'active');
        let status = undefined;
        if (open) {
            status = 'open';
        } else {
            status = 'closed';
        }
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'pairName');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const orderType = this.safeStringLower (order, 'type');
        const timestamp = this.safeInteger (order, 'created');
        const id = this.safeString (order, 'id');
        let lastTradeTimestamp = undefined;
        if (order.amount < order.originalAmount) {
            lastTradeTimestamp = timestamp;
        }
        const originalAmount = this.safeFloat (order, 'originalAmount');
        const amount = this.safeFloat (order, 'amount');
        const filled = originalAmount - amount;
        const resultOrder = {
            'info': order,
            'id': id,
            'clientOrderId': order['cid'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'average': undefined,
            'amount': originalAmount,
            'remaining': amount,
            'filled': filled,
            'status': status,
            'fee': undefined,
            'cost': undefined,
            'trades': undefined,
            'hidden': this.safeValue (order, 'hidden'),
        };
        if (('limitPrice' in order) && (orderType === 'limit' || orderType === 'stop_limit')) {
            resultOrder['price'] = this.safeFloat (order, 'limitPrice');
        }
        if ('stopPrice' in order) {
            resultOrder['stopPrice'] = this.safeFloat (order, 'stopPrice');
        }
        if ('trailingPrice' in order) {
            resultOrder['trailingPrice'] = this.safeFloat (order, 'trailingPrice');
        }
        if ('futurePrice' in order) {
            resultOrder['futurePrice'] = this.safeFloat (order, 'futurePrice');
        }
        if ('distance' in order) {
            resultOrder['distance'] = this.safeFloat (order, 'distance');
        }
        return resultOrder;
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': this.currencyId (code),
        };
        const response = await this.privatePostWalletsCurrencyAddress (this.extend (request, params));
        const address = this.safeValue (response, 'address');
        const tag = this.safeValue (response, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': code,
            'formatted': true,
        };
        const response = await this.privateGetWalletsCurrencyAddress (this.extend (request, params));
        const address = this.safeValue (response, 'address');
        const tag = this.safeValue (response, 'tag');
        this.checkAddress (address);
        return {
            'currency': this.currencyId (code),
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
            response = await this.privateGetWalletsCurrencyDeposits (this.extend (request, params));
        } else {
            response = await this.privateGetDeposits (this.extend (request, params));
        }
        const deposits = this.safeValue (response, 'items');
        for (let i = 0; i < deposits.length; ++i) {
            const entry = deposits[i];
            entry['type'] = 'DEPOSIT';
        }
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
            response = await this.privateGetWalletsCurrencyWithdrawals (this.extend (request, params));
        } else {
            response = await this.privateGetWithdrawals (this.extend (request, params));
        }
        const withdrawals = this.safeValue (response, 'items');
        for (let i = 0; i < withdrawals.length; ++i) {
            const entry = withdrawals[i];
            entry['type'] = 'WITHDRAWAL';
        }
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const updated = this.safeInteger (transaction, 'updated');
        const currencyId = this.safeString (transaction, 'currencyCode');
        const code = this.safeCurrencyCode (currencyId, currency);
        const type = this.safeStringLower (transaction, 'type'); // DEPOSIT or WITHDRAWAL
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'walletId'), // todo: this is actually the tag for XRP transfers (the address is missing)
            'tag': undefined, // refix it properly for the tag from description
            'type': type,
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': {
                'currency': code,
                'cost': feeCost,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'PROCESSED': 'pending',
            'CANCELED': 'canceled',
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        let destination = address;
        if (tag !== undefined) {
            destination = address + ':' + tag;
        }
        const fee = currency.fee;
        const request = {
            'amount': amount,
            'fee': fee,
            'currencyCode': currency['id'],
            'destination': destination,
        };
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + request;
        if (method === 'GET' || method === 'DELETE') {
            const queryStr = this.urlencode (query);
            if (queryStr !== '') {
                url += '?' + queryStr;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const urlPath = this.options['paths'][api] + request;
            let requestBody = '';
            if (method !== 'GET' && method !== 'DELETE') {
                body = this.json (query);
                requestBody = body;
            }
            let payload = '/api' + urlPath + nonce + requestBody;
            payload = this.encode (payload);
            const secret = this.encode (this.secret);
            const signature = this.hmac (payload, secret, 'sha384').toUpperCase ();
            const contentType = 'application/json; charset=UTF-8';
            headers = {
                'Content-Type': contentType,
                'nominex-nonce': nonce,
                'nominex-apikey': this.apiKey,
                'nominex-signature': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            if (body[0] === '{') {
                const feedback = this.id + ' ' + body;
                if ('code' in response) {
                    const code = this.safeString (response, 'code');
                    this.throwExactlyMatchedException (this.exceptions, code, feedback);
                }
                if ('codes' in response) {
                    const codes = this.safeString (response, 'codes');
                    const code = this.asString (codes[0]);
                    this.throwExactlyMatchedException (this.exceptions, code, feedback);
                }
                throw new ExchangeError (feedback); // unknown message
            } else if (body[0] === '[') {
                const feedback = this.id + ' ' + body;
                const error = response[0];
                const code = this.safeString (error, 'code');
                this.throwExactlyMatchedException (this.exceptions, code, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
