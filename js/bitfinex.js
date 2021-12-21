'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported, RateLimitExceeded, AuthenticationError, PermissionDenied, ArgumentsRequired, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, InvalidNonce, BadSymbol } = require ('./base/errors');
const { SIGNIFICANT_DIGITS, DECIMAL_PLACES, TRUNCATE, ROUND } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitfinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex',
            'name': 'Bitfinex',
            'countries': [ 'VG' ],
            'version': 'v1',
            'rateLimit': 1500,
            'pro': true,
            // new metainfo interface
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': undefined,
                'createDepositAddress': true,
                'createOrder': true,
                'deposit': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchDeposits': undefined,
                'fetchFundingFees': true,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchWithdrawals': undefined,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': {
                    'v2': 'https://api-pub.bitfinex.com', // https://github.com/ccxt/ccxt/issues/5109
                    'public': 'https://api.bitfinex.com',
                    'private': 'https://api.bitfinex.com',
                },
                'www': 'https://www.bitfinex.com',
                'referral': 'https://www.bitfinex.com/?refcode=P61eYxFL',
                'doc': [
                    'https://docs.bitfinex.com/v1/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
            },
            'api': {
                // v2 symbol ids require a 't' prefix
                // just the public part of it (use bitfinex2 for everything else)
                'v2': {
                    'get': [
                        'platform/status',
                        'tickers',
                        'ticker/{symbol}',
                        'trades/{symbol}/hist',
                        'book/{symbol}/{precision}',
                        'book/{symbol}/P0',
                        'book/{symbol}/P1',
                        'book/{symbol}/P2',
                        'book/{symbol}/P3',
                        'book/{symbol}/R0',
                        'stats1/{key}:{size}:{symbol}:{side}/{section}',
                        'stats1/{key}:{size}:{symbol}/{section}',
                        'stats1/{key}:{size}:{symbol}:long/last',
                        'stats1/{key}:{size}:{symbol}:long/hist',
                        'stats1/{key}:{size}:{symbol}:short/last',
                        'stats1/{key}:{size}:{symbol}:short/hist',
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ],
                },
                'public': {
                    'get': [
                        'book/{symbol}',
                        // 'candles/{symbol}',
                        'lendbook/{currency}',
                        'lends/{currency}',
                        'pubticker/{symbol}',
                        'stats/{symbol}',
                        'symbols',
                        'symbols_details',
                        'tickers',
                        'trades/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'account_fees',
                        'account_infos',
                        'balances',
                        'basket_manage',
                        'credits',
                        'deposit/new',
                        'funding/close',
                        'history',
                        'history/movements',
                        'key_info',
                        'margin_infos',
                        'mytrades',
                        'mytrades_funding',
                        'offer/cancel',
                        'offer/new',
                        'offer/status',
                        'offers',
                        'offers/hist',
                        'order/cancel',
                        'order/cancel/all',
                        'order/cancel/multi',
                        'order/cancel/replace',
                        'order/new',
                        'order/new/multi',
                        'order/status',
                        'orders',
                        'orders/hist',
                        'position/claim',
                        'position/close',
                        'positions',
                        'summary',
                        'taken_funds',
                        'total_taken_funds',
                        'transfer',
                        'unused_taken_funds',
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber ('0'), this.parseNumber ('0.002')],
                            [this.parseNumber ('500000'), this.parseNumber ('0.002')],
                            [this.parseNumber ('1000000'), this.parseNumber ('0.002')],
                            [this.parseNumber ('2500000'), this.parseNumber ('0.002')],
                            [this.parseNumber ('5000000'), this.parseNumber ('0.002')],
                            [this.parseNumber ('7500000'), this.parseNumber ('0.002')],
                            [this.parseNumber ('10000000'), this.parseNumber ('0.0018')],
                            [this.parseNumber ('15000000'), this.parseNumber ('0.0016')],
                            [this.parseNumber ('20000000'), this.parseNumber ('0.0014')],
                            [this.parseNumber ('25000000'), this.parseNumber ('0.0012')],
                            [this.parseNumber ('30000000'), this.parseNumber ('0.001')],
                        ],
                        'maker': [
                            [this.parseNumber ('0'), this.parseNumber ('0.001')],
                            [this.parseNumber ('500000'), this.parseNumber ('0.0008')],
                            [this.parseNumber ('1000000'), this.parseNumber ('0.0006')],
                            [this.parseNumber ('2500000'), this.parseNumber ('0.0004')],
                            [this.parseNumber ('5000000'), this.parseNumber ('0.0002')],
                            [this.parseNumber ('7500000'), this.parseNumber ('0')],
                            [this.parseNumber ('10000000'), this.parseNumber ('0')],
                            [this.parseNumber ('15000000'), this.parseNumber ('0')],
                            [this.parseNumber ('20000000'), this.parseNumber ('0')],
                            [this.parseNumber ('25000000'), this.parseNumber ('0')],
                            [this.parseNumber ('30000000'), this.parseNumber ('0')],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false, // true for tier-based/progressive
                    'percentage': false, // fixed commission
                    // Actually deposit fees are free for larger deposits (> $1000 USD equivalent)
                    // these values below are deprecated, we should not hardcode fees and limits anymore
                    // to be reimplemented with bitfinex funding fees from their API or web endpoints
                    'deposit': {},
                    'withdraw': {},
                },
            },
            // todo rewrite for https://api-pub.bitfinex.com//v2/conf/pub:map:tx:method
            'commonCurrencies': {
                'ALG': 'ALGO', // https://github.com/ccxt/ccxt/issues/6034
                'AMP': 'AMPL',
                'ATO': 'ATOM', // https://github.com/ccxt/ccxt/issues/5118
                'BCHABC': 'XEC',
                'BCHN': 'BCH',
                'DAT': 'DATA',
                'DOG': 'MDOGE',
                'DSH': 'DASH',
                // https://github.com/ccxt/ccxt/issues/7399
                // https://coinmarketcap.com/currencies/pnetwork/
                // https://en.cryptonomist.ch/blog/eidoo/the-edo-to-pnt-upgrade-what-you-need-to-know-updated/
                'EDO': 'PNT',
                'EUS': 'EURS',
                'EUT': 'EURT',
                'IOT': 'IOTA',
                'IQX': 'IQ',
                'MNA': 'MANA',
                'ORS': 'ORS Group', // conflict with Origin Sport #3230
                'PAS': 'PASS',
                'QSH': 'QASH',
                'QTM': 'QTUM',
                'RBT': 'RBTC',
                'SNG': 'SNGLS',
                'STJ': 'STORJ',
                'TERRAUST': 'UST',
                'TSD': 'TUSD',
                'YGG': 'YEED', // conflict with Yield Guild Games
                'YYW': 'YOYOW',
                'UDC': 'USDC',
                'UST': 'USDT',
                'VSY': 'VSYS',
                'WAX': 'WAXP',
                'XCH': 'XCHF',
                'ZBT': 'ZB',
            },
            'exceptions': {
                'exact': {
                    'temporarily_unavailable': ExchangeNotAvailable, // Sorry, the service is temporarily unavailable. See https://www.bitfinex.com/ for more info.
                    'Order could not be cancelled.': OrderNotFound, // non-existent order
                    'No such order found.': OrderNotFound, // ?
                    'Order price must be positive.': InvalidOrder, // on price <= 0
                    'Could not find a key matching the given X-BFX-APIKEY.': AuthenticationError,
                    'Key price should be a decimal number, e.g. "123.456"': InvalidOrder, // on isNaN (price)
                    'Key amount should be a decimal number, e.g. "123.456"': InvalidOrder, // on isNaN (amount)
                    'ERR_RATE_LIMIT': RateLimitExceeded,
                    'Ratelimit': RateLimitExceeded,
                    'Nonce is too small.': InvalidNonce,
                    'No summary found.': ExchangeError, // fetchTradingFees (summary) endpoint can give this vague error message
                    'Cannot evaluate your available balance, please try again': ExchangeNotAvailable,
                    'Unknown symbol': BadSymbol,
                    'Cannot complete transfer. Exchange balance insufficient.': InsufficientFunds,
                    'Momentary balance check. Please wait few seconds and try the transfer again.': ExchangeError,
                },
                'broad': {
                    'Invalid X-BFX-SIGNATURE': AuthenticationError,
                    'This API key does not have permission': PermissionDenied, // authenticated but not authorized
                    'not enough exchange balance for ': InsufficientFunds, // when buying cost is greater than the available quote currency
                    'minimum size for ': InvalidOrder, // when amount below limits.amount.min
                    'Invalid order': InvalidOrder, // ?
                    'The available balance is only': InsufficientFunds, // {"status":"error","message":"Cannot withdraw 1.0027 ETH from your exchange wallet. The available balance is only 0.0 ETH. If you have limit orders, open positions, unused or active margin funding, this will decrease your available balance. To increase it, you can cancel limit orders or reduce/close your positions.","withdrawal_id":0,"fees":"0.0027"}
                },
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'options': {
                'currencyNames': {
                    'AGI': 'agi',
                    'AID': 'aid',
                    'AIO': 'aio',
                    'ANT': 'ant',
                    'AVT': 'aventus', // #1811
                    'BAT': 'bat',
                    // https://github.com/ccxt/ccxt/issues/5833
                    'BCH': 'bab', // undocumented
                    // 'BCH': 'bcash', // undocumented
                    'BCI': 'bci',
                    'BFT': 'bft',
                    'BSV': 'bsv',
                    'BTC': 'bitcoin',
                    'BTG': 'bgold',
                    'CFI': 'cfi',
                    'COMP': 'comp',
                    'DAI': 'dai',
                    'DADI': 'dad',
                    'DASH': 'dash',
                    'DATA': 'datacoin',
                    'DTH': 'dth',
                    'EDO': 'eidoo', // #1811
                    'ELF': 'elf',
                    'EOS': 'eos',
                    'ETC': 'ethereumc',
                    'ETH': 'ethereum',
                    'ETP': 'metaverse',
                    'FUN': 'fun',
                    'GNT': 'golem',
                    'IOST': 'ios',
                    'IOTA': 'iota',
                    // https://github.com/ccxt/ccxt/issues/5833
                    'LEO': 'let', // ETH chain
                    // 'LEO': 'les', // EOS chain
                    'LINK': 'link',
                    'LRC': 'lrc',
                    'LTC': 'litecoin',
                    'LYM': 'lym',
                    'MANA': 'mna',
                    'MIT': 'mit',
                    'MKR': 'mkr',
                    'MTN': 'mtn',
                    'NEO': 'neo',
                    'ODE': 'ode',
                    'OMG': 'omisego',
                    'OMNI': 'mastercoin',
                    'QASH': 'qash',
                    'QTUM': 'qtum', // #1811
                    'RCN': 'rcn',
                    'RDN': 'rdn',
                    'REP': 'rep',
                    'REQ': 'req',
                    'RLC': 'rlc',
                    'SAN': 'santiment',
                    'SNGLS': 'sng',
                    'SNT': 'status',
                    'SPANK': 'spk',
                    'STORJ': 'stj',
                    'TNB': 'tnb',
                    'TRX': 'trx',
                    'TUSD': 'tsd',
                    'USD': 'wire',
                    'USDC': 'udc', // https://github.com/ccxt/ccxt/issues/5833
                    'UTK': 'utk',
                    'USDT': 'tetheruso', // Tether on Omni
                    // 'USDT': 'tetheruse', // Tether on ERC20
                    // 'USDT': 'tetherusl', // Tether on Liquid
                    // 'USDT': 'tetherusx', // Tether on Tron
                    // 'USDT': 'tetheruss', // Tether on EOS
                    'VEE': 'vee',
                    'WAX': 'wax',
                    'XLM': 'xlm',
                    'XMR': 'monero',
                    'XRP': 'ripple',
                    'XVG': 'xvg',
                    'YOYOW': 'yoyow',
                    'ZEC': 'zcash',
                    'ZRX': 'zrx',
                    'XTZ': 'xtz',
                },
                'orderTypes': {
                    'limit': 'exchange limit',
                    'market': 'exchange market',
                },
                'accountsByType': {
                    'spot': 'exchange',
                    'margin': 'trading',
                    'funding': 'deposit',
                    'exchange': 'exchange',
                    'trading': 'trading',
                    'deposit': 'deposit',
                    'derivatives': 'trading',
                },
            },
        });
    }

    async fetchFundingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccountFees (params);
        const fees = response['withdraw'];
        const withdraw = {};
        const ids = Object.keys (fees);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const code = this.safeCurrencyCode (id);
            withdraw[code] = this.safeNumber (fees, id);
        }
        return {
            'info': response,
            'withdraw': withdraw,
            'deposit': withdraw,  // only for deposits of less than $1000
        };
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostSummary (params);
        //
        //     {
        //         time: '2019-02-20T15:50:19.152000Z',
        //         trade_vol_30d: [
        //             {
        //                 curr: 'Total (USD)',
        //                 vol: 0,
        //                 vol_maker: 0,
        //                 vol_BFX: 0,
        //                 vol_BFX_maker: 0,
        //                 vol_ETHFX: 0,
        //                 vol_ETHFX_maker: 0
        //             }
        //         ],
        //         fees_funding_30d: {},
        //         fees_funding_total_30d: 0,
        //         fees_trading_30d: {},
        //         fees_trading_total_30d: 0,
        //         maker_fee: 0.001,
        //         taker_fee: 0.002
        //     }
        //
        return {
            'info': response,
            'maker': this.safeNumber (response, 'maker_fee'),
            'taker': this.safeNumber (response, 'taker_fee'),
        };
    }

    async fetchMarkets (params = {}) {
        const ids = await this.publicGetSymbols ();
        //
        //     [ "btcusd", "ltcusd", "ltcbtc" ]
        //
        const details = await this.publicGetSymbolsDetails ();
        //
        //     [
        //         {
        //             "pair":"btcusd",
        //             "price_precision":5,
        //             "initial_margin":"10.0",
        //             "minimum_margin":"5.0",
        //             "maximum_order_size":"2000.0",
        //             "minimum_order_size":"0.0002",
        //             "expiration":"NA",
        //             "margin":true
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < details.length; i++) {
            const market = details[i];
            let id = this.safeString (market, 'pair');
            if (!this.inArray (id, ids)) {
                continue;
            }
            id = id.toUpperCase ();
            let baseId = undefined;
            let quoteId = undefined;
            if (id.indexOf (':') >= 0) {
                const parts = id.split (':');
                baseId = parts[0];
                quoteId = parts[1];
            } else {
                baseId = id.slice (0, 3);
                quoteId = id.slice (3, 6);
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'price_precision'),
                // https://docs.bitfinex.com/docs/introduction#amount-precision
                // The amount field allows up to 8 decimals.
                // Anything exceeding this will be rounded to the 8th decimal.
                'amount': 8,
            };
            const minAmountString = this.safeString (market, 'minimum_order_size');
            const maxAmountString = this.safeString (market, 'maximum_order_size');
            const limits = {
                'amount': {
                    'min': this.parseNumber (minAmountString),
                    'max': this.parseNumber (maxAmountString),
                },
                'price': {
                    'min': this.parseNumber ('1e-8'),
                    'max': undefined,
                },
            };
            limits['cost'] = {
                'min': undefined,
                'max': undefined,
            };
            const margin = this.safeValue (market, 'margin');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'type': 'spot',
                'spot': true,
                'margin': margin,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    amountToPrecision (symbol, amount) {
        // https://docs.bitfinex.com/docs/introduction#amount-precision
        // The amount field allows up to 8 decimals.
        // Anything exceeding this will be rounded to the 8th decimal.
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    priceToPrecision (symbol, price) {
        price = this.decimalToPrecision (price, ROUND, this.markets[symbol]['precision']['price'], this.precisionMode);
        // https://docs.bitfinex.com/docs/introduction#price-precision
        // The precision level of all trading prices is based on significant figures.
        // All pairs on Bitfinex use up to 5 significant digits and up to 8 decimals (e.g. 1.2345, 123.45, 1234.5, 0.00012345).
        // Prices submit with a precision larger than 5 will be cut by the API.
        return this.decimalToPrecision (price, TRUNCATE, 8, DECIMAL_PLACES);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const requestedType = this.safeString (params, 'type', 'exchange');
        const accountType = this.safeString (accountsByType, requestedType);
        if (accountType === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ExchangeError (this.id + ' fetchBalance type parameter must be one of ' + keys.join (', '));
        }
        const query = this.omit (params, 'type');
        const response = await this.privatePostBalances (query);
        //    [ { type: 'deposit',
        //        currency: 'btc',
        //        amount: '0.00116721',
        //        available: '0.00116721' },
        //      { type: 'exchange',
        //        currency: 'ust',
        //        amount: '0.0000002',
        //        available: '0.0000002' },
        //      { type: 'trading',
        //        currency: 'btc',
        //        amount: '0.0005',
        //        available: '0.0005' } ],
        const result = { 'info': response };
        const isDerivative = requestedType === 'derivatives';
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const type = this.safeString (balance, 'type');
            const currencyId = this.safeStringLower (balance, 'currency', '');
            const start = currencyId.length - 2;
            const isDerivativeCode = currencyId.slice (start) === 'f0';
            // this will only filter the derivative codes if the requestedType is 'derivatives'
            const derivativeCondition = (!isDerivative || isDerivativeCode);
            if ((accountType === type) && derivativeCondition) {
                const code = this.safeCurrencyCode (currencyId);
                // bitfinex had BCH previously, now it's BAB, but the old
                // BCH symbol is kept for backward-compatibility
                // we need a workaround here so that the old BCH balance
                // would not override the new BAB balance (BAB is unified to BCH)
                // https://github.com/ccxt/ccxt/issues/4989
                if (!(code in result)) {
                    const account = this.account ();
                    account['free'] = this.safeString (balance, 'available');
                    account['total'] = this.safeString (balance, 'amount');
                    result[code] = account;
                }
            }
        }
        return this.parseBalance (result);
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        // transferring between derivatives wallet and regular wallet is not documented in their API
        // however we support it in CCXT (from just looking at web inspector)
        await this.loadMarkets ();
        const accountsByType = this.safeValue (this.options, 'accountsByType', {});
        const fromId = this.safeString (accountsByType, fromAccount);
        if (fromId === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ExchangeError (this.id + ' transfer fromAccount must be one of ' + keys.join (', '));
        }
        const toId = this.safeString (accountsByType, toAccount);
        if (toId === undefined) {
            const keys = Object.keys (accountsByType);
            throw new ExchangeError (this.id + ' transfer toAccount must be one of ' + keys.join (', '));
        }
        const currency = this.currency (code);
        const fromCurrencyId = this.convertDerivativesId (currency['id'], fromAccount);
        const toCurrencyId = this.convertDerivativesId (currency['id'], toAccount);
        const requestedAmount = this.currencyToPrecision (code, amount);
        const request = {
            'amount': requestedAmount,
            'currency': fromCurrencyId,
            'currency_to': toCurrencyId,
            'walletfrom': fromId,
            'walletto': toId,
        };
        const response = await this.privatePostTransfer (this.extend (request, params));
        // [
        //   {
        //     status: 'success',
        //     message: '0.0001 Bitcoin transfered from Margin to Exchange'
        //   }
        // ]
        const result = this.safeValue (response, 0);
        const status = this.safeString (result, 'status');
        const message = this.safeString (result, 'message');
        if (message === undefined) {
            throw new ExchangeError (this.id + ' transfer failed');
        }
        // [{"status":"error","message":"Momentary balance check. Please wait few seconds and try the transfer again."}]
        if (status === 'error') {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, this.id + ' ' + message);
            throw new ExchangeError (this.id + ' ' + message);
        }
        return {
            'info': response,
            'status': status,
            'amount': requestedAmount,
            'code': code,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'timestamp': undefined,
            'datetime': undefined,
        };
    }

    convertDerivativesId (currencyId, type) {
        const start = currencyId.length - 2;
        const isDerivativeCode = currencyId.slice (start) === 'F0';
        if ((type !== 'derivatives' && type !== 'trading' && type !== 'margin') && isDerivativeCode) {
            currencyId = currencyId.slice (0, start);
        } else if (type === 'derivatives' && !isDerivativeCode) {
            currencyId = currencyId + 'F0';
        }
        return currencyId;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit_bids'] = limit;
            request['limit_asks'] = limit;
        }
        const response = await this.publicGetBookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, symbol, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetPubtickerSymbol (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeNumber (ticker, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        timestamp = parseInt (timestamp);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else if ('pair' in ticker) {
            const marketId = this.safeString (ticker, 'pair');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                    symbol = market['symbol'];
                } else {
                    const baseId = marketId.slice (0, 3);
                    const quoteId = marketId.slice (3, 6);
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                }
            }
        }
        const last = this.safeNumber (ticker, 'last_price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeNumber (ticker, 'mid'),
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public) v1
        //
        //     {
        //          "timestamp":1637258380,
        //          "tid":894452833,
        //          "price":"0.99941",
        //          "amount":"261.38",
        //          "exchange":"bitfinex",
        //          "type":"sell"
        //     }
        //
        //     {    "timestamp":1637258238,
        //          "tid":894452800,
        //          "price":"0.99958",
        //          "amount":"261.90514",
        //          "exchange":"bitfinex",
        //          "type":"buy"
        //     }
        //
        // fetchMyTrades (private) v1
        //
        //     {
        //          "price":"0.99941",
        //          "amount":"261.38",
        //          "timestamp":"1637258380.0",
        //          "type":"Sell",
        //          "fee_currency":"UST",
        //          "fee_amount":"-0.52245157",
        //          "tid":894452833,
        //          "order_id":78819731373
        //     }
        //
        //     {
        //         "price":"0.99958",
        //         "amount":"261.90514",
        //         "timestamp":"1637258238.0",
        //         "type":"Buy",
        //         "fee_currency":"UDC",
        //         "fee_amount":"-0.52381028",
        //         "tid":894452800,
        //         "order_id":78819504838
        //     }
        //
        const id = this.safeString (trade, 'tid');
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const type = undefined;
        const side = this.safeStringLower (trade, 'type');
        const orderId = this.safeString (trade, 'order_id');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        let fee = undefined;
        if ('fee_amount' in trade) {
            const feeCostString = Precise.stringNeg (this.safeString (trade, 'fee_amount'));
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'order': orderId,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'limit_trades': limit,
        };
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.publicGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit_trades'] = limit;
        }
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.privatePostMytrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const postOnly = this.safeValue (params, 'postOnly', false);
        params = this.omit (params, [ 'postOnly' ]);
        const request = {
            'symbol': this.marketId (symbol),
            'side': side,
            'amount': this.amountToPrecision (symbol, amount),
            'type': this.safeString (this.options['orderTypes'], type, type),
            'ocoorder': false,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        };
        if (type === 'market') {
            request['price'] = this.nonce ().toString ();
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (postOnly) {
            request['is_postonly'] = true;
        }
        const response = await this.privatePostOrderNew (this.extend (request, params));
        return this.parseOrder (response);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const order = {
            'order_id': parseInt (id),
        };
        if (price !== undefined) {
            order['price'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined) {
            order['amount'] = this.numberToString (amount);
        }
        if (symbol !== undefined) {
            order['symbol'] = this.marketId (symbol);
        }
        if (side !== undefined) {
            order['side'] = side;
        }
        if (type !== undefined) {
            order['type'] = this.safeString (this.options['orderTypes'], type, type);
        }
        const response = await this.privatePostOrderCancelReplace (this.extend (order, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        return await this.privatePostOrderCancelAll (params);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //           id: 57334010955,
        //           cid: 1611584840966,
        //           cid_date: null,
        //           gid: null,
        //           symbol: 'ltcbtc',
        //           exchange: null,
        //           price: '0.0042125',
        //           avg_execution_price: '0.0042097',
        //           side: 'sell',
        //           type: 'exchange market',
        //           timestamp: '1611584841.0',
        //           is_live: false,
        //           is_cancelled: false,
        //           is_hidden: 0,
        //           oco_order: 0,
        //           was_forced: false,
        //           original_amount: '0.205176',
        //           remaining_amount: '0.0',
        //           executed_amount: '0.205176',
        //           src: 'web'
        //     }
        //
        const side = this.safeString (order, 'side');
        const open = this.safeValue (order, 'is_live');
        const canceled = this.safeValue (order, 'is_cancelled');
        let status = undefined;
        if (open) {
            status = 'open';
        } else if (canceled) {
            status = 'canceled';
        } else {
            status = 'closed';
        }
        const marketId = this.safeStringUpper (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let orderType = this.safeString (order, 'type', '');
        const exchange = orderType.indexOf ('exchange ') >= 0;
        if (exchange) {
            const parts = order['type'].split (' ');
            orderType = parts[1];
        }
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const id = this.safeString (order, 'id');
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'average': this.safeString (order, 'avg_execution_price'),
            'amount': this.safeString (order, 'original_amount'),
            'remaining': this.safeString (order, 'remaining_amount'),
            'filled': this.safeString (order, 'executed_amount'),
            'status': status,
            'fee': undefined,
            'cost': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            if (!(symbol in this.markets)) {
                throw new ExchangeError (this.id + ' has no symbol ' + symbol);
            }
        }
        const response = await this.privatePostOrders (params);
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrdersHist (this.extend (request, params));
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        orders = this.filterByArray (orders, 'status', [ 'closed', 'canceled' ], false);
        return orders;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1457539800000,
        //         0.02594,
        //         0.02594,
        //         0.02594,
        //         0.02594,
        //         0.1
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        const market = this.market (symbol);
        const v2id = 't' + market['id'];
        const request = {
            'symbol': v2id,
            'timeframe': this.timeframes[timeframe],
            'sort': 1,
            'limit': limit,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.v2GetCandlesTradeTimeframeSymbolHist (this.extend (request, params));
        //
        //     [
        //         [1457539800000,0.02594,0.02594,0.02594,0.02594,0.1],
        //         [1457547300000,0.02577,0.02577,0.02577,0.02577,0.01],
        //         [1457550240000,0.0255,0.0253,0.0255,0.0252,3.2640000000000002],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    getCurrencyName (code) {
        // todo rewrite for https://api-pub.bitfinex.com//v2/conf/pub:map:tx:method
        if (code in this.options['currencyNames']) {
            return this.options['currencyNames'][code];
        }
        throw new NotSupported (this.id + ' ' + code + ' not supported for withdrawal');
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const request = {
            'renew': 1,
        };
        const response = await this.fetchDepositAddress (code, this.extend (request, params));
        return response;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        // todo rewrite for https://api-pub.bitfinex.com//v2/conf/pub:map:tx:method
        const name = this.getCurrencyName (code);
        const request = {
            'method': name,
            'wallet_name': 'exchange',
            'renew': 0, // a value of 1 will generate a new address
        };
        const response = await this.privatePostDepositNew (this.extend (request, params));
        let address = this.safeValue (response, 'address');
        let tag = undefined;
        if ('address_pool' in response) {
            tag = address;
            address = response['address_pool'];
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currencyId = this.safeString (params, 'currency');
        const query = this.omit (params, 'currency');
        let currency = undefined;
        if (currencyId === undefined) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency `code` argument or a `currency` parameter');
            } else {
                currency = this.currency (code);
                currencyId = currency['id'];
            }
        }
        query['currency'] = currencyId;
        if (since !== undefined) {
            query['since'] = parseInt (since / 1000);
        }
        const response = await this.privatePostHistoryMovements (this.extend (query, params));
        //
        //     [
        //         {
        //             "id":581183,
        //             "txid": 123456,
        //             "currency":"BTC",
        //             "method":"BITCOIN",
        //             "type":"WITHDRAWAL",
        //             "amount":".01",
        //             "description":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ, offchain transfer ",
        //             "address":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ",
        //             "status":"COMPLETED",
        //             "timestamp":"1443833327.0",
        //             "timestamp_created": "1443833327.1",
        //             "fee": 0.1,
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // crypto
        //
        //     {
        //         "id": 12042490,
        //         "fee": "-0.02",
        //         "txid": "EA5B5A66000B66855865EFF2494D7C8D1921FCBE996482157EBD749F2C85E13D",
        //         "type": "DEPOSIT",
        //         "amount": "2099.849999",
        //         "method": "RIPPLE",
        //         "status": "COMPLETED",
        //         "address": "2505189261",
        //         "currency": "XRP",
        //         "timestamp": "1551730524.0",
        //         "description": "EA5B5A66000B66855865EFF2494D7C8D1921FCBE996482157EBD749F2C85E13D",
        //         "timestamp_created": "1551730523.0"
        //     }
        //
        // fiat
        //
        //     {
        //         "id": 12725095,
        //         "fee": "-60.0",
        //         "txid": null,
        //         "type": "WITHDRAWAL",
        //         "amount": "9943.0",
        //         "method": "WIRE",
        //         "status": "SENDING",
        //         "address": null,
        //         "currency": "EUR",
        //         "timestamp": "1561802484.0",
        //         "description": "Name: bob, AccountAddress: some address, Account: someaccountno, Bank: bank address, SWIFT: foo, Country: UK, Details of Payment: withdrawal name, Intermediary Bank Name: , Intermediary Bank Address: , Intermediary Bank City: , Intermediary Bank Country: , Intermediary Bank Account: , Intermediary Bank SWIFT: , Fee: -60.0",
        //         "timestamp_created": "1561716066.0"
        //     }
        //
        const timestamp = this.safeTimestamp (transaction, 'timestamp_created');
        const updated = this.safeTimestamp (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const type = this.safeStringLower (transaction, 'type'); // DEPOSIT or WITHDRAWAL
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'address'), // todo: this is actually the tag for XRP transfers (the address is missing)
            'tag': undefined, // refix it properly for the tag from description
            'type': type,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': {
                'currency': code,
                'cost': feeCost,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'SENDING': 'pending',
            'CANCELED': 'canceled',
            'ZEROCONFIRMED': 'failed', // ZEROCONFIRMED happens e.g. in a double spend attempt (I had one in my movements!)
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        // todo rewrite for https://api-pub.bitfinex.com//v2/conf/pub:map:tx:method
        const name = this.getCurrencyName (code);
        const request = {
            'withdraw_type': name,
            'walletselected': 'exchange',
            'amount': this.numberToString (amount),
            'address': address,
        };
        if (tag !== undefined) {
            request['payment_id'] = tag;
        }
        const responses = await this.privatePostWithdraw (this.extend (request, params));
        const response = responses[0];
        const id = this.safeString (response, 'withdrawal_id');
        const message = this.safeString (response, 'message');
        const errorMessage = this.findBroadlyMatchedKey (this.exceptions['broad'], message);
        if (id === 0) {
            if (errorMessage !== undefined) {
                const ExceptionClass = this.exceptions['broad'][errorMessage];
                throw new ExceptionClass (this.id + ' ' + message);
            }
            throw new ExchangeError (this.id + ' withdraw returned an id of zero: ' + this.json (response));
        }
        return {
            'info': response,
            'id': id,
        };
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostPositions (params);
        //
        //     [
        //         {
        //             "id":943715,
        //             "symbol":"btcusd",
        //             "status":"ACTIVE",
        //             "base":"246.94",
        //             "amount":"1.0",
        //             "timestamp":"1444141857.0",
        //             "swap":"0.0",
        //             "pl":"-2.22042"
        //         }
        //     ]
        //
        // todo unify parsePosition/parsePositions
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        if (api === 'v2') {
            request = '/' + api + request;
        } else {
            request = '/' + this.version + request;
        }
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + request;
        if ((api === 'public') || (path.indexOf ('/hist') >= 0)) {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
                request += suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            query = this.extend ({
                'nonce': nonce.toString (),
                'request': request,
            }, query);
            body = this.json (query);
            const payload = this.stringToBase64 (body);
            const secret = this.encode (this.secret);
            const signature = this.hmac (payload, secret, 'sha384');
            headers = {
                'X-BFX-APIKEY': this.apiKey,
                'X-BFX-PAYLOAD': this.decode (payload),
                'X-BFX-SIGNATURE': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            if (body[0] === '{') {
                const feedback = this.id + ' ' + body;
                const message = this.safeString2 (response, 'message', 'error');
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
