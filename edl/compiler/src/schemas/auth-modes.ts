/**
 * Authentication Modes Schema Types and Utilities
 *
 * This module provides comprehensive schema definitions for authentication modes,
 * enabling per-endpoint authentication specification with support for multiple
 * auth schemes and credential requirements.
 */

import type { AuthenticationRequirement } from './api-endpoints.js';

// ============================================================
// Authentication Strategy Enum
// ============================================================

/**
 * Comprehensive authentication strategy types supported by exchanges
 * Based on analysis of CCXT exchange implementations
 */
export type AuthStrategy =
    // HMAC-based strategies (most common)
    | 'HMAC_SHA256'      // Binance, OKX, Bybit, Bitget, etc.
    | 'HMAC_SHA512'      // Kraken, Gate.io, Poloniex, etc.
    | 'HMAC_SHA384'      // Gemini, Bitfinex, etc.
    | 'HMAC_SHA1'        // Legacy exchanges
    // JWT-based strategies
    | 'JWT_HS256'        // JWT with HMAC SHA256
    | 'JWT_HS384'        // JWT with HMAC SHA384
    | 'JWT_HS512'        // JWT with HMAC SHA512
    | 'JWT_RS256'        // JWT with RSA SHA256 (Coinbase Cloud)
    | 'JWT_RS384'        // JWT with RSA SHA384
    | 'JWT_RS512'        // JWT with RSA SHA512
    | 'JWT_ES256'        // JWT with ECDSA P-256 SHA256 (Upbit)
    | 'JWT_ES384'        // JWT with ECDSA P-384 SHA384
    | 'JWT_ES512'        // JWT with ECDSA P-521 SHA512
    | 'JWT_EDDSA'        // JWT with EdDSA (Ed25519)
    // EdDSA strategies
    | 'EDDSA_ED25519'    // Backpack, WooFi Pro, Waves Exchange
    // ECDSA strategies
    | 'ECDSA_SECP256K1'  // Hyperliquid (Ethereum-style signing)
    | 'ECDSA_P256'       // NIST P-256 curve
    // RSA strategies
    | 'RSA_SHA256'       // Binance with PEM keys
    | 'RSA_SHA384'       // RSA with SHA384
    | 'RSA_SHA512'       // RSA with SHA512
    // Simple strategies
    | 'API_KEY_ONLY'     // Simple header-based API key (no signature)
    | 'BASIC_AUTH'       // HTTP Basic authentication
    | 'BEARER_TOKEN'     // OAuth 2.0 Bearer token
    | 'NONE'             // No authentication required
    | 'CUSTOM';          // Custom authentication scheme

/**
 * Signature placement options
 */
export type SignaturePlacement = 'header' | 'query' | 'body';

/**
 * Hash algorithm types
 */
export type HashAlgorithm = 'SHA1' | 'SHA256' | 'SHA384' | 'SHA512' | 'MD5';

/**
 * Encoding types
 */
export type EncodingType = 'hex' | 'base64' | 'base64url' | 'binary' | 'base58';

/**
 * Authentication strategy configuration
 * Defines the primitives required for each strategy
 */
export interface AuthStrategyConfig {
    /** The authentication strategy */
    strategy: AuthStrategy;

    /** Hash algorithm used (for HMAC, RSA, etc.) */
    hashAlgorithm?: HashAlgorithm;

    /** Encoding for signature output */
    encoding?: EncodingType;

    /** Where to place the signature */
    placement: SignaturePlacement[];

    /** Whether a passphrase/password is required */
    requiresPassphrase?: boolean;

    /** Whether a private key (PEM format) is required */
    requiresPrivateKey?: boolean;

    /** Whether timestamp is required in signature */
    requiresTimestamp?: boolean;

    /** Whether nonce is required in signature */
    requiresNonce?: boolean;

    /** Custom header names for authentication */
    headers?: {
        apiKey?: string;      // e.g., 'X-API-KEY', 'KC-API-KEY'
        signature?: string;   // e.g., 'X-SIGNATURE', 'KC-API-SIGN'
        timestamp?: string;   // e.g., 'X-TIMESTAMP', 'KC-API-TIMESTAMP'
        passphrase?: string;  // e.g., 'KC-API-PASSPHRASE'
        nonce?: string;       // e.g., 'X-NONCE'
    };

    /** Additional configuration */
    metadata?: {
        /** Description of the strategy */
        description?: string;
        /** Example exchanges using this strategy */
        examples?: string[];
    };
}

/**
 * Map an authentication strategy to its corresponding mode
 */
export function strategyToMode(strategy: AuthStrategy): AuthMode {
    if (strategy === 'NONE') return 'none';
    if (strategy === 'API_KEY_ONLY') return 'apiKey';
    if (strategy === 'BASIC_AUTH') return 'basic';
    if (strategy === 'BEARER_TOKEN') return 'bearer';
    if (strategy.startsWith('JWT_')) return 'oauth';
    if (strategy === 'CUSTOM') return 'custom';
    // All signature-based strategies (HMAC, ECDSA, EdDSA, RSA)
    return 'signature';
}

/**
 * Check if a strategy requires a secret key
 */
export function strategyRequiresSecret(strategy: AuthStrategy): boolean {
    return strategy.startsWith('HMAC_') || strategy.startsWith('JWT_HS');
}

/**
 * Check if a strategy requires a private key
 */
export function strategyRequiresPrivateKey(strategy: AuthStrategy): boolean {
    return (
        strategy.startsWith('JWT_RS') ||
        strategy.startsWith('JWT_ES') ||
        strategy === 'JWT_EDDSA' ||
        strategy.startsWith('ECDSA_') ||
        strategy === 'EDDSA_ED25519' ||
        strategy.startsWith('RSA_')
    );
}

/**
 * Get recommended strategies for an authentication mode
 */
export function getStrategiesForMode(mode: AuthMode): AuthStrategy[] {
    switch (mode) {
        case 'none':
            return ['NONE'];
        case 'apiKey':
            return ['API_KEY_ONLY'];
        case 'signature':
            return [
                'HMAC_SHA256',
                'HMAC_SHA512',
                'HMAC_SHA384',
                'ECDSA_SECP256K1',
                'EDDSA_ED25519',
                'RSA_SHA256',
            ];
        case 'oauth':
        case 'bearer':
            return ['BEARER_TOKEN', 'JWT_HS256', 'JWT_RS256', 'JWT_ES256'];
        case 'basic':
            return ['BASIC_AUTH'];
        case 'custom':
            return ['CUSTOM'];
        default:
            return [];
    }
}

/**
 * Get default configuration for an authentication strategy
 */
export function getAuthStrategyConfig(strategy: AuthStrategy): AuthStrategyConfig {
    const configs: Record<AuthStrategy, AuthStrategyConfig> = {
        'HMAC_SHA256': {
            strategy: 'HMAC_SHA256',
            hashAlgorithm: 'SHA256',
            encoding: 'hex',
            placement: ['header'],
            requiresTimestamp: true,
            metadata: {
                description: 'HMAC-SHA256 signature authentication',
                examples: ['Binance', 'OKX', 'Bybit', 'Bitget', 'HTX'],
            },
        },
        'HMAC_SHA512': {
            strategy: 'HMAC_SHA512',
            hashAlgorithm: 'SHA512',
            encoding: 'hex',
            placement: ['header'],
            requiresTimestamp: true,
            metadata: {
                description: 'HMAC-SHA512 signature authentication',
                examples: ['Kraken', 'Gate.io', 'Poloniex', 'EXMO'],
            },
        },
        'HMAC_SHA384': {
            strategy: 'HMAC_SHA384',
            hashAlgorithm: 'SHA384',
            encoding: 'hex',
            placement: ['header'],
            requiresTimestamp: true,
            metadata: {
                description: 'HMAC-SHA384 signature authentication',
                examples: ['Gemini', 'Bitfinex'],
            },
        },
        'HMAC_SHA1': {
            strategy: 'HMAC_SHA1',
            hashAlgorithm: 'SHA1',
            encoding: 'hex',
            placement: ['header'],
            metadata: {
                description: 'HMAC-SHA1 signature authentication (legacy)',
                examples: ['Legacy exchanges'],
            },
        },
        'JWT_HS256': {
            strategy: 'JWT_HS256',
            hashAlgorithm: 'SHA256',
            encoding: 'base64url',
            placement: ['header'],
            metadata: {
                description: 'JWT with HMAC SHA256',
                examples: [],
            },
        },
        'JWT_HS384': {
            strategy: 'JWT_HS384',
            hashAlgorithm: 'SHA384',
            encoding: 'base64url',
            placement: ['header'],
            metadata: {
                description: 'JWT with HMAC SHA384',
                examples: [],
            },
        },
        'JWT_HS512': {
            strategy: 'JWT_HS512',
            hashAlgorithm: 'SHA512',
            encoding: 'base64url',
            placement: ['header'],
            metadata: {
                description: 'JWT with HMAC SHA512',
                examples: [],
            },
        },
        'JWT_RS256': {
            strategy: 'JWT_RS256',
            hashAlgorithm: 'SHA256',
            encoding: 'base64url',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'JWT with RSA SHA256',
                examples: ['Coinbase Cloud', 'OceanEx'],
            },
        },
        'JWT_RS384': {
            strategy: 'JWT_RS384',
            hashAlgorithm: 'SHA384',
            encoding: 'base64url',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'JWT with RSA SHA384',
                examples: [],
            },
        },
        'JWT_RS512': {
            strategy: 'JWT_RS512',
            hashAlgorithm: 'SHA512',
            encoding: 'base64url',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'JWT with RSA SHA512',
                examples: [],
            },
        },
        'JWT_ES256': {
            strategy: 'JWT_ES256',
            hashAlgorithm: 'SHA256',
            encoding: 'base64url',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'JWT with ECDSA P-256 SHA256',
                examples: ['Upbit'],
            },
        },
        'JWT_ES384': {
            strategy: 'JWT_ES384',
            hashAlgorithm: 'SHA384',
            encoding: 'base64url',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'JWT with ECDSA P-384 SHA384',
                examples: [],
            },
        },
        'JWT_ES512': {
            strategy: 'JWT_ES512',
            hashAlgorithm: 'SHA512',
            encoding: 'base64url',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'JWT with ECDSA P-521 SHA512',
                examples: [],
            },
        },
        'JWT_EDDSA': {
            strategy: 'JWT_EDDSA',
            encoding: 'base64url',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'JWT with EdDSA (Ed25519)',
                examples: [],
            },
        },
        'EDDSA_ED25519': {
            strategy: 'EDDSA_ED25519',
            encoding: 'hex',
            placement: ['header'],
            requiresPrivateKey: true,
            requiresTimestamp: true,
            metadata: {
                description: 'EdDSA signature with Ed25519 curve',
                examples: ['Backpack', 'WooFi Pro', 'Waves Exchange'],
            },
        },
        'ECDSA_SECP256K1': {
            strategy: 'ECDSA_SECP256K1',
            hashAlgorithm: 'SHA256',
            encoding: 'hex',
            placement: ['header', 'body'],
            requiresPrivateKey: true,
            metadata: {
                description: 'ECDSA signature with secp256k1 curve (Ethereum-style)',
                examples: ['Hyperliquid', 'Paradex'],
            },
        },
        'ECDSA_P256': {
            strategy: 'ECDSA_P256',
            hashAlgorithm: 'SHA256',
            encoding: 'hex',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'ECDSA signature with NIST P-256 curve',
                examples: [],
            },
        },
        'RSA_SHA256': {
            strategy: 'RSA_SHA256',
            hashAlgorithm: 'SHA256',
            encoding: 'base64',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'RSA signature with SHA256',
                examples: ['Binance (with PEM keys)'],
            },
        },
        'RSA_SHA384': {
            strategy: 'RSA_SHA384',
            hashAlgorithm: 'SHA384',
            encoding: 'base64',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'RSA signature with SHA384',
                examples: [],
            },
        },
        'RSA_SHA512': {
            strategy: 'RSA_SHA512',
            hashAlgorithm: 'SHA512',
            encoding: 'base64',
            placement: ['header'],
            requiresPrivateKey: true,
            metadata: {
                description: 'RSA signature with SHA512',
                examples: [],
            },
        },
        'API_KEY_ONLY': {
            strategy: 'API_KEY_ONLY',
            placement: ['header', 'query'],
            metadata: {
                description: 'Simple API key authentication without signatures',
                examples: ['Public endpoints with API key rate limits'],
            },
        },
        'BASIC_AUTH': {
            strategy: 'BASIC_AUTH',
            encoding: 'base64',
            placement: ['header'],
            metadata: {
                description: 'HTTP Basic authentication',
                examples: [],
            },
        },
        'BEARER_TOKEN': {
            strategy: 'BEARER_TOKEN',
            placement: ['header'],
            metadata: {
                description: 'OAuth 2.0 Bearer token authentication',
                examples: [],
            },
        },
        'NONE': {
            strategy: 'NONE',
            placement: [],
            metadata: {
                description: 'No authentication required',
                examples: [],
            },
        },
        'CUSTOM': {
            strategy: 'CUSTOM',
            placement: ['header'],
            metadata: {
                description: 'Custom authentication scheme',
                examples: [],
            },
        },
    };

    return configs[strategy];
}

/**
 * Get all available authentication strategies
 */
export function getAllAuthStrategies(): AuthStrategy[] {
    return [
        'HMAC_SHA256',
        'HMAC_SHA512',
        'HMAC_SHA384',
        'HMAC_SHA1',
        'JWT_HS256',
        'JWT_HS384',
        'JWT_HS512',
        'JWT_RS256',
        'JWT_RS384',
        'JWT_RS512',
        'JWT_ES256',
        'JWT_ES384',
        'JWT_ES512',
        'JWT_EDDSA',
        'EDDSA_ED25519',
        'ECDSA_SECP256K1',
        'ECDSA_P256',
        'RSA_SHA256',
        'RSA_SHA384',
        'RSA_SHA512',
        'API_KEY_ONLY',
        'BASIC_AUTH',
        'BEARER_TOKEN',
        'NONE',
        'CUSTOM',
    ];
}

/**
 * Get authentication strategy by name (case-insensitive)
 */
export function findAuthStrategy(name: string): AuthStrategy | undefined {
    const normalized = name.toUpperCase().replace(/[-\s]/g, '_');
    const strategies = getAllAuthStrategies();
    return strategies.find(s => s === normalized);
}

/**
 * Validate that a strategy is compatible with a mode
 */
export function isStrategyCompatibleWithMode(strategy: AuthStrategy, mode: AuthMode): boolean {
    const derivedMode = strategyToMode(strategy);
    return derivedMode === mode;
}

/**
 * Get credential requirements for a strategy
 */
export function getStrategyCredentials(strategy: AuthStrategy): CredentialRequirements {
    const config = getAuthStrategyConfig(strategy);
    const creds: CredentialRequirements = {
        apiKey: true, // Most strategies need API key
    };

    if (strategy === 'NONE') {
        return {};
    }

    if (strategy === 'BASIC_AUTH') {
        return {
            login: true,
            password: true,
        };
    }

    if (strategy === 'BEARER_TOKEN') {
        return {
            token: true,
        };
    }

    if (strategyRequiresSecret(strategy)) {
        creds.secret = true;
    }

    if (strategyRequiresPrivateKey(strategy)) {
        creds.privateKey = true;
    }

    if (config.requiresPassphrase) {
        creds.password = true; // passphrase stored as password
    }

    return creds;
}

// ============================================================
// Authentication Mode Types
// ============================================================

/**
 * Supported authentication modes for API endpoints
 */
export type AuthMode =
    | 'none'        // No authentication required
    | 'apiKey'      // API key authentication (public endpoints with rate limits)
    | 'signature'   // HMAC/signature-based authentication
    | 'oauth'       // OAuth 2.0 authentication
    | 'basic'       // HTTP Basic authentication
    | 'bearer'      // Bearer token authentication
    | 'custom';     // Custom authentication scheme

// ============================================================
// Credential Requirements
// ============================================================

/**
 * Credentials required for authentication
 */
export interface CredentialRequirements {
    /** API key required */
    apiKey?: boolean;

    /** Secret key required */
    secret?: boolean;

    /** User ID required */
    uid?: boolean;

    /** Login/username required */
    login?: boolean;

    /** Password required */
    password?: boolean;

    /** Two-factor authentication required */
    twofa?: boolean;

    /** Private key required (for signature-based auth) */
    privateKey?: boolean;

    /** Wallet address required */
    walletAddress?: boolean;

    /** Access token required (for OAuth/Bearer) */
    token?: boolean;

    /** Refresh token for OAuth */
    refreshToken?: boolean;

    /** Custom credential fields */
    custom?: Record<string, boolean>;
}

// ============================================================
// Per-Endpoint Authentication Configuration
// ============================================================

/**
 * Authentication configuration for a specific endpoint
 */
export interface EndpointAuthConfig {
    /** Authentication mode for this endpoint */
    mode: AuthMode;

    /** Specific authentication strategy (optional, provides detailed strategy info) */
    strategy?: AuthStrategy;

    /** Whether authentication is required (default: true for all modes except 'none') */
    required?: boolean;

    /** Required credentials (inferred from mode if not specified) */
    credentials?: CredentialRequirements;

    /** Required permissions/scopes */
    permissions?: string[];

    /** Authentication headers to include */
    headers?: Record<string, string>;

    /** Custom authentication configuration */
    custom?: CustomAuthConfig;
}

/**
 * Custom authentication configuration
 */
export interface CustomAuthConfig {
    /** Authentication scheme name */
    scheme: string;

    /** Template for authentication value */
    template?: string;

    /** Header name for authentication */
    headerName?: string;

    /** Query parameter name for authentication */
    queryParam?: string;

    /** Additional configuration */
    config?: Record<string, any>;
}

// ============================================================
// Auth Mode Schema
// ============================================================

/**
 * Complete authentication schema definition
 * Maps endpoint identifiers to their authentication configurations
 */
export interface AuthModeSchema {
    /** Default authentication mode for all endpoints (if not specified per-endpoint) */
    default?: EndpointAuthConfig;

    /** Per-endpoint authentication configurations */
    endpoints?: Record<string, EndpointAuthConfig>;

    /** Global authentication settings */
    global?: {
        /** Base authentication headers always included */
        headers?: Record<string, string>;

        /** Global required credentials */
        credentials?: CredentialRequirements;
    };
}

// ============================================================
// Type Guards
// ============================================================

/**
 * Check if an auth mode requires credentials
 */
export function requiresAuth(mode: AuthMode): boolean {
    return mode !== 'none';
}

/**
 * Check if an auth mode supports signature-based authentication
 */
export function isSignatureBased(mode: AuthMode): boolean {
    return mode === 'signature';
}

/**
 * Check if an auth mode uses token-based authentication
 */
export function isTokenBased(mode: AuthMode): boolean {
    return mode === 'oauth' || mode === 'bearer';
}

/**
 * Check if authentication config is valid
 */
export function isValidAuthConfig(config: EndpointAuthConfig): boolean {
    if (!config.mode) {
        return false;
    }

    // 'none' mode should not have credentials or permissions
    if (config.mode === 'none') {
        if (config.credentials || config.permissions) {
            return false;
        }
    }

    return true;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get default credentials for an authentication mode
 * @param mode - Authentication mode
 * @returns Default credential requirements
 */
export function getDefaultCredentials(mode: AuthMode): CredentialRequirements {
    switch (mode) {
        case 'none':
            return {};

        case 'apiKey':
            return {
                apiKey: true,
            };

        case 'signature':
            return {
                apiKey: true,
                secret: true,
            };

        case 'oauth':
            return {
                token: true,
                refreshToken: false,
            };

        case 'basic':
            return {
                login: true,
                password: true,
            };

        case 'bearer':
            return {
                token: true,
            };

        case 'custom':
            return {};

        default:
            return {};
    }
}

/**
 * Resolve authentication config for an endpoint
 * @param schema - Authentication schema
 * @param endpointId - Endpoint identifier
 * @returns Resolved authentication config
 */
export function resolveAuthConfig(
    schema: AuthModeSchema | undefined,
    endpointId: string
): EndpointAuthConfig | undefined {
    if (!schema) {
        return undefined;
    }

    const endpointSpecific = schema.endpoints?.[endpointId];
    const baseConfig = endpointSpecific ?? schema.default;
    if (!baseConfig) {
        return undefined;
    }

    const resolved: EndpointAuthConfig = {
        ...baseConfig,
        required:
            baseConfig.required !== undefined ? baseConfig.required : requiresAuth(baseConfig.mode),
    };

    const mergedCredentials = mergeCredentials(
        getDefaultCredentials(baseConfig.mode),
        schema.global?.credentials,
        baseConfig.credentials
    );

    resolved.credentials = hasCredentialEntries(mergedCredentials) ? mergedCredentials : undefined;

    if (schema.global?.headers || baseConfig.headers) {
        resolved.headers = {
            ...(schema.global?.headers ?? {}),
            ...(baseConfig.headers ?? {}),
        };
    }

    return resolved;
}

/**
 * Merge credential requirements from multiple sources
 * @param sources - Array of credential requirements to merge
 * @returns Merged credential requirements
 */
export function mergeCredentials(
    ...sources: Array<CredentialRequirements | undefined>
): CredentialRequirements {
    const result: CredentialRequirements = {};

    for (const source of sources) {
        if (!source) continue;
        for (const [key, value] of Object.entries(source)) {
            if (value !== undefined) {
                if (key === 'custom' && typeof value === 'object') {
                    result.custom = { ...result.custom, ...value };
                } else {
                    (result as any)[key] = value;
                }
            }
        }
    }

    return result;
}

const CREDENTIAL_KEYS: (keyof CredentialRequirements)[] = [
    'apiKey',
    'secret',
    'uid',
    'login',
    'password',
    'twofa',
    'privateKey',
    'walletAddress',
    'token',
    'refreshToken',
];

function hasCredentialEntries(creds?: CredentialRequirements): boolean {
    if (!creds) {
        return false;
    }

    if (CREDENTIAL_KEYS.some(key => creds[key])) {
        return true;
    }

    if (creds.custom) {
        return Object.values(creds.custom).some(Boolean);
    }

    return false;
}

function credentialsToList(creds?: CredentialRequirements): string[] | undefined {
    if (!creds) {
        return undefined;
    }

    const names: string[] = [];

    for (const key of CREDENTIAL_KEYS) {
        if (creds[key]) {
            names.push(key);
        }
    }

    if (creds.custom) {
        for (const [name, required] of Object.entries(creds.custom)) {
            if (required) {
                names.push(`custom.${name}`);
            }
        }
    }

    return names.length > 0 ? names : undefined;
}

function authModeToSchemes(mode: AuthMode): AuthenticationRequirement['schemes'] {
    switch (mode) {
        case 'none':
            return undefined;
        case 'apiKey':
            return ['apiKey'];
        case 'signature':
            return ['signature'];
        case 'oauth':
            return ['oauth'];
        case 'bearer':
            return ['bearer'];
        case 'basic':
            return ['basic'];
        case 'custom':
            return ['custom'];
        default:
            return undefined;
    }
}

// ============================================================
// Authentication Resolution Helpers
// ============================================================

export interface EndpointWithAuthentication {
    /** Unique identifier for the endpoint (e.g., method name or path) */
    id: string;

    /** Existing authentication requirement (acts as fallback) */
    authentication?: AuthenticationRequirement;
}

/**
 * Resolve an `AuthenticationRequirement` for a given endpoint
 * @param schema - Authentication schema
 * @param endpointId - Endpoint identifier
 * @param fallback - Existing requirement to use when no override exists
 */
export function resolveAuthenticationRequirement(
    schema: AuthModeSchema | undefined,
    endpointId: string,
    fallback?: AuthenticationRequirement
): AuthenticationRequirement | undefined {
    const config = resolveAuthConfig(schema, endpointId);
    if (!config) {
        return fallback;
    }

    const requirement: AuthenticationRequirement = {
        required: config.required ?? requiresAuth(config.mode),
    };

    const schemes = authModeToSchemes(config.mode);
    if (schemes && schemes.length > 0) {
        requirement.schemes = schemes;
    }

    const credentialList = credentialsToList(config.credentials);
    if (credentialList) {
        requirement.credentials = credentialList;
    }

    if (config.permissions && config.permissions.length > 0) {
        requirement.permissions = [...config.permissions];
    }

    return requirement;
}

/**
 * Attach resolved authentication requirements to endpoints
 * @param schema - Authentication schema
 * @param endpoints - Endpoints that should receive authentication metadata
 */
export function attachAuthentication<T extends EndpointWithAuthentication>(
    schema: AuthModeSchema | undefined,
    endpoints: T[]
): T[] {
    if (!schema) {
        return endpoints;
    }

    return endpoints.map(endpoint => {
        const resolved = resolveAuthenticationRequirement(schema, endpoint.id, endpoint.authentication);
        if (resolved === endpoint.authentication) {
            return endpoint;
        }
        return {
            ...endpoint,
            authentication: resolved,
        };
    });
}

/**
 * Validate authentication mode schema
 * @param schema - Authentication schema to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateAuthModeSchema(schema: AuthModeSchema): string[] {
    const errors: string[] = [];

    // Validate default config if present
    if (schema.default) {
        const defaultErrors = validateAuthConfig('default', schema.default);
        errors.push(...defaultErrors);
    }

    // Validate endpoint-specific configs
    if (schema.endpoints) {
        for (const [endpointId, config] of Object.entries(schema.endpoints)) {
            const configErrors = validateAuthConfig(endpointId, config);
            errors.push(...configErrors);
        }
    }

    return errors;
}

/**
 * Validate a single authentication configuration
 * @param endpointId - Endpoint identifier (for error messages)
 * @param config - Authentication configuration to validate
 * @returns Array of validation error messages
 */
export function validateAuthConfig(endpointId: string, config: EndpointAuthConfig): string[] {
    const errors: string[] = [];

    // Validate mode is set
    if (!config.mode) {
        errors.push(`Authentication mode is required for endpoint '${endpointId}'`);
        return errors;
    }

    // Validate mode value
    const validModes: AuthMode[] = ['none', 'apiKey', 'signature', 'oauth', 'basic', 'bearer', 'custom'];
    if (!validModes.includes(config.mode)) {
        errors.push(`Invalid authentication mode '${config.mode}' for endpoint '${endpointId}'. Must be one of: ${validModes.join(', ')}`);
    }

    // 'none' mode should not have credentials or permissions
    if (config.mode === 'none') {
        if (config.credentials && Object.keys(config.credentials).length > 0) {
            errors.push(`Endpoint '${endpointId}' with auth mode 'none' should not have credential requirements`);
        }
        if (config.permissions && config.permissions.length > 0) {
            errors.push(`Endpoint '${endpointId}' with auth mode 'none' should not have permission requirements`);
        }
    }

    // Custom mode should have custom config
    if (config.mode === 'custom') {
        if (!config.custom) {
            errors.push(`Endpoint '${endpointId}' with auth mode 'custom' must provide custom configuration`);
        } else if (!config.custom.scheme) {
            errors.push(`Custom authentication for endpoint '${endpointId}' must specify a scheme name`);
        }
    }

    // Validate credentials if present
    if (config.credentials) {
        const credErrors = validateCredentials(endpointId, config.credentials);
        errors.push(...credErrors);
    }

    return errors;
}

/**
 * Validate credential requirements
 * @param endpointId - Endpoint identifier (for error messages)
 * @param credentials - Credential requirements to validate
 * @returns Array of validation error messages
 */
export function validateCredentials(endpointId: string, credentials: CredentialRequirements): string[] {
    const errors: string[] = [];

    const validFields = [
        'apiKey', 'secret', 'uid', 'login', 'password', 'twofa',
        'privateKey', 'walletAddress', 'token', 'refreshToken', 'custom'
    ];

    for (const [field, value] of Object.entries(credentials)) {
        if (!validFields.includes(field)) {
            errors.push(`Invalid credential field '${field}' for endpoint '${endpointId}'`);
        }

        if (field !== 'custom' && typeof value !== 'boolean') {
            errors.push(`Credential field '${field}' for endpoint '${endpointId}' must be boolean, got ${typeof value}`);
        }

        if (field === 'custom' && typeof value !== 'object') {
            errors.push(`Credential field 'custom' for endpoint '${endpointId}' must be an object`);
        }
    }

    return errors;
}

/**
 * Create a default authentication schema
 * @param defaultMode - Default authentication mode
 * @param overrides - Endpoint-specific overrides
 * @returns Authentication schema with defaults
 */
export function createAuthModeSchema(
    defaultMode: AuthMode = 'signature',
    overrides?: Record<string, EndpointAuthConfig>
): AuthModeSchema {
    const schema: AuthModeSchema = {
        default: {
            mode: defaultMode,
            required: defaultMode !== 'none',
            credentials: getDefaultCredentials(defaultMode),
        },
    };

    if (overrides && Object.keys(overrides).length > 0) {
        schema.endpoints = overrides;
    }

    return schema;
}

/**
 * Check if an endpoint requires specific credentials
 * @param config - Authentication configuration
 * @param credentialName - Credential to check for
 * @returns True if credential is required
 */
export function requiresCredential(
    config: EndpointAuthConfig,
    credentialName: keyof CredentialRequirements
): boolean {
    // Get credentials from config or defaults
    const credentials = config.credentials || getDefaultCredentials(config.mode);

    if (credentialName === 'custom') {
        return credentials.custom !== undefined && Object.keys(credentials.custom).length > 0;
    }

    return credentials[credentialName] === true;
}

/**
 * Get all required credentials for an endpoint
 * @param config - Authentication configuration
 * @returns Array of required credential names
 */
export function getRequiredCredentials(config: EndpointAuthConfig): string[] {
    const credentials = config.credentials || getDefaultCredentials(config.mode);
    const required: string[] = [];

    for (const [key, value] of Object.entries(credentials)) {
        if (key === 'custom' && typeof value === 'object') {
            for (const [customKey, customValue] of Object.entries(value)) {
                if (customValue === true) {
                    required.push(`custom.${customKey}`);
                }
            }
        } else if (value === true) {
            required.push(key);
        }
    }

    return required;
}
