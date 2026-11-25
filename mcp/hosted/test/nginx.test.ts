import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ANTHROPIC_EGRESS_RANGES } from '../src/config.js';
import { OPENAI_CONNECTOR_RANGES } from '../src/data/openai-egress.js';

// The shipped nginx snippets, run in a real nginx when one is installed (skipped otherwise):
// they must load in the contexts their headers name, log without client addresses, and
// answer a JSON-RPC 503 while the app is down (a container being recreated).

const here = path.dirname (fileURLToPath (import.meta.url));
const deploy = path.join (here, '..', 'deploy', 'nginx');
const nginx = [ '/usr/sbin/nginx', '/usr/local/sbin/nginx', '/usr/bin/nginx' ].find ((candidate) => fs.existsSync (candidate));

async function freePort (): Promise<number> {
    return new Promise ((resolve) => {
        const server = http.createServer ();
        server.listen (0, '127.0.0.1', () => {
            const port = (server.address () as any).port;
            server.close (() => resolve (port));
        });
    });
}

function setup (upstreamPort: number, listenPort: number, serverLines: string[] = []): { prefix: string, conf: string, log: string } {
    const prefix = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-nginx-'));
    fs.chmodSync (prefix, 0o777);
    const log = path.join (prefix, 'ccxt-mcp.log');
    const rewrite = (text: string) => text.replaceAll ('127.0.0.1:8080', '127.0.0.1:' + upstreamPort).replaceAll ('/var/log/nginx/ccxt-mcp.log', log);
    fs.writeFileSync (path.join (prefix, 'http.conf'), rewrite (fs.readFileSync (path.join (deploy, 'ccxt-mcp-http.conf'), 'utf8')));
    fs.writeFileSync (path.join (prefix, 'locations.conf'), rewrite (fs.readFileSync (path.join (deploy, 'ccxt-mcp-locations.conf'), 'utf8')));
    const conf = path.join (prefix, 'nginx.conf');
    fs.writeFileSync (conf, [
        'worker_processes 1;',
        'pid ' + path.join (prefix, 'nginx.pid') + ';',
        'error_log ' + path.join (prefix, 'error.log') + ' warn;',
        'events { worker_connections 64; }',
        'http {',
        // the stock nginx.conf logs everything in the combined format (client address first);
        // the snippet's own access_log must win for the proxied paths
        '    access_log ' + path.join (prefix, 'access.log') + ' combined;',
        '    client_body_temp_path ' + path.join (prefix, 'body') + ';',
        '    proxy_temp_path ' + path.join (prefix, 'proxy') + ';',
        '    fastcgi_temp_path ' + path.join (prefix, 'fastcgi') + ';',
        '    uwsgi_temp_path ' + path.join (prefix, 'uwsgi') + ';',
        '    scgi_temp_path ' + path.join (prefix, 'scgi') + ';',
        '    include ' + path.join (prefix, 'http.conf') + ';',
        '    server {',
        '        listen 127.0.0.1:' + listenPort + ';',
        '        server_name docs.ccxt.com;',
        '        client_header_timeout 10s;',
        ...serverLines.map ((line) => '        ' + line),
        '        include ' + path.join (prefix, 'locations.conf') + ';',
        '    }',
        '}',
    ].join ('\n'));
    return { prefix, conf, log };
}

function post (port: number, body: string, headers: Record<string, string> = {}): Promise<{ status: number, headers: http.IncomingHttpHeaders, text: string }> {
    return new Promise ((resolve, reject) => {
        const request = http.request ({ 'host': '127.0.0.1', port, 'method': 'POST', 'path': '/mcp', 'headers': { 'content-type': 'application/json', 'host': 'docs.ccxt.com', ...headers } }, (response) => {
            const chunks: Buffer[] = [];
            response.on ('data', (chunk) => chunks.push (chunk));
            response.on ('end', () => resolve ({ 'status': response.statusCode ?? 0, 'headers': response.headers, 'text': Buffer.concat (chunks).toString () }));
        });
        request.on ('error', reject);
        request.end (body);
    });
}

test ('nginx: the snippets load in their contexts, log without client addresses, and answer 503 JSON while the app is down', { 'skip': (nginx === undefined) ? 'nginx is not installed' : false }, async () => {
    const upstreamPort = await freePort ();
    const listenPort = await freePort ();
    const { prefix, conf, log } = setup (upstreamPort, listenPort);
    const check = spawnSync (nginx as string, [ '-t', '-p', prefix, '-c', conf ], { 'encoding': 'utf8' });
    assert.equal (check.status, 0, check.stderr);
    // a stand-in for the app
    const app = http.createServer ((request, response) => {
        request.resume ();
        request.on ('end', () => {
            response.writeHead (200, { 'content-type': 'application/json' });
            response.end ('{"jsonrpc":"2.0","id":1,"result":{}}');
        });
    });
    await new Promise<void> ((resolve) => app.listen (upstreamPort, '127.0.0.1', resolve));
    let server: ChildProcess | undefined;
    try {
        server = spawn (nginx as string, [ '-p', prefix, '-c', conf, '-g', 'daemon off;' ], { 'stdio': 'ignore' });
        let up = false;
        for (let i = 0; i < 50 && !up; i++) {
            await new Promise ((resolve) => setTimeout (resolve, 100));
            up = await post (listenPort, '{}').then (() => true, () => false);
        }
        assert.ok (up, 'nginx did not start');
        const served = await post (listenPort, '{"jsonrpc":"2.0","id":1,"method":"ping"}');
        assert.equal (served.status, 200);
        // the app goes away (container recreate): a JSON-RPC 503 with Retry-After, not HTML
        await new Promise<void> ((resolve) => app.close (() => resolve ()));
        app.closeAllConnections ();
        const down = await post (listenPort, '{"jsonrpc":"2.0","id":2,"method":"ping"}');
        assert.equal (down.status, 503);
        assert.match (String (down.headers['content-type']), /application\/json/);
        assert.equal (down.headers['retry-after'], '5');
        assert.equal (JSON.parse (down.text).error.code, -32000);
        await new Promise ((resolve) => setTimeout (resolve, 200));
        const lines = fs.readFileSync (log, 'utf8').trim ().split ('\n');
        assert.ok (lines.length >= 2, lines.join ('\n'));
        for (const line of lines) {
            assert.doesNotMatch (line, /127\.0\.0\.1(?!:)/, 'a client address in ' + line);
            assert.match (line, /"POST \/mcp" (200|503) /);
        }
        const combined = path.join (prefix, 'access.log');
        assert.ok (!fs.existsSync (combined) || fs.readFileSync (combined, 'utf8').trim () === '', 'the combined log got MCP lines');
    } finally {
        server?.kill ('SIGTERM');
        app.close ();
    }
});

test ('nginx: the host egress exemption lists exactly the ranges the app budgets per host', () => {
    const conf = fs.readFileSync (path.join (deploy, 'ccxt-mcp-http.conf'), 'utf8');
    const block = conf.slice (conf.indexOf ('# BEGIN host egress ranges'), conf.indexOf ('# END host egress ranges'));
    const listed = [ ...block.matchAll (/^\s+([0-9.]+\/[0-9]+) 1;$/gm) ].map ((match) => match[1]);
    assert.deepEqual (listed, [ ...ANTHROPIC_EGRESS_RANGES, ...OPENAI_CONNECTOR_RANGES ], 'run scripts/refresh-egress-ranges.mjs');
    // both zones are keyed by the exempting map, not the raw address
    assert.match (conf, /limit_conn_zone \$ccxt_mcp_limit_key /);
    assert.match (conf, /limit_req_zone \$ccxt_mcp_limit_key /);
    assert.doesNotMatch (conf, /limit_(conn|req)_zone \$binary_remote_addr/);
});

test ('nginx: a host egress address (every Claude user) is not held to the per-address limit; an ordinary one is', { 'skip': (nginx === undefined) ? 'nginx is not installed' : false }, async () => {
    const upstreamPort = await freePort ();
    const listenPort = await freePort ();
    // the test stands in for the client address with a header nginx trusts from loopback
    const { prefix, conf } = setup (upstreamPort, listenPort, [ 'set_real_ip_from 127.0.0.1;', 'real_ip_header X-Test-Client;' ]);
    const check = spawnSync (nginx as string, [ '-t', '-p', prefix, '-c', conf ], { 'encoding': 'utf8' });
    assert.equal (check.status, 0, check.stderr);
    const app = http.createServer ((request, response) => {
        request.resume ();
        request.on ('end', () => {
            response.writeHead (200, { 'content-type': 'application/json' });
            response.end ('{"jsonrpc":"2.0","id":1,"result":{}}');
        });
    });
    await new Promise<void> ((resolve) => app.listen (upstreamPort, '127.0.0.1', resolve));
    let server: ChildProcess | undefined;
    try {
        server = spawn (nginx as string, [ '-p', prefix, '-c', conf, '-g', 'daemon off;' ], { 'stdio': 'ignore' });
        let up = false;
        for (let i = 0; i < 50 && !up; i++) {
            await new Promise ((resolve) => setTimeout (resolve, 100));
            up = await post (listenPort, '{}', { 'x-test-client': '192.0.2.1' }).then (() => true, () => false);
        }
        assert.ok (up, 'nginx did not start');
        // 120 polls in about a second (well over 20 r/s) from one address
        const burst = async (address: string): Promise<number[]> => {
            const statuses: number[] = [];
            for (let wave = 0; wave < 6; wave++) {
                const answers = await Promise.all (Array.from ({ 'length': 20 }, () => post (listenPort, '{"jsonrpc":"2.0","id":1,"method":"tools/call"}', { 'x-test-client': address })));
                statuses.push (...answers.map ((answer) => answer.status));
            }
            return statuses;
        };
        const anthropic = await burst ('160.79.104.17');
        assert.deepEqual ([ ...new Set (anthropic) ], [ 200 ], 'an Anthropic egress address passes');
        const openai = await burst (OPENAI_CONNECTOR_RANGES[0].split ('/')[0]);
        assert.deepEqual ([ ...new Set (openai) ], [ 200 ], 'an OpenAI egress address passes');
        const ordinary = await burst ('203.0.113.9');
        assert.ok (ordinary.filter ((status) => status === 429).length > 0, 'an ordinary address is still limited');
    } finally {
        server?.kill ('SIGTERM');
        app.close ();
    }
});
