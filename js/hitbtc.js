'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class hitbtc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hitbtc',
            'name': 'HitBTC',
            'countries': 'HK',
            'rateLimit': 1500,
            'version': '1',
            'has': {
                'CORS': false,
                'fetchTrades': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api': 'http://api.hitbtc.com',
                'www': 'https://hitbtc.com',
                'referral': 'https://hitbtc.com/?ref_id=5a5d39a65d466',
                'doc': 'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv1.md',
                'fees': [
                    'https://hitbtc.com/fees-and-limits',
                    'https://support.hitbtc.com/hc/en-us/articles/115005148605-Fees-and-limits',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{symbol}/orderbook',
                        '{symbol}/ticker',
                        '{symbol}/trades',
                        '{symbol}/trades/recent',
                        'symbols',
                        'ticker',
                        'time',
                    ],
                },
                'trading': {
                    'get': [
                        'balance',
                        'orders/active',
                        'orders/recent',
                        'order',
                        'trades/by/order',
                        'trades',
                    ],
                    'post': [
                        'new_order',
                        'cancel_order',
                        'cancel_orders',
                    ],
                },
                'payment': {
                    'get': [
                        'balance',
                        'address/{currency}',
                        'transactions',
                        'transactions/{transaction}',
                    ],
                    'post': [
                        'transfer_to_trading',
                        'transfer_to_main',
                        'address/{currency}',
                        'payout',
                    ],
                },
            },
            // hardcoded fees are deprecated and should only be used when there's no other way to get fee info
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': -0.01 / 100,
                    'taker': 0.1 / 100,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'BCC': 0.0018,
                        'ETH': 0.00215,
                        'BCH': 0.0018,
                        'USDT': 100,
                        'DASH': 0.03,
                        'BTG': 0.0005,
                        'LTC': 0.003,
                        'ZEC': 0.0001,
                        'XMR': 0.09,
                        '1ST': 0.84,
                        'ADX': 5.7,
                        'AE': 6.7,
                        'AEON': 0.01006,
                        'AIR': 565,
                        'AMP': 9,
                        'ANT': 6.7,
                        'ARDR': 1,
                        'ARN': 18.5,
                        'ART': 26,
                        'ATB': 0.0004,
                        'ATL': 27,
                        'ATM': 504,
                        'ATS': 860,
                        'AVT': 1.9,
                        'BAS': 113,
                        'BCN': 0.1,
                        'DAO.Casino': 124, // id = 'BET'
                        'BKB': 46,
                        'BMC': 32,
                        'BMT': 100,
                        'BNT': 2.57,
                        'BQX': 4.7,
                        'BTM': 40,
                        'BTX': 0.04,
                        'BUS': 0.004,
                        'CCT': 115,
                        'CDT': 100,
                        'CDX': 30,
                        'CFI': 61,
                        'CLD': 0.88,
                        'CND': 574,
                        'CNX': 0.04,
                        'COSS': 65,
                        'CSNO': 16,
                        'CTR': 15,
                        'CTX': 146,
                        'CVC': 8.46,
                        'DBIX': 0.0168,
                        'DCN': 120000,
                        'DCT': 0.02,
                        'DDF': 342,
                        'DENT': 6240,
                        'DGB': 0.4,
                        'DGD': 0.01,
                        'DICE': 0.32,
                        'DLT': 0.26,
                        'DNT': 0.21,
                        'DOGE': 2,
                        'DOV': 34,
                        'DRPU': 24,
                        'DRT': 240,
                        'DSH': 0.017,
                        'EBET': 84,
                        'EBTC': 20,
                        'EBTCOLD': 6.6,
                        'ECAT': 14,
                        'EDG': 2,
                        'EDO': 2.9,
                        'ELE': 0.00172,
                        'ELM': 0.004,
                        'EMC': 0.03,
                        'EMGO': 14,
                        'ENJ': 163,
                        'EOS': 1.5,
                        'ERO': 34,
                        'ETBS': 15,
                        'ETC': 0.002,
                        'ETP': 0.004,
                        'EVX': 5.4,
                        'EXN': 456,
                        'FRD': 65,
                        'FUEL': 123.00105,
                        'FUN': 202.9598309,
                        'FYN': 1.849,
                        'FYP': 66.13,
                        'GNO': 0.0034,
                        'GUP': 4,
                        'GVT': 1.2,
                        'HAC': 144,
                        'HDG': 7,
                        'HGT': 1082,
                        'HPC': 0.4,
                        'HVN': 120,
                        'ICN': 0.55,
                        'ICO': 34,
                        'ICOS': 0.35,
                        'IND': 76,
                        'INDI': 5913,
                        'ITS': 15.0012,
                        'IXT': 11,
                        'KBR': 143,
                        'KICK': 112,
                        'LA': 41,
                        'LAT': 1.44,
                        'LIFE': 13000,
                        'LRC': 27,
                        'LSK': 0.3,
                        'LUN': 0.34,
                        'MAID': 5,
                        'MANA': 143,
                        'MCAP': 5.44,
                        'MIPS': 43,
                        'MNE': 1.33,
                        'MSP': 121,
                        'MTH': 92,
                        'MYB': 3.9,
                        'NDC': 165,
                        'NEBL': 0.04,
                        'NET': 3.96,
                        'NTO': 998,
                        'NXC': 13.39,
                        'NXT': 3,
                        'OAX': 15,
                        'ODN': 0.004,
                        'OMG': 2,
                        'OPT': 335,
                        'ORME': 2.8,
                        'OTN': 0.57,
                        'PAY': 3.1,
                        'PIX': 96,
                        'PLBT': 0.33,
                        'PLR': 114,
                        'PLU': 0.87,
                        'POE': 784,
                        'POLL': 3.5,
                        'PPT': 2,
                        'PRE': 32,
                        'PRG': 39,
                        'PRO': 41,
                        'PRS': 60,
                        'PTOY': 0.5,
                        'QAU': 63,
                        'QCN': 0.03,
                        'QTUM': 0.04,
                        'QVT': 64,
                        'REP': 0.02,
                        'RKC': 15,
                        'RVT': 14,
                        'SAN': 2.24,
                        'SBD': 0.03,
                        'SCL': 2.6,
                        'SISA': 1640,
                        'SKIN': 407,
                        'SMART': 0.4,
                        'SMS': 0.0375,
                        'SNC': 36,
                        'SNGLS': 4,
                        'SNM': 48,
                        'SNT': 233,
                        'STEEM': 0.01,
                        'STRAT': 0.01,
                        'STU': 14,
                        'STX': 11,
                        'SUB': 17,
                        'SUR': 3,
                        'SWT': 0.51,
                        'TAAS': 0.91,
                        'TBT': 2.37,
                        'TFL': 15,
                        'TIME': 0.03,
                        'TIX': 7.1,
                        'TKN': 1,
                        'TKR': 84,
                        'TNT': 90,
                        'TRST': 1.6,
                        'TRX': 1395,
                        'UET': 480,
                        'UGT': 15,
                        'VEN': 14,
                        'VERI': 0.037,
                        'VIB': 50,
                        'VIBE': 145,
                        'VOISE': 618,
                        'WEALTH': 0.0168,
                        'WINGS': 2.4,
                        'WTC': 0.75,
                        'XAUR': 3.23,
                        'XDN': 0.01,
                        'XEM': 15,
                        'XUC': 0.9,
                        'YOYOW': 140,
                        'ZAP': 24,
                        'ZRX': 23,
                        'ZSC': 191,
                    },
                    'deposit': {
                        'BTC': 0.0006,
                        'ETH': 0.003,
                        'BCH': 0,
                        'USDT': 0,
                        'BTG': 0,
                        'LTC': 0,
                        'ZEC': 0,
                        'XMR': 0,
                        '1ST': 0,
                        'ADX': 0,
                        'AE': 0,
                        'AEON': 0,
                        'AIR': 0,
                        'AMP': 0,
                        'ANT': 0,
                        'ARDR': 0,
                        'ARN': 0,
                        'ART': 0,
                        'ATB': 0,
                        'ATL': 0,
                        'ATM': 0,
                        'ATS': 0,
                        'AVT': 0,
                        'BAS': 0,
                        'BCN': 0,
                        'DAO.Casino': 0, // id = 'BET'
                        'BKB': 0,
                        'BMC': 0,
                        'BMT': 0,
                        'BNT': 0,
                        'BQX': 0,
                        'BTM': 0,
                        'BTX': 0,
                        'BUS': 0,
                        'CCT': 0,
                        'CDT': 0,
                        'CDX': 0,
                        'CFI': 0,
                        'CLD': 0,
                        'CND': 0,
                        'CNX': 0,
                        'COSS': 0,
                        'CSNO': 0,
                        'CTR': 0,
                        'CTX': 0,
                        'CVC': 0,
                        'DBIX': 0,
                        'DCN': 0,
                        'DCT': 0,
                        'DDF': 0,
                        'DENT': 0,
                        'DGB': 0,
                        'DGD': 0,
                        'DICE': 0,
                        'DLT': 0,
                        'DNT': 0,
                        'DOGE': 0,
                        'DOV': 0,
                        'DRPU': 0,
                        'DRT': 0,
                        'DSH': 0,
                        'EBET': 0,
                        'EBTC': 0,
                        'EBTCOLD': 0,
                        'ECAT': 0,
                        'EDG': 0,
                        'EDO': 0,
                        'ELE': 0,
                        'ELM': 0,
                        'EMC': 0,
                        'EMGO': 0,
                        'ENJ': 0,
                        'EOS': 0,
                        'ERO': 0,
                        'ETBS': 0,
                        'ETC': 0,
                        'ETP': 0,
                        'EVX': 0,
                        'EXN': 0,
                        'FRD': 0,
                        'FUEL': 0,
                        'FUN': 0,
                        'FYN': 0,
                        'FYP': 0,
                        'GNO': 0,
                        'GUP': 0,
                        'GVT': 0,
                        'HAC': 0,
                        'HDG': 0,
                        'HGT': 0,
                        'HPC': 0,
                        'HVN': 0,
                        'ICN': 0,
                        'ICO': 0,
                        'ICOS': 0,
                        'IND': 0,
                        'INDI': 0,
                        'ITS': 0,
                        'IXT': 0,
                        'KBR': 0,
                        'KICK': 0,
                        'LA': 0,
                        'LAT': 0,
                        'LIFE': 0,
                        'LRC': 0,
                        'LSK': 0,
                        'LUN': 0,
                        'MAID': 0,
                        'MANA': 0,
                        'MCAP': 0,
                        'MIPS': 0,
                        'MNE': 0,
                        'MSP': 0,
                        'MTH': 0,
                        'MYB': 0,
                        'NDC': 0,
                        'NEBL': 0,
                        'NET': 0,
                        'NTO': 0,
                        'NXC': 0,
                        'NXT': 0,
                        'OAX': 0,
                        'ODN': 0,
                        'OMG': 0,
                        'OPT': 0,
                        'ORME': 0,
                        'OTN': 0,
                        'PAY': 0,
                        'PIX': 0,
                        'PLBT': 0,
                        'PLR': 0,
                        'PLU': 0,
                        'POE': 0,
                        'POLL': 0,
                        'PPT': 0,
                        'PRE': 0,
                        'PRG': 0,
                        'PRO': 0,
                        'PRS': 0,
                        'PTOY': 0,
                        'QAU': 0,
                        'QCN': 0,
                        'QTUM': 0,
                        'QVT': 0,
                        'REP': 0,
                        'RKC': 0,
                        'RVT': 0,
                        'SAN': 0,
                        'SBD': 0,
                        'SCL': 0,
                        'SISA': 0,
                        'SKIN': 0,
                        'SMART': 0,
                        'SMS': 0,
                        'SNC': 0,
                        'SNGLS': 0,
                        'SNM': 0,
                        'SNT': 0,
                        'STEEM': 0,
                        'STRAT': 0,
                        'STU': 0,
                        'STX': 0,
                        'SUB': 0,
                        'SUR': 0,
                        'SWT': 0,
                        'TAAS': 0,
                        'TBT': 0,
                        'TFL': 0,
                        'TIME': 0,
                        'TIX': 0,
                        'TKN': 0,
                        'TKR': 0,
                        'TNT': 0,
                        'TRST': 0,
                        'TRX': 0,
                        'UET': 0,
                        'UGT': 0,
                        'VEN': 0,
                        'VERI': 0,
                        'VIB': 0,
                        'VIBE': 0,
                        'VOISE': 0,
                        'WEALTH': 0,
                        'WINGS': 0,
                        'WTC': 0,
                        'XAUR': 0,
                        'XDN': 0,
                        'XEM': 0,
                        'XUC': 0,
                        'YOYOW': 0,
                        'ZAP': 0,
                        'ZRX': 0,
                        'ZSC': 0,
                    },
                },
            },
            'commonCurrencies': {
                'BCC': 'BCC',
                'BET': 'DAO.Casino',
                'CAT': 'BitClave',
                'DRK': 'DASH',
                'EMGO': 'MGO',
                'GET': 'Themis',
                'USD': 'USDT',
                'XBT': 'BTC',
            },
            'options': {
                'defaultTimeInForce': 'FOK',
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetSymbols ();
        let result = [];
        for (let p = 0; p < markets['symbols'].length; p++) {
            let market = markets['symbols'][p];
            let id = market['symbol'];
            let baseId = market['commodity'];
            let quoteId = market['currency'];
            let lot = this.safeFloat (market, 'lot');
            let step = this.safeFloat (market, 'step');
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'lot': lot,
                'step': step,
                'active': true,
                'maker': this.safeFloat (market, 'provideLiquidityRate'),
                'taker': this.safeFloat (market, 'takeLiquidityRate'),
                'precision': {
                    'amount': this.precisionFromString (market['lot']),
                    'price': this.precisionFromString (market['step']),
                },
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': step,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let method = this.safeString (params, 'type', 'trading');
        method += 'GetBalance';
        let query = this.omit (params, 'type');
        let response = await this[method] (query);
        let balances = response['balance'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let code = balance['currency_code'];
            let currency = this.commonCurrencyCode (code);
            let free = this.safeFloat (balance, 'cash', 0.0);
            free = this.safeFloat (balance, 'balance', free);
            let used = this.safeFloat (balance, 'reserved', 0.0);
            let account = {
                'free': free,
                'used': used,
                'total': this.sum (free, used),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetSymbolOrderbook (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volume_quote'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetSymbolTicker (this.extend ({
            'symbol': market['id'],
        }, params));
        if ('message' in ticker)
            throw new ExchangeError (this.id + ' ' + ticker['message']);
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        if (Array.isArray (trade))
            return this.parsePublicTrade (trade, market);
        return this.parseOrderTrade (trade, market);
    }

    parsePublicTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'info': trade,
            'id': trade[0].toString (),
            'timestamp': trade[3],
            'datetime': this.iso8601 (trade[3]),
            'symbol': symbol,
            'type': undefined,
            'side': trade[4],
            'price': parseFloat (trade[1]),
            'amount': parseFloat (trade[2]),
        };
    }

    parseOrderTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let amount = this.safeFloat (trade, 'execQuantity');
        if (market)
            amount *= market['lot'];
        let price = this.safeFloat (trade, 'execPrice');
        let cost = price * amount;
        let fee = {
            'cost': this.safeFloat (trade, 'fee'),
            'currency': undefined,
            'rate': undefined,
        };
        let timestamp = trade['timestamp'];
        return {
            'info': trade,
            'id': trade['tradeId'],
            'order': trade['clientOrderId'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': trade['side'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetSymbolTrades (this.extend ({
            'symbol': market['id'],
            // 'from': 0,
            // 'till': 100,
            // 'by': 'ts', // or by trade_id
            // 'sort': 'desc', // or asc
            // 'start_index': 0,
            // 'max_results': 1000,
            // 'format_item': 'object',
            // 'format_price': 'number',
            // 'format_amount': 'number',
            // 'format_tid': 'string',
            // 'format_timestamp': 'millisecond',
            // 'format_wrap': false,
            'side': 'true',
        }, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // check if amount can be evenly divided into lots
        // they want integer quantity in lot units
        let quantity = parseFloat (amount) / market['lot'];
        let wholeLots = Math.round (quantity);
        let difference = quantity - wholeLots;
        if (Math.abs (difference) > market['step'])
            throw new ExchangeError (this.id + ' order amount should be evenly divisible by lot unit size of ' + market['lot'].toString ());
        let clientOrderId = this.milliseconds ();
        let order = {
            'clientOrderId': clientOrderId.toString (),
            'symbol': market['id'],
            'side': side,
            'quantity': wholeLots.toString (), // quantity in integer lot units
            'type': type,
        };
        if (type === 'limit') {
            order['price'] = this.priceToPrecision (symbol, price);
        } else {
            order['timeInForce'] = this.options['defaultTimeInForce'];
        }
        let response = await this.tradingPostNewOrder (this.extend (order, params));
        return this.parseOrder (response['ExecutionReport'], market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.tradingPostCancelOrder (this.extend ({
            'clientOrderId': id,
        }, params));
    }

    parseOrderStatus (status) {
        let statuses = {
            'new': 'open',
            'partiallyFilled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'rejected': 'rejected',
            'expired': 'expired',
        };
        return this.safeString (statuses, status);
    }

    parseOrder (order, market = undefined) {
        let timestamp = this.safeInteger (order, 'lastTimestamp');
        if (typeof timestamp === 'undefined')
            timestamp = this.safeInteger (order, 'timestamp');
        let symbol = undefined;
        if (!market)
            market = this.markets_by_id[order['symbol']];
        let status = this.safeString (order, 'orderStatus');
        if (status)
            status = this.parseOrderStatus (status);
        let averagePrice = this.safeFloat (order, 'avgPrice', 0.0);
        let price = this.safeFloat (order, 'orderPrice');
        if (typeof price === 'undefined')
            price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'orderQuantity');
        if (typeof amount === 'undefined')
            amount = this.safeFloat (order, 'quantity');
        let remaining = this.safeFloat (order, 'quantityLeaves');
        if (typeof remaining === 'undefined')
            remaining = this.safeFloat (order, 'leavesQuantity');
        let filled = undefined;
        let cost = undefined;
        let amountDefined = (typeof amount !== 'undefined');
        let remainingDefined = (typeof remaining !== 'undefined');
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
            if (amountDefined)
                amount *= market['lot'];
            if (remainingDefined)
                remaining *= market['lot'];
        } else {
            let marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        if (amountDefined) {
            if (remainingDefined) {
                filled = amount - remaining;
                cost = averagePrice * filled;
            }
        }
        let feeCost = this.safeFloat (order, 'fee');
        let feeCurrency = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        let fee = {
            'cost': feeCost,
            'currency': feeCurrency,
            'rate': undefined,
        };
        return {
            'id': order['clientOrderId'].toString (),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.tradingGetOrder (this.extend ({
            'clientOrderId': id,
        }, params));
        if (response['orders'][0]) {
            return this.parseOrder (response['orders'][0]);
        }
        throw new OrderNotFound (this.id + ' fetchOrder() error: ' + this.response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let statuses = [ 'new', 'partiallyFiiled' ];
        let market = undefined;
        let request = {
            'sort': 'desc',
            'statuses': statuses.join (','),
        };
        if (symbol) {
            market = this.market (symbol);
            request['symbols'] = market['id'];
        }
        let response = await this.tradingGetOrdersActive (this.extend (request, params));
        return this.parseOrders (response['orders'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let statuses = [ 'filled', 'canceled', 'rejected', 'expired' ];
        let request = {
            'sort': 'desc',
            'statuses': statuses.join (','),
            'max_results': 1000,
        };
        if (symbol) {
            market = this.market (symbol);
            request['symbols'] = market['id'];
        }
        let response = await this.tradingGetOrdersRecent (this.extend (request, params));
        return this.parseOrders (response['orders'], market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (typeof symbol !== 'undefined')
            market = this.market (symbol);
        let response = await this.tradingGetTradesByOrder (this.extend ({
            'clientOrderId': id,
        }, params));
        return this.parseTrades (response['trades'], market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'currency_code': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag)
            request['paymentId'] = tag;
        let response = await this.paymentPostPayout (this.extend (request, params));
        return {
            'info': response,
            'id': response['transaction'],
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + 'api' + '/' + this.version + '/' + api + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let payload = { 'nonce': nonce, 'apikey': this.apiKey };
            query = this.extend (payload, query);
            if (method === 'GET')
                url += '?' + this.urlencode (query);
            else
                url += '?' + this.urlencode (payload);
            let auth = url;
            if (method === 'POST') {
                if (Object.keys (query).length) {
                    body = this.urlencode (query);
                    auth += body;
                }
            }
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Signature': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512').toLowerCase (),
            };
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response) {
            if ('ExecutionReport' in response) {
                if (response['ExecutionReport']['orderRejectReason'] === 'orderExceedsLimit')
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
            }
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
