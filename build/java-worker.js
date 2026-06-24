import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
import { transpileSignSyncByPath } from './stripOverloads.js';

export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][java] Transpiling', filePath);
        // sign (+ crypto helpers) is async only in JS; transpile with sign made synchronous
        // (original content held in memory and restored — no temp file).
        result.push(transpileSignSyncByPath((p) => transpiler.transpileJavaByPath(p), filePath));
    }
    return result;
}
