# Integration Example: Using SafeExpressionEvaluator with Parameter Validation

This example shows how to integrate the SafeExpressionEvaluator with the existing parameter validation system.

## Upgrading the Existing Validation System

The existing `validation/parameters.ts` uses basic Function constructor-based evaluation:

```typescript
// OLD: Using Function constructor (unsafe)
function evaluateExpression(expression: string, params: Record<string, any>): boolean {
    const result = new Function(`return (${safeExpression});`)();
    return Boolean(result);
}
```

We can replace this with the SafeExpressionEvaluator:

```typescript
// NEW: Using SafeExpressionEvaluator (safe)
import { SafeExpressionEvaluator } from '../evaluation/expression-evaluator.js';

function evaluateExpression(expression: string, params: Record<string, any>): boolean {
    const evaluator = new SafeExpressionEvaluator({
        variables: params,
        maxDepth: 50,
        timeout: 500
    });

    const result = evaluator.evaluate(expression);

    if (result.error) {
        console.warn(`Expression evaluation failed: ${result.error}`);
        return false;
    }

    return Boolean(result.value);
}
```

## Enhanced Parameter Validation

Here's how to enhance the parameter validation with the expression evaluator:

```typescript
import { SafeExpressionEvaluator } from '../evaluation/expression-evaluator.js';
import { ParamDefinition, ValidationError } from '../types/edl.js';

/**
 * Enhanced parameter validator using SafeExpressionEvaluator
 */
export class ParameterValidator {
    private evaluator: SafeExpressionEvaluator;

    constructor() {
        this.evaluator = new SafeExpressionEvaluator({
            maxDepth: 50,
            timeout: 1000
        });

        // Register custom validation functions
        this.registerValidationFunctions();
    }

    /**
     * Register custom functions for parameter validation
     */
    private registerValidationFunctions(): void {
        // String validation helpers
        this.evaluator.registerFunction('isEmail', (str: string) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
        });

        this.evaluator.registerFunction('isURL', (str: string) => {
            try {
                new URL(str);
                return true;
            } catch {
                return false;
            }
        });

        this.evaluator.registerFunction('matches', (str: string, pattern: string) => {
            return new RegExp(pattern).test(str);
        });

        // Numeric validation helpers
        this.evaluator.registerFunction('inRange', (value: number, min: number, max: number) => {
            return value >= min && value <= max;
        });

        this.evaluator.registerFunction('isPositive', (value: number) => {
            return value > 0;
        });

        this.evaluator.registerFunction('isInteger', (value: number) => {
            return Number.isInteger(value);
        });

        // Array validation helpers
        this.evaluator.registerFunction('hasLength', (arr: any[], length: number) => {
            return arr.length === length;
        });

        this.evaluator.registerFunction('allPositive', (arr: number[]) => {
            return arr.every(n => n > 0);
        });
    }

    /**
     * Validate parameter with conditional requirements
     */
    validateParameter(
        paramName: string,
        value: any,
        definition: ParamDefinition,
        allParams: Record<string, any>
    ): ValidationError | null {
        // Set context with all parameters
        for (const [key, val] of Object.entries(allParams)) {
            this.evaluator.setVariable(key, val);
        }

        // Also set the current parameter value
        this.evaluator.setVariable('value', value);
        this.evaluator.setVariable(paramName, value);

        // Check conditional required
        if (definition.required_if) {
            const result = this.evaluator.evaluate(definition.required_if);

            if (result.error) {
                return {
                    path: paramName,
                    message: `Invalid required_if expression: ${result.error}`,
                    severity: 'error'
                };
            }

            const isRequired = Boolean(result.value);
            const isProvided = value !== undefined && value !== null;

            if (isRequired && !isProvided) {
                return {
                    path: paramName,
                    message: `Parameter '${paramName}' is required when: ${definition.required_if}`,
                    severity: 'error'
                };
            }
        }

        // Custom validation expression
        if (definition.validate) {
            const result = this.evaluator.evaluate(definition.validate);

            if (result.error) {
                return {
                    path: paramName,
                    message: `Validation expression error: ${result.error}`,
                    severity: 'error'
                };
            }

            if (!result.value) {
                return {
                    path: paramName,
                    message: `Validation failed: ${definition.validate}`,
                    severity: 'error'
                };
            }
        }

        return null;
    }

    /**
     * Evaluate a conditional expression
     */
    evaluateCondition(expression: string, context: Record<string, any>): boolean {
        for (const [key, val] of Object.entries(context)) {
            this.evaluator.setVariable(key, val);
        }

        const result = this.evaluator.evaluate(expression);

        if (result.error) {
            console.warn(`Condition evaluation failed: ${result.error}`);
            return false;
        }

        return Boolean(result.value);
    }
}
```

## Example Usage

### 1. Complex Conditional Requirements

```typescript
const validator = new ParameterValidator();

const orderParams = {
    type: 'limit',
    price: 100,
    stopPrice: null,
    amount: 10
};

const priceParamDef: ParamDefinition = {
    name: 'price',
    type: 'number',
    required_if: 'type == "limit" || type == "stopLimit"',
    validate: 'value > 0'
};

const error = validator.validateParameter('price', 100, priceParamDef, orderParams);
// error === null (validation passed)
```

### 2. Advanced Validation Rules

```typescript
const emailParamDef: ParamDefinition = {
    name: 'email',
    type: 'string',
    validate: 'isEmail(value) && length(value) <= 100'
};

const urlParamDef: ParamDefinition = {
    name: 'webhook',
    type: 'string',
    required_if: 'notifications == true',
    validate: 'isURL(value) && startsWith(value, "https://")'
};

const quantityParamDef: ParamDefinition = {
    name: 'quantity',
    type: 'number',
    validate: 'isPositive(value) && isInteger(value) && inRange(value, 1, 1000)'
};
```

### 3. Array Validation

```typescript
const itemsParamDef: ParamDefinition = {
    name: 'items',
    type: 'array',
    validate: 'length(value) > 0 && length(value) <= 100'
};

const pricesParamDef: ParamDefinition = {
    name: 'prices',
    type: 'array',
    validate: 'allPositive(value)'
};
```

### 4. Cross-Parameter Validation

```typescript
const params = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    maxDuration: 365
};

const endDateParamDef: ParamDefinition = {
    name: 'endDate',
    type: 'string',
    validate: 'toNumber(substring(value, 0, 4)) >= toNumber(substring(startDate, 0, 4))'
};
```

## Migration Guide

### Step 1: Replace Basic Expression Evaluation

Before:
```typescript
// validation/parameters.ts
function evaluateExpression(expression: string, params: Record<string, any>): boolean {
    // ... unsafe Function constructor usage
    const result = new Function(`return (${safeExpression});`)();
    return Boolean(result);
}
```

After:
```typescript
// validation/parameters.ts
import { SafeExpressionEvaluator } from '../evaluation/expression-evaluator.js';

const globalEvaluator = new SafeExpressionEvaluator({ maxDepth: 50, timeout: 500 });

function evaluateExpression(expression: string, params: Record<string, any>): boolean {
    for (const [key, val] of Object.entries(params)) {
        globalEvaluator.setVariable(key, val);
    }

    const result = globalEvaluator.evaluate(expression);
    return result.error ? false : Boolean(result.value);
}
```

### Step 2: Add Custom Validation Functions

```typescript
// validation/parameters.ts
import { SafeExpressionEvaluator } from '../evaluation/expression-evaluator.js';

const validationEvaluator = new SafeExpressionEvaluator();

// Register domain-specific functions
validationEvaluator.registerFunction('isValidSymbol', (symbol: string) => {
    return /^[A-Z]{3,10}\/[A-Z]{3,10}$/.test(symbol);
});

validationEvaluator.registerFunction('isValidOrderType', (type: string) => {
    return ['market', 'limit', 'stopLimit', 'stopMarket'].includes(type);
});

validationEvaluator.registerFunction('isValidSide', (side: string) => {
    return ['buy', 'sell'].includes(side);
});
```

### Step 3: Update Validation Logic

```typescript
function validateParameterValue(
    value: any,
    definition: ParamDefinition
): ValidationError | null {
    if (definition.validate) {
        validationEvaluator.setVariable('value', value);

        const result = validationEvaluator.evaluate(definition.validate);

        if (result.error) {
            return {
                path: '',
                message: `Validation expression error: ${result.error}`,
                severity: 'error'
            };
        }

        if (!result.value) {
            return {
                path: '',
                message: `Validation failed: ${definition.validate}`,
                severity: 'error'
            };
        }
    }

    return null;
}
```

## Benefits of Integration

1. **Security**: No arbitrary code execution
2. **Consistency**: Same expression syntax across all validations
3. **Extensibility**: Easy to add custom validation functions
4. **Performance**: Configurable timeouts and depth limits
5. **Error Handling**: Better error messages and debugging
6. **Type Safety**: TypeScript support throughout

## Testing the Integration

```typescript
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { ParameterValidator } from './validation/enhanced-validator.js';

describe('Enhanced Parameter Validation', () => {
    test('should validate conditional requirements', () => {
        const validator = new ParameterValidator();

        const params = { type: 'limit', price: 100 };
        const definition = {
            name: 'price',
            type: 'number',
            required_if: 'type == "limit"',
            validate: 'value > 0'
        };

        const error = validator.validateParameter('price', 100, definition, params);
        assert.strictEqual(error, null);
    });

    test('should use custom validation functions', () => {
        const validator = new ParameterValidator();

        const definition = {
            name: 'email',
            type: 'string',
            validate: 'isEmail(value)'
        };

        const error1 = validator.validateParameter(
            'email',
            'test@example.com',
            definition,
            {}
        );
        assert.strictEqual(error1, null);

        const error2 = validator.validateParameter(
            'email',
            'invalid-email',
            definition,
            {}
        );
        assert.notStrictEqual(error2, null);
    });
});
```
