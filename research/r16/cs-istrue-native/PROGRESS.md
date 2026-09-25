# CS-ISTRUE-NATIVE
Base 7f231e56209. build/csharpTranspiler.ts: csharpHelperTruthEdits in the native-helper section, run only in the
final nativeDeclaredHelperCalls pass (objectNull=true, after retypeIdentifierCopies): isTrue(x) -> `x` (declared bool),
`(x == true)` (declared bool?); declaration lookup = csharpHelperReceiverType (one type per method, declared before read).
Replay over j2044 cs/ccxt/exchanges (research replay.ts + native-slice via extract.sh): isTrue 483 -> 114,
368 changed lines, checkdiff.py: pairs 368 bad 0 (selftest PASS). `!isTrue(x)` -> `!(x == true)` / `!x` falls out.
Remaining: 99 object params (TS already `boolean`; C# printer prints params object -> ts/src OPTION 3 moves nothing;
needs a signature retype of bool params base+overrides, generator/post-pass work), 11 non-ident, 4 object locals.
