// single-file C# probe (no full transpile): prints signature lines of candidate methods
import worker from '../../../build/csharp-worker.ts';
const files = process.argv.slice (2);
const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };
const out = await worker ({ transpilerConfig: cfg, files, roots: files } as any);
const re = /(orderRequestWs|signClobOrder|parseCurrencyCustom|parseCurrenciesCustom|eipMessageForOrder|createSignedRequest|signOrderRequest)\(/;
for (const r of out.result) {
    const text = typeof r === 'string' ? r : (r.content ?? JSON.stringify (r));
    for (const line of text.split ('\n')) {
        if (re.test (line)) console.log (line.trim ().slice (0, 220));
    }
    console.log ('getValue', (text.match (/getValue\(/g) ?? []).length);
}
process.exit (0);
