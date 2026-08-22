# Safe Expression Evaluator - Quick Start

## Installation

The SafeExpressionEvaluator is already part of the EDL compiler. No additional installation needed.

## Basic Usage

```typescript
import { SafeExpressionEvaluator } from './evaluation/expression-evaluator.js';

// Create an evaluator
const evaluator = new SafeExpressionEvaluator();

// Evaluate a simple expression
const result = evaluator.evaluate('1 + 2 * 3');
console.log(result.value);  // 7
```

## Working with Variables

```typescript
const evaluator = new SafeExpressionEvaluator({
    variables: {
        price: 100,
        quantity: 5
    }
});

const total = evaluator.evaluate('price * quantity');
console.log(total.value);  // 500
```

## Using Built-in Functions

```typescript
const evaluator = new SafeExpressionEvaluator();

// Math functions
evaluator.evaluate('abs(-5)');           // 5
evaluator.evaluate('max(1, 5, 3)');      // 5
evaluator.evaluate('pow(2, 3)');         // 8

// String functions
evaluator.evaluate('concat("hello", " ", "world")');  // "hello world"
evaluator.evaluate('toUpperCase("test")');            // "TEST"

// Type checking
evaluator.evaluate('isNumber(42)');      // true
evaluator.evaluate('isString("hello")'); // true
```

## Custom Functions

```typescript
const evaluator = new SafeExpressionEvaluator();

evaluator.registerFunction('double', (x: number) => x * 2);
evaluator.registerFunction('greet', (name: string) => `Hello, ${name}!`);

evaluator.evaluate('double(5)');        // 10
evaluator.evaluate('greet("Alice")');   // "Hello, Alice!"
```

## Conditional Logic

```typescript
const evaluator = new SafeExpressionEvaluator({
    variables: { amount: 10 }
});

// Ternary operator
const result = evaluator.evaluate('amount > 0 ? "buy" : "sell"');
console.log(result.value);  // "buy"

// Complex conditions
evaluator.evaluate('amount >= 5 && amount <= 15 ? "valid" : "invalid"');
```

## Property Access

```typescript
const evaluator = new SafeExpressionEvaluator({
    variables: {
        user: {
            name: 'Alice',
            age: 30,
            orders: [
                { id: 1, total: 100 },
                { id: 2, total: 200 }
            ]
        }
    }
});

// Dot notation
evaluator.evaluate('user.name');              // "Alice"

// Nested access
evaluator.evaluate('user.orders[0].total');   // 100

// Bracket notation
evaluator.evaluate('user["name"]');           // "Alice"
```

## Error Handling

```typescript
const evaluator = new SafeExpressionEvaluator();

const result = evaluator.evaluate('unknownVar + 10');

if (result.error) {
    console.error('Error:', result.error);
    // "Error: Undefined variable: unknownVar"
} else {
    console.log('Result:', result.value);
}
```

## Security Configuration

```typescript
const evaluator = new SafeExpressionEvaluator({
    maxDepth: 50,      // Limit recursion depth
    timeout: 500       // Timeout in milliseconds
});

// This will timeout if it takes too long
const result = evaluator.evaluate('longRunningFunction()');
```

## Real-World Example: Order Validation

```typescript
const evaluator = new SafeExpressionEvaluator({
    variables: {
        orderType: 'limit',
        side: 'buy',
        price: 100,
        quantity: 10,
        balance: 2000
    }
});

// Register validation functions
evaluator.registerFunction('hasEnoughBalance', (price: number, qty: number, balance: number) => {
    return (price * qty) <= balance;
});

// Validate order type
const validType = evaluator.evaluate(
    'orderType == "market" || orderType == "limit"'
);

// Validate price for limit orders
const validPrice = evaluator.evaluate(
    'orderType == "limit" ? price > 0 : true'
);

// Check balance
const hasBalance = evaluator.evaluate(
    'hasEnoughBalance(price, quantity, balance)'
);

console.log({
    validType: validType.value,      // true
    validPrice: validPrice.value,    // true
    hasBalance: hasBalance.value     // true (100 * 10 = 1000 <= 2000)
});
```

## Available Built-in Functions

### Math (13 functions)
`abs`, `ceil`, `floor`, `round`, `min`, `max`, `pow`, `sqrt`, `add`, `subtract`, `multiply`, `divide`, `modulo`

### String (11 functions)
`concat`, `substring`, `toLowerCase`, `toUpperCase`, `trim`, `split`, `join`, `replace`, `length`, `startsWith`, `endsWith`, `includes`

### Type Conversion (3 functions)
`toString`, `toNumber`, `toBoolean`

### Type Checking (7 functions)
`isNull`, `isUndefined`, `isNumber`, `isString`, `isBoolean`, `isArray`, `isObject`

## Next Steps

- Read the full [API Documentation](./README.md)
- See [Integration Examples](./INTEGRATION_EXAMPLE.md)
- Check [Feature Summary](./FEATURES_SUMMARY.md)
