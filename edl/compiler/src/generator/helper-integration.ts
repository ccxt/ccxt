/**
 * Helper Integration for DSL-Generated Code
 *
 * Automatically detects and integrates helper library functions into generated code,
 * managing imports and function calls for delta-snapshot operations and array functions.
 */

import type { ArrayOperation } from '../syntax/array-operations.js';
import type { DeltaDefinition, SnapshotDefinition } from '../types/websocket.js';

/**
 * Helper function type categorization
 */
export type HelperCategory =
    | 'delta-snapshot'      // Delta/snapshot reconciliation helpers
    | 'array-operations'    // Array function evaluation
    | 'expression-eval'     // Expression evaluator
    | 'validation'          // Validation helpers
    | 'websocket';          // WebSocket utilities

/**
 * Helper function metadata
 */
export interface HelperFunction {
    /**
     * Function name
     */
    name: string;

    /**
     * Category of helper
     */
    category: HelperCategory;

    /**
     * Import path (relative to generated code location)
     */
    importPath: string;

    /**
     * Whether this is a named export (vs default export)
     */
    isNamedExport: boolean;

    /**
     * Optional type imports needed
     */
    typeImports?: string[];
}

/**
 * Code generation context
 */
export interface CodeGenContext {
    /**
     * Features used in the generated code
     */
    usedFeatures: Set<string>;

    /**
     * Variables referenced in expressions
     */
    referencedVariables: Set<string>;

    /**
     * Array operations detected
     */
    arrayOperations: ArrayOperation[];

    /**
     * Whether delta/snapshot reconciliation is used
     */
    usesDeltaSnapshot: boolean;

    /**
     * Whether expression evaluation is needed
     */
    usesExpressions: boolean;
}

/**
 * Import statement generation result
 */
export interface ImportStatements {
    /**
     * Named imports (function imports)
     */
    namedImports: string[];

    /**
     * Type imports
     */
    typeImports: string[];

    /**
     * Full import statements as strings
     */
    statements: string[];
}

/**
 * Available helper functions registry
 */
const HELPER_REGISTRY: Record<string, HelperFunction> = {
    // Delta/Snapshot helpers
    applyDelta: {
        name: 'applyDelta',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    applyDeltas: {
        name: 'applyDeltas',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    applyOrderBookDelta: {
        name: 'applyOrderBookDelta',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    validateDelta: {
        name: 'validateDelta',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    mergeDelta: {
        name: 'mergeDelta',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    createSnapshot: {
        name: 'createSnapshot',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    cloneSnapshot: {
        name: 'cloneSnapshot',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    sortDeltasBySequence: {
        name: 'sortDeltasBySequence',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    findGaps: {
        name: 'findGaps',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    mergeOrderBookLevels: {
        name: 'mergeOrderBookLevels',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },
    sortOrderBook: {
        name: 'sortOrderBook',
        category: 'delta-snapshot',
        importPath: '../helpers/delta-snapshot.js',
        isNamedExport: true,
    },

    // Array operation helpers
    evaluateArrayOperation: {
        name: 'evaluateArrayOperation',
        category: 'array-operations',
        importPath: '../evaluation/array-functions.js',
        isNamedExport: true,
    },
    evaluateMapOperation: {
        name: 'evaluateMapOperation',
        category: 'array-operations',
        importPath: '../evaluation/array-functions.js',
        isNamedExport: true,
    },
    evaluateFilterOperation: {
        name: 'evaluateFilterOperation',
        category: 'array-operations',
        importPath: '../evaluation/array-functions.js',
        isNamedExport: true,
    },
    evaluateReduceOperation: {
        name: 'evaluateReduceOperation',
        category: 'array-operations',
        importPath: '../evaluation/array-functions.js',
        isNamedExport: true,
    },
    evaluateSliceOperation: {
        name: 'evaluateSliceOperation',
        category: 'array-operations',
        importPath: '../evaluation/array-functions.js',
        isNamedExport: true,
    },
    evaluateFlatMapOperation: {
        name: 'evaluateFlatMapOperation',
        category: 'array-operations',
        importPath: '../evaluation/array-functions.js',
        isNamedExport: true,
    },

    // Expression evaluator
    SafeExpressionEvaluator: {
        name: 'SafeExpressionEvaluator',
        category: 'expression-eval',
        importPath: '../evaluation/expression-evaluator.js',
        isNamedExport: true,
    },

    // Validation
    validateArrayOperation: {
        name: 'validateArrayOperation',
        category: 'validation',
        importPath: '../syntax/array-operations.js',
        isNamedExport: true,
    },
};

/**
 * HelperIntegrator class
 * Manages integration of helper functions into generated code
 */
export class HelperIntegrator {
    private context: CodeGenContext;
    private requiredHelpers: Set<string>;

    constructor(context?: Partial<CodeGenContext>) {
        this.context = {
            usedFeatures: new Set<string>(),
            referencedVariables: new Set<string>(),
            arrayOperations: [],
            usesDeltaSnapshot: false,
            usesExpressions: false,
            ...context,
        };
        this.requiredHelpers = new Set<string>();
    }

    /**
     * Detect which helpers are needed based on code context
     */
    detectRequiredHelpers(): string[] {
        this.requiredHelpers.clear();

        // Delta/snapshot helpers
        if (this.context.usesDeltaSnapshot) {
            this.requiredHelpers.add('applyDelta');
            this.requiredHelpers.add('createSnapshot');
            this.requiredHelpers.add('cloneSnapshot');

            if (this.context.usedFeatures.has('orderbook')) {
                this.requiredHelpers.add('applyOrderBookDelta');
                this.requiredHelpers.add('mergeOrderBookLevels');
                this.requiredHelpers.add('sortOrderBook');
            }

            if (this.context.usedFeatures.has('validation')) {
                this.requiredHelpers.add('validateDelta');
            }

            if (this.context.usedFeatures.has('sequence-tracking')) {
                this.requiredHelpers.add('sortDeltasBySequence');
                this.requiredHelpers.add('findGaps');
            }

            if (this.context.usedFeatures.has('merge')) {
                this.requiredHelpers.add('mergeDelta');
            }

            if (this.context.usedFeatures.has('multi-delta')) {
                this.requiredHelpers.add('applyDeltas');
            }
        }

        // Array operation helpers
        if (this.context.arrayOperations.length > 0) {
            // Determine which array operations are used
            const operationTypes = new Set(
                this.context.arrayOperations.map(op => op.op)
            );

            if (operationTypes.size > 1) {
                // Multiple operation types - use generic evaluator
                this.requiredHelpers.add('evaluateArrayOperation');
            } else {
                // Single operation type - use specific evaluators
                operationTypes.forEach(opType => {
                    switch (opType) {
                        case 'map':
                            this.requiredHelpers.add('evaluateMapOperation');
                            break;
                        case 'filter':
                            this.requiredHelpers.add('evaluateFilterOperation');
                            break;
                        case 'reduce':
                            this.requiredHelpers.add('evaluateReduceOperation');
                            break;
                        case 'slice':
                            this.requiredHelpers.add('evaluateSliceOperation');
                            break;
                        case 'flatMap':
                            this.requiredHelpers.add('evaluateFlatMapOperation');
                            break;
                    }
                });
            }
        }

        // Expression evaluator
        if (this.context.usesExpressions) {
            this.requiredHelpers.add('SafeExpressionEvaluator');
        }

        // Validation helpers
        if (this.context.usedFeatures.has('array-validation')) {
            this.requiredHelpers.add('validateArrayOperation');
        }

        return Array.from(this.requiredHelpers);
    }

    /**
     * Generate import statements for required helpers
     */
    generateImportStatements(): ImportStatements {
        const helpers = this.detectRequiredHelpers();
        const importsByPath = new Map<string, Set<string>>();
        const typeImportsByPath = new Map<string, Set<string>>();

        // Group helpers by import path
        for (const helperName of helpers) {
            const helper = HELPER_REGISTRY[helperName];
            if (!helper) {
                console.warn(`Unknown helper: ${helperName}`);
                continue;
            }

            if (!importsByPath.has(helper.importPath)) {
                importsByPath.set(helper.importPath, new Set());
            }
            importsByPath.get(helper.importPath)!.add(helper.name);

            // Add type imports if specified
            if (helper.typeImports) {
                if (!typeImportsByPath.has(helper.importPath)) {
                    typeImportsByPath.set(helper.importPath, new Set());
                }
                helper.typeImports.forEach(typeImport => {
                    typeImportsByPath.get(helper.importPath)!.add(typeImport);
                });
            }
        }

        // Generate import statements
        const statements: string[] = [];
        const namedImports: string[] = [];
        const typeImports: string[] = [];

        // Named imports
        importsByPath.forEach((names, path) => {
            const sortedNames = Array.from(names).sort();
            namedImports.push(...sortedNames);
            statements.push(
                `import { ${sortedNames.join(', ')} } from '${path}';`
            );
        });

        // Type imports
        typeImportsByPath.forEach((names, path) => {
            const sortedNames = Array.from(names).sort();
            typeImports.push(...sortedNames);
            statements.push(
                `import type { ${sortedNames.join(', ')} } from '${path}';`
            );
        });

        return {
            namedImports,
            typeImports,
            statements,
        };
    }

    /**
     * Generate helper function call code
     */
    generateHelperCall(
        helperName: string,
        args: string[],
        options?: {
            assignTo?: string;
            isAsync?: boolean;
        }
    ): string {
        if (!HELPER_REGISTRY[helperName]) {
            throw new Error(`Unknown helper function: ${helperName}`);
        }

        const asyncPrefix = options?.isAsync ? 'await ' : '';
        const assignment = options?.assignTo ? `${options.assignTo} = ` : '';
        const argsStr = args.join(', ');

        return `${assignment}${asyncPrefix}${helperName}(${argsStr});`;
    }

    /**
     * Add a feature to the context
     */
    addFeature(feature: string): void {
        this.context.usedFeatures.add(feature);
    }

    /**
     * Add an array operation to the context
     */
    addArrayOperation(operation: ArrayOperation): void {
        this.context.arrayOperations.push(operation);
    }

    /**
     * Enable delta/snapshot reconciliation
     */
    enableDeltaSnapshot(): void {
        this.context.usesDeltaSnapshot = true;
    }

    /**
     * Enable expression evaluation
     */
    enableExpressions(): void {
        this.context.usesExpressions = true;
    }

    /**
     * Get the current context
     */
    getContext(): CodeGenContext {
        return { ...this.context };
    }

    /**
     * Get helper function metadata
     */
    getHelperMetadata(helperName: string): HelperFunction | undefined {
        return HELPER_REGISTRY[helperName];
    }

    /**
     * Get all helpers in a category
     */
    getHelpersByCategory(category: HelperCategory): HelperFunction[] {
        return Object.values(HELPER_REGISTRY).filter(
            helper => helper.category === category
        );
    }

    /**
     * Check if a helper is required
     */
    isHelperRequired(helperName: string): boolean {
        this.detectRequiredHelpers();
        return this.requiredHelpers.has(helperName);
    }
}

/**
 * Create a HelperIntegrator with delta/snapshot support
 */
export function createDeltaSnapshotIntegrator(options?: {
    includeOrderBook?: boolean;
    includeValidation?: boolean;
    includeSequenceTracking?: boolean;
    includeMerge?: boolean;
}): HelperIntegrator {
    const integrator = new HelperIntegrator();
    integrator.enableDeltaSnapshot();

    if (options?.includeOrderBook) {
        integrator.addFeature('orderbook');
    }
    if (options?.includeValidation) {
        integrator.addFeature('validation');
    }
    if (options?.includeSequenceTracking) {
        integrator.addFeature('sequence-tracking');
    }
    if (options?.includeMerge) {
        integrator.addFeature('merge');
    }

    return integrator;
}

/**
 * Create a HelperIntegrator with array operations support
 */
export function createArrayOperationsIntegrator(
    operations: ArrayOperation[],
    options?: {
        includeValidation?: boolean;
        includeExpressions?: boolean;
    }
): HelperIntegrator {
    const integrator = new HelperIntegrator();

    operations.forEach(op => integrator.addArrayOperation(op));

    if (options?.includeValidation) {
        integrator.addFeature('array-validation');
    }
    if (options?.includeExpressions) {
        integrator.enableExpressions();
    }

    return integrator;
}

/**
 * Analyze code pattern to detect helper usage
 */
export function analyzeCodeForHelpers(code: string): string[] {
    const detectedHelpers: string[] = [];

    // Check for delta/snapshot patterns
    if (code.includes('delta') || code.includes('snapshot')) {
        if (code.includes('applyDelta') || code.match(/apply.*delta/i)) {
            detectedHelpers.push('applyDelta');
        }
        if (code.includes('orderbook') || code.includes('OrderBook')) {
            detectedHelpers.push('applyOrderBookDelta');
        }
        if (code.includes('validate') && code.includes('delta')) {
            detectedHelpers.push('validateDelta');
        }
    }

    // Check for array operation patterns
    if (code.match(/\.map\(/)) {
        detectedHelpers.push('evaluateMapOperation');
    }
    if (code.match(/\.filter\(/)) {
        detectedHelpers.push('evaluateFilterOperation');
    }
    if (code.match(/\.reduce\(/)) {
        detectedHelpers.push('evaluateReduceOperation');
    }
    if (code.match(/\.slice\(/)) {
        detectedHelpers.push('evaluateSliceOperation');
    }
    if (code.match(/\.flatMap\(/)) {
        detectedHelpers.push('evaluateFlatMapOperation');
    }

    return detectedHelpers;
}
