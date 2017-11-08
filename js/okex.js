"use strict";

// ---------------------------------------------------------------------------

const okcoinusd = require ('./okcoinusd.js')

// ---------------------------------------------------------------------------

module.exports = class okex extends okcoinusd {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex',
            'name': 'OKEX',
            'countries': [ 'CN', 'US' ],
            'hasCORS': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29562593-9038a9bc-8742-11e7-91cc-8201f845bfc1.jpg',
                'api': {
                    'www': 'https://www.okex.com',
                    'public': 'https://www.okex.com/api',
                    'private': 'https://www.okex.com/api',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/rest_getStarted.html',
            },
            'markets': {
                'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
                'LTC/USD': { 'id': 'ltc_usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
                'ETH/USD': { 'id': 'eth_usd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
                'ETC/USD': { 'id': 'etc_usd', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
                'BCH/USD': { 'id': 'bch_usd', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
                'BTC/USDT': { 'id': 'btc_usdt', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'LTC/USDT': { 'id': 'ltc_usdt', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'ETH/USDT': { 'id': 'eth_usdt', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'ETC/USDT': { 'id': 'etc_usdt', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'BCH/USDT': { 'id': 'bch_usdt', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'ETC/BTC': { 'id': 'etc_btc', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'BCH/BTC': { 'id': 'bch_btc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'ETC/ETH': { 'id': 'etc_eth', 'symbol': 'ETC/ETH', 'base': 'ETC', 'quote': 'ETH', 'type': 'spot', 'spot': true, 'future': false },
                'BT1/BTC': { 'id': 'bt1_btc', 'symbol': 'BT1/BTC', 'base': 'BT1', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'BT2/BTC': { 'id': 'bt2_btc', 'symbol': 'BT2/BTC', 'base': 'BT2', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
                'BTG/BTC': { 'id': 'btg_btc', 'symbol': 'BTG/BTC', 'base': 'BTG', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
            },
        });
    }
}
