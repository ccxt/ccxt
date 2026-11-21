// Regenerate eslint-rules/baseline/<rule-name>.json: map of ts/src file -> number of findings today.
// Usage (repo root): node -r ./build/use-typescript6.cjs eslint-rules/baseline/update.mjs <rule-name>
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.CCXT_SAFE_NO_BASELINE = '1';
const here = dirname (fileURLToPath (import.meta.url));
const repoRoot = dirname (dirname (here));
const ruleName = process.argv[2];
if (!ruleName) {
    console.error ('usage: update.mjs <rule-name>');
    process.exit (2);
}
const { ESLint } = await import ('eslint');
const { default: tsParser } = await import ('@typescript-eslint/parser');
const { default: plugin } = await import ('../index.mjs');
const { CCXT_SAFE_FILES } = await import ('../_scope.mjs');
if (!(ruleName in plugin.rules)) {
    console.error ('unknown rule ' + ruleName + '; known: ' + Object.keys (plugin.rules).join (', '));
    process.exit (2);
}
const eslint = new ESLint ({
    'cwd': repoRoot,
    'overrideConfigFile': true,
    'overrideConfig': [ {
        'files': CCXT_SAFE_FILES,
        'languageOptions': { 'parser': tsParser, 'ecmaVersion': 2020, 'sourceType': 'module' },
        'plugins': { 'ccxt-safe': plugin },
        'rules': { [ 'ccxt-safe/' + ruleName ]: 'error' },
    } ],
});
const results = await eslint.lintFiles (CCXT_SAFE_FILES);
const counts = {};
let total = 0;
for (const r of results) {
    const n = r.messages.filter ((m) => m.ruleId === 'ccxt-safe/' + ruleName).length;
    if (n > 0) {
        counts[r.filePath.slice (repoRoot.length + 1).split ('\\').join ('/')] = n;
        total += n;
    }
}
const sorted = Object.fromEntries (Object.keys (counts).sort ().map ((k) => [ k, counts[k] ]));
writeFileSync (join (here, ruleName + '.json'), JSON.stringify (sorted, null, 4) + '\n');
console.log (ruleName + ': ' + total + ' findings in ' + Object.keys (sorted).length + ' files');
