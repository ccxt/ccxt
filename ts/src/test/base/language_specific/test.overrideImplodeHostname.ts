// @ts-nocheck
// todo: per https://github.com/ttodua/ccxt/blob/428f5b50da50b7401caa5ac452538fb0f6641af4/ts/src/test/base/test.calculateFee.ts

import assert, { strictEqual, deepEqual } from 'assert';
import ccxt, { exchanges, Exchange, functions } from '../../../../ccxt.js';



function testImplodeHostnameOverride () {

    const skippedExchanges = [ 'gate', 'gateeu', 'whitebit' ];
    for (const eClass of Object.values (exchanges)) {
        const exchange = new eClass ();
        const id = exchange.id;
        console.log (exchange.id);
        exchange.implodeHostname = (url: string) => {
            if (!exchange.hostname) {
                throw new Error ('implodeHostname being used, while exchange.hostname is undefined for ' + exchange.id);
            }
            return exchange.hostname;
        };
        try {
            let firstKey = 'public' in exchange.urls['api'] ? 'public' : Object.keys (exchange.urls['api'])[0];
            if (Array.isArray (firstKey)) {
                firstKey = firstKey[0]; // some exchanges
            }
            const signed = exchange.sign ('https://api.example.com/{hostname}/endpoint', firstKey, 'GET', {}, {});
        } catch (e) {
            if (skippedExchanges.includes (exchange.id) ||
                e.stack.startsWith ('AuthenticationError') ||
                e.message.includes ('testnet/sandbox URL')
            ) {
                console.log ('skipping ' + exchange.id + ' check for implodeHostname override, because of unrelated issues');
                continue;
            }
            throw e;
        }
    }
}

export default testImplodeHostnameOverride;
