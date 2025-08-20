'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var coinbase = require('./coinbase.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class coinbaseadvanced extends coinbase["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinbaseadvanced',
            'name': 'Coinbase Advanced',
            'alias': true,
        });
    }
}

exports["default"] = coinbaseadvanced;
