'use strict';

var coinbase = require('./coinbase.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class coinbaseadvanced extends coinbase {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinbaseadvanced',
            'name': 'Coinbase Advanced',
            'alias': true,
        });
    }
}

module.exports = coinbaseadvanced;
