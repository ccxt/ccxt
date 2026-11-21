// Shared ratchet helper for ccxt-safe rules (files starting with "_" are not rules).
// A rule collects its findings per file; at Program:exit they are reported only when the file has MORE
// findings than eslint-rules/baseline/<rule-name>.json allows, so today's source passes and new unsafe code fails.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname (fileURLToPath (import.meta.url));
export const repoRoot = dirname (here);
const cache = {};

export function loadBaseline (ruleName) {
    if (!(ruleName in cache)) {
        const file = join (here, 'baseline', ruleName + '.json');
        cache[ruleName] = existsSync (file) ? JSON.parse (readFileSync (file, 'utf8')) : {};
    }
    return cache[ruleName];
}

export function repoPath (filename) {
    return relative (repoRoot, filename).split (sep).join ('/');
}

// Set CCXT_SAFE_NO_BASELINE=1 to report every finding (used by baseline/update.mjs).
export function makeRatchet (ruleName, context) {
    const findings = [];
    return {
        add (node, messageId, data) {
            findings.push ({ node, messageId, data });
        },
        flush () {
            const ignoreBaseline = process.env.CCXT_SAFE_NO_BASELINE === '1';
            const allowed = ignoreBaseline ? 0 : (loadBaseline (ruleName)[repoPath (context.filename)] || 0);
            if (findings.length <= allowed) {
                return;
            }
            for (const f of findings) {
                context.report ({ 'node': f.node, 'messageId': f.messageId, 'data': f.data });
            }
        },
    };
}
