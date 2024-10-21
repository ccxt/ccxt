
// ----------------------------------------------------------------------------
import cubeRest from '../cube.js';
// -----------------------------------------------------------------------------

export default class cube extends cubeRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': false,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTicker': false,
                'watchTrades': false,
            },
            'options': {
                'api': {
                    'ws': {
                        'mendelev': {
                            'public': {
                                'orderbook': '/book/{marketId}',
                                'orderbookTops': '/tops',
                            },
                        },
                        'os': {
                            'private': {
                                'root': '/',
                            },
                        },
                    },
                },
            },
        });
    }

    getWebsocketUrl (system: string, privacy: string, path: string, params = {}) {
        const environment = this.options['environment'];
        path = this.implodeParams (path, params);
        return this.urls['api']['ws'][environment][system] + this.options['api']['ws'][environment][privacy][path];
    }
}
