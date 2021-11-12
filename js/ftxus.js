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
            },
        });
    }
};
