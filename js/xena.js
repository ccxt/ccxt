'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, InsufficientFunds, InvalidAddress, BadSymbol, InvalidOrder } = require ('./base/errors');
const Precise = require ('./base/Precise');

module.exports = class xena extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xena',
            'name': 'Xena Exchange',
            'countries': [ 'VC', 'UK' ],
            'rateLimit': 100,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': undefined, // has but not fully implemented
                'future': undefined, // has but not fully implemented
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87489843-bb469280-c64c-11ea-91aa-69c6326506af.jpg',
                'test': {
                    'public': 'https://trading.demo.xena.io/api',
                    'private': 'https://api.demo.xena.io',
                },
                'api': {
                    'public': 'https://trading.xena.exchange/api',
                    'private': 'https://api.xena.exchange',
                },
                'www': 'https://xena.exchange',
                'doc': 'https://support.xena.exchange/support/solutions/44000808700',
                'fees': 'https://trading.xena.exchange/en/contracts/terms-and-condition',
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
            },
            'api': {
                'public': {
                    'get': [
                        'common/currencies',
                        'common/instruments',
                        'common/features',
                        'common/commissions',
                        'common/news',
                        'market-data/candles/{marketId}/{timeframe}',
                        'market-data/market-watch',
                        'market-data/dom/{symbol}',
                        'market-data/candles/{symbol}/{timeframe}',
                        'market-data/trades/{symbol}',
                        'market-data/server-time',
                        'market-data/v2/candles/{symbol}/{timeframe}',
                        'market-data/v2/trades/{symbol}',
                        'market-data/v2/dom/{symbol}/',
                        'market-data/v2/server-time',
                    ],
                },
                'private': {
                    'get': [
                        'trading/accounts/{accountId}/order',
                        'trading/accounts/{accountId}/active-orders',
                        'trading/accounts/{accountId}/last-order-statuses',
                        'trading/accounts/{accountId}/positions',
                        'trading/accounts/{accountId}/positions-history',
                        'trading/accounts/{accountId}/margin-requirements',
                        'trading/accounts',
                        'trading/accounts/{accountId}/balance',
                        'trading/accounts/{accountId}/trade-history',
                        // 'trading/accounts/{accountId}/trade-history?symbol=BTC/USDT&client_order_id=EMBB8Veke&trade_id=220143254',
                        'transfers/accounts',
                        'transfers/accounts/{accountId}',
                        'transfers/accounts/{accountId}/deposit-address/{currency}',
                        'transfers/accounts/{accountId}/deposits',
                        'transfers/accounts/{accountId}/trusted-addresses',
                        'transfers/accounts/{accountId}/withdrawals',
                        'transfers/accounts/{accountId}/balance-history',
                        // 'transfers/accounts/{accountId}/balance-history?currency={currency}&from={time}&to={time}&kind={kind}&kind={kind}',
                        // 'transfers/accounts/{accountId}/balance-history?page={page}&limit={limit}',
                        // 'transfers/accounts/{accountId}/balance-history?txid=3e1db982c4eed2d6355e276c5bae01a52a27c9cef61574b0e8c67ee05fc26ccf',
                    ],
                    'post': [
                        'trading/order/new',
                        'trading/order/heartbeat',
                        'trading/order/cancel',
                        'trading/order/mass-cancel',
                        'trading/order/replace',
                        'trading/position/maintenance',
                        'transfers/accounts/{accountId}/withdrawals',
                        'transfers/accounts/{accountId}/deposit-address/{currency}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0005,
                    'taker': 0.001,
                    'tierBased': true,
                    'percentage': true,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'exceptions': {
                'exact': {
                    'Validation failed': BadRequest,
                    'Unknown derivative symbol': BadSymbol, // {"error":"Unknown derivative symbol"}
                    'Unknown account': BadRequest, // {"error":"Unknown account"}
                    'Wrong TransactTime': BadRequest, // {"error":"Wrong TransactTime"}
                    'ClOrdId is empty': BadRequest, // {"error":"ClOrdId is empty"}
                },
                'broad': {
                    'Invalid aggregation ratio or depth': BadRequest,
                    'address': InvalidAddress,
                    'Money not enough': InsufficientFunds,
                    'parse error': BadRequest,
                    'Not enough': InsufficientFunds, // {"error":"Not enough free margin"}
                },
            },
            'options': {
                'defaultType': 'margin', // 'margin',
                'accountId': undefined, // '1012838157',
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetMarketDataV2ServerTime (params);
        //
        //     {
        //         "msgType":"0",
        //         "transactTime":1594774454112817637
        //     }
        //
        const transactTime = this.safeInteger (response, 'transactTime');
        return parseInt (transactTime / 1000000);
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonInstruments (params);
        //
        //     [
        //         {
        //             "type": "Index",
        //             "symbol": ".ADAUSD",
        //             "tickSize": 4,
        //             "enabled": true
        //         },
        //         {
        //             "id":"ETHUSD_3M_250920",
        //             "type":"Margin",
        //             "marginType":"XenaFuture",
        //             "symbol":"ETHUSD_3M_250920",
        //             "baseCurrency":"ETH",
        //             "quoteCurrency":"USD",
        //             "settlCurrency":"BTC",
        //             "tickSize":2,
        //             "minOrderQuantity":"1",
        //             "orderQtyStep":"1",
        //             "limitOrderMaxDistance":"10",
        //             "priceInputMask":"0000.00",
        //             "enabled":true,
        //             "liquidationMaxDistance":"0.01",
        //             "contractValue":"1",
        //             "contractCurrency":"BTC",
        //             "lotSize":"1",
        //             "tickValue":"0.00000001", // linear contracts only
        //             "maxOrderQty":"175000",
        //             "maxPosVolume":"1750000",
        //             "mark":".ETHUSD_3M_250920",
        //             "underlying":".ETHUSD_TWAP",
        //             "openInterest":".ETHUSD_3M_250920_OpenInterest",
        //             "floatingPL":"BidAsk", // perpetual contracts only
        //             "addUvmToFreeMargin":"ProfitAndLoss",
        //             "margin":{
        //                 "netting":"PositionsAndOrders",
        //                 "rates":[
        //                     {"maxVolume":"175000","initialRate":"0.05","maintenanceRate":"0.0125"},
        //                     {"maxVolume":"350000","initialRate":"0.1","maintenanceRate":"0.025"},
        //                     {"maxVolume":"500000","initialRate":"0.2","maintenanceRate":"0.05"},
        //                     {"maxVolume":"750000","initialRate":"0.3","maintenanceRate":"0.075"},
        //                     {"maxVolume":"1050000","initialRate":"0.4","maintenanceRate":"0.1"},
        //                     {"maxVolume":"1400000","initialRate":"0.5","maintenanceRate":"0.125"},
        //                     {"maxVolume":"1750000","initialRate":"1","maintenanceRate":"0.25"}
        //                 ],
        //                 "rateMultipliers":{
        //                     "LimitBuy":"1",
        //                     "LimitSell":"1",
        //                     "Long":"1",
        //                     "MarketBuy":"1",
        //                     "MarketSell":"1",
        //                     "Short":"1",
        //                     "StopBuy":"0",
        //                     "StopSell":"0"
        //                 }
        //             },
        //             "clearing":{"enabled":true,"index":".ETHUSD_3M_250920"},
        //             "premium":{"enabled":true,"index":".XBTUSD_Premium_IR_Corrected"}, // perpetual contracts only
        //             "riskAdjustment":{"enabled":true,"index":".RiskAdjustment_IR"},
        //             "expiration":{"enabled":true,"index":".ETHUSD_TWAP"}, // futures only
        //             "pricePrecision":3,
        //             "priceRange":{
        //                 "enabled":true,
        //                 "distance":"0.03",
        //                 "movingBoundary":"0",
        //                 "lowIndex":".ETHUSD_3M_250920_LOWRANGE",
        //                 "highIndex":".ETHUSD_3M_250920_HIGHRANGE"
        //             },
        //             "priceLimits":{
        //                 "enabled":true,
        //                 "distance":"0.5",
        //                 "movingBoundary":"0",
        //                 "lowIndex":".ETHUSD_3M_250920_LOWLIMIT",
        //                 "highIndex":".ETHUSD_3M_250920_HIGHLIMIT"
        //             },
        //             "inverse":true, // inverse contracts only
        //             "serie":"ETHUSD", // futures only
        //             "tradingStartDate":"2020-03-27 07:00:00",
        //             "expiryDate":"2020-09-25 08:00:00" // futures only
        //         },
        //         {
        //             "type":"Index",
        //             "symbol":".ETHUSD_Premium_IR_Corrected",
        //             "tickSize":6,
        //             "enabled":true,
        //             "basis":365
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            let type = this.safeStringLower (market, 'type');
            const id = this.safeString (market, 'symbol');
            const numericId = this.safeString (market, 'id');
            const marginType = this.safeString (market, 'marginType');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrency');
            const settleId = this.safeString (market, 'settlCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const expiryDate = this.safeString (market, 'expiryDate');
            const expiryTimestamp = this.parse8601 (expiryDate);
            let symbol = id;
            let future = false;
            let swap = false;
            if (type === 'margin') {
                symbol = base + '/' + quote + ':' + settle;
                if (marginType === 'XenaFuture') {
                    symbol = symbol + '-' + this.yymmdd (expiryTimestamp);
                    type = 'future';
                    future = true;
                } else if (marginType === 'XenaListedPerpetual') {
                    type = 'swap';
                    swap = true;
                }
            }
            const inverse = this.safeValue (market, 'inverse', false);
            const contract = swap || future;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'numericId': numericId,
                'type': type,
                'spot': false,
                'margin': false,
                'swap': swap,
                'future': future,
                'option': false,
                'active': this.safeValue (market, 'enabled', false),
                'contract': contract,
                'linear': contract ? !inverse : undefined,
                'inverse': contract ? inverse : undefined,
                'contractSize': this.safeNumber (market, 'contractValue'),
                'expiry': expiryTimestamp,
                'expiryDatetime': this.iso8601 (expiryTimestamp),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': parseInt ('0'),
                    'price': this.safeInteger2 (market, 'tickSize', 'pricePrecision'),
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
                        'min': this.safeNumber (market, 'minOrderQuantity'),
                        'max': this.safeNumber (market, 'maxOrderQty'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCommonCurrencies (params);
        //
        //     {
        //         "BAB": {
        //             "name":"BAB",
        //             "title":"Bitcoin ABC",
        //             "blockchain":{
        //                 "name":"BAB",
        //                 "title":"Bitcoin ABC",
        //                 "deposit":{"confirmations":6},
        //                 "withdraw":{"confirmations":1},
        //                 "addressReuseAllowed":false,
        //                 "view":{
        //                     "uriTemplate":"bitcoinabc:%s?message=Xena Exchange",
        //                     "recommendedFee":"0.00001",
        //                     "transactionUrl":"https://blockchair.com/bitcoin-cash/transaction/${txId}",
        //                     "walletUrl":"https://blockchair.com/bitcoin-cash/address/${walletId}"
        //                 }
        //             },
        //             "precision":5,
        //             "withdraw":{"minAmount":"0.01","commission":"0.001"},
        //             "view":{
        //                 "color":"#DC7C08",
        //                 "site":"https://www.bitcoinabc.org"
        //             },
        //             "enabled":true
        //         },
        //     }
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = response[id];
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'title');
            const precision = this.safeInteger (currency, 'precision');
            const enabled = this.safeValue (currency, 'enabled');
            const active = (enabled === true);
            const withdraw = this.safeValue (currency, 'withdraw', {});
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': this.safeNumber (withdraw, 'commission'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (withdraw, 'minAmount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "symbol":".XBTUSD_3M_250920_MID",
        //         "firstPx":"9337.49",
        //         "lastPx":"9355.81",
        //         "highPx":"9579.42",
        //         "lowPx":"9157.63",
        //         "buyVolume":"0",
        //         "sellVolume":"0",
        //         "bid":"0",
        //         "ask":"0"
        //     }
        //
        const timestamp = this.milliseconds ();
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'lastPx');
        const open = this.safeString (ticker, 'firstPx');
        const buyVolume = this.safeString (ticker, 'buyVolume');
        const sellVolume = this.safeString (ticker, 'sellVolume');
        const baseVolume = this.sum (buyVolume, sellVolume);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'highPx'),
            'low': this.safeString (ticker, 'lowPx'),
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
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.fetchTickers (undefined, params);
        if (symbol in tickers) {
            return tickers[symbol];
        }
        throw new BadSymbol (this.id + ' fetchTicker could not find a ticker with symbol ' + symbol);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetMarketDataMarketWatch (params);
        //
        //     [
        //         {
        //             "symbol":".XBTUSD_3M_250920_MID",
        //             "firstPx":"9337.49",
        //             "lastPx":"9355.81",
        //             "highPx":"9579.42",
        //             "lowPx":"9157.63",
        //             "buyVolume":"0",
        //             "sellVolume":"0",
        //             "bid":"0",
        //             "ask":"0"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetMarketDataV2DomSymbol (this.extend (request, params));
        //
        //     {
        //         "msgType":"W",
        //         "mdStreamId":"DOM:XBTUSD:aggregated",
        //         "lastUpdateTime":1594772683037691997,
        //         "mdBookType":"2",
        //         "symbol":"XBTUSD",
        //         "lowRangePx":"9132.24",
        //         "highRangePx":"9410.36",
        //         "lowLimitPx":"9132.24",
        //         "highLimitPx":"9410.36",
        //         "clearingPx":"9253.4",
        //         "bestBid":"9269.8",
        //         "bestAsk":"9275.9",
        //         "mdEntry":[
        //             {"mdEntryType":"1","mdEntryPx":"9275.9","mdEntrySize":"3000","numberOfOrders":1},
        //             {"mdEntryType":"1","mdEntryPx":"9277.7","mdEntrySize":"50000","numberOfOrders":1},
        //             {"mdEntryType":"1","mdEntryPx":"9277.8","mdEntrySize":"2000","numberOfOrders":1},
        //             {"mdEntryType":"0","mdEntryPx":"9269.8","mdEntrySize":"2000","numberOfOrders":1},
        //             {"mdEntryType":"0","mdEntryPx":"9267.9","mdEntrySize":"3000","numberOfOrders":1},
        //             {"mdEntryType":"0","mdEntryPx":"9267.8","mdEntrySize":"50000","numberOfOrders":1},
        //         ]
        //     }
        //
        const mdEntry = this.safeValue (response, 'mdEntry', []);
        const mdEntriesByType = this.groupBy (mdEntry, 'mdEntryType');
        const lastUpdateTime = this.safeInteger (response, 'lastUpdateTime');
        let timestamp = undefined;
        if (lastUpdateTime !== undefined) {
            timestamp = parseInt (lastUpdateTime / 1000000);
        }
        return this.parseOrderBook (mdEntriesByType, symbol, timestamp, '0', '1', 'mdEntryPx', 'mdEntrySize');
    }

    async fetchAccounts (params = {}) {
        const response = await this.privateGetTradingAccounts (params);
        //
        //     {
        //         "accounts": [
        //             { "id":8273231, "kind": "Spot" },
        //             { "id":10012833469, "kind": "Margin", "currency": "BTC" }
        //         ]
        //     }
        //
        const accounts = this.safeValue (response, 'accounts');
        const result = [];
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const accountId = this.safeString (account, 'id');
            const currencyId = this.safeString (account, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const type = this.safeStringLower (account, 'kind');
            result.push ({
                'id': accountId,
                'type': type,
                'currency': code,
                'info': account,
            });
        }
        return result;
    }

    async findAccountByType (type) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountsByType = this.groupBy (this.accounts, 'type');
        const accounts = this.safeValue (accountsByType, type);
        if (accounts === undefined) {
            throw new ExchangeError (this.id + " findAccountByType() could not find an accountId with type '" + type + "', specify the 'accountId' parameter instead"); // eslint-disable-line quotes
        }
        const numAccounts = accounts.length;
        if (numAccounts > 1) {
            throw new ExchangeError (this.id + " findAccountByType() found more than one accountId with type '" + type + "', specify the 'accountId' parameter instead"); // eslint-disable-line quotes
        }
        return accounts[0];
    }

    async getAccountId (params) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeString (this.options, 'accountId');
        const accountId = this.safeString (params, 'accountId', defaultAccountId);
        if (accountId !== undefined) {
            return accountId;
        }
        const defaultType = this.safeString (this.options, 'defaultType', 'margin');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " requires an 'accountId' parameter or a 'type' parameter ('spot' or 'margin')");
        }
        const account = await this.findAccountByType (type);
        return account['id'];
    }

    parseBalance (response) {
        const result = { 'info': response };
        let timestamp = undefined;
        const balances = this.safeValue (response, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const lastUpdateTime = this.safeString (balance, 'lastUpdateTime');
            const lastUpdated = lastUpdateTime.slice (0, 13);
            const currentTimestamp = parseInt (lastUpdated);
            timestamp = (timestamp === undefined) ? currentTimestamp : Math.max (timestamp, currentTimestamp);
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'onHold');
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const request = {
            'accountId': accountId,
        };
        const response = await this.privateGetTradingAccountsAccountIdBalance (this.extend (request, params));
        //
        //     {
        //         "msgType":"XAR",
        //         "balances":[
        //             {
        //                 "currency":"BTC",
        //                 "lastUpdateTime":1619384111905916598,
        //                 "available":"0.00549964",
        //                 "onHold":"0",
        //                 "settled":"0.00549964",
        //                 "equity":"0.00549964"
        //             }
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "mdUpdateAction":"0",
        //         "mdEntryType":"2",
        //         "mdEntryPx":"9225.16",
        //         "mdEntrySize":"10000",
        //         "transactTime":1594728504524977655,
        //         "tradeId":"6ac51bb7-7505-4f35-85ef-61eb738cb4d9",
        //         "aggressorSide":"1"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "msgType":"8",
        //         "account":1012838158,
        //         "clOrdId":"xXWKLQVl3",
        //         "orderId":"89eee8bd-98ae-4d06-97dc-ee2d12997fe7",
        //         "symbol":"ETHUSD",
        //         "transactTime":1595143349089739000,
        //         "execId":"c4bd0ee2330930924e0f6fdde4630e56751692a4",
        //         "tradeId":"30a394b2-6d53-4bc4-b276-d8e19f470ba1",
        //         "side":"2",
        //         "lastQty":"1",
        //         "lastPx":"234.58",
        //         "avgPx":"234.58",
        //         "calculatedCcyLastQty":"0",
        //         "netMoney":"0",
        //         "lastLiquidityInd":"2",
        //         "commission":"0.00000011",
        //         "commRate":"0.00045",
        //         "commCurrency":"BTC",
        //         "positionId":132162662,
        //         "positionEffect":"C"
        //     }
        //
        const id = this.safeString (trade, 'tradeId');
        let timestamp = this.safeInteger (trade, 'transactTime');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp / 1000000);
        }
        let side = this.safeStringLower2 (trade, 'side', 'aggressorSide');
        if (side === '1') {
            side = 'buy';
        } else if (side === '2') {
            side = 'sell';
        }
        const orderId = this.safeString (trade, 'orderId');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const priceString = this.safeString2 (trade, 'lastPx', 'mdEntryPx');
        const amountString = this.safeString2 (trade, 'lastQty', 'mdEntrySize');
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'commission');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            const feeRateString = this.safeString (trade, 'commRate');
            fee = {
                'cost': feeCostString,
                'rate': feeRateString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const request = {
            'accountId': accountId,
            // 'page': 1,
            // 'limit': integer,
            // 'from': time,
            // 'to': time,
            // 'symbol': currency['id'],
            // 'trade_id': id,
            // 'client_order_id': id,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = since * 1000000;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradingAccountsAccountIdTradeHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "msgType":"8",
        //             "account":1012838158,
        //             "clOrdId":"xXWKLQVl3",
        //             "orderId":"89eee8bd-98ae-4d06-97dc-ee2d12997fe7",
        //             "symbol":"ETHUSD",
        //             "transactTime":1595143349089739000,
        //             "execId":"c4bd0ee2330930924e0f6fdde4630e56751692a4",
        //             "tradeId":"30a394b2-6d53-4bc4-b276-d8e19f470ba1",
        //             "side":"2",
        //             "lastQty":"1",
        //             "lastPx":"234.58",
        //             "avgPx":"234.58",
        //             "calculatedCcyLastQty":"0",
        //             "netMoney":"0",
        //             "lastLiquidityInd":"2",
        //             "commission":"0.00000011",
        //             "commRate":"0.00045",
        //             "commCurrency":"BTC",
        //             "positionId":132162662,
        //             "positionEffect":"C"
        //         },
        //         {
        //             "msgType":"8",
        //             "account":1012838158,
        //             "clOrdId":"3ce8c305-9936-4e97-9206-71ae3ff40305",
        //             "orderId":"a93c686d-990e-44d9-9cbe-61107744b990",
        //             "symbol":"ETHUSD",
        //             "transactTime":1595143315369226000,
        //             "execId":"1c745881722ad966a4ce71600cd058d59da0d1c3",
        //             "tradeId":"77f75bd8-27c4-4b1a-a5e8-0d59239ce216",
        //             "side":"1",
        //             "lastQty":"1",
        //             "lastPx":"234.72",
        //             "avgPx":"234.72",
        //             "calculatedCcyLastQty":"0",
        //             "netMoney":"0",
        //             "lastLiquidityInd":"2",
        //             "commission":"0.00000011",
        //             "commRate":"0.00045",
        //             "commCurrency":"BTC",
        //             "positionId":132162662,
        //             "positionEffect":"O"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "transactTime":1594784700000000000,
        //         "firstPx":"9246.3",
        //         "lastPx":"9232.8",
        //         "highPx":"9246.3",
        //         "lowPx":"9232.8",
        //         "buyVolume":"0",
        //         "sellVolume":"0"
        //     }
        //
        const transactTime = this.safeInteger (ohlcv, 'transactTime');
        const timestamp = parseInt (transactTime / 1000000);
        const buyVolume = this.safeNumber (ohlcv, 'buyVolume');
        const sellVolume = this.safeNumber (ohlcv, 'sellVolume');
        const volume = this.sum (buyVolume, sellVolume);
        return [
            timestamp,
            this.safeNumber (ohlcv, 'firstPx'),
            this.safeNumber (ohlcv, 'highPx'),
            this.safeNumber (ohlcv, 'lowPx'),
            this.safeNumber (ohlcv, 'lastPx'),
            volume,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        const durationInSeconds = this.parseTimeframe (timeframe);
        const duration = durationInSeconds * 1000;
        if (since !== undefined) {
            request['from'] = since * 1000000;
            if (limit !== undefined) {
                request['to'] = this.sum (since, limit * duration) * 1000000;
            }
        } else {
            const now = this.milliseconds ();
            // max limit is 1000
            if (limit !== undefined) {
                request['from'] = (now - limit * duration) * 1000000;
            }
        }
        const response = await this.publicGetMarketDataV2CandlesSymbolTimeframe (this.extend (request, params));
        //
        //     {
        //         "mdEntry":[
        //             {"transactTime":1594784700000000000,"firstPx":"9246.3","lastPx":"9232.8","highPx":"9246.3","lowPx":"9232.8","buyVolume":"0","sellVolume":"0"},
        //             {"transactTime":1594785600000000000,"firstPx":"9231.8","lastPx":"9227.3","highPx":"9232.8","lowPx":"9227.3","buyVolume":"0","sellVolume":"0"},
        //             {"transactTime":1594786500000000000,"firstPx":"9226.3","lastPx":"9230.3","highPx":"9230.3","lowPx":"9220.6","buyVolume":"0","sellVolume":"0"}
        //         ]
        //     }
        //
        const mdEntry = this.safeValue (response, 'mdEntry', []);
        return this.parseOHLCVs (mdEntry, market, timeframe, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'from': this.iso8601 (since),
            // 'to': this.iso8601 (this.milliseconds ()),
            // 'page': 1,
            // 'limit': limit,
        };
        if (since !== undefined) {
            request['from'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketDataV2TradesSymbol (this.extend (request, params));
        //
        //     {
        //         "msgType":"W",
        //         "lastUpdateTime":1594737830902223803,
        //         "symbol":"XBTUSD",
        //         "mdEntry":[
        //             {
        //                 "mdUpdateAction":"0",
        //                 "mdEntryType":"2",
        //                 "mdEntryPx":"9225.16",
        //                 "mdEntrySize":"10000",
        //                 "transactTime":1594728504524977655,
        //                 "tradeId":"6ac51bb7-7505-4f35-85ef-61eb738cb4d9",
        //                 "aggressorSide":"1"
        //             },
        //         ]
        //     }
        //
        const mdEntry = this.safeValue (response, 'mdEntry', []);
        return this.parseTrades (mdEntry, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'A': 'open', // PendingNew
            '0': 'open', // New
            '1': 'open', // PartiallyFilled
            '2': 'closed', // Filled
            '6': 'canceled', // PendingCancel
            '4': 'canceled', // Cancelled
            'E': 'open', // PendingReplace
            '8': 'rejected', // Rejected
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "msgType":"8",
        //         "account":1012838720,
        //         "clOrdId":"XAq0pRQ1g",
        //         "orderId":"64d7a06a-27e5-422e-99d9-3cadc04f5a35",
        //         "symbol":"XBTUSD",
        //         "ordType":"2",
        //         "price":"9000",
        //         "transactTime":1593778763271127920,
        //         "execId":"ff5fb8153652f0516bf07b6979255bed053c84b9",
        //         "execType":"I",
        //         "ordStatus":"0",
        //         "side":"1",
        //         "orderQty":"1",
        //         "leavesQty":"1",
        //         "cumQty":"0",
        //         "positionEffect":"O",
        //         "marginAmt":"0.00000556",
        //         "marginAmtType":"11"
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clOrdId');
        const transactTime = this.safeInteger (order, 'transactTime');
        const timestamp = parseInt (transactTime / 1000000);
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'orderQty');
        const filled = this.safeString (order, 'cumQty');
        const remaining = this.safeString (order, 'leavesQty');
        let side = this.safeString (order, 'side');
        if (side === '1') {
            side = 'buy';
        } else if (side === '2') {
            side = 'sell';
        }
        let type = this.safeString (order, 'ordType');
        if (type === '1') {
            type = 'market';
        } else if (type === '2') {
            type = 'limit';
        } else if (type === '3') {
            type = 'stop';
        } else if (type === '4') {
            type = 'stop-limit';
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const orderTypes = {
            'market': '1',
            'limit': '2',
            'stop': '3',
            'stop-limit': '4',
        };
        const orderType = this.safeString (orderTypes, type);
        if (orderType === undefined) {
            throw new InvalidOrder (this.id + ' createOrder does not support order type ' + type + ', supported order types are market, limit, stop, stop-limit');
        }
        const orderSides = {
            'buy': '1',
            'sell': '2',
        };
        const orderSide = this.safeString (orderSides, side);
        if (orderSide === undefined) {
            throw new InvalidOrder (this.id + ' createOrder does not support order side ' + side + ', supported order sides are buy, sell');
        }
        const market = this.market (symbol);
        const request = {
            'account': parseInt (accountId),
            'symbol': market['id'],
            'ordType': orderType,
            'side': orderSide,
            'orderQty': this.amountToPrecision (symbol, amount),
            'transactTime': this.milliseconds () * 1000000,
            // 'clOrdId': this.uuid (), // required
            // 'price': this.priceToPrecision (symbol, price), // required for limit and stop-limit orders
            // 'stopPx': this.priceToPrecision (symbol, stopPx), // required for stop and stop-limit orders
            // 'timeInForce': '1', // default '1' = GoodTillCancelled, '3' = ImmediateOrCancel, '4' = FillOrKill
            // 'execInst': '0',
            //     '0' = StayOnOfferSide, maker only, reject instead of aggressive execution
            //     '9' = PegToOfferSide, maker only, best available level instead of aggressive execution
            //     'o' = CancelOnConnectionLoss
            // 'positionID': 1013838923, // required when positionEffect == 'C' with hedged accounting
            // 'positionEffect': 'O', // 'C' = Close, 'O' = Open, send C along with the positionID if the order must close a position with hedged accounting mode
            // 'text': 'comment', // optional
            // 'grpID': 'group-identifier', // group identifier for cancel on disconnect orders
        };
        if ((type === 'limit') || (type === 'stop-limit')) {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a price argument for order type ' + type);
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if ((type === 'stop') || (type === 'stop-limit')) {
            const stopPx = this.safeNumber (params, 'stopPx');
            if (stopPx === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a stopPx param for order type ' + type);
            }
            request['stopPx'] = this.priceToPrecision (symbol, stopPx);
            params = this.omit (params, 'stopPx');
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'clOrdId', this.uuid ());
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'clOrdId' ]);
        }
        const response = await this.privatePostTradingOrderNew (this.extend (request, params));
        //
        //     {
        //         "msgType":"8",
        //         "account":1012838720,
        //         "clOrdId":"XAq0pRQ1g",
        //         "orderId":"64d7a06a-27e5-422e-99d9-3cadc04f5a35",
        //         "symbol":"XBTUSD",
        //         "ordType":"2",
        //         "price":"9000",
        //         "transactTime":1593778763271127920,
        //         "execId":"ff5fb8153652f0516bf07b6979255bed053c84b9",
        //         "execType":"I",
        //         "ordStatus":"0",
        //         "side":"1",
        //         "orderQty":"1",
        //         "leavesQty":"1",
        //         "cumQty":"0",
        //         "positionEffect":"O",
        //         "marginAmt":"0.00000556",
        //         "marginAmtType":"11"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const market = this.market (symbol);
        const request = {
            'account': parseInt (accountId),
            'clOrdId': this.uuid (),
            'symbol': market['id'],
            'transactTime': this.milliseconds () * 1000000,
            // 'origClOrdId': this.uuid (), // one of orderId or origClOrdId is required
            // 'orderId': id,
            // 'side': '1', // 1 = buy, 2 = sell
            // 'execInst': '0',
            //     '0' = StayOnOfferSide, maker only, reject instead of aggressive execution
            //     '9' = PegToOfferSide, maker only, best available level instead of aggressive execution
            //     'o' = CancelOnConnectionLoss
            // 'orderQty': 38 M decimal
            // 'price': this.priceToPrecision (symbol, price), // required for limit and stop-limit orders
            // 'stopPx': this.priceToPrecision (symbol, stopPx), // required for stop and stop-limit orders
            // 'capPrice': this.priceToPrecision (symbol, capPrice), // the price beyond which the order will not move for trailing stop and attempt-zero-loss
            // 'pegPriceType': '8', // '8' = TrailingStopPeg, identifies a trailing stop or an attempt-zero-loss order
            // 'pegOffsetType': '2', // '2' = BasisPoints, the unit of the distance to the stop price for a trailing stop or an attempt-zero-loss order
            // 'pegOffsetValue': 123, // distance to the trailing stop or attempt-zero-loss
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'origClOrdId');
        if (clientOrderId !== undefined) {
            request['origClOrdId'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'origClOrdId' ]);
        } else {
            request['orderId'] = id;
        }
        if (amount !== undefined) {
            request['orderQty'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const stopPx = this.safeNumber (params, 'stopPx');
        if (stopPx !== undefined) {
            request['stopPx'] = this.priceToPrecision (symbol, stopPx);
            params = this.omit (params, 'stopPx');
        }
        const capPrice = this.safeNumber (params, 'capPrice');
        if (capPrice !== undefined) {
            request['capPrice'] = this.priceToPrecision (symbol, capPrice);
            params = this.omit (params, 'capPrice');
        }
        const response = await this.privatePostTradingOrderReplace (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'origClOrdId');
        params = this.omit (params, [ 'clientOrderId', 'origClOrdId' ]);
        const market = this.market (symbol);
        const request = {
            'account': parseInt (accountId),
            'symbol': market['id'],
            'clOrdId': this.uuid (),
            'transactTime': this.milliseconds () * 1000000,
        };
        if (clientOrderId !== undefined) {
            request['origClOrdId'] = clientOrderId;
        } else {
            request['orderId'] = id;
        }
        const response = await this.privatePostTradingOrderCancel (this.extend (request, params));
        //
        //     {
        //         "msgType":"8",
        //         "account":1012838158,
        //         "clOrdId":"0fa3fb55-9dc0-4cfc-a1db-6aa8b7dd2d98",
        //         "origClOrdId":"3b2878bb-24d8-4922-9d2a-5b8009416677",
        //         "orderId":"665b418e-9d09-4461-b733-d317f6bff43f",
        //         "symbol":"ETHUSD",
        //         "ordType":"2",
        //         "price":"640",
        //         "transactTime":1595060080941618739,
        //         "execId":"c541c0ca437c0e6501c3a50a9d4dc8f575f49972",
        //         "execType":"6",
        //         "ordStatus":"6",
        //         "side":"2",
        //         "orderQty":"1",
        //         "leavesQty":"0",
        //         "cumQty":"0",
        //         "positionEffect":"O",
        //         "marginAmt":"0.000032",
        //         "marginAmtType":"11"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const request = {
            'account': parseInt (accountId),
            'clOrdId': this.uuid (),
            // 'side': '1', // 1 = buy, 2 = sell, optional filter, cancel only orders with the given side
            // 'positionEffect': 'C', // C = Close, O = Open, optional filter, cancel only orders with the given positionEffect, applicable only for accounts with hedged accounting
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
            request['massCancelRequestType'] = '1'; // CancelOrdersForASecurity
        } else {
            request['massCancelRequestType'] = '7'; // CancelAllOrders
        }
        const response = await this.privatePostTradingOrderMassCancel (this.extend (request, params));
        //
        //     {
        //         "msgType":"r",
        //         "clOrdId":"b3e95759-e43e-4b3a-b664-a4d213e281a7",
        //         "massActionReportID":"e915b6f4-a7ca-4c5c-b8d6-e39862530248",
        //         "massCancelResponse":"1",
        //         "symbol":"ETHUSD",
        //         "transactTime":1595065630133756426,
        //         "totalAffectedOrders":2,
        //         "account":1012838158
        //     }
        //
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const request = {
            'accountId': accountId,
            // 'symbol': market['id'],
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetTradingAccountsAccountIdActiveOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "msgType":"8",
        //             "account":1012838720,
        //             "clOrdId":"XAq0pRQ1g",
        //             "orderId":"64d7a06a-27e5-422e-99d9-3cadc04f5a35",
        //             "symbol":"XBTUSD",
        //             "ordType":"2",
        //             "price":"9000",
        //             "transactTime":1593778763271127920,
        //             "execId":"ff5fb8153652f0516bf07b6979255bed053c84b9",
        //             "execType":"I",
        //             "ordStatus":"0",
        //             "side":"1",
        //             "orderQty":"1",
        //             "leavesQty":"1",
        //             "cumQty":"0",
        //             "positionEffect":"O",
        //             "marginAmt":"0.00000556",
        //             "marginAmtType":"11"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const request = {
            'accountId': accountId,
            // 'from': this.iso8601 (since) * 1000000,
            // 'to': this.iso8601 (this.milliseconds ()) * 1000000, // max range is 7 days
            // 'symbol': market['id'],
            // 'limit': 100,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601 (since) * 1000000;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradingAccountsAccountIdLastOrderStatuses (this.extend (request, params));
        //
        //     [
        //         {
        //             "msgType":"8",
        //             "account":1012838720,
        //             "clOrdId":"XAq0pRQ1g",
        //             "orderId":"64d7a06a-27e5-422e-99d9-3cadc04f5a35",
        //             "symbol":"XBTUSD",
        //             "ordType":"2",
        //             "price":"9000",
        //             "transactTime":1593778763271127920,
        //             "execId":"ff5fb8153652f0516bf07b6979255bed053c84b9",
        //             "execType":"I",
        //             "ordStatus":"0",
        //             "side":"1",
        //             "orderQty":"1",
        //             "leavesQty":"1",
        //             "cumQty":"0",
        //             "positionEffect":"O",
        //             "marginAmt":"0.00000556",
        //             "marginAmtType":"11"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const currency = this.currency (code);
        const request = {
            'accountId': accountId,
            'currency': currency['id'],
        };
        const response = await this.privatePostTransfersAccountsAccountIdDepositAddressCurrency (this.extend (request, params));
        //
        //     {
        //         "address": "mu5GceHFAG38mGRYCFqafe5ZiNKLX3rKk9",
        //         "uri": "bitcoin:mu5GceHFAG38mGRYCFqafe5ZiNKLX3rKk9?message=Xena Exchange",
        //         "allowsRenewal": true
        //     }
        //
        const address = this.safeValue (response, 'address');
        const tag = undefined;
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
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const currency = this.currency (code);
        const request = {
            'accountId': accountId,
            'currency': currency['id'],
        };
        const response = await this.privateGetTransfersAccountsAccountIdDepositAddressCurrency (this.extend (request, params));
        //
        //     {
        //         "address": "mu5GceHFAG38mGRYCFqafe5ZiNKLX3rKk9",
        //         "uri": "bitcoin:mu5GceHFAG38mGRYCFqafe5ZiNKLX3rKk9?message=Xena Exchange",
        //         "allowsRenewal": true
        //     }
        //
        const address = this.safeValue (response, 'address');
        const tag = undefined;
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async fetchTransactionsByType (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency `code` argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'accountId': accountId,
        };
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const method = 'privateGetTransfersAccountsAccountId' + this.capitalize (type);
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "withdrawals": [
        //             {
        //                 "withdrawalRequestId": 47383243,
        //                 "externalId": "...",    // external ID submitted by the client when creating the request
        //                 "status": 1,
        //                 "statusMessage": "Pending confirmation",
        //                 "amount": "10.2",
        //                 "currency": "BTC",
        //                 "lastUpdated": <UNIX nanoseconds>,
        //                 "blockchain": "Bitcoin",
        //                 "address": "mu5GceHFAG38mGRYCFqafe5ZiNKLX3rKk9",
        //                 "txId": "0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98"
        //             }
        //         ]
        //     }
        //
        //     {
        //         "deposits": [
        //             {
        //                 "currency": "BTC",
        //                 "amount": "1.2",
        //                 "status": 1,
        //                 "statusMessage": "Processing",
        //                 "blockchain": "Bitcoin",
        //                 "txId": "0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98",
        //                 "address": "mu5GceHFAG38mGRYCFqafe5ZiNKLX3rKk9",
        //                 "lastUpdated": <UNIX nanoseconds>
        //                 "confirmations": 2,
        //                 "requiredConfirmations": 6
        //             }
        //         ]
        //     }
        //
        //
        const transactions = this.safeValue (response, type, []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdrawals', code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposits', code, since, limit, params);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw()
        //
        //     {
        //         "withdrawalRequestId": 47383243,
        //         "status": 1,
        //         "statusMessage": "Pending confirmation"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "withdrawalRequestId": 47383243,
        //         "externalId": "...",    // external ID submitted by the client when creating the request
        //         "status": 1,
        //         "statusMessage": "Pending confirmation",
        //         "amount": "10.2",
        //         "currency": "BTC",
        //         "lastUpdated": <UNIX nanoseconds>,
        //         "blockchain": "Bitcoin",
        //         "address": "mu5GceHFAG38mGRYCFqafe5ZiNKLX3rKk9",
        //         "txId": "0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "currency": "BTC",
        //         "amount": "1.2",
        //         "status": 1,
        //         "statusMessage": "Processing",
        //         "blockchain": "Bitcoin",
        //         "txId": "0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98",
        //         "address": "mu5GceHFAG38mGRYCFqafe5ZiNKLX3rKk9",
        //         "lastUpdated": <UNIX nanoseconds>
        //         "confirmations": 2,
        //         "requiredConfirmations": 6
        //     }
        //
        const id = this.safeString (transaction, 'withdrawalRequestId');
        const type = (id === undefined) ? 'deposit' : 'withdrawal';
        let updated = this.safeInteger (transaction, 'lastUpdated');
        if (updated !== undefined) {
            updated = parseInt (updated / 1000000);
        }
        const timestamp = undefined;
        const txid = this.safeString (transaction, 'txId');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (transaction, 'address');
        const addressFrom = undefined;
        const addressTo = address;
        const amount = this.safeNumber (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const fee = undefined;
        const network = this.safeString (transaction, 'blockchain');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'address': address,
            'tagFrom': undefined,
            'tagTo': undefined,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            '1': 'pending', // new
            '2': 'ok', // completed
            '3': 'failed', // duplicate
            '4': 'failed', // not enough money
            '5': 'pending', // waiting for manual approval from XENA
            '100': 'pending', // request is being processed
            '101': 'pending', // request is being processed
            '102': 'pending', // request is being processed
            '103': 'pending', // request is being processed
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const currency = this.currency (code);
        let uuid = this.uuid ();
        uuid = uuid.split ('-');
        uuid = uuid.join ('');
        const request = {
            'currency': currency['id'],
            'accountId': accountId,
            'amount': this.currencyToPrecision (code, amount),
            'address': address,
            'id': uuid, // mandatory external ID (string), used by the client to identify his request
        };
        const response = await this.privatePostTransfersAccountsAccountIdWithdrawals (this.extend (request, params));
        //
        //     {
        //         "withdrawalRequestId": 47383243,
        //         "status": 1,
        //         "statusMessage": "Pending confirmation"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseLedgerEntryType (type) {
        const types = {
            'deposit': 'transaction',
            'withdrawal': 'transaction',
            'internal deposit': 'transfer',
            'internal withdrawal': 'transfer',
            'rebate': 'rebate',
            'reward': 'reward',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "accountId":8263118,
        //         "ts":1551974415000000000,
        //         "amount":"-1",
        //         "currency":"BTC",
        //         "kind":"internal withdrawal",
        //         "commission":"0",
        //         "id":96
        //     }
        //
        const id = this.safeString (item, 'id');
        let direction = undefined;
        const account = this.safeString (item, 'accountId');
        const referenceId = undefined;
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'kind'));
        const code = this.safeCurrencyCode (this.safeString (item, 'currency'), currency);
        let amount = this.safeNumber (item, 'amount');
        if (amount < 0) {
            direction = 'out';
            amount = Math.abs (amount);
        } else {
            direction = 'in';
        }
        let timestamp = this.safeInteger (item, 'ts');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp / 1000000);
        }
        const fee = {
            'cost': this.safeNumber (item, 'commission'),
            'currency': code,
        };
        const before = undefined;
        const after = this.safeNumber (item, 'balance');
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': before,
            'after': after,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const request = {
            'accountId': accountId,
            // 'page': 1,
            // 'limit': 5000, // max 5000
            // 'from': time,
            // 'to': time,
            // 'symbol': currency['id'],
            // 'trade_id': id,
            // 'client_order_id': id,
            // 'txid': txid,
            // 'kind': 'deposit', // 'withdrawal, 'internal deposit', 'internal withdrawal', 'rebate', 'reward'
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        if (since !== undefined) {
            request['from'] = since * 1000000;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // max 5000
        }
        const response = await this.privateGetTransfersAccountsAccountIdBalanceHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "accountId":8263118,
        //             "ts":1551974415000000000,
        //             "amount":"-1",
        //             "currency":"BTC",
        //             "kind":"internal withdrawal",
        //             "commission":"0",
        //             "id":96
        //         },
        //         {
        //             "accountId":8263118,
        //             "ts":1551964677000000000,
        //             "amount":"-1",
        //             "currency":"BTC",
        //             "kind":"internal deposit",
        //             "commission":"0",
        //             "id":95
        //         }
        //     ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    async fetchLeverageTiers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetCommonInstruments (params);
        //
        //    [
        //        {
        //            "id": "XBTUSD_3M_240622",
        //            "type": "Margin",
        //            "marginType": "XenaFuture",
        //            "symbol": "XBTUSD_3M_240622",
        //            "baseCurrency": "BTC",
        //            "quoteCurrency": "USD",
        //            "settlCurrency": "USDC",
        //            "tickSize": 0,
        //            "minOrderQuantity": "0.0001",
        //            "orderQtyStep": "0.0001",
        //            "limitOrderMaxDistance": "10",
        //            "priceInputMask": "00000.0",
        //            "enabled": true,
        //            "liquidationMaxDistance": "0.01",
        //            "contractValue": "1",
        //            "contractCurrency": "BTC",
        //            "lotSize": "1",
        //            "maxOrderQty": "10",
        //            "maxPosVolume": "200",
        //            "mark": ".XBTUSD_3M_240622",
        //            "underlying": ".BTC3_TWAP",
        //            "openInterest": ".XBTUSD_3M_240622_OpenInterest",
        //            "addUvmToFreeMargin": "ProfitAndLoss",
        //            "margin": {
        //                "netting": "PositionsAndOrders",
        //                "rates": [
        //                    { "maxVolume": "10", "initialRate": "0.05", "maintenanceRate": "0.025" },
        //                    { "maxVolume": "20", "initialRate": "0.1", "maintenanceRate": "0.05" },
        //                    { "maxVolume": "30", "initialRate": "0.2", "maintenanceRate": "0.1" },
        //                    { "maxVolume": "40", "initialRate": "0.3", "maintenanceRate": "0.15" },
        //                    { "maxVolume": "60", "initialRate": "0.4", "maintenanceRate": "0.2" },
        //                    { "maxVolume": "150", "initialRate": "0.5", "maintenanceRate": "0.25" },
        //                    { "maxVolume": "200", "initialRate": "1", "maintenanceRate": "0.5" }
        //               ],
        //               "rateMultipliers": {
        //                    "LimitBuy": "1",
        //                    "LimitSell": "1",
        //                    "Long": "1",
        //                    "MarketBuy": "1",
        //                    "MarketSell": "1",
        //                    "Short": "1",
        //                    "StopBuy": "0",
        //                    "StopSell": "0"
        //                }
        //            },
        //            "clearing": { "enabled": true, "index": ".XBTUSD_3M_240622" },
        //            "riskAdjustment": { "enabled": true, "index": ".RiskAdjustment_IR" },
        //            "expiration": { "enabled": true, "index": ".BTC3_TWAP" },
        //            "pricePrecision": 1,
        //            "priceRange": {
        //                "enabled": true,
        //                "distance": "0.2",
        //                "movingBoundary": "0",
        //                "lowIndex": ".XBTUSD_3M_240622_LOWRANGE",
        //                "highIndex": ".XBTUSD_3M_240622_HIGHRANGE"
        //            },
        //            "priceLimits": {
        //                "enabled": true,
        //                "distance": "0.5",
        //                "movingBoundary": "0",
        //                "lowIndex": ".XBTUSD_3M_240622_LOWLIMIT",
        //                "highIndex": ".XBTUSD_3M_240622_HIGHLIMIT"
        //            },
        //            "serie": "XBTUSD",
        //            "tradingStartDate": "2021-12-31 07:00:00",
        //            "expiryDate": "2022-06-24 08:00:00"
        //           },
        //           ...
        //        ]
        //
        return this.parseLeverageTiers (response, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market) {
        /**
            @param info: Exchange market response for 1 market
            {
                "id": "XBTUSD_3M_240622",
                "type": "Margin",
                "marginType": "XenaFuture",
                "symbol": "XBTUSD_3M_240622",
                "baseCurrency": "BTC",
                "quoteCurrency": "USD",
                "settlCurrency": "USDC",
                "tickSize": 0,
                "minOrderQuantity": "0.0001",
                "orderQtyStep": "0.0001",
                "limitOrderMaxDistance": "10",
                "priceInputMask": "00000.0",
                "enabled": true,
                "liquidationMaxDistance": "0.01",
                "contractValue": "1",
                "contractCurrency": "BTC",
                "lotSize": "1",
                "maxOrderQty": "10",
                "maxPosVolume": "200",
                "mark": ".XBTUSD_3M_240622",
                "underlying": ".BTC3_TWAP",
                "openInterest": ".XBTUSD_3M_240622_OpenInterest",
                "addUvmToFreeMargin": "ProfitAndLoss",
                "margin": {
                    "netting": "PositionsAndOrders",
                    "rates": [
                        { "maxVolume": "10", "initialRate": "0.05", "maintenanceRate": "0.025" },
                        { "maxVolume": "20", "initialRate": "0.1", "maintenanceRate": "0.05" },
                        { "maxVolume": "30", "initialRate": "0.2", "maintenanceRate": "0.1" },
                        { "maxVolume": "40", "initialRate": "0.3", "maintenanceRate": "0.15" },
                        { "maxVolume": "60", "initialRate": "0.4", "maintenanceRate": "0.2" },
                        { "maxVolume": "150", "initialRate": "0.5", "maintenanceRate": "0.25" },
                        { "maxVolume": "200", "initialRate": "1", "maintenanceRate": "0.5" }
                    ],
                    "rateMultipliers": {
                        "LimitBuy": "1",
                        "LimitSell": "1",
                        "Long": "1",
                        "MarketBuy": "1",
                        "MarketSell": "1",
                        "Short": "1",
                        "StopBuy": "0",
                        "StopSell": "0"
                    }
                },
                "clearing": { "enabled": true, "index": ".XBTUSD_3M_240622" },
                "riskAdjustment": { "enabled": true, "index": ".RiskAdjustment_IR" },
                "expiration": { "enabled": true, "index": ".BTC3_TWAP" },
                "pricePrecision": 1,
                "priceRange": {
                    "enabled": true,
                    "distance": "0.2",
                    "movingBoundary": "0",
                    "lowIndex": ".XBTUSD_3M_240622_LOWRANGE",
                    "highIndex": ".XBTUSD_3M_240622_HIGHRANGE"
                },
                "priceLimits": {
                    "enabled": true,
                    "distance": "0.5",
                    "movingBoundary": "0",
                    "lowIndex": ".XBTUSD_3M_240622_LOWLIMIT",
                    "highIndex": ".XBTUSD_3M_240622_HIGHLIMIT"
                },
                "serie": "XBTUSD",
                "tradingStartDate": "2021-12-31 07:00:00",
                "expiryDate": "2022-06-24 08:00:00"
            }
        */
        const margin = this.safeValue (info, 'margin');
        const rates = this.safeValue (margin, 'rates');
        let floor = 0;
        const id = this.safeString (info, 'symbol');
        market = this.safeMarket (id, market);
        const tiers = [];
        if (rates !== undefined) {
            for (let j = 0; j < rates.length; j++) {
                const tier = rates[j];
                const cap = this.safeNumber (tier, 'maxVolume');
                const initialRate = this.safeString (tier, 'initialRate');
                tiers.push ({
                    'tier': this.sum (j, 1),
                    'currency': market['base'],
                    'notionalFloor': floor,
                    'notionalCap': cap,
                    'maintenanceMarginRate': this.safeNumber (tier, 'maintenanceRate'),
                    'maxLeverage': this.parseNumber (Precise.stringDiv ('1', initialRate)),
                    'info': tier,
                });
                floor = cap;
            }
        }
        return tiers;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            // php does not format it properly
            // therefore we use string concatenation here
            // nonce *= 1000000;
            nonce = nonce.toString ();
            nonce = nonce + '000000'; // see the comment a few lines above
            const payload = 'AUTH' + nonce;
            const secret = this.secret.slice (14, 78);
            const ecdsa = this.ecdsa (payload, secret, 'p256', 'sha256');
            const signature = ecdsa['r'] + ecdsa['s'];
            headers = {
                'X-AUTH-API-KEY': this.apiKey,
                'X-AUTH-API-PAYLOAD': payload,
                'X-AUTH-API-SIGNATURE': signature,
                'X-AUTH-API-NONCE': nonce,
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"error":"Validation failed","fields":["address"]}
        //     {"error":"Money not enough. You have only: 0 ETH","fields":["amount"]}
        //
        if (code >= 400) {
            const feedback = this.id + ' ' + this.json (response);
            const message = this.safeString (response, 'error');
            const exact = this.exceptions['exact'];
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, body);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
