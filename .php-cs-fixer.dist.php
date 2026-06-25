<?php

// PHP CS Fixer configuration for ccxt.
//
// Style target: PSR-12 compatible, but using the long array() syntax
// everywhere (NOT the short [] syntax) to match the rest of the ccxt PHP
// codebase and the output of the TypeScript -> PHP transpiler
// (build/transpile.ts). For this reason we base on @PSR12 (which does not
// touch array syntax) and explicitly force `array_syntax => long` instead of
// using @PER-CS (which would rewrite array() into []).
//
// Run as a check (dry-run) via:  npm run check-php-style
// Auto-fix locally via:          php vendor/bin/php-cs-fixer fix

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . '/php')
    ->name('*.php')
    ->exclude([
        'static_dependencies', // vendored third-party code (php/static_dependencies)
        'protobuf',            // generated protobuf stubs (php/protobuf)
    ]);

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(false)
    ->setIndent('    ')
    ->setLineEnding("\n")
    ->setRules([
        '@PSR12' => true,
        // use array() everywhere instead of the short [] syntax
        'array_syntax' => ['syntax' => 'long'],
    ])
    ->setFinder($finder);
