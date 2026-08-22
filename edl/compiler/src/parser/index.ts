/**
 * EDL Parser
 * Parses YAML files into EDL document structures
 */

import yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import type {
    EDLDocument,
    ExchangeMetadata,
    AuthMethod,
    APIDefinition,
    APICategory,
    EndpointDefinition,
    ParamDefinition,
    ParserDefinition,
    FieldMapping,
    ErrorDefinition,
    OverrideDefinition,
    MarketsDefinition,
    ValidationError,
    SourceLocation,
} from '../types/edl.js';
import { parseHasFlags } from '../parsing/has-flags.js';

export interface ParseResult {
    success: boolean;
    document?: EDLDocument;
    errors: ParseError[];
}

export interface ParseError {
    message: string;
    location?: SourceLocation;
}

export function parseEDLFile(filePath: string): ParseResult {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return parseEDLContent(content, filePath);
    } catch (error) {
        return {
            success: false,
            errors: [{
                message: `Failed to read file: ${(error as Error).message}`,
                location: { path: filePath }
            }]
        };
    }
}

export function parseEDLContent(content: string, filePath: string = '<inline>'): ParseResult {
    const errors: ParseError[] = [];

    let raw: any;
    try {
        raw = yaml.parse(content);
    } catch (error) {
        return {
            success: false,
            errors: [{
                message: `YAML parse error: ${(error as Error).message}`,
                location: { path: filePath }
            }]
        };
    }

    if (!raw || typeof raw !== 'object') {
        return {
            success: false,
            errors: [{
                message: 'EDL document must be a YAML object',
                location: { path: filePath }
            }]
        };
    }

    // Parse exchange metadata (required)
    if (!raw.exchange) {
        errors.push({
            message: 'Missing required "exchange" section',
            location: { path: filePath }
        });
        return { success: false, errors };
    }

    const exchange = parseExchangeMetadata(raw.exchange, errors, filePath);
    if (!exchange) {
        return { success: false, errors };
    }

    // Allow legacy top-level metadata sections (urls, has, timeframes, requiredCredentials)
    mergeTopLevelMetadata(exchange, raw);

    // Parse optional sections
    const auth = raw.auth ? parseAuthMethod(raw.auth, errors, filePath) : undefined;
    const api = raw.api ? parseAPIDefinition(raw.api, errors, filePath) : undefined;
    const markets = raw.markets ? parseMarketsDefinition(raw.markets, errors, filePath) : undefined;
    const parsers = raw.parsers ? parseParsers(raw.parsers, errors, filePath) : undefined;
    const errorDef = raw.errors ? parseErrorDefinition(raw.errors, errors, filePath) : undefined;
    const overrides = raw.overrides ? parseOverrides(raw.overrides, errors, filePath) : undefined;
    const features = raw.features || raw.has || undefined;

    const document: EDLDocument = {
        version: raw.version,
        exchange,
        auth,
        api,
        markets,
        parsers,
        errors: errorDef,
        overrides,
        features,
    };

    return {
        success: errors.length === 0,
        document,
        errors
    };
}

function mergeTopLevelMetadata(exchange: ExchangeMetadata, raw: any) {
    const mergeRecord = (target: Record<string, any> | undefined, source: Record<string, any> | undefined) => {
        if (!source) {
            return target;
        }
        return { ...(target || {}), ...source };
    };

    if (raw.urls) {
        exchange.urls = mergeRecord(exchange.urls, raw.urls);
    }

    if (raw.has) {
        // Parse and validate has flags using the has-flags parser
        const hasResult = parseHasFlags(raw.has, { path: 'has' });
        if (hasResult.errors.length > 0) {
            // Log warnings but don't fail the parse
            console.warn('Has flags validation warnings:', hasResult.errors.map(e => e.message));
        }
        exchange.has = mergeRecord(exchange.has, hasResult.schema as any);
    }

    if (raw.timeframes) {
        exchange.timeframes = mergeRecord(exchange.timeframes, raw.timeframes);
    }

    if (raw.requiredCredentials || raw.required_credentials) {
        const required = raw.requiredCredentials || raw.required_credentials;
        exchange.requiredCredentials = mergeRecord(exchange.requiredCredentials, required);
    }

    if (raw.commonCurrencies || raw.common_currencies) {
        const currencies = raw.commonCurrencies || raw.common_currencies;
        exchange.commonCurrencies = mergeRecord(exchange.commonCurrencies, currencies);
    }
}

function parseExchangeMetadata(raw: any, errors: ParseError[], filePath: string): ExchangeMetadata | null {
    if (typeof raw !== 'object') {
        errors.push({
            message: '"exchange" must be an object',
            location: { path: `${filePath}:exchange` }
        });
        return null;
    }

    if (!raw.id || typeof raw.id !== 'string') {
        errors.push({
            message: 'exchange.id is required and must be a string',
            location: { path: `${filePath}:exchange.id` }
        });
        return null;
    }

    if (!raw.name || typeof raw.name !== 'string') {
        errors.push({
            message: 'exchange.name is required and must be a string',
            location: { path: `${filePath}:exchange.name` }
        });
        return null;
    }

    const countries = Array.isArray(raw.countries) ? raw.countries : [raw.countries].filter(Boolean);

    // Parse has flags if present
    let hasFlags: any = undefined;
    if (raw.has) {
        const hasResult = parseHasFlags(raw.has, { path: `${filePath}:exchange.has` });
        if (hasResult.errors.length > 0) {
            // Add errors to the main error list
            for (const err of hasResult.errors) {
                errors.push({
                    message: err.message,
                    location: err.location,
                });
            }
        }
        hasFlags = hasResult.schema as any;
    }

    return {
        id: raw.id,
        name: raw.name,
        countries,
        version: raw.version,
        rateLimit: raw.rateLimit || raw.rate_limit || 1000,
        certified: raw.certified,
        pro: raw.pro,
        hostname: raw.hostname,
        urls: raw.urls,
        has: hasFlags,
        timeframes: raw.timeframes,
        requiredCredentials: raw.requiredCredentials || raw.required_credentials,
    };
}

function parseAuthMethod(raw: any, errors: ParseError[], filePath: string): AuthMethod | undefined {
    if (typeof raw !== 'object') {
        errors.push({
            message: '"auth" must be an object',
            location: { path: `${filePath}:auth` }
        });
        return undefined;
    }

    const validTypes = ['hmac', 'jwt', 'rsa', 'eddsa', 'apiKey', 'oauth', 'custom'];
    if (!validTypes.includes(raw.type)) {
        errors.push({
            message: `Invalid auth type "${raw.type}". Must be one of: ${validTypes.join(', ')}`,
            location: { path: `${filePath}:auth.type` }
        });
    }

    return {
        type: raw.type,
        algorithm: raw.algorithm,
        encoding: raw.encoding,
        location: raw.location,
        headers: raw.headers,
        timestampField: raw.timestampField || raw.timestamp_field,
        nonceField: raw.nonceField || raw.nonce_field,
        signatureField: raw.signatureField || raw.signature_field,
        custom: raw.custom,
    };
}

function parseAPIDefinition(raw: any, errors: ParseError[], filePath: string): APIDefinition {
    const api: APIDefinition = {};

    for (const [categoryName, category] of Object.entries(raw)) {
        if (typeof category !== 'object') continue;

        api[categoryName] = parseAPICategory(category as any, errors, `${filePath}:api.${categoryName}`);
    }

    return api;
}

function parseAPICategory(raw: any, errors: ParseError[], pathContext: string): APICategory {
    const category: APICategory = {};
    const methods = ['get', 'post', 'put', 'delete', 'patch'];

    for (const method of methods) {
        if (raw[method] && typeof raw[method] === 'object') {
            category[method as keyof APICategory] = {};
            for (const [endpointName, endpoint] of Object.entries(raw[method])) {
                category[method as keyof APICategory]![endpointName] = parseEndpointDefinition(
                    endpoint,
                    errors,
                    `${pathContext}.${method}.${endpointName}`
                );
            }
        }
    }

    return category;
}

function parseEndpointDefinition(raw: any, errors: ParseError[], pathContext: string): EndpointDefinition {
    if (typeof raw !== 'object' || raw === null) {
        // Simple endpoint with just a name, no params
        return { cost: 1 };
    }

    const params: Record<string, ParamDefinition> | undefined = raw.params
        ? Object.fromEntries(
            Object.entries(raw.params).map(([name, param]) => [
                name,
                parseParamDefinition(param, errors, `${pathContext}.params.${name}`)
            ])
        )
        : undefined;

    return {
        path: raw.path,
        cost: raw.cost ?? 1,
        params,
        response: raw.response,
        rateLimit: raw.rateLimit || raw.rate_limit,
    };
}

function parseParamDefinition(raw: any, errors: ParseError[], pathContext: string): ParamDefinition {
    if (typeof raw === 'string') {
        return { type: raw as any, required: false };
    }

    if (typeof raw !== 'object') {
        errors.push({
            message: 'Parameter definition must be a string or object',
            location: { path: pathContext }
        });
        return { type: 'string', required: false };
    }

    return {
        type: raw.type || 'string',
        required: raw.required ?? false,
        required_if: raw.required_if,
        default: raw.default,
        description: raw.description,
        enum: raw.enum,
        dependencies: raw.dependencies,
        location: raw.location,
        alias: raw.alias,
        validate: raw.validate,
        transform: raw.transform,
    };
}

function parseMarketsDefinition(raw: any, errors: ParseError[], filePath: string): MarketsDefinition {
    return {
        endpoint: raw.endpoint,
        path: raw.path,
        parser: raw.parser,
        symbolMapping: raw.symbolMapping || raw.symbol_mapping,
        filters: raw.filters,
    };
}

function parseParsers(raw: any, errors: ParseError[], filePath: string): Record<string, ParserDefinition> {
    const parsers: Record<string, ParserDefinition> = {};

    for (const [name, def] of Object.entries(raw)) {
        if (typeof def !== 'object') continue;

        const parserDef = def as any;
        const iterator = parserDef.iterator || parserDef.iterable;
        const postProcessRaw = parserDef.postProcess || parserDef.post_process;
        const postProcessArray = Array.isArray(postProcessRaw)
            ? postProcessRaw
            : (postProcessRaw ? [postProcessRaw] : undefined);
        const normalizedPostProcess = postProcessArray?.map((step: any) => {
            if (typeof step === 'string') {
                return { name: step };
            }
            return {
                name: step.name,
                args: step.args,
            };
        });
        parsers[name] = {
            source: parserDef.source,
            path: parserDef.path,
            iterator: iterator as any,  // 'array' | 'entries' | 'values' | undefined
            isArray: parserDef.isArray || parserDef.is_array || iterator === 'array',
            mapping: parseMapping(parserDef.mapping || {}, errors, `${filePath}:parsers.${name}`),
            postProcess: normalizedPostProcess,
            structure: parserDef.structure as 'balance' | 'default' | undefined,
        };
    }

    return parsers;
}

function parseMapping(raw: any, errors: ParseError[], pathContext: string): Record<string, FieldMapping> {
    const mapping: Record<string, FieldMapping> = {};

    for (const [field, def] of Object.entries(raw)) {
        mapping[field] = parseFieldMapping(def, errors, `${pathContext}.mapping.${field}`);
    }

    return mapping;
}

function parseFieldMapping(raw: any, errors: ParseError[], pathContext: string): FieldMapping {
    if (typeof raw === 'string') {
        // Simple path mapping
        return { path: raw };
    }

    if (typeof raw !== 'object' || raw === null) {
        errors.push({
            message: 'Field mapping must be a string or object',
            location: { path: pathContext }
        });
        return { literal: null };
    }

    // Check for different mapping types
    if ('path' in raw) {
        return {
            path: raw.path,
            transform: raw.transform,
            default: raw.default,
            map: raw.map,  // Value mapping for converting raw values
        };
    }

    if ('from_context' in raw || 'fromContext' in raw) {
        return {
            fromContext: raw.from_context || raw.fromContext,
            transform: raw.transform,  // Include transform for context mappings
        };
    }

    if ('compute' in raw) {
        return {
            compute: raw.compute,
            dependencies: raw.dependencies,
        };
    }

    if ('literal' in raw) {
        return { literal: raw.literal };
    }

    if ('conditional' in raw) {
        return {
            conditional: {
                if: raw.conditional.if,
                then: parseFieldMapping(raw.conditional.then, errors, `${pathContext}.then`),
                else: parseFieldMapping(raw.conditional.else, errors, `${pathContext}.else`),
            }
        };
    }

    // Default: treat entire object as a literal
    return { literal: raw };
}

function parseErrorDefinition(raw: any, errors: ParseError[], filePath: string): ErrorDefinition {
    return {
        patterns: raw.patterns?.map((p: any) => ({
            match: p.match,
            type: p.type,
            retry: p.retry,
            regex: p.regex,
        })),
        httpCodes: raw.httpCodes || raw.http_codes,
        fields: raw.fields,
    };
}

function parseOverrides(raw: any, errors: ParseError[], filePath: string): OverrideDefinition[] {
    if (!Array.isArray(raw)) {
        errors.push({
            message: '"overrides" must be an array',
            location: { path: `${filePath}:overrides` }
        });
        return [];
    }

    return raw.map((o: any) => ({
        method: o.method,
        description: o.description,
        file: o.file,
    }));
}
