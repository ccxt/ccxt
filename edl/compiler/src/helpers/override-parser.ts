/**
 * Override File Parser
 * Extracts method implementations from TypeScript override files
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ParsedOverride {
    methodName: string;
    code: string;
    jsdoc?: string;
}

/**
 * Parse a TypeScript override file and extract exported functions
 */
export function parseOverrideFile(filePath: string): ParsedOverride[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const overrides: ParsedOverride[] = [];

    // Match exported functions with optional JSDoc
    // Matches: export const functionName = function (...) {...}
    // or: export const functionName = async function (...) {...}
    const exportPattern = /(?:\/\*\*[\s\S]*?\*\/\s*)?export\s+const\s+(\w+)\s*=\s*(async\s+)?function\s*\([^)]*\)[^{]*\{[\s\S]*?\n\};/g;

    let match;
    while ((match = exportPattern.exec(content)) !== null) {
        const fullMatch = match[0];
        const methodName = match[1];

        // Extract JSDoc if present
        let jsdoc: string | undefined;
        const jsdocMatch = fullMatch.match(/\/\*\*([\s\S]*?)\*\//);
        if (jsdocMatch) {
            jsdoc = jsdocMatch[0];
        }

        // Extract the entire function including export statement
        overrides.push({
            methodName,
            code: fullMatch,
            jsdoc,
        });
    }

    return overrides;
}

/**
 * Convert an exported function to a class method
 * Transforms: export const methodName = function (...) {...}
 * Into: methodName (...) {...}
 */
export function convertToClassMethod(override: ParsedOverride): string {
    let code = override.code;

    // Remove 'export const methodName = function (\n    this: any,' and replace with just 'methodName ('
    // This handles the pattern where the first parameter is 'this: any,' on a newline
    // We need to be careful to only remove up to the comma (not the following whitespace)
    // Handle both: function and async function
    code = code.replace(
        /export\s+const\s+(\w+)\s*=\s*(async\s+)?function\s*\(\s*this:\s*any,/s,
        (match, methodName, asyncPrefix) => {
            return (asyncPrefix || '') + methodName + ' (';
        }
    );

    // Remove the trailing '};' and replace with just '}'
    code = code.replace(/\n\};$/, '\n}');

    // Convert nullish coalescing operator (??) to ternary for transpiler compatibility
    code = convertNullishCoalescingToTernary(code);

    return code;
}

/**
 * Convert nullish coalescing operator (??) to ternary expression
 * Transforms: expr ?? fallback  =>  (expr !== undefined ? expr : fallback)
 */
function convertNullishCoalescingToTernary(code: string): string {
    // Process line by line to avoid cross-line matches
    const lines = code.split('\n');
    const processedLines = lines.map(line => {
        // Only process lines that contain ??
        if (!line.includes('??')) {
            return line;
        }

        // Match pattern: leftExpr ?? rightExpr on the same line
        // Capture the leading whitespace and return/other keywords separately
        return line.replace(/^(\s*)(return\s+)?([^;\?\n]+?)\s*\?\?\s*([^;\?\n]+?)(;?)$/g,
            (match, indent, returnKeyword, left, right, semicolon) => {
                const trimmedLeft = left.trim();
                const trimmedRight = right.trim();

                const ternary = `${trimmedLeft} !== undefined ? ${trimmedLeft} : ${trimmedRight}`;
                const prefix = (returnKeyword || '');
                return `${indent}${prefix}${ternary}${semicolon}`;
            }
        );
    });

    return processedLines.join('\n');
}

/**
 * Check if a method should be overridden (skip if it's in the overrides list)
 */
export function shouldSkipGeneratedMethod(methodName: string, overrides: string[]): boolean {
    return overrides.includes(methodName);
}
