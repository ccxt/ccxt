#!/bin/bash
# slice the self-contained native-helper section of build/csharpTranspiler.ts into a replay module
cd "$(dirname "$0")/../../.." || exit 2
s=$(grep -n '^const CSHARP_DECLARED_COUNT_TYPES' build/csharpTranspiler.ts | cut -d: -f1)
e=$(awk -v s=$(grep -n '^export function nativeDeclaredHelperCalls' build/csharpTranspiler.ts | cut -d: -f1) 'NR>s && /^}/{print NR; exit}' build/csharpTranspiler.ts)
sed -n "${s},${e}p" build/csharpTranspiler.ts > research/r16/cs-istrue-native/native-slice.ts
