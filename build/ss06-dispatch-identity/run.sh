#!/usr/bin/env bash
# SS-06 javac harness driver — String-vs-Object dispatch and value identity for the four
# consumer calls (Helpers.isEqual / isTrue / inOp, SafeMethods.safeValue*).
#
#   1. compiles DispatchIdentity.java + the two call-site probes against the BUILT
#      classes (java/lib/build/classes/java/main, produced by ./gradlew compileJava),
#   2. runs the reflection + value table and fails on any divergence,
#   3. javap -c diffs the String-typed vs Object-typed call-site probes — the
#      invocation descriptors must be byte-identical.
#
# Usage:  build/ss06-dispatch-identity/run.sh   (from anywhere; needs jabba-free javac/java/javap on PATH)
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
CLASSES="$ROOT/java/lib/build/classes/java/main"

if [ ! -d "$CLASSES" ]; then
    echo "missing $CLASSES — run (cd java && ./gradlew compileJava) first" >&2
    exit 2
fi

# Jackson is only needed because Helpers.java/JsoHelper link it at class-init time.
JACKSON_JARS=""
for jar in $(find /root/.gradle/caches/modules-2 -name 'jackson-databind-2.*.jar' -o -name 'jackson-core-2.*.jar' -o -name 'jackson-annotations-2.*.jar' 2>/dev/null | sort); do
    JACKSON_JARS="$JACKSON_JARS:$jar"
done
CLASSPATH="$CLASSES$JACKSON_JARS"

OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

echo "== compiling harness against $CLASSES"
javac -cp "$CLASSPATH" -d "$OUT" \
    "$HERE/DispatchIdentity.java" "$HERE/CallSiteString.java" "$HERE/CallSiteObject.java" || exit 1

echo
java -cp "$OUT:$CLASSPATH" DispatchIdentity
HARNESS_STATUS=$?
if [ $HARNESS_STATUS -ne 0 ]; then
    echo "harness FAILED" >&2
    exit $HARNESS_STATUS
fi

echo
echo "== bytecode: the invokestatic/invokevirtual lines of the two call-site probes"
javap -c -p -cp "$OUT" CallSiteString \
    | grep -E 'invoke(static|virtual|interface)' \
    | sed 's/^ *[0-9]*: //' > "$OUT/callsString.txt"
javap -c -p -cp "$OUT" CallSiteObject \
    | grep -E 'invoke(static|virtual|interface)' \
    | sed 's/^ *[0-9]*: //' > "$OUT/callsObject.txt"
echo "--- CallSiteString (String-typed arguments)"
cat "$OUT/callsString.txt"
echo "--- CallSiteObject (Object-typed arguments)"
cat "$OUT/callsObject.txt"
if diff -u "$OUT/callsString.txt" "$OUT/callsObject.txt" > "$OUT/calls.diff"; then
    echo "--- diff: IDENTICAL — String and Object arguments compile to the same consumers"
else
    echo "--- diff:" >&2
    cat "$OUT/calls.diff" >&2
    echo "bytecode probes DIVERGED" >&2
    exit 1
fi

echo
echo "RESULT: PASS"
