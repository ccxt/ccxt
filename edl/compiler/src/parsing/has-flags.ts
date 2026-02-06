/**
 * Has Flags Parser
 * Parses and validates 'has' flag definitions from EDL documents
 */

import type {
    HasFlag,
    HasFlagValue,
    HasFlagsSchema,
    MarketHasOverride,
} from '../schemas/has-flags.js';
import {
    isSimpleHasFlag,
    isMarketHasOverride,
    validateHasFlags,
} from '../schemas/has-flags.js';
import type { SourceLocation } from '../types/edl.js';

// ============================================================
// Parse Result Types
// ============================================================

/**
 * Result of parsing has flags
 */
export interface HasFlagsParseResult {
    /** Successfully parsed has flags schema */
    schema: HasFlagsSchema;

    /** Validation errors encountered during parsing */
    errors: HasFlagsParseError[];

    /** Warnings (e.g., deprecated capability keys) */
    warnings: string[];
}

/**
 * Parse error with location information
 */
export interface HasFlagsParseError {
    message: string;
    location?: SourceLocation;
    key?: string;
}

// ============================================================
// Has Flags Parser
// ============================================================

/**
 * Parser for 'has' capability flags
 * Supports boolean values, null, 'emulated', and per-market-type overrides
 */
export class HasFlagsParser {
    private errors: HasFlagsParseError[] = [];
    private warnings: string[] = [];

    /**
     * Parse has flags from raw YAML/JSON object
     * @param raw Raw has flags object from parsed YAML
     * @param location Source location for error reporting
     * @returns Parse result with schema and errors
     */
    parse(raw: any, location?: SourceLocation): HasFlagsParseResult {
        this.errors = [];
        this.warnings = [];

        if (!raw || typeof raw !== 'object') {
            this.errors.push({
                message: 'Has flags must be an object',
                location,
            });
            return this.createResult({});
        }

        if (Array.isArray(raw)) {
            this.errors.push({
                message: 'Has flags must be an object, not an array',
                location,
            });
            return this.createResult({});
        }

        const schema: HasFlagsSchema = {};

        for (const [key, value] of Object.entries(raw)) {
            const flagLocation = this.extendLocation(location, key);
            const parsedFlag = this.parseHasFlag(key, value, flagLocation);

            if (parsedFlag !== undefined) {
                schema[key] = parsedFlag;
            }
        }

        // Perform schema-wide validation
        const validationErrors = validateHasFlags(schema);
        for (const error of validationErrors) {
            this.errors.push({
                message: error,
                location,
            });
        }

        return this.createResult(schema);
    }

    /**
     * Parse a single has flag value
     * @param key Capability key name
     * @param value Raw value from YAML
     * @param location Source location
     * @returns Parsed HasFlag or undefined if invalid
     */
    private parseHasFlag(key: string, value: any, location?: SourceLocation): HasFlag | undefined {
        // Handle simple values: boolean, null, 'emulated'
        if (this.isValidSimpleValue(value)) {
            return value as HasFlagValue;
        }

        // Handle market-specific overrides
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return this.parseMarketOverride(key, value, location);
        }

        // Invalid value
        this.errors.push({
            message: `Invalid value for '${key}': ${JSON.stringify(value)}. Must be boolean, null, 'emulated', or market override object`,
            location,
            key,
        });

        return undefined;
    }

    /**
     * Check if a value is a valid simple HasFlagValue
     * @param value Value to check
     * @returns True if valid simple value
     */
    private isValidSimpleValue(value: any): boolean {
        return value === true || value === false || value === null || value === 'emulated';
    }

    /**
     * Parse market-specific override object
     * @param key Capability key name
     * @param obj Override object
     * @param location Source location
     * @returns Parsed MarketHasOverride or undefined if invalid
     */
    private parseMarketOverride(
        key: string,
        obj: any,
        location?: SourceLocation
    ): MarketHasOverride | undefined {
        const validMarketTypes = ['default', 'spot', 'margin', 'swap', 'future', 'option', 'index'];
        const override: MarketHasOverride = {};
        let hasValidField = false;

        for (const [marketType, value] of Object.entries(obj)) {
            // Validate market type name
            if (!validMarketTypes.includes(marketType)) {
                this.errors.push({
                    message: `Invalid market type '${marketType}' in override for '${key}'. Valid types: ${validMarketTypes.join(', ')}`,
                    location: this.extendLocation(location, marketType),
                    key,
                });
                continue;
            }

            // Validate market type value
            if (!this.isValidSimpleValue(value)) {
                this.errors.push({
                    message: `Invalid value for '${key}.${marketType}': ${JSON.stringify(value)}. Must be boolean, null, or 'emulated'`,
                    location: this.extendLocation(location, marketType),
                    key,
                });
                continue;
            }

            // Valid market type and value
            (override as any)[marketType] = value as HasFlagValue;
            hasValidField = true;
        }

        // Return undefined if no valid fields were found
        if (!hasValidField) {
            this.errors.push({
                message: `Market override for '${key}' contains no valid market type fields`,
                location,
                key,
            });
            return undefined;
        }

        return override;
    }

    /**
     * Create a parse result
     * @param schema Parsed schema
     * @returns Parse result with errors and warnings
     */
    private createResult(schema: HasFlagsSchema): HasFlagsParseResult {
        return {
            schema,
            errors: [...this.errors],
            warnings: [...this.warnings],
        };
    }

    /**
     * Extend a source location with an additional path segment
     * @param location Base location
     * @param segment Path segment to add
     * @returns Extended location
     */
    private extendLocation(location?: SourceLocation, segment?: string): SourceLocation | undefined {
        if (!location) {
            return segment ? { path: segment } : undefined;
        }

        if (!segment) {
            return location;
        }

        const path = location.path ? `${location.path}.${segment}` : segment;
        return {
            ...location,
            path,
        };
    }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Parse has flags from a raw object
 * Convenience function that creates a parser and parses
 * @param raw Raw has flags object
 * @param location Source location
 * @returns Parse result
 */
export function parseHasFlags(raw: any, location?: SourceLocation): HasFlagsParseResult {
    const parser = new HasFlagsParser();
    return parser.parse(raw, location);
}

/**
 * Parse and validate has flags, throwing on error
 * @param raw Raw has flags object
 * @param location Source location
 * @returns Validated HasFlagsSchema
 * @throws Error if parsing or validation fails
 */
export function parseHasFlagsStrict(raw: any, location?: SourceLocation): HasFlagsSchema {
    const result = parseHasFlags(raw, location);

    if (result.errors.length > 0) {
        const errorMessages = result.errors.map(e =>
            e.location ? `${e.location.path}: ${e.message}` : e.message
        );
        throw new Error(`Has flags validation failed:\n${errorMessages.join('\n')}`);
    }

    return result.schema;
}

/**
 * Check if a raw value is a valid has flag value
 * @param value Value to check
 * @returns True if value is a valid has flag
 */
export function isValidHasFlagValue(value: any): boolean {
    const parser = new HasFlagsParser();
    return (parser as any).isValidSimpleValue(value);
}

/**
 * Normalize has flags from legacy format to current format
 * Handles backwards compatibility for older EDL files
 * @param raw Raw has flags (may be legacy format)
 * @returns Normalized HasFlagsSchema
 */
export function normalizeHasFlags(raw: any): HasFlagsSchema {
    if (!raw || typeof raw !== 'object') {
        return {};
    }

    const result = parseHasFlags(raw);

    // If parsing succeeded, return the schema
    // If there were errors, return an empty schema (graceful degradation)
    return result.errors.length === 0 ? result.schema : {};
}
