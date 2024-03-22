'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeNotAvailable, PermissionDenied, RateLimitExceeded, InvalidAddress, ArgumentsRequired, ExchangeError, InsufficientFunds, BadRequest, OrderNotFound, BadSymbol } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class cryptomarket extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptomarket',
            'name': 'CryptoMarket',
            'countries': [ 'AR', 'BR', 'CL', 'CO', 'PR' ],
            // rateLimit = 1000ms / 20 = 50
            'rateLimit': 50,
            'version': 'v3',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledOrders': 'emulated',
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPositionMode': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactionFee': true,
                'fetchTransactionFees': false,
                'fetchTransfer': true,
                'fetchTransfers': true,
                'fetchWithdrawAddressesByNetwork': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'urls': {
                // TODO: add logo url
                'logo': '',
                'api': {
                    'rest': 'https://api.exchange.cryptomkt.com/api/3/',
                },
                'www': 'https://www.cryptomkt.com',
                'doc': 'https://api.exchange.cryptomkt.com',
                'fees': 'https://www.cryptomkt.com/tarifas',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'public/currency',
                        'public/currency/{currency}',
                        'public/symbol',
                        'public/symbol/{symbol}',
                        'public/ticker',
                        'public/ticker/{symbol}',
                        'public/price/rate',
                        'public/price/history',
                        'public/price/ticker',
                        'public/price/ticker/{symbol}',
                        'public/trades',
                        'public/trades/{symbol}',
                        'public/orderbook',
                        'public/orderbook/{symbol}',
                        'public/candles',
                        'public/candles/{symbol}',
                        'public/converted/candles',
                        'public/converted/candles/{symbol}',
                    ],
                },
                'private': {
                    'get': [
                        'spot/balance',
                        'spot/balance/{currency}',
                        'spot/order',
                        'spot/order/{client_order_id}',
                        'spot/fee',
                        'spot/fee/{symbol}',
                        'spot/history/order',
                        'spot/history/trade',
                        'wallet/balance',
                        'wallet/balance/{currency}',
                        'wallet/crypto/address',
                        'wallet/crypto/address/recent-deposit',
                        'wallet/crypto/address/recent-withdraw',
                        'wallet/crypto/address/check-mine',
                        'wallet/transactions',
                        'wallet/transactions/{id}',
                        'wallet/crypto/fee/estimate',
                        'wallet/amount-locks',
                        'sub-account',
                        'sub-account/acl',
                        'sub-account/balance/{sub_acc_id}',
                        'sub-account/crypto/address/{sub_acc_id}/{currency}',
                    ],
                    'post': [
                        'spot/order',
                        'spot/order/list',
                        'wallet/convert',
                        'wallet/transfer',
                        'wallet/internal/withdraw',
                        'wallet/crypto/address',
                        'wallet/crypto/withdraw',
                        'wallet/crypto/check-offchain-available',
                        'wallet/crypto/fees/estimate',
                        'sub-account/freeze',
                        'sub-account/activate',
                        'sub-account/transfer',
                        'sub-account/acl',
                    ],
                    'patch': [
                        'spot/order/{client_order_id}',
                    ],
                    'put': [
                        'wallet/crypto/withdraw/{id}',
                    ],
                    'delete': [
                        'spot/order',
                        'spot/order/{client_order_id}',
                        'wallet/crypto/withdraw/{id}',
                    ],
                },
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'accountsByType': {
                'funding': 'wallet',
                'spot': 'spot',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('100'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0006') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('100'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0004') ],
                        ],
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'recvWindow': undefined,
            },
            'exceptions': {
                'exact': {
                    '400': ExchangeError, //  400  Bad request The request contains values that cannot be processed.
                    '429': RateLimitExceeded, //  429  Too many requests Action is being rate limited for the account.
                    '500': ExchangeError, //  500  Internal Server Error The request cannot be fulfilled at the moment. Try submitting the request later.
                    '503': ExchangeNotAvailable, //  503  Service Unavailable Try sending the request again later.
                    '504': ExchangeError, //  504  Gateway Timeout Check the result of a request later.
                    '600': PermissionDenied, //  400  Action not allowed Operation is not permitted. See the message field for more information.
                    '602': ExchangeError, //  400  Payout blacklisted Impossible to make a payout.
                    '604': ExchangeError, //  400  Payout amount bigger than locked amount Provide a smaller payout amount.
                    '800': ExchangeError, //  404  Resource Not Found Check the submitted parameters to ensure they were entered correctly.
                    '1002': AuthenticationError, //  401  Authorization required or has been failed Check that authorization data were provided.
                    '1003': PermissionDenied, //  403  Action forbidden for this API key Check permissions for API key, whitelists, or any security feature that might block this request.
                    '1004': ExchangeError, //  401  Unsupported authorization method Use a valid authentication method.
                    '1005': AuthenticationError, //  401  Authorization is invalid The device has not been recognized. Use a valid authorization token.
                    '1006': ExchangeError, //  400  Should upgrade scopes Check permission scopes.
                    '2001': BadSymbol, //  400  Symbol not found The symbol code does not exist. Use GET /api/3/public/symbol to get the list of all available symbols.
                    '2002': BadRequest, //  400  Currency not found The currency code does not exist or is not enabled on a platform. See the message field for more information.
                    '2003': BadRequest, //  400  Unknown channel The channel name value is incorrect.
                    '2010': BadRequest, //  400  Quantity not a valid number Quantity value has to be a positive number.
                    '2011': BadRequest, //  400  Quantity too low Quantity value has to be more than or equal to the quantity_increment parameter value of a symbol.
                    '2012': BadRequest, //  400  Bad quantity Pass the quantity value that can be divided by the quantity_increment value of the selected symbol with no remainder.
                    '2020': BadRequest, //  400  Price not a valid number Price value has to be a positive number no less than the tick_size value of the selected symbol.
                    '2022': BadRequest, //  400  Bad price Pass the price value that can be divided by the tick_size value of the selected symbol with no remainder.
                    '10001': BadRequest, //  400  Validation error Input is not valid or the number of orders in an order list is incorrect. See the message field for more information.
                    '10021': BadRequest, //  400  User disabled Either a wrong input format or a sub account is frozen or disabled.
                    '20001': InsufficientFunds, //  400  Insufficient funds Insufficient funds for creating an order, placing an order list, or any account operations. Check that the funds are sufficient, given commissions.
                    '20002': OrderNotFound, //  400  Order not found Attempt to get an active order that does not exist or is filled, canceled, expired. Attempt to cancel a non-existing order. Attempt to cancel an already filled or expired order.
                    '20003': BadRequest, //  400  Limit exceeded Pass a lower limit value. See the message field for more information.
                    '20004': BadRequest, //  400  Transaction not found Requested transaction was not found.
                    '20005': BadRequest, //  400  Payout not found Check the submitted parameters.
                    '20006': BadRequest, //  400  Payout already committed Operation cannot be performed since the payout has already been committed.
                    '20007': BadRequest, //  400  Payout already rolled back Operation cannot be performed since the payout has already been rolled back.
                    '20008': BadRequest, //  400  Duplicate clientOrderId An order with the submitted ID already exists.
                    '20009': BadRequest, //  400  Price and quantity not changed The order has not been changed. Enter a new price/quantity to fix the error.
                    '20010': ExchangeNotAvailable, //  400  Exchange temporary closed Exchange market is temporary closed on the symbol.
                    '20011': InvalidAddress, //  400  Payout address is invalid Check the payout address format.
                    '20012': InvalidAddress, //  400  Payout payment address is invalid Check the payment ID format.
                    '20014': InvalidAddress, //  400  Payout offchain unavailable Address does not belong to exchange, belongs to the same user, or is unavailable for currency.
                    '20016': BadRequest, //  400  Payout fee level invalid Submit a valid fee value.
                    '20044': ExchangeError, //  400  Trading operation not allowed Platform is unavailable.
                    '20045': ExchangeError, //  400  Fat finger limit exceeded Order price differs from the market price more than for 10% (for stopLimit and takeProfitLimit orders, the restriction is also applied to the difference between the stop price and the limit price). Fix the value and re-submit the request.
                    '20080': ExchangeError, //  400  Internal order execution deadline exceeded Order was not placed.
                    '21001': ExchangeError, //  404  Cannot find sub account A sub account with the specified ID cannot be found in the system.
                    '21003': ExchangeError, //  400  Sub account is already frozen Operation cannot be performed since the sub account has already been frozen.
                    '21004': ExchangeError, //  400  Sub account is already frozen or disabled Operation cannot be performed since the sub account has already been frozen or disabled.
                    '22000': ExchangeError, //  404  Payment icon is not found Check whether the payment method icon with the passed parameters exist.
                    '22002': ExchangeError, //  400  Icon already set for payment type Impossible to set a new payment method icon until the existing one is unset.
                    '22003': ExchangeError, //  404  User does not have a bank account The user cannot commit operations requiring a bank account.
                    '22004': ExchangeError, //  404  User is not found Check if the functionality is accessable.
                    '22005': BadRequest, //  400  Source amount is less than minimum Pass a larger source amount.
                    '22006': BadRequest, //  400  Source amount is more than maximum Pass a smaller source amount.
                    '22007': ExchangeError, //  400  Currency is disabled Impossible to perform the request with the passed currency value.
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPublicSymbol (params);
        //
        // {
        //     "ETHBTC": {
        //         "type": "spot",
        //         "base_currency": "ETH",
        //         "quote_currency": "BTC",
        //         "status": "working",
        //         "quantity_increment": "0.001",
        //         "tick_size": "0.000001",
        //         "take_rate": "0.001",
        //         "make_rate": "-0.0001",
        //         "fee_currency": "BTC"
        //     }
        // }
        //
        const keys = Object.keys (response);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = response[id];
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const maker = this.safeNumber (market, 'make_rate');
            const taker = this.safeNumber (market, 'take_rate');
            const type = this.safeString (market, 'type');
            const precisionPrice = this.parseNumber (this.parsePrecision (this.safeString (market, 'tick_size')));
            const precisionAmount = this.parseNumber (this.parsePrecision (this.safeString (market, 'quantity_increment')));
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'darkpool': undefined,
                'altname': undefined,
                'type': type,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': taker,
                'maker': maker,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': precisionAmount,
                    'price': precisionPrice,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': precisionPrice,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': response,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetPublicCurrency (params);
        //
        //  {
        //    "BTC": {
        //        "full_name": "Bitcoin TST",
        //        "crypto":true,
        //        "payin_enabled": true,
        //        "payout_enabled": true,
        //        "transfer_enabled": true,
        //        "precision_transfer": "0.00000001",
        //        "networks": [{
        //            "network": "BTC",
        //            "protocol": "OMNI",
        //            "default": true,
        //            "payin_enabled": true,
        //            "payout_enabled": true,
        //            "precision_payout": "0.00000001",
        //            "payout_fee": "0.000725840000",
        //            "payout_is_payment_id": false,
        //            "payin_payment_id": false,
        //            "payin_confirmations": 3
        //        }]
        //    }
        //  }
        //
        const keys = Object.keys (response);
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const code = this.safeCurrencyCode (key);
            const currency = response[key];
            const name = this.safeString (currency, 'full_name');
            const withdrawEnabled = this.safeValue (currency, 'payout_enabled');
            const depositEnabled = this.safeValue (currency, 'payin_enabled');
            const active = withdrawEnabled && depositEnabled;
            result[code] = {
                'id': key,
                'code': code,
                'name': name,
                'active': active,
                'fee': undefined,
                'precision': undefined,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
                'networks': {},
                'info': response, // the original payload
            };
        }
        return result;
    }

    parseNetwork (network, market = undefined) {
        // {
        //     "code": "ETHTEST",
        //     "network_name": "ETHTEST",
        //     "network": "ETHTEST",
        //     "protocol": "",
        //     "default": true,
        //     "is_ens_available": true,
        //     "payin_enabled": true,
        //     "payout_enabled": true,
        //     "precision_payout": "0.000000000000000001",
        //     "payout_fee": "0.000000000000",
        //     "payout_is_payment_id": false,
        //     "payin_payment_id": false,
        //     "payin_confirmations": 2,
        //     "is_multichain": false
        // }
        const id = this.safeString (network, 'code');
        const networkName = this.safeString (network, 'network_name');
        const networkCode = this.safeStringUper (network, 'network');
        const withdrawEnabled = this.safeValue (network, 'payout_enabled');
        const depositEnabled = this.safeValue (network, 'payin_enabled');
        const active = withdrawEnabled && depositEnabled;
        const fee = this.safeNumber (network, 'payout_fee');
        const precision = this.parseNumber (this.parsePrecision (this.safeString (network, 'precision_payout')));
        return {
            'id': id,
            'network': networkCode,
            'name': networkName,
            'active': active,
            'fee': fee,
            'precision': precision,
            'deposit': depositEnabled,
            'withdraw': withdrawEnabled,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': network,
        };
    }

    parseTrade (trade, market = undefined) {
        // public trade
        //  {
        //      "id":3495,
        //      "price":"0.027668",
        //      "qty":"0.069",
        //      "side":"buy",
        //      "timestamp":"2021-06-24T12:54:32.843Z"
        //  }
        // user trade
        // {
        //     id: '2005839772',
        //     order_id: '1019802231069',
        //     client_order_id: '1fa61f654b464dc5839aa01dfeecd996',
        //     symbol: 'BTCUSDT',
        //     side: 'buy',
        //     quantity: '0.00019',
        //     price: '17010.86',
        //     fee: '0.002908857060',
        //     timestamp: '2022-12-12T16:06:59.909Z',
        //     taker: true
        //   }
        const id = this.safeString (trade, 'id');
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const datetime = this.iso8601 (timestamp);
        let symbol = undefined;
        let currency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            const feeCurrencyId = this.safeString (market['info'], 'fee_currency');
            currency = this.safeCurrencyCode (feeCurrencyId);
        }
        const feeCost = this.safeString (trade, 'fee');
        const side = this.safeString (trade, 'side');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString2 (trade, 'qty', 'quantity');
        const taker = this.safeValue (trade, 'taker');
        let takerOrMaker = undefined;
        if (taker !== undefined) {
            if (taker) {
                takerOrMaker = 'taker';
            } else {
                takerOrMaker = 'maker';
            }
        }
        const order = this.safeString (trade, 'order_id');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': order,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': {
                'cost': feeCost,
                'currency': currency,
                'rate': undefined,
            },
        });
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request = this.extend (request, {
                'from': since,
            });
        }
        if (limit !== undefined) {
            request = this.extend (request, {
                'limit': limit,
            });
        }
        const response = await this.publicGetPublicTradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        // {
        //     "ask": "0.050043",
        //     "bid": "0.050042",
        //     "last": "0.050042",
        //     "low": "0.047052",
        //     "high": "0.051679",
        //     "open": "0.047800",
        //     "volume": "36456.720",
        //     "volume_quote": "1782.625000",
        //     "timestamp": "2021-06-12T14:57:19.999Z"
        // }
        const symbol = market['symbol'];
        const timestamp = this.parse8601 (this.safeString (ticker, 'timestamp'));
        const datetime = this.iso8601 (timestamp);
        const ask = this.safeNumber (ticker, 'ask');
        const bid = this.safeNumber (ticker, 'bid');
        const last = this.safeNumber (ticker, 'last');
        const low = this.safeNumber (ticker, 'low');
        const high = this.safeNumber (ticker, 'high');
        const open = this.safeNumber (ticker, 'open');
        const baseVolume = this.safeNumber (ticker, 'volume');
        const quoteVolume = this.safeNumber (ticker, 'volume_quote');
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPublicTickerSymbol (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['symbols'] = marketIds.join (',');
        }
        const response = await this.publicGetPublicTicker (this.extend (request, params));
        return this.parseTickers (response, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // {
        //     "timestamp": "2021-06-11T11:30:38.597950917Z",
        //     "ask": [
        //       [
        //         "9779.68", // Price
        //         "2.497"    // Quantity
        //       ]
        //     ], ...
        //     "bid": [
        //       [
        //         "9779.67",
        //         "0.03719"
        //       ], ...
        //     ]
        // }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request = this.extend (request, {
                'depth': limit,
            });
        }
        const response = await this.publicGetPublicOrderbookSymbol (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (response, 'timestamp'));
        return this.parseOrderBook (response, market['symbol'], timestamp, 'bid', 'ask');
    }

    parseOHLCV (ohlcv, market = undefined) {
        // {
        //     "timestamp": "2021-07-01T20:00:00.000Z",
        //     "open": "0.063420",
        //     "close": "0.063767",
        //     "min": "0.063403",
        //     "max": "0.063782",
        //     "volume": "866.6776",
        //     "volume_quote": "55.2132903904"
        // }
        const timestamp = this.parse8601 (this.safeString (ohlcv, 'timestamp'));
        return [
            timestamp,
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'max'),
            this.safeNumber (ohlcv, 'min'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        // [
        //     {
        //         "timestamp": "2021-06-20T20:00:00.000Z",
        //         "open": "0.050459",
        //         "close": "0.050087",
        //         "min": "0.050000",
        //         "max": "0.050511",
        //         "volume": "1326.628",
        //         "volume_quote": "66.555987736"
        //     },
        //     {
        //         "timestamp": "2021-06-20T20:30:00.000Z",
        //         "open": "0.050108",
        //         "close": "0.050139",
        //         "min": "0.050068",
        //         "max": "0.050223",
        //         "volume": "87.515",
        //         "volume_quote": "4.386062831"
        //     }
        // ]
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request = this.extend (request, {
                'from': since,
            });
        }
        if (limit !== undefined) {
            request = this.extend (request, {
                'limit': limit,
            });
        }
        const response = await this.publicGetPublicCandlesSymbol (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const curerncy = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (curerncy);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'reserved');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        // [
        //     {
        //         "currency": "ETH",
        //         "available": "10.000000000",
        //         "reserved": "0.56"
        //     },
        //     {
        //         "currency": "BTC",
        //         "available": "0.010205869",
        //         "reserved": "0"
        //     }
        // ]
        const response = await this.privateGetSpotBalance (params);
        const balances = this.parseBalance (response);
        return balances;
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'canceled',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'state': 'filled',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'suspended': 'open',
            'partiallyFilled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'expired': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "id": 828680665,
        //     "client_order_id": "f4307c6e507e49019907c917b6d7a084",
        //     "symbol": "ETHBTC",
        //     "side": "sell",
        //     "status": "partiallyFilled",
        //     "type": "limit",
        //     "time_in_force": "GTC",
        //     "quantity": "13.942",
        //     "price": "0.011384",
        //     "quantity_cumulative": "5.240",
        //     "created_at": "2021-06-16T14:18:47.321Z",
        //     "updated_at": "2021-06-16T14:18:47.321Z",
        //     "post_only": false,
        //     "trades": [
        //         {
        //             "id": 1361171432,
        //             "quantity": "5.240",
        //             "price": "0.011384",
        //             "fee": "0.001237803000",
        //             "taker": true,
        //             "timestamp": "2021-06-16T14:18:47.321Z"
        //         }
        //     ]
        // }
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'client_order_id');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const datetime = this.iso8601 (timestamp);
        const lastTradeTimestamp = this.safeString (order, 'updated_at');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const type = this.safeString (order, 'type');
        const timeInForce = this.safeString (order, 'time_in_force');
        const side = this.safeString (order, 'side');
        const price = this.safeNumber (order, 'price');
        const stopPrice = this.safeNumber (order, 'stop_price');
        const postOnly = this.safeValue (order, 'post_only');
        const amount = this.safeNumber (order, 'quantity');
        const filled = this.safeNumber (order, 'quantity_cumulative');
        const trades = this.safeValue (order, 'trades', []);
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': datetime,
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'trades': trades,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'symbol': marketId,
            'type': type,
            'quantity': amount,
            'side': side,
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this.privatePostSpotOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'client_order_id': id,
        };
        const response = await this.privateDeleteSpotOrderClientOrderId (request);
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            await this.loadMarkets ();
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateDeleteSpotOrder (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'client_order_id': id,
        };
        const response = await this.privateGetSpotOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const market = this.market (symbol);
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetSpotOrder (request);
        return this.parseOrders (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request = this.extend (request, {
                'symbol': market['id'],
            });
        }
        if (since !== undefined) {
            request = this.extend (request, {
                'from': since,
            });
        }
        if (limit !== undefined) {
            request = this.extend (request, {
                'limit': limit,
            });
        }
        const response = await this.privateGetSpotHistoryOrder (this.extend (request, params));
        return this.parseOrders (response);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'CREATED': 'pending',
            'PENDING': 'pending',
            'FAILED': 'failed',
            'SUCCESS': 'ok',
            'ROLLED_BACK': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        // {
        //     "id": 36896428,
        //     "created_at": "2020-11-12T10:27:26.135Z",
        //     "updated_at": "2020-11-12T10:42:29.065Z",
        //     "status": "SUCCESS",
        //     "type": "DEPOSIT",
        //     "subtype": "BLOCKCHAIN",
        //     "native": {
        //         "tx_id": "a271ad64-5f34-4115-a63e-1cb5bbe4f67e",
        //         "index": 429625504,
        //         "currency": "BTC",
        //         "amount": "0.04836614",
        //         "hash": "4d7ae7c9d6fe84405ae167b3f0beacx8c68eb5a9d5189bckeb65d5e306427oe6",
        //         "address": "3E8WKmTJzaTsBc4kvuEJVjPNtak6vQRcRv",
        //         "confirmations": 2,
        //         "senders": [
        //           "0xd959463c3fcb0d2124bb7ac642d6a6573a6c5aba"
        //         ]
        //     }
        // }
        const id = this.safeString (transaction, 'id');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let type = this.safeStringLower (transaction, 'type');
        if (type === 'withdraw') {
            type = 'withdrawal';
        }
        const native = this.safeValue (transaction, 'native');
        const txid = this.safeString (native, 'tx_id');
        // const datetime = this.safeString (transaction, 'created_at');
        // const timestamp = this.parse8601 (datetime);
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const datetime = this.iso8601 (timestamp);
        const updated = this.parse8601 (this.safeString (transaction, 'updated_at'));
        const address = this.safeString (native, 'address');
        const tag = this.safeString (native, 'payment_id');
        const amount = this.safeNumber (native, 'amount');
        const currencyId = this.safeString (native, 'currency');
        const fee = this.safeString (native, 'fee');
        const code = this.safeCurrencyCode (currencyId, currency);
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': datetime,
            'addressFrom': undefined,
            'address': address,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'comment': undefined,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {};
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetSpotHistoryTrade (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'order_id': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchAccounts (params = {}) {
        const response = await this.privateGetSubAccount (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const account = response[i];
            const id = this.safeString (account, 'sub_account_id');
            result.push ({
                'id': id,
                'type': undefined,
                'name': undefined,
                'code': undefined,
                'info': account,
            });
        }
        return result;
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        const request = {
            'client_order_id': id,
        };
        if (amount !== undefined) {
            request['amount'] = amount;
        }
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this.privatePathSpotOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currencies'] = currency['id'];
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWalletTransactions (this.extend (request, params));
        return this.parseTransactions (response, currency);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        // {
        //     "currency":"BTC",
        //     "address":"3E8WKmTJzaTsBc4kvuEJVjPNtak6vQRcRv"
        // }
        const currencyId = this.safeString (depositAddress, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString2 (depositAddress, 'memo', 'payment_id');
        const network_code = this.safeString (depositAddress, 'network_code');
        return {
            'currency': code,
            'network': network_code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const result = this.privateWalletCryptoAddress (request);
        const address = result[0];
        return this.parseDepositAddress (address);
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        const result = this.privateWalletCryptoAddress ();
        return this.parseDepositAddresses (result);
    }

    async fetchDeposit (id, code = undefined, params = {}) {
        const request = {
            'tx_id': id,
        };
        const response = await this.privateGetWalletTransactionsId (request);
        return this.parseTransaction (response);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'types': 'DEPOSIT',
        };
        return this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawal (id, code = undefined, params = {}) {
        const request = {
            'tx_id': id,
        };
        const response = await this.privateGetWalletTransactionsId (request);
        return this.parseTransaction (response);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'types': 'WITHDRAW',
        };
        return this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransfer (id, code = undefined, params = {}) {
        const request = {
            'tx_id': id,
        };
        const response = await this.privateGetWalletTransactionsId (request);
        return this.parseTransaction (response);
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'types': 'TRANSFER',
        };
        return this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'addresss': address,
        };
        if (tag !== undefined) {
            request['payment_id'] = tag;
        }
        const response = await this.privatePostWalletCryptoWithdraw (this.extend (request, params));
        return this.parseTransaction (response, currency);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'source': fromId,
            'destination': toId,
        };
        const response = await this.privatePostWalletTransfer (this.extend (request, params));
        return this.parseTransaction (response, currency);
    }

    parseTradingFee (fee, market = undefined) {
        // {
        //     "symbol": "BTCUSDT",
        //     "take_rate": "0.001",
        //     "make_rate": "-0.0001"
        // }
        const maker = this.safeNumber (fee, 'make_rate');
        const taker = this.safeNumber (fee, 'take_rate');
        const marketId = this.safeString (fee, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'maker': maker,
            'taker': taker,
            'info': fee,
            'symbol': symbol,
        };
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetSpotFeeSymbol (this.extend (request, params));
        return this.parseTradingFee (response, market);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetSpotFee (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const rawFee = response[i];
            const fee = this.parseTradingFee (rawFee);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    async fetchTransactionFee (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const amount = this.safeString (params, 'amount');
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactionFee () requires an amount parameter');
        }
        const request = {
            'currency': currency['id'],
            'amount': amount,
        };
        const response = await this.privateGetWalletCryptoEstimate (this.extend (request, params));
        // {
        //     "fee": "0.000625"
        // }
        const withdrawFees = {};
        withdrawFees[code] = this.safeNumber (response, 'fee');
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = this.implodeParams (path, params);
        let url = this.urls['api']['rest'] + endpoint;
        const query = this.omit (params, this.extractParams (path));
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'cryptomarket/ccxt',
        };
        const urlEncodedParams = this.urlencode (this.keysort (query));
        if (method === 'GET' || method === 'PUT') {
            if (!this.isEmpty (urlEncodedParams)) {
                url += '?' + urlEncodedParams;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let msg = method + '/api/3/' + path;
            if (method === 'GET' || method === 'PUT') {
                if (!this.isEmpty (urlEncodedParams)) {
                    msg += '?';
                }
            }
            msg += urlEncodedParams;
            const timestamp = this.milliseconds ().toString ();
            msg += timestamp;
            if (this.options['recvWindow']) {
                msg += this.options['recvWindow'];
            }
            const signature = this.hmac (this.encode (msg), this.encode (this.secret));
            let signed = this.apiKey + ':' + signature + ':' + timestamp;
            if (this.options['recvWindow']) {
                signed += ':' + this.options['recvWindow'];
            }
            const token = this.stringToBase64 (signed);
            headers['Authorization'] = 'HS256 ' + this.decode (token);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
