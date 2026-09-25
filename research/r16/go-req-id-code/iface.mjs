// retypes exchange_interface.go params listed in the merged GO_UNIFIED_STRING_PARAMS table
import fs from 'fs';
const WT = process.argv[2]; const src = fs.readFileSync(WT + '/build/goTranspiler.ts', 'utf8');
const grab = (n) => { const a = src.indexOf('const ' + n); return new Function('return ' + src.substring(src.indexOf('{', src.indexOf('=', a)), src.indexOf('};', a) + 1))(); };
const t = grab('GO_UNIFIED_STRING_PARAMS'); for (const [k, v] of Object.entries(grab('GO_UNIFIED_REQUIRED_ID_PARAMS'))) t[k] = [...new Set([...(t[k] ?? []), ...v])];
const g = WT + '/go/v4/exchange_interface.go'; let it = fs.readFileSync(g, 'utf8'); let n = 0;
it = it.replace(/^(\t)(\w+)Async\(([^)]*)\)/gm, (m, tab, name, params) => {
    const idx = t[name[0].toLowerCase() + name.slice(1)]; if (!idx) return m; const ps = params.split(', ');
    for (const i of idx) if (ps[i] && / any$/.test(ps[i])) { ps[i] = ps[i].replace(/ any$/, ' string'); n++; }
    return `${tab}${name}Async(${ps.join(', ')})`; });
fs.writeFileSync(g, it); console.log('retyped', n);
