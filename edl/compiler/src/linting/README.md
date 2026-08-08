# EDL Linter

The EDL (Exchange Definition Language) Linter provides comprehensive validation and error detection for EDL files.

## Features

- **Rule-based validation**: Extensible linting rules for detecting errors in EDL/DSL syntax
- **Configurable severity**: Filter by error, warning, or info levels
- **File and directory support**: Lint individual files or entire directories
- **Parse validation**: Detects YAML parsing errors before linting
- **Context-aware**: Validates placeholders, transforms, and references against defined context
- **Error limiting**: Configure maximum errors and stop-on-first-error behavior

## Quick Start

```typescript
import { createLinter, lintFile, lintDirectory } from './linting/engine.js';

// Lint a single file
const result = lintFile('/path/to/exchange.edl.yaml');
console.log(`Valid: ${result.valid}`);
console.log(`Errors: ${result.errors.length}`);

// Lint a directory
const dirResult = lintDirectory('/path/to/exchanges/', {
    recursive: true,
});
console.log(`Files processed: ${dirResult.summary.filesProcessed}`);
console.log(`Files with errors: ${dirResult.summary.filesWithErrors}`);
```

## Configuration

```typescript
import { LinterEngine } from './linting/engine.js';

const linter = new LinterEngine({
    // Only report errors (skip warnings and info)
    minSeverity: 'error',

    // Stop after 10 errors
    maxErrors: 10,

    // Stop on first error
    stopOnFirstError: false,

    // Enable specific rules only
    enabledRules: ['undefined-placeholder', 'invalid-path'],

    // Disable specific rules
    disabledRules: ['syntax-error'],

    // Custom transforms
    transforms: {
        myCustomTransform: {
            name: 'myCustomTransform',
            inputType: 'string',
            outputType: 'number',
        },
    },
});

// Use the configured linter
const result = linter.lintFile('/path/to/file.edl.yaml');
```

## Built-in Rules

### Error Rules (severity: 'error')

- **undefined-placeholder** (E001): Detects placeholders not defined in context
- **unsupported-transform** (E002): Detects transforms that are not supported
- **type-mismatch** (E003): Detects type mismatches between expected and actual types
- **invalid-path** (E004): Detects invalid path expressions
- **missing-required** (E005): Detects missing required placeholders or fields
- **invalid-expression** (E006): Detects invalid expression syntax
- **syntax-error** (E007): Detects general syntax errors
- **invalid-reference** (E008): Detects invalid fragment/schema references

### Warning Rules (severity: 'warning')

- Various path and expression validation warnings

## API

### LinterEngine

Main class for linting operations.

```typescript
class LinterEngine {
    constructor(config?: LinterConfig)

    lintElements(elements: DSLElement[], context?: LintContext): LintResult
    lintDocument(document: EDLDocument, options?: LinterOptions): LintResult
    lintContent(content: string, options?: LinterOptions): FileLintResult
    lintFile(filePath: string): FileLintResult
    lintDirectory(dirPath: string, options?: DirectoryOptions): DirectoryLintResult

    getConfig(): LinterConfig
    getActiveRules(): LintRule[]
}
```

### Convenience Functions

```typescript
// Create a linter with configuration
createLinter(config?: LinterConfig): LinterEngine

// Lint file with default config
lintFile(filePath: string, config?: LinterConfig): FileLintResult

// Lint content with default config
lintContent(content: string, config?: LinterConfig): FileLintResult

// Lint directory with default config
lintDirectory(dirPath: string, config?: LinterConfig, options?: DirectoryOptions): DirectoryLintResult
```

## Custom Rules

You can add custom linting rules:

```typescript
import { LintRule, DSLElement, LintContext, LintError } from './linting/schema.js';

const myCustomRule: LintRule = {
    id: 'my-custom-rule',
    name: 'My Custom Rule',
    description: 'Validates custom constraints',
    severity: 'warning',
    check(element: DSLElement, context: LintContext): LintError[] {
        if (element.type === 'path' && element.value.startsWith('unsafe.')) {
            return [{
                type: 'invalid_path',
                message: 'Unsafe path detected',
                location: element.location,
                severity: 'warning',
                code: 'W100',
                suggestion: 'Avoid using unsafe paths',
            }];
        }
        return [];
    },
};

const linter = new LinterEngine({
    rules: [myCustomRule],
});
```

## Results

### FileLintResult

```typescript
interface FileLintResult {
    filePath: string;
    errors: LintError[];
    warnings: LintError[];
    info: LintError[];
    valid: boolean;
    totalIssues: number;
    parseSuccess: boolean;
    parseErrors?: string[];
}
```

### DirectoryLintResult

```typescript
interface DirectoryLintResult {
    files: FileLintResult[];
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
    allValid: boolean;
    summary: {
        filesProcessed: number;
        filesWithErrors: number;
        filesWithWarnings: number;
        totalIssues: number;
    };
}
```

## Example Output

```typescript
const result = lintFile('binance.edl.yaml');

// Result structure:
{
    filePath: 'binance.edl.yaml',
    valid: false,
    parseSuccess: true,
    totalIssues: 3,
    errors: [
        {
            type: 'undefined_placeholder',
            message: "Placeholder 'invalidField' is not defined",
            location: { path: 'parsers.ticker.mapping.price', line: 42, column: 10 },
            severity: 'error',
            code: 'E001',
            suggestion: "Define 'invalidField' in the context or check for typos..."
        }
    ],
    warnings: [],
    info: []
}
```

## Integration

The linter can be integrated into build pipelines, pre-commit hooks, or CI/CD workflows:

```bash
# CLI usage (if CLI tool is built)
edl-lint exchanges/*.edl.yaml --severity error
edl-lint exchanges/ --recursive --max-errors 100
```

## Phase Implementation

This linter engine was implemented as part of Phase 3-11.3:
- Phase 3-11.1: Schema definitions
- Phase 3-11.2: Linting rules
- **Phase 3-11.3: Linter engine** ← Current
