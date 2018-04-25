'use strict';

// ---------------------------------------------------------------------------

const huobipro = require ('./huobipro.js');

// ---------------------------------------------------------------------------

module.exports = class hadax extends huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hadax',
            'name': 'HADAX',
            'countries': 'CN',
            'hostname': 'api.hadax.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38059952-4756c49e-32f1-11e8-90b9-45c1eccba9cd.jpg',
                'api': 'https://api.hadax.com',
                'www': 'https://www.hadax.com',
                'doc': 'https://github.com/huobiapi/API_Docs/wiki',
            },
            'has': {
                'fetchCurrencies': false,
            },
            'api': {
                'public': {
                    'get': [
                        'hadax/common/symbols', // 查询系统支持的所有交易对
                        'hadax/common/currencys', // 查询系统支持的所有币种
                        'common/timestamp', // 查询系统当前时间
                        'hadax/settings/currencys', // ?language=en-US
                    ],
                },
            },
            'options': {
                'fetchMarketsMethod': 'publicGetHadaxCommonSymbols',
            },
        });
    }
};
