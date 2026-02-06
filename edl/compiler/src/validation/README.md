# Parameter Validation Module

This module provides utilities for validating parameters with dependencies and conditional requirements.

## Features

- Parameter dependency validation
- Conditional required fields (required_if)
- Topological sorting of parameter dependencies
- Type validation
- Range validation (min/max for numbers)
- String validation (minLength/maxLength/pattern)
- Enum validation
- Custom validation expressions

## API

### validateParameterDependencies

Validates all parameters against their definitions, checking:
- Required parameters
- Conditional requirements (required_if)
- Dependencies between parameters
- Type constraints
- Value constraints

```typescript
import { validateParameterDependencies } from './validation';

const params = {
  type: 'limit',
  side: 'buy',
  amount: 100,
  price: 50000
};

const definitions = {
  type: {
    type: 'string',
    required: true,
    enum: ['market', 'limit', 'stop']
  },
  price: {
    type: 'number',
    required_if: "type == 'limit'",
    min: 0
  },
  amount: {
    type: 'number',
    required: true,
    min: 0
  }
};

const errors = validateParameterDependencies(params, definitions);
```

### resolveParameterDependencyOrder

Performs topological sort on parameters based on their dependencies.

```typescript
import { resolveParameterDependencyOrder } from './validation';

const definitions = {
  total: {
    type: 'number',
    dependencies: ['price', 'amount']
  },
  price: {
    type: 'number',
    required: true
  },
  amount: {
    type: 'number',
    required: true
  }
};

const order = resolveParameterDependencyOrder(definitions);
// Returns: ['price', 'amount', 'total']
```

### checkConditionalRequired

Evaluates required_if expressions to determine if a parameter should be required.

```typescript
import { checkConditionalRequired } from './validation';

const definition = {
  type: 'number',
  required_if: "type == 'limit'"
};

const params = { type: 'limit' };

const isRequired = checkConditionalRequired('price', null, definition, params);
// Returns: true
```

### validateParameterValue

Validates a single parameter value against its definition.

```typescript
import { validateParameterValue } from './validation';

const definition = {
  type: 'string',
  minLength: 3,
  maxLength: 10,
  pattern: '^[A-Z]+$'
};

const error = validateParameterValue('BTC', definition);
// Returns: null (valid)

const error2 = validateParameterValue('btc', definition);
// Returns: { path: '', message: 'Value does not match pattern...', severity: 'error' }
```

## Validation Rules

### Type Validation

Supported types:
- `string`
- `int`, `integer`
- `float`, `number`
- `bool`, `boolean`
- `timestamp`, `timestamp_ms`, `timestamp_ns`
- `object`
- `array`

### Numeric Validation

- `min`: Minimum value (inclusive)
- `max`: Maximum value (inclusive)

```json
{
  "amount": {
    "type": "number",
    "min": 0,
    "max": 1000000
  }
}
```

### String Validation

- `minLength`: Minimum string length
- `maxLength`: Maximum string length
- `pattern`: Regular expression pattern

```json
{
  "symbol": {
    "type": "string",
    "minLength": 3,
    "maxLength": 20,
    "pattern": "^[A-Z]+/[A-Z]+$"
  }
}
```

### Enum Validation

```json
{
  "side": {
    "type": "string",
    "enum": ["buy", "sell"]
  }
}
```

### Conditional Requirements

The `required_if` field supports simple expressions:

```json
{
  "price": {
    "type": "number",
    "required_if": "type == 'limit' || type == 'stopLimit'"
  }
}
```

Supported operators:
- `==`, `!=`: Equality
- `&&`, `||`: Logical AND/OR
- Variable references

### Custom Validation

The `validate` field supports expressions with `value` as the parameter:

```json
{
  "leverage": {
    "type": "number",
    "validate": "value >= 1 && value <= 100 && value % 1 === 0"
  }
}
```

### Dependencies

Parameters can declare dependencies on other parameters:

```json
{
  "stopPrice": {
    "type": "number",
    "dependencies": ["type"],
    "required_if": "type == 'stop'"
  }
}
```

## Expression Evaluation

The expression evaluator is designed to be safe and limited:

- No access to global scope
- Only safe operators allowed
- Parameters are substituted with their actual values
- String values are properly escaped
- Null/undefined values are handled safely

### Supported Operators

- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Property access: `.` (for value validation expressions)
