# Array Operations Quick Reference

## Lambda Syntax

### Single Parameter
```yaml
param: x
body: x.price
```

### Multiple Parameters
```yaml
params: [acc, item]
body:
  op: add
  left: acc
  right: item
```

## Operation Types

### Map - Transform Elements
```yaml
op: map
array: response.items
transform:
  param: x
  body: x.price
```

**Result:** Array of prices from items

### Filter - Select Elements
```yaml
op: filter
array: response.orders
predicate:
  param: order
  body:
    op: eq
    left: order.status
    right: open
```

**Result:** Array of open orders

### Reduce - Accumulate Values
```yaml
op: reduce
array: response.trades
reducer:
  params: [sum, trade]
  body:
    op: add
    left: sum
    right: trade.amount
initial: 0
```

**Result:** Sum of all trade amounts

### Slice - Extract Subarray
```yaml
op: slice
array: response.items
start: 0
end: 10
step: 1  # optional
```

**Result:** First 10 items

### FlatMap - Transform and Flatten
```yaml
op: flatMap
array: response.groups
transform:
  param: group
  body: group.items
```

**Result:** Flattened array of all items from all groups

## Common Patterns

### Get First N Elements
```yaml
op: slice
array: items
start: 0
end: 10
```

### Get IDs from Objects
```yaml
op: map
array: orders
transform:
  param: o
  body: o.id
```

### Sum Values
```yaml
op: reduce
array: numbers
reducer:
  params: [sum, n]
  body:
    op: add
    left: sum
    right: n
initial: 0
```

### Filter and Map (Chained)
```yaml
op: map
array:
  op: filter
  array: orders
  predicate:
    param: o
    body:
      op: eq
      left: o.status
      right: open
transform:
  param: o
  body: o.id
```

### Count Elements Matching Condition
```yaml
call: length
args:
  - op: filter
    array: items
    predicate:
      param: i
      body:
        op: gt
        left: i.price
        right: 100
```

### Average Calculation
```yaml
op: divide
left:
  op: reduce
  array: items
  reducer:
    params: [sum, i]
    body:
      op: add
      left: sum
      right: i.price
  initial: 0
right:
  call: length
  args: [items]
```

### Find Maximum Value
```yaml
op: reduce
array: numbers
reducer:
  params: [max, n]
  body:
    if:
      op: gt
      left: n
      right: max
    then: n
    else: max
initial: 0
```

### Pagination
```yaml
# Page 1 (items 0-19)
op: slice
array: items
start: 0
end: 20

# Page 2 (items 20-39)
op: slice
array: items
start: 20
end: 40
```

### Sample Every Nth Element
```yaml
op: slice
array: candles
start: 0
step: 5  # every 5th candle
```

### Remove Nulls
```yaml
op: filter
array: items
predicate:
  param: i
  body:
    op: ne
    left: i
    right: null
```

### Extract Nested Arrays
```yaml
op: flatMap
array: groups
transform:
  param: g
  body: g.subItems
```

## Validation Checklist

- [ ] Lambda has `param` OR `params` (not both)
- [ ] Lambda has `body`
- [ ] Map/FlatMap has `transform`
- [ ] Filter has `predicate`
- [ ] Reduce has `reducer` and `initial`
- [ ] Slice has numeric `start`
- [ ] Operation type is valid: map, filter, reduce, slice, flatMap

## Type Guards

```typescript
import { isArrayOperation, isLambdaExpression } from '../syntax/array-operations';

if (isArrayOperation(expr)) {
  // expr is ArrayOperation type
}

if (isLambdaExpression(expr)) {
  // expr is LambdaExpression type
}
```

## Validation Functions

```typescript
import {
  validateArrayOperation,
  validateLambdaExpression
} from '../syntax/array-operations';

const errors = validateArrayOperation(operation);
if (errors.length > 0) {
  console.error('Invalid operation:', errors);
}
```
