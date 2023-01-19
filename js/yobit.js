'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InvalidNonce, InsufficientFunds, OrderNotFound, DDoSProtection, InvalidOrder, AuthenticationError, RateLimitExceeded } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class yobit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'yobit',
            'name': 'YoBit',
            'countries': [ 'RU' ],
            'rateLimit': 2000, // responses are cached every 2 seconds
            'version': '3',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchDepositAddress': true,
                'fetchDeposits': undefined,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': undefined,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawals': undefined,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
                'api': {
                    'public': 'https://yobit.net/api',
                    'private': 'https://yobit.net/tapi',
                },
                'www': 'https://www.yobit.net',
                'doc': 'https://www.yobit.net/en/api/',
                'fees': 'https://www.yobit.net/en/fees/',
            },
            'api': {
                'public': {
                    'get': {
                        'depth/{pair}': 1,
                        'info': 1,
                        'ticker/{pair}': 1,
                        'trades/{pair}': 1,
                    },
                },
                'private': {
                    'post': {
                        'ActiveOrders': 1,
                        'CancelOrder': 1,
                        'GetDepositAddress': 1,
                        'getInfo': 1,
                        'OrderInfo': 1,
                        'Trade': 1,
                        'TradeHistory': 1,
                        'WithdrawCoinsToAddress': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.002,
                    'taker': 0.002,
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'AIR': 'AirCoin',
                'ANI': 'ANICoin',
                'ANT': 'AntsCoin',  // what is this, a coin for ants?
                'ATMCHA': 'ATM',
                'ASN': 'Ascension',
                'AST': 'Astral',
                'ATM': 'Autumncoin',
                'AUR': 'AuroraCoin',
                'BAB': 'Babel',
                'BAN': 'BANcoin',
                'BCC': 'BCH',
                'BCS': 'BitcoinStake',
                'BITS': 'Bitstar',
                'BLN': 'Bulleon',
                'BNS': 'Benefit Bonus Coin',
                'BOT': 'BOTcoin',
                'BON': 'BONES',
                'BPC': 'BitcoinPremium',
                'BST': 'BitStone',
                'BTS': 'Bitshares2',
                'CAT': 'BitClave',
                'CBC': 'CryptoBossCoin',
                'CMT': 'CometCoin',
                'COIN': 'Coin.com',
                'COV': 'Coven Coin',
                'COVX': 'COV',
                'CPC': 'Capricoin',
                'CREDIT': 'Creditbit',
                'CS': 'CryptoSpots',
                'DCT': 'Discount',
                'DFT': 'DraftCoin',
                'DGD': 'DarkGoldCoin',
                'DIRT': 'DIRTY',
                'DROP': 'FaucetCoin',
                'DSH': 'DASH',
                'EGC': 'EverGreenCoin',
                'EGG': 'EggCoin',
                'EKO': 'EkoCoin',
                'ENTER': 'ENTRC',
                'EPC': 'ExperienceCoin',
                'ESC': 'EdwardSnowden',
                'EUROPE': 'EUROP',
                'EXT': 'LifeExtension',
                'FUND': 'FUNDChains',
                'FUNK': 'FUNKCoin',
                'FX': 'FCoin',
                'GCC': 'GlobalCryptocurrency',
                'GEN': 'Genstake',
                'GENE': 'Genesiscoin',
                'GMR': 'Gimmer',
                'GOLD': 'GoldMint',
                'GOT': 'Giotto Coin',
                'GSX': 'GlowShares',
                'GT': 'GTcoin',
                'HTML5': 'HTML',
                'HYPERX': 'HYPER',
                'ICN': 'iCoin',
                'INSANE': 'INSN',
                'JNT': 'JointCoin',
                'JPC': 'JupiterCoin',
                'JWL': 'Jewels',
                'KNC': 'KingN Coin',
                'LBTCX': 'LiteBitcoin',
                'LIZI': 'LiZi',
                'LOC': 'LocoCoin',
                'LOCX': 'LOC',
                'LUNYR': 'LUN',
                'LUN': 'LunarCoin',  // they just change the ticker if it is already taken
                'LUNA': 'Luna Coin',
                'MASK': 'Yobit MASK',
                'MDT': 'Midnight',
                'MEME': 'Memez Token', // conflict with Meme Inu / Degenerator Meme
                'MIS': 'MIScoin',
                'MM': 'MasterMint', // conflict with MilliMeter
                'NAV': 'NavajoCoin',
                'NBT': 'NiceBytes',
                'OMG': 'OMGame',
                'ONX': 'Onix',
                'PAC': '$PAC',
                'PLAY': 'PlayCoin',
                'PIVX': 'Darknet',
                'PRS': 'PRE',
                'PURE': 'PurePOS',
                'PUTIN': 'PutinCoin',
                'SPACE': 'Spacecoin',
                'STK': 'StakeCoin',
                'SUB': 'Subscriptio',
                'PAY': 'EPAY',
                'PLC': 'Platin Coin',
                'RAI': 'RaiderCoin',
                'RCN': 'RCoin',
                'REP': 'Republicoin',
                'RUR': 'RUB',
                'SBTC': 'Super Bitcoin',
                'SMC': 'SmartCoin',
                'SOLO': 'SoloCoin',
                'SOUL': 'SoulCoin',
                'STAR': 'StarCoin',
                'SUPER': 'SuperCoin',
                'TNS': 'Transcodium',
                'TTC': 'TittieCoin',
                'UNI': 'Universe',
                'UST': 'Uservice',
                'VOL': 'VolumeCoin',
                'XIN': 'XINCoin',
                'XMT': 'SummitCoin',
                'XRA': 'Ratecoin',
            },
            'options': {
                // 'fetchTickersMaxLength': 2048,
                'fetchOrdersRequiresSymbol': true,
                'fetchTickersMaxLength': 512,
                'networks': {
                    'ETH': 'ERC20',
                    'TRX': 'TRC20',
                    'BSC': 'BEP20',
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '803': InvalidOrder, // "Count could not be less than 0.001." (selling below minAmount)
                    '804': InvalidOrder, // "Count could not be more than 10000." (buying above maxAmount)
                    '805': InvalidOrder, // "price could not be less than X." (minPrice violation on buy & sell)
                    '806': InvalidOrder, // "price could not be more than X." (maxPrice violation on buy & sell)
                    '807': InvalidOrder, // "cost could not be less than X." (minCost violation on buy & sell)
                    '831': InsufficientFunds, // "Not enougth X to create buy order." (buying with balance.quote < order.cost)
                    '832': InsufficientFunds, // "Not enougth X to create sell order." (selling with balance.base < order.amount)
                    '833': OrderNotFound, // "Order with id X was not found." (cancelling non-existent, closed and cancelled order)
                },
                'broad': {
                    'Invalid pair name': ExchangeError, // {"success":0,"error":"Invalid pair name: btc_eth"}
                    'invalid api key': AuthenticationError,
                    'invalid sign': AuthenticationError,
                    'api key dont have trade permission': AuthenticationError,
                    'invalid parameter': InvalidOrder,
                    'invalid order': InvalidOrder,
                    'The given order has already been cancelled': InvalidOrder,
                    'Requests too often': DDoSProtection,
                    'not available': ExchangeNotAvailable,
                    'data unavailable': ExchangeNotAvailable,
                    'external service unavailable': ExchangeNotAvailable,
                    'Total transaction amount': InvalidOrder, // { "success": 0, "error": "Total transaction amount is less than minimal total: 0.00010000"}
                    'The given order has already been closed and cannot be cancelled': InvalidOrder,
                    'Insufficient funds': InsufficientFunds,
                    'invalid key': AuthenticationError,
                    'invalid nonce': InvalidNonce, // {"success":0,"error":"invalid nonce (has already been used)"}'
                    'Total order amount is less than minimal amount': InvalidOrder,
                    'Rate Limited': RateLimitExceeded,
                },
            },
            'orders': {}, // orders cache / emulation
        });
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'return', {});
        const timestamp = this.safeInteger (balances, 'server_time');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const free = this.safeValue (balances, 'funds', {});
        const total = this.safeValue (balances, 'funds_incl_orders', {});
        const currencyIds = Object.keys (this.extend (free, total));
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (free, currencyId);
            account['total'] = this.safeString (total, currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name yobit#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo (params);
        //
        //     {
        //         "success":1,
        //         "return":{
        //             "funds":{
        //                 "ltc":22,
        //                 "nvc":423.998,
        //                 "ppc":10,
        //             },
        //             "funds_incl_orders":{
        //                 "ltc":32,
        //                 "nvc":523.998,
        //                 "ppc":20,
        //             },
        //             "rights":{
        //                 "info":1,
        //                 "trade":0,
        //                 "withdraw":0
        //             },
        //             "transaction_count":0,
        //             "open_orders":1,
        //             "server_time":1418654530
        //         }
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name yobit#fetchMarkets
         * @description retrieves data on all markets for yobit
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetInfo (params);
        //
        //     {
        //         "server_time":1615856752,
        //         "pairs":{
        //             "ltc_btc":{
        //                 "decimal_places":8,
        //                 "min_price":0.00000001,
        //                 "max_price":10000,
        //                 "min_amount":0.0001,
        //                 "min_total":0.0001,
        //                 "hidden":0,
        //                 "fee":0.2,
        //                 "fee_buyer":0.2,
        //                 "fee_seller":0.2
        //             },
        //         },
        //     }
        //
        const markets = this.safeValue (response, 'pairs', {});
        const keys = Object.keys (markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const hidden = this.safeInteger (market, 'hidden');
            let feeString = this.safeString (market, 'fee');
            feeString = Precise.stringDiv (feeString, '100');
            // yobit maker = taker
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': (hidden === 0),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.parseNumber (feeString),
                'maker': this.parseNumber (feeString),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'decimal_places'))),
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'decimal_places'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': this.safeNumber (market, 'max_amount'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_total'),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name yobit#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 150, max = 2000
        }
        const response = await this.publicGetDepthPair (this.extend (request, params));
        const market_id_in_reponse = (market['id'] in response);
        if (!market_id_in_reponse) {
            throw new ExchangeError (this.id + ' ' + market['symbol'] + ' order book is empty or not available');
        }
        const orderbook = response[market['id']];
        return this.parseOrderBook (orderbook, symbol);
    }

    async fetchOrderBooks (symbols = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name yobit#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @param {[string]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int|undefined} limit max number of entries per orderbook to return, default is undefined
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbol
         */
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join ('-');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                const numIds = this.ids.length;
                throw new ExchangeError (this.id + ' fetchOrderBooks() has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join ('-');
        }
        const request = {
            'pair': ids,
            // 'ignore_invalid': true,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDepthPair (this.extend (request, params));
        const result = {};
        ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const symbol = this.safeSymbol (id);
            result[symbol] = this.parseOrderBook (response[id], symbol);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         high: 0.03497582,
        //         low: 0.03248474,
        //         avg: 0.03373028,
        //         vol: 120.11485715062999,
        //         vol_cur: 3572.24914074,
        //         last: 0.0337611,
        //         buy: 0.0337442,
        //         sell: 0.03377798,
        //         updated: 1537522009
        //     }
        //
        const timestamp = this.safeTimestamp (ticker, 'updated');
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeString (ticker, 'avg'),
            'baseVolume': this.safeString (ticker, 'vol_cur'),
            'quoteVolume': this.safeString (ticker, 'vol'),
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name yobit#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let ids = this.ids;
        if (symbols === undefined) {
            const numIds = ids.length;
            ids = ids.join ('-');
            const maxLength = this.safeInteger (this.options, 'fetchTickersMaxLength', 2048);
            // max URL length is 2048 symbols, including http schema, hostname, tld, etc...
            if (ids.length > this.options['fetchTickersMaxLength']) {
                throw new ArgumentsRequired (this.id + ' fetchTickers() has ' + numIds.toString () + ' markets exceeding max URL length for this endpoint (' + maxLength.toString () + ' characters), please, specify a list of symbols of interest in the first argument to fetchTickers');
            }
        } else {
            ids = this.marketIds (symbols);
            ids = ids.join ('-');
        }
        const request = {
            'pair': ids,
        };
        const tickers = await this.publicGetTickerPair (this.extend (request, params));
        const result = {};
        const keys = Object.keys (tickers);
        for (let k = 0; k < keys.length; k++) {
            const id = keys[k];
            const ticker = tickers[id];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name yobit#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "type":"bid",
        //          "price":0.14046179,
        //          "amount":0.001,
        //          "tid":200256901,
        //          "timestamp":1649861004
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //          "pair":"doge_usdt",
        //          "type":"sell",
        //          "amount":139,
        //          "rate":0.139,
        //          "order_id":"2101103631773172",
        //          "is_your_order":1,
        //          "timestamp":"1649861561"
        //      }
        //
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        let side = this.safeString (trade, 'type');
        if (side === 'ask') {
            side = 'sell';
        } else if (side === 'bid') {
            side = 'buy';
        }
        const priceString = this.safeString2 (trade, 'rate', 'price');
        const id = this.safeString2 (trade, 'trade_id', 'tid');
        const order = this.safeString (trade, 'order_id');
        const marketId = this.safeString (trade, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const amountString = this.safeString (trade, 'amount');
        // arguments for calculateFee (need to be numbers)
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const type = 'limit'; // all trades are still limit trades
        let fee = undefined;
        const feeCostString = this.safeNumber (trade, 'commission');
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commissionCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        const isYourOrder = this.safeValue (trade, 'is_your_order');
        if (isYourOrder !== undefined) {
            if (fee === undefined) {
                const feeInNumbers = this.calculateFee (symbol, type, side, amount, price, 'taker');
                fee = {
                    'currency': this.safeString (feeInNumbers, 'currency'),
                    'cost': this.safeString (feeInNumbers, 'cost'),
                    'rate': this.safeString (feeInNumbers, 'rate'),
                };
            }
        }
        return this.safeTrade ({
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name yobit#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTradesPair (this.extend (request, params));
        //
        //      {
        //          "doge_usdt": [
        //              {
        //                  "type":"ask",
        //                  "price":0.13956743,
        //                  "amount":0.0008,
        //                  "tid":200256900,
        //                  "timestamp":1649860521
        //              },
        //          ]
        //      }
        //
        if (Array.isArray (response)) {
            const numElements = response.length;
            if (numElements === 0) {
                return [];
            }
        }
        const result = this.safeValue (response, market['id'], []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name yobit#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/en/latest/manual.html#fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicGetInfo (params);
        //
        //     {
        //         "server_time":1615856752,
        //         "pairs":{
        //             "ltc_btc":{
        //                 "decimal_places":8,
        //                 "min_price":0.00000001,
        //                 "max_price":10000,
        //                 "min_amount":0.0001,
        //                 "min_total":0.0001,
        //                 "hidden":0,
        //                 "fee":0.2,
        //                 "fee_buyer":0.2,
        //                 "fee_seller":0.2
        //             },
        //             ...
        //         },
        //     }
        //
        const pairs = this.safeValue (response, 'pairs', {});
        const marketIds = Object.keys (pairs);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const pair = this.safeValue (pairs, marketId, {});
            const symbol = this.safeSymbol (marketId, undefined, '_');
            const takerString = this.safeString (pair, 'fee_buyer');
            const makerString = this.safeString (pair, 'fee_seller');
            const taker = this.parseNumber (Precise.stringDiv (takerString, '100'));
            const maker = this.parseNumber (Precise.stringDiv (makerString, '100'));
            result[symbol] = {
                'info': pair,
                'symbol': symbol,
                'taker': taker,
                'maker': maker,
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name yobit#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (type === 'market') {
            throw new ExchangeError (this.id + ' createOrder() allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'amount': this.amountToPrecision (symbol, amount),
            'rate': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostTrade (this.extend (request, params));
        //
        //      {
        //          "success":1,
        //          "return": {
        //              "received":0,
        //              "remains":10,
        //              "order_id":1101103635125179,
        //              "funds": {
        //                  "usdt":27.84756553,
        //                  "usdttrc20":0,
        //                  "doge":19.98327206
        //              },
        //              "funds_incl_orders": {
        //                  "usdt":30.35256553,
        //                  "usdttrc20":0,
        //                  "doge":19.98327206
        //               },
        //               "server_time":1650114256
        //           }
        //       }
        //
        const result = this.safeValue (response, 'return');
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name yobit#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by yobit cancelOrder ()
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        //
        //      {
        //          "success":1,
        //          "return": {
        //              "order_id":1101103632552304,
        //              "funds": {
        //                  "usdt":30.71055443,
        //                  "usdttrc20":0,
        //                  "doge":9.98327206
        //              },
        //              "funds_incl_orders": {
        //                  "usdt":31.81275443,
        //                  "usdttrc20":0,
        //                  "doge":9.98327206
        //              },
        //              "server_time":1649918298
        //          }
        //      }
        //
        const result = this.safeValue (response, 'return', {});
        return this.parseOrder (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'open', // or partially-filled and canceled? https://github.com/ccxt/ccxt/issues/1594
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder (private)
        //
        //      {
        //          "received":0,
        //          "remains":10,
        //          "order_id":1101103635125179,
        //          "funds": {
        //              "usdt":27.84756553,
        //              "usdttrc20":0,
        //              "doge":19.98327206
        //          },
        //          "funds_incl_orders": {
        //              "usdt":30.35256553,
        //              "usdttrc20":0,
        //              "doge":19.98327206
        //          },
        //          "server_time":1650114256
        //      }
        //
        // fetchOrder (private)
        //
        //      {
        //          "id: "1101103635103335",  // id-field is manually added in fetchOrder () from exchange response id-order dictionary structure
        //          "pair":"doge_usdt",
        //          "type":"buy",
        //          "start_amount":10,
        //          "amount":10,
        //          "rate":0.05,
        //          "timestamp_created":"1650112553",
        //          "status":0
        //      }
        //
        // fetchOpenOrders (private)
        //
        //      {
        //          "id":"1101103635103335", // id-field is manually added in fetchOpenOrders () from exchange response id-order dictionary structure
        //          "pair":"doge_usdt",
        //          "type":"buy",
        //          "amount":10,
        //          "rate":0.05,
        //          "timestamp_created":"1650112553",
        //          "status":0
        //      }
        //
        // cancelOrder (private)
        //
        //      {
        //          "order_id":1101103634000197,
        //          "funds": {
        //              "usdt":31.81275443,
        //              "usdttrc20":0,
        //              "doge":9.98327206
        //          },
        //          "funds_incl_orders": {
        //              "usdt":31.81275443,
        //              "usdttrc20":0,
        //              "doge":9.98327206
        //          }
        //      }
        //
        let id = this.safeString2 (order, 'id', 'order_id');
        let status = this.parseOrderStatus (this.safeString (order, 'status', 'open'));
        if (id === '0') {
            id = this.safeString (order, 'init_order_id');
            status = 'closed';
        }
        const timestamp = this.safeTimestamp2 (order, 'timestamp_created', 'server_time');
        const marketId = this.safeString (order, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const amount = this.safeString (order, 'start_amount');
        const remaining = this.safeString2 (order, 'amount', 'remains');
        const filled = this.safeString (order, 'received', '0.0');
        const price = this.safeString (order, 'rate');
        const fee = undefined;
        const type = 'limit';
        const side = this.safeString (order, 'type');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name yobit#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol not used by yobit fetchOrder
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        const response = await this.privatePostOrderInfo (this.extend (request, params));
        id = id.toString ();
        const orders = this.safeValue (response, 'return', {});
        //
        //      {
        //          "success":1,
        //          "return": {
        //              "1101103635103335": {
        //                  "pair":"doge_usdt",
        //                  "type":"buy",
        //                  "start_amount":10,
        //                  "amount":10,
        //                  "rate":0.05,
        //                  "timestamp_created":"1650112553",
        //                  "status":0
        //              }
        //          }
        //      }
        //
        return this.parseOrder (this.extend ({ 'id': id }, orders[id]));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name yobit#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = {};
        const market = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privatePostActiveOrders (this.extend (request, params));
        //
        //      {
        //          "success":1,
        //          "return": {
        //              "1101103634006799": {
        //                  "pair":"doge_usdt",
        //                  "type":"buy",
        //                  "amount":10,
        //                  "rate":0.1,
        //                  "timestamp_created":"1650034937",
        //                  "status":0
        //              },
        //              "1101103634006738": {
        //                  "pair":"doge_usdt",
        //                  "type":"buy",
        //                  "amount":10,
        //                  "rate":0.1,
        //                  "timestamp_created":"1650034932",
        //                  "status":0
        //              }
        //          }
        //      }
        //
        const result = this.safeValue (response, 'return', {});
        return this.parseOrders (result, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name yobit#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // some derived classes use camelcase notation for request fields
        const request = {
            // 'from': 123456789, // trade ID, from which the display starts numerical 0 (test result: liqui ignores this field)
            // 'count': 1000, // the number of trades for display numerical, default = 1000
            // 'from_id': trade ID, from which the display starts numerical 0
            // 'end_id': trade ID on which the display ends numerical ∞
            // 'order': 'ASC', // sorting, default = DESC (test result: liqui ignores this field, most recent trade always goes last)
            // 'since': 1234567890, // UTC start time, default = 0 (test result: liqui ignores this field)
            // 'end': 1234567890, // UTC end time, default = ∞ (test result: liqui ignores this field)
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = parseInt (limit);
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        //
        //      {
        //          "success":1,
        //          "return": {
        //              "200257004": {
        //                  "pair":"doge_usdt",
        //                  "type":"sell",
        //                  "amount":139,
        //                  "rate":0.139,
        //                  "order_id":"2101103631773172",
        //                  "is_your_order":1,
        //                  "timestamp":"1649861561"
        //              }
        //          }
        //      }
        //
        const trades = this.safeValue (response, 'return', {});
        const ids = Object.keys (trades);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const trade = this.parseTrade (this.extend (trades[id], {
                'trade_id': id,
            }), market);
            result.push (trade);
        }
        return this.filterBySymbolSinceLimit (result, market['symbol'], since, limit);
    }

    async createDepositAddress (code, params = {}) {
        /**
         * @method
         * @name yobit#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        const request = {
            'need_new': 1,
        };
        const response = await this.fetchDepositAddress (code, this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response['info'],
        };
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name yobit#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        let currencyId = currency['id'];
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            if (network !== 'ERC20') {
                currencyId = currencyId + network.toLowerCase ();
            }
            params = this.omit (params, 'network');
        }
        const request = {
            'coinName': currencyId,
            'need_new': 0,
        };
        const response = await this.privatePostGetDepositAddress (this.extend (request, params));
        const address = this.safeString (response['return'], 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name yobit#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string|undefined} tag
         * @param {object} params extra parameters specific to the yobit api endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coinName': currency['id'],
            'amount': amount,
            'address': address,
        };
        // no docs on the tag, yet...
        if (tag !== undefined) {
            throw new ExchangeError (this.id + ' withdraw() does not support the tag argument yet due to a lack of docs on withdrawing with tag/memo on behalf of the exchange.');
        }
        const response = await this.privatePostWithdrawCoinsToAddress (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'nonce': nonce,
                'method': path,
            }, query));
            const signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': signature,
            };
        } else if (api === 'public') {
            url += '/' + this.version + '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            url += '/' + this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    headers = {
                        'Content-Type': 'application/json',
                    };
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('success' in response) {
            //
            // 1 - Liqui only returns the integer 'success' key from their private API
            //
            //     { "success": 1, ... } httpCode === 200
            //     { "success": 0, ... } httpCode === 200
            //
            // 2 - However, exchanges derived from Liqui, can return non-integers
            //
            //     It can be a numeric string
            //     { "sucesss": "1", ... }
            //     { "sucesss": "0", ... }, httpCode >= 200 (can be 403, 502, etc)
            //
            //     Or just a string
            //     { "success": "true", ... }
            //     { "success": "false", ... }, httpCode >= 200
            //
            //     Or a boolean
            //     { "success": true, ... }
            //     { "success": false, ... }, httpCode >= 200
            //
            // 3 - Oversimplified, Python PEP8 forbids comparison operator (===) of different types
            //
            // 4 - We do not want to copy-paste and duplicate the code of this handler to other exchanges derived from Liqui
            //
            // To cover points 1, 2, 3 and 4 combined this handler should work like this:
            //
            let success = this.safeValue (response, 'success', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1')) {
                    success = true;
                } else {
                    success = false;
                }
            }
            if (!success) {
                const code = this.safeString (response, 'code');
                const message = this.safeString (response, 'error');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
