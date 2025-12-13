/**
 * EDL Compiler v2 - Main Entry Point
 * Enhanced compiler with support for complex exchange patterns
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseEDLv2File, parseEDLv2Content } from './parser/v2-parser.js';
import { generateExchangeV2 } from './generator/v2-generator.js';
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
export function compileFileV2(filePath: string, options: CompileOptions = {}): CompileResult {
    const result: CompileResult = {
        success: false,
        errors: [],
        warnings: [],
    };

    // Parse
    if (options.verbose) {
        console.log(`Parsing ${filePath}...`);
    }

    const parseResult = parseEDLv2File(filePath);

    // Collect warnings
    result.warnings = parseResult.warnings.map(w => `${w.path}: ${w.message}`);

    if (!parseResult.success || !parseResult.document) {
        result.errors = parseResult.errors.map(e => `${e.path}: ${e.message}`);
        return result;
    }

    // Stop here if validate only
    if (options.validateOnly) {
        result.success = true;
        result.exchangeId = parseResult.document.exchange.id;
        if (options.verbose) {
            console.log(`Validation passed for ${result.exchangeId}`);
        }
        return result;
    }

    // Generate
    if (options.verbose) {
        console.log('Generating TypeScript...');
    }

    try {
        const code = generateExchangeV2(parseResult.document, {
            includeComments: options.includeComments ?? true,
        });

        result.code = code;

        // Write output if outputDir specified
        const exchangeId = parseResult.document.exchange.id;

        if (options.outputDir || !options.outputDir) {
            const outputDir = options.outputDir || path.dirname(filePath);
            const outputPath = path.join(outputDir, `${exchangeId}.ts`);

            if (options.verbose) {
                console.log(`Writing ${outputPath}...`);
            }

            fs.mkdirSync(outputDir, { recursive: true });
            fs.writeFileSync(outputPath, code, 'utf-8');

            result.outputPath = outputPath;
        }

        result.success = true;
        result.exchangeId = exchangeId;
    } catch (error) {
        result.errors.push(`Code generation failed: ${(error as Error).message}`);
    }

    return result;
}

/**
 * Compile EDL v2 content from a string
 */
export function compileContentV2(content: string, options: CompileOptions = {}): { code?: string; result: CompileResult } {
    const result: CompileResult = {
        success: false,
        errors: [],
        warnings: [],
    };

    // Parse
    const parseResult = parseEDLv2Content(content);
    result.warnings = parseResult.warnings.map(w => `${w.path}: ${w.message}`);

    if (!parseResult.success || !parseResult.document) {
        result.errors = parseResult.errors.map(e => `${e.path}: ${e.message}`);
        return { result };
    }

    // Generate
    try {
        const code = generateExchangeV2(parseResult.document, {
            includeComments: options.includeComments ?? true,
        });

        result.success = true;
        result.exchangeId = parseResult.document.exchange.id;

        return { code, result };
    } catch (error) {
        result.errors.push(`Code generation failed: ${(error as Error).message}`);
        return { result };
    }
}

/**
 * CLI entry point for v2 compiler
 */
export function mainV2(args: string[] = process.argv.slice(2)): void {
    const options: CompileOptions = {
        verbose: false,
        validateOnly: false,
        includeComments: true,
    };

    const files: string[] = [];
    let outputDir: string | undefined;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        } else if (arg === '--version' || arg === '-v') {
            console.log('EDL Compiler v2.0.0');
            process.exit(0);
        } else if (arg === '--verbose') {
            options.verbose = true;
        } else if (arg === '--validate-only') {
            options.validateOnly = true;
        } else if (arg === '--no-comments') {
            options.includeComments = false;
        } else if (arg === '--out' || arg === '-o') {
            outputDir = args[++i];
        } else if (!arg.startsWith('-')) {
            files.push(arg);
        }
    }

    if (files.length === 0) {
        console.error('Error: No input files specified');
        printHelp();
        process.exit(1);
    }

    options.outputDir = outputDir;

    // Compile each file
    let hasErrors = false;

    for (const file of files) {
        console.log(`\nCompiling ${file}...`);

        const result = compileFileV2(file, options);

        // Print warnings
        for (const warning of result.warnings) {
            console.warn(`  Warning: ${warning}`);
        }

        // Print errors
        for (const error of result.errors) {
            console.error(`  Error: ${error}`);
        }

        if (result.success) {
            if (options.validateOnly) {
                console.log(`  ✓ Validation passed for ${result.exchangeId}`);
            } else {
                console.log(`  ✓ Generated ${result.outputPath}`);
            }
        } else {
            hasErrors = true;
            console.log(`  ✗ Failed`);
        }
    }

    process.exit(hasErrors ? 1 : 0);
}

function printHelp(): void {
    console.log(`
EDL Compiler v2 - Enhanced Exchange Definition Language to TypeScript

Usage: edl-compile-v2 [options] <files...>

Options:
  -h, --help           Show this help message
  -v, --version        Show version number
  -o, --out <dir>      Output directory (default: same as input)
  --validate-only      Only validate, don't generate code
  --no-comments        Don't include JSDoc comments
  --verbose            Print detailed progress

Examples:
  edl-compile-v2 exchanges/binance-v2.edl.yaml
  edl-compile-v2 exchanges/*-v2.edl.yaml --out ts/src/
  edl-compile-v2 exchanges/kraken-v2.edl.yaml --validate-only --verbose

Features in v2:
  - Multi-step authentication pipelines
  - Runtime auth variant selection (RSA/EdDSA/HMAC)
  - Method variants for multi-account-type endpoints
  - Expression language for computed values
  - Switch/conditional field mappings
  - Object key iteration for parsers
  - Custom transform definitions
`);
}

// Export types and functions
export type { EnhancedEDLDocument };
export { parseEDLv2File, parseEDLv2Content } from './parser/v2-parser.js';
export { generateExchangeV2 } from './generator/v2-generator.js';
