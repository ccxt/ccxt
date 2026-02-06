/**
 * Array DSL Integration Layer
 *
 * Provides DSL parsing, compilation, and execution for array operations.
 * Supports pipe syntax and method chaining for intuitive array transformations.
 *
 * Example DSL:
 *   "items | map(x => x.price) | filter(x => x > 100)"
 *   "data.map(x => x * 2).filter(x => x > 10)"
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
} from '../syntax/array-operations.js';
import { validateArrayOperation } from '../syntax/array-operations.js';
import { evaluateArrayOperation, type ArrayEvaluationContext } from '../evaluation/array-functions.js';
import { SafeExpressionEvaluator } from '../evaluation/expression-evaluator.js';

/**
 * Validation result for DSL syntax
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Compiled array operation with execution plan
 */
export interface CompiledArrayOp {
  operation: ArrayOperation;
  sourceArray: string;
  optimized: boolean;
  steps: string[];
}

/**
 * DSL Token types for parsing
 */
enum DSLTokenType {
  IDENTIFIER = 'IDENTIFIER',
  PIPE = 'PIPE',
  DOT = 'DOT',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  ARROW = 'ARROW',
  COMMA = 'COMMA',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  OPERATOR = 'OPERATOR',
  EOF = 'EOF',
}

interface DSLToken {
  type: DSLTokenType;
  value: string;
  position: number;
}

/**
 * ArrayDSLParser - Parses DSL strings into ArrayOperation objects
 *
 * Supports:
 * - Pipe syntax: "items | map(x => x.price) | filter(x => x > 100)"
 * - Method chaining: "items.map(x => x.price).filter(x => x > 100)"
 * - Lambda expressions: "x => x.price", "(a, b) => a + b"
 * - Index access: "items[0]", "items[-1]"
 */
export class ArrayDSLParser {
  private tokens: DSLToken[] = [];
  private currentIndex: number = 0;

  /**
   * Parse a DSL string into an ArrayOperation
   */
  parseArrayExpression(dslString: string): ArrayOperation {
    this.tokens = this.tokenize(dslString);
    this.currentIndex = 0;

    return this.parseChainedExpression();
  }

  /**
   * Tokenize the DSL string
   */
  private tokenize(input: string): DSLToken[] {
    const tokens: DSLToken[] = [];
    let position = 0;

    while (position < input.length) {
      const char = input[position];

      // Skip whitespace
      if (/\s/.test(char)) {
        position++;
        continue;
      }

      // Arrow operator =>
      if (char === '=' && input[position + 1] === '>') {
        tokens.push({ type: DSLTokenType.ARROW, value: '=>', position });
        position += 2;
        continue;
      }

      // Pipe | (must check BEFORE operators)
      if (char === '|' && input[position + 1] !== '|') {
        tokens.push({ type: DSLTokenType.PIPE, value: '|', position });
        position++;
        continue;
      }

      // Operators
      if (['+', '-', '*', '/', '%', '<', '>', '=', '!', '&', '|'].includes(char)) {
        let operator = char;
        position++;

        // Multi-character operators
        if (position < input.length) {
          const twoChar = char + input[position];
          if (['==', '!=', '<=', '>=', '&&', '||'].includes(twoChar)) {
            operator = twoChar;
            position++;
          }
        }

        tokens.push({ type: DSLTokenType.OPERATOR, value: operator, position });
        continue;
      }

      // Numbers
      if (/\d/.test(char) || (char === '-' && /\d/.test(input[position + 1]))) {
        let num = '';
        if (char === '-') {
          num = '-';
          position++;
        }
        while (position < input.length && /[\d.]/.test(input[position])) {
          num += input[position++];
        }
        tokens.push({ type: DSLTokenType.NUMBER, value: num, position });
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        const quote = char;
        let str = '';
        position++; // Skip opening quote
        while (position < input.length && input[position] !== quote) {
          if (input[position] === '\\' && position + 1 < input.length) {
            position++;
            str += input[position];
          } else {
            str += input[position];
          }
          position++;
        }
        if (position >= input.length) {
          throw new Error('Unterminated string');
        }
        position++; // Skip closing quote
        tokens.push({ type: DSLTokenType.STRING, value: str, position });
        continue;
      }

      // Identifiers
      if (/[a-zA-Z_$]/.test(char)) {
        let identifier = '';
        while (position < input.length && /[a-zA-Z0-9_$]/.test(input[position])) {
          identifier += input[position++];
        }
        tokens.push({ type: DSLTokenType.IDENTIFIER, value: identifier, position });
        continue;
      }

      // Single character tokens
      const singleChar: Record<string, DSLTokenType> = {
        '(': DSLTokenType.LPAREN,
        ')': DSLTokenType.RPAREN,
        '[': DSLTokenType.LBRACKET,
        ']': DSLTokenType.RBRACKET,
        '.': DSLTokenType.DOT,
        ',': DSLTokenType.COMMA,
      };

      if (singleChar[char]) {
        tokens.push({ type: singleChar[char], value: char, position });
        position++;
        continue;
      }

      throw new Error(`Unexpected character '${char}' at position ${position}`);
    }

    tokens.push({ type: DSLTokenType.EOF, value: '', position });
    return tokens;
  }

  /**
   * Parse a chained expression (pipe or method chaining)
   */
  private parseChainedExpression(): ArrayOperation {
    let baseArray: ComputeExpression = this.parseBaseExpression();

    let hasOperation = false;

    // Parse pipe chains: base | op1 | op2
    // OR method chains: base.op1().op2()
    while (this.peek().type === DSLTokenType.PIPE || this.peek().type === DSLTokenType.DOT) {
      if (this.peek().type === DSLTokenType.PIPE) {
        this.consume(); // consume |
        const operation = this.parseOperation(baseArray);
        baseArray = operation as any; // The result becomes the base for the next operation
        hasOperation = true;
      } else if (this.peek().type === DSLTokenType.DOT) {
        this.consume(); // consume .
        const operation = this.parseOperation(baseArray);
        baseArray = operation as any;
        hasOperation = true;
      }
    }

    // If we haven't created an operation yet, baseArray might just be a string
    // In that case, we need to return a simple identity operation or error
    if (!hasOperation) {
      throw new Error('DSL must contain at least one array operation');
    }

    return baseArray as ArrayOperation;
  }

  /**
   * Parse base expression (variable name or nested expression)
   */
  private parseBaseExpression(): ComputeExpression {
    const token = this.peek();

    if (token.type === DSLTokenType.IDENTIFIER) {
      let identifier = this.consume().value;

      // Parse member access in base expression: response.data.items
      // But stop before method calls (which will be operations)
      while (this.peek().type === DSLTokenType.DOT) {
        // Peek ahead to see if this is a method call or property access
        const nextNext = this.peekAhead(1);
        if (nextNext.type === DSLTokenType.IDENTIFIER) {
          // Check if the next identifier is an array operation
          const potentialOp = nextNext.value;
          if (['map', 'filter', 'reduce', 'slice', 'flatMap'].includes(potentialOp)) {
            // This is a method call, not property access
            break;
          }

          // This is property access, include it
          this.consume(); // consume .
          identifier += '.' + this.consume().value;
        } else {
          break;
        }
      }

      // Check for index access: items[0]
      if (this.peek().type === DSLTokenType.LBRACKET) {
        return this.parseIndexAccess(identifier);
      }

      return identifier;
    }

    throw new Error(`Expected identifier at position ${token.position}`);
  }

  /**
   * Parse index access: array[index]
   */
  private parseIndexAccess(arrayName: string): string {
    this.expect(DSLTokenType.LBRACKET);
    const indexToken = this.consume();
    this.expect(DSLTokenType.RBRACKET);

    // Return as a path string for now (simplified)
    return `${arrayName}[${indexToken.value}]`;
  }

  /**
   * Parse an array operation (map, filter, reduce, slice, flatMap)
   */
  private parseOperation(array: ComputeExpression): ArrayOperation {
    const operationName = this.expect(DSLTokenType.IDENTIFIER).value;

    this.expect(DSLTokenType.LPAREN);

    switch (operationName) {
      case 'map':
        return this.parseMapOperation(array);
      case 'filter':
        return this.parseFilterOperation(array);
      case 'reduce':
        return this.parseReduceOperation(array);
      case 'slice':
        return this.parseSliceOperation(array);
      case 'flatMap':
        return this.parseFlatMapOperation(array);
      default:
        throw new Error(`Unknown array operation: ${operationName}`);
    }
  }

  /**
   * Parse map operation: map(x => expr)
   */
  private parseMapOperation(array: ComputeExpression): MapOperation {
    const transform = this.parseLambda();
    this.expect(DSLTokenType.RPAREN);

    return {
      op: 'map',
      array,
      transform,
    };
  }

  /**
   * Parse filter operation: filter(x => expr)
   */
  private parseFilterOperation(array: ComputeExpression): FilterOperation {
    const predicate = this.parseLambda();
    this.expect(DSLTokenType.RPAREN);

    return {
      op: 'filter',
      array,
      predicate,
    };
  }

  /**
   * Parse reduce operation: reduce((acc, x) => expr, initial)
   */
  private parseReduceOperation(array: ComputeExpression): ReduceOperation {
    const reducer = this.parseLambda();
    this.expect(DSLTokenType.COMMA);
    const initial = this.parseExpression();
    this.expect(DSLTokenType.RPAREN);

    return {
      op: 'reduce',
      array,
      reducer,
      initial,
    };
  }

  /**
   * Parse slice operation: slice(start, end, step?)
   */
  private parseSliceOperation(array: ComputeExpression): SliceOperation {
    const start = this.parseNumber();

    let end: number | undefined;
    let step: number | undefined;

    if (this.peek().type === DSLTokenType.COMMA) {
      this.consume();
      end = this.parseNumber();

      if (this.peek().type === DSLTokenType.COMMA) {
        this.consume();
        step = this.parseNumber();
      }
    }

    this.expect(DSLTokenType.RPAREN);

    return {
      op: 'slice',
      array,
      start,
      end,
      step,
    };
  }

  /**
   * Parse flatMap operation: flatMap(x => expr)
   */
  private parseFlatMapOperation(array: ComputeExpression): FlatMapOperation {
    const transform = this.parseLambda();
    this.expect(DSLTokenType.RPAREN);

    return {
      op: 'flatMap',
      array,
      transform,
    };
  }

  /**
   * Parse lambda expression: x => expr or (a, b) => expr
   */
  private parseLambda(): LambdaExpression {
    const params: string[] = [];

    // Check for parenthesized params: (a, b)
    if (this.peek().type === DSLTokenType.LPAREN) {
      this.consume();

      while (this.peek().type !== DSLTokenType.RPAREN) {
        params.push(this.expect(DSLTokenType.IDENTIFIER).value);

        if (this.peek().type === DSLTokenType.COMMA) {
          this.consume();
        }
      }

      this.expect(DSLTokenType.RPAREN);
    } else {
      // Single parameter: x
      params.push(this.expect(DSLTokenType.IDENTIFIER).value);
    }

    this.expect(DSLTokenType.ARROW);

    const body = this.parseExpression();

    // Return lambda with appropriate param/params structure
    if (params.length === 1) {
      return {
        param: params[0],
        body,
      };
    } else {
      return {
        params,
        body,
      };
    }
  }

  /**
   * Parse a general expression (for lambda bodies, initial values, etc.)
   */
  private parseExpression(): ComputeExpression {
    return this.parseComparison();
  }

  /**
   * Parse comparison expressions
   */
  private parseComparison(): ComputeExpression {
    let left = this.parseAdditive();

    while (this.peek().type === DSLTokenType.OPERATOR) {
      const op = this.peek().value;
      if (['<', '>', '<=', '>=', '==', '!='].includes(op)) {
        this.consume();
        const right = this.parseAdditive();
        left = { op, left, right } as BinaryExpression;
      } else {
        break;
      }
    }

    return left;
  }

  /**
   * Parse additive expressions (+ -)
   */
  private parseAdditive(): ComputeExpression {
    let left = this.parseMultiplicative();

    while (this.peek().type === DSLTokenType.OPERATOR) {
      const op = this.peek().value;
      if (['+', '-'].includes(op)) {
        this.consume();
        const right = this.parseMultiplicative();
        left = { op, left, right } as BinaryExpression;
      } else {
        break;
      }
    }

    return left;
  }

  /**
   * Parse multiplicative expressions (* / %)
   */
  private parseMultiplicative(): ComputeExpression {
    let left = this.parsePrimary();

    while (this.peek().type === DSLTokenType.OPERATOR) {
      const op = this.peek().value;
      if (['*', '/', '%'].includes(op)) {
        this.consume();
        const right = this.parsePrimary();
        left = { op, left, right } as BinaryExpression;
      } else {
        break;
      }
    }

    return left;
  }

  /**
   * Parse primary expressions (numbers, strings, identifiers, member access)
   */
  private parsePrimary(): ComputeExpression {
    const token = this.peek();

    // Numbers
    if (token.type === DSLTokenType.NUMBER) {
      this.consume();
      return parseFloat(token.value);
    }

    // Strings
    if (token.type === DSLTokenType.STRING) {
      this.consume();
      return token.value;
    }

    // Identifiers with possible member access
    if (token.type === DSLTokenType.IDENTIFIER) {
      let path = this.consume().value;

      // Parse member access: x.price.value
      while (this.peek().type === DSLTokenType.DOT && this.peekAhead(1).type === DSLTokenType.IDENTIFIER) {
        this.consume(); // consume .
        path += '.' + this.consume().value;
      }

      return path;
    }

    // Parenthesized expressions
    if (token.type === DSLTokenType.LPAREN) {
      this.consume();
      const expr = this.parseExpression();
      this.expect(DSLTokenType.RPAREN);
      return expr;
    }

    throw new Error(`Unexpected token ${token.type} at position ${token.position}`);
  }

  /**
   * Parse a number token
   */
  private parseNumber(): number {
    const token = this.expect(DSLTokenType.NUMBER);
    return parseFloat(token.value);
  }

  /**
   * Peek at current token
   */
  private peek(): DSLToken {
    return this.tokens[this.currentIndex] || { type: DSLTokenType.EOF, value: '', position: -1 };
  }

  /**
   * Peek ahead n tokens
   */
  private peekAhead(n: number): DSLToken {
    return this.tokens[this.currentIndex + n] || { type: DSLTokenType.EOF, value: '', position: -1 };
  }

  /**
   * Consume current token and advance
   */
  private consume(): DSLToken {
    return this.tokens[this.currentIndex++];
  }

  /**
   * Expect a specific token type and consume it
   */
  private expect(type: DSLTokenType): DSLToken {
    const token = this.peek();
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type} at position ${token.position}`);
    }
    return this.consume();
  }
}

/**
 * ArrayDSLCompiler - Compiles ArrayOperation into optimized execution plan
 */
export class ArrayDSLCompiler {
  /**
   * Compile an array operation into an optimized execution plan
   */
  compile(operation: ArrayOperation): CompiledArrayOp {
    // Validate the operation
    const errors = validateArrayOperation(operation);
    if (errors.length > 0) {
      throw new Error(`Invalid array operation: ${errors.join(', ')}`);
    }

    // Extract source array
    const sourceArray = this.extractSourceArray(operation);

    // Generate execution steps
    const steps = this.generateSteps(operation);

    // Check if optimization is possible
    const optimized = this.canOptimize(operation);

    return {
      operation,
      sourceArray,
      optimized,
      steps,
    };
  }

  /**
   * Extract the source array from the operation tree
   */
  private extractSourceArray(operation: ArrayOperation): string {
    let current: any = operation;

    // Traverse nested operations to find the base array
    while (typeof current === 'object' && current !== null && 'op' in current) {
      current = current.array;
    }

    return typeof current === 'string' ? current : 'unknown';
  }

  /**
   * Generate execution step descriptions
   */
  private generateSteps(operation: ArrayOperation): string[] {
    const steps: string[] = [];
    this.collectSteps(operation, steps);
    return steps;
  }

  /**
   * Recursively collect execution steps
   */
  private collectSteps(operation: ArrayOperation, steps: string[]): void {
    // If the array is a nested operation, collect its steps first
    if (typeof operation.array === 'object' && operation.array !== null && 'op' in operation.array) {
      this.collectSteps(operation.array as ArrayOperation, steps);
    }

    // Add this operation's step
    switch (operation.op) {
      case 'map':
        steps.push('Transform each element');
        break;
      case 'filter':
        steps.push('Filter elements by predicate');
        break;
      case 'reduce':
        steps.push('Reduce to single value');
        break;
      case 'slice':
        steps.push('Extract slice of array');
        break;
      case 'flatMap':
        steps.push('Transform and flatten elements');
        break;
    }
  }

  /**
   * Determine if the operation can be optimized
   */
  private canOptimize(operation: ArrayOperation): boolean {
    // Simple optimization check: operations that can be fused
    // For example, multiple maps can be fused into a single pass
    return false; // Not implemented yet
  }
}

/**
 * ArrayDSLExecutor - Executes compiled array operations
 */
export class ArrayDSLExecutor {
  private evaluator: SafeExpressionEvaluator;

  constructor() {
    this.evaluator = new SafeExpressionEvaluator();
  }

  /**
   * Execute a compiled array operation
   */
  execute(compiled: CompiledArrayOp, data: any): any {
    // Create evaluation context
    const context: ArrayEvaluationContext = {
      variables: data,
      functions: {},
      evaluateExpression: (expr: ComputeExpression, ctx: any) => {
        return this.evaluateExpression(expr, ctx);
      },
    };

    // Execute the operation
    return evaluateArrayOperation(compiled.operation, context);
  }

  /**
   * Evaluate a compute expression
   */
  private evaluateExpression(expr: ComputeExpression, context: any): any {
    if (expr === null || expr === undefined) {
      return expr;
    }

    if (typeof expr === 'string') {
      // Use SafeExpressionEvaluator for string expressions
      const prevVars = { ...this.evaluator['context'].variables };

      // Update evaluator context
      for (const key in context) {
        this.evaluator.setVariable(key, context[key]);
      }

      const result = this.evaluator.evaluate(expr);

      // Restore previous variables
      this.evaluator['context'].variables = prevVars;

      if (result.error) {
        throw new Error(result.error);
      }

      return result.value;
    }

    if (typeof expr === 'number' || typeof expr === 'boolean') {
      return expr;
    }

    if (typeof expr === 'object' && 'op' in expr) {
      // Binary expression
      if ('left' in expr && 'right' in expr) {
        const binaryExpr = expr as BinaryExpression;
        const left = this.evaluateExpression(binaryExpr.left, context);
        const right = this.evaluateExpression(binaryExpr.right, context);

        switch (binaryExpr.op) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '%': return left % right;
          case '<': return left < right;
          case '>': return left > right;
          case '<=': return left <= right;
          case '>=': return left >= right;
          case '==': return left === right;
          case '!=': return left !== right;
          case '&&': return left && right;
          case '||': return left || right;
          default:
            throw new Error(`Unknown operator: ${binaryExpr.op}`);
        }
      }

      // Array operation (recursive)
      if (['map', 'filter', 'reduce', 'slice', 'flatMap'].includes((expr as any).op)) {
        const evalContext: ArrayEvaluationContext = {
          variables: context,
          functions: {},
          evaluateExpression: (e: ComputeExpression, c: any) => this.evaluateExpression(e, c),
        };
        return evaluateArrayOperation(expr as ArrayOperation, evalContext);
      }
    }

    return expr;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse a DSL string into an ArrayOperation
 */
export function parseArrayDSL(dsl: string): ArrayOperation {
  const parser = new ArrayDSLParser();
  return parser.parseArrayExpression(dsl);
}

/**
 * Execute a DSL string on given context data
 */
export function executeArrayDSL(dsl: string, context: any): any {
  const parser = new ArrayDSLParser();
  const operation = parser.parseArrayExpression(dsl);

  const compiler = new ArrayDSLCompiler();
  const compiled = compiler.compile(operation);

  const executor = new ArrayDSLExecutor();
  return executor.execute(compiled, context);
}

/**
 * Validate a DSL string
 */
export function validateArrayDSL(dsl: string): ValidationResult {
  try {
    const parser = new ArrayDSLParser();
    const operation = parser.parseArrayExpression(dsl);

    const errors = validateArrayOperation(operation);

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
