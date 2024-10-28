
// ---------------------------------------------------------------------------

import Exchange from './abstract/cryptomus.js';
import { ArgumentsRequired, ExchangeError, InsufficientFunds, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { md5 } from './static_dependencies/noble-hashes/md5.js';
import type { Balances, Currencies, Dict, int, Int, Market, Num, Order, OrderBook, OrderType, OrderSide, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

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
            'countries': [ 'CA' ],
            'rateLimit': 100, // todo check
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
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
                'fetchOrders': true,
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
                'createMarketBuyOrderRequiresPrice': true,
                'networks': {
                    'BEP20': 'bsc',
                    'DASH': 'dash',
                    'POLYGON': 'polygon',
                    'ARB': 'arbitrum',
                    'SOL': 'sol',
                    'TON': 'ton',
                    'ERC20': 'eth',
                    'TRC20': 'tron',
                    'LTC': 'ltc',
                    'XMR': 'xmr',
                    'BCH': 'bch',
                    'DOGE': 'doge',
                    'AVAX': 'avalanche',
                    'BTC': 'btc',
                    'RUB': 'rub',
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
                    '500': ExchangeError,
                    'Insufficient funds': InsufficientFunds,
                    'Minimum amount 15 USDT': InvalidOrder,
                    // {"code":500,"message":"Server error."}
                    // {"message":"Minimum amount 15 USDT","state":1}
                    // {"message":"Insufficient funds. USDT wallet balance is 35.21617400.","state":1}
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
        //
        //     {
        //         "data": [
        //         {
        //             "currency_pair": "MATIC_USDT",
        //             "last_price": "0.342",
        //             "base_volume": "1676.84092771",
        //             "quote_volume": "573.48033609043"
        //         },
        //         ...
        //     }
        //
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
        const marketId = this.safeString (ticker, 'currency_pair');
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
        [ level, params ] = this.handleOptionAndParams (params, 'fetchOrderBook', 'level', level);
        request['level'] = level;
        const response = await this.publicGetV1ExchangeMarketOrderBookCurrencyPair (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "timestamp": "1730138702",
        //             "bids": [
        //                 {
        //                     "price": "2250.00",
        //                     "quantity": "1.00000"
        //                 }
        //             ],
        //             "asks": [
        //                 {
        //                     "price": "2428.69",
        //                     "quantity": "0.16470"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
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
        //     {
        //         "data": [
        //             {
        //                 "trade_id": "01J829C3RAXHXHR09HABGQ1YAT",
        //                 "price": "2315.6320500000000000",
        //                 "base_volume": "21.9839623057260000",
        //                 "quote_volume": "0.0094937200000000",
        //                 "timestamp": 1726653796,"type": "sell"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data');
        return this.parseTrades (data, market, since, limit);
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

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name cryptomus#createOrder
         * @description create a trade order
         * @see https://doc.cryptomus.com/personal/converts/market-order
         * @see https://doc.cryptomus.com/personal/converts/limit-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or for spot
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders (only for limit orders)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const base = this.safeCurrencyCode (market['base']);
        const quote = this.safeCurrencyCode (market['quote']);
        const request: Dict = {};
        const sideBuy = side === 'buy';
        if (sideBuy) {
            request['from'] = quote;
            request['to'] = base;
        } else {
            request['from'] = base;
            request['to'] = quote;
        }
        const amountToString = amount.toString ();
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires an amount parameter');
        } else {
            request['amount'] = amountToString;
        }
        const priceToString = price.toString ();
        let cost: Str = undefined;
        [ cost, params ] = this.handleParamString (params, 'cost');
        let response = undefined;
        if (type === 'market') {
            if (sideBuy) {
                let createMarketBuyOrderRequiresPrice = true;
                [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if ((price === undefined) && (cost === undefined)) {
                        throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option of param to false and pass the cost to spend in the amount argument');
                    } else if (cost === undefined) {
                        cost = Precise.stringMul (amountToString, priceToString);
                    }
                } else {
                    cost = cost ? cost : amountToString;
                }
            }
            request['amount'] = sideBuy ? cost : amountToString;
            response = await this.privatePostV2UserApiConvert (this.extend (request, params));
        } else if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price parameter for a ' + type + ' order');
            } else {
                request['price'] = priceToString;
            }
            if (sideBuy) {
                request['amount'] = Precise.stringMul (amountToString, priceToString);
            } else {
                request['amount'] = amountToString;
            }
            response = await this.privatePostV2UserApiConvertLimit (this.extend (request, params));
        } else {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a type parameter (limit or market)');
        }
        //
        //     {
        //         "state": 0,
        //         "result": {
        //             "order_id": 0,
        //             "uuid": "997c8a3c-17df-407f-a971-c13c8723fb57",
        //             "convert_amount_from": "15",
        //             "convert_amount_to": "0.00681818",
        //             "executed_amount_from": "15",
        //             "executed_amount_to": "0.00681818",
        //             "convert_currency_from": "USDT",
        //             "convert_currency_to": "ETH",
        //             "type": "limit",
        //             "status": "active",
        //             "created_at": "2024-09-10T17:37:52+03:00",
        //             "current_rate": "2200",
        //             "limit": "2200",
        //             "expires_at": null
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#cancelOrder
         * @description cancels an open limit order
         * @see https://doc.cryptomus.com/personal/converts/cancel-limit-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in (not used in cryptomus)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        request['orderUuid'] = id;
        const response = await this.privateDeleteV2UserApiConvertOrderUuid (this.extend (request, params));
        //
        //     {
        //         "state": 0,
        //         "result": {
        //             "order_id": 0,
        //             "uuid": "1b96da42-c850-4543-ad10-fd78d433bfe2",
        //             "convert_amount_from": "0.006",
        //             "convert_amount_to": "13.2",
        //             "executed_amount_from": "0.006",
        //             "executed_amount_to": "13.2",
        //             "convert_currency_from": "ETH",
        //             "convert_currency_to": "USDT",
        //             "type": "limit",
        //             "status": "cancelled",
        //             "created_at": "2024-09-10T18:26:57+03:00",
        //             "current_rate": null,
        //             "limit": "2200",
        //             "expires_at": null
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        return this.parseOrder (result);
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name cryptomus#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://doc.cryptomus.com/personal/converts/orders-list
         * @param {string} symbol unified market symbol of the market orders were made in (not used in cryptomus)
         * @param {int} [since] the earliest time in ms to fetch orders for (not used in cryptomus)
         * @param {int} [limit] the maximum number of order structures to retrieve (not used in cryptomus)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetV2UserApiConvertOrderList (params);
        //
        //     {
        //         "state": 0,
        //         "result": {
        //             "items": [
        //                 {
        //                     "order_id": 0,
        //                     "uuid": "68ebc2f8-1aee-4ccc-b9b2-fabc67546221",
        //                     "convert_amount_from": "0.012",
        //                     "convert_amount_to": "28.8",
        //                     "executed_amount_from": "0.012",
        //                     "executed_amount_to": "28.8",
        //                     "convert_currency_from": "ETH",
        //                     "convert_currency_to": "USDT",
        //                     "type": "limit",
        //                     "status": "active",
        //                     "created_at": "2024-09-12T13:23:49+03:00",
        //                     "current_rate": "2400",
        //                     "limit": "2400",
        //                     "expires_at": null
        //                 },
        //                 ...
        //             ],
        //             "paginate": {
        //                 "count": 5,
        //                 "hasPages": false,
        //                 "nextCursor": null,
        //                 "previousCursor": null,
        //                 "perPage": 15
        //             }
        //         }
        //     }
        //
        const result = this.safeDict (response, 'result', {});
        const orders = this.safeList (result, 'items', []);
        return this.parseOrders (orders, market, undefined, undefined);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "order_id": 0,
        //         "uuid": "997c8a3c-17df-407f-a971-c13c8723fb57",
        //         "convert_amount_from": "15",
        //         "convert_amount_to": "0.00681818",
        //         "executed_amount_from": "15",
        //         "executed_amount_to": "0.00681818",
        //         "convert_currency_from": "USDT",
        //         "convert_currency_to": "ETH",
        //         "type": "limit",
        //         "status": "active",
        //         "created_at": "2024-09-10T17:37:52+03:00",
        //         "current_rate": "2200",
        //         "limit": "2200",
        //         "expires_at": null
        //     }
        //
        const id = this.safeString (order, 'uuid');
        const dateTime = this.safeString (order, 'created_at');
        const timestamp = this.parse8601 (dateTime);
        const fromId = this.safeString (order, 'convert_currency_from');
        const toId = this.safeString (order, 'convert_currency_to');
        const marketId = this.parseOrderMarketId (fromId, toId);
        market = this.safeMarket (marketId, market);
        let isSell = undefined;
        if (market['baseId'] === fromId) {
            isSell = true;
        } else if (market['baseId'] === toId) {
            isSell = false;
        }
        const type = this.safeString (order, 'type');
        const price = this.safeNumber (order, 'limit');
        const amount = this.safeNumber (order, 'convert_amount_to');
        const cost = this.safeNumber (order, 'convert_amount_from');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': isSell ? 'sell' : 'buy',
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderMarketId (fromId: string, toId: string): string {
        let marketId = fromId + '_' + toId;
        if (marketId in this.markets_by_id) {
            return marketId;
        }
        marketId = toId + '_' + fromId;
        if (marketId in this.markets_by_id) {
            return marketId;
        }
        return undefined;
    }

    parseOrderStatus (status: string): string {
        const statuses = {
            'active': 'open',
            'completed': 'closed',
            'partially_completed': 'open',
            'cancelled': 'canceled',
            'expired': 'expired',
            'failed': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let jsonParams = '';
            if (method !== 'GET') {
                body = this.json (params);
                jsonParams = body;
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

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if ('code' in response) {
            const code = this.safeString (response, 'code');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, code, feedback);
            throw new ExchangeError (feedback);
        } else if ('message' in response) {
            //
            //      {"message":"Minimum amount 15 USDT","state":1}
            //
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
