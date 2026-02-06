/**
 * Fragment Reference Parsing Example
 *
 * This example demonstrates how to parse fragment references from EDL documents,
 * validate them against a registry, and detect circular dependencies.
 */

import {
    FragmentReferenceParser,
    parseFragmentReferences,
    validateFragmentReferences,
    findCircularFragmentReferences,
} from '../src/parsing/fragments.js';
import {
    createFragmentRegistry,
    type FragmentDefinition,
} from '../src/schemas/fragments.js';
import type { AuthMethod, ParserDefinition } from '../src/types/edl.js';

// Example 1: Basic Fragment Reference Parsing
console.log('=== Example 1: Basic Fragment Reference Parsing ===\n');

const edlDocument = {
    exchange: {
        id: 'example',
        name: 'Example Exchange',
    },
    auth: {
        $ref: 'hmac-sha256-auth',
    },
    api: {
        public: {
            $ref: 'rest-public-endpoints',
        },
        private: {
            $ref: 'rest-private-endpoints',
        },
    },
    parsers: {
        ticker: {
            $use: {
                fragment: 'standard-ticker-parser',
                with: {
                    basePath: 'data.ticker',
                    format: 'array',
                },
            },
        },
        orderBook: {
            $ref: 'standard-orderbook-parser',
            override: {
                isArray: true,
            },
        },
    },
};

const parser = new FragmentReferenceParser();
const references = parser.parse(edlDocument);

console.log(`Found ${references.length} fragment references:\n`);
references.forEach((ref, index) => {
    console.log(`${index + 1}. Fragment: ${ref.fragmentId}`);
    console.log(`   Type: ${ref.referenceType}`);
    console.log(`   Context: ${ref.context}`);
    console.log(`   Location: ${ref.location.path}`);
    if (ref.arguments) {
        console.log(`   Arguments:`, ref.arguments);
    }
    if (ref.overrides) {
        console.log(`   Overrides:`, ref.overrides);
    }
    console.log('');
});

// Example 2: Fragment Registry and Validation
console.log('\n=== Example 2: Fragment Registry and Validation ===\n');

const registry = createFragmentRegistry();

// Register some fragments
const hmacAuthFragment: FragmentDefinition = {
    id: 'hmac-sha256-auth',
    type: 'auth',
    name: 'HMAC SHA256 Authentication',
    content: {
        type: 'hmac',
        algorithm: 'sha256',
        encoding: 'hex',
        location: 'header',
    } as AuthMethod,
    metadata: {
        version: '1.0.0',
        author: 'CCXT',
        tags: ['auth', 'hmac', 'common'],
    },
};

const tickerParserFragment: FragmentDefinition = {
    id: 'standard-ticker-parser',
    type: 'parser',
    name: 'Standard Ticker Parser',
    content: {
        source: '{{basePath}}',
        isArray: false,
        mapping: {
            symbol: { path: 'symbol' },
            last: { path: 'last', transform: 'safeNumber' },
            bid: { path: 'bid', transform: 'safeNumber' },
            ask: { path: 'ask', transform: 'safeNumber' },
            volume: { path: 'volume', transform: 'safeNumber' },
        },
    } as any,
    parameters: [
        { name: 'basePath', type: 'string', required: true },
        { name: 'format', type: 'string', default: 'object' },
    ],
};

registry.register(hmacAuthFragment);
registry.register(tickerParserFragment);

console.log(`Registered ${Object.keys(registry.fragments).length} fragments\n`);

// Validate references
const validationErrors = validateFragmentReferences(references, registry);

if (validationErrors.length === 0) {
    console.log('All fragment references are valid!');
} else {
    console.log(`Found ${validationErrors.length} validation errors:\n`);
    validationErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.error}`);
        console.log(`   Fragment: ${error.reference.fragmentId}`);
        console.log(`   Location: ${error.reference.location.path}\n`);
    });
}

// Example 3: Circular Dependency Detection
console.log('\n=== Example 3: Circular Dependency Detection ===\n');

// Create a registry with circular dependencies
const circularRegistry = createFragmentRegistry();

const fragmentA: FragmentDefinition = {
    id: 'fragment-a',
    type: 'parser',
    name: 'Fragment A',
    content: {
        source: 'response',
        mapping: {
            nested: { $ref: 'fragment-b' },
        },
    } as any,
};

const fragmentB: FragmentDefinition = {
    id: 'fragment-b',
    type: 'parser',
    name: 'Fragment B',
    content: {
        source: 'response',
        mapping: {
            nested: { $ref: 'fragment-a' }, // Circular reference!
        },
    } as any,
};

circularRegistry.register(fragmentA);
circularRegistry.register(fragmentB);

const circularDoc = {
    parsers: {
        main: { $ref: 'fragment-a' },
    },
};

const circularRefs = parseFragmentReferences(circularDoc);
const cycles = findCircularFragmentReferences(circularRefs, circularRegistry);

if (cycles.length > 0) {
    console.log('Circular dependencies detected:');
    cycles.forEach((cycle, index) => {
        console.log(`${index + 1}. ${cycle.join(' -> ')}`);
    });
} else {
    console.log('No circular dependencies detected.');
}

// Example 4: Different Reference Syntaxes
console.log('\n=== Example 4: Different Reference Syntaxes ===\n');

const syntaxExamples = {
    // Simple $ref
    simpleRef: {
        $ref: 'my-fragment',
    },

    // $ref with inline overrides
    refWithOverrides: {
        $ref: 'base-fragment',
        customField: 'customValue',
        algorithm: 'sha512',
    },

    // $use with arguments
    useWithArgs: {
        $use: {
            fragment: 'parameterized-fragment',
            with: {
                param1: 'value1',
                param2: 42,
            },
        },
    },

    // $use with simple string
    simpleUse: {
        $use: 'simple-fragment',
    },

    // @include syntax
    include: {
        '@include': 'included-fragment',
    },

    // extends syntax
    extends: {
        extends: 'base-fragment',
        additionalField: 'value',
    },
};

const syntaxParser = new FragmentReferenceParser();
const syntaxRefs = syntaxParser.parse(syntaxExamples);

console.log(`Parsed ${syntaxRefs.length} different reference syntaxes:\n`);
syntaxRefs.forEach((ref, index) => {
    console.log(`${index + 1}. ${ref.referenceType}: ${ref.fragmentId}`);
    if (ref.arguments) {
        console.log(`   Arguments:`, JSON.stringify(ref.arguments));
    }
    if (ref.overrides) {
        console.log(`   Overrides:`, JSON.stringify(ref.overrides));
    }
    console.log('');
});

// Example 5: Context Detection
console.log('\n=== Example 5: Context Detection ===\n');

const contextExamples = {
    auth: { $ref: 'auth-fragment' },
    api: {
        public: { $ref: 'api-fragment' },
    },
    parsers: {
        ticker: { $ref: 'parser-fragment' },
    },
    errors: {
        patterns: [{ $ref: 'error-fragment' }],
    },
    markets: {
        endpoint: '/markets',
        parser: { $ref: 'markets-fragment' },
    },
};

const contextParser = new FragmentReferenceParser();
const contextRefs = contextParser.parse(contextExamples);

console.log('Fragment contexts detected:\n');
contextRefs.forEach((ref) => {
    console.log(`- ${ref.fragmentId}: ${ref.context} (${ref.location.path})`);
});

console.log('\n=== Examples Complete ===\n');
