/**
 * Linter Engine for EDL Compiler
 * Phase 3-11.3: Core linting engine that orchestrates rule application
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    DSLElement,
    LintContext,
    LintError,
    LintRule,
    LintResult,
    PlaceholderDefinition,
    TransformDefinition,
} from './schema.js';
import { getAllRules, getCriticalRules, getRuleById } from './rules.js';
import { parseEDLFile, parseEDLContent, ParseResult } from '../parser/index.js';
import type { EDLDocument } from '../types/edl.js';

// ============================================================
// Linter Configuration
// ============================================================

export interface LinterConfig {
    /**
     * Rules to apply (defaults to all rules)
     */
    rules?: LintRule[];

    /**
     * Rule IDs to enable (if specified, only these rules are used)
     */
    enabledRules?: string[];

    /**
     * Rule IDs to disable
     */
    disabledRules?: string[];

    /**
     * Minimum severity to report ('error', 'warning', 'info')
     * Defaults to 'info' (reports everything)
     */
    minSeverity?: 'error' | 'warning' | 'info';

    /**
     * Maximum number of errors to report (0 = unlimited)
     */
    maxErrors?: number;

    /**
     * Whether to stop on first error
     */
    stopOnFirstError?: boolean;

    /**
     * Custom placeholders context
     */
    placeholders?: Record<string, PlaceholderDefinition>;

    /**
     * Custom transforms context
     */
    transforms?: Record<string, TransformDefinition>;

    /**
     * Custom variables context
     */
    variables?: Record<string, any>;
}

export interface LinterOptions {
    /**
     * File path being linted (for error reporting)
     */
    filePath?: string;

    /**
     * Additional context to merge
     */
    context?: Partial<LintContext>;
}

// ============================================================
// Linter Results
// ============================================================

export interface FileLintResult extends LintResult {
    /**
     * File path that was linted
     */
    filePath: string;

    /**
     * Total number of issues found
     */
    totalIssues: number;

    /**
     * Whether parsing succeeded
     */
    parseSuccess: boolean;

    /**
     * Parse errors (if any)
     */
    parseErrors?: string[];
}

export interface DirectoryLintResult {
    /**
     * Results for each file
     */
    files: FileLintResult[];

    /**
     * Total errors across all files
     */
    totalErrors: number;

    /**
     * Total warnings across all files
     */
    totalWarnings: number;

    /**
     * Total info messages across all files
     */
    totalInfo: number;

    /**
     * Whether all files are valid
     */
    allValid: boolean;

    /**
     * Summary statistics
     */
    summary: {
        filesProcessed: number;
        filesWithErrors: number;
        filesWithWarnings: number;
        totalIssues: number;
    };
}

// ============================================================
// Linter Engine
// ============================================================

export class LinterEngine {
    private config: Required<LinterConfig>;
    private defaultContext: LintContext;

    constructor(config: LinterConfig = {}) {
        // Initialize configuration with defaults
        this.config = {
            rules: config.rules || getAllRules(),
            enabledRules: config.enabledRules || [],
            disabledRules: config.disabledRules || [],
            minSeverity: config.minSeverity || 'info',
            maxErrors: config.maxErrors ?? 0,
            stopOnFirstError: config.stopOnFirstError ?? false,
            placeholders: config.placeholders || {},
            transforms: config.transforms || this.getDefaultTransforms(),
            variables: config.variables || {},
        };

        // Apply rule filtering
        this.filterRules();

        // Create default context
        this.defaultContext = {
            placeholders: this.config.placeholders,
            transforms: this.config.transforms,
            variables: this.config.variables,
        };
    }

    /**
     * Filter rules based on enabled/disabled configuration
     */
    private filterRules(): void {
        let rules = this.config.rules;

        // If enabledRules is specified, use only those rules
        if (this.config.enabledRules.length > 0) {
            const enabledSet = new Set(this.config.enabledRules);
            rules = rules.filter(rule => enabledSet.has(rule.id));
        }

        // Remove disabled rules
        if (this.config.disabledRules.length > 0) {
            const disabledSet = new Set(this.config.disabledRules);
            rules = rules.filter(rule => !disabledSet.has(rule.id));
        }

        this.config.rules = rules;
    }

    /**
     * Get default transform definitions
     */
    private getDefaultTransforms(): Record<string, TransformDefinition> {
        return {
            parseNumber: {
                name: 'parseNumber',
                inputType: 'string',
                outputType: 'number',
                description: 'Parse string to number',
            },
            parseInt: {
                name: 'parseInt',
                inputType: 'string',
                outputType: 'int',
                description: 'Parse string to integer',
            },
            parseFloat: {
                name: 'parseFloat',
                inputType: 'string',
                outputType: 'float',
                description: 'Parse string to float',
            },
            parseTimestamp: {
                name: 'parseTimestamp',
                inputType: 'string',
                outputType: 'timestamp',
                description: 'Parse string to timestamp',
            },
            safeString: {
                name: 'safeString',
                inputType: 'any',
                outputType: 'string',
                description: 'Safely convert to string',
            },
            safeNumber: {
                name: 'safeNumber',
                inputType: 'any',
                outputType: 'number',
                description: 'Safely convert to number',
            },
            toString: {
                name: 'toString',
                inputType: 'any',
                outputType: 'string',
                description: 'Convert to string',
            },
            toLowerCase: {
                name: 'toLowerCase',
                inputType: 'string',
                outputType: 'string',
                description: 'Convert to lowercase',
            },
            toUpperCase: {
                name: 'toUpperCase',
                inputType: 'string',
                outputType: 'string',
                description: 'Convert to uppercase',
            },
        };
    }

    /**
     * Create lint context from EDL document
     */
    private createContextFromDocument(document: EDLDocument, filePath?: string): LintContext {
        const placeholders: Record<string, PlaceholderDefinition> = {
            ...this.defaultContext.placeholders,
        };

        // Extract placeholders from parsers
        if (document.parsers) {
            for (const [parserName, parser] of Object.entries(document.parsers)) {
                if (parser.mapping) {
                    for (const [fieldName, mapping] of Object.entries(parser.mapping)) {
                        // Add fields as potential placeholders
                        placeholders[fieldName] = {
                            name: fieldName,
                            type: 'any',
                            description: `Field from ${parserName} parser`,
                        };
                    }
                }
            }
        }

        // Add common EDL placeholders
        placeholders['symbol'] = { name: 'symbol', type: 'string', description: 'Trading symbol' };
        placeholders['timestamp'] = { name: 'timestamp', type: 'timestamp', description: 'Timestamp' };
        placeholders['price'] = { name: 'price', type: 'number', description: 'Price' };
        placeholders['amount'] = { name: 'amount', type: 'number', description: 'Amount' };
        placeholders['side'] = { name: 'side', type: 'string', description: 'Order side' };
        placeholders['type'] = { name: 'type', type: 'string', description: 'Order type' };

        const variables: Record<string, any> = {
            ...this.defaultContext.variables,
        };

        // Add parsers as variables (for reference checking)
        if (document.parsers) {
            for (const parserName of Object.keys(document.parsers)) {
                variables[parserName] = true;
            }
        }

        return {
            placeholders,
            transforms: this.defaultContext.transforms,
            variables,
            file: filePath,
        };
    }

    /**
     * Extract DSL elements from EDL document
     */
    private extractDSLElements(document: EDLDocument): DSLElement[] {
        const elements: DSLElement[] = [];

        // Extract elements from parsers
        if (document.parsers) {
            for (const [parserName, parser] of Object.entries(document.parsers)) {
                if (parser.mapping) {
                    for (const [fieldName, mapping] of Object.entries(parser.mapping)) {
                        // Check path mappings
                        if ('path' in mapping && mapping.path) {
                            const paths = Array.isArray(mapping.path) ? mapping.path : [mapping.path];
                            for (const pathValue of paths) {
                                elements.push({
                                    type: 'path',
                                    value: pathValue,
                                    location: {
                                        path: `parsers.${parserName}.mapping.${fieldName}`,
                                    },
                                    metadata: {
                                        parser: parserName,
                                        field: fieldName,
                                    },
                                });
                            }
                        }

                        // Check transform
                        if ('transform' in mapping && mapping.transform) {
                            const transforms = Array.isArray(mapping.transform)
                                ? mapping.transform
                                : [mapping.transform];

                            for (const transform of transforms) {
                                const transformName = typeof transform === 'string'
                                    ? transform
                                    : transform.name;

                                elements.push({
                                    type: 'transform',
                                    value: transformName,
                                    location: {
                                        path: `parsers.${parserName}.mapping.${fieldName}.transform`,
                                    },
                                    metadata: {
                                        parser: parserName,
                                        field: fieldName,
                                    },
                                });
                            }
                        }

                        // Check expressions (compute)
                        if ('compute' in mapping && mapping.compute) {
                            elements.push({
                                type: 'expression',
                                value: mapping.compute,
                                location: {
                                    path: `parsers.${parserName}.mapping.${fieldName}.compute`,
                                },
                                metadata: {
                                    parser: parserName,
                                    field: fieldName,
                                },
                            });
                        }

                        // Check fromContext references
                        if ('fromContext' in mapping && mapping.fromContext) {
                            elements.push({
                                type: 'reference',
                                value: mapping.fromContext,
                                location: {
                                    path: `parsers.${parserName}.mapping.${fieldName}.fromContext`,
                                },
                                metadata: {
                                    parser: parserName,
                                    field: fieldName,
                                },
                            });
                        }
                    }
                }

                // Check parser source path
                if (parser.path) {
                    elements.push({
                        type: 'path',
                        value: parser.path,
                        location: {
                            path: `parsers.${parserName}.path`,
                        },
                        metadata: {
                            parser: parserName,
                        },
                    });
                }
            }
        }

        return elements;
    }

    /**
     * Apply rules to elements and collect errors
     */
    private applyRules(elements: DSLElement[], context: LintContext): LintError[] {
        const allErrors: LintError[] = [];

        for (const element of elements) {
            for (const rule of this.config.rules) {
                const errors = rule.check(element, context);
                allErrors.push(...errors);

                // Stop on first error if configured
                if (this.config.stopOnFirstError && errors.length > 0) {
                    return allErrors;
                }

                // Stop if max errors reached
                if (this.config.maxErrors > 0 && allErrors.length >= this.config.maxErrors) {
                    return allErrors.slice(0, this.config.maxErrors);
                }
            }
        }

        return allErrors;
    }

    /**
     * Filter errors by severity
     */
    private filterBySeverity(errors: LintError[]): LintError[] {
        const severityOrder = { error: 3, warning: 2, info: 1 };
        const minLevel = severityOrder[this.config.minSeverity];

        return errors.filter(error => severityOrder[error.severity] >= minLevel);
    }

    /**
     * Create lint result from errors
     */
    private createResult(errors: LintError[]): LintResult {
        const filteredErrors = this.filterBySeverity(errors);

        const errorsList = filteredErrors.filter(e => e.severity === 'error');
        const warningsList = filteredErrors.filter(e => e.severity === 'warning');
        const infoList = filteredErrors.filter(e => e.severity === 'info');

        return {
            errors: errorsList,
            warnings: warningsList,
            info: infoList,
            valid: errorsList.length === 0,
        };
    }

    /**
     * Lint DSL elements with custom context
     */
    public lintElements(
        elements: DSLElement[],
        context?: Partial<LintContext>,
        options?: LinterOptions
    ): LintResult {
        const fullContext: LintContext = {
            ...this.defaultContext,
            ...context,
            file: options?.filePath || context?.file,
        };

        const errors = this.applyRules(elements, fullContext);
        return this.createResult(errors);
    }

    /**
     * Lint EDL document
     */
    public lintDocument(document: EDLDocument, options?: LinterOptions): LintResult {
        const context = this.createContextFromDocument(document, options?.filePath);

        // Merge additional context if provided
        if (options?.context) {
            Object.assign(context, options.context);
        }

        const elements = this.extractDSLElements(document);
        const errors = this.applyRules(elements, context);

        return this.createResult(errors);
    }

    /**
     * Lint EDL content (string)
     */
    public lintContent(content: string, options?: LinterOptions): FileLintResult {
        const filePath = options?.filePath || '<inline>';
        const parseResult = parseEDLContent(content, filePath);

        if (!parseResult.success || !parseResult.document) {
            return {
                filePath,
                errors: [],
                warnings: [],
                info: [],
                valid: false,
                totalIssues: parseResult.errors.length,
                parseSuccess: false,
                parseErrors: parseResult.errors.map(e => e.message),
            };
        }

        const lintResult = this.lintDocument(parseResult.document, options);

        return {
            filePath,
            ...lintResult,
            totalIssues: lintResult.errors.length + lintResult.warnings.length + lintResult.info.length,
            parseSuccess: true,
        };
    }

    /**
     * Lint EDL file
     */
    public lintFile(filePath: string): FileLintResult {
        if (!fs.existsSync(filePath)) {
            return {
                filePath,
                errors: [],
                warnings: [],
                info: [],
                valid: false,
                totalIssues: 1,
                parseSuccess: false,
                parseErrors: [`File not found: ${filePath}`],
            };
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        return this.lintContent(content, { filePath });
    }

    /**
     * Lint all EDL files in a directory
     */
    public lintDirectory(
        dirPath: string,
        options: { recursive?: boolean; pattern?: RegExp } = {}
    ): DirectoryLintResult {
        const recursive = options.recursive ?? true;
        const pattern = options.pattern || /\.edl\.(yaml|yml)$/;

        const files = this.findEDLFiles(dirPath, recursive, pattern);
        const results: FileLintResult[] = [];

        for (const file of files) {
            results.push(this.lintFile(file));
        }

        return this.summarizeResults(results);
    }

    /**
     * Find EDL files in directory
     */
    private findEDLFiles(dirPath: string, recursive: boolean, pattern: RegExp): string[] {
        const files: string[] = [];

        if (!fs.existsSync(dirPath)) {
            return files;
        }

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory() && recursive) {
                files.push(...this.findEDLFiles(fullPath, recursive, pattern));
            } else if (entry.isFile() && pattern.test(entry.name)) {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Summarize directory lint results
     */
    private summarizeResults(results: FileLintResult[]): DirectoryLintResult {
        const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
        const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
        const totalInfo = results.reduce((sum, r) => sum + r.info.length, 0);
        const allValid = results.every(r => r.valid);

        const filesWithErrors = results.filter(r => r.errors.length > 0).length;
        const filesWithWarnings = results.filter(r => r.warnings.length > 0).length;

        return {
            files: results,
            totalErrors,
            totalWarnings,
            totalInfo,
            allValid,
            summary: {
                filesProcessed: results.length,
                filesWithErrors,
                filesWithWarnings,
                totalIssues: totalErrors + totalWarnings + totalInfo,
            },
        };
    }

    /**
     * Get current configuration
     */
    public getConfig(): Readonly<Required<LinterConfig>> {
        return { ...this.config };
    }

    /**
     * Get active rules
     */
    public getActiveRules(): LintRule[] {
        return [...this.config.rules];
    }
}

// ============================================================
// Convenience Functions
// ============================================================

/**
 * Create a linter with default configuration
 */
export function createLinter(config?: LinterConfig): LinterEngine {
    return new LinterEngine(config);
}

/**
 * Lint a file with default configuration
 */
export function lintFile(filePath: string, config?: LinterConfig): FileLintResult {
    const linter = createLinter(config);
    return linter.lintFile(filePath);
}

/**
 * Lint content with default configuration
 */
export function lintContent(content: string, config?: LinterConfig): FileLintResult {
    const linter = createLinter(config);
    return linter.lintContent(content);
}

/**
 * Lint directory with default configuration
 */
export function lintDirectory(
    dirPath: string,
    config?: LinterConfig,
    options?: { recursive?: boolean; pattern?: RegExp }
): DirectoryLintResult {
    const linter = createLinter(config);
    return linter.lintDirectory(dirPath, options);
}
