# Override Method Integration

This document describes how the EDL compiler integrates override methods from external TypeScript files into the generated exchange class.

## Overview

Some exchange methods are too complex to express declaratively in EDL (e.g., Binance's `sign` method with RSA/EdDSA support, or `fetchBalance` with multiple endpoint routing). For these cases, the EDL compiler supports **override methods** that are hand-written in separate TypeScript files and integrated into the generated class.

## How It Works

### 1. Declare Overrides in EDL

In your EDL file (e.g., `binance.edl.yaml`), declare which methods should be overridden:

```yaml
overrides:
  - method: fetchBalance
    description: "Binance requires different endpoints for spot/margin/futures balance"
    file: binance.overrides.ts
  - method: sign
    description: "Binance signature handling with RSA/EdDSA support"
    file: binance.overrides.ts
  - method: parseTxId
    description: "Parse transaction ID, stripping 'Internal transfer ' prefix if present"
    file: binance.overrides.ts
```

### 2. Write Override Functions

Create a TypeScript file in the `overrides/` directory (e.g., `overrides/binance.overrides.ts`):

```typescript
/**
 * @method
 * @name binance#parseTxId
 * @description Parse transaction ID, stripping 'Internal transfer ' prefix if present
 * @param {string|undefined} txid transaction ID from API
 * @returns {string|null} cleaned transaction ID
 */
export const parseTxId = function (this: any, txid: string | undefined): string | null {
    if (txid !== undefined && txid.indexOf('Internal transfer ') >= 0) {
        return txid.slice(18);
    }
    return txid ?? null;
};
```

**Important patterns:**
- Export the function with `export const methodName = function (...) {...};`
- Include `this: any` as the first parameter
- Add JSDoc comments (they will be preserved in the generated class)
- Use the same TypeScript patterns as regular CCXT exchange code

### 3. Compilation Process

When compiling an EDL file, the compiler:

1. **Reads** the `overrides` section from the EDL document
2. **Locates** the override file (relative to the EDL file's `../overrides` directory)
3. **Parses** the TypeScript file to extract exported functions
4. **Converts** each function from:
   ```typescript
   export const methodName = function (this: any, param1: Type1, ...) { ... };
   ```
   to:
   ```typescript
   methodName (param1: Type1, ...) { ... }
   ```
5. **Inserts** the converted methods as class members in the generated TypeScript
6. **Skips** code generation for overridden methods (e.g., if `sign` is in overrides, the EDL compiler won't generate a `sign` method from the `auth` section)

### 4. Generated Output

The generated class will include your override methods as regular class members:

```typescript
export default class Binance extends Exchange {
    describe () {
        // ... generated code
    }

    /**
     * @method
     * @name binance#parseTxId
     * @description Parse transaction ID, stripping 'Internal transfer ' prefix if present
     * @param {string|undefined} txid transaction ID from API
     * @returns {string|null} cleaned transaction ID
     */
    parseTxId (txid: string | undefined): string | null {
        if (txid !== undefined && txid.indexOf('Internal transfer ') >= 0) {
            return txid.slice(18);
        }
        return txid ?? null;
    }

    // ... other methods
}
```

## File Structure

```
ccxt/edl/
├── compiler/
│   └── src/
│       ├── generator/
│       │   ├── index.ts          # Calls generateOverrideMethods()
│       │   └── emitter.ts        # Handles 'raw' class members
│       └── helpers/
│           └── override-parser.ts # Parses override files
├── exchanges/
│   └── binance.edl.yaml          # EDL with overrides section
└── overrides/
    └── binance.overrides.ts      # Hand-written override methods
```

## Implementation Details

### Override Parser (`src/helpers/override-parser.ts`)

- **`parseOverrideFile()`**: Reads a TypeScript file and extracts all exported functions using regex
- **`convertToClassMethod()`**: Transforms exported functions into class methods by:
  - Removing `export const methodName = function (`
  - Removing `this: any,` parameter
  - Removing trailing `};`
- **`shouldSkipGeneratedMethod()`**: Checks if a method should be skipped during code generation

### Generator Integration (`src/generator/index.ts`)

- **`generateClass()`**: Collects override method names and skips their generation
- **`generateOverrideMethods()`**: Reads override files, parses them, and creates raw class members

### Emitter Support (`src/generator/emitter.ts`)

- **`emitClassMember()`**: Handles `kind: 'raw'` members
- **`emitRawClassMember()`**: Emits raw code with proper indentation

## Benefits

1. **Flexibility**: Complex methods can be hand-written when EDL isn't expressive enough
2. **Maintainability**: Override methods are version-controlled alongside the EDL
3. **Type Safety**: Full TypeScript support with type checking
4. **Documentation**: JSDoc comments are preserved
5. **Gradual Migration**: Start with overrides, migrate to EDL as the language evolves

## Limitations

- Override files must follow the exact pattern: `export const name = function (this: any, ...) {...};`
- Overrides are not validated against the EDL schema
- The compiler trusts that override methods are correctly implemented

## Testing

To test override integration:

```bash
npm run build
node bin/edl-compile.js ../exchanges/binance.edl.yaml --verbose
```

Verify the generated file includes override methods:

```bash
grep -A 10 "parseTxId" ../exchanges/binance.ts
```
