'use strict';

//  ---------------------------------------------------------------------------

const coinbasepro = require ('./coinbasepro.js');

// ---------------------------------------------------------------------------

module.exports = class coinbaseprime extends coinbasepro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbaseprime',
            'name': 'Coinbase Prime',
            'has': {
                'ws': true,
                'watchOrderBook': true,
            },
            'urls': {
                'test': {
                    'ws': 'wss://ws-feed-public.sandbox.exchange.coinbase.com',
                },
                'logo': 'https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg',
                'api': {
                    'ws': 'wss://ws-feed.exchange.coinbase.com',
                },
                'www': 'https://exchange.coinbase.com',
                'doc': 'https://docs.exchange.coinbase.com/',
                'fees': 'https://pro.coinbase.com/fees',
            },
        });
    }
};
