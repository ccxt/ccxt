import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
import fs from 'fs'

// sign (+ its crypto helpers) is async only in JS (crypto.subtle); in C# it is
// synchronous. Strip the async/await keywords for these methods before transpiling.
// Kept in sync with stripSignAsyncForAst in build/transpile.ts.
function stripSignAsyncForAst (tsContent) {
    return tsContent
        .replace (/\basync function (rsa|jwt) (\([^)]*\)): Promise<([^>]+)>/g, 'function $1 $2: $3')
        .replace (/\basync (sign|createAuthToken|createWSAuth|signParams) \(/g, '$1 (')
        .replace (/\bawait (this\.(?:sign|createAuthToken|createWSAuth|signParams)\s*\()/g, '$1')
        .replace (/\bawait ((?:this\.)?(?:rsa|jwt)\s*\()/g, '$1');
}

export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][csharp] Transpiling', filePath);
        const tmpPath = filePath.replace(/\.ts$/, '.__signsync__.ts');
        fs.writeFileSync(tmpPath, stripSignAsyncForAst(fs.readFileSync(filePath, 'utf8')));
        try {
            const transpiled = transpiler.transpileCSharpByPath(tmpPath);
            result.push(transpiled);
        } finally {
            try { fs.unlinkSync(tmpPath); } catch (e) { /* ignore */ }
        }
    }
    return result;
}
