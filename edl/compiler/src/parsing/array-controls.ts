/**
 * Array Iteration Controls for EDL DSL
 *
 * Provides YAML-based array iteration controls for handling array responses
 * in parser mappings. Supports:
 * - Iterating over arrays with mapping (each)
 * - Filtering arrays
 * - First/last selection
 * - Reduce/aggregate operations
 * - Nested array handling
 */

import type {
  ArrayOperation,
  MapOperation,
  FilterOperation,
  ReduceOperation,
  SliceOperation,
  ComputeExpression,
  LambdaExpression,
} from '../syntax/array-operations.js';

// ============================================================
// Array Control Types
// ============================================================

/**
 * Array iteration control definition from YAML parser mapping
 */
export interface ArrayIterationControl {
  /** Source array path */
  source: string;

  /** Map each element (replaces isArray + mapping) */
  each?: Record<string, any>;

  /** Filter expression (item.status == 'OPEN') */
  filter?: string;

  /** Select first element */
  first?: boolean;

  /** Select last element */
  last?: boolean;

  /** Map transformation for single result */
  map?: Record<string, any>;

  /** Reduce/aggregate operation */
  reduce?: ReduceConfig;

  /** Limit number of results */
  limit?: number;

  /** Skip first N results */
  skip?: number;

  /** Sort by field or expression */
  sortBy?: string;

  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Reduce configuration
 */
export interface ReduceConfig {
  /** Initial value */
  initial: any;

  /** Reduce expression (acc + item.volume) */
  expression: string;

  /** Accumulator variable name (default: 'acc') */
  accumulator?: string;

  /** Item variable name (default: 'item') */
  itemVar?: string;
}

/**
 * Parse result from array control
 */
export interface ParsedArrayControl {
  /** Source array expression */
  sourceArray: ComputeExpression;

  /** Array operations to apply */
  operations: ArrayOperation[];

  /** Post-processing for result */
  postProcess?: {
    /** Extract single field */
    field?: string;

    /** Apply mapping */
    mapping?: Record<string, any>;
  };
}

// ============================================================
// Parser Functions
// ============================================================

/**
 * Check if a mapping definition uses array iteration controls
 */
export function hasArrayControls(mapping: any): boolean {
  return (
    typeof mapping === 'object' &&
    mapping !== null &&
    'source' in mapping &&
    (
      'each' in mapping ||
      'filter' in mapping ||
      'first' in mapping ||
      'last' in mapping ||
      'reduce' in mapping ||
      'limit' in mapping ||
      'skip' in mapping
    )
  );
}

/**
 * Parse array iteration controls into array operations
 *
 * @param control - Array iteration control definition from YAML
 * @returns Parsed array control with operations
 *
 * @example
 * ```typescript
 * parseArrayControl({
 *   source: 'raw.data',
 *   filter: 'item.status == "OPEN"',
 *   each: { id: 'item.id', price: 'item.price' }
 * })
 * ```
 */
export function parseArrayControl(control: ArrayIterationControl): ParsedArrayControl {
  const operations: ArrayOperation[] = [];
  const sourceArray: ComputeExpression = control.source;

  // 1. Apply skip (slice from start)
  if (control.skip !== undefined && control.skip > 0) {
    operations.push({
      op: 'slice',
      array: getLastOperationOrSource(operations, sourceArray),
      start: control.skip,
    });
  }

  // 2. Apply filter
  if (control.filter) {
    operations.push({
      op: 'filter',
      array: getLastOperationOrSource(operations, sourceArray),
      predicate: parseFilterExpression(control.filter),
    });
  }

  // 3. Apply sort (not a direct array operation, handled as post-process)
  // Sorting will be done via JavaScript's sort() in the generator

  // 4. Apply first/last selection
  if (control.first) {
    operations.push({
      op: 'slice',
      array: getLastOperationOrSource(operations, sourceArray),
      start: 0,
      end: 1,
    });
  } else if (control.last) {
    operations.push({
      op: 'slice',
      array: getLastOperationOrSource(operations, sourceArray),
      start: -1,
    });
  }

  // 5. Apply limit
  if (control.limit !== undefined && control.limit > 0 && !control.first && !control.last) {
    operations.push({
      op: 'slice',
      array: getLastOperationOrSource(operations, sourceArray),
      start: 0,
      end: control.limit,
    });
  }

  // 6. Apply reduce
  if (control.reduce) {
    operations.push({
      op: 'reduce',
      array: getLastOperationOrSource(operations, sourceArray),
      reducer: parseReduceExpression(control.reduce),
      initial: control.reduce.initial,
    });
  }

  // 7. Apply each (map)
  else if (control.each) {
    operations.push({
      op: 'map',
      array: getLastOperationOrSource(operations, sourceArray),
      transform: parseEachMapping(control.each),
    });
  }

  // 8. Apply map for single result
  else if (control.map) {
    // Map is applied to single result (after first/last)
    // This will be handled as post-processing
  }

  const postProcess: any = {};

  // Handle single result mapping
  if (control.map) {
    postProcess.mapping = control.map;
  }

  // Handle first/last extraction (unwrap single-element array)
  if (control.first || control.last) {
    postProcess.unwrapSingle = true;
  }

  // Handle sorting
  if (control.sortBy) {
    postProcess.sortBy = control.sortBy;
    postProcess.sortOrder = control.sortOrder || 'asc';
  }

  return {
    sourceArray,
    operations: operations.length > 0 ? operations : [],
    postProcess: Object.keys(postProcess).length > 0 ? postProcess : undefined,
  };
}

/**
 * Parse filter expression into lambda
 */
function parseFilterExpression(filterExpr: string): LambdaExpression {
  // Simple expression parser for filter conditions
  // Handles: item.field == value, item.field > value, etc.

  return {
    param: 'item',
    body: parseComputeExpression(filterExpr),
  };
}

/**
 * Parse reduce configuration into lambda
 */
function parseReduceExpression(config: ReduceConfig): LambdaExpression {
  const accVar = config.accumulator || 'acc';
  const itemVar = config.itemVar || 'item';

  return {
    params: [accVar, itemVar],
    body: parseComputeExpression(config.expression),
  };
}

/**
 * Parse each mapping into map lambda
 */
function parseEachMapping(mapping: Record<string, any>): LambdaExpression {
  // The mapping is an object like { id: 'item.id', price: 'item.price' }
  // We need to create a lambda that returns an object

  // For now, return a simple expression that creates the object
  // This will need special handling in the generator
  return {
    param: 'item',
    body: mapping as any, // Special object mapping body
  };
}

/**
 * Parse a compute expression string
 * Handles: item.field, acc + item.value, item.price * item.quantity, etc.
 */
function parseComputeExpression(expr: string): ComputeExpression {
  // Simple expression parser
  // For MVP, we'll handle basic cases and return the string
  // The full implementation would parse into AST

  expr = expr.trim();

  // Check for binary operators
  const binaryOps = [
    { op: '==', regex: /^(.+?)\s*==\s*(.+)$/ },
    { op: '!=', regex: /^(.+?)\s*!=\s*(.+)$/ },
    { op: '<=', regex: /^(.+?)\s*<=\s*(.+)$/ },
    { op: '>=', regex: /^(.+?)\s*>=\s*(.+)$/ },
    { op: '<', regex: /^(.+?)\s*<\s*(.+)$/ },
    { op: '>', regex: /^(.+?)\s*>\s*(.+)$/ },
    { op: '+', regex: /^(.+?)\s*\+\s*(.+)$/ },
    { op: '-', regex: /^(.+?)\s*-\s*(.+)$/ },
    { op: '*', regex: /^(.+?)\s*\*\s*(.+)$/ },
    { op: '/', regex: /^(.+?)\s*\/\s*(.+)$/ },
  ];

  for (const { op, regex } of binaryOps) {
    const match = expr.match(regex);
    if (match) {
      const left = parseComputeExpression(match[1]);
      const right = parseComputeExpression(match[2]);

      return {
        op,
        left,
        right,
      } as any;
    }
  }

  // Check for string literals
  if (expr.startsWith('"') && expr.endsWith('"')) {
    return expr.slice(1, -1);
  }
  if (expr.startsWith("'") && expr.endsWith("'")) {
    return expr.slice(1, -1);
  }

  // Check for numbers
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return parseFloat(expr);
  }

  // Check for booleans
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;

  // Otherwise, it's an identifier/path
  return expr;
}

/**
 * Get the last operation result or source array
 */
function getLastOperationOrSource(
  operations: ArrayOperation[],
  source: ComputeExpression
): ComputeExpression {
  return operations.length > 0 ? operations[operations.length - 1] : source;
}

// ============================================================
// Code Generation Helpers
// ============================================================

/**
 * Generate TypeScript code for array control
 */
export function generateArrayControlCode(control: ArrayIterationControl, options: {
  dataVar?: string;
  resultVar?: string;
} = {}): string {
  const dataVar = options.dataVar || 'data';
  const resultVar = options.resultVar || 'result';

  const parsed = parseArrayControl(control);
  const lines: string[] = [];

  // Get source array
  lines.push(`let ${resultVar} = this.safeValue(${dataVar}, '${control.source}', []);`);

  // Ensure it's an array
  lines.push(`if (!Array.isArray(${resultVar})) {`);
  lines.push(`  ${resultVar} = ${resultVar} == null ? [] : [${resultVar}];`);
  lines.push(`}`);

  // Apply skip
  if (control.skip) {
    lines.push(`${resultVar} = ${resultVar}.slice(${control.skip});`);
  }

  // Apply filter
  if (control.filter) {
    const filterExpr = control.filter.replace(/item\./g, 'item.');
    lines.push(`${resultVar} = ${resultVar}.filter((item) => ${filterExpr});`);
  }

  // Apply sort
  if (control.sortBy) {
    const sortField = control.sortBy.replace(/^item\./, '');
    const sortOrder = control.sortOrder || 'asc';

    lines.push(`${resultVar} = ${resultVar}.sort((a, b) => {`);
    lines.push(`  const aVal = a.${sortField};`);
    lines.push(`  const bVal = b.${sortField};`);

    if (sortOrder === 'asc') {
      lines.push(`  return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;`);
    } else {
      lines.push(`  return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;`);
    }

    lines.push(`});`);
  }

  // Apply limit
  if (control.limit && !control.first && !control.last) {
    lines.push(`${resultVar} = ${resultVar}.slice(0, ${control.limit});`);
  }

  // Apply first/last
  if (control.first) {
    lines.push(`${resultVar} = ${resultVar}[0];`);
  } else if (control.last) {
    lines.push(`${resultVar} = ${resultVar}[${resultVar}.length - 1];`);
  }

  // Apply reduce
  if (control.reduce) {
    const accVar = control.reduce.accumulator || 'acc';
    const itemVar = control.reduce.itemVar || 'item';
    const expr = control.reduce.expression.replace(new RegExp(itemVar + '\\.', 'g'), itemVar + '.');
    const initial = JSON.stringify(control.reduce.initial);

    lines.push(`${resultVar} = ${resultVar}.reduce((${accVar}, ${itemVar}) => ${expr}, ${initial});`);
  }

  // Apply each (map)
  else if (control.each) {
    lines.push(`${resultVar} = ${resultVar}.map((item) => ({`);

    for (const [key, value] of Object.entries(control.each)) {
      const valStr = typeof value === 'string' ? value.replace(/^item\./, 'item.') : JSON.stringify(value);
      lines.push(`  ${key}: ${valStr},`);
    }

    lines.push(`}));`);
  }

  // Apply map (for single result)
  else if (control.map && (control.first || control.last)) {
    lines.push(`if (${resultVar}) {`);
    lines.push(`  ${resultVar} = {`);

    for (const [key, value] of Object.entries(control.map)) {
      const valStr = typeof value === 'string' ? value.replace(/^item\./, `${resultVar}.`) : JSON.stringify(value);
      lines.push(`    ${key}: ${valStr},`);
    }

    lines.push(`  };`);
    lines.push(`}`);
  }

  return lines.join('\n');
}

/**
 * Validate array iteration control
 */
export function validateArrayControl(control: ArrayIterationControl): string[] {
  const errors: string[] = [];

  // Source is required
  if (!control.source) {
    errors.push('Array control must have a source');
  }

  // Cannot have both each and reduce
  if (control.each && control.reduce) {
    errors.push('Array control cannot have both "each" and "reduce"');
  }

  // Cannot have both first and last
  if (control.first && control.last) {
    errors.push('Array control cannot have both "first" and "last"');
  }

  // Map requires first or last
  if (control.map && !control.first && !control.last) {
    errors.push('Array control "map" requires "first" or "last"');
  }

  // Validate reduce config
  if (control.reduce) {
    if (control.reduce.initial === undefined) {
      errors.push('Reduce operation must have an "initial" value');
    }
    if (!control.reduce.expression) {
      errors.push('Reduce operation must have an "expression"');
    }
  }

  // Limit must be positive
  if (control.limit !== undefined && control.limit <= 0) {
    errors.push('Limit must be a positive number');
  }

  // Skip must be non-negative
  if (control.skip !== undefined && control.skip < 0) {
    errors.push('Skip must be a non-negative number');
  }

  return errors;
}

/**
 * Simplify nested arrays handling
 * For arrays like [[price, amount]], this extracts structured data
 */
export function parseNestedArrayControl(control: {
  source: string;
  each: Record<string, string | number>;
}): ParsedArrayControl {
  // Convert array index access to actual array operations
  // e.g., { price: 0, amount: 1 } -> { price: item[0], amount: item[1] }

  const indexMapping: Record<string, any> = {};

  for (const [key, value] of Object.entries(control.each)) {
    if (typeof value === 'number') {
      // Array index access
      indexMapping[key] = `item[${value}]`;
    } else if (typeof value === 'string') {
      indexMapping[key] = value;
    }
  }

  return parseArrayControl({
    source: control.source,
    each: indexMapping,
  });
}
