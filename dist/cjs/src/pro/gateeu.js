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
        // the ws describe-data must be applied on top of the rest describe,
        // otherwise the explicit-undefined watch* defaults of the rest 'has'
        // block wipe the parent's ws capability flags in the deep extend
        const extended = this.deepExtend(restDescribe, parentWsDescribe);
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
