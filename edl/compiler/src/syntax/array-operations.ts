/**
 * Array Operation Syntax Definitions
 *
 * Defines types and syntax for array operations in the EDL DSL.
 * Supports functional programming operations: map, filter, reduce, slice, flatMap
 */

/**
 * Lambda expression for functional array operations
 * Represents an anonymous function with parameters and body
 */
export interface LambdaExpression {
  // Single parameter lambda: x => x.price
  param?: string;

  // Multiple parameter lambda: (acc, item) => acc + item.price
  params?: string[];

  // Expression body (can be any compute expression)
  body: ComputeExpression;
}

/**
 * Compute expression type reference
 * This allows array operations to be nested within other expressions
 */
export type ComputeExpression =
  | null
  | string
  | number
  | boolean
  | BinaryExpression
  | FunctionCall
  | ConditionalExpression
  | SwitchExpression
  | ArrayOperation;

/**
 * Binary operation expression
 */
export interface BinaryExpression {
  op: string;
  left: ComputeExpression;
  right: ComputeExpression;
}

/**
 * Function call expression
 */
export interface FunctionCall {
  call: string;
  args: ComputeExpression[];
}

/**
 * Conditional (ternary) expression
 */
export interface ConditionalExpression {
  if: ComputeExpression;
  then: ComputeExpression;
  else?: ComputeExpression;
}

/**
 * Switch expression
 */
export interface SwitchExpression {
  switch: ComputeExpression;
  cases: Record<string, ComputeExpression>;
  default?: ComputeExpression;
}

/**
 * Array operation types
 */
export type ArrayOperationType = 'map' | 'filter' | 'reduce' | 'slice' | 'flatMap';

/**
 * Base interface for all array operations
 */
export interface ArrayOperationBase {
  op: ArrayOperationType;
  array: ComputeExpression;
}

/**
 * Map operation: transform each element
 * Example: { op: "map", array: "response.items", transform: { param: "x", body: "x.price" } }
 */
export interface MapOperation extends ArrayOperationBase {
  op: 'map';
  transform: LambdaExpression;
}

/**
 * Filter operation: select elements matching a predicate
 * Example: { op: "filter", array: "response.items", predicate: { param: "x", body: { op: "gt", left: "x.price", right: 100 } } }
 */
export interface FilterOperation extends ArrayOperationBase {
  op: 'filter';
  predicate: LambdaExpression;
}

/**
 * Reduce operation: accumulate values
 * Example: { op: "reduce", array: "response.items", reducer: { params: ["acc", "item"], body: { op: "add", left: "acc", right: "item.price" } }, initial: 0 }
 */
export interface ReduceOperation extends ArrayOperationBase {
  op: 'reduce';
  reducer: LambdaExpression;
  initial: ComputeExpression;
}

/**
 * Slice operation: extract a subarray
 * Example: { op: "slice", array: "response.items", start: 0, end: 10 }
 * Example with step: { op: "slice", array: "response.items", start: 0, end: 100, step: 2 }
 */
export interface SliceOperation extends ArrayOperationBase {
  op: 'slice';
  start: number;
  end?: number;
  step?: number;
}

/**
 * FlatMap operation: map and flatten results
 * Example: { op: "flatMap", array: "response.groups", transform: { param: "g", body: "g.items" } }
 */
export interface FlatMapOperation extends ArrayOperationBase {
  op: 'flatMap';
  transform: LambdaExpression;
}

/**
 * Union type for all array operations
 */
export type ArrayOperation =
  | MapOperation
  | FilterOperation
  | ReduceOperation
  | SliceOperation
  | FlatMapOperation;

/**
 * Type guard to check if an expression is an array operation
 */
export function isArrayOperation(expr: any): expr is ArrayOperation {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'op' in expr &&
    ['map', 'filter', 'reduce', 'slice', 'flatMap'].includes(expr.op)
  );
}

/**
 * Type guard to check if an expression is a lambda
 */
export function isLambdaExpression(expr: any): expr is LambdaExpression {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'body' in expr &&
    ('param' in expr || 'params' in expr)
  );
}

/**
 * Validate array operation structure
 */
export function validateArrayOperation(operation: ArrayOperation): string[] {
  const errors: string[] = [];

  switch (operation.op) {
    case 'map':
    case 'flatMap':
      if (!isLambdaExpression(operation.transform)) {
        errors.push(`${operation.op} operation requires a lambda expression in 'transform' field`);
      }
      break;

    case 'filter':
      if (!isLambdaExpression(operation.predicate)) {
        errors.push('filter operation requires a lambda expression in \'predicate\' field');
      }
      break;

    case 'reduce':
      if (!isLambdaExpression(operation.reducer)) {
        errors.push('reduce operation requires a lambda expression in \'reducer\' field');
      }
      if (operation.initial === undefined) {
        errors.push('reduce operation requires an \'initial\' value');
      }
      break;

    case 'slice':
      if (typeof operation.start !== 'number') {
        errors.push('slice operation requires a numeric \'start\' index');
      }
      if (operation.end !== undefined && typeof operation.end !== 'number') {
        errors.push('slice \'end\' must be a number if provided');
      }
      if (operation.step !== undefined && typeof operation.step !== 'number') {
        errors.push('slice \'step\' must be a number if provided');
      }
      break;
  }

  return errors;
}

/**
 * Validate lambda expression structure
 */
export function validateLambdaExpression(lambda: LambdaExpression): string[] {
  const errors: string[] = [];

  // Must have either param or params, but not both
  const hasParam = lambda.param !== undefined;
  const hasParams = lambda.params !== undefined;

  if (!hasParam && !hasParams) {
    errors.push('Lambda expression must have either \'param\' or \'params\' defined');
  }

  if (hasParam && hasParams) {
    errors.push('Lambda expression cannot have both \'param\' and \'params\' defined');
  }

  // Validate param is a string
  if (hasParam && typeof lambda.param !== 'string') {
    errors.push('Lambda \'param\' must be a string');
  }

  // Validate params is an array of strings
  if (hasParams) {
    if (!Array.isArray(lambda.params)) {
      errors.push('Lambda \'params\' must be an array');
    } else if (lambda.params.some(p => typeof p !== 'string')) {
      errors.push('All lambda parameters in \'params\' must be strings');
    }
  }

  // Body is required
  if (lambda.body === undefined) {
    errors.push('Lambda expression must have a \'body\' expression');
  }

  return errors;
}
