'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, ExchangeNotAvailable, ArgumentsRequired, PermissionDenied, AuthenticationError, ExchangeError, OrderNotFound, DDoSProtection, InvalidNonce, InsufficientFunds, CancelPending, InvalidOrder, InvalidAddress, NotSupported } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class kraken extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': [ 'US' ],
            'version': '0',
            'rateLimit': 3000,
            'certified': true,
            'pro': true,
            'has': {
                'createDepositAddress': true,
                'fetchDepositAddress': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'CORS': false,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchWithdrawals': true,
                'fetchDeposits': true,
                'withdraw': true,
                'fetchLedgerEntry': true,
                'fetchLedger': true,
            },
            'marketsByAltname': {},
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '4h': 240,
                '1d': 1440,
                '1w': 10080,
                '2w': 21600,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg',
                'api': {
                    'public': 'https://api.kraken.com',
                    'private': 'https://api.kraken.com',
                    'zendesk': 'https://support.kraken.com/hc/en-us/articles',
                },
                'www': 'https://www.kraken.com',
                'doc': 'https://www.kraken.com/features/api',
                'fees': 'https://www.kraken.com/en-us/features/fee-schedule',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.26 / 100,
                    'maker': 0.16 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.0026],
                            [50000, 0.0024],
                            [100000, 0.0022],
                            [250000, 0.0020],
                            [500000, 0.0018],
                            [1000000, 0.0016],
                            [2500000, 0.0014],
                            [5000000, 0.0012],
                            [10000000, 0.0001],
                        ],
                        'maker': [
                            [0, 0.0016],
                            [50000, 0.0014],
                            [100000, 0.0012],
                            [250000, 0.0010],
                            [500000, 0.0008],
                            [1000000, 0.0006],
                            [2500000, 0.0004],
                            [5000000, 0.0002],
                            [10000000, 0.0],
                        ],
                    },
                },
                // this is a bad way of hardcoding fees that change on daily basis
                // hardcoding is now considered obsolete, we will remove all of it eventually
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'ETH': 0.005,
                        'XRP': 0.02,
                        'XLM': 0.00002,
                        'LTC': 0.02,
                        'DOGE': 2,
                        'ZEC': 0.00010,
                        'ICN': 0.02,
                        'REP': 0.01,
                        'ETC': 0.005,
                        'MLN': 0.003,
                        'XMR': 0.05,
                        'DASH': 0.005,
                        'GNO': 0.01,
                        'EOS': 0.5,
                        'BCH': 0.001,
                        'XTZ': 0.05,
                        'USD': 5, // if domestic wire
                        'EUR': 5, // if domestic wire
                        'CAD': 10, // CAD EFT Withdrawal
                        'JPY': 300, // if domestic wire
                    },
                    'deposit': {
                        'BTC': 0,
                        'ETH': 0,
                        'XRP': 0,
                        'XLM': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'ZEC': 0,
                        'ICN': 0,
                        'REP': 0,
                        'ETC': 0,
                        'MLN': 0,
                        'XMR': 0,
                        'DASH': 0,
                        'GNO': 0,
                        'EOS': 0,
                        'BCH': 0,
                        'XTZ': 0.05,
                        'USD': 5, // if domestic wire
                        'EUR': 0, // free deposit if EUR SEPA Deposit
                        'CAD': 5, // if domestic wire
                        'JPY': 0, // Domestic Deposit (Free, ¥5,000 deposit minimum)
                    },
                },
            },
            'api': {
                'zendesk': {
                    'get': [
                        // we should really refrain from putting fixed fee numbers and stop hardcoding
                        // we will be using their web APIs to scrape all numbers from these articles
                        '205893708-What-is-the-minimum-order-size-',
                        '201396777-What-are-the-deposit-fees-',
                        '201893608-What-are-the-withdrawal-fees-',
                    ],
                },
                'public': {
                    'get': [
                        'Assets',
                        'AssetPairs',
                        'Depth',
                        'OHLC',
                        'Spread',
                        'Ticker',
                        'Time',
                        'Trades',
                    ],
                },
                'private': {
                    'post': [
                        'AddOrder',
                        'AddExport',
                        'Balance',
                        'CancelOrder',
                        'ClosedOrders',
                        'DepositAddresses',
                        'DepositMethods',
                        'DepositStatus',
                        'ExportStatus',
                        'GetWebSocketsToken',
                        'Ledgers',
                        'OpenOrders',
                        'OpenPositions',
                        'QueryLedgers',
                        'QueryOrders',
                        'QueryTrades',
                        'RetrieveExport',
                        'RemoveExport',
                        'TradeBalance',
                        'TradesHistory',
                        'TradeVolume',
                        'Withdraw',
                        'WithdrawCancel',
                        'WithdrawInfo',
                        'WithdrawStatus',
                    ],
                },
            },
            'commonCurrencies': {
                'XBT': 'BTC',
                'XDG': 'DOGE',
            },
            'options': {
                'cacheDepositMethodsOnFetchDepositAddress': true, // will issue up to two calls in fetchDepositAddress
                'depositMethods': {},
                'delistedMarketsById': {},
                // cannot withdraw/deposit these
                'inactiveCurrencies': [ 'CAD', 'USD', 'JPY', 'GBP' ],
            },
            'exceptions': {
                'EQuery:Invalid asset pair': BadSymbol, // {"error":["EQuery:Invalid asset pair"]}
                'EAPI:Invalid key': AuthenticationError,
                'EFunding:Unknown withdraw key': ExchangeError,
                'EFunding:Invalid amount': InsufficientFunds,
                'EService:Unavailable': ExchangeNotAvailable,
                'EDatabase:Internal error': ExchangeNotAvailable,
                'EService:Busy': ExchangeNotAvailable,
                'EQuery:Unknown asset': ExchangeError,
                'EAPI:Rate limit exceeded': DDoSProtection,
                'EOrder:Rate limit exceeded': DDoSProtection,
                'EGeneral:Internal error': ExchangeNotAvailable,
                'EGeneral:Temporary lockout': DDoSProtection,
                'EGeneral:Permission denied': PermissionDenied,
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    async fetchMinOrderAmounts () {
        const html = await this.zendeskGet205893708WhatIsTheMinimumOrderSize ();
        const parts = html.split ('<td class="wysiwyg-text-align-right">');
        const numParts = parts.length;
        if (numParts < 3) {
            throw new NotSupported (this.id + ' fetchMinOrderAmounts HTML page markup has changed: https://support.kraken.com/hc/en-us/articles/205893708-What-is-the-minimum-order-size-');
        }
        const result = {};
        // skip the part before the header and the header itself
        for (let i = 2; i < parts.length; i++) {
            const part = parts[i];
            const chunks = part.split ('</td>');
            const amountAndCode = chunks[0];
            if (amountAndCode !== 'To Be Announced') {
                const pieces = amountAndCode.split (' ');
                const numPieces = pieces.length;
                if (numPieces === 2) {
                    const amount = parseFloat (pieces[0]);
                    const code = this.safeCurrencyCode (pieces[1]);
                    result[code] = amount;
                }
            }
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetAssetPairs (params);
        const limits = await this.fetchMinOrderAmounts ();
        const keys = Object.keys (response['result']);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = response['result'][id];
            const baseId = market['base'];
            const quoteId = market['quote'];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const darkpool = id.indexOf ('.d') >= 0;
            const symbol = darkpool ? market['altname'] : (base + '/' + quote);
            let maker = undefined;
            if ('fees_maker' in market) {
                maker = parseFloat (market['fees_maker'][0][1]) / 100;
            }
            const precision = {
                'amount': market['lot_decimals'],
                'price': market['pair_decimals'],
            };
            let minAmount = Math.pow (10, -precision['amount']);
            if (base in limits) {
                minAmount = limits[base];
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'darkpool': darkpool,
                'info': market,
                'altname': market['altname'],
                'maker': maker,
                'taker': parseFloat (market['fees'][0][1]) / 100,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            });
        }
        result = this.appendInactiveMarkets (result);
        this.marketsByAltname = this.indexBy (result, 'altname');
        return result;
    }

    safeCurrencyCode (currencyId, currency = undefined) {
        if (currencyId.length > 3) {
            if ((currencyId.indexOf ('X') === 0) || (currencyId.indexOf ('Z') === 0)) {
                currencyId = currencyId.slice (1);
            }
        }
        return super.safeCurrencyCode (currencyId, currency);
    }

    appendInactiveMarkets (result) {
        // result should be an array to append to
        const precision = { 'amount': 8, 'price': 8 };
        const costLimits = { 'min': 0, 'max': undefined };
        const priceLimits = { 'min': Math.pow (10, -precision['price']), 'max': undefined };
        const amountLimits = { 'min': Math.pow (10, -precision['amount']), 'max': Math.pow (10, precision['amount']) };
        const limits = { 'amount': amountLimits, 'price': priceLimits, 'cost': costLimits };
        const defaults = {
            'darkpool': false,
            'info': undefined,
            'maker': undefined,
            'taker': undefined,
            'active': false,
            'precision': precision,
            'limits': limits,
        };
        const markets = [
            // { 'id': 'XXLMZEUR', 'symbol': 'XLM/EUR', 'base': 'XLM', 'quote': 'EUR', 'altname': 'XLMEUR' },
        ];
        for (let i = 0; i < markets.length; i++) {
            result.push (this.extend (defaults, markets[i]));
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "ADA": { "aclass": "currency", "altname": "ADA", "decimals": 8, "display_decimals": 6 },
        //             "BCH": { "aclass": "currency", "altname": "BCH", "decimals": 10, "display_decimals": 5 },
        //             ...
        //         },
        //     }
        //
        const currencies = this.safeValue (response, 'result');
        const ids = Object.keys (currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            // todo: will need to rethink the fees
            // see: https://support.kraken.com/hc/en-us/articles/201893608-What-are-the-withdrawal-fees-
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode (this.safeString (currency, 'altname'));
            const precision = this.safeInteger (currency, 'decimals');
            // assumes all currencies are active except those listed above
            const active = !this.inArray (code, this.options['inactiveCurrencies']);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': active,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const response = await this.privatePostTradeVolume (params);
        const tradedVolume = this.safeFloat (response['result'], 'volume');
        const tiers = this.fees['trading']['tiers'];
        let taker = tiers['taker'][1];
        let maker = tiers['maker'][1];
        for (let i = 0; i < tiers['taker'].length; i++) {
            if (tradedVolume >= tiers['taker'][i][0]) {
                taker = tiers['taker'][i][1];
            }
        }
        for (let i = 0; i < tiers['maker'].length; i++) {
            if (tradedVolume >= tiers['maker'][i][0]) {
                maker = tiers['maker'][i][1];
            }
        }
        return {
            'info': response,
            'maker': maker,
            'taker': taker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['darkpool']) {
            throw new ExchangeError (this.id + ' does not provide an order book for darkpool symbol ' + symbol);
        }
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit; // 100
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        const orderbook = response['result'][market['id']];
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const baseVolume = parseFloat (ticker['v'][1]);
        const vwap = parseFloat (ticker['p'][1]);
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = parseFloat (ticker['c'][0]);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['h'][1]),
            'low': parseFloat (ticker['l'][1]),
            'bid': parseFloat (ticker['b'][0]),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['a'][0]),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = (symbols === undefined) ? this.symbols : symbols;
        const marketIds = [];
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.markets[symbol];
            if (market['active'] && !market['darkpool']) {
                marketIds.push (market['id']);
            }
        }
        const request = {
            'pair': marketIds.join (','),
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const tickers = response['result'];
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            const ticker = tickers[id];
            if (this.inArray (symbol, symbols)) {
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const darkpool = symbol.indexOf ('.d') >= 0;
        if (darkpool) {
            throw new ExchangeError (this.id + ' does not provide a ticker for darkpool symbol ' + symbol);
        }
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = response['result'][market['id']];
        return this.parseTicker (ticker, market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0] * 1000,
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[6]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['since'] = parseInt ((since - 1) / 1000);
        }
        const response = await this.publicGetOHLC (this.extend (request, params));
        const ohlcvs = response['result'][market['id']];
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            'trade': 'trade',
            'withdrawal': 'transaction',
            'deposit': 'transaction',
            'transfer': 'transfer',
            'margin': 'margin',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         'LTFK7F-N2CUX-PNY4SX': {
        //             refid: "TSJTGT-DT7WN-GPPQMJ",
        //             time:  1520102320.555,
        //             type: "trade",
        //             aclass: "currency",
        //             asset: "XETH",
        //             amount: "0.1087194600",
        //             fee: "0.0000000000",
        //             balance: "0.2855851000"
        //         },
        //         ...
        //     }
        //
        const id = this.safeString (item, 'id');
        let direction = undefined;
        const account = undefined;
        const referenceId = this.safeString (item, 'refid');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'asset'), currency);
        let amount = this.safeFloat (item, 'amount');
        if (amount < 0) {
            direction = 'out';
            amount = Math.abs (amount);
        } else {
            direction = 'in';
        }
        const time = this.safeFloat (item, 'time');
        let timestamp = undefined;
        if (time !== undefined) {
            timestamp = parseInt (time * 1000);
        }
        const fee = {
            'cost': this.safeFloat (item, 'fee'),
            'currency': code,
        };
        const before = undefined;
        const after = this.safeFloat (item, 'balance');
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
        // https://www.kraken.com/features/api#get-ledgers-info
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
        }
        const response = await this.privatePostLedgers (this.extend (request, params));
        // {  error: [],
        //   result: { ledger: { 'LPUAIB-TS774-UKHP7X': {   refid: "A2B4HBV-L4MDIE-JU4N3N",
        //                                                   time:  1520103488.314,
        //                                                   type: "withdrawal",
        //                                                 aclass: "currency",
        //                                                  asset: "XETH",
        //                                                 amount: "-0.2805800000",
        //                                                    fee: "0.0050000000",
        //                                                balance: "0.0000051000"           },
        const result = this.safeValue (response, 'result', {});
        const ledger = this.safeValue (result, 'ledger', {});
        const keys = Object.keys (ledger);
        const items = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = ledger[key];
            value['id'] = key;
            items.push (value);
        }
        return this.parseLedger (items, currency, since, limit);
    }

    async fetchLedgerEntriesByIds (ids, code = undefined, params = {}) {
        // https://www.kraken.com/features/api#query-ledgers
        await this.loadMarkets ();
        ids = ids.join (',');
        const request = this.extend ({
            'id': ids,
        }, params);
        const response = await this.privatePostQueryLedgers (request);
        // {  error: [],
        //   result: { 'LPUAIB-TS774-UKHP7X': {   refid: "A2B4HBV-L4MDIE-JU4N3N",
        //                                         time:  1520103488.314,
        //                                         type: "withdrawal",
        //                                       aclass: "currency",
        //                                        asset: "XETH",
        //                                       amount: "-0.2805800000",
        //                                          fee: "0.0050000000",
        //                                      balance: "0.0000051000"           } } }
        const result = response['result'];
        const keys = Object.keys (result);
        const items = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = result[key];
            value['id'] = key;
            items.push (value);
        }
        return this.parseLedger (items);
    }

    async fetchLedgerEntry (id, code = undefined, params = {}) {
        const items = await this.fetchLedgerEntriesByIds ([ id ], code, params);
        return items[0];
    }

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        let side = undefined;
        let type = undefined;
        let price = undefined;
        let amount = undefined;
        let id = undefined;
        let order = undefined;
        let fee = undefined;
        const marketId = this.safeString (trade, 'pair');
        const foundMarket = this.findMarketByAltnameOrId (marketId);
        let symbol = undefined;
        if (foundMarket !== undefined) {
            market = foundMarket;
        } else if (marketId !== undefined) {
            // delisted market ids go here
            market = this.getDelistedMarketById (marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        if (Array.isArray (trade)) {
            timestamp = this.safeTimestamp (trade, 2);
            side = (trade[3] === 's') ? 'sell' : 'buy';
            type = (trade[4] === 'l') ? 'limit' : 'market';
            price = this.safeFloat (trade, 0);
            amount = this.safeFloat (trade, 1);
            const tradeLength = trade.length;
            if (tradeLength > 6) {
                id = this.safeString (trade, 6); // artificially added as per #1794
            }
        } else if ('ordertxid' in trade) {
            order = trade['ordertxid'];
            id = this.safeString2 (trade, 'id', 'postxid');
            timestamp = this.safeTimestamp (trade, 'time');
            side = trade['type'];
            type = trade['ordertype'];
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat (trade, 'vol');
            if ('fee' in trade) {
                let currency = undefined;
                if (market) {
                    currency = market['quote'];
                }
                fee = {
                    'cost': this.safeFloat (trade, 'fee'),
                    'currency': currency,
                };
            }
        }
        return {
            'id': id,
            'order': order,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'pair': id,
        };
        // https://support.kraken.com/hc/en-us/articles/218198197-How-to-pull-all-trade-data-using-the-Kraken-REST-API
        // https://github.com/ccxt/ccxt/issues/5677
        if (since !== undefined) {
            // php does not format it properly
            // therefore we use string concatenation here
            request['since'] = since * 1e6;
            request['since'] = since.toString () + '000000'; // expected to be in nanoseconds
        }
        // https://github.com/ccxt/ccxt/issues/5698
        if (limit !== undefined && limit !== 1000) {
            const fetchTradesWarning = this.safeValue (this.options, 'fetchTradesWarning', true);
            if (fetchTradesWarning) {
                throw new ExchangeError (this.id + ' fetchTrades() cannot serve ' + limit.toString () + " trades without breaking the pagination, see https://github.com/ccxt/ccxt/issues/5698 for more details. Set exchange.options['fetchTradesWarning'] to acknowledge this warning and silence it.");
            }
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "XETHXXBT": [
        //                 ["0.032310","4.28169434",1541390792.763,"s","l",""]
        //             ],
        //             "last": "1541439421200678657"
        //         }
        //     }
        //
        const result = response['result'];
        const trades = result[id];
        // trades is a sorted array: last (most recent trade) goes last
        const length = trades.length;
        if (length <= 0) {
            return [];
        }
        const lastTrade = trades[length - 1];
        const lastTradeId = this.safeString (result, 'last');
        lastTrade.push (lastTradeId);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        const response = await this.privatePostBalance (params);
        const balances = this.safeValue (response, 'result', {});
        const result = { 'info': balances };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balances, currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'ordertype': type,
            'volume': this.amountToPrecision (symbol, amount),
        };
        const priceIsDefined = (price !== undefined);
        const marketOrder = (type === 'market');
        const limitOrder = (type === 'limit');
        const shouldIncludePrice = limitOrder || (!marketOrder && priceIsDefined);
        if (shouldIncludePrice) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostAddOrder (this.extend (request, params));
        let id = this.safeValue (response['result'], 'txid');
        if (id !== undefined) {
            if (Array.isArray (id)) {
                const length = id.length;
                id = (length > 1) ? id : id[0];
            }
        }
        const clientOrderId = this.safeString (params, 'userref');
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
        };
    }

    findMarketByAltnameOrId (id) {
        if (id in this.marketsByAltname) {
            return this.marketsByAltname[id];
        } else if (id in this.markets_by_id) {
            return this.markets_by_id[id];
        }
        return undefined;
    }

    getDelistedMarketById (id) {
        if (id === undefined) {
            return id;
        }
        let market = this.safeValue (this.options['delistedMarketsById'], id);
        if (market !== undefined) {
            return market;
        }
        const baseIdStart = 0;
        let baseIdEnd = 3;
        let quoteIdStart = 3;
        let quoteIdEnd = 6;
        if (id.length === 8) {
            baseIdEnd = 4;
            quoteIdStart = 4;
            quoteIdEnd = 8;
        } else if (id.length === 7) {
            baseIdEnd = 4;
            quoteIdStart = 4;
            quoteIdEnd = 7;
        }
        const baseId = id.slice (baseIdStart, baseIdEnd);
        const quoteId = id.slice (quoteIdStart, quoteIdEnd);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        market = {
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
        };
        this.options['delistedMarketsById'][id] = market;
        return market;
    }

    parseOrderStatus (status) {
        const statuses = {
            'pending': 'open', // order pending book entry
            'open': 'open',
            'closed': 'closed',
            'canceled': 'canceled',
            'expired': 'expired',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const description = this.safeValue (order, 'descr', {});
        const side = this.safeString (description, 'type');
        const type = this.safeString (description, 'ordertype');
        const marketId = this.safeString (description, 'pair');
        const foundMarket = this.findMarketByAltnameOrId (marketId);
        let symbol = undefined;
        if (foundMarket !== undefined) {
            market = foundMarket;
        } else if (marketId !== undefined) {
            // delisted market ids go here
            market = this.getDelistedMarketById (marketId);
        }
        const timestamp = this.safeTimestamp (order, 'opentm');
        const amount = this.safeFloat (order, 'vol');
        const filled = this.safeFloat (order, 'vol_exec');
        const remaining = amount - filled;
        let fee = undefined;
        const cost = this.safeFloat (order, 'cost');
        let price = this.safeFloat (description, 'price');
        if ((price === undefined) || (price === 0)) {
            price = this.safeFloat (description, 'price2');
        }
        if ((price === undefined) || (price === 0)) {
            price = this.safeFloat (order, 'price', price);
        }
        const average = this.safeFloat (order, 'price');
        if (market !== undefined) {
            symbol = market['symbol'];
            if ('fee' in order) {
                const flags = order['oflags'];
                const feeCost = this.safeFloat (order, 'fee');
                fee = {
                    'cost': feeCost,
                    'rate': undefined,
                };
                if (flags.indexOf ('fciq') >= 0) {
                    fee['currency'] = market['quote'];
                } else if (flags.indexOf ('fcib') >= 0) {
                    fee['currency'] = market['base'];
                }
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'userref');
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'average': average,
            'remaining': remaining,
            'fee': fee,
            // 'trades': this.parseTrades (order['trades'], market),
        };
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        const result = [];
        const ids = Object.keys (orders);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const order = this.extend ({ 'id': id }, orders[id]);
            result.push (this.extend (this.parseOrder (order, market), params));
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostQueryOrders (this.extend ({
            'trades': true, // whether or not to include trades in output (optional, default false)
            'txid': id, // do not comma separate a list of ids - use fetchOrdersByIds instead
            // 'userref': 'optional', // restrict results to given user reference id (optional)
        }, params));
        const orders = response['result'];
        const order = this.parseOrder (this.extend ({ 'id': id }, orders[id]));
        return this.extend ({ 'info': response }, order);
    }

    async fetchOrdersByIds (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostQueryOrders (this.extend ({
            'trades': true, // whether or not to include trades in output (optional, default false)
            'txid': ids.join (','), // comma delimited list of transaction ids to query info about (20 maximum)
        }, params));
        const result = this.safeValue (response, 'result', {});
        const orders = [];
        const orderIds = Object.keys (result);
        for (let i = 0; i < orderIds.length; i++) {
            const id = orderIds[i];
            const item = result[id];
            const order = this.parseOrder (this.extend ({ 'id': id }, item));
            orders.push (order);
        }
        return orders;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'type': 'all', // any position, closed position, closing position, no position
            // 'trades': false, // whether or not to include trades related to position in output
            // 'start': 1234567890, // starting unix timestamp or trade tx id of results (exclusive)
            // 'end': 1234567890, // ending unix timestamp or trade tx id of results (inclusive)
            // 'ofs' = result offset
        };
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
        }
        const response = await this.privatePostTradesHistory (this.extend (request, params));
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "trades": {
        //                 "GJ3NYQ-XJRTF-THZABF": {
        //                     "ordertxid": "TKH2SE-ZIF5E-CFI7LT",
        //                     "postxid": "OEN3VX-M7IF5-JNBJAM",
        //                     "pair": "XICNXETH",
        //                     "time": 1527213229.4491,
        //                     "type": "sell",
        //                     "ordertype": "limit",
        //                     "price": "0.001612",
        //                     "cost": "0.025792",
        //                     "fee": "0.000026",
        //                     "vol": "16.00000000",
        //                     "margin": "0.000000",
        //                     "misc": ""
        //                 },
        //                 ...
        //             },
        //             "count": 9760,
        //         },
        //     }
        //
        const trades = response['result']['trades'];
        const ids = Object.keys (trades);
        for (let i = 0; i < ids.length; i++) {
            trades[ids[i]]['id'] = ids[i];
        }
        const result = this.parseTrades (trades, undefined, since, limit);
        if (symbol === undefined) {
            return result;
        }
        return this.filterBySymbol (result, symbol);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            response = await this.privatePostCancelOrder (this.extend ({
                'txid': id,
            }, params));
        } catch (e) {
            if (this.last_http_response) {
                if (this.last_http_response.indexOf ('EOrder:Unknown order') >= 0) {
                    throw new OrderNotFound (this.id + ' cancelOrder() error ' + this.last_http_response);
                }
            }
            throw e;
        }
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
        }
        const response = await this.privatePostOpenOrders (this.extend (request, params));
        const orders = this.parseOrders (response['result']['open'], undefined, since, limit);
        if (symbol === undefined) {
            return orders;
        }
        return this.filterBySymbol (orders, symbol);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
        }
        const response = await this.privatePostClosedOrders (this.extend (request, params));
        const orders = this.parseOrders (response['result']['closed'], undefined, since, limit);
        if (symbol === undefined) {
            return orders;
        }
        return this.filterBySymbol (orders, symbol);
    }

    async fetchDepositMethods (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privatePostDepositMethods (this.extend (request, params));
        return response['result'];
    }

    parseTransactionStatus (status) {
        // IFEX transaction states
        const statuses = {
            'Initial': 'pending',
            'Pending': 'pending',
            'Success': 'ok',
            'Settled': 'pending',
            'Failure': 'failed',
            'Partial': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     { method: "Ether (Hex)",
        //       aclass: "currency",
        //        asset: "XETH",
        //        refid: "Q2CANKL-LBFVEE-U4Y2WQ",
        //         txid: "0x57fd704dab1a73c20e24c8696099b695d596924b401b261513cfdab23…",
        //         info: "0x615f9ba7a9575b0ab4d571b2b36b1b324bd83290",
        //       amount: "7.9999257900",
        //          fee: "0.0000000000",
        //         time:  1529223212,
        //       status: "Success"                                                       }
        //
        // fetchWithdrawals
        //
        //     { method: "Ether",
        //       aclass: "currency",
        //        asset: "XETH",
        //        refid: "A2BF34S-O7LBNQ-UE4Y4O",
        //         txid: "0x288b83c6b0904d8400ef44e1c9e2187b5c8f7ea3d838222d53f701a15b5c274d",
        //         info: "0x7cb275a5e07ba943fee972e165d80daa67cb2dd0",
        //       amount: "9.9950000000",
        //          fee: "0.0050000000",
        //         time:  1530481750,
        //       status: "Success"                                                             }
        //
        const id = this.safeString (transaction, 'refid');
        const txid = this.safeString (transaction, 'txid');
        const timestamp = this.safeTimestamp (transaction, 'time');
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (transaction, 'info');
        const amount = this.safeFloat (transaction, 'amount');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const type = this.safeString (transaction, 'type'); // injected from the outside
        let feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost === undefined) {
            if (type === 'deposit') {
                feeCost = 0;
            }
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    parseTransactionsByType (type, transactions, code = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = this.parseTransaction (this.extend ({
                'type': type,
            }, transactions[i]));
            result.push (transaction);
        }
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // https://www.kraken.com/en-us/help/api#deposit-status
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits requires a currency code argument');
        }
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privatePostDepositStatus (this.extend (request, params));
        //
        //     {  error: [],
        //       result: [ { method: "Ether (Hex)",
        //                   aclass: "currency",
        //                    asset: "XETH",
        //                    refid: "Q2CANKL-LBFVEE-U4Y2WQ",
        //                     txid: "0x57fd704dab1a73c20e24c8696099b695d596924b401b261513cfdab23…",
        //                     info: "0x615f9ba7a9575b0ab4d571b2b36b1b324bd83290",
        //                   amount: "7.9999257900",
        //                      fee: "0.0000000000",
        //                     time:  1529223212,
        //                   status: "Success"                                                       } ] }
        //
        return this.parseTransactionsByType ('deposit', response['result'], code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // https://www.kraken.com/en-us/help/api#withdraw-status
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals requires a currency code argument');
        }
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privatePostWithdrawStatus (this.extend (request, params));
        //
        //     {  error: [],
        //       result: [ { method: "Ether",
        //                   aclass: "currency",
        //                    asset: "XETH",
        //                    refid: "A2BF34S-O7LBNQ-UE4Y4O",
        //                     txid: "0x298c83c7b0904d8400ef43e1c9e2287b518f7ea3d838822d53f704a1565c274d",
        //                     info: "0x7cb275a5e07ba943fee972e165d80daa67cb2dd0",
        //                   amount: "9.9950000000",
        //                      fee: "0.0050000000",
        //                     time:  1530481750,
        //                   status: "Success"                                                             } ] }
        //
        return this.parseTransactionsByType ('withdrawal', response['result'], code, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        const request = {
            'new': 'true',
        };
        const response = await this.fetchDepositAddress (code, this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        // eslint-disable-next-line quotes
        let method = this.safeString (params, 'method');
        if (method === undefined) {
            if (this.options['cacheDepositMethodsOnFetchDepositAddress']) {
                // cache depositMethods
                if (!(code in this.options['depositMethods'])) {
                    this.options['depositMethods'][code] = await this.fetchDepositMethods (code);
                }
                method = this.options['depositMethods'][code][0]['method'];
            } else {
                throw new ExchangeError (this.id + ' fetchDepositAddress() requires an extra `method` parameter. Use fetchDepositMethods ("' + code + '") to get a list of available deposit methods or enable the exchange property .options["cacheDepositMethodsOnFetchDepositAddress"] = true');
            }
        }
        const request = {
            'asset': currency['id'],
            'method': method,
        };
        const response = await this.privatePostDepositAddresses (this.extend (request, params)); // overwrite methods
        const result = response['result'];
        const numResults = result.length;
        if (numResults < 1) {
            throw new InvalidAddress (this.id + ' privatePostDepositAddresses() returned no addresses');
        }
        const address = this.safeString (result[0], 'address');
        const tag = this.safeString2 (result[0], 'tag', 'memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        if ('key' in params) {
            await this.loadMarkets ();
            const currency = this.currency (code);
            const request = {
                'asset': currency['id'],
                'amount': amount,
                // 'address': address, // they don't allow withdrawals to direct addresses
            };
            const response = await this.privatePostWithdraw (this.extend (request, params));
            return {
                'info': response,
                'id': response['result'],
            };
        }
        throw new ExchangeError (this.id + " withdraw requires a 'key' parameter (withdrawal key name, as set up on your account)");
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, params));
            const auth = this.encode (nonce + body);
            const hash = this.hash (auth, 'sha256', 'binary');
            const binary = this.stringToBinary (this.encode (url));
            const binhash = this.binaryConcat (binary, hash);
            const secret = this.base64ToBinary (this.secret);
            const signature = this.hmac (binhash, secret, 'sha512', 'base64');
            headers = {
                'API-Key': this.apiKey,
                'API-Sign': this.decode (signature),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else {
            url = '/' + path;
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    nonce () {
        return this.milliseconds ();
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 520) {
            throw new ExchangeNotAvailable (this.id + ' ' + code.toString () + ' ' + reason);
        }
        // todo: rewrite this for "broad" exceptions matching
        if (body.indexOf ('Invalid order') >= 0) {
            throw new InvalidOrder (this.id + ' ' + body);
        }
        if (body.indexOf ('Invalid nonce') >= 0) {
            throw new InvalidNonce (this.id + ' ' + body);
        }
        if (body.indexOf ('Insufficient funds') >= 0) {
            throw new InsufficientFunds (this.id + ' ' + body);
        }
        if (body.indexOf ('Cancel pending') >= 0) {
            throw new CancelPending (this.id + ' ' + body);
        }
        if (body.indexOf ('Invalid arguments:volume') >= 0) {
            throw new InvalidOrder (this.id + ' ' + body);
        }
        if (body[0] === '{') {
            if (typeof response !== 'string') {
                if ('error' in response) {
                    const numErrors = response['error'].length;
                    if (numErrors) {
                        const message = this.id + ' ' + body;
                        for (let i = 0; i < response['error'].length; i++) {
                            const error = response['error'][i];
                            this.throwExactlyMatchedException (this.exceptions, error, message);
                        }
                        throw new ExchangeError (message);
                    }
                }
            }
        }
    }
};
