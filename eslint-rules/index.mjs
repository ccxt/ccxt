// ccxt-safe: local ESLint plugin. Every eslint-rules/<rule-name>.mjs file (default export = ESLint rule object)
// is loaded as rule `ccxt-safe/<rule-name>`; adding a rule needs no edit here or in eslint.config.mjs.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname (fileURLToPath (import.meta.url));
const ruleFiles = readdirSync (here).filter ((f) => f.endsWith ('.mjs') && f !== 'index.mjs' && !f.startsWith ('_')).sort ();
const rules = {};
for (const file of ruleFiles) {
    const mod = await import (pathToFileURL (join (here, file)).href);
    rules[file.slice (0, -'.mjs'.length)] = mod.default;
}

const plugin = {
    'meta': { 'name': 'ccxt-safe' },
    'rules': rules,
};

export default plugin;
