'use strict';

// ---------------------------------------------------------------------------

const huobipro = require ('./huobipro.js');
const { ExchangeError, ExchangeNotAvailable, AuthenticationError, InvalidOrder, InsufficientFunds, OrderNotFound } = require ('./base/errors');
const { ROUND, TRUNCATE } = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class cointiger extends huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cointiger',
            'name': 'CoinTiger',
            'countries': [ 'CN' ],
            'hostname': 'api.cointiger.pro',
            'has': {
                'fetchCurrencies': false,
                'fetchTickers': true,
                'fetchTradingLimits': false,
                'fetchOrder': false,
            },
            'headers': {
                'Language': 'en_US',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/39797261-d58df196-5363-11e8-9880-2ec78ec5bd25.jpg',
                'api': {
                    'public': 'https://api.cointiger.pro/exchange/trading/api/market',
                    'private': 'https://api.cointiger.pro/exchange/trading/api',
                    'exchange': 'https://www.cointiger.pro/exchange',
                },
                'www': 'https://www.cointiger.pro',
                'referral': 'https://www.cointiger.pro/exchange/register.html?refCode=FfvDtt',
                'doc': 'https://github.com/cointiger/api-docs-en/wiki',
            },
            'api': {
                'public': {
                    'get': [
                        'history/kline', // 获取K线数据
                        'detail/merged', // 获取聚合行情(Ticker)
                        'depth', // 获取 Market Depth 数据
                        'trade', // 获取 Trade Detail 数据
                        'history/trade', // 批量获取最近的交易记录
                        'detail', // 获取 Market Detail 24小时成交量数据
                    ],
                },
                'exchange': {
                    'get': [
                        'footer/tradingrule.html',
                        'api/public/market/detail',
                    ],
                },
                'private': {
                    'get': [
                        'user/balance',
                        'order/new',
                        'order/history',
                        'order/trade',
                    ],
                    'post': [
                        'order',
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'exceptions': {
                //    {"code":"1","msg":"系统错误","data":null}
                //    {“code”:“1",“msg”:“Balance insufficient,余额不足“,”data”:null}
                '1': ExchangeError,
                '2': ExchangeError,
                '5': InvalidOrder,
                '6': InvalidOrder,
                '8': OrderNotFound,
                '16': AuthenticationError, // funding password not set
                '100001': ExchangeError,
                '100002': ExchangeNotAvailable,
                '100003': ExchangeError,
                '100005': AuthenticationError,
            },
        });
    }

    async fetchMarkets () {
        const result = [
            { 'precision': { 'amount': 1, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'aacbtc', 'uppercaseId': 'AACBTC', 'symbol': 'AAC/BTC', 'base': 'AAC', 'quote': 'BTC', 'baseId': 'aac', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'afcbtc', 'uppercaseId': 'AFCBTC', 'symbol': 'AFC/BTC', 'base': 'AFC', 'quote': 'BTC', 'baseId': 'afc', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'avhbtc', 'uppercaseId': 'AVHBTC', 'symbol': 'AVH/BTC', 'base': 'AVH', 'quote': 'BTC', 'baseId': 'avh', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'baieth', 'uppercaseId': 'BAIETH', 'symbol': 'BAI/ETH', 'base': 'BAI', 'quote': 'ETH', 'baseId': 'bai', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 3, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'bchbtc', 'uppercaseId': 'BCHBTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'baseId': 'bch', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'bkbtbtc', 'uppercaseId': 'BKBTBTC', 'symbol': 'BKBT/BTC', 'base': 'BKBT', 'quote': 'BTC', 'baseId': 'bkbt', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'bkbteth', 'uppercaseId': 'BKBTETH', 'symbol': 'BKBT/ETH', 'base': 'BKBT', 'quote': 'ETH', 'baseId': 'bkbt', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'bptnbtc', 'uppercaseId': 'BPTNBTC', 'symbol': 'BPTN/BTC', 'base': 'BPTN', 'quote': 'BTC', 'baseId': 'bptn', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 100, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 4, 'price': 2 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'btcbitcny', 'uppercaseId': 'BTCBITCNY', 'symbol': 'BTC/BitCNY', 'base': 'BTC', 'quote': 'BitCNY', 'baseId': 'btc', 'quoteId': 'bitcny', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.0001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'btmbtc', 'uppercaseId': 'BTMBTC', 'symbol': 'BTM/BTC', 'base': 'BTM', 'quote': 'BTC', 'baseId': 'btm', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 6 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'btmeth', 'uppercaseId': 'BTMETH', 'symbol': 'BTM/ETH', 'base': 'BTM', 'quote': 'ETH', 'baseId': 'btm', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 3 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'btsbitcny', 'uppercaseId': 'BTSBITCNY', 'symbol': 'BTS/BitCNY', 'base': 'BTS', 'quote': 'BitCNY', 'baseId': 'bts', 'quoteId': 'bitcny', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'btsbtc', 'uppercaseId': 'BTSBTC', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 6 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'btseth', 'uppercaseId': 'BTSETH', 'symbol': 'BTS/ETH', 'base': 'BTS', 'quote': 'ETH', 'baseId': 'bts', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ctxcbtc', 'uppercaseId': 'CTXCBTC', 'symbol': 'CTXC/BTC', 'base': 'CTXC', 'quote': 'BTC', 'baseId': 'ctxc', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ctxceth', 'uppercaseId': 'CTXCETH', 'symbol': 'CTXC/ETH', 'base': 'CTXC', 'quote': 'ETH', 'baseId': 'ctxc', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'elfbtc', 'uppercaseId': 'ELFBTC', 'symbol': 'ELF/BTC', 'base': 'ELF', 'quote': 'BTC', 'baseId': 'elf', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'eosbtc', 'uppercaseId': 'EOSBTC', 'symbol': 'EOS/BTC', 'base': 'EOS', 'quote': 'BTC', 'baseId': 'eos', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 6 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'eoseth', 'uppercaseId': 'EOSETH', 'symbol': 'EOS/ETH', 'base': 'EOS', 'quote': 'ETH', 'baseId': 'eos', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'etcbtc', 'uppercaseId': 'ETCBTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'baseId': 'etc', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 3, 'price': 2 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ethbitcny', 'uppercaseId': 'ETHBITCNY', 'symbol': 'ETH/BitCNY', 'base': 'ETH', 'quote': 'BitCNY', 'baseId': 'eth', 'quoteId': 'bitcny', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 3, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ethbtc', 'uppercaseId': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 2 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'gtobitcny', 'uppercaseId': 'GTOBITCNY', 'symbol': 'GTO/BitCNY', 'base': 'GTO', 'quote': 'BitCNY', 'baseId': 'gto', 'quoteId': 'bitcny', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'gusbtc', 'uppercaseId': 'GUSBTC', 'symbol': 'GUS/BTC', 'base': 'GUS', 'quote': 'BTC', 'baseId': 'gus', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 4, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'icxbtc', 'uppercaseId': 'ICXBTC', 'symbol': 'ICX/BTC', 'base': 'ICX', 'quote': 'BTC', 'baseId': 'icx', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.0001, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'incbtc', 'uppercaseId': 'INCBTC', 'symbol': 'INC/BTC', 'base': 'INC', 'quote': 'BTC', 'baseId': 'inc', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 5, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 6 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'inceth', 'uppercaseId': 'INCETH', 'symbol': 'INC/ETH', 'base': 'INC', 'quote': 'ETH', 'baseId': 'inc', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 5, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'kkgbtc', 'uppercaseId': 'KKGBTC', 'symbol': 'KKG/BTC', 'base': 'KKG', 'quote': 'BTC', 'baseId': 'kkg', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 6 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'kkgeth', 'uppercaseId': 'KKGETH', 'symbol': 'KKG/ETH', 'base': 'KKG', 'quote': 'ETH', 'baseId': 'kkg', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ltcbtc', 'uppercaseId': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'mexbtc', 'uppercaseId': 'MEXBTC', 'symbol': 'MEX/BTC', 'base': 'MEX', 'quote': 'BTC', 'baseId': 'mex', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 100, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'mtbtc', 'uppercaseId': 'MTBTC', 'symbol': 'MT/BTC', 'base': 'MT', 'quote': 'BTC', 'baseId': 'mt', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'mteth', 'uppercaseId': 'MTETH', 'symbol': 'MT/ETH', 'base': 'MT', 'quote': 'ETH', 'baseId': 'mt', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 3 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ocnbitcny', 'uppercaseId': 'OCNBITCNY', 'symbol': 'OCN/BitCNY', 'base': 'OCN', 'quote': 'BitCNY', 'baseId': 'ocn', 'quoteId': 'bitcny', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ocnbtc', 'uppercaseId': 'OCNBTC', 'symbol': 'OCN/BTC', 'base': 'OCN', 'quote': 'BTC', 'baseId': 'ocn', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'olebtc', 'uppercaseId': 'OLEBTC', 'symbol': 'OLE/BTC', 'base': 'OLE', 'quote': 'BTC', 'baseId': 'ole', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'oleeth', 'uppercaseId': 'OLEETH', 'symbol': 'OLE/ETH', 'base': 'OLE', 'quote': 'ETH', 'baseId': 'ole', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'omgbtc', 'uppercaseId': 'OMGBTC', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC', 'baseId': 'omg', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'repbtc', 'uppercaseId': 'REPBTC', 'symbol': 'REP/BTC', 'base': 'REP', 'quote': 'BTC', 'baseId': 'rep', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'sdabtc', 'uppercaseId': 'SDABTC', 'symbol': 'SDA/BTC', 'base': 'SDA', 'quote': 'BTC', 'baseId': 'sda', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'sdaeth', 'uppercaseId': 'SDAETH', 'symbol': 'SDA/ETH', 'base': 'SDA', 'quote': 'ETH', 'baseId': 'sda', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'sntbtc', 'uppercaseId': 'SNTBTC', 'symbol': 'SNT/BTC', 'base': 'SNT', 'quote': 'BTC', 'baseId': 'snt', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 1, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'socbtc', 'uppercaseId': 'SOCBTC', 'symbol': 'SOC/BTC', 'base': 'SOC', 'quote': 'BTC', 'baseId': 'soc', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'sphbtc', 'uppercaseId': 'SPHBTC', 'symbol': 'SPH/BTC', 'base': 'SPH', 'quote': 'BTC', 'baseId': 'sph', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 100, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'storjbtc', 'uppercaseId': 'STORJBTC', 'symbol': 'STORJ/BTC', 'base': 'STORJ', 'quote': 'BTC', 'baseId': 'storj', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 1, 'price': 3 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'tchbitcny', 'uppercaseId': 'TCHBITCNY', 'symbol': 'TCH/BitCNY', 'base': 'TCH', 'quote': 'BitCNY', 'baseId': 'tch', 'quoteId': 'bitcny', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }, 'price': { 'min': 0.001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 1, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'tchbtc', 'uppercaseId': 'TCHBTC', 'symbol': 'TCH/BTC', 'base': 'TCH', 'quote': 'BTC', 'baseId': 'tch', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 3 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'trxbitcny', 'uppercaseId': 'TRXBITCNY', 'symbol': 'TRX/BitCNY', 'base': 'TRX', 'quote': 'BitCNY', 'baseId': 'trx', 'quoteId': 'bitcny', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'trxbtc', 'uppercaseId': 'TRXBTC', 'symbol': 'TRX/BTC', 'base': 'TRX', 'quote': 'BTC', 'baseId': 'trx', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'trxeth', 'uppercaseId': 'TRXETH', 'symbol': 'TRX/ETH', 'base': 'TRX', 'quote': 'ETH', 'baseId': 'trx', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'tusdbtc', 'uppercaseId': 'TUSDBTC', 'symbol': 'TUSD/BTC', 'base': 'TUSD', 'quote': 'BTC', 'baseId': 'tusd', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 6 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'tusdeth', 'uppercaseId': 'TUSDETH', 'symbol': 'TUSD/ETH', 'base': 'TUSD', 'quote': 'ETH', 'baseId': 'tusd', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 1, 'price': 2 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'xembitcny', 'uppercaseId': 'XEMBITCNY', 'symbol': 'XEM/BitCNY', 'base': 'XEM', 'quote': 'BitCNY', 'baseId': 'xem', 'quoteId': 'bitcny', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.1, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'yeebtc', 'uppercaseId': 'YEEBTC', 'symbol': 'YEE/BTC', 'base': 'YEE', 'quote': 'BTC', 'baseId': 'yee', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 0, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'yeeeth', 'uppercaseId': 'YEEETH', 'symbol': 'YEE/ETH', 'base': 'YEE', 'quote': 'ETH', 'baseId': 'yee', 'quoteId': 'eth', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 4, 'price': 8 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'zrxbtc', 'uppercaseId': 'ZRXBTC', 'symbol': 'ZRX/BTC', 'base': 'ZRX', 'quote': 'BTC', 'baseId': 'zrx', 'quoteId': 'btc', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.0001, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 4, 'price': 2 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'btcusdt', 'uppercaseId': 'BTCUSDT', 'symbol': 'BTC/USDT', 'base': 'BTC', 'quote': 'USDT', 'baseId': 'btc', 'quoteId': 'usdt', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.0001, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 3, 'price': 2 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ethusdt', 'uppercaseId': 'ETHUSDT', 'symbol': 'ETH/USDT', 'base': 'ETH', 'quote': 'USDT', 'baseId': 'eth', 'quoteId': 'usdt', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
            { 'precision': { 'amount': 2, 'price': 2 }, 'tierBased': false, 'percentage': true, 'taker': 0.001, 'maker': 0.001, 'id': 'ltcusdt', 'uppercaseId': 'LTCUSDT', 'symbol': 'LTC/USDT', 'base': 'LTC', 'quote': 'USDT', 'baseId': 'ltc', 'quoteId': 'usdt', 'active': true, 'info': undefined, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 1e-8, 'max': undefined }, 'cost': { 'min': 0, 'max': undefined }}},
        ];
        this.options['marketsByUppercaseId'] = this.indexBy (result, 'uppercaseId');
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = this.safeInteger (ticker, 'id');
        let close = this.safeFloat (ticker, 'last');
        let percentage = this.safeFloat (ticker, 'percentChange');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetDepth (this.extend ({
            'symbol': market['id'], // this endpoint requires a lowercase market id
            'type': 'step0',
        }, params));
        let data = response['data']['depth_data'];
        if ('tick' in data) {
            if (!data['tick']) {
                throw new ExchangeError (this.id + ' fetchOrderBook() returned empty response: ' + this.json (response));
            }
            let orderbook = data['tick'];
            let timestamp = data['ts'];
            return this.parseOrderBook (orderbook, timestamp, 'buys');
        }
        throw new ExchangeError (this.id + ' fetchOrderBook() returned unrecognized response: ' + this.json (response));
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketId = market['uppercaseId'];
        let response = await this.exchangeGetApiPublicMarketDetail (params);
        if (!(marketId in response))
            throw new ExchangeError (this.id + ' fetchTicker symbol ' + symbol + ' (' + marketId + ') not found');
        return this.parseTicker (response[marketId], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.exchangeGetApiPublicMarketDetail (params);
        let result = {};
        let ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = undefined;
            let symbol = id;
            if (id in this.options['marketsByUppercaseId']) {
                // this endpoint returns uppercase ids
                symbol = this.options['marketsByUppercaseId'][id]['symbol'];
                market = this.options['marketsByUppercaseId'][id];
            }
            result[symbol] = this.parseTicker (response[id], market);
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         "volume": {
        //             "amount": "1.000",
        //             "icon": "",
        //             "title": "成交量"
        //                   },
        //         "price": {
        //             "amount": "0.04978883",
        //             "icon": "",
        //             "title": "委托价格"
        //                  },
        //         "created_at": 1513245134000,
        //         "deal_price": {
        //             "amount": 0.04978883000000000000000000000000,
        //             "icon": "",
        //             "title": "成交价格"
        //                       },
        //         "id": 138
        //     }
        //
        let side = this.safeString (trade, 'side');
        let amount = undefined;
        let price = undefined;
        let cost = undefined;
        if (typeof side !== 'undefined') {
            side = side.toLowerCase ();
            price = this.safeFloat (trade, 'price');
            amount = this.safeFloat (trade, 'amount');
        } else {
            price = this.safeFloat (trade['price'], 'amount');
            amount = this.safeFloat (trade['volume'], 'amount');
            cost = this.safeFloat (trade['deal_price'], 'amount');
        }
        if (typeof amount !== 'undefined')
            if (typeof price !== 'undefined')
                if (typeof cost === 'undefined')
                    cost = amount * price;
        let timestamp = this.safeValue (trade, 'created_at');
        if (typeof timestamp === 'undefined')
            timestamp = this.safeValue (trade, 'ts');
        let iso8601 = (typeof timestamp !== 'undefined') ? this.iso8601 (timestamp) : undefined;
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': iso8601,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (typeof limit !== 'undefined')
            request['size'] = limit;
        let response = await this.publicGetHistoryTrade (this.extend (request, params));
        return this.parseTrades (response['data']['trade_data'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (typeof limit === 'undefined')
            limit = 100;
        let response = await this.privateGetOrderTrade (this.extend ({
            'symbol': market['id'],
            'offset': 1,
            'limit': limit,
        }, params));
        return this.parseTrades (response['data']['list'], market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
        };
        if (typeof limit !== 'undefined') {
            request['size'] = limit;
        }
        let response = await this.publicGetHistoryKline (this.extend (request, params));
        return this.parseOHLCVs (response['data']['kline_data'], market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetUserBalance (params);
        //
        //     {
        //         "code": "0",
        //         "msg": "suc",
        //         "data": [{
        //             "normal": "1813.01144179",
        //             "lock": "1325.42036785",
        //             "coin": "btc"
        //         }, {
        //             "normal": "9551.96692244",
        //             "lock": "547.06506717",
        //             "coin": "eth"
        //         }]
        //     }
        //
        let balances = response['data'];
        let result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let id = balance['coin'];
            let code = id.toUpperCase ();
            code = this.commonCurrencyCode (code);
            if (id in this.currencies_by_id) {
                code = this.currencies_by_id[id]['code'];
            }
            let account = this.account ();
            account['used'] = parseFloat (balance['lock']);
            account['free'] = parseFloat (balance['normal']);
            account['total'] = this.sum (account['used'], account['free']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrdersByStatus (status = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (typeof limit === 'undefined')
            limit = 100;
        let method = (status === 'open') ? 'privateGetOrderNew' : 'privateGetOrderHistory';
        let response = await this[method] (this.extend ({
            'symbol': market['id'],
            'offset': 1,
            'limit': limit,
        }, params));
        return this.parseOrders (response['data']['list'], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    parseOrder (order, market = undefined) {
        let side = this.safeString (order, 'side');
        side = side.toLowerCase ();
        //
        //      {
        //            volume: { "amount": "0.054", "icon": "", "title": "volume" },
        //         age_price: { "amount": "0.08377697", "icon": "", "title": "Avg price" },
        //              side: "BUY",
        //             price: { "amount": "0.00000000", "icon": "", "title": "price" },
        //        created_at: 1525569480000,
        //       deal_volume: { "amount": "0.64593598", "icon": "", "title": "Deal volume" },
        //   "remain_volume": { "amount": "1.00000000", "icon": "", "title": "尚未成交"
        //                id: 26834207,
        //             label: { go: "trade", title: "Traded", click: 1 },
        //          side_msg: "Buy"
        //      },
        //
        let type = undefined;
        let status = undefined;
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = order['created_at'];
        let amount = this.safeFloat (order['volume'], 'amount');
        let remaining = ('remain_volume' in order) ? this.safeFloat (order['remain_volume'], 'amount') : undefined;
        let filled = ('deal_volume' in order) ? this.safeFloat (order['deal_volume'], 'amount') : undefined;
        let price = ('age_price' in order) ? this.safeFloat (order['age_price'], 'amount') : undefined;
        if (typeof price === 'undefined')
            price = ('price' in order) ? this.safeFloat (order['price'], 'amount') : undefined;
        let cost = undefined;
        let average = undefined;
        if (typeof amount !== 'undefined') {
            if (typeof remaining !== 'undefined') {
                if (typeof filled === 'undefined')
                    filled = amount - remaining;
            } else if (typeof filled !== 'undefined') {
                cost = filled * price;
                average = parseFloat (cost / filled);
                if (typeof remaining === 'undefined')
                    remaining = amount - filled;
            }
        }
        if ((typeof remaining !== 'undefined') && (remaining > 0))
            status = 'open';
        let result = {
            'info': order,
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, ROUND, this.markets[symbol]['precision']['price']);
    }

    priceToPrecision (symbol, price) {
        return this.decimalToPrecision (price, ROUND, this.markets[symbol]['precision']['price']);
    }

    amountToPrecision (symbol, amount) {
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount']);
    }

    feeToPrecision (currency, fee) {
        return this.decimalToPrecision (fee, ROUND, this.currencies[currency]['precision']);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (!this.password)
            throw new AuthenticationError (this.id + ' createOrder requires exchange.password to be set to user trading password (not login password!)');
        this.checkRequiredCredentials ();
        let market = this.market (symbol);
        let orderType = (type === 'limit') ? 1 : 2;
        let order = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': orderType,
            'volume': this.amountToPrecision (symbol, amount),
            'capital_password': this.password,
        };
        if ((type === 'market') && (side === 'buy')) {
            if (typeof price === 'undefined') {
                throw new InvalidOrder (this.id + ' createOrder requires price argument for market buy orders to calculate total cost according to exchange rules');
            }
            order['volume'] = this.amountToPrecision (symbol, amount * price);
        }
        if (type === 'limit') {
            order['price'] = this.priceToPrecision (symbol, price);
        } else {
            if (typeof price === 'undefined') {
                order['price'] = this.priceToPrecision (symbol, 0);
            } else {
                order['price'] = this.priceToPrecision (symbol, price);
            }
        }
        let response = await this.privatePostOrder (this.extend (order, params));
        //
        //     { "order_id":34343 }
        //
        let timestamp = this.milliseconds ();
        return {
            'info': response,
            'id': response['data']['order_id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (typeof symbol === 'undefined')
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol argument');
        let market = this.market (symbol);
        let response = await this.privateDeleteOrder (this.extend ({
            'symbol': market['id'],
            'order_id': id,
        }, params));
        return {
            'id': id,
            'symbol': symbol,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        this.checkRequiredCredentials ();
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (api === 'private') {
            let timestamp = this.milliseconds ().toString ();
            let query = this.keysort (this.extend ({
                'time': timestamp,
            }, params));
            let keys = Object.keys (query);
            let auth = '';
            for (let i = 0; i < keys.length; i++) {
                auth += keys[i] + query[keys[i]].toString ();
            }
            auth += this.secret;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
            let isCreateOrderMethod = (path === 'order') && (method === 'POST');
            let urlParams = isCreateOrderMethod ? {} : query;
            url += '?' + this.urlencode (this.keysort (this.extend ({
                'api_key': this.apiKey,
                'time': timestamp,
            }, urlParams)));
            url += '&sign=' + signature;
            if (method === 'POST') {
                body = this.urlencode (query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        } else if (api === 'public') {
            url += '?' + this.urlencode (this.extend ({
                'api_key': this.apiKey,
            }, params));
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            if ('code' in response) {
                //
                //     { "code": "100005", "msg": "request sign illegal", "data": null }
                //
                let code = this.safeString (response, 'code');
                if ((typeof code !== 'undefined') && (code !== '0')) {
                    const message = this.safeString (response, 'msg');
                    const feedback = this.id + ' ' + this.json (response);
                    const exceptions = this.exceptions;
                    if (code in exceptions) {
                        if (code === 1) {
                            //    {"code":"1","msg":"系统错误","data":null}
                            //    {“code”:“1",“msg”:“Balance insufficient,余额不足“,”data”:null}
                            if (message.indexOf ('Balance insufficient') >= 0) {
                                throw new InsufficientFunds (feedback);
                            }
                        } else if (code === 2) {
                            if (message === 'offsetNot Null') {
                                throw new ExchangeError (feedback);
                            } else if (message === 'Parameter error') {
                                throw new ExchangeError (feedback);
                            }
                        }
                        throw new exceptions[code] (feedback);
                    } else {
                        throw new ExchangeError (this.id + ' unknown "error" value: ' + this.json (response));
                    }
                }
            }
        }
    }
};

