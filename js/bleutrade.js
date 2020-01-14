'use strict';

// ---------------------------------------------------------------------------

const bittrex = require ('./bittrex.js');
const { ExchangeError, InvalidOrder, AuthenticationError, InsufficientFunds, BadRequest } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bleutrade extends bittrex {
    describe () {
        const timeframes = {
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
        };
        const result = this.deepExtend (super.describe (), {
            'id': 'bleutrade',
            'name': 'Bleutrade',
            'countries': [ 'BR' ], // Brazil
            'rateLimit': 1000,
            'version': 'v2',
            'certified': false,
            'has': {
                'CORS': true,
                'fetchTickers': true,
                'fetchOrders': false,
                'fetchWithdrawals': true,
                'fetchClosedOrders': false,
                'fetchOrderTrades': false,
                'fetchLedger': true,
                'fetchDepositAddress': true,
            },
            'timeframes': timeframes,
            'hostname': 'bleutrade.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg',
                'api': {
                    'public': 'https://{hostname}/api/v2',
                    'market': 'https://{hostname}/api/v2',
                    'v3Private': 'https://{hostname}/api/v3/private',
                    'v3Public': 'https://{hostname}/api/v3/public',
                },
                'www': 'https://bleutrade.com',
                'doc': [
                    'https://app.swaggerhub.com/apis-docs/bleu/white-label/3.0.0',
                ],
                'fees': 'https://bleutrade.com/fees/',
            },
            'api': {
                'public': {
                    'get': [
                        'candles',
                        'markethistory',
                        'marketsummaries',
                        'marketsummary',
                        'orderbook',
                        'ticker',
                    ],
                },
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
                    'Invalid Account / Api KEY / Api Secret': AuthenticationError,
                },
            },
            'options': {
                // price precision by quote currency code
                'pricePrecisionByCode': {
                    'USD': 3,
                },
                'parseOrderStatus': true,
                'disableNonce': false,
                'symbolSeparator': '_',
            },
        });
        // bittrex inheritance override
        result['timeframes'] = timeframes;
        return result;
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
            const id = this.safeString (market, 'MarketName');
            const baseId = this.safeString (market, 'MarketCurrency');
            const quoteId = this.safeString (market, 'BaseCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            let pricePrecision = 8;
            if (quote in this.options['pricePrecisionByCode']) {
                pricePrecision = this.options['pricePrecisionByCode'][quote];
            }
            const precision = {
                'amount': 8,
                'price': pricePrecision,
            };
            // bittrex uses boolean values, bleutrade uses strings
            let active = this.safeValue (market, 'IsActive', false);
            if ((active !== 'false') && active) {
                active = true;
            } else {
                active = false;
            }
            const fee = 0.25 / 100;
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
                'maker': fee,
                'taker': fee,
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

    parseOrderStatus (status) {
        const statuses = {
            'OK': 'closed',
            'OPEN': 'open',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
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

    getOrderIdField () {
        return 'orderid';
    }

    parseSymbol (id) {
        let [ base, quote ] = id.split (this.options['symbolSeparator']);
        base = this.safeCurrencyCode (base);
        quote = this.safeCurrencyCode (quote);
        return base + '/' + quote;
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
        const response = await this.publicGetOrderbook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'result');
        if (!orderbook) {
            throw new ExchangeError (this.id + ' publicGetOrderbook() returneded no result ' + this.json (response));
        }
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    }

    async fetchTransactionsByType (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const method = (type === 'deposit') ? 'v3PrivatePostGetdeposithistory' : 'v3PrivatePostGetwithdrawhistory';
        const response = await this[method] (params);
        const result = this.parseTransactions (response['result']);
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposit', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdrawal', code, since, limit, params);
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
        const response = await this.publicGetCandles (this.extend (request, params));
        if ('result' in response) {
            if (response['result']) {
                return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
            }
        }
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (trade['TimeStamp'] + '+00:00');
        let side = undefined;
        if (trade['OrderType'] === 'BUY') {
            side = 'buy';
        } else if (trade['OrderType'] === 'SELL') {
            side = 'sell';
        }
        const id = this.safeString2 (trade, 'TradeID', 'ID');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        const price = this.safeFloat (trade, 'Price');
        const amount = this.safeFloat (trade, 'Quantity');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'order': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
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
                referenceId = part.replace ('order id', '');
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
        // fetchOrders
        //
        //     {
        //         OrderId: '107220258',
        //         Exchange: 'LTC_BTC',
        //         Type: 'SELL',
        //         Quantity: '2.13040000',
        //         QuantityRemaining: '0.00000000',
        //         Price: '0.01332672',
        //         Status: 'OK',
        //         Created: '2018-06-30 04:55:50',
        //         QuantityBaseTraded: '0.02839125',
        //         Comments: ''
        //     }
        //
        let side = this.safeString2 (order, 'OrderType', 'Type');
        const isBuyOrder = (side === 'LIMIT_BUY') || (side === 'BUY');
        const isSellOrder = (side === 'LIMIT_SELL') || (side === 'SELL');
        if (isBuyOrder) {
            side = 'buy';
        }
        if (isSellOrder) {
            side = 'sell';
        }
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (('Opened' in order) && order['Opened']) {
            status = 'open';
        }
        if (('Closed' in order) && order['Closed']) {
            status = 'closed';
        }
        if (('CancelInitiated' in order) && order['CancelInitiated']) {
            status = 'canceled';
        }
        if (('Status' in order) && this.options['parseOrderStatus']) {
            status = this.parseOrderStatus (this.safeString (order, 'Status'));
        }
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
        if ('Opened' in order) {
            timestamp = this.parse8601 (order['Opened'] + '+00:00');
        }
        if ('Created' in order) {
            timestamp = this.parse8601 (order['Created'] + '+00:00');
        }
        let lastTradeTimestamp = undefined;
        if (('TimeStamp' in order) && (order['TimeStamp'] !== undefined)) {
            lastTradeTimestamp = this.parse8601 (order['TimeStamp'] + '+00:00');
        }
        if (('Closed' in order) && (order['Closed'] !== undefined)) {
            lastTradeTimestamp = this.parse8601 (order['Closed'] + '+00:00');
        }
        if (timestamp === undefined) {
            timestamp = lastTradeTimestamp;
        }
        let fee = undefined;
        let commission = undefined;
        if ('Commission' in order) {
            commission = 'Commission';
        } else if ('CommissionPaid' in order) {
            commission = 'CommissionPaid';
        }
        if (commission) {
            fee = {
                'cost': this.safeFloat (order, commission),
            };
            if (market !== undefined) {
                fee['currency'] = market['quote'];
            } else if (symbol !== undefined) {
                const currencyIds = symbol.split ('/');
                const quoteCurrencyId = currencyIds[1];
                fee['currency'] = this.safeCurrencyCode (quoteCurrencyId);
            }
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
        const id = this.safeString2 (order, 'OrderUuid', 'OrderId');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
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
            'fee': fee,
        };
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //  deposit:
        //
        //     {
        //         Id: '96974373',
        //         Coin: 'DOGE',
        //         Amount: '12.05752192',
        //         TimeStamp: '2017-09-29 08:10:09',
        //         Label: 'DQqSjjhzCm3ozT4vAevMUHgv4vsi9LBkoE',
        //     }
        //
        // withdrawal:
        //
        //   { ID: 689281,
        //     Timestamp: '2019-07-05 13:14:43',
        //     Asset: 'BTC',
        //     Amount: -0.108959,
        //     TransactionID: 'da48d6901fslfjsdjflsdjfls852b87e362cad1',
        //     Status: 'CONFIRMED',
        //     Label: '0.1089590;35wztHPMgrebFvvlisuhfasuf;0.00100000',
        //     Symbol: 'BTC' }
        //
        //     {
        //         "Id": "95820181",
        //         "Coin": "BTC",
        //         "Amount": "-0.71300000",
        //         "TimeStamp": "2017-07-19 17:14:24",
        //         "Label": "0.71200000;PER9VM2txt4BTdfyWgvv3GziECRdVEPN63;0.00100000",
        //         "TransactionId": "CANCELED"
        //     }
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
        } else if (api === 'v3Public') {
            const request = {
            };
            url += path + '?' + this.urlencode (this.extend (request, params));
        } else {
            url += api + '/' + method.toLowerCase () + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
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
