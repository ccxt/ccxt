# Array Operations Syntax

This document describes the syntax for array operations in the Exchange Definition Language (EDL).

## Overview

Array operations provide functional programming capabilities for transforming and processing arrays in EDL expressions. All operations are safe, deterministic, and cannot execute arbitrary code.

## Lambda Expressions

Lambda expressions are anonymous functions used in array operations. They define parameters and a body expression.

### Single Parameter Lambda

```json
{
  "param": "x",
  "body": "x.price"
}
```

Equivalent to JavaScript: `x => x.price`

### Multiple Parameter Lambda

```json
{
  "params": ["acc", "item"],
  "body": {
    "op": "add",
    "left": "acc",
    "right": "item.price"
  }
}
```

Equivalent to JavaScript: `(acc, item) => acc + item.price`

### Lambda Expression Schema

- **param** (string, optional): Single parameter name (use this OR params, not both)
- **params** (string[], optional): Array of parameter names for multi-parameter lambdas
- **body** (computeExpression, required): Expression evaluated with parameters in scope

## Array Operations

### Map Operation

Transform each element of an array.

```json
{
  "op": "map",
  "array": "response.items",
  "transform": {
    "param": "x",
    "body": "x.price"
  }
}
```

**Fields:**
- **op**: `"map"`
- **array**: Expression that evaluates to an array
- **transform**: Lambda expression to transform each element

**Example Use Cases:**
- Extract specific fields from objects: `map(orders, o => o.id)`
- Convert data types: `map(prices, p => parseNumber(p))`
- Apply computations: `map(items, i => i.price * i.quantity)`

### Filter Operation

Select elements that match a predicate.

```json
{
  "op": "filter",
  "array": "response.orders",
  "predicate": {
    "param": "order",
    "body": {
      "op": "eq",
      "left": "order.status",
      "right": "open"
    }
  }
}
```

**Fields:**
- **op**: `"filter"`
- **array**: Expression that evaluates to an array
- **predicate**: Lambda expression that returns boolean (true to keep element)

**Example Use Cases:**
- Filter by status: `filter(orders, o => o.status == "open")`
- Remove nulls: `filter(items, i => i != null)`
- Price range: `filter(trades, t => t.price > 100 && t.price < 200)`

### Reduce Operation

Accumulate values into a single result.

```json
{
  "op": "reduce",
  "array": "response.trades",
  "reducer": {
    "params": ["acc", "trade"],
    "body": {
      "op": "add",
      "left": "acc",
      "right": "trade.amount"
    }
  },
  "initial": 0
}
```

**Fields:**
- **op**: `"reduce"`
- **array**: Expression that evaluates to an array
- **reducer**: Lambda with two parameters (accumulator, current item)
- **initial**: Initial value for the accumulator

**Example Use Cases:**
- Sum values: `reduce(trades, (sum, t) => sum + t.amount, 0)`
- Find maximum: `reduce(prices, (max, p) => p > max ? p : max, 0)`
- Build objects: `reduce(items, (obj, i) => assign(obj, {[i.id]: i.value}), {})`

### Slice Operation

Extract a subarray by index range.

```json
{
  "op": "slice",
  "array": "response.items",
  "start": 0,
  "end": 10
}
```

**With step (every nth element):**
```json
{
  "op": "slice",
  "array": "response.candles",
  "start": 0,
  "end": 100,
  "step": 5
}
```

**Fields:**
- **op**: `"slice"`
- **array**: Expression that evaluates to an array
- **start** (integer, required): Start index (inclusive)
- **end** (integer, optional): End index (exclusive)
- **step** (integer, optional): Step size (default: 1)

**Example Use Cases:**
- First N elements: `slice(items, 0, 10)`
- Skip first N: `slice(items, 10)`
- Every Nth element: `slice(candles, 0, 1000, 10)`

### FlatMap Operation

Transform each element and flatten the results.

```json
{
  "op": "flatMap",
  "array": "response.groups",
  "transform": {
    "param": "group",
    "body": "group.items"
  }
}
```

**Fields:**
- **op**: `"flatMap"`
- **array**: Expression that evaluates to an array
- **transform**: Lambda that returns an array for each element

**Example Use Cases:**
- Flatten nested arrays: `flatMap(groups, g => g.items)`
- Extract multiple values: `flatMap(orders, o => [o.fills])`
- Conditional flattening: `flatMap(items, i => i.valid ? [i] : [])`

## Nested Operations

Array operations can be nested to create complex transformations:

```json
{
  "op": "reduce",
  "array": {
    "op": "filter",
    "array": {
      "op": "map",
      "array": "response.trades",
      "transform": {
        "param": "t",
        "body": {
          "price": "t.price",
          "amount": "t.amount",
          "total": {
            "op": "multiply",
            "left": "t.price",
            "right": "t.amount"
          }
        }
      }
    },
    "predicate": {
      "param": "t",
      "body": {
        "op": "gt",
        "left": "t.total",
        "right": 1000
      }
    }
  },
  "reducer": {
    "params": ["sum", "t"],
    "body": {
      "op": "add",
      "left": "sum",
      "right": "t.total"
    }
  },
  "initial": 0
}
```

This example:
1. Maps trades to compute totals
2. Filters for trades > $1000
3. Reduces to sum all filtered totals

## Examples

### Extract Prices from Orders

```json
{
  "op": "map",
  "array": "response.orders",
  "transform": {
    "param": "order",
    "body": "order.price"
  }
}
```

### Filter Open Orders and Get IDs

```json
{
  "op": "map",
  "array": {
    "op": "filter",
    "array": "response.orders",
    "predicate": {
      "param": "o",
      "body": {
        "op": "eq",
        "left": "o.status",
        "right": "open"
      }
    }
  },
  "transform": {
    "param": "o",
    "body": "o.id"
  }
}
```

### Calculate Total Volume

```json
{
  "op": "reduce",
  "array": "response.trades",
  "reducer": {
    "params": ["total", "trade"],
    "body": {
      "op": "add",
      "left": "total",
      "right": {
        "op": "multiply",
        "left": "trade.price",
        "right": "trade.amount"
      }
    }
  },
  "initial": 0
}
```

### Pagination: Get Items 20-30

```json
{
  "op": "slice",
  "array": "response.items",
  "start": 20,
  "end": 30
}
```

### Flatten Order Book Levels

```json
{
  "op": "flatMap",
  "array": "response.orderbook",
  "transform": {
    "param": "side",
    "body": "side.levels"
  }
}
```

## Type Safety

All array operations are type-safe:

- Operations validate their inputs at parse time
- Lambda parameters are scoped correctly
- Nested operations maintain type consistency
- No arbitrary code execution is possible

## Validation Rules

### Lambda Expression Validation

- Must have either `param` or `params`, but not both
- Parameters must be strings
- Body expression is required

### Array Operation Validation

- `map` and `flatMap` require a `transform` lambda
- `filter` requires a `predicate` lambda
- `reduce` requires a `reducer` lambda (with 2 parameters) and an `initial` value
- `slice` requires a numeric `start` index
- `slice` optional `end` and `step` must be numbers if provided

## Integration with EDL

Array operations integrate seamlessly with other EDL expression types:

### In Field Mappings

```yaml
parsers:
  ticker:
    source: response
    mapping:
      prices:
        compute:
          op: map
          array: data.tickers
          transform:
            param: t
            body: t.last
```

### In Conditionals

```json
{
  "if": {
    "op": "gt",
    "left": {
      "call": "length",
      "args": [
        {
          "op": "filter",
          "array": "orders",
          "predicate": {
            "param": "o",
            "body": {
              "op": "eq",
              "left": "o.status",
              "right": "open"
            }
          }
        }
      ]
    },
    "right": 0
  },
  "then": "has_open_orders",
  "else": "no_orders"
}
```

### With Other Operations

```json
{
  "call": "join",
  "args": [
    {
      "op": "map",
      "array": "symbols",
      "transform": {
        "param": "s",
        "body": {
          "call": "uppercase",
          "args": ["s"]
        }
      }
    },
    ","
  ]
}
```

## Best Practices

1. **Keep lambdas simple**: Complex logic should be broken into multiple operations
2. **Use descriptive parameter names**: `item`, `order`, `trade` instead of `x`, `y`, `z`
3. **Prefer map+filter over complex reduces**: Easier to understand and debug
4. **Consider performance**: Nested operations can create intermediate arrays
5. **Validate inputs**: Use type operations to check array contents before processing

## Limitations

- Cannot modify original arrays (all operations return new arrays)
- Cannot access variables outside lambda scope
- Lambda parameters shadow outer variables with same names
- No recursive lambdas (would cause infinite loops)
- No side effects (cannot modify state or make API calls)
