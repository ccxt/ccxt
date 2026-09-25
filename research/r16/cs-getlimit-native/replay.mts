import { nativeWsCacheCalls } from '/root/.hermes/profiles/deepseek/cache/scratch/wsc.ts'
import fs from 'fs'
let files=0
for (const dir of ['cs/ccxt/exchanges/pro','cs/ccxt/exchanges/prediction']) for (const f of fs.readdirSync(dir)) { const p=dir+'/'+f; const c=fs.readFileSync(p,'utf8'); const n=nativeWsCacheCalls(c); if(n!==c){fs.writeFileSync(p,n);files++} }
console.log('files changed', files)
