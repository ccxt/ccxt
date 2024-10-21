
//  ---------------------------------------------------------------------------

import Exchange from './abstract/fxopen.js';
import { ExchangeError, BadRequest, NotSupported, RateLimitExceeded, AuthenticationError, InsufficientFunds, ArgumentsRequired } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { Int, OrderSide, OrderType } from './base/types.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';

//  ---------------------------------------------------------------------------

export default class fxopen extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'fxopen',
            'name': 'FXOpen',
            'country': [ 'EU', 'UK', 'AU' ],
            'rateLimit': 100, // plain old 10 req/sec
            'version': '1',
            'has': {
                'CORS': undefined,
                'spot': false, // Can't open Cash account, though exchange server is listed in api page
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': true,
                'fetchL3OrderBook': false,
                'fetchLastPrices': true,
                'fetchLedger': false,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1s': 'S1',
                '10s': 'S10',
                '1m': 'M1',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'W1',
                '1M': 'MN1',
            },
            'urls': {
                // 'logo': 'https://example.com/image.jpg',
                'api': {
                    // see this.options['serverType'] and this.options['servers']
                    'public': 'https://{server}/api/v2/public/',
                    'private': 'https://{server}/api/v2/',
                    'publicExt': 'https://{server}/api/v2/',
                },
                'www': 'https://fxopen.com/',
                'doc': [
                    'https://ticktrader.fxopen.com/webapi',
                ],
            },
            'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'ticker/{filter}',
                        'tick',
                        'tick/{filter}',
                        'currency',
                        'currency/{filter}',
                        'currencytype',
                        'symbol',
                        'symbol/{filter}',
                        'tradesession',
                        'merger-and-acquisition/bysymbol/{filter}',
                        'merger-and-acquisition',
                        'quotehistory/{symbol}/{periodicity}/bars/{side}',
                        'quotehistory/{symbol}/ticks',
                        'quotehistory/{symbol}/level2',
                        'quotehistory/{symbol}/ticks/vwap/{degree}',
                        'split/bysymbol/{filter}',
                        'split/bycurrency/{filter}',
                        'split',
                        'pipsvalue',
                        'level2',
                        'level2/{filter}',
                    ],
                    'post': [
                        'dividend',
                    ],
                },
                'publicExt': {
                    'get': [
                        'cmc/orderbook',
                        'cmc/trades/{symbol}',
                        'cmc/ticker',
                        'cmc/asset',
                        'coingecko/orderbook',
                        'coingecko/tickers',
                        'coingecko/pairs',
                        'coingecko/trades/{ticker_id}',
                    ],
                },
                'private': {
                    'get': [
                        // 2.1
                        'tradesession',
                        'tradeserverinfo',
                        // 2.2
                        'currency',
                        'currency/{filter}',
                        'currencytype',
                        // 2.3
                        'symbol',
                        'symbol/{filter}',
                        'level2',
                        'level2/{filter}',
                        'tick',
                        'tick/{filter}',
                        'pipsvalue',
                        // 2.4
                        'position',
                        'position/{id}',
                        'account',
                        'asset',
                        'asset/{id}',
                        // 2.5
                        'trade',
                        'trade/{id}',
                        // 2.7
                        'quotehistory/version',
                        'quotehistory/symbols',
                        'quotehistory/{symbol}/periodicities',
                        'quotehistory/{symbol}/{periodicity}/bars/{side}/info',
                        'quotehistory/{symbol}/{periodicity}/bars/{side}',
                        'quotehistory/cache/{symbol}/{periodicity}/bars/{side}',
                        'quotehistory/{symbol}/ticks/info',
                        'quotehistory/{symbol}/level2/info',
                        'quotehistory/{symbol}/ticks',
                        'quotehistory/{symbol}/level2',
                        'quotehistory/{symbol}/vwap/{degree}/info',
                        'quotehistory/{symbol}/ticks/vwap/{degree}',
                        'quotehistory/cache/{symbol}/ticks/vwap/{degree}',
                        // 2.8
                        'split/bysymbol/{filter}',
                        'split/bycurrency/{filter}',
                        'split',
                        'merger-and-acquisition/bysymbol/{filter}',
                        'merger-and-acquisition',
                        'dividend',
                        'dividend/{filter}',
                    ],
                    'post': [
                        // 2.4
                        'dailysnapshots',
                        // 2.5
                        'trade',
                        'oco_trades',
                        // 2.6
                        'tradehistory',
                    ],
                    'put': [
                        'trade',
                    ],
                    'delete': [
                        'trade',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'precisionMode': DECIMAL_PLACES,
            'httpExceptions': {
                '400': BadRequest,
                '401': AuthenticationError, // Unauthorized. The request requires user authentication.
                '402': InsufficientFunds, // Unauthorized. The request requires user authentication.
                '403': ExchangeError, // Forbidden. Domain Server Address or Public Web API account was not configured.
                '404': BadRequest, // Request resource not found
                '410': ExchangeError, // Gone. Off quotes or dealer reject.
                '429': RateLimitExceeded, // Too Many Requests. The server blocks request because the throttling quote was exceeded.
                '500': ExchangeError, // Internal Server Error. The server encountered an unexpected condition which prevented it from fulfilling the request.
            },
            // exchange-specific options
            'options': {
                // most public method are available on private api
                // private api should have better rate limits
                'preferPrivateApi': true,
                'apiUrlOverride': {
                    // doesn't have private counterpart
                    'ticker': 'public',
                    'ticker/{filter}': 'public',
                },
                'defaultSettleCurrencyId': 'USD', // for settleId in public API markets
                'serverType': 'marginal', // see this.options['servers']
                'servers': {
                    'marginal': {
                        'hostname': 'ttlivewebapi.fxopen.net:8443',
                        'defaultMarketType': 'swap',
                    },
                    'exchange': {
                        // Public API works, can't open account
                        'hostname': 'cryptottlivewebapi.fxopen.net:8443',
                        'defaultMarketType': 'spot',
                    },
                },
                // for sandbox mode
                'testServers': {
                    'marginal': {
                        'hostname': 'marginalttdemowebapi.fxopen.net:8443',
                        'defaultMarketType': 'swap',
                    },
                    'exchange': {
                        // No demo server for spot markets
                        'hostname': 'marginalttdemowebapi.fxopen.net:8443',
                        'defaultMarketType': 'spot',
                    },
                },
                'accountInfoTimeout': 30000, // how long in ms accountInfoCache is considered fresh
                'accountInfoCache': {},
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    setSandboxMode (enabled) {
        if (enabled) {
            const testServers = this.safeValue (this.options, 'testServers');
            if (testServers === undefined) {
                throw new NotSupported (this.id + ' does not have a sandbox URL');
            }
            this.options['serversBackup'] = this.options['servers'];
            this.options['servers'] = testServers;
        } else {
            this.options['servers'] = this.options['serversBackup'];
        }
    }

    resolveServerUrl (url) {
        const serverType = this.safeString (this.options, 'serverType');
        const serverInfo = this.safeValue (this.options['servers'], serverType);
        const serverHostname = this.safeString (serverInfo, 'hostname');
        if (serverHostname === undefined) {
            throw new NotSupported (this.id + ' resolveServerUrl() unexpected server type: ' + serverType);
        }
        return this.implodeParams (url, { 'server': serverHostname });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const apiUrlOverride = this.safeValue (this.options, 'apiUrlOverride', {});
        const apiOverride = this.safeString (apiUrlOverride, path);
        if (apiOverride !== undefined) {
            api = apiOverride;
        } else if (api === 'public') {
            const preferPrivateApi = this.safeValue (this.options, 'preferPrivateApi', true);
            if (preferPrivateApi) {
                const hasCreds = this.checkRequiredCredentials (false);
                if (hasCreds) {
                    api = 'private';
                }
            }
        }
        const baseUrl = this.urls['api'][api];
        let url = this.resolveServerUrl (baseUrl) + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if ((method === 'GET') || (method === 'DELETE')) {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            const authMsg = nonce + this.uid + this.apiKey + method + url + payload;
            const signature = this.hmac (this.encode (authMsg), this.encode (this.secret), sha256, 'base64');
            const headerValue = 'HMAC ' + this.uid + ':' + this.apiKey + ':' + nonce + ':' + signature;
            headers = {
                'Authorization': headerValue,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name fxopen#fetchMarkets
         * @description retrieves data on all markets for fxopen
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing [market structures]{@link https://docs.ccxt.com/#/?id=market-structure}
         */
        if (this.checkRequiredCredentials (false)) {
            // Market type depends on account type
            await this.loadAccountInfo ();
        }
        const markets = await this.publicGetSymbol (params);
        return this.parseMarkets (markets);
    }

    parseMarkets (markets) {
        // [
        //     {
        //       "Symbol": "BTCUSD"
        //       "ContractSize": 1,
        //       ... other props ...
        //     },
        //     {
        //       "Symbol": "BTCUSD_L"
        //       "ContractSize": 1,
        //       ... other props ...
        //     }
        // ]
        let marketType = undefined;
        let settleId = undefined;
        let settle = undefined;
        const accInfo = this.accountInfo (false);
        if (accInfo !== undefined) {
            marketType = accInfo['marketType'];
            settleId = accInfo['settleId'];
            settle = accInfo['settle'];
        } else {
            const serverType = this.safeString (this.options, 'serverType');
            const serverInfo = this.safeValue (this.options['servers'], serverType);
            marketType = this.safeString (serverInfo, 'defaultMarketType');
            settleId = this.safeString (this.options, 'defaultSettleCurrencyId');
            settle = this.safeCurrencyCode (settleId);
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const marketId = this.safeString (entry, 'Symbol');
            if (!this.isSpecialMarketId (marketId)) {
                const market = this.parseMarket (entry, marketId);
                market['type'] = marketType;
                if (marketType === 'swap') {
                    const contractSize = this.safeNumber (entry, 'ContractSize');
                    const swapSymbol = market['symbol'] + ':' + settle;
                    market['symbol'] = swapSymbol;
                    market['swap'] = true;
                    market['contract'] = true;
                    market['contractSize'] = contractSize;
                    market['settleId'] = settleId;
                    market['settle'] = settle;
                } else {
                    market['spot'] = true;
                }
                result.push (market);
            }
        }
        return result;
    }

    parseMarket (market, id = undefined) {
        //     {
        //       "DefaultSlippage": 0.1,
        //       "MinCommission": 0,
        //       "LimitsCommission": 0,
        //       "Commission": 0.1,
        //       "TradeAmountStep": 0.001,
        //       "MaxTradeAmount": 1000,
        //       "MinTradeAmount": 0.001,
        //       "IsLongOnly": false,
        //       "IsCloseOnly": false,
        //       "SwapEnabled": false,
        //       "IsTradeAllowed": true,
        //       "TripleSwapDay": 3,
        //       "SwapSizeLong": 0,
        //       "SwapSizeShort": 0,
        //       "Color": -551354,
        //       "ProfitCurrencyPrecision": 5,
        //       "MarginCurrencyPrecision": 8,
        //       "Precision": 3,
        //       "HiddenLimitOrderMarginReduction": 1,
        //       "StopOrderMarginReduction": 1,
        //       "MarginFactor": 0.33,
        //       "MarginHedged": 0.5,
        //       "ContractSize": 1,
        //       "MarginMode": "CFD",
        //       "ProfitMode": "CFD",
        //       "SwapType": "Points",
        //       "CommissionType": "Percentage",
        //       "CommissionChargeType": "PerLot",
        //       "SlippageType": "Percent",
        //       "ExtendedName": "BTCUSD",
        //       "SecurityDescription": "Bitcoin vs Fiat",
        //       "SecurityName": "Crypto BTC Fiat",
        //       "StatusGroupId": "Default",
        //       "MinCommissionCurrency": "USD",
        //       "Schedule": "Default",
        //       "Description": "BitCoin vs US Dollar",
        //       "ProfitCurrency": "USD",
        //       "MarginCurrency": "BTC",
        //       "Symbol": "BTCUSD"
        //     }
        if (id === undefined) {
            this.safeString (market, 'Symbol');
        }
        const baseId = this.safeString (market, 'MarginCurrency');
        const quoteId = this.safeString (market, 'ProfitCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const active = this.safeValue (market, 'IsTradeAllowed', false);
        const minAmount = this.safeString (market, 'MinTradeAmount');
        const maxAmount = this.safeString (market, 'MaxTradeAmount');
        const amountStep = this.safeString (market, 'TradeAmountStep');
        const pricePrecision = this.safeInteger (market, 'Precision');
        const amountPrecision = this.precisionFromString (amountStep);
        const takerFee = this.safeString (market, 'Commission');
        const makerFee = this.safeString (market, 'LimitsCommission');
        const feeType = this.safeString (market, 'CommissionType');
        // 'Forex', 'CFD'
        // Forex:
        // Margin = marginVolume * MarginFactor / Account.Leverage
        // Leverage of any order/position = Account.Leverage / MarginFactor
        // CFD: Account.Leverage replaced with '1'
        const leverageMode = this.safeString (market, 'MarginMode');
        const marginFactor = this.safeString (market, 'MarginFactor');
        const leverageCoeff = Precise.stringDiv ('1', marginFactor);
        return {
            'id': id,
            'symbol': symbol,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'active': active === true,
            'type': undefined,
            'spot': false,
            'margin': false,
            'future': false,
            'option': false,
            'swap': false,
            'contract': false,
            'contractSize': undefined,
            'linear': true,
            'inverse': false,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'taker': this.parseNumber (takerFee),
            'maker': this.parseNumber (makerFee),
            'percentage': feeType === 'Percentage',
            'tierBased': false,
            'feeSide': 'get',
            'precision': {
                'price': pricePrecision,
                'amount': amountPrecision,
                'cost': undefined,
            },
            'limits': {
                'amount': {
                    'min': this.parseNumber (minAmount),
                    'max': this.parseNumber (maxAmount),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'leverageMode': leverageMode,
            'leverageCoeff': leverageCoeff,
            'info': market,
        };
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name fxopen#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} an associative dictionary of [currency structures]{@link https://docs.ccxt.com/#/?id=currency-structure}
         */
        const currencies = await this.publicGetCurrency (params);
        return this.parseCurrencies (currencies);
    }

    parseCurrencies (currencies) {
        // [
        //     {
        //       "Name": "BTC"
        //       ... other props ...
        //     }
        // ]
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const entry = currencies[i];
            const id = this.safeString (entry, 'Name');
            const code = this.safeCurrencyCode (id);
            result[code] = this.parseCurrency (entry, id, code);
        }
        return result;
    }

    parseCurrency (currency, id = undefined, code = undefined) {
        //     {
        //       "Precision": 8,
        //       "DefaultStockFee": 0,
        //       "Tax": 0,
        //       "Type": "Crypto",
        //       "Description": "BitCoin",
        //       "Name": "BTC"
        //     }
        if (id === undefined) {
            id = this.safeString (currency, 'Name');
        }
        if (code === undefined) {
            code = this.safeCurrencyCode (id);
        }
        const name = this.safeString (currency, 'Description');
        const precision = this.safeInteger (currency, 'Precision');
        return {
            'id': id,
            'code': code,
            'name': name,
            'active': true,
            'fee': undefined,
            'precision': precision,
            'deposit': false,
            'withdraw': false,
            // limits.amount depends on the market
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
            'networks': {},
            'info': currency,
        };
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let filter = '';
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            // param is injected in url space char has to be encoded
            filter = marketIds.join ('%20');
        }
        const request = {
            'filter': filter,
        };
        const response = await this.publicGetTickerFilter (this.extend (request, params));
        // response === array of ticker objects
        return this.parseTickers (response, symbols);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name fxopen#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} [Ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const request = {
            'filter': this.marketId (symbol),
        };
        const response = await this.publicGetTickerFilter (this.extend (request, params));
        // response === array of ticker objects
        return this.parseTicker (this.safeValue (response, 0));
    }

    parseTicker (ticker, market = undefined) {
        //     {
        //       "DailyTradedTotalVolume": 0.02,
        //       "DailyTradedSellVolume": 0.01,
        //       "DailyTradedBuyVolume": 0.01,
        //       "DailyBestSellPrice": 26695.759,
        //       "DailyBestBuyPrice": 26755.559,
        //       "LastSellTimestamp": 1684431755045,
        //       "LastSellVolume": 0.01,
        //       "LastSellPrice": 26695.759,
        //       "LastBuyTimestamp": 1684438634005,
        //       "LastBuyVolume": 0.01,
        //       "LastBuyPrice": 26755.559,
        //       "BestAsk": 27133.815,
        //       "BestBid": 27131.102,
        //       "Symbol": "BTCUSD"
        //     }
        const marketId = this.safeString (ticker, 'Symbol');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.milliseconds ();
        const bid = this.omitZero (this.safeString (ticker, 'BestBid'));
        const ask = this.omitZero (this.safeString (ticker, 'BestAsk'));
        const baseVolume = this.safeString (ticker, 'DailyTradedTotalVolume');
        const lastSellTimestamp = this.safeInteger (ticker, 'LastSellTimestamp');
        const lastSellPrice = this.omitZero (this.safeString (ticker, 'LastSellPrice'));
        const lastBuyTimestamp = this.safeInteger (ticker, 'LastBuyTimestamp');
        const lastBuyPrice = this.omitZero (this.safeString (ticker, 'LastBuyPrice'));
        let closeStr = lastSellPrice;
        if (lastSellTimestamp < lastBuyTimestamp) {
            closeStr = lastBuyPrice;
        }
        const close = this.parseNumber (closeStr);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.parseNumber (bid),
            'bidVolume': undefined,
            'ask': this.parseNumber (ask),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.parseNumber (baseVolume),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchBidsAsks (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchBidsAsks
         * @description fetches the best bid and ask price and volume for multiple markets
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let filter = '';
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            // param is injected in url space char has to be encoded
            filter = marketIds.join ('%20');
        }
        const request = {
            'filter': filter,
        };
        const response = await this.publicGetTickFilter (this.extend (request, params));
        // response === array of best bid/ask objects
        return this.parseBidsAsksAsTickers (response, symbols);
    }

    parseBidsAsksAsTickers (bidsAsks, symbols: string[] = undefined) {
        // [
        //     {
        //       "Symbol": "BTCUSD"
        //       ... other props ...
        //     }
        // ]
        // stripped down clone of parseTickers
        const results = [];
        for (let i = 0; i < bidsAsks.length; i++) {
            const bidAsk = bidsAsks[i];
            const marketId = this.safeString (bidAsk, 'Symbol');
            if (!this.isSpecialMarketId (marketId)) {
                const ticker = this.parseBidAskAsTicker (bidAsk, marketId);
                results.push (ticker);
            }
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (results, 'symbol', symbols);
    }

    parseBidAskAsTicker (bidask, marketId = undefined) {
        // {
        //     "Timestamp": 1684837447457,
        //     "IndicativeTick": false,
        //     "BestBid": {
        //       "Volume": 0.521,
        //       "Price": 27301.173,
        //       "Type": "Bid"
        //     },
        //     "BestAsk": {
        //       "Volume": 1.037,
        //       "Price": 27303.905,
        //       "Type": "Ask"
        //     },
        //     "TickType": "Normal",
        //     "Symbol": "BTCUSD"
        // }
        if (marketId === undefined) {
            marketId = this.safeString (bidask, 'Symbol');
        }
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (bidask, 'Timestamp');
        const bestBidObj = this.safeValue (bidask, 'BestBid', {});
        const bid = this.safeString (bestBidObj, 'Price');
        let bidVolume = undefined;
        const bestAskObj = this.safeValue (bidask, 'BestAsk', {});
        const ask = this.safeString (bestAskObj, 'Price');
        let askVolume = undefined;
        const isIndicativeTick = this.safeValue (bidask, 'IndicativeTick', false);
        if (!isIndicativeTick) {
            // indicative ticks are not tradable, they are used for conversion rates
            bidVolume = this.safeString (bestBidObj, 'Volume');
            askVolume = this.safeString (bestAskObj, 'Volume');
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.parseNumber (bid),
            'bidVolume': this.parseNumber (bidVolume),
            'ask': this.parseNumber (ask),
            'askVolume': this.parseNumber (askVolume),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': bidask,
        };
    }

    async fetchLastPrices (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchLastPrices
         * @description fetches the last price for multiple markets
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the last prices
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a dictionary of [lastPrice structures]
         */
        await this.loadMarkets ();
        let filter = '';
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            // param is injected in url space char has to be encoded
            filter = marketIds.join ('%20');
        }
        const request = {
            'filter': filter,
        };
        const response = await this.publicGetTickerFilter (this.extend (request, params));
        // response === array of ticker objects
        return this.parseLastPrices (response, symbols);
    }

    parseLastPrice (ticker, market = undefined) {
        //     {
        //       "DailyTradedTotalVolume": 0.02,
        //       "DailyTradedSellVolume": 0.01,
        //       "DailyTradedBuyVolume": 0.01,
        //       "DailyBestSellPrice": 26695.759,
        //       "DailyBestBuyPrice": 26755.559,
        //       "LastSellTimestamp": 1684431755045,
        //       "LastSellVolume": 0.01,
        //       "LastSellPrice": 26695.759,
        //       "LastBuyTimestamp": 1684438634005,
        //       "LastBuyVolume": 0.01,
        //       "LastBuyPrice": 26755.559,
        //       "BestAsk": 27133.815,
        //       "BestBid": 27131.102,
        //       "Symbol": "BTCUSD"
        //     }
        const marketId = this.safeString (ticker, 'Symbol');
        const symbol = this.safeSymbol (marketId);
        const lastSellTimestamp = this.safeInteger (ticker, 'LastSellTimestamp');
        const lastBuyTimestamp = this.safeInteger (ticker, 'LastBuyTimestamp');
        let timestamp = lastSellTimestamp;
        let side = 'sell';
        let price = this.safeString (ticker, 'LastSellPrice');
        let baseVolume = this.safeString (ticker, 'LastSellVolume');
        if (lastSellTimestamp < lastBuyTimestamp) {
            timestamp = lastBuyTimestamp;
            side = 'buy';
            price = this.safeString (ticker, 'LastBuyPrice');
            baseVolume = this.safeString (ticker, 'LastBuyVolume');
        }
        if (timestamp < 0) {
            // date 01/01/0001 is used when there are no trades available
            timestamp = undefined;
            side = undefined;
            price = undefined;
            baseVolume = undefined;
        }
        const quoteVolume = Precise.stringMul (price, baseVolume);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'price': this.parseNumber (price),
            'side': side,
            'baseVolume': this.parseNumber (baseVolume),
            'quoteVolume': this.parseNumber (quoteVolume),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} [Order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure}
         */
        await this.loadMarkets ();
        const request = {
            'filter': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetLevel2Filter (this.extend (request, params));
        // response === array of orderBook objects
        return this.parseOrderBookInternal (this.safeValue (response, 0), symbol);
    }

    parseOrderBookInternal (orderBook, symbol: string = undefined) {
        //     {
        //       "Timestamp": 1684849423757,
        //       "IndicativeTick": false,
        //       "BestBid": {
        //         "Volume": 0.024,
        //         "Price": 27242.004,
        //         "Type": "Bid"
        //       },
        //       "BestAsk": {
        //         "Volume": 1.041,
        //         "Price": 27244.729,
        //         "Type": "Ask"
        //       },
        //       "Bids": [
        //         {
        //           "Volume": 0.024,
        //           "Price": 27242.004,
        //           "Type": "Bid"
        //         }
        //       ],
        //       "Asks": [
        //         {
        //           "Volume": 1.041,
        //           "Price": 27244.729,
        //           "Type": "Ask"
        //         }
        //       ],
        //       "TickType": "Normal",
        //       "Symbol": "BTCUSD"
        //     }
        if (symbol === undefined) {
            const marketId = this.safeString (orderBook, 'Symbol');
            symbol = this.symbol (marketId);
        }
        const timestamp = this.safeInteger (orderBook, 'Timestamp');
        const isIndicativeTick = this.safeValue (orderBook, 'IndicativeTick');
        if (isIndicativeTick) {
            // indicative ticks are not tradable, they are used for conversion rates
            return {
                'symbol': symbol,
                'bids': [],
                'asks': [],
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'nonce': undefined,
                'info': undefined,
            };
        } else {
            const res = this.parseOrderBook (orderBook, symbol, timestamp, 'Bids', 'Asks', 'Price', 'Volume');
            res['info'] = orderBook;
            return res;
        }
    }

    async fetchOrderBooks (symbols: string[] = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the order book for, all market order books are returned if not assigned
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        let filter = '';
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            // param is injected in url space char has to be encoded
            filter = marketIds.join ('%20');
        }
        const request = {
            'filter': filter,
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetLevel2Filter (this.extend (request, params));
        // response === array of orderBook objects
        return this.parseOrderBooksInternal (response, symbols);
    }

    parseOrderBooksInternal (orderbooks, symbols) {
        // [
        //     {
        //         "Symbol": "BTCUSD",
        //         ... other props ...
        //     }
        // ]
        const results = [];
        for (let i = 0; i < orderbooks.length; i++) {
            const orderBook = orderbooks[i];
            const marketId = this.safeString (orderBook, 'Symbol');
            if (!this.isSpecialMarketId (marketId)) {
                const ticker = this.parseOrderBookInternal (orderBook, this.symbol (marketId));
                results.push (ticker);
            }
        }
        symbols = this.marketSymbols (symbols);
        return this.filterByArray (results, 'symbol', symbols);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch. Default 100, max 1000
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {string|undefined} params.side "bid" or "ask" for candles built from bid and ask prices. Defaults to "bid"
         * @param {string|undefined} params.priceType "ticks" or "trades" for candles built from public ticks and public trades prices. Defaults to "ticks"
         * @param {int|undefined} params.direction 1 to seach forward search, -1 - backwards. Defaults to 1, if since is not specified then -1
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultLimit = 100; // reasonable amount to view in CLI tool
        const maxLimit = 1000;
        limit = (limit === undefined) ? defaultLimit : Math.min (limit, maxLimit);
        const sideParam = this.safeString (params, 'side');
        const side = (sideParam === 'ask') ? 'ask' : 'bid';
        const priceTypeParam = this.safeString (params, 'priceType');
        const priceType = (priceTypeParam === 'trades') ? 'trades' : 'ticks';
        const direction = this.getDirectionFromParams (params, since);
        params = this.omit (params, 'side', 'priceType', 'direction');
        // Exchange convention: Symbols ending with _L store OHLCV built from public trades prices
        const marketSuffix = (priceType === 'trades') ? '_L' : '';
        const marketId = market['id'] + marketSuffix;
        const timestamp = (since !== undefined) ? since : (this.milliseconds () + 10_000);
        const request = {
            'symbol': marketId,
            'periodicity': this.safeString (this.timeframes, timeframe, timeframe),
            'side': side,
            'timestamp': timestamp,
            'count': direction * limit,
        };
        const response = await this.publicGetQuotehistorySymbolPeriodicityBarsSide (this.extend (request, params));
        // {
        //     "Symbol": "BTCUSD",
        //     "Bars": [ ... array of objects ...]
        // }
        const sinceOverride = (direction === -1) ? undefined : since; // disable since filter when going backwards
        return this.parseOHLCVs (response['Bars'], market, timeframe, sinceOverride, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        // {
        //     "Volume": 520,
        //     "Close": 26915.961,
        //     "Low": 26914.568,
        //     "High": 26938.921,
        //     "Open": 26915.411,
        //     "Timestamp": 1684762620000
        // }
        return [
            this.safeInteger (ohlcv, 'Timestamp'),
            this.safeNumber (ohlcv, 'Open'),
            this.safeNumber (ohlcv, 'High'),
            this.safeNumber (ohlcv, 'Low'),
            this.safeNumber (ohlcv, 'Close'),
            this.safeNumber (ohlcv, 'Volume'),
        ];
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch. Default 100, max 1000
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {int|undefined} params.direction 1 to seach forward search, -1 - backwards. Defaults to 1, if since is not specified then -1
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultLimit = 100; // reasonable amount to view in CLI tool
        const maxLimit = 1000;
        limit = (limit === undefined) ? defaultLimit : Math.min (limit, maxLimit);
        const direction = this.getDirectionFromParams (params, since);
        params = this.omit (params, 'direction');
        const marketId = market['id'] + '_L';
        const timestamp = (since !== undefined) ? since : (this.milliseconds () + 10_000);
        const request = {
            'symbol': marketId,
            'timestamp': timestamp,
            'count': direction * limit,
        };
        const response = await this.publicGetQuotehistorySymbolTicks (this.extend (request, params));
        // {
        //     "Symbol": "BTCUSD_L",
        //     "Ticks": [ ... array of objects ... ]
        // }
        const sinceOverride = (direction === -1) ? undefined : since; // disable since filter when going backwards
        return this.parseTrades (response['Ticks'], market, sinceOverride, limit);
    }

    parseTrade (trade, market = undefined) {
        if ('TickType' in trade) {
            return this.parsePublicTrade (trade, market);
        } else {
            return this.parsePrivateTrade (trade, market);
        }
    }

    parsePublicTrade (trade, market = undefined) {
        // --- case 1 ---
        //   {
        //     "Timestamp": 1684431755045,
        //     "IndicativeTick": true,
        //     "BestBid": {
        //       "Volume": 0.01,
        //       "Price": 26695.759,
        //       "Type": "Bid"
        //     },
        //     "TickType": "IndicativeBid"
        //   }
        // --- case 2 ---
        //   {
        //     "Timestamp": 1684438634005,
        //     "IndicativeTick": true,
        //     "BestAsk": {
        //       "Volume": 0.01,
        //       "Price": 26755.559,
        //       "Type": "Ask"
        //     },
        //     "TickType": "IndicativeAsk"
        //   }
        const timestamp = this.safeInteger (trade, 'Timestamp');
        const symbol = this.safeString (market, 'symbol');
        let side = 'sell';
        let parseObj = this.safeValue (trade, 'BestBid');
        if (parseObj === undefined) {
            side = 'buy';
            parseObj = this.safeValue (trade, 'BestAsk');
        }
        const price = this.safeString (parseObj, 'Price');
        const amount = this.safeString (parseObj, 'Volume');
        // Markets have contractSize, but Volume here is already multiplied by that value
        // Need to override this.safeTrade() cost calculation
        const cost = Precise.stringMul (price, amount);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        }, market);
    }

    accountInfo (error = true) {
        const accInfo = this.safeValue (this.options, 'accountInfoCache');
        const timestamp = this.safeInteger (accInfo, 'timestamp');
        if (timestamp === undefined) {
            if (error) {
                throw new ExchangeError (this.id + ' accountInfo not loaded');
            } else {
                return undefined;
            }
        }
        return accInfo;
    }

    async loadAccountInfo (reload = false, params = {}) {
        let accInfo = undefined;
        if (reload) {
            accInfo = await this.fetchAccountInfo (params);
            this.options['accountInfoCache'] = accInfo;
        } else {
            accInfo = this.safeValue (this.options, 'accountInfoCache', {});
            const accountInfoTimeout = this.safeInteger (this.options, 'accountInfoTimeout');
            const timestamp = this.safeInteger (accInfo, 'timestamp', 0);
            const now = this.milliseconds ();
            if ((timestamp !== 0) && (timestamp + accountInfoTimeout < now)) {
                return accInfo;
            } else {
                accInfo = await this.fetchAccountInfo (params);
                this.options['accountInfoCache'] = accInfo;
            }
        }
        return accInfo;
    }

    async fetchAccountInfo (params = {}) {
        /**
         * @method
         * @name fxopen#fetchAccountInfo
         * @description retrieves data on trade account properties
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} an object representing account info.
         */
        const response = await this.privateGetAccount (params);
        return this.parseAccountInfo (response);
    }

    parseAccountInfo (account) {
        // {
        //     "Id": 0,
        //     "AccountingType": "Gross",
        //     "Name": "string",
        //     "FirstName": "string",
        //     "LastName": "string",
        //     "Phone": "string",
        //     "Country": "string",
        //     "State": "string",
        //     "City": "string",
        //     "Address": "string",
        //     "ZipCode": "string",
        //     "SocialSecurityNumber": "string",
        //     "Email": "string",
        //     "Comment": "string",
        //     "Registered": 1684919868187,
        //     "Modified": 1684919868187,
        //     "IsArchived": true,
        //     "IsBlocked": true,
        //     "IsReadonly": true,
        //     "IsValid": true,
        //     "IsWebApiEnabled": true,
        //     "Leverage": 0,
        //     "Balance": 0,
        //     "BalanceCurrency": "string",
        //     "Profit": 0,
        //     "Commission": 0,
        //     "AgentCommission": 0,
        //     "Swap": 0,
        //     "Rebate": 0,
        //     "Equity": 0,
        //     "Margin": 0,
        //     "MarginLevel": 0,
        //     "MarginCallLevel": 0,
        //     "StopOutLevel": 0,
        //     "ReportCurrency": "string",
        //     "TokenCommissionCurrency": "string",
        //     "TokenCommissionCurrencyDiscount": 0,
        //     "IsTokenCommissionEnabled": true,
        //     "MaxOverdraftAmount": 0,
        //     "OverdraftCurrency": "string",
        //     "UsedOverdraftAmount": 0,
        //     "Throttling": [
        //       {
        //         "Protocol": "All",
        //         "SessionsPerAccount": 0,
        //         "RequestsPerSecond": 0,
        //         "ThrottlingMethods": [
        //           {
        //             "Method": "Login",
        //             "RequestsPerSecond": 0,
        //             "ConcurrentRequestCount": 0
        //           }
        //         ],
        //         "ConcurrentRequestCount": 0
        //       }
        //     ]
        // }
        const timestamp = this.milliseconds ();
        const id = this.safeString (account, 'Id');
        const name = this.safeString (account, 'Name');
        const fxopenType = this.safeString (account, 'AccountingType');
        const isGrossType = fxopenType === 'Gross';
        const isNetType = fxopenType === 'Net';
        const isCashType = fxopenType === 'Cash';
        let marketType = undefined;
        let settleId = undefined;
        let settle = undefined;
        if (isCashType) {
            marketType = 'spot';
            // cash accounts have a collection of zero or more assets
            // available at this.privateGetAsset ()
        } else {
            marketType = 'swap';
            settleId = this.safeString (account, 'BalanceCurrency');
            settle = this.safeCurrencyCode (settleId);
        }
        const leverage = this.safeString (account, 'Leverage', '1');
        const marginCallLevel = this.safeString (account, 'MarginCallLevel');
        const marginCallCoeff = Precise.stringDiv (marginCallLevel, '100');
        const stopOutLevel = this.safeString (account, 'StopOutLevel');
        const stopOutCoeff = Precise.stringDiv (stopOutLevel, '100');
        const balance = this.safeString (account, 'Balance');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'name': name,
            'marketType': marketType,
            'settleId': settleId,
            'settle': settle,
            'isGrossType': isGrossType,
            'isNetType': isNetType,
            'isCashType': isCashType,
            'leverageStr': leverage,
            'marginCallCoeffStr': marginCallCoeff,
            'stopOutCoeffStr': stopOutCoeff,
            'cachedBalanceStr': balance,
            'info': account,
        };
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name fxopen#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} an object representing [balance structure]{@link https://docs.ccxt.com/#/README?id=balance-structure}.
         */
        const accInfo = await this.loadAccountInfo (false, params);
        if (accInfo['isCashType']) {
            const response = await this.privateGetAsset (params);
            return this.parseCashAccBalance (response);
        } else {
            const timestamp = this.safeInteger (accInfo, 'timestamp', 0);
            // reuse this.loadAccountInfo response at first call
            const accInfoTooOld = (this.milliseconds () - timestamp) > 10;
            if (accInfoTooOld) {
                const response = await this.privateGetAccount (params);
                return this.parseMarginAccBalance (response);
            } else {
                return this.parseMarginAccBalance (accInfo['info']);
            }
        }
    }

    parseMarginAccBalance (account) {
        // see parseAccountInfo for full definition
        // {
        //     "Balance": 0,
        //     "BalanceCurrency": "string",
        //     "Margin": 0,
        //     --- other account props ---
        // }
        const timestamp = this.milliseconds ();
        const result = {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': account,
        };
        const currencyId = this.safeString (account, 'BalanceCurrency');
        const code = this.safeCurrencyCode (currencyId);
        const balance = this.safeString (account, 'Balance');
        const margin = this.safeString (account, 'Margin');
        result[code] = {};
        result[code]['total'] = balance;
        result[code]['used'] = margin;
        return this.safeBalance (result);
    }

    parseCashAccBalance (assets) {
        // [
        //     {
        //       "Currency": "string",
        //       "Amount": 0,
        //       "FreeAmount": 0,
        //       "LockedAmount": 0,
        //       "CurrencyToReportConversionRate": 0,
        //       "ReportToCurrencyConversionRate": 0
        //     }
        // ]
        const timestamp = this.milliseconds ();
        const result = {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': assets,
        };
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const currencyId = this.safeString (asset, 'Currency');
            const code = this.safeCurrencyCode (currencyId);
            const total = this.safeString (asset, 'Amount');
            const free = this.safeString (asset, 'FreeAmount');
            const used = this.safeString (asset, 'LockedAmount');
            result[code] = {};
            result[code]['total'] = total;
            result[code]['free'] = free;
            result[code]['used'] = used;
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {float|undefined} params.stopPrice the price at which order should be activated, in units of the base currency
         * @param {float|undefined} params.stopLossPrice the price at which Gross account position should be closed by exchange to prevent further losses
         * @param {float|undefined} params.takeProfitPrice the price at which Gross account position should be closed by exchange to gain profit
         * @param {string|undefined} params.timeInForce only 'IOC' is supported
         * @param {int|undefined} params.expiry sets a timestamp in milliseconds when Stop/Limit/StopLimit order will be canceled by exchange
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const accInfo = await this.loadAccountInfo ();
        const market = this.market (symbol);
        const stopPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const clientOrderId = this.safeString (params, 'clientOrderId');
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        const expiry = this.safeInteger (params, 'expiry');
        this.omit ('triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'clientOrderId', 'timeInForce', 'expiry');
        if (side === 'buy') {
            side = 'Buy';
        } else if (side === 'sell') {
            side = 'Sell';
        }
        const typeIsMarket = type === 'market';
        const typeIsLimit = type === 'limit';
        const hasPrice = price !== undefined;
        const hasStopPrice = stopPrice !== undefined;
        if (typeIsMarket) {
            type = (hasStopPrice) ? 'Stop' : 'Market';
        } else if (typeIsLimit) {
            if (!hasPrice) {
                throw new ArgumentsRequired (this.id + ' createOrder() price is required for Limit and StopLimit orders');
            }
            type = (hasStopPrice) ? 'StopLimit' : 'Limit';
        }
        // price, amount - strings are not accepted
        const request = {
            'Symbol': market['id'],
            'Side': side,
            'Type': type,
            'Amount': this.parseNumber (this.amountToPrecision (symbol, amount)),
        };
        if (price !== undefined) {
            request['Price'] = this.parseNumber (this.priceToPrecision (symbol, price));
        }
        if (stopPrice !== undefined) {
            request['StopPrice'] = this.parseNumber (this.priceToPrecision (symbol, stopPrice));
        }
        const isNotGrossAccount = (!accInfo['isGrossType']);
        if (stopLossPrice !== undefined) {
            if (isNotGrossAccount) {
                throw new NotSupported (this.id + ' createOrder() params.stopLossPrice is ignored on this account type');
            }
            request['StopLoss'] = this.parseNumber (this.priceToPrecision (symbol, stopLossPrice));
        }
        if (takeProfitPrice !== undefined) {
            if (isNotGrossAccount) {
                throw new NotSupported (this.id + ' createOrder() params.takeProfitPrice is ignored on this account type');
            }
            request['TakeProfit'] = this.parseNumber (this.priceToPrecision (symbol, takeProfitPrice));
        }
        if (clientOrderId !== undefined) {
            request['ClientId'] = clientOrderId;
        }
        if (expiry !== undefined) {
            request['Expired'] = expiry;
        }
        if (timeInForce === 'IOC') {
            request['ImmediateOrCancel'] = true;
        }
        const response = await this.privatePostTrade (this.extend (request, params));
        return this.parseOrder (response);
    }

    async editOrder (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#editOrder
         * @description edit a trade order. Can be used to edit stopLossPrice, takeProfitPrice of Gross account positions.
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market the order was opened in. Used for rounding price/amount values
         * @param {string|undefined} type not used by fxopen.editOrder()
         * @param {string|undefined} side not used by fxopen.editOrder()
         * @param {float|undefined} amount how much of currency you want to trade in units of base currency. Overriden by params.amountChange
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {float|undefined} params.stopPrice the price at which order should be activated, in units of the base currency
         * @param {float|undefined} params.stopLossPrice the price at which Gross account position should be closed by exchange to prevent further losses
         * @param {float|undefined} params.takeProfitPrice the price at which Gross account position should be closed by exchange to gain profit
         * @param {float|undefined} params.amountChange how much of currency you want to add/remove from trade in units of base currency. Overrides amount param
         * @param {int|undefined} params.expiry sets a timestamp in milliseconds when Stop/Limit/StopLimit order will be canceled by exchange
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const accInfo = await this.loadAccountInfo ();
        const stopPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice');
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const amountChange = this.safeValue (params, 'amountChange');
        const expiry = this.safeInteger (params, 'expiry');
        this.omit ('triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'amountChange', 'expiry');
        // id, price, amount - strings are not accepted
        const request = {
            'Id': parseInt (id),
        };
        if (amount !== undefined) {
            if (amountChange !== undefined) {
                throw new BadRequest (this.id + ' editOrder() amount and params.amountChange cannot be both specified. Prefer using params.amountChange');
            }
            request['Amount'] = this.parseNumber (this.amountToPrecision (symbol, amount));
        }
        if (price !== undefined) {
            request['Price'] = this.parseNumber (this.priceToPrecision (symbol, price));
        }
        if (stopPrice !== undefined) {
            request['StopPrice'] = this.parseNumber (this.priceToPrecision (symbol, stopPrice));
        }
        const isNotGrossAccount = (!accInfo['isGrossType']);
        if (stopLossPrice !== undefined) {
            if (isNotGrossAccount) {
                throw new NotSupported (this.id + ' editOrder() params.stopLossPrice is ignored on this account type');
            }
            request['StopLoss'] = this.parseNumber (this.priceToPrecision (symbol, stopLossPrice));
        }
        if (takeProfitPrice !== undefined) {
            if (isNotGrossAccount) {
                throw new NotSupported (this.id + ' editOrder() params.takeProfitPrice is ignored on this account type');
            }
            request['TakeProfit'] = this.parseNumber (this.priceToPrecision (symbol, takeProfitPrice));
        }
        if (amountChange !== undefined) {
            request['AmountChange'] = this.parseNumber (this.amountToPrecision (symbol, amountChange));
        }
        if (expiry !== undefined) {
            request['Expired'] = expiry;
        }
        const response = await this.privatePutTrade (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'New': 'open',
            'Calculated': 'open',
            'Filled': 'closed',
            'PartiallyFilled': 'open', // Calculated is considered open state for pending order
            'Canceled': 'canceled',
            'PendingCancel': 'canceling',
            'Rejected': 'rejected',
            'Expired': 'expired',
            'PendingReplace': 'open',
            'Executing': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "Id": 0,
        //     "ClientId": "string",
        //     "AccountId": 0,
        //     "Type": "Market",
        //     "InitialType": "Market",
        //     "Side": "Buy",
        //     "Status": "New",
        //     "Symbol": "string",
        //     "SymbolPrecision": 0,
        //     "StopPrice": 0,
        //     "Price": 0,
        //     "CurrentPrice": 0,
        //     "InitialAmount": 0,
        //     "RemainingAmount": 0,
        //     "FilledAmount": 0,
        //     "MaxVisibleAmount": 0,
        //     "StopLoss": 0,
        //     "TakeProfit": 0,
        //     "Margin": 0,
        //     "Profit": 0,
        //     "Commission": 0,
        //     "AgentCommission": 0,
        //     "Swap": 0,
        //     "ImmediateOrCancel": true,
        //     "MarketWithSlippage": true,
        //     "OneCancelsTheOther": true,
        //     "Created": 1685098893289,
        //     "Expired": 1685098893289,
        //     "Modified": 1685098893289,
        //     "Filled": 1685098893289,
        //     "PositionCreated": 1685098893289,
        //     "Comment": "string",
        //     "ClientApp": "string",
        //     "Slippage": 0,
        //     "Rebate": 0,
        //     "RelatedTradeId": 0,
        //     "ContingentOrder": true,
        //     "TriggerType": "None",
        //     "TriggerTime": 1685098893289,
        //     "OrderIdTriggeredBy": 0
        // }
        const id = this.safeString (order, 'Id');
        const clientOrderId = this.safeString (order, 'ClientId');
        const marketId = this.safeString (order, 'Symbol');
        const symbol = this.safeSymbol (marketId, market);
        const side = this.safeStringLower (order, 'Side');
        const type = this.safeStringLower (order, 'Type');
        const timestamp = this.safeInteger (order, 'Created');
        const lastTradeTimestamp = this.safeIntegerGt0 (order, 'Filled');
        const amount = this.safeString (order, 'InitialAmount');
        const remaining = this.safeString (order, 'RemainingAmount');
        const filled = this.safeString (order, 'FilledAmount');
        const iocFlag = this.safeValue (order, 'ImmediateOrCancel');
        const expiry = this.safeIntegerGt0 (order, 'Expired');
        let timeInForce = 'GTC';
        if (iocFlag === true) {
            timeInForce = 'IOC';
        } else if (expiry !== undefined) {
            timeInForce = 'GTD'; // Good till date
        }
        let price = this.omitZero (this.safeString (order, 'Price'));
        const stopPrice = this.omitZero (this.safeString (order, 'StopPrice'));
        if (type === 'stop') {
            price = stopPrice;
        }
        const stopLossPrice = this.omitZero (this.safeString (order, 'StopLoss'));
        const takeProfitPrice = this.omitZero (this.safeString (order, 'TakeProfit'));
        const rawStatus = this.safeString (order, 'Status');
        let status = this.parseOrderStatus (rawStatus);
        if ((rawStatus === 'PartiallyFilled') && (timeInForce === 'IOC')) {
            status = 'canceled';
        }
        let cost = undefined;
        if (price !== undefined) {
            cost = Precise.stringMul (price, amount);
        } else if (stopPrice !== undefined) {
            cost = Precise.stringMul (stopPrice, amount);
        }
        const fee = {};
        const accInfo = this.accountInfo ();
        const commission = this.safeString (order, 'Commission', '0');
        if (accInfo['isCashType']) {
            if (market === undefined) {
                market = this.market (symbol);
            }
            fee['currency'] = (side === 'buy') ? market['base'] : market['quote'];
            fee['cost'] = commission;
        } else {
            const swap = this.safeString (order, 'Swap', '0');
            const feeCurrency = accInfo['settle'];
            const feeCost = Precise.stringAdd (commission, swap);
            fee['currency'] = feeCurrency;
            fee['cost'] = feeCost;
        }
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'side': side,
            'type': type,
            'timeInForce': timeInForce,
            'price': this.parseNumber (price),
            'average': undefined,
            'amount': this.parseNumber (amount),
            'filled': this.parseNumber (filled),
            'remaining': this.parseNumber (remaining),
            'cost': this.parseNumber (cost),
            'trades': [],
            'fee': fee,
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'stopPrice': this.parseNumber (stopPrice),
            'triggerPrice': this.parseNumber (stopPrice),
            'stopLossPrice': this.parseNumber (stopLossPrice),
            'takeProfitPrice': this.parseNumber (takeProfitPrice),
            'info': order,
        });
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#cancelOrder
         * @description cancels an open order of types: 'limit', 'stop', 'stoplimit'. Can close Gross account position with additional params
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was opened in. Used for rounding amount value
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {string|undefined} params.mode 'close' to close Gross account position.
         * @param {float|undefined} params.closeAmount how much to close position for in units of base currency. Works only if 'byId' is undefined
         * @param {string|undefined} params.closeById id of another position with same symbol and reverse side to use for closing
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const accInfo = await this.loadAccountInfo ();
        const mode = this.safeString (params, 'mode');
        if (mode === 'close') {
            if (!accInfo['isGrossType']) {
                throw new NotSupported (this.id + ' cancelOrder() params.mode === close is not supported on this account type');
            }
            const closeAmount = this.safeValue (params, 'closeAmount');
            const closeById = this.safeString (params, 'closeById');
            if ((closeAmount !== undefined) && (closeById !== undefined)) {
                throw new BadRequest (this.id + ' cancelOrder() params.closeAmount and params.closeById cannot be both specified');
            }
            params = this.omit (params, 'mode', 'closeAmount', 'closeById');
            const type = (closeById === undefined) ? 'Close' : 'CloseBy';
            const request = {
                'trade.type': type,
                'trade.id': id, // ignore parse integer because imploded in query as string
            };
            if (closeAmount !== undefined) {
                if (closeById !== undefined) {
                    throw new BadRequest (this.id + ' cancelOrder() params.closeAmount and params.closeById cannot be both specified');
                }
                request['trade.amount'] = this.amountToPrecision (symbol, closeAmount);
            }
            if (closeById !== undefined) {
                request['trade.byId'] = closeById; // ignore parse integer because imploded in query as string
            }
            const response = await this.privateDeleteTrade (this.extend (request, params));
            return this.parseOrder (response['Trade']);
        } else {
            params = this.omit (params, 'mode', 'closeAmount', 'closeById');
            const request = {
                'trade.type': 'Cancel',
                'trade.id': id, // ignore parse integer because imploded in query as string
            };
            const response = await this.privateDeleteTrade (this.extend (request, params));
            return this.parseOrder (response['Trade']);
        }
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of open orders structures to retrieve
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const accInfo = await this.loadAccountInfo ();
        const response = await this.privateGetTrade (params);
        // response === array of objects
        if (accInfo['isGrossType']) {
            const orderTypes = [ 'Limit', 'Stop', 'StopLimit' ];
            const filtered = this.filterByArray (response, 'Type', orderTypes, false);
            return this.parseOrders (filtered, market, since, limit);
        } else {
            return this.parseOrders (response, market, since, limit);
        }
    }

    async fetchOpenOrder (id: string, params = {}) {
        /**
         * @method
         * @name fxopen#fetchOpenOrder
         * @description fetch currently open orders by it id
         * @param {string} id order to fetch
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        await this.loadAccountInfo ();
        const request = {
            'id': id, // ignore parse integer because imploded in query as string
        };
        const response = await this.privateGetTradeId (this.extend (request, params));
        const type = this.safeStringLower (response, 'Type');
        if (type === 'position') {
            throw new BadRequest (this.id + ' fetchOpenOrder() Id = ' + id + ' belongs to position');
        }
        return this.parseOrder (response);
    }

    async fetchPositions (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const accInfo = await this.loadAccountInfo ();
        if (accInfo['isCashType']) {
            throw new NotSupported (this.id + ' fetchPositions() is not supported on this account type');
        }
        if (accInfo['isNetType']) {
            const response = await this.privateGetPosition (params);
            return this.parsePositions (response, symbols);
        } else {
            const response = await this.privateGetTrade (params);
            const filtered = this.filterBy (response, 'Type', 'Position');
            return this.parsePositions (filtered, symbols);
        }
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name fxopen#fetchPosition
         * @description fetch data on an open position
         * @param {string} symbol unified market symbol or position id for Net accounts. Position Id for Gross accounts
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        await this.loadMarkets ();
        const accInfo = await this.loadAccountInfo ();
        if (accInfo['isCashType']) {
            throw new NotSupported (this.id + ' fetchPosition() is not supported on this account type');
        }
        let id = symbol;
        const idIsMarket = (symbol in this.markets);
        if (idIsMarket) {
            id = this.marketId (symbol);
        }
        const request = {
            'id': id,
        };
        if (accInfo['isNetType']) {
            const response = await this.privateGetPositionId (this.extend (request, params));
            return this.parsePosition (response);
        } else {
            if (idIsMarket) {
                throw new BadRequest (this.id + ' fetchPosition() Id = ' + id + ' is a market symbol. This account can have multiple positions for 1 symbol');
            }
            const response = await this.privateGetTradeId (this.extend (request, params));
            const type = this.safeStringLower (response, 'Type');
            if (type !== 'position') {
                throw new BadRequest (this.id + ' fetchPosition() Id = ' + id + ' belongs to order');
            }
            return this.parsePosition (response);
        }
    }

    parsePosition (position, market = undefined) {
        const accInfo = this.accountInfo ();
        if (accInfo['isGrossType']) {
            return this.parseGrossPosition (position, accInfo, market);
        } else if (accInfo['isNetType']) {
            return this.parseNetPosition (position, accInfo, market);
        } else {
            throw new NotSupported (this.id + ' parsePosition() is not supported on this account type');
        }
    }

    parseGrossPosition (position, accInfo, market = undefined) {
        // {
        //     "Id": 0,
        //     "ClientId": "string",
        //     "AccountId": 0,
        //     "Type": "Position",
        //     "InitialType": "Market",
        //     "Side": "Buy",
        //     "Status": "New",
        //     "Symbol": "string",
        //     "SymbolPrecision": 0,
        //     "StopPrice": 0,
        //     "Price": 0,
        //     "CurrentPrice": 0,
        //     "InitialAmount": 0,
        //     "RemainingAmount": 0,
        //     "FilledAmount": 0,
        //     "MaxVisibleAmount": 0,
        //     "StopLoss": 0,
        //     "TakeProfit": 0,
        //     "Margin": 0,
        //     "Profit": 0,
        //     "Commission": 0,
        //     "AgentCommission": 0,
        //     "Swap": 0,
        //     "ImmediateOrCancel": true,
        //     "MarketWithSlippage": true,
        //     "OneCancelsTheOther": true,
        //     "Created": 1685354540332,
        //     "Expired": 1685354540332,
        //     "Modified": 1685354540332,
        //     "Filled": 1685354540332,
        //     "PositionCreated": 1685354540332,
        //     "Comment": "string",
        //     "ClientApp": "string",
        //     "Slippage": 0,
        //     "Rebate": 0,
        //     "RelatedTradeId": 0,
        //     "ContingentOrder": true,
        //     "TriggerType": "None",
        //     "TriggerTime": 1685354540332,
        //     "OrderIdTriggeredBy": 0
        // }
        const id = this.safeString (position, 'Id');
        const marketId = this.safeString (position, 'Symbol');
        if (market === undefined) {
            market = this.market (marketId);
        }
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (position, 'Created');
        const orderSide = this.safeStringLower (position, 'Side');
        let side = undefined;
        if (orderSide === 'buy') {
            side = 'long';
        } else if (orderSide === 'sell') {
            side = 'short';
        }
        const contractSize = this.safeString (market, 'contractSize');
        const remaining = this.safeString (position, 'RemainingAmount');
        const contracts = Precise.stringDiv (remaining, contractSize);
        const entryPrice = this.safeString (position, 'Price');
        const leverage = this.calculateMarketLeverage (market, accInfo);
        const initialMargin = this.safeString (position, 'Margin');
        const initialMarginPercentage = Precise.stringDiv ('1', leverage);
        const notional = Precise.stringMul (initialMargin, leverage);
        const stopOutCoeff = accInfo['stopOutCoeffStr'];
        const maintenanceMargin = Precise.stringMul (initialMargin, stopOutCoeff);
        const maintenanceMarginPercentage = Precise.stringMul (initialMarginPercentage, stopOutCoeff);
        const unrealizedPnl = this.safeString (position, 'Profit');
        const percentage = Precise.stringMul ('100', Precise.stringDiv (unrealizedPnl, initialMargin));
        let markPrice = this.safeString (position, 'CurrentPrice');
        if (markPrice === undefined) {
            // For some reason CurrentPrice is unavailable at the moment
            // Due to rounding this is very rough estimate and doesn't represent precise markPrice
            const commission = this.safeString (position, 'Commission');
            const swap = this.safeString (position, 'Swap');
            const grossPnl = Precise.stringSub (unrealizedPnl, Precise.stringAdd (commission, swap));
            if (side === 'short') {
                // initialMargin = markPrice * remaining * settlementCurrencyConversionRate / leverage
                // grossPnl = (entryPrice - markPrice) * remaining * settlementCurrencyConversionRate
                // => markPrice = entryPrice * (initialMargin * leverage) / (initialMargin * leverage + grossPnl)
                const upper = Precise.stringMul (initialMargin, leverage);
                const lower = Precise.stringAdd (upper, grossPnl);
                markPrice = Precise.stringMul (entryPrice, Precise.stringDiv (upper, lower));
            } else if (side === 'long') {
                // initialMargin = markPrice * remaining * settlementCurrencyConversionRate / leverage
                // grossPnl = (markPrice - entryPrice) * remaining * settlementCurrencyConversionRate
                // => markPrice = entryPrice * (initialMargin * leverage) / (initialMargin * leverage - grossPnl)
                const upper = Precise.stringMul (initialMargin, leverage);
                const lower = Precise.stringSub (upper, grossPnl);
                markPrice = Precise.stringMul (entryPrice, Precise.stringDiv (upper, lower));
            }
        }
        const accBalance = accInfo['cachedBalanceStr'];
        let collateral = undefined;
        if (side === 'long') {
            // collateral = entryPrice * remaining * settlementCurrencyConversionRate
            // notional = markPrice * remaining * settlementCurrencyConversionRate
            // => collateral = notional * (entryPrice / markPrice)
            collateral = Precise.stringMul (notional, Precise.stringDiv (entryPrice, markPrice));
            const commission = this.safeString (position, 'Commission');
            const swap = this.safeString (position, 'Swap');
            const feeAmount = Precise.stringNeg (Precise.stringAdd (commission, swap));
            collateral = Precise.stringAdd (collateral, feeAmount);
            if (Precise.stringGt (collateral, accBalance)) {
                collateral = accBalance;
            }
        } else if (side === 'short') {
            collateral = accBalance;
        }
        return this.safePosition ({
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'side': side,
            'contracts': this.parseNumber (contracts),
            'contractSize': this.parseNumber (contractSize),
            'entryPrice': this.parseNumber (entryPrice),
            'markPrice': this.parseNumber (markPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'collateral': this.parseNumber (collateral),
            'initialMargin': this.parseNumber (initialMargin),
            'maintenanceMargin': this.parseNumber (maintenanceMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentage),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'percentage': this.parseNumber (percentage),
            'info': position,
            // defined by account type
            'hedged': false,
            'isolated': false,
            'marginMode': 'cross',
        });
    }

    parseNetPosition (position, accInfo, market = undefined) {
        // {
        //     "Id": 0,
        //     "Symbol": "string",
        //     "LongAmount": 0,
        //     "LongPrice": 0,
        //     "ShortAmount": 0,
        //     "ShortPrice": 0,
        //     "Commission": 0,
        //     "AgentCommission": 0,
        //     "Swap": 0,
        //     "Modified": 1685354540306,
        //     "Margin": 0,
        //     "Profit": 0,
        //     "CurrentBestAsk": 0,
        //     "CurrentBestBid": 0,
        //     "TransferringCoefficient": 0,
        // }
        const id = this.safeString (position, 'Id');
        const marketId = this.safeString (position, 'Symbol');
        if (market === undefined) {
            market = this.market (marketId);
        }
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (position, 'Modified');
        const longAmount = this.safeString (position, 'LongAmount');
        const shortAmount = this.safeString (position, 'ShortAmount');
        let side = undefined;
        let amount = undefined;
        let entryPrice = undefined;
        let markPrice = undefined;
        if (Precise.stringGt (longAmount, '0')) {
            side = 'long';
            amount = longAmount;
            entryPrice = this.safeString (position, 'LongPrice');
            markPrice = this.safeString (position, 'CurrentBestBid');
        } else if (Precise.stringGt (shortAmount, '0')) {
            side = 'short';
            amount = shortAmount;
            entryPrice = this.safeString (position, 'ShortPrice');
            markPrice = this.safeString (position, 'CurrentBestAsk');
        }
        const contractSize = this.safeString (market, 'contractSize');
        const contracts = Precise.stringDiv (amount, contractSize);
        const leverage = this.calculateMarketLeverage (market, accInfo);
        const initialMargin = this.safeString (position, 'Margin');
        const initialMarginPercentage = Precise.stringDiv ('1', leverage);
        const notional = Precise.stringMul (initialMargin, leverage);
        const stopOutCoeff = accInfo['stopOutCoeffStr'];
        const maintenanceMargin = Precise.stringMul (initialMargin, stopOutCoeff);
        const maintenanceMarginPercentage = Precise.stringMul (initialMarginPercentage, stopOutCoeff);
        const unrealizedPnl = this.safeString (position, 'Profit');
        const percentage = Precise.stringMul ('100', Precise.stringDiv (unrealizedPnl, initialMargin));
        const accBalance = accInfo['cachedBalanceStr'];
        let collateral = undefined;
        if (side === 'long') {
            // collateral = entryPrice * remaining * settlementCurrencyConversionRate
            // notional = markPrice * remaining * settlementCurrencyConversionRate
            // => collateral = notional * (entryPrice / markPrice)
            collateral = Precise.stringMul (notional, Precise.stringDiv (entryPrice, markPrice));
            const commission = this.safeString (position, 'Commission');
            const swap = this.safeString (position, 'Swap');
            const feeAmount = Precise.stringNeg (Precise.stringAdd (commission, swap));
            collateral = Precise.stringAdd (collateral, feeAmount);
            if (Precise.stringGt (collateral, accBalance)) {
                collateral = accBalance;
            }
        } else if (side === 'short') {
            collateral = accBalance;
        }
        return this.safePosition ({
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'side': side,
            'contracts': this.parseNumber (contracts),
            'contractSize': this.parseNumber (contractSize),
            'entryPrice': this.parseNumber (entryPrice),
            'markPrice': this.parseNumber (markPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'collateral': this.parseNumber (collateral),
            'initialMargin': this.parseNumber (initialMargin),
            'maintenanceMargin': this.parseNumber (maintenanceMargin),
            'initialMarginPercentage': this.parseNumber (initialMarginPercentage),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceMarginPercentage),
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'percentage': this.parseNumber (percentage),
            'info': position,
            // defined by account type
            'hedged': true,
            'isolated': false,
            'marginMode': 'cross',
        });
    }

    async fetchOrderTrades (id: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades to retrieve
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {int|undefined} params.direction 1 to seach forward search, -1 - backwards. Defaults to 1, if since is not specified then -1
         * @param {int|undefined} params.until the latest time in ms to fetch records for
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const request = {
            'orderId': id, // ignore parse integer because handled in fetchMyTrades
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {int|undefined} params.direction 1 to seach forward search, -1 - backwards. Defaults to 1, if since is not specified then -1
         * @param {string|undefined} params.orderId orderId to filter request
         * @param {int|undefined} params.until the latest time in ms to fetch records for
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const accInfo = await this.loadAccountInfo ();
        if (accInfo['isGrossType']) {
            // Gross account positions are tricky to implement.
            // Basically they consist of 2 trades: 1 when position opened, 2 opposite when position closed
            // Though there are edge cases with closeById
            throw new NotSupported (this.id + ' fetchMyTrades() is not supported on this account type');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const defaultLimit = 100; // reasonable amount to view in CLI tool
        const maxLimit = 1000; // max not specified, will stick to a 1000 since other requests have it
        limit = (limit === undefined) ? defaultLimit : Math.min (limit, maxLimit);
        const direction = this.getDirectionFromParams (params, since);
        const directionStr = (direction === 1) ? 'Forward' : 'Backward';
        const orderId = this.safeInteger (params, 'orderId'); // exchange doesn't accept strings
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'direction', 'orderId', 'until');
        const request = {
            'RequestDirection': directionStr,
            'RequestPageSize': limit,
            'SkipCancelOrder': true, // skip canceled/expired orders
        };
        if (since !== undefined) {
            request['TimestampFrom'] = since;
        }
        if (until !== undefined) {
            request['TimestampTo'] = until;
        }
        if (orderId !== undefined) {
            request['OrderId'] = orderId;
        }
        const response = await this.privatePostTradehistory (this.extend (request, params));
        // {
        //     "IsLastReport": true,
        //     "TotalReports": 0,
        //     "Records": [ ... array of objects ... ],
        //     "LastId": "string"
        // }
        const requiredTypes = [ 'OrderFilled', 'PositionClosed' ];
        const filtered = this.filterByArray (response['Records'], 'TransactionType', requiredTypes, false);
        const sinceOverride = (direction === -1) ? undefined : since; // disable since filter when going backwards
        return this.parseTrades (filtered, market, sinceOverride, limit);
    }

    parsePrivateTrade (trade, market = undefined) {
        // {
        //     "Id": "string",
        //     "TransactionType": "OrderOpened",
        //     "TransactionReason": "ClientRequest",
        //     "TransactionTimestamp": 1685441032792,
        //     "Symbol": "string",
        //     "SymbolPrecision": 0,
        //     "TradeId": 0,
        //     "ClientTradeId": "string",
        //     "TradeSide": "Buy",
        //     "TradeType": "Market",
        //     "TradeCreated": 1685441032792,
        //     "TradeModified": 1685441032792,
        //     "TradeAmount": 0,
        //     "TradeMaxVisibleAmount": 0,
        //     "TradeInitialAmount": 0,
        //     "TradeLastFillAmount": 0,
        //     "TradePrice": 0,
        //     "TradeFillPrice": 0,
        //     "RequestTimestamp": 1685441032792,
        //     "RequestOpenPrice": 0,
        //     "RequestOpenAmount": 0,
        //     "RequestClosePrice": 0,
        //     "RequestCloseAmount": 0,
        //     "PositionId": 0,
        //     "PositionById": 0,
        //     "PositionAmount": 0,
        //     "PositionInitialAmount": 0,
        //     "PositionLastAmount": 0,
        //     "PositionOpenPrice": 0,
        //     "PositionOpened": 1685441032792,
        //     "PositionClosePrice": 0,
        //     "PositionClosed": 1685441032792,
        //     "Balance": 0,
        //     "BalanceMovement": 0,
        //     "BalanceCurrency": "string",
        //     "StopLoss": 0,
        //     "TakeProfit": 0,
        //     "Commission": 0,
        //     "CommissionCurrency": "string",
        //     "AgentCommission": 0,
        //     "ReducedOpenCommissionFlag": true,
        //     "ReducedCloseCommissionFlag": true,
        //     "MinCommissionCurrency": "string",
        //     "MinCommissionConversionRate": 0,
        //     "Swap": 0,
        //     "Rebate": 0,
        //     "RebateCurrency": "string",
        //     "ImmediateOrCancel": true,
        //     "MarketWithSlippage": true,
        //     "OneCancelsTheOther": true,
        //     "Expired": 1685441032792,
        //     "PosModified": 1685441032792,
        //     "Comment": "string",
        //     "MarginRateInitial": 0,
        //     "OpenConversionRate": 0,
        //     "CloseConversionRate": 0,
        //     "MarginCurrency": "string",
        //     "ProfitCurrency": "string",
        //     "SrcAssetCurrency": "string",
        //     "SrcAssetAmount": 0,
        //     "SrcAssetMovement": 0,
        //     "DstAssetCurrency": "string",
        //     "DstAssetAmount": 0,
        //     "DstAssetMovement": 0,
        //     "ClientApp": "string",
        //     "Slippage": 0,
        //     "ProfitToReportConversionRate": 0,
        //     "ReportToProfitConversionRate": 0,
        //     "BalanceToReportConversionRate": 0,
        //     "ReportToBalanceConversionRate": 0,
        //     "SrcAssetToReportConversionRate": 0,
        //     "ReportToSrcAssetConversionRate": 0,
        //     "DstAssetToReportConversionRate": 0,
        //     "ReportToDstAssetConversionRate": 0,
        //     "MarginCurrencyToReportConversionRate": 0,
        //     "ReportToMarginCurrencyConversionRate": 0,
        //     "ProfitCurrencyToReportConversionRate": 0,
        //     "ReportToProfitCurrencyConversionRate": 0,
        //     "ReportCurrency": "string",
        //     "TokenCommissionCurrency": "string",
        //     "TokenCommissionCurrencyDiscount": 0,
        //     "TokenCommissionConversionRate": 0,
        //     "SplitRatio": 0,
        //     "DividendGrossRate": 0,
        //     "DividendToBalanceConversionRate": 0,
        //     "Taxes": 0,
        //     "TaxValue": 0,
        //     "RelatedTradeId": 0
        // }
        const id = this.safeString (trade, 'Id');
        const orderId = this.safeString (trade, 'TradeId');
        const marketId = this.safeString (trade, 'Symbol');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (trade, 'TransactionTimestamp');
        const side = this.safeStringLower (trade, 'TradeSide');
        const type = this.safeStringLower (trade, 'TradeType');
        const price = this.safeString2 (trade, 'TradeFillPrice', 'PositionClosePrice');
        const amount = this.safeString2 (trade, 'TradeLastFillAmount', 'PositionLastAmount');
        // Markets have contractSize, but Volume here is already multiplied by that value
        // Need to override this.safeTrade() cost calculation
        const cost = Precise.stringMul (price, amount);
        const fee = {};
        const accInfo = this.accountInfo ();
        const commission = Precise.stringAbs (this.safeString (trade, 'Commission'));
        if (accInfo['isCashType']) {
            const feeCurrencyId = this.safeString (trade, 'CommissionCurrency');
            fee['currency'] = this.safeCurrencyCode (feeCurrencyId);
            fee['cost'] = commission;
        } else {
            const swap = this.safeString (trade, 'Swap');
            const feeCurrency = accInfo['settle'];
            const feeCost = Precise.stringAdd (commission, swap);
            fee['currency'] = feeCurrency;
            fee['cost'] = feeCost;
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.parseNumber (price),
            'amount': this.parseNumber (amount),
            'cost': this.parseNumber (cost),
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name fxopen#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const accInfo = await this.loadAccountInfo ();
        if (accInfo['isGrossType']) {
            // Gross account positions are tricky to implement.
            // Basically they consist of 2 trades: 1 when position opened, 2 opposite when position closed
            // Though there are edge cases with closeById
            throw new NotSupported (this.id + ' fetchOrder() is not supported on this account type');
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let openOrder = undefined;
        try {
            openOrder = await this.fetchOpenOrder (id);
        } catch (e) {
            openOrder = undefined; // bypass linter check
        }
        if (openOrder !== undefined) {
            const orderTrades = await this.fetchOrderTrades (id, symbol);
            openOrder['trades'] = orderTrades;
        } else {
            const since = undefined;
            const limit = 1000;
            const request = {
                'RequestDirection': 'Backward',
                'RequestPageSize': limit,
                'OrderId': parseInt (id),
                'SkipCancelOrder': false, // also get canceled and expired orders
            };
            const historyResponse = await this.privatePostTradehistory (this.extend (request, params));
            const records = this.sortBy (historyResponse['Records'], 'TransactionTimestamp', true);
            openOrder = this.parseOrderFromTradeRecord (records[0]);
            const requiredTypes = [ 'OrderFilled', 'PositionClosed' ];
            const trades = this.filterByArray (records, 'TransactionType', requiredTypes, false);
            openOrder['trades'] = this.parseTrades (trades, market, since, limit);
        }
        return openOrder;
    }

    parseOrderWithTrades (order, trades, market = undefined) {
        if (order === undefined) {
            // if order is closed we should reconstruct it from last trade history
            const cnt = trades.length;
            order = this.parseOrderFromTradeRecord (trades[cnt - 1]['info']);
        }
        order['trades'] = trades;
        return order;
    }

    parseOrderStatusFromTradeRecord (status) {
        const statuses = {
            'OrderCanceled': 'canceled',
            'OrderExpired': 'expired',
            'OrderFilled': 'closed',
            'PositionClosed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderFromTradeRecord (trade) {
        // {
        //     "Id": "string",
        //     "TransactionType": "OrderOpened",
        //     "TransactionReason": "ClientRequest",
        //     "TransactionTimestamp": 1685441032792,
        //     "Symbol": "string",
        //     "SymbolPrecision": 0,
        //     "TradeId": 0,
        //     "ClientTradeId": "string",
        //     "TradeSide": "Buy",
        //     "TradeType": "Market",
        //     "TradeCreated": 1685441032792,
        //     "TradeModified": 1685441032792,
        //     "TradeAmount": 0,
        //     "TradeMaxVisibleAmount": 0,
        //     "TradeInitialAmount": 0,
        //     "TradeLastFillAmount": 0,
        //     "TradePrice": 0,
        //     "TradeFillPrice": 0,
        //     "RequestTimestamp": 1685441032792,
        //     "RequestOpenPrice": 0,
        //     "RequestOpenAmount": 0,
        //     "RequestClosePrice": 0,
        //     "RequestCloseAmount": 0,
        //     "PositionId": 0,
        //     "PositionById": 0,
        //     "PositionAmount": 0,
        //     "PositionInitialAmount": 0,
        //     "PositionLastAmount": 0,
        //     "PositionOpenPrice": 0,
        //     "PositionOpened": 1685441032792,
        //     "PositionClosePrice": 0,
        //     "PositionClosed": 1685441032792,
        //     "Balance": 0,
        //     "BalanceMovement": 0,
        //     "BalanceCurrency": "string",
        //     "StopLoss": 0,
        //     "TakeProfit": 0,
        //     "Commission": 0,
        //     "CommissionCurrency": "string",
        //     "AgentCommission": 0,
        //     "ReducedOpenCommissionFlag": true,
        //     "ReducedCloseCommissionFlag": true,
        //     "MinCommissionCurrency": "string",
        //     "MinCommissionConversionRate": 0,
        //     "Swap": 0,
        //     "Rebate": 0,
        //     "RebateCurrency": "string",
        //     "ImmediateOrCancel": true,
        //     "MarketWithSlippage": true,
        //     "OneCancelsTheOther": true,
        //     "Expired": 1685441032792,
        //     "PosModified": 1685441032792,
        //     "Comment": "string",
        //     "MarginRateInitial": 0,
        //     "OpenConversionRate": 0,
        //     "CloseConversionRate": 0,
        //     "MarginCurrency": "string",
        //     "ProfitCurrency": "string",
        //     "SrcAssetCurrency": "string",
        //     "SrcAssetAmount": 0,
        //     "SrcAssetMovement": 0,
        //     "DstAssetCurrency": "string",
        //     "DstAssetAmount": 0,
        //     "DstAssetMovement": 0,
        //     "ClientApp": "string",
        //     "Slippage": 0,
        //     "ProfitToReportConversionRate": 0,
        //     "ReportToProfitConversionRate": 0,
        //     "BalanceToReportConversionRate": 0,
        //     "ReportToBalanceConversionRate": 0,
        //     "SrcAssetToReportConversionRate": 0,
        //     "ReportToSrcAssetConversionRate": 0,
        //     "DstAssetToReportConversionRate": 0,
        //     "ReportToDstAssetConversionRate": 0,
        //     "MarginCurrencyToReportConversionRate": 0,
        //     "ReportToMarginCurrencyConversionRate": 0,
        //     "ProfitCurrencyToReportConversionRate": 0,
        //     "ReportToProfitCurrencyConversionRate": 0,
        //     "ReportCurrency": "string",
        //     "TokenCommissionCurrency": "string",
        //     "TokenCommissionCurrencyDiscount": 0,
        //     "TokenCommissionConversionRate": 0,
        //     "SplitRatio": 0,
        //     "DividendGrossRate": 0,
        //     "DividendToBalanceConversionRate": 0,
        //     "Taxes": 0,
        //     "TaxValue": 0,
        //     "RelatedTradeId": 0
        // }
        const id = this.safeString (trade, 'TradeId');
        const clientOrderId = this.safeString (trade, 'ClientTradeId');
        const marketId = this.safeString (trade, 'Symbol');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (trade, 'TradeCreated');
        const lastTradeTimestamp = this.safeInteger (trade, 'TransactionTimestamp');
        const side = this.safeStringLower (trade, 'TradeSide');
        const type = this.safeStringLower (trade, 'TradeType');
        const price = this.safeString (trade, 'TradePrice');
        const amount = this.safeString (trade, 'TradeInitialAmount');
        const remaining = this.safeString (trade, 'TradeAmount');
        const filled = Precise.stringSub (amount, remaining);
        const iocFlag = this.safeString (trade, 'ImmediateOrCancel');
        const expiry = this.safeIntegerGt0 (trade, 'Expired');
        let timeInForce = 'GTC';
        if (iocFlag === 'true') {
            timeInForce = 'IOC';
        } else if (expiry !== undefined) {
            timeInForce = 'GTD'; // Good till date
        }
        const stopLossPrice = this.omitZero (this.safeString (trade, 'StopLoss'));
        const takeProfitPrice = this.omitZero (this.safeString (trade, 'TakeProfit'));
        const cost = Precise.stringMul (price, amount);
        const fee = {};
        const accInfo = this.accountInfo ();
        const commission = this.safeString (trade, 'Commission');
        if (accInfo['isCashType']) {
            const feeCurrencyId = this.safeString (trade, 'CommissionCurrency');
            fee['currency'] = this.safeCurrencyCode (feeCurrencyId);
            fee['cost'] = commission;
        } else {
            const swap = this.safeString (trade, 'Swap');
            const feeCurrency = accInfo['settle'];
            const feeCost = Precise.stringAdd (commission, swap);
            fee['currency'] = feeCurrency;
            fee['cost'] = feeCost;
        }
        const status = this.parseOrderStatusFromTradeRecord (this.safeString (trade, 'TransactionType'));
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': this.parseNumber (price),
            'average': undefined,
            'amount': this.parseNumber (amount),
            'remaining': this.parseNumber (remaining),
            'filled': this.parseNumber (filled),
            'cost': this.parseNumber (cost),
            'fee': fee,
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'stopLossPrice': this.parseNumber (stopLossPrice),
            'takeProfitPrice': this.parseNumber (takeProfitPrice),
            'info': trade,
        });
    }

    async fetchLeverage (symbol: string, params = {}) {
        /**
         * @method
         * @name fxopen#fetchLeverage
         * @description fetch the set leverage for a market
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the okx api endpoint
         * @returns {float} leverage value
         */
        await this.loadMarkets ();
        const accInfo = await this.loadAccountInfo ();
        const market = this.market (symbol);
        return this.parseNumber (this.calculateMarketLeverage (market, accInfo));
    }

    isSpecialMarketId (marketId: string) {
        // Exchange convention: symbols ending with '_L' are special
        // They are used to store public trades
        if (marketId === undefined) {
            return false;
        }
        const suffix = '_L';
        // return marketId.endsWith(suffix);
        // Transpile issue: Python and PHP not supported function
        const index = marketId.indexOf (suffix);
        // Parentheses required for correct PHP transpilation
        const expectedIndex = (marketId.length - suffix.length);
        return index === expectedIndex;
    }

    getDirectionFromParams (params, since: Int = undefined) {
        const directionParam = this.safeInteger (params, 'direction');
        let direction = (directionParam === -1) ? -1 : 1;
        if ((since === undefined) && (directionParam === undefined)) {
            direction = -1;
        }
        return direction;
    }

    safeIntegerGt0 (obj, key: string, defaultVal = undefined) {
        let res = this.safeInteger (obj, key);
        if (res === undefined) {
            res = defaultVal;
        } else if (res <= 0) {
            res = defaultVal;
        }
        return res;
    }

    calculateMarketLeverage (market, accInfo) {
        // 'Forex', 'CFD'
        // Forex:
        // Margin = marginVolume * MarginFactor / Account.Leverage
        // Leverage of any order/position = Account.Leverage / MarginFactor
        // CFD: Account.Leverage replaced with '1'
        let leverage = this.safeString (market, 'leverageCoeff');
        if (!accInfo['isCashType']) {
            const leverageMode = this.safeString (market, 'leverageMode', '1');
            if (leverageMode === 'Forex') {
                const accLeverage = accInfo['leverageStr'];
                leverage = Precise.stringMul (leverage, accLeverage);
            }
        }
        return leverage;
    }
}
