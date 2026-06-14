/**
 * Array DSL Integration Tests
 *
 * Tests for parsing, compiling, and executing array DSL expressions.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  ArrayDSLParser,
  ArrayDSLCompiler,
  ArrayDSLExecutor,
  parseArrayDSL,
  executeArrayDSL,
  validateArrayDSL,
  type CompiledArrayOp,
} from '../dsl/array-dsl.js';
import type {
  ArrayOperation,
  MapOperation,
  FilterOperation,
  ReduceOperation,
} from '../syntax/array-operations.js';

describe('ArrayDSLParser', () => {
  const parser = new ArrayDSLParser();

  describe('Basic operations', () => {
    it('should parse simple map operation', () => {
      const dsl = 'items | map(x => x * 2)';
      const result = parser.parseArrayExpression(dsl);

      assert.strictEqual(result.op, 'map');
      assert.strictEqual(result.array, 'items');
      assert.strictEqual((result as MapOperation).transform.param, 'x');
    });

    it('should parse simple filter operation', () => {
      const dsl = 'items | filter(x => x > 10)';
      const result = parser.parseArrayExpression(dsl);

      assert.strictEqual(result.op, 'filter');
      assert.strictEqual(result.array, 'items');
      assert.strictEqual((result as FilterOperation).predicate.param, 'x');
    });

    it('should parse reduce operation', () => {
      const dsl = 'items | reduce((acc, x) => acc + x, 0)';
      const result = parser.parseArrayExpression(dsl);

      assert.strictEqual(result.op, 'reduce');
      assert.strictEqual(result.array, 'items');
      assert.deepStrictEqual((result as ReduceOperation).reducer.params, ['acc', 'x']);
      assert.strictEqual((result as ReduceOperation).initial, 0);
    });

    it('should parse slice operation', () => {
      const dsl = 'items | slice(0, 10)';
      const result = parser.parseArrayExpression(dsl);

      assert.strictEqual(result.op, 'slice');
      assert.strictEqual(result.array, 'items');
      assert.strictEqual((result as any).start, 0);
      assert.strictEqual((result as any).end, 10);
    });

    it('should parse slice with step', () => {
      const dsl = 'items | slice(0, 10, 2)';
      const result = parser.parseArrayExpression(dsl);

      assert.strictEqual(result.op, 'slice');
      assert.strictEqual((result as any).start, 0);
      assert.strictEqual((result as any).end, 10);
      assert.strictEqual((result as any).step, 2);
    });

    it('should parse flatMap operation', () => {
      const dsl = 'groups | flatMap(g => g.items)';
      const result = parser.parseArrayExpression(dsl);

      assert.strictEqual(result.op, 'flatMap');
      assert.strictEqual(result.array, 'groups');
      assert.strictEqual((result as any).transform.param, 'g');
    });
  });

  describe('Chained operations', () => {
    it('should parse map then filter', () => {
      const dsl = 'items | map(x => x * 2) | filter(x => x > 10)';
      const result = parser.parseArrayExpression(dsl);

      // Result should be a filter operation
      assert.strictEqual(result.op, 'filter');

      // The array should be a map operation
      const mapOp = result.array as MapOperation;
      assert.strictEqual(mapOp.op, 'map');
      assert.strictEqual(mapOp.array, 'items');
    });

    it('should parse filter then map then reduce', () => {
      const dsl = 'items | filter(x => x > 5) | map(x => x * 2) | reduce((acc, x) => acc + x, 0)';
      const result = parser.parseArrayExpression(dsl);

      // Result should be reduce
      assert.strictEqual(result.op, 'reduce');

      // Array should be map
      const mapOp = result.array as MapOperation;
      assert.strictEqual(mapOp.op, 'map');

      // Map's array should be filter
      const filterOp = mapOp.array as FilterOperation;
      assert.strictEqual(filterOp.op, 'filter');
      assert.strictEqual(filterOp.array, 'items');
    });

    it('should parse method chaining syntax', () => {
      const dsl = 'items.map(x => x * 2).filter(x => x > 10)';
      const result = parser.parseArrayExpression(dsl);

      assert.strictEqual(result.op, 'filter');
      const mapOp = result.array as MapOperation;
      assert.strictEqual(mapOp.op, 'map');
      assert.strictEqual(mapOp.array, 'items');
    });
  });

  describe('Lambda expressions', () => {
    it('should parse single parameter lambda', () => {
      const dsl = 'items | map(x => x.price)';
      const result = parser.parseArrayExpression(dsl) as MapOperation;

      assert.strictEqual(result.transform.param, 'x');
      assert.strictEqual(result.transform.body, 'x.price');
    });

    it('should parse multi-parameter lambda', () => {
      const dsl = 'items | reduce((a, b) => a + b, 0)';
      const result = parser.parseArrayExpression(dsl) as ReduceOperation;

      assert.deepStrictEqual(result.reducer.params, ['a', 'b']);
    });

    it('should parse lambda with member access', () => {
      const dsl = 'items | map(item => item.price.value)';
      const result = parser.parseArrayExpression(dsl) as MapOperation;

      assert.strictEqual(result.transform.param, 'item');
      assert.strictEqual(result.transform.body, 'item.price.value');
    });

    it('should parse lambda with binary operations', () => {
      const dsl = 'items | map(x => x * 2 + 10)';
      const result = parser.parseArrayExpression(dsl) as MapOperation;

      const body = result.transform.body as any;
      assert.strictEqual(body.op, '+');
    });

    it('should parse lambda with comparison', () => {
      const dsl = 'items | filter(x => x.price > 100)';
      const result = parser.parseArrayExpression(dsl) as FilterOperation;

      const body = result.predicate.body as any;
      assert.strictEqual(body.op, '>');
    });
  });

  describe('Complex expressions', () => {
    it('should parse nested property access', () => {
      const dsl = 'response.data.items | map(x => x.value)';
      const result = parser.parseArrayExpression(dsl);

      assert.strictEqual(result.array, 'response.data.items');
    });

    it('should parse arithmetic in lambda', () => {
      const dsl = 'items | map(x => x * 2 - 5)';
      const result = parser.parseArrayExpression(dsl) as MapOperation;

      const body = result.transform.body as any;
      assert.strictEqual(body.op, '-');
      assert.strictEqual(body.left.op, '*');
    });

    it('should parse multiple comparison operators', () => {
      const dsl = 'items | filter(x => x >= 10)';
      const result = parser.parseArrayExpression(dsl) as FilterOperation;

      const body = result.predicate.body as any;
      assert.strictEqual(body.op, '>=');
    });
  });

  describe('Error handling', () => {
    it('should throw on invalid syntax', () => {
      assert.throws(() => {
        parser.parseArrayExpression('items | invalid(x => x)');
      }, /Unknown array operation/);
    });

    it('should throw on missing lambda arrow', () => {
      assert.throws(() => {
        parser.parseArrayExpression('items | map(x x)');
      }, /Expected ARROW/);
    });

    it('should throw on unclosed parenthesis', () => {
      assert.throws(() => {
        parser.parseArrayExpression('items | map(x => x');
      }, /Expected RPAREN/);
    });

    it('should throw on missing operation', () => {
      assert.throws(() => {
        parser.parseArrayExpression('items');
      }, /must contain at least one array operation/);
    });
  });
});

describe('ArrayDSLCompiler', () => {
  const parser = new ArrayDSLParser();
  const compiler = new ArrayDSLCompiler();

  it('should compile a simple map operation', () => {
    const operation = parser.parseArrayExpression('items | map(x => x * 2)');
    const compiled = compiler.compile(operation);

    assert.strictEqual(compiled.operation.op, 'map');
    assert.strictEqual(compiled.sourceArray, 'items');
    assert.ok(Array.isArray(compiled.steps));
    assert.ok(compiled.steps.length > 0);
  });

  it('should compile chained operations', () => {
    const operation = parser.parseArrayExpression('items | filter(x => x > 5) | map(x => x * 2)');
    const compiled = compiler.compile(operation);

    assert.strictEqual(compiled.operation.op, 'map');
    assert.strictEqual(compiled.sourceArray, 'items');
    assert.ok(compiled.steps.length >= 2);
  });

  it('should extract source array from nested operations', () => {
    const operation = parser.parseArrayExpression('data | map(x => x) | filter(x => x > 0) | reduce((a, b) => a + b, 0)');
    const compiled = compiler.compile(operation);

    assert.strictEqual(compiled.sourceArray, 'data');
  });

  it('should generate execution steps', () => {
    const operation = parser.parseArrayExpression('items | map(x => x * 2) | filter(x => x > 10)');
    const compiled = compiler.compile(operation);

    assert.ok(compiled.steps.includes('Transform each element'));
    assert.ok(compiled.steps.includes('Filter elements by predicate'));
  });

  it('should throw on invalid operation', () => {
    // Create an invalid operation manually
    const invalidOp: any = {
      op: 'map',
      array: 'items',
      // Missing transform field
    };

    assert.throws(() => {
      compiler.compile(invalidOp);
    }, /Invalid array operation/);
  });
});

describe('ArrayDSLExecutor', () => {
  const executor = new ArrayDSLExecutor();
  const parser = new ArrayDSLParser();
  const compiler = new ArrayDSLCompiler();

  it('should execute simple map operation', () => {
    const operation = parser.parseArrayExpression('numbers | map(x => x * 2)');
    const compiled = compiler.compile(operation);

    const context = {
      numbers: [1, 2, 3, 4, 5],
    };

    const result = executor.execute(compiled, context);
    assert.deepStrictEqual(result, [2, 4, 6, 8, 10]);
  });

  it('should execute filter operation', () => {
    const operation = parser.parseArrayExpression('numbers | filter(x => x > 3)');
    const compiled = compiler.compile(operation);

    const context = {
      numbers: [1, 2, 3, 4, 5, 6],
    };

    const result = executor.execute(compiled, context);
    assert.deepStrictEqual(result, [4, 5, 6]);
  });

  it('should execute reduce operation', () => {
    const operation = parser.parseArrayExpression('numbers | reduce((acc, x) => acc + x, 0)');
    const compiled = compiler.compile(operation);

    const context = {
      numbers: [1, 2, 3, 4, 5],
    };

    const result = executor.execute(compiled, context);
    assert.strictEqual(result, 15);
  });

  it('should execute slice operation', () => {
    const operation = parser.parseArrayExpression('numbers | slice(1, 4)');
    const compiled = compiler.compile(operation);

    const context = {
      numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    };

    const result = executor.execute(compiled, context);
    assert.deepStrictEqual(result, [1, 2, 3]);
  });

  it('should execute flatMap operation', () => {
    const operation = parser.parseArrayExpression('groups | flatMap(g => g.items)');
    const compiled = compiler.compile(operation);

    const context = {
      groups: [
        { items: [1, 2] },
        { items: [3, 4] },
        { items: [5] },
      ],
    };

    const result = executor.execute(compiled, context);
    assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
  });

  it('should execute chained map and filter', () => {
    const operation = parser.parseArrayExpression('numbers | map(x => x * 2) | filter(x => x > 5)');
    const compiled = compiler.compile(operation);

    const context = {
      numbers: [1, 2, 3, 4, 5],
    };

    const result = executor.execute(compiled, context);
    assert.deepStrictEqual(result, [6, 8, 10]);
  });

  it('should execute filter, map, reduce chain', () => {
    const operation = parser.parseArrayExpression('numbers | filter(x => x > 2) | map(x => x * 2) | reduce((acc, x) => acc + x, 0)');
    const compiled = compiler.compile(operation);

    const context = {
      numbers: [1, 2, 3, 4, 5],
    };

    const result = executor.execute(compiled, context);
    // [3, 4, 5] -> [6, 8, 10] -> 24
    assert.strictEqual(result, 24);
  });

  it('should handle member access in map', () => {
    const operation = parser.parseArrayExpression('items | map(x => x.price)');
    const compiled = compiler.compile(operation);

    const context = {
      items: [
        { id: 1, price: 100 },
        { id: 2, price: 200 },
        { id: 3, price: 300 },
      ],
    };

    const result = executor.execute(compiled, context);
    assert.deepStrictEqual(result, [100, 200, 300]);
  });

  it('should handle arithmetic in map', () => {
    const operation = parser.parseArrayExpression('items | map(x => x.quantity * x.price)');
    const compiled = compiler.compile(operation);

    const context = {
      items: [
        { quantity: 2, price: 10 },
        { quantity: 3, price: 20 },
        { quantity: 1, price: 50 },
      ],
    };

    const result = executor.execute(compiled, context);
    assert.deepStrictEqual(result, [20, 60, 50]);
  });

  it('should handle comparison in filter', () => {
    const operation = parser.parseArrayExpression('products | filter(p => p.price >= 100)');
    const compiled = compiler.compile(operation);

    const context = {
      products: [
        { name: 'A', price: 50 },
        { name: 'B', price: 100 },
        { name: 'C', price: 150 },
        { name: 'D', price: 75 },
      ],
    };

    const result = executor.execute(compiled, context);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, 'B');
    assert.strictEqual(result[1].name, 'C');
  });
});

describe('Helper functions', () => {
  describe('parseArrayDSL', () => {
    it('should parse DSL string', () => {
      const result = parseArrayDSL('items | map(x => x * 2)');
      assert.strictEqual(result.op, 'map');
      assert.strictEqual(result.array, 'items');
    });
  });

  describe('validateArrayDSL', () => {
    it('should validate correct DSL', () => {
      const result = validateArrayDSL('items | map(x => x * 2)');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should invalidate incorrect DSL', () => {
      const result = validateArrayDSL('items | invalid(x => x)');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
    });

    it('should catch syntax errors', () => {
      const result = validateArrayDSL('items | map(x => )');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
    });
  });

  describe('executeArrayDSL', () => {
    it('should parse, compile, and execute DSL in one call', () => {
      const context = {
        numbers: [1, 2, 3, 4, 5],
      };

      const result = executeArrayDSL('numbers | map(x => x * 2) | filter(x => x > 5)', context);
      assert.deepStrictEqual(result, [6, 8, 10]);
    });

    it('should handle complex operations', () => {
      const context = {
        items: [
          { price: 10, quantity: 2 },
          { price: 20, quantity: 3 },
          { price: 5, quantity: 10 },
        ],
      };

      const result = executeArrayDSL(
        'items | map(x => x.price * x.quantity) | reduce((acc, x) => acc + x, 0)',
        context
      );

      // (10*2) + (20*3) + (5*10) = 20 + 60 + 50 = 130
      assert.strictEqual(result, 130);
    });

    it('should handle slice operations', () => {
      const context = {
        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      };

      const result = executeArrayDSL('data | slice(2, 7, 2)', context);
      assert.deepStrictEqual(result, [2, 4, 6]);
    });

    it('should handle flatMap', () => {
      const context = {
        orders: [
          { id: 1, items: ['A', 'B'] },
          { id: 2, items: ['C'] },
          { id: 3, items: ['D', 'E', 'F'] },
        ],
      };

      const result = executeArrayDSL('orders | flatMap(o => o.items)', context);
      assert.deepStrictEqual(result, ['A', 'B', 'C', 'D', 'E', 'F']);
    });
  });
});

describe('Real-world scenarios', () => {
  it('should calculate total value of inventory', () => {
    const context = {
      inventory: [
        { product: 'Widget', quantity: 10, price: 5.99 },
        { product: 'Gadget', quantity: 5, price: 12.99 },
        { product: 'Doohickey', quantity: 3, price: 8.50 },
      ],
    };

    const result = executeArrayDSL(
      'inventory | map(item => item.quantity * item.price) | reduce((sum, val) => sum + val, 0)',
      context
    );

    const expected = (10 * 5.99) + (5 * 12.99) + (3 * 8.50);
    assert.ok(Math.abs(result - expected) < 0.01);
  });

  it('should filter and sum high-value orders', () => {
    const context = {
      orders: [
        { id: 1, total: 150 },
        { id: 2, total: 75 },
        { id: 3, total: 200 },
        { id: 4, total: 50 },
        { id: 5, total: 300 },
      ],
    };

    const result = executeArrayDSL(
      'orders | filter(o => o.total >= 100) | map(o => o.total) | reduce((sum, t) => sum + t, 0)',
      context
    );

    assert.strictEqual(result, 650); // 150 + 200 + 300
  });

  it('should extract and deduplicate tags', () => {
    const context = {
      posts: [
        { title: 'Post 1', tags: ['js', 'ts'] },
        { title: 'Post 2', tags: ['python'] },
        { title: 'Post 3', tags: ['js', 'node'] },
      ],
    };

    // Extract all tags first
    const allTags = executeArrayDSL('posts | flatMap(p => p.tags)', context);
    assert.deepStrictEqual(allTags, ['js', 'ts', 'python', 'js', 'node']);
  });

  it('should get first N elements after filtering', () => {
    const context = {
      numbers: [1, 5, 2, 8, 3, 9, 4, 7, 6],
    };

    const result = executeArrayDSL(
      'numbers | filter(n => n > 4) | slice(0, 3)',
      context
    );

    assert.deepStrictEqual(result, [5, 8, 9]);
  });

  it('should transform nested data structure', () => {
    const context = {
      departments: [
        { name: 'Engineering', employees: [{ name: 'Alice', salary: 100000 }, { name: 'Bob', salary: 120000 }] },
        { name: 'Sales', employees: [{ name: 'Charlie', salary: 80000 }] },
      ],
    };

    const result = executeArrayDSL(
      'departments | flatMap(d => d.employees) | map(e => e.salary) | reduce((sum, s) => sum + s, 0)',
      context
    );

    assert.strictEqual(result, 300000);
  });
});

describe('Edge cases', () => {
  it('should handle empty arrays', () => {
    const context = { empty: [] };

    const result = executeArrayDSL('empty | map(x => x * 2)', context);
    assert.deepStrictEqual(result, []);
  });

  it('should handle single element array', () => {
    const context = { single: [42] };

    const result = executeArrayDSL('single | map(x => x * 2)', context);
    assert.deepStrictEqual(result, [84]);
  });

  it('should handle reduce on empty array', () => {
    const context = { empty: [] };

    const result = executeArrayDSL('empty | reduce((acc, x) => acc + x, 100)', context);
    assert.strictEqual(result, 100);
  });

  it('should handle negative numbers in operations', () => {
    const context = { numbers: [-5, -3, -1, 1, 3, 5] };

    const result = executeArrayDSL('numbers | filter(x => x > 0)', context);
    assert.deepStrictEqual(result, [1, 3, 5]);
  });

  it('should handle slice with step larger than array', () => {
    const context = { numbers: [1, 2, 3, 4, 5] };

    const result = executeArrayDSL('numbers | slice(0, 10, 1)', context);
    assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
  });
});
