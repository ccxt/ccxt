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
            'hasCORS': false,
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let trades = await super.fetchTrades (symbol, since, limit, params);
        for (let i = 0; i < trades.length; i++) {
            let trade = trades[i];
            trade.timestamp -= 8 * 60 * 60 * 1000; // exchange reports local time (UTC+8)
            trade.datetime = this.iso8601 (trade.timestamp);
        }
        return trades;
    }
}
