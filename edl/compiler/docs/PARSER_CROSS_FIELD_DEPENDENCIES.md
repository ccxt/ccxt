# Parser Cross-Field Dependencies

> Phase 3 – Wave 7 task `phase3-4`  
> Owner: EDL Compiler Team  
> Status: ✅ Complete

## Problem

Parser mappings previously evaluated fields in declaration order. Computed mappings could reference other fields using `{field}` placeholders, but there was no guarantee that dependencies were resolved before evaluation. Authors were encouraged to maintain manual order and duplicate dependency lists, which was fragile and impossible to lint for circular references.

## Goals

1. Allow computed fields to reference any other mapped field without worrying about declaration order.
2. Detect invalid references (typos, missing fields) during analysis.
3. Surface circular dependencies as deterministic analyzer errors.
4. Document the behavior so authors know how to model complex derived values.

## Design

### Placeholder-Based Detection

- `compute` expressions may use `{fieldName}` placeholders to reference previously mapped fields.
- During analysis we extract the placeholder set automatically (`extractFieldReferences`).
- Authors can still supply an explicit `dependencies` array, but it’s optional now—placeholders are always honored.

### Dependency Graph

1. Build a node for every computed field (`mapping[field]` with `compute`).
2. Each node edges to other **computed** fields it references (placeholders + declared dependencies).
3. Non-computed references (simple path mappings) are treated as already resolved.
4. Missing references are recorded per field and raised as analyzer errors.

### Topological Sort

- We run a DFS-based topological sort to obtain a safe evaluation order.
- The generator uses this order when emitting assignment statements so dependencies are assigned first.
- Any nodes that cannot be ordered (cycle) are reported as a circular dependency chain.

### Analyzer Feedback

- **Missing Field**: `Computed field references "{foo}" but no such field exists in this parser mapping`.
- **Cycle**: `Circular dependency detected between computed fields: change -> changePercent -> change`.

### Generation Changes

- `buildResultObjectStatements` now imports `resolveComputeOrder` and iterates computed fields following the resolved order.
- This ensures the runtime `result` object can be reused by downstream computed fields without manual ordering.

## Author Workflow

```yaml
mapping:
  last: { path: "lastPrice" }
  open: { path: "openPrice" }
  change:
    compute: "{last} - {open}"
  changePercent:
    compute: "({change} / {open}) * 100"
```

- No explicit `dependencies` array is needed.
- If `changePercent` mistakenly referenced `{delta}` the analyzer would emit an error.
- If `change` and `changePercent` referenced each other, the analyzer would stop the build with a cycle error.

## Testing

- Added `mapping-dependencies.test.ts` to cover reference extraction, ordering, missing-field detection, and cycle detection.
- Updated the analyzer tests indirectly via new behaviors (e.g., referencing undefined fields now surfaces errors).
- Full compiler test suite continues to run via `npm run test`.

## Documentation

- Expanded `docs/schema-elements.md` and `schema-elements-reference.md` with a dedicated “Cross-Field References” section describing placeholders, automatic ordering, and validation rules.

## Next Steps

- Expose dependency graph diagnostics through CLI lint output (nice-to-have).
- Reuse the same helper for margin/wallet schema mappings (optional future cleanup).
