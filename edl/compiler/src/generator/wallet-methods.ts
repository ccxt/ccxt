/**
 * Wallet Method Code Generator
 *
 * This module generates TypeScript methods for executing wallet transfers,
 * including balance checks, transaction recording, and response normalization.
 */

import type {
    TSMethodDeclaration,
    TSParameter,
    TSType,
    TSStatement,
    TSExpression,
} from '../types/ast.js';
import type {
    WalletEndpointSchema,
    TransferSchema,
    WithdrawalSchema,
    FieldMapping,
} from '../schemas/wallet-operations.js';
import type { JSDocComment } from '../types/ast.js';

// ============================================================
// Type Definitions
// ============================================================

/**
 * Transfer method configuration
 */
export interface TransferMethodConfig {
    /** Method name */
    methodName?: string;
    /** Whether to include balance check */
    includeBalanceCheck?: boolean;
    /** Whether to record transaction */
    recordTransaction?: boolean;
    /** Custom validation logic */
    customValidation?: string;
}

/**
 * Code generation result
 */
export interface GeneratedCode {
    /** Generated method AST */
    method: TSMethodDeclaration;
    /** Method name */
    methodName: string;
    /** Required imports */
    imports: string[];
}

// ============================================================
// Main Generator Functions
// ============================================================

/**
 * Generate a transfer method from wallet endpoint schema
 *
 * @param schema Wallet endpoint schema definition
 * @param config Optional method configuration
 * @returns Generated method code and metadata
 */
export function emitTransferMethod(
    schema: WalletEndpointSchema,
    config: TransferMethodConfig = {}
): GeneratedCode {
    const {
        methodName = 'transfer',
        includeBalanceCheck = true,
        recordTransaction = true,
    } = config;

    // Build method parameters from schema
    const params = buildTransferParameters(schema);

    // Build method body
    const body = buildTransferMethodBody(schema, {
        includeBalanceCheck,
        recordTransaction,
        customValidation: config.customValidation,
    });

    // Create method AST
    const method: TSMethodDeclaration = {
        kind: 'method',
        name: methodName,
        params,
        returnType: {
            kind: 'reference',
            name: 'Promise',
            typeArgs: [{
                kind: 'reference',
                name: 'TransferSchema',
            }],
        },
        body,
        visibility: 'public',
        isAsync: true,
        jsDoc: {
            description: 'Execute internal transfer between account types',
            tags: [
                {
                    tag: 'param',
                    type: 'string',
                    name: 'currency',
                    description: 'Currency code to transfer',
                },
                {
                    tag: 'param',
                    type: 'number',
                    name: 'amount',
                    description: 'Amount to transfer',
                },
                {
                    tag: 'param',
                    type: 'AccountType',
                    name: 'fromAccount',
                    description: 'Source account type',
                },
                {
                    tag: 'param',
                    type: 'AccountType',
                    name: 'toAccount',
                    description: 'Destination account type',
                },
                {
                    tag: 'param',
                    type: 'object',
                    name: 'params',
                    description: 'Additional transfer parameters',
                },
                {
                    tag: 'returns',
                    type: 'Promise<TransferSchema>',
                    description: 'Transfer result with status and transaction details',
                },
            ],
        },
    };

    // Required imports
    const imports = [
        'TransferSchema',
        'AccountType',
        'TransferStatus',
        'validateTransferOperation',
        'normalizeWalletResponse',
        'createTransfer',
    ];

    return {
        method,
        methodName,
        imports,
    };
}

/**
 * Build transfer method parameters
 */
function buildTransferParameters(schema: WalletEndpointSchema): TSParameter[] {
    return [
        {
            name: 'currency',
            type: { kind: 'primitive', type: 'string' },
        },
        {
            name: 'amount',
            type: { kind: 'primitive', type: 'number' },
        },
        {
            name: 'fromAccount',
            type: { kind: 'reference', name: 'AccountType' },
        },
        {
            name: 'toAccount',
            type: { kind: 'reference', name: 'AccountType' },
        },
        {
            name: 'params',
            type: {
                kind: 'reference',
                name: 'Record',
                typeArgs: [
                    { kind: 'primitive', type: 'string' },
                    { kind: 'primitive', type: 'any' },
                ],
            },
            default: { kind: 'object', properties: [] },
        },
    ];
}

/**
 * Build transfer method body statements
 */
function buildTransferMethodBody(
    schema: WalletEndpointSchema,
    options: {
        includeBalanceCheck: boolean;
        recordTransaction: boolean;
        customValidation?: string;
    }
): TSStatement[] {
    const statements: TSStatement[] = [];

    // 1. Create transfer operation object
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'operation',
        type: {
            kind: 'reference',
            name: 'Partial',
            typeArgs: [{ kind: 'reference', name: 'TransferSchema' }],
        },
        value: {
            kind: 'object',
            properties: [
                {
                    key: 'currency',
                    value: { kind: 'identifier', name: 'currency' },
                    shorthand: true,
                },
                {
                    key: 'amount',
                    value: { kind: 'identifier', name: 'amount' },
                    shorthand: true,
                },
                {
                    key: 'fromAccount',
                    value: { kind: 'identifier', name: 'fromAccount' },
                    shorthand: true,
                },
                {
                    key: 'toAccount',
                    value: { kind: 'identifier', name: 'toAccount' },
                    shorthand: true,
                },
            ],
        },
    });

    // 2. Validate operation parameters
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'validation',
        value: {
            kind: 'call',
            callee: { kind: 'identifier', name: 'validateTransferOperation' },
            args: [
                { kind: 'identifier', name: 'operation' },
                {
                    kind: 'object',
                    properties: [
                        {
                            key: 'operation',
                            value: { kind: 'literal', value: 'transfer' },
                        },
                        {
                            key: 'endpoint',
                            value: { kind: 'literal', value: schema.endpoint },
                        },
                        {
                            key: 'method',
                            value: { kind: 'literal', value: schema.method },
                        },
                        {
                            key: 'params',
                            value: { kind: 'identifier', name: 'params' },
                        },
                        {
                            key: 'response',
                            value: {
                                kind: 'object',
                                properties: [
                                    {
                                        key: 'mapping',
                                        value: { kind: 'object', properties: [] },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    });

    // 3. Throw error if validation fails
    statements.push({
        kind: 'if',
        test: {
            kind: 'unary',
            operator: '!',
            operand: {
                kind: 'member',
                object: { kind: 'identifier', name: 'validation' },
                property: 'valid',
            },
        },
        consequent: [
            {
                kind: 'variable',
                keyword: 'const',
                name: 'errorMessages',
                value: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'validation' },
                            property: 'errors',
                        },
                        property: 'map',
                    },
                    args: [
                        {
                            kind: 'arrow',
                            params: [{ name: 'e' }],
                            body: {
                                kind: 'member',
                                object: { kind: 'identifier', name: 'e' },
                                property: 'message',
                            },
                        },
                    ],
                },
            },
            {
                kind: 'throw',
                argument: {
                    kind: 'new',
                    callee: { kind: 'identifier', name: 'Error' },
                    args: [
                        {
                            kind: 'binary',
                            left: { kind: 'literal', value: 'Transfer validation failed: ' },
                            operator: '+',
                            right: {
                                kind: 'call',
                                callee: {
                                    kind: 'member',
                                    object: { kind: 'identifier', name: 'errorMessages' },
                                    property: 'join',
                                },
                                args: [{ kind: 'literal', value: ', ' }],
                            },
                        },
                    ],
                },
            },
        ],
    });

    // 4. Balance check (if enabled)
    if (options.includeBalanceCheck) {
        statements.push({
            kind: 'variable',
            keyword: 'const',
            name: 'balance',
            value: {
                kind: 'await',
                expression: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'fetchBalance',
                    },
                    args: [
                        {
                            kind: 'object',
                            properties: [
                                {
                                    key: 'type',
                                    value: { kind: 'identifier', name: 'fromAccount' },
                                },
                            ],
                        },
                    ],
                },
            },
        });

        statements.push({
            kind: 'variable',
            keyword: 'const',
            name: 'availableBalance',
            value: {
                kind: 'conditional',
                test: {
                    kind: 'binary',
                    left: {
                        kind: 'member',
                        object: { kind: 'identifier', name: 'balance' },
                        property: 'currency',
                        computed: true,
                    },
                    operator: '!==',
                    right: { kind: 'identifier', name: 'undefined' },
                },
                consequent: {
                    kind: 'member',
                    object: {
                        kind: 'member',
                        object: { kind: 'identifier', name: 'balance' },
                        property: 'currency',
                        computed: true,
                    },
                    property: 'free',
                },
                alternate: { kind: 'literal', value: 0 },
            },
        });

        statements.push({
            kind: 'if',
            test: {
                kind: 'binary',
                left: { kind: 'identifier', name: 'availableBalance' },
                operator: '<',
                right: { kind: 'identifier', name: 'amount' },
            },
            consequent: [
                {
                    kind: 'throw',
                    argument: {
                        kind: 'new',
                        callee: { kind: 'identifier', name: 'Error' },
                        args: [
                            {
                                kind: 'raw',
                                code: '`Insufficient balance: available ${availableBalance} ${currency}, requested ${amount} ${currency}`',
                            },
                        ],
                    },
                },
            ],
        });
    }

    // 5. Build request parameters
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'request',
        value: {
            kind: 'object',
            properties: [
                {
                    key: 'currency',
                    value: { kind: 'identifier', name: 'currency' },
                    shorthand: true,
                },
                {
                    key: 'amount',
                    value: { kind: 'identifier', name: 'amount' },
                    shorthand: true,
                },
                {
                    key: 'fromAccount',
                    value: { kind: 'identifier', name: 'fromAccount' },
                    shorthand: true,
                },
                {
                    key: 'toAccount',
                    value: { kind: 'identifier', name: 'toAccount' },
                    shorthand: true,
                },
                {
                    key: 'params',
                    spread: true,
                    value: { kind: 'identifier', name: 'params' },
                },
            ],
        },
    });

    // 6. Execute API request
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'response',
        value: {
            kind: 'await',
            expression: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: schema.method.toLowerCase() + 'Request',
                },
                args: [
                    { kind: 'literal', value: schema.endpoint },
                    { kind: 'identifier', name: 'request' },
                ],
            },
        },
    });

    // 7. Normalize response
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'normalized',
        value: {
            kind: 'call',
            callee: { kind: 'identifier', name: 'normalizeWalletResponse' },
            args: [
                { kind: 'identifier', name: 'response' },
                {
                    kind: 'object',
                    properties: [
                        {
                            key: 'operation',
                            value: { kind: 'literal', value: 'transfer' },
                        },
                        {
                            key: 'endpoint',
                            value: { kind: 'literal', value: schema.endpoint },
                        },
                        {
                            key: 'method',
                            value: { kind: 'literal', value: schema.method },
                        },
                        {
                            key: 'params',
                            value: { kind: 'object', properties: [] },
                        },
                        {
                            key: 'response',
                            value: buildResponseMapping(schema),
                        },
                    ],
                },
            ],
        },
    });

    // 8. Create transfer object
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'transfer',
        value: {
            kind: 'call',
            callee: { kind: 'identifier', name: 'createTransfer' },
            args: [{ kind: 'identifier', name: 'normalized' }],
        },
    });

    // 9. Record transaction (if enabled)
    if (options.recordTransaction) {
        statements.push({
            kind: 'if',
            test: {
                kind: 'member',
                object: { kind: 'this' },
                property: 'recordTransaction',
            },
            consequent: [
                {
                    kind: 'expression',
                    expression: {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: 'recordTransaction',
                        },
                        args: [
                            {
                                kind: 'object',
                                properties: [
                                    {
                                        key: 'id',
                                        value: {
                                            kind: 'member',
                                            object: { kind: 'identifier', name: 'transfer' },
                                            property: 'id',
                                        },
                                    },
                                    {
                                        key: 'type',
                                        value: { kind: 'literal', value: 'transfer' },
                                    },
                                    {
                                        key: 'currency',
                                        value: { kind: 'identifier', name: 'currency' },
                                        shorthand: true,
                                    },
                                    {
                                        key: 'amount',
                                        value: { kind: 'identifier', name: 'amount' },
                                        shorthand: true,
                                    },
                                    {
                                        key: 'status',
                                        value: {
                                            kind: 'member',
                                            object: { kind: 'identifier', name: 'transfer' },
                                            property: 'status',
                                        },
                                    },
                                    {
                                        key: 'timestamp',
                                        value: {
                                            kind: 'member',
                                            object: { kind: 'identifier', name: 'transfer' },
                                            property: 'timestamp',
                                        },
                                    },
                                    {
                                        key: 'info',
                                        value: {
                                            kind: 'member',
                                            object: { kind: 'identifier', name: 'transfer' },
                                            property: 'info',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        });
    }

    // 10. Return transfer result
    statements.push({
        kind: 'return',
        expression: { kind: 'identifier', name: 'transfer' },
    });

    return statements;
}

/**
 * Build response mapping expression
 */
function buildResponseMapping(schema: WalletEndpointSchema): TSExpression {
    const responseMapping = schema.response;

    const properties: any[] = [];

    // Add path if present
    if (responseMapping.path) {
        properties.push({
            key: 'path',
            value: { kind: 'literal', value: responseMapping.path },
        });
    }

    // Add mapping
    const mappingProps = [];
    for (const [key, fieldMapping] of Object.entries(responseMapping.mapping)) {
        const fieldProps: any[] = [];

        if (fieldMapping.path) {
            fieldProps.push({
                key: 'path',
                value: { kind: 'literal', value: fieldMapping.path },
            });
        }

        if (fieldMapping.transform) {
            fieldProps.push({
                key: 'transform',
                value: { kind: 'literal', value: fieldMapping.transform },
            });
        }

        if ('default' in fieldMapping) {
            fieldProps.push({
                key: 'default',
                value: { kind: 'literal', value: fieldMapping.default },
            });
        }

        if ('literal' in fieldMapping) {
            fieldProps.push({
                key: 'literal',
                value: { kind: 'literal', value: fieldMapping.literal },
            });
        }

        mappingProps.push({
            key,
            value: { kind: 'object', properties: fieldProps },
        });
    }

    properties.push({
        key: 'mapping',
        value: { kind: 'object', properties: mappingProps },
    });

    // Add isArray if present
    if (responseMapping.isArray) {
        properties.push({
            key: 'isArray',
            value: { kind: 'literal', value: responseMapping.isArray },
        });
    }

    return { kind: 'object', properties };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate inline transfer code (for embedding in existing methods)
 */
export function generateInlineTransferCode(
    schema: WalletEndpointSchema,
    variableName: string = 'transfer'
): string {
    const statements = buildTransferMethodBody(schema, {
        includeBalanceCheck: true,
        recordTransaction: true,
    });

    // Convert statements to code strings (simplified version)
    return `// Transfer execution\n${statements.map(s => '// Statement').join('\n')}`;
}

/**
 * Validate transfer method configuration
 */
export function validateTransferConfig(
    schema: WalletEndpointSchema,
    config: TransferMethodConfig
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (schema.operation !== 'transfer') {
        errors.push(`Schema operation must be 'transfer', got '${schema.operation}'`);
    }

    if (!schema.endpoint) {
        errors.push('Schema endpoint is required');
    }

    if (!schema.method) {
        errors.push('Schema method is required');
    }

    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(schema.method)) {
        errors.push(`Invalid HTTP method: ${schema.method}`);
    }

    if (!schema.response || !schema.response.mapping) {
        errors.push('Schema response mapping is required');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ============================================================
// Withdrawal Method Generation
// ============================================================

/**
 * Withdrawal method configuration
 */
export interface WithdrawalMethodConfig {
    /** Method name */
    methodName?: string;
    /** Whether to include historical data matching */
    includeHistoricalMatching?: boolean;
    /** Exchange name for parser generation */
    exchangeName?: string;
}

/**
 * Generate a withdrawal method from wallet endpoint schema
 *
 * @param schema Wallet endpoint schema definition
 * @param config Optional method configuration
 * @returns Generated method code and metadata
 */
export function emitWithdrawalMethod(
    schema: WalletEndpointSchema,
    config: WithdrawalMethodConfig = {}
): GeneratedCode {
    const {
        methodName = 'withdraw',
        includeHistoricalMatching = false,
        exchangeName = 'generic',
    } = config;

    // Build method parameters from schema
    const params = buildWithdrawalParameters(schema);

    // Build method body
    const body = buildWithdrawalMethodBody(schema, {
        includeHistoricalMatching,
        exchangeName,
    });

    // Build JSDoc comment
    const jsDoc = buildWithdrawalJSDoc(schema);

    // Create method AST
    const method: TSMethodDeclaration = {
        kind: 'method',
        name: methodName,
        params,
        returnType: {
            kind: 'reference',
            name: 'Promise',
            typeArgs: [{
                kind: 'reference',
                name: 'WithdrawalSchema',
            }],
        },
        body,
        visibility: 'public',
        isAsync: true,
        jsDoc,
    };

    // Required imports
    const imports = [
        'WithdrawalSchema',
        'WithdrawalStatus',
        'validateWithdrawalOperation',
        'normalizeWalletResponse',
        'createWithdrawal',
        'TransactionParser',
    ];

    if (includeHistoricalMatching) {
        imports.push('matchHistoricalTransaction');
    }

    return {
        method,
        methodName,
        imports,
    };
}

/**
 * Build withdrawal method parameters
 */
function buildWithdrawalParameters(schema: WalletEndpointSchema): TSParameter[] {
    const params: TSParameter[] = [
        {
            name: 'currency',
            type: { kind: 'primitive', type: 'string' },
        },
        {
            name: 'amount',
            type: { kind: 'primitive', type: 'number' },
        },
        {
            name: 'address',
            type: { kind: 'primitive', type: 'string' },
        },
    ];

    // Optional tag parameter
    if (schema.params.tag || schema.params.memo || schema.params.addressTag) {
        params.push({
            name: 'tag',
            type: {
                kind: 'union',
                types: [
                    { kind: 'primitive', type: 'string' },
                    { kind: 'primitive', type: 'undefined' },
                ],
            },
            isOptional: true,
        });
    }

    // Optional network parameter
    if (schema.params.network) {
        params.push({
            name: 'network',
            type: {
                kind: 'union',
                types: [
                    { kind: 'primitive', type: 'string' },
                    { kind: 'primitive', type: 'undefined' },
                ],
            },
            isOptional: true,
        });
    }

    // Generic params object
    params.push({
        name: 'params',
        type: {
            kind: 'reference',
            name: 'Record',
            typeArgs: [
                { kind: 'primitive', type: 'string' },
                { kind: 'primitive', type: 'any' },
            ],
        },
        default: { kind: 'object', properties: [] },
    });

    return params;
}

/**
 * Build withdrawal method body statements
 */
function buildWithdrawalMethodBody(
    schema: WalletEndpointSchema,
    options: {
        includeHistoricalMatching: boolean;
        exchangeName: string;
    }
): TSStatement[] {
    const statements: TSStatement[] = [];

    // 1. Create withdrawal operation object
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'operation',
        type: {
            kind: 'reference',
            name: 'Partial',
            typeArgs: [{ kind: 'reference', name: 'WithdrawalSchema' }],
        },
        value: {
            kind: 'object',
            properties: [
                {
                    key: 'currency',
                    value: { kind: 'identifier', name: 'currency' },
                    shorthand: true,
                },
                {
                    key: 'amount',
                    value: { kind: 'identifier', name: 'amount' },
                    shorthand: true,
                },
                {
                    key: 'address',
                    value: { kind: 'identifier', name: 'address' },
                    shorthand: true,
                },
                {
                    key: 'tag',
                    value: { kind: 'identifier', name: 'tag' },
                    shorthand: true,
                },
                {
                    key: 'network',
                    value: { kind: 'identifier', name: 'network' },
                    shorthand: true,
                },
            ],
        },
    });

    // 2. Validate operation parameters
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'validation',
        value: {
            kind: 'call',
            callee: { kind: 'identifier', name: 'validateWithdrawalOperation' },
            args: [
                { kind: 'identifier', name: 'operation' },
                {
                    kind: 'object',
                    properties: [
                        {
                            key: 'operation',
                            value: { kind: 'literal', value: 'withdraw' },
                        },
                        {
                            key: 'endpoint',
                            value: { kind: 'literal', value: schema.endpoint },
                        },
                        {
                            key: 'method',
                            value: { kind: 'literal', value: schema.method },
                        },
                        {
                            key: 'params',
                            value: { kind: 'identifier', name: 'params' },
                        },
                        {
                            key: 'response',
                            value: {
                                kind: 'object',
                                properties: [
                                    {
                                        key: 'mapping',
                                        value: { kind: 'object', properties: [] },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    });

    // 3. Throw error if validation fails
    statements.push({
        kind: 'if',
        test: {
            kind: 'unary',
            operator: '!',
            operand: {
                kind: 'member',
                object: { kind: 'identifier', name: 'validation' },
                property: 'valid',
            },
        },
        consequent: [
            {
                kind: 'variable',
                keyword: 'const',
                name: 'errorMessages',
                value: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'validation' },
                            property: 'errors',
                        },
                        property: 'map',
                    },
                    args: [
                        {
                            kind: 'arrow',
                            params: [{ name: 'e' }],
                            body: {
                                kind: 'member',
                                object: { kind: 'identifier', name: 'e' },
                                property: 'message',
                            },
                        },
                    ],
                },
            },
            {
                kind: 'throw',
                argument: {
                    kind: 'new',
                    callee: { kind: 'identifier', name: 'Error' },
                    args: [
                        {
                            kind: 'binary',
                            left: { kind: 'literal', value: 'Withdrawal validation failed: ' },
                            operator: '+',
                            right: {
                                kind: 'call',
                                callee: {
                                    kind: 'member',
                                    object: { kind: 'identifier', name: 'errorMessages' },
                                    property: 'join',
                                },
                                args: [{ kind: 'literal', value: ', ' }],
                            },
                        },
                    ],
                },
            },
        ],
    });

    // 4. Build request parameters
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'request',
        value: {
            kind: 'object',
            properties: [
                {
                    key: 'currency',
                    value: { kind: 'identifier', name: 'currency' },
                    shorthand: true,
                },
                {
                    key: 'amount',
                    value: { kind: 'identifier', name: 'amount' },
                    shorthand: true,
                },
                {
                    key: 'address',
                    value: { kind: 'identifier', name: 'address' },
                    shorthand: true,
                },
                {
                    key: 'tag',
                    value: { kind: 'identifier', name: 'tag' },
                    shorthand: true,
                },
                {
                    key: 'network',
                    value: { kind: 'identifier', name: 'network' },
                    shorthand: true,
                },
                {
                    key: 'params',
                    spread: true,
                    value: { kind: 'identifier', name: 'params' },
                },
            ],
        },
    });

    // 5. Execute API request
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'response',
        value: {
            kind: 'await',
            expression: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: schema.method.toLowerCase() + 'Private',
                },
                args: [
                    { kind: 'literal', value: schema.endpoint },
                    { kind: 'identifier', name: 'request' },
                ],
            },
        },
    });

    // 6. Create transaction parser
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'parser',
        value: {
            kind: 'new',
            callee: { kind: 'identifier', name: 'TransactionParser' },
            args: [
                {
                    kind: 'object',
                    properties: [],
                },
            ],
        },
    });

    // 7. Normalize response
    statements.push({
        kind: 'variable',
        keyword: 'const',
        name: 'normalized',
        value: {
            kind: 'call',
            callee: { kind: 'identifier', name: 'normalizeWalletResponse' },
            args: [
                { kind: 'identifier', name: 'response' },
                {
                    kind: 'object',
                    properties: [
                        {
                            key: 'operation',
                            value: { kind: 'literal', value: 'withdraw' },
                        },
                        {
                            key: 'endpoint',
                            value: { kind: 'literal', value: schema.endpoint },
                        },
                        {
                            key: 'method',
                            value: { kind: 'literal', value: schema.method },
                        },
                        {
                            key: 'params',
                            value: { kind: 'object', properties: [] },
                        },
                        {
                            key: 'response',
                            value: buildResponseMapping(schema),
                        },
                    ],
                },
            ],
        },
    });

    // 8. Historical data matching (if enabled and array response)
    if (options.includeHistoricalMatching && schema.response.isArray) {
        statements.push({
            kind: 'variable',
            keyword: 'const',
            name: 'matched',
            value: {
                kind: 'call',
                callee: { kind: 'identifier', name: 'matchHistoricalTransaction' },
                args: [
                    { kind: 'identifier', name: 'normalized' },
                    {
                        kind: 'object',
                        properties: [
                            {
                                key: 'currency',
                                value: { kind: 'identifier', name: 'currency' },
                                shorthand: true,
                            },
                            {
                                key: 'amount',
                                value: { kind: 'identifier', name: 'amount' },
                                shorthand: true,
                            },
                            {
                                key: 'address',
                                value: { kind: 'identifier', name: 'address' },
                                shorthand: true,
                            },
                        ],
                    },
                ],
            },
        });

        // Use matched result
        statements.push({
            kind: 'variable',
            keyword: 'const',
            name: 'withdrawal',
            value: {
                kind: 'call',
                callee: { kind: 'identifier', name: 'createWithdrawal' },
                args: [
                    {
                        kind: 'binary',
                        operator: '??',
                        left: { kind: 'identifier', name: 'matched' },
                        right: { kind: 'identifier', name: 'normalized' },
                    },
                ],
            },
        });
    } else {
        // Direct creation
        statements.push({
            kind: 'variable',
            keyword: 'const',
            name: 'withdrawal',
            value: {
                kind: 'call',
                callee: { kind: 'identifier', name: 'createWithdrawal' },
                args: [{ kind: 'identifier', name: 'normalized' }],
            },
        });
    }

    // 9. Return withdrawal result
    statements.push({
        kind: 'return',
        expression: { kind: 'identifier', name: 'withdrawal' },
    });

    return statements;
}

/**
 * Build JSDoc comment for withdrawal method
 */
function buildWithdrawalJSDoc(schema: WalletEndpointSchema): JSDocComment {
    return {
        description: 'Withdraw cryptocurrency to an external address',
        tags: [
            {
                tag: 'param',
                type: 'string',
                name: 'currency',
                description: 'Currency code to withdraw',
            },
            {
                tag: 'param',
                type: 'number',
                name: 'amount',
                description: 'Amount to withdraw',
            },
            {
                tag: 'param',
                type: 'string',
                name: 'address',
                description: 'Destination address',
            },
            {
                tag: 'param',
                type: 'string',
                name: 'tag',
                description: 'Optional address tag/memo',
            },
            {
                tag: 'param',
                type: 'string',
                name: 'network',
                description: 'Optional network identifier (e.g., ERC20, TRC20)',
            },
            {
                tag: 'param',
                type: 'object',
                name: 'params',
                description: 'Additional exchange-specific parameters',
            },
            {
                tag: 'returns',
                type: 'Promise<WithdrawalSchema>',
                description: 'Withdrawal transaction details with status and txid',
            },
            {
                tag: 'throws',
                type: 'Error',
                description: 'If withdrawal validation or processing fails',
            },
        ],
    };
}

/**
 * Validate withdrawal method configuration
 */
export function validateWithdrawalConfig(
    schema: WalletEndpointSchema,
    config: WithdrawalMethodConfig
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (schema.operation !== 'withdraw') {
        errors.push(`Schema operation must be 'withdraw', got '${schema.operation}'`);
    }

    if (!schema.endpoint) {
        errors.push('Schema endpoint is required');
    }

    if (!schema.method) {
        errors.push('Schema method is required');
    }

    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(schema.method)) {
        errors.push(`Invalid HTTP method: ${schema.method}`);
    }

    if (!schema.response || !schema.response.mapping) {
        errors.push('Schema response mapping is required');
    }

    // Validate required parameters
    const requiredParams = ['currency', 'amount', 'address'];
    for (const param of requiredParams) {
        if (!schema.params[param]) {
            errors.push(`Required parameter '${param}' is missing from schema`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
