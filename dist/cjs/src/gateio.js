'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var gate = require('./gate.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class gateio extends gate["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'gateio',
            'alias': true,
        });
    }
}

exports["default"] = gateio;
