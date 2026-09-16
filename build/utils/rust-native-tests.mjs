import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function needsRustNativeTests(paths) {
    return paths.some(path =>
        (path.startsWith('rust/ccxt-base/') && !path.endsWith('.md')) ||
        path.startsWith('ts/src/base/') ||
        path.startsWith('build/rust') ||
        // Rust helpers outside the build/rust* family must be listed here.
        [
            'rust/Cargo.toml', 'rust/Cargo.lock',
            'build/generateRustWrappers.ts',
            'build/granular-rust-build.ts', 'build/cache-remove-call.js',
            'package.json', 'package-lock.json',
            '.github/workflows/rust.yml',
            'build/utils/rust-native-tests.mjs',
            'build/tests/test.rust-native-tests.mjs',
        ].includes(path)
    );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    // checkout fetch-depth: 2 includes the PR merge commit and its base parent.
    // Do not suppress git errors: an unavailable comparison must fail CI.
    const paths = execFileSync('git', ['diff', '--name-only', '-z', 'HEAD^1', 'HEAD'], { encoding: 'utf8' }).split('\0').filter(Boolean);
    console.log(`enabled=${needsRustNativeTests(paths)}`);
}
