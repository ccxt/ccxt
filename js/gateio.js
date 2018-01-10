"use strict";

// ---------------------------------------------------------------------------

const bter = require ('./bter.js')

// ---------------------------------------------------------------------------

module.exports = class gateio extends bter {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'name': 'Gate.io',
            'countries': 'CN',
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'api': {
                    'public': 'https://data.gate.io/api',
                    'private': 'https://data.gate.io/api',
                },
                'www': 'https://gate.io/',
                'doc': 'https://gate.io/api2',
                'fees': 'https://gate.io/fee',
            },
        });
    }

    parseTrade (trade, market) {
        // exchange reports local time (UTC+8)
        let timestamp = this.parse8601 (trade['date']) - 8 * 60 * 60 * 1000;
        return {
            'id': trade['tradeID'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': trade['rate'],
            'amount': this.safeFloat (trade, 'amount'),
        };
    }
}
