/**
 * Metadata Fields Schema Types and Utilities
 *
 * This module provides comprehensive schema definitions for exchange metadata fields
 * that need to be merged into the describe() output. These fields define the core
 * exchange characteristics and capabilities according to CCXT standards.
 */

import type { URLConfig, RequiredCredentials } from '../types/edl.js';

// ============================================================
// Core Metadata Field Types
// ============================================================

/**
 * Precision mode for price/amount calculations
 */
export type PrecisionMode = 'DECIMAL_PLACES' | 'SIGNIFICANT_DIGITS' | 'TICK_SIZE';

/**
 * Fee tier structure for trading fees
 */
export interface FeeTier {
    /** Minimum 30-day volume for this tier (in USD) */
    maker: number;
    /** Taker fee percentage at this tier */
    taker: number;
}

/**
 * Trading fee structure
 */
export interface TradingFees {
    /** Whether fees are percentage-based */
    percentage?: boolean;
    /** Whether fees are tier-based on volume */
    tierBased?: boolean;
    /** Default maker fee percentage */
    maker?: number;
    /** Default taker fee percentage */
    taker?: number;
    /** Fee tiers based on trading volume */
    tiers?: {
        maker?: FeeTier[];
        taker?: FeeTier[];
    };
}

/**
 * Fee structure by market type
 */
export interface FeesByMarketType {
    /** Spot market fees */
    spot?: TradingFees;
    /** Margin trading fees */
    margin?: TradingFees;
    /** Swap/perpetual futures fees */
    swap?: TradingFees;
    /** Futures fees */
    future?: TradingFees;
    /** Options fees */
    option?: TradingFees;
}

/**
 * Fee structure for deposits and withdrawals
 */
export interface FundingFees {
    /** Deposit fees by currency */
    deposit?: Record<string, number>;
    /** Withdrawal fees by currency */
    withdraw?: Record<string, number>;
}

/**
 * Complete fee structure
 */
export interface FeeStructure {
    /** Trading fees */
    trading?: FeesByMarketType;
    /** Funding (deposit/withdrawal) fees */
    funding?: FundingFees;
}

/**
 * API endpoint configuration
 */
export interface APIEndpointConfig {
    /** Public API endpoints */
    public?: string | Record<string, string>;
    /** Private/authenticated API endpoints */
    private?: string | Record<string, string>;
    /** Additional API categories (e.g., 'sapi', 'fapi', etc.) */
    [category: string]: string | Record<string, string> | undefined;
}

/**
 * Complete API structure for metadata
 */
export interface APIMetadata {
    /** Base API URLs by category */
    urls?: APIEndpointConfig;
    /** API version */
    version?: string;
    /** API endpoints list (simplified representation) */
    endpoints?: Record<string, any>;
}

// ============================================================
// Metadata Field Definitions
// ============================================================

/**
 * Individual metadata field definition
 */
export interface MetadataField<T = any> {
    /** Field name */
    name: string;
    /** Field description */
    description: string;
    /** TypeScript type */
    type: string;
    /** Whether the field is required */
    required: boolean;
    /** Default value if not specified */
    defaultValue?: T;
    /** Example value */
    example?: T;
    /** Validation function (optional) */
    validate?: (value: T) => boolean;
}

/**
 * Complete metadata fields schema
 */
export interface MetadataFieldsSchema {
    /** Exchange ID (unique identifier) */
    id: MetadataField<string>;
    /** Exchange name (display name) */
    name: MetadataField<string>;
    /** Countries where exchange is registered */
    countries: MetadataField<string[]>;
    /** API version string */
    version: MetadataField<string>;
    /** Rate limit in milliseconds between requests */
    rateLimit: MetadataField<number>;
    /** Whether exchange has pro/websocket support */
    pro: MetadataField<boolean>;
    /** Whether exchange is CCXT certified */
    certified: MetadataField<boolean>;
    /** Custom hostname for API requests */
    hostname: MetadataField<string>;
    /** URL configuration (logo, api, www, doc, fees, referral) */
    urls: MetadataField<URLConfig>;
    /** API endpoint structure */
    api: MetadataField<APIMetadata>;
    /** Supported timeframes for OHLCV data */
    timeframes: MetadataField<Record<string, string>>;
    /** Fee structure */
    fees: MetadataField<FeeStructure>;
    /** Required credential fields */
    requiredCredentials: MetadataField<RequiredCredentials>;
    /** Precision mode for calculations */
    precisionMode: MetadataField<PrecisionMode>;
}

// ============================================================
// Standard CCXT Metadata Fields
// ============================================================

/**
 * Standard metadata fields according to CCXT specification
 */
export const STANDARD_METADATA_FIELDS: MetadataFieldsSchema = {
    id: {
        name: 'id',
        description: 'Unique exchange identifier (lowercase, no spaces)',
        type: 'string',
        required: true,
        example: 'binance',
        validate: (value: string) => /^[a-z0-9_]+$/.test(value),
    },
    name: {
        name: 'name',
        description: 'Human-readable exchange name',
        type: 'string',
        required: true,
        example: 'Binance',
    },
    countries: {
        name: 'countries',
        description: 'List of country codes where exchange is registered',
        type: 'string[]',
        required: true,
        example: ['JP', 'MT'],
        defaultValue: [],
    },
    version: {
        name: 'version',
        description: 'API version identifier',
        type: 'string',
        required: false,
        example: 'v3',
    },
    rateLimit: {
        name: 'rateLimit',
        description: 'Minimum time in milliseconds between API requests',
        type: 'number',
        required: true,
        example: 50,
        defaultValue: 1000,
        validate: (value: number) => value > 0,
    },
    pro: {
        name: 'pro',
        description: 'Whether exchange has WebSocket/Pro API support',
        type: 'boolean',
        required: false,
        example: true,
        defaultValue: false,
    },
    certified: {
        name: 'certified',
        description: 'Whether exchange implementation is CCXT certified',
        type: 'boolean',
        required: false,
        example: true,
        defaultValue: false,
    },
    hostname: {
        name: 'hostname',
        description: 'Custom API hostname override',
        type: 'string',
        required: false,
        example: 'api.binance.com',
    },
    urls: {
        name: 'urls',
        description: 'URL configuration for logo, API endpoints, documentation, and fees',
        type: 'URLConfig',
        required: false,
        example: {
            logo: 'https://example.com/logo.png',
            api: {
                public: 'https://api.example.com/v1',
                private: 'https://api.example.com/v1',
            },
            www: 'https://example.com',
            doc: ['https://docs.example.com'],
            fees: 'https://example.com/fees',
        },
    },
    api: {
        name: 'api',
        description: 'API endpoint structure and version information',
        type: 'APIMetadata',
        required: false,
        example: {
            version: 'v3',
            urls: {
                public: 'https://api.example.com/v3',
                private: 'https://api.example.com/v3',
            },
        },
    },
    timeframes: {
        name: 'timeframes',
        description: 'Supported timeframes for OHLCV data (key: CCXT format, value: exchange format)',
        type: 'Record<string, string>',
        required: false,
        example: {
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '1h': '1h',
            '4h': '4h',
            '1d': '1d',
        },
    },
    fees: {
        name: 'fees',
        description: 'Trading and funding fee structure',
        type: 'FeeStructure',
        required: false,
        example: {
            trading: {
                spot: {
                    percentage: true,
                    tierBased: false,
                    maker: 0.001,
                    taker: 0.001,
                },
            },
            funding: {
                withdraw: {
                    BTC: 0.0005,
                    ETH: 0.005,
                },
            },
        },
    },
    requiredCredentials: {
        name: 'requiredCredentials',
        description: 'Credential fields required for authentication',
        type: 'RequiredCredentials',
        required: false,
        example: {
            apiKey: true,
            secret: true,
        },
        defaultValue: {
            apiKey: false,
            secret: false,
        },
    },
    precisionMode: {
        name: 'precisionMode',
        description: 'Precision mode for price and amount calculations',
        type: 'PrecisionMode',
        required: false,
        example: 'DECIMAL_PLACES',
        defaultValue: 'DECIMAL_PLACES',
    },
};

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get all required metadata field names
 */
export function getRequiredMetadataFields(): string[] {
    return Object.values(STANDARD_METADATA_FIELDS)
        .filter((field) => field.required)
        .map((field) => field.name);
}

/**
 * Get all optional metadata field names
 */
export function getOptionalMetadataFields(): string[] {
    return Object.values(STANDARD_METADATA_FIELDS)
        .filter((field) => !field.required)
        .map((field) => field.name);
}

/**
 * Validate a metadata field value
 */
export function validateMetadataField<T>(
    fieldName: string,
    value: T
): { valid: boolean; error?: string } {
    const field = STANDARD_METADATA_FIELDS[fieldName as keyof MetadataFieldsSchema];

    if (!field) {
        return { valid: false, error: `Unknown metadata field: ${fieldName}` };
    }

    // Check if required field is missing
    if (field.required && (value === undefined || value === null)) {
        return { valid: false, error: `Required field '${fieldName}' is missing` };
    }

    // Run custom validation if provided
    if (field.validate && value !== undefined && value !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(field.validate as (val: any) => boolean)(value)) {
            return { valid: false, error: `Validation failed for field '${fieldName}'` };
        }
    }

    return { valid: true };
}

/**
 * Validate all metadata fields in an object
 */
export function validateMetadata(metadata: Record<string, any>): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check all required fields
    const requiredFields = getRequiredMetadataFields();
    for (const fieldName of requiredFields) {
        const result = validateMetadataField(fieldName, metadata[fieldName]);
        if (!result.valid && result.error) {
            errors.push(result.error);
        }
    }

    // Validate all present fields
    for (const [fieldName, value] of Object.entries(metadata)) {
        if (STANDARD_METADATA_FIELDS[fieldName as keyof MetadataFieldsSchema]) {
            const result = validateMetadataField(fieldName, value);
            if (!result.valid && result.error) {
                errors.push(result.error);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get default value for a metadata field
 */
export function getMetadataFieldDefault<T>(fieldName: string): T | undefined {
    const field = STANDARD_METADATA_FIELDS[fieldName as keyof MetadataFieldsSchema];
    return field?.defaultValue as T | undefined;
}

/**
 * Check if a metadata field is required
 */
export function isMetadataFieldRequired(fieldName: string): boolean {
    const field = STANDARD_METADATA_FIELDS[fieldName as keyof MetadataFieldsSchema];
    return field?.required ?? false;
}

/**
 * Get metadata field type
 */
export function getMetadataFieldType(fieldName: string): string | undefined {
    const field = STANDARD_METADATA_FIELDS[fieldName as keyof MetadataFieldsSchema];
    return field?.type;
}

/**
 * Get all metadata field names
 */
export function getAllMetadataFieldNames(): string[] {
    return Object.keys(STANDARD_METADATA_FIELDS);
}

/**
 * Create a metadata object with default values
 */
export function createMetadataDefaults(): Partial<Record<keyof MetadataFieldsSchema, any>> {
    const defaults: any = {};

    for (const [fieldName, field] of Object.entries(STANDARD_METADATA_FIELDS)) {
        if (field.defaultValue !== undefined) {
            defaults[fieldName] = field.defaultValue;
        }
    }

    return defaults;
}
