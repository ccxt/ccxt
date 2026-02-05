
// ---------------------------------------------------------------------------

import Exchange from './abstract/cryptomus.js';
import { ArgumentsRequired, ExchangeError, InsufficientFunds, InvalidOrder } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { md5 } from './static_dependencies/noble-hashes/md5.js';
import type { Balances, Currencies, Dict, int, Int, Market, Num, Order, OrderBook, OrderType, OrderSide, Str, Strings, Ticker, Tickers, Trade, TradingFees } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class cryptomus
 * @augments Exchange
 */
export default class cryptomus extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'cryptomus',
            'name': 'Cryptomus',
            'countries': [ 'CA' ],
            'rateLimit': 100, // todo check
            'version': 'v2',
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
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createOrderWithTakeProfitAndStopLossWs': false,
                'createPostOnlyOrder': false,
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
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false, // temporarily, until they fix the endpoint
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'repayMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {},
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/8e0b1c48-7c01-4177-9224-f1b01d89d7e7',
                'api': {
                    'public': 'https://api.cryptomus.com',
                    'private': 'https://api.cryptomus.com',
                },
                'www': 'https://cryptomus.com',
                'doc': 'https://doc.cryptomus.com/personal',
                'fees': 'https://cryptomus.com/tariffs', // todo check
                'referral': 'https://app.cryptomus.com/signup/?ref=JRP4yj', // todo
            },
            'api': {
                'public': {
                    'get': {
                        'v2/user-api/exchange/markets': 1, // done
                        'v2/user-api/exchange/market/price': 1, // not used
                        'v1/exchange/market/assets': 1, // done
                        'v1/exchange/market/order-book/{currencyPair}': 1, // done
                        'v1/exchange/market/tickers': 1, // done
                        'v1/exchange/market/trades/{currencyPair}': 1, // done
                    },
                },
                'private': {
                    'get': {
                        'v2/user-api/exchange/orders': 1, // done
                        'v2/user-api/exchange/orders/history': 1, // done
                        'v2/user-api/exchange/account/balance': 1, // done
                        'v2/user-api/exchange/account/tariffs': 1, // done
                        'v2/user-api/payment/services': 1,
                        'v2/user-api/payout/services': 1,
                        'v2/user-api/transaction/list': 1,
                    },
                    'post': {
                        'v2/user-api/exchange/orders': 1, // done
                        'v2/user-api/exchange/orders/market': 1, // done
                    },
                    'delete': {
                        'v2/user-api/exchange/orders/{orderId}': 1, // done
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
                    '6': InsufficientFunds, // {"code":6,"message":"Insufficient funds."}
                    'Insufficient funds.': InsufficientFunds,
                    'Minimum amount 15 USDT': InvalidOrder,
                    // {"code":500,"message":"Server error."}
                    // {"message":"Minimum amount 15 USDT","state":1}
                    // {"message":"Insufficient funds. USDT wallet balance is 35.21617400.","state":1}
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': false,
                'uid': true,
            },
            'features': {},
        });
    }

    /**
     * @method
     * @name cryptomus#fetchMarkets
     * @description retrieves data on all markets for the exchange
     * @see https://doc.cryptomus.com/personal/market-cap/tickers
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV2UserApiExchangeMarkets (params);
        //
        //     {
        //         "result": [
        //             {
        //                 "id": "01JHN5EFT64YC4HR9KCGM5M65D",
        //                 "symbol": "POL_USDT",
        //                 "baseCurrency": "POL",
        //                 "quoteCurrency": "USDT",
        //                 "baseMinSize": "1.00000000",
        //                 "quoteMinSize": "5.00000000",
        //                 "baseMaxSize": "50000.00000000",
        //                 "quoteMaxSize": "10000000000.00000000",
        //                 "basePrec": "1",
        //                 "quotePrec": "4"
        //             },
        //             ...
        //         ]
        //     }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseMarkets (result);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "id": "01JHN5EFT64YC4HR9KCGM5M65D",
        //         "symbol": "POL_USDT",
        //         "baseCurrency": "POL",
        //         "quoteCurrency": "USDT",
        //         "baseMinSize": "1.00000000",
        //         "quoteMinSize": "5.00000000",
        //         "baseMaxSize": "50000.00000000",
        //         "quoteMaxSize": "10000000000.00000000",
        //         "basePrec": "1",
        //         "quotePrec": "4"
        //     }
        //
        const marketId = this.safeString (market, 'symbol');
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
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrec'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrec'))),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'quoteMinSize'),
                    'max': this.safeNumber (market, 'quoteMaxSize'),
                },
                'price': {
                    'min': this.safeNumber (market, 'baseMinSize'),
                    'max': this.safeNumber (market, 'baseMaxSize'),
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

    /**
     * @method
     * @name cryptomus#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://doc.cryptomus.com/personal/market-cap/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
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
        const groupedById = this.groupBy (coins, 'currency_code');
        const keys = Object.keys (groupedById);
        const result: Dict = {};
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const code = this.safeCurrencyCode (id);
            const networks = {};
            const networkEntries = groupedById[id];
            for (let j = 0; j < networkEntries.length; j++) {
                const networkEntry = networkEntries[j];
                const networkId = this.safeString (networkEntry, 'network_code');
                const networkCode = this.networkIdToCode (networkId);
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (networkEntry, 'min_withdraw'),
                            'max': this.safeNumber (networkEntry, 'max_withdraw'),
                        },
                        'deposit': {
                            'min': this.safeNumber (networkEntry, 'min_deposit'),
                            'max': this.safeNumber (networkEntry, 'max_deposit'),
                        },
                    },
                    'active': undefined,
                    'deposit': this.safeBool (networkEntry, 'can_withdraw'),
                    'withdraw': this.safeBool (networkEntry, 'can_deposit'),
                    'fee': undefined,
                    'precision': undefined,
                    'info': networkEntry,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'code': code,
                'networks': networks,
                'info': networkEntries,
            });
        }
        return result;
    }

    /**
     * @method
     * @name cryptomus#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://doc.cryptomus.com/personal/market-cap/tickers
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
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
        //         "last_price": "158.04829772",
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

    /**
     * @method
     * @name cryptomus#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://doc.cryptomus.com/personal/market-cap/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.level] 0 or 1 or 2 or 3 or 4 or 5 - the level of volume
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
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
        const timestamp = this.safeTimestamp (data, 'timestamp');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    /**
     * @method
     * @name cryptomus#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://doc.cryptomus.com/personal/market-cap/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (maximum value is 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
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
        //                 "timestamp": 1726653796,
        //                 "type": "sell"
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
            'amount': this.safeString (trade, 'quote_volume'), // quote_volume is amount
            'cost': this.safeString (trade, 'base_volume'), // base_volume is cost
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

    /**
     * @method
     * @name cryptomus#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://doc.cryptomus.com/personal/converts/balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.privateGetV2UserApiExchangeAccountBalance (this.extend (request, params));
        //
        //     {
        //         "result": [
        //             {
        //                 "ticker": "AVAX",
        //                 "available": "0.00000000",
        //                 "held": "0.00000000"
        //             }
        //         ]
        //     }
        //
        const result = this.safeList (response, 'result', []);
        return this.parseBalance (result);
    }

    parseBalance (balance): Balances {
        //
        //     {
        //         "ticker": "AVAX",
        //         "available": "0.00000000",
        //         "held": "0.00000000"
        //     }
        //
        const result: Dict = {
            'info': balance,
        };
        for (let i = 0; i < balance.length; i++) {
            const balanceEntry = balance[i];
            const currencyId = this.safeString (balanceEntry, 'ticker');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balanceEntry, 'available');
            account['used'] = this.safeString (balanceEntry, 'held');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name cryptomus#createOrder
     * @description create a trade order
     * @see https://doc.cryptomus.com/personal/exchange/market-order-creation
     * @see https://doc.cryptomus.com/personal/exchange/limit-order-creation
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or for spot
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders (only for limit orders)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.clientOrderId] a unique identifier for the order (optional)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'direction': side,
            'tag': 'ccxt',
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit (params, 'clientOrderId');
            request['client_order_id'] = clientOrderId;
        }
        const sideBuy = side === 'buy';
        const amountToString = this.numberToString (amount);
        const priceToString = this.numberToString (price);
        let cost = undefined;
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
                request['value'] = cost;
            } else {
                request['quantity'] = amountToString;
            }
            response = await this.privatePostV2UserApiExchangeOrdersMarket (this.extend (request, params));
        } else if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price parameter for a ' + type + ' order');
            }
            request['quantity'] = amountToString;
            request['price'] = price;
            response = await this.privatePostV2UserApiExchangeOrders (this.extend (request, params));
        } else {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a type parameter (limit or market)');
        }
        //
        //     {
        //         "order_id": "01JEXAFCCC5ZVJPZAAHHDKQBMG"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name cryptomus#cancelOrder
     * @description cancels an open limit order
     * @see https://doc.cryptomus.com/personal/exchange/limit-order-cancellation
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in (not used in cryptomus)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        request['orderId'] = id;
        const response = await this.privateDeleteV2UserApiExchangeOrdersOrderId (this.extend (request, params));
        //
        //     {
        //         "success": true
        //     }
        //
        return this.safeOrder ({ 'info': response });
    }

    /**
     * @method
     * @name cryptomus#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://doc.cryptomus.com/personal/exchange/history-of-completed-orders
     * @param {string} symbol unified market symbol of the market orders were made in (not used in cryptomus)
     * @param {int} [since] the earliest time in ms to fetch orders for (not used in cryptomus)
     * @param {int} [limit] the maximum number of order structures to retrieve (not used in cryptomus)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.direction] order direction 'buy' or 'sell'
     * @param {string} [params.order_id] order id
     * @param {string} [params.client_order_id] client order id
     * @param {string} [params.limit] A special parameter that sets the maximum number of records the request will return
     * @param {string} [params.offset] A special parameter that sets the number of records from the beginning of the list
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV2UserApiExchangeOrdersHistory (this.extend (request, params));
        //
        //     {
        //         "result": [
        //             {
        //                 "id": "01JEXAPY04JDFBVFC2D23BCKMK",
        //                 "type": "market",
        //                 "direction": "sell",
        //                 "symbol": "TRX_USDT",
        //                 "quantity": "67.5400000000000000",
        //                 "filledQuantity": "67.5400000000000000",
        //                 "filledValue": "20.0053480000000000",
        //                 "state": "completed",
        //                 "internalState": "filled",
        //                 "createdAt": "2024-12-12 11:40:19",
        //                 "finishedAt": "2024-12-12 11:40:21",
        //                 "deal": {
        //                     "id": "01JEXAPZ9C9TWENPFZJASZ1YD2",
        //                     "state": "completed",
        //                     "createdAt": "2024-12-12 11:40:21",
        //                     "completedAt": "2024-12-12 11:40:21",
        //                     "averageFilledPrice": "0.2962000000000000",
        //                     "transactions": [
        //                         {
        //                             "id": "01JEXAPZ9C9TWENPFZJASZ1YD3",
        //                             "tradeRole": "taker",
        //                             "filledPrice": "0.2962000000000000",
        //                             "filledQuantity": "67.5400000000000000",
        //                             "filledValue": "20.0053480000000000",
        //                             "fee": "0.0000000000000000",
        //                             "feeCurrency": "USDT",
        //                             "committedAt": "2024-12-12 11:40:21"
        //                         }
        //                     ]
        //                 }
        //             },
        //             ...
        //         ]
        //     }
        //
        const result = this.safeList (response, 'result', []);
        const orders = [];
        for (let i = 0; i < result.length; i++) {
            const order = result[i];
            orders.push (this.parseOrder (order, market));
        }
        return orders;
    }

    /**
     * @method
     * @name cryptomus#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://doc.cryptomus.com/personal/exchange/list-of-active-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for (not used in cryptomus)
     * @param {int} [limit] the maximum number of  open orders structures to retrieve (not used in cryptomus)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.direction] order direction 'buy' or 'sell'
     * @param {string} [params.order_id] order id
     * @param {string} [params.client_order_id] client order id
     * @param {string} [params.limit] A special parameter that sets the maximum number of records the request will return
     * @param {string} [params.offset] A special parameter that sets the number of records from the beginning of the list
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
        };
        if (market !== undefined) {
            request['market'] = market['id'];
        }
        const response = await this.privateGetV2UserApiExchangeOrders (this.extend (request, params));
        //
        //     {
        //         "result": [
        //             {
        //                 "id": "01JFFG72CBRDP68K179KC9DSTG",
        //                 "direction": "sell",
        //                 "symbol": "BTC_USDT",
        //                 "price": "102.0130000000000000",
        //                 "quantity": "0.0005000000000000",
        //                 "value": "0.0510065000000000",
        //                 "filledQuantity": "0.0000000000000000",
        //                 "filledValue": "0.0000000000000000",
        //                 "createdAt": "2024-12-19 09:02:51",
        //                 "clientOrderId": "987654321",
        //                 "stopLossPrice": "101.12"
        //             },
        //             ...
        //         ]
        //     }
        const result = this.safeList (response, 'result', []);
        return this.parseOrders (result, market, undefined, undefined);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder
        //     {
        //         "order_id": "01JEXAFCCC5ZVJPZAAHHDKQBNG"
        //     }
        //
        // fetchOrders
        //     {
        //         "id": "01JEXAPY04JDFBVFC2D23BCKMK",
        //         "type": "market",
        //         "direction": "sell",
        //         "symbol": "TRX_USDT",
        //         "quantity": "67.5400000000000000",
        //         "filledQuantity": "67.5400000000000000",
        //         "filledValue": "20.0053480000000000",
        //         "state": "completed",
        //         "internalState": "filled",
        //         "createdAt": "2024-12-12 11:40:19",
        //         "finishedAt": "2024-12-12 11:40:21",
        //         "deal": {
        //             "id": "01JEXAPZ9C9TWENPFZJASZ1YD2",
        //             "state": "completed",
        //             "createdAt": "2024-12-12 11:40:21",
        //             "completedAt": "2024-12-12 11:40:21",
        //             "averageFilledPrice": "0.2962000000000000",
        //             "transactions": [
        //                 {
        //                     "id": "01JEXAPZ9C9TWENPFZJASZ1YD3",
        //                     "tradeRole": "taker",
        //                     "filledPrice": "0.2962000000000000",
        //                     "filledQuantity": "67.5400000000000000",
        //                     "filledValue": "20.0053480000000000",
        //                     "fee": "0.0000000000000000",
        //                     "feeCurrency": "USDT",
        //                     "committedAt": "2024-12-12 11:40:21"
        //                 }
        //             ]
        //         }
        //     },
        //     ...
        //
        // fetchOpenOrders
        //     {
        //         "id": "01JFFG72CBRDP68K179KC9DSTG",
        //         "direction": "sell",
        //         "symbol": "BTC_USDT",
        //         "price": "102.0130000000000000",
        //         "quantity": "0.0005000000000000",
        //         "value": "0.0510065000000000",
        //         "filledQuantity": "0.0000000000000000",
        //         "filledValue": "0.0000000000000000",
        //         "createdAt": "2024-12-19 09:02:51",
        //         "clientOrderId": "987654321",
        //         "stopLossPrice": "101.12"
        //     }
        //
        const id = this.safeString2 (order, 'order_id', 'id');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const dateTime = this.safeString (order, 'createdAt');
        const timestamp = this.parse8601 (dateTime);
        const deal = this.safeDict (order, 'deal', {});
        const averageFilledPrice = this.safeNumber (deal, 'averageFilledPrice');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'direction');
        let price = this.safeNumber (order, 'price');
        const transaction = this.safeList (deal, 'transactions', []);
        let fee = undefined;
        const firstTx = this.safeDict (transaction, 0);
        const feeCurrency = this.safeString (firstTx, 'feeCurrency');
        if (feeCurrency !== undefined) {
            fee = {
                'currency': this.safeCurrencyCode (feeCurrency),
                'cost': this.safeNumber (firstTx, 'fee'),
            };
        }
        if (price === undefined) {
            price = this.safeNumber (firstTx, 'filledPrice');
        }
        const amount = this.safeNumber (order, 'quantity');
        const cost = this.safeNumber (order, 'value');
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const clientOrderId = this.safeString (order, 'clientOrderId');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': this.safeString (order, 'stopLossPrice'),
            'triggerPrice': this.safeString (order, 'stopLossPrice'),
            'amount': amount,
            'cost': cost,
            'average': averageFilledPrice,
            'filled': this.safeString (order, 'filledQuantity'),
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str = undefined): Str {
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

    /**
     * @method
     * @name cryptomus#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        const response = await this.privateGetV2UserApiExchangeAccountTariffs (params);
        //
        //     {
        //         result: {
        //             equivalent_currency_code: 'USD',
        //             current_tariff_step: {
        //                 step: '0',
        //                 from_turnover: '0.00000000',
        //                 maker_percent: '0.08',
        //                 taker_percent: '0.1'
        //             },
        //             tariff_steps: [
        //                 {
        //                     step: '0',
        //                     from_turnover: '0.00000000',
        //                     maker_percent: '0.08',
        //                     taker_percent: '0.1'
        //                 },
        //                 {
        //                     step: '1',
        //                     from_turnover: '100001.00000000',
        //                     maker_percent: '0.06',
        //                     taker_percent: '0.095'
        //                 },
        //                 {
        //                     step: '2',
        //                     from_turnover: '250001.00000000',
        //                     maker_percent: '0.055',
        //                     taker_percent: '0.085'
        //                 },
        //                 {
        //                     step: '3',
        //                     from_turnover: '500001.00000000',
        //                     maker_percent: '0.05',
        //                     taker_percent: '0.075'
        //                 },
        //                 {
        //                     step: '4',
        //                     from_turnover: '2500001.00000000',
        //                     maker_percent: '0.04',
        //                     taker_percent: '0.07'
        //                 }
        //             ],
        //             daily_turnover: '0.00000000',
        //             monthly_turnover: '77.52062617',
        //             circulation_funds: '25.48900443'
        //         }
        //     }
        //
        const data = this.safeDict (response, 'result', {});
        const currentFeeTier = this.safeDict (data, 'current_tariff_step', {});
        let makerFee = this.safeString (currentFeeTier, 'maker_percent');
        let takerFee = this.safeString (currentFeeTier, 'taker_percent');
        makerFee = Precise.stringDiv (makerFee, '100');
        takerFee = Precise.stringDiv (takerFee, '100');
        const feeTiers = this.safeList (data, 'tariff_steps', []);
        const result: Dict = {};
        const tiers = this.parseFeeTiers (feeTiers);
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.parseNumber (makerFee),
                'taker': this.parseNumber (takerFee),
                'percentage': true,
                'tierBased': true,
                'tiers': tiers,
            };
        }
        return result;
    }

    parseFeeTiers (feeTiers, market: Market = undefined) {
        const takerFees = [];
        const makerFees = [];
        for (let i = 0; i < feeTiers.length; i++) {
            const tier = feeTiers[i];
            const turnover = this.safeNumber (tier, 'from_turnover');
            let taker = this.safeString (tier, 'taker_percent');
            let maker = this.safeString (tier, 'maker_percent');
            maker = Precise.stringDiv (maker, '100');
            taker = Precise.stringDiv (taker, '100');
            makerFees.push ([ turnover, this.parseNumber (maker) ]);
            takerFees.push ([ turnover, this.parseNumber (taker) ]);
        }
        return {
            'maker': makerFees,
            'taker': takerFees,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let jsonParams = '';
            headers = {
                'userId': this.uid,
            };
            if (method !== 'GET') {
                body = this.json (params);
                jsonParams = body;
                headers['Content-Type'] = 'application/json';
            } else {
                const query = this.urlencode (params);
                if (query.length !== 0) {
                    url += '?' + query;
                }
            }
            const jsonParamsBase64 = this.stringToBase64 (jsonParams);
            const stringToSign = jsonParamsBase64 + this.secret;
            const signature = this.hash (this.encode (stringToSign), md5);
            headers['sign'] = signature;
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
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
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
