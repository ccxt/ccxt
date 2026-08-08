/**
 * Conditional Mapping Syntax Definitions
 *
 * Defines types and syntax for conditional mapping constructs in the EDL DSL.
 * Supports if/then/else conditionals, fallback values, and switch expressions
 * for flexible field mapping and value selection.
 */

/**
 * Compute expression type reference
 * This allows conditional mappings to be nested within other expressions
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
  | FallbackExpression
  | CoalesceExpression
  | PatternMatchExpression
  | FieldMapping;

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
 * Field mapping for data extraction
 * Represents accessing a field from the source data
 */
export interface FieldMapping {
  path?: string;
  fromContext?: string;
  literal?: any;
  compute?: string;
  dependencies?: string[];
}

// ============================================================
// Conditional Mapping Types
// ============================================================

/**
 * Conditional (if/then/else) expression
 * Evaluates a condition and returns one of two values
 *
 * Examples:
 * - Simple: { if: "status == 'active'", then: true, else: false }
 * - Nested: { if: "price > 100", then: { if: "quantity > 10", then: "bulk", else: "normal" }, else: "small" }
 * - With field mapping: { if: "response.success", then: { path: "data.value" }, else: { literal: null } }
 */
export interface ConditionalExpression {
  /**
   * Condition expression to evaluate
   * Can be a string expression or a boolean expression
   */
  if: ComputeExpression;

  /**
   * Value to return if condition is true
   */
  then: ComputeExpression;

  /**
   * Value to return if condition is false
   * Optional - if omitted, returns null/undefined
   */
  else?: ComputeExpression;
}

/**
 * Alternative syntax for conditional mapping
 * More explicit form that matches the EDL type system
 */
export interface ConditionalMapping {
  condition: string | BinaryExpression;
  whenTrue: ComputeExpression;
  whenFalse?: ComputeExpression;
}

// ============================================================
// Fallback Mapping Types
// ============================================================

/**
 * Fallback expression for default value handling
 * Tries to use the primary value, falls back to default if null/undefined
 *
 * Examples:
 * - Simple: { value: "response.data", fallback: 0 }
 * - Multiple: { value: "response.data", fallback: { value: "response.default", fallback: 0 } }
 * - With null check: { value: "response.data", fallback: "N/A", nullIsValid: false }
 */
export interface FallbackExpression {
  /**
   * Primary value to use
   */
  value: ComputeExpression;

  /**
   * Default value to use if primary is null/undefined
   */
  fallback: ComputeExpression;

  /**
   * Whether to treat null as a valid value (don't fallback)
   * Default: false (null triggers fallback)
   */
  nullIsValid?: boolean;

  /**
   * Whether to treat empty string as invalid (trigger fallback)
   * Default: false (empty string is valid)
   */
  emptyStringIsInvalid?: boolean;

  /**
   * Whether to treat zero as invalid (trigger fallback)
   * Default: false (zero is valid)
   */
  zeroIsInvalid?: boolean;
}

/**
 * Coalesce expression - multiple fallback chain
 * Returns the first non-null/non-undefined value
 *
 * Example:
 * { coalesce: ["response.preferred", "response.alternate", "response.default", 0] }
 */
export interface CoalesceExpression {
  /**
   * List of values to try in order
   * Returns first non-null/undefined value
   */
  coalesce: ComputeExpression[];

  /**
   * Whether to treat null as a valid value
   * Default: false
   */
  nullIsValid?: boolean;
}

// ============================================================
// Switch/Case Mapping Types
// ============================================================

/**
 * Switch expression for multi-way branching
 * Matches a value against cases and returns corresponding result
 *
 * Examples:
 * - Simple: { switch: "orderType", cases: { "market": 1, "limit": 2 }, default: 0 }
 * - With expressions: { switch: "status", cases: { "FILLED": { literal: "closed" }, "OPEN": { literal: "open" } } }
 * - Range matching: { switch: "price", cases: { "< 100": "cheap", ">= 100 && < 1000": "normal" }, default: "expensive" }
 */
export interface SwitchExpression {
  /**
   * Expression to evaluate and match against cases
   */
  switch: ComputeExpression;

  /**
   * Map of case values/patterns to results
   * Keys can be:
   * - Literal values: "OPEN", "CLOSED"
   * - Comparison expressions: "< 100", ">= 100"
   * - Range expressions: ">= 0 && < 100"
   */
  cases: Record<string, ComputeExpression>;

  /**
   * Default value if no case matches
   * Optional - if omitted, returns null/undefined
   */
  default?: ComputeExpression;

  /**
   * Comparison mode for matching
   * - "exact": strict equality (===)
   * - "loose": loose equality (==)
   * - "expression": evaluate case keys as expressions
   * Default: "exact"
   */
  matchMode?: 'exact' | 'loose' | 'expression';
}

/**
 * Pattern matching case
 * Used in advanced switch expressions for complex matching
 */
export interface PatternCase {
  /**
   * Pattern to match against
   * Can be a literal value, regex, or expression
   */
  pattern: string | RegExp | ComputeExpression;

  /**
   * Value to return if pattern matches
   */
  result: ComputeExpression;

  /**
   * Optional guard condition
   * Pattern must match AND guard must be true
   */
  guard?: ComputeExpression;
}

/**
 * Advanced switch with pattern matching
 * Supports regex, guards, and complex patterns
 *
 * Example:
 * {
 *   match: "orderStatus",
 *   patterns: [
 *     { pattern: /^PARTIAL/, result: "partially_filled" },
 *     { pattern: "FILLED", guard: "quantity > 0", result: "filled" },
 *     { pattern: "CANCELLED", result: "cancelled" }
 *   ],
 *   default: "unknown"
 * }
 */
export interface PatternMatchExpression {
  /**
   * Value to match against patterns
   */
  match: ComputeExpression;

  /**
   * List of pattern cases to try in order
   */
  patterns: PatternCase[];

  /**
   * Default value if no pattern matches
   */
  default?: ComputeExpression;
}

// ============================================================
// Type Guards
// ============================================================

/**
 * Type guard to check if an expression is a conditional expression
 */
export function isConditionalExpression(expr: any): expr is ConditionalExpression {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'if' in expr &&
    'then' in expr
  );
}

/**
 * Type guard to check if an expression is a conditional mapping
 */
export function isConditionalMapping(expr: any): expr is ConditionalMapping {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'condition' in expr &&
    'whenTrue' in expr
  );
}

/**
 * Type guard to check if an expression is a fallback expression
 */
export function isFallbackExpression(expr: any): expr is FallbackExpression {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'value' in expr &&
    'fallback' in expr
  );
}

/**
 * Type guard to check if an expression is a coalesce expression
 */
export function isCoalesceExpression(expr: any): expr is CoalesceExpression {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'coalesce' in expr &&
    Array.isArray(expr.coalesce)
  );
}

/**
 * Type guard to check if an expression is a switch expression
 */
export function isSwitchExpression(expr: any): expr is SwitchExpression {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'switch' in expr &&
    'cases' in expr
  );
}

/**
 * Type guard to check if an expression is a pattern match expression
 */
export function isPatternMatchExpression(expr: any): expr is PatternMatchExpression {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    'match' in expr &&
    'patterns' in expr &&
    Array.isArray(expr.patterns)
  );
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validate conditional expression structure
 */
export function validateConditionalExpression(expr: ConditionalExpression): string[] {
  const errors: string[] = [];

  if (expr.if === undefined) {
    errors.push('Conditional expression must have an \'if\' condition');
  }

  if (expr.then === undefined) {
    errors.push('Conditional expression must have a \'then\' value');
  }

  // 'else' is optional, no validation needed

  return errors;
}

/**
 * Validate conditional mapping structure
 */
export function validateConditionalMapping(mapping: ConditionalMapping): string[] {
  const errors: string[] = [];

  if (mapping.condition === undefined) {
    errors.push('Conditional mapping must have a \'condition\'');
  }

  if (mapping.whenTrue === undefined) {
    errors.push('Conditional mapping must have a \'whenTrue\' value');
  }

  // 'whenFalse' is optional, no validation needed

  return errors;
}

/**
 * Validate fallback expression structure
 */
export function validateFallbackExpression(expr: FallbackExpression): string[] {
  const errors: string[] = [];

  if (expr.value === undefined) {
    errors.push('Fallback expression must have a \'value\'');
  }

  if (expr.fallback === undefined) {
    errors.push('Fallback expression must have a \'fallback\' value');
  }

  if (expr.nullIsValid !== undefined && typeof expr.nullIsValid !== 'boolean') {
    errors.push('Fallback \'nullIsValid\' must be a boolean');
  }

  if (expr.emptyStringIsInvalid !== undefined && typeof expr.emptyStringIsInvalid !== 'boolean') {
    errors.push('Fallback \'emptyStringIsInvalid\' must be a boolean');
  }

  if (expr.zeroIsInvalid !== undefined && typeof expr.zeroIsInvalid !== 'boolean') {
    errors.push('Fallback \'zeroIsInvalid\' must be a boolean');
  }

  return errors;
}

/**
 * Validate coalesce expression structure
 */
export function validateCoalesceExpression(expr: CoalesceExpression): string[] {
  const errors: string[] = [];

  if (!Array.isArray(expr.coalesce)) {
    errors.push('Coalesce expression must have an array of values in \'coalesce\'');
  } else if (expr.coalesce.length === 0) {
    errors.push('Coalesce expression must have at least one value');
  }

  if (expr.nullIsValid !== undefined && typeof expr.nullIsValid !== 'boolean') {
    errors.push('Coalesce \'nullIsValid\' must be a boolean');
  }

  return errors;
}

/**
 * Validate switch expression structure
 */
export function validateSwitchExpression(expr: SwitchExpression): string[] {
  const errors: string[] = [];

  if (expr.switch === undefined) {
    errors.push('Switch expression must have a \'switch\' value to match');
  }

  if (!expr.cases || typeof expr.cases !== 'object') {
    errors.push('Switch expression must have a \'cases\' object');
  } else if (Object.keys(expr.cases).length === 0) {
    errors.push('Switch expression must have at least one case');
  }

  if (expr.matchMode !== undefined) {
    const validModes = ['exact', 'loose', 'expression'];
    if (!validModes.includes(expr.matchMode)) {
      errors.push(`Switch \'matchMode\' must be one of: ${validModes.join(', ')}`);
    }
  }

  return errors;
}

/**
 * Validate pattern match expression structure
 */
export function validatePatternMatchExpression(expr: PatternMatchExpression): string[] {
  const errors: string[] = [];

  if (expr.match === undefined) {
    errors.push('Pattern match expression must have a \'match\' value');
  }

  if (!Array.isArray(expr.patterns)) {
    errors.push('Pattern match expression must have a \'patterns\' array');
  } else if (expr.patterns.length === 0) {
    errors.push('Pattern match expression must have at least one pattern');
  } else {
    // Validate each pattern case
    expr.patterns.forEach((pattern, index) => {
      if (!pattern.pattern) {
        errors.push(`Pattern case at index ${index} must have a \'pattern\'`);
      }
      if (!pattern.result) {
        errors.push(`Pattern case at index ${index} must have a \'result\'`);
      }
    });
  }

  return errors;
}

/**
 * Validate any conditional/switch/fallback expression
 */
export function validateConditionalConstruct(expr: any): string[] {
  if (isConditionalExpression(expr)) {
    return validateConditionalExpression(expr);
  }
  if (isConditionalMapping(expr)) {
    return validateConditionalMapping(expr);
  }
  if (isFallbackExpression(expr)) {
    return validateFallbackExpression(expr);
  }
  if (isCoalesceExpression(expr)) {
    return validateCoalesceExpression(expr);
  }
  if (isSwitchExpression(expr)) {
    return validateSwitchExpression(expr);
  }
  if (isPatternMatchExpression(expr)) {
    return validatePatternMatchExpression(expr);
  }
  return ['Unknown conditional construct type'];
}

// ============================================================
// AST Node Types
// ============================================================

/**
 * AST node for conditional expressions
 * Used in parser/compiler for representing conditionals in the abstract syntax tree
 */
export interface ConditionalASTNode {
  type: 'ConditionalExpression';
  condition: ASTNode;
  consequent: ASTNode;
  alternate?: ASTNode;
  location?: SourceLocation;
}

/**
 * AST node for fallback expressions
 */
export interface FallbackASTNode {
  type: 'FallbackExpression';
  primary: ASTNode;
  fallback: ASTNode;
  options?: {
    nullIsValid?: boolean;
    emptyStringIsInvalid?: boolean;
    zeroIsInvalid?: boolean;
  };
  location?: SourceLocation;
}

/**
 * AST node for switch expressions
 */
export interface SwitchASTNode {
  type: 'SwitchExpression';
  discriminant: ASTNode;
  cases: Array<{
    test: ASTNode | string;
    consequent: ASTNode;
  }>;
  default?: ASTNode;
  matchMode?: 'exact' | 'loose' | 'expression';
  location?: SourceLocation;
}

/**
 * Generic AST node type
 */
export type ASTNode =
  | ConditionalASTNode
  | FallbackASTNode
  | SwitchASTNode
  | LiteralASTNode
  | IdentifierASTNode
  | BinaryExpressionASTNode
  | CallExpressionASTNode;

/**
 * AST node for literal values
 */
export interface LiteralASTNode {
  type: 'Literal';
  value: any;
  location?: SourceLocation;
}

/**
 * AST node for identifiers (variable names, field paths)
 */
export interface IdentifierASTNode {
  type: 'Identifier';
  name: string;
  location?: SourceLocation;
}

/**
 * AST node for binary expressions
 */
export interface BinaryExpressionASTNode {
  type: 'BinaryExpression';
  operator: string;
  left: ASTNode;
  right: ASTNode;
  location?: SourceLocation;
}

/**
 * AST node for function calls
 */
export interface CallExpressionASTNode {
  type: 'CallExpression';
  callee: string;
  arguments: ASTNode[];
  location?: SourceLocation;
}

/**
 * Source location for error reporting
 */
export interface SourceLocation {
  line?: number;
  column?: number;
  path: string;
}
