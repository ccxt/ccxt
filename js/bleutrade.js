'use strict';

// ---------------------------------------------------------------------------
const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidOrder, AuthenticationError, InsufficientFunds, BadRequest } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bleutrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bleutrade',
            'name': 'Bleutrade',
            'countries': ['BR'], // Brazil
            'rateLimit': 1000,
            'certified': false,
            'has': {
                'CORS': true,
                'cancelOrder': false, // todo
                'createLimitOrder': false, // todo
                'createMarketOrder': false, // todo
                'createOrder': false, // todo
                'editOrder': false, // todo
                'withdraw': false, // todo
                'fetchTrades': false,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchOrders': false,
                'fetchClosedOrders': true,
                'fetchWithdrawals': true,
                'fetchOrderTrades': false,
                'fetchLedger': true,
                'fetchDepositAddress': true,
            },
            'timeframes': {
                '15m': '15m',
                '20m': '20m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '3h': '3h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
            },
            'hostname': 'bleutrade.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg',
                'api': {
                    'v3Private': 'https://{hostname}/api/v3/private',
                    'v3Public': 'https://{hostname}/api/v3/public',
                },
                'www': ['https://bleutrade.com'],
                'doc': [
                    'https://app.swaggerhub.com/apis-docs/bleu/white-label/3.0.0',
                ],
                'fees': 'https://bleutrade.com/fees/',
            },
            'api': {
                'v3Public': {
                    'get': [
                        'getassets',
                        'getmarkets',
                        'getticker',
                        'getmarketsummary',
                        'getmarketsummaries',
                        'getorderbook',
                        'getmarkethistory',
                        'getcandles',
                    ],
                },
                'v3Private': {
                    'post': [
                        'getbalance',
                        'getbalances',
                        'buylimit',
                        'selllimit',
                        'buylimitami',
                        'selllimitami',
                        'buystoplimit',
                        'sellstoplimit',
                        'ordercancel',
                        'getopenorders',
                        'getcloseorders',
                        'getdeposithistory',
                        'getdepositaddress',
                        'getmytransactions',
                        'withdraw',
                        'directtransfer',
                        'getwithdrawhistory',
                        'getlimits',
                    ],
                },
            },
            'commonCurrencies': {
                'EPC': 'Epacoin',
            },
            'exceptions': {
                'exact': {
                    'ERR_INSUFICIENT_BALANCE': InsufficientFunds,
                    'ERR_LOW_VOLUME': BadRequest,
                },
                'broad': {
                    'Order is not open': InvalidOrder,
                    'Invalid Account / Api KEY / Api Secret': AuthenticationError, // also happens when an invalid nonce is used
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                },
            },
            'options': {
                'parseOrderStatus': true,
                'symbolSeparator': '_',
            },
        });
        // undocumented api calls
        // https://bleutrade.com/api/v3/public/tradingview/symbols?symbol=ETH_BTC
        // https://bleutrade.com/api/v3/public/tradingview/config
        // https://bleutrade.com/api/v3/public/tradingview/time
        // https://bleutrade.com/api/v3/private/getcloseorders?market=ETH_BTC
        // https://bleutrade.com/config contains the fees
    }

    async fetchCurrencies (params = {}) {
        const response = await this.v3PublicGetGetassets (params);
        const items = response['result'];
        const result = {};
        for (let i = 0; i < items.length; i++) {
            //   { Asset: 'USDT',
            //     AssetLong: 'Tether',
            //     MinConfirmation: 4,
            //     WithdrawTxFee: 1,
            //     WithdrawTxFeePercent: 0,
            //     SystemProtocol: 'ETHERC20',
            //     IsActive: true,
            //     InfoMessage: '',
            //     MaintenanceMode: false,
            //     MaintenanceMessage: '',
            //     FormatPrefix: '',
            //     FormatSufix: '',
            //     DecimalSeparator: '.',
            //     ThousandSeparator: ',',
            //     DecimalPlaces: 8,
            //     Currency: 'USDT',
            //     CurrencyLong: 'Tether',
            //     CoinType: 'ETHERC20' }
            const item = items[i];
            const id = this.safeString (item, 'Asset');
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': this.safeString (item, 'AssetLong'),
                'active': this.safeValue (item, 'IsActive') && !this.safeValue (item, 'MaintenanceMode'),
                'fee': this.safeFloat (item, 'WithdrawTxFee'),
                'precision': this.safeFloat (item, 'DecimalPlaces'),
                'info': item,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        // https://github.com/ccxt/ccxt/issues/5668
        const response = await this.v3PublicGetGetmarkets (params);
        const result = [];
        const markets = this.safeValue (response, 'result');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            //   { MarketName: 'LTC_USDT',
            //     MarketAsset: 'LTC',
            //     BaseAsset: 'USDT',
            //     MarketAssetLong: 'Litecoin',
            //     BaseAssetLong: 'Tether',
            //     IsActive: true,
            //     MinTradeSize: 0.0001,
            //     InfoMessage: '',
            //     MarketCurrency: 'LTC',
            //     BaseCurrency: 'USDT',
            //     MarketCurrencyLong: 'Litecoin',
            //     BaseCurrencyLong: 'Tether' }
            const id = this.safeString (market, 'MarketName');
            const baseId = this.safeString (market, 'MarketCurrency');
            const quoteId = this.safeString (market, 'BaseCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': 8,
                'price': 8,
            };
            const active = this.safeValue (market, 'IsActive', false);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
                'precision': precision,
                'maker': this.fees['trading']['maker'],
                'taker': this.fees['trading']['taker'],
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'MinTradeSize'),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'type': 'ALL',
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 50
        }
        const response = await this.v3PublicGetGetorderbook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'result');
        if (!orderbook) {
            throw new ExchangeError (this.id + ' no orderbook data in ' + this.json (response));
        }
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.v3PublicGetGetmarketsummary (this.extend (request, params));
        const ticker = response['result'][0];
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.v3PublicGetGetmarketsummaries (params);
        const result = this.safeValue (response, 'result');
        const tickers = [];
        for (let i = 0; i < result.length; i++) {
            const ticker = this.parseTicker (result[i]);
            tickers.push (ticker);
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        //   { TimeStamp: '2020-01-14 14:32:28',
        //     MarketName: 'LTC_USDT',
        //     MarketAsset: 'LTC',
        //     BaseAsset: 'USDT',
        //     MarketAssetName: 'Litecoin',
        //     BaseAssetName: 'Tether',
        //     PrevDay: 49.2867503,
        //     High: 56.78622664,
        //     Low: 49.27384025,
        //     Last: 53.94,
        //     Average: 51.37509368,
        //     Volume: 1.51282404,
        //     BaseVolume: 77.72147677,
        //     Bid: 53.62070218,
        //     Ask: 53.94,
        //     IsActive: 'true',
        //     InfoMessage: '',
        //     MarketCurrency: 'Litecoin',
        //     BaseCurrency: 'Tether' }
        const timestamp = this.parse8601 (this.safeString (ticker, 'TimeStamp'));
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'MarketName');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const previous = this.safeFloat (ticker, 'PrevDay');
        const last = this.safeFloat (ticker, 'Last');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined) {
            if (previous !== undefined) {
                change = last - previous;
                if (previous > 0) {
                    percentage = (change / previous) * 100;
                }
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'High'),
            'low': this.safeFloat (ticker, 'Low'),
            'bid': this.safeFloat (ticker, 'Bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'Ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': previous,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'Volume'),
            'quoteVolume': this.safeFloat (ticker, 'BaseVolume'),
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        const timestamp = this.parse8601 (ohlcv['TimeStamp'] + '+00:00');
        return [
            timestamp,
            this.safeFloat (ohlcv, 'Open'),
            this.safeFloat (ohlcv, 'High'),
            this.safeFloat (ohlcv, 'Low'),
            this.safeFloat (ohlcv, 'Close'),
            this.safeFloat (ohlcv, 'Volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '15m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'period': this.timeframes[timeframe],
            'market': market['id'],
            'count': limit,
        };
        const response = await this.v3PublicGetGetcandles (this.extend (request, params));
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            // todo: STOP-LIMIT and AMI order types are supported
            throw new InvalidOrder (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const request = {
            'rate': this.priceToPrecision (symbol, price),
            'quantity': this.amountToPrecision (symbol, amount),
            'tradeType': (side === 'buy') ? '1' : '0',
            'market': this.marketId (symbol),
        };
        let response = undefined;
        if (side === 'buy') {
            response = await this.v3PrivatePostBuylimit (this.extend (request, params));
        } else {
            response = await this.v3PrivatePostSelllimit (this.extend (request, params));
        }
        //   { success:  true,
        //     message: "",
        //     result: "161105236" },
        return {
            'info': response,
            'id': this.safeString (response, 'result'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderid': id,
        };
        const response = await this.v3PrivatePostOrdercancel (this.extend (request, params));
        // { success: true, message: '', result: '' }
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.v3PrivatePostGetopenorders (this.extend (request, params));
        const items = this.safeValue (response, 'result', []);
        return this.parseOrders (items, market, since, limit);
    }

    parseSymbol (id) {
        let [ base, quote ] = id.split (this.options['symbolSeparator']);
        base = this.safeCurrencyCode (base);
        quote = this.safeCurrencyCode (quote);
        return base + '/' + quote;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.v3PrivatePostGetbalances (params);
        const result = { 'info': response };
        const items = response['result'];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const currencyId = this.safeString (item, 'Asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (item, 'Available');
            account['total'] = this.safeFloat (item, 'Balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.v3PrivatePostGetcloseorders (this.extend (request, params));
        const orders = this.safeValue (response, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchTransactionsWithMethod (method, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this[method] (params);
        const transactions = this.safeValue (response, 'result', []);
        return this.parseTransactions (transactions, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsWithMethod ('v3PrivatePostGetdeposithistory', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsWithMethod ('v3PrivatePostGetwithdrawhistory', code, since, limit, params);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.v3PrivatePostGetdepositaddress (this.extend (request, params));
        //   { success: true,
        //     message: '',
        //     result:
        //     { Asset: 'ETH',
        //         AssetName: 'Ethereum',
        //         DepositAddress: '0x748c5c8jhksjdfhd507d3aa9',
        //         Currency: 'ETH',
        //         CurrencyName: 'Ethereum' } }
        const item = response['result'];
        const address = this.safeString (item, 'DepositAddress');
        return {
            'currency': code,
            'address': this.checkAddress (address),
            // 'tag': tag,
            'info': item,
        };
    }

    parseLedgerEntryType (type) {
        // deposits don't seem to appear in here
        const types = {
            'TRADE': 'trade',
            'WITHDRAW': 'transaction',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        // trade (both sides)
        //
        //     {
        //         ID: 109660527,
        //         TimeStamp: '2018-11-14 15:12:57.140776',
        //         Asset: 'ETH',
        //         AssetName: 'Ethereum',
        //         Amount: 0.01,
        //         Type: 'TRADE',
        //         Description: 'Trade +, order id 133111123',
        //         Comments: '',
        //         CoinSymbol: 'ETH',
        //         CoinName: 'Ethereum'
        //     }
        //
        //     {
        //         ID: 109660526,
        //         TimeStamp: '2018-11-14 15:12:57.140776',
        //         Asset: 'BTC',
        //         AssetName: 'Bitcoin',
        //         Amount: -0.00031776,
        //         Type: 'TRADE',
        //         Description: 'Trade -, order id 133111123, fee -0.00000079',
        //         Comments: '',
        //         CoinSymbol: 'BTC',
        //         CoinName: 'Bitcoin'
        //     }
        //
        // withdrawal
        //
        //     {
        //         ID: 104672316,
        //         TimeStamp: '2018-05-03 08:18:19.031831',
        //         Asset: 'DOGE',
        //         AssetName: 'Dogecoin',
        //         Amount: -61893.87864686,
        //         Type: 'WITHDRAW',
        //         Description: 'Withdraw: 61883.87864686 to address DD8tgehNNyYB2iqVazi2W1paaztgcWXtF6; fee 10.00000000',
        //         Comments: '',
        //         CoinSymbol: 'DOGE',
        //         CoinName: 'Dogecoin'
        //     }
        //
        const code = this.safeCurrencyCode (this.safeString (item, 'CoinSymbol'), currency);
        const description = this.safeString (item, 'Description');
        const type = this.parseLedgerEntryType (this.safeString (item, 'Type'));
        let referenceId = undefined;
        let fee = undefined;
        const delimiter = (type === 'trade') ? ', ' : '; ';
        const parts = description.split (delimiter);
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (part.indexOf ('fee') === 0) {
                part = part.replace ('fee ', '');
                let feeCost = parseFloat (part);
                if (feeCost < 0) {
                    feeCost = -feeCost;
                }
                fee = {
                    'cost': feeCost,
                    'currency': code,
                };
            } else if (part.indexOf ('order id') === 0) {
                referenceId = part.replace ('order id ', '');
            }
            //
            // does not belong to Ledger, related to parseTransaction
            //
            //     if (part.indexOf ('Withdraw') === 0) {
            //         const details = part.split (' to address ');
            //         if (details.length > 1) {
            //             address = details[1];
            //     }
            //
        }
        const timestamp = this.parse8601 (this.safeString (item, 'TimeStamp'));
        let amount = this.safeFloat (item, 'Amount');
        let direction = undefined;
        if (amount !== undefined) {
            direction = 'in';
            if (amount < 0) {
                direction = 'out';
                amount = -amount;
            }
        }
        const id = this.safeString (item, 'ID');
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': undefined,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': 'ok',
            'fee': fee,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // only seems to return 100 items and there is no documented way to change page size or offset
        const request = {
        };
        const response = await this.v3PrivatePostGetmytransactions (this.extend (request, params));
        const items = response['result'];
        return this.parseLedger (items, code, since, limit);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchClosedOrders
        //
        //   { OrderID: 89742658,
        //     Exchange: 'DOGE_BTC',
        //     Type: 'BUY',
        //     Quantity: 10000,
        //     QuantityRemaining: 0,
        //     QuantityBaseTraded: 0,
        //     Price: 6.6e-7,
        //     Status: 'OK',
        //     Created: '2018-02-16 08:55:36',
        //     Comments: '' }
        //
        //  fetchOpenOrders
        //
        //   { OrderID: 161105302,
        //     Exchange: 'ETH_BTC',
        //     Type: 'SELL',
        //     Quantity: 0.4,
        //     QuantityRemaining: 0.4,
        //     QuantityBaseTraded: 0,
        //     Price: 0.04,
        //     Status: 'OPEN',
        //     Created: '2020-01-22 09:21:27',
        //     Comments: { String: '', Valid: true }
        const side = this.safeString (order, 'Type').toLowerCase ();
        const status = this.parseOrderStatus (this.safeString (order, 'Status'));
        let symbol = undefined;
        const marketId = this.safeString (order, 'Exchange');
        if (marketId === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        } else {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        }
        let timestamp = undefined;
        if ('Created' in order) {
            timestamp = this.parse8601 (order['Created'] + '+00:00');
        }
        let price = this.safeFloat (order, 'Price');
        let cost = undefined;
        const amount = this.safeFloat (order, 'Quantity');
        const remaining = this.safeFloat (order, 'QuantityRemaining');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
        }
        if (!cost) {
            if (price && filled) {
                cost = price * filled;
            }
        }
        if (!price) {
            if (cost && filled) {
                price = cost / filled;
            }
        }
        const average = this.safeFloat (order, 'PricePerUnit');
        const id = this.safeString (order, 'OrderID');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'OK': 'closed',
            'OPEN': 'open',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //  deposit:
        //
        //   { ID: 118698752,
        //     Timestamp: '2020-01-21 11:16:09',
        //     Asset: 'ETH',
        //     Amount: 1,
        //     TransactionID: '',
        //     Status: 'CONFIRMED',
        //     Label: '0x748c5c8228d0c596f4d07f338blah',
        //     Symbol: 'ETH' }
        //
        // withdrawal:
        //
        //   { ID: 689281,
        //     Timestamp: '2019-07-05 13:14:43',
        //     Asset: 'BTC',
        //     Amount: -0.108959,
        //     TransactionID: 'da48d6901fslfjsdjflsdjfls852b87e362cad1',
        //     Status: 'CONFIRMED',
        //     Label: '0.1089590;35wztHPMgrebFvvblah;0.00100000',
        //     Symbol: 'BTC' }
        //
        const id = this.safeString (transaction, 'ID');
        let amount = this.safeFloat (transaction, 'Amount');
        let type = 'deposit';
        if (amount < 0) {
            amount = Math.abs (amount);
            type = 'withdrawal';
        }
        const currencyId = this.safeString (transaction, 'Asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const label = this.safeString (transaction, 'Label');
        const timestamp = this.parse8601 (this.safeString (transaction, 'Timestamp'));
        let txid = this.safeString (transaction, 'TransactionID');
        let address = undefined;
        let feeCost = undefined;
        const labelParts = label.split (';');
        if (labelParts.length === 3) {
            amount = parseFloat (labelParts[0]);
            address = labelParts[1];
            feeCost = parseFloat (labelParts[2]);
        } else {
            address = label;
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': code,
                'cost': feeCost,
            };
        }
        let status = 'ok';
        if (txid === 'CANCELED') {
            txid = undefined;
            status = 'canceled';
        }
        return {
            'info': transaction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'fee': fee,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/';
        if (api === 'v3Private') {
            this.checkRequiredCredentials ();
            const request = {
                'apikey': this.apiKey,
                'nonce': this.nonce (),
            };
            url += path + '?' + this.urlencode (this.extend (request, params));
            const signature = this.hmac (this.encode (url), this.encode (this.secret), 'sha512');
            headers = { 'apisign': signature };
        } else {
            url += path + '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //    examples...
        //    {"success":false,"message":"Erro: Order is not open.","result":""} <-- 'error' is spelt wrong
        //    {"success":false,"message":"Error: Very low volume.","result":"ERR_LOW_VOLUME"}
        //    {"success":false,"message":"Error: Insuficient Balance","result":"ERR_INSUFICIENT_BALANCE"}
        //
        if (body[0] === '{') {
            const success = this.safeValue (response, 'success');
            if (success === undefined) {
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
            }
            if (!success) {
                const feedback = this.id + ' ' + body;
                const errorCode = this.safeString (response, 'result');
                this.throwBroadlyMatchedException (this.exceptions['broad'], errorCode, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                const errorMessage = this.safeString (response, 'message');
                this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
