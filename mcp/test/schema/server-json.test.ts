import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// The MCP registry rejects a publish outright when server.json breaches the ServerDetail
// schema, and the failure only ever surfaces at `mcp-publisher publish` time — long after
// the offending string is on master. A 170-char description shipped that way once and its
// fix regressed a commit later, so the caps are asserted here instead.
// Values are from https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json
const MAX_LENGTHS: Record<string, number> = {
    'name': 200,
    'title': 100,
    'description': 100,
    'version': 255,
};
const NAME_PATTERN = /^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/;
const REQUIRED = [ 'name', 'description', 'version' ];

const mcpRoot = path.resolve (path.dirname (fileURLToPath (import.meta.url)), '..', '..');
const serverJson = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'server.json'), 'utf8'));

test ('server.json carries every field the registry requires', () => {
    for (const field of REQUIRED) {
        assert.ok (serverJson[field], `server.json is missing the required field ${field}`);
    }
});

test ('server.json string fields are within the registry length caps', () => {
    for (const [ field, max ] of Object.entries (MAX_LENGTHS)) {
        const value = serverJson[field];
        if (value === undefined) {
            continue;
        }
        // the registry may count bytes rather than runes, so budget for the wider of the two
        const chars = value.length;
        const bytes = Buffer.byteLength (value, 'utf8');
        assert.ok (chars <= max, `server.json ${field} is ${chars} chars, over the ${max} cap`);
        assert.ok (bytes <= max, `server.json ${field} is ${bytes} bytes, over the ${max} cap`);
    }
});

test ('server.json name matches the registry namespace pattern', () => {
    assert.match (serverJson['name'], NAME_PATTERN);
});

test ('server.json version matches package.json', () => {
    const pkg = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8'));
    assert.equal (serverJson['version'], pkg['version']);
    for (const entry of serverJson['packages'] ?? []) {
        assert.equal (entry['version'], pkg['version']);
    }
});

test ('server.json mcpName matches the package that proves ownership', () => {
    const pkg = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8'));
    assert.equal (serverJson['name'], pkg['mcpName']);
});
