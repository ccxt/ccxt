/**
 * EDL Code Generator
 * Transforms EDL documents into TypeScript code
 */

import * as path from 'path';
import type {
    EDLDocument,
    ParserDefinition,
    FieldMapping,
    AuthMethod,
    APIDefinition,
    APICategory,
    EndpointDefinition,
    ParamDefinition,
} from '../types/edl.js';
import { resolveComputeOrder } from '../helpers/mapping-dependencies.js';
import { deriveHasFlags } from '../helpers/has-flags.js';
import { parseOverrideFile, convertToClassMethod, shouldSkipGeneratedMethod } from '../helpers/override-parser.js';
import type {
    TSFile,
    TSImport,
    TSClassDeclaration,
    TSMethodDeclaration,
    TSStatement,
    TSExpression,
    TSParameter,
    TSType,
    TSObjectProperty,
    JSDocComment,
} from '../types/ast.js';

export interface GeneratorOptions {
    includeComments?: boolean;
    targetPath?: string;
    baseClass?: string;
    overridesDir?: string;
}

export function generateExchange(doc: EDLDocument, options: GeneratorOptions = {}): TSFile {
    const baseClass = options.baseClass || 'Exchange';

    const imports = generateImports(doc, baseClass);
    const classDecl = generateClass(doc, baseClass, options);

    return {
        imports,
        statements: [classDecl],
    };
}

function generateImports(doc: EDLDocument, baseClass: string): TSImport[] {
    const imports: TSImport[] = [];

    // Base exchange import
    imports.push({
        names: [baseClass],
        from: './base/Exchange.js',
    });

    // Check if Precise is used in any compute expressions
    if (usesPrecise(doc)) {
        imports.push({
            names: ['Precise'],
            from: './base/Precise.js',
        });
    }

    // Type imports
    const types: string[] = ['Dict', 'Int', 'Num', 'Str'];

    if (doc.parsers?.ticker) {
        types.push('Ticker');
    }
    if (doc.parsers?.orderBook || doc.parsers?.orderbook) {
        types.push('OrderBook');
    }
    if (doc.parsers?.trade || doc.parsers?.trades) {
        types.push('Trade');
    }
    if (doc.parsers?.order) {
        types.push('Order');
    }
    if (doc.parsers?.balance) {
        types.push('Balances');
    }
    if (doc.parsers?.ohlcv) {
        types.push('OHLCV');
    }
    if (doc.parsers?.market) {
        types.push('Market');
    }

    imports.push({
        names: types,
        from: './base/types.js',
        isType: true,
    });

    return imports;
}

function generateClass(doc: EDLDocument, baseClass: string, options: GeneratorOptions): TSClassDeclaration {
    const members: any[] = [];

    // Collect override method names to skip during generation
    const overrideMethodNames: string[] = [];
    if (doc.overrides) {
        for (const override of doc.overrides) {
            overrideMethodNames.push(override.method);
        }
    }

    // Generate describe() method
    if (!shouldSkipGeneratedMethod('describe', overrideMethodNames)) {
        members.push(generateDescribe(doc, options));
    }

    // Generate sign() method if auth is defined
    if (doc.auth && !shouldSkipGeneratedMethod('sign', overrideMethodNames)) {
        members.push(generateSign(doc.auth, doc.exchange.id, options));
    }

    // Generate parser methods
    if (doc.parsers) {
        for (const [name, parser] of Object.entries(doc.parsers)) {
            if (!shouldSkipGeneratedMethod(name, overrideMethodNames)) {
                members.push(generateParser(name, parser, options));
            }
        }
    }

    // Generate fetch methods from API definition
    if (doc.api) {
        const fetchMethods = generateFetchMethods(doc, options);
        members.push(...fetchMethods);
        const apiHelpers = generateApiHelperMethods(doc, options);
        members.push(...apiHelpers);
    }

    // Add override methods from override files
    if (doc.overrides && doc.overrides.length > 0) {
        const overrideMethods = generateOverrideMethods(doc, options);
        members.push(...overrideMethods);
    }

    return {
        kind: 'class',
        name: capitalize(doc.exchange.id),
        extends: baseClass,
        members,
        isExport: true,
        isDefault: true,
    };
}

function generateOverrideMethods(doc: EDLDocument, options: GeneratorOptions): TSClassDeclaration['members'] {
    const members: any[] = [];

    if (!doc.overrides || doc.overrides.length === 0) {
        return members;
    }

    // Determine overrides directory
    const overridesDir = options.overridesDir || path.join(process.cwd(), '../overrides');

    for (const override of doc.overrides) {
        try {
            // Construct path to override file
            const overrideFilePath = path.join(overridesDir, override.file);

            // Parse the override file
            const parsedOverrides = parseOverrideFile(overrideFilePath);

            // Find the specific method we're looking for
            const methodOverride = parsedOverrides.find(o => o.methodName === override.method);

            if (methodOverride) {
                // Convert the exported function to a class method
                const classMethodCode = convertToClassMethod(methodOverride);

                // Create a raw class member with the code
                members.push({
                    kind: 'raw',
                    code: classMethodCode,
                });
            }
        } catch (error) {
            console.warn(`Warning: Could not load override for ${override.method} from ${override.file}: ${error}`);
        }
    }

    return members;
}

function generateDescribe(doc: EDLDocument, options: GeneratorOptions): TSMethodDeclaration {
    const exchange = doc.exchange;

    // Build the describe object
    const describeObj: TSObjectProperty[] = [
        prop('id', literal(exchange.id)),
        prop('name', literal(exchange.name)),
        prop('countries', arrayLit(exchange.countries.map(c => literal(c)))),
        prop('rateLimit', literal(exchange.rateLimit)),
    ];

    if (exchange.version) {
        describeObj.push(prop('version', literal(exchange.version)));
    }

    if (exchange.certified !== undefined) {
        describeObj.push(prop('certified', literal(exchange.certified)));
    }

    if (exchange.pro !== undefined) {
        describeObj.push(prop('pro', literal(exchange.pro)));
    }

    // URLs
    if (exchange.urls) {
        describeObj.push(prop('urls', objectFromRecord(exchange.urls)));
    }

    // API structure
    if (doc.api) {
        describeObj.push(prop('api', generateAPIStructure(doc.api)));
    }

    // Has capabilities
    const hasObj = generateHasObject(doc);
    describeObj.push(prop('has', hasObj));

    // Timeframes
    if (exchange.timeframes) {
        describeObj.push(prop('timeframes', objectFromRecord(exchange.timeframes)));
    }

    // Required credentials
    if (exchange.requiredCredentials) {
        describeObj.push(prop('requiredCredentials', objectFromRecord(exchange.requiredCredentials)));
    }

    // Common currencies (for currency code conversion like XXRP -> XRP)
    if (exchange.commonCurrencies) {
        describeObj.push(prop('commonCurrencies', objectFromRecord(exchange.commonCurrencies)));
    }

    return {
        kind: 'method',
        name: 'describe',
        params: [],
        returnType: { kind: 'primitive', type: 'object' },
        body: [{
            kind: 'return',
            expression: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: 'deepExtend',
                },
                args: [
                    {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'super' },
                            property: 'describe',
                        },
                        args: [],
                    },
                    {
                        kind: 'object',
                        properties: describeObj,
                    }
                ],
            }
        }],
        jsDoc: options.includeComments ? {
            description: 'Returns the exchange description object',
            tags: [{ tag: 'returns', type: 'object', description: 'Exchange configuration' }],
        } : undefined,
    };
}

function generateSign(auth: AuthMethod, exchangeId: string, options: GeneratorOptions): TSMethodDeclaration {
    const body: TSStatement[] = [];

    // Build URL
    body.push({
        kind: 'variable',
        keyword: 'let',
        name: 'url',
        value: {
            kind: 'binary',
            operator: '+',
            left: {
                kind: 'member',
                object: {
                    kind: 'member',
                    object: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'urls',
                    },
                    property: 'api',
                },
                property: 'api',
                computed: true,
            },
            right: {
                kind: 'binary',
                operator: '+',
                left: literal('/'),
                right: { kind: 'identifier', name: 'path' },
            },
        },
    });

    // Initialize signedHeaders and signedBody
    body.push({
        kind: 'variable',
        keyword: 'let',
        name: 'signedHeaders',
        type: { kind: 'reference', name: 'Dict' },
        value: { kind: 'identifier', name: 'undefined' },
    });

    body.push({
        kind: 'variable',
        keyword: 'let',
        name: 'signedBody',
        type: { kind: 'union', types: [{ kind: 'primitive', type: 'string' }, { kind: 'primitive', type: 'undefined' }] },
        value: { kind: 'identifier', name: 'undefined' },
    });

    // Generate auth-specific logic
    const authBody = generateAuthLogic(auth, exchangeId);
    body.push(...authBody);

    // Return statement
    body.push({
        kind: 'return',
        expression: {
            kind: 'object',
            properties: [
                prop('url', { kind: 'identifier', name: 'url' }),
                prop('method', { kind: 'identifier', name: 'method' }),
                prop('body', { kind: 'identifier', name: 'signedBody' }),
                prop('headers', { kind: 'identifier', name: 'signedHeaders' }),
            ],
        },
    });

    return {
        kind: 'method',
        name: 'sign',
        params: [
            { name: 'path', type: { kind: 'primitive', type: 'string' } },
            { name: 'api', type: { kind: 'primitive', type: 'string' }, default: literal('public') },
            { name: 'method', type: { kind: 'primitive', type: 'string' }, default: literal('GET') },
            { name: 'params', type: { kind: 'primitive', type: 'object' }, default: { kind: 'object', properties: [] } },
            { name: 'headers', type: { kind: 'primitive', type: 'any' }, default: { kind: 'identifier', name: 'undefined' } },
            { name: 'body', type: { kind: 'primitive', type: 'any' }, default: { kind: 'identifier', name: 'undefined' } },
        ],
        body,
        jsDoc: options.includeComments ? {
            description: 'Sign API request with authentication credentials',
            tags: [
                { tag: 'param', name: 'path', type: 'string', description: 'Endpoint path' },
                { tag: 'param', name: 'api', type: 'string', description: 'API type (public/private)' },
                { tag: 'param', name: 'method', type: 'string', description: 'HTTP method' },
                { tag: 'param', name: 'params', type: 'object', description: 'Request parameters' },
                { tag: 'returns', type: 'object', description: 'Signed request' },
            ],
        } : undefined,
    };
}

function generateAuthLogic(auth: AuthMethod, exchangeId: string): TSStatement[] {
    const statements: TSStatement[] = [];

    // Check if private endpoint
    const privateCheck: TSStatement = {
        kind: 'if',
        test: {
            kind: 'binary',
            operator: '===',
            left: { kind: 'identifier', name: 'api' },
            right: literal('private'),
        },
        consequent: [],
    };

    const privateBody: TSStatement[] = [];

    // Check credentials
    privateBody.push({
        kind: 'expression',
        expression: {
            kind: 'call',
            callee: {
                kind: 'member',
                object: { kind: 'this' },
                property: 'checkRequiredCredentials',
            },
            args: [],
        },
    });

    // Build nonce/timestamp
    if (auth.timestampField || auth.nonceField) {
        const field = auth.timestampField || auth.nonceField || 'timestamp';
        privateBody.push({
            kind: 'variable',
            keyword: 'const',
            name: 'nonce',
            value: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: 'nonce',
                },
                args: [],
            },
        });
    }

    // Generate signature based on auth type
    switch (auth.type) {
        case 'hmac':
            privateBody.push(...generateHMACAuth(auth));
            break;
        case 'jwt':
            privateBody.push(...generateJWTAuth(auth));
            break;
        case 'apiKey':
            privateBody.push(...generateAPIKeyAuth(auth));
            break;
        default:
            // Default HMAC-like behavior
            privateBody.push(...generateHMACAuth(auth));
    }

    (privateCheck as any).consequent = privateBody;

    // Public endpoint handling
    const publicBody: TSStatement[] = [{
        kind: 'if',
        test: {
            kind: 'binary',
            operator: '>',
            left: {
                kind: 'member',
                object: {
                    kind: 'call',
                    callee: { kind: 'identifier', name: 'Object.keys' },
                    args: [{ kind: 'identifier', name: 'params' }],
                },
                property: 'length',
            },
            right: literal(0),
        },
        consequent: [{
            kind: 'expression',
            expression: {
                kind: 'assignment',
                operator: '+=',
                left: { kind: 'identifier', name: 'url' },
                right: {
                    kind: 'binary',
                    operator: '+',
                    left: literal('?'),
                    right: {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: 'urlencode',
                        },
                        args: [{ kind: 'identifier', name: 'params' }],
                    },
                },
            },
        }],
    }];

    (privateCheck as any).alternate = publicBody;

    statements.push(privateCheck);

    return statements;
}

function generateHMACAuth(auth: AuthMethod): TSStatement[] {
    const algorithm = auth.algorithm || 'sha256';
    const encoding = auth.encoding || 'hex';

    return [
        // Build query string
        {
            kind: 'variable',
            keyword: 'const',
            name: 'query',
            value: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: 'urlencode',
                },
                args: [{
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'extend',
                    },
                    args: [
                        { kind: 'object', properties: [prop('timestamp', { kind: 'identifier', name: 'nonce' })] },
                        { kind: 'identifier', name: 'params' },
                    ],
                }],
            },
        },
        // Generate signature
        {
            kind: 'variable',
            keyword: 'const',
            name: 'signature',
            value: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: 'hmac',
                },
                args: [
                    {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: 'encode',
                        },
                        args: [{ kind: 'identifier', name: 'query' }],
                    },
                    {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: 'encode',
                        },
                        args: [{
                            kind: 'member',
                            object: { kind: 'this' },
                            property: 'secret',
                        }],
                    },
                    literal(algorithm),
                ],
            },
        },
        // Set headers
        {
            kind: 'expression',
            expression: {
                kind: 'assignment',
                operator: '=',
                left: { kind: 'identifier', name: 'signedHeaders' },
                right: {
                    kind: 'object',
                    properties: [
                        prop('X-API-KEY', { kind: 'member', object: { kind: 'this' }, property: 'apiKey' }),
                    ],
                },
            },
        },
        // Set URL or body based on method
        {
            kind: 'if',
            test: {
                kind: 'binary',
                operator: '||',
                left: {
                    kind: 'binary',
                    operator: '===',
                    left: { kind: 'identifier', name: 'method' },
                    right: literal('GET'),
                },
                right: {
                    kind: 'binary',
                    operator: '===',
                    left: { kind: 'identifier', name: 'method' },
                    right: literal('DELETE'),
                },
            },
            consequent: [{
                kind: 'expression',
                expression: {
                    kind: 'assignment',
                    operator: '+=',
                    left: { kind: 'identifier', name: 'url' },
                    right: {
                        kind: 'binary',
                        operator: '+',
                        left: literal('?'),
                        right: {
                            kind: 'binary',
                            operator: '+',
                            left: { kind: 'identifier', name: 'query' },
                            right: {
                                kind: 'binary',
                                operator: '+',
                                left: literal('&signature='),
                                right: { kind: 'identifier', name: 'signature' },
                            },
                        },
                    },
                },
            }],
            alternate: [{
                kind: 'expression',
                expression: {
                    kind: 'assignment',
                    operator: '=',
                    left: { kind: 'identifier', name: 'signedBody' },
                    right: {
                        kind: 'binary',
                        operator: '+',
                        left: { kind: 'identifier', name: 'query' },
                        right: {
                            kind: 'binary',
                            operator: '+',
                            left: literal('&signature='),
                            right: { kind: 'identifier', name: 'signature' },
                        },
                    },
                },
            }, {
                kind: 'expression',
                expression: {
                    kind: 'assignment',
                    operator: '=',
                    left: {
                        kind: 'member',
                        object: { kind: 'identifier', name: 'signedHeaders' },
                        property: 'Content-Type',
                        computed: true,
                    },
                    right: literal('application/x-www-form-urlencoded'),
                },
            }],
        },
    ] as any[];
}

function generateJWTAuth(auth: AuthMethod): TSStatement[] {
    return [
        {
            kind: 'variable',
            keyword: 'const',
            name: 'token',
            value: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: 'jwt',
                },
                args: [
                    { kind: 'identifier', name: 'params' },
                    {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'secret',
                    },
                ],
            },
        },
        {
            kind: 'expression',
            expression: {
                kind: 'assignment',
                operator: '=',
                left: { kind: 'identifier', name: 'signedHeaders' },
                right: {
                    kind: 'object',
                    properties: [
                        prop('Authorization', {
                            kind: 'binary',
                            operator: '+',
                            left: literal('Bearer '),
                            right: { kind: 'identifier', name: 'token' },
                        }),
                    ],
                },
            },
        },
    ] as any[];
}

function generateAPIKeyAuth(auth: AuthMethod): TSStatement[] {
    const headerName = auth.headers?.['apiKey'] || 'X-API-KEY';

    return [
        {
            kind: 'expression',
            expression: {
                kind: 'assignment',
                operator: '=',
                left: { kind: 'identifier', name: 'signedHeaders' },
                right: {
                    kind: 'object',
                    properties: [
                        {
                            key: headerName,
                            value: { kind: 'member', object: { kind: 'this' }, property: 'apiKey' },
                        },
                    ],
                },
            },
        },
        {
            kind: 'if',
            test: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: {
                        kind: 'call',
                        callee: { kind: 'identifier', name: 'Object.keys' },
                        args: [{ kind: 'identifier', name: 'params' }],
                    },
                    property: 'length',
                },
                args: [],
            },
            consequent: [{
                kind: 'expression',
                expression: {
                    kind: 'assignment',
                    operator: '+=',
                    left: { kind: 'identifier', name: 'url' },
                    right: {
                        kind: 'binary',
                        operator: '+',
                        left: literal('?'),
                        right: {
                            kind: 'call',
                            callee: {
                                kind: 'member',
                                object: { kind: 'this' },
                                property: 'urlencode',
                            },
                            args: [{ kind: 'identifier', name: 'params' }],
                        },
                    },
                },
            }],
        },
    ] as any[];
}

function generateParser(name: string, parser: ParserDefinition, options: GeneratorOptions): TSMethodDeclaration {
    const methodName = `parse${capitalize(name)}`;
    const body: TSStatement[] = [];

    body.push({
        kind: 'variable',
        keyword: 'const',
        name: 'rawData',
        value: { kind: 'identifier', name: 'response' },
    });

    // Collect context variables from mapping AND from parser path placeholders
    const contextVars = collectContextVariables(parser.mapping);

    // Also extract placeholders from parser path (e.g., {marketId})
    if (parser.path) {
        const placeholders = parser.path.match(/\{([^}]+)\}/g);
        if (placeholders) {
            for (const p of placeholders) {
                const varName = p.slice(1, -1); // Remove { }
                contextVars.add(varName);
            }
        }
    }

    // For iterator parsers, identify iterator context variables
    // These are from_context variables that come from iteration (like tradeId, currencyId, value)
    const iteratorContextVars = getIteratorContextVariables(parser);

    // Remove iterator context vars from main context vars (they're set in the loop)
    for (const iterVar of iteratorContextVars) {
        contextVars.delete(iterVar);
    }

    // Add context variable initializers BEFORE data extraction
    // because the path may reference them (e.g., result.{marketId})
    body.push(...generateContextInitializers(contextVars));

    // Resolve parser source payload
    body.push(createDataInitializer(parser.path));

    // Determine iterator mode: explicit iterator, legacy isArray, or single object
    const iteratorMode = parser.iterator || (parser.isArray ? 'array' : undefined);
    const isBalanceStructure = (parser as any).structure === 'balance';

    if (iteratorMode === 'array') {
        // Array iteration mode
        body.push({
            kind: 'variable',
            keyword: 'const',
            name: 'items',
            value: createEnsureArrayExpression('data'),
        });

        const mapStatements = buildResultObjectStatements('item', 'entry', parser, true, false);
        body.push({
            kind: 'variable',
            keyword: parser.postProcess?.length && !isBalanceStructure ? 'let' : 'const',
            name: isBalanceStructure ? 'balances' : 'results',
            value: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'identifier', name: 'items' },
                    property: 'map',
                },
                args: [{
                    kind: 'arrow',
                    params: [{ name: 'item' }],
                    body: mapStatements,
                }],
            },
        });

        if (isBalanceStructure) {
            // Create the balance structure
            body.push({
                kind: 'variable',
                keyword: 'const',
                name: 'result',
                value: {
                    kind: 'object',
                    properties: [
                        { key: 'info', value: { kind: 'identifier', name: 'rawData' } },
                        { key: 'timestamp', value: { kind: 'literal', value: null } },
                        { key: 'datetime', value: { kind: 'literal', value: null } },
                    ],
                },
            });

            // Loop over balances and populate result
            body.push({
                kind: 'forOf',
                left: {
                    kind: 'variable',
                    keyword: 'const',
                    name: 'balance',
                },
                right: { kind: 'identifier', name: 'balances' },
                body: [
                    {
                        kind: 'variable',
                        keyword: 'const',
                        name: 'currency',
                        value: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'balance' },
                            property: 'currency',
                        },
                    },
                    {
                        kind: 'expression',
                        expression: {
                            kind: 'assignment',
                            operator: '=',
                            left: {
                                kind: 'member',
                                object: { kind: 'identifier', name: 'result' },
                                property: { kind: 'identifier', name: 'currency' },
                                computed: true,
                            },
                            right: {
                                kind: 'object',
                                properties: [
                                    { key: 'free', value: { kind: 'member', object: { kind: 'identifier', name: 'balance' }, property: 'free' } },
                                    { key: 'used', value: { kind: 'member', object: { kind: 'identifier', name: 'balance' }, property: 'used' } },
                                    { key: 'total', value: { kind: 'member', object: { kind: 'identifier', name: 'balance' }, property: 'total' } },
                                ],
                            },
                        },
                    },
                ],
            });

            // Return this.safeBalance(result)
            body.push({
                kind: 'return',
                expression: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'safeBalance',
                    },
                    args: [{ kind: 'identifier', name: 'result' }],
                },
            });
        } else {
            applyPostProcess(body, parser, 'results');
            body.push({
                kind: 'return',
                expression: { kind: 'identifier', name: 'results' },
            });
        }
    } else if (iteratorMode === 'entries') {
        // Object.entries iteration mode - iterate over {key: value} pairs
        // Identifies what context variables to extract from key/value
        const keyVarName = getEntriesKeyVarName(parser);

        const mapStatements = buildResultObjectStatementsForEntries('_value', 'entry', parser, true, false, keyVarName);
        body.push({
            kind: 'variable',
            keyword: 'const',
            name: isBalanceStructure ? 'balances' : 'results',
            value: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'Object' },
                            property: 'entries',
                        },
                        args: [{ kind: 'identifier', name: 'data' }],
                    },
                    property: 'map',
                },
                args: [{
                    kind: 'arrow',
                    params: [{ name: `[${keyVarName}, _value]`, isDestructured: true }],
                    body: mapStatements,
                }],
            },
        });

        if (isBalanceStructure) {
            // Create the balance structure
            body.push({
                kind: 'variable',
                keyword: 'const',
                name: 'result',
                value: {
                    kind: 'object',
                    properties: [
                        { key: 'info', value: { kind: 'identifier', name: 'rawData' } },
                        { key: 'timestamp', value: { kind: 'literal', value: null } },
                        { key: 'datetime', value: { kind: 'literal', value: null } },
                    ],
                },
            });

            // Loop over balances and populate result
            body.push({
                kind: 'forOf',
                left: {
                    kind: 'variable',
                    keyword: 'const',
                    name: 'balance',
                },
                right: { kind: 'identifier', name: 'balances' },
                body: [
                    {
                        kind: 'variable',
                        keyword: 'const',
                        name: 'currency',
                        value: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'balance' },
                            property: 'currency',
                        },
                    },
                    {
                        kind: 'expression',
                        expression: {
                            kind: 'assignment',
                            operator: '=',
                            left: {
                                kind: 'member',
                                object: { kind: 'identifier', name: 'result' },
                                property: { kind: 'identifier', name: 'currency' },
                                computed: true,
                            },
                            right: {
                                kind: 'object',
                                properties: [
                                    { key: 'free', value: { kind: 'member', object: { kind: 'identifier', name: 'balance' }, property: 'free' } },
                                    { key: 'used', value: { kind: 'member', object: { kind: 'identifier', name: 'balance' }, property: 'used' } },
                                    { key: 'total', value: { kind: 'member', object: { kind: 'identifier', name: 'balance' }, property: 'total' } },
                                ],
                            },
                        },
                    },
                ],
            });

            // Return this.safeBalance(result)
            body.push({
                kind: 'return',
                expression: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'safeBalance',
                    },
                    args: [{ kind: 'identifier', name: 'result' }],
                },
            });
        } else {
            applyPostProcess(body, parser, 'results');
            body.push({
                kind: 'return',
                expression: { kind: 'identifier', name: 'results' },
            });
        }
    } else if (iteratorMode === 'values') {
        // Object.values iteration mode
        const mapStatements = buildResultObjectStatements('_value', 'entry', parser, true, false);
        body.push({
            kind: 'variable',
            keyword: parser.postProcess?.length ? 'let' : 'const',
            name: 'results',
            value: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'Object' },
                            property: 'values',
                        },
                        args: [{ kind: 'identifier', name: 'data' }],
                    },
                    property: 'map',
                },
                args: [{
                    kind: 'arrow',
                    params: [{ name: '_value' }],
                    body: mapStatements,
                }],
            },
        });

        applyPostProcess(body, parser, 'results');
        body.push({
            kind: 'return',
            expression: { kind: 'identifier', name: 'results' },
        });
    } else {
        // Single object mode (no iteration)
        body.push(...buildResultObjectStatements('data', 'result', parser, false, Boolean(parser.postProcess?.length)));
        applyPostProcess(body, parser, 'result');
        body.push({
            kind: 'return',
            expression: { kind: 'identifier', name: 'result' },
        });
    }

    return {
        kind: 'method',
        name: methodName,
        params: [
            { name: 'response', type: { kind: 'primitive', type: 'any' } },
            { name: 'market', type: { kind: 'primitive', type: 'any' }, isOptional: true },
        ],
        body,
        jsDoc: options.includeComments ? {
            description: `Parse ${name} response`,
            tags: [
                { tag: 'param', name: 'response', type: 'object', description: 'API response' },
                { tag: 'returns', type: 'object', description: `Parsed ${name}` },
            ],
        } : undefined,
    };
}

/**
 * Get context variables that come from iterator (entries key/value, array item)
 * These should NOT be initialized before iteration - they're set in the loop
 */
function getIteratorContextVariables(parser: ParserDefinition): Set<string> {
    const vars = new Set<string>();
    if (parser.iterator === 'entries') {
        // Find all from_context variables used in this parser
        for (const [_, mapping] of Object.entries(parser.mapping)) {
            if (typeof mapping === 'object' && mapping !== null) {
                const ctxVar = (mapping as any).fromContext || (mapping as any).from_context;
                if (ctxVar) {
                    // Common iterator context variables for entries mode
                    // The key variable (tradeId, currencyId, orderId, etc.)
                    // and 'value' for the object value
                    if (ctxVar === 'value' || ctxVar.endsWith('Id')) {
                        vars.add(ctxVar);
                    }
                }
            }
        }
    }
    return vars;
}

/**
 * Extract the key variable name for entries iteration from parser mappings
 * Looks for from_context variables that end with 'Id' (tradeId, currencyId, etc.)
 */
function getEntriesKeyVarName(parser: ParserDefinition): string {
    for (const [_, mapping] of Object.entries(parser.mapping)) {
        if (typeof mapping === 'object' && mapping !== null) {
            const ctxVar = (mapping as any).fromContext || (mapping as any).from_context;
            if (ctxVar && ctxVar.endsWith('Id') && ctxVar !== 'marketId' && ctxVar !== 'orderId') {
                return ctxVar;
            }
        }
    }
    // Default to 'key' if no specific *Id variable found
    return 'key';
}

/**
 * Build result object statements for entries iteration mode
 * Handles the key variable (like tradeId, currencyId) and value destructuring
 */
function buildResultObjectStatementsForEntries(
    dataVar: string,
    resultVar: string,
    parser: ParserDefinition,
    includeReturn: boolean,
    mutable: boolean,
    keyVarName: string
): TSStatement[] {
    const statements: TSStatement[] = [];
    const computeFields = new Map<string, string>();

    // Collect all fields and identify which are computed
    for (const [field, mapping] of Object.entries(parser.mapping)) {
        if ('compute' in mapping) {
            computeFields.set(field, mapping.compute);
        }
    }

    // Build nested object structure for entries mode
    const resultObject = buildNestedObjectStructureForEntries(
        parser.mapping,
        dataVar,
        computeFields,
        keyVarName
    );

    statements.push({
        kind: 'variable',
        keyword: mutable ? 'let' : 'const',
        name: resultVar,
        value: resultObject,
    });

    const orderedComputeFields = resolveComputeOrder(parser.mapping).filter(field =>
        computeFields.has(field)
    );

    // Collect all field names for reference substitution in compute expressions
    const mappingFieldNames = new Set(Object.keys(parser.mapping));

    // Generate assignments for computed fields
    for (const fieldName of orderedComputeFields) {
        const computeExpression = computeFields.get(fieldName);
        if (!computeExpression) continue;

        // For nested properties like 'precision.amount', create proper nested access
        const assignmentLeft = createNestedMemberAccess(resultVar, fieldName);

        // Build compute expression (may include setup statements for IIFEs)
        const computeResult = buildComputeExpression(computeExpression, resultVar, mappingFieldNames, dataVar);

        // Add any setup statements first
        statements.push(...computeResult.statements);

        // Then add the assignment
        statements.push({
            kind: 'expression',
            expression: {
                kind: 'assignment',
                operator: '=',
                left: assignmentLeft,
                right: computeResult.expression,
            },
        });
    }

    if (includeReturn) {
        statements.push({
            kind: 'return',
            expression: { kind: 'identifier', name: resultVar },
        });
    }

    return statements;
}

/**
 * Build a nested object structure for entries iteration mode
 * Similar to buildNestedObjectStructure but handles entries-specific context variables
 */
function buildNestedObjectStructureForEntries(
    mapping: Record<string, FieldMapping>,
    dataVar: string,
    computeFields: Map<string, string>,
    keyVarName: string
): TSExpression {
    const root: any = {};

    // First, organize fields into a nested structure
    for (const [field, fieldMapping] of Object.entries(mapping)) {
        // Skip computed fields - they'll be assigned after object creation
        if (computeFields.has(field)) {
            // But we need to ensure parent objects exist
            const parts = field.split('.');
            if (parts.length > 1) {
                // Create parent objects
                let current = root;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) {
                        current[parts[i]] = {};
                    }
                    current = current[parts[i]];
                }
            }
            continue;
        }

        // Generate the field value based on mapping type
        let fieldValue: TSExpression;

        if ('fromContext' in fieldMapping || 'from_context' in fieldMapping) {
            const ctxVar = (fieldMapping as any).fromContext || (fieldMapping as any).from_context;
            if (ctxVar === 'value') {
                // 'value' refers to the entries value (_value)
                const transform = (fieldMapping as any).transform;
                if (transform) {
                    fieldValue = {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: transformToMethod(transform),
                        },
                        args: [{ kind: 'identifier', name: dataVar }],
                    };
                } else {
                    fieldValue = { kind: 'identifier', name: dataVar };
                }
            } else if (ctxVar === keyVarName || ctxVar.endsWith('Id')) {
                // Key variable (tradeId, currencyId, etc.)
                const transform = (fieldMapping as any).transform;
                if (transform) {
                    fieldValue = {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: transformToMethod(transform),
                        },
                        args: [{ kind: 'identifier', name: keyVarName }],
                    };
                } else {
                    fieldValue = { kind: 'identifier', name: keyVarName };
                }
            } else {
                // Other context variable
                fieldValue = generateFieldAccess(fieldMapping, dataVar);
            }
        } else {
            fieldValue = generateFieldAccess(fieldMapping, dataVar);
        }

        // Add the field to the nested structure
        const parts = field.split('.');
        if (parts.length === 1) {
            // Simple property
            root[field] = fieldValue;
        } else {
            // Nested property - create the hierarchy
            let current = root;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            // Set the final value
            const lastKey = parts[parts.length - 1];
            current[lastKey] = fieldValue;
        }
    }

    // Convert the nested structure to TSExpression
    return nestedObjectToExpression(root);
}

/**
 * Create a data initializer statement for parser path
 * Handles nested paths with dots and placeholders like {marketId}
 */
function createDataInitializer(path?: string): TSStatement {
    if (!path) {
        return {
            kind: 'variable',
            keyword: 'const',
            name: 'data',
            value: { kind: 'identifier', name: 'response' },
        };
    }

    // Check if path has placeholders like {marketId}
    const hasPlaceholder = /\{[^}]+\}/.test(path);
    // Check if path has dots (nested access)
    const isNestedPath = path.includes('.');

    if (!hasPlaceholder && !isNestedPath) {
        // Simple path without placeholders or nesting
        return {
            kind: 'variable',
            keyword: 'const',
            name: 'data',
            value: {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: 'safeValue',
                },
                args: [
                    { kind: 'identifier', name: 'response' },
                    literal(path),
                    { kind: 'object', properties: [] },
                ],
            },
        };
    }

    // For complex paths, build a chain of safeValue calls
    // Split path by dots, handling placeholders
    const segments = path.split('.');
    let code = 'response';

    for (const segment of segments) {
        if (segment.startsWith('{') && segment.endsWith('}')) {
            // Placeholder like {marketId} - needs runtime substitution
            const varName = segment.slice(1, -1);
            // Use bracket notation with the variable
            code = `this.safeValue(${code}, ${varName}, {})`;
        } else if (segment.includes('[')) {
            // Has array index - parse and chain
            const { baseKey, rest } = parsePath(segment);
            if (baseKey) {
                code = `this.safeValue(${code}, '${baseKey}')`;
            }
            for (const part of rest) {
                if (part.type === 'index') {
                    code = `${code}?.[${part.value}]`;
                } else {
                    code = `${code}?.['${part.value}']`;
                }
            }
        } else {
            // Simple key
            code = `this.safeValue(${code}, '${segment}')`;
        }
    }

    // Wrap final result with default empty object
    // Use ternary instead of ?? for transpiler compatibility
    code = `(${code} !== undefined ? ${code} : {})`;

    return {
        kind: 'variable',
        keyword: 'const',
        name: 'data',
        value: { kind: 'raw', code },
    };
}

function createEnsureArrayExpression(sourceVar: string): TSExpression {
    return {
        kind: 'conditional',
        test: {
            kind: 'call',
            callee: {
                kind: 'member',
                object: { kind: 'identifier', name: 'Array' },
                property: 'isArray',
            },
            args: [{ kind: 'identifier', name: sourceVar }],
        },
        consequent: { kind: 'identifier', name: sourceVar },
        alternate: {
            kind: 'conditional',
            test: {
                kind: 'binary',
                operator: '==',
                left: { kind: 'identifier', name: sourceVar },
                right: { kind: 'literal', value: null },
            },
            consequent: { kind: 'array', elements: [] },
            alternate: {
                kind: 'array',
                elements: [{ kind: 'identifier', name: sourceVar }],
            },
        },
    };
}

function buildResultObjectStatements(
    dataVar: string,
    resultVar: string,
    parser: ParserDefinition,
    includeReturn: boolean,
    mutable: boolean
): TSStatement[] {
    const statements: TSStatement[] = [];
    const computeFields = new Map<string, string>();

    // Collect all fields and identify which are computed
    for (const [field, mapping] of Object.entries(parser.mapping)) {
        if ('compute' in mapping) {
            computeFields.set(field, mapping.compute);
        }
    }

    // Build nested object structure for the result
    const resultObject = buildNestedObjectStructure(parser.mapping, dataVar, computeFields);

    statements.push({
        kind: 'variable',
        keyword: mutable ? 'let' : 'const',
        name: resultVar,
        value: resultObject,
    });

    const orderedComputeFields = resolveComputeOrder(parser.mapping).filter(field =>
        computeFields.has(field)
    );

    // Collect all field names for reference substitution in compute expressions
    const mappingFieldNames = new Set(Object.keys(parser.mapping));

    // Generate assignments for computed fields
    for (const fieldName of orderedComputeFields) {
        const computeExpression = computeFields.get(fieldName);
        if (!computeExpression) continue;

        // For nested properties like 'precision.amount', create proper nested access
        const assignmentLeft = createNestedMemberAccess(resultVar, fieldName);

        // Build compute expression (may include setup statements for IIFEs)
        const computeResult = buildComputeExpression(computeExpression, resultVar, mappingFieldNames, dataVar);

        // Add any setup statements first
        statements.push(...computeResult.statements);

        // Then add the assignment
        statements.push({
            kind: 'expression',
            expression: {
                kind: 'assignment',
                operator: '=',
                left: assignmentLeft,
                right: computeResult.expression,
            },
        });
    }

    if (includeReturn) {
        statements.push({
            kind: 'return',
            expression: { kind: 'identifier', name: resultVar },
        });
    }

    return statements;
}

/**
 * Build a nested object structure from field mappings
 * Handles dot notation like 'precision.amount' by creating nested objects
 */
function buildNestedObjectStructure(
    mapping: Record<string, FieldMapping>,
    dataVar: string,
    computeFields: Map<string, string>
): TSExpression {
    const root: any = {};

    // First, organize fields into a nested structure
    for (const [field, fieldMapping] of Object.entries(mapping)) {
        // Skip computed fields - they'll be assigned after object creation
        if (computeFields.has(field)) {
            // But we need to ensure parent objects exist
            const parts = field.split('.');
            if (parts.length > 1) {
                // Create parent objects
                let current = root;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) {
                        current[parts[i]] = {};
                    }
                    current = current[parts[i]];
                }
            }
            continue;
        }

        // For non-computed fields, add them to the structure
        const parts = field.split('.');
        if (parts.length === 1) {
            // Simple property
            root[field] = generateFieldAccess(fieldMapping, dataVar);
        } else {
            // Nested property - create the hierarchy
            let current = root;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            // Set the final value
            const lastKey = parts[parts.length - 1];
            current[lastKey] = generateFieldAccess(fieldMapping, dataVar);
        }
    }

    // Convert the nested structure to TSExpression
    return nestedObjectToExpression(root);
}

/**
 * Convert a nested plain object to a TSExpression object literal
 */
function nestedObjectToExpression(obj: any): TSExpression {
    const properties: TSObjectProperty[] = [];

    for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && !('kind' in value)) {
            // It's a nested object, recurse
            properties.push(prop(key, nestedObjectToExpression(value)));
        } else {
            // It's a TSExpression
            properties.push(prop(key, value as TSExpression));
        }
    }

    return {
        kind: 'object',
        properties,
    };
}

/**
 * Create a nested member access expression for assignments
 * e.g., 'precision.amount' becomes result.precision.amount
 */
function createNestedMemberAccess(baseVar: string, fieldPath: string): TSExpression {
    const parts = fieldPath.split('.');
    let expr: TSExpression = { kind: 'identifier', name: baseVar };

    for (const part of parts) {
        expr = {
            kind: 'member',
            object: expr,
            property: part,
        };
    }

    return expr;
}

function applyPostProcess(body: TSStatement[], parser: ParserDefinition, targetVar: string) {
    if (!parser.postProcess?.length) {
        return;
    }

    for (const step of parser.postProcess) {
        if (!step?.name) continue;
        body.push({
            kind: 'expression',
            expression: {
                kind: 'assignment',
                operator: '=',
                left: { kind: 'identifier', name: targetVar },
                right: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: step.name,
                    },
                    args: [
                        { kind: 'identifier', name: targetVar },
                        ...((step.args || []).map(valueToExpression))
                    ],
                },
            },
        });
    }
}

/**
 * Parse a path string into segments for nested access
 * Handles dot notation (a.b) and array indices (a.[0], a[0])
 * Returns { baseKey: string, rest: string[] } where rest contains
 * subsequent path segments (dot keys or bracket indices)
 */
function parsePath(path: string): { baseKey: string; rest: Array<{ type: 'key' | 'index', value: string }> } {
    const result: Array<{ type: 'key' | 'index', value: string }> = [];

    // Match segments: either .key, .[n], or [n]
    // First, split by dots while preserving bracket notation
    const parts: string[] = [];
    let current = '';
    let i = 0;

    while (i < path.length) {
        if (path[i] === '.') {
            if (current) {
                parts.push(current);
                current = '';
            }
            i++;
        } else if (path[i] === '[') {
            if (current) {
                parts.push(current);
                current = '';
            }
            // Find the closing bracket
            let j = i + 1;
            while (j < path.length && path[j] !== ']') {
                j++;
            }
            parts.push(path.slice(i, j + 1)); // Include brackets
            i = j + 1;
        } else {
            current += path[i];
            i++;
        }
    }
    if (current) {
        parts.push(current);
    }

    if (parts.length === 0) {
        return { baseKey: path, rest: [] };
    }

    const baseKey = parts[0].startsWith('[') ? '' : parts[0];
    const startIdx = baseKey ? 1 : 0;

    for (let idx = startIdx; idx < parts.length; idx++) {
        const part = parts[idx];
        if (part.startsWith('[') && part.endsWith(']')) {
            // Array index like [0] or [1]
            result.push({ type: 'index', value: part.slice(1, -1) });
        } else {
            // Object key
            result.push({ type: 'key', value: part });
        }
    }

    return { baseKey: baseKey || parts[0].slice(1, -1), rest: result };
}

/**
 * Check if a path has nested segments (dots or brackets after first key)
 */
function isNestedPath(path: string): boolean {
    // Has a dot after the first character, or brackets
    return path.includes('.') || /\[.+\]/.test(path.slice(1));
}

/**
 * Generate expression for accessing a nested path
 * For paths like 'h.[1]' generates: this.safeValue(data, 'h')?.[1]
 */
function generateNestedPathAccess(path: string, dataVar: string): TSExpression {
    const { baseKey, rest } = parsePath(path);

    if (rest.length === 0) {
        // Simple path, no nested access needed
        return {
            kind: 'call',
            callee: {
                kind: 'member',
                object: { kind: 'this' },
                property: 'safeValue',
            },
            args: [
                { kind: 'identifier', name: dataVar },
                literal(baseKey),
            ],
        };
    }

    // Build the chain: this.safeValue(data, 'baseKey')?.[index]?.key...
    let code = `this.safeValue(${dataVar}, '${baseKey}')`;

    for (const segment of rest) {
        if (segment.type === 'index') {
            code += `?.[${segment.value}]`;
        } else {
            code += `?.['${segment.value}']`;
        }
    }

    return { kind: 'raw', code };
}

function generateFieldAccess(mapping: FieldMapping, dataVar: string): TSExpression {
    if ('path' in mapping) {
        // Handle array paths (fallback paths) - e.g. path: [id, orderNo]
        if (Array.isArray(mapping.path)) {
            const paths = mapping.path as string[];
            if (paths.length === 0) {
                return { kind: 'literal', value: null };
            }
            if (paths.length === 1) {
                // Single path, treat as normal
                const newMapping = { ...mapping, path: paths[0] };
                return generateFieldAccess(newMapping as FieldMapping, dataVar);
            }
            // Multiple paths - use safeValue2/safeValueN
            const transformMethod = mapping.transform ? transformToMethod(mapping.transform) : null;
            let expr: TSExpression;
            if (paths.length === 2) {
                expr = {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'safeValue2',
                    },
                    args: [
                        { kind: 'identifier', name: dataVar },
                        literal(paths[0]),
                        literal(paths[1]),
                    ],
                };
            } else {
                // For 3+ paths, generate a chain of ternary operators (not ??, for transpiler compatibility)
                let code = `this.safeValue(${dataVar}, '${paths[0]}')`;
                for (let i = 1; i < paths.length; i++) {
                    code = `(${code} !== undefined ? ${code} : this.safeValue(${dataVar}, '${paths[i]}'))`;
                }
                expr = { kind: 'raw', code };
            }
            // Apply transform if specified
            if (transformMethod) {
                expr = {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: transformMethod,
                    },
                    args: [expr],
                };
            }
            // Apply default
            if (mapping.default !== undefined) {
                expr = {
                    kind: 'binary',
                    operator: '??',
                    left: expr,
                    right: valueToExpression(mapping.default),
                };
            } else if (!transformMethod) {
                // Default to null for non-transformed values
                expr = {
                    kind: 'binary',
                    operator: '??',
                    left: expr,
                    right: { kind: 'literal', value: null },
                };
            }
            return expr;
        }
        // Check if path has nested segments (dots or array indices)
        const hasNestedPath = isNestedPath(mapping.path);

        // Some transforms (safeNumber, safeString, etc.) take (obj, key) directly
        // instead of wrapping safeValue output - BUT only for simple paths
        const directAccessTransforms = new Set([
            'safeNumber', 'safeString', 'safeInteger', 'safeTimestamp', 'safeBoolean', 'safeBool',
            'safeStringLower', 'safeStringUpper',  // These also use (obj, key) signature
            'parseNumber', 'parseString', 'parseTimestamp', 'parseTimestampMs', 'parse_number',
            'parse_string', 'parse_timestamp', 'parse_timestamp_ms',
        ]);

        const transformMethod = mapping.transform ? transformToMethod(mapping.transform) : null;
        // Only use direct access for simple (non-nested) paths
        const useDirectAccess = transformMethod && directAccessTransforms.has(transformMethod) && !hasNestedPath;

        let expr: TSExpression;

        if (hasNestedPath) {
            // For nested paths, generate the chain and wrap with transform if needed
            expr = generateNestedPathAccess(mapping.path, dataVar);

            if (transformMethod) {
                // Wrap the nested access with the transform
                // CCXT's safe* methods take (obj, key, default) so we use parse* equivalents
                // that can take a value directly
                const rawCode = (expr as any).code || '';
                if (directAccessTransforms.has(transformMethod)) {
                    // Map safe* methods to parse* equivalents that accept a single value
                    if (transformMethod === 'safeNumber' || transformMethod === 'parseNumber') {
                        expr = { kind: 'raw', code: `this.parseNumber(${rawCode})` };
                    } else if (transformMethod === 'safeString' || transformMethod === 'parseString') {
                        // parseString doesn't exist, use String() or safeString2 pattern
                        expr = { kind: 'raw', code: `(${rawCode})?.toString()` };
                    } else if (transformMethod === 'safeStringLower') {
                        // safeStringLower needs (obj, key), but for nested paths use toLowerCase
                        expr = { kind: 'raw', code: `(${rawCode})?.toLowerCase()` };
                    } else if (transformMethod === 'safeStringUpper') {
                        // safeStringUpper needs (obj, key), but for nested paths use toUpperCase
                        expr = { kind: 'raw', code: `(${rawCode})?.toUpperCase()` };
                    } else if (transformMethod === 'safeInteger' || transformMethod === 'parseTimestampMs') {
                        // Use parseInt for integers
                        expr = { kind: 'raw', code: `this.parseToInt(${rawCode})` };
                    } else if (transformMethod === 'safeTimestamp' || transformMethod === 'parseTimestamp') {
                        // safeTimestamp multiplies by 1000, so if already ms use parseToInt
                        expr = { kind: 'raw', code: `this.parseToInt(${rawCode})` };
                    } else {
                        // Default: wrap with transform method as single arg
                        expr = {
                            kind: 'call',
                            callee: {
                                kind: 'member',
                                object: { kind: 'this' },
                                property: transformMethod,
                            },
                            args: [expr],
                        };
                    }
                } else {
                    // Other transforms can take a value directly
                    expr = {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: transformMethod,
                        },
                        args: [expr],
                    };
                }
            }

            if (mapping.default !== undefined) {
                expr = {
                    kind: 'binary',
                    operator: '??',
                    left: expr,
                    right: valueToExpression(mapping.default),
                };
            } else {
                // Always default to null to match CCXT behavior (even with transforms)
                expr = {
                    kind: 'binary',
                    operator: '??',
                    left: expr,
                    right: { kind: 'literal', value: null },
                };
            }

            return expr;
        }

        if (useDirectAccess) {
            // Use safe* method directly with (obj, key) signature
            const args: TSExpression[] = [
                { kind: 'identifier', name: dataVar },
                literal(mapping.path),
            ];

            // Add default value as third argument if present
            if (mapping.default !== undefined) {
                args.push(valueToExpression(mapping.default));
            }

            expr = {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: transformMethod,
                },
                args,
            };
        } else {
            // Use safeValue first, then optionally apply transform
            expr = {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'this' },
                    property: 'safeValue',
                },
                args: [
                    { kind: 'identifier', name: dataVar },
                    literal(mapping.path),
                ],
            };

            if (mapping.transform) {
                expr = {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: transformToMethod(mapping.transform),
                    },
                    args: [expr],
                };
            }

            if (mapping.default !== undefined) {
                expr = {
                    kind: 'binary',
                    operator: '??',
                    left: expr,
                    right: valueToExpression(mapping.default),
                };
            } else {
                // Always default to null to match CCXT behavior (even with transforms)
                expr = {
                    kind: 'binary',
                    operator: '??',
                    left: expr,
                    right: { kind: 'literal', value: null },
                };
            }
        }

        // Apply value mapping if present
        if ((mapping as any).map) {
            expr = generateValueMapping(expr, (mapping as any).map);
        }

        return expr;
    }

    if ('fromContext' in mapping || 'from_context' in mapping) {
        const varName = (mapping as any).fromContext || (mapping as any).from_context;
        // Map special context variables
        if (varName === 'rawData') {
            return { kind: 'identifier', name: 'response' };
        }
        // 'value' refers to the current iteration item (item for array, _value for entries)
        if (varName === 'value') {
            return { kind: 'identifier', name: dataVar };
        }
        return {
            kind: 'identifier',
            name: varName,
        };
    }

    if ('literal' in mapping) {
        if (mapping.literal === 'undefined') {
            return { kind: 'identifier', name: 'undefined' };
        }
        return valueToExpression(mapping.literal);
    }

    if ('conditional' in mapping) {
        return generateConditionalMapping(mapping.conditional, dataVar);
    }

    return { kind: 'identifier', name: 'undefined' };
}

/**
 * Generate conditional mapping expression
 * Supports if/then/else, fallback chains, and type-based conditionals
 */
function generateConditionalMapping(conditional: any, dataVar: string): TSExpression {
    // Handle if/then/else conditional
    if ('if' in conditional && 'then' in conditional) {
        const testExpr = parseConditionalExpression(conditional.if, dataVar);
        const consequent = parseConditionalValue(conditional.then, dataVar);
        const alternate = conditional.else
            ? parseConditionalValue(conditional.else, dataVar)
            : { kind: 'identifier', name: 'undefined' } as TSExpression;

        return {
            kind: 'conditional',
            test: testExpr,
            consequent,
            alternate,
        };
    }

    // Handle fallback chain
    if ('fallback' in conditional && Array.isArray(conditional.fallback)) {
        return generateFallbackChain(conditional.fallback, dataVar);
    }

    // Handle 'when' conditional presence
    if ('when' in conditional && 'value' in conditional) {
        const testExpr = parseConditionalExpression(conditional.when, dataVar);
        const consequent = parseConditionalValue(conditional.value, dataVar);
        return {
            kind: 'conditional',
            test: testExpr,
            consequent,
            alternate: { kind: 'identifier', name: 'undefined' },
        };
    }

    // Handle type-based conditionals (ifNumber, ifString, etc.)
    if ('ifNumber' in conditional || 'ifString' in conditional) {
        return generateTypedConditional(conditional, dataVar);
    }

    // Handle switch/case
    if ('switch' in conditional && 'cases' in conditional) {
        return generateSwitchExpression(conditional, dataVar);
    }

    // Handle coalesce (null coalescing chain)
    if ('coalesce' in conditional && Array.isArray(conditional.coalesce)) {
        return generateCoalesceExpression(conditional.coalesce, dataVar);
    }

    // Fallback: return undefined
    return { kind: 'identifier', name: 'undefined' };
}

/**
 * Parse a conditional expression (the 'if' part)
 */
function parseConditionalExpression(expr: any, dataVar: string): TSExpression {
    // String expression - convert to raw code
    if (typeof expr === 'string') {
        // Replace 'raw.' with the dataVar
        const code = expr.replace(/\braw\./g, `${dataVar}.`);
        return { kind: 'raw', code };
    }

    // Binary expression
    if (typeof expr === 'object' && expr !== null && 'op' in expr) {
        return {
            kind: 'binary',
            operator: expr.op,
            left: parseConditionalExpression(expr.left, dataVar),
            right: parseConditionalExpression(expr.right, dataVar),
        };
    }

    // Literal value
    if (typeof expr === 'number' || typeof expr === 'boolean' || expr === null) {
        return literal(expr);
    }

    // Field path
    if (typeof expr === 'object' && expr !== null && 'path' in expr) {
        return {
            kind: 'call',
            callee: {
                kind: 'member',
                object: { kind: 'this' },
                property: 'safeValue',
            },
            args: [
                { kind: 'identifier', name: dataVar },
                literal(expr.path),
            ],
        };
    }

    return { kind: 'identifier', name: 'undefined' };
}

/**
 * Parse a conditional value (the 'then' or 'else' part)
 */
function parseConditionalValue(value: any, dataVar: string): TSExpression {
    // String literal
    if (typeof value === 'string') {
        return literal(value);
    }

    // Numeric or boolean literal
    if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
        return literal(value);
    }

    // Field mapping object
    if (typeof value === 'object' && value !== null) {
        // Nested conditional
        if ('if' in value && 'then' in value) {
            return generateConditionalMapping(value, dataVar);
        }

        // Regular field mapping
        if ('path' in value || 'literal' in value || 'fromContext' in value) {
            return generateFieldAccess(value as FieldMapping, dataVar);
        }

        // Expression
        if ('op' in value) {
            return parseConditionalExpression(value, dataVar);
        }
    }

    return literal(value);
}

/**
 * Generate fallback chain expression
 * Tries each value in order until one is not null/undefined
 */
function generateFallbackChain(fallbacks: any[], dataVar: string): TSExpression {
    if (fallbacks.length === 0) {
        return { kind: 'identifier', name: 'undefined' };
    }

    if (fallbacks.length === 1) {
        return parseConditionalValue(fallbacks[0], dataVar);
    }

    // Build right-to-left null coalescing chain
    let result = parseConditionalValue(fallbacks[fallbacks.length - 1], dataVar);

    for (let i = fallbacks.length - 2; i >= 0; i--) {
        const left = parseConditionalValue(fallbacks[i], dataVar);
        result = {
            kind: 'binary',
            operator: '??',
            left,
            right: result,
        };
    }

    return result;
}

/**
 * Collect context variables used in parser mapping
 *
 * Context variables are external variables (like marketId, market, marketType)
 * that need to be initialized before building the result object.
 *
 * Fields defined in the mapping itself are NOT context variables - they're
 * result fields that will be accessed via the result object.
 */
function collectContextVariables(mapping: Record<string, any>): Set<string> {
    const contextVars = new Set<string>();

    // First, collect all field names defined in the mapping
    // These are result fields, not context variables
    const mappingFieldNames = new Set(Object.keys(mapping));

    for (const [_, fieldMapping] of Object.entries(mapping)) {
        if (typeof fieldMapping === 'object' && fieldMapping !== null) {
            // Check fromContext fields
            if ('fromContext' in fieldMapping || 'from_context' in fieldMapping) {
                const varName = fieldMapping.fromContext || fieldMapping.from_context;
                if (varName && varName !== 'rawData') {
                    contextVars.add(varName);
                }
            }

            // Check dependencies array (for compute expressions)
            // Only add deps that are NOT fields defined in the mapping
            if ('dependencies' in fieldMapping && Array.isArray(fieldMapping.dependencies)) {
                for (const dep of fieldMapping.dependencies) {
                    if (typeof dep === 'string' && dep !== 'rawData') {
                        // Skip if this dependency is a field in the mapping
                        // (it will be accessed via result.fieldName instead)
                        if (!mappingFieldNames.has(dep)) {
                            contextVars.add(dep);
                        }
                    }
                }
            }
        }
    }

    return contextVars;
}

/**
 * Generate context variable initializers
 * These extract commonly-used values from the market parameter
 */
function generateContextInitializers(contextVars: Set<string>): TSStatement[] {
    const statements: TSStatement[] = [];

    // Common context variable mappings
    const contextMappings: Record<string, TSExpression> = {
        symbol: {
            kind: 'conditional',
            test: { kind: 'identifier', name: 'market' },
            consequent: { kind: 'member', object: { kind: 'identifier', name: 'market' }, property: 'symbol' },
            alternate: { kind: 'identifier', name: 'undefined' },
        },
        marketId: {
            kind: 'conditional',
            test: { kind: 'identifier', name: 'market' },
            consequent: { kind: 'member', object: { kind: 'identifier', name: 'market' }, property: 'id' },
            alternate: { kind: 'identifier', name: 'undefined' },
        },
        marketType: {
            kind: 'conditional',
            test: { kind: 'identifier', name: 'market' },
            consequent: { kind: 'member', object: { kind: 'identifier', name: 'market' }, property: 'type' },
            alternate: { kind: 'identifier', name: 'undefined' },
        },
        timestamp: {
            kind: 'call',
            callee: { kind: 'member', object: { kind: 'this' }, property: 'milliseconds' },
            args: [],
        },
        market: {
            kind: 'identifier',
            name: 'market',
        },
    };

    // Don't generate declarations for variables that are already parameters
    const parameterNames = new Set(['market', 'response', 'data']);

    for (const varName of contextVars) {
        // Skip if it's already a parameter
        if (parameterNames.has(varName)) {
            continue;
        }

        const initializer = contextMappings[varName];
        if (initializer) {
            statements.push({
                kind: 'variable',
                keyword: 'const',
                name: varName,
                value: initializer,
            });
        }
    }

    return statements;
}

/**
 * Generate coalesce expression (explicit null coalescing)
 */
function generateCoalesceExpression(values: any[], dataVar: string): TSExpression {
    return generateFallbackChain(values, dataVar);
}

/**
 * Generate type-based conditional
 * Example: ifNumber: raw.qty, ifString: parseFloat(raw.qty)
 */
function generateTypedConditional(conditional: any, dataVar: string): TSExpression {
    const checks: Array<{ type: string; value: any }> = [];

    if ('ifNumber' in conditional) {
        checks.push({ type: 'number', value: conditional.ifNumber });
    }
    if ('ifString' in conditional) {
        checks.push({ type: 'string', value: conditional.ifString });
    }
    if ('ifBoolean' in conditional) {
        checks.push({ type: 'boolean', value: conditional.ifBoolean });
    }
    if ('ifArray' in conditional) {
        checks.push({ type: 'array', value: conditional.ifArray });
    }
    if ('ifObject' in conditional) {
        checks.push({ type: 'object', value: conditional.ifObject });
    }
    if ('ifNull' in conditional) {
        checks.push({ type: 'null', value: conditional.ifNull });
    }

    if (checks.length === 0) {
        return { kind: 'identifier', name: 'undefined' };
    }

    // Build nested conditionals
    let result: TSExpression = conditional.else
        ? parseConditionalValue(conditional.else, dataVar)
        : { kind: 'identifier', name: 'undefined' };

    for (let i = checks.length - 1; i >= 0; i--) {
        const check = checks[i];
        const testExpr = generateTypeCheck(check.type, check.value, dataVar);
        const consequent = parseConditionalValue(check.value, dataVar);

        result = {
            kind: 'conditional',
            test: testExpr,
            consequent,
            alternate: result,
        };
    }

    return result;
}

/**
 * Generate type check expression
 */
function generateTypeCheck(type: string, value: any, dataVar: string): TSExpression {
    // First, get the value to check
    const valueExpr = parseConditionalValue(value, dataVar);

    switch (type) {
        case 'number':
            return {
                kind: 'binary',
                operator: '===',
                left: {
                    kind: 'unary',
                    operator: 'typeof',
                    operand: valueExpr,
                },
                right: literal('number'),
            };

        case 'string':
            return {
                kind: 'binary',
                operator: '===',
                left: {
                    kind: 'unary',
                    operator: 'typeof',
                    operand: valueExpr,
                },
                right: literal('string'),
            };

        case 'boolean':
            return {
                kind: 'binary',
                operator: '===',
                left: {
                    kind: 'unary',
                    operator: 'typeof',
                    operand: valueExpr,
                },
                right: literal('boolean'),
            };

        case 'array':
            return {
                kind: 'call',
                callee: {
                    kind: 'member',
                    object: { kind: 'identifier', name: 'Array' },
                    property: 'isArray',
                },
                args: [valueExpr],
            };

        case 'object':
            return {
                kind: 'binary',
                operator: '&&',
                left: {
                    kind: 'binary',
                    operator: '===',
                    left: {
                        kind: 'unary',
                        operator: 'typeof',
                        operand: valueExpr,
                    },
                    right: literal('object'),
                },
                right: {
                    kind: 'unary',
                    operator: '!',
                    operand: {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'Array' },
                            property: 'isArray',
                        },
                        args: [valueExpr],
                    },
                },
            };

        case 'null':
            return {
                kind: 'binary',
                operator: '===',
                left: valueExpr,
                right: literal(null),
            };

        default:
            return literal(true);
    }
}

/**
 * Generate switch/case expression
 */
function generateSwitchExpression(switchExpr: any, dataVar: string): TSExpression {
    const switchValue = parseConditionalValue(switchExpr.switch, dataVar);
    const cases = switchExpr.cases || {};
    const defaultValue = switchExpr.default
        ? parseConditionalValue(switchExpr.default, dataVar)
        : { kind: 'identifier', name: 'undefined' } as TSExpression;

    // Build nested conditional chain for switch cases
    const caseKeys = Object.keys(cases);
    if (caseKeys.length === 0) {
        return defaultValue;
    }

    let result: TSExpression = defaultValue;

    // Build from last to first
    for (let i = caseKeys.length - 1; i >= 0; i--) {
        const caseKey = caseKeys[i];
        const caseValue = cases[caseKey];

        const testExpr: TSExpression = {
            kind: 'binary',
            operator: '===',
            left: switchValue,
            right: literal(caseKey),
        };

        const consequent = parseConditionalValue(caseValue, dataVar);

        result = {
            kind: 'conditional',
            test: testExpr,
            consequent,
            alternate: result,
        };
    }

    return result;
}

/**
 * Result of processing a compute expression
 * May include setup statements that need to run before the final expression
 */
interface ComputeExpressionResult {
    /** Statements to execute before using the expression (e.g., variable declarations) */
    statements: TSStatement[];
    /** The final expression to use as the value */
    expression: TSExpression;
}

function buildComputeExpression(template: string, resultVar: string, mappingFieldNames?: Set<string>, dataVar?: string): ComputeExpressionResult {
    // First replace {placeholder} style references - only simple identifiers, not JS code blocks
    // Use a pattern that only matches {identifier} where identifier is a simple name
    let code = template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_, placeholder) => accessResultField(resultVar, placeholder.trim()));

    // Replace 'data' with the actual data variable if provided (e.g., '_value' in entries mode)
    // This handles expressions like "this.safeValue(data, 'field')" when iterating
    if (dataVar && dataVar !== 'data') {
        // Replace 'data' as a bare identifier (not inside strings, not part of a larger identifier)
        code = code.replace(/(?<!'|")(\bdata\b)(?!['"])/g, dataVar);
    }

    // Then replace bare identifiers that are mapping fields with result.fieldName
    // This handles expressions like "this.iso8601(timestamp)" where timestamp is a field
    if (mappingFieldNames && mappingFieldNames.size > 0) {
        for (const fieldName of mappingFieldNames) {
            // Match the field name as a word boundary (not part of a longer identifier)
            // Don't replace if it's:
            // - already prefixed with resultVar. or this.
            // - inside a string literal (preceded by ' or ")
            // - followed by : (object key position in literal)
            const regex = new RegExp(`(?<!${resultVar}\\.|this\\.|\\w|'|")\\b${fieldName}\\b(?!['":])`, 'g');
            code = code.replace(regex, `${resultVar}.${fieldName}`);
        }
    }

    // Convert nullish coalescing (??) to ternary for transpiler compatibility
    code = convertNullishCoalescingToTernary(code);

    // Check if the code contains an IIFE pattern and transform it
    const iifeResult = transformIIFE(code);

    if (iifeResult) {
        return iifeResult;
    }

    // No IIFE found, return as-is
    return {
        statements: [],
        expression: {
            kind: 'raw',
            code,
        },
    };
}

/**
 * Convert nullish coalescing operator (??) to ternary expression for transpiler compatibility
 * Transforms: expr ?? fallback  =>  (expr !== undefined ? expr : fallback)
 */
function convertNullishCoalescingToTernary(code: string): string {
    // Simple pattern match for ?? operator
    // This handles simple cases like "a ?? b"
    // For nested cases like "a ?? b ?? c", we need to process right-to-left

    // Match pattern: leftExpr ?? rightExpr
    // We need to be careful with parentheses to preserve precedence
    const nullishPattern = /([^\?]+)\s*\?\?\s*([^\?]+)/g;

    let result = code;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    // Keep replacing until no more ?? operators are found
    while (nullishPattern.test(result) && iterations < maxIterations) {
        result = result.replace(nullishPattern, (match, left, right) => {
            const trimmedLeft = left.trim();
            const trimmedRight = right.trim();

            // Check if we need parentheses around the whole expression
            // If the match is already wrapped in parens, don't add more
            const needsParens = !match.trim().startsWith('(');
            const ternary = `${trimmedLeft} !== undefined ? ${trimmedLeft} : ${trimmedRight}`;

            return needsParens ? `(${ternary})` : ternary;
        });
        iterations++;
        nullishPattern.lastIndex = 0; // Reset regex
    }

    return result;
}

/**
 * Detect and transform IIFE patterns into statements + expression
 * Handles: (() => { ... })() and (function() { ... })()
 */
function transformIIFE(code: string): ComputeExpressionResult | null {
    // Match arrow function IIFE: (() => { body })()
    const arrowMatch = code.match(/^\(\s*\(\s*\)\s*=>\s*\{([\s\S]*)\}\s*\)\s*\(\s*\)$/);

    if (arrowMatch) {
        return transformIIFEBody(arrowMatch[1]);
    }

    // Match function IIFE: (function() { body })()
    const funcMatch = code.match(/^\(\s*function\s*\(\s*\)\s*\{([\s\S]*)\}\s*\)\s*\(\s*\)$/);

    if (funcMatch) {
        return transformIIFEBody(funcMatch[1]);
    }

    return null;
}

/**
 * Transform the body of an IIFE into statements and a final expression
 */
function transformIIFEBody(body: string): ComputeExpressionResult {
    const statements: TSStatement[] = [];

    // Find the LAST return statement (not the first)
    const lastReturnIndex = body.lastIndexOf('return');

    if (lastReturnIndex === -1) {
        // No return statement found, return as raw code
        return {
            statements: [],
            expression: {
                kind: 'raw',
                code: `(() => { ${body} })()`,
            },
        };
    }

    // Extract everything before the last return
    const beforeReturn = body.substring(0, lastReturnIndex).trim();

    // Extract the return expression (everything after 'return' keyword)
    let afterReturn = body.substring(lastReturnIndex + 6).trim(); // 6 = length of 'return'

    // Remove trailing semicolon and whitespace
    afterReturn = afterReturn.replace(/;?\s*$/, '');
    const returnExpr = afterReturn;

    // Parse the setup statements using a more robust approach
    if (beforeReturn) {
        // Use a simple state machine to parse statements properly
        let i = 0;
        const chars = beforeReturn;

        while (i < chars.length) {
            // Skip whitespace
            while (i < chars.length && /\s/.test(chars[i])) {
                i++;
            }

            if (i >= chars.length) break;

            // Try to match variable declaration
            const varMatch = chars.substring(i).match(/^(let|const|var)\s+(\w+)\s*=\s*/);
            if (varMatch) {
                const keyword = varMatch[1];
                const varName = varMatch[2];
                i += varMatch[0].length;

                // Find the end of the value expression (semicolon or end of string before 'if')
                let valueStart = i;
                let valueEnd = i;
                let depth = 0;
                let inString = false;
                let stringChar = '';

                while (valueEnd < chars.length) {
                    const c = chars[valueEnd];

                    if (!inString) {
                        if (c === '"' || c === "'" || c === '`') {
                            inString = true;
                            stringChar = c;
                        } else if (c === '(' || c === '{' || c === '[') {
                            depth++;
                        } else if (c === ')' || c === '}' || c === ']') {
                            depth--;
                        } else if (c === ';' && depth === 0) {
                            break;
                        }
                    } else if (c === stringChar && chars[valueEnd - 1] !== '\\') {
                        inString = false;
                    }

                    valueEnd++;
                }

                const valueCode = chars.substring(valueStart, valueEnd).trim();
                statements.push({
                    kind: 'variable',
                    keyword: keyword as 'let' | 'const' | 'var',
                    name: varName,
                    value: {
                        kind: 'raw',
                        code: valueCode,
                    },
                });

                i = valueEnd + 1; // Skip the semicolon
                continue;
            }

            // Try to match if statement
            const ifMatch = chars.substring(i).match(/^if\s*\(/);
            if (ifMatch) {
                i += ifMatch[0].length;

                // Find the matching closing paren for the condition
                let condStart = i;
                let depth = 1;
                let inString = false;
                let stringChar = '';

                while (i < chars.length && depth > 0) {
                    const c = chars[i];
                    if (!inString) {
                        if (c === '"' || c === "'" || c === '`') {
                            inString = true;
                            stringChar = c;
                        } else if (c === '(') {
                            depth++;
                        } else if (c === ')') {
                            depth--;
                        }
                    } else if (c === stringChar && chars[i - 1] !== '\\') {
                        inString = false;
                    }
                    i++;
                }

                const condition = chars.substring(condStart, i - 1).trim();

                // Skip whitespace after condition
                while (i < chars.length && /\s/.test(chars[i])) {
                    i++;
                }

                // Expect opening brace
                if (chars[i] === '{') {
                    i++;
                    const bodyStart = i;

                    // Find matching closing brace
                    depth = 1;
                    inString = false;
                    while (i < chars.length && depth > 0) {
                        const c = chars[i];
                        if (!inString) {
                            if (c === '"' || c === "'" || c === '`') {
                                inString = true;
                                stringChar = c;
                            } else if (c === '{') {
                                depth++;
                            } else if (c === '}') {
                                depth--;
                            }
                        } else if (c === stringChar && chars[i - 1] !== '\\') {
                            inString = false;
                        }
                        i++;
                    }

                    const ifBody = chars.substring(bodyStart, i - 1).trim();

                    // Emit as raw statement (no semicolon will be added)
                    statements.push({
                        kind: 'raw',
                        code: `if (${condition}) { ${ifBody} }`,
                    } as any);
                }

                continue;
            }

            // If nothing matched, skip to next semicolon
            while (i < chars.length && chars[i] !== ';') {
                i++;
            }
            i++; // Skip semicolon
        }
    }

    // Transform the return expression
    // Convert nullish coalescing (??) to ternary since the transpiler doesn't support it
    let finalExpr = returnExpr;

    // Check if the last statement in beforeReturn is an if that returns
    // Pattern: if (condition) { return value; }
    // We need to match the if statement properly, accounting for nested structures
    const lastStmt = statements.length > 0 ? statements[statements.length - 1] : null;

    if (lastStmt && (lastStmt as any).kind === 'raw') {
        const rawCode = (lastStmt as any).code;
        // Try to extract condition and return value from if statement
        const ifReturnMatch = rawCode.match(/^if\s*\(([\s\S]+)\)\s*\{\s*return\s+([\s\S]+);\s*\}$/);

        if (ifReturnMatch) {
            // Remove the last statement (which is the if with return)
            statements.pop();

            // Transform to: condition ? returnValue : finalExpr
            const [, condition, returnValue] = ifReturnMatch;
            finalExpr = `${condition.trim()} ? ${returnValue.trim()} : ${finalExpr}`;
        }
    }

    // Match pattern: value ?? fallback
    const nullishMatch = finalExpr.match(/^(.+?)\s*\?\?\s*(.+)$/);
    if (nullishMatch) {
        const [, value, fallback] = nullishMatch;
        // Transform to: value !== undefined ? value : fallback
        finalExpr = `${value.trim()} !== undefined ? ${value.trim()} : ${fallback.trim()}`;
    }

    return {
        statements,
        expression: {
            kind: 'raw',
            code: finalExpr,
        },
    };
}

function accessResultField(resultVar: string, field: string): string {
    if (!field) {
        return '';
    }

    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(field)) {
        return `${resultVar}.${field}`;
    }

    return `${resultVar}[${JSON.stringify(field)}]`;
}

function valueToExpression(value: any): TSExpression {
    if (Array.isArray(value)) {
        return {
            kind: 'array',
            elements: value.map(valueToExpression),
        };
    }

    if (value && typeof value === 'object') {
        return {
            kind: 'object',
            properties: Object.entries(value).map(([key, val]) => prop(key, valueToExpression(val))),
        };
    }

    return literal(value);
}

function generateFetchMethods(doc: EDLDocument, options: GeneratorOptions): TSMethodDeclaration[] {
    const methods: TSMethodDeclaration[] = [];

    // Generate fetch methods based on parsers
    if (doc.parsers?.ticker) {
        methods.push(generateFetchTicker(doc, options));
    }

    if (doc.parsers?.orderBook || doc.parsers?.orderbook) {
        methods.push(generateFetchOrderBook(doc, options));
    }

    if (doc.parsers?.trades || doc.parsers?.trade) {
        methods.push(generateFetchTrades(doc, options));
    }

    return methods;
}

type HTTPMethodKey = keyof APICategory;

const HTTP_METHODS: HTTPMethodKey[] = ['get', 'post', 'put', 'delete', 'patch'];

interface APIHelperSpec {
    category: string;
    method: HTTPMethodKey;
    endpoint: string;
    definition?: EndpointDefinition;
}

function generateApiHelperMethods(doc: EDLDocument, options: GeneratorOptions): TSMethodDeclaration[] {
    if (!doc.api) {
        return [];
    }

    const specs = collectApiEndpoints(doc.api);
    return specs.map(spec => createApiHelperMethod(spec, options));
}

function collectApiEndpoints(api: APIDefinition): APIHelperSpec[] {
    const specs: APIHelperSpec[] = [];

    for (const [categoryName, category] of Object.entries(api)) {
        if (!category) continue;

        for (const method of HTTP_METHODS) {
            const endpoints = category[method];
            if (!endpoints) continue;

            for (const [endpointName, definition] of Object.entries(endpoints)) {
                specs.push({
                    category: categoryName,
                    method,
                    endpoint: endpointName,
                    definition,
                });
            }
        }
    }

    return specs;
}

function createApiHelperMethod(spec: APIHelperSpec, options: GeneratorOptions): TSMethodDeclaration {
    const methodName = formatRequestMethodName({
        category: spec.category,
        method: spec.method,
        name: spec.endpoint,
    });
    const path = spec.definition?.path ?? spec.endpoint;
    const httpMethod = spec.method.toUpperCase();
    const configExpression = buildEndpointConfigExpression(spec.definition) ?? { kind: 'object', properties: [] };

    const requestCall: TSExpression = {
        kind: 'call',
        callee: {
            kind: 'member',
            object: { kind: 'this' },
            property: 'request',
        },
        args: [
            literal(path),
            literal(spec.category),
            literal(httpMethod),
            { kind: 'identifier', name: 'params' },
            { kind: 'identifier', name: 'undefined' },
            { kind: 'identifier', name: 'undefined' },
            configExpression,
            { kind: 'identifier', name: 'context' },
        ],
    };

    const validationStatements = generateParameterValidationStatements(methodName, spec.definition?.params);

    return {
        kind: 'method',
        name: methodName,
        params: [
            {
                name: 'params',
                type: { kind: 'reference', name: 'Dict' },
                default: { kind: 'object', properties: [] },
            },
            {
                name: 'context',
                type: { kind: 'reference', name: 'Dict' },
                default: { kind: 'object', properties: [] },
            },
        ],
        returnType: {
            kind: 'generic',
            name: 'Promise',
            typeArgs: [{ kind: 'primitive', type: 'any' }],
        },
        isAsync: true,
        body: [
            ...validationStatements,
            {
            kind: 'return',
            expression: {
                kind: 'await',
                expression: requestCall,
            },
            },
        ],
        jsDoc: options.includeComments ? {
            description: `Calls the ${spec.category} ${httpMethod} ${spec.endpoint} endpoint`,
            tags: [
                { tag: 'param', name: 'params', type: 'Dict', description: 'Request parameters' },
                { tag: 'param', name: 'context', type: 'Dict', description: 'Request context overrides' },
                { tag: 'returns', type: 'Promise<any>', description: 'Raw API response' },
            ],
        } : undefined,
    };
}

function generateParameterValidationStatements(
    methodName: string,
    params?: Record<string, ParamDefinition>
): TSStatement[] {
    if (!params) return [];

    const statements: TSStatement[] = [];

    for (const [paramName, definition] of Object.entries(params)) {
        const required = !!definition.required;
        const enumValues = definition.enum;
        const hasEnum = Array.isArray(enumValues) && enumValues.length > 0;

        const hasConditionalRequirement = !!definition.required_if;

        if (!required && !hasEnum && !hasConditionalRequirement) {
            continue;
        }

        const checkCall: TSExpression = {
            kind: 'call',
            callee: {
                kind: 'member',
                object: { kind: 'this' },
                property: 'checkRequiredArgument',
            },
            args: [
                literal(methodName),
                buildParamAccessExpression(paramName),
                literal(paramName),
                ...(hasEnum ? [arrayLit(enumValues!.map(valueToExpression))] : []),
            ],
        };

        if (required) {
            statements.push({
                kind: 'expression',
                expression: checkCall,
            });
        } else if (hasEnum) {
            statements.push({
                kind: 'if',
                test: {
                    kind: 'binary',
                    operator: '!==',
                    left: buildParamAccessExpression(paramName),
                    right: { kind: 'identifier', name: 'undefined' },
                },
                consequent: [{
                    kind: 'expression',
                    expression: checkCall,
                }],
            });
        }

        if (hasConditionalRequirement) {
            const condition = buildRequiredIfCondition(definition.required_if!, params);
            if (condition) {
                statements.push({
                    kind: 'if',
                    test: condition,
                    consequent: [{
                        kind: 'expression',
                        expression: checkCall,
                    }],
                });
            }
        }
    }

    return statements;
}

function buildEndpointConfigExpression(endpoint?: EndpointDefinition): TSExpression | undefined {
    if (!endpoint) {
        return undefined;
    }

    const props: TSObjectProperty[] = [];
    const rateLimit = endpoint.rateLimit;
    const cost = rateLimit?.cost ?? endpoint.cost;
    if (cost !== undefined) {
        props.push(prop('cost', valueToExpression(cost)));
    }

    if (rateLimit?.limit !== undefined) {
        props.push(prop('limit', literal(rateLimit.limit)));
    }

    if (rateLimit?.interval !== undefined) {
        props.push(prop('interval', literal(rateLimit.interval)));
    }

    if (props.length === 0) {
        return undefined;
    }

    return {
        kind: 'object',
        properties: props,
    };
}

function generateFetchTicker(doc: EDLDocument, options: GeneratorOptions): TSMethodDeclaration {
    const source = doc.parsers?.ticker?.source || 'ticker';
    const requestMethod = resolveRequestMethodName(doc, source, 'publicGetTicker');

    return {
        kind: 'method',
        name: 'fetchTicker',
        params: [
            { name: 'symbol', type: { kind: 'primitive', type: 'string' } },
            { name: 'params', type: { kind: 'primitive', type: 'object' }, default: { kind: 'object', properties: [] } },
        ],
        returnType: {
            kind: 'generic',
            name: 'Promise',
            typeArgs: [{ kind: 'reference', name: 'Ticker' }],
        },
        isAsync: true,
        body: [
            {
                kind: 'expression',
                expression: {
                    kind: 'await',
                    expression: {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: 'loadMarkets',
                        },
                        args: [],
                    },
                },
            },
            {
                kind: 'variable',
                keyword: 'const',
                name: 'market',
                value: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'market',
                    },
                    args: [{ kind: 'identifier', name: 'symbol' }],
                },
            },
            {
                kind: 'variable',
                keyword: 'const',
                name: 'request',
                type: { kind: 'reference', name: 'Dict' },
                value: {
                    kind: 'object',
                    properties: [
                        prop('symbol', { kind: 'member', object: { kind: 'identifier', name: 'market' }, property: 'id' }),
                    ],
                },
            },
            {
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
                            property: requestMethod,
                        },
                        args: [
                            {
                                kind: 'call',
                                callee: {
                                    kind: 'member',
                                    object: { kind: 'this' },
                                    property: 'extend',
                                },
                                args: [
                                    { kind: 'identifier', name: 'request' },
                                    { kind: 'identifier', name: 'params' },
                                ],
                            }
                        ],
                    },
                },
            },
            {
                kind: 'return',
                expression: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'parseTicker',
                    },
                    args: [
                        { kind: 'identifier', name: 'response' },
                        { kind: 'identifier', name: 'market' },
                    ],
                },
            },
        ],
        jsDoc: options.includeComments ? {
            description: 'Fetch ticker for a symbol',
            tags: [
                { tag: 'param', name: 'symbol', type: 'string', description: 'Unified symbol' },
                { tag: 'param', name: 'params', type: 'object', description: 'Extra parameters' },
                { tag: 'returns', type: 'Ticker', description: 'Ticker structure' },
            ],
        } : undefined,
    };
}

function generateFetchOrderBook(doc: EDLDocument, options: GeneratorOptions): TSMethodDeclaration {
    const parser = doc.parsers?.orderBook || doc.parsers?.orderbook;
    const source = parser?.source || 'depth';
    const requestMethod = resolveRequestMethodName(doc, source, 'publicGetDepth');

    return {
        kind: 'method',
        name: 'fetchOrderBook',
        params: [
            { name: 'symbol', type: { kind: 'primitive', type: 'string' } },
            { name: 'limit', type: { kind: 'primitive', type: 'number' }, isOptional: true },
            { name: 'params', type: { kind: 'primitive', type: 'object' }, default: { kind: 'object', properties: [] } },
        ],
        returnType: {
            kind: 'generic',
            name: 'Promise',
            typeArgs: [{ kind: 'reference', name: 'OrderBook' }],
        },
        isAsync: true,
        body: [
            {
                kind: 'expression',
                expression: {
                    kind: 'await',
                    expression: {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: 'loadMarkets',
                        },
                        args: [],
                    },
                },
            },
            {
                kind: 'variable',
                keyword: 'const',
                name: 'market',
                value: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'market',
                    },
                    args: [{ kind: 'identifier', name: 'symbol' }],
                },
            },
            {
                kind: 'variable',
                keyword: 'const',
                name: 'request',
                type: { kind: 'reference', name: 'Dict' },
                value: {
                    kind: 'object',
                    properties: [
                        prop('symbol', { kind: 'member', object: { kind: 'identifier', name: 'market' }, property: 'id' }),
                    ],
                },
            },
            {
                kind: 'if',
                test: {
                    kind: 'binary',
                    operator: '!==',
                    left: { kind: 'identifier', name: 'limit' },
                    right: { kind: 'identifier', name: 'undefined' },
                },
                consequent: [{
                    kind: 'expression',
                    expression: {
                        kind: 'assignment',
                        operator: '=',
                        left: {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'request' },
                            property: 'limit',
                            computed: true,
                        },
                        right: { kind: 'identifier', name: 'limit' },
                    },
                }],
            },
            {
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
                            property: requestMethod,
                        },
                        args: [
                            {
                                kind: 'call',
                                callee: {
                                    kind: 'member',
                                    object: { kind: 'this' },
                                    property: 'extend',
                                },
                                args: [
                                    { kind: 'identifier', name: 'request' },
                                    { kind: 'identifier', name: 'params' },
                                ],
                            }
                        ],
                    },
                },
            },
            {
                kind: 'return',
                expression: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'parseOrderBook',
                    },
                    args: [
                        { kind: 'identifier', name: 'response' },
                        {
                            kind: 'member',
                            object: { kind: 'identifier', name: 'market' },
                            property: 'symbol',
                        },
                    ],
                },
            },
        ],
        jsDoc: options.includeComments ? {
            description: 'Fetch order book for a symbol',
            tags: [
                { tag: 'param', name: 'symbol', type: 'string', description: 'Unified symbol' },
                { tag: 'param', name: 'limit', type: 'number', description: 'Number of entries' },
                { tag: 'param', name: 'params', type: 'object', description: 'Extra parameters' },
                { tag: 'returns', type: 'OrderBook', description: 'Order book structure' },
            ],
        } : undefined,
    };
}

function generateFetchTrades(doc: EDLDocument, options: GeneratorOptions): TSMethodDeclaration {
    const parser = doc.parsers?.trades || doc.parsers?.trade;
    const source = parser?.source || 'trades';
    const requestMethod = resolveRequestMethodName(doc, source, 'publicGetTrades');

    return {
        kind: 'method',
        name: 'fetchTrades',
        params: [
            { name: 'symbol', type: { kind: 'primitive', type: 'string' } },
            { name: 'since', type: { kind: 'primitive', type: 'number' }, isOptional: true },
            { name: 'limit', type: { kind: 'primitive', type: 'number' }, isOptional: true },
            { name: 'params', type: { kind: 'primitive', type: 'object' }, default: { kind: 'object', properties: [] } },
        ],
        returnType: {
            kind: 'generic',
            name: 'Promise',
            typeArgs: [{ kind: 'array', elementType: { kind: 'reference', name: 'Trade' } }],
        },
        isAsync: true,
        body: [
            {
                kind: 'expression',
                expression: {
                    kind: 'await',
                    expression: {
                        kind: 'call',
                        callee: {
                            kind: 'member',
                            object: { kind: 'this' },
                            property: 'loadMarkets',
                        },
                        args: [],
                    },
                },
            },
            {
                kind: 'variable',
                keyword: 'const',
                name: 'market',
                value: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'market',
                    },
                    args: [{ kind: 'identifier', name: 'symbol' }],
                },
            },
            {
                kind: 'variable',
                keyword: 'const',
                name: 'request',
                type: { kind: 'reference', name: 'Dict' },
                value: {
                    kind: 'object',
                    properties: [
                        prop('symbol', { kind: 'member', object: { kind: 'identifier', name: 'market' }, property: 'id' }),
                    ],
                },
            },
            {
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
                            property: requestMethod,
                        },
                        args: [
                            {
                                kind: 'call',
                                callee: {
                                    kind: 'member',
                                    object: { kind: 'this' },
                                    property: 'extend',
                                },
                                args: [
                                    { kind: 'identifier', name: 'request' },
                                    { kind: 'identifier', name: 'params' },
                                ],
                            }
                        ],
                    },
                },
            },
            {
                kind: 'return',
                expression: {
                    kind: 'call',
                    callee: {
                        kind: 'member',
                        object: { kind: 'this' },
                        property: 'parseTrades',
                    },
                    args: [
                        { kind: 'identifier', name: 'response' },
                        { kind: 'identifier', name: 'market' },
                        { kind: 'identifier', name: 'since' },
                        { kind: 'identifier', name: 'limit' },
                    ],
                },
            },
        ],
        jsDoc: options.includeComments ? {
            description: 'Fetch recent trades for a symbol',
            tags: [
                { tag: 'param', name: 'symbol', type: 'string', description: 'Unified symbol' },
                { tag: 'param', name: 'since', type: 'number', description: 'Timestamp in ms' },
                { tag: 'param', name: 'limit', type: 'number', description: 'Max number of trades' },
                { tag: 'param', name: 'params', type: 'object', description: 'Extra parameters' },
                { tag: 'returns', type: 'Trade[]', description: 'Array of trades' },
            ],
        } : undefined,
    };
}

function generateAPIStructure(api: any): TSExpression {
    const props: TSObjectProperty[] = [];

    for (const [category, methods] of Object.entries(api)) {
        if (!methods) continue;

        const methodProps: TSObjectProperty[] = [];
        for (const [method, endpoints] of Object.entries(methods as object)) {
            if (!endpoints) continue;

            const endpointList = Object.keys(endpoints as object);
            methodProps.push({
                key: method,
                value: arrayLit(endpointList.map(e => literal(e))),
            });
        }

        props.push({
            key: category,
            value: { kind: 'object', properties: methodProps },
        });
    }

    return { kind: 'object', properties: props };
}

function generateHasObject(doc: EDLDocument): TSExpression {
    // Use the has flags helper to derive capabilities
    const has = deriveHasFlags(doc);

    return objectFromRecord(has);
}

// Helper functions
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function literal(value: any): TSExpression {
    return { kind: 'literal', value };
}

function arrayLit(elements: TSExpression[]): TSExpression {
    return { kind: 'array', elements };
}

function prop(key: string, value: TSExpression): TSObjectProperty {
    return { key, value };
}

function objectFromRecord(obj: any): TSExpression {
    const props: TSObjectProperty[] = [];

    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;

        let expr: TSExpression;
        if (Array.isArray(value)) {
            expr = arrayLit(value.map(v => typeof v === 'object' ? objectFromRecord(v) : literal(v)));
        } else if (typeof value === 'object' && value !== null) {
            expr = objectFromRecord(value);
        } else {
            expr = literal(value);
        }

        props.push(prop(key, expr));
    }

    return { kind: 'object', properties: props };
}

function transformToMethod(transform: string): string {
    // Convert snake_case to camelCase
    const camelCase = transform.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    // Map transforms to CCXT safe* methods
    // NOTE: safeTimestamp expects seconds and multiplies by 1000
    //       parseTimestampMs/safeTimestamp is for values already in ms, so use safeInteger
    const mapping: Record<string, string> = {
        parseNumber: 'safeNumber',
        parseString: 'safeString',
        parseTimestamp: 'safeTimestamp',      // Expects seconds, multiplies by 1000
        parseTimestampMs: 'safeInteger',      // Already in milliseconds, just extract
        omitZero: 'omitZero',
        safeInteger: 'safeInteger',
        safeNumber: 'safeNumber',
        safeString: 'safeString',
        safeTimestamp: 'safeInteger',         // For ms timestamps, use safeInteger
        lowercase: 'safeStringLower',          // Extract string and lowercase
        parseCurrencyCode: 'safeCurrencyCode', // Normalize currency code
        parseOrderStatus: 'parseOrderStatus',  // Map order status (exchange-specific)
        parseSymbol: 'safeSymbol',             // Convert to CCXT symbol format
    };

    return mapping[camelCase] || camelCase;
}

interface EndpointReference {
    category: string;
    method: string;
    name: string;
}

function resolveRequestMethodName(doc: EDLDocument, source: string | undefined, fallback: string): string {
    const ref = resolveEndpoint(doc.api, source);
    if (!ref) {
        return fallback;
    }
    return formatRequestMethodName(ref);
}

function resolveEndpoint(api: APIDefinition | undefined, source: string | undefined): EndpointReference | undefined {
    if (!api || !source) {
        return undefined;
    }

    const normalizedSource = normalizeEndpointReference(source);
    let bestMatch: { ref: EndpointReference; score: number } | undefined;

    for (const [category, definition] of Object.entries(api)) {
        if (!definition) continue;
        for (const httpMethod of HTTP_METHODS) {
            const endpoints = definition[httpMethod];
            if (!endpoints) continue;

            for (const endpointName of Object.keys(endpoints)) {
                const ref: EndpointReference = { category, method: httpMethod, name: endpointName };
                const score = scoreEndpointMatch(ref, normalizedSource, source);
                if (score > 0 && (!bestMatch || score > bestMatch.score)) {
                    bestMatch = { ref, score };
                    if (score >= 100) {
                        return ref;
                    }
                }
            }
        }
    }

    return bestMatch?.ref;
}

function scoreEndpointMatch(ref: EndpointReference, normalizedSource: string, rawSource: string): number {
    const normalizedCategory = normalizeEndpointReference(ref.category);
    const normalizedMethod = normalizeEndpointReference(ref.method);
    const normalizedEndpoint = normalizeEndpointReference(ref.name);

    const comparisons: Array<[string, number]> = [
        [joinReferenceParts([normalizedCategory, normalizedMethod, normalizedEndpoint]), 120],
        [joinReferenceParts([normalizedCategory, normalizedEndpoint]), 110],
        [joinReferenceParts([normalizedMethod, normalizedEndpoint]), 105],
        [normalizedEndpoint, 100],
    ];

    for (const [key, score] of comparisons) {
        if (key && key === normalizedSource) {
            return score;
        }
    }

    const sourceTokens = tokenizeReference(rawSource);
    if (sourceTokens.length === 0) {
        return 0;
    }

    return computeFuzzyMatchScore(sourceTokens, ref);
}

function computeFuzzyMatchScore(sourceTokens: string[], ref: EndpointReference): number {
    const categoryTokens = tokenizeReference(ref.category);
    const methodTokens = tokenizeReference(ref.method);
    const endpointTokens = tokenizeReference(ref.name);
    const trimmedEndpoint = trimEndpointTokens(endpointTokens, categoryTokens, methodTokens);
    const candidateEndpoint = trimmedEndpoint.length > 0 ? trimmedEndpoint : endpointTokens;

    if (candidateEndpoint.length === 0 || sourceTokens.length < candidateEndpoint.length) {
        return 0;
    }

    if (!tokensMatchSuffix(sourceTokens, candidateEndpoint)) {
        return 0;
    }

    const prefixLength = sourceTokens.length - candidateEndpoint.length;
    if (prefixLength === 0) {
        return 10;
    }

    const prefixTokens = sourceTokens.slice(0, prefixLength);
    const combinedCategory = [...categoryTokens, ...methodTokens];

    if (isOrderedSubsequence(combinedCategory, prefixTokens)) {
        return 40 + prefixTokens.length;
    }

    if (isOrderedSubsequence(categoryTokens, prefixTokens)) {
        return 30 + prefixTokens.length;
    }

    if (isOrderedSubsequence(methodTokens, prefixTokens)) {
        return 20 + prefixTokens.length;
    }

    return 0;
}

function trimEndpointTokens(endpointTokens: string[], categoryTokens: string[], methodTokens: string[]): string[] {
    const tokens = [...endpointTokens];
    while (tokens.length) {
        const token = tokens[0];
        if (categoryTokens.includes(token) || methodTokens.includes(token)) {
            tokens.shift();
            continue;
        }
        break;
    }
    return tokens;
}

function tokensMatchSuffix(sourceTokens: string[], endpointTokens: string[]): boolean {
    const offset = sourceTokens.length - endpointTokens.length;
    for (let i = 0; i < endpointTokens.length; i += 1) {
        if (sourceTokens[offset + i] !== endpointTokens[i]) {
            return false;
        }
    }
    return true;
}

function isOrderedSubsequence(haystack: string[], needle: string[]): boolean {
    if (needle.length === 0) {
        return true;
    }

    let haystackIndex = 0;
    for (const token of needle) {
        while (haystackIndex < haystack.length && haystack[haystackIndex] !== token) {
            haystackIndex += 1;
        }

        if (haystackIndex === haystack.length) {
            return false;
        }

        haystackIndex += 1;
    }

    return true;
}

function normalizeEndpointReference(value: string | undefined): string {
    if (!value) {
        return '';
    }

    const camelSafe = value.replace(/([a-z0-9])([A-Z])/g, '$1.$2');
    return camelSafe
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/\.+/g, '.')
        .replace(/^\./, '')
        .replace(/\.$/, '');
}

function tokenizeReference(value: string | undefined): string[] {
    const normalized = normalizeEndpointReference(value);
    if (!normalized) {
        return [];
    }
    return normalized.split('.');
}

function joinReferenceParts(parts: string[]): string {
    return parts.filter(Boolean).join('.');
}

function formatRequestMethodName(ref: EndpointReference): string {
    const category = ref.category;
    const method = capitalize(ref.method);
    const endpoint = pascalCase(ref.name);
    return `${category}${method}${endpoint}`;
}

function buildParamAccessExpression(paramName: string): TSExpression {
    if (isValidIdentifier(paramName)) {
        return {
            kind: 'member',
            object: { kind: 'identifier', name: 'params' },
            property: paramName,
        };
    }

    return {
        kind: 'member',
        object: { kind: 'identifier', name: 'params' },
        property: literal(paramName),
        computed: true,
    };
}

function isValidIdentifier(name: string): boolean {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

function buildRequiredIfCondition(expression: string, params: Record<string, ParamDefinition>): TSExpression | undefined {
    try {
        const parser = new RequiredIfParser(expression);
        const ast = parser.parse();
        if (!ast) {
            return undefined;
        }

        const code = emitRequiredIfExpression(ast);
        return { kind: 'raw', code };
    } catch (error) {
        console.warn(`Failed to parse required_if expression "${expression}": ${(error as Error).message}`);
        return undefined;
    }
}

type RequiredIfNode =
    | { kind: 'binary'; operator: '&&' | '||'; left: RequiredIfNode; right: RequiredIfNode }
    | { kind: 'not'; operand: RequiredIfNode }
    | { kind: 'comparison'; param: string; operator: '=='; value: RequiredIfValue }
    | { kind: 'in'; param: string; values: RequiredIfValue[] }
    | { kind: 'identifier'; param: string };

type RequiredIfValue = string | number | boolean | null;

class RequiredIfParser {
    private readonly text: string;
    private index = 0;

    constructor(text: string) {
        this.text = text;
    }

    parse(): RequiredIfNode | undefined {
        const node = this.parseOr();
        this.skipWhitespace();
        if (this.index < this.text.length) {
            throw new Error('Unexpected token in expression');
        }
        return node;
    }

    private parseOr(): RequiredIfNode | undefined {
        let left = this.parseAnd();
        while (left) {
            this.skipWhitespace();
            if (this.match('||')) {
                const right = this.parseAnd();
                if (!right) {
                    throw new Error('Expected expression after ||');
                }
                left = { kind: 'binary', operator: '||', left, right };
            } else {
                break;
            }
        }
        return left;
    }

    private parseAnd(): RequiredIfNode | undefined {
        let left = this.parseCondition();
        while (left) {
            this.skipWhitespace();
            if (this.match('&&')) {
                const right = this.parseCondition();
                if (!right) {
                    throw new Error('Expected expression after &&');
                }
                left = { kind: 'binary', operator: '&&', left, right };
            } else {
                break;
            }
        }
        return left;
    }

    private parseCondition(): RequiredIfNode | undefined {
        this.skipWhitespace();

        if (this.match('!')) {
            const operand = this.parseCondition();
            if (!operand) {
                throw new Error('Expected expression after !');
            }
            return { kind: 'not', operand };
        }

        if (this.match('(')) {
            const inner = this.parseOr();
            this.skipWhitespace();
            if (!this.match(')')) {
                throw new Error('Expected closing parenthesis');
            }
            return inner;
        }

        const identifier = this.parseIdentifier();
        if (!identifier) {
            return undefined;
        }

        this.skipWhitespace();
        if (this.matchKeyword('in')) {
            this.skipWhitespace();
            if (!this.match('[')) {
                throw new Error('Expected [ after in');
            }
            const values: RequiredIfValue[] = [];
            while (true) {
                this.skipWhitespace();
                if (this.match(']')) {
                    break;
                }
                const value = this.parseValue();
                if (value === undefined) {
                    throw new Error('Expected value inside []');
                }
                values.push(value);
                this.skipWhitespace();
                if (this.match(']')) {
                    break;
                }
                if (!this.match(',')) {
                    throw new Error('Expected , between values');
                }
            }
            return { kind: 'in', param: identifier, values };
        }

        if (this.match('==')) {
            const value = this.parseValue();
            if (value === undefined) {
                throw new Error('Expected value after ==');
            }
            return { kind: 'comparison', param: identifier, operator: '==', value };
        }

        return { kind: 'identifier', param: identifier };
    }

    private parseIdentifier(): string | undefined {
        this.skipWhitespace();
        const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.text.slice(this.index));
        if (!match) {
            return undefined;
        }
        this.index += match[0].length;
        return match[0];
    }

    private parseValue(): RequiredIfValue | undefined {
        this.skipWhitespace();
        const char = this.text[this.index];
        if (char === "'" || char === '"') {
            return this.parseString(char);
        }

        const numberMatch = /^-?\d+(\.\d+)?/.exec(this.text.slice(this.index));
        if (numberMatch) {
            this.index += numberMatch[0].length;
            return parseFloat(numberMatch[0]);
        }

        const identifier = this.parseIdentifier();
        if (!identifier) {
            const fallback = this.parseFallbackValue();
            return fallback ?? undefined;
        }

        let token = identifier;
        while (this.peek() === '-') {
            const savedIndex = this.index;
            this.index++; // skip '-'
            const continuation = /^[A-Za-z0-9_]+/.exec(this.text.slice(this.index));
            if (!continuation) {
                this.index = savedIndex;
                break;
            }
            token += `-${continuation[0]}`;
            this.index += continuation[0].length;
        }

        if (token === 'true') return true;
        if (token === 'false') return false;
        if (token === 'null') return null;

        return token;
    }

    private peek(): string | undefined {
        return this.text[this.index];
    }

    private parseFallbackValue(): string | undefined {
        const match = /^[^\],)]+/.exec(this.text.slice(this.index));
        if (!match) {
            return undefined;
        }
        this.index += match[0].length;
        return match[0].trim();
    }

    private parseString(quote: string): string {
        this.index++; // skip opening quote
        let result = '';
        while (this.index < this.text.length) {
            const char = this.text[this.index];
            if (char === '\\') {
                const next = this.text[this.index + 1];
                if (next === undefined) break;
                result += next;
                this.index += 2;
            } else if (char === quote) {
                this.index++;
                return result;
            } else {
                result += char;
                this.index++;
            }
        }
        throw new Error('Unterminated string literal');
    }

    private matchKeyword(keyword: string): boolean {
        const regex = new RegExp(`^${keyword}\\b`, 'i');
        const slice = this.text.slice(this.index);
        const match = regex.exec(slice);
        if (match) {
            this.index += match[0].length;
            return true;
        }
        return false;
    }

    private match(str: string): boolean {
        if (this.text.slice(this.index, this.index + str.length) === str) {
            this.index += str.length;
            return true;
        }
        return false;
    }

    private skipWhitespace(): void {
        while (this.index < this.text.length) {
            const char = this.text[this.index];
            if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                this.index++;
            } else {
                break;
            }
        }
    }
}

function emitRequiredIfExpression(node: RequiredIfNode): string {
    switch (node.kind) {
        case 'binary':
            return `(${emitRequiredIfExpression(node.left)} ${node.operator} ${emitRequiredIfExpression(node.right)})`;
        case 'not':
            return `(!${emitRequiredIfExpression(node.operand)})`;
        case 'comparison':
            return `${emitParamAccess(node.param)} === ${emitRequiredIfValue(node.value)}`;
        case 'in':
            return `[${node.values.map(emitRequiredIfValue).join(', ')}].includes(${emitParamAccess(node.param)})`;
        case 'identifier':
            return `!!${emitParamAccess(node.param)}`;
        default:
            return 'false';
    }
}

function emitParamAccess(param: string): string {
    if (isValidIdentifier(param)) {
        return `params.${param}`;
    }
    return `params[${JSON.stringify(param)}]`;
}

function emitRequiredIfValue(value: RequiredIfValue): string {
    if (typeof value === 'string') {
        return JSON.stringify(value);
    }
    if (typeof value === 'number') {
        return String(value);
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    return 'null';
}

function pascalCase(value: string): string {
    return value
        .split(/[^a-zA-Z0-9]/)
        .filter(Boolean)
        .map(part => capitalize(part))
        .join('');
}

/**
 * Check if any parser uses Precise in a compute expression
 */
function usesPrecise(doc: EDLDocument): boolean {
    if (!doc.parsers) {
        return false;
    }

    for (const parser of Object.values(doc.parsers)) {
        if (!parser?.mapping) continue;

        for (const mapping of Object.values(parser.mapping)) {
            if ('compute' in mapping && typeof mapping.compute === 'string') {
                if (mapping.compute.includes('Precise.')) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * Generate value mapping expression
 * Converts raw value to mapped value using ternary for boolean maps
 * or this.safeString with mapping for string keys
 * e.g., { true: 'buy', false: 'sell' } maps boolean to string via ternary
 */
function generateValueMapping(sourceExpr: TSExpression, valueMap: Record<string, any>): TSExpression {
    const keys = Object.keys(valueMap);

    // Check if this is a boolean map (true/false keys)
    if (keys.length === 2 && keys.includes('true') && keys.includes('false')) {
        // Generate: sourceExpr ? 'trueValue' : 'falseValue'
        // This transpiles cleanly to Python/PHP
        return {
            kind: 'conditional',
            test: sourceExpr,
            consequent: valueToExpression(valueMap['true']),
            alternate: valueToExpression(valueMap['false']),
        } as TSExpression;
    }

    // For string keys, use this.safeString with inline mapping
    // Generate: this.safeString ({ 'key1': 'val1', 'key2': 'val2' }, sourceExpr)
    const mapProperties: TSObjectProperty[] = [];
    for (const [key, value] of Object.entries(valueMap)) {
        mapProperties.push({
            key: `'${key}'`,
            value: valueToExpression(value),
        });
    }

    return {
        kind: 'call',
        callee: {
            kind: 'member',
            object: { kind: 'this' },
            property: 'safeString',
        },
        args: [
            { kind: 'object', properties: mapProperties },
            sourceExpr,
        ],
    } as TSExpression;
}
