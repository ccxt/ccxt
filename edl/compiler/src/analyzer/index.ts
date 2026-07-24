/**
 * EDL Analyzer
 * Performs semantic validation on parsed EDL documents
 */

import type {
    EDLDocument,
    ValidationError,
    ValidationResult,
    ParserDefinition,
    APIDefinition,
    FieldMapping,
    ErrorType,
} from '../types/edl.js';
import { analyzeComputeDependencies, extractFieldReferences } from '../helpers/mapping-dependencies.js';

const VALID_ERROR_TYPES: string[] = [
    'AuthenticationError',
    'PermissionDenied',
    'InsufficientFunds',
    'InvalidOrder',
    'OrderNotFound',
    'RateLimitExceeded',
    'ExchangeError',
    'ExchangeNotAvailable',
    'NetworkError',
    'BadRequest',
    'BadResponse',
    'InvalidAddress',
    'InvalidNonce',
    'DDoSProtection',
    'OnMaintenance',
    'BadSymbol',
    'ArgumentsRequired',
    'NotSupported',
    'CancelPending',
    'AccountSuspended',
    'MarginModeAlreadySet',
    'RequestTimeout',
];

const VALID_TRANSFORMS = [
    'parseNumber',
    'parseString',
    'parseTimestamp',
    'parseTimestampMs',
    'parseCurrencyCode',
    'parseSymbol',
    'parseOrderStatus',
    'parseOrderType',
    'parseOrderSide',
    'parseBoolean',
    'lowercase',
    'uppercase',
    'omitZero',
    'safeInteger',
    'safeNumber',
    'safeString',
    'safeTimestamp',
    'safeBoolean',
    // Aliases for snake_case
    'parse_number',
    'parse_string',
    'parse_timestamp',
    'parse_timestamp_ms',
    'parse_currency_code',
    'parse_symbol',
    'parse_order_status',
    'parse_order_type',
    'parse_order_side',
    'parse_boolean',
    'omit_zero',
    'safe_integer',
    'safe_number',
    'safe_string',
    'safe_timestamp',
    'safe_boolean',
];

const CCXT_METHODS = [
    'fetchTicker',
    'fetchTickers',
    'fetchOrderBook',
    'fetchTrades',
    'fetchOHLCV',
    'fetchBalance',
    'createOrder',
    'cancelOrder',
    'fetchOrder',
    'fetchOrders',
    'fetchOpenOrders',
    'fetchClosedOrders',
    'fetchMyTrades',
    'fetchDeposits',
    'fetchWithdrawals',
    'fetchLedger',
    'withdraw',
    'deposit',
    'fetchMarkets',
    'fetchCurrencies',
    'fetchTime',
    'fetchStatus',
];

export function analyzeEDL(doc: EDLDocument): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate exchange metadata
    validateExchangeMetadata(doc, errors, warnings);

    // Validate auth configuration
    if (doc.auth) {
        validateAuth(doc, errors, warnings);
    }

    // Validate API definitions
    if (doc.api) {
        validateAPI(doc.api, errors, warnings);
    }

    // Validate parsers
    if (doc.parsers) {
        validateParsers(doc, errors, warnings);
    }

    // Validate error patterns
    if (doc.errors) {
        validateErrors(doc, errors, warnings);
    }

    // Validate overrides
    if (doc.overrides) {
        validateOverrides(doc, errors, warnings);
    }

    // Cross-reference validation
    validateCrossReferences(doc, errors, warnings);

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

function validateExchangeMetadata(doc: EDLDocument, errors: ValidationError[], warnings: ValidationError[]) {
    const { exchange } = doc;

    // ID should be lowercase alphanumeric
    if (!/^[a-z][a-z0-9]*$/.test(exchange.id)) {
        errors.push({
            path: 'exchange.id',
            message: `Exchange ID "${exchange.id}" should be lowercase alphanumeric starting with a letter`,
            severity: 'error',
        });
    }

    // Rate limit should be reasonable
    if (exchange.rateLimit < 50) {
        warnings.push({
            path: 'exchange.rateLimit',
            message: `Rate limit ${exchange.rateLimit}ms is unusually low`,
            severity: 'warning',
        });
    }

    if (exchange.rateLimit > 60000) {
        warnings.push({
            path: 'exchange.rateLimit',
            message: `Rate limit ${exchange.rateLimit}ms is unusually high`,
            severity: 'warning',
        });
    }

    // Countries should be valid ISO codes
    for (const country of exchange.countries) {
        if (typeof country !== 'string' || country.length !== 2) {
            warnings.push({
                path: 'exchange.countries',
                message: `Country "${country}" should be a 2-letter ISO code`,
                severity: 'warning',
            });
        }
    }

    // URLs should be defined for production exchanges
    if (!exchange.urls?.api) {
        warnings.push({
            path: 'exchange.urls.api',
            message: 'No API URLs defined',
            severity: 'warning',
        });
    }
}

function validateAuth(doc: EDLDocument, errors: ValidationError[], warnings: ValidationError[]) {
    const auth = doc.auth!;

    // Validate algorithm for HMAC
    if (auth.type === 'hmac') {
        const validAlgorithms = ['sha256', 'sha384', 'sha512', 'md5'];
        if (auth.algorithm && !validAlgorithms.includes(auth.algorithm)) {
            errors.push({
                path: 'auth.algorithm',
                message: `Invalid HMAC algorithm "${auth.algorithm}". Must be one of: ${validAlgorithms.join(', ')}`,
                severity: 'error',
            });
        }
    }

    // Validate encoding
    if (auth.encoding) {
        const validEncodings = ['hex', 'base64', 'base58'];
        if (!validEncodings.includes(auth.encoding)) {
            errors.push({
                path: 'auth.encoding',
                message: `Invalid encoding "${auth.encoding}". Must be one of: ${validEncodings.join(', ')}`,
                severity: 'error',
            });
        }
    }

    // Custom auth must have template or preHash/postHash
    if (auth.type === 'custom') {
        if (!auth.custom?.template && !auth.custom?.preHash && !auth.custom?.postHash) {
            errors.push({
                path: 'auth.custom',
                message: 'Custom auth type requires template, preHash, or postHash configuration',
                severity: 'error',
            });
        }
    }
}

function validateAPI(api: APIDefinition, errors: ValidationError[], warnings: ValidationError[]) {
    // Check for at least one endpoint
    let hasEndpoints = false;

    for (const [categoryName, category] of Object.entries(api)) {
        if (!category) continue;

        for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
            const endpoints = category[method];
            if (endpoints && Object.keys(endpoints).length > 0) {
                hasEndpoints = true;

                for (const [name, endpoint] of Object.entries(endpoints)) {
                    // Validate endpoint costs
                    if (endpoint.cost !== undefined && endpoint.cost < 0) {
                        errors.push({
                            path: `api.${categoryName}.${method}.${name}.cost`,
                            message: 'Endpoint cost cannot be negative',
                            severity: 'error',
                        });
                    }

                    // Validate params
                    if (endpoint.params) {
                        for (const [paramName, param] of Object.entries(endpoint.params)) {
                            const validTypes = ['string', 'number', 'float', 'integer', 'int', 'boolean', 'bool', 'array', 'object', 'timestamp', 'timestamp_ms', 'timestamp_s'];
                            if (!validTypes.includes(param.type)) {
                                errors.push({
                                    path: `api.${categoryName}.${method}.${name}.params.${paramName}.type`,
                                    message: `Invalid param type "${param.type}". Must be one of: ${validTypes.join(', ')}`,
                                    severity: 'error',
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    if (!hasEndpoints) {
        warnings.push({
            path: 'api',
            message: 'No API endpoints defined',
            severity: 'warning',
        });
    }
}

function validateParsers(doc: EDLDocument, errors: ValidationError[], warnings: ValidationError[]) {
    const parsers = doc.parsers!;

    for (const [name, parser] of Object.entries(parsers)) {
        // Validate source reference
        if (!parser.source) {
            errors.push({
                path: `parsers.${name}.source`,
                message: 'Parser must have a source endpoint',
                severity: 'error',
            });
        }

        // Validate mapping
        if (!parser.mapping || Object.keys(parser.mapping).length === 0) {
            warnings.push({
                path: `parsers.${name}.mapping`,
                message: 'Parser has no field mappings',
                severity: 'warning',
            });
        } else {
            validateMappings(parser.mapping, `parsers.${name}`, errors, warnings);
        }
    }
}

function validateMappings(
    mapping: Record<string, FieldMapping>,
    pathPrefix: string,
    errors: ValidationError[],
    warnings: ValidationError[]
) {
    for (const [field, fieldMapping] of Object.entries(mapping)) {
        const path = `${pathPrefix}.mapping.${field}`;

        // Check transform validity
        if ('path' in fieldMapping && fieldMapping.transform) {
            if (!VALID_TRANSFORMS.includes(fieldMapping.transform)) {
                warnings.push({
                    path: `${path}.transform`,
                    message: `Unknown transform "${fieldMapping.transform}". Consider using standard transforms.`,
                    severity: 'warning',
                });
            }
        }

        // Check compute expressions
        if ('compute' in fieldMapping) {
            const refs = extractFieldReferences(fieldMapping.compute);
            for (const refName of refs) {
                if (!Object.prototype.hasOwnProperty.call(mapping, refName)) {
                    errors.push({
                        path: `${path}.compute`,
                        message: `Computed field references "{${refName}}" but no such field exists in this parser mapping`,
                        severity: 'error',
                    });
                }
            }
        }

        // Recursive check for conditionals
        if ('conditional' in fieldMapping) {
            validateConditionalMapping(fieldMapping.conditional, `${path}.conditional`, errors, warnings);
        }
    }

    const dependencyAnalysis = analyzeComputeDependencies(mapping);

    for (const [field, missingDeps] of dependencyAnalysis.missing.entries()) {
        for (const dep of missingDeps) {
            warnings.push({
                path: `${pathPrefix}.mapping.${field}.dependencies`,
                message: `Field "${field}" depends on "${dep}", which is not defined in this mapping`,
                severity: 'warning',
            });
        }
    }

    for (const cycle of dependencyAnalysis.cycles) {
        const cyclePath = cycle.join(' -> ');
        errors.push({
            path: `${pathPrefix}.mapping`,
            message: `Circular dependency detected between computed fields: ${cyclePath}`,
            severity: 'error',
        });
    }
}

function validateConditionalMapping(
    conditional: any,
    path: string,
    errors: ValidationError[],
    warnings: ValidationError[]
) {
    if (!conditional.if) {
        errors.push({
            path: `${path}.if`,
            message: 'Conditional mapping must have an "if" condition',
            severity: 'error',
        });
    }

    if (!conditional.then) {
        errors.push({
            path: `${path}.then`,
            message: 'Conditional mapping must have a "then" clause',
            severity: 'error',
        });
    }

    if (!conditional.else) {
        warnings.push({
            path: `${path}.else`,
            message: 'Conditional mapping has no "else" clause',
            severity: 'warning',
        });
    }
}

function validateErrors(doc: EDLDocument, errors: ValidationError[], warnings: ValidationError[]) {
    const errorDef = doc.errors!;

    if (errorDef.patterns) {
        for (let i = 0; i < errorDef.patterns.length; i++) {
            const pattern = errorDef.patterns[i];

            if (!pattern.match) {
                errors.push({
                    path: `errors.patterns[${i}].match`,
                    message: 'Error pattern must have a match string or regex',
                    severity: 'error',
                });
            }

            if (!VALID_ERROR_TYPES.includes(pattern.type)) {
                errors.push({
                    path: `errors.patterns[${i}].type`,
                    message: `Invalid error type "${pattern.type}". Must be one of: ${VALID_ERROR_TYPES.join(', ')}`,
                    severity: 'error',
                });
            }

            // Validate regex if specified
            if (pattern.regex) {
                try {
                    new RegExp(pattern.match);
                } catch (e) {
                    errors.push({
                        path: `errors.patterns[${i}].match`,
                        message: `Invalid regex pattern: ${(e as Error).message}`,
                        severity: 'error',
                    });
                }
            }
        }
    }

    if (errorDef.httpCodes) {
        for (const [code, errorType] of Object.entries(errorDef.httpCodes)) {
            if (!VALID_ERROR_TYPES.includes(errorType)) {
                errors.push({
                    path: `errors.httpCodes.${code}`,
                    message: `Invalid error type "${errorType}"`,
                    severity: 'error',
                });
            }
        }
    }
}

function validateOverrides(doc: EDLDocument, errors: ValidationError[], warnings: ValidationError[]) {
    const overrides = doc.overrides!;

    for (let i = 0; i < overrides.length; i++) {
        const override = overrides[i];

        if (!override.method) {
            errors.push({
                path: `overrides[${i}].method`,
                message: 'Override must specify a method name',
                severity: 'error',
            });
        }

        if (!override.file) {
            errors.push({
                path: `overrides[${i}].file`,
                message: 'Override must specify a file path',
                severity: 'error',
            });
        }

        // Warn if overriding standard CCXT method
        if (override.method && CCXT_METHODS.includes(override.method)) {
            warnings.push({
                path: `overrides[${i}].method`,
                message: `Overriding standard CCXT method "${override.method}" - ensure it maintains API compatibility`,
                severity: 'warning',
            });
        }
    }
}

function validateCrossReferences(doc: EDLDocument, errors: ValidationError[], warnings: ValidationError[]) {
    // Check that parser sources reference existing API endpoints
    if (doc.parsers && doc.api) {
        for (const [name, parser] of Object.entries(doc.parsers)) {
            const source = parser.source;
            let found = false;

            // Search for the endpoint in all categories
            for (const [categoryName, category] of Object.entries(doc.api)) {
                if (!category) continue;

                for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
                    const endpoints = category[method];
                    if (endpoints && source in endpoints) {
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }

            if (!found) {
                warnings.push({
                    path: `parsers.${name}.source`,
                    message: `Parser source "${source}" doesn't match any defined API endpoint`,
                    severity: 'warning',
                });
            }
        }
    }

    // Check that override methods don't conflict with generated methods
    if (doc.overrides && doc.parsers) {
        const generatedMethods = new Set<string>();

        // Infer generated methods from parsers
        for (const parserName of Object.keys(doc.parsers)) {
            // parseTicker -> fetchTicker (roughly)
            if (parserName.toLowerCase().includes('ticker')) {
                generatedMethods.add('fetchTicker');
                generatedMethods.add('fetchTickers');
            }
            if (parserName.toLowerCase().includes('order')) {
                generatedMethods.add('fetchOrder');
                generatedMethods.add('fetchOrders');
                generatedMethods.add('createOrder');
            }
            if (parserName.toLowerCase().includes('balance')) {
                generatedMethods.add('fetchBalance');
            }
            if (parserName.toLowerCase().includes('trade')) {
                generatedMethods.add('fetchTrades');
                generatedMethods.add('fetchMyTrades');
            }
        }

        // This is fine - overrides take precedence
        // Just a note that we detected potential overlap
    }

    // Validate features match what's defined
    if (doc.features) {
        for (const [feature, enabled] of Object.entries(doc.features)) {
            if (enabled && !CCXT_METHODS.includes(feature)) {
                warnings.push({
                    path: `features.${feature}`,
                    message: `Feature "${feature}" is not a standard CCXT method`,
                    severity: 'warning',
                });
            }
        }
    }
}
