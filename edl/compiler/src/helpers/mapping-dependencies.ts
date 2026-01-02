/**
 * Compute Field Dependency Resolution
 * Utilities for analyzing cross-field dependencies inside parser mappings.
 */

import type { FieldMapping } from '../types/edl.js';

type ComputeMapping = { compute: string; dependencies?: string[] };

function isComputeMapping(mapping: FieldMapping): mapping is ComputeMapping {
    return typeof (mapping as any)?.compute === 'string';
}

/**
 * Result of dependency analysis
 */
export interface ComputeDependencyAnalysis {
    /** Ordered list of compute fields with dependencies satisfied */
    ordered: string[];

    /** Fields that could not be ordered (usually due to cycles) */
    unresolved: string[];

    /** Circular dependency chains */
    cycles: string[][];

    /** Map of fields to the dependencies that could not be found */
    missing: Map<string, string[]>;
}

/**
 * Extract `{field}` references from a compute expression
 * Only matches simple identifiers like {timestamp} or {currency},
 * not JavaScript code blocks inside braces
 */
export function extractFieldReferences(expression: string): string[] {
    if (!expression || typeof expression !== 'string') {
        return [];
    }

    // Only match {identifier} patterns where identifier is a simple name
    // (letters, numbers, underscores, starting with letter or underscore)
    // This excludes JavaScript code blocks like { const x = ... }
    const matches = expression.match(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g) || [];
    return matches
        .map(match => match.slice(1, -1).trim())
        .filter(Boolean);
}

/**
 * Analyze compute field dependencies to determine evaluation order
 */
export function analyzeComputeDependencies(
    mapping: Record<string, FieldMapping>
): ComputeDependencyAnalysis {
    const computeFields = Object.entries(mapping).filter((entry): entry is [string, ComputeMapping] =>
        isComputeMapping(entry[1])
    );
    const graph = new Map<string, Set<string>>();
    const missing = new Map<string, Set<string>>();

    for (const [field, definition] of computeFields) {
        const declaredDeps = Array.isArray(definition.dependencies)
            ? definition.dependencies
            : [];
        const referencedDeps = extractFieldReferences(definition.compute);
        const mergedDeps = new Set(
            [...declaredDeps, ...referencedDeps]
                .map(dep => dep.trim())
                .filter(Boolean)
        );

        const edges = new Set<string>();

        for (const dep of mergedDeps) {
            if (!Object.prototype.hasOwnProperty.call(mapping, dep)) {
                if (!missing.has(field)) {
                    missing.set(field, new Set());
                }
                missing.get(field)!.add(dep);
                continue;
            }

            const dependencyMapping = mapping[dep];
            if (dependencyMapping && isComputeMapping(dependencyMapping)) {
                edges.add(dep);
            }
        }

        graph.set(field, edges);
    }

    const { order, cycles } = topologicalSort(graph);

    const resolvedSet = new Set(order);
    const unresolved = computeFields
        .map(([field]) => field)
        .filter(field => !resolvedSet.has(field));

    return {
        ordered: order,
        unresolved,
        cycles,
        missing: new Map(
            Array.from(missing.entries()).map(([field, deps]) => [field, Array.from(deps)])
        ),
    };
}

/**
 * Convenience helper that returns compute fields in evaluation order.
 * Fields that could not be ordered (due to cycles/missing deps) are appended at the end.
 */
export function resolveComputeOrder(mapping: Record<string, FieldMapping>): string[] {
    const analysis = analyzeComputeDependencies(mapping);
    return [...analysis.ordered, ...analysis.unresolved];
}

// ============================================================
// Internal helpers
// ============================================================

function topologicalSort(
    graph: Map<string, Set<string>>
): { order: string[]; cycles: string[][] } {
    const order: string[] = [];
    const permanent = new Set<string>();
    const temporary = new Set<string>();
    const cyclic = new Set<string>();
    const cycles: string[][] = [];

    const visit = (node: string, stack: string[]) => {
        if (permanent.has(node) || cyclic.has(node)) {
            return;
        }
        if (temporary.has(node)) {
            const cycleStart = stack.indexOf(node);
            const cycle = [...stack.slice(cycleStart), node];
            cycles.push(cycle);
            for (const member of cycle) {
                cyclic.add(member);
            }
            return;
        }

        temporary.add(node);
        stack.push(node);

        for (const dep of graph.get(node) ?? []) {
            visit(dep, stack);
        }

        stack.pop();
        temporary.delete(node);

        if (cyclic.has(node)) {
            return;
        }

        permanent.add(node);
        order.push(node);
    };

    for (const node of graph.keys()) {
        if (!permanent.has(node) && !cyclic.has(node)) {
            visit(node, []);
        }
    }

    return { order, cycles };
}
