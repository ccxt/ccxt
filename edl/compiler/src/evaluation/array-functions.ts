/**
 * Array Function Evaluation
 *
 * Core logic for evaluating array operations (map, filter, reduce, slice, flatMap)
 * in the EDL expression evaluator.
 */

import type {
  ArrayOperation,
  MapOperation,
  FilterOperation,
  ReduceOperation,
  SliceOperation,
  FlatMapOperation,
  LambdaExpression,
  ComputeExpression,
  BinaryExpression,
  FunctionCall,
  ConditionalExpression,
  SwitchExpression,
} from '../syntax/array-operations.js';

/**
 * Evaluation context for array operations
 * Provides access to variables, functions, and expression evaluator
 */
export interface ArrayEvaluationContext {
  // Current variable bindings
  variables: Record<string, any>;

  // Available functions that can be called
  functions: Record<string, Function>;

  // Expression evaluator (for recursive evaluation)
  evaluateExpression: (expr: ComputeExpression, ctx: any) => any;
}

/**
 * Main entry point for evaluating array operations
 * Dispatches to specific operation handlers based on operation type
 */
export function evaluateArrayOperation(
  operation: ArrayOperation,
  context: ArrayEvaluationContext
): any {
  switch (operation.op) {
    case 'map':
      return evaluateMapOperation(operation, context);
    case 'filter':
      return evaluateFilterOperation(operation, context);
    case 'reduce':
      return evaluateReduceOperation(operation, context);
    case 'slice':
      return evaluateSliceOperation(operation, context);
    case 'flatMap':
      return evaluateFlatMapOperation(operation, context);
    default:
      throw new Error(`Unknown array operation: ${(operation as any).op}`);
  }
}

/**
 * Evaluate a map operation
 * Transforms each element in the array using the provided lambda
 */
export function evaluateMapOperation(
  op: MapOperation,
  context: ArrayEvaluationContext
): any[] {
  const array = getArrayFromExpression(op.array, context);

  if (!Array.isArray(array)) {
    throw new Error('Map operation requires an array');
  }

  return array.map((element, index) => {
    return evaluateLambda(op.transform, [element, index, array], context);
  });
}

/**
 * Evaluate a filter operation
 * Selects elements from the array where the predicate returns truthy
 */
export function evaluateFilterOperation(
  op: FilterOperation,
  context: ArrayEvaluationContext
): any[] {
  const array = getArrayFromExpression(op.array, context);

  if (!Array.isArray(array)) {
    throw new Error('Filter operation requires an array');
  }

  return array.filter((element, index) => {
    const result = evaluateLambda(op.predicate, [element, index, array], context);
    return Boolean(result);
  });
}

/**
 * Evaluate a reduce operation
 * Accumulates values using the reducer lambda
 */
export function evaluateReduceOperation(
  op: ReduceOperation,
  context: ArrayEvaluationContext
): any {
  const array = getArrayFromExpression(op.array, context);

  if (!Array.isArray(array)) {
    throw new Error('Reduce operation requires an array');
  }

  const initial = context.evaluateExpression(op.initial, context.variables);

  return array.reduce((accumulator, element, index) => {
    return evaluateLambda(op.reducer, [accumulator, element, index, array], context);
  }, initial);
}

/**
 * Evaluate a slice operation
 * Extracts a subarray based on start, end, and optional step
 */
export function evaluateSliceOperation(
  op: SliceOperation,
  context: ArrayEvaluationContext
): any[] {
  const array = getArrayFromExpression(op.array, context);

  if (!Array.isArray(array)) {
    throw new Error('Slice operation requires an array');
  }

  const start = op.start;
  const end = op.end ?? array.length;
  const step = op.step ?? 1;

  if (step === 0) {
    throw new Error('Slice step cannot be zero');
  }

  // Handle negative indices
  const normalizedStart = start < 0 ? Math.max(0, array.length + start) : start;
  const normalizedEnd = end < 0 ? Math.max(0, array.length + end) : end;

  const result: any[] = [];

  if (step > 0) {
    for (let i = normalizedStart; i < normalizedEnd && i < array.length; i += step) {
      result.push(array[i]);
    }
  } else {
    // Negative step: iterate backwards
    for (let i = normalizedStart; i > normalizedEnd && i >= 0; i += step) {
      result.push(array[i]);
    }
  }

  return result;
}

/**
 * Evaluate a flatMap operation
 * Maps each element and flattens the resulting arrays
 */
export function evaluateFlatMapOperation(
  op: FlatMapOperation,
  context: ArrayEvaluationContext
): any[] {
  const array = getArrayFromExpression(op.array, context);

  if (!Array.isArray(array)) {
    throw new Error('FlatMap operation requires an array');
  }

  const mapped = array.map((element, index) => {
    return evaluateLambda(op.transform, [element, index, array], context);
  });

  // Flatten one level
  return mapped.flat(1);
}

/**
 * Evaluate a lambda expression with provided arguments
 * Creates a local scope with lambda parameters bound to arguments
 */
export function evaluateLambda(
  lambda: LambdaExpression,
  args: any[],
  context: ArrayEvaluationContext
): any {
  // Create new scope with lambda parameters
  const lambdaScope: Record<string, any> = { ...context.variables };

  // Bind parameters to arguments
  if (lambda.param) {
    // Single parameter lambda
    lambdaScope[lambda.param] = args[0];
  } else if (lambda.params) {
    // Multiple parameter lambda
    lambda.params.forEach((param, index) => {
      lambdaScope[param] = args[index];
    });
  }

  // Create new context with lambda scope
  const lambdaContext: ArrayEvaluationContext = {
    ...context,
    variables: lambdaScope,
  };

  // Evaluate the lambda body with the lambda scope
  return context.evaluateExpression(lambda.body, lambdaScope);
}

/**
 * Helper function to resolve an array from a compute expression
 * Handles:
 * - String paths (e.g., "response.items")
 * - Nested array operations
 * - Any other expression that evaluates to an array
 */
export function getArrayFromExpression(
  expr: ComputeExpression,
  context: ArrayEvaluationContext
): any[] {
  // Evaluate the expression to get the array
  const result = context.evaluateExpression(expr, context.variables);

  if (!Array.isArray(result)) {
    throw new Error(`Expected array but got ${typeof result}: ${JSON.stringify(result)}`);
  }

  return result;
}

/**
 * Helper function to evaluate binary expressions
 * Used for operations like comparison, arithmetic, etc.
 */
export function evaluateBinaryExpression(
  expr: BinaryExpression,
  context: ArrayEvaluationContext
): any {
  const left = context.evaluateExpression(expr.left, context.variables);
  const right = context.evaluateExpression(expr.right, context.variables);

  switch (expr.op) {
    // Arithmetic
    case 'add':
    case '+':
      return left + right;
    case 'sub':
    case '-':
      return left - right;
    case 'mul':
    case '*':
      return left * right;
    case 'div':
    case '/':
      return left / right;
    case 'mod':
    case '%':
      return left % right;

    // Comparison
    case 'eq':
    case '==':
    case '===':
      return left === right;
    case 'ne':
    case '!=':
    case '!==':
      return left !== right;
    case 'gt':
    case '>':
      return left > right;
    case 'gte':
    case '>=':
      return left >= right;
    case 'lt':
    case '<':
      return left < right;
    case 'lte':
    case '<=':
      return left <= right;

    // Logical
    case 'and':
    case '&&':
      return left && right;
    case 'or':
    case '||':
      return left || right;

    default:
      throw new Error(`Unknown binary operator: ${expr.op}`);
  }
}

/**
 * Helper function to evaluate function calls
 */
export function evaluateFunctionCall(
  call: FunctionCall,
  context: ArrayEvaluationContext
): any {
  const fn = context.functions[call.call];

  if (!fn) {
    throw new Error(`Unknown function: ${call.call}`);
  }

  const evaluatedArgs = call.args.map(arg =>
    context.evaluateExpression(arg, context.variables)
  );

  return fn(...evaluatedArgs);
}

/**
 * Helper function to evaluate conditional expressions
 */
export function evaluateConditionalExpression(
  expr: ConditionalExpression,
  context: ArrayEvaluationContext
): any {
  const condition = context.evaluateExpression(expr.if, context.variables);

  if (condition) {
    return context.evaluateExpression(expr.then, context.variables);
  } else if (expr.else !== undefined) {
    return context.evaluateExpression(expr.else, context.variables);
  }

  return undefined;
}

/**
 * Helper function to evaluate switch expressions
 */
export function evaluateSwitchExpression(
  expr: SwitchExpression,
  context: ArrayEvaluationContext
): any {
  const switchValue = context.evaluateExpression(expr.switch, context.variables);
  const stringValue = String(switchValue);

  if (stringValue in expr.cases) {
    return context.evaluateExpression(expr.cases[stringValue], context.variables);
  } else if (expr.default !== undefined) {
    return context.evaluateExpression(expr.default, context.variables);
  }

  return undefined;
}
