/**
 * Capability Validator
 * Validates exchange capability definitions against known CCXT capability keys
 */

import {
    CapabilityCategory,
    CapabilityKey,
    getAllCapabilityKeys,
    getCapabilityCategory,
    isValidCapabilityKey,
    getCapabilityKeysByCategory,
} from './capability-keys.js';

/**
 * Severity levels for validation issues
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * Individual capability validation issue
 */
export interface CapabilityIssue {
    key: string;
    severity: ValidationSeverity;
    message: string;
    category?: CapabilityCategory;
    suggestion?: string;
}

/**
 * Comprehensive capability validation report
 */
export interface CapabilityValidationReport {
    valid: boolean;
    totalKeys: number;
    validKeys: number;
    invalidKeys: number;
    missingKeys: number;
    issues: CapabilityIssue[];
    errors: CapabilityIssue[];
    warnings: CapabilityIssue[];
    validCapabilities: CapabilityKey[];
    invalidCapabilities: string[];
    missingCapabilities: CapabilityKey[];
    categorySummary: Map<CapabilityCategory, number>;
}

/**
 * Options for capability validation
 */
export interface CapabilityValidationOptions {
    /**
     * Required capabilities that must be present
     */
    requiredCapabilities?: string[];

    /**
     * Expected capabilities (missing ones generate warnings, not errors)
     */
    expectedCapabilities?: string[];

    /**
     * Treat unknown capabilities as errors instead of warnings
     */
    strictMode?: boolean;

    /**
     * Include suggestions for typos and similar capability names
     */
    includeSuggestions?: boolean;

    /**
     * Categories to validate (if not specified, all categories are checked)
     */
    categories?: CapabilityCategory[];
}

/**
 * Capability Validator class for validating exchange capability definitions
 */
export class CapabilityValidator {
    private options: Required<CapabilityValidationOptions>;

    constructor(options: CapabilityValidationOptions = {}) {
        this.options = {
            requiredCapabilities: options.requiredCapabilities || [],
            expectedCapabilities: options.expectedCapabilities || [],
            strictMode: options.strictMode ?? false,
            includeSuggestions: options.includeSuggestions ?? true,
            categories: options.categories || Object.values(CapabilityCategory),
        };
    }

    /**
     * Validates a set of capabilities
     * @param capabilities - Object mapping capability keys to boolean values
     * @returns Validation report
     */
    validate(capabilities: Record<string, boolean | null | 'emulated'>): CapabilityValidationReport {
        const issues: CapabilityIssue[] = [];
        const validCapabilities: CapabilityKey[] = [];
        const invalidCapabilities: string[] = [];
        const categorySummary = new Map<CapabilityCategory, number>();

        // Initialize category summary
        for (const category of this.options.categories) {
            categorySummary.set(category, 0);
        }

        // Validate each provided capability
        for (const [key, value] of Object.entries(capabilities)) {
            if (isValidCapabilityKey(key)) {
                validCapabilities.push(key as CapabilityKey);
                const category = getCapabilityCategory(key)!;

                if (this.options.categories.includes(category)) {
                    categorySummary.set(category, (categorySummary.get(category) || 0) + 1);
                }
            } else {
                invalidCapabilities.push(key);

                const issue: CapabilityIssue = {
                    key,
                    severity: this.options.strictMode ? 'error' : 'warning',
                    message: `Unknown capability key: "${key}"`,
                };

                if (this.options.includeSuggestions) {
                    const suggestion = this.findSimilarCapability(key);
                    if (suggestion) {
                        issue.suggestion = suggestion;
                        issue.message += `. Did you mean "${suggestion}"?`;
                    }
                }

                issues.push(issue);
            }
        }

        // Check for missing required capabilities
        const missingRequired = this.detectMissingCapabilities(
            Object.keys(capabilities),
            this.options.requiredCapabilities
        );

        for (const key of missingRequired) {
            issues.push({
                key,
                severity: 'error',
                message: `Required capability "${key}" is missing`,
                category: getCapabilityCategory(key),
            });
        }

        // Check for missing expected capabilities (warnings only)
        const missingExpected = this.detectMissingCapabilities(
            Object.keys(capabilities),
            this.options.expectedCapabilities
        );

        for (const key of missingExpected) {
            if (!missingRequired.includes(key as CapabilityKey)) {
                issues.push({
                    key,
                    severity: 'warning',
                    message: `Expected capability "${key}" is missing`,
                    category: getCapabilityCategory(key),
                });
            }
        }

        const missingCapabilities = [...missingRequired, ...missingExpected.filter(
            k => !missingRequired.includes(k as CapabilityKey)
        )] as CapabilityKey[];

        // Separate errors and warnings
        const errors = issues.filter(i => i.severity === 'error');
        const warnings = issues.filter(i => i.severity === 'warning');

        return {
            valid: errors.length === 0,
            totalKeys: Object.keys(capabilities).length,
            validKeys: validCapabilities.length,
            invalidKeys: invalidCapabilities.length,
            missingKeys: missingCapabilities.length,
            issues,
            errors,
            warnings,
            validCapabilities,
            invalidCapabilities,
            missingCapabilities,
            categorySummary,
        };
    }

    /**
     * Detects missing capabilities by comparing against expected keys
     * @param providedKeys - Keys that are currently provided
     * @param expectedKeys - Keys that are expected to be present
     * @returns Array of missing capability keys
     */
    private detectMissingCapabilities(providedKeys: string[], expectedKeys: string[]): CapabilityKey[] {
        const missing: CapabilityKey[] = [];
        const providedSet = new Set(providedKeys);

        for (const key of expectedKeys) {
            if (!providedSet.has(key) && isValidCapabilityKey(key)) {
                missing.push(key as CapabilityKey);
            }
        }

        return missing;
    }

    /**
     * Finds similar capability names using Levenshtein distance
     * @param key - The invalid key to find suggestions for
     * @returns Suggested capability key, or undefined if no good match
     */
    private findSimilarCapability(key: string): string | undefined {
        const allKeys = getAllCapabilityKeys();
        let bestMatch: string | undefined;
        let bestDistance = Infinity;

        for (const validKey of allKeys) {
            const distance = this.levenshteinDistance(key.toLowerCase(), validKey.toLowerCase());

            // Consider it a good match if distance is <= 3 or if it's a prefix match
            if (distance < bestDistance && (distance <= 3 || validKey.toLowerCase().startsWith(key.toLowerCase()))) {
                bestDistance = distance;
                bestMatch = validKey;
            }
        }

        // Only return if we found a reasonably close match
        return bestDistance <= 3 ? bestMatch : undefined;
    }

    /**
     * Calculates Levenshtein distance between two strings
     * @param str1 - First string
     * @param str2 - Second string
     * @returns Edit distance
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix: number[][] = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return matrix[len1][len2];
    }
}

/**
 * Validates capabilities against known capability keys
 * @param capabilities - Object mapping capability keys to boolean values
 * @param options - Validation options
 * @returns Validation report
 */
export function validateCapabilities(
    capabilities: Record<string, boolean | null | 'emulated'>,
    options: CapabilityValidationOptions = {}
): CapabilityValidationReport {
    const validator = new CapabilityValidator(options);
    return validator.validate(capabilities);
}

/**
 * Detects missing capabilities from a list of expected keys
 * @param capabilities - Current capability definitions
 * @param expectedKeys - Keys that are expected
 * @returns Array of missing capability keys
 */
export function detectMissingCapabilities(
    capabilities: Record<string, boolean | null | 'emulated'>,
    expectedKeys: string[]
): CapabilityKey[] {
    const providedKeys = Object.keys(capabilities);
    const missing: CapabilityKey[] = [];
    const providedSet = new Set(providedKeys);

    for (const key of expectedKeys) {
        if (!providedSet.has(key) && isValidCapabilityKey(key)) {
            missing.push(key as CapabilityKey);
        }
    }

    return missing;
}

/**
 * Detects unknown capabilities that are not in the known keys list
 * @param capabilities - Capability definitions to validate
 * @returns Array of unknown capability keys
 */
export function detectUnknownCapabilities(
    capabilities: Record<string, boolean | null | 'emulated'>
): string[] {
    const unknown: string[] = [];

    for (const key of Object.keys(capabilities)) {
        if (!isValidCapabilityKey(key)) {
            unknown.push(key);
        }
    }

    return unknown;
}

/**
 * Generates a comprehensive capability validation report
 * @param capabilities - Capability definitions to validate
 * @param options - Validation options
 * @returns Formatted validation report
 */
export function generateCapabilityReport(
    capabilities: Record<string, boolean | null | 'emulated'>,
    options: CapabilityValidationOptions = {}
): CapabilityValidationReport {
    return validateCapabilities(capabilities, options);
}
