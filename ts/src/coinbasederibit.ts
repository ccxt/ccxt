
//  ---------------------------------------------------------------------------

import deribit from './deribit.js';

//  ---------------------------------------------------------------------------

/**
 * @class coinbasederibit
 * @augments deribit
 * @description Coinbase derivatives on the Coinbase-operated Deribit gateway, authenticated with a Coinbase CDP API key (apiKey = key name, secret = private key)
 */
export default class coinbasederibit extends deribit {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'coinbasederibit',
            'name': 'Coinbase Deribit',
            'countries': [ 'US' ],
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'createDepositAddress': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFees': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'sandbox': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg',
                'api': {
                    'rest': 'https://drb.coinbase.com',
                },
                'test': undefined,
                'www': 'https://www.coinbase.com',
                'doc': [
                    'https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/overview',
                    'https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/technical',
                    'https://docs.deribit.com/v2',
                ],
                'fees': undefined,
                'referral': undefined,
            },
            'features': {
                'default': {
                    'sandbox': false,
                },
                'spot': undefined,
            },
            'options': {
                'fetchMarkets': {
                    'spot': false,
                },
            },
        });
    }
}
