/**
 * EDL Compiler - Main Entry Point
 * Compiles Exchange Definition Language (YAML) to TypeScript
 */

import * as fs from 'fs';
import * as path from 'path';
import yaml from 'yaml';
import { parseEDLFile, parseEDLContent } from './parser/index.js';
import { parseEDLv2File } from './parser/v2-parser.js';
import { analyzeEDL } from './analyzer/index.js';
import { generateExchange } from './generator/index.js';
import { generateExchangeV2 } from './generator/v2-generator.js';
import { emit } from './generator/emitter.js';
import type { EDLDocument, ValidationResult } from './types/edl.js';
import type { TSFile } from './types/ast.js';

/**
 * Detect EDL version from file content
 */
function detectVersion(filePath: string): '1' | '2' {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const doc = yaml.parse(content);
        if (doc?.version && doc.version.toString().startsWith('2')) {
            return '2';
        }
    } catch (e) {
        // Fall back to v1 on parse error
    }
    return '1';
}

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

    // Detect version
    const version = detectVersion(filePath);

    if (options.verbose) {
        console.log(`Detected EDL version: ${version}`);
    }

    // Route to appropriate compiler
    if (version === '2') {
        return compileFileV2(filePath, options);
    }

    // V1 compilation path
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
 * Compile an EDL v2 file to TypeScript
 */
export function compileFileV2(filePath: string, options: CompileOptions = {}): CompileResult {
    const result: CompileResult = {
        success: false,
        errors: [],
        warnings: [],
    };

    // Parse with v2 parser
    if (options.verbose) {
        console.log(`Parsing ${filePath} with v2 parser...`);
    }

    const parseResult = parseEDLv2File(filePath);
    if (!parseResult.success || !parseResult.document) {
        result.errors = parseResult.errors.map(e => `${e.path}: ${e.message}`);
        return result;
    }

    result.warnings = parseResult.warnings.map(w => `${w.path}: ${w.message}`);

    // V2 doesn't have a separate analyzer yet - validation happens in parser
    // TODO: Add v2 analyzer for more thorough validation

    // Stop here if validate only
    if (options.validateOnly) {
        result.success = true;
        result.exchangeId = parseResult.document.exchange.id;
        return result;
    }

    // Generate with v2 generator
    if (options.verbose) {
        console.log('Generating TypeScript with v2 generator...');
    }

    const code = generateExchangeV2(parseResult.document, {
        includeComments: options.includeComments ?? true,
    });

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
