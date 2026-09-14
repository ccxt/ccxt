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

export default async ({ transpilerConfig, filesConfig }: AstTranspilerWorkerTask) => {
    const transpiler = new Transpiler (transpilerConfig);

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
