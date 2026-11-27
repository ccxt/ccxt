#!/usr/bin/env node
// Regenerates src/data/openai-egress.ts from OpenAI's published ChatGPT connector ranges.
// Run it by hand (it needs the network), review the diff, commit. The server never fetches
// the list at run time: a remote list that changes under a running server would change who
// gets the higher rate-limit budget without anyone reviewing it.
//
//   node scripts/refresh-egress-ranges.mjs              # fetch from the source URL
//   node scripts/refresh-egress-ranges.mjs file.json    # regenerate from a saved copy
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = 'https://openai.com/chatgpt-connectors.json';
const here = path.dirname (fileURLToPath (import.meta.url));
const target = path.join (here, '..', 'src', 'data', 'openai-egress.ts');

const input = process.argv[2];
const text = (input !== undefined) ? fs.readFileSync (input, 'utf8') : await (await fetch (SOURCE)).text ();
const json = JSON.parse (text);
const prefixes = (json.prefixes ?? []).map ((entry) => entry.ipv4Prefix ?? entry.ipv6Prefix);
for (const prefix of prefixes) {
    // the server's matcher handles IPv4 CIDRs; refuse anything else rather than mis-parse it
    if (typeof prefix !== 'string' || !/^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/.test (prefix)) {
        throw new Error ('unexpected prefix in ' + SOURCE + ': ' + JSON.stringify (prefix));
    }
}
const today = new Date ().toISOString ().slice (0, 10);
const lines = [
    '// Snapshot of OpenAI\'s published ChatGPT connector egress ranges, the addresses ChatGPT',
    '// (and its connectors / apps) call remote MCP servers from. Used only to give those',
    '// addresses a higher per-client budget (every ChatGPT user arrives from them) — never to',
    '// grant anything. REFRESH: run scripts/refresh-egress-ranges.mjs and review the diff (a',
    '// range OpenAI dropped must leave this list too). Generated file — do not edit by hand.',
    '// Source: ' + SOURCE,
    '// Fetched: ' + today + ' (creationTime ' + json.creationTime + ', ' + prefixes.length + ' IPv4 prefixes)',
    'export const OPENAI_CONNECTOR_RANGES_SOURCE = \'' + SOURCE + '\';',
    'export const OPENAI_CONNECTOR_RANGES_FETCHED = \'' + today + '\';',
    'export const OPENAI_CONNECTOR_RANGES_CREATED = \'' + String (json.creationTime) + '\';',
    'export const OPENAI_CONNECTOR_RANGES: readonly string[] = [',
];
for (let i = 0; i < prefixes.length; i += 6) {
    lines.push ('    ' + prefixes.slice (i, i + 6).map ((prefix) => '\'' + prefix + '\'').join (', ') + ',');
}
lines.push ('];', '');
fs.writeFileSync (target, lines.join ('\n'));
console.log ('wrote ' + prefixes.length + ' prefixes to ' + path.relative (process.cwd (), target));

// the same ranges (plus Anthropic's, from src/config.ts) exempt host egress addresses from
// nginx's per-address limits: deploy/nginx/ccxt-mcp-http.conf, between its BEGIN/END markers
const nginxConf = path.join (here, '..', 'deploy', 'nginx', 'ccxt-mcp-http.conf');
const configText = fs.readFileSync (path.join (here, '..', 'src', 'config.ts'), 'utf8');
const anthropic = /ANTHROPIC_EGRESS_RANGES = \[([^\]]*)\]/.exec (configText);
if (anthropic === null) {
    throw new Error ('ANTHROPIC_EGRESS_RANGES not found in src/config.ts');
}
const anthropicRanges = [ ...anthropic[1].matchAll (/'([^']+)'/g) ].map ((match) => match[1]);
const conf = fs.readFileSync (nginxConf, 'utf8');
const begin = conf.indexOf ('# BEGIN host egress ranges');
const endMarker = '# END host egress ranges';
const end = conf.indexOf (endMarker);
if (begin === -1 || end === -1 || end < begin) {
    throw new Error ('the host egress markers are missing from ' + nginxConf);
}
const header = conf.slice (begin, conf.indexOf ('\n    ', begin) + 1);
const entries = [ ...anthropicRanges, ...prefixes ].map ((prefix) => '    ' + prefix + ' 1;').join ('\n');
fs.writeFileSync (nginxConf, conf.slice (0, begin) + header + entries + '\n' + conf.slice (end));
console.log ('wrote ' + (anthropicRanges.length + prefixes.length) + ' ranges to ' + path.relative (process.cwd (), nginxConf));
