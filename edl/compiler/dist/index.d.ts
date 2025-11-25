/**
 * EDL Compiler - Main Entry Point
 * Compiles Exchange Definition Language (YAML) to TypeScript
 */
import type { EDLDocument, ValidationResult } from './types/edl.js';
import type { TSFile } from './types/ast.js';
export interface CompileOptions {
    outputDir?: string;
    validateOnly?: boolean;
    includeComments?: boolean;
    verbose?: boolean;
}
export interface CompileResult {
    success: boolean;
    exchangeId?: string;
    outputPath?: string;
    errors: string[];
    warnings: string[];
}
/**
 * Compile an EDL file to TypeScript
 */
export declare function compileFile(filePath: string, options?: CompileOptions): CompileResult;
/**
 * Compile EDL content from a string
 */
export declare function compileContent(content: string, options?: CompileOptions): {
    code?: string;
    result: CompileResult;
};
/**
 * CLI entry point
 */
export declare function main(args?: string[]): void;
export type { EDLDocument, ValidationResult, TSFile };
export { parseEDLFile, parseEDLContent } from './parser/index.js';
export { analyzeEDL } from './analyzer/index.js';
export { generateExchange } from './generator/index.js';
export { emit } from './generator/emitter.js';
//# sourceMappingURL=index.d.ts.map