/**
 * SS-13 ground truth: run the REAL ts/src/base/functions/type.ts safeString family
 * on the fidelity case matrix and dump results as JSON.
 */
import { safeString, safeString2, safeStringN, safeStringLower, safeStringUpper, safeStringLower2, safeStringUpper2, safeStringLowerN, safeStringUpperN, safeValueN } from '../ts/src/base/functions/type.js';

type Case = { name: string; map: any; key?: any };

const weird = [
    { name: 'absent', map: { other: 1 }, key: 'k' },
    { name: 'null', map: { k: null }, key: 'k' },
    { name: 'empty-string', map: { k: '' }, key: 'k' },
    { name: 'string-abc', map: { k: 'abc' }, key: 'k' },
    { name: 'string-0', map: { k: '0' }, key: 'k' },
    { name: 'int-1', map: { k: 1 }, key: 'k' },
    { name: 'float-1.0', map: { k: 1.0 }, key: 'k' },
    { name: 'float-1.5', map: { k: 1.5 }, key: 'k' },
    { name: 'int-0', map: { k: 0 }, key: 'k' },
    { name: 'neg-1.5', map: { k: -1.5 }, key: 'k' },
    { name: 'big-1e21', map: { k: 1e21 }, key: 'k' },
    { name: 'float-0.1', map: { k: 0.1 }, key: 'k' },
    { name: 'bool-true', map: { k: true }, key: 'k' },
    { name: 'bool-false', map: { k: false }, key: 'k' },
    { name: 'empty-array', map: { k: [] }, key: 'k' },
    { name: 'array', map: { k: [1, 2] }, key: 'k' },
    { name: 'empty-dict', map: { k: {} }, key: 'k' },
    { name: 'dict', map: { k: { a: 1 } }, key: 'k' },
    { name: 'nan', map: { k: NaN }, key: 'k' },
    { name: 'inf', map: { k: Infinity }, key: 'k' },
    { name: 'undefined-value', map: { k: undefined }, key: 'k' },
    { name: 'null-key', map: null, key: null },
    { name: 'undefined-key', map: { k: 'v' }, key: undefined },
    { name: 'null-obj', map: null, key: 'k' },
    { name: 'undefined-obj', map: undefined, key: 'k' },
];

const defaults: (string | undefined)[] = [undefined, 'DEF', ''];

function show(x: any): string {
    if (x === undefined) return '<undefined>';
    if (typeof x === 'string') return 'S:' + x;
    return 'T:' + typeof x + ':' + String(x);
}

const out: any = { safeString: {}, safeStringLower: {}, safeStringUpper: {}, safeString2: {}, safeStringN: {} };

for (const c of weird) {
    for (const d of defaults) {
        const suffix = (d === undefined) ? '|no-default' : '|default=' + JSON.stringify(d);
        let k = c.key;
        try { out.safeString[c.name + suffix] = show(safeString(c.map, k, d as any)); } catch (e: any) { out.safeString[c.name + suffix] = 'THROW:' + e.message; }
        try { out.safeStringLower[c.name + suffix] = show(safeStringLower(c.map, k, d as any)); } catch (e: any) { out.safeStringLower[c.name + suffix] = 'THROW:' + e.message; }
        try { out.safeStringUpper[c.name + suffix] = show(safeStringUpper(c.map, k, d as any)); } catch (e: any) { out.safeStringUpper[c.name + suffix] = 'THROW:' + e.message; }
    }
}

// safeString2: k1 present / absent / null / '' / bool / array; k2 present / absent
const twoKeyCases = [
    { name: 'k1-hit', map: { k1: 'a', k2: 'b' } },
    { name: 'k1-absent-k2-hit', map: { k2: 'b' } },
    { name: 'k1-null-k2-hit', map: { k1: null, k2: 'b' } },
    { name: 'k1-empty-k2-hit', map: { k1: '', k2: 'b' } },
    { name: 'k1-bool-k2-hit', map: { k1: true, k2: 'b' } },
    { name: 'k1-array-k2-hit', map: { k1: [1], k2: 'b' } },
    { name: 'k1-0-k2-hit', map: { k1: 0, k2: 'b' } },
    { name: 'both-absent', map: { other: 1 } },
    { name: 'k1-num-k2-hit', map: { k1: 1.0, k2: 'b' } },
];
for (const c of twoKeyCases) {
    for (const d of defaults) {
        const suffix = (d === undefined) ? '|no-default' : '|default=' + JSON.stringify(d);
        try { out.safeString2[c.name + suffix] = show(safeString2(c.map, 'k1', 'k2', d as any)); } catch (e: any) { out.safeString2[c.name + suffix] = 'THROW:' + e.message; }
    }
}

// safeStringN: list of keys
const nCases = [
    { name: 'first-hit', map: { a: 'A', b: 'B' }, keys: ['a', 'b'] },
    { name: 'first-absent-second-hit', map: { b: 'B' }, keys: ['a', 'b'] },
    { name: 'first-empty-second-hit', map: { a: '', b: 'B' }, keys: ['a', 'b'] },
    { name: 'first-null-second-hit', map: { a: null, b: 'B' }, keys: ['a', 'b'] },
    { name: 'first-bool-second-hit', map: { a: true, b: 'B' }, keys: ['a', 'b'] },
    { name: 'none', map: { c: 1 }, keys: ['a', 'b'] },
    { name: 'num-first', map: { a: 1.0, b: 'B' }, keys: ['a', 'b'] },
    { name: 'null-keys-entry', map: { a: 1 }, keys: [null, 'a'] },
];
for (const c of nCases) {
    for (const d of defaults) {
        const suffix = (d === undefined) ? '|no-default' : '|default=' + JSON.stringify(d);
        try { out.safeStringN[c.name + suffix] = show(safeStringN(c.map, c.keys as any, d as any)); } catch (e: any) { out.safeStringN[c.name + suffix] = 'THROW:' + e.message; }
    }
}

// List-container cases (prop / prop2 / getValueFromKeysInArray on arrays)
const listCases: any = {};
{
    const list = ['', 'B', 'C'];
    const listNoEmpty = ['A', ''];
    listCases['list-first-empty|safeString[0]'] = show(safeString(list, 0));
    listCases['list-first-empty|safeString[0]|default'] = show(safeString(list, 0, 'DEF'));
    listCases['list-first-empty|safeString2(0,1)'] = show(safeString2(list, 0, 1));
    listCases['list-first-empty|safeString2(0,1)|default'] = show(safeString2(list, 0, 1, 'DEF'));
    listCases['list-first-empty|safeStringN[0,1,2]'] = show(safeStringN(list, [0, 1, 2]));
    listCases['list-first-empty|safeStringN[0,1,2]|default'] = show(safeStringN(list, [0, 1, 2], 'DEF'));
    listCases['list-first-empty|safeValueN[0,1,2]'] = show(safeValueN(list, [0, 1, 2]));
    listCases['list-empty-second|safeStringN[0,1]'] = show(safeStringN(listNoEmpty, [0, 1]));
    listCases['list-empty-second|safeValueN[0,1]'] = show(safeValueN(listNoEmpty, [0, 1]));
    listCases['list-hi-2|safeStringN[3,2,0]'] = show(safeStringN(['Hi', 2], [3, 2, 0]));
    listCases['list-hi-2|safeString2(2,0)'] = show(safeString2(['Hi', 2], 2, 0));
    listCases['list-out-of-bounds|safeString[5]'] = show(safeString(['Hi', 2], 5));
    listCases['list-out-of-bounds|safeString[5]|default'] = show(safeString(['Hi', 2], 5, 'DEF'));
}
out.listCases = listCases;

console.log(JSON.stringify(out, null, 1));
