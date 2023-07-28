'use strict';

var binance = require('./binance.js');
var errors = require('../base/errors.js');

//  ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class binanceusdm extends binance {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'binanceusdm',
            'name': 'Binance USDⓈ-M',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg',
            },
            'options': {
                'fetchMarkets': ['linear'],
                'defaultSubType': 'linear',
            },
            // https://binance-docs.github.io/apidocs/futures/en/#error-codes
            'exceptions': {
                'exact': {
                    '-5021': errors.InvalidOrder,
                    '-5022': errors.InvalidOrder,
                    '-5028': errors.InvalidOrder, // {"code":-5028,"msg":"Timestamp for this request is outside of the ME recvWindow."}
                },
            },
        });
    }
}

module.exports = binanceusdm;
