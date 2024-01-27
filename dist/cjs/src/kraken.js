'use strict';

var kraken$1 = require('./abstract/kraken.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var sha512 = require('./static_dependencies/noble-hashes/sha512.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class kraken
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class kraken extends kraken$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': ['US'],
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
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': true,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTrailingAmountOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLedgerEntry': true,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
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
                'setMarginMode': false,
                'transfer': true,
                'withdraw': true,
            },
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
                'doc': 'https://docs.kraken.com/rest/',
                'fees': 'https://www.kraken.com/en-us/features/fee-schedule',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0026'),
                    'maker': this.parseNumber('0.0016'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0026')],
                            [this.parseNumber('50000'), this.parseNumber('0.0024')],
                            [this.parseNumber('100000'), this.parseNumber('0.0022')],
                            [this.parseNumber('250000'), this.parseNumber('0.0020')],
                            [this.parseNumber('500000'), this.parseNumber('0.0018')],
                            [this.parseNumber('1000000'), this.parseNumber('0.0016')],
                            [this.parseNumber('2500000'), this.parseNumber('0.0014')],
                            [this.parseNumber('5000000'), this.parseNumber('0.0012')],
                            [this.parseNumber('10000000'), this.parseNumber('0.0001')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.0016')],
                            [this.parseNumber('50000'), this.parseNumber('0.0014')],
                            [this.parseNumber('100000'), this.parseNumber('0.0012')],
                            [this.parseNumber('250000'), this.parseNumber('0.0010')],
                            [this.parseNumber('500000'), this.parseNumber('0.0008')],
                            [this.parseNumber('1000000'), this.parseNumber('0.0006')],
                            [this.parseNumber('2500000'), this.parseNumber('0.0004')],
                            [this.parseNumber('5000000'), this.parseNumber('0.0002')],
                            [this.parseNumber('10000000'), this.parseNumber('0.0')],
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
                        '360000292886',
                        '201893608', // -What-are-the-withdrawal-fees-
                    ],
                },
                'public': {
                    'get': {
                        // public endpoint rate-limits are described in article: https://support.kraken.com/hc/en-us/articles/206548367-What-are-the-API-rate-limits-#1
                        'Assets': 1,
                        'AssetPairs': 1,
                        'Depth': 1,
                        'OHLC': 1,
                        'Spread': 1,
                        'SystemStatus': 1,
                        'Ticker': 1,
                        'Time': 1,
                        'Trades': 1,
                    },
                },
                'private': {
                    'post': {
                        'AddOrder': 0,
                        'AddOrderBatch': 0,
                        'AddExport': 1,
                        'Balance': 1,
                        'CancelAll': 1,
                        'CancelAllOrdersAfter': 1,
                        'CancelOrder': 0,
                        'CancelOrderBatch': 0,
                        'ClosedOrders': 1,
                        'DepositAddresses': 1,
                        'DepositMethods': 1,
                        'DepositStatus': 1,
                        'EditOrder': 0,
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
                        'BalanceEx': 1,
                        'TradeBalance': 1,
                        'TradesHistory': 2,
                        'TradeVolume': 1,
                        'Withdraw': 1,
                        'WithdrawCancel': 1,
                        'WithdrawInfo': 1,
                        'WithdrawMethods': 1,
                        'WithdrawAddresses': 1,
                        'WithdrawStatus': 1,
                        'WalletTransfer': 1,
                        // sub accounts
                        'CreateSubaccount': 1,
                        'AccountTransfer': 1,
                        // earn
                        'Earn/Allocate': 1,
                        'Earn/Deallocate': 1,
                        'Earn/AllocateStatus': 1,
                        'Earn/DeallocateStatus': 1,
                        'Earn/Strategies': 1,
                        'Earn/Allocations': 1,
                    },
                },
            },
            'commonCurrencies': {
                'LUNA': 'LUNC',
                'LUNA2': 'LUNA',
                'REPV2': 'REP',
                'REP': 'REPV1',
                'UST': 'USTC',
                'XBT': 'BTC',
                'XBT.M': 'BTC.M',
                'XDG': 'DOGE',
            },
            'options': {
                'marketsByAltname': {},
                'delistedMarketsById': {},
                // cannot withdraw/deposit these
                'inactiveCurrencies': ['CAD', 'USD', 'JPY', 'GBP'],
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
                    'MINA': 'Mina',
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
                    'SOL': 'Solana',
                    'SNX': 'Synthetix  Network (SNX)',
                    'SRM': 'Serum',
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
                'withdrawMethods': {
                    'Lightning': 'Lightning',
                    'Bitcoin': 'BTC',
                    'Ripple': 'XRP',
                    'Litecoin': 'LTC',
                    'Dogecoin': 'DOGE',
                    'Stellar': 'XLM',
                    'Ethereum': 'ERC20',
                    'Arbitrum One': 'Arbitrum',
                    'Polygon': 'MATIC',
                    'Arbitrum Nova': 'Arbitrum',
                    'Optimism': 'Optimism',
                    'zkSync Era': 'zkSync',
                    'Ethereum Classic': 'ETC',
                    'Zcash': 'ZEC',
                    'Monero': 'XMR',
                    'Tron': 'TRC20',
                    'Solana': 'SOL',
                    'EOS': 'EOS',
                    'Bitcoin Cash': 'BCH',
                    'Cardano': 'ADA',
                    'Qtum': 'QTUM',
                    'Tezos': 'XTZ',
                    'Cosmos': 'ATOM',
                    'Nano': 'NANO',
                    'Siacoin': 'SC',
                    'Lisk': 'LSK',
                    'Waves': 'WAVES',
                    'ICON': 'ICX',
                    'Algorand': 'ALGO',
                    'Polygon - USDC.e': 'MATIC',
                    'Arbitrum One - USDC.e': 'Arbitrum',
                    'Polkadot': 'DOT',
                    'Kava': 'KAVA',
                    'Filecoin': 'FIL',
                    'Kusama': 'KSM',
                    'Flow': 'FLOW',
                    'Energy Web': 'EW',
                    'Mina': 'MINA',
                    'Centrifuge': 'CFG',
                    'Karura': 'KAR',
                    'Moonriver': 'MOVR',
                    'Shiden': 'SDN',
                    'Khala': 'PHA',
                    'Bifrost Kusama': 'BNC',
                    'Songbird': 'SGB',
                    'Terra classic': 'LUNC',
                    'KILT': 'KILT',
                    'Basilisk': 'BSX',
                    'Flare': 'FLR',
                    'Avalanche C-Chain': 'AVAX',
                    'Kintsugi': 'KINT',
                    'Altair': 'AIR',
                    'Moonbeam': 'GLMR',
                    'Acala': 'ACA',
                    'Astar': 'ASTR',
                    'Akash': 'AKT',
                    'Robonomics': 'XRT',
                    'Fantom': 'FTM',
                    'Elrond': 'EGLD',
                    'THORchain': 'RUNE',
                    'Secret': 'SCRT',
                    'Near': 'NEAR',
                    'Internet Computer Protocol': 'ICP',
                    'Picasso': 'PICA',
                    'Crust Shadow': 'CSM',
                    'Integritee': 'TEER',
                    'Parallel Finance': 'PARA',
                    'HydraDX': 'HDX',
                    'Interlay': 'INTR',
                    'Fetch.ai': 'FET',
                    'NYM': 'NYM',
                    'Terra 2.0': 'LUNA2',
                    'Juno': 'JUNO',
                    'Nodle': 'NODL',
                    'Stacks': 'STX',
                    'Ethereum PoW': 'ETHW',
                    'Aptos': 'APT',
                    'Sui': 'SUI',
                    'Genshiro': 'GENS',
                    'Aventus': 'AVT',
                    'Sei': 'SEI',
                    'OriginTrail': 'OTP',
                    'Celestia': 'TIA',
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'EQuery:Invalid asset pair': errors.BadSymbol,
                'EAPI:Invalid key': errors.AuthenticationError,
                'EFunding:Unknown withdraw key': errors.InvalidAddress,
                'EFunding:Invalid amount': errors.InsufficientFunds,
                'EService:Unavailable': errors.ExchangeNotAvailable,
                'EDatabase:Internal error': errors.ExchangeNotAvailable,
                'EService:Busy': errors.ExchangeNotAvailable,
                'EQuery:Unknown asset': errors.BadSymbol,
                'EAPI:Rate limit exceeded': errors.DDoSProtection,
                'EOrder:Rate limit exceeded': errors.DDoSProtection,
                'EGeneral:Internal error': errors.ExchangeNotAvailable,
                'EGeneral:Temporary lockout': errors.DDoSProtection,
                'EGeneral:Permission denied': errors.PermissionDenied,
                'EOrder:Unknown order': errors.InvalidOrder,
                'EOrder:Order minimum not met': errors.InvalidOrder,
                'EGeneral:Invalid arguments': errors.BadRequest,
                'ESession:Invalid session': errors.AuthenticationError,
                'EAPI:Invalid nonce': errors.InvalidNonce,
                'EFunding:No funding method': errors.BadRequest,
                'EFunding:Unknown asset': errors.BadSymbol,
                'EService:Market in post_only mode': errors.OnMaintenance,
                'EGeneral:Too many requests': errors.DDoSProtection,
                'ETrade:User Locked': errors.AccountSuspended, // {"error":["ETrade:User Locked"]}
            },
        });
    }
    feeToPrecision(symbol, fee) {
        return this.decimalToPrecision(fee, number.TRUNCATE, this.markets[symbol]['precision']['amount'], this.precisionMode);
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name kraken#fetchMarkets
         * @description retrieves data on all markets for kraken
         * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getTradableAssetPairs
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetAssetPairs(params);
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "ADAETH": {
        //                 "altname": "ADAETH",
        //                 "wsname": "ADA\/ETH",
        //                 "aclass_base": "currency",
        //                 "base": "ADA",
        //                 "aclass_quote": "currency",
        //                 "quote": "XETH",
        //                 "lot": "unit",
        //                 "pair_decimals": 7,
        //                 "lot_decimals": 8,
        //                 "lot_multiplier": 1,
        //                 "leverage_buy": [],
        //                 "leverage_sell": [],
        //                 "fees": [
        //                     [0, 0.26],
        //                     [50000, 0.24],
        //                     [100000, 0.22],
        //                     [250000, 0.2],
        //                     [500000, 0.18],
        //                     [1000000, 0.16],
        //                     [2500000, 0.14],
        //                     [5000000, 0.12],
        //                     [10000000, 0.1]
        //                 ],
        //                 "fees_maker": [
        //                     [0, 0.16],
        //                     [50000, 0.14],
        //                     [100000, 0.12],
        //                     [250000, 0.1],
        //                     [500000, 0.08],
        //                     [1000000, 0.06],
        //                     [2500000, 0.04],
        //                     [5000000, 0.02],
        //                     [10000000, 0]
        //                 ],
        //                 "fee_volume_currency": "ZUSD",
        //                 "margin_call": 80,
        //                 "margin_stop": 40,
        //                 "ordermin": "1"
        //             },
        //         }
        //     }
        //
        const markets = this.safeValue(response, 'result', {});
        const keys = Object.keys(markets);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const baseId = this.safeString(market, 'base');
            const quoteId = this.safeString(market, 'quote');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const darkpool = id.indexOf('.d') >= 0;
            const altname = this.safeString(market, 'altname');
            const makerFees = this.safeValue(market, 'fees_maker', []);
            const firstMakerFee = this.safeValue(makerFees, 0, []);
            const firstMakerFeeRate = this.safeString(firstMakerFee, 1);
            let maker = undefined;
            if (firstMakerFeeRate !== undefined) {
                maker = this.parseNumber(Precise["default"].stringDiv(firstMakerFeeRate, '100'));
            }
            const takerFees = this.safeValue(market, 'fees', []);
            const firstTakerFee = this.safeValue(takerFees, 0, []);
            const firstTakerFeeRate = this.safeString(firstTakerFee, 1);
            let taker = undefined;
            if (firstTakerFeeRate !== undefined) {
                taker = this.parseNumber(Precise["default"].stringDiv(firstTakerFeeRate, '100'));
            }
            const leverageBuy = this.safeValue(market, 'leverage_buy', []);
            const leverageBuyLength = leverageBuy.length;
            const precisionPrice = this.parseNumber(this.parsePrecision(this.safeString(market, 'pair_decimals')));
            result.push({
                'id': id,
                'wsId': this.safeString(market, 'wsname'),
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
                    'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'lot_decimals'))),
                    'price': precisionPrice,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber('1'),
                        'max': this.safeNumber(leverageBuy, leverageBuyLength - 1, 1),
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'ordermin'),
                        'max': undefined,
                    },
                    'price': {
                        'min': precisionPrice,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'costmin'),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        result = this.appendInactiveMarkets(result);
        this.options['marketsByAltname'] = this.indexBy(result, 'altname');
        return result;
    }
    safeCurrency(currencyId, currency = undefined) {
        if (currencyId !== undefined) {
            if (currencyId.length > 3) {
                if ((currencyId.indexOf('X') === 0) || (currencyId.indexOf('Z') === 0)) {
                    if (currencyId.indexOf('.') > 0) {
                        return super.safeCurrency(currencyId, currency);
                    }
                    else {
                        currencyId = currencyId.slice(1);
                    }
                }
            }
        }
        return super.safeCurrency(currencyId, currency);
    }
    appendInactiveMarkets(result) {
        // result should be an array to append to
        const precision = {
            'amount': this.parseNumber('1e-8'),
            'price': this.parseNumber('1e-8'),
        };
        const costLimits = { 'min': undefined, 'max': undefined };
        const priceLimits = { 'min': precision['price'], 'max': undefined };
        const amountLimits = { 'min': precision['amount'], 'max': undefined };
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
            result.push(this.extend(defaults, markets[i]));
        }
        return result;
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name kraken#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getAssetInfo
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetAssets(params);
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
        const currencies = this.safeValue(response, 'result', {});
        const ids = Object.keys(currencies);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = currencies[id];
            // todo: will need to rethink the fees
            // see: https://support.kraken.com/hc/en-us/articles/201893608-What-are-the-withdrawal-fees-
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode(this.safeString(currency, 'altname'));
            const precision = this.parseNumber(this.parsePrecision(this.safeString(currency, 'decimals')));
            // assumes all currencies are active except those listed above
            const active = !this.inArray(code, this.options['inactiveCurrencies']);
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
                        'min': precision,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': {},
            };
        }
        return result;
    }
    async fetchTradingFee(symbol, params = {}) {
        /**
         * @method
         * @name kraken#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getTradeVolume
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
            'fee-info': true,
        };
        const response = await this.privatePostTradeVolume(this.extend(request, params));
        //
        //     {
        //        "error": [],
        //        "result": {
        //          "currency": 'ZUSD',
        //          "volume": '0.0000',
        //          "fees": {
        //            "XXBTZUSD": {
        //              "fee": '0.2600',
        //              "minfee": '0.1000',
        //              "maxfee": '0.2600',
        //              "nextfee": '0.2400',
        //              "tiervolume": '0.0000',
        //              "nextvolume": '50000.0000'
        //            }
        //          },
        //          "fees_maker": {
        //            "XXBTZUSD": {
        //              "fee": '0.1600',
        //              "minfee": '0.0000',
        //              "maxfee": '0.1600',
        //              "nextfee": '0.1400',
        //              "tiervolume": '0.0000',
        //              "nextvolume": '50000.0000'
        //            }
        //          }
        //        }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseTradingFee(result, market);
    }
    parseTradingFee(response, market) {
        const makerFees = this.safeValue(response, 'fees_maker', {});
        const takerFees = this.safeValue(response, 'fees', {});
        const symbolMakerFee = this.safeValue(makerFees, market['id'], {});
        const symbolTakerFee = this.safeValue(takerFees, market['id'], {});
        return {
            'info': response,
            'symbol': market['symbol'],
            'maker': this.safeNumber(symbolMakerFee, 'fee'),
            'taker': this.safeNumber(symbolTakerFee, 'fee'),
            'percentage': true,
            'tierBased': true,
        };
    }
    parseBidAsk(bidask, priceKey = 0, amountKey = 1, countOrIdKey = 2) {
        const price = this.safeNumber(bidask, priceKey);
        const amount = this.safeNumber(bidask, amountKey);
        const timestamp = this.safeInteger(bidask, 2);
        return [price, amount, timestamp];
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getOrderBook
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['darkpool']) {
            throw new errors.ExchangeError(this.id + ' fetchOrderBook() does not provide an order book for darkpool symbol ' + symbol);
        }
        const request = {
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit; // 100
        }
        const response = await this.publicGetDepth(this.extend(request, params));
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
        const result = this.safeValue(response, 'result', {});
        let orderbook = this.safeValue(result, market['id']);
        // sometimes kraken returns wsname instead of market id
        // https://github.com/ccxt/ccxt/issues/8662
        const marketInfo = this.safeValue(market, 'info', {});
        const wsName = this.safeValue(marketInfo, 'wsname');
        if (wsName !== undefined) {
            orderbook = this.safeValue(result, wsName, orderbook);
        }
        return this.parseOrderBook(orderbook, symbol);
    }
    parseTicker(ticker, market = undefined) {
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
        const symbol = this.safeSymbol(undefined, market);
        const v = this.safeValue(ticker, 'v', []);
        const baseVolume = this.safeString(v, 1);
        const p = this.safeValue(ticker, 'p', []);
        const vwap = this.safeString(p, 1);
        const quoteVolume = Precise["default"].stringMul(baseVolume, vwap);
        const c = this.safeValue(ticker, 'c', []);
        const last = this.safeString(c, 0);
        const high = this.safeValue(ticker, 'h', []);
        const low = this.safeValue(ticker, 'l', []);
        const bid = this.safeValue(ticker, 'b', []);
        const ask = this.safeValue(ticker, 'a', []);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString(high, 1),
            'low': this.safeString(low, 1),
            'bid': this.safeString(bid, 0),
            'bidVolume': undefined,
            'ask': this.safeString(ask, 0),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeString(ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getTickerInformation
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const request = {};
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            const marketIds = [];
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.markets[symbol];
                if (market['active'] && !market['darkpool']) {
                    marketIds.push(market['id']);
                }
            }
            request['pair'] = marketIds.join(',');
        }
        const response = await this.publicGetTicker(this.extend(request, params));
        const tickers = response['result'];
        const ids = Object.keys(tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket(id);
            const symbol = market['symbol'];
            const ticker = tickers[id];
            result[symbol] = this.parseTicker(ticker, market);
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name kraken#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getTickerInformation
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const darkpool = symbol.indexOf('.d') >= 0;
        if (darkpool) {
            throw new errors.ExchangeError(this.id + ' fetchTicker() does not provide a ticker for darkpool symbol ' + symbol);
        }
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker(this.extend(request, params));
        const ticker = response['result'][market['id']];
        return this.parseTicker(ticker, market);
    }
    parseOHLCV(ohlcv, market = undefined) {
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
            this.safeTimestamp(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 6),
        ];
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getOHLCData
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 720);
        }
        const market = this.market(symbol);
        const parsedTimeframe = this.safeInteger(this.timeframes, timeframe);
        const request = {
            'pair': market['id'],
        };
        if (parsedTimeframe !== undefined) {
            request['interval'] = parsedTimeframe;
        }
        else {
            request['interval'] = timeframe;
        }
        if (since !== undefined) {
            request['since'] = this.parseToInt((since - 1) / 1000);
        }
        const response = await this.publicGetOHLC(this.extend(request, params));
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
        const result = this.safeValue(response, 'result', {});
        const ohlcvs = this.safeValue(result, market['id'], []);
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    parseLedgerEntryType(type) {
        const types = {
            'trade': 'trade',
            'withdrawal': 'transaction',
            'deposit': 'transaction',
            'transfer': 'transfer',
            'margin': 'margin',
        };
        return this.safeString(types, type, type);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         'LTFK7F-N2CUX-PNY4SX': {
        //             "refid": "TSJTGT-DT7WN-GPPQMJ",
        //             "time":  1520102320.555,
        //             "type": "trade",
        //             "aclass": "currency",
        //             "asset": "XETH",
        //             "amount": "0.1087194600",
        //             "fee": "0.0000000000",
        //             "balance": "0.2855851000"
        //         },
        //         ...
        //     }
        //
        const id = this.safeString(item, 'id');
        let direction = undefined;
        const account = undefined;
        const referenceId = this.safeString(item, 'refid');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType(this.safeString(item, 'type'));
        const code = this.safeCurrencyCode(this.safeString(item, 'asset'), currency);
        let amount = this.safeString(item, 'amount');
        if (Precise["default"].stringLt(amount, '0')) {
            direction = 'out';
            amount = Precise["default"].stringAbs(amount);
        }
        else {
            direction = 'in';
        }
        const timestamp = this.safeTimestamp(item, 'time');
        return {
            'info': item,
            'id': id,
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'amount': this.parseNumber(amount),
            'before': undefined,
            'after': this.safeNumber(item, 'balance'),
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fee': {
                'cost': this.safeNumber(item, 'fee'),
                'currency': code,
            },
        };
    }
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getLedgers
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest ledger entry
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        // https://www.kraken.com/features/api#get-ledgers-info
        await this.loadMarkets();
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = this.parseToInt(since / 1000);
        }
        [request, params] = this.handleUntilOption('end', request, params);
        const response = await this.privatePostLedgers(this.extend(request, params));
        // {  error: [],
        //   "result": { ledger: { 'LPUAIB-TS774-UKHP7X': {   refid: "A2B4HBV-L4MDIE-JU4N3N",
        //                                                   "time":  1520103488.314,
        //                                                   "type": "withdrawal",
        //                                                 "aclass": "currency",
        //                                                  "asset": "XETH",
        //                                                 "amount": "-0.2805800000",
        //                                                    "fee": "0.0050000000",
        //                                                "balance": "0.0000051000"           },
        const result = this.safeValue(response, 'result', {});
        const ledger = this.safeValue(result, 'ledger', {});
        const keys = Object.keys(ledger);
        const items = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = ledger[key];
            value['id'] = key;
            items.push(value);
        }
        return this.parseLedger(items, currency, since, limit);
    }
    async fetchLedgerEntriesByIds(ids, code = undefined, params = {}) {
        // https://www.kraken.com/features/api#query-ledgers
        await this.loadMarkets();
        ids = ids.join(',');
        const request = this.extend({
            'id': ids,
        }, params);
        const response = await this.privatePostQueryLedgers(request);
        // {  error: [],
        //   "result": { 'LPUAIB-TS774-UKHP7X': {   refid: "A2B4HBV-L4MDIE-JU4N3N",
        //                                         "time":  1520103488.314,
        //                                         "type": "withdrawal",
        //                                       "aclass": "currency",
        //                                        "asset": "XETH",
        //                                       "amount": "-0.2805800000",
        //                                          "fee": "0.0050000000",
        //                                      "balance": "0.0000051000"           } } }
        const result = response['result'];
        const keys = Object.keys(result);
        const items = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = result[key];
            value['id'] = key;
            items.push(value);
        }
        return this.parseLedger(items);
    }
    async fetchLedgerEntry(id, code = undefined, params = {}) {
        const items = await this.fetchLedgerEntriesByIds([id], code, params);
        return items[0];
    }
    parseTrade(trade, market = undefined) {
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
        //         "id": 'TIMIRG-WUNNE-RRJ6GT', // injected from outside
        //         "ordertxid": 'OQRPN2-LRHFY-HIFA7D',
        //         "postxid": 'TKH2SE-M7IF5-CFI7LT',
        //         "pair": 'USDCUSDT',
        //         "time": 1586340086.457,
        //         "type": 'sell',
        //         "ordertype": 'market',
        //         "price": '0.99860000',
        //         "cost": '22.16892001',
        //         "fee": '0.04433784',
        //         "vol": '22.20000000',
        //         "margin": '0.00000000',
        //         "misc": ''
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
        if (Array.isArray(trade)) {
            timestamp = this.safeTimestamp(trade, 2);
            side = (trade[3] === 's') ? 'sell' : 'buy';
            type = (trade[4] === 'l') ? 'limit' : 'market';
            price = this.safeString(trade, 0);
            amount = this.safeString(trade, 1);
            const tradeLength = trade.length;
            if (tradeLength > 6) {
                id = this.safeString(trade, 6); // artificially added as per #1794
            }
        }
        else if (typeof trade === 'string') {
            id = trade;
        }
        else if ('ordertxid' in trade) {
            const marketId = this.safeString(trade, 'pair');
            const foundMarket = this.findMarketByAltnameOrId(marketId);
            if (foundMarket !== undefined) {
                market = foundMarket;
            }
            else if (marketId !== undefined) {
                // delisted market ids go here
                market = this.getDelistedMarketById(marketId);
            }
            orderId = this.safeString(trade, 'ordertxid');
            id = this.safeString2(trade, 'id', 'postxid');
            timestamp = this.safeTimestamp(trade, 'time');
            side = this.safeString(trade, 'type');
            type = this.safeString(trade, 'ordertype');
            price = this.safeString(trade, 'price');
            amount = this.safeString(trade, 'vol');
            if ('fee' in trade) {
                let currency = undefined;
                if (market !== undefined) {
                    currency = market['quote'];
                }
                fee = {
                    'cost': this.safeString(trade, 'fee'),
                    'currency': currency,
                };
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const cost = this.safeString(trade, 'cost');
        return this.safeTrade({
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getRecentTrades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
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
            request['since'] = since.toString() + '000000'; // expected to be in nanoseconds
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicGetTrades(this.extend(request, params));
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
        const lastTradeId = this.safeString(result, 'last');
        lastTrade.push(lastTradeId);
        return this.parseTrades(trades, market, since, limit);
    }
    parseBalance(response) {
        const balances = this.safeValue(response, 'result', {});
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencyIds = Object.keys(balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode(currencyId);
            const balance = this.safeValue(balances, currencyId, {});
            const account = this.account();
            account['used'] = this.safeString(balance, 'hold_trade');
            account['total'] = this.safeString(balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name kraken#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getExtendedBalance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const response = await this.privatePostBalanceEx(params);
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "ZUSD": {
        //                 "balance": 25435.21,
        //                 "hold_trade": 8249.76
        //             },
        //             "XXBT": {
        //                 "balance": 1.2435,
        //                 "hold_trade": 0.8423
        //             }
        //         }
        //     }
        //
        return this.parseBalance(response);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name kraken#createOrder
         * @see https://docs.kraken.com/rest/#tag/Trading/operation/addOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
         * @param {bool} [params.reduceOnly] *margin only* indicates if this order is to reduce the size of a position
         * @param {float} [params.stopLossPrice] *margin only* the price that a stop loss order is triggered at
         * @param {float} [params.takeProfitPrice] *margin only* the price that a take profit order is triggered at
         * @param {string} [params.trailingAmount] *margin only* the quote amount to trail away from the current market price
         * @param {string} [params.trailingLimitAmount] *margin only* the quote amount away from the trailingAmount
         * @param {string} [params.offset] *margin only* '+' or '-' whether you want the trailingLimitAmount value to be positive or negative, default is negative '-'
         * @param {string} [params.trigger] *margin only* the activation price type, 'last' or 'index', default is 'last'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'ordertype': type,
            'volume': this.amountToPrecision(symbol, amount),
        };
        const orderRequest = this.orderRequest('createOrder()', symbol, type, request, price, params);
        const response = await this.privatePostAddOrder(this.extend(orderRequest[0], orderRequest[1]));
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "descr": { order: 'buy 0.02100000 ETHUSDT @ limit 330.00' },
        //             "txid": [ 'OEKVV2-IH52O-TPL6GZ' ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result');
        return this.parseOrder(result);
    }
    findMarketByAltnameOrId(id) {
        const marketsByAltname = this.safeValue(this.options, 'marketsByAltname', {});
        if (id in marketsByAltname) {
            return marketsByAltname[id];
        }
        else {
            return this.safeMarket(id);
        }
    }
    getDelistedMarketById(id) {
        if (id === undefined) {
            return id;
        }
        let market = this.safeValue(this.options['delistedMarketsById'], id);
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
        }
        else if (id.length === 7) {
            baseIdEnd = 4;
            quoteIdStart = 4;
            quoteIdEnd = 7;
        }
        const baseId = id.slice(baseIdStart, baseIdEnd);
        const quoteId = id.slice(quoteIdStart, quoteIdEnd);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
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
    parseOrderStatus(status) {
        const statuses = {
            'pending': 'open',
            'open': 'open',
            'closed': 'closed',
            'canceled': 'canceled',
            'expired': 'expired',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(status) {
        const statuses = {
            'take-profit': 'market',
            'stop-loss-limit': 'limit',
            'stop-loss': 'market',
            'take-profit-limit': 'limit',
            'trailing-stop-limit': 'limit',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder for regular orders
        //
        //     {
        //         "descr": { order: 'buy 0.02100000 ETHUSDT @ limit 330.00' },
        //         "txid": [ 'OEKVV2-IH52O-TPL6GZ' ]
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
        // editOrder
        //
        //     {
        //         "status": "ok",
        //         "txid": "OAW2BO-7RWEK-PZY5UO",
        //         "originaltxid": "OXL6SS-UPNMC-26WBE7",
        //         "volume": "0.00075000",
        //         "price": "13500.0",
        //         "orders_cancelled": 1,
        //         "descr": {
        //             "order": "buy 0.00075000 XBTUSDT @ limit 13500.0"
        //         }
        //     }
        //  ws - createOrder
        //    {
        //        "descr": 'sell 0.00010000 XBTUSDT @ market',
        //        "event": 'addOrderStatus',
        //        "reqid": 1,
        //        "status": 'ok',
        //        "txid": 'OAVXZH-XIE54-JCYYDG'
        //    }
        //  ws - editOrder
        //    {
        //        "descr": "order edited price = 9000.00000000",
        //        "event": "editOrderStatus",
        //        "originaltxid": "O65KZW-J4AW3-VFS74A",
        //        "reqid": 3,
        //        "status": "ok",
        //        "txid": "OTI672-HJFAO-XOIPPK"
        //    }
        //
        const description = this.safeValue(order, 'descr', {});
        const orderDescription = this.safeString(description, 'order', description);
        let side = undefined;
        let type = undefined;
        let marketId = undefined;
        let price = undefined;
        let amount = undefined;
        let stopPrice = undefined;
        if (orderDescription !== undefined) {
            const parts = orderDescription.split(' ');
            side = this.safeString(parts, 0);
            amount = this.safeString(parts, 1);
            marketId = this.safeString(parts, 2);
            type = this.safeString(parts, 4);
            if (type === 'stop') {
                stopPrice = this.safeString(parts, 6);
                price = this.safeString(parts, 9);
            }
            else if (type === 'limit') {
                price = this.safeString(parts, 5);
            }
        }
        side = this.safeString(description, 'type', side);
        type = this.safeString(description, 'ordertype', type);
        marketId = this.safeString(description, 'pair', marketId);
        const foundMarket = this.findMarketByAltnameOrId(marketId);
        let symbol = undefined;
        if (foundMarket !== undefined) {
            market = foundMarket;
        }
        else if (marketId !== undefined) {
            // delisted market ids go here
            market = this.getDelistedMarketById(marketId);
        }
        const timestamp = this.safeTimestamp(order, 'opentm');
        amount = this.safeString(order, 'vol', amount);
        const filled = this.safeString(order, 'vol_exec');
        let fee = undefined;
        // kraken truncates the cost in the api response so we will ignore it and calculate it from average & filled
        // const cost = this.safeString (order, 'cost');
        price = this.safeString(description, 'price', price);
        if ((price === undefined) || Precise["default"].stringEquals(price, '0')) {
            price = this.safeString(description, 'price2');
        }
        if ((price === undefined) || Precise["default"].stringEquals(price, '0')) {
            price = this.safeString(order, 'price', price);
        }
        const flags = this.safeString(order, 'oflags', '');
        const isPostOnly = flags.indexOf('post') > -1;
        const average = this.safeNumber(order, 'price');
        if (market !== undefined) {
            symbol = market['symbol'];
            if ('fee' in order) {
                const feeCost = this.safeString(order, 'fee');
                fee = {
                    'cost': feeCost,
                    'rate': undefined,
                };
                if (flags.indexOf('fciq') >= 0) {
                    fee['currency'] = market['quote'];
                }
                else if (flags.indexOf('fcib') >= 0) {
                    fee['currency'] = market['base'];
                }
            }
        }
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        let id = this.safeString2(order, 'id', 'txid');
        if ((id === undefined) || (id.slice(0, 1) === '[')) {
            const txid = this.safeValue(order, 'txid');
            id = this.safeString(txid, 0);
        }
        const clientOrderId = this.safeString(order, 'userref');
        const rawTrades = this.safeValue(order, 'trades', []);
        const trades = [];
        for (let i = 0; i < rawTrades.length; i++) {
            const rawTrade = rawTrades[i];
            if (typeof rawTrade === 'string') {
                trades.push(this.safeTrade({ 'id': rawTrade, 'orderId': id, 'symbol': symbol, 'info': {} }));
            }
            else {
                trades.push(rawTrade);
            }
        }
        stopPrice = this.omitZero(this.safeString(order, 'stopprice', stopPrice));
        let stopLossPrice = undefined;
        let takeProfitPrice = undefined;
        if (type.startsWith('take-profit')) {
            takeProfitPrice = this.safeString(description, 'price');
            price = this.omitZero(this.safeString(description, 'price2'));
        }
        else if (type.startsWith('stop-loss')) {
            stopLossPrice = this.safeString(description, 'price');
            price = this.omitZero(this.safeString(description, 'price2'));
        }
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': this.parseOrderType(type),
            'timeInForce': undefined,
            'postOnly': isPostOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'average': average,
            'remaining': undefined,
            'fee': fee,
            'trades': trades,
        }, market);
    }
    orderRequest(method, symbol, type, request, price = undefined, params = {}) {
        const clientOrderId = this.safeString2(params, 'userref', 'clientOrderId');
        params = this.omit(params, ['userref', 'clientOrderId']);
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
        }
        const stopLossTriggerPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeString(params, 'takeProfitPrice');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
        const trailingAmount = this.safeString(params, 'trailingAmount');
        const trailingLimitAmount = this.safeString(params, 'trailingLimitAmount');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isLimitOrder = type.endsWith('limit'); // supporting limit, stop-loss-limit, take-profit-limit, etc
        if (isLimitOrder && !isTrailingAmountOrder) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const reduceOnly = this.safeValue2(params, 'reduceOnly', 'reduce_only');
        if (isStopLossOrTakeProfitTrigger) {
            if (isStopLossTriggerOrder) {
                request['price'] = this.priceToPrecision(symbol, stopLossTriggerPrice);
                if (isLimitOrder) {
                    request['ordertype'] = 'stop-loss-limit';
                }
                else {
                    request['ordertype'] = 'stop-loss';
                }
            }
            else if (isTakeProfitTriggerOrder) {
                request['price'] = this.priceToPrecision(symbol, takeProfitTriggerPrice);
                if (isLimitOrder) {
                    request['ordertype'] = 'take-profit-limit';
                }
                else {
                    request['ordertype'] = 'take-profit';
                }
            }
            if (isLimitOrder) {
                request['price2'] = this.priceToPrecision(symbol, price);
            }
        }
        else if (isTrailingAmountOrder) {
            const trailingActivationPriceType = this.safeString(params, 'trigger', 'last');
            const trailingAmountString = '+' + trailingAmount;
            request['trigger'] = trailingActivationPriceType;
            if (isLimitOrder || (trailingLimitAmount !== undefined)) {
                const offset = this.safeString(params, 'offset', '-');
                const trailingLimitAmountString = offset + this.numberToString(trailingLimitAmount);
                request['price'] = trailingAmountString;
                request['price2'] = trailingLimitAmountString;
                request['ordertype'] = 'trailing-stop-limit';
            }
            else {
                request['price'] = trailingAmountString;
                request['ordertype'] = 'trailing-stop';
            }
        }
        if (reduceOnly) {
            request['reduce_only'] = 'true'; // not using boolean in this case, because the urlencodedNested transforms it into 'True' string
        }
        let close = this.safeValue(params, 'close');
        if (close !== undefined) {
            close = this.extend({}, close);
            const closePrice = this.safeValue(close, 'price');
            if (closePrice !== undefined) {
                close['price'] = this.priceToPrecision(symbol, closePrice);
            }
            const closePrice2 = this.safeValue(close, 'price2'); // stopPrice
            if (closePrice2 !== undefined) {
                close['price2'] = this.priceToPrecision(symbol, closePrice2);
            }
            request['close'] = close;
        }
        const timeInForce = this.safeString2(params, 'timeInForce', 'timeinforce');
        if (timeInForce !== undefined) {
            request['timeinforce'] = timeInForce;
        }
        const isMarket = (type === 'market');
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(isMarket, false, params);
        if (postOnly) {
            request['oflags'] = 'post';
        }
        params = this.omit(params, ['timeInForce', 'reduceOnly', 'stopLossPrice', 'takeProfitPrice', 'trailingAmount', 'trailingLimitAmount', 'offset']);
        return [request, params];
    }
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name kraken#editOrder
         * @description edit a trade order
         * @see https://docs.kraken.com/rest/#tag/Trading/operation/editOrder
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.stopLossPrice] *margin only* the price that a stop loss order is triggered at
         * @param {float} [params.takeProfitPrice] *margin only* the price that a take profit order is triggered at
         * @param {string} [params.trailingAmount] *margin only* the quote price away from the current market price
         * @param {string} [params.trailingLimitAmount] *margin only* the quote amount away from the trailingAmount
         * @param {string} [params.offset] *margin only* '+' or '-' whether you want the trailingLimitAmount value to be positive or negative, default is negative '-'
         * @param {string} [params.trigger] *margin only* the activation price type, 'last' or 'index', default is 'last'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' editOrder() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'txid': id,
            'pair': market['id'],
        };
        if (amount !== undefined) {
            request['volume'] = this.amountToPrecision(symbol, amount);
        }
        const orderRequest = this.orderRequest('editOrder()', symbol, type, request, price, params);
        const response = await this.privatePostEditOrder(this.extend(orderRequest[0], orderRequest[1]));
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "status": "ok",
        //             "txid": "OAW2BO-7RWEK-PZY5UO",
        //             "originaltxid": "OXL6SS-UPNMC-26WBE7",
        //             "volume": "0.00075000",
        //             "price": "13500.0",
        //             "orders_cancelled": 1,
        //             "descr": {
        //                 "order": "buy 0.00075000 XBTUSDT @ limit 13500.0"
        //             }
        //         }
        //     }
        //
        const data = this.safeValue(response, 'result', {});
        return this.parseOrder(data, market);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getOrdersInfo
         * @param {string} symbol not used by kraken fetchOrder
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const clientOrderId = this.safeValue2(params, 'userref', 'clientOrderId');
        const request = {
            'trades': true, // whether or not to include trades in output (optional, default false)
            // 'txid': id, // do not comma separate a list of ids - use fetchOrdersByIds instead
            // 'userref': 'optional', // restrict results to given user reference id (optional)
        };
        let query = params;
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
            query = this.omit(params, ['userref', 'clientOrderId']);
        }
        else {
            request['txid'] = id;
        }
        const response = await this.privatePostQueryOrders(this.extend(request, query));
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
        const result = this.safeValue(response, 'result', []);
        if (!(id in result)) {
            throw new errors.OrderNotFound(this.id + ' fetchOrder() could not find order id ' + id);
        }
        return this.parseOrder(this.extend({ 'id': id }, result[id]));
    }
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getTradesInfo
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const orderTrades = this.safeValue(params, 'trades');
        const tradeIds = [];
        if (orderTrades === undefined) {
            throw new errors.ArgumentsRequired(this.id + " fetchOrderTrades() requires a unified order structure in the params argument or a 'trades' param (an array of trade id strings)");
        }
        else {
            for (let i = 0; i < orderTrades.length; i++) {
                const orderTrade = orderTrades[i];
                if (typeof orderTrade === 'string') {
                    tradeIds.push(orderTrade);
                }
                else {
                    tradeIds.push(orderTrade['id']);
                }
            }
        }
        await this.loadMarkets();
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
        }
        const options = this.safeValue(this.options, 'fetchOrderTrades', {});
        const batchSize = this.safeInteger(options, 'batchSize', 20);
        const numTradeIds = tradeIds.length;
        let numBatches = this.parseToInt(numTradeIds / batchSize);
        numBatches = this.sum(numBatches, 1);
        let result = [];
        for (let j = 0; j < numBatches; j++) {
            const requestIds = [];
            for (let k = 0; k < batchSize; k++) {
                const index = this.sum(j * batchSize, k);
                if (index < numTradeIds) {
                    requestIds.push(tradeIds[index]);
                }
            }
            const request = {
                'txid': requestIds.join(','),
            };
            const response = await this.privatePostQueryTrades(request);
            //
            //     {
            //         "error": [],
            //         "result": {
            //             'TIMIRG-WUNNE-RRJ6GT': {
            //                 "ordertxid": 'OQRPN2-LRHFY-HIFA7D',
            //                 "postxid": 'TKH2SE-M7IF5-CFI7LT',
            //                 "pair": 'USDCUSDT',
            //                 "time": 1586340086.457,
            //                 "type": 'sell',
            //                 "ordertype": 'market',
            //                 "price": '0.99860000',
            //                 "cost": '22.16892001',
            //                 "fee": '0.04433784',
            //                 "vol": '22.20000000',
            //                 "margin": '0.00000000',
            //                 "misc": ''
            //             }
            //         }
            //     }
            //
            const rawTrades = this.safeValue(response, 'result');
            const ids = Object.keys(rawTrades);
            for (let i = 0; i < ids.length; i++) {
                rawTrades[ids[i]]['id'] = ids[i];
            }
            const trades = this.parseTrades(rawTrades, undefined, since, limit);
            const tradesFilteredBySymbol = this.filterBySymbol(trades, symbol);
            result = this.arrayConcat(result, tradesFilteredBySymbol);
        }
        return result;
    }
    async fetchOrdersByIds(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchOrdersByIds
         * @description fetch orders by the list of order id
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getClosedOrders
         * @param {string[]|undefined} ids list of order id
         * @param {object} [params] extra parameters specific to the kraken api endpoint
         * @returns {object[]} a list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const response = await this.privatePostQueryOrders(this.extend({
            'trades': true,
            'txid': ids.join(','), // comma delimited list of transaction ids to query info about (20 maximum)
        }, params));
        const result = this.safeValue(response, 'result', {});
        const orders = [];
        const orderIds = Object.keys(result);
        for (let i = 0; i < orderIds.length; i++) {
            const id = orderIds[i];
            const item = result[id];
            const order = this.parseOrder(this.extend({ 'id': id }, item));
            orders.push(order);
        }
        return orders;
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getTradeHistory
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        const request = {
        // 'type': 'all', // any position, closed position, closing position, no position
        // 'trades': false, // whether or not to include trades related to position in output
        // 'start': 1234567890, // starting unix timestamp or trade tx id of results (exclusive)
        // 'end': 1234567890, // ending unix timestamp or trade tx id of results (inclusive)
        // 'ofs' = result offset
        };
        if (since !== undefined) {
            request['start'] = this.parseToInt(since / 1000);
        }
        const response = await this.privatePostTradesHistory(this.extend(request, params));
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
        const ids = Object.keys(trades);
        for (let i = 0; i < ids.length; i++) {
            trades[ids[i]]['id'] = ids[i];
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        return this.parseTrades(trades, market, since, limit);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kraken#cancelOrder
         * @description cancels an open order
         * @see https://docs.kraken.com/rest/#tag/Trading/operation/cancelOrder
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let response = undefined;
        const clientOrderId = this.safeValue2(params, 'userref', 'clientOrderId', id);
        const request = {
            'txid': clientOrderId, // order id or userref
        };
        params = this.omit(params, ['userref', 'clientOrderId']);
        try {
            response = await this.privatePostCancelOrder(this.extend(request, params));
        }
        catch (e) {
            if (this.last_http_response) {
                if (this.last_http_response.indexOf('EOrder:Unknown order') >= 0) {
                    throw new errors.OrderNotFound(this.id + ' cancelOrder() error ' + this.last_http_response);
                }
            }
            throw e;
        }
        return response;
    }
    async cancelOrders(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name kraken#cancelOrders
         * @description cancel multiple orders
         * @see https://docs.kraken.com/rest/#tag/Trading/operation/cancelOrderBatch
         * @param {string[]} ids open orders transaction ID (txid) or user reference (userref)
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'orders': ids,
        };
        const response = await this.privatePostCancelOrderBatch(this.extend(request, params));
        //
        //     {
        //         "error": [],
        //         "result": {
        //           "count": 2
        //         }
        //     }
        //
        return response;
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name kraken#cancelAllOrders
         * @description cancel all open orders
         * @see https://docs.kraken.com/rest/#tag/Trading/operation/cancelAllOrders
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        return await this.privatePostCancelAll(params);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getOpenOrders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {};
        if (since !== undefined) {
            request['start'] = this.parseToInt(since / 1000);
        }
        let query = params;
        const clientOrderId = this.safeValue2(params, 'userref', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
            query = this.omit(params, ['userref', 'clientOrderId']);
        }
        const response = await this.privatePostOpenOrders(this.extend(request, query));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const result = this.safeValue(response, 'result', {});
        const orders = this.safeValue(result, 'open', []);
        return this.parseOrders(orders, market, since, limit);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getClosedOrders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest entry
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let request = {};
        if (since !== undefined) {
            request['start'] = this.parseToInt(since / 1000);
        }
        let query = params;
        const clientOrderId = this.safeValue2(params, 'userref', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
            query = this.omit(params, ['userref', 'clientOrderId']);
        }
        [request, params] = this.handleUntilOption('end', request, params);
        const response = await this.privatePostClosedOrders(this.extend(request, query));
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
            market = this.market(symbol);
        }
        const result = this.safeValue(response, 'result', {});
        const orders = this.safeValue(result, 'closed', []);
        return this.parseOrders(orders, market, since, limit);
    }
    parseTransactionStatus(status) {
        // IFEX transaction states
        const statuses = {
            'Initial': 'pending',
            'Pending': 'pending',
            'Success': 'ok',
            'Settled': 'pending',
            'Failure': 'failed',
            'Partial': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseNetwork(network) {
        const withdrawMethods = this.safeValue(this.options, 'withdrawMethods', {});
        return this.safeString(withdrawMethods, network, network);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "method": "Ether (Hex)",
        //         "aclass": "currency",
        //         "asset": "XETH",
        //         "refid": "Q2CANKL-LBFVEE-U4Y2WQ",
        //         "txid": "0x57fd704dab1a73c20e24c8696099b695d596924b401b261513cfdab23…",
        //         "info": "0x615f9ba7a9575b0ab4d571b2b36b1b324bd83290",
        //         "amount": "7.9999257900",
        //         "fee": "0.0000000000",
        //         "time":  1529223212,
        //         "status": "Success"
        //     }
        //
        // there can be an additional 'status-prop' field present
        // deposit pending review by exchange => 'on-hold'
        // the deposit is initiated by the exchange => 'return'
        //
        //      {
        //          "type": 'deposit',
        //          "method": 'Fidor Bank AG (Wire Transfer)',
        //          "aclass": 'currency',
        //          "asset": 'ZEUR',
        //          "refid": 'xxx-xxx-xxx',
        //          "txid": '12341234',
        //          "info": 'BANKCODEXXX',
        //          "amount": '38769.08',
        //          "fee": '0.0000',
        //          "time": 1644306552,
        //          "status": 'Success',
        //          status-prop: 'on-hold'
        //      }
        //
        //
        // fetchWithdrawals
        //
        //     {
        //         "method": "Ether",
        //         "aclass": "currency",
        //         "asset": "XETH",
        //         "refid": "A2BF34S-O7LBNQ-UE4Y4O",
        //         "txid": "0x288b83c6b0904d8400ef44e1c9e2187b5c8f7ea3d838222d53f701a15b5c274d",
        //         "info": "0x7cb275a5e07ba943fee972e165d80daa67cb2dd0",
        //         "amount": "9.9950000000",
        //         "fee": "0.0050000000",
        //         "time":  1530481750,
        //         "status": "Success"
        //         "key":"Huobi wallet",
        //         "network":"Tron"
        //         status-prop: 'on-hold' // this field might not be present in some cases
        //     }
        //
        // withdraw
        //
        //     {
        //         "refid": "AGBSO6T-UFMTTQ-I7KGS6"
        //     }
        //
        const id = this.safeString(transaction, 'refid');
        const txid = this.safeString(transaction, 'txid');
        const timestamp = this.safeTimestamp(transaction, 'time');
        const currencyId = this.safeString(transaction, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        const address = this.safeString(transaction, 'info');
        const amount = this.safeNumber(transaction, 'amount');
        let status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const statusProp = this.safeString(transaction, 'status-prop');
        const isOnHoldDeposit = statusProp === 'on-hold';
        const isCancellationRequest = statusProp === 'cancel-pending';
        const isOnHoldWithdrawal = statusProp === 'onhold';
        if (isOnHoldDeposit || isCancellationRequest || isOnHoldWithdrawal) {
            status = 'pending';
        }
        const type = this.safeString(transaction, 'type'); // injected from the outside
        let feeCost = this.safeNumber(transaction, 'fee');
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
            'network': this.parseNetwork(this.safeString(transaction, 'network')),
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
            'datetime': this.iso8601(timestamp),
            'comment': undefined,
            'internal': undefined,
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }
    parseTransactionsByType(type, transactions, code = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = this.parseTransaction(this.extend({
                'type': type,
            }, transactions[i]));
            result.push(transaction);
        }
        return this.filterByCurrencySinceLimit(result, code, since, limit);
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://docs.kraken.com/rest/#tag/Funding/operation/getStatusRecentDeposits
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        // https://www.kraken.com/en-us/help/api#deposit-status
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDeposits() requires a currency code argument');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.privatePostDepositStatus(this.extend(request, params));
        //
        //     {  error: [],
        //       "result": [ { "method": "Ether (Hex)",
        //                     "aclass": "currency",
        //                      "asset": "XETH",
        //                      "refid": "Q2CANKL-LBFVEE-U4Y2WQ",
        //                       "txid": "0x57fd704dab1a73c20e24c8696099b695d596924b401b261513cfdab23…",
        //                       "info": "0x615f9ba7a9575b0ab4d571b2b36b1b324bd83290",
        //                     "amount": "7.9999257900",
        //                        "fee": "0.0000000000",
        //                       "time":  1529223212,
        //                     "status": "Success"                                                       } ] }
        //
        return this.parseTransactionsByType('deposit', response['result'], code, since, limit);
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name kraken#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getServerTime
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        // https://www.kraken.com/en-us/features/api#get-server-time
        const response = await this.publicGetTime(params);
        //
        //    {
        //        "error": [],
        //        "result": {
        //            "unixtime": 1591502873,
        //            "rfc1123": "Sun,  7 Jun 20 04:07:53 +0000"
        //        }
        //    }
        //
        const result = this.safeValue(response, 'result', {});
        return this.safeTimestamp(result, 'unixtime');
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://docs.kraken.com/rest/#tag/Funding/operation/getStatusRecentWithdrawals
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {object} [params.end] End timestamp, withdrawals created strictly after will be not be included in the response
         * @param {boolean} [params.paginate]  default false, when true will automatically paginate by calling this endpoint multiple times
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            params['cursor'] = true;
            return await this.fetchPaginatedCallCursor('fetchWithdrawals', code, since, limit, params, 'next_cursor', 'cursor');
        }
        const request = {};
        if (code !== undefined) {
            const currency = this.currency(code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['since'] = since.toString();
        }
        const response = await this.privatePostWithdrawStatus(this.extend(request, params));
        //
        // with no pagination
        //     {  error: [],
        //       "result": [ { "method": "Ether",
        //                     "aclass": "currency",
        //                      "asset": "XETH",
        //                      "refid": "A2BF34S-O7LBNQ-UE4Y4O",
        //                       "txid": "0x298c83c7b0904d8400ef43e1c9e2287b518f7ea3d838822d53f704a1565c274d",
        //                       "info": "0x7cb275a5e07ba943fee972e165d80daa67cb2dd0",
        //                     "amount": "9.9950000000",
        //                        "fee": "0.0050000000",
        //                       "time":  1530481750,
        //                     "status": "Success"                                                             } ] }
        // with pagination
        //    {
        //        "error":[],
        //        "result":{
        //           "withdrawals":[
        //              {
        //                 "method":"Tether USD (TRC20)",
        //                 "aclass":"currency",
        //                 "asset":"USDT",
        //                 "refid":"BSNFZU2-MEFN4G-J3NEZV",
        //                 "txid":"1c7a642fb7387bbc2c6a2c509fd1ae146937f4cf793b4079a4f0715e3a02615a",
        //                 "info":"TQmdxSuC16EhFg8FZWtYgrfFRosoRF7bCp",
        //                 "amount":"1996.50000000",
        //                 "fee":"2.50000000",
        //                 "time":1669126657,
        //                 "status":"Success",
        //                 "key":"poloniex",
        //                 "network":"Tron"
        //              },
        //             ...
        //           ],
        //           "next_cursor":"HgAAAAAAAABGVFRSd3k1LVF4Y0JQY05Gd0xRY0NxenFndHpybkwBAQH2AwEBAAAAAQAAAAAAAAABAAAAAAAZAAAAAAAAAA=="
        //        }
        //     }
        //
        let rawWithdrawals = undefined;
        const result = this.safeValue(response, 'result');
        if (!Array.isArray(result)) {
            rawWithdrawals = this.addPaginationCursorToResult(result);
        }
        else {
            rawWithdrawals = result;
        }
        return this.parseTransactionsByType('withdrawal', rawWithdrawals, code, since, limit);
    }
    addPaginationCursorToResult(result) {
        const cursor = this.safeString(result, 'next_cursor');
        const data = this.safeValue(result, 'withdrawals');
        const dataLength = data.length;
        if (cursor !== undefined && dataLength > 0) {
            const last = data[dataLength - 1];
            last['next_cursor'] = cursor;
            data[dataLength - 1] = last;
        }
        return data;
    }
    async createDepositAddress(code, params = {}) {
        /**
         * @method
         * @name kraken#createDepositAddress
         * @description create a currency deposit address
         * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositAddresses
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        const request = {
            'new': 'true',
        };
        return await this.fetchDepositAddress(code, this.extend(request, params));
    }
    async fetchDepositMethods(code, params = {}) {
        /**
         * @method
         * @name kraken#fetchDepositMethods
         * @description fetch deposit methods for a currency associated with this account
         * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositMethods
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the kraken api endpoint
         * @returns {object} of deposit methods
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privatePostDepositMethods(this.extend(request, params));
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
        return this.safeValue(response, 'result');
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name kraken#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositAddresses
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        let network = this.safeStringUpper(params, 'network');
        const networks = this.safeValue(this.options, 'networks', {});
        network = this.safeString(networks, network, network); // support ETH > ERC20 aliases
        params = this.omit(params, 'network');
        if ((code === 'USDT') && (network === 'TRC20')) {
            code = code + '-' + network;
        }
        const defaultDepositMethods = this.safeValue(this.options, 'depositMethods', {});
        const defaultDepositMethod = this.safeString(defaultDepositMethods, code);
        let depositMethod = this.safeString(params, 'method', defaultDepositMethod);
        // if the user has specified an exchange-specific method in params
        // we pass it as is, otherwise we take the 'network' unified param
        if (depositMethod === undefined) {
            const depositMethods = await this.fetchDepositMethods(code);
            if (network !== undefined) {
                // find best matching deposit method, or fallback to the first one
                for (let i = 0; i < depositMethods.length; i++) {
                    const entry = this.safeString(depositMethods[i], 'method');
                    if (entry.indexOf(network) >= 0) {
                        depositMethod = entry;
                        break;
                    }
                }
            }
            // if depositMethod was not specified, fallback to the first available deposit method
            if (depositMethod === undefined) {
                const firstDepositMethod = this.safeValue(depositMethods, 0, {});
                depositMethod = this.safeString(firstDepositMethod, 'method');
            }
        }
        const request = {
            'asset': currency['id'],
            'method': depositMethod,
        };
        const response = await this.privatePostDepositAddresses(this.extend(request, params));
        //
        //     {
        //         "error":[],
        //         "result":[
        //             {"address":"0x77b5051f97efa9cc52c9ad5b023a53fc15c200d3","expiretm":"0"}
        //         ]
        //     }
        //
        const result = this.safeValue(response, 'result', []);
        const firstResult = this.safeValue(result, 0, {});
        if (firstResult === undefined) {
            throw new errors.InvalidAddress(this.id + ' privatePostDepositAddresses() returned no addresses for ' + code);
        }
        return this.parseDepositAddress(firstResult, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //     {
        //         "address":"0x77b5051f97efa9cc52c9ad5b023a53fc15c200d3",
        //         "expiretm":"0"
        //     }
        //
        const address = this.safeString(depositAddress, 'address');
        const tag = this.safeString(depositAddress, 'tag');
        currency = this.safeCurrency(undefined, currency);
        const code = currency['code'];
        this.checkAddress(address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name kraken#withdraw
         * @description make a withdrawal
         * @see https://docs.kraken.com/rest/#tag/Funding/operation/withdrawFunds
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        if ('key' in params) {
            await this.loadMarkets();
            const currency = this.currency(code);
            const request = {
                'asset': currency['id'],
                'amount': amount,
                'address': address,
            };
            const response = await this.privatePostWithdraw(this.extend(request, params));
            //
            //     {
            //         "error": [],
            //         "result": {
            //             "refid": "AGBSO6T-UFMTTQ-I7KGS6"
            //         }
            //     }
            //
            const result = this.safeValue(response, 'result', {});
            return this.parseTransaction(result, currency);
        }
        throw new errors.ExchangeError(this.id + " withdraw() requires a 'key' parameter (withdrawal key name, as set up on your account)");
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name kraken#fetchPositions
         * @description fetch all open positions
         * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getOpenPositions
         * @param {string[]|undefined} symbols not used by kraken fetchPositions ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const request = {
        // 'txid': 'comma delimited list of transaction ids to restrict output to',
        // 'docalcs': false, // whether or not to include profit/loss calculations
        // 'consolidation': 'market', // what to consolidate the positions data around, market will consolidate positions based on market pair
        };
        const response = await this.privatePostOpenPositions(this.extend(request, params));
        //
        // no consolidation
        //
        //     {
        //         "error": [],
        //         "result": {
        //             'TGUFMY-FLESJ-VYIX3J': {
        //                 "ordertxid": "O3LRNU-ZKDG5-XNCDFR",
        //                 "posstatus": "open",
        //                 "pair": "ETHUSDT",
        //                 "time":  1611557231.4584,
        //                 "type": "buy",
        //                 "ordertype": "market",
        //                 "cost": "28.49800",
        //                 "fee": "0.07979",
        //                 "vol": "0.02000000",
        //                 "vol_closed": "0.00000000",
        //                 "margin": "14.24900",
        //                 "terms": "0.0200% per 4 hours",
        //                 "rollovertm": "1611571631",
        //                 "misc": "",
        //                 "oflags": ""
        //             }
        //         }
        //     }
        //
        // consolidation by market
        //
        //     {
        //         "error": [],
        //         "result": [
        //             {
        //                 "pair": "ETHUSDT",
        //                 "positions": "1",
        //                 "type": "buy",
        //                 "leverage": "2.00000",
        //                 "cost": "28.49800",
        //                 "fee": "0.07979",
        //                 "vol": "0.02000000",
        //                 "vol_closed": "0.00000000",
        //                 "margin": "14.24900"
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue(response, 'result');
        // todo unify parsePosition/parsePositions
        return result;
    }
    parseAccount(account) {
        const accountByType = {
            'spot': 'Spot Wallet',
            'swap': 'Futures Wallet',
            'future': 'Futures Wallet',
        };
        return this.safeString(accountByType, account, account);
    }
    async transferOut(code, amount, params = {}) {
        /**
         * @description transfer from spot wallet to futures wallet
         * @see https://docs.kraken.com/rest/#tag/User-Funding/operation/walletTransfer
         * @param {str} code Unified currency code
         * @param {float} amount Size of the transfer
         * @param {dict} [params] Exchange specific parameters
         * @returns a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        return await this.transfer(code, amount, 'spot', 'swap', params);
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name kraken#transfer
         * @see https://docs.kraken.com/rest/#tag/User-Funding/operation/walletTransfer
         * @description transfers currencies between sub-accounts (only spot->swap direction is supported)
         * @param {string} code Unified currency code
         * @param {float} amount Size of the transfer
         * @param {string} fromAccount 'spot' or 'Spot Wallet'
         * @param {string} toAccount 'swap' or 'Futures Wallet'
         * @param {object} [params] Exchange specific parameters
         * @returns a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        fromAccount = this.parseAccount(fromAccount);
        toAccount = this.parseAccount(toAccount);
        const request = {
            'amount': this.currencyToPrecision(code, amount),
            'from': fromAccount,
            'to': toAccount,
            'asset': currency['id'],
        };
        if (fromAccount !== 'Spot Wallet') {
            throw new errors.BadRequest(this.id + ' transfer cannot transfer from ' + fromAccount + ' to ' + toAccount + '. Use krakenfutures instead to transfer from the futures account.');
        }
        const response = await this.privatePostWalletTransfer(this.extend(request, params));
        //
        //   {
        //       "error":[
        //       ],
        //       "result":{
        //          "refid":"BOIUSIF-M7DLMN-UXZ3P5"
        //       }
        //   }
        //
        const transfer = this.parseTransfer(response, currency);
        return this.extend(transfer, {
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer
        //
        //    {
        //        "error":[
        //        ],
        //        "result":{
        //           "refid":"BOIUSIF-M7DLMN-UXZ3P5"
        //        }
        //    }
        //
        const result = this.safeValue(transfer, 'result', {});
        const refid = this.safeString(result, 'refid');
        return {
            'info': transfer,
            'id': refid,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeString(currency, 'code'),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': 'sucess',
        };
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys(params).length) {
                // urlencodeNested is used to address https://github.com/ccxt/ccxt/issues/12872
                url += '?' + this.urlencodeNested(params);
            }
        }
        else if (api === 'private') {
            const isCancelOrderBatch = (path === 'CancelOrderBatch');
            this.checkRequiredCredentials();
            const nonce = this.nonce().toString();
            // urlencodeNested is used to address https://github.com/ccxt/ccxt/issues/12872
            if (isCancelOrderBatch) {
                body = this.json(this.extend({ 'nonce': nonce }, params));
            }
            else {
                body = this.urlencodeNested(this.extend({ 'nonce': nonce }, params));
            }
            const auth = this.encode(nonce + body);
            const hash = this.hash(auth, sha256.sha256, 'binary');
            const binary = this.encode(url);
            const binhash = this.binaryConcat(binary, hash);
            const secret = this.base64ToBinary(this.secret);
            const signature = this.hmac(binhash, secret, sha512.sha512, 'base64');
            headers = {
                'API-Key': this.apiKey,
                'API-Sign': signature,
                // 'Content-Type': 'application/x-www-form-urlencoded',
            };
            if (isCancelOrderBatch) {
                headers['Content-Type'] = 'application/json';
            }
            else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }
        else {
            url = '/' + path;
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    nonce() {
        return this.milliseconds();
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 520) {
            throw new errors.ExchangeNotAvailable(this.id + ' ' + code.toString() + ' ' + reason);
        }
        // todo: rewrite this for "broad" exceptions matching
        if (body.indexOf('Invalid order') >= 0) {
            throw new errors.InvalidOrder(this.id + ' ' + body);
        }
        if (body.indexOf('Invalid nonce') >= 0) {
            throw new errors.InvalidNonce(this.id + ' ' + body);
        }
        if (body.indexOf('Insufficient funds') >= 0) {
            throw new errors.InsufficientFunds(this.id + ' ' + body);
        }
        if (body.indexOf('Cancel pending') >= 0) {
            throw new errors.CancelPending(this.id + ' ' + body);
        }
        if (body.indexOf('Invalid arguments:volume') >= 0) {
            throw new errors.InvalidOrder(this.id + ' ' + body);
        }
        if (body.indexOf('Rate limit exceeded') >= 0) {
            throw new errors.RateLimitExceeded(this.id + ' ' + body);
        }
        if (response === undefined) {
            return undefined;
        }
        if (body[0] === '{') {
            if (typeof response !== 'string') {
                if ('error' in response) {
                    const numErrors = response['error'].length;
                    if (numErrors) {
                        const message = this.id + ' ' + body;
                        for (let i = 0; i < response['error'].length; i++) {
                            const error = response['error'][i];
                            this.throwExactlyMatchedException(this.exceptions, error, message);
                        }
                        throw new errors.ExchangeError(message);
                    }
                }
            }
        }
        return undefined;
    }
}

module.exports = kraken;
