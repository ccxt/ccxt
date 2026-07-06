import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][java] Transpiling', filePath);
        const transpiled = transpiler.transpileJavaByPath(filePath);
        result.push(transpiled);
    }
    return result;
}