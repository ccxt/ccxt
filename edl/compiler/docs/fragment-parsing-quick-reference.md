# Fragment Reference Parsing - Quick Reference

## Import

```typescript
import {
    FragmentReferenceParser,
    parseFragmentReferences,
    validateFragmentReferences,
    extractFragmentContext,
    collectFragmentDependencies,
    detectCircularReferences,
    findCircularFragmentReferences,
} from './parsing/fragments.js';
```

## Reference Syntaxes

| Syntax | Example | Use Case |
|--------|---------|----------|
| `$ref` | `$ref: "fragment-id"` | Simple reference |
| `$use` | `$use: { fragment: "id", with: {...} }` | With arguments |
| `@include` | `@include("fragment-id")` | Include directive |
| `extends` | `extends: "fragment-id"` | Inheritance |

## Quick Start

```typescript
// 1. Parse references
const parser = new FragmentReferenceParser();
const refs = parser.parse(edlDocument);

// 2. Validate
const errors = validateFragmentReferences(refs, registry);

// 3. Check circular dependencies
const cycles = findCircularFragmentReferences(refs, registry);
```

## ParsedFragmentReference Structure

```typescript
{
    fragmentId: string,        // "hmac-auth"
    location: {                // Source location
        path: string,          // "auth"
        line?: number,
        column?: number
    },
    arguments?: {...},         // Parameterized args
    overrides?: {...},         // Override values
    context: string,           // "auth", "api", "parser", etc.
    referenceType: string      // "ref", "use", "include", "extends"
}
```

## Context Types

- `api` - API endpoints
- `parser` - Parser definitions
- `auth` - Authentication
- `errors` - Error patterns
- `markets` - Market definitions
- `unknown` - Other

## Common Patterns

### Parse and Validate

```typescript
const refs = parseFragmentReferences(document);
const errors = validateFragmentReferences(refs, registry);

if (errors.length > 0) {
    errors.forEach(e => console.error(e.error));
}
```

### Find Specific References

```typescript
const authRefs = refs.filter(r => r.context === 'auth');
const deprecatedRefs = errors.filter(e => e.error.includes('deprecated'));
```

### Extract Arguments

```typescript
refs.forEach(ref => {
    if (ref.arguments) {
        console.log(`${ref.fragmentId} args:`, ref.arguments);
    }
});
```

## Reference Examples

### Simple Reference
```yaml
auth:
  $ref: "common-auth"
```

### With Arguments
```yaml
parsers:
  ticker:
    $use:
      fragment: "standard-parser"
      with:
        basePath: "data.ticker"
```

### With Overrides
```yaml
auth:
  $ref: "hmac-auth"
  algorithm: "sha512"  # Override
```

### Nested References
```yaml
api:
  endpoints:
    - $ref: "endpoint-1"
    - $ref: "endpoint-2"
```

## Error Types

| Error | Meaning |
|-------|---------|
| "not found" | Fragment doesn't exist in registry |
| "deprecated" | Fragment is deprecated |
| "context" mismatch | Wrong fragment type for location |

## Best Practices

1. **Always validate** references after parsing
2. **Check for cycles** before resolution
3. **Use context** for type-safe fragment usage
4. **Handle errors** gracefully with detailed messages
5. **Cache results** for repeated parsing

## Performance

- Parsing: O(n) nodes
- Lookup: O(1) with Map
- Cycles: O(V + E) DFS
- Memory: Efficient

## See Also

- Full docs: `/docs/fragment-reference-parsing.md`
- Examples: `/examples/fragment-parsing-example.ts`
- Tests: `/src/__tests__/fragment-parsing.test.ts`
- Schema: `/src/schemas/fragments.ts`
