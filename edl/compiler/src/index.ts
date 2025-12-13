/**
 * EDL Compiler - Main Entry Point
 * Compiles Exchange Definition Language (YAML) to TypeScript
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseEDLFile, parseEDLContent } from './parser/index.js';
import { analyzeEDL } from './analyzer/index.js';
import { generateExchange } from './generator/index.js';
import { emit } from './generator/emitter.js';
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
export function compileFile(filePath: string, options: CompileOptions = {}): CompileResult {
    const result: CompileResult = {
        success: false,
        errors: [],
        warnings: [],
    };

    // Parse
    if (options.verbose) {
        console.log(`Parsing ${filePath}...`);
    }

    const parseResult = parseEDLFile(filePath);
    if (!parseResult.success || !parseResult.document) {
        result.errors = parseResult.errors.map(e => `${e.location?.path || filePath}: ${e.message}`);
        return result;
    }

    // Analyze
    if (options.verbose) {
        console.log('Analyzing...');
    }

    const analysisResult = analyzeEDL(parseResult.document);
    result.warnings = analysisResult.warnings.map(w => `${w.path}: ${w.message}`);

    if (!analysisResult.valid) {
        result.errors = analysisResult.errors.map(e => `${e.path}: ${e.message}`);
        return result;
    }

    // Stop here if validate only
    if (options.validateOnly) {
        result.success = true;
        result.exchangeId = parseResult.document.exchange.id;
        return result;
    }

    // Generate
    if (options.verbose) {
        console.log('Generating TypeScript...');
    }

    // Determine overrides directory (relative to the EDL file location)
    const overridesDir = path.join(path.dirname(filePath), '../overrides');

    const ast = generateExchange(parseResult.document, {
        includeComments: options.includeComments ?? true,
        overridesDir,
    });

    // Emit
    const code = emit(ast);

    // Write output
    const exchangeId = parseResult.document.exchange.id;
    const outputDir = options.outputDir || path.dirname(filePath);
    const outputPath = path.join(outputDir, `${exchangeId}.ts`);

    if (options.verbose) {
        console.log(`Writing ${outputPath}...`);
    }

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, code, 'utf-8');

    result.success = true;
    result.exchangeId = exchangeId;
    result.outputPath = outputPath;

    return result;
}

/**
 * Compile EDL content from a string
 */
export function compileContent(content: string, options: CompileOptions = {}): { code?: string; result: CompileResult } {
    const result: CompileResult = {
        success: false,
        errors: [],
        warnings: [],
    };

    // Parse
    const parseResult = parseEDLContent(content);
    if (!parseResult.success || !parseResult.document) {
        result.errors = parseResult.errors.map(e => `${e.location?.path || '<inline>'}: ${e.message}`);
        return { result };
    }

    // Analyze
    const analysisResult = analyzeEDL(parseResult.document);
    result.warnings = analysisResult.warnings.map(w => `${w.path}: ${w.message}`);

    if (!analysisResult.valid) {
        result.errors = analysisResult.errors.map(e => `${e.path}: ${e.message}`);
        return { result };
    }

    // Generate
    const ast = generateExchange(parseResult.document, {
        includeComments: options.includeComments ?? true,
    });

    // Emit
    const code = emit(ast);

    result.success = true;
    result.exchangeId = parseResult.document.exchange.id;

    return { code, result };
}

/**
 * CLI entry point
 */
export function main(args: string[] = process.argv.slice(2)): void {
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
            console.log('EDL Compiler v0.1.0');
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

        const result = compileFile(file, options);

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
                console.log(`  Validation passed for ${result.exchangeId}`);
            } else {
                console.log(`  Generated ${result.outputPath}`);
            }
        } else {
            hasErrors = true;
        }
    }

    process.exit(hasErrors ? 1 : 0);
}

function printHelp(): void {
    console.log(`
EDL Compiler - Exchange Definition Language to TypeScript

Usage: edl-compile [options] <files...>

Options:
  -h, --help           Show this help message
  -v, --version        Show version number
  -o, --out <dir>      Output directory (default: same as input)
  --validate-only      Only validate, don't generate code
  --no-comments        Don't include JSDoc comments
  --verbose            Print detailed progress

Examples:
  edl-compile exchanges/binance.edl.yaml
  edl-compile exchanges/*.edl.yaml --out ts/src/
  edl-compile exchanges/kraken.edl.yaml --validate-only
`);
}

// Export types
export type { EDLDocument, ValidationResult, TSFile };
export { parseEDLFile, parseEDLContent } from './parser/index.js';
export { analyzeEDL } from './analyzer/index.js';
export { generateExchange } from './generator/index.js';
export { emit } from './generator/emitter.js';

// Export WebSocket types
export type {
    // Typed snapshot variants
    TypedSnapshot,
    OrderBookSnapshot,
    TradesSnapshot,
    TickerSnapshot,
    // Delta application utilities
    DeltaApplicationResult,
    DeltaQueue,
    ReconciliationStats,
    // Base types
    SnapshotDefinition,
    DeltaDefinition,
    ChecksumDefinition,
    ReconciliationRules,
    WebSocketReconciliationConfig,
    WebSocketConfig,
    ReconciliationState,
    ReconciliationEvent,
    ReconciliationEventHandler,
} from './types/websocket.js';

// Export derivation functions
export {
    deriveSymbol,
    deriveBaseQuote,
    deriveSettleCurrency,
    deriveMarketType,
    isLinear,
    isInverse,
    isQuanto,
    deriveOptionProperties,
} from './derivation/index.js';
