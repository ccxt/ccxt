
// ---------------------------------------------------------------------------

import Exchange from './abstract/defx.js';
// import { AuthenticationError, RateLimitExceeded, BadRequest, OperationFailed, ExchangeError, InvalidOrder, ArgumentsRequired, NotSupported, OnMaintenance } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
// import type { TransferEntry, Balances, Conversion, Currency, FundingRateHistory, Int, Market, MarginModification, MarketType, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Dict, Bool, Strings, Trade, Transaction, Leverage, Account, Currencies, TradingFees, int, FundingHistory, LedgerEntry, FundingRate, FundingRates, DepositAddress } from './base/types.js';
import { NotSupported } from './base/errors.js';
import type { Dict, int, Market, Ticker, Tickers, Strings } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class defx
 * @augments Exchange
 */
export default class defx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'defx',
            'name': 'Defx X',
            // 'countries': [ '' ],
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'pro': false,
            'hostname': 'defx.com',
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': true,
                'fetchConvertQuote': true,
                'fetchConvertTrade': true,
                'fetchConvertTradeHistory': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': true,
                'fetchFundingInterval': true,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/defxtrade-documents/#token-withdraw
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'public': 'https://api.testnet.{hostname}',
                    'private': 'https://api.testnet.{hostname}',
                },
                'www': 'https://defx.com/home',
                'doc': [
                    'https://docs.defx.com/docs',
                    'https://api-docs.defx.com/',
                ],
                'fees': [
                    '',
                ],
                'referral': {
                    'url': '',
                },
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'healthcheck/ping': 1,
                            'symbols/{symbol}/ohlc': 1,
                            'symbols/{symbol}/trades': 1,
                            'symbols/{symbol}/prices': 1,
                            'symbols/{symbol}/ticker/24hr': 1,
                            'symbols/{symbol}/depth/5/0.01': 1,
                            'ticker/24HrAgg': 1,
                            'c/markets': 1,
                            'c/markets/metadata': 1,
                            'analytics/market/stats/newUsers': 1,
                            'analytics/market/stats/tvl': 1,
                            'analytics/market/stats/volumeByInstrument': 1,
                            'analytics/market/stats/liquidation': 1,
                            'analytics/market/stats/totalVolume': 1,
                            'analytics/market/stats/openInterest': 1,
                            'analytics/market/stats/totalTrades': 1,
                            'analytics/market/stats/basis': 1,
                            'analytics/market/stats/insuranceFund': 1,
                            'analytics/market/stats/longAndShortRatio': 1,
                            'analytics/market/stats/fundingRate': 1,
                            'analytics/market/overview': 1,
                            'explorer/search': 1,
                            'explorer/transactions': 1,
                            'explorer/blocks': 1,
                        },
                    },
                    'private': {
                        'get': {
                        },
                        'post': {
                        },
                        'delete': {
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'options': {
                'sandboxMode': false,
                'createMarketBuyOrderRequiresPrice': true,
                // these network aliases require manual mapping here
                'network-aliases-for-tokens': {
                    'HT': 'ERC20',
                    'OMG': 'ERC20',
                    'UATOM': 'ATOM',
                    'ZRX': 'ZRX',
                },
                'networks': {
                    'TRX': 'TRON',
                    'TRC20': 'TRON',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                },
                // override defaultNetworkCodePriorities for a specific currency
                'defaultNetworkCodeForCurrencies': {
                    // 'USDT': 'TRC20',
                    // 'BTC': 'BTC',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'brokerId': 'bc830de7-50f3-460b-9ee0-f430f83f9dad',
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

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name defx#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://api-docs.defx.com/#4b03bb3b-a0fa-4dfb-b96c-237bde0ce9e6
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v1PublicGetHealthcheckPing (params);
        //
        // {
        //     "success": true,
        //     "t": 1709705048323,
        //     "v": "0.0.7",
        //     "msg": "A programmer’s wife tells him, “While you’re at the grocery store, buy some eggs.” He never comes back."
        // }
        //
        let status = undefined;
        const success = this.safeBool (response, 'success');
        if (success) {
            status = 'ok';
        } else {
            status = 'error';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name defx#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://api-docs.defx.com/#4b03bb3b-a0fa-4dfb-b96c-237bde0ce9e6
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v1PublicGetHealthcheckPing (params);
        //
        // {
        //     "success": true,
        //     "t": 1709705048323,
        //     "v": "0.0.7",
        //     "msg": "A programmer’s wife tells him, “While you’re at the grocery store, buy some eggs.” He never comes back."
        // }
        //
        return this.safeInteger (response, 't');
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name defx#fetchMarkets
         * @description retrieves data on all markets for defx
         * @see https://api-docs.defx.com/#73cce0c8-f842-4891-9145-01bb6d61324d
         * @see https://api-docs.defx.com/#24fd4e5b-840e-451e-99e0-7fea47c7f371
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'type': 'perps',
        };
        const promises = [
            this.v1PublicGetCMarkets (this.extend (request, params)),
            this.v1PublicGetCMarketsMetadata (this.extend (request, params)),
        ];
        const responses = await Promise.all (promises);
        //
        // {
        //     "data": [
        //       {
        //         "market": "DOGE_USDC",
        //         "candleWindows": [
        //           "1m",
        //           "3m",
        //           "5m",
        //           "15m",
        //           "30m",
        //           "1h",
        //           "2h",
        //           "4h",
        //           "12h",
        //           "1d",
        //           "1w",
        //           "1M"
        //         ],
        //         "depthSlabs": [
        //           "0.00001",
        //           "0.00005",
        //           "0.0001",
        //           "0.001",
        //           "0.01"
        //         ],
        //         "filters": [
        //           {
        //             "filterType": "LOT_SIZE",
        //             "minQty": "1.00000",
        //             "maxQty": "1500000.00000",
        //             "stepSize": "1.00000"
        //           },
        //           {
        //             "filterType": "MARKET_LOT_SIZE",
        //             "minQty": "1.00000",
        //             "maxQty": "750000.00000",
        //             "stepSize": "1.00000"
        //           },
        //           {
        //             "filterType": "PRICE_FILTER",
        //             "minPrice": "0.00244000",
        //             "maxPrice": "30.00000000",
        //             "tickSize": "0.00001"
        //           },
        //           {
        //             "filterType": "NOTIONAL",
        //             "minNotional": "100.00000000"
        //           },
        //           {
        //             "filterType": "PERCENT_PRICE_BY_SIDE",
        //             "bidMultiplierUp": "1.5",
        //             "bidMultiplierDown": "0.5",
        //             "askMultiplierUp": "1.5",
        //             "askMultiplierDown": "0.5"
        //           },
        //           {
        //             "filterType": "INDEX_PRICE_FILTER",
        //             "multiplierUp": "1.3",
        //             "multiplierDown": "0.7"
        //           }
        //         ],
        //         "cappedLeverage": "25",
        //         "maintenanceMarginTiers": [
        //           {
        //             "tier": "1",
        //             "minMaintenanceMargin": "0",
        //             "maxMaintenanceMargin": "2500",
        //             "leverage": "25"
        //           },
        //           {
        //             "tier": "2",
        //             "minMaintenanceMargin": "2500",
        //             "maxMaintenanceMargin": "12500",
        //             "leverage": "20"
        //           },
        //           {
        //             "tier": "3",
        //             "minMaintenanceMargin": "12500",
        //             "maxMaintenanceMargin": "25000",
        //             "leverage": "15"
        //           },
        //           {
        //             "tier": "4",
        //             "minMaintenanceMargin": "25000",
        //             "maxMaintenanceMargin": "50000",
        //             "leverage": "10"
        //           },
        //           {
        //             "tier": "5",
        //             "minMaintenanceMargin": "50000",
        //             "maxMaintenanceMargin": "75000",
        //             "leverage": "8"
        //           },
        //           {
        //             "tier": "6",
        //             "minMaintenanceMargin": "75000",
        //             "maxMaintenanceMargin": "125000",
        //             "leverage": "7"
        //           },
        //           {
        //             "tier": "7",
        //             "minMaintenanceMargin": "125000",
        //             "maxMaintenanceMargin": "187500",
        //             "leverage": "5"
        //           },
        //           {
        //             "tier": "8",
        //             "minMaintenanceMargin": "187500",
        //             "maxMaintenanceMargin": "250000",
        //             "leverage": "3"
        //           },
        //           {
        //             "tier": "9",
        //             "minMaintenanceMargin": "250000",
        //             "maxMaintenanceMargin": "375000",
        //             "leverage": "2"
        //           },
        //           {
        //             "tier": "10",
        //             "minMaintenanceMargin": "375000",
        //             "maxMaintenanceMargin": "500000",
        //             "leverage": "1"
        //           }
        //         ],
        //         "fees": {
        //           "maker": "0.08",
        //           "taker": "0.1"
        //         }
        //       },
        //     ]
        // }
        //
        const activeMarkets = this.safeList (responses[0], 'data');
        const activeMarketsByType = this.indexBy (activeMarkets, 'market');
        const marketMetadatas = this.safeList (responses[1], 'data');
        for (let i = 0; i < marketMetadatas.length; i++) {
            const marketId = marketMetadatas[i]['market'];
            let status = undefined;
            if (marketId in activeMarketsByType) {
                status = activeMarketsByType[marketId]['status'];
            }
            marketMetadatas[i]['status'] = status;
        }
        return this.parseMarkets (marketMetadatas);
    }

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'market');
        const parts = marketId.split ('_');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote + ':' + quote;
        const filters = this.safeList (market, 'filters', []);
        const fees = this.safeDict (market, 'fees', {});
        const filtersByType = this.indexBy (filters, 'filterType');
        const priceFilter = this.safeDict (filtersByType, 'PRICE_FILTER', {});
        const lotFilter = this.safeDict (filtersByType, 'LOT_SIZE', {});
        const marketLotFilter = this.safeDict (filtersByType, 'MARKET_LOT_SIZE', {});
        const notionalFilter = this.safeDict (filtersByType, 'NOTIONAL', {});
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': quoteId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeString (market, 'status', '') === 'active',
            'contract': true,
            'linear': true,
            'inverse': undefined,
            'taker': this.safeNumber (fees, 'taker'),
            'maker': this.safeNumber (fees, 'maker'),
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (lotFilter, 'stepSize'),
                'price': this.safeNumber (priceFilter, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeNumber (market, 'cappedLeverage'),
                },
                'amount': {
                    'min': this.safeNumber (lotFilter, 'minQty'),
                    'max': this.safeNumber (lotFilter, 'maxQty'),
                },
                'price': {
                    'min': this.safeNumber (priceFilter, 'minPrice'),
                    'max': this.safeNumber (priceFilter, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (notionalFilter, 'minNotional'),
                    'max': undefined,
                },
                'market': {
                    'min': this.safeNumber (marketLotFilter, 'minQty'),
                    'max': this.safeNumber (marketLotFilter, 'maxQty'),
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name defx#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api-docs.defx.com/#8c61cfbd-40d9-410e-b014-f5b36eba51d1
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
            const firstSymbol = this.safeString (symbols, 0);
            if (firstSymbol !== undefined) {
                market = this.market (firstSymbol);
            }
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        if (type === 'spot') {
            throw new NotSupported (this.id + ' fetchTickers() is not supported for ' + type + ' markets');
        }
        const response = await this.v1PublicGetTicker24HrAgg (params);
        //
        // {
        //     "ETH_USDC": {
        //       "priceChange": "0",
        //       "priceChangePercent": "0",
        //       "openPrice": "1646.15",
        //       "highPrice": "1646.15",
        //       "lowPrice": "1646.15",
        //       "lastPrice": "1646.15",
        //       "quoteVolume": "13.17",
        //       "volume": "0.008",
        //       "markPrice": "1645.15"
        //     }
        // }
        //
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     "ETH_USDC": {
        //       "priceChange": "0",
        //       "priceChangePercent": "0",
        //       "openPrice": "1646.15",
        //       "highPrice": "1646.15",
        //       "lowPrice": "1646.15",
        //       "lastPrice": "1646.15",
        //       "quoteVolume": "13.17",
        //       "volume": "0.008",
        //       "markPrice": "1645.15"
        //     }
        //
        const symbol = market['symbol'];
        const open = this.safeString (ticker, 'openPrice');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        const close = this.safeString (ticker, 'lastPrice');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        const baseVolume = this.safeString (ticker, 'volume');
        const percentage = this.safeString (ticker, 'priceChangePercent');
        const change = this.safeString (ticker, 'priceChange');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': undefined,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': this.safeString (ticker, 'markPrice'),
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = section[0];
        const access = section[1];
        const pathWithParams = this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][access]);
        url += '/' + version + '/';
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (access === 'public') {
            url += 'open/' + pathWithParams;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     400 Bad Request {"success":false,"code":-1012,"message":"Amount is required for buy market orders when margin disabled."}
        //                     {"code":"-1011","message":"The system is under maintenance.","success":false}
        //
        const success = this.safeBool (response, 'success');
        const errorCode = this.safeString (response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        return undefined;
    }

    defaultNetworkCodeForCurrency (code) { // TODO: can be moved into base as an unified method
        const currencyItem = this.currency (code);
        const networks = currencyItem['networks'];
        const networkKeys = Object.keys (networks);
        for (let i = 0; i < networkKeys.length; i++) {
            const network = networkKeys[i];
            if (network === 'ETH') {
                return network;
            }
        }
        // if it was not returned according to above options, then return the first network of currency
        return this.safeValue (networkKeys, 0);
    }

    setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }
}
