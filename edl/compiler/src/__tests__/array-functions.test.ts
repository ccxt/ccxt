/**
 * Array Functions Evaluation Tests
 *
 * Tests for core array operation evaluation logic.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  evaluateArrayOperation,
  evaluateMapOperation,
  evaluateFilterOperation,
  evaluateReduceOperation,
  evaluateSliceOperation,
  evaluateFlatMapOperation,
  evaluateLambda,
  getArrayFromExpression,
  type ArrayEvaluationContext,
} from '../evaluation/array-functions.js';
import type {
  MapOperation,
  FilterOperation,
  ReduceOperation,
  SliceOperation,
  FlatMapOperation,
  LambdaExpression,
  ComputeExpression,
  BinaryExpression,
} from '../syntax/array-operations.js';

/**
 * Helper function to create a basic evaluation context
 */
function createContext(variables: Record<string, any> = {}): ArrayEvaluationContext {
  return {
    variables,
    functions: {
      // Add some test functions
      abs: Math.abs,
      sqrt: Math.sqrt,
      max: Math.max,
    },
    evaluateExpression: (expr: ComputeExpression, ctx: any): any => {
      // Simple expression evaluator for testing
      if (expr === null || expr === undefined) {
        return expr;
      }

      if (typeof expr === 'string') {
        // Handle path access like "x", "x.price", "response.items"
        const parts = expr.split('.');
        let value = ctx;

        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
          } else {
            return undefined;
          }
        }

        return value;
      }

      if (typeof expr === 'number' || typeof expr === 'boolean') {
        return expr;
      }

      if (typeof expr === 'object') {
        // Handle binary expressions
        if ('op' in expr && 'left' in expr && 'right' in expr) {
          const binaryExpr = expr as BinaryExpression;
          const left = createContext(ctx).evaluateExpression(binaryExpr.left, ctx);
          const right = createContext(ctx).evaluateExpression(binaryExpr.right, ctx);

          switch (binaryExpr.op) {
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
            case 'eq':
            case '==':
            case '===':
              return left === right;
            default:
              throw new Error(`Unknown operator: ${binaryExpr.op}`);
          }
        }

        // Handle array operations (recursive)
        if ('op' in expr && ['map', 'filter', 'reduce', 'slice', 'flatMap'].includes((expr as any).op)) {
          return evaluateArrayOperation(expr as any, createContext(ctx));
        }
      }

      return expr;
    },
  };
}

describe('Array Functions', () => {
  describe('evaluateMapOperation', () => {
    it('should double each number in array', () => {
      const context = createContext({
        numbers: [1, 2, 3, 4, 5],
      });

      const operation: MapOperation = {
        op: 'map',
        array: 'numbers',
        transform: {
          param: 'x',
          body: { op: 'mul', left: 'x', right: 2 },
        },
      };

      const result = evaluateMapOperation(operation, context);
      assert.deepStrictEqual(result, [2, 4, 6, 8, 10]);
    });

    it('should extract property from objects', () => {
      const context = createContext({
        items: [
          { id: 1, price: 100 },
          { id: 2, price: 200 },
          { id: 3, price: 300 },
        ],
      });

      const operation: MapOperation = {
        op: 'map',
        array: 'items',
        transform: {
          param: 'x',
          body: 'x.price',
        },
      };

      const result = evaluateMapOperation(operation, context);
      assert.deepStrictEqual(result, [100, 200, 300]);
    });

    it('should transform using complex expression', () => {
      const context = createContext({
        items: [
          { quantity: 2, price: 10 },
          { quantity: 3, price: 20 },
        ],
      });

      const operation: MapOperation = {
        op: 'map',
        array: 'items',
        transform: {
          param: 'item',
          body: { op: 'mul', left: 'item.quantity', right: 'item.price' },
        },
      };

      const result = evaluateMapOperation(operation, context);
      assert.deepStrictEqual(result, [20, 60]);
    });
  });

  describe('evaluateFilterOperation', () => {
    it('should filter numbers greater than 5', () => {
      const context = createContext({
        numbers: [1, 3, 5, 7, 9, 11],
      });

      const operation: FilterOperation = {
        op: 'filter',
        array: 'numbers',
        predicate: {
          param: 'x',
          body: { op: 'gt', left: 'x', right: 5 },
        },
      };

      const result = evaluateFilterOperation(operation, context);
      assert.deepStrictEqual(result, [7, 9, 11]);
    });

    it('should filter objects by property', () => {
      const context = createContext({
        products: [
          { name: 'A', inStock: true },
          { name: 'B', inStock: false },
          { name: 'C', inStock: true },
        ],
      });

      const operation: FilterOperation = {
        op: 'filter',
        array: 'products',
        predicate: {
          param: 'p',
          body: 'p.inStock',
        },
      };

      const result = evaluateFilterOperation(operation, context);
      assert.deepStrictEqual(result, [
        { name: 'A', inStock: true },
        { name: 'C', inStock: true },
      ]);
    });
  });

  describe('evaluateReduceOperation', () => {
    it('should sum all numbers in array', () => {
      const context = createContext({
        numbers: [1, 2, 3, 4, 5],
      });

      const operation: ReduceOperation = {
        op: 'reduce',
        array: 'numbers',
        reducer: {
          params: ['acc', 'x'],
          body: { op: 'add', left: 'acc', right: 'x' },
        },
        initial: 0,
      };

      const result = evaluateReduceOperation(operation, context);
      assert.strictEqual(result, 15);
    });

    it('should calculate total price', () => {
      const context = createContext({
        items: [
          { price: 10 },
          { price: 20 },
          { price: 30 },
        ],
      });

      const operation: ReduceOperation = {
        op: 'reduce',
        array: 'items',
        reducer: {
          params: ['acc', 'item'],
          body: { op: 'add', left: 'acc', right: 'item.price' },
        },
        initial: 0,
      };

      const result = evaluateReduceOperation(operation, context);
      assert.strictEqual(result, 60);
    });

    it('should work with non-zero initial value', () => {
      const context = createContext({
        numbers: [1, 2, 3],
      });

      const operation: ReduceOperation = {
        op: 'reduce',
        array: 'numbers',
        reducer: {
          params: ['acc', 'x'],
          body: { op: 'add', left: 'acc', right: 'x' },
        },
        initial: 100,
      };

      const result = evaluateReduceOperation(operation, context);
      assert.strictEqual(result, 106);
    });
  });

  describe('evaluateSliceOperation', () => {
    it('should get first 3 elements', () => {
      const context = createContext({
        items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      });

      const operation: SliceOperation = {
        op: 'slice',
        array: 'items',
        start: 0,
        end: 3,
      };

      const result = evaluateSliceOperation(operation, context);
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    it('should slice with start only', () => {
      const context = createContext({
        items: [1, 2, 3, 4, 5],
      });

      const operation: SliceOperation = {
        op: 'slice',
        array: 'items',
        start: 2,
      };

      const result = evaluateSliceOperation(operation, context);
      assert.deepStrictEqual(result, [3, 4, 5]);
    });

    it('should slice with step', () => {
      const context = createContext({
        items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      });

      const operation: SliceOperation = {
        op: 'slice',
        array: 'items',
        start: 0,
        end: 10,
        step: 2,
      };

      const result = evaluateSliceOperation(operation, context);
      assert.deepStrictEqual(result, [0, 2, 4, 6, 8]);
    });

    it('should handle negative indices', () => {
      const context = createContext({
        items: [1, 2, 3, 4, 5],
      });

      const operation: SliceOperation = {
        op: 'slice',
        array: 'items',
        start: -3,
        end: -1,
      };

      const result = evaluateSliceOperation(operation, context);
      assert.deepStrictEqual(result, [3, 4]);
    });
  });

  describe('evaluateFlatMapOperation', () => {
    it('should flatten nested arrays', () => {
      const context = createContext({
        groups: [
          { items: [1, 2] },
          { items: [3, 4] },
          { items: [5] },
        ],
      });

      const operation: FlatMapOperation = {
        op: 'flatMap',
        array: 'groups',
        transform: {
          param: 'g',
          body: 'g.items',
        },
      };

      const result = evaluateFlatMapOperation(operation, context);
      assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
    });

    it('should map and flatten in one operation', () => {
      const context = createContext({
        numbers: [1, 2, 3],
      });

      // FlatMap that returns the value itself (which is an array in this test)
      const contextWithArrays = createContext({
        arrays: [[1, 2], [3, 4], [5]],
      });

      const operation: FlatMapOperation = {
        op: 'flatMap',
        array: 'arrays',
        transform: {
          param: 'arr',
          body: 'arr',
        },
      };

      const result = evaluateFlatMapOperation(operation, contextWithArrays);
      assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
    });
  });

  describe('evaluateLambda', () => {
    it('should evaluate single parameter lambda', () => {
      const context = createContext({});

      const lambda: LambdaExpression = {
        param: 'x',
        body: { op: 'mul', left: 'x', right: 2 },
      };

      const result = evaluateLambda(lambda, [5], context);
      assert.strictEqual(result, 10);
    });

    it('should evaluate multi-parameter lambda', () => {
      const context = createContext({});

      const lambda: LambdaExpression = {
        params: ['a', 'b'],
        body: { op: 'add', left: 'a', right: 'b' },
      };

      const result = evaluateLambda(lambda, [3, 7], context);
      assert.strictEqual(result, 10);
    });

    it('should handle object property access', () => {
      const context = createContext({});

      const lambda: LambdaExpression = {
        param: 'obj',
        body: 'obj.price',
      };

      const result = evaluateLambda(lambda, [{ price: 100, name: 'test' }], context);
      assert.strictEqual(result, 100);
    });
  });

  describe('getArrayFromExpression', () => {
    it('should resolve array from path string', () => {
      const context = createContext({
        response: {
          items: [1, 2, 3],
        },
      });

      const result = getArrayFromExpression('response.items', context);
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    it('should handle direct variable containing array', () => {
      const context = createContext({
        myArray: [1, 2, 3],
      });

      const result = getArrayFromExpression('myArray', context);
      assert.deepStrictEqual(result, [1, 2, 3]);
    });

    it('should throw error if result is not an array', () => {
      const context = createContext({
        notArray: 'string',
      });

      assert.throws(() => {
        getArrayFromExpression('notArray', context);
      }, /Expected array/);
    });
  });

  describe('Chained operations', () => {
    it('should filter then map', () => {
      const context = createContext({
        numbers: [1, 2, 3, 4, 5, 6],
      });

      // First filter > 3
      const filterOp: FilterOperation = {
        op: 'filter',
        array: 'numbers',
        predicate: {
          param: 'x',
          body: { op: 'gt', left: 'x', right: 3 },
        },
      };

      const filtered = evaluateFilterOperation(filterOp, context);

      // Then map to double
      const mapContext = createContext({ filtered });
      const mapOp: MapOperation = {
        op: 'map',
        array: 'filtered',
        transform: {
          param: 'x',
          body: { op: 'mul', left: 'x', right: 2 },
        },
      };

      const result = evaluateMapOperation(mapOp, mapContext);
      assert.deepStrictEqual(result, [8, 10, 12]);
    });
  });

  describe('evaluateArrayOperation', () => {
    it('should dispatch to map operation', () => {
      const context = createContext({
        numbers: [1, 2, 3],
      });

      const operation: MapOperation = {
        op: 'map',
        array: 'numbers',
        transform: {
          param: 'x',
          body: { op: 'mul', left: 'x', right: 2 },
        },
      };

      const result = evaluateArrayOperation(operation, context);
      assert.deepStrictEqual(result, [2, 4, 6]);
    });

    it('should dispatch to filter operation', () => {
      const context = createContext({
        numbers: [1, 2, 3, 4, 5],
      });

      const operation: FilterOperation = {
        op: 'filter',
        array: 'numbers',
        predicate: {
          param: 'x',
          body: { op: 'gt', left: 'x', right: 3 },
        },
      };

      const result = evaluateArrayOperation(operation, context);
      assert.deepStrictEqual(result, [4, 5]);
    });

    it('should throw error for unknown operation', () => {
      const context = createContext({});

      const invalidOp = {
        op: 'unknown',
        array: [],
      } as any;

      assert.throws(() => {
        evaluateArrayOperation(invalidOp, context);
      }, /Unknown array operation/);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty arrays', () => {
      const context = createContext({ empty: [] });

      const mapOp: MapOperation = {
        op: 'map',
        array: 'empty',
        transform: {
          param: 'x',
          body: { op: 'mul', left: 'x', right: 2 },
        },
      };

      assert.deepStrictEqual(evaluateMapOperation(mapOp, context), []);

      const filterOp: FilterOperation = {
        op: 'filter',
        array: 'empty',
        predicate: { param: 'x', body: true },
      };

      assert.deepStrictEqual(evaluateFilterOperation(filterOp, context), []);
    });

    it('should handle reduce with empty array', () => {
      const context = createContext({ empty: [] });

      const operation: ReduceOperation = {
        op: 'reduce',
        array: 'empty',
        reducer: {
          params: ['acc', 'x'],
          body: { op: 'add', left: 'acc', right: 'x' },
        },
        initial: 42,
      };

      const result = evaluateReduceOperation(operation, context);
      assert.strictEqual(result, 42);
    });

    it('should throw error for non-array input to map', () => {
      const context = createContext({ notArray: 'string' });

      const operation: MapOperation = {
        op: 'map',
        array: 'notArray',
        transform: {
          param: 'x',
          body: 'x',
        },
      };

      assert.throws(() => {
        evaluateMapOperation(operation, context);
      }, /Expected array/);
    });
  });
});
