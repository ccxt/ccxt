// pass.ts = build/csharpTranspiler.ts from the "native getArrayLength" banner to nativeDeclaredWsCalls
// re-run the declared-helper pass over the committed C# output (no transpile)
import { nativeDeclaredHelperCalls } from '/root/.hermes/profiles/deepseek/cache/scratch/iseq2/pass.ts'
import fs from 'fs'
let files = 0
const all = ['cs/ccxt/base/Exchange.BaseMethods.cs', 'cs/ccxt/base/PredictionExchange.cs']
for (const dir of ['cs/ccxt/exchanges', 'cs/ccxt/exchanges/pro', 'cs/ccxt/exchanges/prediction']) for (const f of fs.readdirSync(dir)) if (f.endsWith('.cs')) all.push(dir + '/' + f)
for (const p of all) { const c = fs.readFileSync(p, 'utf8'); const n = nativeDeclaredHelperCalls(c); if (n !== c) { fs.writeFileSync(p, n); files++ } }
console.log('files changed', files)
