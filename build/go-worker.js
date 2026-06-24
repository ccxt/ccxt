import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
import fs from 'fs'
import { stripSignAsyncForAst } from './stripOverloads.js';

export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][go] Transpiling', filePath);
        // sign (+ crypto helpers) is async only in JS; transpile a sign-synchronous copy
        // (byPath mode preserves output shape).
        const tmpPath = filePath.replace(/\.ts$/, '.__signsync__.ts');
        fs.writeFileSync(tmpPath, stripSignAsyncForAst(fs.readFileSync(filePath, 'utf8')));
        try {
            const transpiled = transpiler.transpileGoByPath(tmpPath);
            result.push(transpiled);
        } finally {
            try { fs.unlinkSync(tmpPath); } catch (e) { /* ignore */ }
        }
    }
    return result;
}
