// NO_AUTO_TRANSPILE
// @ts-nocheck

// native ts test, intentionally not transpiled - validateServerSsl = false must let both REST and WS
// connect to a server with a self-signed, expired, hostname-mismatching certificate, while the default
// (true) must reject it. the shared server lives in ts/src/test/static/ssl/server.cjs

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import ccxt from '../../../../ccxt.js';

function findSslServerScript () {
    let dir = path.dirname (fileURLToPath (import.meta.url));
    for (let i = 0; i < 10; i++) {
        const candidate = path.join (dir, 'ts', 'src', 'test', 'static', 'ssl', 'server.cjs');
        if (fs.existsSync (candidate)) {
            return candidate;
        }
        dir = path.dirname (dir);
    }
    throw new Error ('ts/src/test/static/ssl/server.cjs not found');
}

async function startSslServer () {
    const child = spawn (process.execPath, [ findSslServerScript () ], { 'stdio': [ 'pipe', 'pipe', 'inherit' ] });
    const port = await new Promise ((resolve, reject) => {
        let buffer = '';
        child.stdout.on ('data', (chunk) => {
            buffer += chunk.toString ();
            const newline = buffer.indexOf ('\n');
            if (newline >= 0) {
                resolve (parseInt (buffer.slice (0, newline).trim ()));
            }
        });
        child.once ('error', reject);
        child.once ('exit', (code) => reject (new Error ('ssl test server exited with code ' + code)));
    });
    return { child, port };
}

async function connectWs (exchange, url) {
    // a failed handshake is reported through onError (the connected future stays pending)
    const received = new Promise ((resolve, reject) => {
        exchange.handleMessage = (client, message) => resolve (message);
        exchange.onError = (client, error) => reject (error);
    });
    const client = exchange.client (url);
    client.connect ().catch (() => {});
    const message = await received;
    await client.close ();
    return message;
}

async function testValidateServerSsl () {
    const { child, port } = await startSslServer ();
    const restUrl = 'https://127.0.0.1:' + port + '/ping';
    const wsUrl = 'wss://127.0.0.1:' + port + '/ws';
    try {
        // default: certificate must be rejected
        const strict = new ccxt.Exchange ({ 'id': 'ssltest', 'timeout': 5000 });
        assert.strictEqual (strict.validateServerSsl, true);
        await assert.rejects (strict.fetch (restUrl), 'REST must fail against an invalid certificate by default');
        await assert.rejects (connectWs (strict, wsUrl), 'WS must fail against an invalid certificate by default');
        await strict.close ();
        // disabled: both must succeed
        const lax = new ccxt.Exchange ({ 'id': 'ssltest', 'timeout': 5000, 'validateServerSsl': false });
        const response = await lax.fetch (restUrl);
        assert.deepStrictEqual (response, { 'ok': true });
        const message = await connectWs (lax, wsUrl);
        assert.deepStrictEqual (message, { 'ok': true });
        await lax.close ();
    } finally {
        child.stdin.end ();
        child.kill ();
    }
}

export default testValidateServerSsl;
