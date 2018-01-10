"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')

//  ---------------------------------------------------------------------------

module.exports = class blockchain extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'blockchain',
            'name': 'Blockchain',
            'countries': 'US',
            'version': '',
            'rateLimit': 300,
            'hasCORS': true,
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://blockchain.info/',
                },
                'www': 'https://blockchain.info/',
                'doc': [
                    'https://blockchain.info/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'rawblock/{block}', // Single block information
                        'rawtx/{transaction}', // Single transaction information
                        'charts/{chartType}', // Chart data
                        'block-height/{blockHeight}', // Block height
                        'balance', // Address balance information (use active queryparam)
                        'rawaddr/{address}', // Address information
                        'multiaddr', // Multiple address information (use active queryparam)
                        '{currency}/{network}/txs', // Unconfirmed transactions
                        'unspent', // Unspent outputs (use active queryparam)
                        'latestblock', // Latest block
                        'unconfirmed-transactions', // Unconfirmed transactions
                        'blocks/{timeOrPoolName}', // Blocks for one day or for specific pool
                    ],
                },
            },
        });
    }
}
