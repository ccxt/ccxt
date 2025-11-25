/**
 * EDL Compiler v2 - Main Entry Point
 * Enhanced compiler with support for complex exchange patterns
 */
import type { EnhancedEDLDocument } from './types/edl-v2.js';
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
    code?: string;
    errors: string[];
    warnings: string[];
}
/**
 * Compile an EDL v2 file to TypeScript
 */
export declare function compileFileV2(filePath: string, options?: CompileOptions): CompileResult;
/**
 * Compile EDL v2 content from a string
 */
export declare function compileContentV2(content: string, options?: CompileOptions): {
    code?: string;
    result: CompileResult;
};
/**
 * CLI entry point for v2 compiler
 */
export declare function mainV2(args?: string[]): void;
export type { EnhancedEDLDocument };
export { parseEDLv2File, parseEDLv2Content } from './parser/v2-parser.js';
export { generateExchangeV2 } from './generator/v2-generator.js';
//# sourceMappingURL=index-v2.d.ts.map