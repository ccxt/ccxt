#pragma once

// The free-function surface the ast-transpiler C++ backend lowers operators to.
//
// These live in the GLOBAL namespace on purpose. The backend emits element access
// as `::getValue(...)` / `::setValue(...)` — deliberately qualified so a class method
// of the same name can never shadow the helper — and emits every other helper
// unqualified from inside member functions, where ordinary lookup walks out to global.
//
// Semantics follow JavaScript, not C++. Where the two differ (truthiness of an empty
// object, division always producing a float, out-of-range indexing yielding undefined)
// JavaScript wins, because the generated code was written against it.

#include "Value.h"

#include <any>
#include <string>
#include <vector>

bool isTrue (const ccxt::any& v);
// `!isDictionary(x)` etc.: the backend emits JS `!` on ccxt::any operands. JS semantics:
// `!x` is the negation of x's truthiness, exactly like isTrue. This is a MEMBER of
// ccxt::any now (see Value.h): a free operator!(const ccxt::any&) is ADL-visible for
// std::is_array<ccxt::any> — the template argument's namespace is ccxt — and makes
// every std::future<ccxt::any> static_assert ambiguous.

// ---------------------------------------------------------------------------
// element access — must be global-qualified callable
// ---------------------------------------------------------------------------

ccxt::any getValue (const ccxt::any& target, const ccxt::any& key);
// `target` is taken by const ref: dict/list are reference-semantic handles, so the
// mutation reaches every alias exactly as it would in JS.
void setValue (const ccxt::any& target, const ccxt::any& key, const ccxt::any& value);
void deleteKey (const ccxt::any& target, const ccxt::any& key);

// ---------------------------------------------------------------------------
// truthiness, equality, ordering
// ---------------------------------------------------------------------------

bool isTrue (const ccxt::any& v);
bool isEqual (const ccxt::any& a, const ccxt::any& b);
bool isGreaterThan (const ccxt::any& a, const ccxt::any& b);
bool isGreaterThanOrEqual (const ccxt::any& a, const ccxt::any& b);
bool isLessThan (const ccxt::any& a, const ccxt::any& b);
bool isLessThanOrEqual (const ccxt::any& a, const ccxt::any& b);
// note the argument order: `'k' in obj` lowers to inOp(obj, key)
bool inOp (const ccxt::any& container, const ccxt::any& key);

// ---------------------------------------------------------------------------
// arithmetic — `add` is also string concatenation, as `+` is in JS
// ---------------------------------------------------------------------------

ccxt::any add (const ccxt::any& a, const ccxt::any& b);
ccxt::any subtract (const ccxt::any& a, const ccxt::any& b);
ccxt::any multiply (const ccxt::any& a, const ccxt::any& b);
ccxt::any divide (const ccxt::any& a, const ccxt::any& b);
ccxt::any mod (const ccxt::any& a, const ccxt::any& b);

// these take a reference because they are emitted as for-loop incrementors
ccxt::any postFixIncrement (ccxt::any& v);
ccxt::any postFixDecrement (ccxt::any& v);
ccxt::any prefixUnaryPlus (const ccxt::any& v);
ccxt::any prefixUnaryNeg (const ccxt::any& v);

// ---------------------------------------------------------------------------
// type predicates (the `typeof x === '...'` lowerings)
// ---------------------------------------------------------------------------

bool isString (const ccxt::any& v);
bool isNumber (const ccxt::any& v);
bool isBool (const ccxt::any& v);
bool isDictionary (const ccxt::any& v);
bool isFunction (const ccxt::any& v);
bool isArray (const ccxt::any& v);
bool isInteger (const ccxt::any& v);

// ---------------------------------------------------------------------------
// collections
// ---------------------------------------------------------------------------

ccxt::any getArrayLength (const ccxt::any& v);
ccxt::any getStringLength (const ccxt::any& v);
ccxt::any getObjectKeys (const ccxt::any& v);
ccxt::any getObjectValues (const ccxt::any& v);
void arrayPush (const ccxt::any& arr, const ccxt::any& v);
ccxt::any pop (const ccxt::any& arr);
ccxt::any shift (const ccxt::any& arr);
ccxt::any reverse (const ccxt::any& arr);
ccxt::any concat (const ccxt::any& a, const ccxt::any& b);
ccxt::any slice (const ccxt::any& target, const ccxt::any& start, const ccxt::any& end);
bool includes (const ccxt::any& haystack, const ccxt::any& needle);
ccxt::any getIndexOf (const ccxt::any& haystack, const ccxt::any& needle);

// ---------------------------------------------------------------------------
// strings
// ---------------------------------------------------------------------------

ccxt::any toString (const ccxt::any& v);
// toString() as a plain std::string -- the same conversion, without the ccxt::any box.
// Used wherever C++ code (rather than transpiled code) needs the text.
std::string str (const ccxt::any& v);
bool startsWith (const ccxt::any& s, const ccxt::any& prefix);
bool endsWith (const ccxt::any& s, const ccxt::any& suffix);
ccxt::any trim (const ccxt::any& s);
ccxt::any split (const ccxt::any& s, const ccxt::any& sep);
ccxt::any join (const ccxt::any& arr, const ccxt::any& sep);
ccxt::any toUpperCase (const ccxt::any& s);
ccxt::any toLowerCase (const ccxt::any& s);
ccxt::any replace (const ccxt::any& s, const ccxt::any& from, const ccxt::any& to);
ccxt::any replaceAll (const ccxt::any& s, const ccxt::any& from, const ccxt::any& to);
ccxt::any padStart (const ccxt::any& s, const ccxt::any& width, const ccxt::any& pad);
ccxt::any padEnd (const ccxt::any& s, const ccxt::any& width, const ccxt::any& pad);
ccxt::any toFixed (const ccxt::any& v, const ccxt::any& digits);

// ---------------------------------------------------------------------------
// math
// ---------------------------------------------------------------------------

ccxt::any mathMin (const ccxt::any& a, const ccxt::any& b);
ccxt::any mathMax (const ccxt::any& a, const ccxt::any& b);
ccxt::any mathAbs (const ccxt::any& v);
ccxt::any mathFloor (const ccxt::any& v);
ccxt::any mathCeil (const ccxt::any& v);
ccxt::any mathRound (const ccxt::any& v);
ccxt::any mathPow (const ccxt::any& a, const ccxt::any& b);
ccxt::any mathLog (const ccxt::any& v);

// ---------------------------------------------------------------------------
// misc
// ---------------------------------------------------------------------------

void consoleLog (const ccxt::any& v);
ccxt::any getCurrentTimestamp ();
void assertTrue (const ccxt::any& condition, const ccxt::any& message = ccxt::any {});
// assertTrue counts its calls so a bare failing assert reports which one it was; the
// test runner resets the count before each test.
void resetAssertionOrdinal ();

ccxt::any jsonStringify (const ccxt::any& v);
ccxt::any parseInt (const ccxt::any& v);
ccxt::any parseFloat (const ccxt::any& v);
ccxt::any parseToInt (const ccxt::any& v);

// TS `null` is emitted verbatim. Defining it as a value rather than rewriting the text
// keeps the transformation out of the regex layer, where it would be unsafe.
inline const ccxt::any null = ccxt::any {};

// ---------------------------------------------------------------------------
// precision constants (ts/src/base/functions/number.ts), referenced unqualified
// ---------------------------------------------------------------------------

inline const ccxt::any TRUNCATE           = 0;
inline const ccxt::any ROUND              = 1;
inline const ccxt::any ROUND_UP           = 2;
inline const ccxt::any ROUND_DOWN         = 3;
inline const ccxt::any DECIMAL_PLACES     = 2;
inline const ccxt::any SIGNIFICANT_DIGITS = 3;
inline const ccxt::any TICK_SIZE          = 4;
inline const ccxt::any NO_PADDING         = 5;
inline const ccxt::any PAD_WITH_ZERO      = 6;

// Emitted for `throw new x[a](msg)` where the class is chosen at runtime; resolved
// against the generated error registry in Errors.h.
[[noreturn]] void throwDynamicException (const ccxt::any& name, const ccxt::any& message);

// `otherExchange.describe()` appears only on WS describe-merge paths, an explicit
// non-goal this iteration; it resolves to an empty descriptor rather than failing to
// compile.
ccxt::any describeOf (const ccxt::any& exchange);

// WS layer free helpers: `x.reset (snapshot)`, `side.store (p, s)`, `side.storeArray
// (delta)`, `book.limit ()`, `cache.append (item)`, `cache.getLimit (s, l)` and
// `cache.clear ()` all funnel through these (the transpiler rewrites member calls on
// ccxt::any receivers to the free form). Every one mutates through the shared store.
ccxt::any resetOrderBook (const ccxt::any& book, const ccxt::any& snapshot);
ccxt::any wsStore (const ccxt::any& side, const ccxt::any& price, const ccxt::any& size);
ccxt::any wsStoreArray (const ccxt::any& side, const ccxt::any& delta);
ccxt::any wsLimit (const ccxt::any& bookOrSide);
ccxt::any wsAppend (const ccxt::any& cache, const ccxt::any& item);
ccxt::any wsGetLimit (const ccxt::any& cache, const ccxt::any& symbol, const ccxt::any& limit);
ccxt::any wsClientFuture (const ccxt::any& client, const ccxt::any& messageHash);
ccxt::any wsClientReusableFuture (const ccxt::any& client, const ccxt::any& messageHash);
ccxt::any wsClientSend (const ccxt::any& client, const ccxt::any& message);
ccxt::any wsClientReset (const ccxt::any& client, const ccxt::any& error);
ccxt::any wsFutureResolve (const ccxt::any& future, const ccxt::any& value = ccxt::any {});
ccxt::any wsFutureReject (const ccxt::any& future, const ccxt::any& error = ccxt::any {});
ccxt::any makeExchangeError (const ccxt::any& errorClass, const ccxt::any& message);
ccxt::any wsClear (const ccxt::any& cache);
ccxt::any wsReset (const ccxt::any& book);
ccxt::any wsClientResolve (const ccxt::any& client, const ccxt::any& result, const ccxt::any& messageHash);
ccxt::any wsClientReject (const ccxt::any& client, const ccxt::any& reason, const ccxt::any& messageHash);
ccxt::any wsClientFuture (const ccxt::any& client, const ccxt::any& messageHash);
ccxt::any wsClientSend (const ccxt::any& client, const ccxt::any& message);
ccxt::any wsClientReset (const ccxt::any& client, const ccxt::any& error);
// Recursively converts ws values (books, sides, caches) to plain dict/list shapes so
// structural comparisons (the test equals) can treat them like their JS originals.
ccxt::any wsToPlain (const ccxt::any& v);
