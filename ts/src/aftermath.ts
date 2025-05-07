import Exchange from './abstract/aftermath.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Account, Balances, Currencies, Currency, Market, Dict, Int, Strings, OHLCV, Order, OrderBook, OrderRequest, Str, Ticker, Trade, TradingFeeInterface, MarginModification, TransferEntry, Position, Transaction } from './base/types.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';
import { NotSupported } from './base/errors.js';

export default class aftermath extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'aftermath',
            'name': 'AftermathFinance',
            'countries': [ ],
            'version': 'v1',
            'rateLimit': 50, // 1200 requests per minute, 20 request per second
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'editOrder': 'emulated',
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': 'emulated',
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'api': {
                    'rest': 'https://aftermath.finance/iperps-api/ccxt'
                },
                'test': {
                    'rest': 'https://testnet.aftermath.finance/iperps-api/ccxt'
                },
            },
            'api': {
                'public': {
                    'get': {
                        'markets': 1,
                        'currencies': 1,
                    },
                    'post': {
                        'ticker': 1,
                        'orderbook': 1,
                        'trades': 1,
                        'OHLCV': 1,
                    },
                },
                'private': {
                    'post': {
                        'accounts': 1,
                        'balance': 1,
                        'myPendingOrders': 1,
                        'positions': 1,
                        'build/allocate': 1,
                        'build/cancelOrders': 1,
                        'build/createAccount': 1,
                        'build/createOrders': 1,
                        'build/createSubaccount': 1,
                        'build/deallocate': 1,
                        'build/deposit': 1,
                        'build/withdraw': 1,
                        'submit/allocate': 1,
                        'submit/cancelOrders': 1,
                        'submit/createAccount': 1,
                        'submit/createOrders': 1,
                        'submit/createSubaccount': 1,
                        'submit/deallocate': 1,
                        'submit/deposit': 1,
                        'submit/withdraw': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'swap',
                'sandboxMode': false,
            },
            'exceptions': {
                'exact': {},
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name aftermath#fetchCurrencies
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/currencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetCurrencies (params);
        const currencies = this.parseCurrencies (response);
        //
        // {
        //     "BTC": {
        //         "id": "BTC",
        //         "code": "BTC",
        //         "precision": 1e-9,
        //         "name": "BTC",
        //         "active": true,
        //         "deposit": false,
        //         "withdraw": false,
        //         "limits": {
        //             "amount": {},
        //             "withdraw": {}
        //         },
        //         "networks": {}
        //     }
        // }
        //
        return currencies;
    }

    parseCurrency (rawCurrency: Dict): Currency {
        return this.safeCurrencyStructure ({
            'id': this.safeString (rawCurrency, 'id'),
            'code': this.safeString (rawCurrency, 'code'),
            'name': this.safeString (rawCurrency, 'name'),
            'active': this.safeBool (rawCurrency, 'active'),
            'deposit': this.safeBool (rawCurrency, 'deposit'),
            'withdraw': this.safeBool (rawCurrency, 'withdraw'),
            'precision': this.safeNumber (rawCurrency, 'precision'),
            'info': rawCurrency,
        });
    }

    /**
     * @method
     * @name aftermath#fetchMarkets
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/markets
     * @description retrieves data on all markets for woo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarkets (params);
        //
        // [
        //     {
        //         "id": "0x49bd40cc7880bd358465116157f0271c25d23361b94eace9a25dc2019b449bfc",
        //         "symbol": "BTC/USD:USDC",
        //         "base": "BTC",
        //         "quote": "USD",
        //         "baseId": "BTC",
        //         "quoteId": "USD",
        //         "active": true,
        //         "type": "swap",
        //         "spot": false,
        //         "margin": false,
        //         "swap": true,
        //         "future": false,
        //         "option": false,
        //         "contract": true,
        //         "settle": "USDC",
        //         "settleId": "0x457049371f5b5dc2bda857bb804ca6e93c5a3cae1636d0cd17bb6b6070d19458::usdc::USDC",
        //         "contractSize": 0.00001,
        //         "linear": true,
        //         "inverse": false,
        //         "taker": 0.001,
        //         "maker": 0.0,
        //         "percentage": true,
        //         "tierBased": false,
        //         "precision": {
        //             "amount": 0.00001,
        //             "price": 0.0001
        //         },
        //         "limits": {
        //             "cost": {
        //                 "min": 1.0
        //             },
        //             "leverage": {
        //                 "max": 50.0
        //             }
        //         },
        //         "marginModes": {
        //             "isolated": true,
        //             "cross": false
        //         },
        //         "subType": "linear"
        //     }
        // ]
        //
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        const precision = this.safeDict (market, 'precision');
        const limits = this.safeDict (market, 'limits');
        return this.safeMarketStructure ({
            'id': this.safeString (market, 'id'),
            'symbol': this.safeString (market, 'symbol'),
            'base': this.safeString (market, 'base'),
            'quote': this.safeString (market, 'quote'),
            'settle': this.safeString (market, 'settle'),
            'baseId': this.safeString (market, 'baseId'),
            'quoteId': this.safeString (market, 'quoteId'),
            'settleId': this.safeString (market, 'settleId'),
            'type': this.safeString (market, 'type'),
            'subType': this.safeString (market, 'subType'),
            'spot': this.safeBool (market, 'spot'),
            'margin': this.safeBool (market, 'margin'),
            'swap': this.safeBool (market, 'swap'),
            'future': this.safeBool (market, 'future'),
            'option': this.safeBool (market, 'option'),
            'active': this.safeBool (market, 'active'),
            'contract': this.safeBool (market, 'contract'),
            'linear': this.safeBool (market, 'linear'),
            'inverse': this.safeBool (market, 'inverse'),
            'tierBased': this.safeBool (market, 'tierBased'),
            'percentage': this.safeBool (market, 'percentage'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': this.safeNumber (market, 'taker'),
            'maker': this.safeNumber (market, 'maker'),
            'precision': {
                'amount': this.safeNumber (precision, 'amount'),
                'price': this.safeNumber (precision, 'price'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeNumber (limits['leverage'], 'max'),
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
                    'min': this.safeNumber (limits['cost'], 'min'),
                    'max': undefined,
                },
            },
            'marginModes': this.safeDict (market, 'marginModes'),
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name aftermath#fetchTradingFee
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/markets
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        return this.parseTradingFee (market);
    }

    parseTradingFee (market: Market = undefined): TradingFeeInterface {
        const symbol = this.safeString (market, 'symbol');
        return {
            'info': market,
            'symbol': symbol,
            'maker': this.safeNumber (market, 'maker'),
            'taker': this.safeNumber (market, 'taker'),
            'percentage': true,
            'tierBased': undefined,
        };
    }

    /**
     * @method
     * @name aftermath#fetchTicker
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/ticker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'chId': market['id'],
        };
        const response = await this.publicPostTicker (this.extend (request, params));
        //
        // {
        //     "ask": 0.1,
        //     "askVolume": 0.1,
        //     "average": 0.1,
        //     "baseVolume": 0.1,
        //     "bid": 0.1,
        //     "bidVolume": 0.1,
        //     "change": 0.1,
        //     "close": 0.1,
        //     "high": 0.1,
        //     "indexPrice": 0.1,
        //     "last": 0.1,
        //     "low": 0.1,
        //     "markPrice": 0.1,
        //     "open": 0.1,
        //     "percentage": 0.1,
        //     "previousClose": 0.1,
        //     "quoteVolume": 0.1,
        //     "symbol": "string",
        //     "timestamp": null,
        //     "vwap": 0.1
        // }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        return this.safeTicker ({
            'symbol': this.safeString (ticker, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': this.safeString (ticker, 'bidVolume'),
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': this.safeString (ticker, 'askVolume'),
            'vwap': this.safeString (ticker, 'vwap'),
            'open': this.safeString (ticker, 'open'),
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'markPrice': undefined,
            'indexPrice': this.safeString (ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name aftermath#fetchOrderBook
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/orderbook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chId = this.safeString (market, 'id');
        const request = {
            'chId': chId,
        };
        const response = await this.publicPostOrderbook (this.extend (request, params));
        //
        // {
        //     "asks":[
        //         [76228.1534,11.58777]
        //     ],
        //     "bids":[
        //         [76213.4842,11.96145],
        //     ],
        //     "datetime":"2025-04-07 09:29:28.213 UTC",
        //     "timestamp":1744018168213,
        //     "symbol":"BTC/USD:USDC"
        // }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, symbol, timestamp);
        orderbook['nonce'] = this.safeInteger (response, 'nonce');
        return orderbook;
    }

    /**
     * @method
     * @name aftermath#fetchTrades
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/trades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chId = this.safeString (market, 'id');
        const request = {
            'chId': chId,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicPostTrades (this.extend (request, params));
        //
        // [
        //     {
        //         "amount": 0.03364,
        //         "datetime": "2025-04-06 13:46:34.060 UTC",
        //         "price": 82341.0271,
        //         "timestamp": 1743947194060,
        //         "symbol": "BTC/USD:USDC"
        //     }
        // ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        return this.safeTrade (trade);
    }

    /**
     * @method
     * @name aftermath#fetchOHLCV
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/ohlcv
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const chId = this.safeString (market, 'id');
        const request = {
            'chId': chId,
            'timeframe': timeframe,
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicPostOHLCV (this.extend (request, params));
        //
        // [
        //     [
        //         1743932340000,
        //         83093.5445,
        //         83093.5445,
        //         83093.5445,
        //         83093.5445,
        //         0.0
        //     ]
        // ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name aftermath#fetchBalance
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/balance
     * @description query for balance and get the amount of funds available for trading or funds locked in positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.account] account object ID, required
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        const account = this.safeString (params, 'account');
        const request = {
            'account': account,
        };
        params = this.omit (params, 'account');
        const response = await this.privatePostBalance (this.extend (request, params));
        //
        // {
        //     "timestamp": 1744045700352,
        //     "balances": {
        //         "USDC": {
        //             "free": 7.726913939320065,
        //             "used": 22.273086060679937,
        //             "total": 30.0
        //         }
        //     }
        // }
        //
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        const balances = this.safeDict (response, 'balances', []);
        const currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            const code = currencies[i];
            const balance = balances[code];
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            account['used'] = this.safeString (balance, 'used');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        const timestamp = this.safeInteger (response, 'timestamp');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name aftermath#fetchAccounts
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/accounts
     * @description query for accounts owned by the walletAddress. An Account is needed for all trading methods.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Array} a list of [account structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#accounts}
     */
    async fetchAccounts (params = {}): Promise<Account[]> {
        await this.loadMarkets ();
        const request = {
            'address': this.walletAddress,
        };
        const response = await this.privatePostAccounts (this.extend (request, params));
        //
        // [
        //     {
        //         "id": "0x21c5e3d2f5bcfd4351a62cd70874878b7923b56d79d04225ed96370a7ac844c4",
        //         "type": "primary",
        //         "code": "USDC",
        //         "accountNumber": 14822
        //     }
        // ]
        //
        return this.parseAccounts (response);
    }

    parseAccount (account: Dict): Account {
        return {
            'id': this.safeString (account, 'id'),
            'type': this.safeString (account, 'type'),
            'code': this.safeString (account, 'code'),
            'info': account,
        };
    }

    /**
     * @method
     * @name aftermath#fetchOpenOrders
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/my_pending_orders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.accountNumber] account number to query orders for, required
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const accountNumber = this.safeNumber (params, 'accountNumber');
        const request = {
            'chId': this.safeString (market, 'id'),
            'accountNumber': accountNumber,
        };
        params = this.omit (params, 'accountNumber');
        const response = await this.privatePostMyPendingOrders (this.extend (request, params));
        //
        // [
        //     {
        //         "id": "340282366919093789037556908196463492660",
        //         "datetime": "2025-04-07 14:10:49.472 UTC",
        //         "timestamp": 1744035049472,
        //         "status": "open",
        //         "symbol": "BTC/USD:USDC",
        //         "type": "limit",
        //         "side": "buy",
        //         "price": 10000.0,
        //         "amount": 0.0001,
        //         "filled": 0.0,
        //         "remaining": 0.0001,
        //         "cost": 0.0,
        //         "trades": [],
        //         "fee": {}
        //     }
        // ]
        //
        return this.parseOrders (response);
    }

    /**
     * @method
     * @name aftermath#fetchPositions
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Read/iperps_api%3A%3Accxt%3A%3Afetch%3A%3Apositions
     * @description fetch all open positions
     * @param {string[]} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.accountNumber] account number to query positions for, required
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}) {
        await this.loadMarkets ();
        const accountNumber = this.safeNumber (params, 'accountNumber');
        const request = {
            'accountNumber': accountNumber,
        };
        params = this.omit (params, 'accountNumber');
        const response = await this.privatePostPositions (this.extend (request, params));
        //
        // [
        //     {
        //         "id": "0xb60c5078b060e4aede8e670089c9b1bc6eb231b4bcc0bfb3e97534770ace4d0c:101",
        //         "symbol": "BTC/USD",
        //         "timestamp": 1744360128358,
        //         "datetime": "2025-04-11 08:28:48.358 UTC",
        //         "side": "long",
        //         "contracts": 0.001,
        //         "contractSize": 81299.8225,
        //         "entryPrice": 0.000012292609480106,
        //         "notional": 81.30326975863777,
        //         "leverage": 2.091737393826,
        //         "collateral": 38.918646841955464,
        //         "initialMargin": 2.0325817439659444,
        //         "maintenanceMargin": 1.0162908719829722,
        //         "initialMarginPercentage": 0.025,
        //         "maintenanceMarginPercentage": 0.0125,
        //         "unrealizedPnl": -0.0498699,
        //         "liquidationPrice": 42969.81843916013,
        //         "marginMode": "isolated",
        //         "marginRatio": 0.4780714839977587
        //     }
        // ]
        //
        return this.parsePositions (response, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        return this.safePosition (position);
    }

    /**
     * @method
     * @name aftermath#createOrders
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Build/build_create_orders
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Submit/submit_create_orders
     * @description create a list of trade orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account id to use, required
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const ordersRequest = [];
        for (let i = 0; i < orders.length; i++) {
            const order = this.clone (orders[i]);
            const symbol = this.safeString (order, 'symbol');
            const market = this.market (symbol);
            const price = this.safeString (order, 'price');
            const amount = this.safeString (order, 'amount');
            delete order['symbol'];
            order['chId'] = market['id'];
            if (price !== undefined) {
                order['price'] = this.parseToNumeric (this.priceToPrecision (symbol, price));
            }
            order['amount'] = this.parseToNumeric (this.amountToPrecision (symbol, amount));
            ordersRequest.push (order);
        }
        const account = this.safeString (params, 'account');
        params = this.omit (params, 'account');
        const txRequest = {
            'metadata': {
                'sender': this.walletAddress,
            },
            'subaccount': account,
            'orders': ordersRequest,
        };
        const tx = await this.privatePostBuildCreateOrders (this.extend (txRequest, params));
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostSubmitCreateOrders (request);
        //
        // [
        //     {
        //         "id": "340282366919093604570116171100942992979",
        //         "datetime": "2025-04-10 10:38:39.323 UTC",
        //         "timestamp": 1744281519323,
        //         "status": "open",
        //         "symbol": "BTC/USD:USDC",
        //         "type": "limit",
        //         "side": "buy",
        //         "price": 10001.0,
        //         "average": 0.0,
        //         "amount": 0.01,
        //         "filled": 0.0,
        //         "remaining": 0.01,
        //         "cost": 0.0,
        //         "trades": [],
        //         "fee": {}
        //     }
        // ]
        //
        return this.parseOrders (response);
    }

    /**
     * @method
     * @name aftermath#cancelOrders
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Build/build_cancel_orders
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Submit/submit_cancel_orders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account to cancel orders for, required
     * @returns {Order[]} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const account = this.safeString (params, 'account');
        params = this.omit (params, 'account');
        const txRequest = {
            'metadata': {
                'sender': this.walletAddress,
            },
            'subaccount': account,
            'chId': market['id'],
            'orderIds': ids,
        };
        const tx = await this.privatePostBuildCancelOrders (txRequest);
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostSubmitCancelOrders (request);
        //
        // [
        //     {
        //         "id": "340282366919093604570116171100942992979",
        //         "datetime": "2025-04-10 10:45:16.765 UTC",
        //         "timestamp": 1744281916765,
        //         "status": "closed",
        //         "symbol": "BTC/USD:USDC",
        //         "type": "limit",
        //         "side": "buy",
        //         "price": 10001.0,
        //         "amount": 0.01,
        //         "filled": 0.0,
        //         "remaining": 0.0,
        //         "cost": 0.0,
        //         "trades": [],
        //         "fee": {}
        //     }
        // ]
        //
        return this.parseOrders (response);
    }

    async createAccount (params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const settleId = this.safeString (params, 'settleId');
        params = this.omit (params, [ 'settleId' ]);
        const txRequest = {
            'metadata': {
                'sender': this.walletAddress,
            },
            'settleId': settleId,
        };
        const tx = await this.privatePostBuildCreateAccount (txRequest);
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostSubmitCreateAccount (request);
        //
        // [
        //     {
        //         "id": "0x2238b380cdf548cf9922a76ad8cf41cd886a04c1a68e7d0f99100b84b0b1ee48",
        //         "type": "primary",
        //         "code": "USDC",
        //         "accountNumber": 357
        //     },
        //     {
        //         "id": "0x6048be1c533a25226e2b505f5c7b8c4d731c87e9fb775dc577052c66febf1c93",
        //         "type": "subaccount",
        //         "code": "USDC",
        //         "accountNumber": 357
        //     }
        // ]
        //
        return response;
    }

    async createSubaccount (params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const account = this.safeString2 (params, 'account', 'primary');
        params = this.omit (params, [ 'account', 'primary' ]);
        const txRequest = {
            'metadata': {
                'sender': this.walletAddress,
            },
            'primary': account,
        };
        const tx = await this.privatePostBuildCreateSubaccount (txRequest);
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostSubmitCreateSubaccount (request);
        //
        // {
        //     "id": "0xf93f9bb8bf97eb570410caada92cfa3e66c7ed3a203a164f51d22d41eabe09c0",
        //     "type": "subaccount",
        //     "code": "USDC",
        //     "accountNumber": 101
        // }
        //
        return response;
    }

    /**
     * @method
     * @name aftermath#addMargin
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Build/build_allocate
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Submit/submit_allocate
     * @description add margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account id to use, required
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const account = this.safeString2 (params, 'account', 'accountId');
        params = this.omit (params, [ 'account', 'accountId' ]);
        const txRequest = {
            'accountId': account,
            'chId': market['id'],
            'amount': this.parseToNumeric (this.amountToPrecision (symbol, amount)),
            'metadata': {
                'sender': this.walletAddress,
            },
        };
        const tx = await this.privatePostBuildAllocate (txRequest);
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostSubmitAllocate (request);
        //
        // {
        //     "id": "0xb60c5078b060e4aede8e670089c9b1bc6eb231b4bcc0bfb3e97534770ace4d0c:101",
        //     "symbol": "BTC/USD",
        //     "contracts": 0.0,
        //     "contractSize": 81656.98359916,
        //     "notional": 0.0,
        //     "leverage": 0.0,
        //     "collateral": 40.0,
        //     "initialMargin": 0.0,
        //     "maintenanceMargin": 0.0,
        //     "initialMarginPercentage": 0.025,
        //     "maintenanceMarginPercentage": 0.0125,
        //     "unrealizedPnl": 0.0,
        //     "marginMode": "isolated"
        // }
        //
        return response as MarginModification;
    }

    /**
     * @method
     * @name aftermath#reduceMargin
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Build/build_deallocate
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Submit/submit_deallocate
     * @description remove margin from a position
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {Account} [params.account] account id to use, required
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const account = this.safeString2 (params, 'account', 'accountId');
        params = this.omit (params, [ 'account', 'accountId' ]);
        const txRequest = {
            'accountId': account,
            'chId': market['id'],
            'amount': this.parseToNumeric (this.amountToPrecision (symbol, amount)),
            'metadata': {
                'sender': this.walletAddress,
            },
        };
        const tx = await this.privatePostBuildDeallocate (txRequest);
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostSubmitDeallocate (request);
        //
        // {
        //     "id": "0xb60c5078b060e4aede8e670089c9b1bc6eb231b4bcc0bfb3e97534770ace4d0c:101",
        //     "symbol": "BTC/USD",
        //     "contracts": 0.0,
        //     "contractSize": 81678.2625,
        //     "notional": 0.0,
        //     "leverage": 0.0,
        //     "collateral": 39.0,
        //     "initialMargin": 0.0,
        //     "maintenanceMargin": 0.0,
        //     "initialMarginPercentage": 0.025,
        //     "maintenanceMarginPercentage": 0.0125,
        //     "unrealizedPnl": 0.0,
        //     "marginMode": "isolated"
        // }
        //
        return response as MarginModification;
    }

    /**
     * @method
     * @name aftermath#transfer
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Build/build_deposit
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Submit/submit_deposit
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const txRequest = {
            'metadata': {
                'sender': this.walletAddress,
            },
            'accountId': toAccount,
            'amount': amount,
        };
        const tx = await this.privatePostBuildDeposit (txRequest);
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostSubmitDeposit (request);
        //
        // {
        //     "id": "0xf93f9bb8bf97eb570410caada92cfa3e66c7ed3a203a164f51d22d41eabe09c0",
        //     "type": "subaccount",
        //     "code": "USDC",
        //     "accountNumber": 101,
        //     "collateral": 1.0
        // }
        //
        return this.extend (this.parseTransfer (response, currency), {
            'fromAccount': this.walletAddress,
            'toAccount': toAccount,
            'amount': amount,
        });
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        const currencyId = this.safeString (transfer, 'code');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'id'),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
        };
    }

    /**
     * @method
     * @name aftermath#withdraw
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Build/build_withdraw
     * @see https://testnet.aftermath.finance/iperps-api/swagger-ui/#/Submit/submit_withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const subaccount = this.safeString (params, 'subaccount');
        params = this.omit (params, [ 'subaccount' ]);
        const txRequest = {
            'metadata': {
                'sender': this.walletAddress,
            },
            'primary': address,
            'subaccount': subaccount,
            'amount': amount,
        };
        const tx = await this.privatePostBuildWithdraw (txRequest);
        const request = this.signTxEd25519 (tx);
        const response = await this.privatePostSubmitWithdraw (request);
        //
        // {
        //     "id": "0xf93f9bb8bf97eb570410caada92cfa3e66c7ed3a203a164f51d22d41eabe09c0",
        //     "type": "subaccount",
        //     "code": "USDC",
        //     "accountNumber": 101,
        //     "collateral": 39.0
        // }
        //
        return this.extend (this.parseTransaction (response, currency), {
            'addressFrom': subaccount,
            'addressTo': address,
            'amount': amount,
        });
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'tx_id'),
            'timestamp': undefined,
            'datetime': undefined,
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': undefined,
            'amount': undefined,
            'currency': this.safeString (transaction, 'code'),
            'status': undefined,
            'updated': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': undefined,
            'network': undefined,
        };
    }

    /**
     * @method
     * @name aftermath#signTxEd25519
     * @description Helper to sign some transaction bytes and return a generic transaction execution request.
     * @param {object} [tx] transaction bytes and the signing digest for them
     * @returns {object} the input transaction bytes and the signed digest
     */
    signTxEd25519 (tx: Dict): Dict {
        if (this.privateKey.indexOf ('suiprivkey') >= 0) {
            throw new NotSupported (this.id + ' only support hex encoding private key, please transform bech32 encoding private key');
        }
        const signingDigest = this.safeString (tx, 'signingDigest');
        const hexDigest = this.binaryToBase16 (this.base64ToBinary (signingDigest));
        const privateKey = this.base16ToBinary (this.privateKey);
        const signature = ed25519.sign (hexDigest, privateKey);
        const publicKey = ed25519.getPublicKey (privateKey);
        const suiSignature = this.binaryConcat (this.base16ToBinary ('00'), this.binaryConcat (signature, publicKey));
        const base64Sig = this.binaryToBase64 (suiSignature);
        const transactionBytes = this.safeString (tx, 'transactionBytes');
        return { 'transactionBytes': transactionBytes, 'signatures': [ base64Sig ] };
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        return this.safeOrder (order, market);
    }

    sign (path, api = 'public', method = 'POST', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api']['rest'] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
        }
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
