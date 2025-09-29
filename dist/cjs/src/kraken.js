'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kraken$1 = require('./abstract/kraken.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var sha512 = require('./static_dependencies/noble-hashes/sha512.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class kraken
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class kraken extends kraken$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': ['US'],
            'version': '0',
            // rate-limits: https://support.kraken.com/hc/en-us/articles/206548367-What-are-the-API-rate-limits-#1
            // for public: 1 req/s
            // for private: every second 0.33 weight added to your allowed capacity (some private endpoints need 1 weight, some need 2)
            'rateLimit': 1000,
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
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': true,
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
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
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
                'fetchStatus': true,
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
                        // rate-limits explained in comment in the top of this file
                        'Assets': 1,
                        'AssetPairs': 1,
                        'Depth': 1.2,
                        'OHLC': 1.2,
                        'Spread': 1,
                        'SystemStatus': 1,
                        'Ticker': 1,
                        'Time': 1,
                        'Trades': 1.2,
                    },
                },
                'private': {
                    'post': {
                        'AddOrder': 0,
                        'AddOrderBatch': 0,
                        'AddExport': 3,
                        'AmendOrder': 0,
                        'Balance': 3,
                        'CancelAll': 3,
                        'CancelAllOrdersAfter': 3,
                        'CancelOrder': 0,
                        'CancelOrderBatch': 0,
                        'ClosedOrders': 3,
                        'DepositAddresses': 3,
                        'DepositMethods': 3,
                        'DepositStatus': 3,
                        'EditOrder': 0,
                        'ExportStatus': 3,
                        'GetWebSocketsToken': 3,
                        'Ledgers': 6,
                        'OpenOrders': 3,
                        'OpenPositions': 3,
                        'QueryLedgers': 3,
                        'QueryOrders': 3,
                        'QueryTrades': 3,
                        'RetrieveExport': 3,
                        'RemoveExport': 3,
                        'BalanceEx': 3,
                        'TradeBalance': 3,
                        'TradesHistory': 6,
                        'TradeVolume': 3,
                        'Withdraw': 3,
                        'WithdrawCancel': 3,
                        'WithdrawInfo': 3,
                        'WithdrawMethods': 3,
                        'WithdrawAddresses': 3,
                        'WithdrawStatus': 3,
                        'WalletTransfer': 3,
                        // sub accounts
                        'CreateSubaccount': 3,
                        'AccountTransfer': 3,
                        // earn
                        'Earn/Allocate': 3,
                        'Earn/Deallocate': 3,
                        'Earn/AllocateStatus': 3,
                        'Earn/DeallocateStatus': 3,
                        'Earn/Strategies': 3,
                        'Earn/Allocations': 3,
                    },
                },
            },
            'commonCurrencies': {
                // about X & Z prefixes and .S & .M suffixes, see comment under fetchCurrencies
                'LUNA': 'LUNC',
                'LUNA2': 'LUNA',
                'REPV2': 'REP',
                'REP': 'REPV1',
                'UST': 'USTC',
                'XBT': 'BTC',
                'XDG': 'DOGE',
                'FEE': 'KFEE',
            },
            'options': {
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'marketsByAltname': {},
                'delistedMarketsById': {},
                // cannot withdraw/deposit these
                'inactiveCurrencies': ['CAD', 'USD', 'JPY', 'GBP'],
                'networks': {
                    'ETH': 'ERC20',
                    'TRX': 'TRC20',
                },
                'depositMethods': {
                    '1INCH': '1inch' + ' ' + '(1INCH)',
                    'AAVE': 'Aave',
                    'ADA': 'ADA',
                    'ALGO': 'Algorand',
                    'ANKR': 'ANKR' + ' ' + '(ANKR)',
                    'ANT': 'Aragon' + ' ' + '(ANT)',
                    'ATOM': 'Cosmos',
                    'AXS': 'Axie Infinity Shards' + ' ' + '(AXS)',
                    'BADGER': 'Bager DAO' + ' ' + '(BADGER)',
                    'BAL': 'Balancer' + ' ' + '(BAL)',
                    'BAND': 'Band Protocol' + ' ' + '(BAND)',
                    'BAT': 'BAT',
                    'BCH': 'Bitcoin Cash',
                    'BNC': 'Bifrost' + ' ' + '(BNC)',
                    'BNT': 'Bancor' + ' ' + '(BNT)',
                    'BTC': 'Bitcoin',
                    'CHZ': 'Chiliz' + ' ' + '(CHZ)',
                    'COMP': 'Compound' + ' ' + '(COMP)',
                    'CQT': '\tCovalent Query Token' + ' ' + '(CQT)',
                    'CRV': 'Curve DAO Token' + ' ' + '(CRV)',
                    'CTSI': 'Cartesi' + ' ' + '(CTSI)',
                    'DAI': 'Dai',
                    'DASH': 'Dash',
                    'DOGE': 'Dogecoin',
                    'DOT': 'Polkadot',
                    'DYDX': 'dYdX' + ' ' + '(DYDX)',
                    'ENJ': 'Enjin Coin' + ' ' + '(ENJ)',
                    'EOS': 'EOS',
                    'ETC': 'Ether Classic' + ' ' + '(Hex)',
                    'ETH': 'Ether' + ' ' + '(Hex)',
                    'EWT': 'Energy Web Token',
                    'FEE': 'Kraken Fee Credit',
                    'FIL': 'Filecoin',
                    'FLOW': 'Flow',
                    'GHST': 'Aavegotchi' + ' ' + '(GHST)',
                    'GNO': 'GNO',
                    'GRT': 'GRT',
                    'ICX': 'Icon',
                    'INJ': 'Injective Protocol' + ' ' + '(INJ)',
                    'KAR': 'Karura' + ' ' + '(KAR)',
                    'KAVA': 'Kava',
                    'KEEP': 'Keep Token' + ' ' + '(KEEP)',
                    'KNC': 'Kyber Network' + ' ' + '(KNC)',
                    'KSM': 'Kusama',
                    'LINK': 'Link',
                    'LPT': 'Livepeer Token' + ' ' + '(LPT)',
                    'LRC': 'Loopring' + ' ' + '(LRC)',
                    'LSK': 'Lisk',
                    'LTC': 'Litecoin',
                    'MANA': 'MANA',
                    'MATIC': 'Polygon' + ' ' + '(MATIC)',
                    'MINA': 'Mina',
                    'MIR': 'Mirror Protocol' + ' ' + '(MIR)',
                    'MKR': 'Maker' + ' ' + '(MKR)',
                    'MLN': 'MLN',
                    'MOVR': 'Moonriver' + ' ' + '(MOVR)',
                    'NANO': 'NANO',
                    'OCEAN': 'OCEAN',
                    'OGN': 'Origin Protocol' + ' ' + '(OGN)',
                    'OMG': 'OMG',
                    'OXT': 'Orchid' + ' ' + '(OXT)',
                    'OXY': 'Oxygen' + ' ' + '(OXY)',
                    'PAXG': 'PAX' + ' ' + '(Gold)',
                    'PERP': 'Perpetual Protocol' + ' ' + '(PERP)',
                    'PHA': 'Phala' + ' ' + '(PHA)',
                    'QTUM': 'QTUM',
                    'RARI': 'Rarible' + ' ' + '(RARI)',
                    'RAY': 'Raydium' + ' ' + '(RAY)',
                    'REN': 'Ren Protocol' + ' ' + '(REN)',
                    'REP': 'REPv2',
                    'REPV1': 'REP',
                    'SAND': 'The Sandbox' + ' ' + '(SAND)',
                    'SC': 'Siacoin',
                    'SDN': 'Shiden' + ' ' + '(SDN)',
                    'SOL': 'Solana',
                    'SNX': 'Synthetix  Network' + ' ' + '(SNX)',
                    'SRM': 'Serum',
                    'STORJ': 'Storj' + ' ' + '(STORJ)',
                    'SUSHI': 'Sushiswap' + ' ' + '(SUSHI)',
                    'TBTC': 'tBTC',
                    'TRX': 'Tron',
                    'UNI': 'UNI',
                    'USDC': 'USDC',
                    'USDT': 'Tether USD' + ' ' + '(ERC20)',
                    'USDT-TRC20': 'Tether USD' + ' ' + '(TRC20)',
                    'WAVES': 'Waves',
                    'WBTC': 'Wrapped Bitcoin' + ' ' + '(WBTC)',
                    'XLM': 'Stellar XLM',
                    'XMR': 'Monero',
                    'XRP': 'Ripple XRP',
                    'XTZ': 'XTZ',
                    'YFI': 'YFI',
                    'ZEC': 'Zcash' + ' ' + '(Transparent)',
                    'ZRX': '0x' + ' ' + '(ZRX)',
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
                'marketHelperProps': ['marketsByAltname', 'delistedMarketsById'], // used by setMarketsFromExchange
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': true,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': true,
                        'iceberg': true, // todo implement
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 720,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
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
                    'EGeneral:Invalid arguments:price': errors.InvalidOrder,
                    'EOrder:Unknown order': errors.InvalidOrder,
                    'EOrder:Invalid price:Invalid price argument': errors.InvalidOrder,
                    'EOrder:Order minimum not met': errors.InvalidOrder,
                    'EOrder:Insufficient funds': errors.InsufficientFunds,
                    'EGeneral:Invalid arguments': errors.BadRequest,
                    'ESession:Invalid session': errors.AuthenticationError,
                    'EAPI:Invalid nonce': errors.InvalidNonce,
                    'EFunding:No funding method': errors.BadRequest,
                    'EFunding:Unknown asset': errors.BadSymbol,
                    'EService:Market in post_only mode': errors.OnMaintenance,
                    'EGeneral:Too many requests': errors.DDoSProtection,
                    'ETrade:User Locked': errors.AccountSuspended, // {"error":["ETrade:User Locked"]}
                },
                'broad': {
                    ':Invalid order': errors.InvalidOrder,
                    ':Invalid arguments:volume': errors.InvalidOrder,
                    ':Invalid arguments:viqc': errors.InvalidOrder,
                    ':Invalid nonce': errors.InvalidNonce,
                    ':IInsufficient funds': errors.InsufficientFunds,
                    ':Cancel pending': errors.CancelPending,
                    ':Rate limit exceeded': errors.RateLimitExceeded,
                },
            },
        });
    }
    feeToPrecision(symbol, fee) {
        return this.decimalToPrecision(fee, number.TRUNCATE, this.markets[symbol]['precision']['amount'], this.precisionMode);
    }
    /**
     * @method
     * @name kraken#fetchMarkets
     * @description retrieves data on all markets for kraken
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTradableAssetPairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const promises = [];
        promises.push(this.publicGetAssetPairs(params));
        if (this.options['adjustForTimeDifference']) {
            promises.push(this.loadTimeDifference());
        }
        const responses = await Promise.all(promises);
        const assetsResponse = responses[0];
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
        const markets = this.safeDict(assetsResponse, 'result', {});
        const cachedCurrencies = this.safeDict(this.options, 'cachedCurrencies', {});
        const keys = Object.keys(markets);
        const result = [];
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const baseId = this.safeString(market, 'base');
            const quoteId = this.safeString(market, 'quote');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const makerFees = this.safeList(market, 'fees_maker', []);
            const firstMakerFee = this.safeList(makerFees, 0, []);
            const firstMakerFeeRate = this.safeString(firstMakerFee, 1);
            let maker = undefined;
            if (firstMakerFeeRate !== undefined) {
                maker = this.parseNumber(Precise["default"].stringDiv(firstMakerFeeRate, '100'));
            }
            const takerFees = this.safeList(market, 'fees', []);
            const firstTakerFee = this.safeList(takerFees, 0, []);
            const firstTakerFeeRate = this.safeString(firstTakerFee, 1);
            let taker = undefined;
            if (firstTakerFeeRate !== undefined) {
                taker = this.parseNumber(Precise["default"].stringDiv(firstTakerFeeRate, '100'));
            }
            const leverageBuy = this.safeList(market, 'leverage_buy', []);
            const leverageBuyLength = leverageBuy.length;
            const precisionPrice = this.parseNumber(this.parsePrecision(this.safeString(market, 'pair_decimals')));
            let precisionAmount = this.parseNumber(this.parsePrecision(this.safeString(market, 'lot_decimals')));
            const spot = true;
            // fix https://github.com/freqtrade/freqtrade/issues/11765#issuecomment-2894224103
            if ((base in cachedCurrencies)) {
                const currency = cachedCurrencies[base];
                const currencyPrecision = this.safeNumber(currency, 'precision');
                // if currency precision is greater (e.g. 0.01) than market precision (e.g. 0.001)
                if (currencyPrecision > precisionAmount) {
                    precisionAmount = currencyPrecision;
                }
            }
            const status = this.safeString(market, 'status');
            const isActive = status === 'online';
            result.push({
                'id': id,
                'wsId': this.safeString(market, 'wsname'),
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'altname': market['altname'],
                'type': 'spot',
                'spot': spot,
                'margin': (leverageBuyLength > 0),
                'swap': false,
                'future': false,
                'option': false,
                'active': isActive,
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
                    'amount': precisionAmount,
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
                        'min': undefined,
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
        this.options['marketsByAltname'] = this.indexBy(result, 'altname');
        return result;
    }
    /**
     * @method
     * @name kraken#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.kraken.com/api/docs/rest-api/get-system-status/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.publicGetSystemStatus(params);
        //
        // {
        //     error: [],
        //     result: { status: 'online', timestamp: '2024-07-22T16:34:44Z' }
        // }
        //
        const result = this.safeDict(response, 'result');
        const statusRaw = this.safeString(result, 'status');
        return {
            'status': (statusRaw === 'online') ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name kraken#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getAssetInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetAssets(params);
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "ATOM": {
        //                 "aclass": "currency",
        //                 "altname": "ATOM",
        //                 "collateral_value": "0.7",
        //                 "decimals": 8,
        //                 "display_decimals": 6,
        //                 "margin_rate": 0.02,
        //                 "status": "enabled",
        //             },
        //             "ATOM.S": {
        //                 "aclass": "currency",
        //                 "altname": "ATOM.S",
        //                 "decimals": 8,
        //                 "display_decimals": 6,
        //                 "status": "enabled",
        //             },
        //             "XXBT": {
        //                 "aclass": "currency",
        //                 "altname": "XBT",
        //                 "decimals": 10,
        //                 "display_decimals": 5,
        //                 "margin_rate": 0.01,
        //                 "status": "enabled",
        //             },
        //             "XETH": {
        //                 "aclass": "currency",
        //                 "altname": "ETH",
        //                 "decimals": 10,
        //                 "display_decimals": 5
        //                 "margin_rate": 0.02,
        //                 "status": "enabled",
        //             },
        //             "XBT.M": {
        //                 "aclass": "currency",
        //                 "altname": "XBT.M",
        //                 "decimals": 10,
        //                 "display_decimals": 5
        //                 "status": "enabled",
        //             },
        //             "ETH.M": {
        //                 "aclass": "currency",
        //                 "altname": "ETH.M",
        //                 "decimals": 10,
        //                 "display_decimals": 5
        //                 "status": "enabled",
        //             },
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
            //
            // Notes about abbreviations:
            // Z and X prefixes: https://support.kraken.com/hc/en-us/articles/360001206766-Bitcoin-currency-code-XBT-vs-BTC
            // S and M suffixes: https://support.kraken.com/hc/en-us/articles/360039879471-What-is-Asset-S-and-Asset-M-
            //
            let code = this.safeCurrencyCode(id);
            // the below can not be reliable done in `safeCurrencyCode`, so we have to do it here
            if (id.indexOf('.') < 0) {
                const altName = this.safeString(currency, 'altname');
                // handle cases like below:
                //
                //  id   | altname
                // ---------------
                // XXBT  |  XBT
                // ZUSD  |  USD
                if (id !== altName && (id.startsWith('X') || id.startsWith('Z'))) {
                    code = this.safeCurrencyCode(altName);
                    // also, add map in commonCurrencies:
                    this.commonCurrencies[id] = code;
                }
                else {
                    code = this.safeCurrencyCode(id);
                }
            }
            const isFiat = code.indexOf('.HOLD') >= 0;
            result[code] = this.safeCurrencyStructure({
                'id': id,
                'code': code,
                'info': currency,
                'name': this.safeString(currency, 'altname'),
                'active': this.safeString(currency, 'status') === 'enabled',
                'type': isFiat ? 'fiat' : 'crypto',
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': this.parseNumber(this.parsePrecision(this.safeString(currency, 'decimals'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': {},
            });
        }
        return result;
    }
    safeCurrencyCode(currencyId, currency = undefined) {
        if (currencyId === undefined) {
            return currencyId;
        }
        if (currencyId.indexOf('.') > 0) {
            // if ID contains .M, .S or .F, then it can't contain X or Z prefix. in such case, ID equals to ALTNAME
            const parts = currencyId.split('.');
            const firstPart = this.safeString(parts, 0);
            const secondPart = this.safeString(parts, 1);
            return super.safeCurrencyCode(firstPart, currency) + '.' + secondPart;
        }
        return super.safeCurrencyCode(currencyId, currency);
    }
    /**
     * @method
     * @name kraken#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getTradeVolume
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
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
            'maker': this.parseNumber(Precise["default"].stringDiv(this.safeString(symbolMakerFee, 'fee'), '100')),
            'taker': this.parseNumber(Precise["default"].stringDiv(this.safeString(symbolTakerFee, 'fee'), '100')),
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
    /**
     * @method
     * @name kraken#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getOrderBook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
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
            'bidVolume': this.safeString(bid, 2),
            'ask': this.safeString(ask, 0),
            'askVolume': this.safeString(ask, 2),
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
    /**
     * @method
     * @name kraken#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTickerInformation
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            const marketIds = [];
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.markets[symbol];
                if (market['active']) {
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
    /**
     * @method
     * @name kraken#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTickerInformation
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
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
    /**
     * @method
     * @name kraken#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.kraken.com/api/docs/rest-api/get-ohlc-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
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
            const scaledSince = this.parseToInt(since / 1000);
            const timeFrameInSeconds = parsedTimeframe * 60;
            request['since'] = this.numberToString(scaledSince - timeFrameInSeconds); // expected to be in seconds
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
        const ohlcvs = this.safeList(result, market['id'], []);
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
        const currencyId = this.safeString(item, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        let amount = this.safeString(item, 'amount');
        if (Precise["default"].stringLt(amount, '0')) {
            direction = 'out';
            amount = Precise["default"].stringAbs(amount);
        }
        else {
            direction = 'in';
        }
        const timestamp = this.safeIntegerProduct(item, 'time', 1000);
        return this.safeLedgerEntry({
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
        }, currency);
    }
    /**
     * @method
     * @name kraken#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getLedgers
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {int} [params.end] timestamp in seconds of the latest ledger entry
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        // https://www.kraken.com/features/api#get-ledgers-info
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = this.parseToInt(since / 1000);
        }
        const until = this.safeStringN(params, ['until', 'till']);
        if (until !== undefined) {
            params = this.omit(params, ['until', 'till']);
            const untilDivided = Precise["default"].stringDiv(until, '1000');
            request['end'] = this.parseToInt(Precise["default"].stringAdd(untilDivided, '1'));
        }
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
        // fetchMyTrades
        //
        //     {
        //         "ordertxid": "OSJVN7-A2AE-63WZV",
        //         "postxid": "TBP7O6-PNXI-CONU",
        //         "pair": "XXBTZUSD",
        //         "time": 1710429248.3052235,
        //         "type": "sell",
        //         "ordertype": "liquidation market",
        //         "price": "72026.50000",
        //         "cost": "7.20265",
        //         "fee": "0.01873",
        //         "vol": "0.00010000",
        //         "margin": "1.44053",
        //         "leverage": "5",
        //         "misc": "closing",
        //         "trade_id": 68230622,
        //         "maker": false
        //     }
        //
        // watchTrades
        //
        //     {
        //         "symbol": "BTC/USD",
        //         "side": "buy",
        //         "price": 109601.2,
        //         "qty": 0.04561994,
        //         "ord_type": "market",
        //         "trade_id": 83449369,
        //         "timestamp": "2025-05-27T11:24:03.847761Z"
        //     }
        //
        let timestamp = undefined;
        let datetime = undefined;
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
        else {
            symbol = this.safeString(trade, 'symbol');
            datetime = this.safeString(trade, 'timestamp');
            id = this.safeString(trade, 'trade_id');
            side = this.safeString(trade, 'side');
            type = this.safeString(trade, 'ord_type');
            price = this.safeString(trade, 'price');
            amount = this.safeString(trade, 'qty');
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const cost = this.safeString(trade, 'cost');
        const maker = this.safeBool(trade, 'maker');
        let takerOrMaker = undefined;
        if (maker !== undefined) {
            takerOrMaker = maker ? 'maker' : 'taker';
        }
        if (datetime === undefined) {
            datetime = this.iso8601(timestamp);
        }
        else {
            timestamp = this.parse8601(datetime);
        }
        return this.safeTrade({
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name kraken#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getRecentTrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const id = market['id'];
        const request = {
            'pair': id,
        };
        // https://support.kraken.com/hc/en-us/articles/218198197-How-to-pull-all-trade-data-using-the-Kraken-REST-API
        // https://github.com/ccxt/ccxt/issues/5677
        if (since !== undefined) {
            request['since'] = this.numberToString(this.parseToInt(since / 1000)); // expected to be in seconds
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
        trades[length - 1] = lastTrade;
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
    /**
     * @method
     * @name kraken#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getExtendedBalance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
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
    /**
     * @method
     * @name kraken#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/addOrder
     * @param {string} symbol unified symbol of the market to create an order in (only USD markets are supported)
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketOrderWithCost(symbol, side, cost, params = {}) {
        await this.loadMarkets();
        // only buy orders are supported by the endpoint
        const req = {
            'cost': cost,
        };
        return await this.createOrder(symbol, 'market', side, cost, undefined, this.extend(req, params));
    }
    /**
     * @method
     * @name kraken#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol, side and cost
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/addOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        return await this.createMarketOrderWithCost(symbol, 'buy', cost, params);
    }
    /**
     * @method
     * @name kraken#createOrder
     * @description create a trade order
     * @see https://docs.kraken.com/api/docs/rest-api/add-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {bool} [params.reduceOnly] *margin only* indicates if this order is to reduce the size of a position
     * @param {float} [params.stopLossPrice] *margin only* the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *margin only* the price that a take profit order is triggered at
     * @param {string} [params.trailingAmount] *margin only* the quote amount to trail away from the current market price
     * @param {string} [params.trailingPercent] *margin only* the percent to trail away from the current market price
     * @param {string} [params.trailingLimitAmount] *margin only* the quote amount away from the trailingAmount
     * @param {string} [params.trailingLimitPercent] *margin only* the percent away from the trailingAmount
     * @param {string} [params.offset] *margin only* '+' or '-' whether you want the trailingLimitAmount value to be positive or negative, default is negative '-'
     * @param {string} [params.trigger] *margin only* the activation price type, 'last' or 'index', default is 'last'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'ordertype': type,
            'volume': this.amountToPrecision(symbol, amount),
        };
        const orderRequest = this.orderRequest('createOrder', symbol, type, request, amount, price, params);
        const flags = this.safeString(orderRequest[0], 'oflags', '');
        const isUsingCost = flags.indexOf('viqc') > -1;
        const response = await this.privatePostAddOrder(this.extend(orderRequest[0], orderRequest[1]));
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "descr": { order: 'buy 0.02100000 ETHUSDT @ limit 330.00' }, // see more examples in "parseOrder"
        //             "txid": [ 'OEKVV2-IH52O-TPL6GZ' ]
        //         }
        //     }
        //
        const result = this.safeDict(response, 'result');
        result['usingCost'] = isUsingCost;
        // it's impossible to know if the order was created using cost or base currency
        // becuase kraken only returns something like this: { order: 'buy 10.00000000 LTCUSD @ market' }
        // this usingCost flag is used to help the parsing but omited from the order
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
            // we dont add "space" delimited orders here (eg. stop loss) because they need separate parsing
            'take-profit': 'market',
            'stop-loss': 'market',
            'stop-loss-limit': 'limit',
            'take-profit-limit': 'limit',
            'trailing-stop-limit': 'limit',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "descr": {
        //            "order": "buy 0.02100000 ETHUSDT @ limit 330.00" // limit orders
        //                     "buy 0.12345678 ETHUSDT @ market" // market order
        //                     "sell 0.28002676 ETHUSDT @ stop loss 0.0123 -> limit 0.0.1222" // stop order
        //                     "sell 0.00100000 ETHUSDT @ stop loss 2677.00 -> limit 2577.00 with 5:1 leverage"
        //                     "buy 0.10000000 LTCUSDT @ take profit 75.00000 -> limit 74.00000"
        //                     "sell 10.00000000 XRPEUR @ trailing stop +50.0000%" // trailing stop
        //         },
        //         "txid": [ 'OEKVV2-IH52O-TPL6GZ' ]
        //     }
        //
        // editOrder
        //
        //     {
        //         "amend_id": "TJSMEH-AA67V-YUSQ6O"
        //     }
        //
        //  ws - createOrder
        //     {
        //         "order_id": "OXM2QD-EALR2-YBAVEU"
        //     }
        //
        //  ws - editOrder
        //     {
        //         "amend_id": "TJSMEH-AA67V-YUSQ6O",
        //         "order_id": "OXM2QD-EALR2-YBAVEU"
        //     }
        //
        //  {
        //      "error": [],
        //      "result": {
        //          "open": {
        //              "OXVPSU-Q726F-L3SDEP": {
        //                  "refid": null,
        //                  "userref": 0,
        //                  "status": "open",
        //                  "opentm": 1706893367.4656649,
        //                  "starttm": 0,
        //                  "expiretm": 0,
        //                  "descr": {
        //                      "pair": "XRPEUR",
        //                      "type": "sell",
        //                      "ordertype": "trailing-stop",
        //                      "price": "+50.0000%",
        //                      "price2": "0",
        //                      "leverage": "none",
        //                      "order": "sell 10.00000000 XRPEUR @ trailing stop +50.0000%",
        //                      "close": ""
        //                  },
        //                  "vol": "10.00000000",
        //                  "vol_exec": "0.00000000",
        //                  "cost": "0.00000000",
        //                  "fee": "0.00000000",
        //                  "price": "0.00000000",
        //                  "stopprice": "0.23424000",
        //                  "limitprice": "0.46847000",
        //                  "misc": "",
        //                  "oflags": "fciq",
        //                  "trigger": "index"
        //              }
        //      }
        //  }
        //
        // fetchOpenOrders
        //
        //      {
        //         "refid": null,
        //         "userref": null,
        //         "cl_ord_id": "1234",
        //         "status": "open",
        //         "opentm": 1733815269.370054,
        //         "starttm": 0,
        //         "expiretm": 0,
        //         "descr": {
        //             "pair": "XBTUSD",
        //             "type": "buy",
        //             "ordertype": "limit",
        //             "price": "70000.0",
        //             "price2": "0",
        //             "leverage": "none",
        //             "order": "buy 0.00010000 XBTUSD @ limit 70000.0",
        //             "close": ""
        //         },
        //         "vol": "0.00010000",
        //         "vol_exec": "0.00000000",
        //         "cost": "0.00000",
        //         "fee": "0.00000",
        //         "price": "0.00000",
        //         "stopprice": "0.00000",
        //         "limitprice": "0.00000",
        //         "misc": "",
        //         "oflags": "fciq"
        //     }
        //
        const isUsingCost = this.safeBool(order, 'usingCost', false);
        order = this.omit(order, 'usingCost');
        const description = this.safeDict(order, 'descr', {});
        const orderDescriptionObj = this.safeDict(order, 'descr'); // can be null
        let orderDescription = undefined;
        if (orderDescriptionObj !== undefined) {
            orderDescription = this.safeString(orderDescriptionObj, 'order');
        }
        else {
            orderDescription = this.safeString(order, 'descr');
        }
        let side = undefined;
        let rawType = undefined;
        let marketId = undefined;
        let price = undefined;
        let amount = undefined;
        let cost = undefined;
        let triggerPrice = undefined;
        if (orderDescription !== undefined) {
            const parts = orderDescription.split(' ');
            side = this.safeString(parts, 0);
            if (!isUsingCost) {
                amount = this.safeString(parts, 1);
            }
            else {
                cost = this.safeString(parts, 1);
            }
            marketId = this.safeString(parts, 2);
            const part4 = this.safeString(parts, 4);
            const part5 = this.safeString(parts, 5);
            if (part4 === 'limit' || part4 === 'market') {
                rawType = part4; // eg, limit, market
            }
            else {
                rawType = part4 + ' ' + part5; // eg. stop loss, take profit, trailing stop
            }
            if (rawType === 'stop loss' || rawType === 'take profit') {
                triggerPrice = this.safeString(parts, 6);
                price = this.safeString(parts, 9);
            }
            else if (rawType === 'limit') {
                price = this.safeString(parts, 5);
            }
        }
        side = this.safeString(description, 'type', side);
        rawType = this.safeString(description, 'ordertype', rawType); // orderType has dash, e.g. trailing-stop
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
        // when type = trailing stop returns price = '+50.0000%'
        if ((price !== undefined) && (price.endsWith('%') || Precise["default"].stringEquals(price, '0.00000') || Precise["default"].stringEquals(price, '0'))) {
            price = undefined; // this is not the price we want
        }
        if (price === undefined) {
            price = this.safeString(description, 'price2');
            price = this.safeString2(order, 'limitprice', 'price', price);
        }
        const flags = this.safeString(order, 'oflags', '');
        let isPostOnly = flags.indexOf('post') > -1;
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
        let id = this.safeStringN(order, ['id', 'txid', 'order_id', 'amend_id']);
        if ((id === undefined) || (id.startsWith('['))) {
            const txid = this.safeList(order, 'txid');
            id = this.safeString(txid, 0);
        }
        const userref = this.safeString(order, 'userref');
        const clientOrderId = this.safeString(order, 'cl_ord_id', userref);
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
        // as mentioned in #24192 PR, this field is not something consistent/actual
        // triggerPrice = this.omitZero (this.safeString (order, 'stopprice', triggerPrice));
        let stopLossPrice = undefined;
        let takeProfitPrice = undefined;
        // the dashed strings are not provided from fields (eg. fetch order)
        // while spaced strings from "order" sentence (when other fields not available)
        if (rawType !== undefined) {
            if (rawType.startsWith('take-profit')) {
                takeProfitPrice = this.safeString(description, 'price');
                price = this.omitZero(this.safeString(description, 'price2'));
            }
            else if (rawType.startsWith('stop-loss')) {
                stopLossPrice = this.safeString(description, 'price');
                price = this.omitZero(this.safeString(description, 'price2'));
            }
            else if (rawType === 'take profit') {
                takeProfitPrice = triggerPrice;
            }
            else if (rawType === 'stop loss') {
                stopLossPrice = triggerPrice;
            }
        }
        let finalType = this.parseOrderType(rawType);
        // unlike from endpoints which provide eg: "take-profit-limit"
        // for "space-delimited" orders we dont have market/limit suffixes, their format is
        // eg: `stop loss > limit 123`, so we need to parse them manually
        if (this.inArray(finalType, ['stop loss', 'take profit'])) {
            finalType = (price === undefined) ? 'market' : 'limit';
        }
        const amendId = this.safeString(order, 'amend_id');
        if (amendId !== undefined) {
            isPostOnly = undefined;
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
            'type': finalType,
            'timeInForce': undefined,
            'postOnly': isPostOnly,
            'side': side,
            'price': price,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'average': average,
            'remaining': undefined,
            'reduceOnly': this.safeBool2(order, 'reduceOnly', 'reduce_only'),
            'fee': fee,
            'trades': trades,
        }, market);
    }
    orderRequest(method, symbol, type, request, amount, price = undefined, params = {}) {
        const clientOrderId = this.safeString(params, 'clientOrderId');
        params = this.omit(params, ['clientOrderId']);
        if (clientOrderId !== undefined) {
            request['cl_ord_id'] = clientOrderId;
        }
        const stopLossTriggerPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeString(params, 'takeProfitPrice');
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
        const trailingAmount = this.safeString(params, 'trailingAmount');
        const trailingPercent = this.safeString(params, 'trailingPercent');
        const trailingLimitAmount = this.safeString(params, 'trailingLimitAmount');
        const trailingLimitPercent = this.safeString(params, 'trailingLimitPercent');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isLimitOrder = type.endsWith('limit'); // supporting limit, stop-loss-limit, take-profit-limit, etc
        const isMarketOrder = type === 'market';
        const cost = this.safeString(params, 'cost');
        const flags = this.safeString(params, 'oflags');
        params = this.omit(params, ['cost', 'oflags']);
        const isViqcOrder = (flags !== undefined) && (flags.indexOf('viqc') > -1); // volume in quote currency
        if (isMarketOrder && (cost !== undefined || isViqcOrder)) {
            if (cost === undefined && (amount !== undefined)) {
                request['volume'] = this.costToPrecision(symbol, this.numberToString(amount));
            }
            else {
                request['volume'] = this.costToPrecision(symbol, cost);
            }
            const extendedOflags = (flags !== undefined) ? flags + ',viqc' : 'viqc';
            request['oflags'] = extendedOflags;
        }
        else if (isLimitOrder && !isTrailingAmountOrder && !isTrailingPercentOrder) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only');
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
        else if (isTrailingAmountOrder || isTrailingPercentOrder) {
            let trailingPercentString = undefined;
            if (trailingPercent !== undefined) {
                trailingPercentString = (trailingPercent.endsWith('%')) ? ('+' + trailingPercent) : ('+' + trailingPercent + '%');
            }
            const trailingAmountString = (trailingAmount !== undefined) ? '+' + trailingAmount : undefined; // must use + for this
            const offset = this.safeString(params, 'offset', '-'); // can use + or - for this
            const trailingLimitAmountString = (trailingLimitAmount !== undefined) ? offset + this.numberToString(trailingLimitAmount) : undefined;
            const trailingActivationPriceType = this.safeString(params, 'trigger', 'last');
            request['trigger'] = trailingActivationPriceType;
            if (isLimitOrder || (trailingLimitAmount !== undefined) || (trailingLimitPercent !== undefined)) {
                request['ordertype'] = 'trailing-stop-limit';
                if (trailingLimitPercent !== undefined) {
                    const trailingLimitPercentString = (trailingLimitPercent.endsWith('%')) ? (offset + trailingLimitPercent) : (offset + trailingLimitPercent + '%');
                    request['price'] = trailingPercentString;
                    request['price2'] = trailingLimitPercentString;
                }
                else if (trailingLimitAmount !== undefined) {
                    request['price'] = trailingAmountString;
                    request['price2'] = trailingLimitAmountString;
                }
            }
            else {
                request['ordertype'] = 'trailing-stop';
                if (trailingPercent !== undefined) {
                    request['price'] = trailingPercentString;
                }
                else {
                    request['price'] = trailingAmountString;
                }
            }
        }
        if (reduceOnly) {
            if (method === 'createOrderWs') {
                request['reduce_only'] = true; // ws request can't have stringified bool
            }
            else {
                request['reduce_only'] = 'true'; // not using boolean in this case, because the urlencodedNested transforms it into 'True' string
            }
        }
        let close = this.safeDict(params, 'close');
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
            const extendedPostFlags = (flags !== undefined) ? flags + ',post' : 'post';
            request['oflags'] = extendedPostFlags;
        }
        if ((flags !== undefined) && !('oflags' in request)) {
            request['oflags'] = flags;
        }
        params = this.omit(params, ['timeInForce', 'reduceOnly', 'stopLossPrice', 'takeProfitPrice', 'trailingAmount', 'trailingPercent', 'trailingLimitAmount', 'trailingLimitPercent', 'offset']);
        return [request, params];
    }
    /**
     * @method
     * @name kraken#editOrder
     * @description edit a trade order
     * @see https://docs.kraken.com/api/docs/rest-api/amend-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.trailingLimitAmount] the quote amount away from the trailingAmount
     * @param {string} [params.trailingLimitPercent] the percent away from the trailingAmount
     * @param {string} [params.offset] '+' or '-' whether you want the trailingLimitAmount value to be positive or negative
     * @param {boolean} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.clientOrderId] the orders client order id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' editOrder() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        let request = {
            'txid': id,
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'cl_ord_id');
        if (clientOrderId !== undefined) {
            request['cl_ord_id'] = clientOrderId;
            params = this.omit(params, ['clientOrderId', 'cl_ord_id']);
            request = this.omit(request, 'txid');
        }
        const isMarket = (type === 'market');
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(isMarket, false, params);
        if (postOnly) {
            request['post_only'] = 'true'; // not using boolean in this case, because the urlencodedNested transforms it into 'True' string
        }
        if (amount !== undefined) {
            request['order_qty'] = this.amountToPrecision(symbol, amount);
        }
        if (price !== undefined) {
            request['limit_price'] = this.priceToPrecision(symbol, price);
        }
        let allTriggerPrices = this.safeStringN(params, ['stopLossPrice', 'takeProfitPrice', 'trailingAmount', 'trailingPercent', 'trailingLimitAmount', 'trailingLimitPercent']);
        if (allTriggerPrices !== undefined) {
            const offset = this.safeString(params, 'offset');
            params = this.omit(params, ['stopLossPrice', 'takeProfitPrice', 'trailingAmount', 'trailingPercent', 'trailingLimitAmount', 'trailingLimitPercent', 'offset']);
            if (offset !== undefined) {
                allTriggerPrices = offset + allTriggerPrices;
                request['trigger_price'] = allTriggerPrices;
            }
            else {
                request['trigger_price'] = this.priceToPrecision(symbol, allTriggerPrices);
            }
        }
        const response = await this.privatePostAmendOrder(this.extend(request, params));
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "amend_id": "TJSMEH-AA67V-YUSQ6O"
        //         }
        //     }
        //
        const result = this.safeDict(response, 'result', {});
        return this.parseOrder(result, market);
    }
    /**
     * @method
     * @name kraken#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getOrdersInfo
     * @param {string} id order id
     * @param {string} symbol not used by kraken fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const clientOrderId = this.safeValue2(params, 'userref', 'clientOrderId');
        const request = {
            'trades': true,
            'txid': id, // do not comma separate a list of ids - use fetchOrdersByIds instead
            // 'userref': 'optional', // restrict results to given user reference id (optional)
        };
        let query = params;
        if (clientOrderId !== undefined) {
            request['userref'] = clientOrderId;
            query = this.omit(params, ['userref', 'clientOrderId']);
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
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
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
    /**
     * @method
     * @name kraken#fetchOrdersByIds
     * @description fetch orders by the list of order id
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getClosedOrders
     * @param {string[]} [ids] list of order id
     * @param {string} [symbol] unified ccxt market symbol
     * @param {object} [params] extra parameters specific to the kraken api endpoint
     * @returns {object[]} a list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersByIds(ids, symbol = undefined, params = {}) {
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
    /**
     * @method
     * @name kraken#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.kraken.com/api/docs/rest-api/get-trade-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade entry
     * @param {int} [params.end] timestamp in seconds of the latest trade entry
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
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
        const until = this.safeStringN(params, ['until', 'till']);
        if (until !== undefined) {
            params = this.omit(params, ['until', 'till']);
            const untilDivided = Precise["default"].stringDiv(until, '1000');
            request['end'] = this.parseToInt(Precise["default"].stringAdd(untilDivided, '1'));
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
        //                     "leverage": "5",
        //                     "misc": ""
        //                     "trade_id": 68230622,
        //                     "maker": false
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
    /**
     * @method
     * @name kraken#cancelOrder
     * @description cancels an open order
     * @see https://docs.kraken.com/api/docs/rest-api/cancel-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the orders client order id
     * @param {int} [params.userref] the orders user reference id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let response = undefined;
        const requestId = this.safeValue(params, 'userref', id); // string or integer
        params = this.omit(params, 'userref');
        let request = {
            'txid': requestId, // order id or userref
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'cl_ord_id');
        if (clientOrderId !== undefined) {
            request['cl_ord_id'] = clientOrderId;
            params = this.omit(params, ['clientOrderId', 'cl_ord_id']);
            request = this.omit(request, 'txid');
        }
        try {
            response = await this.privatePostCancelOrder(this.extend(request, params));
            //
            //    {
            //        error: [],
            //        result: {
            //            count: '1'
            //        }
            //    }
            //
        }
        catch (e) {
            if (this.last_http_response) {
                if (this.last_http_response.indexOf('EOrder:Unknown order') >= 0) {
                    throw new errors.OrderNotFound(this.id + ' cancelOrder() error ' + this.last_http_response);
                }
            }
            throw e;
        }
        return this.safeOrder({
            'info': response,
        });
    }
    /**
     * @method
     * @name kraken#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelOrderBatch
     * @param {string[]} ids open orders transaction ID (txid) or user reference (userref)
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
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
        return [
            this.safeOrder({
                'info': response,
            }),
        ];
    }
    /**
     * @method
     * @name kraken#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelAllOrders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.privatePostCancelAll(params);
        //
        //    {
        //        error: [],
        //        result: {
        //            count: '1'
        //        }
        //    }
        //
        return [
            this.safeOrder({
                'info': response,
            }),
        ];
    }
    /**
     * @method
     * @name kraken#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelAllOrdersAfter
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    async cancelAllOrdersAfter(timeout, params = {}) {
        if (timeout > 86400000) {
            throw new errors.BadRequest(this.id + ' cancelAllOrdersAfter timeout should be less than 86400000 milliseconds');
        }
        await this.loadMarkets();
        const request = {
            'timeout': (timeout > 0) ? (this.parseToInt(timeout / 1000)) : 0,
        };
        const response = await this.privatePostCancelAllOrdersAfter(this.extend(request, params));
        //
        //     {
        //         "error": [ ],
        //         "result": {
        //             "currentTime": "2023-03-24T17:41:56Z",
        //             "triggerTime": "2023-03-24T17:42:56Z"
        //         }
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name kraken#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.kraken.com/api/docs/rest-api/get-open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the orders client order id
     * @param {int} [params.userref] the orders user reference id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (since !== undefined) {
            request['start'] = this.parseToInt(since / 1000);
        }
        const userref = this.safeInteger(params, 'userref');
        if (userref !== undefined) {
            request['userref'] = userref;
            params = this.omit(params, 'userref');
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['cl_ord_id'] = clientOrderId;
            params = this.omit(params, 'clientOrderId');
        }
        const response = await this.privatePostOpenOrders(this.extend(request, params));
        //
        //     {
        //         "error": [],
        //         "result": {
        //             "open": {
        //                 "O45M52-BFD5S-YXKQOU": {
        //                     "refid": null,
        //                     "userref": null,
        //                     "cl_ord_id": "1234",
        //                     "status": "open",
        //                     "opentm": 1733815269.370054,
        //                     "starttm": 0,
        //                     "expiretm": 0,
        //                     "descr": {
        //                         "pair": "XBTUSD",
        //                         "type": "buy",
        //                         "ordertype": "limit",
        //                         "price": "70000.0",
        //                         "price2": "0",
        //                         "leverage": "none",
        //                         "order": "buy 0.00010000 XBTUSD @ limit 70000.0",
        //                         "close": ""
        //                     },
        //                     "vol": "0.00010000",
        //                     "vol_exec": "0.00000000",
        //                     "cost": "0.00000",
        //                     "fee": "0.00000",
        //                     "price": "0.00000",
        //                     "stopprice": "0.00000",
        //                     "limitprice": "0.00000",
        //                     "misc": "",
        //                     "oflags": "fciq"
        //                 }
        //             }
        //         }
        //     }
        //
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const result = this.safeDict(response, 'result', {});
        const open = this.safeDict(result, 'open', {});
        const orders = [];
        const orderIds = Object.keys(open);
        for (let i = 0; i < orderIds.length; i++) {
            const id = orderIds[i];
            const item = open[id];
            orders.push(this.extend({ 'id': id }, item));
        }
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name kraken#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.kraken.com/api/docs/rest-api/get-closed-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {string} [params.clientOrderId] the orders client order id
     * @param {int} [params.userref] the orders user reference id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let request = {};
        if (since !== undefined) {
            request['start'] = this.parseToInt(since / 1000);
        }
        const userref = this.safeInteger(params, 'userref');
        if (userref !== undefined) {
            request['userref'] = userref;
            params = this.omit(params, 'userref');
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['cl_ord_id'] = clientOrderId;
            params = this.omit(params, 'clientOrderId');
        }
        [request, params] = this.handleUntilOption('end', request, params);
        const response = await this.privatePostClosedOrders(this.extend(request, params));
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
        const result = this.safeDict(response, 'result', {});
        const closed = this.safeDict(result, 'closed', {});
        const orders = [];
        const orderIds = Object.keys(closed);
        for (let i = 0; i < orderIds.length; i++) {
            const id = orderIds[i];
            const item = closed[id];
            orders.push(this.extend({ 'id': id }, item));
        }
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
    /**
     * @method
     * @name kraken#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getStatusRecentDeposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transaction entry
     * @param {int} [params.end] timestamp in seconds of the latest transaction entry
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        // https://www.kraken.com/en-us/help/api#deposit-status
        await this.loadMarkets();
        const request = {};
        if (code !== undefined) {
            const currency = this.currency(code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            const sinceString = this.numberToString(since);
            request['start'] = Precise["default"].stringDiv(sinceString, '1000');
        }
        const until = this.safeStringN(params, ['until', 'till']);
        if (until !== undefined) {
            params = this.omit(params, ['until', 'till']);
            const untilDivided = Precise["default"].stringDiv(until, '1000');
            request['end'] = Precise["default"].stringAdd(untilDivided, '1');
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
    /**
     * @method
     * @name kraken#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getServerTime
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
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
    /**
     * @method
     * @name kraken#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getStatusRecentWithdrawals
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transaction entry
     * @param {int} [params.end] timestamp in seconds of the latest transaction entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
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
            const sinceString = this.numberToString(since);
            request['start'] = Precise["default"].stringDiv(sinceString, '1000');
        }
        const until = this.safeStringN(params, ['until', 'till']);
        if (until !== undefined) {
            params = this.omit(params, ['until', 'till']);
            const untilDivided = Precise["default"].stringDiv(until, '1000');
            request['end'] = Precise["default"].stringAdd(untilDivided, '1');
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
    /**
     * @method
     * @name kraken#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositAddresses
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        const request = {
            'new': 'true',
        };
        return await this.fetchDepositAddress(code, this.extend(request, params));
    }
    /**
     * @method
     * @name kraken#fetchDepositMethods
     * @description fetch deposit methods for a currency associated with this account
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositMethods
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the kraken api endpoint
     * @returns {object} of deposit methods
     */
    async fetchDepositMethods(code, params = {}) {
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
    /**
     * @method
     * @name kraken#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositAddresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
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
            'info': depositAddress,
            'currency': code,
            'network': undefined,
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name kraken#withdraw
     * @description make a withdrawal
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/withdrawFunds
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to, not required can be '' or undefined/none/null
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        if ('key' in params) {
            await this.loadMarkets();
            const currency = this.currency(code);
            const request = {
                'asset': currency['id'],
                'amount': amount,
                // 'address': address,
            };
            if (address !== undefined && address !== '') {
                request['address'] = address;
                this.checkAddress(address);
            }
            const response = await this.privatePostWithdraw(this.extend(request, params));
            //
            //     {
            //         "error": [],
            //         "result": {
            //             "refid": "AGBSO6T-UFMTTQ-I7KGS6"
            //         }
            //     }
            //
            const result = this.safeDict(response, 'result', {});
            return this.parseTransaction(result, currency);
        }
        throw new errors.ExchangeError(this.id + " withdraw() requires a 'key' parameter (withdrawal key name, as set up on your account)");
    }
    /**
     * @method
     * @name kraken#fetchPositions
     * @description fetch all open positions
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getOpenPositions
     * @param {string[]} [symbols] not used by kraken fetchPositions ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            // 'txid': 'comma delimited list of transaction ids to restrict output to',
            'docalcs': 'true',
            'consolidation': 'market', // what to consolidate the positions data around, market will consolidate positions based on market pair
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
        symbols = this.marketSymbols(symbols);
        const result = this.safeList(response, 'result');
        const results = this.parsePositions(result, symbols);
        return this.filterByArrayPositions(results, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
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
        //
        const marketId = this.safeString(position, 'pair');
        const rawSide = this.safeString(position, 'type');
        const side = (rawSide === 'buy') ? 'long' : 'short';
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol(marketId, market),
            'notional': undefined,
            'marginMode': undefined,
            'liquidationPrice': undefined,
            'entryPrice': undefined,
            'unrealizedPnl': this.safeNumber(position, 'net'),
            'realizedPnl': undefined,
            'percentage': undefined,
            'contracts': this.safeNumber(position, 'vol'),
            'contractSize': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'side': side,
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': this.safeNumber(position, 'margin'),
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber(position, 'leverage'),
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    parseAccountType(account) {
        const accountByType = {
            'spot': 'Spot Wallet',
            'swap': 'Futures Wallet',
            'future': 'Futures Wallet',
        };
        return this.safeString(accountByType, account, account);
    }
    /**
     * @method
     * @name kraken#transferOut
     * @description transfer from spot wallet to futures wallet
     * @see https://docs.kraken.com/rest/#tag/User-Funding/operation/walletTransfer
     * @param {str} code Unified currency code
     * @param {float} amount Size of the transfer
     * @param {dict} [params] Exchange specific parameters
     * @returns a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transferOut(code, amount, params = {}) {
        return await this.transfer(code, amount, 'spot', 'swap', params);
    }
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
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        fromAccount = this.parseAccountType(fromAccount);
        toAccount = this.parseAccountType(toAccount);
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
            const price = this.safeString(params, 'price');
            let isTriggerPercent = false;
            if (price !== undefined) {
                isTriggerPercent = (price.endsWith('%')) ? true : false;
            }
            const isCancelOrderBatch = (path === 'CancelOrderBatch');
            this.checkRequiredCredentials();
            const nonce = this.nonce().toString();
            // urlencodeNested is used to address https://github.com/ccxt/ccxt/issues/12872
            if (isCancelOrderBatch || isTriggerPercent) {
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
            };
            if (isCancelOrderBatch || isTriggerPercent) {
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
        return this.milliseconds() - this.options['timeDifference'];
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 520) {
            throw new errors.ExchangeNotAvailable(this.id + ' ' + code.toString() + ' ' + reason);
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
                            this.throwExactlyMatchedException(this.exceptions['exact'], error, message);
                            this.throwBroadlyMatchedException(this.exceptions['broad'], error, message);
                        }
                        throw new errors.ExchangeError(message);
                    }
                }
            }
        }
        return undefined;
    }
}

exports["default"] = kraken;
