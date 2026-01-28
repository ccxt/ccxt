/**
 * Enhanced EDL Code Generator v2
 * Generates TypeScript code from enhanced EDL documents
 */

import type {
    EnhancedEDLDocument,
    EnhancedAuthMethod,
    AuthVariant,
    SigningStep,
    EnhancedAPIDefinition,
    EnhancedParserDefinition,
    EnhancedFieldMapping,
    MethodVariants,
    Expression,
} from '../types/edl-v2.js';

export interface GenerateOptions {
    includeComments?: boolean;
    targetPath?: string;
}

/**
 * Generate TypeScript code from an enhanced EDL document
 */
export function generateExchangeV2(doc: EnhancedEDLDocument, options: GenerateOptions = {}): string {
    const lines: string[] = [];
    const exchangeId = doc.exchange.id;
    const className = exchangeId;  // Use lowercase for CCXT compatibility

    // Imports
    lines.push(`import Exchange from './abstract/${exchangeId}.js';`);
    lines.push(`import { TICK_SIZE } from './base/functions/number.js';`);
    lines.push(`import type { Dict, Int, Num, Str, Strings, Market, Currency, Trade, Ticker, OrderBook, Order, Balances, OHLCV, Transaction } from './base/types.js';`);
    lines.push(`import { AuthenticationError, BadRequest, BadSymbol, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, NotSupported, OnMaintenance, OrderNotFound, PermissionDenied, RateLimitExceeded, RequestTimeout } from './base/errors.js';`);
    lines.push(`import { Precise } from './base/Precise.js';`);
    lines.push(`import { sha256, sha512, md5 } from './static_dependencies/noble-hashes/sha2.js';`);
    lines.push(`import { eddsa, rsa } from './base/functions/crypto.js';`);
    lines.push('');

    // Class declaration
    lines.push(`export default class ${className} extends Exchange {`);

    // describe() method
    lines.push('');
    lines.push(generateDescribe(doc, options));

    // sign() method
    if (doc.auth) {
        lines.push('');
        lines.push(generateSign(doc.auth, exchangeId, options));
    }

    // nonce() method if custom
    if (doc.auth?.default?.nonce?.adjustment) {
        lines.push('');
        lines.push(generateNonce(doc.auth, options));
    }

    // Parser methods
    if (doc.parsers) {
        for (const [name, parser] of Object.entries(doc.parsers)) {
            lines.push('');
            lines.push(generateParser(name, parser, doc, options));
        }
    }

    // Custom transforms as methods
    if (doc.options?.transforms) {
        for (const [name, transform] of Object.entries(doc.options.transforms)) {
            if (typeof transform === 'object' && transform !== null) {
                lines.push('');
                lines.push(generateTransformMethod(name, transform, options));
            }
        }
    }

    // Method variants (like fetchBalance with multiple implementations)
    if (doc.methods) {
        for (const [name, method] of Object.entries(doc.methods)) {
            lines.push('');
            lines.push(generateMethod(name, method, doc, options));
        }
    }

    // Standard fetch methods based on features
    lines.push('');
    lines.push(generateStandardMethods(doc, options));

    lines.push('}');

    return lines.join('\n');
}

function generateDescribe(doc: EnhancedEDLDocument, options: GenerateOptions): string {
    const lines: string[] = [];
    const indent = '    ';
    const exchange = doc.exchange;

    lines.push(`${indent}describe () {`);
    lines.push(`${indent}${indent}return this.deepExtend(super.describe(), {`);
    lines.push(`${indent}${indent}${indent}'id': '${exchange.id}',`);
    lines.push(`${indent}${indent}${indent}'name': '${exchange.name}',`);
    lines.push(`${indent}${indent}${indent}'countries': ${JSON.stringify(exchange.countries)},`);
    lines.push(`${indent}${indent}${indent}'rateLimit': ${exchange.rateLimit},`);

    if (exchange.certified !== undefined) {
        lines.push(`${indent}${indent}${indent}'certified': ${exchange.certified},`);
    }
    if (exchange.pro !== undefined) {
        lines.push(`${indent}${indent}${indent}'pro': ${exchange.pro},`);
    }
    if (exchange.version) {
        lines.push(`${indent}${indent}${indent}'version': '${exchange.version}',`);
    }

    // URLs
    if (exchange.urls) {
        lines.push(`${indent}${indent}${indent}'urls': ${formatObject(exchange.urls, indent + indent + indent)},`);
    }

    // API structure
    if (doc.api) {
        lines.push(`${indent}${indent}${indent}'api': ${generateAPIStructure(doc.api, indent + indent + indent)},`);
    }

    // Has capabilities
    if (doc.features) {
        lines.push(`${indent}${indent}${indent}'has': ${formatObject(doc.features, indent + indent + indent)},`);
    }

    // Required credentials
    if (exchange.requiredCredentials) {
        lines.push(`${indent}${indent}${indent}'requiredCredentials': ${formatObject(exchange.requiredCredentials, indent + indent + indent)},`);
    }

    // Options
    if (doc.options && Object.keys(doc.options).length > 0) {
        const optionsCopy = { ...doc.options };
        delete optionsCopy.transforms;  // Don't include transforms in options
        if (Object.keys(optionsCopy).length > 0) {
            lines.push(`${indent}${indent}${indent}'options': ${formatObject(optionsCopy, indent + indent + indent)},`);
        }
    }

    // Broker IDs
    if (exchange.broker) {
        lines.push(`${indent}${indent}${indent}'broker': ${formatObject(exchange.broker, indent + indent + indent)},`);
    }

    // Errors
    if (doc.errors) {
        lines.push(`${indent}${indent}${indent}'exceptions': ${generateExceptions(doc.errors, indent + indent + indent)},`);
    }

    lines.push(`${indent}${indent}});`);
    lines.push(`${indent}}`);

    return lines.join('\n');
}

function generateSign(auth: EnhancedAuthMethod, exchangeId: string, options: GenerateOptions): string {
    const lines: string[] = [];
    const indent = '    ';

    lines.push(`${indent}sign(path: string, api: Str = 'public', method: Str = 'GET', params: Dict = {}, headers: any = undefined, body: any = undefined) {`);
    lines.push(`${indent}${indent}let url = this.urls['api'][api] + '/' + path;`);

    // Handle auth variant selection
    if (auth.select && auth.select.length > 0) {
        lines.push(`${indent}${indent}let authVariant = 'default';`);

        for (const selector of auth.select) {
            const condition = generateExpressionCode(selector.condition, 'this');
            const variant = typeof selector.variant === 'string' ? `'${selector.variant}'` : generateExpressionCode(selector.variant as any, 'this');
            lines.push(`${indent}${indent}if (${condition}) {`);
            lines.push(`${indent}${indent}${indent}authVariant = ${variant};`);
            lines.push(`${indent}${indent}}`);
        }
    }

    // Check for endpoint-specific auth
    if (auth.endpoints) {
        lines.push(`${indent}${indent}// Check for endpoint-specific auth`);
        for (const [endpoint, override] of Object.entries(auth.endpoints)) {
            const variantName = typeof override === 'string' ? override : 'custom';
            lines.push(`${indent}${indent}if (path === '${endpoint}') {`);
            if (typeof override === 'string') {
                lines.push(`${indent}${indent}${indent}authVariant = '${override}';`);
            }
            lines.push(`${indent}${indent}}`);
        }
    }

    // Generate signing logic for default variant
    if (auth.default) {
        lines.push('');
        lines.push(`${indent}${indent}if (api === 'private' || api.includes('Private')) {`);
        lines.push(`${indent}${indent}${indent}this.checkRequiredCredentials();`);
        lines.push(`${indent}${indent}${indent}const nonce = this.nonce();`);
        lines.push('');

        // Generate pipeline if present
        if (auth.default.pipeline && auth.default.pipeline.length > 0) {
            lines.push(generateSigningPipeline(auth.default.pipeline, indent + indent + indent));
        } else {
            // Simple HMAC signing
            lines.push(generateSimpleSigning(auth.default, indent + indent + indent));
        }

        // Add headers
        if (auth.default.headers) {
            lines.push(`${indent}${indent}${indent}headers = {`);
            for (const [key, value] of Object.entries(auth.default.headers)) {
                const valueCode = generateExpressionCode(value, 'this');
                lines.push(`${indent}${indent}${indent}${indent}'${key}': ${valueCode},`);
            }
            lines.push(`${indent}${indent}${indent}};`);
        }

        lines.push(`${indent}${indent}} else {`);
        lines.push(`${indent}${indent}${indent}// Public endpoint`);
        lines.push(`${indent}${indent}${indent}if (Object.keys(params).length > 0) {`);
        lines.push(`${indent}${indent}${indent}${indent}url += '?' + this.urlencode(params);`);
        lines.push(`${indent}${indent}${indent}}`);
        lines.push(`${indent}${indent}}`);
    }

    lines.push('');
    lines.push(`${indent}${indent}return { 'url': url, 'method': method, 'body': body, 'headers': headers };`);
    lines.push(`${indent}}`);

    return lines.join('\n');
}

function generateSigningPipeline(pipeline: SigningStep[], indent: string): string {
    const lines: string[] = [];

    for (const step of pipeline) {
        const inputCode = generateExpressionCode(step.input, 'this');
        const outputVar = step.output || '$result';

        switch (step.operation) {
            case 'urlencode':
                lines.push(`${indent}const ${outputVar.replace('$', '')} = this.urlencode(${inputCode});`);
                break;
            case 'urlencodeNested':
                lines.push(`${indent}const ${outputVar.replace('$', '')} = this.urlencodeNested(${inputCode});`);
                break;
            case 'json':
                lines.push(`${indent}const ${outputVar.replace('$', '')} = this.json(${inputCode});`);
                break;
            case 'hash':
                const hashAlg = step.algorithm || 'sha256';
                const hashEnc = step.encoding || 'hex';
                lines.push(`${indent}const ${outputVar.replace('$', '')} = this.hash(this.encode(${inputCode}), '${hashAlg}', '${hashEnc}');`);
                break;
            case 'hmac':
                const hmacAlg = step.algorithm || 'sha256';
                const hmacEnc = step.encoding || 'hex';
                const keyCode = step.key ? generateExpressionCode(step.key, 'this') : 'this.secret';
                lines.push(`${indent}const ${outputVar.replace('$', '')} = this.hmac(this.encode(${inputCode}), this.encode(${keyCode}), '${hmacAlg}', '${hmacEnc}');`);
                break;
            case 'encode':
                lines.push(`${indent}const ${outputVar.replace('$', '')} = this.encode(${inputCode});`);
                break;
            case 'decode':
                if (step.encoding === 'base64') {
                    lines.push(`${indent}const ${outputVar.replace('$', '')} = this.base64ToBinary(${inputCode});`);
                } else {
                    lines.push(`${indent}const ${outputVar.replace('$', '')} = this.decode(${inputCode});`);
                }
                break;
            case 'concat':
                lines.push(`${indent}const ${outputVar.replace('$', '')} = this.binaryConcat(${inputCode});`);
                break;
            case 'rsa':
                const rsaEnc = step.encoding || 'base64';
                const rsaKey = step.key ? generateExpressionCode(step.key, 'this') : 'this.secret';
                lines.push(`${indent}const ${outputVar.replace('$', '')} = rsa(${inputCode}, ${rsaKey}, '${step.algorithm || 'sha256'}');`);
                break;
            case 'eddsa':
                const edKey = step.key ? generateExpressionCode(step.key, 'this') : 'this.secret';
                lines.push(`${indent}const ${outputVar.replace('$', '')} = eddsa(this.encode(${inputCode}), ${edKey}, 'ed25519');`);
                break;
        }
    }

    return lines.join('\n');
}

function generateSimpleSigning(auth: AuthVariant, indent: string): string {
    const lines: string[] = [];
    const algorithm = auth.algorithm || 'sha256';

    lines.push(`${indent}const query = this.urlencode(this.extend({ 'timestamp': nonce }, params));`);
    lines.push(`${indent}const signature = this.hmac(this.encode(query), this.encode(this.secret), '${algorithm}');`);
    lines.push(`${indent}if (method === 'GET' || method === 'DELETE') {`);
    lines.push(`${indent}${indent}url += '?' + query + '&signature=' + signature;`);
    lines.push(`${indent}} else {`);
    lines.push(`${indent}${indent}body = query + '&signature=' + signature;`);
    lines.push(`${indent}${indent}headers = { 'Content-Type': 'application/x-www-form-urlencoded' };`);
    lines.push(`${indent}}`);

    return lines.join('\n');
}

function generateNonce(auth: EnhancedAuthMethod, options: GenerateOptions): string {
    const lines: string[] = [];
    const indent = '    ';

    if (auth.default?.nonce?.adjustment) {
        lines.push(`${indent}nonce () {`);
        const adjustment = generateExpressionCode(auth.default.nonce.adjustment, 'this');
        lines.push(`${indent}${indent}return ${adjustment};`);
        lines.push(`${indent}}`);
    }

    return lines.join('\n');
}

function generateParser(name: string, parser: EnhancedParserDefinition, doc: EnhancedEDLDocument, options: GenerateOptions): string {
    const lines: string[] = [];
    const indent = '    ';
    const methodName = `parse${capitalize(name)}`;

    lines.push(`${indent}${methodName} (response: any, market: Market = undefined) {`);

    // Get source data
    if (parser.source) {
        lines.push(`${indent}${indent}const data = this.safeValue(response, '${parser.source.replace(/\./g, "', '")}', response);`);
    } else {
        lines.push(`${indent}${indent}const data = response;`);
    }

    // Handle reference to another parser
    if (typeof parser.mapping === 'object' && '_ref' in parser.mapping) {
        lines.push(`${indent}${indent}return this.parse${capitalize(parser.mapping._ref as string)}(data, market);`);
        lines.push(`${indent}}`);
        return lines.join('\n');
    }

    // Handle array iteration
    if (parser.isArray) {
        // Check if mapping is an array (like [[price, amount], ...] tuples)
        if (Array.isArray(parser.mapping)) {
            lines.push(`${indent}${indent}const result: any[] = [];`);
            lines.push(`${indent}${indent}for (let i = 0; i < data.length; i++) {`);
            lines.push(`${indent}${indent}${indent}const item = data[i];`);

            // Generate array of values
            const elements = parser.mapping.map((m: any) => {
                return generateMappingCode(m, 'item', indent + indent + indent);
            });
            lines.push(`${indent}${indent}${indent}result.push([${elements.join(', ')}]);`);

            lines.push(`${indent}${indent}}`);
            lines.push(`${indent}${indent}return result;`);
            lines.push(`${indent}}`);
            return lines.join('\n');
        }

        // Object mapping - generate entry parser
        lines.push(`${indent}${indent}const result: any[] = [];`);
        lines.push(`${indent}${indent}for (let i = 0; i < data.length; i++) {`);
        lines.push(`${indent}${indent}${indent}const item = data[i];`);
        lines.push(`${indent}${indent}${indent}result.push(this.${methodName}Entry(item, market));`);
        lines.push(`${indent}${indent}}`);
        lines.push(`${indent}${indent}return result;`);
        lines.push(`${indent}}`);
        lines.push('');

        // Generate entry parser
        lines.push(`${indent}${methodName}Entry (item: any, market: Market = undefined) {`);
    }

    // Handle object key iteration
    if (parser.iterate && (parser.iterate as any).keys) {
        const itemVar = (parser.iterate as any).itemVar || 'key';
        const valueVar = (parser.iterate as any).valueVar || 'value';

        lines.push(`${indent}${indent}const result: any = {};`);
        lines.push(`${indent}${indent}const keys = Object.keys(data);`);
        lines.push(`${indent}${indent}for (let i = 0; i < keys.length; i++) {`);
        lines.push(`${indent}${indent}${indent}const ${itemVar} = keys[i];`);
        lines.push(`${indent}${indent}${indent}const ${valueVar} = data[${itemVar}];`);

        // Filter if specified
        if ((parser.iterate as any).filter) {
            const filterCode = generateExpressionCode((parser.iterate as any).filter, 'this');
            lines.push(`${indent}${indent}${indent}if (!(${filterCode})) continue;`);
        }

        // Generate field mappings
        lines.push(`${indent}${indent}${indent}const entry = {`);
        for (const [field, mapping] of Object.entries(parser.mapping)) {
            const valueCode = generateMappingCode(mapping, valueVar, indent + indent + indent + indent);
            lines.push(`${indent}${indent}${indent}${indent}'${field}': ${valueCode},`);
        }
        lines.push(`${indent}${indent}${indent}};`);
        lines.push(`${indent}${indent}${indent}result[${itemVar}] = entry;`);
        lines.push(`${indent}${indent}}`);

        // Post-processing
        if (parser.postProcess) {
            for (const step of parser.postProcess) {
                if (step.operation === 'safeBalance') {
                    lines.push(`${indent}${indent}return this.safeBalance(result);`);
                }
            }
        } else {
            lines.push(`${indent}${indent}return result;`);
        }
    } else {
        // Simple object parsing
        lines.push(`${indent}${indent}return {`);
        for (const [field, mapping] of Object.entries(parser.mapping)) {
            const valueCode = generateMappingCode(mapping, parser.isArray ? 'item' : 'data', indent + indent + indent);
            lines.push(`${indent}${indent}${indent}'${field}': ${valueCode},`);
        }
        lines.push(`${indent}${indent}};`);
    }

    lines.push(`${indent}}`);

    return lines.join('\n');
}

function generateMappingCode(mapping: EnhancedFieldMapping, dataVar: string, indent: string): string {
    // String shorthand - simple path
    if (typeof mapping === 'string') {
        if (mapping.startsWith('$')) {
            const path = mapping.slice(1);
            // Handle array access like item[0]
            if (path.match(/\[\d+\]/)) {
                return path;
            }
            return path;
        }
        // Handle array access in path
        if (mapping.match(/\[\d+\]/)) {
            return `${dataVar}${mapping.startsWith('[') ? '' : '.'}${mapping}`;
        }
        return `this.safeValue(${dataVar}, '${mapping}')`;
    }

    // Check for different mapping types
    if (typeof mapping === 'object' && mapping !== null) {
        // Path mapping
        if ('path' in mapping) {
            const path = mapping.path;
            let code: string;

            // Array of fallback paths
            if (Array.isArray(path)) {
                const paths = path.map(p => {
                    if (p.startsWith('$')) {
                        return p.slice(1).replace(/\./g, "', '");
                    }
                    return p.replace(/\./g, "', '");
                });
                code = `this.safeValueN(${dataVar}, [${paths.map(p => `['${p}']`).join(', ')}])`;
            } else {
                const pathStr = (path as string).startsWith('$')
                    ? (path as string).slice(1)
                    : (path as string);

                // Handle array access like $item[0] or item[0]
                if (pathStr.match(/\[\d+\]/)) {
                    code = pathStr;
                } else {
                    code = `this.safeValue(${dataVar}, '${pathStr.replace(/\./g, "', '")}')`;
                }
            }

            // Apply transforms
            if ((mapping as any).transform) {
                const transforms = Array.isArray((mapping as any).transform) ? (mapping as any).transform : [(mapping as any).transform];
                for (const transform of transforms) {
                    code = applyTransform(code, transform);
                }
            }

            // Default value
            // Use ternary instead of ?? for transpiler compatibility
            if ((mapping as any).default !== undefined) {
                const defaultValue = JSON.stringify((mapping as any).default);
                code = `(${code} !== undefined ? ${code} : ${defaultValue})`;
            } else if (!(mapping as any).transform) {
                // If no transform and no explicit default, default to null to match CCXT behavior
                code = `(${code} !== undefined ? ${code} : null)`;
            }

            return code;
        }

        // From context mapping
        if ('from_context' in mapping || 'fromContext' in mapping) {
            const contextVar = (mapping as any).from_context || (mapping as any).fromContext;
            // Map common context variables
            if (contextVar === 'rawData') {
                return 'response';
            }
            return contextVar;
        }

        // Compute mapping
        if ('compute' in mapping) {
            if ((mapping as any).compute === null) {
                return 'undefined';
            }
            return generateExpressionCode((mapping as any).compute, 'this');
        }

        // Conditional mapping
        if ('if' in mapping) {
            const condition = generateExpressionCode((mapping as any).if, 'this');
            const thenValue = generateMappingCode((mapping as any).then, dataVar, indent);
            const elseValue = (mapping as any).else ? generateMappingCode((mapping as any).else, dataVar, indent) : 'undefined';
            return `(${condition}) ? ${thenValue} : ${elseValue}`;
        }

        // Switch mapping
        if ('switch' in mapping) {
            const switchExpr = generateExpressionCode((mapping as any).switch, 'this');
            const cases = (mapping as any).cases || {};
            let code = `(() => { switch (${switchExpr}) {`;
            for (const [caseVal, caseMapping] of Object.entries(cases)) {
                const caseCode = generateMappingCode(caseMapping as EnhancedFieldMapping, dataVar, indent);
                code += ` case '${caseVal}': return ${caseCode};`;
            }
            if ((mapping as any).default) {
                const defaultCode = generateMappingCode((mapping as any).default, dataVar, indent);
                code += ` default: return ${defaultCode};`;
            } else {
                code += ` default: return undefined;`;
            }
            code += ` } })()`;
            return code;
        }

        // Literal
        if ('literal' in mapping) {
            return JSON.stringify((mapping as any).literal);
        }
    }

    // Fallback
    return 'undefined';
}

function applyTransform(code: string, transform: string | any): string {
    if (typeof transform === 'string') {
        switch (transform) {
            case 'safeString':
            case 'safe_string':
            case 'parse_string':
                return `this.safeString(${code})`;
            case 'safeNumber':
            case 'safe_number':
            case 'parse_number':
                return `this.safeNumber(${code})`;
            case 'safeInteger':
            case 'safe_integer':
                return `this.safeInteger(${code})`;
            case 'safeTimestamp':
            case 'safe_timestamp':
            case 'parse_timestamp':
                return `this.safeTimestamp(${code})`;
            case 'safeBoolean':
            case 'safe_boolean':
            case 'parse_boolean':
                return `this.safeBool(${code})`;
            case 'parseCurrencyCode':
            case 'safeCurrencyCode':
            case 'parse_currency_code':
                return `this.safeCurrencyCode(${code})`;
            case 'parseSymbol':
            case 'parse_symbol':
                return `this.safeSymbol(${code})`;
            case 'lowercase':
                return `(${code})?.toLowerCase()`;
            case 'uppercase':
                return `(${code})?.toUpperCase()`;
            case 'omitZero':
                return `this.omitZero(${code})`;
            case 'parseOrderBookSide':
                return `this.parseOrderBookSide(${code})`;
            default:
                // Check if it's a custom transform
                return `this.${transform}(${code})`;
        }
    }

    // Complex transform object
    if (typeof transform === 'object' && transform !== null) {
        if ('op' in transform) {
            const left = transform.left === '$value' ? code : generateExpressionCode(transform.left, 'this');
            const right = generateExpressionCode(transform.right, 'this');
            return `(${left} ${transform.op} ${right})`;
        }
        if ('call' in transform) {
            const args = transform.args?.map((a: any) => a === '$value' ? code : generateExpressionCode(a, 'this')).join(', ') || code;
            return `${transform.call}(${args})`;
        }
    }

    return code;
}

function generateExpressionCode(expr: Expression | any, context: string): string {
    if (expr === null || expr === undefined) {
        return 'undefined';
    }

    // Already a string
    if (typeof expr === 'string') {
        if (expr.startsWith('$')) {
            const path = expr.slice(1);
            // Handle special paths
            if (path.startsWith('this.')) {
                return path;
            }
            if (path.startsWith('params.')) {
                return `params['${path.slice(7)}']`;
            }
            if (path.startsWith('item.') || path.startsWith('item[')) {
                return path;
            }
            return path;
        }
        return `'${expr}'`;
    }

    // Numbers and booleans
    if (typeof expr === 'number' || typeof expr === 'boolean') {
        return String(expr);
    }

    // Arrays
    if (Array.isArray(expr)) {
        return `[${expr.map(e => generateExpressionCode(e, context)).join(', ')}]`;
    }

    // Object expressions
    if (typeof expr === 'object') {
        // Check type field
        switch (expr.type) {
            case 'literal':
                return JSON.stringify(expr.value);

            case 'path':
                const path = expr.path;
                if (path.startsWith('this.')) {
                    return path;
                }
                if (path.startsWith('params.')) {
                    return `params['${path.slice(7)}']`;
                }
                return path;

            case 'binary':
                const left = generateExpressionCode(expr.left, context);
                const right = generateExpressionCode(expr.right, context);
                return generateBinaryExpression(expr.operator, left, right);

            case 'unary':
                const operand = generateExpressionCode(expr.operand, context);
                return `${expr.operator}${operand}`;

            case 'call':
                const func = expr.function;
                const args = (expr.args || []).map((a: any) => generateExpressionCode(a, context)).join(', ');

                // Map common function names
                if (func === 'extend') return `${context}.extend(${args})`;
                if (func === 'length') return `(${args})?.length`;
                if (func === 'Array.isArray') return `Array.isArray(${args})`;
                // Don't add context if function already has `this.`
                if (func.startsWith('this.')) return `${func}(${args})`;
                if (func.startsWith('Math.')) return `${func}(${args})`;

                return `this.${func}(${args})`;

            case 'conditional':
                const cond = generateExpressionCode(expr.condition, context);
                const thenExpr = generateExpressionCode(expr.then, context);
                const elseExpr = expr.else ? generateExpressionCode(expr.else, context) : 'undefined';
                return `(${cond}) ? ${thenExpr} : ${elseExpr}`;

            case 'object':
                const props = Object.entries(expr.properties || {})
                    .map(([k, v]) => `'${k}': ${generateExpressionCode(v, context)}`)
                    .join(', ');
                return `{ ${props} }`;

            case 'array':
                const elements = (expr.elements || []).map((e: any) => generateExpressionCode(e, context)).join(', ');
                return `[${elements}]`;

            default:
                // Check for shorthand forms
                if ('op' in expr && 'left' in expr && 'right' in expr) {
                    const l = generateExpressionCode(expr.left, context);
                    const r = generateExpressionCode(expr.right, context);
                    return generateBinaryExpression(expr.op, l, r);
                }
                if ('call' in expr) {
                    const fn = expr.call;
                    const fnArgs = (expr.args || []).map((a: any) => generateExpressionCode(a, context)).join(', ');
                    // Special cases
                    if (fn === 'length') return `(${fnArgs})?.length`;
                    if (fn === 'extend') return `${context}.extend(${fnArgs})`;
                    if (fn === 'Array.isArray') return `Array.isArray(${fnArgs})`;
                    // Don't add context if function already has `this.`
                    if (fn.startsWith('this.')) {
                        return `${fn}(${fnArgs})`;
                    }
                    if (fn.startsWith('Math.')) {
                        return `${fn}(${fnArgs})`;
                    }
                    return `this.${fn}(${fnArgs})`;
                }
                if ('if' in expr && 'then' in expr) {
                    const c = generateExpressionCode(expr.if, context);
                    const t = generateExpressionCode(expr.then, context);
                    const e = expr.else ? generateExpressionCode(expr.else, context) : 'undefined';
                    return `(${c}) ? ${t} : ${e}`;
                }
                if ('literal' in expr) {
                    return JSON.stringify(expr.literal);
                }
                if ('path' in expr) {
                    return expr.path;
                }

                // Generic object
                return JSON.stringify(expr);
        }
    }

    return String(expr);
}

function mapOperator(op: string): string {
    switch (op) {
        case '==': return '===';
        case '!=': return '!==';
        case 'in': return 'in';
        // Note: contains, startsWith, endsWith are handled specially in expression generation
        default: return op;
    }
}

function generateBinaryExpression(op: string, left: string, right: string): string {
    switch (op) {
        case 'contains':
            return `${left}.includes(${right})`;
        case 'startsWith':
            return `${left}.startsWith(${right})`;
        case 'endsWith':
            return `${left}.endsWith(${right})`;
        default:
            return `(${left} ${mapOperator(op)} ${right})`;
    }
}

function generateMethod(name: string, method: MethodVariants | any, doc: EnhancedEDLDocument, options: GenerateOptions): string {
    const lines: string[] = [];
    const indent = '    ';
    const methodName = name;

    // Check if it has variants
    if (method.selection || method.variants) {
        lines.push(`${indent}async ${methodName} (params: Dict = {}): Promise<Balances> {`);
        lines.push(`${indent}${indent}await this.loadMarkets();`);

        // Determine which variant to use
        if (method.selection?.param) {
            const param = method.selection.param;
            lines.push(`${indent}${indent}let type = this.safeString(params, '${param}', '${method.selection.default || 'spot'}');`);
            lines.push(`${indent}${indent}params = this.omit(params, '${param}');`);
        }

        // Generate switch for variants
        if (method.variants && method.variants.length > 0) {
            lines.push(`${indent}${indent}let response: any;`);
            lines.push(`${indent}${indent}let parser: string;`);
            lines.push('');

            // Separate default variant from others
            const defaultVariant = method.variants.find((v: any) => v.name === method.selection?.default);
            const otherVariants = method.variants.filter((v: any) => v.name !== method.selection?.default);

            // Generate if-else chain for non-default variants
            for (let i = 0; i < otherVariants.length; i++) {
                const variant = otherVariants[i];
                const condition = i === 0 ? 'if' : 'else if';
                lines.push(`${indent}${indent}${condition} (type === '${variant.name}') {`);

                // Generate endpoint call - convert paths like 'sapi.get.margin/account' to 'sapiGetMarginAccount'
                const endpoint = variant.endpoint.split('.');
                const apiMethod = endpoint.map((p: string, idx: number) => {
                    const camelPart = pathToCamelCase(p);
                    return idx === 0 ? camelPart : capitalize(camelPart);
                }).join('');
                lines.push(`${indent}${indent}${indent}response = await this.${apiMethod}(params);`);
                lines.push(`${indent}${indent}${indent}parser = '${variant.response}';`);
                lines.push(`${indent}${indent}}`);
            }

            // Generate else clause for default variant
            if (defaultVariant) {
                if (otherVariants.length > 0) {
                    // Replace last closing brace with else
                    lines[lines.length - 1] = `${indent}${indent}} else {`;
                } else {
                    lines.push(`${indent}${indent}{`);
                }
                const endpoint = defaultVariant.endpoint.split('.');
                const apiMethod = endpoint.map((p: string, idx: number) => {
                    const camelPart = pathToCamelCase(p);
                    return idx === 0 ? camelPart : capitalize(camelPart);
                }).join('');
                lines.push(`${indent}${indent}${indent}response = await this.${apiMethod}(params);`);
                lines.push(`${indent}${indent}${indent}parser = '${defaultVariant.response}';`);
                lines.push(`${indent}${indent}}`);
            }
        }

        lines.push('');
        lines.push(`${indent}${indent}return this.parseBalance(response);`);
        lines.push(`${indent}}`);
    } else {
        // Simple single implementation
        lines.push(`${indent}async ${methodName} (params: Dict = {}): Promise<any> {`);
        lines.push(`${indent}${indent}await this.loadMarkets();`);

        if (method.endpoint) {
            const endpoint = method.endpoint.split('.');
            const apiMethod = endpoint.map((p: string, i: number) => i === 0 ? p : capitalize(p)).join('');
            lines.push(`${indent}${indent}const response = await this.${apiMethod}(params);`);
        }

        if (method.response) {
            lines.push(`${indent}${indent}return this.parse${capitalize(method.response)}(response);`);
        } else {
            lines.push(`${indent}${indent}return response;`);
        }

        lines.push(`${indent}}`);
    }

    return lines.join('\n');
}

function generateTransformMethod(name: string, transform: any, options: GenerateOptions): string {
    const lines: string[] = [];
    const indent = '    ';

    lines.push(`${indent}${name} (value: any) {`);

    if (transform.type === 'switch') {
        const switchExpr = generateExpressionCode(transform.expression, 'this');
        lines.push(`${indent}${indent}switch (${switchExpr}) {`);
        for (const [caseVal, result] of Object.entries(transform.cases)) {
            lines.push(`${indent}${indent}${indent}case '${caseVal}':`);
            lines.push(`${indent}${indent}${indent}${indent}return '${result}';`);
        }
        if (transform.default) {
            const defaultVal = transform.default.startsWith('$') ? transform.default.slice(1) : `'${transform.default}'`;
            lines.push(`${indent}${indent}${indent}default:`);
            lines.push(`${indent}${indent}${indent}${indent}return ${defaultVal};`);
        }
        lines.push(`${indent}${indent}}`);
    } else if (transform.type === 'conditional') {
        const condition = generateExpressionCode(transform.condition, 'this');
        lines.push(`${indent}${indent}if (${condition}) {`);
        lines.push(`${indent}${indent}${indent}return ${JSON.stringify(transform.then)};`);
        lines.push(`${indent}${indent}} else {`);
        lines.push(`${indent}${indent}${indent}return ${JSON.stringify(transform.else)};`);
        lines.push(`${indent}${indent}}`);
    } else if (transform.type === 'compute') {
        const expr = generateExpressionCode(transform.expression, 'this');
        lines.push(`${indent}${indent}return ${expr};`);
    } else if (transform.type === 'array') {
        // Array transform - iterate over input array
        const mapping = transform.mapping;

        lines.push(`${indent}${indent}const result: any[] = [];`);
        lines.push(`${indent}${indent}for (let i = 0; i < value.length; i++) {`);
        lines.push(`${indent}${indent}${indent}const item = value[i];`);

        if (Array.isArray(mapping)) {
            // Tuple output like [[price, amount], ...]
            const elements = mapping.map((m: any) => {
                return generateMappingCode(m, 'item', indent + indent + indent);
            });
            lines.push(`${indent}${indent}${indent}result.push([${elements.join(', ')}]);`);
        } else if (typeof mapping === 'object') {
            // Object output
            lines.push(`${indent}${indent}${indent}result.push({`);
            for (const [field, fieldMapping] of Object.entries(mapping)) {
                const fieldCode = generateMappingCode(fieldMapping as any, 'item', indent + indent + indent + indent);
                lines.push(`${indent}${indent}${indent}${indent}'${field}': ${fieldCode},`);
            }
            lines.push(`${indent}${indent}${indent}});`);
        }

        lines.push(`${indent}${indent}}`);
        lines.push(`${indent}${indent}return result;`);
    }

    lines.push(`${indent}}`);

    return lines.join('\n');
}

function generateStandardMethods(doc: EnhancedEDLDocument, options: GenerateOptions): string {
    const lines: string[] = [];
    const indent = '    ';

    // Generate standard methods based on defined parsers
    if (doc.parsers) {
        // fetchTicker
        if (doc.parsers.ticker && doc.features?.fetchTicker) {
            lines.push(`${indent}async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {`);
            lines.push(`${indent}${indent}await this.loadMarkets();`);
            lines.push(`${indent}${indent}const market = this.market(symbol);`);
            lines.push(`${indent}${indent}const request: Dict = { 'symbol': market['id'] };`);
            lines.push(`${indent}${indent}const response = await this.publicGetTicker(this.extend(request, params));`);
            lines.push(`${indent}${indent}return this.parseTicker(response, market);`);
            lines.push(`${indent}}`);
            lines.push('');
        }

        // fetchOrderBook
        if (doc.parsers.orderBook && doc.features?.fetchOrderBook) {
            lines.push(`${indent}async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {`);
            lines.push(`${indent}${indent}await this.loadMarkets();`);
            lines.push(`${indent}${indent}const market = this.market(symbol);`);
            lines.push(`${indent}${indent}const request: Dict = { 'symbol': market['id'] };`);
            lines.push(`${indent}${indent}if (limit !== undefined) {`);
            lines.push(`${indent}${indent}${indent}request['limit'] = limit;`);
            lines.push(`${indent}${indent}}`);
            lines.push(`${indent}${indent}const response = await this.publicGetDepth(this.extend(request, params));`);
            lines.push(`${indent}${indent}return this.parseOrderBook(response, market['symbol']);`);
            lines.push(`${indent}}`);
            lines.push('');
        }

        // fetchTrades
        if ((doc.parsers.publicTrades || doc.parsers.trades || doc.parsers.tradesArray) && doc.features?.fetchTrades) {
            lines.push(`${indent}async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {`);
            lines.push(`${indent}${indent}await this.loadMarkets();`);
            lines.push(`${indent}${indent}const market = this.market(symbol);`);
            lines.push(`${indent}${indent}const request: Dict = { 'symbol': market['id'] };`);
            lines.push(`${indent}${indent}if (limit !== undefined) {`);
            lines.push(`${indent}${indent}${indent}request['limit'] = limit;`);
            lines.push(`${indent}${indent}}`);
            lines.push(`${indent}${indent}const response = await this.publicGetTrades(this.extend(request, params));`);
            lines.push(`${indent}${indent}return this.parseTrades(response, market, since, limit);`);
            lines.push(`${indent}}`);
            lines.push('');
        }

        // fetchOHLCV
        if ((doc.parsers.klines || doc.parsers.ohlcv) && doc.features?.fetchOHLCV) {
            lines.push(`${indent}async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {`);
            lines.push(`${indent}${indent}await this.loadMarkets();`);
            lines.push(`${indent}${indent}const market = this.market(symbol);`);
            lines.push(`${indent}${indent}const request: Dict = {`);
            lines.push(`${indent}${indent}${indent}'symbol': market['id'],`);
            lines.push(`${indent}${indent}${indent}'interval': this.safeString(this.timeframes, timeframe, timeframe),`);
            lines.push(`${indent}${indent}};`);
            lines.push(`${indent}${indent}if (since !== undefined) {`);
            lines.push(`${indent}${indent}${indent}request['startTime'] = since;`);
            lines.push(`${indent}${indent}}`);
            lines.push(`${indent}${indent}if (limit !== undefined) {`);
            lines.push(`${indent}${indent}${indent}request['limit'] = limit;`);
            lines.push(`${indent}${indent}}`);
            lines.push(`${indent}${indent}const response = await this.publicGetKlines(this.extend(request, params));`);
            lines.push(`${indent}${indent}return this.parseOHLCVs(response, market, timeframe, since, limit);`);
            lines.push(`${indent}}`);
            lines.push('');
        }
    }

    return lines.join('\n');
}

function generateAPIStructure(api: EnhancedAPIDefinition, indent: string): string {
    const lines: string[] = ['{'];

    for (const [category, endpoints] of Object.entries(api)) {
        if (category === 'baseUrls') continue;
        if (!endpoints || typeof endpoints !== 'object') continue;

        lines.push(`${indent}    '${category}': {`);

        for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
            const methodEndpoints = (endpoints as any)[method];
            if (methodEndpoints && Object.keys(methodEndpoints).length > 0) {
                const endpointNames = Object.keys(methodEndpoints);
                lines.push(`${indent}        '${method}': [${endpointNames.map(e => `'${e}'`).join(', ')}],`);
            }
        }

        lines.push(`${indent}    },`);
    }

    lines.push(`${indent}}`);
    return lines.join('\n');
}

function generateExceptions(errors: any, indent: string): string {
    const lines: string[] = ['{'];

    if (errors.default) {
        lines.push(`${indent}    'exact': {`);
        for (const [code, exceptionClass] of Object.entries(errors.default.exact || {})) {
            lines.push(`${indent}        '${code}': ${exceptionClass},`);
        }
        lines.push(`${indent}    },`);

        if (errors.default.broad && Object.keys(errors.default.broad).length > 0) {
            lines.push(`${indent}    'broad': {`);
            for (const [pattern, exceptionClass] of Object.entries(errors.default.broad || {})) {
                lines.push(`${indent}        '${pattern}': ${exceptionClass},`);
            }
            lines.push(`${indent}    },`);
        }
    }

    lines.push(`${indent}}`);
    return lines.join('\n');
}

function formatObject(obj: any, indent: string): string {
    return JSON.stringify(obj, null, 4)
        .split('\n')
        .map((line, i) => i === 0 ? line : indent + line)
        .join('\n');
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a path like 'asset/get-funding-asset' to 'AssetGetFundingAsset'
 */
function pathToCamelCase(path: string): string {
    return path
        .split(/[/\-]/)
        .map((part, i) => i === 0 ? part : capitalize(part))
        .join('');
}
