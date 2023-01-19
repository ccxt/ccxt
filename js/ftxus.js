'use strict';

// ---------------------------------------------------------------------------

const ftx = require ('./ftx.js');

module.exports = class ftxus extends ftx {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ftxus',
            'name': 'FTX US',
            'countries': [ 'US' ],
            'certified': false,
            'hostname': 'ftx.us',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // Has but not fully implemented
                'swap': false,
                'future': false,
                'option': undefined,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchPremiumIndexOHLCV': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/141506670-12f6115f-f425-4cd8-b892-b51d157ca01f.jpg',
                'www': 'https://ftx.us/',
                'docs': 'https://docs.ftx.us/',
                'fees': 'https://help.ftx.us/hc/en-us/articles/360043579273-Fees',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0006') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0') ],
                        ],
                    },
                },
            },
        });
    }
};
