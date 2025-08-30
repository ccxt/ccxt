//  ---------------------------------------------------------------------------

import Exchange from './abstract/dexalot.js';
import type { Int, Order, Str, Transaction, Market, Currency, Currencies, Dict, int } from './base/types.js';
import { keccak256 } from './static_dependencies/ethers/utils';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1';
import { ecdsa } from './base/functions/crypto.js';
import { AccountSuspended, BadRequest, BadSymbol, InsufficientFunds, InvalidOrder, OnMaintenance, OperationRejected, PermissionDenied } from '../ccxt';
import { DECIMAL_PLACES } from './base/functions/number.js';

//  ---------------------------------------------------------------------------

/**
 * @class dexalot
 * @augments Exchange
 */
export default class dexalot extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dexalot',
            'name': 'Dexalot',
            'countries': [ 'BVI' ],
            'rateLimit': 0,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchBalance': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchOrdersByStatus': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchOrderTrades': true,
                'fetchWithdrawals': true,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://app.dexalot.com/logos/dexalot_minimal_light.png',
                'test': {
                    'public': 'https://api.dexalot-test.com',
                    'private': 'https://api.dexalot-test.com',
                },
                'api': {
                    'public': 'https://api.dexalot.com',
                    'private': 'https://api.dexalot.com',
                },
                'www': 'https://app.dexalot.com',
                'referral': {
                    'url': '',
                    'discount': 0.0,
                },
                'doc': 'https://docs.dexalot.com',
                'fees': 'https://docs.dexalot.com/en/TradingFeeDiscounts.html',
            },
            'api': {
                'public': {
                    'get': {
                        'privapi/trading/environments': 1.0,
                        'privapi/trading/tokens': 1.0,
                        'privapi/trading/pairs': 1.0,
                        'privapi/trading/deployment': 1.0,
                        'privapi/trading/deployment/params': 1.0,   // contract
                        'privapi/trading/errorcodes': 1.0,
                        'api/rfq/pairs': 1.0,  // SimpleSwap
                        'api/rfq/pairprice': 1.0,  // SimpleSwap
                        'api/rfq/prices': 1.0,  // SimpleSwap
                        'api/rfq/firm': 1.0,  // SimpleSwap
                    },
                    'post': {
                    },
                    'put': {
                    },
                    'delete': {
                    },
                },
                'private': {
                    'get': {
                        'privapi/auth/getwstoken': 1.0,
                        'privapi/signed/orders/{ORDER_ID}': 1.0,
                        'privapi/signed/orders': 1.0,
                        'privapi/signed/traderhistory': 1.0,   // This endpoint has been deprecated please see order endpoints
                        'privapi/signed/executions': 1.0,
                        'privapi/signed/transfers': 1.0,
                        'privapi/signed/portfoliobalance': 1.0,  // Retrieves portfolio balances. Please DO NOT use this endpoint for trading purposes and get the most recent portfolio information from our contracts instead.
                        'privapi/signed/transactions': 1.0,
                        'privapi/signed/transactions/{TRANSACTION_ID}': 1.0,
                        'privapi/signed/trader-fills': 1.0,
                    },
                    'post': {
                    },
                    'put': {
                    },
                    'delete': {
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0012'),
                    'maker': this.parseNumber ('0.001'),
                    'tiers': {
                        // volume is in dollars?
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.00092') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.00083') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00066') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.00058') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00049') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00041') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00032') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.001104') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.000996') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0009') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.000792') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.000696') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.000588') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.000492') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.000384') ],
                        ],
                    },
                },
                'USDT/USDC': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0002'),
                    'maker': this.parseNumber ('0'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.000184') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.000166') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.00015') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.000132') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.000116') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.000098') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.000082') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.000064') ],
                        ],
                    },
                },
                'sAVAX/AVAX': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0003'),
                    'maker': this.parseNumber ('0'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.000276') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.000249') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.000225') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.000198') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.000147') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.000147') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.000123') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.000096') ],
                        ],
                    },
                },
                'EURC/USDC': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0004'),
                    'maker': this.parseNumber ('0'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.000368') ],
                            [ this.parseNumber ('250000'), this.parseNumber ('0.000332') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0003') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.000264') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.000232') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.000196') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.000164') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.000128') ],
                        ],
                    },
                },
            },
            'commonCurrencies': {
                'BTC.b': 'BTC',
                'USDt': 'USDT',
                'WETH.e': 'WETH',
                'sAVAX': 'SAVAX',
                'BTC.B': 'BTC',
                'WETH.E': 'WETH',
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'sandboxMode': true,
                'defaultTimeInForce': 'GTC',
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'quoteOrderQty': true,
                'networks': {
                    'AVAX': '43114',  // Avalanche
                    'DEX': '432204',  // Dexalot
                    'GUN': '43419',  // GUNZ
                    'ARB': '42161',  // Arbitrum
                    'BASE': '8453',  // Base
                    'BSC': '56',  // Binance Smart Chain
                },
            },
            'exceptions': {
                'exact': {
                    'A-CNET-01': InsufficientFunds,  // 'Airdrop: contract does not have enough tokens',
                    'A-MPNV-01': BadRequest,  // 'Airdrop: Merkle proof is not valid for claim',
                    'A-MPNV-02': BadRequest,  // 'Airdrop: Merkle proof is not valid for releasableAmount',
                    'A-NTAD-01': InsufficientFunds,  // 'Airdrop: no tokens are due for claim',
                    'A-TOOE-01': BadRequest,  // 'Airdrop: too early',
                    'E-ALOA-01': PermissionDenied,  //'Exchange: at least one account needed in admin group',
                    'E-NFUN-01': BadRequest,  // 'Exchange: unknown function call',
                    'E-OACC-01': PermissionDenied,  // 'Exchange: default or auction admin account needed',
                    'E-OACC-02': PermissionDenied,  // 'Exchange: default admin account needed for pauseTradePair',
                    'E-OACC-03': PermissionDenied,  // 'Exchange: auction account needed for pauseTradePair',
                    'E-OACC-04': PermissionDenied,  // 'Exchange: AuctionAmin can only perform this operation on a TradePair that is in auction',
                    'E-OIZA-01': BadRequest,  // 'Exchange: address can not be address(0)',
                    'E-TNAP-01': BadSymbol,  // 'Exchange: tokens need to be added to portfolio first',
                    'E-TNSA-01': BadSymbol,  // 'Exchange: token in portfolio is not in the same auction mode/quote token can never be in auction',
                    'P-AFNE-01': InsufficientFunds,  // 'Portfolio: available funds not enough',
                    'P-AFNE-02': InsufficientFunds,  // 'Portfolio: available funds not enough',
                    'P-ALOA-01': PermissionDenied,  // 'Portfolio: at least one account needed in admin group',
                    'P-ALOA-02': BadRequest,  // 'Portfolio: can not remove PortfolioBridge from PORTFOLIO_BRIDGE_ROLE, use setPortfolioBridge function instead',
                    'P-AMVL-01': BadRequest,  // 'Portfolio: amount cannot be more than total value locked',
                    'P-AUCT-01': BadRequest,  // 'Portfolio: can not withdraw/transfer auction token before auction is finalized',
                    'P-BANA-01': AccountSuspended,  // 'Portfolio: account banned',
                    'P-BLTH-01': InsufficientFunds,  // 'Portfolio: subnet wallet balance (Gas Tank) under threshold',
                    'P-CNAT-01': BadSymbol,  // 'Portfolio: cannot add 0 decimals token',
                    'P-CNFF-01': OperationRejected,  // 'Portfolio: collect native fee failed',
                    'P-DOTS-01': BadRequest,  // 'Portfolio: origin and destination adressess should be different',
                    'P-DUTH-01': OperationRejected,  // 'Portfolio: deposit under threshold',
                    'P-ETNS-01': BadSymbol,  // 'Portfolio: erc20 token is not supported',
                    'P-ETNS-02': BadSymbol,  // 'Portfolio: erc20 token is not supported',
                    'P-GSRO-01': BadRequest,  // 'Portfolio: gasSwapRatio needs to be > 0',
                    'P-MDML-01': BadRequest,  // 'Portfolio: minimum deposit multipler can not be less than 10 (10/10)',
                    'P-NETD-01': OperationRejected,  // 'Portfolio: not enough ERC20 token balance to deposit',
                    'P-NFUN-01': BadRequest,  // 'Portfolio: unknown function call',
                    'P-NTDP-01': OnMaintenance,  // 'Portfolio: deposits paused',
                    'P-NZBL-01': InsufficientFunds,  // 'Portfolio: cannot remove token if there is non-zero balance',
                    'P-OACC-01': PermissionDenied,  // 'Portfolio: admin account needed for this function',
                    'P-OACC-02': BadRequest,  // 'Portfolio: address can not be address(0)',
                    'P-OACC-03': BadSymbol,  // 'Portfolio: only TradePairs contract call this function',
                    'P-OACC-04': PermissionDenied,  // 'Portfolio: only TradePairs contract or admin can call this function',
                    'P-OODT-01': PermissionDenied,  // 'Portfolio: only owner can deposit erc20 tokens',
                    'P-OOWN-01': PermissionDenied,  // 'Portfolio: only owner can withdraw native token',
                    'P-OOWN-02': PermissionDenied,  // 'Portfolio: only owner can deposit native token',
                    'P-OOWT-01': PermissionDenied,  // 'Portfolio: only owner can withdraw ERC20 tokens',
                    'P-OWTF-01': BadRequest,  // 'Portfolio: can only withdraw from treasury or feeAddress',
                    'P-PTNS-01': BadRequest,  // 'Portfolio: main processXFerPayload transaction not supported',
                    'P-PTNS-02': BadRequest,  // 'Portfolio: sub processXFerPayload transaction not supported',
                    'P-SCEM-01': BadRequest,  // 'Portfolio: source Chain Id should be the same as specified in Portfolio Main',
                    'P-TAEX-01': BadRequest,  // 'Portfolio: token already exists',
                    'P-TDDM-01': BadRequest,  // 'Portfolio: Token decimals do not match',
                    'P-TFNE-01': InsufficientFunds,  // 'Portfolio: total funds not enough',
                    'P-TNEF-01': InsufficientFunds,  // 'Portfolio: transaction amount not enough to cover fees',
                    'P-TSDM-01': BadRequest,  // 'Portfolio: token symbols do not match',
                    'P-TTNZ-01': BadRequest,  // 'Portfolio: tokanTotals needs to be 0',
                    'P-WNFA-01': OperationRejected,  // 'Portfolio: withdrawNative failed',
                    'P-WUTH-01': BadRequest,  //'Portfolio: withdraw under threshold',
                    'P-ZETD-01': InsufficientFunds,  //'Portfolio: zero erc20 token quantity',
                    'R-KDNE-01': BadRequest,  //'RBTLibrary: key does not exist',
                    'R-KDNE-02': BadRequest,  //'RBTLibrary: key does not exist',
                    'R-KEXI-01': BadRequest,  //'RBTLibrary: key exists',
                    'R-KIEM-01': BadRequest,  //'RBTLibrary: key is empty',
                    'R-KIEM-02': BadRequest,  //'RBTLibrary: key is empty',
                    'R-TIEM-01': BadRequest,  //'RBTLibrary: target is empty',
                    'R-TIEM-02': BadRequest,  //'RBTLibrary: target is empty',
                    'S-CNSZ-01': BadRequest,  //'Staking: cannot stake 0',
                    'S-CNWM-01': InsufficientFunds,  //'Staking: cannot withdraw more than staked',
                    'S-CNWZ-01': BadRequest,  // 'Staking: cannot withdraw 0 amount',
                    'S-DMBC-01': BadRequest,  // 'Staking: previous rewards period must be complete before changing the duration for the new period',
                    'S-PHBE-01': BadRequest,  // 'Staking: period has been ended',
                    'S-RCNZ-01': BadRequest,  // 'Staking: reward rate cannot be zero',
                    'S-SHBP-01': OnMaintenance,  // 'Staking: staking has been paused',
                    'S-SHBP-02': OnMaintenance,  // 'Staking: staking has been paused',
                    'T-AOPA-01': OnMaintenance,  // 'TradePairs: addOrderPaused paused',
                    'T-AUCT-01': BadRequest,  // 'TradePairs: auction mode should be set to MATCHING',
                    'T-AUCT-02': BadRequest,  // 'TradePairs: too many decimals in the auction price',
                    'T-AUCT-03': BadRequest,  // 'TradePairs: auction price should be > 0 before matchAuctionOrders',
                    'T-AUCT-04': InvalidOrder,  // 'TradePairs: market orders not allowed in auction mode',
                    'T-AUCT-05': BadRequest,  // 'TradePairs: setAuctionMode can not turn on live trading when orderbook is crossed',
                    'T-CLOI-01': BadRequest,  // 'TradePairs: client order id has to be unique per trader',
                    'T-IVOT-01': InvalidOrder,  // 'TradePairs: invalid order type',
                    'T-LONR-01': InvalidOrder,  // 'TradePairs: Limit order type cannot be removed',
                    'T-LTMT-01': InvalidOrder,  // 'TradePairs: trade amount is less than minTradeAmount for the tradePair',
                    'T-MNOE-01': InvalidOrder,  // 'TradePairs: max number of fills has to be at least 10',
                    'T-MPNA-01': InvalidOrder,  // 'TradePairs: mirror pair not allowed',
                    'T-MTMT-01': InvalidOrder,  // 'TradePairs: trade amount is more than maxTradeAmount for the tradePair',
                    'T-OACC-01': PermissionDenied,  // 'TradePairs: admin account needed for this function',
                    'T-OAEX-01': InvalidOrder,  // 'TradePairs: order is already executed and cannot be canceled',
                    'T-OOCA-01': PermissionDenied,  // 'TradePairs: only msg.sender or permissioned contracts can add orders',
                    'T-OOCC-01': PermissionDenied,  // 'TradePairs: only owner of the order can cancel',
                    'T-OOCC-02': PermissionDenied,  // 'TradePairs: only owner of the order can cancel',
                    'T-POOA-01': InvalidOrder,  // 'Portfolio: Only PO(PostOnly) Orders allowed for this pair',
                    'T-PPAU-01': OnMaintenance,  // 'TradePairs: Pair paused',
                    'T-PPAU-02': OnMaintenance,  // 'TradePairs: cancelOrder pair paused',
                    'T-PPAU-03': OnMaintenance,  // 'TradePairs: cancelOrderList pair paused',
                    'T-PPAU-04': OnMaintenance,  // 'TradePairs: Pair should be paused for this operation',
                    'T-RMTP-01': InvalidOrder,  // 'TradePairs: orderbook has to be empty to remove the tradePair',
                    'T-T2PO-01': InvalidOrder,  // 'TradePairs: Post Only order is not allowed to be a taker',
                    'T-TMDP-01': InvalidOrder,  // 'TradePairs: too many decimals in the price',
                    'T-TMDQ-01': InvalidOrder,  // 'TradePairs: too many decimals in the quantity',
                    'A1-CNET-01': InsufficientFunds,  // 'AirdropV1: contract does not have enough tokens',
                    'A1-MPNV-01': BadRequest,  // 'AirdropV1: Merkle proof is not valid',
                    'A1-THAC-01': BadRequest,  // 'AirdropV1: tokens have already been claimed',
                    'BA-LENM-01': BadRequest,  // 'BannedAccounts: number of banned accounts and ban reasons do not match',
                    'CA-CINM-01': PermissionDenied,  // 'CelerApp: caller is not message bus',
                    'CA-FINS-01': BadRequest,  // "CelerApp: this bridge implementation doesn't support this functionality",
                    'GS-FAIL-01': OperationRejected,  // 'GasStation: send failed in requestGas',
                    'GS-FAIL-02': OperationRejected,  // 'GasStation: send failed in withdrawNative',
                    'GS-NFUN-01': BadRequest,  // 'GasStation: unknown function call',
                    'ID-AGCB-01': InsufficientFunds,  // 'IncentiveDistributor: amount greater than contract balance',
                    'ID-NTTC-01': InsufficientFunds,  // 'IncentiveDistributor: no reward tokens to claim',
                    'ID-RTPC-01': BadRequest,  // 'IncentiveDistributor: reward tokens previously claimed',
                    'ID-SIGN-01': BadRequest,  // 'IncentiveDistributor: invalid claim inputs, user, tokenId, amounts or signer does not match signature',
                    'ID-TACM-01': BadRequest,  // 'IncentiveDistributor: number of tokens and claim amounts mismatch, no. of tokens less than no. of claims',
                    'ID-TACM-02': BadRequest,  // 'IncentiveDistributor: number of tokens and claim amounts mismatch, no. of tokens greater than no. of claims',
                    'ID-TDNE-01': BadRequest,  // 'IncentiveDistributor: tokenId does not exist',
                    'ID-TDNE-02': BadRequest,  // 'IncentiveDistributor: tokenId does not exist',
                    'LA-DCNT-01': BadRequest,  // 'LzApp: destination chain is not a trusted source',
                    'LA-LIZA-01': BadRequest,  // 'LzApp: endpoint cannot be zero address(0)',
                    'P-ZADDR-01': BadRequest,  // 'Portfolio: token address cannot be zero address(0)',
                    'P-ZADDR-02': BadRequest,  // 'Portfolio: trader address cannot be zero address(0)',
                    'PB-ALOA-01': PermissionDenied,  // 'PortfolioBridge: at least one account needed in admin group',
                    'PB-ALOA-02': BadRequest,  // 'PortfolioBridge: can not remove Portfolio from PORTFOLIO_ROLE, use setPortfolio instead',
                    'PB-CBIZ-01': InsufficientFunds,  // 'PortfolioBridge: balance of this contract is 0, send gas for message fees',
                    'PB-CBIZ-02': InsufficientFunds,  // 'PortfolioBridge: balance of this contract is 0, send gas for message fees',
                    'PB-CSDE-01': BadRequest,  // 'PortfolioBridge: destination for celerSend is not allowed',
                    'PB-DBCD-01': BadRequest,  // 'PortfolioBridge: default bridge can not be disabled',
                    'PB-DTAE-01': BadRequest,  // 'PortfolioBridge: delayed transfer already exists',
                    'PB-DTNE-01': BadRequest,  // 'PortfolioBridge: delayed transfer does not exist',
                    'PB-DTSL-01': BadRequest,  // 'PortfolioBridge: delayed transfer still locked',
                    'PB-ETNS-01': BadSymbol,  // 'PortfolioBridge: erc20 token is not supported',
                    'PB-FRFD-01': OperationRejected,  // 'PortfolioBridge: failed to refund',
                    'PB-IVEC-01': BadRequest,  // 'PortfolioBridge: invalid endpoint caller',
                    'PB-LENM-01': BadRequest,  // 'PortfolioBridge: length mismatch in setDelayThresholds',
                    'PB-LENM-02': BadRequest,  // 'PortfolioBridge: length mismatch in setEpochVolumeCaps',
                    'PB-MING-01': BadRequest,  // 'PortfolioBridge: gas can not be less than 200000 minimum gas required ',
                    'PB-NFUN-01': BadRequest,  // 'PortfolioBridge: unknown function call',
                    'PB-OACC-01': PermissionDenied,  // 'PortfolioBridge: admin account or PORTFOLIO_ROLE needed for this function',
                    'PB-RBNE-01': BadRequest,  // 'PortfolioBridge: requested bridge not enabled',
                    'PB-RBNE-02': BadRequest,  // 'PortfolioBridge: requested bridge not implemented',
                    'PB-SDMP-01': BadSymbol,  // "PortfolioBridge: symbol doesn't match Portfolio's common symbol",
                    'PB-SINA-01': BadRequest,  // 'PortfolioBridge: source not allowed',
                    'PB-TAEX-01': BadSymbol,  // 'PortfolioBridge: token already exists',
                    'PB-VCAP-01': BadRequest,  // 'PortfolioBridge: volume exceeds cap',
                    'PM-NFUN-01': BadRequest,  // 'PortfolioMinter: unknown function call',
                    'PM-ZADD-01': BadRequest,  // 'PortfolioMinter: cannot initialize with 0 address',
                    'PM-ZAMT-01': BadRequest,  // 'PortfolioMinter: mint amount must be greater than 0',
                    'TV-BIZA-01': BadRequest,  // 'TokenVesting: beneficiary is the zero address',
                    'TV-CLTD-01': BadRequest,  // 'TokenVesting: cliff is longer than duration',
                    'TV-CNTR-01': BadRequest,  // 'TokenVesting: cannot revoke',
                    'TV-DISZ-01': BadRequest,  // 'TokenVesting: duration is too short',
                    'TV-FTBC-01': BadRequest,  // 'TokenVesting: final time is before current time',
                    'TV-NBOC-01': InsufficientFunds,  // 'TokenVesting: no balance on the contract',
                    'TV-NTAD-01': BadRequest,  // 'TokenVesting: no tokens are due',
                    'TV-NTAD-02': BadRequest,  // 'TokenVesting: no tokens are due',
                    'TV-OPDA-01': BadRequest,  // 'TokenVesting: only possible during auction',
                    'TV-PDBS-01': BadRequest,  // 'TokenVesting: portfolio deposits begins after start',
                    'TV-PGTZ-01': BadRequest,  // 'TokenVesting: percentage is greater than 100',
                    'TV-PGTZ-02': BadRequest,  // 'TokenVesting: percentage is greater than 100',
                    'TV-PISZ-01': BadRequest,  // 'TokenVesting: period is too short',
                    'TV-PIZA-01': BadRequest,  // 'TokenVesting: portfolio is the zero address',
                    'TV-PIZA-02': BadRequest,  // 'TokenVesting: portfolio is the zero address',
                    'TV-TEAR-01': BadRequest,  // 'TokenVesting: too early',
                    'TV-TKAR-01': BadRequest,  // 'TokenVesting: token already revoked',
                    'TV-TKNR-01': BadRequest,  // 'TokenVesting: token not revoked',
                    'GS-ASBTZ-02': BadRequest,  // 'GasStation: gasAmount must be greater than 0 in setGasAmount',
                    'GS-ASBTZ-03': BadRequest,  // 'GasStation: gasAmount must be greater than 0 in withdrawNative',
                    'GS-ASBTZ-04': BadRequest,  // 'GasStation: amount of gas request should be <= gasAmount',
                    'GS-ZADDR-01': BadRequest,  // 'GasStation: cannot request gas to zero address(0)',
                    'ID-ZADDR-01': BadRequest,  // 'IncentiveDistributor: cannot initialize signer with zero address(0)',
                    'ID-ZADDR-02': BadRequest,  // 'IncentiveDistributor: cannot initialize portfolio with zero address(0)',
                    'TV1-BIZA-01': BadRequest,  // 'TokenVestingV1: beneficiary is the zero address',
                    'TV1-CLTD-01': BadRequest,  // 'TokenVestingV1: cliff is longer than duration',
                    'TV1-CNTR-01': BadRequest,  // 'TokenVestingV1: cannot revoke',
                    'TV1-DISZ-01': BadRequest,  // 'TokenVestingV1: duration is too short',
                    'TV1-FTBC-01': BadRequest,  // 'TokenVestingV1: final time is before current time',
                    'TV1-NBOC-01': InsufficientFunds,  // 'TokenVestingV1: no balance on the contract',
                    'TV1-NTAD-01': BadRequest,  // 'TokenVestingV1: no tokens are due',
                    'TV1-NTAD-02': BadRequest,  // 'TokenVestingV1: no tokens are due',
                    'TV1-OPDA-01': BadRequest,  // 'TokenVestingV1: only possible during auction',
                    'TV1-PDBS-01': BadRequest,  // 'TokenVestingV1: portfolio deposits begins after start',
                    'TV1-PGTZ-01': BadRequest,  // 'TokenVestingV1: percentage is greater than 100',
                    'TV1-PGTZ-02': BadRequest,  // 'TokenVestingV1: percentage is greater than 100',
                    'TV1-PIZA-01': BadRequest,  // 'TokenVestingV1: portfolio is the zero address',
                    'TV1-PIZA-02': BadRequest,  // 'TokenVestingV1: portfolio is the zero address',
                    'TV1-TEAR-01': BadRequest,  // 'TokenVestingV1: too early',
                    'TV1-TKAR-01': BadRequest,  // 'TokenVestingV1: token already revoked',
                    'TV1-TKNR-01': BadRequest,  // 'TokenVestingV1: token not revoked',
                    'TVC-BIZA-01': BadRequest,  // 'TokenVestingCloneable: beneficiary is the zero address',
                    'TVC-CLTD-01': BadRequest,  // 'TokenVestingCloneable: cliff is longer than duration',
                    'TVC-CNTR-01': BadRequest,  // 'TokenVestingCloneable: cannot revoke',
                    'TVC-DISZ-01': BadRequest,  // 'TokenVestingCloneable: duration is too short',
                    'TVC-FTBC-01': BadRequest,  // 'TokenVestingCloneable: final time is before current time',
                    'TVC-NBOC-01': InsufficientFunds,  // 'TokenVestingCloneable: no balance on the contract',
                    'TVC-NTAD-01': BadRequest,  // 'TokenVestingCloneable: no tokens are due',
                    'TVC-NTAD-02': BadRequest,  // 'TokenVestingCloneable: no tokens are due',
                    'TVC-OIZA-01': BadRequest,  // 'TokenVestingCloneable: owner is the zero address',
                    'TVC-OPDA-01': BadRequest,  // 'TokenVestingCloneable: only possible during auction',
                    'TVC-PDBS-01': BadRequest,  // 'TokenVestingCloneable: portfolio deposits begins after start',
                    'TVC-PGTZ-01': BadRequest,  // 'TokenVestingCloneable: percentage is greater than 100',
                    'TVC-PGTZ-02': BadRequest,  // 'TokenVestingCloneable: percentage is greater than 100',
                    'TVC-PISZ-01': BadRequest,  // 'TokenVestingCloneable: period is too short',
                    'TVC-PIZA-01': BadRequest,  // 'TokenVestingCloneable: portfolio is the zero address',
                    'TVC-PIZA-02': BadRequest,  // 'TokenVestingCloneable: portfolio is the zero address',
                    'TVC-TEAR-01': BadRequest,  // 'TokenVestingCloneable: too early',
                    'TVC-TKAR-01': BadRequest,  // 'TokenVestingCloneable: token already revoked',
                    'TVC-TKNR-01': BadRequest,  // 'TokenVestingCloneable: token not revoked',
                    'TVCF-IOOB-01': BadRequest,  // 'TokenVestingCloneFactory: index is out of bounds'
                },
            },
        });
    }

    /**
     * @method
     * @name dexalot#fetchTradingEnvironment
     * @description Returns an array of current blockchain environments. There will always be 2 sub-environments with one subnet and multiple mainnets and subnet. They are all tied to a single parentenv
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-environments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object}
     */
    async fetchTradingEnvironments (params: Dict = {}): Promise<Dict[]> {
        const response = await this.publicGetPrivapiTradingEnvironments (params);
        //
        // [
        //     {
        //         "parentenv": "fuji-multi",
        //         "env": "fuji-multi-arb",
        //         "type": "mainnet",
        //         "chain_instance": "https://sepolia-rollup.arbitrum.io/rpc",
        //         "chain_id": 421614,
        //         "chain_name": "Arbitrum Sepolia",
        //         "chain_display_name": "Arbitrum Sepolia",
        //         "native_token_name": "Ethereum",
        //         "native_token_symbol": "ETH",
        //         "min_native_balance": "1",
        //         "lzchain_id": 10231,
        //         "lzscanner_url": "https://testnet.layerzero-scan.com",
        //         "chain_wss": "wss://sepolia-rollup.arbitrum.io/ws",
        //         "explorer": "https://sepolia-explorer.arbitrum.io/tx/",
        //         "token_url": "https://sepolia-explorer.arbitrum.io/address/"
        //     },
        // ]
        //
        // const envDict: Dictionary<Dict> = {};
        // for (let i = 0; i < response.length; i++) {
        //     const env = response[i];
        //     const key = `${env.parentenv}-${env.env}`;
        //     envDict[key] = env;
        // }
        // return envDict;
        return response;
    }

    async fetchWsToken (params = {}): Promise<string> {
        const response = await this.privateGetPrivapiAuthGetwstoken (params);
        //
        // {
        //     "token": "5fd5e09c-f5c0-491b-91b3-4240d38901d3"
        // }
        //
        const token = this.safeString (response, 'token');
        return token;
    }

    /**
     * @method
     * @name dexalot#fetchDeployment
     * @description Returns the deployment details of the Dexalot contracts including their abi
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-deployment-contract-addresses-and-abi
     * @param {string} contractType [Exchange, Portfolio, TradePairs, Orderbooks…]
     * @param {boolean} [returnAbi]
     * @param {string} [env] Filters by env (e.g. fuji-multi-subnet)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of deployment details
     */
    async fetchDeployment (contractType: string, returnAbi: boolean = false, env: string = undefined, params: Dict = {}): Promise<Dict> {
        const request = {
            'contractType': contractType,
            'returnAbi': returnAbi,
            'env': env,
        };
        const response = await this.publicGetPrivapiTradingDeployment (this.extend (request, params));
        //
        // [
        //     {
        //         "parentenv": "fuji-multi",
        //         "env": "fuji-multi-arb",
        //         "env_type": "mainnet",
        //         "contract_name": "PortfolioMain",
        //         "contract_type": "Portfolio",
        //         "address": "0xe1b3ECF856794ff799Eb831272bcd10d03CeA861",
        //         "impl_address": "0xca04B6Ca4509032F54d6f22D28aca2b075918b26",
        //         "version": "2.5.2",
        //         "blocknumber": "24542746",
        //         "owner": "0xbFD53904e0A0c02eFB7e76aad7FfB1F476320038",
        //         "status": "deployed",
        //         "action": null,
        //         "abi": { ... }
        //     },
        // ]
        //
        return response;
    }

    /**
     * @method
     * @name dexalot#fetchErrorCodes
     * @description This endpoint will return all of the revert reason codes with descriptions
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-error-codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of error codes
     */
    async fetchErrorCodes (params = {}): Promise<Dict> {
        const response = await this.publicGetPrivapiTradingErrorcodes (params);
        //
        // {
        //     "version": 2,
        //     "reasons": {
        //         "A-CNET-01": "Airdrop: contract does not have enough tokens",
        //         "A-MPNV-01": "Airdrop: Merkle proof is not valid for claim",
        //         "A-MPNV-02": "Airdrop: Merkle proof is not valid for releasableAmount",
        //         "A-NTAD-01": "Airdrop: no tokens are due for claim",
        //         ...
        //     }
        // }
        //
        const reasons: Dict = this.safeDict (response, 'reasons');
        return reasons;
    }

    /**
     * @method
     * @name dexalot#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-tokens
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetPrivapiTradingTokens (params);
        //
        // [
        //     {
        //         "env": "fuji-multi-arb",
        //         "symbol": "ARB",
        //         "subnet_symbol": "ARB",
        //         "name": "Mock ARB",
        //         "isnative": false,
        //         "address": "0x196F92E9A0d9a79925BFab0E901bf76F547F699E",
        //         "evmdecimals": 18,
        //         "isvirtual": false,
        //         "chain_id": 421614,
        //         "status": "deployed",
        //         "old_symbol": null,
        //         "auctionmode": 0,
        //         "auctionendtime": null,
        //         "min_depositamnt": "0.475"
        //     },
        // ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const info = response[i];
            const id = this.safeString (info, 'symbol');
            const code = this.safeCurrencyCode (id);
            const currency = this.safeDict (result, code);
            const networkId = this.safeString (info, 'chain_id');
            const networkCode = this.networkIdToCode (networkId);
            const precision = this.parsePrecision (this.safeString (info, 'l1_decimals'));
            const minDeposit = this.safeNumber (info, 'min_depositamnt');
            const status = this.safeString (info, 'status');
            if (!currency) {
                result[code] = this.safeCurrencyStructure ({
                    'info': info,
                    'id': id,
                    'code': code,
                    'name': this.safeString (info, 'name'),
                    'type': 'crypto',
                    'active': status === 'deployed',
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': undefined,
                    'precision': undefined,
                    'limits': {
                        'amount': {
                            'min': minDeposit,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'networks': {
                        'info': info,
                        'id': networkId,
                        'network': networkCode,
                        'margin': false,
                        'deposit': undefined,
                        'withdraw': undefined,
                        'active': status === 'deployed',
                        'fee': undefined,
                        'precision': precision,
                        'limits': {
                            'deposit': {
                                'min': minDeposit,
                                'max': undefined,
                            },
                            'withdraw': {
                                'min': undefined,
                                'max': undefined,
                            },
                        },
                    },
                });
            } else {
                result[code][networkCode] = {
                    'info': info,
                    'id': networkId,
                    'network': networkCode,
                    'margin': false,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'active': status === 'deployed',
                    'fee': undefined,
                    'precision': precision,
                    'limits': {
                        'deposit': {
                            'min': minDeposit,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
                currency['limits']['amount']['min'] = Math.min (currency['limits']['amount']['min'], minDeposit);
                currency['active'] = currency['active'] || (status === 'deployed');
            }
        }
        return result;
    }

    /**
     * @method
     * @name dexalot#fetchMarkets
     * @description Returns an array of available markets (trade pairs). This will always return the subnet pairs list as markets, as trade pairs and order books can only exist in the Dexalot subnet. ( Note: Base & Quote address will always show the mainnet token addresses for consistency)
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const privApi = await this.fetchPrivApiMarkets (params);
        const simpleSwap = await this.fetchSimpleSwapMarkets (params);
        return this.arrayConcat (privApi, simpleSwap);
    }

    /**
     * @method
     * @name dexalot#fetchPrivApiMarkets
     * @description Returns an array of available markets (trade pairs). This will always return the subnet pairs list as markets, as trade pairs and order books can only exist in the Dexalot subnet. ( Note: Base & Quote address will always show the mainnet token addresses for consistency)
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchPrivApiMarkets (params = {}): Promise<Market[]> {
        const privApi = await this.publicGetPrivapiTradingPairs (params);
        //
        // [
        //     {
        //         "env": "fuji-multi-subnet",
        //         "pair": "ALOT/AVAX",
        //         "base": "ALOT",
        //         "quote": "AVAX",
        //         "basedisplaydecimals": 1,
        //         "quotedisplaydecimals": 4,
        //         "baseaddress": "0x9983F755Bbd60d1886CbfE103c98C272AA0F03d6",
        //         "quoteaddress": null,
        //         "mintrade_amnt": "0.300000000000000000",
        //         "maxtrade_amnt": "4000.000000000000000000",
        //         "base_evmdecimals": 18,
        //         "quote_evmdecimals": 18,
        //         "allowswap": true,
        //         "auctionmode": 0,
        //         "auctionendtime": null,
        //         "status": "deployed"
        //     },
        // ]
        //
        return this.parseMarkets (privApi);
    }

    /**
     * @method
     * @name dexalot#fetchSimpleSwapMarkets
     * @description Fetch available Simple Swap enabled pairs and related info
     * @see https://docs.dexalot.com/en/apiv2/SimpleSwap.html#_1-fetch-trade-pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} params.chainId the chain id to fetch markets for, [43114 ...]
     * @returns {object[]} an array of objects representing market data
     */
    async fetchSimpleSwapMarkets (params = {}): Promise<Market[]> {
        const chainId = this.safeNumber (params, 'chainId');
        const request = {
        };
        if (chainId) {
            request['chainid'] = chainId;
        }
        const response = await this.publicGetApiRfqPairs (this.extend (request, params));
        //
        // {
        //     "AVAX/USDC": {
        //         "base": "AVAX",
        //         "quote": "USDC",
        //         "liquidityUSD": 10000,
        //         "baseAddress": "0x0000000000000000000000000000000000000000",
        //         "quoteAddress": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        //         "baseDecimals": 18,
        //         "quoteDecimals": 6,
        //     },
        // }
        //
        return this.parseSimpleSwapMarkets (response);
    }

    parseSimpleSwapMarkets (markets: Dict): Market[] {
        return Object.values (markets).map (market => this.parseSimpleSwapMarket (market));
    }

    parseMarket (market: Dict): Market {
        //
        // {
        //     "env": "fuji-multi-subnet",
        //     "pair": "ALOT/AVAX",
        //     "base": "ALOT",
        //     "quote": "AVAX",
        //     "basedisplaydecimals": 1,
        //     "quotedisplaydecimals": 4,
        //     "baseaddress": "0x9983F755Bbd60d1886CbfE103c98C272AA0F03d6",
        //     "quoteaddress": null,
        //     "mintrade_amnt": "0.300000000000000000",
        //     "maxtrade_amnt": "4000.000000000000000000",
        //     "base_evmdecimals": 18,
        //     "quote_evmdecimals": 18,
        //     "allowswap": true,
        //     "auctionmode": 0,
        //     "auctionendtime": null,
        //     "status": "deployed"
        // },
        //
        const marketId = this.safeString (market, 'pair');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const status = this.safeString (market, 'status');
        return {
            'info': market,
            'id': marketId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'subType': undefined,
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': (status === 'deployed'),
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'quanto': false,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'marginModes': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'basedisplaydecimals'),
                'price': this.safeNumber (market, 'quotedisplaydecimals'),
                'cost': undefined,
                // 'baseEvm': this.safeNumber (market, 'base_evmdecimals'),
                // 'quoteEvm': this.safeNumber (market, 'quote_evmdecimals'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'mintrade_amnt'),
                    'max': this.safeNumber (market, 'maxtrade_amnt'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
                'market': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
        };
    }

    parseSimpleSwapMarket (market: Dict): Market {
        //
        // {
        //     "marketId": "AVAX/USDC",  // was the key in the response
        //     "base": "AVAX",
        //     "quote": "USDC",
        //     "liquidityUSD": 10000,
        //     "baseAddress": "0x0000000000000000000000000000000000000000",
        //     "quoteAddress": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        //     "baseDecimals": 18,
        //     "quoteDecimals": 6,
        // }
        //
        const marketId = this.safeString (market, 'marketId');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return {
            'info': market,
            'id': marketId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'subType': undefined,
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'quanto': false,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'marginModes': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'baseDecimals'),
                'price': this.safeNumber (market, 'quoteDecimals'),
                'cost': undefined,
                // 'baseEvm': this.safeNumber (market, 'base_evmdecimals'),
                // 'quoteEvm': this.safeNumber (market, 'quote_evmdecimals'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
                'market': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
        };
    }

    /**
     * TODO: docs say Please DO NOT use this endpoint for trading purposes and get the most recent portfolio information from our contracts instead, but there's no balance information from that response
     * @method
     * @name dexalot#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-portfolio-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPrivapiSignedPortfoliobalance (params);
        //
        // [
        //     {
        //         "traderaddress": "0xce96e120420dc73394491ab941d3bc6168d6c93e",
        //         "symbol": "ALOT",
        //         "trades": "-20",
        //         "xfers": "990",
        //         "fee": "0",
        //         "currentbal": "970"
        //     }
        // ]
        //
        return this.parseBalance (response);
    }

    parseBalance (response) {
        //
        //   copy and paste the unparsed value stored in response
        //
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const currencyId = this.safeString (response[i], 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account: Dict = {
                // 'free': this.safeString (balance, 'freeze'),
                // 'used': this.safeString (balance, 'available'),
                'total': this.safeString (response[i], 'currentbal'),
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name dexalot#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-deployment-contract-addresses-and-abi
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        const response = await this.fetchDeployment ('Orderbooks', false, undefined, params);
        //
        //   TODO: response
        //
        // return this.parseOrderBook (response, market['symbol'], timestamp, asks_key, price_key, amount_key, count_or_id_key);  // TODO: update asks_key, price_key, amount_key, count_or_id_key, remove timestamp if value does not exist
        return this.parseOrderBook (response);
    }
    
    parseTrade (trade: Dict, market: Market = undefined) {
        //
        // fetchOrderTrades
        // {
        //     "env": "dev-fuji-subnet",
        //     "execid": 1673612524,
        //     "type": "T",
        //     "orderid": "0x0000000000000000000000000000000000000000000000000000000063c14ceb",
        //     "traderaddress": "0xce96e120420dc73394491ab941d3bc6168d6c93e",
        //     "tx": "0x32502abc0280f69e1b90fff684f5fc6b79a6be00a674b94bc50165e74b260a1b",
        //     "pair": "ALOT/USDC",
        //     "side": 1,
        //     "quantity": "20.000000000000000000",
        //     "price": "2.905800000000000000",
        //     "fee": "0.116200000000000000",
        //     "feeunit": "USDC",
        //     "ts": "2023-02-24T07:54:09.000Z"
        // }
        //
        // fetchMyTrades
        // {
        //     "traderaddress": "0x720b7b64f5228a73aac1419d7b4f6b8ced62db41",
        //     "orderid": "0x000000000000000000000000000000000000000000000000000000006c314119",
        //     "tx": "0x02a193be60e7b0480ca70d0c3cb8efe1240c6f0b5ba7ba803a9486cdb3e439ba",
        //     "pair": "ALOT/USDC",
        //     "side": 0,
        //     "type": "T",
        //     "execid": 1643211314,
        //     "execquantity": "5",
        //     "execprice": "1.1276",
        //     "fee": "0.01",
        //     "feeunit": "ALOT",
        //     "ts": "2023-01-28T10:03:14.000Z"
        // }
        //
        const marketId = this.safeString (trade, 'pair');
        const datetime = this.safeInteger (trade, 'ts');
        const type = this.safeString (trade, 'type');
        const side = this.safeString (trade, 'side');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'execid'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': this.safeMarket (marketId, market),
            'order': this.safeString (trade, 'orderid'),
            'type': undefined,
            'side': side === '0' ? 'buy' : 'sell',
            'takerOrMaker': type === 'T' ? 'taker' : 'maker',
            'price': this.safeString2 (trade, 'price', 'execprice'),
            'amount': this.safeString2 (trade, 'quantity', 'execquantity'),
            'cost': undefined,
            'fee': {
                'currency': this.safeString (market, 'feeunit'),
                'cost': this.safeString (trade, 'fee'),
                'rate': undefined,
            },
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'FILLED': 'closed',
            // TODO
            '0': 'new',  // Order is in the orderbook with no trades/executions
            '1': 'rejected',  // Order is rejected. Currently used addLimitOrderList, cancelReplaceList to notify when an order from the list is
            // rejected instead of reverting the entire order list
            '2': 'partial',  // Order filled partially and it remains in the orderbook until FILLED/CANCELED
            '3': 'filled',  // Order filled fully and removed from the orderbook
            '4': 'canceled',  // Order canceled and removed from the orderbook. PARTIAL before CANCELED is allowed
            '5': 'expired',  // For future use
            '6': 'killed',  // For future use
            '7': 'cancel_reject',  // Cancel Request Rejected with reason code and may only be from cancelOrderList
            // 'OPEN': 'open',
            // 'CANCELED': 'canceled',
            // 'REJECTED': 'rejected',
            // 'EXPIRED': 'expired',
        };
        return this.safeStringLower (statuses, status, status);
    }

    parseOrderType (type: Str) {
        const types: Dict = {
            '0': 'market',
            '1': 'limit',
            '2': 'stop',     // not used
            '3': 'stoplimit',  // not used
        };
        return this.safeStringLower (types, type, type);
    }

    parseOrderTimeInForce (tif: Str) {
        const timeInForces: Dict = {
            '0': 'GTC',   // Good Till Cancel, may or may not get a fill, the remaining amount goes in the orderbook
            '1': 'FOK',   // Fill or Kill - requires immediate full fill or reverts
            '2': 'IOC',   // Immediate or Cancel - gets 0 or more fills & then the remaining amount is canceled. it will not go in the orderbook
            '3': 'PO',    // Post Only - Requires to go in the orderbook without any fills or reverts
        };
        return this.safeStringLower (timeInForces, tif, tif);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // fetchOrder
        // {
        //     "id": "0x0000000000000000000000000000000000000000000000000000000063c14ca3",
        //     "tx": "0x4fb0d865c73258ab365cda2252b5e6f3a23612c66659338a04a8b58d9a03e442",
        //     "tradePair": "AVAX/USDC",
        //     "type1": "LIMIT",
        //     "type2": "GTC",
        //     "side": "BUY",
        //     "price": "20.000000000000000000",
        //     "quantity": "1.000000000000000000",
        //     "totalAmount": "20.000000000000000000",
        //     "status": "FILLED",
        //     "quantityFilled": "1.000000000000000000",
        //     "totalFee": "0.001000000000000000",
        //     "timestamp": "2023-02-19T14:14:00.000Z",
        //     "updateTs": "2023-02-21T19:45:49.000Z"
        // }
        //
        // fetchOpenOrders
        // {
        //     "env": "dev-fuji-subnet",
        //     "id": "0x0000000000000000000000000000000000000000000000000000000063c14cb7",
        //     "traderaddress": "0xbe1d1d12f676080f6d2e739b01f242f2145c00b0",
        //     "clientordid": "0x4a04a533471a445e67894073fcb4342d07ee2b2170156ca745b111da641f121b",
        //     "tx": "0x878ee1f5f20252886e83412f55e37169f5935e4f607a5e7cf5cd17c7c9d39332",
        //     "pair": "ALOT/USDC",
        //     "type": 1,
        //     "type2": 0,
        //     "side": 0,
        //     "price": "0.990000000000000000",
        //     "quantity": "100.000000000000000000",
        //     "totalamount": "0.000000000000000000",
        //     "status": 0,
        //     "ts": "2023-02-22T18:29:02.000Z",
        //     "quantityfilled": "0.000000000000000000",
        //     "totalfee": "0.000000000000000000",
        //     "update_ts": "2023-02-22T18:29:02.000Z"
        // }
        //
        const datetime = this.safeString2 (order, 'timestamp', 'ts');
        const marketId = this.safeString2 (order, 'tradePair', 'pair');
        market = this.safeMarket (marketId, market);
        const timeInForce = this.parseOrderTimeInForce (this.safeString (order, 'type2'));
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'clientordid'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'lastTradeTimestamp': this.safeString (order, 'updateTs', 'update_ts'),
            'symbol': this.safeString (market, 'symbol'),
            'type': this.parseOrderType (this.safeStringLower (order, 'type1')),
            'timeInForce': timeInForce,
            'postOnly': timeInForce === 'po',
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeString (order, 'price'),
            'stopPrice': undefined,
            'amount': this.safeString2 (order, 'totalAmount', 'quantity'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeString2 (order, 'quantityFilled', 'quantityfilled'),
            'remaining': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': {
                'currency': undefined,  // TODO
                'cost': this.safeString2 (order, 'totalFee', 'totalfee'),
                'rate': undefined,
            },
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name dexalot#fetchOrder
     * @description fetch an order
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-order-details
     * @param {string} id Order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] exchange specific parameters
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            'ORDERID': id,
        };
        const response = await this.privateGetPrivapiSignedOrdersORDERID (this.extend (request, params));
        //
        // {
        //     "id": "0x0000000000000000000000000000000000000000000000000000000063c14ca3",
        //     "tx": "0x4fb0d865c73258ab365cda2252b5e6f3a23612c66659338a04a8b58d9a03e442",
        //     "tradePair": "AVAX/USDC",
        //     "type1": "LIMIT",
        //     "type2": "GTC",
        //     "side": "BUY",
        //     "price": "20.000000000000000000",
        //     "quantity": "1.000000000000000000",
        //     "totalAmount": "20.000000000000000000",
        //     "status": "FILLED",
        //     "quantityFilled": "1.000000000000000000",
        //     "totalFee": "0.001000000000000000",
        //     "timestamp": "2023-02-19T14:14:00.000Z",
        //     "updateTs": "2023-02-21T19:45:49.000Z"
        // }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name dexalot#fetchOrders
     * @description All orders belonging to the trader signature can be fetched using this endpoint. If period parameters are not provided this endpoint will default to last 30 days.
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-orders
     * @param {string} status the status of the orders to fetch
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersByStatus (status: Str, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // pair N   Trading Pair code    AVAX/USDC
            // category    N    Order Category 0: Open, 1: Closed (with fills), 2: Closed (no fills), 3: All Orders    3
            // periodfrom    N    If provided limits where the time period starts    2023-02-22T18:20:02.000Z
            // periodto    N    If provided limits where the time period ends    2023-02-22T18:40:02.000Z
            // itemsperpage    N    Max number of records to return in the response    50
            // pageno    N    Requested page number (paged by "itemsperpage" records)    1
        };
        if (status === 'open') {
            request['category'] = '0';
        } else if (status === 'closed') {
            request['category'] = '1';
        } else if (status === 'canceled') {
            request['category'] = '2';
        }
        if (since !== undefined) {
            request['periodfrom'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['itemsperpage'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['periodto'] = this.iso8601 (until);
            params = this.omit (params, 'until');
        }
        const response = await this.privateGetPrivapiSignedOrders (this.extend (request, params));
        //
        // {
        //     "count": 1,
        //     "rows": [
        //         {
        //             "env": "dev-fuji-subnet",
        //             "id": "0x0000000000000000000000000000000000000000000000000000000063c14cb7",
        //             "traderaddress": "0xbe1d1d12f676080f6d2e739b01f242f2145c00b0",
        //             "clientordid": "0x4a04a533471a445e67894073fcb4342d07ee2b2170156ca745b111da641f121b",
        //             "tx": "0x878ee1f5f20252886e83412f55e37169f5935e4f607a5e7cf5cd17c7c9d39332",
        //             "pair": "ALOT/USDC",
        //             "type": 1,
        //             "type2": 0,
        //             "side": 0,
        //             "price": "0.990000000000000000",
        //             "quantity": "100.000000000000000000",
        //             "totalamount": "0.000000000000000000",
        //             "status": 0,
        //             "ts": "2023-02-22T18:29:02.000Z",
        //             "quantityfilled": "0.000000000000000000",
        //             "totalfee": "0.000000000000000000",
        //             "update_ts": "2023-02-22T18:29:02.000Z"
        //         }
        //     ]
        // }
        //
        const rows = this.safeList (response, 'rows', []);
        return this.parseOrders (rows, market, since, limit);
    }

    /**
     * @method
     * @name dexalot#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    /**
     * @method
     * @name dexalot#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        return await this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    /**
     * @method
     * @name dexalot#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        return await this.fetchOrdersByStatus ('canceled', symbol, since, limit, params);
    }

    /**
     * @method
     * @name dexalot#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-order-execution-details
     * @param {string} id The Order Id returned from the blockchain when your order is created
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderid': id,
        };
        // const response = await this.privateGetPrivapiSignedTransactions (this.extend (request, params));
        const response = await this.privateGetPrivapiSignedExecutions (this.extend (request, params));
        //
        // [
        //     {
        //         "env": "dev-fuji-subnet",
        //         "execid": 1673612524,
        //         "type": "T",
        //         "orderid": "0x0000000000000000000000000000000000000000000000000000000063c14ceb",
        //         "traderaddress": "0xce96e120420dc73394491ab941d3bc6168d6c93e",
        //         "tx": "0x32502abc0280f69e1b90fff684f5fc6b79a6be00a674b94bc50165e74b260a1b",
        //         "pair": "ALOT/USDC",
        //         "side": 1,
        //         "quantity": "20.000000000000000000",
        //         "price": "2.905800000000000000",
        //         "fee": "0.116200000000000000",
        //         "feeunit": "USDC",
        //         "ts": "2023-02-24T07:54:09.000Z"
        //     }
        // ]
        //
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name dexalot#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-transfers
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: Dict = {
            // symbol   N   Symbol to query for transfers    ALOT
            // periodfrom   N   2022-03-02T00:00:00.000Z
            // periodto N   2022-04-11T00:00:00.000Z
            // itemsperpage N   Max number of records to return in the response    50
            // pageno   N   Requested page number    1
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        if (since !== undefined) {
            request['periodfrom'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['itemsperpage'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['periodto'] = this.iso8601 (until);
        }
        const response = await this.privateGetPrivapiSignedTransfers (this.extend (request, params));
        //
        // {
        //     "count": 1,
        //     "rows": [
        //         {
        //             "env": "subnet",
        //             "bridge": -1,
        //             "action_type": 9,
        //             "nonce": -1,
        //             "tx": "0x1bdedaa4b071670859a320cf22704311b6ef083f90676ff5a96f6b1325d8cc22",
        //             "traderaddress": "0xce96e120420dc73394491ab941d3bc6168d6c93e",
        //             "type": 9,
        //             "symbol": "ALOT",
        //             "quantity": "990",
        //             "fee": "0",
        //             "gasused": 120920,
        //             "gasprice": "6.5",
        //             "ts": "2023-02-24T07:53:11.000Z"
        //         }
        //     ]
        // }
        //
        const data = this.safeList (response, 'rows', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // {
        //     "env": "subnet",
        //     "bridge": -1,
        //     "action_type": 9,  // TODO
        //     "nonce": -1,
        //     "tx": "0x1bdedaa4b071670859a320cf22704311b6ef083f90676ff5a96f6b1325d8cc22",
        //     "traderaddress": "0xce96e120420dc73394491ab941d3bc6168d6c93e",
        //     "type": 9,
        //     "symbol": "ALOT",
        //     "quantity": "990",
        //     "fee": "0",
        //     "gasused": 120920,
        //     "gasprice": "6.5",
        //     "ts": "2023-02-24T07:53:11.000Z"
        // }
        //
        const currencyId = this.safeString (transaction, 'symbol');
        const datetime = this.safeString (transaction, 'ts');
        const address = this.safeString (transaction, 'traderaddress');
        return {
            'info': transaction,
            'id': undefined,
            'txid': this.safeString (transaction, 'tx'),
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'network': this.safeString (transaction, 'chain'),
            'address': undefined,
            'addressTo': undefined,
            'addressFrom': address,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': this.parseTransactionType (this.safeString (transaction, 'type')),
            'amount': this.safeNumber (transaction, 'quantity'),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'status': undefined,
            'updated': undefined,
            'fee': {
                'cost': this.parseNumber (this.safeString (transaction, 'fee')),
                'currency': undefined,
            },
            'comment': undefined,
            'internal': undefined,
        } as Transaction;
    }

    parseTransactionType (type) {
        const types: Dict = {
            // TODO
            // '0': '',
            // '9': '',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name dexalot#fetchMyTrades
     * @description Returns only filled transactions (trades) for the given address. Maximum 100 records returned.
     * @see https://docs.dexalot.com/en/apiv2/RestApi.html#get-trader-fills
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] 0-100, the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request: Dict = {
            // periodfrom    Y    2022-03-02T00:00:00.000Z
            // periodto (default : current_time)    N    2022-04-11T00:00:00.000Z
            // itemsperpage (can not be greater than 100)    N    50
            // pageno    N    1
        };
        if (since !== undefined) {
            request['periodfrom'] = this.iso8601 (since);
        }
        if (limit === undefined) {
            limit = 100;
        }
        request['itemsperpage'] = limit;
        const pageNo = this.safeInteger (params, 'pageno');
        if (pageNo === undefined) {
            params['pageno'] = 1;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['periodto'] = this.iso8601 (until);
            params = this.omit (params, [ 'until' ]);
        }
        const response = await this.privateGetPrivapiSignedTraderFills (this.extend (request, params));
        //
        // [
        //     {
        //         "traderaddress": "0x720b7b64f5228a73aac1419d7b4f6b8ced62db41",
        //         "orderid": "0x000000000000000000000000000000000000000000000000000000006c314119",
        //         "tx": "0x02a193be60e7b0480ca70d0c3cb8efe1240c6f0b5ba7ba803a9486cdb3e439ba",
        //         "pair": "ALOT/USDC",
        //         "side": 0,
        //         "type": "T",
        //         "execid": 1643211314,
        //         "execquantity": "5",
        //         "execprice": "1.1276",
        //         "fee": "0.01",
        //         "feeunit": "ALOT",
        //         "ts": "2023-01-28T10:03:14.000Z"
        //     }
        // ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (path === 'privapi/auth/getwstoken') {
            headers = {
                'Content-Type': 'application/json',
                'x-apikey': this.apiKey,
            };
        } else if (api === 'private') {
            const message = 'dexalot';
            const msgBytes = this.encode (message);
            const prefix = this.encode ('\x19Ethereum Signed Message:\n' + this.numberToString (this.binaryLength (msgBytes)));
            const hash = keccak256 (this.binaryConcat (prefix, msgBytes));
            const sig = ecdsa (hash.slice (-64), this.secret.slice (-64), secp256k1, undefined);
            const signature = '0x' + sig['r'].padStart (64, '0') + sig['s'].padStart (64, '0') + this.intToBase16 (this.sum (27, sig['v'])).padStart (2, '0');
            headers = {
                'Content-Type': 'application/json',
                'x-signature': this.apiKey + ':' + signature,
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        return response;
    }
}
