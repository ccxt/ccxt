# Safe Expression Operations Documentation

This document describes the allowed operations for safe expression evaluation in the EDL (Exchange Definition Language) compiler. These operations ensure that no arbitrary code execution is possible while providing sufficient functionality for data transformation and computation.

## Overview

The operations system provides a predefined set of safe, deterministic functions that can be used in `compute` expressions within EDL files. All operations are:

- **Safe**: No code injection or execution of arbitrary code
- **Deterministic**: Same inputs always produce same outputs
- **Type-safe**: TypeScript type definitions ensure correct usage
- **Sandboxed**: Only whitelisted operations are available

## Operation Categories

### Math Operations

Mathematical operations for numeric computations.

| Operation | Signature | Description | Example |
|-----------|-----------|-------------|---------|
| `add` | `(a: number, b: number) => number` | Addition | `{ op: "+", left: 10, right: 5 }` → 15 |
| `subtract` | `(a: number, b: number) => number` | Subtraction | `{ op: "-", left: 10, right: 5 }` → 5 |
| `multiply` | `(a: number, b: number) => number` | Multiplication | `{ op: "*", left: 10, right: 5 }` → 50 |
| `divide` | `(a: number, b: number) => number` | Division | `{ op: "/", left: 10, right: 5 }` → 2 |
| `mod` | `(a: number, b: number) => number` | Modulo | `{ op: "%", left: 10, right: 3 }` → 1 |
| `pow` | `(a: number, b: number) => number` | Power | `{ call: "pow", args: [2, 3] }` → 8 |
| `abs` | `(n: number) => number` | Absolute value | `{ call: "abs", args: [-5] }` → 5 |
| `floor` | `(n: number) => number` | Floor | `{ call: "floor", args: [3.7] }` → 3 |
| `ceil` | `(n: number) => number` | Ceiling | `{ call: "ceil", args: [3.2] }` → 4 |
| `round` | `(n: number) => number` | Round | `{ call: "round", args: [3.5] }` → 4 |
| `min` | `(...args: number[]) => number` | Minimum | `{ call: "min", args: [3, 1, 4] }` → 1 |
| `max` | `(...args: number[]) => number` | Maximum | `{ call: "max", args: [3, 1, 4] }` → 4 |
| `sqrt` | `(n: number) => number` | Square root | `{ call: "sqrt", args: [16] }` → 4 |

### String Operations

String manipulation operations.

| Operation | Signature | Description | Example |
|-----------|-----------|-------------|---------|
| `concat` | `(...args: string[]) => string` | Concatenate strings | `{ call: "concat", args: ["hello", " ", "world"] }` |
| `substring` | `(str: string, start: number, end?: number) => string` | Extract substring | `{ call: "substring", args: ["hello", 1, 4] }` → "ell" |
| `lowercase` | `(str: string) => string` | Convert to lowercase | `{ call: "lowercase", args: ["HELLO"] }` → "hello" |
| `uppercase` | `(str: string) => string` | Convert to uppercase | `{ call: "uppercase", args: ["hello"] }` → "HELLO" |
| `trim` | `(str: string) => string` | Trim whitespace | `{ call: "trim", args: ["  hello  "] }` → "hello" |
| `split` | `(str: string, sep: string) => string[]` | Split string | `{ call: "split", args: ["a,b,c", ","] }` → ["a","b","c"] |
| `join` | `(arr: string[], sep: string) => string` | Join array | `{ call: "join", args: [["a","b"], ","] }` → "a,b" |
| `replace` | `(str: string, search: string, replacement: string) => string` | Replace text | `{ call: "replace", args: ["hello", "l", "r"] }` |
| `indexOf` | `(str: string, search: string) => number` | Find index | `{ call: "indexOf", args: ["hello", "l"] }` → 2 |
| `length` | `(str: string) => number` | String length | `{ call: "length", args: ["hello"] }` → 5 |
| `startsWith` | `(str: string, search: string) => boolean` | Starts with check | `{ call: "startsWith", args: ["hello", "he"] }` → true |
| `endsWith` | `(str: string, search: string) => boolean` | Ends with check | `{ call: "endsWith", args: ["hello", "lo"] }` → true |
| `includes` | `(str: string, search: string) => boolean` | Contains check | `{ call: "includes", args: ["hello", "ll"] }` → true |

### Comparison Operations

Comparison and logical operations.

| Operation | Signature | Description | Example |
|-----------|-----------|-------------|---------|
| `eq` | `(a: any, b: any) => boolean` | Equal | `{ op: "==", left: 5, right: 5 }` → true |
| `ne` | `(a: any, b: any) => boolean` | Not equal | `{ op: "!=", left: 5, right: 3 }` → true |
| `gt` | `(a: any, b: any) => boolean` | Greater than | `{ op: ">", left: 5, right: 3 }` → true |
| `lt` | `(a: any, b: any) => boolean` | Less than | `{ op: "<", left: 3, right: 5 }` → true |
| `gte` | `(a: any, b: any) => boolean` | Greater or equal | `{ op: ">=", left: 5, right: 5 }` → true |
| `lte` | `(a: any, b: any) => boolean` | Less or equal | `{ op: "<=", left: 5, right: 5 }` → true |
| `and` | `(a: boolean, b: boolean) => boolean` | Logical AND | `{ op: "&&", left: true, right: false }` → false |
| `or` | `(a: boolean, b: boolean) => boolean` | Logical OR | `{ op: "||", left: true, right: false }` → true |
| `not` | `(a: boolean) => boolean` | Logical NOT | `{ call: "not", args: [true] }` → false |

### Type Operations

Type conversion and checking.

| Operation | Signature | Description | Example |
|-----------|-----------|-------------|---------|
| `parseNumber` | `(value: any) => number` | Parse to number | `{ call: "parseNumber", args: ["42"] }` → 42 |
| `parseString` | `(value: any) => string` | Parse to string | `{ call: "parseString", args: [42] }` → "42" |
| `parseBoolean` | `(value: any) => boolean` | Parse to boolean | `{ call: "parseBoolean", args: [1] }` → true |
| `toString` | `(value: any) => string` | Convert to string | `{ call: "toString", args: [42] }` → "42" |
| `toNumber` | `(value: any) => number` | Convert to number | `{ call: "toNumber", args: ["42"] }` → 42 |
| `isNumber` | `(value: any) => boolean` | Check if number | `{ call: "isNumber", args: [42] }` → true |
| `isString` | `(value: any) => boolean` | Check if string | `{ call: "isString", args: ["hi"] }` → true |
| `isBoolean` | `(value: any) => boolean` | Check if boolean | `{ call: "isBoolean", args: [true] }` → true |
| `isNull` | `(value: any) => boolean` | Check if null | `{ call: "isNull", args: [null] }` → true |
| `isUndefined` | `(value: any) => boolean` | Check if undefined | `{ call: "isUndefined", args: [undefined] }` → true |

### Date Operations

Date and timestamp operations.

| Operation | Signature | Description | Example |
|-----------|-----------|-------------|---------|
| `now` | `() => number` | Current timestamp (ms) | `{ call: "now", args: [] }` → 1700000000000 |
| `timestamp` | `() => number` | Current timestamp (s) | `{ call: "timestamp", args: [] }` → 1700000000 |
| `iso8601` | `(timestamp: number) => string` | Format as ISO8601 | `{ call: "iso8601", args: [1700000000000] }` |
| `parseTimestamp` | `(dateString: string) => number` | Parse date string | `{ call: "parseTimestamp", args: ["2023-01-01"] }` |
| `timestampMs` | `(timestamp: number) => number` | Convert to milliseconds | `{ call: "timestampMs", args: [1700000000] }` |
| `timestampUs` | `(timestamp: number) => number` | Convert to microseconds | `{ call: "timestampUs", args: [1700000000] }` |
| `timestampNs` | `(timestamp: number) => number` | Convert to nanoseconds | `{ call: "timestampNs", args: [1700000000] }` |

### Array Operations

Array manipulation operations.

| Operation | Signature | Description | Example |
|-----------|-----------|-------------|---------|
| `map` | `<T, U>(arr: T[], fn: (item: T) => U) => U[]` | Map array | See note below |
| `filter` | `<T>(arr: T[], fn: (item: T) => boolean) => T[]` | Filter array | See note below |
| `find` | `<T>(arr: T[], fn: (item: T) => boolean) => T \| undefined` | Find element | See note below |
| `first` | `<T>(arr: T[]) => T \| undefined` | First element | `{ call: "first", args: [[1,2,3]] }` → 1 |
| `last` | `<T>(arr: T[]) => T \| undefined` | Last element | `{ call: "last", args: [[1,2,3]] }` → 3 |
| `length` | `<T>(arr: T[]) => number` | Array length | `{ call: "length", args: [[1,2,3]] }` → 3 |
| `slice` | `<T>(arr: T[], start: number, end?: number) => T[]` | Slice array | `{ call: "slice", args: [[1,2,3], 1] }` → [2,3] |
| `includes` | `<T>(arr: T[], value: T) => boolean` | Contains check | `{ call: "includes", args: [[1,2], 2] }` → true |
| `indexOf` | `<T>(arr: T[], value: T) => number` | Find index | `{ call: "indexOf", args: [[1,2], 2] }` → 1 |
| `concat` | `<T>(...arrays: T[][]) => T[]` | Concatenate arrays | `{ call: "concat", args: [[1], [2]] }` → [1,2] |
| `join` | `<T>(arr: T[], sep: string) => string` | Join to string | `{ call: "join", args: [[1,2], ","] }` → "1,2" |
| `reverse` | `<T>(arr: T[]) => T[]` | Reverse array | `{ call: "reverse", args: [[1,2,3]] }` → [3,2,1] |
| `sort` | `<T>(arr: T[]) => T[]` | Sort array | `{ call: "sort", args: [[3,1,2]] }` → [1,2,3] |

> Note: `map`, `filter`, and `find` operations that take function arguments will be supported in a future phase with expression closures.

### Object Operations

Object manipulation operations.

| Operation | Signature | Description | Example |
|-----------|-----------|-------------|---------|
| `get` | `<T>(obj: Record<string, T>, key: string) => T \| undefined` | Get property | `{ call: "get", args: [{"a": 1}, "a"] }` → 1 |
| `has` | `(obj: Record<string, any>, key: string) => boolean` | Has property | `{ call: "has", args: [{"a": 1}, "a"] }` → true |
| `keys` | `(obj: Record<string, any>) => string[]` | Object keys | `{ call: "keys", args: [{"a": 1, "b": 2}] }` → ["a","b"] |
| `values` | `<T>(obj: Record<string, T>) => T[]` | Object values | `{ call: "values", args: [{"a": 1, "b": 2}] }` → [1,2] |
| `entries` | `<T>(obj: Record<string, T>) => [string, T][]` | Object entries | `{ call: "entries", args: [{"a": 1}] }` → [["a",1]] |
| `assign` | `<T>(...objects: Partial<T>[]) => T` | Merge objects | `{ call: "assign", args: [{"a": 1}, {"b": 2}] }` |
| `merge` | `<T>(...objects: Partial<T>[]) => T` | Merge objects | Same as assign |

## Usage in EDL Files

### Basic Binary Operations

```yaml
compute:
  op: "*"
  left: "$price"
  right: "$amount"
```

### Function Calls

```yaml
compute:
  call: this.iso8601
  args: ["$timestamp"]
```

### Conditional Expressions

```yaml
compute:
  if:
    op: ">"
    left: "$filled"
    right: 0
  then:
    op: "/"
    left: "$cost"
    right: "$filled"
  else: null
```

### Switch Expressions

```yaml
compute:
  switch: "$orderData.descr.ordertype"
  cases:
    "stop-loss": { path: "$orderData.descr.price" }
    "take-profit": { path: "$orderData.descr.price2" }
  default: null
```

### Nested Operations

```yaml
compute:
  op: "+"
  left:
    op: "*"
    left: "$price"
    right: "$amount"
  right: "$fee"
```

## Security Guarantees

1. **No Code Execution**: Only predefined operations can be called
2. **No External Access**: Operations cannot access file system, network, or other resources
3. **Type Safety**: TypeScript ensures type correctness at compile time
4. **Deterministic**: All operations are pure functions
5. **Schema Validation**: JSON Schema validates expressions before evaluation

## Implementation Notes

- The `OperationRegistry` in `operations.ts` contains all allowed operations
- `isAllowedOperation()` checks if an operation name is whitelisted
- `getOperation()` safely retrieves operation functions
- The evaluator will validate operations against this schema before execution

## Future Enhancements

Phase 3 will add:
- Expression closures for `map`, `filter`, `find`
- Custom transform functions with sandboxing
- Performance optimizations for large datasets
