'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var binance = require('./binance.js');
var binanceusdm$1 = require('../binanceusdm.js');
var errors = require('../base/errors.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class binanceusdm extends binance["default"] {
    describe() {
        // eslint-disable-next-line new-cap
        const restInstance = new binanceusdm$1["default"]();
        const restDescribe = restInstance.describe();
        const parentWsDescribe = super.describeData();
        const extended = this.deepExtend(restDescribe, parentWsDescribe);
        return this.deepExtend(extended, {
            'id': 'binanceusdm',
            'name': 'Binance USDⓈ-M',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg',
                'doc': 'https://developers.binance.com/en',
            },
            'options': {
                'fetchMarkets': {
                    'types': ['linear'],
                },
                'defaultSubType': 'linear',
            },
            // https://binance-docs.github.io/apidocs/futures/en/#error-codes
            // https://developers.binance.com/docs/derivatives/usds-margined-futures/error-code
            'exceptions': {
                'exact': {
                    '-5021': errors.InvalidOrder, // {"code":-5021,"msg":"Due to the order could not be filled immediately, the FOK order has been rejected."}
                    '-5022': errors.InvalidOrder, // {"code":-5022,"msg":"Due to the order could not be executed as maker, the Post Only order will be rejected."}
                    '-5028': errors.InvalidOrder, // {"code":-5028,"msg":"Timestamp for this request is outside of the ME recvWindow."}
                },
            },
        });
    }
}

exports["default"] = binanceusdm;
