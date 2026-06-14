/**
 * Snippet Embedding Mechanism for EDL Compiler
 * Phase 4-9.2: Implement Snippet Embedding Mechanism
 *
 * Provides functionality to embed imperative code snippets into DSL definitions,
 * supporting Binance-style dual endpoint patterns and flexible hook points.
 */

import {
    ImperativeSnippet,
    ConditionalSnippet,
    BranchingSnippet,
    SnippetRegistry,
    SnippetEmbed,
    EmbedLocation,
    createSnippetRegistry as createRegistry,
} from '../schemas/imperative-snippets.js';
import { EndpointDefinition } from '../types/edl.js';

/**
 * Hook points where snippets can be embedded
 */
export type HookPoint = 'pre-request' | 'post-response' | 'error-handling' | 'validation' | 'transformation';

/**
 * Placeholder pattern in endpoint definitions
 * Format: {{snippet:snippetId:hookPoint}}
 */
export const PLACEHOLDER_PATTERN = /\{\{snippet:([^:]+):([^}]+)\}\}/g;

/**
 * Embedded snippet with context
 */
export interface EmbeddedSnippet {
    snippetId: string;
    hookPoint: HookPoint;
    code: string;
    location: EmbedLocation;
    arguments?: Record<string, any>;
}

/**
 * Endpoint with embedded snippets
 */
export interface EndpointWithSnippets extends EndpointDefinition {
    snippets?: EmbeddedSnippet[];
    dualEndpoint?: {
        primary: string;
        secondary: string;
        condition?: string;
    };
}

/**
 * Options for snippet embedding
 */
export interface EmbedOptions {
    registry?: SnippetRegistry;
    validateSnippets?: boolean;
    preserveComments?: boolean;
    indentation?: number;
}

/**
 * Result of snippet embedding operation
 */
export interface EmbedResult {
    code: string;
    snippetsEmbedded: string[];
    errors: string[];
    warnings: string[];
}

/**
 * SnippetEmbedder class for embedding snippets into DSL definitions
 */
export class SnippetEmbedder {
    private registry: SnippetRegistry;
    private options: Required<EmbedOptions>;

    constructor(options: EmbedOptions = {}) {
        this.registry = options.registry || createRegistry();
        this.options = {
            registry: this.registry,
            validateSnippets: options.validateSnippets ?? true,
            preserveComments: options.preserveComments ?? true,
            indentation: options.indentation ?? 4,
        };
    }

    /**
     * Register a snippet in the registry
     */
    registerSnippet(snippet: ImperativeSnippet): void {
        this.registry.register(snippet);
    }

    /**
     * Get the snippet registry
     */
    getRegistry(): SnippetRegistry {
        return this.registry;
    }

    /**
     * Parse snippet placeholders from a string
     */
    parsePlaceholders(content: string): Array<{ snippetId: string; hookPoint: HookPoint; match: string }> {
        const placeholders: Array<{ snippetId: string; hookPoint: HookPoint; match: string }> = [];
        const regex = new RegExp(PLACEHOLDER_PATTERN);
        let match: RegExpExecArray | null;

        // Reset regex lastIndex
        regex.lastIndex = 0;

        while ((match = regex.exec(content)) !== null) {
            placeholders.push({
                snippetId: match[1],
                hookPoint: match[2] as HookPoint,
                match: match[0],
            });
        }

        return placeholders;
    }

    /**
     * Embed a snippet at a specific hook point
     */
    embedSnippet(
        snippetId: string,
        hookPoint: HookPoint,
        location: EmbedLocation = 'before',
        args?: Record<string, any>
    ): EmbedResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const snippetsEmbedded: string[] = [];

        const snippet = this.registry.get(snippetId);
        if (!snippet) {
            errors.push(`Snippet not found: ${snippetId}`);
            return { code: '', snippetsEmbedded, errors, warnings };
        }

        try {
            const embed: SnippetEmbed = {
                snippetId,
                location,
                target: hookPoint,
                arguments: args,
            };

            const code = this.registry.resolve(embed);
            snippetsEmbedded.push(snippetId);

            return { code, snippetsEmbedded, errors, warnings };
        } catch (error) {
            errors.push(`Error embedding snippet ${snippetId}: ${(error as Error).message}`);
            return { code: '', snippetsEmbedded, errors, warnings };
        }
    }

    /**
     * Embed snippets into endpoint definition
     */
    embedIntoEndpoint(endpoint: EndpointWithSnippets, context?: Record<string, any>): EmbedResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const snippetsEmbedded: string[] = [];
        const codeParts: string[] = [];

        // Handle dual endpoints even if snippets array is empty
        const hasSnippets = endpoint.snippets && endpoint.snippets.length > 0;
        const hasDualEndpoint = !!endpoint.dualEndpoint;

        if (!hasSnippets && !hasDualEndpoint) {
            return {
                code: '',
                snippetsEmbedded,
                errors,
                warnings,
            };
        }

        // Group snippets by hook point
        const byHookPoint: Partial<Record<HookPoint, EmbeddedSnippet[]>> = hasSnippets
            ? this.groupSnippetsByHookPoint(endpoint.snippets!)
            : {};

        // Embed pre-request hooks
        if (byHookPoint['pre-request']) {
            const result = this.embedHookPoint('pre-request', byHookPoint['pre-request'], context);
            codeParts.push(result.code);
            snippetsEmbedded.push(...result.snippetsEmbedded);
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        }

        // Handle dual endpoints (Binance-style)
        if (endpoint.dualEndpoint) {
            const dualCode = this.generateDualEndpointCode(endpoint.dualEndpoint, context);
            codeParts.push(dualCode);
        }

        // Embed post-response hooks
        if (byHookPoint['post-response']) {
            const result = this.embedHookPoint('post-response', byHookPoint['post-response'], context);
            codeParts.push(result.code);
            snippetsEmbedded.push(...result.snippetsEmbedded);
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        }

        // Embed error-handling hooks
        if (byHookPoint['error-handling']) {
            const result = this.embedHookPoint('error-handling', byHookPoint['error-handling'], context);
            codeParts.push(result.code);
            snippetsEmbedded.push(...result.snippetsEmbedded);
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        }

        // Embed validation hooks
        if (byHookPoint['validation']) {
            const result = this.embedHookPoint('validation', byHookPoint['validation'], context);
            codeParts.push(result.code);
            snippetsEmbedded.push(...result.snippetsEmbedded);
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        }

        // Embed transformation hooks
        if (byHookPoint['transformation']) {
            const result = this.embedHookPoint('transformation', byHookPoint['transformation'], context);
            codeParts.push(result.code);
            snippetsEmbedded.push(...result.snippetsEmbedded);
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        }

        return {
            code: codeParts.join('\n\n'),
            snippetsEmbedded,
            errors,
            warnings,
        };
    }

    /**
     * Replace placeholders in content with embedded snippets
     */
    replacePlaceholders(content: string, context?: Record<string, any>): EmbedResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const snippetsEmbedded: string[] = [];

        const placeholders = this.parsePlaceholders(content);

        if (placeholders.length === 0) {
            return { code: content, snippetsEmbedded, errors, warnings };
        }

        let result = content;

        for (const placeholder of placeholders) {
            const snippet = this.registry.get(placeholder.snippetId);
            if (!snippet) {
                errors.push(`Snippet not found: ${placeholder.snippetId}`);
                continue;
            }

            try {
                const embed: SnippetEmbed = {
                    snippetId: placeholder.snippetId,
                    location: 'replace',
                    target: placeholder.hookPoint,
                    arguments: context,
                };

                const code = this.registry.resolve(embed);
                result = result.replace(placeholder.match, code);
                snippetsEmbedded.push(placeholder.snippetId);
            } catch (error) {
                errors.push(`Error replacing placeholder ${placeholder.match}: ${(error as Error).message}`);
            }
        }

        return { code: result, snippetsEmbedded, errors, warnings };
    }

    /**
     * Bind parameters to snippet
     */
    bindParameters(snippet: ImperativeSnippet, params: Record<string, any>): string {
        let code = snippet.code || '';

        if (!snippet.inputs) {
            return code;
        }

        for (const input of snippet.inputs) {
            const value = params[input.name] ?? input.default;

            if (value === undefined && input.required) {
                throw new Error(`Required parameter '${input.name}' not provided for snippet '${snippet.id}'`);
            }

            if (value !== undefined) {
                const placeholder = new RegExp(`\\$\\{${input.name}\\}`, 'g');
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                code = code.replace(placeholder, stringValue);
            }
        }

        return code;
    }

    /**
     * Generate code for Binance-style dual endpoints
     */
    generateDualEndpointCode(
        dualEndpoint: { primary: string; secondary: string; condition?: string },
        context?: Record<string, any>
    ): string {
        const condition = dualEndpoint.condition || 'marketType === "spot"';

        return `// Dual endpoint selection
const endpoint = ${condition} ? '${dualEndpoint.primary}' : '${dualEndpoint.secondary}';`;
    }

    /**
     * Substitute variables in snippet code
     */
    substituteVariables(code: string, variables: Record<string, any>): string {
        let result = code;

        for (const [key, value] of Object.entries(variables)) {
            const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            result = result.replace(placeholder, stringValue);
        }

        return result;
    }

    /**
     * Group snippets by hook point
     */
    private groupSnippetsByHookPoint(snippets: EmbeddedSnippet[]): Record<HookPoint, EmbeddedSnippet[]> {
        const grouped: Record<string, EmbeddedSnippet[]> = {};

        for (const snippet of snippets) {
            if (!grouped[snippet.hookPoint]) {
                grouped[snippet.hookPoint] = [];
            }
            grouped[snippet.hookPoint].push(snippet);
        }

        return grouped as Record<HookPoint, EmbeddedSnippet[]>;
    }

    /**
     * Embed snippets at a specific hook point
     */
    private embedHookPoint(
        hookPoint: HookPoint,
        snippets: EmbeddedSnippet[],
        context?: Record<string, any>
    ): EmbedResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const snippetsEmbedded: string[] = [];
        const codeParts: string[] = [];

        codeParts.push(`// ${hookPoint} hooks`);

        for (const embeddedSnippet of snippets) {
            const snippet = this.registry.get(embeddedSnippet.snippetId);
            if (!snippet) {
                errors.push(`Snippet not found: ${embeddedSnippet.snippetId}`);
                continue;
            }

            try {
                const embed: SnippetEmbed = {
                    snippetId: embeddedSnippet.snippetId,
                    location: embeddedSnippet.location,
                    target: hookPoint,
                    arguments: { ...context, ...embeddedSnippet.arguments },
                };

                const code = this.registry.resolve(embed);
                codeParts.push(code);
                snippetsEmbedded.push(embeddedSnippet.snippetId);
            } catch (error) {
                errors.push(`Error embedding snippet ${embeddedSnippet.snippetId}: ${(error as Error).message}`);
            }
        }

        return {
            code: codeParts.join('\n'),
            snippetsEmbedded,
            errors,
            warnings,
        };
    }
}

/**
 * Create a snippet embedder instance
 */
export function createSnippetEmbedder(options?: EmbedOptions): SnippetEmbedder {
    return new SnippetEmbedder(options);
}

/**
 * Helper function to create a dual endpoint pattern (Binance-style)
 */
export function createDualEndpoint(
    primary: string,
    secondary: string,
    condition?: string
): EndpointWithSnippets['dualEndpoint'] {
    return {
        primary,
        secondary,
        condition: condition || 'marketType === "spot"',
    };
}

/**
 * Helper function to create an embedded snippet
 */
export function createEmbeddedSnippet(
    snippetId: string,
    hookPoint: HookPoint,
    location: EmbedLocation = 'before',
    args?: Record<string, any>
): EmbeddedSnippet {
    return {
        snippetId,
        hookPoint,
        code: '', // Will be populated during embedding
        location,
        arguments: args,
    };
}

/**
 * Validate hook point
 */
export function isValidHookPoint(hookPoint: string): hookPoint is HookPoint {
    return ['pre-request', 'post-response', 'error-handling', 'validation', 'transformation'].includes(hookPoint);
}
