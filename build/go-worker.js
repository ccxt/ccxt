import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][go] Transpiling', filePath);
        const transpiled = transpiler.transpileGoByPath(filePath);
        result.push(transpiled);
    }
    return result;
}