# Conditional Mapping Syntax Examples

This document provides examples of how to use the conditional mapping syntax in EDL.

## Conditional Expressions (if/then/else)

### Simple Conditional
```typescript
{
  if: "status == 'active'",
  then: true,
  else: false
}
```

### Nested Conditionals
```typescript
{
  if: "price > 100",
  then: {
    if: "quantity > 10",
    then: "bulk",
    else: "normal"
  },
  else: "small"
}
```

### Conditional with Field Mapping
```typescript
{
  if: "response.success",
  then: { path: "data.value" },
  else: { literal: null }
}
```

### Conditional with Binary Expression
```typescript
{
  if: {
    op: "and",
    left: { op: "gt", left: "price", right: 100 },
    right: { op: "eq", left: "status", right: "active" }
  },
  then: "premium",
  else: "standard"
}
```

## Fallback Expressions

### Simple Fallback
```typescript
{
  value: "response.data",
  fallback: 0
}
```

### Nested Fallback
```typescript
{
  value: "response.data",
  fallback: {
    value: "response.default",
    fallback: 0
  }
}
```

### Fallback with Options
```typescript
{
  value: "response.data",
  fallback: "N/A",
  nullIsValid: false,
  emptyStringIsInvalid: true,
  zeroIsInvalid: false
}
```

## Coalesce Expressions

Returns the first non-null/non-undefined value:

```typescript
{
  coalesce: [
    "response.preferred",
    "response.alternate",
    "response.default",
    0
  ]
}
```

With null handling:
```typescript
{
  coalesce: ["response.data", "response.backup"],
  nullIsValid: true
}
```

## Switch Expressions

### Simple Switch
```typescript
{
  switch: "orderType",
  cases: {
    "market": 1,
    "limit": 2,
    "stop": 3
  },
  default: 0
}
```

### Switch with Complex Expressions
```typescript
{
  switch: "status",
  cases: {
    "FILLED": { literal: "closed" },
    "OPEN": { literal: "open" },
    "CANCELLED": { literal: "cancelled" }
  }
}
```

### Switch with Expression Mode
For range matching and comparisons:
```typescript
{
  switch: "price",
  cases: {
    "< 100": "cheap",
    ">= 100 && < 1000": "normal"
  },
  default: "expensive",
  matchMode: "expression"
}
```

## Pattern Match Expressions

Advanced pattern matching with regex and guards:

```typescript
{
  match: "orderStatus",
  patterns: [
    { pattern: /^PARTIAL/, result: "partially_filled" },
    { pattern: "FILLED", guard: "quantity > 0", result: "filled" },
    { pattern: "CANCELLED", result: "cancelled" }
  ],
  default: "unknown"
}
```

## Complex Examples

### Combining Multiple Constructs
```typescript
{
  if: {
    op: "and",
    left: { op: "gt", left: "price", right: 100 },
    right: { op: "eq", left: "status", right: "active" }
  },
  then: {
    switch: "orderType",
    cases: {
      "market": { value: "response.market", fallback: 0 },
      "limit": { value: "response.limit", fallback: 0 }
    },
    default: 0
  },
  else: {
    coalesce: ["response.fallback1", "response.fallback2", null]
  }
}
```

### Switch with Fallback in Cases
```typescript
{
  switch: "orderStatus",
  cases: {
    "OPEN": {
      value: "response.openPrice",
      fallback: 0
    },
    "FILLED": {
      value: "response.fillPrice",
      fallback: {
        value: "response.lastPrice",
        fallback: 0
      }
    }
  },
  default: null
}
```

## Use in Parser Definitions

Conditional mappings can be used in EDL parser definitions:

```json
{
  "parsers": {
    "order": {
      "source": "response",
      "mapping": {
        "status": {
          "conditional": {
            "if": "response.state == 1",
            "then": { "literal": "open" },
            "else": { "literal": "closed" }
          }
        },
        "price": {
          "value": "response.price",
          "fallback": 0
        },
        "type": {
          "switch": "response.orderType",
          "cases": {
            "0": { "literal": "market" },
            "1": { "literal": "limit" }
          },
          "default": { "literal": "unknown" }
        }
      }
    }
  }
}
```

## Match Modes

The `matchMode` option controls how switch expressions match values:

- **`exact`** (default): Uses strict equality (`===`)
- **`loose`**: Uses loose equality (`==`)
- **`expression`**: Evaluates case keys as expressions (for ranges, comparisons)

Example with expression mode:
```typescript
{
  switch: "volume",
  cases: {
    "< 1000": "low",
    ">= 1000 && < 10000": "medium",
    ">= 10000": "high"
  },
  matchMode: "expression"
}
```
