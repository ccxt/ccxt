# Fragment Reference Parsing

## Overview

Fragment reference parsing is a critical component of the EDL compiler that identifies, extracts, and validates references to shared fragment definitions within EDL documents. This enables code reuse, modularity, and maintainability across exchange definitions.

## Implementation Summary

### File: `/src/parsing/fragments.ts`

This module implements comprehensive fragment reference parsing with the following capabilities:

#### 1. Reference Pattern Matching

Supports multiple reference syntaxes:

- **Simple Reference**: `$ref: "fragment-id"`
- **Extended Reference**: `$use: { fragment: "id", with: {...} }`
- **Include Directive**: `@include("fragment-id")`
- **Inheritance**: `extends: "fragment-id"`

#### 2. FragmentReferenceParser Class

Main parser class that provides:

- `parse(content)` - Parse references from string or object
- `findReferences(node, path)` - Recursively find all refs in document tree
- `extractFragmentId(ref)` - Extract fragment ID from various formats
- `extractArguments(ref)` - Extract arguments for parameterized fragments
- `extractOverrides(ref)` - Extract override values

#### 3. ParsedFragmentReference Interface

Represents a parsed reference with:

```typescript
interface ParsedFragmentReference {
    fragmentId: string;              // ID of referenced fragment
    location: SourceLocation;        // Where ref appears in document
    arguments?: Record<string, any>; // Args for parameterized fragments
    overrides?: Record<string, any>; // Override values
    context: FragmentContext;        // Context (api, parser, auth, etc.)
    referenceType: 'ref' | 'use' | 'include' | 'extends';
}
```

#### 4. Context Detection

Automatically determines the context of a fragment reference based on its location in the document:

- `api` - References in API endpoint definitions
- `parser` - References in parser definitions
- `auth` - References in authentication configuration
- `errors` - References in error handling
- `markets` - References in market definitions
- `unknown` - Unrecognized context

#### 5. Validation Functions

**`validateFragmentReferences(refs, registry)`**
- Checks that all referenced fragments exist in the registry
- Warns about deprecated fragments
- Validates context matches fragment type
- Returns detailed error information

**`parseFragmentReferences(edlDocument)`**
- Convenience function to parse all refs from a document

**`extractFragmentContext(location)`**
- Utility to determine context from a location path

#### 6. Dependency Analysis

**`collectFragmentDependencies(refs)`**
- Builds a dependency graph from references
- Groups dependencies by containing section
- Removes duplicate dependencies

**`detectCircularReferences(dependencies)`**
- Detects circular dependency chains using DFS
- Returns all circular paths found

**`findCircularFragmentReferences(refs, registry)`**
- Comprehensive circular dependency detection
- Analyzes both document refs and fragment-to-fragment refs
- Builds complete dependency graph

## Reference Syntax Examples

### 1. Simple Reference

```yaml
auth:
  $ref: "common-hmac-auth"
```

JSON equivalent:
```json
{
  "auth": {
    "$ref": "common-hmac-auth"
  }
}
```

### 2. Reference with Arguments

```yaml
parsers:
  ticker:
    $use:
      fragment: "standard-parser"
      with:
        basePath: "data.ticker"
        format: "array"
```

### 3. Reference with Inline Overrides

```yaml
auth:
  $ref: "hmac-auth"
  algorithm: "sha512"  # Override the algorithm
```

### 4. Simple String $use

```yaml
parsers:
  orderbook:
    $use: "standard-orderbook-parser"
```

### 5. Include Directive

```yaml
api:
  public:
    @include: "rest-public-endpoints"
```

### 6. Inheritance

```yaml
errors:
  extends: "base-error-patterns"
  patterns:
    - match: "custom error"
      type: "ExchangeError"
```

## Usage Examples

### Basic Parsing

```typescript
import { FragmentReferenceParser } from './parsing/fragments.js';

const parser = new FragmentReferenceParser();
const document = {
    auth: { $ref: 'hmac-auth' },
    api: { $ref: 'rest-endpoints' }
};

const refs = parser.parse(document);
console.log(`Found ${refs.length} references`);
```

### Validation

```typescript
import {
    parseFragmentReferences,
    validateFragmentReferences
} from './parsing/fragments.js';
import { createFragmentRegistry } from '../schemas/fragments.js';

const registry = createFragmentRegistry();
// ... register fragments

const refs = parseFragmentReferences(document);
const errors = validateFragmentReferences(refs, registry);

if (errors.length > 0) {
    console.error('Validation errors:', errors);
}
```

### Circular Dependency Detection

```typescript
import { findCircularFragmentReferences } from './parsing/fragments.js';

const refs = parseFragmentReferences(document);
const cycles = findCircularFragmentReferences(refs, registry);

if (cycles.length > 0) {
    console.error('Circular dependencies:', cycles);
}
```

## Test Coverage

Comprehensive test suite in `/src/__tests__/fragment-parsing.test.ts` with 50 tests covering:

- All reference syntax types ($ref, $use, @include, extends)
- Fragment ID extraction from various formats
- Argument extraction (with, args, inline)
- Override extraction (override, overrides, inline)
- Context detection for all fragment types
- Validation against registry
- Missing fragment detection
- Deprecated fragment warnings
- Context mismatch detection
- Dependency collection and deduplication
- Circular dependency detection
- Edge cases (null, undefined, primitives, empty objects/arrays)
- Malformed input handling
- Nested and deeply nested references
- String content parsing

All tests pass: **50/50 ✓**

## Integration Points

### With Fragment Schema (`/src/schemas/fragments.ts`)

- Uses `FragmentRegistry` interface for validation
- References `FragmentDefinition` and `FragmentReference` types
- Validates against registered fragments

### With Main Parser (`/src/parser/index.ts`)

- Can be integrated to parse references during EDL parsing
- Provides location information for error reporting
- Supports both YAML and JSON formats

### With Type System (`/src/types/edl.ts`)

- Uses `SourceLocation` for error tracking
- Integrates with EDL document structure

## Example File

See `/examples/fragment-parsing-example.ts` for a complete working example demonstrating:

1. Basic reference parsing
2. Fragment registry and validation
3. Circular dependency detection
4. Different reference syntaxes
5. Context detection

## Future Enhancements

Potential improvements for future phases:

1. **IDE Integration** - Provide autocomplete for fragment IDs
2. **Reference Resolution** - Inline expansion of fragment references
3. **Dependency Visualization** - Generate dependency graphs
4. **Fragment Refactoring** - Tools to rename/move fragments safely
5. **Performance Optimization** - Cache parsed references
6. **Schema Validation** - Validate argument types against fragment parameters
7. **Documentation Generation** - Auto-generate fragment docs

## Architecture Decisions

### Pattern Matching Strategy

We support multiple reference syntaxes to provide flexibility:
- `$ref` is the simplest and most common
- `$use` supports arguments for parameterized fragments
- `@include` provides directive-style syntax
- `extends` enables inheritance patterns

### Context Detection

Context is inferred from the location path in the document. This allows:
- Type-safe validation (auth fragments in auth context)
- Better error messages
- IDE support for context-aware suggestions

### Dependency Graph

The dependency graph tracks both:
- Document-level dependencies (which fragments are used)
- Fragment-level dependencies (fragments referencing other fragments)

This enables comprehensive circular dependency detection.

### Validation Strategy

Validation is split into multiple phases:
1. **Existence Check** - Does the fragment exist?
2. **Deprecation Check** - Is it deprecated?
3. **Context Check** - Is it used in the right context?

This provides granular error reporting.

## Performance Considerations

- Parsing is O(n) where n is the number of nodes in the document
- Reference lookup is O(1) using Map-based registry
- Circular detection is O(V + E) where V = fragments, E = dependencies
- All operations are suitable for real-time use in IDE plugins

## Error Handling

The parser never throws exceptions during parsing. Instead:
- Returns empty arrays for invalid input
- Validation errors are collected and returned
- Source locations are preserved for debugging
- Detailed error messages include fragment ID and location

## Summary

Fragment reference parsing provides a robust foundation for:
- Code reuse through shared fragments
- Validation of fragment references
- Detection of circular dependencies
- Context-aware fragment usage
- Multiple reference syntaxes

The implementation is thoroughly tested, well-documented, and ready for integration into the EDL compiler pipeline.
