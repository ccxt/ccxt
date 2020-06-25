'use strict';

//  ---------------------------------------------------------------------------

const { NotSupported } = require ('ccxt/js/base/errors');
const huobipro = require ('./huobipro.js');

// ---------------------------------------------------------------------------

module.exports = class huobijp extends huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'huobijp',
            'name': 'Huobi Japan',
            'countries': [ 'JP' ],
            'hostname': 'api-cloud.huobi.co.jp',
            'has': {
                'fetchDepositAddress': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg',
                'api': {
                    'ws': {
                        'api': {
                            'public': 'wss://{hostname}/ws',
                            'private': 'wss://{hostname}/ws',
                        },
                    },
                    'market': 'https://{hostname}',
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                },
                'www': 'https://www.huobi.co.jp',
                'referral': 'https://www.huobi.co.jp/register/?invite_code=znnq3',
                'doc': 'https://api-doc.huobi.co.jp',
                'fees': 'https://www.huobi.co.jp/support/fee',
            },
        });
    }

    async fetchDepositAddress (code, params = {}) {
        throw new NotSupported (this.id + ' fetchDepositAddress not supported yet');
    }
};
