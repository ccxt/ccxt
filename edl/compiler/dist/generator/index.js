/**
 * EDL Code Generator
 * Transforms EDL documents into TypeScript code
 */
export function generateExchange(doc, options = {}) {
    const baseClass = options.baseClass || 'Exchange';
    const imports = generateImports(doc, baseClass);
    const classDecl = generateClass(doc, baseClass, options);
    return {
        imports,
        statements: [classDecl],
    };
}
function generateImports(doc, baseClass) {
    const imports = [];
    // Base exchange import
    imports.push({
        names: [baseClass],
        from: './base/Exchange.js',
    });
    // Type imports
    const types = ['Dict', 'Int', 'Num', 'Str'];
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
function generateClass(doc, baseClass, options) {
    const members = [];
    // Generate describe() method
    members.push(generateDescribe(doc, options));
    // Generate sign() method if auth is defined
    if (doc.auth) {
        members.push(generateSign(doc.auth, doc.exchange.id, options));
    }
    // Generate parser methods
    if (doc.parsers) {
        for (const [name, parser] of Object.entries(doc.parsers)) {
            members.push(generateParser(name, parser, options));
        }
    }
    // Generate fetch methods from API definition
    if (doc.api) {
        const fetchMethods = generateFetchMethods(doc, options);
        members.push(...fetchMethods);
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
function generateDescribe(doc, options) {
    const exchange = doc.exchange;
    // Build the describe object
    const describeObj = [
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
                                object: {
                                    kind: 'call',
                                    callee: { kind: 'identifier', name: 'super' },
                                    args: [],
                                },
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
function generateSign(auth, exchangeId, options) {
    const body = [];
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
    // Initialize headers and body
    body.push({
        kind: 'variable',
        keyword: 'let',
        name: 'headers',
        type: { kind: 'reference', name: 'Dict' },
        value: { kind: 'identifier', name: 'undefined' },
    });
    body.push({
        kind: 'variable',
        keyword: 'let',
        name: 'body',
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
                prop('body', { kind: 'identifier', name: 'body' }),
                prop('headers', { kind: 'identifier', name: 'headers' }),
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
function generateAuthLogic(auth, exchangeId) {
    const statements = [];
    // Check if private endpoint
    const privateCheck = {
        kind: 'if',
        test: {
            kind: 'binary',
            operator: '===',
            left: { kind: 'identifier', name: 'api' },
            right: literal('private'),
        },
        consequent: [],
    };
    const privateBody = [];
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
    privateCheck.consequent = privateBody;
    // Public endpoint handling
    const publicBody = [{
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
        }];
    privateCheck.alternate = publicBody;
    statements.push(privateCheck);
    return statements;
}
function generateHMACAuth(auth) {
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
                left: { kind: 'identifier', name: 'headers' },
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
                        left: { kind: 'identifier', name: 'body' },
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
                            object: { kind: 'identifier', name: 'headers' },
                            property: 'Content-Type',
                            computed: true,
                        },
                        right: literal('application/x-www-form-urlencoded'),
                    },
                }],
        },
    ];
}
function generateJWTAuth(auth) {
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
                left: { kind: 'identifier', name: 'headers' },
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
    ];
}
function generateAPIKeyAuth(auth) {
    const headerName = auth.headers?.['apiKey'] || 'X-API-KEY';
    return [
        {
            kind: 'expression',
            expression: {
                kind: 'assignment',
                operator: '=',
                left: { kind: 'identifier', name: 'headers' },
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
    ];
}
function generateParser(name, parser, options) {
    const methodName = `parse${capitalize(name)}`;
    const body = [];
    // Get the data from the response
    if (parser.path) {
        body.push({
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
                    literal(parser.path),
                    { kind: 'object', properties: [] },
                ],
            },
        });
    }
    else {
        body.push({
            kind: 'variable',
            keyword: 'const',
            name: 'data',
            value: { kind: 'identifier', name: 'response' },
        });
    }
    // Build result object
    const resultProps = [];
    for (const [field, mapping] of Object.entries(parser.mapping)) {
        resultProps.push(prop(field, generateFieldAccess(mapping, 'data')));
    }
    body.push({
        kind: 'return',
        expression: {
            kind: 'object',
            properties: resultProps,
        },
    });
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
function generateFieldAccess(mapping, dataVar) {
    if ('path' in mapping) {
        let expr = {
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
                right: literal(mapping.default),
            };
        }
        return expr;
    }
    if ('fromContext' in mapping) {
        return {
            kind: 'identifier',
            name: mapping.fromContext,
        };
    }
    if ('compute' in mapping) {
        // For now, return a placeholder - computed fields need runtime evaluation
        return {
            kind: 'identifier',
            name: 'undefined',
        };
    }
    if ('literal' in mapping) {
        return literal(mapping.literal);
    }
    return { kind: 'identifier', name: 'undefined' };
}
function generateFetchMethods(doc, options) {
    const methods = [];
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
function generateFetchTicker(doc, options) {
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
                            property: 'publicGetTicker',
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
function generateFetchOrderBook(doc, options) {
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
                            property: 'publicGetDepth',
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
function generateFetchTrades(doc, options) {
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
                            property: 'publicGetTrades',
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
function generateAPIStructure(api) {
    const props = [];
    for (const [category, methods] of Object.entries(api)) {
        if (!methods)
            continue;
        const methodProps = [];
        for (const [method, endpoints] of Object.entries(methods)) {
            if (!endpoints)
                continue;
            const endpointList = Object.keys(endpoints);
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
function generateHasObject(doc) {
    const has = {
        CORS: undefined,
        spot: true,
        margin: false,
        swap: false,
        future: false,
        option: false,
    };
    // Infer capabilities from parsers and API
    if (doc.parsers) {
        if (doc.parsers.ticker) {
            has['fetchTicker'] = true;
            has['fetchTickers'] = false;
        }
        if (doc.parsers.orderBook || doc.parsers.orderbook) {
            has['fetchOrderBook'] = true;
        }
        if (doc.parsers.trades || doc.parsers.trade) {
            has['fetchTrades'] = true;
        }
        if (doc.parsers.ohlcv) {
            has['fetchOHLCV'] = true;
        }
        if (doc.parsers.balance) {
            has['fetchBalance'] = true;
        }
        if (doc.parsers.order) {
            has['createOrder'] = true;
            has['fetchOrder'] = true;
        }
    }
    // Merge with explicit features
    if (doc.features) {
        Object.assign(has, doc.features);
    }
    // Merge with exchange.has
    if (doc.exchange.has) {
        Object.assign(has, doc.exchange.has);
    }
    return objectFromRecord(has);
}
// Helper functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function literal(value) {
    return { kind: 'literal', value };
}
function arrayLit(elements) {
    return { kind: 'array', elements };
}
function prop(key, value) {
    return { key, value };
}
function objectFromRecord(obj) {
    const props = [];
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined)
            continue;
        let expr;
        if (Array.isArray(value)) {
            expr = arrayLit(value.map(v => typeof v === 'object' ? objectFromRecord(v) : literal(v)));
        }
        else if (typeof value === 'object' && value !== null) {
            expr = objectFromRecord(value);
        }
        else {
            expr = literal(value);
        }
        props.push(prop(key, expr));
    }
    return { kind: 'object', properties: props };
}
function transformToMethod(transform) {
    // Convert snake_case to camelCase
    const camelCase = transform.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    // Map transforms to CCXT safe* methods
    const mapping = {
        parseNumber: 'safeNumber',
        parseString: 'safeString',
        parseTimestamp: 'safeTimestamp',
        parseTimestampMs: 'safeTimestamp',
        omitZero: 'omitZero',
        safeInteger: 'safeInteger',
        safeNumber: 'safeNumber',
        safeString: 'safeString',
        safeTimestamp: 'safeTimestamp',
    };
    return mapping[camelCase] || camelCase;
}
//# sourceMappingURL=index.js.map