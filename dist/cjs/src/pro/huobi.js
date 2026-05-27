'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var htx = require('./htx.js');

//  ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class huobi extends htx["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'alias': true,
            'id': 'huobi',
        });
    }
}

exports["default"] = huobi;
