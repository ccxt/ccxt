import { Transpiler } from 'ast-transpiler';
import log from 'ololog'

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive) and rebuild only if the config ever changes
let cachedTranspiler = null;
let cachedConfigKey = null;

export default async ({transpilerConfig, files}) => {
    const configKey = JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== configKey) {
        cachedTranspiler = new Transpiler(transpilerConfig);
        cachedConfigKey = configKey;
    }
    const transpiler = cachedTranspiler;

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][csharp] Transpiling', filePath);
        const transpiled = transpiler.transpileCSharpByPath(filePath);
        result.push(transpiled);
    }
    return result;
}
