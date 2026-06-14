# Safe Expression Evaluator

A comprehensive, secure expression evaluator that supports mathematical operations, string functions, and type conversions without using JavaScript's `eval()`.

## Overview

The Safe Expression Evaluator provides a sandboxed environment for evaluating expressions with:

- **Security**: No arbitrary code execution, whitelist-only functions, blocked dangerous properties
- **Performance**: Configurable timeout and depth limits
- **Extensibility**: Support for custom functions and variables
- **Rich Built-ins**: Math, string, and type conversion functions

## Features

### Expression Support

- **Arithmetic Operations**: `+`, `-`, `*`, `/`, `%`
- **Comparison Operations**: `<`, `>`, `<=`, `>=`, `==`, `!=`
- **Logical Operations**: `&&`, `||`, `!`
- **Conditional (Ternary)**: `condition ? then : else`
- **Property Access**: `object.property`, `object['property']`
- **Array Indexing**: `array[index]`
- **Function Calls**: `functionName(arg1, arg2, ...)`
- **Nested Expressions**: Full support for complex nested expressions

### Built-in Functions

#### Math Functions
- `abs(x)` - Absolute value
- `ceil(x)` - Round up to nearest integer
- `floor(x)` - Round down to nearest integer
- `round(x)` - Round to nearest integer
- `min(...args)` - Minimum value
- `max(...args)` - Maximum value
- `pow(base, exponent)` - Power function
- `sqrt(x)` - Square root
- `add(...args)` - Sum all arguments
- `subtract(a, b)` - Subtract b from a
- `multiply(...args)` - Multiply all arguments
- `divide(a, b)` - Divide a by b
- `modulo(a, b)` - Remainder of a/b

#### String Functions
- `concat(...args)` - Concatenate strings
- `substring(str, start, end?)` - Extract substring
- `toLowerCase(str)` - Convert to lowercase
- `toUpperCase(str)` - Convert to uppercase
- `trim(str)` - Remove leading/trailing whitespace
- `split(str, separator)` - Split string into array
- `join(array, separator)` - Join array into string
- `replace(str, search, replace)` - Replace first occurrence
- `length(str|array)` - Get length
- `startsWith(str, search)` - Check if starts with string
- `endsWith(str, search)` - Check if ends with string
- `includes(str|array, search)` - Check if contains value

#### Type Conversion Functions
- `toString(value)` - Convert to string
- `toNumber(value)` - Convert to number
- `toBoolean(value)` - Convert to boolean

#### Type Checking Functions
- `isNull(value)` - Check if null
- `isUndefined(value)` - Check if undefined
- `isNumber(value)` - Check if number
- `isString(value)` - Check if string
- `isBoolean(value)` - Check if boolean
- `isArray(value)` - Check if array
- `isObject(value)` - Check if plain object

### Security Features

1. **Whitelist-only Functions**: Only registered functions can be called
2. **Blocked Dangerous Properties**:
   - `constructor` access is blocked
   - `prototype` access is blocked
   - `__proto__` access is blocked
3. **Depth Limit**: Prevents stack overflow from deep nesting (default: 100)
4. **Timeout**: Prevents infinite loops (default: 1000ms)
5. **No Eval**: No use of JavaScript's `eval()` or `Function()` constructor for user expressions

## Usage

### Basic Example

```typescript
import { SafeExpressionEvaluator } from './evaluation/expression-evaluator.js';

// Create evaluator with variables
const evaluator = new SafeExpressionEvaluator({
    variables: {
        price: 100,
        quantity: 5,
        discount: 0.1
    }
});

// Evaluate expression
const result = evaluator.evaluate('price * quantity * (1 - discount)');
console.log(result.value); // 450
console.log(result.type);  // 'number'
```

### Custom Functions

```typescript
const evaluator = new SafeExpressionEvaluator();

// Register a custom function
evaluator.registerFunction('double', (x: number) => x * 2);

const result = evaluator.evaluate('double(5) + 10');
console.log(result.value); // 20
```

### Variable Management

```typescript
const evaluator = new SafeExpressionEvaluator();

// Set variables dynamically
evaluator.setVariable('name', 'Alice');
evaluator.setVariable('age', 30);

const result = evaluator.evaluate('concat("Hello, ", name, "! Age: ", toString(age))');
console.log(result.value); // "Hello, Alice! Age: 30"
```

### Configuration Options

```typescript
const evaluator = new SafeExpressionEvaluator({
    variables: { x: 10, y: 20 },
    functions: {
        myFunc: (a, b) => a + b
    },
    maxDepth: 50,    // Maximum recursion depth
    timeout: 500     // Timeout in milliseconds
});
```

### Error Handling

```typescript
const evaluator = new SafeExpressionEvaluator();

const result = evaluator.evaluate('unknownVar + 10');

if (result.error) {
    console.error('Evaluation failed:', result.error);
} else {
    console.log('Result:', result.value);
}
```

## Examples

### Trading Order Validation

```typescript
const evaluator = new SafeExpressionEvaluator({
    variables: {
        orderType: 'limit',
        price: 100,
        quantity: 10,
        maxQuantity: 100
    }
});

// Validate order type
const validType = evaluator.evaluate(
    'orderType == "limit" || orderType == "market"'
);

// Validate quantity
const validQuantity = evaluator.evaluate(
    'quantity > 0 && quantity <= maxQuantity'
);

// Check if price is required
const needsPrice = evaluator.evaluate(
    'orderType == "limit" ? price > 0 : true'
);
```

### Data Transformation

```typescript
const evaluator = new SafeExpressionEvaluator({
    variables: {
        user: {
            firstName: 'john',
            lastName: 'doe'
        }
    }
});

// Format display name
const displayName = evaluator.evaluate(`
    concat(
        toUpperCase(substring(user.firstName, 0, 1)),
        substring(user.firstName, 1),
        " ",
        toUpperCase(substring(user.lastName, 0, 1)),
        substring(user.lastName, 1)
    )
`);
// Result: "John Doe"
```

### Complex Calculations

```typescript
const evaluator = new SafeExpressionEvaluator({
    variables: {
        items: [
            { price: 10.5, quantity: 2 },
            { price: 5.25, quantity: 4 }
        ],
        taxRate: 0.08
    }
});

// Calculate total with tax
const item1Total = evaluator.evaluate('items[0].price * items[0].quantity');
const item2Total = evaluator.evaluate('items[1].price * items[1].quantity');

evaluator.setVariable('subtotal', item1Total.value + item2Total.value);
const total = evaluator.evaluate('subtotal * (1 + taxRate)');
```

## API Reference

### ExpressionContext

```typescript
interface ExpressionContext {
    variables: Record<string, any>;      // Variables available in expressions
    functions: Record<string, Function>; // Custom functions
    maxDepth?: number;                   // Max recursion depth (default: 100)
    timeout?: number;                    // Timeout in ms (default: 1000)
}
```

### ExpressionResult

```typescript
interface ExpressionResult {
    value: any;      // The evaluated value
    type: string;    // Type of the value
    error?: string;  // Error message if evaluation failed
}
```

### SafeExpressionEvaluator

```typescript
class SafeExpressionEvaluator {
    constructor(context?: Partial<ExpressionContext>)

    evaluate(expression: string): ExpressionResult
    registerFunction(name: string, fn: Function): void
    setVariable(name: string, value: any): void
}
```

## Performance Considerations

1. **Depth Limit**: Deep nesting increases evaluation time. Use `maxDepth` to control.
2. **Timeout**: Set appropriate timeouts for your use case.
3. **Caching**: For repeated evaluations of the same expression, consider caching parsed AST.
4. **Variable Access**: Direct variable access is faster than property chains.

## Security Best Practices

1. **Validate Inputs**: Always validate user-provided variable values
2. **Limit Complexity**: Set appropriate `maxDepth` and `timeout` values
3. **Custom Functions**: Carefully vet custom functions for security
4. **Sanitize Strings**: Be cautious with user-provided string values
5. **Error Messages**: Don't expose sensitive information in error messages

## Testing

The evaluator includes comprehensive tests covering:
- All operators and built-in functions
- Security features
- Edge cases
- Real-world use cases

Run tests:
```bash
npm test expression-evaluator.test.ts
```

## Implementation Details

The evaluator works by:

1. **Tokenization**: Breaking the expression into tokens (numbers, strings, operators, etc.)
2. **Parsing**: Building an Abstract Syntax Tree (AST) using recursive descent parsing
3. **Execution**: Traversing the AST and evaluating nodes
4. **Security**: Checking depth and timeout limits, blocking dangerous property access

No use of `eval()` or `Function()` constructor ensures complete control over execution.
