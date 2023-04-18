import { Transpiler } from 'ast-transpiler';

// expected files config
// const filesConfig = [
//     {
//         content: string,
//         config: [{
//             language: string,
//             async: boolean
//         }]
//     }
// ];

export default async ({transpilerConfig, filesConfig}) => {
    const transpiler = new Transpiler(transpilerConfig);

    const result = [];
    for (const fileConfig of filesConfig) {
        const transpiled = transpiler.transpileDifferentLanguages(fileConfig.config, fileConfig.content);
        // const transpiledFile = {
        //     name: fileConfig.name,
        //     result: transpiled
        // };
        result.push(transpiled);
    }
    return result;
}