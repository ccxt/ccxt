/**
 * EDL Code Generator
 * Transforms EDL documents into TypeScript code
 */
import type { EDLDocument } from '../types/edl.js';
import type { TSFile } from '../types/ast.js';
export interface GeneratorOptions {
    includeComments?: boolean;
    targetPath?: string;
    baseClass?: string;
}
export declare function generateExchange(doc: EDLDocument, options?: GeneratorOptions): TSFile;
//# sourceMappingURL=index.d.ts.map