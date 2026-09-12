// SS-10 diff measurement over the generated Java tree between the branch base and the
// current worktree state. Reports:
//   - declaration retypes `Object x = ...` -> `String x = ...` (object_to_string)
//   - of those, the ones whose value is a source conditional (`... ? ... : ...`)
//   - net ternary delta (added minus removed lines containing ' ? ') — must be 0
//   - removed `(String)` casts (count of `(String)` occurrences removed minus added)
// usage: node build/ss10-measure.mjs [base]
import { execSync } from 'node:child_process';

const BASE = process.argv[2] || '3ca818ac31ec8f651121c452aed930d725f2b020';
const diff = execSync(`git diff ${BASE} -- java`, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 512 });

const removed = [];
const added = [];
for (const line of diff.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) continue;
    if (line.startsWith('+')) added.push(line.slice(1));
    else if (line.startsWith('-')) removed.push(line.slice(1));
}

const declRe = /^\s*(?:final\s+)?(Object|String)\s+(\w+)\s*=\s*(.*)$/;
const removedDecls = new Map();
for (const l of removed) {
    const m = declRe.exec(l);
    if (m) removedDecls.set(m[2] + '|' + m[3], { type: m[1], name: m[2], value: m[3] });
}
let objectToString = 0;
let ternaryRetypes = 0;
let accumulatorRetypes = 0;
const retypedNames = [];
for (const l of added) {
    const m = declRe.exec(l);
    if (!m || m[1] !== 'String') continue;
    const key = m[2] + '|' + m[3];
    const prev = removedDecls.get(key);
    if (prev && prev.type === 'Object') {
        objectToString += 1;
        retypedNames.push(m[2]);
        if (l.includes(' ? ')) ternaryRetypes += 1;
        else accumulatorRetypes += 1;
    }
}

const countTernary = (list) => list.filter((l) => l.includes(' ? ')).length;
const addedTernary = countTernary(added);
const removedTernary = countTernary(removed);
const countCasts = (list) => list.reduce((n, l) => n + (l.split('(String)').length - 1), 0);
const castsAdded = countCasts(added);
const castsRemoved = countCasts(removed);

console.log(JSON.stringify({
    object_to_string: objectToString,
    ternary_declaration_retypes: ternaryRetypes,
    accumulator_retypes: accumulatorRetypes,
    added_lines_with_ternary: addedTernary,
    removed_lines_with_ternary: removedTernary,
    net_ternary_lines: addedTernary - removedTernary,
    casts_added: castsAdded,
    casts_removed: castsRemoved,
    sample: retypedNames.slice(0, 40),
}, null, 1));
