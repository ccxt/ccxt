import { Transpiler } from 'ast-transpiler';

// one entry per file: the TS source and the per-language config list handed to
// transpileDifferentLanguages
interface FileConfig {
    content: string;
    config: { language: string; async: boolean }[];
}

// task payload posted by transpile.ts#webworkerTranspile (structured clone)
interface AstTranspilerWorkerTask {
    transpilerConfig: any;
    filesConfig: FileConfig[];
}

let cachedTranspiler: Transpiler | null = null;
let cachedConfigKey: string | null = null;
let programCache: ReturnType<typeof Transpiler.createProgramCache> | null = null;

export default async ({ transpilerConfig, filesConfig }: AstTranspilerWorkerTask) => {
    const key = JSON.stringify (transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        if (!programCache) {
            programCache = Transpiler.createProgramCache ();
        }
        cachedTranspiler = new Transpiler (transpilerConfig, programCache);
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;

    const result: any[] = [];
    for (const fileConfig of filesConfig) {
        const transpiled = transpiler.transpileDifferentLanguages (fileConfig.config, fileConfig.content);
        // const transpiledFile = {
        //     name: fileConfig.name,
        //     result: transpiled
        // };
        result.push (transpiled);
    }
    return result;
}

