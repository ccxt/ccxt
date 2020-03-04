'use strict';

// ---------------------------------------------------------------------------

const okcoinusd = require ('./okcoinusd.js');

// ---------------------------------------------------------------------------

module.exports = class okcoincny extends okcoinusd {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okcoincny',
            'name': 'OKCoin CNY',
            'countries': [ 'CN' ],
            'hostname': 'okcoin.cn',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
            },
        });
    }
};
