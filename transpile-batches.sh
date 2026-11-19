#!/usr/bin/env bash
# Transpile all exchanges in batches of N (memory-safe), logging per batch.
set -u
cd /root/new-lang/ccxt
BATCH_SIZE="${1:-10}"
START="${2:-0}"

ids=$(python3 -c "
import json
ids = sorted(json.load(open('exchanges.json'))['ids'])
print(' '.join(ids))
")

read -ra ALL <<< "$ids"
TOTAL=${#ALL[@]}
for ((i = START; i < TOTAL; i += BATCH_SIZE)); do
    batch=("${ALL[@]:i:BATCH_SIZE}")
    echo "=== batch from $i: ${batch[*]}"
    npx tsx build/cppTranspiler.ts "${batch[@]}" --force > "/tmp/transpile-batch-$i.log" 2>&1
    ec=$?
    ok=$(grep -c 'Transpiled' "/tmp/transpile-batch-$i.log")
    echo "=== batch $i exit=$ec transpiled=$ok / wanted=${#batch[@]}"
done
