
// ---------------------------------------------------------------------------

import Exchange from './abstract/cryptomus.js';
// import { AccountNotEnabled, AccountSuspended, ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ContractUnavailable, DDoSProtection, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidAddress, InvalidNonce, InvalidOrder, NotSupported, OperationFailed, OperationRejected, OrderImmediatelyFillable, OrderNotFillable, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { md5 } from './static_dependencies/noble-hashes/md5.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Dict, Int, Market, OrderBook, Strings, Ticker, Tickers, Trade } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class cryptomus
 * @augments Exchange
 */
export default class cryptomus extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cryptomus',
            'name': 'Cryptomus',
            'countries': [ '' ], // todo
            'rateLimit': 100, // todo check
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {},
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://api.cryptomus.com',
                    'private': 'https://api.cryptomus.com',
                },
                'www': 'https://cryptomus.com',
                'doc': 'https://doc.cryptomus.com/personal',
                'fees': 'https://cryptomus.com/tariffs', // todo check
                'referral': '', // todo
            },
            'api': {
                'public': {
                    'get': {
                        'v1/exchange/market/assets': 1,
                        'v1/exchange/market/order-book/{currencyPair}': 1,
                        'v1/exchange/market/tickers': 1,
                        'v1/exchange/market/trades/{currencyPair}': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/user-api/balance': 1,
                        'v2/user-api/convert/direction-list': 1,
                        'v2/user-api/convert/order-list': 1,
                    },
                    'post': {
                        'v2/user-api/convert/calculate': 1,
                        'v2/user-api/convert/': 1,
                        'v2/user-api/convert/limit': 1,
                    },
                    'delete': {
                        'v2/user-api/convert/{orderUuid}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'feeSide': 'get',
                    'maker': this.parseNumber ('0.02'),
                    'taker': this.parseNumber ('0.02'),
                },
            },
            'options': {
                'networks': {
                    // todo
                },
                'networksById': {
                    'bsc': 'BEP20',
                    'dash': 'DASH',
                    'polygon': 'POLYGON',
                    'arbitrum': 'ARB',
                    'sol': 'SOL',
                    'ton': 'TON',
                    'eth': 'ERC20',
                    'tron': 'TRC20',
                    'ltc': 'LTC',
                    'xmr': 'XMR',
                    'bch': 'BCH',
                    'doge': 'DOGE',
                    'avalanche': 'AVAX',
                    'btc': 'BTC',
                    'rub': 'RUB',
                },
                'fetchOrderBook': {
                    'level': 0, // 0, 1, 2, 4 or 5
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // todo
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name cryptomus#fetchMarkets
         * @description retrieves data on all markets for the exchange
         * @see https://doc.cryptomus.com/personal/market-cap/tickers
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetV1ExchangeMarketTickers (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "currency_pair": "XMR_USDT",
        //                 "last_price": "158.04829771",
        //                 "base_volume": "0.35185785",
        //                 "quote_volume": "55.523761128544"
        //             },
        //             {
        //                 "currency_pair": "AVAX_USDT",
        //                 "last_price": "23.80761382",
        //                 "base_volume": "45.09235372",
        //                 "quote_volume": "1073.5458110958"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data');
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "currency_pair": "XMR_USDT",
        //         "last_price": "158.04829771",
        //         "base_volume": "0.35185785",
        //         "quote_volume": "55.523761128544"
        //     }
        //
        const marketId = this.safeString (market, 'currency_pair');
        const parts = marketId.split ('_');
        const baseId = parts[0];
        const quoteId = parts[1];
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const fees = this.safeDict (this.fees, 'trading');
        return this.safeMarketStructure ({
            'id': marketId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': true,
            'type': 'spot',
            'subType': undefined,
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'settle': undefined,
            'settleId': undefined,
            'contractSize': undefined,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber (fees, 'taker'),
            'maker': this.safeNumber (fees, 'maker'),
            'percentage': this.safeBool (fees, 'percentage'),
            'tierBased': undefined,
            'feeSide': this.safeString (fees, 'feeSide'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name cryptomus#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://doc.cryptomus.com/personal/market-cap/assets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetV1ExchangeMarketAssets (params);
        //
        //     {
        //         'state': '0',
        //         'result': [
        //             {
        //                 'currency_code': 'USDC',
        //                 'network_code': 'bsc',
        //                 'can_withdraw': true,
        //                 'can_deposit': true,
        //                 'min_withdraw': '1.00000000',
        //                 'max_withdraw': '10000000.00000000',
        //                 'max_deposit': '10000000.00000000',
        //                 'min_deposit': '1.00000000'
        //             },
        //             ...
        //         ]
        //     }
        //
        const coins = this.safeList (response, 'result');
        const result: Dict = {};
        for (let i = 0; i < coins.length; i++) {
            const currency = coins[i];
            const currencyId = this.safeString (currency, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const allowWithdraw = this.safeBool (currency, 'can_withdraw');
            const allowDeposit = this.safeBool (currency, 'can_deposit');
            const isActive = allowWithdraw && allowDeposit;
            const networkId = this.safeString (currency, 'network_code');
            const networksById = this.safeDict (this.options, 'networksById');
            const networkName = this.safeString (networksById, networkId, networkId);
            const minWithdraw = this.safeNumber (currency, 'min_withdraw');
            const maxWithdraw = this.safeNumber (currency, 'max_withdraw');
            const minDeposit = this.safeNumber (currency, 'min_deposit');
            const maxDeposit = this.safeNumber (currency, 'max_deposit');
            const network = {
                'id': networkId,
                'network': networkName,
                'limits': {
                    'withdraw': {
                        'min': minWithdraw,
                        'max': maxWithdraw,
                    },
                    'deposit': {
                        'min': minDeposit,
                        'max': maxDeposit,
                    },
                },
                'active': isActive,
                'deposit': allowDeposit,
                'withdraw': allowWithdraw,
                'fee': undefined,
                'precision': undefined,
                'info': currency,
            };
            const networks = {};
            networks[networkName] = network;
            if (!(code in result)) {
                result[code] = {
                    'id': currencyId,
                    'code': code,
                    'precision': undefined,
                    'type': undefined,
                    'name': undefined,
                    'active': isActive,
                    'deposit': allowDeposit,
                    'withdraw': allowWithdraw,
                    'fee': undefined,
                    'limits': {
                        'withdraw': {
                            'min': minWithdraw,
                            'max': maxWithdraw,
                        },
                        'deposit': {
                            'min': minDeposit,
                            'max': maxDeposit,
                        },
                    },
                    'networks': networks,
                    'info': currency,
                };
            } else {
                const parsed = result[code];
                const parsedNetworks = this.safeDict (parsed, 'networks');
                parsed['networks'] = this.extend (parsedNetworks, networks);
                if (isActive) {
                    parsed['active'] = true;
                    parsed['deposit'] = true;
                    parsed['withdraw'] = true;
                } else {
                    if (allowWithdraw) {
                        parsed['withdraw'] = true;
                    }
                    if (allowDeposit) {
                        parsed['deposit'] = true;
                    }
                }
                const parsedLimits = this.safeDict (parsed, 'limits');
                const withdrawLimits = {
                    'min': undefined,
                    'max': undefined,
                };
                const parsedWithdrawLimits = this.safeDict (parsedLimits, 'withdraw', withdrawLimits);
                const depositLimits = {
                    'min': undefined,
                    'max': undefined,
                };
                const parsedDepositLimits = this.safeDict (parsedLimits, 'deposit', depositLimits);
                if (minWithdraw) {
                    withdrawLimits['min'] = parsedWithdrawLimits['min'] ? Math.min (parsedWithdrawLimits['min'], minWithdraw) : minWithdraw;
                }
                if (maxWithdraw) {
                    withdrawLimits['max'] = parsedWithdrawLimits['max'] ? Math.max (parsedWithdrawLimits['max'], maxWithdraw) : maxWithdraw;
                }
                if (minDeposit) {
                    depositLimits['min'] = parsedDepositLimits['min'] ? Math.min (parsedDepositLimits['min'], minDeposit) : minDeposit;
                }
                if (maxDeposit) {
                    depositLimits['max'] = parsedDepositLimits['max'] ? Math.max (parsedDepositLimits['max'], maxDeposit) : maxDeposit;
                }
                const limits = {
                    'withdraw': withdrawLimits,
                    'deposit': depositLimits,
                };
                parsed['limits'] = limits;
            }
        }
        return result;
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name cryptomus#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://doc.cryptomus.com/personal/market-cap/tickers
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV1ExchangeMarketTickers (params);
        // todo check
        const data = this.safeList (response, 'data');
        return this.parseTickers (data, symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        //     {
        //         "currency_pair": "XMR_USDT",
        //         "last_price": "158.04829771",
        //         "base_volume": "0.35185785",
        //         "quote_volume": "55.523761128544"
        //     }
        //
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume'),
            'quoteVolume': this.safeString (ticker, 'quote_volume'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name cryptomus#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://doc.cryptomus.com/personal/market-cap/orderbook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.level] 0 or 1 or 2 or 3 or 4 or 5 - the level of volume
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'currencyPair': market['id'],
        };
        let level = 0;
        [ level, params ] = this.handleOptionAndParams (params, 'fetchOrderBook', 'leve', level);
        request['level'] = level;
        const response = await this.publicGetV1ExchangeMarketOrderBookCurrencyPair (this.extend (request, params));
        //
        // todo check
        //
        const result = this.safeDict (response, 'result');
        const timestamp = this.safeInteger (result, 'timestamp');
        return this.parseOrderBook (result, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name cryptomus#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://doc.cryptomus.com/personal/market-cap/trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch (maximum value is 100)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'currencyPair': market['id'],
        };
        const response = await this.publicGetV1ExchangeMarketTradesCurrencyPair (this.extend (request, params));
        //
        // todo check
        //
        const result = this.safeList (response, 'result');
        return this.parseTrades (result, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "trade_id": "01J017Q6B3JGHZRP9D2NZHVKFX",
        //         "price": "59498.63487492",
        //         "base_volume": "94.00784310",
        //         "quote_volume": "0.00158000",
        //         "timestamp": 1718028573,
        //         "type": "sell"
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        return this.safeTrade ({
            'id': this.safeString (trade, 'trade_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'side': this.safeString (trade, 'type'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'quote_volume'), // todo check
            'cost': this.safeString (trade, 'base_volume'), // todo check
            'takerOrMaker': undefined,
            'type': undefined,
            'order': undefined,
            'fee': {
                'currency': undefined,
                'cost': undefined,
            },
            'info': trade,
        }, market);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name cryptomus#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://doc.cryptomus.com/personal/converts/balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateGetV2UserApiBalance (this.extend (request, params));
        //
        //     {
        //         "state": 0,
        //         "result":
        //         ...
        //         {
        //             "balances": [
        //                 {
        //                     "walletUuid": "cc94572d-beaf-4c12-90cb-09507451dd3a",
        //                     "currency_code": "USDT",
        //                     "balance": "49.20000000",
        //                     "balanceUsd": "49.20"
        //                 }
        //             ]
        //         }
        //         ...
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseBalance (result);
    }

    parseBalance (balance): Balances {
        //
        //     {
        //         "walletUuid": "cc94572d-beaf-4c12-90cb-09507451dd3a",
        //         "currency_code": "USDT",
        //         "balance": "49.20000000",
        //         "balanceUsd": "49.20"
        //     }
        //
        const result: Dict = {
            'info': balance,
        };
        const balances = this.safeList (balance, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balanceEntry = balances[i];
            const currencyId = this.safeString (balanceEntry, 'currency_code');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balanceEntry, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let jsonParams = '';
            if (method !== 'GET') {
                jsonParams = this.json (params);
                body = jsonParams;
            }
            const jsonParamsBase64 = this.stringToBase64 (jsonParams);
            const stringToSign = jsonParamsBase64 + this.secret;
            const signature = this.hash (this.encode (stringToSign), md5);
            headers = {
                'userId': this.uid, // the correct parameter name is 'userId' in camelcase regardless of their API docs
                'sign': signature,
                'Content-Type': 'application/json',
            };
        } else {
            const query = this.urlencode (params);
            if (query.length !== 0) {
                url += '?' + query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
