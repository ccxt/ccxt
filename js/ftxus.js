'use strict';

// ---------------------------------------------------------------------------

const ftx = require ('./ftx.js');

module.exports = class ftxus extends ftx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ftxus',
            'name': 'FTXUS',
            'countries': ['US'],
            'hostname': 'ftx.us',
            'urls': {
                'www': 'https://ftx.us/',
                'docs': 'https://docs.ftx.us/',
                'fees': 'https://help.ftx.us/hc/en-us/articles/360043579273-Fees',
            },
        });
    }
};
