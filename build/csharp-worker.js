import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
import { patchTranspileByPathWithSyncSign } from './stripOverloads.js';

export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);
    // sign is synchronous in C#; make transpileCSharpByPath strip sign->sync per file.
    patchTranspileByPathWithSyncSign(transpiler, 'transpileCSharpByPath');

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][csharp] Transpiling', filePath);
        result.push(transpiler.transpileCSharpByPath(filePath));
    }
    return result;
}
