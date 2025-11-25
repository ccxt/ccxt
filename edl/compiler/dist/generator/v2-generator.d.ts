/**
 * Enhanced EDL Code Generator v2
 * Generates TypeScript code from enhanced EDL documents
 */
import type { EnhancedEDLDocument } from '../types/edl-v2.js';
export interface GenerateOptions {
    includeComments?: boolean;
    targetPath?: string;
}
/**
 * Generate TypeScript code from an enhanced EDL document
 */
export declare function generateExchangeV2(doc: EnhancedEDLDocument, options?: GenerateOptions): string;
//# sourceMappingURL=v2-generator.d.ts.map