'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InvalidNonce, InsufficientFunds, OrderNotFound, DDoSProtection, InvalidOrder, AuthenticationError, RateLimitExceeded } = require ('./base/errors');
const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class yobit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'yobit',
            'name': 'YoBit',
            'countries': [ 'RU' ],
            'rateLimit': 3000, // responses are cached every 2 seconds
            'version': '3',
            'has': {
                'cancelOrder': true,
                'CORS': undefined,
                'createDepositAddress': true,
                'createMarketOrder': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchDeposits': undefined,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': undefined,
                'fetchWithdrawals': undefined,
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
                    'get': [
                        'depth/{pair}',
                        'info',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'ActiveOrders',
                        'CancelOrder',
                        'GetDepositAddress',
                        'getInfo',
                        'OrderInfo',
                        'Trade',
                        'TradeHistory',
                        'WithdrawCoinsToAddress',
                    ],
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
                'MIS': 'MIScoin',
                'NAV': 'NavajoCoin',
                'NBT': 'NiceBytes',
                'OMG': 'OMGame',
                'ONX': 'Onix',
                'PAC': '$PAC',
                'PLAY': 'PlayCoin',
                'PIVX': 'Darknet',
                'PRS': 'PRE',
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
                'SOLO': 'SoloCoin',
                'SUPER': 'SuperCoin',
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
            },
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

    async fetchBalance (params = {}) {
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
        return this.parseBalance (result);
    }

    async fetchMarkets (params = {}) {
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
        const markets = this.safeValue (response, 'pairs');
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
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'decimal_places'),
                'price': this.safeInteger (market, 'decimal_places'),
            };
            const amountLimits = {
                'min': this.safeNumber (market, 'min_amount'),
                'max': this.safeNumber (market, 'max_amount'),
            };
            const priceLimits = {
                'min': this.safeNumber (market, 'min_price'),
                'max': this.safeNumber (market, 'max_price'),
            };
            const costLimits = {
                'min': this.safeNumber (market, 'min_total'),
            };
            const limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            const hidden = this.safeInteger (market, 'hidden');
            const active = (hidden === 0);
            let feeString = this.safeString (market, 'fee');
            feeString = Precise.stringDiv (feeString, '100');
            // yobit maker = taker
            const takerFee = this.parseNumber (feeString);
            const makerFee = this.parseNumber (feeString);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'active': active,
                'taker': takerFee,
                'maker': makerFee,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
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
        await this.loadMarkets ();
        let ids = undefined;
        if (symbols === undefined) {
            ids = this.ids.join ('-');
            // max URL length is 2083 symbols, including http schema, hostname, tld, etc...
            if (ids.length > 2048) {
                const numIds = this.ids.length;
                throw new ExchangeError (this.id + ' has ' + numIds.toString () + ' symbols exceeding max URL length, you are required to specify a list of symbols in the first argument to fetchOrderBooks');
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
        //   {    high: 0.03497582,
        //         low: 0.03248474,
        //         avg: 0.03373028,
        //         vol: 120.11485715062999,
        //     vol_cur: 3572.24914074,
        //        last: 0.0337611,
        //         buy: 0.0337442,
        //        sell: 0.03377798,
        //     updated: 1537522009          }
        //
        const timestamp = this.safeTimestamp (ticker, 'updated');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeNumber (ticker, 'avg'),
            'baseVolume': this.safeNumber (ticker, 'vol_cur'),
            'quoteVolume': this.safeNumber (ticker, 'vol'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let ids = this.ids;
        if (symbols === undefined) {
            const numIds = ids.length;
            ids = ids.join ('-');
            const maxLength = this.safeInteger (this.options, 'fetchTickersMaxLength', 2048);
            // max URL length is 2048 symbols, including http schema, hostname, tld, etc...
            if (ids.length > this.options['fetchTickersMaxLength']) {
                throw new ArgumentsRequired (this.id + ' has ' + numIds.toString () + ' markets exceeding max URL length for this endpoint (' + maxLength.toString () + ' characters), please, specify a list of symbols of interest in the first argument to fetchTickers');
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
        const tickers = await this.fetchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    parseTrade (trade, market = undefined) {
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
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const type = 'limit'; // all trades are still limit trades
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'commission');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'commissionCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const isYourOrder = this.safeValue (trade, 'is_your_order');
        if (isYourOrder !== undefined) {
            if (fee === undefined) {
                fee = this.calculateFee (symbol, type, side, amount, price, 'taker');
            }
        }
        return {
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTradesPair (this.extend (request, params));
        if (Array.isArray (response)) {
            const numElements = response.length;
            if (numElements === 0) {
                return [];
            }
        }
        return this.parseTrades (response[market['id']], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
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
        let id = undefined;
        let status = 'open';
        let filled = 0.0;
        let remaining = amount;
        if ('return' in response) {
            id = this.safeString (response['return'], 'order_id');
            if (id === '0') {
                id = this.safeString (response['return'], 'init_order_id');
                status = 'closed';
            }
            filled = this.safeNumber (response['return'], 'received', 0.0);
            remaining = this.safeNumber (response['return'], 'remains', amount);
        }
        const timestamp = this.milliseconds ();
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * filled,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'fee': undefined,
            // 'trades': this.parseTrades (order['trades'], market),
            'info': response,
            'clientOrderId': undefined,
            'average': undefined,
            'trades': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
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
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeTimestamp (order, 'timestamp_created');
        const marketId = this.safeString (order, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const remaining = this.safeString (order, 'amount');
        const amount = this.safeString (order, 'start_amount');
        const price = this.safeString (order, 'rate');
        const fee = undefined;
        const type = 'limit';
        const side = this.safeString (order, 'type');
        return this.safeOrder2 ({
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
            'cost': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'status': status,
            'fee': fee,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        const response = await this.privatePostOrderInfo (this.extend (request, params));
        id = id.toString ();
        const orders = this.safeValue (response, 'return', {});
        return this.parseOrder (this.extend ({ 'id': id }, orders[id]));
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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
        const orders = this.safeValue (response, 'return', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
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
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async createDepositAddress (code, params = {}) {
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
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coinName': currency['id'],
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
