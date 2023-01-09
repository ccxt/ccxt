'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, PermissionDenied, ExchangeError, ExchangeNotAvailable, OrderNotFound, InsufficientFunds, InvalidOrder, RequestTimeout, AuthenticationError } = require ('./base/errors');
const { TRUNCATE, TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class hitbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc',
            'name': 'HitBTC',
            'countries': [ 'HK' ],
            // 300 requests per second => 1000ms / 300 = 3.333ms between requests on average (Trading)
            // 100 requests per second => ( 1000ms / rateLimit ) / 100 => cost = 3.0003 (Market Data)
            // 20 requests per second => ( 1000ms / rateLimit ) / 20 => cost = 15.0015 (Other Requests)
            'rateLimit': 3.333,
            'version': '2',
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': undefined,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': undefined,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactions': true,
                'fetchWithdrawals': undefined,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30', // default
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'test': {
                    'public': 'https://api.demo.hitbtc.com',
                    'private': 'https://api.demo.hitbtc.com',
                },
                'api': {
                    'public': 'https://api.hitbtc.com',
                    'private': 'https://api.hitbtc.com',
                },
                'www': 'https://hitbtc.com',
                'referral': 'https://hitbtc.com/?ref_id=5a5d39a65d466',
                'doc': [
                    'https://api.hitbtc.com/v2',
                ],
                'fees': [
                    'https://hitbtc.com/fees-and-limits',
                    'https://support.hitbtc.com/hc/en-us/articles/115005148605-Fees-and-limits',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'currency': 3, // Available Currencies
                        'currency/{currency}': 3, // Get currency info
                        'symbol': 3, // Available Currency Symbols
                        'symbol/{symbol}': 3, // Get symbol info
                        'ticker': 3, // Ticker list for all symbols
                        'ticker/{symbol}': 3, // Ticker for symbol
                        'trades': 3,
                        'trades/{symbol}': 3, // Trades
                        'orderbook': 3,
                        'orderbook/{symbol}': 3, // Orderbook
                        'candles': 3,
                        'candles/{symbol}': 3, // Candles
                    },
                },
                'private': {
                    'get': {
                        'trading/balance': 15.0015, // Get trading balance
                        'order': 15.0015, // List your current open orders
                        'order/{clientOrderId}': 15.0015, // Get a single order by clientOrderId
                        'trading/fee/all': 15.0015, // Get trading fee rate
                        'trading/fee/{symbol}': 15.0015, // Get trading fee rate
                        'margin/account': 15.0015,
                        'margin/account/{symbol}': 15.0015,
                        'margin/position': 15.0015,
                        'margin/position/{symbol}': 15.0015,
                        'margin/order': 15.0015,
                        'margin/order/{clientOrderId}': 15.0015,
                        'history/order': 15.0015, // Get historical orders
                        'history/trades': 15.0015, // Get historical trades
                        'history/order/{orderId}/trades': 15.0015, // Get historical trades by specified order
                        'account/balance': 15.0015, // Get main acccount balance
                        'account/crypto/address/{currency}': 15.0015, // Get current address
                        'account/crypto/addresses/{currency}': 15.0015, // Get last 10 deposit addresses for currency
                        'account/crypto/used-addresses/{currency}': 15.0015, // Get last 10 unique addresses used for withdraw by currency
                        'account/crypto/estimate-withdraw': 15.0015,
                        'account/crypto/is-mine/{address}': 15.0015,
                        'account/transactions': 15.0015, // Get account transactions
                        'account/transactions/{id}': 15.0015, // Get account transaction by id
                        'sub-acc': 15.0015,
                        'sub-acc/acl': 15.0015,
                        'sub-acc/balance/{subAccountUserID}': 15.0015,
                        'sub-acc/deposit-address/{subAccountUserId}/{currency}': 15.0015,
                    },
                    'post': {
                        'order': 1, // Create new order
                        'margin/order': 1,
                        'account/crypto/address/{currency}': 1, // Create new crypto deposit address
                        'account/crypto/withdraw': 1, // Withdraw crypto
                        'account/crypto/transfer-convert': 1,
                        'account/transfer': 1, // Transfer amount to trading account or to main account
                        'account/transfer/internal': 1,
                        'sub-acc/freeze': 1,
                        'sub-acc/activate': 1,
                        'sub-acc/transfer': 1,
                    },
                    'put': {
                        'order/{clientOrderId}': 1, // Create new order
                        'margin/account/{symbol}': 1,
                        'margin/order/{clientOrderId}': 1,
                        'account/crypto/withdraw/{id}': 1, // Commit crypto withdrawal
                        'sub-acc/acl/{subAccountUserId}': 1,
                    },
                    'delete': {
                        'order': 1, // Cancel all open orders
                        'order/{clientOrderId}': 1, // Cancel order
                        'margin/account': 1,
                        'margin/account/{symbol}': 1,
                        'margin/position': 1,
                        'margin/position/{symbol}': 1,
                        'margin/order': 1,
                        'margin/order/{clientOrderId}': 1,
                        'account/crypto/withdraw/{id}': 1, // Rollback crypto withdrawal
                    },
                    // outdated?
                    'patch': {
                        'order/{clientOrderId}': 1, // Cancel Replace order
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'options': {
                'networks': {
                    'ETH': 'T20',
                    'ERC20': 'T20',
                    'TRX': 'TTRX',
                    'TRC20': 'TTRX',
                    'OMNI': '',
                },
                'defaultTimeInForce': 'FOK',
                'accountsByType': {
                    'funding': 'bank',
                    'spot': 'exchange',
                },
                'fetchBalanceMethod': {
                    'account': 'account',
                    'bank': 'account',
                    'main': 'account',
                    'funding': 'account',
                    'exchange': 'trading',
                    'spot': 'trading',
                    'trade': 'trading',
                    'trading': 'trading',
                },
            },
            'commonCurrencies': {
                'AUTO': 'Cube',
                'BCC': 'BCC', // initial symbol for Bitcoin Cash, now inactive
                'BDP': 'BidiPass',
                'BET': 'DAO.Casino',
                'BIT': 'BitRewards',
                'BOX': 'BOX Token',
                'CPT': 'Cryptaur', // conflict with CPT = Contents Protocol https://github.com/ccxt/ccxt/issues/4920 and https://github.com/ccxt/ccxt/issues/6081
                'GET': 'Themis',
                'GMT': 'GMT Token',
                'HSR': 'HC',
                'IQ': 'IQ.Cash',
                'LNC': 'LinkerCoin',
                'PLA': 'PlayChip',
                'PNT': 'Penta',
                'SBTC': 'Super Bitcoin',
                'STEPN': 'GMT',
                'STX': 'STOX',
                'TV': 'Tokenville',
                'USD': 'USDT',
                'XMT': 'MTL',
                'XPNT': 'PNT',
            },
            'exceptions': {
                '504': RequestTimeout, // {"error":{"code":504,"message":"Gateway Timeout"}}
                '1002': AuthenticationError, // {"error":{"code":1002,"message":"Authorization failed","description":""}}
                '1003': PermissionDenied, // "Action is forbidden for this API key"
                '2010': InvalidOrder, // "Quantity not a valid number"
                '2001': BadSymbol, // "Symbol not found"
                '2011': InvalidOrder, // "Quantity too low"
                '2020': InvalidOrder, // "Price not a valid number"
                '20002': OrderNotFound, // canceling non-existent order
                '20001': InsufficientFunds, // {"error":{"code":20001,"message":"Insufficient funds","description":"Check that the funds are sufficient, given commissions"}}
                '20010': BadSymbol, // {"error":{"code":20010,"message":"Exchange temporary closed","description":"Exchange market for this symbol is temporary closed"}}
                '20045': InvalidOrder, // {"error":{"code":20045,"message":"Fat finger limit exceeded"}}
            },
        });
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, 0.00000001, TICK_SIZE);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name hitbtc#fetchMarkets
         * @description retrieves data on all markets for hitbtc
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetSymbol (params);
        //
        //     [
        //         {
        //             "id":"BCNBTC",
        //             "baseCurrency":"BCN",
        //             "quoteCurrency":"BTC",
        //             "quantityIncrement":"100",
        //             "tickSize":"0.00000000001",
        //             "takeLiquidityRate":"0.002",
        //             "provideLiquidityRate":"0.001",
        //             "feeCurrency":"BTC"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            // bequant fix
            let symbol = base + '/' + quote;
            if (id.indexOf ('_') >= 0) {
                symbol = id;
            }
            const lotString = this.safeString (market, 'quantityIncrement');
            const stepString = this.safeString (market, 'tickSize');
            const lot = this.parseNumber (lotString);
            const step = this.parseNumber (stepString);
            const feeCurrencyId = this.safeString (market, 'feeCurrency');
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'takeLiquidityRate'),
                'maker': this.safeNumber (market, 'provideLiquidityRate'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'feeCurrency': this.safeCurrencyCode (feeCurrencyId),
                'precision': {
                    'amount': lot,
                    'price': step,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': step,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber (Precise.stringMul (lotString, stepString)),
                        'max': undefined,
                    },
                },
                'info': market,
            }));
        }
        return result;
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name hitbtc#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        // account can be "exchange" or "bank", with aliases "main" or "trading" respectively
        await this.loadMarkets ();
        const currency = this.currency (code);
        const requestAmount = this.currencyToPrecision (code, amount);
        const request = {
            'currency': currency['id'],
            'amount': requestAmount,
        };
        let type = this.safeString (params, 'type');
        if (type === undefined) {
            const accountsByType = this.safeValue (this.options, 'accountsByType', {});
            const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
            const toId = this.safeString (accountsByType, toAccount, toAccount);
            if (fromId === toId) {
                throw new ExchangeError (this.id + ' transfer() from and to cannot be the same account');
            }
            type = fromId + 'To' + this.capitalize (toId);
        }
        request['type'] = type;
        const response = await this.privatePostAccountTransfer (this.extend (request, params));
        //
        //     {
        //         'id': '2db6ebab-fb26-4537-9ef8-1a689472d236'
        //     }
        //
        const transfer = this.parseTransfer (response, currency);
        return this.extend (transfer, {
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'amount': this.parseNumber (requestAmount),
        });
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         'id': '2db6ebab-fb26-4537-9ef8-1a689472d236'
        //     }
        //
        const timestamp = this.milliseconds ();
        return {
            'id': this.safeString (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
            'info': transfer,
        };
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name hitbtc#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetCurrency (params);
        //
        //     [
        //         {
        //             "id":"XPNT",
        //             "fullName":"pToken",
        //             "crypto":true,
        //             "payinEnabled":true,
        //             "payinPaymentId":false,
        //             "payinConfirmations":9,
        //             "payoutEnabled":true,
        //             "payoutIsPaymentId":false,
        //             "transferEnabled":true,
        //             "delisted":false,
        //             "payoutFee":"26.510000000000",
        //             "precisionPayout":18,
        //             "precisionTransfer":8
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'id');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const precision = this.safeString (currency, 'precisionTransfer', '8');
            const code = this.safeCurrencyCode (id);
            const payin = this.safeValue (currency, 'payinEnabled');
            const payout = this.safeValue (currency, 'payoutEnabled');
            const transfer = this.safeValue (currency, 'transferEnabled');
            let active = payin && payout && transfer;
            if ('disabled' in currency) {
                if (currency['disabled']) {
                    active = false;
                }
            }
            let type = 'fiat';
            if (('crypto' in currency) && currency['crypto']) {
                type = 'crypto';
            }
            const name = this.safeString (currency, 'fullName');
            result[code] = {
                'id': id,
                'code': code,
                'type': type,
                'payin': payin,
                'payout': payout,
                'transfer': transfer,
                'info': currency,
                'name': name,
                'active': active,
                'deposit': payin,
                'withdraw': payout,
                'fee': this.safeNumber (currency, 'payoutFee'), // todo: redesign
                'precision': this.parseNumber (this.parsePrecision (precision)),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseTradingFee (fee, market = undefined) {
        //
        //
        //     {
        //         takeLiquidityRate: '0.001',
        //         provideLiquidityRate: '-0.0001'
        //     }
        //
        return {
            'info': fee,
            'symbol': this.safeSymbol (undefined, market),
            'maker': this.safeNumber (fee, 'provideLiquidityRate'),
            'taker': this.safeNumber (fee, 'takeLiquidityRate'),
            'percentage': true,
            'tierBased': true,
        };
    }

    async fetchTradingFee (symbol, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetTradingFeeSymbol (request);
        //
        //     {
        //         takeLiquidityRate: '0.001',
        //         provideLiquidityRate: '-0.0001'
        //     }
        //
        return this.parseTradingFee (response, market);
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'reserved');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name hitbtc#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const type = this.safeString (params, 'type', 'trading');
        const fetchBalanceAccounts = this.safeValue (this.options, 'fetchBalanceMethod', {});
        const typeId = this.safeString (fetchBalanceAccounts, type);
        if (typeId === undefined) {
            throw new ExchangeError (this.id + ' fetchBalance() account type must be either main or trading');
        }
        const method = 'privateGet' + this.capitalize (typeId) + 'Balance';
        const query = this.omit (params, 'type');
        const response = await this[method] (query);
        //
        //     [
        //         {"currency":"SPI","available":"0","reserved":"0"},
        //         {"currency":"GRPH","available":"0","reserved":"0"},
        //         {"currency":"DGTX","available":"0","reserved":"0"},
        //     ]
        //
        return this.parseBalance (response);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "timestamp":"2015-08-20T19:01:00.000Z",
        //         "open":"0.006",
        //         "close":"0.006",
        //         "min":"0.006",
        //         "max":"0.006",
        //         "volume":"0.003",
        //         "volumeQuote":"0.000018"
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'timestamp')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'max'),
            this.safeNumber (ohlcv, 'min'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetCandlesSymbol (this.extend (request, params));
        //
        //     [
        //         {"timestamp":"2015-08-20T19:01:00.000Z","open":"0.006","close":"0.006","min":"0.006","max":"0.006","volume":"0.003","volumeQuote":"0.000018"},
        //         {"timestamp":"2015-08-20T19:03:00.000Z","open":"0.006","close":"0.006","min":"0.006","max":"0.006","volume":"0.013","volumeQuote":"0.000078"},
        //         {"timestamp":"2015-08-20T19:06:00.000Z","open":"0.0055","close":"0.005","min":"0.005","max":"0.0055","volume":"0.003","volumeQuote":"0.0000155"},
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 100, 0 = unlimited
        }
        const response = await this.publicGetOrderbookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol'], undefined, 'bid', 'ask', 'price', 'size');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.parse8601 (ticker['timestamp']);
        const symbol = this.safeSymbol (undefined, market);
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString (ticker, 'volumeQuote');
        const open = this.safeString (ticker, 'open');
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
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
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetTicker (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = response[i];
            const marketId = this.safeString (ticker, 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTickerSymbol (this.extend (request, params));
        if ('message' in response) {
            throw new ExchangeError (this.id + ' ' + response['message']);
        }
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        // createMarketOrder
        //
        //  {       fee: "0.0004644",
        //           id:  386394956,
        //        price: "0.4644",
        //     quantity: "1",
        //    timestamp: "2018-10-25T16:41:44.780Z" }
        //
        // fetchTrades
        //
        // { id: 974786185,
        //   price: '0.032462',
        //   quantity: '0.3673',
        //   side: 'buy',
        //   timestamp: '2020-10-16T12:57:39.846Z' }
        //
        // fetchMyTrades
        //
        // { id: 277210397,
        //   clientOrderId: '6e102f3e7f3f4e04aeeb1cdc95592f1a',
        //   orderId: 28102855393,
        //   symbol: 'ETHBTC',
        //   side: 'sell',
        //   quantity: '0.002',
        //   price: '0.073365',
        //   fee: '0.000000147',
        //   timestamp: '2018-04-28T18:39:55.345Z' }
        //
        //  {
        //      "id":1568938909,
        //      "orderId":793293348428,
        //      "clientOrderId":"fbc5c5b753e8476cb14697458cb928ef",
        //      "symbol":"DOGEUSD",
        //      "side":"sell",
        //      "quantity":"100",
        //      "price":"0.03904191",
        //      "fee":"0.009760477500",
        //      "timestamp":"2022-01-25T15:15:41.353Z",
        //      "taker":true
        //  }
        //
        const timestamp = this.parse8601 (trade['timestamp']);
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        if (feeCostString !== undefined) {
            const feeCurrencyCode = market ? market['feeCurrency'] : undefined;
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const orderId = this.safeString (trade, 'clientOrderId');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'quantity');
        const side = this.safeString (trade, 'side');
        const id = this.safeString (trade, 'id');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetAccountTransactions (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // transactions
        //
        //     {
        //         id: 'd53ee9df-89bf-4d09-886e-849f8be64647',
        //         index: 1044718371,
        //         type: 'payout', // payout, payin
        //         status: 'success',
        //         currency: 'ETH',
        //         amount: '4.522683200000000000000000',
        //         createdAt: '2018-06-07T00:43:32.426Z',
        //         updatedAt: '2018-06-07T00:45:36.447Z',
        //         hash: '0x973e5683dfdf80a1fb1e0b96e19085b6489221d2ddf864daa46903c5ec283a0f',
        //         address: '0xC5a59b21948C1d230c8C54f05590000Eb3e1252c',
        //         fee: '0.00958',
        //     },
        //     {
        //         id: 'e6c63331-467e-4922-9edc-019e75d20ba3',
        //         index: 1044714672,
        //         type: 'exchangeToBank', // exchangeToBank, bankToExchange, withdraw
        //         status: 'success',
        //         currency: 'ETH',
        //         amount: '4.532263200000000000',
        //         createdAt: '2018-06-07T00:42:39.543Z',
        //         updatedAt: '2018-06-07T00:42:39.683Z',
        //     },
        //
        // withdraw
        //
        //     {
        //         "id": "d2ce578f-647d-4fa0-b1aa-4a27e5ee597b"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const updated = this.parse8601 (this.safeString (transaction, 'updatedAt'));
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeNumber (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'hash');
        const fee = {
            'currency': undefined,
            'cost': undefined,
            'rate': undefined,
        };
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee['cost'] = feeCost;
            fee['currency'] = code;
        }
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'type': type,
            'currency': code,
            'network': undefined,
            'amount': amount,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': updated,
            'comment': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending',
            'failed': 'failed',
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'payin': 'deposit',
            'payout': 'withdrawal',
            'withdraw': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['sort'] = 'ASC';
            request['from'] = this.iso8601 (since);
        }
        const response = await this.publicGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        // their max accepted length is 32 characters
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        let clientOrderId = parts.join ('');
        clientOrderId = clientOrderId.slice (0, 32);
        amount = parseFloat (amount);
        const request = {
            'clientOrderId': clientOrderId,
            'symbol': market['id'],
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type,
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['timeInForce'] = this.options['defaultTimeInForce'];
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        const order = this.parseOrder (response);
        if (order['status'] === 'rejected') {
            throw new InvalidOrder (this.id + ' order was rejected by the exchange ' + this.json (order));
        }
        return order;
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        // their max accepted length is 32 characters
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        let requestClientId = parts.join ('');
        requestClientId = requestClientId.slice (0, 32);
        const request = {
            'clientOrderId': id,
            'requestClientId': requestClientId,
        };
        if (amount !== undefined) {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePatchOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const request = {
            'clientOrderId': id,
        };
        const response = await this.privateDeleteOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'suspended': 'open',
            'partiallyFilled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'expired': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createMarketOrder
        //
        //     {
        //         clientOrderId: "fe36aa5e190149bf9985fb673bbb2ea0",
        //         createdAt: "2018-10-25T16:41:44.780Z",
        //         cumQuantity: "1",
        //         id: "66799540063",
        //         quantity: "1",
        //         side: "sell",
        //         status: "filled",
        //         symbol: "XRPUSDT",
        //         timeInForce: "FOK",
        //         tradesReport: [
        //             {
        //                 fee: "0.0004644",
        //                 id:  386394956,
        //                 price: "0.4644",
        //                 quantity: "1",
        //                 timestamp: "2018-10-25T16:41:44.780Z"
        //             }
        //         ],
        //         type: "market",
        //         updatedAt: "2018-10-25T16:41:44.780Z"
        //     }
        //
        //     {
        //         "id": 119499457455,
        //         "clientOrderId": "87baab109d58401b9202fa0749cb8288",
        //         "symbol": "ETHUSD",
        //         "side": "buy",
        //         "status": "filled",
        //         "type": "market",
        //         "timeInForce": "FOK",
        //         "quantity": "0.0007",
        //         "price": "181.487",
        //         "avgPrice": "164.989",
        //         "cumQuantity": "0.0007",
        //         "createdAt": "2019-04-17T13:27:38.062Z",
        //         "updatedAt": "2019-04-17T13:27:38.062Z"
        //     }
        //
        const created = this.parse8601 (this.safeString (order, 'createdAt'));
        const updated = this.parse8601 (this.safeString (order, 'updatedAt'));
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const amount = this.safeString (order, 'quantity');
        const filled = this.safeString (order, 'cumQuantity');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const id = this.safeString (order, 'clientOrderId');
        const clientOrderId = id;
        const price = this.safeString (order, 'price');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const trades = this.safeValue (order, 'tradesReport');
        const fee = undefined;
        const average = this.safeString (order, 'avgPrice');
        const timeInForce = this.safeString (order, 'timeInForce');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId, // https://github.com/ccxt/ccxt/issues/5674
            'timestamp': created,
            'datetime': this.iso8601 (created),
            'lastTradeTimestamp': updated,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'average': average,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': undefined,
            'fee': fee,
            'trades': trades,
            'info': order,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by hitbtc fetchOrder
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const request = {
            'clientOrderId': id,
        };
        const response = await this.privateGetHistoryOrder (this.extend (request, params));
        const numOrders = response.length;
        if (numOrders > 0) {
            return this.parseOrder (response[0]);
        }
        throw new OrderNotFound (this.id + ' order ' + id + ' not found');
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOpenOrder
         * @description fetch an open order by it's id
         * @param {string} id order id
         * @param {string|undefined} symbol not used by hitbtc fetchOpenOrder ()
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const request = {
            'clientOrderId': id,
        };
        const response = await this.privateGetOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        const response = await this.privateGetHistoryOrder (this.extend (request, params));
        const parsedOrders = this.parseOrders (response, market);
        const orders = [];
        for (let i = 0; i < parsedOrders.length; i++) {
            const order = parsedOrders[i];
            const status = order['status'];
            if ((status === 'closed') || (status === 'canceled')) {
                orders.push (order);
            }
        }
        return this.filterBySinceLimit (orders, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const request = {
            // 'symbol': 'BTC/USD', // optional
            // 'sort':   'DESC', // or 'ASC'
            // 'by':     'timestamp', // or 'id' String timestamp by default, or id
            // 'from':   'Datetime or Number', // ISO 8601
            // 'till':   'Datetime or Number',
            // 'limit':  100,
            // 'offset': 0,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetHistoryTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": 9535486,
        //             "clientOrderId": "f8dbaab336d44d5ba3ff578098a68454",
        //             "orderId": 816088377,
        //             "symbol": "ETHBTC",
        //             "side": "sell",
        //             "quantity": "0.061",
        //             "price": "0.045487",
        //             "fee": "0.000002775",
        //             "timestamp": "2017-05-17T12:32:57.848Z"
        //         },
        //         {
        //             "id": 9535437,
        //             "clientOrderId": "27b9bfc068b44194b1f453c7af511ed6",
        //             "orderId": 816088021,
        //             "symbol": "ETHBTC",
        //             "side": "buy",
        //             "quantity": "0.038",
        //             "price": "0.046000",
        //             "fee": "-0.000000174",
        //             "timestamp": "2017-05-17T12:30:57.848Z"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        // The id needed here is the exchange's id, and not the clientOrderID,
        // which is the id that is stored in the unified order id
        // To get the exchange's id you need to grab it from order['info']['id']
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetHistoryOrderOrderIdTrades (this.extend (request, params));
        const numOrders = response.length;
        if (numOrders > 0) {
            return this.parseTrades (response, market, since, limit);
        }
        throw new OrderNotFound (this.id + ' order ' + id + ' not found, ' + this.id + '.fetchOrderTrades() requires an exchange-specific order id, you need to grab it from order["info"]["id"]');
    }

    async createDepositAddress (code, params = {}) {
        /**
         * @method
         * @name hitbtc#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostAccountCryptoAddressCurrency (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        const tag = this.safeString (response, 'paymentId');
        return {
            'currency': currency,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const network = this.safeString (params, 'network');
        if (network !== undefined) {
            params = this.omit (params, 'network');
            const networks = this.safeValue (this.options, 'networks');
            const endpart = this.safeString (networks, network, network);
            request['currency'] += endpart;
        }
        const response = await this.privateGetAccountCryptoAddressCurrency (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        const tag = this.safeString (response, 'paymentId');
        return {
            'currency': currency['code'],
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async convertCurrencyNetwork (code, amount, fromNetwork, toNetwork, params) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networks = this.safeValue (this.options, 'networks', {});
        fromNetwork = this.safeString (networks, fromNetwork, fromNetwork); // handle ETH>ERC20 alias
        toNetwork = this.safeString (networks, toNetwork, toNetwork); // handle ETH>ERC20 alias
        if (fromNetwork === toNetwork) {
            throw new ExchangeError (this.id + ' convertCurrencyNetwork() fromNetwork cannot be the same as toNetwork');
        }
        const request = {
            'fromCurrency': currency['id'] + fromNetwork,
            'toCurrency': currency['id'] + toNetwork,
            'amount': parseFloat (this.currencyToPrecision (code, amount)),
        };
        const response = await this.privatePostAccountCryptoTransferConvert (this.extend (request, params));
        return {
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': parseFloat (amount),
            'address': address,
        };
        if (tag) {
            request['paymentId'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['currency'] += network; // when network the currency need to be changed to currency + network
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostAccountCryptoWithdraw (this.extend (request, params));
        //
        //     {
        //         "id": "d2ce578f-647d-4fa0-b1aa-4a27e5ee597b"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/api/' + this.version + '/';
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += api + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
            const payload = this.encode (this.apiKey + ':' + this.secret);
            const auth = this.stringToBase64 (payload);
            headers = {
                'Authorization': 'Basic ' + this.decode (auth),
                'Content-Type': 'application/json',
            };
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            const feedback = this.id + ' ' + body;
            // {"code":504,"message":"Gateway Timeout","description":""}
            if ((code === 503) || (code === 504)) {
                throw new ExchangeNotAvailable (feedback);
            }
            // fallback to default error handler on rate limit errors
            // {"code":429,"message":"Too many requests","description":"Too many requests"}
            if (code === 429) {
                return;
            }
            // {"error":{"code":20002,"message":"Order not found","description":""}}
            if (body[0] === '{') {
                if ('error' in response) {
                    const errorCode = this.safeString (response['error'], 'code');
                    this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
                    const message = this.safeString (response['error'], 'message');
                    if (message === 'Duplicate clientOrderId') {
                        throw new InvalidOrder (feedback);
                    }
                }
            }
            throw new ExchangeError (feedback);
        }
    }
};
