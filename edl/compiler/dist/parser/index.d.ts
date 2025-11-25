/**
 * EDL Parser
 * Parses YAML files into EDL document structures
 */
import type { EDLDocument, SourceLocation } from '../types/edl.js';
export interface ParseResult {
    success: boolean;
    document?: EDLDocument;
    errors: ParseError[];
}
export interface ParseError {
    message: string;
    location?: SourceLocation;
}
export declare function parseEDLFile(filePath: string): ParseResult;
export declare function parseEDLContent(content: string, filePath?: string): ParseResult;
//# sourceMappingURL=index.d.ts.map