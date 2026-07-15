<?php

// PHP CS Fixer configuration for ccxt.
//
// Scope: the transpiler-generated *exchange* source files only -
//   php/<id>.php, php/async/<id>.php, php/pro/<id>.php
// (exchange ids are lowercase). It deliberately does NOT cover:
//   - hand-written base / error classes (php/Exchange.php, php/Precise.php,
//     php/Throttler.php, the *Error.php classes, php/pro/Client.php, ...) - these
//     are Uppercase-named and maintained by hand,
//   - transpiled tests (php/test/**, php/pro/test/**),
//   - auto-generated abstract api signatures (php/abstract/**, php/async/abstract/**),
//   - vendored third-party code (php/static_dependencies) and protobuf stubs.
// Those are out of scope for this style gate; here we only assert that the code the
// TypeScript -> PHP transpiler (build/transpile.ts) emits is style-clean.
//
// Style target: PSR-12 compatible, but with the long array() syntax everywhere (not
// the short [] syntax) and K&R / one-true-brace placement (opening brace on the same
// line as the signature), matching what the transpiler emits. We therefore base on
// @PSR12 and override array_syntax + braces_position instead of using @PER-CS.
//
// Run as a check (dry-run) via:  npm run check-php-style
// Auto-fix locally via:          php vendor/bin/php-cs-fixer fix

$finder = PhpCsFixer\Finder::create()
    ->in([
        __DIR__ . '/php',
        __DIR__ . '/php/async',
        __DIR__ . '/php/pro',
    ])
    ->depth(0)                    // only files directly in those dirs (skip test/, abstract/, base/, static_dependencies/, protobuf/)
    ->notName('/^[A-Z].*\.php$/'); // exchange ids are lowercase; exclude the Uppercase-named hand-written base/error classes (Exchange.php, Precise.php, Throttler.php, *Error.php, Client.php, OrderBook.php, ...)

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(false)
    ->setIndent('    ')
    ->setLineEnding("\n")
    ->setRules([
        '@PSR12' => true,
        // use array() everywhere instead of the short [] syntax
        'array_syntax' => ['syntax' => 'long'],
        // ccxt's transpiler emits K&R / one-true-brace style (opening brace on the
        // same line as the class/function signature), so enforce that instead of the
        // PSR-12 "brace on its own line" placement.
        'braces_position' => [
            'classes_opening_brace' => 'same_line',
            'functions_opening_brace' => 'same_line',
            'anonymous_classes_opening_brace' => 'same_line',
            'anonymous_functions_opening_brace' => 'same_line',
            'control_structures_opening_brace' => 'same_line',
            'allow_single_line_empty_anonymous_classes' => true,
            'allow_single_line_anonymous_functions' => true,
        ],
        // disabled: the regex transpiler cannot reliably satisfy these for the few
        // remaining cases (comment indentation carried over from the .ts source, and
        // a ternary whose method-reference branch loses a space before ":"). Enforcing
        // them would make the gate red on a handful of files for cosmetic reasons.
        'statement_indentation' => false,
        'ternary_operator_spaces' => false,
    ])
    ->setFinder($finder);
