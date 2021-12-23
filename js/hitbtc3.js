const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');
const { BadSymbol, BadRequest, OnMaintenance, AccountSuspended, PermissionDenied, ExchangeError, RateLimitExceeded, ExchangeNotAvailable, OrderNotFound, InsufficientFunds, InvalidOrder, AuthenticationError, ArgumentsRequired } = require ('./base/errors');

module.exports = class hitbtc3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc3',
            'name': 'HitBTC',
            'countries': [ 'HK' ],
            'rateLimit': 100, // TODO: optimize https://api.hitbtc.com/#rate-limiting
            'version': '3',
            'pro': true,
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'withdraw': true,
                'transfer': true,
            },
            'precisionMode': TICK_SIZE,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'test': {
                    'public': 'https://api.demo.hitbtc.com',
                    'private': 'https://api.demo.hitbtc.com',
                },
                'api': {
                    'public': 'https://api.hitbtc.com/api/3',
                    'private': 'https://api.hitbtc.com/api/3',
                },
                'www': 'https://hitbtc.com',
                'referral': 'https://hitbtc.com/?ref_id=5a5d39a65d466',
                'doc': [
                    'https://api.hitbtc.com',
                    'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md',
                ],
                'fees': [
                    'https://hitbtc.com/fees-and-limits',
                    'https://support.hitbtc.com/hc/en-us/articles/115005148605-Fees-and-limits',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'public/currency',
                        'public/symbol',
                        'public/ticker',
                        'public/price/rate',
                        'public/trades',
                        'public/orderbook',
                        'public/candles',
                        'public/futures/info',
                        'public/futures/history/funding',
                        'public/futures/candles/index_price',
                        'public/futures/candles/mark_price',
                        'public/futures/candles/premium_index',
                        'public/futures/candles/open_interest',
                    ],
                },
                'private': {
                    'get': [
                        'spot/balance',
                        'spot/order',
                        'spot/order/{client_order_id}',
                        'spot/fee',
                        'spot/fee/{symbol}',
                        'spot/history/order',
                        'spot/history/trade',
                        'margin/account',
                        'margin/account/isolated/{symbol}',
                        'margin/order',
                        'margin/order/{client_order_id}',
                        'margin/history/order',
                        'margin/history/trade',
                        'futures/balance',
                        'futures/account',
                        'futures/account/isolated/{symbol}',
                        'futures/order',
                        'futures/order/{client_order_id}',
                        'futures/fee',
                        'futures/fee/{symbol}',
                        'futures/history/order',
                        'futures/history/trade',
                        'wallet/balance',
                        'wallet/crypto/address',
                        'wallet/crypto/address/recent-deposit',
                        'wallet/crypto/address/recent-withdraw',
                        'wallet/crypto/address/check-mine',
                        'wallet/transactions',
                        'wallet/crypto/check-offchain-available',
                        'wallet/crypto/fee/estimate',
                        'sub-account',
                        'sub-account/acl',
                        'sub-account/balance/{subAccID}',
                        'sub-account/crypto/address/{subAccID}/{currency}',
                    ],
                    'post': [
                        'spot/order',
                        'margin/order',
                        'futures/order',
                        'wallet/convert',
                        'wallet/crypto/withdraw',
                        'wallet/transfer',
                        'sub-account/freeze',
                        'sub-account/activate',
                        'sub-account/transfer',
                        'sub-account/acl',
                    ],
                    'patch': [
                        'spot/order/{client_order_id}',
                        'margin/order/{client_order_id}',
                        'futures/order/{client_order_id}',
                    ],
                    'delete': [
                        'spot/order',
                        'spot/order/{client_order_id}',
                        'margin/position',
                        'margin/position/isolated/{symbol}',
                        'margin/order',
                        'margin/order/{client_order_id}',
                        'futures/position',
                        'futures/position/isolated/{symbol}',
                        'futures/order',
                        'futures/order/{client_order_id}',
                        'wallet/crypto/withdraw/{id}',
                    ],
                    'put': [
                        'margin/account/isolated/{symbol}',
                        'futures/account/isolated/{symbol}',
                        'wallet/crypto/withdraw/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0009'),
                    'maker': this.parseNumber ('0.0009'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('10'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('100'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('5000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('-0.0001') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('-0.0001') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('10'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('100'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('1000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('5000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0002') ],
                        ],
                    },
                },
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
            'exceptions': {
                'exact': {
                    '429': RateLimitExceeded,
                    '500': ExchangeError,
                    '503': ExchangeNotAvailable,
                    '504': ExchangeNotAvailable,
                    '600': PermissionDenied,
                    '800': ExchangeError,
                    '1002': AuthenticationError,
                    '1003': PermissionDenied,
                    '1004': AuthenticationError,
                    '1005': AuthenticationError,
                    '2001': BadSymbol,
                    '2002': BadRequest,
                    '2003': BadRequest,
                    '2010': BadRequest,
                    '2011': BadRequest,
                    '2012': BadRequest,
                    '2020': BadRequest,
                    '2022': BadRequest,
                    '10001': BadRequest,
                    '10021': AccountSuspended,
                    '10022': BadRequest,
                    '20001': InsufficientFunds,
                    '20002': OrderNotFound,
                    '20003': ExchangeError,
                    '20004': ExchangeError,
                    '20005': ExchangeError,
                    '20006': ExchangeError,
                    '20007': ExchangeError,
                    '20008': InvalidOrder,
                    '20009': InvalidOrder,
                    '20010': OnMaintenance,
                    '20011': ExchangeError,
                    '20012': ExchangeError,
                    '20014': ExchangeError,
                    '20016': ExchangeError,
                    '20031': ExchangeError,
                    '20032': ExchangeError,
                    '20033': ExchangeError,
                    '20034': ExchangeError,
                    '20040': ExchangeError,
                    '20041': ExchangeError,
                    '20042': ExchangeError,
                    '20043': ExchangeError,
                    '20044': PermissionDenied,
                    '20045': ExchangeError,
                    '20080': ExchangeError,
                    '21001': ExchangeError,
                    '21003': AccountSuspended,
                    '21004': AccountSuspended,
                },
                'broad': {},
            },
            'options': {
                'networks': {
                    'ETH': 'USDT20',
                    'ERC20': 'USDT20',
                    'TRX': 'USDTRX',
                    'TRC20': 'USDTRX',
                    'OMNI': 'USDT',
                },
                'accountsByType': {
                    'spot': 'spot',
                    'wallet': 'wallet',
                    'derivatives': 'derivatives',
                },
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPublicSymbol (params);
        //
        //     {
        //         "AAVEUSDT_PERP":{
        //             "type":"futures",
        //             "expiry":null,
        //             "underlying":"AAVE",
        //             "base_currency":null,
        //             "quote_currency":"USDT",
        //             "quantity_increment":"0.01",
        //             "tick_size":"0.001",
        //             "take_rate":"0.0005",
        //             "make_rate":"0.0002",
        //             "fee_currency":"USDT",
        //             "margin_trading":true,
        //             "max_initial_leverage":"50.00"
        //         },
        //         "MANAUSDT":{
        //             "type":"spot",
        //             "base_currency":"MANA",
        //             "quote_currency":"USDT",
        //             "quantity_increment":"1",
        //             "tick_size":"0.0000001",
        //             "take_rate":"0.0025",
        //             "make_rate":"0.001",
        //             "fee_currency":"USDT",
        //             "margin_trading":true,
        //             "max_initial_leverage":"5.00"
        //         },
        //     }
        //
        const result = [];
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeValue (response, id);
            const marketType = this.safeString (market, 'type');
            const expiry = this.safeInteger (market, 'expiry');
            const contract = (marketType === 'futures');
            const derivative = contract;
            const spot = (marketType === 'spot');
            const marginTrading = this.safeValue (market, 'margin_trading', false);
            const margin = spot && marginTrading;
            const future = (expiry !== undefined);
            const swap = (contract && !future);
            const option = false;
            const baseId = this.safeString2 (market, 'base_currency', 'underlying');
            const quoteId = this.safeString (market, 'quote_currency');
            const feeCurrencyId = this.safeString (market, 'fee_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            let settleId = undefined;
            let settle = undefined;
            let symbol = base + '/' + quote;
            let type = 'spot';
            let contractSize = undefined;
            let linear = undefined;
            let inverse = undefined;
            if (contract) {
                contractSize = 1;
                settleId = feeCurrencyId;
                settle = this.safeCurrencyCode (settleId);
                linear = ((quote !== undefined) && (quote === settle));
                inverse = !linear;
                symbol = symbol + ':' + settle;
                if (future) {
                    symbol = symbol + '-' + expiry;
                    type = 'future';
                } else {
                    type = 'swap';
                }
            }
            const lotString = this.safeString (market, 'quantity_increment');
            const stepString = this.safeString (market, 'tick_size');
            const lot = this.parseNumber (lotString);
            const step = this.parseNumber (stepString);
            const taker = this.safeNumber (market, 'take_rate');
            const maker = this.safeNumber (market, 'make_rate');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': margin,
                'swap': swap,
                'future': future,
                'futures': future, // deprecated, use future instead
                'option': option,
                'derivative': derivative,
                'contract': contract,
                'linear': linear,
                'inverse': inverse,
                'taker': taker,
                'maker': maker,
                'contractSize': contractSize,
                'active': true,
                'expiry': expiry,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'feeCurrency': feeCurrency,
                'precision': {
                    'price': step,
                    'amount': lot,
                },
                'limits': {
                    'leverage': {
                        'min': 1,
                        'max': this.safeNumber (market, 'max_initial_leverage', 1),
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
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetPublicCurrency (params);
        //
        //     {
        //       "WEALTH": {
        //         "full_name": "ConnectWealth",
        //         "payin_enabled": false,
        //         "payout_enabled": false,
        //         "transfer_enabled": true,
        //         "precision_transfer": "0.001",
        //         "networks": [
        //           {
        //             "network": "ETH",
        //             "protocol": "ERC20",
        //             "default": true,
        //             "payin_enabled": false,
        //             "payout_enabled": false,
        //             "precision_payout": "0.001",
        //             "payout_fee": "0.016800000000",
        //             "payout_is_payment_id": false,
        //             "payin_payment_id": false,
        //             "payin_confirmations": "2"
        //           }
        //         ]
        //       }
        //     }
        //
        const result = {};
        const currencies = Object.keys (response);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const code = this.safeCurrencyCode (currencyId);
            const entry = response[currencyId];
            const name = this.safeString (entry, 'full_name');
            const precision = this.safeNumber (entry, 'precision_transfer');
            const payinEnabled = this.safeValue (entry, 'payin_enabled', false);
            const payoutEnabled = this.safeValue (entry, 'payout_enabled', false);
            const transferEnabled = this.safeValue (entry, 'transfer_enabled', false);
            const active = payinEnabled && payoutEnabled && transferEnabled;
            const rawNetworks = this.safeValue (entry, 'networks', []);
            const networks = {};
            let fee = undefined;
            for (let j = 0; j < rawNetworks.length; j++) {
                const rawNetwork = rawNetworks[j];
                let networkId = this.safeString (rawNetwork, 'protocol');
                if (networkId.length === 0) {
                    networkId = this.safeString (rawNetwork, 'network');
                }
                const network = this.safeNetwork (networkId);
                fee = this.safeNumber (rawNetwork, 'payout_fee');
                const precision = this.safeNumber (rawNetwork, 'precision_payout');
                const payinEnabledNetwork = this.safeValue (entry, 'payin_enabled', false);
                const payoutEnabledNetwork = this.safeValue (entry, 'payout_enabled', false);
                const transferEnabledNetwork = this.safeValue (entry, 'transfer_enabled', false);
                const active = payinEnabledNetwork && payoutEnabledNetwork && transferEnabledNetwork;
                networks[network] = {
                    'info': rawNetwork,
                    'id': networkId,
                    'network': network,
                    'fee': fee,
                    'active': active,
                    'precision': precision,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            const networksKeys = Object.keys (networks);
            const networksLength = networksKeys.length;
            result[code] = {
                'info': entry,
                'code': code,
                'id': currencyId,
                'precision': precision,
                'name': name,
                'active': active,
                'networks': networks,
                'fee': (networksLength <= 1) ? fee : undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    safeNetwork (networkId) {
        if (networkId === undefined) {
            return undefined;
        } else {
            return networkId.toUpperCase ();
        }
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const network = this.safeStringUpper (params, 'network');
        if ((network !== undefined) && (code === 'USDT')) {
            const networks = this.safeValue (this.options, 'networks');
            const parsedNetwork = this.safeString (networks, network);
            if (parsedNetwork !== undefined) {
                request['currency'] = parsedNetwork;
            }
            params = this.omit (params, 'network');
        }
        const response = await this.privateGetWalletCryptoAddress (this.extend (request, params));
        //
        //  [{"currency":"ETH","address":"0xd0d9aea60c41988c3e68417e2616065617b7afd3"}]
        //
        const firstAddress = this.safeValue (response, 0);
        const address = this.safeString (firstAddress, 'address');
        const currencyId = this.safeString (firstAddress, 'currency');
        const tag = this.safeString (firstAddress, 'payment_id');
        const parsedCode = this.safeCurrencyCode (currencyId);
        return {
            'info': response,
            'address': address,
            'tag': tag,
            'code': parsedCode,
            'network': undefined,
        };
    }

    async fetchBalance (params = {}) {
        const type = this.safeStringLower (params, 'type', 'spot');
        params = this.omit (params, [ 'type' ]);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const account = this.safeString (accountsByType, type);
        let response = undefined;
        if (account === 'wallet') {
            response = await this.privateGetWalletBalance (params);
        } else if (account === 'spot') {
            response = await this.privateGetSpotBalance (params);
        } else if (account === 'derivatives') {
            response = await this.privateGetFuturesBalance (params);
        } else {
            const keys = Object.keys (accountsByType);
            throw new BadRequest (this.id + ' fetchBalance() type parameter must be one of ' + keys.join (', '));
        }
        //
        //     [
        //       {
        //         "currency": "PAXG",
        //         "available": "0",
        //         "reserved": "0",
        //         "reserved_margin": "0",
        //       },
        //       ...
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (entry, 'available');
            account['used'] = this.safeString (entry, 'reserved');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTicker (symbol, params = {}) {
        const response = await this.fetchTickers ([ symbol ], params);
        return this.safeValue (response, symbol);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            const delimited = marketIds.join (',');
            request['symbols'] = delimited;
        }
        const response = await this.publicGetPublicTicker (this.extend (request, params));
        //
        //     {
        //       "BTCUSDT": {
        //         "ask": "63049.06",
        //         "bid": "63046.41",
        //         "last": "63048.36",
        //         "low": "62010.00",
        //         "high": "66657.99",
        //         "open": "64839.75",
        //         "volume": "15272.13278",
        //         "volume_quote": "976312127.6277998",
        //         "timestamp": "2021-10-22T04:25:47.573Z"
        //       }
        //     }
        //
        const result = {};
        const keys = Object.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const entry = response[marketId];
            result[symbol] = this.parseTicker (entry, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //       "ask": "62756.01",
        //       "bid": "62754.09",
        //       "last": "62755.87",
        //       "low": "62010.00",
        //       "high": "66657.99",
        //       "open": "65089.27",
        //       "volume": "16719.50366",
        //       "volume_quote": "1063422878.8156828",
        //       "timestamp": "2021-10-22T07:29:14.585Z"
        //     }
        //
        const timestamp = this.parse8601 (ticker['timestamp']);
        const symbol = this.safeSymbol (undefined, market);
        const baseVolume = this.safeNumber (ticker, 'volume');
        const quoteVolume = this.safeNumber (ticker, 'volume_quote');
        const open = this.safeNumber (ticker, 'open');
        const last = this.safeNumber (ticker, 'last');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            // symbol is optional for hitbtc fetchTrades
            request['symbols'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetPublicTrades (this.extend (request, params));
        const marketIds = Object.keys (response);
        let trades = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.market (marketId);
            const rawTrades = response[marketId];
            const parsed = this.parseTrades (rawTrades, market);
            trades = this.arrayConcat (trades, parsed);
        }
        return trades;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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
            request['since'] = since;
        }
        const response = await this.privateGetSpotHistoryTrade (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
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
        //   qty: '0.3673',
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
        //   timestamp: '2018-04-28T18:39:55.345Z',
        //   taker: true }
        //
        const timestamp = this.parse8601 (trade['timestamp']);
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'fee');
        const taker = this.safeValue (trade, 'taker');
        let takerOrMaker = undefined;
        if (taker !== undefined) {
            takerOrMaker = taker ? 'taker' : 'maker';
        }
        if (feeCost !== undefined) {
            const info = this.safeValue (market, 'info', {});
            const feeCurrency = this.safeString (info, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrency);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const orderId = this.safeString (trade, 'clientOrderId');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString2 (trade, 'quantity', 'qty');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const side = this.safeString (trade, 'side');
        const id = this.safeString (trade, 'id');
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTransactionsHelper (types, code, since, limit, params) {
        await this.loadMarkets ();
        const request = {
            'types': types,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currencies'] = currency['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWalletTransactions (this.extend (request, params));
        //
        //     [
        //       {
        //         "id": "101609495",
        //         "created_at": "2018-03-06T22:05:06.507Z",
        //         "updated_at": "2018-03-06T22:11:45.03Z",
        //         "status": "SUCCESS",
        //         "type": "DEPOSIT",
        //         "subtype": "BLOCKCHAIN",
        //         "native": {
        //           "tx_id": "e20b0965-4024-44d0-b63f-7fb8996a6706",
        //           "index": "881652766",
        //           "currency": "ETH",
        //           "amount": "0.01418088",
        //           "hash": "d95dbbff3f9234114f1211ab0ba2a94f03f394866fd5749d74a1edab80e6c5d3",
        //           "address": "0xd9259302c32c0a0295d86a39185c9e14f6ba0a0d",
        //           "confirmations": "20",
        //           "senders": [
        //             "0x243bec9256c9a3469da22103891465b47583d9f1"
        //           ]
        //         }
        //       }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, params);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'PENDING': 'pending',
            'FAILED': 'failed',
            'SUCCESS': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'DEPOSIT': 'deposit',
            'WITHDRAW': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //       "id": "101609495",
        //       "created_at": "2018-03-06T22:05:06.507Z",
        //       "updated_at": "2018-03-06T22:11:45.03Z",
        //       "status": "SUCCESS",
        //       "type": "DEPOSIT",
        //       "subtype": "BLOCKCHAIN",
        //       "native": {
        //         "tx_id": "e20b0965-4024-44d0-b63f-7fb8996a6706",
        //         "index": "881652766",
        //         "currency": "ETH",
        //         "amount": "0.01418088",
        //         "hash": "d95dbbff3f9234114f1211ab0ba2a94f03f394866fd5749d74a1edab80e6c5d3",
        //         "address": "0xd9259302c32c0a0295d86a39185c9e14f6ba0a0d",
        //         "confirmations": "20",
        //         "senders": [
        //           "0x243bec9256c9a3469da22103891465b47583d9f1"
        //         ]
        //       }
        //     }
        //
        //     {
        //       "id": "102703545",
        //       "created_at": "2018-03-30T21:39:17.854Z",
        //       "updated_at": "2018-03-31T00:23:19.067Z",
        //       "status": "SUCCESS",
        //       "type": "WITHDRAW",
        //       "subtype": "BLOCKCHAIN",
        //       "native": {
        //         "tx_id": "5ecd7a85-ce5d-4d52-a916-b8b755e20926",
        //         "index": "918286359",
        //         "currency": "OMG",
        //         "amount": "2.45",
        //         "fee": "1.22",
        //         "hash": "0x1c621d89e7a0841342d5fb3b3587f60b95351590161e078c4a1daee353da4ca9",
        //         "address": "0x50227da7644cea0a43258a2e2d7444d01b43dcca",
        //         "confirmations": "0"
        //       }
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const updated = this.parse8601 (this.safeString (transaction, 'updated_at'));
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const native = this.safeValue (transaction, 'native');
        const currencyId = this.safeString (native, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const txhash = this.safeString (native, 'hash');
        const address = this.safeString (native, 'address');
        const addressTo = address;
        const tag = this.safeString (native, 'payment_id');
        const tagTo = tag;
        const sender = this.safeValue (native, 'senders');
        const addressFrom = this.safeString (sender, 0);
        const amount = this.safeNumber (native, 'amount');
        let fee = undefined;
        const feeCost = this.safeNumber (native, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'code': code,
                'cost': feeCost,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txhash,
            'code': code,
            'amount': amount,
            'address': address,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': tagTo,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'updated': updated,
            'status': status,
            'type': type,
            'fee': fee,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsHelper ('DEPOSIT,WITHDRAW', code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsHelper ('DEPOSIT', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsHelper ('WITHDRAW', code, since, limit, params);
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['symbols'] = marketIds.join (',');
        }
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetPublicOrderbook (this.extend (request, params));
        const result = {};
        const marketIds = Object.keys (response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const orderbook = response[marketId];
            const symbol = this.safeSymbol (marketId);
            const timestamp = this.parse8601 (this.safeString (orderbook, 'timestamp'));
            result[symbol] = this.parseOrderBook (response[marketId], symbol, timestamp, 'bid', 'ask');
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const result = await this.fetchOrderBooks ([ symbol ], limit, params);
        return result[symbol];
    }

    parseTradingFee (fee, market = undefined) {
        //
        //     {
        //         "symbol":"ARVUSDT", // returned from fetchTradingFees only
        //         "take_rate":"0.0009",
        //         "make_rate":"0.0009"
        //     }
        //
        const taker = this.safeNumber (fee, 'take_rate');
        const maker = this.safeNumber (fee, 'make_rate');
        const marketId = this.safeString (fee, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'taker': taker,
            'maker': maker,
        };
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetSpotFeeSymbol (this.extend (request, params));
        //
        //     {
        //         "take_rate":"0.0009",
        //         "make_rate":"0.0009"
        //     }
        //
        return this.parseTradingFee (response, market);
    }

    async fetchTradingFees (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetSpotFee (params);
        //
        //     [
        //         {
        //             "symbol":"ARVUSDT",
        //             "take_rate":"0.0009",
        //             "make_rate":"0.0009"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const fee = this.parseTradingFee (response[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbols': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPublicCandles (this.extend (request, params));
        //
        //     {
        //       "ETHUSDT": [
        //         {
        //           "timestamp": "2021-10-25T07:38:00.000Z",
        //           "open": "4173.391",
        //           "close": "4170.923",
        //           "min": "4170.923",
        //           "max": "4173.986",
        //           "volume": "0.1879",
        //           "volume_quote": "784.2517846"
        //         }
        //       ]
        //     }
        //
        const ohlcvs = this.safeValue (response, market['id']);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
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
        //         "volume_quote":"0.000018"
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

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
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
        const response = await this.privateGetSpotHistoryOrder (this.extend (request, params));
        const parsed = this.parseOrders (response, market, since, limit);
        return this.filterByArray (parsed, 'status', [ 'closed', 'canceled' ], false);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'client_order_id': id,
        };
        const response = await this.privateGetSpotHistoryOrder (this.extend (request, params));
        //
        //     [
        //       {
        //         "id": "685965182082",
        //         "client_order_id": "B3CBm9uGg9oYQlw96bBSEt38-6gbgBO0",
        //         "symbol": "BTCUSDT",
        //         "side": "buy",
        //         "status": "new",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "quantity": "0.00010",
        //         "quantity_cumulative": "0",
        //         "price": "50000.00",
        //         "price_average": "0",
        //         "created_at": "2021-10-26T11:40:09.287Z",
        //         "updated_at": "2021-10-26T11:40:09.287Z"
        //       }
        //     ]
        //
        const order = this.safeValue (response, 0);
        return this.parseOrder (order, market);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'order_id': id, // exchange assigned order id as oppose to the client order id
        };
        const response = await this.privateGetSpotHistoryTrade (this.extend (request, params));
        //
        //     [
        //       {
        //         "id": 1393448977,
        //         "order_id": 653496804534,
        //         "client_order_id": "065f6f0ff9d54547848454182263d7b4",
        //         "symbol": "DICEETH",
        //         "side": "buy",
        //         "quantity": "1.4",
        //         "price": "0.00261455",
        //         "fee": "0.000003294333",
        //         "timestamp": "2021-09-19T05:35:56.601Z",
        //         "taker": true
        //       }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetSpotOrder (this.extend (request, params));
        //
        //     [
        //       {
        //         "id": "488953123149",
        //         "client_order_id": "103ad305301e4c3590045b13de15b36e",
        //         "symbol": "BTCUSDT",
        //         "side": "buy",
        //         "status": "new",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "quantity": "0.00001",
        //         "quantity_cumulative": "0",
        //         "price": "0.01",
        //         "post_only": false,
        //         "created_at": "2021-04-13T13:06:16.567Z",
        //         "updated_at": "2021-04-13T13:06:16.567Z"
        //       }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'client_order_id': id,
        };
        const response = await this.privateGetSpotOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateDeleteSpotOrder (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'client_order_id': id,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateDeleteSpotOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'client_order_id': id,
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if ((type === 'limit') || (type === 'stopLimit')) {
            if (price === undefined) {
                throw new ExchangeError (this.id + ' limit order requires price');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privatePatchSpotOrderClientOrderId (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'type': type,
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
            'symbol': market['id'],
        };
        if ((type === 'limit') || (type === 'stopLimit')) {
            if (price === undefined) {
                throw new ExchangeError (this.id + ' limit order requires price');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostSpotOrder (this.extend (request, params));
        return this.parseOrder (response, market);
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
        // limit
        //     {
        //       "id": 488953123149,
        //       "client_order_id": "103ad305301e4c3590045b13de15b36e",
        //       "symbol": "BTCUSDT",
        //       "side": "buy",
        //       "status": "new",
        //       "type": "limit",
        //       "time_in_force": "GTC",
        //       "quantity": "0.00001",
        //       "quantity_cumulative": "0",
        //       "price": "0.01",
        //       "price_average": "0.01",
        //       "post_only": false,
        //       "created_at": "2021-04-13T13:06:16.567Z",
        //       "updated_at": "2021-04-13T13:06:16.567Z"
        //     }
        //
        // market
        //     {
        //       "id": "685877626834",
        //       "client_order_id": "Yshl7G-EjaREyXQYaGbsmdtVbW-nzQwu",
        //       "symbol": "BTCUSDT",
        //       "side": "buy",
        //       "status": "filled",
        //       "type": "market",
        //       "time_in_force": "GTC",
        //       "quantity": "0.00010",
        //       "quantity_cumulative": "0.00010",
        //       "post_only": false,
        //       "created_at": "2021-10-26T08:55:55.1Z",
        //       "updated_at": "2021-10-26T08:55:55.1Z",
        //       "trades": [
        //         {
        //           "id": "1437229630",
        //           "position_id": "0",
        //           "quantity": "0.00010",
        //           "price": "62884.78",
        //           "fee": "0.005659630200",
        //           "timestamp": "2021-10-26T08:55:55.1Z",
        //           "taker": true
        //         }
        //       ]
        //     }
        //
        const id = this.safeString (order, 'client_order_id');
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        const amount = this.safeString (order, 'quantity');
        const price = this.safeString (order, 'price');
        const average = this.safeString (order, 'price_average');
        const created = this.safeString (order, 'created_at');
        const timestamp = this.parse8601 (created);
        const updated = this.safeString (order, 'updated_at');
        let lastTradeTimestamp = undefined;
        if (updated !== created) {
            lastTradeTimestamp = this.parse8601 (updated);
        }
        const filled = this.safeString (order, 'quantity_cumulative');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const postOnly = this.safeValue (order, 'post_only');
        const timeInForce = this.safeString (order, 'time_in_force');
        const rawTrades = this.safeValue (order, 'trades');
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'price': price,
            'amount': amount,
            'type': type,
            'side': side,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'status': status,
            'average': average,
            'trades': rawTrades,
            'fee': undefined,
        }, market);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        // account can be "spot", "wallet", or "derivatives"
        await this.loadMarkets ();
        const currency = this.currency (code);
        const requestAmount = this.currencyToPrecision (code, amount);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        fromAccount = fromAccount.toLowerCase ();
        toAccount = toAccount.toLowerCase ();
        const fromId = this.safeString (accountsByType, fromAccount);
        const toId = this.safeString (accountsByType, toAccount);
        const keys = Object.keys (accountsByType);
        if (fromId === undefined) {
            throw new ArgumentsRequired (this.id + ' transfer() fromAccount argument must be one of ' + keys.join (', '));
        }
        if (toId === undefined) {
            throw new ArgumentsRequired (this.id + ' transfer() toAccount argument must be one of ' + keys.join (', '));
        }
        if (fromId === toId) {
            throw new BadRequest (this.id + ' transfer() fromAccount and toAccount arguments cannot be the same account');
        }
        const request = {
            'currency': currency['id'],
            'amount': requestAmount,
            'source': fromId,
            'destination': toId,
        };
        const response = await this.privatePostWalletTransfer (this.extend (request, params));
        // [ '2db6ebab-fb26-4537-9ef8-1a689472d236' ]
        const id = this.safeString (response, 0);
        return {
            'info': response,
            'id': id,
            'timestamp': undefined,
            'datetime': undefined,
            'amount': this.parseNumber (requestAmount),
            'currency': code,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': undefined,
        };
    }

    async convertCurrencyNetwork (code, amount, fromNetwork, toNetwork, params) {
        await this.loadMarkets ();
        if (code !== 'USDT') {
            throw new ExchangeError (this.id + ' convertCurrencyNetwork() only supports USDT currently');
        }
        const networks = this.safeValue (this.options, 'networks', {});
        fromNetwork = fromNetwork.toUpperCase ();
        toNetwork = toNetwork.toUpperCase ();
        fromNetwork = this.safeString (networks, fromNetwork); // handle ETH>ERC20 alias
        toNetwork = this.safeString (networks, toNetwork); // handle ETH>ERC20 alias
        if (fromNetwork === toNetwork) {
            throw new BadRequest (this.id + ' fromNetwork cannot be the same as toNetwork');
        }
        if ((fromNetwork === undefined) || (toNetwork === undefined)) {
            const keys = Object.keys (networks);
            throw new ArgumentsRequired (this.id + ' convertCurrencyNetwork() requires a fromNetwork parameter and a toNetwork parameter, supported networks are ' + keys.join (', '));
        }
        const request = {
            'from_currency': fromNetwork,
            'to_currency': toNetwork,
            'amount': this.currencyToPrecision (code, amount),
        };
        const response = await this.privatePostWalletConvert (this.extend (request, params));
        // {"result":["587a1868-e62d-4d8e-b27c-dbdb2ee96149","e168df74-c041-41f2-b76c-e43e4fed5bc7"]}
        return {
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['payment_id'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        const network = this.safeStringUpper (params, 'network');
        if ((network !== undefined) && (code === 'USDT')) {
            const parsedNetwork = this.safeString (networks, network);
            if (parsedNetwork !== undefined) {
                request['currency'] = parsedNetwork;
            }
            params = this.omit (params, 'network');
        }
        const response = await this.privatePostWalletCryptoWithdraw (this.extend (request, params));
        // {"id":"084cfcd5-06b9-4826-882e-fdb75ec3625d"}
        const id = this.safeString (response, 'id');
        return {
            'info': response,
            'id': id,
        };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        //     {
        //       "error": {
        //         "code": 20001,
        //         "message": "Insufficient funds",
        //         "description": "Check that the funds are sufficient, given commissions"
        //       }
        //     }
        //
        //     {
        //       "error": {
        //         "code": "600",
        //         "message": "Action not allowed"
        //       }
        //     }
        //
        const error = this.safeValue (response, 'error');
        const errorCode = this.safeString (error, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString2 (error, 'message', 'description');
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const implodedPath = this.implodeParams (path, params);
        let url = this.urls['api'][api] + '/' + implodedPath;
        let getRequest = undefined;
        const keys = Object.keys (query);
        const queryLength = keys.length;
        headers = {
            'Content-Type': 'application/json',
        };
        if (method === 'GET') {
            if (queryLength) {
                getRequest = '?' + this.urlencode (query);
                url = url + getRequest;
            }
        } else {
            body = this.json (params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.nonce ().toString ();
            const payload = [ method, '/api/3/' + implodedPath ];
            if (method === 'GET') {
                if (getRequest !== undefined) {
                    payload.push (getRequest);
                }
            } else {
                payload.push (body);
            }
            payload.push (timestamp);
            const payloadString = payload.join ('');
            const signature = this.hmac (this.encode (payloadString), this.encode (this.secret), 'sha256', 'hex');
            const secondPayload = this.apiKey + ':' + signature + ':' + timestamp;
            const encoded = this.decode (this.stringToBase64 (secondPayload));
            headers['Authorization'] = 'HS256 ' + encoded;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
