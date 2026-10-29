// offline replay of the hx10 C06 pass over the checked-in cs tree (no transpile)
import fs from 'fs'
import path from 'path'
import { c06_apply, hx10C06SnippetChecks } from '../build/hx10w2-C06.js'

const problems = hx10C06SnippetChecks ()
console.log ('snippet checks:', problems.length === 0 ? 'PASS' : problems.join ('\n  '))

const root = process.argv[2] ?? 'cs/ccxt'
const files: string[] = []
function walk (dir: string) {
    for (const entry of fs.readdirSync (dir, { withFileTypes: true })) {
        const p = path.join (dir, entry.name)
        if (entry.isDirectory ()) walk (p)
        else if (entry.name.endsWith ('.cs')) files.push (p)
    }
}
walk (root)
let changed = 0
for (const f of files) {
    const src = fs.readFileSync (f, 'utf8')
    const out = c06_apply (true, src)
    if (out === src) continue
    changed += 1
    const a = src.split ('\n')
    const b = out.split ('\n')
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) console.log (`${f}:${i + 1}\n  - ${a[i].trim ()}\n  + ${b[i].trim ()}`)
    }
    if (a.length !== b.length) console.log (`${f}: LINE COUNT CHANGED ${a.length} -> ${b.length}`)
    const again = c06_apply (true, out)
    if (again !== out) console.log (`${f}: NOT IDEMPOTENT`)
}
console.log (`files changed: ${changed} of ${files.length}`)
