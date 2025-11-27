/**
 * Tests for Safe Expression Evaluator
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SafeExpressionEvaluator, ExpressionResult } from '../evaluation/expression-evaluator.js';

describe('SafeExpressionEvaluator', () => {
    describe('Basic Literals', () => {
        test('should evaluate number literals', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('42');
            assert.strictEqual(result.value, 42);
            assert.strictEqual(result.type, 'number');
            assert.strictEqual(result.error, undefined);
        });

        test('should evaluate float literals', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('3.14');
            assert.strictEqual(result.value, 3.14);
            assert.strictEqual(result.type, 'number');
        });

        test('should evaluate string literals with double quotes', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('"hello world"');
            assert.strictEqual(result.value, 'hello world');
            assert.strictEqual(result.type, 'string');
        });

        test('should evaluate string literals with single quotes', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate("'hello world'");
            assert.strictEqual(result.value, 'hello world');
            assert.strictEqual(result.type, 'string');
        });

        test('should evaluate boolean literals', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('true').value, true);
            assert.strictEqual(evaluator.evaluate('false').value, false);
        });

        test('should evaluate null', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('null');
            assert.strictEqual(result.value, null);
            assert.strictEqual(result.type, 'null');
        });

        test('should evaluate undefined', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('undefined');
            assert.strictEqual(result.value, undefined);
            assert.strictEqual(result.type, 'undefined');
        });
    });

    describe('Math Operations', () => {
        test('should evaluate addition', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('1 + 2');
            assert.strictEqual(result.value, 3);
        });

        test('should evaluate subtraction', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('5 - 3');
            assert.strictEqual(result.value, 2);
        });

        test('should evaluate multiplication', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('4 * 5');
            assert.strictEqual(result.value, 20);
        });

        test('should evaluate division', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('10 / 2');
            assert.strictEqual(result.value, 5);
        });

        test('should evaluate modulo', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('10 % 3');
            assert.strictEqual(result.value, 1);
        });

        test('should respect operator precedence', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('1 + 2 * 3');
            assert.strictEqual(result.value, 7);
        });

        test('should handle parentheses for precedence', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('(1 + 2) * 3');
            assert.strictEqual(result.value, 9);
        });

        test('should handle negative numbers', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('-5 + 3');
            assert.strictEqual(result.value, -2);
        });
    });

    describe('Comparison Operations', () => {
        test('should evaluate less than', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('1 < 2').value, true);
            assert.strictEqual(evaluator.evaluate('2 < 1').value, false);
        });

        test('should evaluate greater than', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('2 > 1').value, true);
            assert.strictEqual(evaluator.evaluate('1 > 2').value, false);
        });

        test('should evaluate less than or equal', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('1 <= 2').value, true);
            assert.strictEqual(evaluator.evaluate('2 <= 2').value, true);
            assert.strictEqual(evaluator.evaluate('3 <= 2').value, false);
        });

        test('should evaluate greater than or equal', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('2 >= 1').value, true);
            assert.strictEqual(evaluator.evaluate('2 >= 2').value, true);
            assert.strictEqual(evaluator.evaluate('1 >= 2').value, false);
        });

        test('should evaluate equality', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('1 == 1').value, true);
            assert.strictEqual(evaluator.evaluate('1 == 2').value, false);
        });

        test('should evaluate inequality', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('1 != 2').value, true);
            assert.strictEqual(evaluator.evaluate('1 != 1').value, false);
        });
    });

    describe('Logical Operations', () => {
        test('should evaluate AND operator', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('true && true').value, true);
            assert.strictEqual(evaluator.evaluate('true && false').value, false);
            assert.strictEqual(evaluator.evaluate('false && true').value, false);
            assert.strictEqual(evaluator.evaluate('false && false').value, false);
        });

        test('should evaluate OR operator', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('true || true').value, true);
            assert.strictEqual(evaluator.evaluate('true || false').value, true);
            assert.strictEqual(evaluator.evaluate('false || true').value, true);
            assert.strictEqual(evaluator.evaluate('false || false').value, false);
        });

        test('should evaluate NOT operator', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('!true').value, false);
            assert.strictEqual(evaluator.evaluate('!false').value, true);
        });

        test('should short-circuit AND', () => {
            const evaluator = new SafeExpressionEvaluator();
            // If first operand is false, second is not evaluated
            assert.strictEqual(evaluator.evaluate('false && true').value, false);
        });

        test('should short-circuit OR', () => {
            const evaluator = new SafeExpressionEvaluator();
            // If first operand is true, second is not evaluated
            assert.strictEqual(evaluator.evaluate('true || false').value, true);
        });
    });

    describe('Conditional (Ternary) Operator', () => {
        test('should evaluate ternary when condition is true', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('true ? "yes" : "no"');
            assert.strictEqual(result.value, 'yes');
        });

        test('should evaluate ternary when condition is false', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('false ? "yes" : "no"');
            assert.strictEqual(result.value, 'no');
        });

        test('should evaluate complex ternary', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { amount: 10 } });
            const result = evaluator.evaluate('amount > 0 ? "buy" : "sell"');
            assert.strictEqual(result.value, 'buy');
        });

        test('should evaluate nested ternary', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { score: 85 } });
            const result = evaluator.evaluate('score >= 90 ? "A" : score >= 80 ? "B" : "C"');
            assert.strictEqual(result.value, 'B');
        });
    });

    describe('Variables', () => {
        test('should access variables', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: { x: 10, y: 20 }
            });
            assert.strictEqual(evaluator.evaluate('x').value, 10);
            assert.strictEqual(evaluator.evaluate('y').value, 20);
        });

        test('should use variables in expressions', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: { price: 100, quantity: 5 }
            });
            const result = evaluator.evaluate('price * quantity');
            assert.strictEqual(result.value, 500);
        });

        test('should throw error for undefined variables', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('unknownVar');
            assert.ok(result.error);
            assert.ok(result.error.includes('Undefined variable'));
        });

        test('should allow setting variables', () => {
            const evaluator = new SafeExpressionEvaluator();
            evaluator.setVariable('foo', 42);
            assert.strictEqual(evaluator.evaluate('foo').value, 42);
        });
    });

    describe('Property Access', () => {
        test('should access object properties', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    user: { name: 'Alice', age: 30 }
                }
            });
            assert.strictEqual(evaluator.evaluate('user.name').value, 'Alice');
            assert.strictEqual(evaluator.evaluate('user.age').value, 30);
        });

        test('should access nested properties', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    data: {
                        orders: [
                            { price: 100, quantity: 5 },
                            { price: 200, quantity: 3 }
                        ]
                    }
                }
            });
            const result = evaluator.evaluate('data.orders[0].price');
            assert.strictEqual(result.value, 100);
        });

        test('should access array elements by index', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    numbers: [10, 20, 30, 40]
                }
            });
            assert.strictEqual(evaluator.evaluate('numbers[0]').value, 10);
            assert.strictEqual(evaluator.evaluate('numbers[2]').value, 30);
        });

        test('should access array elements by computed index', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    numbers: [10, 20, 30],
                    index: 1
                }
            });
            assert.strictEqual(evaluator.evaluate('numbers[index]').value, 20);
        });

        test('should access object properties by bracket notation', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    obj: { 'foo-bar': 123 }
                }
            });
            assert.strictEqual(evaluator.evaluate('obj["foo-bar"]').value, 123);
        });
    });

    describe('Built-in Math Functions', () => {
        test('should call abs function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('abs(-5)').value, 5);
            assert.strictEqual(evaluator.evaluate('abs(5)').value, 5);
        });

        test('should call ceil function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('ceil(3.2)').value, 4);
        });

        test('should call floor function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('floor(3.8)').value, 3);
        });

        test('should call round function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('round(3.5)').value, 4);
            assert.strictEqual(evaluator.evaluate('round(3.4)').value, 3);
        });

        test('should call min function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('min(5, 3, 8, 1)').value, 1);
        });

        test('should call max function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('max(5, 3, 8, 1)').value, 8);
        });

        test('should call pow function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('pow(2, 3)').value, 8);
        });

        test('should call sqrt function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('sqrt(16)').value, 4);
        });

        test('should call add function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('add(1, 2, 3, 4)').value, 10);
        });

        test('should call multiply function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('multiply(2, 3, 4)').value, 24);
        });
    });

    describe('Built-in String Functions', () => {
        test('should call concat function', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('concat("hello", " ", "world")');
            assert.strictEqual(result.value, 'hello world');
        });

        test('should call substring function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('substring("hello", 1, 4)').value, 'ell');
        });

        test('should call toLowerCase function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('toLowerCase("HELLO")').value, 'hello');
        });

        test('should call toUpperCase function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('toUpperCase("hello")').value, 'HELLO');
        });

        test('should call trim function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('trim("  hello  ")').value, 'hello');
        });

        test('should call length function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('length("hello")').value, 5);
        });

        test('should call startsWith function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('startsWith("hello", "he")').value, true);
            assert.strictEqual(evaluator.evaluate('startsWith("hello", "wo")').value, false);
        });

        test('should call endsWith function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('endsWith("hello", "lo")').value, true);
            assert.strictEqual(evaluator.evaluate('endsWith("hello", "he")').value, false);
        });

        test('should call includes function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('includes("hello world", "world")').value, true);
            assert.strictEqual(evaluator.evaluate('includes("hello world", "foo")').value, false);
        });
    });

    describe('Built-in Type Functions', () => {
        test('should call toString function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('toString(42)').value, '42');
            assert.strictEqual(evaluator.evaluate('toString(true)').value, 'true');
        });

        test('should call toNumber function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('toNumber("42")').value, 42);
            assert.strictEqual(evaluator.evaluate('toNumber("3.14")').value, 3.14);
        });

        test('should call toBoolean function', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('toBoolean(1)').value, true);
            assert.strictEqual(evaluator.evaluate('toBoolean(0)').value, false);
            assert.strictEqual(evaluator.evaluate('toBoolean("hello")').value, true);
            assert.strictEqual(evaluator.evaluate('toBoolean("")').value, false);
        });

        test('should call isNull function', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: null, y: 5 } });
            assert.strictEqual(evaluator.evaluate('isNull(x)').value, true);
            assert.strictEqual(evaluator.evaluate('isNull(y)').value, false);
        });

        test('should call isUndefined function', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: undefined, y: 5 } });
            assert.strictEqual(evaluator.evaluate('isUndefined(x)').value, true);
            assert.strictEqual(evaluator.evaluate('isUndefined(y)').value, false);
        });

        test('should call isNumber function', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: 42, y: 'hello' } });
            assert.strictEqual(evaluator.evaluate('isNumber(x)').value, true);
            assert.strictEqual(evaluator.evaluate('isNumber(y)').value, false);
        });

        test('should call isString function', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: 'hello', y: 42 } });
            assert.strictEqual(evaluator.evaluate('isString(x)').value, true);
            assert.strictEqual(evaluator.evaluate('isString(y)').value, false);
        });

        test('should call isArray function', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: [1, 2, 3], y: 'hello' } });
            assert.strictEqual(evaluator.evaluate('isArray(x)').value, true);
            assert.strictEqual(evaluator.evaluate('isArray(y)').value, false);
        });

        test('should call isObject function', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: { a: 1 }, y: [1, 2] } });
            assert.strictEqual(evaluator.evaluate('isObject(x)').value, true);
            assert.strictEqual(evaluator.evaluate('isObject(y)').value, false);
        });
    });

    describe('Custom Functions', () => {
        test('should register and call custom function', () => {
            const evaluator = new SafeExpressionEvaluator();
            evaluator.registerFunction('double', (x: number) => x * 2);
            assert.strictEqual(evaluator.evaluate('double(5)').value, 10);
        });

        test('should not allow overriding built-in functions', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.throws(() => {
                evaluator.registerFunction('abs', (x: number) => x);
            }, /Cannot override built-in function/);
        });

        test('should use custom function in complex expression', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: 5 } });
            evaluator.registerFunction('triple', (n: number) => n * 3);
            assert.strictEqual(evaluator.evaluate('triple(x) + 10').value, 25);
        });
    });

    describe('Security', () => {
        test('should reject constructor access', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { obj: {} } });
            const result = evaluator.evaluate('obj.constructor');
            assert.ok(result.error);
            assert.ok(result.error.includes('not allowed'));
        });

        test('should reject prototype access', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { obj: {} } });
            const result = evaluator.evaluate('obj.prototype');
            assert.ok(result.error);
            assert.ok(result.error.includes('not allowed'));
        });

        test('should reject __proto__ access', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { obj: {} } });
            const result = evaluator.evaluate('obj.__proto__');
            assert.ok(result.error);
            assert.ok(result.error.includes('not allowed'));
        });

        test('should reject constructor via bracket notation', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { obj: {} } });
            const result = evaluator.evaluate('obj["constructor"]');
            assert.ok(result.error);
            assert.ok(result.error.includes('not allowed'));
        });

        test('should reject constructor as identifier', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { constructor: 'bad' } });
            const result = evaluator.evaluate('constructor');
            assert.ok(result.error);
            assert.ok(result.error.includes('not allowed'));
        });

        test('should prevent deep nesting with depth limit', () => {
            const evaluator = new SafeExpressionEvaluator({ maxDepth: 5 });
            // Create a deeply nested expression
            const deepExpression = '((((((((((1 + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1) + 1)';
            const result = evaluator.evaluate(deepExpression);
            assert.ok(result.error);
            assert.ok(result.error.includes('depth'));
        });

        test('should allow reasonable nesting depth', () => {
            const evaluator = new SafeExpressionEvaluator({ maxDepth: 100 });
            // Moderate nesting should work fine
            const expression = '(1 + (2 * (3 + (4 - 5))))';
            const result = evaluator.evaluate(expression);
            assert.strictEqual(result.error, undefined);
            assert.strictEqual(result.value, 5);
        });
    });

    describe('Complex Expressions', () => {
        test('should evaluate complex arithmetic', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('(10 + 5) * 2 - 8 / 4');
            assert.strictEqual(result.value, 28);
        });

        test('should evaluate complex logical expression', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: { age: 25, isStudent: true, hasDiscount: false }
            });
            const result = evaluator.evaluate('(age >= 18 && age <= 30) && (isStudent || hasDiscount)');
            assert.strictEqual(result.value, true);
        });

        test('should chain multiple function calls', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('toUpperCase(trim("  hello  "))');
            assert.strictEqual(result.value, 'HELLO');
        });

        test('should combine operators and functions', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { price: 99.99 } });
            const result = evaluator.evaluate('floor(price) + 1');
            assert.strictEqual(result.value, 100);
        });

        test('should evaluate nested data access', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    order: {
                        items: [
                            { name: 'Apple', price: 1.5, quantity: 3 },
                            { name: 'Banana', price: 0.8, quantity: 5 }
                        ]
                    }
                }
            });
            const result = evaluator.evaluate('order.items[0].price * order.items[0].quantity');
            assert.strictEqual(result.value, 4.5);
        });

        test('should evaluate string concatenation with expression', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { name: 'Alice', age: 30 } });
            const result = evaluator.evaluate('concat("Hello, ", name, "! You are ", toString(age), " years old.")');
            assert.strictEqual(result.value, 'Hello, Alice! You are 30 years old.');
        });
    });

    describe('Edge Cases', () => {
        test('should handle division by zero', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('10 / 0');
            assert.strictEqual(result.value, Infinity);
        });

        test('should handle empty string', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('""');
            assert.strictEqual(result.value, '');
        });

        test('should handle escaped characters in strings', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('"line1\\nline2"');
            assert.strictEqual(result.value, 'line1\nline2');
        });

        test('should handle string with escaped quotes', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('"She said \\"Hello\\""');
            assert.strictEqual(result.value, 'She said "Hello"');
        });

        test('should handle multiple spaces in expression', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('1    +    2');
            assert.strictEqual(result.value, 3);
        });

        test('should handle property access on null', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: null } });
            const result = evaluator.evaluate('x.property');
            assert.ok(result.error);
            assert.ok(result.error.includes('Cannot access property'));
        });

        test('should handle index access on undefined', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: undefined } });
            const result = evaluator.evaluate('x[0]');
            assert.ok(result.error);
            assert.ok(result.error.includes('Cannot access index'));
        });

        test('should handle calling undefined function', () => {
            const evaluator = new SafeExpressionEvaluator();
            const result = evaluator.evaluate('unknownFunc()');
            assert.ok(result.error);
            assert.ok(result.error.includes('Undefined function'));
        });
    });

    describe('Null Coalescing Operator', () => {
        test('should return left value when not null/undefined', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: 10 } });
            assert.strictEqual(evaluator.evaluate('x ?? 20').value, 10);
        });

        test('should return right value when left is null', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: null } });
            assert.strictEqual(evaluator.evaluate('x ?? 20').value, 20);
        });

        test('should return right value when left is undefined', () => {
            const evaluator = new SafeExpressionEvaluator({ variables: { x: undefined } });
            assert.strictEqual(evaluator.evaluate('x ?? 20').value, 20);
        });

        test('should not coalesce falsy non-null values', () => {
            const evaluator = new SafeExpressionEvaluator();
            assert.strictEqual(evaluator.evaluate('0 ?? 20').value, 0);
            assert.strictEqual(evaluator.evaluate('"" ?? "default"').value, '');
            assert.strictEqual(evaluator.evaluate('false ?? true').value, false);
        });

        test('should chain null coalescing operators', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: { x: null, y: undefined, z: 42 }
            });
            assert.strictEqual(evaluator.evaluate('x ?? y ?? z ?? 100').value, 42);
        });

        test('should short-circuit evaluation', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: { value: 10 }
            });
            // If value is not null, the right side should not be evaluated
            assert.strictEqual(evaluator.evaluate('value ?? unknownVar').value, 10);
        });
    });

    describe('Additional Built-in Functions', () => {
        describe('parseInt', () => {
            test('should parse integer from string', () => {
                const evaluator = new SafeExpressionEvaluator();
                assert.strictEqual(evaluator.evaluate('parseInt("42")').value, 42);
                assert.strictEqual(evaluator.evaluate('parseInt("3.14")').value, 3);
            });

            test('should support radix parameter', () => {
                const evaluator = new SafeExpressionEvaluator();
                assert.strictEqual(evaluator.evaluate('parseInt("10", 2)').value, 2);
                assert.strictEqual(evaluator.evaluate('parseInt("FF", 16)').value, 255);
            });
        });

        describe('parseFloat', () => {
            test('should parse float from string', () => {
                const evaluator = new SafeExpressionEvaluator();
                assert.strictEqual(evaluator.evaluate('parseFloat("3.14")').value, 3.14);
                assert.strictEqual(evaluator.evaluate('parseFloat("42")').value, 42);
            });
        });

        describe('toFixed', () => {
            test('should format number to fixed decimal places', () => {
                const evaluator = new SafeExpressionEvaluator({ variables: { pi: 3.14159 } });
                assert.strictEqual(evaluator.evaluate('toFixed(pi, 2)').value, '3.14');
                assert.strictEqual(evaluator.evaluate('toFixed(pi, 4)').value, '3.1416');
            });
        });

        describe('String functions', () => {
            test('should call replaceAll function', () => {
                const evaluator = new SafeExpressionEvaluator();
                assert.strictEqual(
                    evaluator.evaluate('replaceAll("hello world hello", "hello", "hi")').value,
                    'hi world hi'
                );
            });

            test('should call indexOf function', () => {
                const evaluator = new SafeExpressionEvaluator();
                assert.strictEqual(evaluator.evaluate('indexOf("hello", "l")').value, 2);
                assert.strictEqual(evaluator.evaluate('indexOf("hello", "x")').value, -1);
            });

            test('should call lastIndexOf function', () => {
                const evaluator = new SafeExpressionEvaluator();
                assert.strictEqual(evaluator.evaluate('lastIndexOf("hello", "l")').value, 3);
            });

            test('should call slice function', () => {
                const evaluator = new SafeExpressionEvaluator();
                assert.strictEqual(evaluator.evaluate('slice("hello", 1, 4)').value, 'ell');
                assert.strictEqual(evaluator.evaluate('slice("hello", -3)').value, 'llo');
            });
        });
    });

    describe('Array Operations', () => {
        describe('map', () => {
            test('should transform array elements', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3] }
                });
                evaluator.registerFunction('double', (x: number) => x * 2);
                const result = evaluator.evaluate('map(numbers, double)');
                assert.deepStrictEqual(result.value, [2, 4, 6]);
            });
        });

        describe('filter', () => {
            test('should filter array elements', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3, 4, 5] }
                });
                evaluator.registerFunction('isEven', (x: number) => x % 2 === 0);
                const result = evaluator.evaluate('filter(numbers, isEven)');
                assert.deepStrictEqual(result.value, [2, 4]);
            });
        });

        describe('find', () => {
            test('should find first matching element', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3, 4, 5] }
                });
                evaluator.registerFunction('greaterThan3', (x: number) => x > 3);
                const result = evaluator.evaluate('find(numbers, greaterThan3)');
                assert.strictEqual(result.value, 4);
            });

            test('should return undefined if no match', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3] }
                });
                evaluator.registerFunction('greaterThan10', (x: number) => x > 10);
                const result = evaluator.evaluate('find(numbers, greaterThan10)');
                assert.strictEqual(result.value, undefined);
            });
        });

        describe('reduce', () => {
            test('should reduce array to single value with initial', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3, 4] }
                });
                evaluator.registerFunction('sum', (acc: number, val: number) => acc + val);
                const result = evaluator.evaluate('reduce(numbers, sum, 0)');
                assert.strictEqual(result.value, 10);
            });

            test('should reduce array without initial value', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3, 4] }
                });
                evaluator.registerFunction('product', (acc: number, val: number) => acc * val);
                const result = evaluator.evaluate('reduce(numbers, product)');
                assert.strictEqual(result.value, 24);
            });
        });

        describe('some', () => {
            test('should return true if any element matches', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3, 4, 5] }
                });
                evaluator.registerFunction('greaterThan3', (x: number) => x > 3);
                const result = evaluator.evaluate('some(numbers, greaterThan3)');
                assert.strictEqual(result.value, true);
            });

            test('should return false if no element matches', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3] }
                });
                evaluator.registerFunction('greaterThan10', (x: number) => x > 10);
                const result = evaluator.evaluate('some(numbers, greaterThan10)');
                assert.strictEqual(result.value, false);
            });
        });

        describe('every', () => {
            test('should return true if all elements match', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [2, 4, 6] }
                });
                evaluator.registerFunction('isEven', (x: number) => x % 2 === 0);
                const result = evaluator.evaluate('every(numbers, isEven)');
                assert.strictEqual(result.value, true);
            });

            test('should return false if any element does not match', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [2, 3, 4] }
                });
                evaluator.registerFunction('isEven', (x: number) => x % 2 === 0);
                const result = evaluator.evaluate('every(numbers, isEven)');
                assert.strictEqual(result.value, false);
            });
        });

        describe('sort', () => {
            test('should sort array with default comparison', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [3, 1, 4, 1, 5] }
                });
                const result = evaluator.evaluate('sort(numbers)');
                assert.deepStrictEqual(result.value, [1, 1, 3, 4, 5]);
            });

            test('should sort array with custom comparator', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [3, 1, 4, 1, 5] }
                });
                evaluator.registerFunction('descending', (a: number, b: number) => b - a);
                const result = evaluator.evaluate('sort(numbers, descending)');
                assert.deepStrictEqual(result.value, [5, 4, 3, 1, 1]);
            });
        });

        describe('reverse', () => {
            test('should reverse array', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3, 4, 5] }
                });
                const result = evaluator.evaluate('reverse(numbers)');
                assert.deepStrictEqual(result.value, [5, 4, 3, 2, 1]);
            });
        });

        describe('flat', () => {
            test('should flatten nested array', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { nested: [[1, 2], [3, 4], [5]] }
                });
                const result = evaluator.evaluate('flat(nested)');
                assert.deepStrictEqual(result.value, [1, 2, 3, 4, 5]);
            });

            test('should flatten with custom depth', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { nested: [[[1]], [[2]], [[3]]] }
                });
                const result = evaluator.evaluate('flat(nested, 2)');
                assert.deepStrictEqual(result.value, [1, 2, 3]);
            });
        });

        describe('flatMap', () => {
            test('should map and flatten array', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { numbers: [1, 2, 3] }
                });
                evaluator.registerFunction('duplicate', (x: number) => [x, x]);
                const result = evaluator.evaluate('flatMap(numbers, duplicate)');
                assert.deepStrictEqual(result.value, [1, 1, 2, 2, 3, 3]);
            });
        });

        describe('Array manipulation', () => {
            test('should push elements', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { arr: [1, 2, 3] }
                });
                const result = evaluator.evaluate('push(arr, 4, 5)');
                assert.deepStrictEqual(result.value, [1, 2, 3, 4, 5]);
            });

            test('should pop element', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { arr: [1, 2, 3] }
                });
                const result = evaluator.evaluate('pop(arr)');
                assert.deepStrictEqual(result.value, [1, 2]);
            });

            test('should shift element', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { arr: [1, 2, 3] }
                });
                const result = evaluator.evaluate('shift(arr)');
                assert.deepStrictEqual(result.value, [2, 3]);
            });

            test('should unshift elements', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { arr: [3, 4, 5] }
                });
                const result = evaluator.evaluate('unshift(arr, 1, 2)');
                assert.deepStrictEqual(result.value, [1, 2, 3, 4, 5]);
            });

            test('should slice array', () => {
                const evaluator = new SafeExpressionEvaluator({
                    variables: { arr: [1, 2, 3, 4, 5] }
                });
                const result = evaluator.evaluate('slice(arr, 1, 4)');
                assert.deepStrictEqual(result.value, [2, 3, 4]);
            });
        });

        describe('Error handling', () => {
            test('should throw error when map is called on non-array', () => {
                const evaluator = new SafeExpressionEvaluator({ variables: { notArray: 'string' } });
                evaluator.registerFunction('identity', (x: any) => x);
                const result = evaluator.evaluate('map(notArray, identity)');
                assert.ok(result.error);
                assert.ok(result.error.includes('requires an array'));
            });

            test('should throw error when filter is called on non-array', () => {
                const evaluator = new SafeExpressionEvaluator({ variables: { notArray: 42 } });
                evaluator.registerFunction('identity', (x: any) => x);
                const result = evaluator.evaluate('filter(notArray, identity)');
                assert.ok(result.error);
                assert.ok(result.error.includes('requires an array'));
            });
        });
    });

    describe('Real-world Use Cases', () => {
        test('should validate trading order parameters', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    orderType: 'limit',
                    price: 100,
                    quantity: 10,
                    maxQuantity: 100
                }
            });

            const validType = evaluator.evaluate('orderType == "limit" || orderType == "market"');
            assert.strictEqual(validType.value, true);

            const validQuantity = evaluator.evaluate('quantity > 0 && quantity <= maxQuantity');
            assert.strictEqual(validQuantity.value, true);

            const needsPrice = evaluator.evaluate('orderType == "limit" ? price > 0 : true');
            assert.strictEqual(needsPrice.value, true);
        });

        test('should calculate order total', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    items: [
                        { price: 10.5, quantity: 2 },
                        { price: 5.25, quantity: 4 }
                    ]
                }
            });

            const item1Total = evaluator.evaluate('items[0].price * items[0].quantity');
            const item2Total = evaluator.evaluate('items[1].price * items[1].quantity');

            assert.strictEqual(item1Total.value, 21);
            assert.strictEqual(item2Total.value, 21);
        });

        test('should format user display string', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    user: {
                        firstName: 'john',
                        lastName: 'doe',
                        role: 'admin'
                    }
                }
            });

            const displayName = evaluator.evaluate(
                'concat(toUpperCase(substring(user.firstName, 0, 1)), substring(user.firstName, 1), " ", toUpperCase(substring(user.lastName, 0, 1)), substring(user.lastName, 1))'
            );
            assert.strictEqual(displayName.value, 'John Doe');
        });

        test('should validate API response structure', () => {
            const evaluator = new SafeExpressionEvaluator({
                variables: {
                    response: {
                        status: 'success',
                        data: [1, 2, 3],
                        metadata: { count: 3 }
                    }
                }
            });

            const isValid = evaluator.evaluate(
                'response.status == "success" && isArray(response.data) && response.data.length > 0'
            );
            assert.strictEqual(isValid.value, true);
        });
    });
});
