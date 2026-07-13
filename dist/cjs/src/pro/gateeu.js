'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var gate = require('./gate.js');
var gateeu$1 = require('../gateeu.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class gateeu extends gate["default"] {
    describe() {
        // eslint-disable-next-line new-cap
        const restInstance = new gateeu$1["default"]();
        const restDescribe = restInstance.describe();
        const parentWsDescribe = super.describeData();
        const extended = this.deepExtend(parentWsDescribe, restDescribe);
        return this.deepExtend(extended, {
            'id': 'gateeu',
            'name': 'Gate EU',
            'countries': ['EU'],
            'certified': false,
            'urls': {
                'api': {
                    'ws': 'wss://ws.gateeu.com/v4',
                    'spot': 'wss://api.gateeu.com/ws/v4/',
                },
            },
        });
    }
}

exports["default"] = gateeu;
