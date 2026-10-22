#!/usr/bin/env bash
# Runs a cargo command and recovers from a corrupted crate extraction.
#
# usage: build/utils/cargo-heal.sh <command...>     e.g. cargo-heal.sh npm run buildRust
#
# The self-hosted runners share one CARGO_HOME (/mnt/cache/cargo). A crate unpacked under
# registry/src can end up incomplete (files missing next to an intact `.cargo-ok` marker),
# and cargo trusts that marker forever, so every later build dies with e.g.
#   failed to parse manifest at `.../registry/src/<index>/bitvec-1.0.1/Cargo.toml`
#   no targets specified in the manifest
# registry/src is only derived from registry/cache/*.crate, so removing the broken crate
# directory makes cargo unpack it again. Only directories cargo itself reported as
# unreadable are removed, which keeps concurrent jobs on the same cache untouched.

set -uo pipefail

max_attempts=5
log="$(mktemp)"
trap 'rm -f "$log"' EXIT
previous=""

for attempt in $(seq 1 "$max_attempts"); do
    "$@" 2>&1 | tee "$log"
    status="${PIPESTATUS[0]}"
    if [ "$status" -eq 0 ]; then
        exit 0
    fi
    # cargo >= 1.9x names the path: failed to parse manifest at `<registry/src dir>/Cargo.toml`
    broken="$(grep -E "failed to parse manifest at|failed to read|couldn't read|No such file or directory" "$log" \
        | grep -oE "/[^\`' ]*/registry/src/[^/\`' ]+/[^/\`' ]+")"
    # older cargo only names the crate: ignoring invalid dependency `<crate>` which is missing a lib target
    cargo_home="${CARGO_HOME:-$HOME/.cargo}"
    for crate in $(grep -oE "ignoring invalid dependency \`[^\`]+\` which is missing a lib target" "$log" | cut -d '`' -f 2 | sort -u); do
        broken="$broken"$'\n'"$(ls -d "$cargo_home"/registry/src/*/"$crate"-[0-9]* 2>/dev/null)"
    done
    broken="$(printf '%s\n' "$broken" | grep -v '^$' | sort -u)"
    if [ -z "$broken" ] || [ "$broken" = "$previous" ]; then
        exit "$status"
    fi
    previous="$broken"
    echo "cargo-heal: attempt $attempt failed on corrupted crate sources, removing:"
    while IFS= read -r dir; do
        echo "  $dir"
        rm -rf -- "$dir"
    done <<< "$broken"
done

exit "$status"
