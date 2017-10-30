"use strict";

// ---------------------------------------------------------------------------

const huobi1 = require ('./huobi1.js')

// ---------------------------------------------------------------------------

module.exports = class huobipro extends huobi1 {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'huobipro',
            'name': 'Huobi Pro',
            'hostname': 'api.huobi.pro',
            'hasCORS': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api': 'https://api.huobi.pro',
                'www': 'https://www.huobi.pro',
                'doc': 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
            },
        });
    }
}
