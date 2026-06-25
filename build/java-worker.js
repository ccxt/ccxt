import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
import { patchTranspileByPathWithSyncSign } from './stripOverloads.js';

export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);
    // sign is synchronous in Java; make transpileJavaByPath strip sign->sync per file.
    patchTranspileByPathWithSyncSign(transpiler, 'transpileJavaByPath');

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][java] Transpiling', filePath);
        result.push(transpiler.transpileJavaByPath(filePath));
    }
    return result;
}
