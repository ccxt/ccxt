# API Endpoint Schema

**Phase 2-9.1: Define API Endpoint Schemas**

## Overview

The API Endpoint Schema module provides comprehensive data structures and utilities for representing API endpoints with full parameter validation, URL construction, and schema validation capabilities. This forms the foundation for generating type-safe API helpers.

## Features

### 1. Comprehensive Parameter Schema

The `ParameterSchema` interface provides detailed parameter definitions including:

- **Type System**: Support for all EDL parameter types (string, int, float, boolean, array, object, timestamps)
- **Location Tracking**: Parameters can be in path, query, body, or headers
- **Validation Rules**: Min/max values, length constraints, regex patterns, custom expressions
- **Serialization Options**: Format, encoding, array/object serialization styles
- **Dependencies**: Parameter dependencies and conditional requirements

### 2. Response Schema

Define expected response structures with:

- Content type specification (json, text, binary, xml)
- Data extraction paths (JSONPath/XPath)
- Schema validation
- Success status codes
- Header extraction

### 3. Authentication Requirements

Specify authentication needs:

- Required vs optional authentication
- Supported authentication schemes (apiKey, hmac, jwt, oauth, bearer)
- Required credentials and permissions

### 4. Error Mapping

Map API errors to standardized error types:

- HTTP status code mapping
- Error code matching
- Message pattern matching
- Retry strategies and delays

### 5. Complete Endpoint Schema

The `APIEndpointSchema` combines all aspects:

```typescript
interface APIEndpointSchema {
    id: string;
    method: HTTPMethod;
    path: string;
    baseUrl?: string;
    pathParams?: ParameterSchema[];
    queryParams?: ParameterSchema[];
    bodyParams?: ParameterSchema[];
    headers?: ParameterSchema[];
    authentication?: AuthenticationRequirement;
    response?: ResponseSchema;
    rateLimit?: RateLimitConfig;
    errors?: ErrorMapping[];
    description?: string;
    deprecated?: boolean;
    tags?: string[];
}
```

## Core Functions

### Path Parsing

```typescript
parseEndpointPath(path: string): PathParameter[]
```

Parses URL path templates and extracts parameter information:

- Identifies path parameters in `{paramName}` format
- Supports optional parameters with `{paramName?}` syntax
- Returns parameter name, position, and required status

**Example:**
```typescript
parseEndpointPath('/api/v1/users/{userId}/orders/{orderId?}')
// Returns: [
//   { name: 'userId', position: 0, required: true },
//   { name: 'orderId', position: 1, required: false }
// ]
```

### URL Building

```typescript
buildEndpointUrl(schema: APIEndpointSchema, params: Record<string, any>): string
```

Constructs complete URLs from endpoint schemas and parameter values:

- Replaces path parameters
- Adds query parameters
- Handles base URLs
- URL encodes values
- Validates required parameters

**Example:**
```typescript
const schema = {
    id: 'getUserOrders',
    method: 'GET',
    path: '/api/v1/users/{userId}/orders',
    baseUrl: 'https://api.example.com',
    queryParams: [
        { name: 'limit', type: 'int', location: 'query', required: false }
    ]
};

buildEndpointUrl(schema, { userId: '12345', limit: 10 })
// Returns: 'https://api.example.com/api/v1/users/12345/orders?limit=10'
```

### Parameter Validation

```typescript
validateParameter(param: ParameterSchema, value: any): ValidationError[]
```

Validates a single parameter value:

- Type checking
- Required field validation
- Enum validation
- Min/max constraints
- Length constraints
- Regex pattern matching

**Example:**
```typescript
const param = {
    name: 'amount',
    type: 'number',
    location: 'body',
    required: true,
    validation: { min: 0.01, max: 1000 }
};

validateParameter(param, 0.005)
// Returns: [{
//   parameter: 'amount',
//   message: "Parameter 'amount' must be >= 0.01",
//   code: 'MIN_VALUE',
//   value: 0.005
// }]
```

### Endpoint Validation

```typescript
validateEndpointSchema(schema: APIEndpointSchema, params: Record<string, any>): ValidationError[]
```

Validates all parameters for an endpoint:

- Path parameter validation
- Query parameter validation  
- Body parameter validation
- Header parameter validation
- Returns all validation errors

### Helper Functions

```typescript
// Extract all parameters grouped by location
extractParameters(schema: APIEndpointSchema): {
    path: ParameterSchema[];
    query: ParameterSchema[];
    body: ParameterSchema[];
    header: ParameterSchema[];
}

// Get names of all required parameters
getRequiredParameters(schema: APIEndpointSchema): string[]

// Check if a value matches a parameter type
matchesParameterType(value: any, type: ParamType): boolean
```

## Validation Rules

### Type Validation

Parameters are validated against their declared types:

- `string`: Must be string type
- `int`, `integer`: Must be number and integer
- `float`, `number`: Must be number
- `boolean`, `bool`: Must be boolean
- `array`: Must be array
- `object`: Must be object (non-array)
- `timestamp`, `timestamp_ms`, `timestamp_ns`: Must be number

### Constraint Validation

Parameters support various constraint validations:

**Numeric Constraints:**
```typescript
validation: {
    min: 0.01,      // Minimum value (inclusive)
    max: 1000       // Maximum value (inclusive)
}
```

**Length Constraints:**
```typescript
validation: {
    minLength: 3,   // Minimum length (strings/arrays)
    maxLength: 100  // Maximum length (strings/arrays)
}
```

**Pattern Matching:**
```typescript
validation: {
    pattern: '^[A-Z]{3}/[A-Z]{3,4}$'  // Regex pattern
}
```

**Enum Values:**
```typescript
enum: ['buy', 'sell']  // Allowed values
```

## Serialization Options

Parameters can specify how they should be serialized:

```typescript
serialization: {
    format: 'iso8601',           // Format for timestamps, dates, etc.
    encoding: 'json',             // json, form, multipart, raw
    encode: true,                 // Whether to URL encode
    arrayStyle: 'csv',            // csv, ssv, tsv, pipes, multi, brackets
    objectStyle: 'dot'            // dot, bracket, deepObject
}
```

## Error Codes

Validation errors use standardized error codes:

- `REQUIRED`: Required parameter is missing
- `INVALID_TYPE`: Parameter type mismatch
- `INVALID_ENUM`: Value not in allowed enum values
- `MIN_VALUE`: Value below minimum
- `MAX_VALUE`: Value above maximum
- `MIN_LENGTH`: Length below minimum
- `MAX_LENGTH`: Length above maximum
- `PATTERN_MISMATCH`: Value doesn't match regex pattern

## Test Coverage

The module includes comprehensive test coverage:

- ✅ 43 tests across 8 test suites
- ✅ Path parsing with various parameter patterns
- ✅ URL building with path and query parameters
- ✅ Parameter validation for all types
- ✅ Constraint validation (min/max, length, pattern)
- ✅ Endpoint schema validation
- ✅ Helper function testing
- ✅ Type matching validation

All tests pass successfully.

## Usage Example

Complete example showing endpoint schema definition and validation:

```typescript
import {
    APIEndpointSchema,
    buildEndpointUrl,
    validateEndpointSchema,
    getRequiredParameters
} from './schemas/api-endpoints.js';

// Define endpoint schema
const createOrderSchema: APIEndpointSchema = {
    id: 'createOrder',
    method: 'POST',
    path: '/api/v1/users/{userId}/orders',
    baseUrl: 'https://api.exchange.com',
    
    pathParams: [
        {
            name: 'userId',
            type: 'string',
            location: 'path',
            required: true
        }
    ],
    
    queryParams: [
        {
            name: 'dryRun',
            type: 'boolean',
            location: 'query',
            required: false,
            default: false
        }
    ],
    
    bodyParams: [
        {
            name: 'symbol',
            type: 'string',
            location: 'body',
            required: true,
            validation: {
                pattern: '^[A-Z]{3,4}/[A-Z]{3,4}$'
            }
        },
        {
            name: 'side',
            type: 'string',
            location: 'body',
            required: true,
            enum: ['buy', 'sell']
        },
        {
            name: 'amount',
            type: 'number',
            location: 'body',
            required: true,
            validation: {
                min: 0.01,
                max: 1000000
            }
        },
        {
            name: 'price',
            type: 'number',
            location: 'body',
            required: false,
            validation: {
                min: 0.01
            }
        }
    ],
    
    authentication: {
        required: true,
        schemes: ['hmac'],
        credentials: ['apiKey', 'secret']
    },
    
    response: {
        type: 'json',
        path: '$.data',
        successCodes: [200, 201]
    },
    
    rateLimit: {
        cost: 2,
        interval: 1000,
        limit: 10
    }
};

// Validate parameters
const params = {
    userId: 'user123',
    symbol: 'BTC/USDT',
    side: 'buy',
    amount: 1.5,
    price: 50000
};

const errors = validateEndpointSchema(createOrderSchema, params);
if (errors.length > 0) {
    console.error('Validation errors:', errors);
} else {
    // Build URL
    const url = buildEndpointUrl(createOrderSchema, params);
    console.log('URL:', url);
    // Output: https://api.exchange.com/api/v1/users/user123/orders
}

// Get required parameters
const required = getRequiredParameters(createOrderSchema);
console.log('Required:', required);
// Output: ['userId', 'symbol', 'side', 'amount']
```

## Integration with EDL Types

The API Endpoint Schema integrates seamlessly with existing EDL types:

- Uses `ParamType` and `ParamLocation` from `types/edl.ts`
- Compatible with `EndpointDefinition` and `ParamDefinition`
- Extends existing types with additional validation capabilities
- Provides backward compatibility with current EDL schemas

## Next Steps

This schema system provides the foundation for:

1. **Helper Generation** (Phase 2-9.2): Generate type-safe API helper functions
2. **Request Building**: Automatic request construction from schemas
3. **Response Validation**: Validate API responses against schemas
4. **Documentation Generation**: Auto-generate API documentation
5. **SDK Generation**: Generate SDKs in multiple languages

## Files

- `/Users/reuben/gauntlet/ccxt/edl/compiler/src/schemas/api-endpoints.ts` - Schema types and utilities
- `/Users/reuben/gauntlet/ccxt/edl/compiler/src/__tests__/api-endpoint-schema.test.ts` - Comprehensive test suite
- `/Users/reuben/gauntlet/ccxt/edl/compiler/docs/api-endpoint-schema.md` - This documentation
