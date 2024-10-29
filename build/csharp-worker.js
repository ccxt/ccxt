import { Transpiler } from 'ast-transpiler';
import log from 'ololog'
const logsEnabled = !process.env.DISABLE_EXTRA_BUILD_LOGS;
export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);

    const result = [];
    for (const filePath of files) {
        if (logsEnabled) log.blue('[worker][csharp] Transpiling', filePath);
        const transpiled = transpiler.transpileCSharpByPath(filePath);
        result.push(transpiled);
    }
    return result;
}