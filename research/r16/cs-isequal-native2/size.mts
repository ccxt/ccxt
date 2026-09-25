// census of isEqual(a, b) in generated C#: second-arg shape x receiver declared type (emitted text)
import * as P from '/root/.hermes/profiles/deepseek/cache/scratch/iseq2/pass.ts'
import fs from 'fs'
const all = ['cs/ccxt/base/Exchange.BaseMethods.cs', 'cs/ccxt/base/PredictionExchange.cs']
for (const dir of ['cs/ccxt/exchanges', 'cs/ccxt/exchanges/pro', 'cs/ccxt/exchanges/prediction']) for (const f of fs.readdirSync(dir)) if (f.endsWith('.cs')) all.push(dir + '/' + f)
const counts = {}; const byMethod = {}; let total = 0
const bump = (o, k) => { o[k] = (o[k] ?? 0) + 1 }
for (const p of all) {
  const lines = fs.readFileSync(p, 'utf8').split('\n'); const masked = lines.map(P.csharpHelperMaskLine)
  let region = null, method = ''
  for (let i = 0; i < lines.length; i++) {
    const sig = P.CSHARP_HELPER_SIGNATURE_RE.exec(masked[i])
    if (sig && !masked[i].trimEnd().endsWith(';')) {
      method = sig[1]; region = { start: i, params: P.csharpHelperSignatureParams(masked, i), declarations: [], lines: masked }
      for (let k = i; k < lines.length; k++) { if (k > i && P.CSHARP_HELPER_SIGNATURE_RE.test(masked[k]) && !masked[k].trimEnd().endsWith(';')) break; const d = P.csharpHelperDeclarationOfLine(masked[k]); if (d) region.declarations.push({ line: k, ...d }) }
    }
    const re = /(?<![A-Za-z0-9_.])isEqual\(/g; let m
    while ((m = re.exec(masked[i])) !== null) {
      total++
      const open = m.index + m[0].length - 1; const close = P.csharpHelperCallEnd(masked[i], open); if (close === undefined) { bump(counts, 'unparsed'); continue }
      const comma = P.csharpHelperTopLevelComma(masked[i], open, close); if (comma === undefined) { bump(counts, 'unparsed'); continue }
      const a = masked[i].substring(open + 1, comma).trim(); const bo = lines[i].substring(comma + 1, close).trim(); const b = masked[i].substring(comma + 1, close).trim()
      let shape = /^"/.test(b) ? (/^"-?\d+(\.\d+)?"$/.test(bo) || /^"\s*$|^"[\d.eE+\-\s]+"$/.test(bo) || !isNaN(Number(JSON.parse(bo))) ? 'strnum' : 'str') : b === 'null' ? 'null' : /^(true|false)$/.test(b) ? 'bool' : /^-?[\d.]+$/.test(b) ? 'num' : 'other'
      let recv = 'expr'
      if (/^[A-Za-z_]\w*$/.test(a) && region) { const r = P.csharpHelperReceiverType(region, a, i, region.params); recv = r ? `${r.kind}:${r.type}` : 'unknown' }
      bump(counts, `${shape} | ${recv}`)
      if (shape === 'str' && recv.startsWith('param:object')) bump(byMethod, `${method}.${a}`)
    }
  }
}
console.log('total isEqual(', total)
for (const [k, v] of Object.entries(counts).sort((x, y) => y[1] - x[1])) console.log(String(v).padStart(5), k)
if (process.argv[2] === '-m') for (const [k, v] of Object.entries(byMethod).sort((x, y) => y[1] - x[1]).slice(0, 40)) console.log(String(v).padStart(5), k)
