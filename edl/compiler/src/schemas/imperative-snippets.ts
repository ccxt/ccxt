/**
 * Schema for imperative code snippets in the EDL compiler
 * Phase 4-9.1: Define Schema for Imperative Snippets
 */

/**
 * Types of code snippets supported
 */
export type SnippetType = 'inline' | 'file' | 'function' | 'template';

/**
 * Input parameter for a snippet
 */
export interface SnippetInput {
    name: string;
    type: string;
    required?: boolean;
    default?: any;
}

/**
 * Output/return value for a snippet
 */
export interface SnippetOutput {
    name: string;
    type: string;
    description?: string;
}

/**
 * Base imperative code snippet definition
 */
export interface ImperativeSnippet {
    id: string;
    type: SnippetType;
    language: 'typescript' | 'javascript';
    code?: string;        // for inline snippets
    path?: string;        // for file-based snippets
    inputs?: SnippetInput[];
    outputs?: SnippetOutput[];
    description?: string;
}

/**
 * Conditional snippet with if/else branching
 */
export interface ConditionalSnippet {
    condition: string;
    thenSnippet: ImperativeSnippet | string;
    elseSnippet?: ImperativeSnippet | string;
}

/**
 * Branching snippet with switch/case logic
 */
export interface BranchingSnippet {
    expression: string;
    cases: Record<string, ImperativeSnippet | string>;
    default?: ImperativeSnippet | string;
}

/**
 * Location where snippet should be embedded
 */
export type EmbedLocation = 'before' | 'after' | 'replace' | 'wrap';

/**
 * Snippet embedding specification
 */
export interface SnippetEmbed {
    snippetId: string;
    location: EmbedLocation;
    target: string;
    arguments?: Record<string, any>;
}

/**
 * Registry for managing snippets
 */
export interface SnippetRegistry {
    snippets: Record<string, ImperativeSnippet>;
    register(snippet: ImperativeSnippet): void;
    get(id: string): ImperativeSnippet | undefined;
    resolve(embed: SnippetEmbed): string;
}

/**
 * Validation error for snippets
 */
export class SnippetValidationError extends Error {
    constructor(message: string, public snippet?: ImperativeSnippet) {
        super(message);
        this.name = 'SnippetValidationError';
    }
}

/**
 * Validate a snippet definition
 */
export function validateSnippet(snippet: ImperativeSnippet): void {
    // Validate required fields
    if (!snippet.id || typeof snippet.id !== 'string') {
        throw new SnippetValidationError('Snippet must have a valid id', snippet);
    }

    if (!snippet.type) {
        throw new SnippetValidationError('Snippet must have a type', snippet);
    }

    if (!['inline', 'file', 'function', 'template'].includes(snippet.type)) {
        throw new SnippetValidationError(`Invalid snippet type: ${snippet.type}`, snippet);
    }

    if (!snippet.language) {
        throw new SnippetValidationError('Snippet must have a language', snippet);
    }

    if (!['typescript', 'javascript'].includes(snippet.language)) {
        throw new SnippetValidationError(`Invalid language: ${snippet.language}`, snippet);
    }

    // Validate code or path based on type
    if (snippet.type === 'inline' || snippet.type === 'function' || snippet.type === 'template') {
        if (!snippet.code || typeof snippet.code !== 'string') {
            throw new SnippetValidationError(`Snippet type '${snippet.type}' requires a code property`, snippet);
        }
    }

    if (snippet.type === 'file') {
        if (!snippet.path || typeof snippet.path !== 'string') {
            throw new SnippetValidationError('File snippet requires a path property', snippet);
        }
    }

    // Validate inputs
    if (snippet.inputs) {
        if (!Array.isArray(snippet.inputs)) {
            throw new SnippetValidationError('Inputs must be an array', snippet);
        }

        for (const input of snippet.inputs) {
            if (!input.name || typeof input.name !== 'string') {
                throw new SnippetValidationError('Each input must have a name', snippet);
            }
            if (!input.type || typeof input.type !== 'string') {
                throw new SnippetValidationError(`Input '${input.name}' must have a type`, snippet);
            }
        }
    }

    // Validate outputs
    if (snippet.outputs) {
        if (!Array.isArray(snippet.outputs)) {
            throw new SnippetValidationError('Outputs must be an array', snippet);
        }

        for (const output of snippet.outputs) {
            if (!output.name || typeof output.name !== 'string') {
                throw new SnippetValidationError('Each output must have a name', snippet);
            }
            if (!output.type || typeof output.type !== 'string') {
                throw new SnippetValidationError(`Output '${output.name}' must have a type`, snippet);
            }
        }
    }
}

/**
 * Create a snippet registry
 */
export function createSnippetRegistry(): SnippetRegistry {
    const snippets: Record<string, ImperativeSnippet> = {};

    return {
        snippets,

        register(snippet: ImperativeSnippet): void {
            validateSnippet(snippet);
            snippets[snippet.id] = snippet;
        },

        get(id: string): ImperativeSnippet | undefined {
            return snippets[id];
        },

        resolve(embed: SnippetEmbed): string {
            return resolveSnippetEmbed(embed, this);
        }
    };
}

/**
 * Resolve a snippet reference (either ImperativeSnippet or string ID)
 */
function resolveSnippetReference(
    ref: ImperativeSnippet | string,
    registry: SnippetRegistry
): ImperativeSnippet {
    if (typeof ref === 'string') {
        const snippet = registry.get(ref);
        if (!snippet) {
            throw new Error(`Snippet not found: ${ref}`);
        }
        return snippet;
    }
    return ref;
}

/**
 * Generate code from a snippet with arguments
 */
function generateSnippetCode(snippet: ImperativeSnippet, args?: Record<string, any>): string {
    let code = snippet.code || '';

    // Replace argument placeholders
    if (snippet.inputs) {
        for (const input of snippet.inputs) {
            const value = args?.[input.name] ?? input.default;
            if (value === undefined && input.required) {
                throw new Error(`Required argument '${input.name}' not provided for snippet '${snippet.id}'`);
            }

            // Only replace if value is defined
            if (value !== undefined) {
                // Replace placeholders in code
                const placeholder = new RegExp(`\\$\\{${input.name}\\}`, 'g');
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                code = code.replace(placeholder, stringValue);
            }
        }
    }

    return code;
}

/**
 * Resolve and generate code for a snippet embed
 */
export function resolveSnippetEmbed(embed: SnippetEmbed, registry: SnippetRegistry): string {
    const snippet = registry.get(embed.snippetId);
    if (!snippet) {
        throw new Error(`Snippet not found: ${embed.snippetId}`);
    }

    const code = generateSnippetCode(snippet, embed.arguments);

    switch (embed.location) {
        case 'before':
            return `${code}\n// Target: ${embed.target}`;

        case 'after':
            return `// Target: ${embed.target}\n${code}`;

        case 'replace':
            return code;

        case 'wrap':
            return `// Wrap start: ${embed.target}\n${code}\n// Wrap end: ${embed.target}`;

        default:
            throw new Error(`Invalid embed location: ${embed.location}`);
    }
}

/**
 * Resolve a conditional snippet
 */
export function resolveConditionalSnippet(
    conditional: ConditionalSnippet,
    registry: SnippetRegistry,
    context?: Record<string, any>
): string {
    // In a real implementation, we'd evaluate the condition
    // For now, we'll generate the conditional structure
    const thenSnippet = resolveSnippetReference(conditional.thenSnippet, registry);
    const thenCode = generateSnippetCode(thenSnippet, context);

    if (conditional.elseSnippet) {
        const elseSnippet = resolveSnippetReference(conditional.elseSnippet, registry);
        const elseCode = generateSnippetCode(elseSnippet, context);

        return `if (${conditional.condition}) {\n${indent(thenCode)}\n} else {\n${indent(elseCode)}\n}`;
    }

    return `if (${conditional.condition}) {\n${indent(thenCode)}\n}`;
}

/**
 * Resolve a branching snippet
 */
export function resolveBranchingSnippet(
    branching: BranchingSnippet,
    registry: SnippetRegistry,
    context?: Record<string, any>
): string {
    const cases: string[] = [];

    for (const [caseValue, snippetRef] of Object.entries(branching.cases)) {
        const snippet = resolveSnippetReference(snippetRef, registry);
        const code = generateSnippetCode(snippet, context);
        cases.push(`case ${caseValue}:\n${indent(code)}\nbreak;`);
    }

    let result = `switch (${branching.expression}) {\n${indent(cases.join('\n'))}\n`;

    if (branching.default) {
        const defaultSnippet = resolveSnippetReference(branching.default, registry);
        const defaultCode = generateSnippetCode(defaultSnippet, context);
        result += `${indent(`default:\n${indent(defaultCode)}\nbreak;`)}\n`;
    }

    result += '}';
    return result;
}

/**
 * Indent code by 4 spaces
 */
function indent(code: string, spaces: number = 4): string {
    const indentation = ' '.repeat(spaces);
    return code.split('\n').map(line => indentation + line).join('\n');
}
