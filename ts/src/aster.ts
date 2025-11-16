
//  ---------------------------------------------------------------------------

import binanceusdm from './binanceusdm.js';

//  ---------------------------------------------------------------------------

/**
 * @class aster
 * @augments binanceusdm
 * @description Aster DEX - Decentralized perpetual futures exchange
 */
export default class aster extends binanceusdm {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'aster',
            'name': 'Aster',
            'countries': [ 'SG' ], // Singapore-based
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false, // Aster only has futures API accessible
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'createConvertTrade': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistory': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFees': false,
                'fetchIsolatedBorrowRates': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://static.asterdexstatic.com/cloud-futures/static/images/aster/logo.svg',
                'api': {
                    // Futures API endpoints only - no spot API available
                    'fapiPublic': 'https://fapi.asterdex.com/fapi/v1',
                    'fapiPublicV2': 'https://fapi.asterdex.com/fapi/v2',
                    'fapiPublicV3': 'https://fapi.asterdex.com/fapi/v3',
                    'fapiPrivate': 'https://fapi.asterdex.com/fapi/v1',
                    'fapiPrivateV2': 'https://fapi.asterdex.com/fapi/v2',
                    'fapiPrivateV3': 'https://fapi.asterdex.com/fapi/v3',
                    'fapiData': 'https://fapi.asterdex.com/futures/data',
                },
                'www': 'https://www.asterdex.com/en/referral/49A4aD',
                'referral': {
                    'url': 'https://www.asterdex.com/en/referral/49A4aD',
                    'discount': 0.1,
                },
                'doc': [
                    'https://docs.asterdex.com/product/aster-perpetual-pro/api/api-documentation',
                    'https://github.com/asterdex/api-docs',
                ],
                'fees': 'https://www.asterdex.com/fees',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber ('0.0005'), // 0.05%
                    'maker': this.parseNumber ('0.0002'), // 0.02%
                },
            },
            'options': {
                'fetchMarkets': {
                    'types': [ 'linear' ], // Only linear perpetuals
                },
                'defaultSubType': 'linear',
                'leverageBrackets': undefined,
                'marginTypes': {},
                'marginModes': {},
                // Aster-specific options
                'recvWindow': 5000,
                'adjustForTimeDifference': true,
                'defaultTimeInForce': 'GTC',
                'warnOnFetchOpenOrdersWithoutSymbol': true,
            },
        });
    }
}
