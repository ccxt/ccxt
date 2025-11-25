/**
 * TypeScript Code Emitter
 * Converts TypeScript AST to formatted code strings
 */
import type { TSFile } from '../types/ast.js';
export interface EmitOptions {
    indent?: string;
    lineWidth?: number;
    trailingCommas?: boolean;
}
export declare function emit(file: TSFile, options?: EmitOptions): string;
//# sourceMappingURL=emitter.d.ts.map