/**
 * Fragment Reference Parsing
 * Parses and extracts fragment references from EDL documents
 */

import type {
    FragmentDefinition,
    FragmentReference,
    FragmentRegistry,
    FragmentType,
} from '../schemas/fragments.js';
import type { SourceLocation } from '../types/edl.js';

// ============================================================
// Fragment Reference Patterns
// ============================================================

/**
 * Patterns for matching fragment references in various formats
 */
export const FragmentReferencePattern = {
    // $ref: "fragment-id"
    simpleRef: /\$ref:\s*["']([^"']+)["']/g,

    // JSON: {"$ref": "fragment-id"}
    jsonRef: /"\$ref"\s*:\s*"([^"]+)"/g,

    // $use: { fragment: "id", ... }
    useRef: /\$use:\s*\{/g,

    // @include("fragment-id")
    includeRef: /@include\(["']([^"']+)["']\)/g,

    // extends: "fragment-id"
    extendsRef: /extends:\s*["']([^"']+)["']/g,

    // YAML fragment reference keys
    refKeys: ['$ref', '$use', '@include', 'extends'],
} as const;

// ============================================================
// Parsed Fragment Reference
// ============================================================

/**
 * Context where a fragment reference appears
 */
export type FragmentContext = 'api' | 'parser' | 'auth' | 'errors' | 'markets' | 'unknown';

/**
 * A parsed fragment reference with location and metadata
 */
export interface ParsedFragmentReference {
    /** ID of the referenced fragment */
    fragmentId: string;

    /** Source location of the reference */
    location: SourceLocation;

    /** Arguments to pass to parameterized fragments */
    arguments?: Record<string, any>;

    /** Overrides to apply to the fragment content */
    overrides?: Record<string, any>;

    /** Context where this reference appears */
    context: FragmentContext;

    /** The type of reference syntax used */
    referenceType: 'ref' | 'use' | 'include' | 'extends';
}

// ============================================================
// Fragment Reference Parser
// ============================================================

/**
 * Parser for extracting fragment references from documents
 */
export class FragmentReferenceParser {
    /**
     * Parse all fragment references from a document
     * @param content Document content (string or parsed object)
     * @returns Array of parsed fragment references
     */
    parse(content: string | object): ParsedFragmentReference[] {
        if (typeof content === 'string') {
            return this.parseString(content);
        }
        return this.parseObject(content);
    }

    /**
     * Parse fragment references from a string
     * @param content String content to parse
     * @returns Array of parsed references
     */
    private parseString(content: string): ParsedFragmentReference[] {
        const references: ParsedFragmentReference[] = [];

        // Try to parse as JSON/YAML object first
        try {
            const obj = JSON.parse(content);
            return this.parseObject(obj);
        } catch {
            // Not valid JSON, parse as text
        }

        // Extract simple $ref patterns
        const simpleRefs = Array.from(content.matchAll(FragmentReferencePattern.simpleRef));
        for (const match of simpleRefs) {
            if (match[1]) {
                references.push({
                    fragmentId: match[1],
                    location: this.getLocationFromMatch(content, match),
                    context: 'unknown',
                    referenceType: 'ref',
                });
            }
        }

        // Extract @include patterns
        const includeRefs = Array.from(content.matchAll(FragmentReferencePattern.includeRef));
        for (const match of includeRefs) {
            if (match[1]) {
                references.push({
                    fragmentId: match[1],
                    location: this.getLocationFromMatch(content, match),
                    context: 'unknown',
                    referenceType: 'include',
                });
            }
        }

        // Extract extends patterns
        const extendsRefs = Array.from(content.matchAll(FragmentReferencePattern.extendsRef));
        for (const match of extendsRefs) {
            if (match[1]) {
                references.push({
                    fragmentId: match[1],
                    location: this.getLocationFromMatch(content, match),
                    context: 'unknown',
                    referenceType: 'extends',
                });
            }
        }

        return references;
    }

    /**
     * Parse fragment references from an object
     * @param obj Object to parse
     * @param path Current path in the object (for location tracking)
     * @returns Array of parsed references
     */
    private parseObject(obj: any, path: string = ''): ParsedFragmentReference[] {
        return this.findReferences(obj, path);
    }

    /**
     * Find all fragment references in a node
     * @param node Current node to examine
     * @param path Current path in the document
     * @returns Array of found references
     */
    findReferences(node: any, path: string): ParsedFragmentReference[] {
        const references: ParsedFragmentReference[] = [];

        if (!node || typeof node !== 'object') {
            return references;
        }

        // Check if this node is a fragment reference
        if ('$ref' in node) {
            const fragmentId = this.extractFragmentId(node.$ref);
            if (fragmentId) {
                references.push({
                    fragmentId,
                    location: { path },
                    context: this.extractFragmentContext(path),
                    referenceType: 'ref',
                    overrides: this.extractOverrides(node),
                });
            }
        }

        if ('$use' in node) {
            const useNode = node.$use;
            if (typeof useNode === 'object' && useNode.fragment) {
                const fragmentId = this.extractFragmentId(useNode.fragment);
                if (fragmentId) {
                    references.push({
                        fragmentId,
                        location: { path },
                        context: this.extractFragmentContext(path),
                        referenceType: 'use',
                        arguments: this.extractArguments(useNode),
                        overrides: this.extractOverrides(useNode),
                    });
                }
            } else if (typeof useNode === 'string') {
                references.push({
                    fragmentId: useNode,
                    location: { path },
                    context: this.extractFragmentContext(path),
                    referenceType: 'use',
                });
            }
        }

        if ('@include' in node) {
            const fragmentId = this.extractFragmentId(node['@include']);
            if (fragmentId) {
                references.push({
                    fragmentId,
                    location: { path },
                    context: this.extractFragmentContext(path),
                    referenceType: 'include',
                });
            }
        }

        if ('extends' in node) {
            const fragmentId = this.extractFragmentId(node.extends);
            if (fragmentId) {
                references.push({
                    fragmentId,
                    location: { path },
                    context: this.extractFragmentContext(path),
                    referenceType: 'extends',
                    overrides: this.extractOverrides(node),
                });
            }
        }

        // Recursively search child nodes
        if (Array.isArray(node)) {
            node.forEach((item, index) => {
                const childPath = `${path}[${index}]`;
                references.push(...this.findReferences(item, childPath));
            });
        } else {
            for (const [key, value] of Object.entries(node)) {
                // Skip reference keys themselves
                if (FragmentReferencePattern.refKeys.includes(key as any)) {
                    continue;
                }

                const childPath = path ? `${path}.${key}` : key;
                references.push(...this.findReferences(value, childPath));
            }
        }

        return references;
    }

    /**
     * Extract fragment ID from a reference value
     * @param ref Reference value (string or object)
     * @returns Fragment ID or empty string
     */
    extractFragmentId(ref: any): string {
        if (typeof ref === 'string') {
            return ref;
        }
        if (typeof ref === 'object' && ref.fragment) {
            return ref.fragment;
        }
        if (typeof ref === 'object' && ref.id) {
            return ref.id;
        }
        return '';
    }

    /**
     * Extract arguments from a reference node
     * @param ref Reference node
     * @returns Arguments object or undefined
     */
    extractArguments(ref: any): Record<string, any> | undefined {
        if (!ref || typeof ref !== 'object') {
            return undefined;
        }

        // $use: { fragment: "id", with: {...} }
        if (ref.with) {
            return ref.with;
        }

        // $use: { fragment: "id", args: {...} }
        if (ref.args) {
            return ref.args;
        }

        // Extract all keys except special ones
        const specialKeys = ['fragment', 'id', 'with', 'args', 'override', 'overrides'];
        const args: Record<string, any> = {};
        let hasArgs = false;

        for (const [key, value] of Object.entries(ref)) {
            if (!specialKeys.includes(key)) {
                args[key] = value;
                hasArgs = true;
            }
        }

        return hasArgs ? args : undefined;
    }

    /**
     * Extract overrides from a reference node
     * @param ref Reference node
     * @returns Overrides object or undefined
     */
    private extractOverrides(ref: any): Record<string, any> | undefined {
        if (!ref || typeof ref !== 'object') {
            return undefined;
        }

        if (ref.override) {
            return ref.override;
        }

        if (ref.overrides) {
            return ref.overrides;
        }

        // For $ref with inline overrides: { $ref: "id", ...otherFields }
        const specialKeys = ['$ref', '$use', '@include', 'extends', 'fragment', 'id', 'with', 'args'];
        const overrides: Record<string, any> = {};
        let hasOverrides = false;

        for (const [key, value] of Object.entries(ref)) {
            if (!specialKeys.includes(key)) {
                overrides[key] = value;
                hasOverrides = true;
            }
        }

        return hasOverrides ? overrides : undefined;
    }

    /**
     * Extract fragment context from location path
     * @param location Location path
     * @returns Fragment context
     */
    private extractFragmentContext(location: string): FragmentContext {
        const pathParts = location.split('.');

        if (pathParts.includes('api')) {
            return 'api';
        }
        if (pathParts.includes('parser') || pathParts.includes('parsers')) {
            return 'parser';
        }
        if (pathParts.includes('auth')) {
            return 'auth';
        }
        if (pathParts.includes('errors')) {
            return 'errors';
        }
        if (pathParts.includes('markets')) {
            return 'markets';
        }

        return 'unknown';
    }

    /**
     * Get location from regex match
     * @param content Full content string
     * @param match Regex match object
     * @returns Source location
     */
    private getLocationFromMatch(content: string, match: RegExpMatchArray): SourceLocation {
        if (match.index === undefined) {
            return { path: '<unknown>' };
        }

        const lines = content.substring(0, match.index).split('\n');
        return {
            line: lines.length,
            column: lines[lines.length - 1].length + 1,
            path: '<inline>',
        };
    }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Parse fragment references from an EDL document
 * @param edlDocument Parsed EDL document
 * @returns Array of parsed fragment references
 */
export function parseFragmentReferences(edlDocument: any): ParsedFragmentReference[] {
    const parser = new FragmentReferenceParser();
    return parser.parse(edlDocument);
}

/**
 * Validate that all fragment references exist in the registry
 * @param refs Array of parsed references
 * @param registry Fragment registry
 * @returns Validation errors (empty if all valid)
 */
export function validateFragmentReferences(
    refs: ParsedFragmentReference[],
    registry: FragmentRegistry
): Array<{ reference: ParsedFragmentReference; error: string }> {
    const errors: Array<{ reference: ParsedFragmentReference; error: string }> = [];

    for (const ref of refs) {
        const fragment = registry.get(ref.fragmentId);

        if (!fragment) {
            errors.push({
                reference: ref,
                error: `Fragment '${ref.fragmentId}' not found in registry`,
            });
            continue;
        }

        // Check if fragment is deprecated
        if (fragment.metadata?.deprecated) {
            const replacement = fragment.metadata.replacedBy
                ? ` Use '${fragment.metadata.replacedBy}' instead.`
                : '';
            errors.push({
                reference: ref,
                error: `Fragment '${ref.fragmentId}' is deprecated.${replacement}`,
            });
        }

        // Validate context matches fragment type (if context is known)
        if (ref.context !== 'unknown' && ref.context !== fragment.type) {
            errors.push({
                reference: ref,
                error: `Fragment '${ref.fragmentId}' has type '${fragment.type}' but used in '${ref.context}' context`,
            });
        }
    }

    return errors;
}

/**
 * Extract fragment context from a location path
 * @param location Location path
 * @returns Fragment context
 */
export function extractFragmentContext(location: string): FragmentContext {
    const parser = new FragmentReferenceParser();
    return parser['extractFragmentContext'](location);
}

// ============================================================
// Dependency Analysis
// ============================================================

/**
 * Dependency graph node
 */
export interface FragmentDependency {
    fragmentId: string;
    dependencies: string[];
}

/**
 * Build a dependency graph from fragment references
 * @param refs Array of parsed references
 * @returns Map of fragment ID to its dependencies
 */
export function collectFragmentDependencies(
    refs: ParsedFragmentReference[]
): Map<string, FragmentDependency> {
    const dependencyMap = new Map<string, FragmentDependency>();

    // Group references by the document/fragment they appear in
    // For now, we'll use the location path as a proxy for the containing fragment
    const refsGrouped = new Map<string, string[]>();

    for (const ref of refs) {
        // Extract the top-level section from the path (e.g., "auth", "api.public")
        const containerId = ref.location.path.split('.')[0] || '_root';

        if (!refsGrouped.has(containerId)) {
            refsGrouped.set(containerId, []);
        }
        refsGrouped.get(containerId)!.push(ref.fragmentId);
    }

    // Build dependency nodes
    for (const [containerId, deps] of refsGrouped) {
        dependencyMap.set(containerId, {
            fragmentId: containerId,
            dependencies: [...new Set(deps)], // Remove duplicates
        });
    }

    return dependencyMap;
}

/**
 * Detect circular dependencies in fragment references
 * @param dependencies Dependency graph
 * @returns Array of circular dependency chains
 */
export function detectCircularReferences(
    dependencies: Map<string, FragmentDependency>
): string[][] {
    const cycles: string[][] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    function dfs(nodeId: string, path: string[]): void {
        if (visiting.has(nodeId)) {
            // Found a cycle
            const cycleStart = path.indexOf(nodeId);
            if (cycleStart !== -1) {
                cycles.push([...path.slice(cycleStart), nodeId]);
            }
            return;
        }

        if (visited.has(nodeId)) {
            return;
        }

        visiting.add(nodeId);
        path.push(nodeId);

        const node = dependencies.get(nodeId);
        if (node) {
            for (const dep of node.dependencies) {
                dfs(dep, path);
            }
        }

        path.pop();
        visiting.delete(nodeId);
        visited.add(nodeId);
    }

    // Check each node
    for (const nodeId of dependencies.keys()) {
        if (!visited.has(nodeId)) {
            dfs(nodeId, []);
        }
    }

    return cycles;
}

/**
 * Check if fragment references contain circular dependencies
 * @param refs Array of parsed references
 * @param registry Fragment registry (to resolve fragment-to-fragment refs)
 * @returns Array of circular dependency chains
 */
export function findCircularFragmentReferences(
    refs: ParsedFragmentReference[],
    registry: FragmentRegistry
): string[][] {
    // Build a comprehensive dependency graph including fragment-to-fragment references
    const dependencyMap = new Map<string, FragmentDependency>();

    // First, collect direct references from the document
    const docDeps = collectFragmentDependencies(refs);
    for (const [id, dep] of docDeps) {
        dependencyMap.set(id, dep);
    }

    // Then, collect references within fragments themselves
    for (const fragmentId of Object.keys(registry.fragments)) {
        const fragment = registry.get(fragmentId);
        if (!fragment) continue;

        const parser = new FragmentReferenceParser();
        const fragmentRefs = parser.parse(fragment.content);

        if (fragmentRefs.length > 0) {
            dependencyMap.set(fragmentId, {
                fragmentId,
                dependencies: [...new Set(fragmentRefs.map(r => r.fragmentId))],
            });
        }
    }

    return detectCircularReferences(dependencyMap);
}
