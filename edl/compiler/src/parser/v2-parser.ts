/**
 * Enhanced EDL Parser v2
 * Parses YAML files into enhanced EDL document structures
 * with support for expressions, pipelines, and variants
 */

import yaml from 'yaml';
import * as fs from 'fs';
import type {
    EnhancedEDLDocument,
    EnhancedExchangeMetadata,
    EnhancedAuthMethod,
    AuthVariant,
    SigningStep,
    EnhancedAPIDefinition,
    EnhancedAPICategory,
    EnhancedEndpoint,
    EnhancedParserDefinition,
    EnhancedFieldMapping,
    MethodVariants,
    Expression,
    ExpressionShorthand,
} from '../types/edl-v2.js';

export interface ParseResult {
    success: boolean;
    document?: EnhancedEDLDocument;
    errors: ParseError[];
    warnings: ParseWarning[];
}

export interface ParseError {
    message: string;
    path: string;
    line?: number;
}

export interface ParseWarning {
    message: string;
    path: string;
}

/**
 * Parse an EDL v2 file from disk
 */
export function parseEDLv2File(filePath: string): ParseResult {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return parseEDLv2Content(content, filePath);
    } catch (error) {
        return {
            success: false,
            errors: [{
                message: `Failed to read file: ${(error as Error).message}`,
                path: filePath
            }],
            warnings: []
        };
    }
}

/**
 * Parse EDL v2 content from a string
 */
export function parseEDLv2Content(content: string, filePath: string = '<inline>'): ParseResult {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    let raw: any;
    try {
        raw = yaml.parse(content);
    } catch (error) {
        return {
            success: false,
            errors: [{
                message: `YAML parse error: ${(error as Error).message}`,
                path: filePath
            }],
            warnings: []
        };
    }

    if (!raw || typeof raw !== 'object') {
        return {
            success: false,
            errors: [{
                message: 'EDL document must be a YAML object',
                path: filePath
            }],
            warnings: []
        };
    }

    // Check version
    const version = raw.version || '1.0';
    if (!version.startsWith('2')) {
        warnings.push({
            message: `EDL version ${version} - consider upgrading to 2.0 for enhanced features`,
            path: 'version'
        });
    }

    // Parse exchange metadata (required)
    if (!raw.exchange) {
        errors.push({
            message: 'Missing required "exchange" section',
            path: filePath
        });
        return { success: false, errors, warnings };
    }

    const exchange = parseExchangeMetadata(raw.exchange, errors, warnings);
    if (!exchange) {
        return { success: false, errors, warnings };
    }

    // Parse optional sections
    const auth = raw.auth ? parseAuthMethod(raw.auth, errors, warnings) : undefined;
    const api = raw.api ? parseAPIDefinition(raw.api, errors, warnings) : undefined;
    const parsers = raw.parsers ? parseParsers(raw.parsers, errors, warnings) : undefined;
    const methods = raw.methods ? parseMethods(raw.methods, errors, warnings) : undefined;
    const errorsDef = raw.errors ? parseErrors(raw.errors, errors, warnings) : undefined;
    const transforms = raw.transforms ? parseTransforms(raw.transforms, errors, warnings) : undefined;
    const features = raw.features || {};
    const options = raw.options || {};

    const document: EnhancedEDLDocument = {
        version,
        exchange,
        auth,
        api,
        parsers,
        methods,
        errors: errorsDef,
        features,
        options,
    };

    // Store transforms in options for code generation
    if (transforms) {
        document.options = { ...document.options, transforms };
    }

    return {
        success: errors.length === 0,
        document,
        errors,
        warnings
    };
}

function parseExchangeMetadata(raw: any, errors: ParseError[], warnings: ParseWarning[]): EnhancedExchangeMetadata | null {
    if (!raw.id || typeof raw.id !== 'string') {
        errors.push({
            message: 'exchange.id is required and must be a string',
            path: 'exchange.id'
        });
        return null;
    }

    if (!raw.name || typeof raw.name !== 'string') {
        errors.push({
            message: 'exchange.name is required and must be a string',
            path: 'exchange.name'
        });
        return null;
    }

    const countries = Array.isArray(raw.countries) ? raw.countries : [raw.countries].filter(Boolean);

    return {
        id: raw.id,
        name: raw.name,
        countries,
        version: raw.version,
        rateLimit: raw.rateLimit || raw.rate_limit || 1000,
        certified: raw.certified,
        pro: raw.pro,
        urls: raw.urls,
        requiredCredentials: raw.requiredCredentials || raw.required_credentials,
        timeSync: raw.timeSync || raw.time_sync,
        broker: raw.broker,
    };
}

function parseAuthMethod(raw: any, errors: ParseError[], warnings: ParseWarning[]): EnhancedAuthMethod {
    const auth: EnhancedAuthMethod = {};

    // Parse default variant
    if (raw.default) {
        auth.default = parseAuthVariant(raw.default, errors, warnings, 'auth.default');
    }

    // Parse named variants
    if (raw.variants) {
        auth.variants = {};
        for (const [name, variant] of Object.entries(raw.variants)) {
            auth.variants[name] = parseAuthVariant(variant, errors, warnings, `auth.variants.${name}`);
        }
    }

    // Parse selection rules
    if (raw.select) {
        auth.select = raw.select.map((rule: any, i: number) => ({
            condition: parseExpression(rule.condition, `auth.select[${i}].condition`),
            variant: typeof rule.variant === 'string' ? rule.variant : parseAuthVariant(rule.variant, errors, warnings, `auth.select[${i}].variant`)
        }));
    }

    // Parse endpoint overrides
    if (raw.endpoints) {
        auth.endpoints = {};
        for (const [endpoint, override] of Object.entries(raw.endpoints)) {
            if (typeof override === 'string') {
                auth.endpoints[endpoint] = override;
            } else {
                auth.endpoints[endpoint] = parseAuthVariant(override, errors, warnings, `auth.endpoints.${endpoint}`);
            }
        }
    }

    return auth;
}

function parseAuthVariant(raw: any, errors: ParseError[], warnings: ParseWarning[], path: string): AuthVariant {
    const variant: AuthVariant = {
        type: raw.type || 'hmac'
    };

    // Parse signing pipeline
    if (raw.pipeline) {
        variant.pipeline = raw.pipeline.map((step: any, i: number) =>
            parseSigningStep(step, errors, warnings, `${path}.pipeline[${i}]`)
        );
    }

    // Simple single-step signing
    if (raw.algorithm) variant.algorithm = raw.algorithm;
    if (raw.encoding) variant.encoding = raw.encoding;

    // Signature input/output
    if (raw.signatureInput) {
        variant.signatureInput = {
            components: raw.signatureInput.components?.map((c: any) => ({
                source: c.source,
                value: c.value ? parseExpression(c.value, `${path}.signatureInput`) : undefined,
                transform: c.transform
            })) || [],
            separator: raw.signatureInput.separator
        };
    }

    if (raw.signatureOutput) {
        variant.signatureOutput = {
            location: raw.signatureOutput.location,
            name: raw.signatureOutput.name,
            format: raw.signatureOutput.format,
            prefix: raw.signatureOutput.prefix
        };
    }

    // Headers
    if (raw.headers) {
        variant.headers = {};
        for (const [key, value] of Object.entries(raw.headers)) {
            variant.headers[key] = parseExpression(value, `${path}.headers.${key}`);
        }
    }

    // Nonce configuration
    if (raw.nonce) {
        variant.nonce = {
            type: raw.nonce.type || 'timestamp_ms',
            adjustment: raw.nonce.adjustment ? parseExpression(raw.nonce.adjustment, `${path}.nonce.adjustment`) : undefined
        };
    }

    return variant;
}

function parseSigningStep(raw: any, errors: ParseError[], warnings: ParseWarning[], path: string): SigningStep {
    return {
        operation: raw.operation,
        algorithm: raw.algorithm,
        input: parseExpression(raw.input, `${path}.input`),
        key: raw.key ? parseExpression(raw.key, `${path}.key`) : undefined,
        encoding: raw.encoding,
        output: raw.output
    };
}

function parseAPIDefinition(raw: any, errors: ParseError[], warnings: ParseWarning[]): EnhancedAPIDefinition {
    const api: EnhancedAPIDefinition = {};

    for (const [categoryName, category] of Object.entries(raw)) {
        if (categoryName === 'baseUrls') {
            api.baseUrls = category as Record<string, string>;
            continue;
        }

        if (typeof category !== 'object' || category === null) continue;

        api[categoryName] = parseAPICategory(category, errors, warnings, `api.${categoryName}`);
    }

    return api;
}

function parseAPICategory(raw: any, errors: ParseError[], warnings: ParseWarning[], path: string): EnhancedAPICategory {
    const category: EnhancedAPICategory = {};
    const methods = ['get', 'post', 'put', 'delete', 'patch'];

    for (const method of methods) {
        if (raw[method] && typeof raw[method] === 'object') {
            const endpoints: Record<string, EnhancedEndpoint> = {};
            for (const [endpointName, endpoint] of Object.entries(raw[method])) {
                endpoints[endpointName] = parseEndpoint(endpoint, errors, warnings, `${path}.${method}.${endpointName}`);
            }
            (category as any)[method] = endpoints;
        }
    }

    if (raw.auth) category.auth = raw.auth;
    if (raw.defaultCost) category.defaultCost = raw.defaultCost;

    return category;
}

function parseEndpoint(raw: any, errors: ParseError[], warnings: ParseWarning[], path: string): EnhancedEndpoint {
    if (typeof raw !== 'object' || raw === null) {
        return { cost: 1 };
    }

    const endpoint: EnhancedEndpoint = {
        path: raw.path,
        cost: raw.cost,
        auth: raw.auth,
    };

    // Parse parameters
    if (raw.params) {
        endpoint.params = {};
        for (const [name, param] of Object.entries(raw.params)) {
            endpoint.params[name] = parseParamDefinition(param, path);
        }
    }

    // Parse body config
    if (raw.body) {
        endpoint.body = {
            encoding: raw.body.encoding,
            conditional: raw.body.conditional?.map((c: any) => ({
                condition: parseExpression(c.condition, `${path}.body.conditional`),
                encoding: c.encoding
            }))
        };
    }

    // Parse response config
    if (raw.response) {
        endpoint.response = {
            formatDetection: raw.response.formatDetection ? {
                rules: raw.response.formatDetection.rules?.map((r: any) => ({
                    condition: parseExpression(r.condition, `${path}.response.formatDetection`),
                    parser: r.parser
                })) || [],
                default: raw.response.formatDetection.default
            } : undefined,
            parser: raw.response.parser,
            errorDetection: raw.response.errorDetection ? {
                isError: parseExpression(raw.response.errorDetection.isError, `${path}.response.errorDetection`),
                errorCode: raw.response.errorDetection.errorCode ? parseExpression(raw.response.errorDetection.errorCode, `${path}.response.errorDetection`) : undefined,
                errorMessage: raw.response.errorDetection.errorMessage ? parseExpression(raw.response.errorDetection.errorMessage, `${path}.response.errorDetection`) : undefined
            } : undefined
        };
    }

    // Parse rate limit
    if (raw.rateLimit) {
        endpoint.rateLimit = {
            cost: raw.rateLimit.cost,
            interval: raw.rateLimit.interval,
            limit: raw.rateLimit.limit,
            conditions: raw.rateLimit.conditions?.map((c: any) => ({
                when: parseExpression(c.when, `${path}.rateLimit.conditions`),
                cost: c.cost
            }))
        };
    }

    // Parse flags
    if (raw.flags) {
        endpoint.flags = raw.flags;
    }

    return endpoint;
}

function parseParamDefinition(raw: any, path: string): any {
    if (typeof raw === 'string') {
        return { type: raw, required: false };
    }

    return {
        type: raw.type || 'string',
        required: raw.required,
        requiredIf: raw.requiredIf ? parseExpression(raw.requiredIf, path) : undefined,
        default: raw.default,
        alias: raw.alias,
        transform: raw.transform,
        validate: raw.validate ? parseExpression(raw.validate, path) : undefined,
        description: raw.description
    };
}

function parseParsers(raw: any, errors: ParseError[], warnings: ParseWarning[]): Record<string, EnhancedParserDefinition> {
    const parsers: Record<string, EnhancedParserDefinition> = {};

    for (const [name, def] of Object.entries(raw)) {
        if (typeof def !== 'object' || def === null) continue;
        parsers[name] = parseParserDefinition(def, errors, warnings, `parsers.${name}`);
    }

    return parsers;
}

function parseParserDefinition(raw: any, errors: ParseError[], warnings: ParseWarning[], path: string): EnhancedParserDefinition {
    const parser: EnhancedParserDefinition = {
        source: raw.source,
        isArray: raw.isArray,
        mapping: {}
    };

    // Parse iteration config
    if (raw.iterate) {
        parser.iterate = {
            array: raw.iterate.array ? parseExpression(raw.iterate.array, `${path}.iterate`) : undefined,
            itemVar: raw.iterate.itemVar || raw.iterate.keys ? undefined : 'item',
            indexVar: raw.iterate.indexVar
        };

        // Handle object key iteration
        if (raw.iterate.keys) {
            (parser.iterate as any).keys = true;
            (parser.iterate as any).valueVar = raw.iterate.valueVar;
        }

        // Handle filter
        if (raw.iterate.filter) {
            (parser.iterate as any).filter = parseExpression(raw.iterate.filter, `${path}.iterate.filter`);
        }
    }

    // Parse field mappings
    if (raw.mapping) {
        // Check if it's a reference to another parser
        if (typeof raw.mapping === 'string') {
            parser.mapping = { _ref: raw.mapping } as any;
        } else {
            for (const [field, mapping] of Object.entries(raw.mapping)) {
                parser.mapping[field] = parseFieldMapping(mapping, `${path}.mapping.${field}`);
            }
        }
    }

    // Parse post-processing
    if (raw.postProcess) {
        parser.postProcess = raw.postProcess.map((step: any) => ({
            operation: step.operation,
            args: step.args?.map((arg: any) => parseExpression(arg, `${path}.postProcess`))
        }));
    }

    // Parse context
    if (raw.context) {
        parser.context = {};
        for (const [key, value] of Object.entries(raw.context)) {
            parser.context[key] = parseExpression(value, `${path}.context.${key}`);
        }
    }

    // Fallback source
    if (raw.fallback) {
        (parser as any).fallback = raw.fallback;
    }

    return parser;
}

function parseFieldMapping(raw: any, path: string): EnhancedFieldMapping {
    // Simple path string
    if (typeof raw === 'string') {
        return raw;
    }

    // Object-based mapping
    if (typeof raw !== 'object' || raw === null) {
        return { path: String(raw) };
    }

    // Path mapping with options
    if ('path' in raw) {
        return {
            path: raw.path,
            transform: raw.transform,
            default: raw.default
        };
    }

    // Compute mapping
    if ('compute' in raw) {
        return {
            compute: parseExpression(raw.compute, path)
        };
    }

    // Conditional mapping
    if ('if' in raw) {
        return {
            if: parseExpression(raw.if, `${path}.if`),
            then: parseFieldMapping(raw.then, `${path}.then`),
            else: raw.else ? parseFieldMapping(raw.else, `${path}.else`) : undefined
        };
    }

    // Switch mapping
    if ('switch' in raw) {
        const cases: Record<string, EnhancedFieldMapping> = {};
        for (const [key, value] of Object.entries(raw.cases || {})) {
            cases[key] = parseFieldMapping(value, `${path}.cases.${key}`);
        }
        return {
            switch: parseExpression(raw.switch, `${path}.switch`),
            cases,
            default: raw.default ? parseFieldMapping(raw.default, `${path}.default`) : undefined
        };
    }

    // Array mapping
    if ('map' in raw) {
        const itemMapping: Record<string, EnhancedFieldMapping> = {};
        for (const [key, value] of Object.entries(raw.itemMapping || {})) {
            itemMapping[key] = parseFieldMapping(value, `${path}.itemMapping.${key}`);
        }
        return {
            map: raw.map,
            itemMapping
        };
    }

    // Literal value
    if ('literal' in raw) {
        return { literal: raw.literal } as any;
    }

    // Sub-mapping for nested objects
    if ('subMapping' in raw) {
        const subMapping: Record<string, EnhancedFieldMapping> = {};
        for (const [key, value] of Object.entries(raw.subMapping || {})) {
            subMapping[key] = parseFieldMapping(value, `${path}.subMapping.${key}`);
        }
        return { path: raw.path, subMapping } as any;
    }

    // Context reference
    if ('context' in raw) {
        return { context: raw.context } as any;
    }

    // Treat as object with computed fields
    const result: any = {};
    for (const [key, value] of Object.entries(raw)) {
        result[key] = parseFieldMapping(value, `${path}.${key}`);
    }
    return result;
}

function parseMethods(raw: any, errors: ParseError[], warnings: ParseWarning[]): Record<string, MethodVariants | any> {
    const methods: Record<string, any> = {};

    for (const [name, def] of Object.entries(raw)) {
        if (typeof def !== 'object' || def === null) continue;

        const methodDef = def as any;

        // Check if it's a variants definition
        if (methodDef.variants || methodDef.selection) {
            methods[name] = {
                selection: methodDef.selection ? {
                    param: methodDef.selection.param,
                    rules: methodDef.selection.rules?.map((r: any) => ({
                        condition: parseExpression(r.condition, `methods.${name}.selection`),
                        variant: r.variant
                    })),
                    default: methodDef.selection.default
                } : undefined,
                variants: methodDef.variants?.map((v: any) => ({
                    name: v.name,
                    condition: v.condition ? parseExpression(v.condition, `methods.${name}.variants`) : undefined,
                    endpoint: v.endpoint,
                    request: v.request ? {
                        params: v.request.params ? Object.fromEntries(
                            Object.entries(v.request.params).map(([k, val]) => [k, parseExpression(val, `methods.${name}.variants.request.params.${k}`)])
                        ) : undefined,
                        transforms: v.request.transforms
                    } : undefined,
                    response: v.response
                }))
            };
        } else {
            // Simple single variant
            methods[name] = {
                endpoint: methodDef.endpoint,
                request: methodDef.request,
                response: methodDef.response
            };
        }
    }

    return methods;
}

function parseErrors(raw: any, errors: ParseError[], warnings: ParseWarning[]): any {
    const result: any = {};

    if (raw.default) {
        result.default = {
            exact: raw.default.exact || {},
            broad: raw.default.broad || {}
        };
    }

    if (raw.mappings) {
        result.mappings = {};
        for (const [market, mapping] of Object.entries(raw.mappings)) {
            result.mappings[market] = {
                exact: (mapping as any).exact || {},
                broad: (mapping as any).broad || {}
            };
        }
    }

    if (raw.httpCodes) {
        result.httpCodes = raw.httpCodes;
    }

    return result;
}

function parseTransforms(raw: any, errors: ParseError[], warnings: ParseWarning[]): Record<string, any> {
    const transforms: Record<string, any> = {};

    for (const [name, def] of Object.entries(raw)) {
        if (typeof def !== 'object' || def === null) {
            transforms[name] = def;
            continue;
        }

        const transformDef = def as any;

        // Switch-based transform
        if ('switch' in transformDef) {
            transforms[name] = {
                type: 'switch',
                expression: parseExpression(transformDef.switch, `transforms.${name}.switch`),
                cases: transformDef.cases || {},
                default: transformDef.default
            };
        }
        // Conditional transform
        else if ('if' in transformDef) {
            transforms[name] = {
                type: 'conditional',
                condition: parseExpression(transformDef.if, `transforms.${name}.if`),
                then: transformDef.then,
                else: transformDef.else
            };
        }
        // Computed transform
        else if ('compute' in transformDef) {
            transforms[name] = {
                type: 'compute',
                expression: parseExpression(transformDef.compute, `transforms.${name}.compute`)
            };
        }
        // Array transform
        else if ('isArray' in transformDef) {
            transforms[name] = {
                type: 'array',
                mapping: transformDef.mapping
            };
        }
        else {
            transforms[name] = def;
        }
    }

    return transforms;
}

/**
 * Parse expression shorthand into Expression type
 */
function parseExpression(raw: any, path: string): Expression {
    if (raw === null || raw === undefined) {
        return { type: 'literal', value: null };
    }

    // Literal values
    if (typeof raw === 'number' || typeof raw === 'boolean') {
        return { type: 'literal', value: raw };
    }

    // String expressions
    if (typeof raw === 'string') {
        // Path reference: "$path.to.value"
        if (raw.startsWith('$')) {
            return { type: 'path', path: raw.slice(1) };
        }

        // Template: "{{expression}}"
        if (raw.includes('{{') && raw.includes('}}')) {
            const parts: (string | Expression)[] = [];
            let remaining = raw;
            let match;
            const templateRegex = /\{\{([^}]+)\}\}/g;

            let lastIndex = 0;
            while ((match = templateRegex.exec(raw)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(raw.slice(lastIndex, match.index));
                }
                parts.push(parseExpression(`$${match[1]}`, path));
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < raw.length) {
                parts.push(raw.slice(lastIndex));
            }

            return { type: 'template', parts };
        }

        // Plain string literal
        return { type: 'literal', value: raw };
    }

    // Array expression
    if (Array.isArray(raw)) {
        return {
            type: 'array',
            elements: raw.map((el, i) => parseExpression(el, `${path}[${i}]`))
        };
    }

    // Object expressions
    if (typeof raw === 'object') {
        // Binary operation: { op: '+', left: ..., right: ... }
        if ('op' in raw && 'left' in raw && 'right' in raw) {
            return {
                type: 'binary',
                operator: raw.op,
                left: parseExpression(raw.left, `${path}.left`),
                right: parseExpression(raw.right, `${path}.right`)
            };
        }

        // Unary operation: { op: '!', operand: ... }
        if ('op' in raw && 'operand' in raw) {
            return {
                type: 'unary',
                operator: raw.op,
                operand: parseExpression(raw.operand, `${path}.operand`)
            };
        }

        // Function call: { call: 'funcName', args: [...] }
        if ('call' in raw) {
            return {
                type: 'call',
                function: raw.call,
                args: (raw.args || []).map((arg: any, i: number) => parseExpression(arg, `${path}.args[${i}]`))
            };
        }

        // Conditional: { if: ..., then: ..., else: ... }
        if ('if' in raw && 'then' in raw) {
            return {
                type: 'conditional',
                condition: parseExpression(raw.if, `${path}.if`),
                then: parseExpression(raw.then, `${path}.then`),
                else: parseExpression(raw.else, `${path}.else`)
            };
        }

        // Path shorthand: { path: '...' }
        if ('path' in raw && Object.keys(raw).length === 1) {
            return { type: 'path', path: raw.path };
        }

        // Literal shorthand: { literal: ... }
        if ('literal' in raw) {
            return { type: 'literal', value: raw.literal };
        }

        // Object expression
        const properties: Record<string, Expression> = {};
        for (const [key, value] of Object.entries(raw)) {
            properties[key] = parseExpression(value, `${path}.${key}`);
        }
        return { type: 'object', properties };
    }

    // Default to literal
    return { type: 'literal', value: raw };
}

// Export the expression parser for use by generator
export { parseExpression };
