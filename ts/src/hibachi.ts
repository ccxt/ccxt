
// ---------------------------------------------------------------------------

import Exchange from './abstract/hibachi.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Currencies, Dict, Market, Str, Ticker, Trade, Int, Num, OrderSide, OrderType } from './base/types.js';
import { ecdsa } from './base/functions/crypto.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';

// ---------------------------------------------------------------------------

/**
 * @class hibachi
 * @augments Exchange
 */
export default class hibachi extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'hibachi',
            'name': 'Hibachi',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'userAgent': this.userAgents['chrome'],
            'certified': false,
            'pro': false,
            'dex': true,
            // TODO: flip it to `true` once we implement the handler
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
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
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
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
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': 'emulated',
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                // TODO: add all timeframes
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/xxx', // TODO: upload logo
                'api': {
                    'public': 'https://data-api.hibachi.xyz',
                    'private': 'https://api.hibachi.xyz',
                },
                'www': 'https://www.hibachi.xyz/',
            },
            'api': {
                'public': {
                    'get': {
                        'market/exchange-info': 1,
                        'market/data/trades': 1,
                        'market/data/prices': 1,
                        'market/data/stats': 1,
                    },
                },
                'private': {
                    'get': {
                        'trade/account/info': 1,
                    },
                    'delete': {
                        'trade/order': 1,
                    },
                    'post': {
                        'trade/order': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'accountId': true,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0000'),
                    'taker': this.parseNumber ('0.0002'),
                },
            },
            'options': {
            },
            'features': {
                'default': {
                    // TODO: add settings here
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'symbol');
        const numericId = this.safeNumber (market, 'id');
        const marketType = 'swap';
        const baseId = this.safeString (market, 'underlyingSymbol');
        const quoteId = this.safeString (market, 'settlementSymbol');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settleId: Str = this.safeString (market, 'settlementSymbol');
        const settle: Str = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const underlyingDecimals = this.safeNumber (market, 'underlyingDecimals');
        const settlementDecimals = this.safeNumber (market, 'settlementDecimals');
        return {
            'id': marketId,
            'numericId': numericId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeString (market, 'status') === 'LIVE',
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': 10 ** (-underlyingDecimals),
                'price': 10 ** (underlyingDecimals - settlementDecimals) / (2 ** 32),
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
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'minNotional'),
                    'max': undefined,
                },
            },
            // We don't expose this timestamp yet. Hardcode to the launch date of our exchange: 2024/10/10
            // TODO: use the real timestamp once we have it
            'created': 1728561600000,
            'info': market,
        };
    }

    /**
     * @method
     * @name hibachi#fetchMarkets
     * @description retrieves data on all markets for hibachi
     * @see https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarketExchangeInfo (params);
        // {
        //     "displayName": "ETH/USDT Perps",
        //     "id": 1,
        //     "maintenanceFactorForPositions": "0.030000",
        //     "marketCloseTimestamp": null,
        //     "marketOpenTimestamp": null,
        //     "minNotional": "1",
        //     "minOrderSize": "0.000000001",
        //     "orderbookGranularities": [
        //         "0.01",
        //         "0.1",
        //         "1",
        //         "10"
        //     ],
        //     "riskFactorForOrders": "0.066667",
        //     "riskFactorForPositions": "0.030000",
        //     "settlementDecimals": 6,
        //     "settlementSymbol": "USDT",
        //     "status": "LIVE",
        //     "stepSize": "0.000000001",
        //     "symbol": "ETH/USDT-P",
        //     "tickSize": "0.000001",
        //     "underlyingDecimals": 9,
        //     "underlyingSymbol": "ETH"
        // },
        const rows = this.safeList (response, 'futureContracts');
        return this.parseMarkets (rows);
    }

    /**
     * @method
     * @name hibachi#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        // Hibachi only supports USDT on Arbitrum at this time
        // We don't have an API endpoint to expose this information yet
        const result: Dict = {};
        const networks: Dict = {};
        const networkId = 'ARBITRUM';
        networks[networkId] = {
            'id': networkId,
            'network': networkId,
            'limits': {
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'info': {},
        };
        const code = this.safeCurrencyCode ('USDT');
        result[code] = this.safeCurrencyStructure ({
            'id': 'USDT',
            'name': 'USDT',
            'type': 'fiat',
            'code': code,
            'precision': this.parseNumber ('0.000001'),
            'active': true,
            'fee': undefined,
            'networks': networks,
            'deposit': true,
            'withdraw': true,
            'limits': {
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': {},
        });
        return result;
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        // Hibachi only supports USDT on Arbitrum at this time
        const code = this.safeCurrencyCode ('USDT');
        const account = this.account ();
        account['total'] = this.safeString (response, 'balance');
        account['free'] = this.safeString (response, 'maximalWithdraw');
        result[code] = account;
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name hibachi#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        this.checkRequiredCredentials ();
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.privateGetTradeAccountInfo (this.extend (request, params));
        //
        // {
        //     assets: [ { quantity: '3.000000', symbol: 'USDT' } ],
        //     balance: '3.000000',
        //     maximalWithdraw: '3.000000',
        //     numFreeTransfersRemaining: '100',
        //     positions: [],
        //     totalOrderNotional: '0.000000',
        //     totalPositionNotional: '0.000000',
        //     totalUnrealizedFundingPnl: '0.000000',
        //     totalUnrealizedPnl: '0.000000',
        //     totalUnrealizedTradingPnl: '0.000000',
        //     tradeMakerFeeRate: '0.00000000',
        //     tradeTakerFeeRate: '0.00020000'
        // }
        //
        return this.parseBalance (response);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const prices = this.safeDict (ticker, 'prices');
        const stats = this.safeDict (ticker, 'stats');
        const bid = this.safeFloat (prices, 'bidPrice');
        const ask = this.safeFloat (prices, 'askPrice');
        const last = this.safeFloat (prices, 'tradePrice');
        const high = this.safeFloat (stats, 'high24h');
        const low = this.safeFloat (stats, 'low24h');
        const volume = this.safeFloat (stats, 'volume24h');
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': undefined,
            'datetime': undefined,
            'bid': bid,
            'ask': ask,
            'last': last,
            'high': high,
            'low': low,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': ticker,
        }, market);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        // public fetchTrades:
        //      {
        //          "price": "3512.431902",
        //          "quantity": "1.414780098",
        //          "takerSide": "Buy",
        //          "timestamp": 1712692147
        //      }
        const timestamp = this.safeTimestamp (trade, 'timestamp'); // in seconds
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'quantity');
        let side = this.safeString (trade, 'takerSide');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        return this.safeTrade ({
            'id': undefined,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'takerOrMaker': 'taker',
            'fee': undefined,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name hibachi#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-doc.hibachi.xyz/#86a53bc1-d3bb-4b93-8a11-7034d4698caa
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (maximum value is 100)
     * @param {object} [params] extra parameters specific to the hibachi api endpoint
     * @returns {object[]} a list of recent [trade structures]
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketDataTrades (this.extend (request, params));
        //
        // {
        //     "trades": [
        //         {
        //             "price": "111091.38352",
        //             "quantity": "0.0090090093",
        //             "takerSide": "Buy",
        //             "timestamp": 1752095479
        //         },
        //     ]
        // }
        //
        const trades = this.safeList (response, 'trades', []);
        return this.parseTrades (trades, market);
    }

    /**
     * @method
     * @name hibachi#fetchTicker
     * @see https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47
     * @description fetches a price ticker and the related information for the past 24h
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the hibachi api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: Str, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const prices_response = await this.publicGetMarketDataPrices (this.extend (request));
        // {
        //     "askPrice": "3514.650296",
        //     "bidPrice": "3513.596112",
        //     "fundingRateEstimation": {
        //         "estimatedFundingRate": "0.000001",
        //         "nextFundingTimestamp": 1712707200
        //     },
        //     "markPrice": "3514.288858",
        //     "spotPrice": "3514.715000",
        //     "symbol": "ETH/USDT-P",
        //     "tradePrice": "2372.746570"
        // }
        const stats_response = await this.publicGetMarketDataStats (this.extend (request));
        // {
        //     "high24h": "3819.507827",
        //     "low24h": "3754.474162",
        //     "symbol": "ETH/USDT-P",
        //     "volume24h": "23554.858590416"
        // }
        const ticker = {
            'prices': prices_response,
            'stats': stats_response,
        };
        return this.parseTicker (ticker, market);
    }

    orderMessage (market, nonce: number, fee_rate: number, type: OrderType, side: OrderSide, amount: number, price: Num = undefined) {
        let side_code = 0;
        if (side === 'ask') {
            side_code = 0;
        } else if (side === 'buy') {
            side_code = 1;
        }
        // TODO: it will be safer to use big decimal to avoid rounding errors
        const eps = 1e-9;
        const encodedNonce = this.base16ToBinary (this.intToBase16 (nonce).padStart (16, '0'));
        const encodedMarketId = this.base16ToBinary (this.intToBase16 (market.numericId).padStart (8, '0'));
        const encodedQuantity = this.base16ToBinary (this.intToBase16 (Math.floor (amount / market.precision.amount + eps)).padStart (16, '0'));
        const encodedSide = this.base16ToBinary (this.intToBase16 (side_code).padStart (8, '0'));
        const encodedFeeRate = this.base16ToBinary (this.intToBase16 (Math.floor (fee_rate * (10 ** 8) + eps)).padStart (16, '0'));
        let encodedPrice = this.binaryConcat ();
        if (type === 'limit') {
            encodedPrice = this.base16ToBinary (this.intToBase16 (Math.floor (price / market.precision.price + eps)).padStart (16, '0'));
        }
        const message = this.binaryConcat (encodedNonce, encodedMarketId, encodedQuantity, encodedSide, encodedPrice, encodedFeeRate);
        return message;
    }

    /**
     * @method
     * @name hibachi#createOrder
     * @description create a trade order
     * @see https://api-doc.hibachi.xyz/#00f6d5ad-5275-41cb-a1a8-19ed5d142124
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const nonce = this.nonce ();
        const fee_rate = Math.max (market.taker, market.maker);
        let side_internal = '';
        if (side === 'sell') {
            side_internal = 'ASK';
        } else if (side === 'buy') {
            side_internal = 'BID';
        }
        let price_internal = '';
        if (price) {
            price_internal = price.toString ();
        }
        const message = this.orderMessage (market, nonce, fee_rate, type, side, amount, price);
        const signature = this.signMessage (message, this.privateKey);
        const request = {
            'accountId': this.accountId,
            'symbol': market.id,
            'nonce': nonce,
            'side': side_internal,
            'orderType': type.toUpperCase (),
            'quantity': amount.toString (),
            'price': price_internal,
            'signature': signature,
            'maxFeesPercent': fee_rate.toString (),
        };
        const response = await this.privatePostTradeOrder (request);
        //
        // {
        //     "orderId": "578721673790138368"
        // }
        //
        return this.safeOrder ({
            'id': response.orderId,
            'status': 'pending',
        });
    }

    /**
     * @method
     * @name hibachi#cancelOrder
     * @see https://api-doc.hibachi.xyz/#e99c4f48-e610-4b7c-b7f6-1b4bb7af0271
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol is unused
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        this.checkRequiredCredentials ();
        const message = this.base16ToBinary (this.intToBase16 (this.parseToInt (id)).padStart (16, '0'));
        const signature = this.signMessage (message, this.privateKey);
        const request: Dict = {
            'accountId': this.accountId,
            'orderId': id,
            'signature': signature,
        };
        await this.privateDeleteTradeOrder (this.extend (request, params));
        // At this time the response body is empty. A 200 response means the cancel request is accepted and sent to cancel
        //
        // {}
        //
        return this.safeOrder ({
            'id': id,
            'status': 'canceled',
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    hashMessage (message) {
        return this.hash (message, sha256, 'hex');
    }

    signHash (hash, privateKey) {
        // We only support ECDSA signature for trustless account for now
        // TODO: add support for HMAC signature for exchange managed account
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = signature['v'];
        return r.padStart (64, '0') + s.padStart (64, '0') + v.toString (16).padStart (2, '0');
    }

    signMessage (message, privateKey) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        headers = {};
        if (method === 'GET') {
            const request = this.omit (params, this.extractParams (path));
            const query = this.urlencode (request);
            if (query.length !== 0) {
                url += '?' + query;
            }
        }
        if (method === 'POST' || method === 'DELETE') {
            headers['content-type'] = 'application/json';
            body = this.json (params);
        }
        if (api === 'private') {
            headers['Authorization'] = this.apiKey;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
