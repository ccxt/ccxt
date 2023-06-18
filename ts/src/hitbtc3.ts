import Exchange from './abstract/hitbtc3.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { BadSymbol, BadRequest, OnMaintenance, AccountSuspended, PermissionDenied, ExchangeError, RateLimitExceeded, ExchangeNotAvailable, OrderNotFound, InsufficientFunds, InvalidOrder, AuthenticationError, ArgumentsRequired, NotSupported } from './base/errors.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

export default class hitbtc3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc3',
            'name': 'HitBTC',
            'countries': [ 'HK' ],
            // 300 requests per second => 1000ms / 300 = 3.333 (Trading: placing, replacing, deleting)
            // 30 requests per second => ( 1000ms / rateLimit ) / 30 = cost = 10 (Market Data and other Public Requests)
            // 20 requests per second => ( 1000ms / rateLimit ) / 20 = cost = 15 (All Other)
            'rateLimit': 3.333, // TODO: optimize https://api.hitbtc.com/#rate-limiting
            'version': '3',
            'pro': false,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': undefined,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistories': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'precisionMode': TICK_SIZE,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'test': {
                    'public': 'https://api.demo.hitbtc.com/api/3',
                    'private': 'https://api.demo.hitbtc.com/api/3',
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
                    'get': {
                        'public/currency': 10,
                        'public/symbol': 10,
                        'public/ticker': 10,
                        'public/price/rate': 10,
                        'public/trades': 10,
                        'public/orderbook': 10,
                        'public/candles': 10,
                        'public/futures/info': 10,
                        'public/futures/history/funding': 10,
                        'public/futures/candles/index_price': 10,
                        'public/futures/candles/mark_price': 10,
                        'public/futures/candles/premium_index': 10,
                        'public/futures/candles/open_interest': 10,
                    },
                },
                'private': {
                    'get': {
                        'spot/balance': 15,
                        'spot/order': 15,
                        'spot/order/{client_order_id}': 15,
                        'spot/fee': 15,
                        'spot/fee/{symbol}': 15,
                        'spot/history/order': 15,
                        'spot/history/trade': 15,
                        'margin/account': 15,
                        'margin/account/isolated/{symbol}': 15,
                        'margin/order': 15,
                        'margin/order/{client_order_id}': 15,
                        'margin/history/clearing': 15,
                        'margin/history/order': 15,
                        'margin/history/positions': 15,
                        'margin/history/trade': 15,
                        'futures/balance': 15,
                        'futures/account': 15,
                        'futures/account/isolated/{symbol}': 15,
                        'futures/order': 15,
                        'futures/order/{client_order_id}': 15,
                        'futures/fee': 15,
                        'futures/fee/{symbol}': 15,
                        'futures/history/clearing': 15,
                        'futures/history/order': 15,
                        'futures/history/positions': 15,
                        'futures/history/trade': 15,
                        'wallet/balance': 15,
                        'wallet/crypto/address': 15,
                        'wallet/crypto/address/recent-deposit': 15,
                        'wallet/crypto/address/recent-withdraw': 15,
                        'wallet/crypto/address/check-mine': 15,
                        'wallet/transactions': 15,
                        'wallet/crypto/check-offchain-available': 15,
                        'wallet/crypto/fee/estimate': 15,
                        'sub-account': 15,
                        'sub-account/acl': 15,
                        'sub-account/balance/{subAccID}': 15,
                        'sub-account/crypto/address/{subAccID}/{currency}': 15,
                    },
                    'post': {
                        'spot/order': 1,
                        'margin/order': 1,
                        'futures/order': 1,
                        'wallet/convert': 15,
                        'wallet/crypto/address': 15,
                        'wallet/crypto/withdraw': 15,
                        'wallet/transfer': 15,
                        'sub-account/freeze': 15,
                        'sub-account/activate': 15,
                        'sub-account/transfer': 15,
                        'sub-account/acl': 15,
                    },
                    'patch': {
                        'spot/order/{client_order_id}': 1,
                        'margin/order/{client_order_id}': 1,
                        'futures/order/{client_order_id}': 1,
                    },
                    'delete': {
                        'spot/order': 1,
                        'spot/order/{client_order_id}': 1,
                        'margin/position': 1,
                        'margin/position/isolated/{symbol}': 1,
                        'margin/order': 1,
                        'margin/order/{client_order_id}': 1,
                        'futures/position': 1,
                        'futures/position/isolated/{symbol}': 1,
                        'futures/order': 1,
                        'futures/order/{client_order_id}': 1,
                        'wallet/crypto/withdraw/{id}': 1,
                    },
                    'put': {
                        'margin/account/isolated/{symbol}': 1,
                        'futures/account/isolated/{symbol}': 1,
                        'wallet/crypto/withdraw/{id}': 1,
                    },
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
                    '20045': InvalidOrder,
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
                    'funding': 'wallet',
                    'future': 'derivatives',
                },
                'withdraw': {
                    'includeFee': false,
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
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchMarkets
         * @description retrieves data on all markets for hitbtc3
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
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
                contractSize = this.parseNumber ('1');
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
                'option': option,
                'active': true,
                'contract': contract,
                'linear': linear,
                'inverse': inverse,
                'taker': this.safeNumber (market, 'take_rate'),
                'maker': this.safeNumber (market, 'make_rate'),
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'feeCurrency': feeCurrency,
                'precision': {
                    'amount': lot,
                    'price': step,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
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
        /**
         * @method
         * @name hitbtc3#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} an associative dictionary of currencies
         */
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
            let depositEnabled = undefined;
            let withdrawEnabled = undefined;
            for (let j = 0; j < rawNetworks.length; j++) {
                const rawNetwork = rawNetworks[j];
                const networkId = this.safeString2 (rawNetwork, 'protocol', 'network');
                const network = this.safeNetwork (networkId);
                fee = this.safeNumber (rawNetwork, 'payout_fee');
                const networkPrecision = this.safeNumber (rawNetwork, 'precision_payout');
                const payinEnabledNetwork = this.safeValue (entry, 'payin_enabled', false);
                const payoutEnabledNetwork = this.safeValue (entry, 'payout_enabled', false);
                const activeNetwork = payinEnabledNetwork && payoutEnabledNetwork;
                if (payinEnabledNetwork && !depositEnabled) {
                    depositEnabled = true;
                } else if (!payinEnabledNetwork) {
                    depositEnabled = false;
                }
                if (payoutEnabledNetwork && !withdrawEnabled) {
                    withdrawEnabled = true;
                } else if (!payoutEnabledNetwork) {
                    withdrawEnabled = false;
                }
                networks[network] = {
                    'info': rawNetwork,
                    'id': networkId,
                    'network': network,
                    'fee': fee,
                    'active': activeNetwork,
                    'deposit': payinEnabledNetwork,
                    'withdraw': payoutEnabledNetwork,
                    'precision': networkPrecision,
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
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
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

    async createDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name hitbtc3#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the hitbtc api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
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
        const response = await this.privatePostWalletCryptoAddress (this.extend (request, params));
        //
        //  {"currency":"ETH","address":"0xd0d9aea60c41988c3e68417e2616065617b7afd3"}
        //
        const currencyId = this.safeString (response, 'currency');
        return {
            'currency': this.safeCurrencyCode (currencyId),
            'address': this.safeString (response, 'address'),
            'tag': this.safeString (response, 'payment_id'),
            'network': undefined,
            'info': response,
        };
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
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
            'code': parsedCode, // kept here for backward-compatibility, but will be removed soon
            'currency': parsedCode,
            'network': undefined,
        };
    }

    parseBalance (response) {
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
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const type = this.safeStringLower (params, 'type', 'spot');
        params = this.omit (params, [ 'type' ]);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const account = this.safeString (accountsByType, type, type);
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
        return this.parseBalance (response);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const response = await this.fetchTickers ([ symbol ], params);
        return this.safeValue (response, symbol);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
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
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString (ticker, 'volume_quote');
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

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
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
            request['from'] = since;
        }
        const response = await this.publicGetPublicTrades (this.extend (request, params));
        const marketIds = Object.keys (response);
        let trades = [];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketInner = this.market (marketId);
            const rawTrades = response[marketId];
            const parsed = this.parseTrades (rawTrades, marketInner);
            trades = this.arrayConcat (trades, parsed);
        }
        return trades;
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool|undefined} params.margin true for fetching margin trades
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
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
            request['from'] = since;
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotHistoryTrade',
            'swap': 'privateGetFuturesHistoryTrade',
            'margin': 'privateGetMarginHistoryTrade',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchMyTrades', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginHistoryTrade';
        }
        const response = await this[method] (this.extend (request, query));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // createOrder (market)
        //
        //  {
        //      id: '1569252895',
        //      position_id: '0',
        //      quantity: '10',
        //      price: '0.03919424',
        //      fee: '0.000979856000',
        //      timestamp: '2022-01-25T19:38:36.153Z',
        //      taker: true
        //  }
        //
        // fetchTrades
        //
        //  {
        //      id: 974786185,
        //      price: '0.032462',
        //      qty: '0.3673',
        //      side: 'buy',
        //      timestamp: '2020-10-16T12:57:39.846Z'
        //  }
        //
        // fetchMyTrades spot
        //
        //  {
        //      id: 277210397,
        //      clientOrderId: '6e102f3e7f3f4e04aeeb1cdc95592f1a',
        //      orderId: 28102855393,
        //      symbol: 'ETHBTC',
        //      side: 'sell',
        //      quantity: '0.002',
        //      price: '0.073365',
        //      fee: '0.000000147',
        //      timestamp: '2018-04-28T18:39:55.345Z',
        //      taker: true
        //  }
        //
        // fetchMyTrades swap and margin
        //
        //  {
        //      "id": 4718564,
        //      "order_id": 58730811958,
        //      "client_order_id": "475c47d97f867f09726186eb22b4c3d4",
        //      "symbol": "BTCUSDT_PERP",
        //      "side": "sell",
        //      "quantity": "0.0001",
        //      "price": "41118.51",
        //      "fee": "0.002055925500",
        //      "timestamp": "2022-03-17T05:23:17.795Z",
        //      "taker": true,
        //      "position_id": 2350122,
        //      "pnl": "0.002255000000",
        //      "liquidation": false
        //  }
        //
        const timestamp = this.parse8601 (trade['timestamp']);
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        const taker = this.safeValue (trade, 'taker');
        let takerOrMaker = undefined;
        if (taker !== undefined) {
            takerOrMaker = taker ? 'taker' : 'maker';
        }
        if (feeCostString !== undefined) {
            const info = this.safeValue (market, 'info', {});
            const feeCurrency = this.safeString (info, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrency);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const orderId = this.safeString2 (trade, 'clientOrderId', 'client_order_id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString2 (trade, 'quantity', 'qty');
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
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
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
        // transaction
        //
        //     {
        //       "id": "101609495",
        //       "created_at": "2018-03-06T22:05:06.507Z",
        //       "updated_at": "2018-03-06T22:11:45.03Z",
        //       "status": "SUCCESS",
        //       "type": "DEPOSIT", // DEPOSIT, WITHDRAW, ..
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
        //         ],
        //         "fee": "1.22" // only for WITHDRAW
        //       }
        //     }
        //
        // withdraw
        //
        //     {
        //         "id":"084cfcd5-06b9-4826-882e-fdb75ec3625d"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const updated = this.parse8601 (this.safeString (transaction, 'updated_at'));
        const type = this.parseTransactionType (this.safeString (transaction, 'type'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const native = this.safeValue (transaction, 'native', {});
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
        const fee = {
            'currency': undefined,
            'cost': undefined,
            'rate': undefined,
        };
        const feeCost = this.safeNumber (native, 'fee');
        if (feeCost !== undefined) {
            fee['currency'] = code;
            fee['cost'] = feeCost;
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txhash,
            'type': type,
            'code': code, // kept here for backward-compatibility, but will be removed soon
            'currency': code,
            'network': undefined,
            'amount': amount,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': tagTo,
            'updated': updated,
            'comment': undefined,
            'fee': fee,
        };
    }

    async fetchTransactions (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchTransactions
         * @description fetch history of deposits and withdrawals
         * @param {string|undefined} code unified currency code for the currency of the transactions, default is undefined
         * @param {int|undefined} since timestamp in ms of the earliest transaction, default is undefined
         * @param {int|undefined} limit max number of transactions to return, default is undefined
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        return await this.fetchTransactionsHelper ('DEPOSIT,WITHDRAW', code, since, limit, params);
    }

    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchDeposits
         * @description fetch all deposits made to an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch deposits for
         * @param {int|undefined} limit the maximum number of deposits structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        return await this.fetchTransactionsHelper ('DEPOSIT', code, since, limit, params);
    }

    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @param {string|undefined} code unified currency code
         * @param {int|undefined} since the earliest time in ms to fetch withdrawals for
         * @param {int|undefined} limit the maximum number of withdrawals structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        return await this.fetchTransactionsHelper ('WITHDRAW', code, since, limit, params);
    }

    async fetchOrderBooks (symbols: string[] = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @param {[string]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int|undefined} limit max number of entries per orderbook to return, default is undefined
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const marketIdsInner = this.marketIds (symbols);
            request['symbols'] = marketIdsInner.join (',');
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

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
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

    async fetchTradingFee (symbol: string, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchTradingFee
         * @description fetch the trading fees for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const method = this.getSupportedMapping (market['type'], {
            'spot': 'privateGetSpotFeeSymbol',
            'swap': 'privateGetFuturesFeeSymbol',
        });
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "take_rate":"0.0009",
        //         "make_rate":"0.0009"
        //     }
        //
        return this.parseTradingFee (response, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTradingFees', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotFee',
            'swap': 'privateGetFuturesFee',
        });
        const response = await this[method] (query);
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

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbols': market['id'],
            'period': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const price = this.safeString (params, 'price');
        params = this.omit (params, 'price');
        let method = 'publicGetPublicCandles';
        if (price === 'mark') {
            method = 'publicGetPublicFuturesCandlesMarkPrice';
        } else if (price === 'index') {
            method = 'publicGetPublicFuturesCandlesIndexPrice';
        } else if (price === 'premiumIndex') {
            method = 'publicGetPublicFuturesCandlesPremiumIndex';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // Spot and Swap
        //
        //     {
        //         "ETHUSDT": [
        //             {
        //                 "timestamp": "2021-10-25T07:38:00.000Z",
        //                 "open": "4173.391",
        //                 "close": "4170.923",
        //                 "min": "4170.923",
        //                 "max": "4173.986",
        //                 "volume": "0.1879",
        //                 "volume_quote": "784.2517846"
        //             }
        //         ]
        //     }
        //
        // Mark, Index and Premium Index
        //
        //     {
        //         "BTCUSDT_PERP": [
        //             {
        //                 "timestamp": "2022-04-01T01:28:00.000Z",
        //                 "open": "45146.39",
        //                 "close": "45219.43",
        //                 "min": "45146.39",
        //                 "max": "45219.43"
        //             },
        //         ]
        //     }
        //
        const ohlcvs = this.safeValue (response, market['id']);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // Spot and Swap
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
        // Mark, Index and Premium Index
        //
        //     {
        //         "timestamp": "2022-04-01T01:28:00.000Z",
        //         "open": "45146.39",
        //         "close": "45219.43",
        //         "min": "45146.39",
        //         "max": "45219.43"
        //     },
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

    async fetchClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool|undefined} params.margin true for fetching margin orders
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
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
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchClosedOrders', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotHistoryOrder',
            'swap': 'privateGetFuturesHistoryOrder',
            'margin': 'privateGetMarginHistoryOrder',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchClosedOrders', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginHistoryOrder';
        }
        const response = await this[method] (this.extend (request, query));
        const parsed = this.parseOrders (response, market, since, limit);
        return this.filterByArray (parsed, 'status', [ 'closed', 'canceled' ], false);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool|undefined} params.margin true for fetching a margin order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotHistoryOrder',
            'swap': 'privateGetFuturesHistoryOrder',
            'margin': 'privateGetMarginHistoryOrder',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchOrder', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginHistoryOrder';
        }
        const request = {
            'client_order_id': id,
        };
        const response = await this[method] (this.extend (request, query));
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

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool|undefined} params.margin true for fetching margin trades
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'order_id': id, // exchange assigned order id as oppose to the client order id
        };
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOrderTrades', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotHistoryTrade',
            'swap': 'privateGetFuturesHistoryTrade',
            'margin': 'privateGetMarginHistoryTrade',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchOrderTrades', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginHistoryTrade';
        }
        const response = await this[method] (this.extend (request, query));
        //
        // Spot
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
        // Swap and Margin
        //
        //     [
        //         {
        //             "id": 4718551,
        //             "order_id": 58730748700,
        //             "client_order_id": "dcbcd8549e3445ee922665946002ef67",
        //             "symbol": "BTCUSDT_PERP",
        //             "side": "buy",
        //             "quantity": "0.0001",
        //             "price": "41095.96",
        //             "fee": "0.002054798000",
        //             "timestamp": "2022-03-17T05:23:02.217Z",
        //             "taker": true,
        //             "position_id": 2350122,
        //             "pnl": "0",
        //             "liquidation": false
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool|undefined} params.margin true for fetching open margin orders
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotOrder',
            'swap': 'privateGetFuturesOrder',
            'margin': 'privateGetMarginOrder',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchOpenOrders', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginOrder';
        }
        const response = await this[method] (this.extend (request, query));
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

    async fetchOpenOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchOpenOrder
         * @description fetch an open order by it's id
         * @param {string} id order id
         * @param {string|undefined} symbol unified market symbol, default is undefined
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool|undefined} params.margin true for fetching an open margin order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchOpenOrder', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotOrderClientOrderId',
            'swap': 'privateGetFuturesOrderClientOrderId',
            'margin': 'privateGetMarginOrderClientOrderId',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchOpenOrder', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginOrderClientOrderId';
        }
        const request = {
            'client_order_id': id,
        };
        const response = await this[method] (this.extend (request, query));
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool|undefined} params.margin true for canceling margin orders
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateDeleteSpotOrder',
            'swap': 'privateDeleteFuturesOrder',
            'margin': 'privateDeleteMarginOrder',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('cancelAllOrders', params);
        if (marginMode !== undefined) {
            method = 'privateDeleteMarginOrder';
        }
        const response = await this[method] (this.extend (request, query));
        return this.parseOrders (response, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool|undefined} params.margin true for canceling a margin order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'client_order_id': id,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privateDeleteSpotOrderClientOrderId',
            'swap': 'privateDeleteFuturesOrderClientOrderId',
            'margin': 'privateDeleteMarginOrderClientOrderId',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('cancelOrder', params);
        if (marginMode !== undefined) {
            method = 'privateDeleteMarginOrderClientOrderId';
        }
        const response = await this[method] (this.extend (request, query));
        return this.parseOrder (response, market);
    }

    async editOrder (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'client_order_id': id,
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if ((type === 'limit') || (type === 'stopLimit')) {
            if (price === undefined) {
                throw new ExchangeError (this.id + ' editOrder() limit order requires price');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('editOrder', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privatePatchSpotOrderClientOrderId',
            'swap': 'privatePatchFuturesOrderClientOrderId',
            'margin': 'privatePatchMarginOrderClientOrderId',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('editOrder', params);
        if (marginMode !== undefined) {
            method = 'privatePatchMarginOrderClientOrderId';
        }
        const response = await this[method] (this.extend (request, query));
        return this.parseOrder (response, market);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set
         * @param {bool|undefined} params.margin true for creating a margin order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'type': type,
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
            'symbol': market['id'],
            // 'client_order_id': 'r42gdPjNMZN-H_xs8RKl2wljg_dfgdg4', // Optional
            // 'time_in_force': 'GTC', // Optional GTC, IOC, FOK, Day, GTD
            // 'price': this.priceToPrecision (symbol, price), // Required if type is limit, stopLimit, or takeProfitLimit
            // 'stop_price': this.safeNumber (params, 'stop_price'), // Required if type is stopLimit, stopMarket, takeProfitLimit, takeProfitMarket
            // 'expire_time': '2021-06-15T17:01:05.092Z', // Required if timeInForce is GTD
            // 'strict_validate': false,
            // 'post_only': false, // Optional
            // 'reduce_only': false, // Optional
            // 'display_quantity': '0', // Optional
            // 'take_rate': 0.001, // Optional
            // 'make_rate': 0.001, // Optional
        };
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        if (reduceOnly !== undefined) {
            if ((market['type'] !== 'swap') && (market['type'] !== 'margin')) {
                throw new InvalidOrder (this.id + ' createOrder() does not support reduce_only for ' + market['type'] + ' orders, reduce_only orders are supported for swap and margin markets only');
            }
        }
        if (reduceOnly === true) {
            request['reduce_only'] = reduceOnly;
        }
        const timeInForce = this.safeString2 (params, 'timeInForce', 'time_in_force');
        const expireTime = this.safeString (params, 'expire_time');
        const stopPrice = this.safeNumber2 (params, 'stopPrice', 'stop_price');
        if ((type === 'limit') || (type === 'stopLimit') || (type === 'takeProfitLimit')) {
            if (price === undefined) {
                throw new ExchangeError (this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if ((timeInForce === 'GTD')) {
            if (expireTime === undefined) {
                throw new ExchangeError (this.id + ' createOrder() requires an expire_time parameter for a GTD order');
            }
            request['expire_time'] = expireTime;
        }
        if ((type === 'stopLimit') || (type === 'stopMarket') || (type === 'takeProfitLimit') || (type === 'takeProfitMarket')) {
            if (stopPrice === undefined) {
                throw new ExchangeError (this.id + ' createOrder() requires a stopPrice parameter for stop-loss and take-profit orders');
            }
            request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        let method = this.getSupportedMapping (marketType, {
            'spot': 'privatePostSpotOrder',
            'swap': 'privatePostFuturesOrder',
            'margin': 'privatePostMarginOrder',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('createOrder', params);
        if (marginMode !== undefined) {
            method = 'privatePostMarginOrder';
        }
        const response = await this[method] (this.extend (request, query));
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
        // swap and margin
        //
        //     {
        //         "id": 58418961892,
        //         "client_order_id": "r42gdPjNMZN-H_xs8RKl2wljg_dfgdg4",
        //         "symbol": "BTCUSDT_PERP",
        //         "side": "buy",
        //         "status": "new",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "quantity": "0.0005",
        //         "quantity_cumulative": "0",
        //         "price": "30000.00",
        //         "post_only": false,
        //         "reduce_only": false,
        //         "created_at": "2022-03-16T08:16:53.039Z",
        //         "updated_at": "2022-03-16T08:16:53.039Z"
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
        return this.safeOrder ({
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
            'reduceOnly': this.safeValue (order, 'reduce_only'),
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'status': status,
            'average': average,
            'trades': rawTrades,
            'fee': undefined,
        }, market);
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name hitbtc3#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        // account can be "spot", "wallet", or "derivatives"
        await this.loadMarkets ();
        const currency = this.currency (code);
        const requestAmount = this.currencyToPrecision (code, amount);
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        fromAccount = fromAccount.toLowerCase ();
        toAccount = toAccount.toLowerCase ();
        const fromId = this.safeString (accountsByType, fromAccount, fromAccount);
        const toId = this.safeString (accountsByType, toAccount, toAccount);
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
        //
        //     [
        //         '2db6ebab-fb26-4537-9ef8-1a689472d236'
        //     ]
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        // transfer
        //
        //     [
        //         '2db6ebab-fb26-4537-9ef8-1a689472d236'
        //     ]
        //
        const timestamp = this.milliseconds ();
        return {
            'id': this.safeString (transfer, 0),
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

    async convertCurrencyNetwork (code: string, amount, fromNetwork, toNetwork, params) {
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
            throw new BadRequest (this.id + ' convertCurrencyNetwork() fromNetwork cannot be the same as toNetwork');
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

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
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
        const withdrawOptions = this.safeValue (this.options, 'withdraw', {});
        const includeFee = this.safeValue (withdrawOptions, 'includeFee', false);
        if (includeFee) {
            request['include_fee'] = true;
        }
        const response = await this.privatePostWalletCryptoWithdraw (this.extend (request, params));
        //
        //     {
        //         "id":"084cfcd5-06b9-4826-882e-fdb75ec3625d"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchFundingRateHistory (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @param {string|undefined} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int|undefined} since timestamp in ms of the earliest funding rate to fetch
         * @param {int|undefined} limit the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure} to fetch
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // all arguments are optional
            // 'symbols': Comma separated list of symbol codes,
            // 'sort': 'DESC' or 'ASC'
            // 'from': 'Datetime or Number',
            // 'till': 'Datetime or Number',
            // 'limit': 100,
            // 'offset': 0,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
            request['symbols'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPublicFuturesHistoryFunding (this.extend (request, params));
        //
        //    {
        //        "BTCUSDT_PERP": [
        //            {
        //                "timestamp": "2021-07-29T16:00:00.271Z",
        //                "funding_rate": "0.0001",
        //                "avg_premium_index": "0.000061858585213222",
        //                "next_funding_time": "2021-07-30T00:00:00.000Z",
        //                "interest_rate": "0.0001"
        //            },
        //            ...
        //        ],
        //        ...
        //    }
        //
        const contracts = Object.keys (response);
        const rates = [];
        for (let i = 0; i < contracts.length; i++) {
            const marketId = contracts[i];
            const marketInner = this.safeMarket (marketId);
            const fundingRateData = response[marketId];
            for (let j = 0; j < fundingRateData.length; j++) {
                const entry = fundingRateData[j];
                const symbolInner = this.safeSymbol (marketInner['symbol']);
                const fundingRate = this.safeNumber (entry, 'funding_rate');
                const datetime = this.safeString (entry, 'timestamp');
                rates.push ({
                    'info': entry,
                    'symbol': symbolInner,
                    'fundingRate': fundingRate,
                    'timestamp': this.parse8601 (datetime),
                    'datetime': datetime,
                });
            }
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchPositions (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols not used by hitbtc3 fetchPositions ()
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set
         * @param {bool|undefined} params.margin true for fetching spot-margin positions
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const request = {};
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchPositions', undefined, params);
        let method = this.getSupportedMapping (marketType, {
            'swap': 'privateGetFuturesAccount',
            'margin': 'privateGetMarginAccount',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchPositions', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginAccount';
        }
        const response = await this[method] (this.extend (request, query));
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT_PERP",
        //             "type": "isolated",
        //             "leverage": "10.00",
        //             "created_at": "2022-03-19T07:54:35.24Z",
        //             "updated_at": "2022-03-19T07:54:58.922Z",
        //             currencies": [
        //                 {
        //                     "code": "USDT",
        //                     "margin_balance": "7.478100643043",
        //                     "reserved_orders": "0",
        //                     "reserved_positions": "0.303530761300"
        //                 }
        //             ],
        //             "positions": [
        //                 {
        //                     "id": 2470568,
        //                     "symbol": "ETHUSDT_PERP",
        //                     "quantity": "0.001",
        //                     "price_entry": "2927.509",
        //                     "price_margin_call": "0",
        //                     "price_liquidation": "0",
        //                     "pnl": "0",
        //                     "created_at": "2022-03-19T07:54:35.24Z",
        //                     "updated_at": "2022-03-19T07:54:58.922Z"
        //                 }
        //             ]
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parsePosition (response[i]));
        }
        return result;
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchPosition
         * @description fetch data on a single open contract trade position
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set
         * @param {bool|undefined} params.margin true for fetching a spot-margin position
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchPosition', undefined, params);
        let method = this.getSupportedMapping (marketType, {
            'swap': 'privateGetFuturesAccountIsolatedSymbol',
            'margin': 'privateGetMarginAccountIsolatedSymbol',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('fetchPosition', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginAccountIsolatedSymbol';
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this[method] (this.extend (request, query));
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT_PERP",
        //             "type": "isolated",
        //             "leverage": "10.00",
        //             "created_at": "2022-03-19T07:54:35.24Z",
        //             "updated_at": "2022-03-19T07:54:58.922Z",
        //             currencies": [
        //                 {
        //                     "code": "USDT",
        //                     "margin_balance": "7.478100643043",
        //                     "reserved_orders": "0",
        //                     "reserved_positions": "0.303530761300"
        //                 }
        //             ],
        //             "positions": [
        //                 {
        //                     "id": 2470568,
        //                     "symbol": "ETHUSDT_PERP",
        //                     "quantity": "0.001",
        //                     "price_entry": "2927.509",
        //                     "price_margin_call": "0",
        //                     "price_liquidation": "0",
        //                     "pnl": "0",
        //                     "created_at": "2022-03-19T07:54:35.24Z",
        //                     "updated_at": "2022-03-19T07:54:58.922Z"
        //                 }
        //             ]
        //         },
        //     ]
        //
        return this.parsePosition (response, market);
    }

    parsePosition (position, market = undefined) {
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT_PERP",
        //             "type": "isolated",
        //             "leverage": "10.00",
        //             "created_at": "2022-03-19T07:54:35.24Z",
        //             "updated_at": "2022-03-19T07:54:58.922Z",
        //             currencies": [
        //                 {
        //                     "code": "USDT",
        //                     "margin_balance": "7.478100643043",
        //                     "reserved_orders": "0",
        //                     "reserved_positions": "0.303530761300"
        //                 }
        //             ],
        //             "positions": [
        //                 {
        //                     "id": 2470568,
        //                     "symbol": "ETHUSDT_PERP",
        //                     "quantity": "0.001",
        //                     "price_entry": "2927.509",
        //                     "price_margin_call": "0",
        //                     "price_liquidation": "0",
        //                     "pnl": "0",
        //                     "created_at": "2022-03-19T07:54:35.24Z",
        //                     "updated_at": "2022-03-19T07:54:58.922Z"
        //                 }
        //             ]
        //         },
        //     ]
        //
        const marginMode = this.safeString (position, 'type');
        const leverage = this.safeNumber (position, 'leverage');
        const datetime = this.safeString (position, 'updated_at');
        const positions = this.safeValue (position, 'positions', []);
        let liquidationPrice = undefined;
        let entryPrice = undefined;
        let contracts = undefined;
        for (let i = 0; i < positions.length; i++) {
            const entry = positions[i];
            liquidationPrice = this.safeNumber (entry, 'price_liquidation');
            entryPrice = this.safeNumber (entry, 'price_entry');
            contracts = this.safeNumber (entry, 'quantity');
        }
        const currencies = this.safeValue (position, 'currencies', []);
        let collateral = undefined;
        for (let i = 0; i < currencies.length; i++) {
            const entry = currencies[i];
            collateral = this.safeNumber (entry, 'margin_balance');
        }
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'notional': undefined,
            'marginMode': marginMode,
            'marginType': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': entryPrice,
            'unrealizedPnl': undefined,
            'percentage': undefined,
            'contracts': contracts,
            'contractSize': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'side': undefined,
            'hedged': undefined,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': collateral,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': leverage,
            'marginRatio': undefined,
        });
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {};
        if (symbol !== undefined) {
            symbol = market['symbol'];
            request['symbols'] = market['id'];
        }
        const response = await this.publicGetPublicFuturesInfo (this.extend (request, params));
        //
        //     {
        //         "BTCUSDT_PERP": {
        //             "contract_type": "perpetual",
        //             "mark_price": "42307.43",
        //             "index_price": "42303.27",
        //             "funding_rate": "0.0001",
        //             "open_interest": "30.9826",
        //             "next_funding_time": "2022-03-22T16:00:00.000Z",
        //             "indicative_funding_rate": "0.0001",
        //             "premium_index": "0",
        //             "avg_premium_index": "0.000029587712038098",
        //             "interest_rate": "0.0001",
        //             "timestamp": "2022-03-22T08:08:26.687Z"
        //         }
        //     }
        //
        const data = this.safeValue (response, market['id'], {});
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //     {
        //         "contract_type": "perpetual",
        //         "mark_price": "42307.43",
        //         "index_price": "42303.27",
        //         "funding_rate": "0.0001",
        //         "open_interest": "30.9826",
        //         "next_funding_time": "2022-03-22T16:00:00.000Z",
        //         "indicative_funding_rate": "0.0001",
        //         "premium_index": "0",
        //         "avg_premium_index": "0.000029587712038098",
        //         "interest_rate": "0.0001",
        //         "timestamp": "2022-03-22T08:08:26.687Z"
        //     }
        //
        const fundingDateTime = this.safeString (contract, 'next_funding_time');
        const datetime = this.safeString (contract, 'timestamp');
        return {
            'info': contract,
            'symbol': this.safeSymbol (undefined, market),
            'markPrice': this.safeNumber (contract, 'mark_price'),
            'indexPrice': this.safeNumber (contract, 'index_price'),
            'interestRate': this.safeNumber (contract, 'interest_rate'),
            'estimatedSettlePrice': undefined,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
            'fundingTimestamp': this.parse8601 (fundingDateTime),
            'fundingDatetime': fundingDateTime,
            'nextFundingRate': this.safeNumber (contract, 'indicative_funding_rate'),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async modifyMarginHelper (symbol: string, amount, type, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const leverage = this.safeString (params, 'leverage');
        if (market['type'] === 'swap') {
            if (leverage === undefined) {
                throw new ArgumentsRequired (this.id + ' modifyMarginHelper() requires a leverage parameter for swap markets');
            }
        }
        amount = this.amountToPrecision (symbol, amount);
        const request = {
            'symbol': market['id'], // swap and margin
            'margin_balance': amount, // swap and margin
            // 'leverage': '10', // swap only required
            // 'strict_validate': false, // swap and margin
        };
        if (leverage !== undefined) {
            request['leverage'] = leverage;
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('modifyMarginHelper', undefined, params);
        let method = this.getSupportedMapping (marketType, {
            'swap': 'privatePutFuturesAccountIsolatedSymbol',
            'margin': 'privatePutMarginAccountIsolatedSymbol',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('modifyMarginHelper', params);
        if (marginMode !== undefined) {
            method = 'privatePutMarginAccountIsolatedSymbol';
        }
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "symbol": "BTCUSDT_PERP",
        //         "type": "isolated",
        //         "leverage": "8.00",
        //         "created_at": "2022-03-30T23:34:27.161Z",
        //         "updated_at": "2022-03-30T23:34:27.161Z",
        //         "currencies": [
        //             {
        //                 "code": "USDT",
        //                 "margin_balance": "7.000000000000",
        //                 "reserved_orders": "0",
        //                 "reserved_positions": "0"
        //             }
        //         ],
        //         "positions": null
        //     }
        //
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
        });
    }

    parseMarginModification (data, market = undefined) {
        const currencies = this.safeValue (data, 'currencies', []);
        const currencyInfo = this.safeValue (currencies, 0);
        return {
            'info': data,
            'type': undefined,
            'amount': undefined,
            'code': this.safeString (currencyInfo, 'code'),
            'symbol': market['symbol'],
            'status': undefined,
        };
    }

    async reduceMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name hitbtc3#reduceMargin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
         * @param {bool|undefined} params.margin true for reducing spot-margin
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        if (amount !== 0) {
            throw new BadRequest (this.id + ' reduceMargin() on hitbtc3 requires the amount to be 0 and that will remove the entire margin amount');
        }
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    async addMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name hitbtc3#addMargin
         * @description add margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
         * @param {bool|undefined} params.margin true for adding spot-margin
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async fetchLeverage (symbol: string, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchLeverage
         * @description fetch the set leverage for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.marginMode 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
         * @param {bool|undefined} params.margin true for fetching spot-margin leverage
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = this.getSupportedMapping (market['type'], {
            'spot': 'privateGetMarginAccountIsolatedSymbol',
            'margin': 'privateGetMarginAccountIsolatedSymbol',
            'swap': 'privateGetFuturesAccountIsolatedSymbol',
        });
        const [ marginMode, query ] = this.handleMarginModeAndParams ('modifyMarginHelper', params);
        if (marginMode !== undefined) {
            method = 'privateGetMarginAccountIsolatedSymbol';
        }
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "type": "isolated",
        //         "leverage": "12.00",
        //         "created_at": "2022-03-29T22:31:29.067Z",
        //         "updated_at": "2022-03-30T00:00:00.125Z",
        //         "currencies": [
        //             {
        //                 "code": "USDT",
        //                 "margin_balance": "20.824360374174",
        //                 "reserved_orders": "0",
        //                 "reserved_positions": "0.973330435000"
        //             }
        //         ],
        //         "positions": [
        //             {
        //                 "id": 631301,
        //                 "symbol": "BTCUSDT",
        //                 "quantity": "0.00022",
        //                 "price_entry": "47425.57",
        //                 "price_margin_call": "",
        //                 "price_liquidation": "0",
        //                 "pnl": "0",
        //                 "created_at": "2022-03-29T22:31:29.067Z",
        //                 "updated_at": "2022-03-30T00:00:00.125Z"
        //             }
        //         ]
        //     }
        //
        return this.safeNumber (response, 'leverage');
    }

    async setLeverage (leverage, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {object} response from the exchange
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if (params['margin_balance'] === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a margin_balance parameter that will transfer margin to the specified trading pair');
        }
        const market = this.market (symbol);
        const amount = this.safeNumber (params, 'margin_balance');
        const maxLeverage = this.safeInteger (market['limits']['leverage'], 'max', 50);
        if (market['type'] !== 'swap') {
            throw new BadSymbol (this.id + ' setLeverage() supports swap contracts only');
        }
        if ((leverage < 1) || (leverage > maxLeverage)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and ' + maxLeverage.toString () + ' for ' + symbol);
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage.toString (),
            'margin_balance': this.amountToPrecision (symbol, amount),
            // 'strict_validate': false,
        };
        return await this.privatePutFuturesAccountIsolatedSymbol (this.extend (request, params));
    }

    async fetchDepositWithdrawFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://api.hitbtc.com/#currencies
         * @param {[string]|undefined} codes list of unified currency codes
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
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
        return this.parseDepositWithdrawFees (response, codes);
    }

    parseDepositWithdrawFee (fee, currency = undefined) {
        //
        //    {
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
        //    }
        //
        const networks = this.safeValue (fee, 'networks', []);
        const result = this.depositWithdrawFee (fee);
        for (let j = 0; j < networks.length; j++) {
            const networkEntry = networks[j];
            const networkId = this.safeString (networkEntry, 'network');
            const networkCode = this.networkIdToCode (networkId);
            const withdrawFee = this.safeNumber (networkEntry, 'payout_fee');
            const isDefault = this.safeValue (networkEntry, 'default');
            const withdrawResult = {
                'fee': withdrawFee,
                'percentage': (withdrawFee !== undefined) ? false : undefined,
            };
            if (isDefault === true) {
                result['withdraw'] = withdrawResult;
            }
            result['networks'][networkCode] = {
                'withdraw': withdrawResult,
                'deposit': {
                    'fee': undefined,
                    'percentage': undefined,
                },
            };
        }
        return result;
    }

    handleMarginModeAndParams (methodName, params = {}, defaultValue = undefined) {
        /**
         * @ignore
         * @method
         * @description marginMode specified by params["marginMode"], this.options["marginMode"], this.options["defaultMarginMode"], params["margin"] = true or this.options["defaultType"] = 'margin'
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[string|undefined, object]} the marginMode in lowercase
         */
        const defaultType = this.safeString (this.options, 'defaultType');
        const isMargin = this.safeValue (params, 'margin', false);
        let marginMode = undefined;
        [ marginMode, params ] = super.handleMarginModeAndParams (methodName, params, defaultValue);
        if (marginMode !== undefined) {
            if (marginMode !== 'isolated') {
                throw new NotSupported (this.id + ' only isolated margin is supported');
            }
        } else {
            if ((defaultType === 'margin') || (isMargin === true)) {
                marginMode = 'isolated';
            }
        }
        return [ marginMode, params ];
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
        return undefined;
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
            const signature = this.hmac (this.encode (payloadString), this.encode (this.secret), sha256, 'hex');
            const secondPayload = this.apiKey + ':' + signature + ':' + timestamp;
            const encoded = this.stringToBase64 (secondPayload);
            headers['Authorization'] = 'HS256 ' + encoded;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
