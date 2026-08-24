import { JuliaTranspiler } from './juliaTranspiler.js';
import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve('.');
const TS_SRC = path.join(REPO_ROOT, 'ts', 'src');
const JULIA_SRC = path.join(REPO_ROOT, 'julia', 'Ccxt', 'src');

function createProgramByPathAndSetGlobals(filePath: string) {
    const program = ts.createProgram([filePath], {});
    const sourceFile = program.getSourceFile(filePath);
    const typeChecker = program.getTypeChecker();
    global.src = sourceFile;
    global.checker = typeChecker;
    global.program = program;
}

function checkFileDiagnostics() {
    const diagnostics = ts.getPreEmitDiagnostics(global.program, global.src);
    if (diagnostics.length > 0) {
        let errorMessage = "Errors found in the typescript code. Transpilation might produce invalid results:\n";
        diagnostics.forEach(msg => {
            errorMessage += " - " + msg.messageText + "\n";
        });
        console.warn(errorMessage);
    }
}

async function transpileFile(filePath: string, transpiler: JuliaTranspiler) {
    createProgramByPathAndSetGlobals(filePath);
    checkFileDiagnostics();
    const result = transpiler.printNode(global.src, -1);
    return result;
}

async function main() {
    const args = process.argv.slice(2);
    const transpiler = new JuliaTranspiler({});

    if (args.includes('--base')) {
        const baseExchange = path.join(TS_SRC, 'base', 'Exchange.ts');
        if (fs.existsSync(baseExchange)) {
            const result = await transpileFile(baseExchange, transpiler);
            const outDir = path.join(JULIA_SRC, 'base');
            fs.mkdirSync(outDir, { recursive: true });
            const outFile = path.join(outDir, 'Exchange.jl');
            fs.writeFileSync(outFile, result, 'utf8');
            console.log(`Julia BaseMethods transpiled -> ${outFile}`);
        }
    }

    if (args.includes('--errors')) {
        const errorsFile = path.join(TS_SRC, 'base', 'Errors.ts');
        if (fs.existsSync(errorsFile)) {
            const result = await transpileFile(errorsFile, transpiler);
            const outDir = path.join(JULIA_SRC, 'base');
            fs.mkdirSync(outDir, { recursive: true });
            const outFile = path.join(outDir, 'Errors.jl');
            fs.writeFileSync(outFile, result, 'utf8');
            console.log(`Julia Errors transpiled -> ${outFile}`);
        }
    }

    if (args.includes('--exchange')) {
        const idx = args.indexOf('--exchange');
        const exchangeId = args[idx + 1];
        if (exchangeId) {
            const exchangeFile = path.join(TS_SRC, `${exchangeId}.ts`);
            if (fs.existsSync(exchangeFile)) {
                const result = await transpileFile(exchangeFile, transpiler);
                const outDir = path.join(JULIA_SRC, 'exchanges');
                fs.mkdirSync(outDir, { recursive: true });
                const outFile = path.join(outDir, `${exchangeId}.jl`);
                fs.writeFileSync(outFile, result, 'utf8');
                console.log(`Julia exchange ${exchangeId} transpiled -> ${outFile}`);
            }
        }
    }

    if (args.includes('--all')) {
        const exchangesJson = path.join(REPO_ROOT, 'exchanges.json');
        if (fs.existsSync(exchangesJson)) {
            const data = JSON.parse(fs.readFileSync(exchangesJson, 'utf8'));
            const ids = data.ids ?? [];
            for (const id of ids) {
                const exchangeFile = path.join(TS_SRC, `${id}.ts`);
                if (fs.existsSync(exchangeFile)) {
                    try {
                        const result = await transpileFile(exchangeFile, transpiler);
                        const outDir = path.join(JULIA_SRC, 'exchanges');
                        fs.mkdirSync(outDir, { recursive: true });
                        const outFile = path.join(outDir, `${id}.jl`);
                        fs.writeFileSync(outFile, result, 'utf8');
                        console.log(`Julia exchange ${id} transpiled -> ${outFile}`);
                    } catch (e) {
                        console.error(`Failed to transpile ${id}:`, e);
                    }
                }
            }
        }
    }
}

main().catch(console.error);
