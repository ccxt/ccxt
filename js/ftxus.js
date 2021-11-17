'use strict';

// ---------------------------------------------------------------------------

const ftx = require ('./ftx.js');

module.exports = class ftxus extends ftx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ftxus',
            'name': 'FTX US',
            'countries': ['US'],
            'certified': false,
            'hostname': 'ftx.us',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/141506670-12f6115f-f425-4cd8-b892-b51d157ca01f.jpg',
                'www': 'https://ftx.us/',
                'docs': 'https://docs.ftx.us/',
                'fees': 'https://help.ftx.us/hc/en-us/articles/360043579273-Fees',
            },
        });
    }
};
