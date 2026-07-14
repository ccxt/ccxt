// @ts-nocheck
// todo: per https://github.com/ttodua/ccxt/blob/428f5b50da50b7401caa5ac452538fb0f6641af4/ts/src/test/base/test.calculateFee.ts

import assert, { strictEqual, deepEqual } from 'assert';
import ccxt, { exchanges, Exchange, functions } from '../../../../ccxt.js';



function testImplodeHostnameOverride () {

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
            const signed = exchange.sign ('https://api.example.com/{hostname}/endpoint', 'GET', {}, {});
        } catch (e) {
            debugger;
            throw e;
        }
    }
}

export default testImplodeHostnameOverride;
