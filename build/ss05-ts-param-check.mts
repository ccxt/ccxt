// SS-05 TS-side parameter check.
//
// For every (method name, fixed-param index) pair that the Java call-site census
// (build/ss05-param-census.py) marked retypable, verify that EVERY TypeScript declaration
// of that method (base exchange, every venue, pro, prediction) declares the corresponding
// parameter as `string` / `Str`.  The Java parameter list keeps exactly the TS parameters
// without an initializer, in order, so the idx-th fixed TS parameter maps to Java idx.
//
// Usage: npx tsx build/ss05-ts-param-check.mts [candidates.json] [--json out.json]
import * as ts from 'typescript6'
import fs from 'fs'
import path from 'path'

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/\/build$/, '')
const CAND_FILE = process.argv[2] && !process.argv[2].startsWith('--')
    ? process.argv[2]
    : '/tmp/ss05-candidates.json'
const candidates: Record<string, number[]> = JSON.parse(fs.readFileSync(CAND_FILE, 'utf8'))

function tsFiles(): string[] {
    const out: string[] = []
    const add = (dir: string) => {
        for (const f of fs.readdirSync(dir)) {
            const p = path.join(dir, f)
            if (fs.statSync(p).isDirectory()) { add(p); continue }
            if (f.endsWith('.ts') && !f.endsWith('.d.ts')) out.push(p)
        }
    }
    add(path.join(ROOT, 'ts/src'))
    return out
}

type Decl = { file: string, line: number, params: { name: string, type: string, fixed: boolean }[] }
const decls = new Map<string, Decl[]>()

for (const file of tsFiles()) {
    const src = fs.readFileSync(file, 'utf8')
    const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true)
    const visit = (node: ts.Node) => {
        if ((ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) && ts.isIdentifier(node.name)) {
            const name = node.name.escapedText as string
            if (name in candidates) {
                const params = node.parameters.map((p: any) => ({
                    name: p.name.getText(sf),
                    type: p.type ? p.type.getText(sf) : '',
                    fixed: !p.initializer && !p.questionToken,
                }))
                const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1
                if (!decls.has(name)) decls.set(name, [])
                decls.get(name)!.push({ file: path.relative(ROOT, file), line, params })
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
}

const ok = (t: string) => t === 'string' || t === 'Str'
const report: any = { ok: [], bad: [], missing: [] }
for (const [name, idxs] of Object.entries(candidates)) {
    const ds = decls.get(name)
    if (!ds || ds.length === 0) {
        report.missing.push({ name, idxs })
        continue
    }
    const issues: string[] = []
    for (const d of ds) {
        const fixed = d.params.filter(p => p.fixed)
        for (const idx of idxs) {
            const p = fixed[idx]
            if (!p) { issues.push(`${d.file}:${d.line} no fixed param #${idx} (${d.params.length} params)`); continue }
            if (!ok(p.type)) issues.push(`${d.file}:${d.line} #${idx} ${p.name}: ${p.type || '<none>'}`)
        }
    }
    if (issues.length) report.bad.push({ name, idxs, issues: issues.slice(0, 8), nDecls: ds.length, nIssues: issues.length })
    else report.ok.push({ name, idxs, nDecls: ds.length })
}

console.log('names checked:', Object.keys(candidates).length)
console.log('ok:', report.ok.length, '| bad:', report.bad.length, '| missing(no TS decl):', report.missing.length)
console.log()
for (const b of report.bad) {
    console.log('BAD', b.name, JSON.stringify(b.idxs), 'decls=' + b.nDecls, 'issues=' + b.nIssues)
    for (const i of b.issues) console.log('    ', i)
}
for (const m of report.missing) console.log('MISSING (no TS decl):', m.name, JSON.stringify(m.idxs))

const jsonOut = process.argv.indexOf('--json') !== -1 ? process.argv[process.argv.indexOf('--json') + 1] : null
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(report, null, 1))
