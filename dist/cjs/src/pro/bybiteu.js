'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bybit = require('./bybit.js');
var bybiteu$1 = require('../bybiteu.js');

//  ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class bybiteu extends bybit["default"] {
    describe() {
        // eslint-disable-next-line new-cap
        const restInstance = new bybiteu$1["default"]();
        const restDescribe = restInstance.describe();
        const parentWsDescribe = super.describeData();
        const extended = this.deepExtend(restDescribe, parentWsDescribe);
        return this.deepExtend(extended, {
            'id': 'bybiteu',
            'name': 'Bybit EU',
            'countries': ['EU'],
            'hostname': 'bybit.eu',
            'certified': false,
            'urls': {
                'api': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream.{hostname}/v5/public/spot',
                            'inverse': 'wss://stream.{hostname}/v5/public/inverse',
                            'option': 'wss://stream.{hostname}/v5/public/option',
                            'linear': 'wss://stream.{hostname}/v5/public/linear',
                        },
                        'private': {
                            'spot': {
                                'unified': 'wss://stream.{hostname}/v5/private',
                                'nonUnified': 'wss://stream.{hostname}/spot/private/v3',
                            },
                            'contract': 'wss://stream.{hostname}/v5/private',
                            'usdc': 'wss://stream.{hostname}/trade/option/usdc/private/v1',
                            'trade': 'wss://stream.bybit.eu/v5/trade',
                        },
                    },
                },
                'test': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream-testnet.{hostname}/v5/public/spot',
                            'inverse': 'wss://stream-testnet.{hostname}/v5/public/inverse',
                            'linear': 'wss://stream-testnet.{hostname}/v5/public/linear',
                            'option': 'wss://stream-testnet.{hostname}/v5/public/option',
                        },
                        'private': {
                            'spot': {
                                'unified': 'wss://stream-testnet.{hostname}/v5/private',
                                'nonUnified': 'wss://stream-testnet.{hostname}/spot/private/v3',
                            },
                            'contract': 'wss://stream-testnet.{hostname}/v5/private',
                            'usdc': 'wss://stream-testnet.{hostname}/trade/option/usdc/private/v1',
                            'trade': 'wss://stream-testnet.bybit.eu/v5/trade',
                        },
                    },
                },
                'demotrading': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream.{hostname}/v5/public/spot',
                            'inverse': 'wss://stream.{hostname}/v5/public/inverse',
                            'option': 'wss://stream.{hostname}/v5/public/option',
                            'linear': 'wss://stream.{hostname}/v5/public/linear',
                        },
                        'private': {
                            'spot': {
                                'unified': 'wss://stream-demo.{hostname}/v5/private',
                                'nonUnified': 'wss://stream-demo.{hostname}/spot/private/v3',
                            },
                            'contract': 'wss://stream-demo.{hostname}/v5/private',
                            'usdc': 'wss://stream-demo.{hostname}/trade/option/usdc/private/v1',
                            'trade': 'wss://stream-demo.bybit.eu/v5/trade',
                        },
                    },
                },
            },
        });
    }
}

exports["default"] = bybiteu;
