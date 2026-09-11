// Emits the JAVA_PARAM_STRING_TYPES table literal for build/java-local-types.js
// from the two census passes (declarations + call sites).  Reproducible input:
//   node build/java-param-census.mjs --json   -> declaration groups
//   node build/java-param-sites.mjs --json    -> every this./super. call site classified
//
// usage: node build/java-param-table.mjs [--write]

import { execFileSync } from 'child_process';
import fs from 'fs';

const census = JSON.parse(execFileSync('node', ['build/java-param-census.mjs', 'ts/src', '--json'], { maxBuffer: 1 << 28 }).toString());
const sites = JSON.parse(execFileSync('node', ['build/java-param-sites.mjs', '--json'], { maxBuffer: 1 << 28 }).toString());

const clean = new Set(sites.map((r) => r.name + '[' + r.position + ']'));
const entries = census.safe
    .filter((r) => r.javaType === 'String' && clean.has(r.name + '[' + r.position + ']'))
    .sort((a, b) => (a.name < b.name ? -1 : 1));

const decls = entries.reduce((a, r) => a + r.count, 0);
const byMethod = new Map();
for (const r of entries) {
    if (!byMethod.has(r.name)) byMethod.set(r.name, []);
    byMethod.get(r.name).push(r);
}
const lines = [];
let positions = 0;
for (const [name, list] of byMethod) {
    const inner = list.map((r) => `${r.position}: 'String'`).join(', ');
    positions += list.length;
    lines.push(`    ${JSON.stringify(name)}: { ${inner} }, // ${list[0].count} decls`);
}
const block = `const JAVA_PARAM_STRING_TYPES = {\n${lines.join('\n')}\n};\n`;

if (process.argv.includes('--write')) {
    fs.writeFileSync('build/java-param-table.generated.js', block);
}
console.log(block);
console.error(`// ${positions} positions / ${decls} declarations in ${byMethod.size} methods`);
