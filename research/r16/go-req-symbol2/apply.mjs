// merges names.txt into GO_UNIFIED_STRING_PARAMS and retypes exchange_interface.go lines to match
import fs from 'fs';
const WT = process.argv[2];
const add = fs.readFileSync(new URL('./names.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean).map(t => t.split(':'));
const f = WT + '/build/goTranspiler.ts'; let src = fs.readFileSync(f, 'utf8');
const a = src.indexOf('const GO_UNIFIED_STRING_PARAMS'); const o = src.indexOf('{', src.indexOf('=', a)); const b = src.indexOf('};', a);
const table = new Function('return ' + src.substring(o, b + 1))();
for (const [n, i] of add) { const s = new Set(table[n] ?? []); s.add(Number(i)); table[n] = [...s].sort((x, y) => x - y); }
const entries = Object.keys(table).map(k => `'${k}': [ ${table[k].join(', ')} ]`);
const lines = []; let cur = '   ';
for (const e of entries) { if ((cur + ' ' + e + ',').length > 124) { lines.push(cur); cur = '   '; } cur += ' ' + e + ','; }
lines.push(cur);
src = src.substring(0, o) + '{\n' + lines.join('\n') + '\n' + src.substring(b);
fs.writeFileSync(f, src);
const g = WT + '/go/v4/exchange_interface.go'; let it = fs.readFileSync(g, 'utf8'); let n = 0;
it = it.replace(/^(\t)(\w+)Async\(([^)]*)\)/gm, (m, tab, name, params) => {
    const key = name[0].toLowerCase() + name.slice(1); const idx = table[key]; if (!idx) return m;
    const ps = params.split(', ');
    for (const i of idx) { if (ps[i] && / any$/.test(ps[i])) { ps[i] = ps[i].replace(/ any$/, ' string'); n++; } }
    return `${tab}${name}Async(${ps.join(', ')})`;
});
fs.writeFileSync(g, it); console.log('interface params retyped', n);
