// One-off audit: compare DERIVATIVES family types in ts/src/base/types.ts (IR) against
// the generated Java classes on disk.
import fs from 'fs';
import path from 'path';
import { extractTypesIR } from '../build/typesIR.js';

const FAMILIES = [
    'Position', 'FundingRate', 'FundingRates', 'FundingHistory', 'FundingRateHistory',
    'OpenInterest', 'OpenInterests', 'Liquidation', 'Greeks', 'AllGreeks',
    'MarginMode', 'MarginModes', 'MarketMarginModes', 'Leverage', 'Leverages',
    'LeverageTier', 'LeverageTiers', 'BorrowInterest', 'CrossBorrowRate', 'CrossBorrowRates',
    'IsolatedBorrowRate', 'IsolatedBorrowRates', 'ADL', 'Conversion', 'TransferEntry',
    'MarginModification', 'MarginLoan', 'LongShortRatio', 'Option', 'OptionChain',
    'LastPrice', 'LastPrices',
];

const ir = extractTypesIR (path.join (process.cwd (), 'ts', 'src', 'base', 'types.ts'));
const TYPES_DIR = path.join ('java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt', 'types');

function javaFields (className: string): { name: string, type: string }[] {
    const file = path.join (TYPES_DIR, className + '.java');
    if (!fs.existsSync (file)) {
        return [];
    }
    const out: { name: string, type: string }[] = [];
    const lines = fs.readFileSync (file, 'utf8').split ('\n');
    for (const line of lines) {
        const m = line.match (/^ {4}public (.+);\s*(?:\/\/.*)?$/);
        if (m === null) continue;
        const decl = m[1];
        const at = decl.lastIndexOf (' ');
        out.push ({ 'name': decl.slice (at + 1), 'type': decl.slice (0, at) });
    }
    return out;
}

for (const name of FAMILIES) {
    const ts = ir.byName[name];
    console.log ('\n=================== ' + name + ' ===================');
    if (ts === undefined) {
        console.log ('  !! NO TS DECLARATION');
        continue;
    }
    console.log ('  TS kind=' + ts.kind + (ts.valueType !== undefined ? ' valueType=' + ts.valueType : '') + (ts.aliasOf !== undefined ? ' aliasOf=' + ts.aliasOf : '') + ' line=' + ts.line);
    const jf = javaFields (name);
    const jmap: Record<string, string> = {};
    for (const f of jf) jmap[f.name] = f.type;
    if (ts.kind === 'dictionary') {
        console.log ('  java fields: ' + JSON.stringify (jf));
        continue;
    }
    const seen: Record<string, boolean> = {};
    for (const field of ts.fields) {
        const key = field.name.replace (/^['"]|['"]$/g, '');
        seen[key] = true;
        let slot: string;
        if (jmap[key] !== undefined) {
            slot = 'java=' + jmap[key];
        } else {
            slot = (field.kind === 'inline' || field.kind === 'object' || field.kind === 'dict') ? 'MISSING-by-design?' : 'MISSING';
        }
        const nullish = /undefined|null/.test (field.tsType) || field.optional;
        console.log ('  [' + (field.kind) + '] ' + key + ': ' + JSON.stringify (field.tsType) + (field.optional ? ' (optional)' : '') + ' nullcap=' + nullish + '  ->  ' + slot);
    }
    for (const f of jf) {
        if (seen[f.name] === undefined && f.name !== 'info') {
            console.log ('  EXTRA-JAVA: ' + f.name + ' : ' + f.type);
        }
    }
}

// ---- summary census over the families ----
const PRIMITIVE = /^(double|long|boolean|int|float|short|byte|char)$/;
let classes = 0;
let fields = 0;
let primitives = 0;
let objectFields = 0;
let mapObjectNonInfo = 0;
let optionalNullcap = 0;
let containers = 0;
for (const name of FAMILIES) {
    const ts = ir.byName[name];
    const jf = javaFields (name);
    if (jf.length === 0 && ts === undefined) continue;
    classes += 1;
    if (ts !== undefined && ts.kind === 'dictionary') {
        containers += 1;
    }
    for (const f of jf) {
        fields += 1;
        if (PRIMITIVE.test (f.type)) primitives += 1;
        if (f.type === 'Object') objectFields += 1;
        if (f.type === 'Map<String, Object>' && f.name !== 'info') mapObjectNonInfo += 1;
    }
    if (ts !== undefined) {
        for (const field of ts.fields) {
            if (field.optional || /undefined|null/.test (field.tsType)) optionalNullcap += 1;
        }
    }
}
console.log ('\n\n=================== SUMMARY ===================');
console.log ('classes: ' + classes + ' (dictionary containers: ' + containers + ')');
console.log ('java field declarations: ' + fields);
console.log ('  primitive (non-nullable) field declarations: ' + primitives);
console.log ('  `Object`-typed field declarations (excl. info): ' + objectFields);
console.log ('  `Map<String,Object>` field declarations other than `info`: ' + mapObjectNonInfo);
console.log ('TS fields declared optional/nullable across these families: ' + optionalNullcap);
