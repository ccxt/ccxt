/**
 * Enhanced EDL Parser v2
 * Parses YAML files into enhanced EDL document structures
 * with support for expressions, pipelines, and variants
 */
import type { EnhancedEDLDocument, Expression } from '../types/edl-v2.js';
export interface ParseResult {
    success: boolean;
    document?: EnhancedEDLDocument;
    errors: ParseError[];
    warnings: ParseWarning[];
}
export interface ParseError {
    message: string;
    path: string;
    line?: number;
}
export interface ParseWarning {
    message: string;
    path: string;
}
/**
 * Parse an EDL v2 file from disk
 */
export declare function parseEDLv2File(filePath: string): ParseResult;
/**
 * Parse EDL v2 content from a string
 */
export declare function parseEDLv2Content(content: string, filePath?: string): ParseResult;
/**
 * Parse expression shorthand into Expression type
 */
declare function parseExpression(raw: any, path: string): Expression;
export { parseExpression };
//# sourceMappingURL=v2-parser.d.ts.map