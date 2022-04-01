'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, BadRequest, ExchangeNotAvailable, ArgumentsRequired, PermissionDenied, AuthenticationError, ExchangeError, OrderNotFound, DDoSProtection, InvalidNonce, InsufficientFunds, CancelPending, InvalidOrder, InvalidAddress, RateLimitExceeded, OnMaintenance } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class kraken extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': [ 'US' ],
            'version': '0',
            'rateLimit': 3000,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLedgerEntry': true,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': 'emulated',
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchWithdrawals': true,
                'setLeverage': false,
                'setMarginMode': false, // Kraken only supports cross margin
                'withdraw': true,
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
                    'zendesk': 'https://kraken.zendesk.com/api/v2/help_center/en-us/articles', // use the public zendesk api to receive article bodies and bypass new anti-spam protections
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
                            [ 0, 0.0026 ],
                            [ 50000, 0.0024 ],
                            [ 100000, 0.0022 ],
                            [ 250000, 0.0020 ],
                            [ 500000, 0.0018 ],
                            [ 1000000, 0.0016 ],
                            [ 2500000, 0.0014 ],
                            [ 5000000, 0.0012 ],
                            [ 10000000, 0.0001 ],
                        ],
                        'maker': [
                            [ 0, 0.0016 ],
                            [ 50000, 0.0014 ],
                            [ 100000, 0.0012 ],
                            [ 250000, 0.0010 ],
                            [ 500000, 0.0008 ],
                            [ 1000000, 0.0006 ],
                            [ 2500000, 0.0004 ],
                            [ 5000000, 0.0002 ],
                            [ 10000000, 0.0 ],
                        ],
                    },
                },
            },
            'handleContentTypeApplicationZip': true,
            'api': {
                'zendesk': {
                    'get': [
                        // we should really refrain from putting fixed fee numbers and stop hardcoding
                        // we will be using their web APIs to scrape all numbers from these articles
                        '360000292886', // -What-are-the-deposit-fees-
                        '201893608', // -What-are-the-withdrawal-fees-
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
                    'post': {
                        'AddOrder': 0,
                        'AddExport': 1,
                        'Balance': 1,
                        'CancelAll': 1,
                        'CancelOrder': 0,
                        'ClosedOrders': 2,
                        'DepositAddresses': 1,
                        'DepositMethods': 1,
                        'DepositStatus': 1,
                        'ExportStatus': 1,
                        'GetWebSocketsToken': 1,
                        'Ledgers': 2,
                        'OpenOrders': 1,
                        'OpenPositions': 1,
                        'QueryLedgers': 1,
                        'QueryOrders': 1,
                        'QueryTrades': 1,
                        'RetrieveExport': 1,
                        'RemoveExport': 1,
                        'TradeBalance': 1,
                        'TradesHistory': 2,
                        'TradeVolume': 1,
                        'Withdraw': 1,
                        'WithdrawCancel': 1,
                        'WithdrawInfo': 1,
                        'WithdrawStatus': 1,
                        // staking
                        'Stake': 1,
                        'Unstake': 1,
                        'Staking/Assets': 1,
                        'Staking/Pending': 1,
                        'Staking/Transactions': 1,
                    },
                },
            },
            'commonCurrencies': {
                'XBT': 'BTC',
                'XBT.M': 'BTC.M', // https://support.kraken.com/hc/en-us/articles/360039879471-What-is-Asset-S-and-Asset-M-
                'XDG': 'DOGE',
                'REPV2': 'REP',
                'REP': 'REPV1',
            },
            'options': {
                'delistedMarketsById': {},
                // cannot withdraw/deposit these
                'inactiveCurrencies': [ 'CAD', 'USD', 'JPY', 'GBP' ],
                'networks': {
                    'ETH': 'ERC20',
                    'TRX': 'TRC20',
                },
                'depositMethods': {
                    '1INCH': '1inch (1INCH)',
                    'AAVE': 'Aave',
                    'ADA': 'ADA',
                    'ALGO': 'Algorand',
                    'ANKR': 'ANKR (ANKR)',
                    'ANT': 'Aragon (ANT)',
                    'ATOM': 'Cosmos',
                    'AXS': 'Axie Infinity Shards (AXS)',
                    'BADGER': 'Bager DAO (BADGER)',
                    'BAL': 'Balancer (BAL)',
                    'BAND': 'Band Protocol (BAND)',
                    'BAT': 'BAT',
                    'BCH': 'Bitcoin Cash',
                    'BNC': 'Bifrost (BNC)',
                    'BNT': 'Bancor (BNT)',
                    'BTC': 'Bitcoin',
                    'CHZ': 'Chiliz (CHZ)',
                    'COMP': 'Compound (COMP)',
                    'CQT': '\tCovalent Query Token (CQT)',
                    'CRV': 'Curve DAO Token (CRV)',
                    'CTSI': 'Cartesi (CTSI)',
                    'DAI': 'Dai',
                    'DASH': 'Dash',
                    'DOGE': 'Dogecoin',
                    'DOT': 'Polkadot',
                    'DYDX': 'dYdX (DYDX)',
                    'ENJ': 'Enjin Coin (ENJ)',
                    'EOS': 'EOS',
                    'ETC': 'Ether Classic (Hex)',
                    'ETH': 'Ether (Hex)',
                    'EWT': 'Energy Web Token',
                    'FEE': 'Kraken Fee Credit',
                    'FIL': 'Filecoin',
                    'FLOW': 'Flow',
                    'GHST': 'Aavegotchi (GHST)',
                    'GNO': 'GNO',
                    'GRT': 'GRT',
                    'ICX': 'Icon',
                    'INJ': 'Injective Protocol (INJ)',
                    'KAR': 'Karura (KAR)',
                    'KAVA': 'Kava',
                    'KEEP': 'Keep Token (KEEP)',
                    'KNC': 'Kyber Network (KNC)',
                    'KSM': 'Kusama',
                    'LINK': 'Link',
                    'LPT': 'Livepeer Token (LPT)',
                    'LRC': 'Loopring (LRC)',
                    'LSK': 'Lisk',
                    'LTC': 'Litecoin',
                    'MANA': 'MANA',
                    'MATIC': 'Polygon (MATIC)',
                    'MINA': 'Mina', // inspected from webui
                    'MIR': 'Mirror Protocol (MIR)',
                    'MKR': 'Maker (MKR)',
                    'MLN': 'MLN',
                    'MOVR': 'Moonriver (MOVR)',
                    'NANO': 'NANO',
                    'OCEAN': 'OCEAN',
                    'OGN': 'Origin Protocol (OGN)',
                    'OMG': 'OMG',
                    'OXT': 'Orchid (OXT)',
                    'OXY': 'Oxygen (OXY)',
                    'PAXG': 'PAX (Gold)',
                    'PERP': 'Perpetual Protocol (PERP)',
                    'PHA': 'Phala (PHA)',
                    'QTUM': 'QTUM',
                    'RARI': 'Rarible (RARI)',
                    'RAY': 'Raydium (RAY)',
                    'REN': 'Ren Protocol (REN)',
                    'REP': 'REPv2',
                    'REPV1': 'REP',
                    'SAND': 'The Sandbox (SAND)',
                    'SC': 'Siacoin',
                    'SDN': 'Shiden (SDN)',
                    'SOL': 'Solana',  // their deposit method api doesn't work for SOL - was guessed
                    'SNX': 'Synthetix  Network (SNX)',
                    'SRM': 'Serum', // inspected from webui
                    'STORJ': 'Storj (STORJ)',
                    'SUSHI': 'Sushiswap (SUSHI)',
                    'TBTC': 'tBTC',
                    'TRX': 'Tron',
                    'UNI': 'UNI',
                    'USDC': 'USDC',
                    'USDT': 'Tether USD (ERC20)',
                    'USDT-TRC20': 'Tether USD (TRC20)',
                    'WAVES': 'Waves',
                    'WBTC': 'Wrapped Bitcoin (WBTC)',
                    'XLM': 'Stellar XLM',
                    'XMR': 'Monero',
                    'XRP': 'Ripple XRP',
                    'XTZ': 'XTZ',
                    'YFI': 'YFI',
                    'ZEC': 'Zcash (Transparent)',
                    'ZRX': '0x (ZRX)',
                },
            },
            'exceptions': {
                'EQuery:Invalid asset pair': BadSymbol, // {"error":["EQuery:Invalid asset pair"]}
                'EAPI:Invalid key': AuthenticationError,
                'EFunding:Unknown withdraw key': InvalidAddress, // {"error":["EFunding:Unknown withdraw key"]}
                'EFunding:Invalid amount': InsufficientFunds,
                'EService:Unavailable': ExchangeNotAvailable,
                'EDatabase:Internal error': ExchangeNotAvailable,
                'EService:Busy': ExchangeNotAvailable,
                'EQuery:Unknown asset': BadSymbol, // {"error":["EQuery:Unknown asset"]}
                'EAPI:Rate limit exceeded': DDoSProtection,
                'EOrder:Rate limit exceeded': DDoSProtection,
                'EGeneral:Internal error': ExchangeNotAvailable,
                'EGeneral:Temporary lockout': DDoSProtection,
                'EGeneral:Permission denied': PermissionDenied,
                'EOrder:Unknown order': InvalidOrder,
                'EOrder:Order minimum not met': InvalidOrder,
                'EGeneral:Invalid arguments': BadRequest,
                'ESession:Invalid session': AuthenticationError,
                'EAPI:Invalid nonce': InvalidNonce,
                'EFunding:No funding method': BadRequest, // {"error":"EFunding:No funding method"}
                'EFunding:Unknown asset': BadSymbol, // {"error":["EFunding:Unknown asset"]}
                'EService:Market in post_only mode': OnMaintenance, // {"error":["EService:Market in post_only mode"]}
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetAssetPairs (params);
        //
        //     {
        //         "error":[],
        //         "result":{
        //             "ADAETH":{
        //                 "altname":"ADAETH",
        //                 "wsname":"ADA\/ETH",
        //                 "aclass_base":"currency",
        //                 "base":"ADA",
        //                 "aclass_quote":"currency",
        //                 "quote":"XETH",
        //                 "lot":"unit",
        //                 "pair_decimals":7,
        //                 "lot_decimals":8,
        //                 "lot_multiplier":1,
        //                 "leverage_buy":[],
        //                 "leverage_sell":[],
        //                 "fees":[
        //                     [0,0.26],
        //                     [50000,0.24],
        //                     [100000,0.22],
        //                     [250000,0.2],
        //                     [500000,0.18],
        //                     [1000000,0.16],
        //                     [2500000,0.14],
        //                     [5000000,0.12],
        //                     [10000000,0.1]
        //                 ],
        //                 "fees_maker":[
        //                     [0,0.16],
        //                     [50000,0.14],
        //                     [100000,0.12],
        //                     [250000,0.1],
        //                     [500000,0.08],
        //                     [1000000,0.06],
        //                     [2500000,0.04],
        //                     [5000000,0.02],
        //                     [10000000,0]
        //                 ],
        //                 "fee_volume_currency":"ZUSD",
        //                 "margin_call":80,
        //                 "margin_stop":40,
        //                 "ordermin": "1"
        //             },
        //         }
        //     }
        //
        const markets = this.safeValue (response, 'result', {});
        const keys = Object.keys (markets);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const darkpool = id.indexOf ('.d') >= 0;
            const altname = this.safeString (market, 'altname');
            const makerFees = this.safeValue (market, 'fees_maker', []);
            const firstMakerFee = this.safeValue (makerFees, 0, []);
            const firstMakerFeeRate = this.safeNumber (firstMakerFee, 1);
            let maker = undefined;
            if (firstMakerFeeRate !== undefined) {
                maker = parseFloat (firstMakerFeeRate) / 100;
            }
            const takerFees = this.safeValue (market, 'fees', []);
            const firstTakerFee = this.safeValue (takerFees, 0, []);
            const firstTakerFeeRate = this.safeNumber (firstTakerFee, 1);
            let taker = undefined;
            if (firstTakerFeeRate !== undefined) {
                taker = parseFloat (firstTakerFeeRate) / 100;
            }
            const leverageBuy = this.safeValue (market, 'leverage_buy', []);
            const leverageBuyLength = leverageBuy.length;
            const precisionPrice = this.safeString (market, 'pair_decimals');
            result.push ({
                'id': id,
                'symbol': darkpool ? altname : (base + '/' + quote),
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'darkpool': darkpool,
                'altname': market['altname'],
                'type': 'spot',
                'spot': true,
                'margin': (leverageBuyLength > 0),
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': taker,
                'maker': maker,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger (market, 'lot_decimals'),
                    'price': this.safeInteger (market, 'pair_decimals'),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (leverageBuy, leverageBuyLength - 1, 1),
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'ordermin'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.parseNumber (this.parsePrecision (precisionPrice)),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        result = this.appendInactiveMarkets (result);
        this.marketsByAltname = this.indexBy (result, 'altname');
        return result;
    }

    safeCurrency (currencyId, currency = undefined) {
        if (currencyId !== undefined) {
            if (currencyId.length > 3) {
                if ((currencyId.indexOf ('X') === 0) || (currencyId.indexOf ('Z') === 0)) {
                    if (currencyId.indexOf ('.') > 0) {
                        return super.safeCurrency (currencyId, currency);
                    } else {
                        currencyId = currencyId.slice (1);
                    }
                }
            }
        }
        return super.safeCurrency (currencyId, currency);
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
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
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

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'fee-info': true,
        };
        const response = await this.privatePostTradeVolume (this.extend (request, params));
        //
        //     {
        //        error: [],
        //        result: {
        //          currency: 'ZUSD',
        //          volume: '0.0000',
        //          fees: {
        //            XXBTZUSD: {
        //              fee: '0.2600',
        //              minfee: '0.1000',
        //              maxfee: '0.2600',
        //              nextfee: '0.2400',
        //              tiervolume: '0.0000',
        //              nextvolume: '50000.0000'
        //            }
        //          },
        //          fees_maker: {
        //            XXBTZUSD: {
        //              fee: '0.1600',
        //              minfee: '0.0000',
        //              maxfee: '0.1600',
        //              nextfee: '0.1400',
        //              tiervolume: '0.0000',
        //              nextvolume: '50000.0000'
        //            }
        //          }
        //        }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTradingFee (result, market);
    }

    parseTradingFee (response, market) {
        const makerFees = this.safeValue (response, 'fees_maker', {});
        const takerFees = this.safeValue (response, 'fees', {});
        const symbolMakerFee = this.safeValue (makerFees, market['id'], {});
        const symbolTakerFee = this.safeValue (takerFees, market['id'], {});
        return {
            'info': response,
            'symbol': market['symbol'],
            'maker': this.safeNumber (symbolMakerFee, 'fee'),
            'taker': this.safeNumber (symbolTakerFee, 'fee'),
            'percentage': true,
            'tierBased': true,
        };
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        const price = this.safeNumber (bidask, priceKey);
        const amount = this.safeNumber (bidask, amountKey);
        const timestamp = this.safeInteger (bidask, 2);
        return [ price, amount, timestamp ];
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
        //
        //     {
        //         "error":[],
        //         "result":{
        //             "XETHXXBT":{
        //                 "asks":[
        //                     ["0.023480","4.000",1586321307],
        //                     ["0.023490","50.095",1586321306],
        //                     ["0.023500","28.535",1586321302],
        //                 ],
        //                 "bids":[
        //                     ["0.023470","59.580",1586321307],
        //                     ["0.023460","20.000",1586321301],
        //                     ["0.023440","67.832",1586321306],
        //                 ]
        //             }
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        let orderbook = this.safeValue (result, market['id']);
        // sometimes kraken returns wsname instead of market id
        // https://github.com/ccxt/ccxt/issues/8662
        const marketInfo = this.safeValue (market, 'info', {});
        const wsName = this.safeValue (marketInfo, 'wsname');
        if (wsName !== undefined) {
            orderbook = this.safeValue (result, wsName, orderbook);
        }
        return this.parseOrderBook (orderbook, symbol);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "a":["2432.77000","1","1.000"],
        //         "b":["2431.37000","2","2.000"],
        //         "c":["2430.58000","0.04408910"],
        //         "v":["4147.94474901","8896.96086304"],
        //         "p":["2456.22239","2568.63032"],
        //         "t":[3907,10056],
        //         "l":["2302.18000","2302.18000"],
        //         "h":["2621.14000","2860.01000"],
        //         "o":"2571.56000"
        //     }
        //
        const timestamp = this.milliseconds ();
        const symbol = this.safeSymbol (undefined, market);
        const v = this.safeValue (ticker, 'v', []);
        const baseVolume = this.safeString (v, 1);
        const p = this.safeValue (ticker, 'p', []);
        const vwap = this.safeString (p, 1);
        const quoteVolume = Precise.stringMul (baseVolume, vwap);
        const c = this.safeValue (ticker, 'c', []);
        const last = this.safeString (c, 0);
        const high = this.safeValue (ticker, 'h', []);
        const low = this.safeValue (ticker, 'l', []);
        const bid = this.safeValue (ticker, 'b', []);
        const ask = this.safeValue (ticker, 'a', []);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (high, 1),
            'low': this.safeString (low, 1),
            'bid': this.safeString (bid, 0),
            'bidVolume': undefined,
            'ask': this.safeString (ask, 0),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market, false);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTickers() requires a symbols argument, an array of symbols');
        }
        await this.loadMarkets ();
        const marketIds = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
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
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
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

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1591475640,
        //         "0.02500",
        //         "0.02500",
        //         "0.02500",
        //         "0.02500",
        //         "0.02500",
        //         "9.12201000",
        //         5
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 6),
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
        //
        //     {
        //         "error":[],
        //         "result":{
        //             "XETHXXBT":[
        //                 [1591475580,"0.02499","0.02499","0.02499","0.02499","0.00000","0.00000000",0],
        //                 [1591475640,"0.02500","0.02500","0.02500","0.02500","0.02500","9.12201000",5],
        //                 [1591475700,"0.02499","0.02499","0.02499","0.02499","0.02499","1.28681415",2],
        //                 [1591475760,"0.02499","0.02499","0.02499","0.02499","0.02499","0.08800000",1],
        //             ],
        //             "last":1591517580
        //         }
        //     }
        const result = this.safeValue (response, 'result', {});
        const ohlcvs = this.safeValue (result, market['id'], []);
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
        let amount = this.safeNumber (item, 'amount');
        if (amount < 0) {
            direction = 'out';
            amount = Math.abs (amount);
        } else {
            direction = 'in';
        }
        const time = this.safeNumber (item, 'time');
        let timestamp = undefined;
        if (time !== undefined) {
            timestamp = parseInt (time * 1000);
        }
        const fee = {
            'cost': this.safeNumber (item, 'fee'),
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
        //
        // fetchTrades (public)
        //
        //     [
        //         "0.032310", // price
        //         "4.28169434", // amount
        //         1541390792.763, // timestamp
        //         "s", // sell or buy
        //         "l", // limit or market
        //         ""
        //     ]
        //
        // fetchOrderTrades (private)
        //
        //     {
        //         id: 'TIMIRG-WUNNE-RRJ6GT', // injected from outside
        //         ordertxid: 'OQRPN2-LRHFY-HIFA7D',
        //         postxid: 'TKH2SE-M7IF5-CFI7LT',
        //         pair: 'USDCUSDT',
        //         time: 1586340086.457,
        //         type: 'sell',
        //         ordertype: 'market',
        //         price: '0.99860000',
        //         cost: '22.16892001',
        //         fee: '0.04433784',
        //         vol: '22.20000000',
        //         margin: '0.00000000',
        //         misc: ''
        //     }
        //
        let timestamp = undefined;
        let side = undefined;
        let type = undefined;
        let price = undefined;
        let amount = undefined;
        let id = undefined;
        let orderId = undefined;
        let fee = undefined;
        let symbol = undefined;
        if (Array.isArray (trade)) {
            timestamp = this.safeTimestamp (trade, 2);
            side = (trade[3] === 's') ? 'sell' : 'buy';
            type = (trade[4] === 'l') ? 'limit' : 'market';
            price = this.safeString (trade, 0);
            amount = this.safeString (trade, 1);
            const tradeLength = trade.length;
            if (tradeLength > 6) {
                id = this.safeString (trade, 6); // artificially added as per #1794
            }
        } else if (typeof trade === 'string') {
            id = trade;
        } else if ('ordertxid' in trade) {
            const marketId = this.safeString (trade, 'pair');
            const foundMarket = this.findMarketByAltnameOrId (marketId);
            if (foundMarket !== undefined) {
                market = foundMarket;
            } else if (marketId !== undefined) {
                // delisted market ids go here
                market = this.getDelistedMarketById (marketId);
            }
            orderId = this.safeString (trade, 'ordertxid');
            id = this.safeString2 (trade, 'id', 'postxid');
            timestamp = this.safeTimestamp (trade, 'time');
            side = this.safeString (trade, 'type');
            type = this.safeString (trade, 'ordertype');
            price = this.safeString (trade, 'price');
            amount = this.safeString (trade, 'vol');
            if ('fee' in trade) {
                let currency = undefined;
                if (market !== undefined) {
                    currency = market['quote'];
                }
                fee = {
                    'cost': this.safeString (trade, 'fee'),
                    'currency': currency,
                };
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const cost = this.safeString (trade, 'cost');
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'info': trade,
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
        }, market);
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

    parseBalance (response) {
        const balances = this.safeValue (response, 'result', {});
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balances, currencyId);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        //
        //     {
        //         "error":[],
        //         "result":{
        //             "ZUSD":"58.8649",
        //             "KFEE":"4399.43",
        //             "XXBT":"0.0000034506",
        //         }
        //     }
        //
        return this.parseBalance (response);
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
        const clientOrderId = this.safeString2 (params, 'userref', 'clientOrderId');
        params = this.omit (params, [ 'userref', 'clientOrderId' ]);
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
        }
        //
        //     market
        //     limit (price = limit price)
        //     stop-loss (price = stop loss price)
        //     take-profit (price = take profit price)
        //     stop-loss-limit (price = stop loss trigger price, price2 = triggered limit price)
        //     take-profit-limit (price = take profit trigger price, price2 = triggered limit price)
        //     settle-position
        //
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        } else if ((type === 'stop-loss') || (type === 'take-profit')) {
            const stopPrice = this.safeNumber2 (params, 'price', 'stopPrice', price);
            if (stopPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument or a price/stopPrice parameter for a ' + type + ' order');
            } else {
                request['price'] = this.priceToPrecision (symbol, stopPrice);
            }
        } else if ((type === 'stop-loss-limit') || (type === 'take-profit-limit')) {
            const stopPrice = this.safeNumber2 (params, 'price', 'stopPrice');
            const limitPrice = this.safeNumber (params, 'price2');
            const stopPriceDefined = (stopPrice !== undefined);
            const limitPriceDefined = (limitPrice !== undefined);
            if (stopPriceDefined && limitPriceDefined) {
                request['price'] = this.priceToPrecision (symbol, stopPrice);
                request['price2'] = this.priceToPrecision (symbol, limitPrice);
            } else if ((price === undefined) || (!(stopPriceDefined || limitPriceDefined))) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument and/or price/stopPrice/price2 parameters for a ' + type + ' order');
            } else {
                if (stopPriceDefined) {
                    request['price'] = this.priceToPrecision (symbol, stopPrice);
                    request['price2'] = this.priceToPrecision (symbol, price);
                } else if (limitPriceDefined) {
                    request['price'] = this.priceToPrecision (symbol, price);
                    request['price2'] = this.priceToPrecision (symbol, limitPrice);
                }
            }
        }
        params = this.omit (params, [ 'price', 'stopPrice', 'price2' ]);
        const response = await this.privatePostAddOrder (this.extend (request, params));
        //
        //     {
        //         error: [],
        //         result: {
        //             descr: { order: 'buy 0.02100000 ETHUSDT @ limit 330.00' },
        //             txid: [ 'OEKVV2-IH52O-TPL6GZ' ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result);
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
        //
        // createOrder for regular orders
        //
        //     {
        //         descr: { order: 'buy 0.02100000 ETHUSDT @ limit 330.00' },
        //         txid: [ 'OEKVV2-IH52O-TPL6GZ' ]
        //     }
        //     {
        //         "txid": [ "TX_ID_HERE" ],
        //         "descr": { "order":"buy 0.12345678 ETHEUR @ market" },
        //     }
        //
        //
        // createOrder for stop orders
        //
        //     {
        //         "txid":["OSILNC-VQI5Q-775ZDQ"],
        //         "descr":{"order":"sell 167.28002676 ADAXBT @ stop loss 0.00003280 -> limit 0.00003212"}
        //     }
        //
        //
        //     {
        //         "txid":["OVHMJV-BZW2V-6NZFWF"],
        //         "descr":{"order":"sell 0.00100000 ETHUSD @ stop loss 2677.00 -> limit 2577.00 with 5:1 leverage"}
        //     }
        //
        const description = this.safeValue (order, 'descr', {});
        const orderDescription = this.safeString (description, 'order');
        let side = undefined;
        let type = undefined;
        let marketId = undefined;
        let price = undefined;
        let amount = undefined;
        let stopPrice = undefined;
        if (orderDescription !== undefined) {
            const parts = orderDescription.split (' ');
            side = this.safeString (parts, 0);
            amount = this.safeString (parts, 1);
            marketId = this.safeString (parts, 2);
            type = this.safeString (parts, 4);
            if (type === 'stop') {
                stopPrice = this.safeString (parts, 6);
                price = this.safeString (parts, 9);
            } else if (type === 'limit') {
                price = this.safeString (parts, 5);
            }
        }
        side = this.safeString (description, 'type', side);
        type = this.safeString (description, 'ordertype', type);
        marketId = this.safeString (description, 'pair', marketId);
        const foundMarket = this.findMarketByAltnameOrId (marketId);
        let symbol = undefined;
        if (foundMarket !== undefined) {
            market = foundMarket;
        } else if (marketId !== undefined) {
            // delisted market ids go here
            market = this.getDelistedMarketById (marketId);
        }
        const timestamp = this.safeTimestamp (order, 'opentm');
        amount = this.safeString (order, 'vol', amount);
        const filled = this.safeString (order, 'vol_exec');
        let fee = undefined;
        // kraken truncates the cost in the api response so we will ignore it and calculate it from average & filled
        // const cost = this.safeString (order, 'cost');
        price = this.safeString (description, 'price', price);
        if ((price === undefined) || Precise.stringEquals (price, '0')) {
            price = this.safeString (description, 'price2');
        }
        if ((price === undefined) || Precise.stringEquals (price, '0')) {
            price = this.safeString (order, 'price', price);
        }
        const average = this.safeNumber (order, 'price');
        if (market !== undefined) {
            symbol = market['symbol'];
            if ('fee' in order) {
                const flags = order['oflags'];
                const feeCost = this.safeString (order, 'fee');
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
        let id = this.safeString (order, 'id');
        if (id === undefined) {
            const txid = this.safeValue (order, 'txid');
            id = this.safeString (txid, 0);
        }
        const clientOrderId = this.safeString (order, 'userref');
        const rawTrades = this.safeValue (order, 'trades');
        stopPrice = this.safeNumber (order, 'stopprice', stopPrice);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'average': average,
            'remaining': undefined,
            'fee': fee,
            'trades': rawTrades,
        }, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const clientOrderId = this.safeValue2 (params, 'userref', 'clientOrderId');
        const request = {
            'trades': true, // whether or not to include trades in output (optional, default false)
            // 'txid': id, // do not comma separate a list of ids - use fetchOrdersByIds instead
            // 'userref': 'optional', // restrict results to given user reference id (optional)
        };
        let query = params;
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
            query = this.omit (params, [ 'userref', 'clientOrderId' ]);
        } else {
            request['txid'] = id;
        }
        const response = await this.privatePostQueryOrders (this.extend (request, query));
        //
        //     {
        //         "error":[],
        //         "result":{
        //             "OTLAS3-RRHUF-NDWH5A":{
        //                 "refid":null,
        //                 "userref":null,
        //                 "status":"closed",
        //                 "reason":null,
        //                 "opentm":1586822919.3342,
        //                 "closetm":1586822919.365,
        //                 "starttm":0,
        //                 "expiretm":0,
        //                 "descr":{
        //                     "pair":"XBTUSDT",
        //                     "type":"sell",
        //                     "ordertype":"market",
        //                     "price":"0",
        //                     "price2":"0",
        //                     "leverage":"none",
        //                     "order":"sell 0.21804000 XBTUSDT @ market",
        //                     "close":""
        //                 },
        //                 "vol":"0.21804000",
        //                 "vol_exec":"0.21804000",
        //                 "cost":"1493.9",
        //                 "fee":"3.8",
        //                 "price":"6851.5",
        //                 "stopprice":"0.00000",
        //                 "limitprice":"0.00000",
        //                 "misc":"",
        //                 "oflags":"fciq",
        //                 "trades":["TT5UC3-GOIRW-6AZZ6R"]
        //             }
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        if (!(id in result)) {
            throw new OrderNotFound (this.id + ' fetchOrder() could not find order id ' + id);
        }
        const order = this.parseOrder (this.extend ({ 'id': id }, result[id]));
        return this.extend ({ 'info': response }, order);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orderTrades = this.safeValue (params, 'trades');
        const tradeIds = [];
        if (orderTrades === undefined) {
            throw new ArgumentsRequired (this.id + " fetchOrderTrades() requires a unified order structure in the params argument or a 'trades' param (an array of trade id strings)");
        } else {
            for (let i = 0; i < orderTrades.length; i++) {
                const orderTrade = orderTrades[i];
                if (typeof orderTrade === 'string') {
                    tradeIds.push (orderTrade);
                } else {
                    tradeIds.push (orderTrade['id']);
                }
            }
        }
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'fetchOrderTrades', {});
        const batchSize = this.safeInteger (options, 'batchSize', 20);
        const numTradeIds = tradeIds.length;
        let numBatches = parseInt (numTradeIds / batchSize);
        numBatches = this.sum (numBatches, 1);
        let result = [];
        for (let j = 0; j < numBatches; j++) {
            const requestIds = [];
            for (let k = 0; k < batchSize; k++) {
                const index = this.sum (j * batchSize, k);
                if (index < numTradeIds) {
                    requestIds.push (tradeIds[index]);
                }
            }
            const request = {
                'txid': requestIds.join (','),
            };
            const response = await this.privatePostQueryTrades (request);
            //
            //     {
            //         error: [],
            //         result: {
            //             'TIMIRG-WUNNE-RRJ6GT': {
            //                 ordertxid: 'OQRPN2-LRHFY-HIFA7D',
            //                 postxid: 'TKH2SE-M7IF5-CFI7LT',
            //                 pair: 'USDCUSDT',
            //                 time: 1586340086.457,
            //                 type: 'sell',
            //                 ordertype: 'market',
            //                 price: '0.99860000',
            //                 cost: '22.16892001',
            //                 fee: '0.04433784',
            //                 vol: '22.20000000',
            //                 margin: '0.00000000',
            //                 misc: ''
            //             }
            //         }
            //     }
            //
            const rawTrades = this.safeValue (response, 'result');
            const ids = Object.keys (rawTrades);
            for (let i = 0; i < ids.length; i++) {
                rawTrades[ids[i]]['id'] = ids[i];
            }
            const trades = this.parseTrades (rawTrades, undefined, since, limit);
            const tradesFilteredBySymbol = this.filterBySymbol (trades, symbol);
            result = this.arrayConcat (result, tradesFilteredBySymbol);
        }
        return result;
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
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseTrades (trades, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        const clientOrderId = this.safeValue2 (params, 'userref', 'clientOrderId', id);
        const request = {
            'txid': clientOrderId, // order id or userref
        };
        params = this.omit (params, [ 'userref', 'clientOrderId' ]);
        try {
            response = await this.privatePostCancelOrder (this.extend (request, params));
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

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelAll (params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
        }
        let query = params;
        const clientOrderId = this.safeValue2 (params, 'userref', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
            query = this.omit (params, [ 'userref', 'clientOrderId' ]);
        }
        const response = await this.privatePostOpenOrders (this.extend (request, query));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'open', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start'] = parseInt (since / 1000);
        }
        let query = params;
        const clientOrderId = this.safeValue2 (params, 'userref', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
            query = this.omit (params, [ 'userref', 'clientOrderId' ]);
        }
        const response = await this.privatePostClosedOrders (this.extend (request, query));
        //
        //     {
        //         "error":[],
        //         "result":{
        //             "closed":{
        //                 "OETZYO-UL524-QJMXCT":{
        //                     "refid":null,
        //                     "userref":null,
        //                     "status":"canceled",
        //                     "reason":"User requested",
        //                     "opentm":1601489313.3898,
        //                     "closetm":1601489346.5507,
        //                     "starttm":0,
        //                     "expiretm":0,
        //                     "descr":{
        //                         "pair":"ETHUSDT",
        //                         "type":"buy",
        //                         "ordertype":"limit",
        //                         "price":"330.00",
        //                         "price2":"0",
        //                         "leverage":"none",
        //                         "order":"buy 0.02100000 ETHUSDT @ limit 330.00",
        //                         "close":""
        //                     },
        //                     "vol":"0.02100000",
        //                     "vol_exec":"0.00000000",
        //                     "cost":"0.00000",
        //                     "fee":"0.00000",
        //                     "price":"0.00000",
        //                     "stopprice":"0.00000",
        //                     "limitprice":"0.00000",
        //                     "misc":"",
        //                     "oflags":"fciq"
        //                 },
        //             },
        //             "count":16
        //         }
        //     }
        //
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'closed', []);
        return this.parseOrders (orders, market, since, limit);
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
        //
        // there can be an additional 'status-prop' field present
        // deposit pending review by exchange => 'on-hold'
        // the deposit is initiated by the exchange => 'return'
        //
        //      {
        //          type: 'deposit',
        //          method: 'Fidor Bank AG (Wire Transfer)',
        //          aclass: 'currency',
        //          asset: 'ZEUR',
        //          refid: 'xxx-xxx-xxx',
        //          txid: '12341234',
        //          info: 'BANKCODEXXX',
        //          amount: '38769.08',
        //          fee: '0.0000',
        //          time: 1644306552,
        //          status: 'Success',
        //          status-prop: 'on-hold'
        //      }
        //
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
        // withdrawals may also have an additional 'status-prop' field present
        //
        //
        const id = this.safeString (transaction, 'refid');
        const txid = this.safeString (transaction, 'txid');
        const timestamp = this.safeTimestamp (transaction, 'time');
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (transaction, 'info');
        const amount = this.safeNumber (transaction, 'amount');
        let status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const statusProp = this.safeString (transaction, 'status-prop');
        const isOnHoldDeposit = statusProp === 'on-hold';
        const isCancellationRequest = statusProp === 'cancel-pending';
        const isOnHoldWithdrawal = statusProp === 'onhold';
        if (isOnHoldDeposit || isCancellationRequest || isOnHoldWithdrawal) {
            status = 'pending';
        }
        const type = this.safeString (transaction, 'type'); // injected from the outside
        let feeCost = this.safeNumber (transaction, 'fee');
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
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
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
        // https://www.kraken.com/en-us/help/api#deposit-status
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a currency code argument');
        }
        await this.loadMarkets ();
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

    async fetchTime (params = {}) {
        // https://www.kraken.com/en-us/features/api#get-server-time
        const response = await this.publicGetTime (params);
        //
        //    {
        //        "error": [],
        //        "result": {
        //            "unixtime": 1591502873,
        //            "rfc1123": "Sun,  7 Jun 20 04:07:53 +0000"
        //        }
        //    }
        //
        const result = this.safeValue (response, 'result', {});
        return this.safeTimestamp (result, 'unixtime');
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        // https://www.kraken.com/en-us/help/api#withdraw-status
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        await this.loadMarkets ();
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
        return await this.fetchDepositAddress (code, this.extend (request, params));
    }

    async fetchDepositMethods (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privatePostDepositMethods (this.extend (request, params));
        //
        //     {
        //         "error":[],
        //         "result":[
        //             {"method":"Ether (Hex)","limit":false,"gen-address":true}
        //         ]
        //     }
        //
        //     {
        //         "error":[],
        //         "result":[
        //             {"method":"Tether USD (ERC20)","limit":false,"address-setup-fee":"0.00000000","gen-address":true},
        //             {"method":"Tether USD (TRC20)","limit":false,"address-setup-fee":"0.00000000","gen-address":true}
        //         ]
        //     }
        //
        //     {
        //         "error":[],
        //         "result":[
        //             {"method":"Bitcoin","limit":false,"fee":"0.0000000000","gen-address":true}
        //         ]
        //     }
        //
        return this.safeValue (response, 'result');
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        let network = this.safeStringUpper (params, 'network');
        const networks = this.safeValue (this.options, 'networks', {});
        network = this.safeString (networks, network, network); // support ETH > ERC20 aliases
        params = this.omit (params, 'network');
        if ((code === 'USDT') && (network === 'TRC20')) {
            code = code + '-' + network;
        }
        const defaultDepositMethods = this.safeValue (this.options, 'depositMethods', {});
        const defaultDepositMethod = this.safeString (defaultDepositMethods, code);
        let depositMethod = this.safeString (params, 'method', defaultDepositMethod);
        // if the user has specified an exchange-specific method in params
        // we pass it as is, otherwise we take the 'network' unified param
        if (depositMethod === undefined) {
            const depositMethods = await this.fetchDepositMethods (code);
            if (network !== undefined) {
                // find best matching deposit method, or fallback to the first one
                for (let i = 0; i < depositMethods.length; i++) {
                    const entry = this.safeString (depositMethods[i], 'method');
                    if (entry.indexOf (network) >= 0) {
                        depositMethod = entry;
                        break;
                    }
                }
            }
            // if depositMethod was not specified, fallback to the first available deposit method
            if (depositMethod === undefined) {
                const firstDepositMethod = this.safeValue (depositMethods, 0, {});
                depositMethod = this.safeString (firstDepositMethod, 'method');
            }
        }
        const request = {
            'asset': currency['id'],
            'method': depositMethod,
        };
        const response = await this.privatePostDepositAddresses (this.extend (request, params));
        //
        //     {
        //         "error":[],
        //         "result":[
        //             {"address":"0x77b5051f97efa9cc52c9ad5b023a53fc15c200d3","expiretm":"0"}
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        const firstResult = this.safeValue (result, 0, {});
        if (firstResult === undefined) {
            throw new InvalidAddress (this.id + ' privatePostDepositAddresses() returned no addresses for ' + code);
        }
        return this.parseDepositAddress (firstResult, currency);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "address":"0x77b5051f97efa9cc52c9ad5b023a53fc15c200d3",
        //         "expiretm":"0"
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'tag');
        currency = this.safeCurrency (undefined, currency);
        const code = currency['code'];
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
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
            const result = this.safeValue (response, 'result', {});
            const id = this.safeString (result, 'refid');
            return {
                'info': result,
                'id': id,
            };
        }
        throw new ExchangeError (this.id + " withdraw() requires a 'key' parameter (withdrawal key name, as set up on your account)");
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'txid': 'comma delimited list of transaction ids to restrict output to',
            // 'docalcs': false, // whether or not to include profit/loss calculations
            // 'consolidation': 'market', // what to consolidate the positions data around, market will consolidate positions based on market pair
        };
        const response = await this.privatePostOpenPositions (this.extend (request, params));
        //
        // no consolidation
        //
        //     {
        //         error: [],
        //         result: {
        //             'TGUFMY-FLESJ-VYIX3J': {
        //                 ordertxid: "O3LRNU-ZKDG5-XNCDFR",
        //                 posstatus: "open",
        //                 pair: "ETHUSDT",
        //                 time:  1611557231.4584,
        //                 type: "buy",
        //                 ordertype: "market",
        //                 cost: "28.49800",
        //                 fee: "0.07979",
        //                 vol: "0.02000000",
        //                 vol_closed: "0.00000000",
        //                 margin: "14.24900",
        //                 terms: "0.0200% per 4 hours",
        //                 rollovertm: "1611571631",
        //                 misc: "",
        //                 oflags: ""
        //             }
        //         }
        //     }
        //
        // consolidation by market
        //
        //     {
        //         error: [],
        //         result: [
        //             {
        //                 pair: "ETHUSDT",
        //                 positions: "1",
        //                 type: "buy",
        //                 leverage: "2.00000",
        //                 cost: "28.49800",
        //                 fee: "0.07979",
        //                 vol: "0.02000000",
        //                 vol_closed: "0.00000000",
        //                 margin: "14.24900"
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result');
        // todo unify parsePosition/parsePositions
        return result;
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
                'API-Sign': signature,
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
        if (body.indexOf ('Rate limit exceeded') >= 0) {
            throw new RateLimitExceeded (this.id + ' ' + body);
        }
        if (response === undefined) {
            return;
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
