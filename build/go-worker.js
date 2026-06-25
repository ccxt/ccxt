import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
import { patchTranspileByPathWithSyncSign } from './stripOverloads.js';

export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);
    // sign is synchronous in Go; make transpileGoByPath strip sign->sync per file.
    patchTranspileByPathWithSyncSign(transpiler, 'transpileGoByPath');

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][go] Transpiling', filePath);
        result.push(transpiler.transpileGoByPath(filePath));
    }
    return result;
}
