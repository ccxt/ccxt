import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const here = path.dirname (fileURLToPath (import.meta.url));
const serverEntry = path.resolve (here, '..', '..', 'js', 'server.js');

// spawns the COMPILED server over real stdio: proves the build output starts, speaks the
// protocol, and that nothing corrupts the stdout JSON-RPC channel end to end
test ('compiled server initializes and lists tools over real stdio', { 'skip': !fs.existsSync (serverEntry) ? 'run npm run build first' : false }, async () => {
    const emptyConfig = path.join (fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-stdio-')), 'config.json');
    fs.writeFileSync (emptyConfig, '{}', { 'mode': 0o600 });
    const cleanEnv: Record<string, string> = {};
    for (const [ key, value ] of Object.entries (process.env)) {
        // strip any ambient exchange credentials so the test is deterministic
        if (value !== undefined && !/APIKEY|SECRET|PASSWORD|PRIVATEKEY|CCXT_MCP/.test (key)) {
            cleanEnv[key] = value;
        }
    }
    const transport = new StdioClientTransport ({
        'command': process.execPath,
        'args': [ serverEntry ],
        'env': { ...cleanEnv, 'CCXT_MCP_CONFIG': emptyConfig },
    });
    const client = new Client ({ 'name': 'stdio-test', 'version': '0.0.1' });
    await client.connect (transport);
    const tools = await client.listTools ();
    const names = tools.tools.map ((tool: any) => tool.name);
    assert.ok (names.includes ('list_exchanges'));
    assert.ok (names.includes ('get_safety_status'));
    assert.ok (!names.includes ('create_order'), 'trading tools must not exist with an empty config');
    assert.ok (!names.includes ('withdraw'));
    // instructions ship with the initialize result
    assert.ok (String (client.getInstructions ()).includes ('docs.ccxt.com'));
    await client.close ();
});
