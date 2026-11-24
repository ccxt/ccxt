import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
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
    // tools are listed by default even with no account (they return an actionable
    // "configure an account" error at call time; execution stays gated at the handler)
    assert.ok (names.includes ('create_order'));
    assert.ok (names.includes ('withdraw'));
    // instructions ship with the initialize result
    assert.ok (String (client.getInstructions ()).includes ('docs.ccxt.com'));
    await client.close ();
});

// A host that crashes or is force-quit closes stdin, stdout and stderr at the same instant.
// The server used to answer that with an endless EPIPE → uncaught exception → log → EPIPE
// loop: an orphan at 100% CPU per crashed session. The stand-in host below initializes the
// server and then SIGKILLs itself; the server must be gone shortly after.
test ('the server exits when its host dies without closing the pipes', { 'skip': (!fs.existsSync (serverEntry) ? 'run npm run build first' : false) || (process.platform === 'win32' ? 'needs SIGKILL and a pid probe' : false) }, async () => {
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-orphan-'));
    const config = path.join (dir, 'config.json');
    fs.writeFileSync (config, '{}', { 'mode': 0o600 });
    const host = path.join (dir, 'host.mjs');
    fs.writeFileSync (host, [
        'import { spawn } from \'node:child_process\';',
        'const child = spawn (process.execPath, [ process.argv[2] ], { \'stdio\': [ \'pipe\', \'pipe\', \'pipe\' ] });',
        'child.stderr.on (\'data\', () => undefined);',
        // the first bytes on stdout are the initialize result: the server is fully up
        'child.stdout.once (\'data\', () => process.stdout.write (String (child.pid) + \'\\n\', () => process.kill (process.pid, \'SIGKILL\')));',
        'child.stdin.write (JSON.stringify ({ \'jsonrpc\': \'2.0\', \'id\': 1, \'method\': \'initialize\', \'params\': { \'protocolVersion\': \'2025-03-26\', \'capabilities\': {}, \'clientInfo\': { \'name\': \'dying-host\', \'version\': \'0\' } } }) + \'\\n\');',
    ].join ('\n'));
    const env: Record<string, string> = { 'CCXT_MCP_CONFIG': config };
    for (const key of [ 'PATH', 'HOME' ]) {
        if (process.env[key] !== undefined) {
            env[key] = process.env[key] as string;
        }
    }
    const alive = (pid: number): boolean => {
        try {
            process.kill (pid, 0);
            return true;
        } catch (error) {
            return false;
        }
    };
    let serverPid = 0;
    try {
        serverPid = await new Promise<number> ((resolve, reject) => {
            const hostProcess = spawn (process.execPath, [ host, serverEntry ], { env, 'stdio': [ 'ignore', 'pipe', 'inherit' ] });
            let out = '';
            hostProcess.stdout.on ('data', (chunk) => {
                out += chunk;
            });
            hostProcess.on ('error', reject);
            hostProcess.on ('close', () => (/^\d+\n$/.test (out) ? resolve (Number (out)) : reject (new Error ('the stand-in host did not report the server pid: ' + JSON.stringify (out)))));
        });
        const deadline = Date.now () + 10000;
        while (alive (serverPid) && Date.now () < deadline) {
            await new Promise ((resolve) => setTimeout (resolve, 50));
        }
        assert.ok (!alive (serverPid), 'the server (pid ' + serverPid + ') is still running 10 s after its host was killed');
    } finally {
        if (serverPid !== 0 && alive (serverPid)) {
            process.kill (serverPid, 'SIGKILL');
        }
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});
