'use strict';

//  ---------------------------------------------------------------------------

const kucoin = require ('./kucoin.js');

//  ---------------------------------------------------------------------------

module.exports = class kucoin2 extends kucoin {
    describe () {
        // KuCoin v1 is deprecated, 'kucoin2' renamed to 'kucoin', 'kucoin2' to be removed on 2019-03-30
        return this.deepExtend (super.describe (), {
            'id': 'kucoin2',
        });
    }
};

