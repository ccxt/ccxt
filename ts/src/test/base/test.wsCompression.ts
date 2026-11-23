// NO_AUTO_TRANSPILE
//  ---------------------------------------------------------------------------
//  ws compression option — offline tests.
//
//  Run:  npx tsx --test ts/src/test/base/test.wsCompression.ts
//
//  Nado's subscription gateway sits behind cloudflare and 403s any handshake
//  that does not offer permessage-deflate (RFC 7692). The venue declares the
//  requirement in its own `options.ws.compress`; the base client maps it onto
//  the 'ws' package's perMessageDeflate option. Both halves are asserted here
//  without touching the network.
//  ---------------------------------------------------------------------------

import assert from 'assert';
import { test } from 'node:test';
import nado from '../../pro/nado.js';
import { wsPerMessageDeflate } from '../../base/ws/WsClient.js';

test ('nado declares the permessage-deflate opt-in', () => {
    const exchange = new nado ();
    const wsOptions = exchange.options['ws'];
    assert.strictEqual (wsOptions['compress'], true);
});

test ('compress maps onto the ws perMessageDeflate option', () => {
    assert.strictEqual (wsPerMessageDeflate ({ 'compress': true }), true);
    assert.strictEqual (wsPerMessageDeflate ({ 'compress': 15 }), true);
    assert.strictEqual (wsPerMessageDeflate ({ 'compress': 0 }), false);
    assert.strictEqual (wsPerMessageDeflate ({ 'compress': false }), false);
    assert.strictEqual (wsPerMessageDeflate ({}), undefined);
});
