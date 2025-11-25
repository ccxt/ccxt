/**
 * EDL Parser
 * Parses YAML files into EDL document structures
 */
import yaml from 'yaml';
import * as fs from 'fs';
export function parseEDLFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return parseEDLContent(content, filePath);
    }
    catch (error) {
        return {
            success: false,
            errors: [{
                    message: `Failed to read file: ${error.message}`,
                    location: { path: filePath }
                }]
        };
    }
}
export function parseEDLContent(content, filePath = '<inline>') {
    const errors = [];
    let raw;
    try {
        raw = yaml.parse(content);
    }
    catch (error) {
        return {
            success: false,
            errors: [{
                    message: `YAML parse error: ${error.message}`,
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
    // Parse optional sections
    const auth = raw.auth ? parseAuthMethod(raw.auth, errors, filePath) : undefined;
    const api = raw.api ? parseAPIDefinition(raw.api, errors, filePath) : undefined;
    const markets = raw.markets ? parseMarketsDefinition(raw.markets, errors, filePath) : undefined;
    const parsers = raw.parsers ? parseParsers(raw.parsers, errors, filePath) : undefined;
    const errorDef = raw.errors ? parseErrorDefinition(raw.errors, errors, filePath) : undefined;
    const overrides = raw.overrides ? parseOverrides(raw.overrides, errors, filePath) : undefined;
    const features = raw.features || raw.has || undefined;
    const document = {
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
function parseExchangeMetadata(raw, errors, filePath) {
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
        has: raw.has,
        timeframes: raw.timeframes,
        requiredCredentials: raw.requiredCredentials || raw.required_credentials,
    };
}
function parseAuthMethod(raw, errors, filePath) {
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
function parseAPIDefinition(raw, errors, filePath) {
    const api = {};
    for (const [categoryName, category] of Object.entries(raw)) {
        if (typeof category !== 'object')
            continue;
        api[categoryName] = parseAPICategory(category, errors, `${filePath}:api.${categoryName}`);
    }
    return api;
}
function parseAPICategory(raw, errors, pathContext) {
    const category = {};
    const methods = ['get', 'post', 'put', 'delete', 'patch'];
    for (const method of methods) {
        if (raw[method] && typeof raw[method] === 'object') {
            category[method] = {};
            for (const [endpointName, endpoint] of Object.entries(raw[method])) {
                category[method][endpointName] = parseEndpointDefinition(endpoint, errors, `${pathContext}.${method}.${endpointName}`);
            }
        }
    }
    return category;
}
function parseEndpointDefinition(raw, errors, pathContext) {
    if (typeof raw !== 'object' || raw === null) {
        // Simple endpoint with just a name, no params
        return { cost: 1 };
    }
    const params = raw.params
        ? Object.fromEntries(Object.entries(raw.params).map(([name, param]) => [
            name,
            parseParamDefinition(param, errors, `${pathContext}.params.${name}`)
        ]))
        : undefined;
    return {
        path: raw.path,
        cost: raw.cost ?? 1,
        params,
        response: raw.response,
        rateLimit: raw.rateLimit || raw.rate_limit,
    };
}
function parseParamDefinition(raw, errors, pathContext) {
    if (typeof raw === 'string') {
        return { type: raw, required: false };
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
        default: raw.default,
        alias: raw.alias,
        validate: raw.validate,
        transform: raw.transform,
        description: raw.description,
        requiredIf: raw.required_if || raw.requiredIf,
    };
}
function parseMarketsDefinition(raw, errors, filePath) {
    return {
        endpoint: raw.endpoint,
        path: raw.path,
        parser: raw.parser,
        symbolMapping: raw.symbolMapping || raw.symbol_mapping,
        filters: raw.filters,
    };
}
function parseParsers(raw, errors, filePath) {
    const parsers = {};
    for (const [name, def] of Object.entries(raw)) {
        if (typeof def !== 'object')
            continue;
        const parserDef = def;
        parsers[name] = {
            source: parserDef.source,
            path: parserDef.path,
            isArray: parserDef.isArray || parserDef.is_array,
            mapping: parseMapping(parserDef.mapping || {}, errors, `${filePath}:parsers.${name}`),
            postProcess: parserDef.postProcess || parserDef.post_process,
        };
    }
    return parsers;
}
function parseMapping(raw, errors, pathContext) {
    const mapping = {};
    for (const [field, def] of Object.entries(raw)) {
        mapping[field] = parseFieldMapping(def, errors, `${pathContext}.mapping.${field}`);
    }
    return mapping;
}
function parseFieldMapping(raw, errors, pathContext) {
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
        };
    }
    if ('from_context' in raw || 'fromContext' in raw) {
        return {
            fromContext: raw.from_context || raw.fromContext,
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
function parseErrorDefinition(raw, errors, filePath) {
    return {
        patterns: raw.patterns?.map((p) => ({
            match: p.match,
            type: p.type,
            retry: p.retry,
            regex: p.regex,
        })),
        httpCodes: raw.httpCodes || raw.http_codes,
        fields: raw.fields,
    };
}
function parseOverrides(raw, errors, filePath) {
    if (!Array.isArray(raw)) {
        errors.push({
            message: '"overrides" must be an array',
            location: { path: `${filePath}:overrides` }
        });
        return [];
    }
    return raw.map((o) => ({
        method: o.method,
        description: o.description,
        file: o.file,
    }));
}
//# sourceMappingURL=index.js.map