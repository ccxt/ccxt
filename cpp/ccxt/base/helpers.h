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

bool isTrue (const std::any& v);
// `!isDictionary(x)` etc.: the backend emits JS `!` on std::any operands. JS semantics:
// `!x` is the negation of x's truthiness, exactly like isTrue. Lives in namespace ccxt
// (NOT global) — a global operator!(const std::any&) makes every STL `!` ambiguous via
// std::any's converting constructor (shared_ptr, vector<bool>::reference, …).
namespace ccxt {
inline bool operator! (const std::any& v) {
    return !isTrue (v);
}
}

// ---------------------------------------------------------------------------
// element access — must be global-qualified callable
// ---------------------------------------------------------------------------

std::any getValue (const std::any& target, const std::any& key);
// `target` is taken by const ref: dict/list are reference-semantic handles, so the
// mutation reaches every alias exactly as it would in JS.
void setValue (const std::any& target, const std::any& key, const std::any& value);
void deleteKey (const std::any& target, const std::any& key);

// ---------------------------------------------------------------------------
// truthiness, equality, ordering
// ---------------------------------------------------------------------------

bool isTrue (const std::any& v);
bool isEqual (const std::any& a, const std::any& b);
bool isGreaterThan (const std::any& a, const std::any& b);
bool isGreaterThanOrEqual (const std::any& a, const std::any& b);
bool isLessThan (const std::any& a, const std::any& b);
bool isLessThanOrEqual (const std::any& a, const std::any& b);
// note the argument order: `'k' in obj` lowers to inOp(obj, key)
bool inOp (const std::any& container, const std::any& key);

// ---------------------------------------------------------------------------
// arithmetic — `add` is also string concatenation, as `+` is in JS
// ---------------------------------------------------------------------------

std::any add (const std::any& a, const std::any& b);
std::any subtract (const std::any& a, const std::any& b);
std::any multiply (const std::any& a, const std::any& b);
std::any divide (const std::any& a, const std::any& b);
std::any mod (const std::any& a, const std::any& b);

// these take a reference because they are emitted as for-loop incrementors
std::any postFixIncrement (std::any& v);
std::any postFixDecrement (std::any& v);
std::any prefixUnaryPlus (const std::any& v);
std::any prefixUnaryNeg (const std::any& v);

// ---------------------------------------------------------------------------
// type predicates (the `typeof x === '...'` lowerings)
// ---------------------------------------------------------------------------

bool isString (const std::any& v);
bool isNumber (const std::any& v);
bool isBool (const std::any& v);
bool isDictionary (const std::any& v);
bool isFunction (const std::any& v);
bool isArray (const std::any& v);
bool isInteger (const std::any& v);

// ---------------------------------------------------------------------------
// collections
// ---------------------------------------------------------------------------

std::any getArrayLength (const std::any& v);
std::any getStringLength (const std::any& v);
std::any getObjectKeys (const std::any& v);
std::any getObjectValues (const std::any& v);
void arrayPush (const std::any& arr, const std::any& v);
std::any pop (const std::any& arr);
std::any shift (const std::any& arr);
std::any reverse (const std::any& arr);
std::any concat (const std::any& a, const std::any& b);
std::any slice (const std::any& target, const std::any& start, const std::any& end);
bool includes (const std::any& haystack, const std::any& needle);
std::any getIndexOf (const std::any& haystack, const std::any& needle);

// ---------------------------------------------------------------------------
// strings
// ---------------------------------------------------------------------------

std::any toString (const std::any& v);
// toString() as a plain std::string -- the same conversion, without the std::any box.
// Used wherever C++ code (rather than transpiled code) needs the text.
std::string str (const std::any& v);
bool startsWith (const std::any& s, const std::any& prefix);
bool endsWith (const std::any& s, const std::any& suffix);
std::any trim (const std::any& s);
std::any split (const std::any& s, const std::any& sep);
std::any join (const std::any& arr, const std::any& sep);
std::any toUpperCase (const std::any& s);
std::any toLowerCase (const std::any& s);
std::any replace (const std::any& s, const std::any& from, const std::any& to);
std::any replaceAll (const std::any& s, const std::any& from, const std::any& to);
std::any padStart (const std::any& s, const std::any& width, const std::any& pad);
std::any padEnd (const std::any& s, const std::any& width, const std::any& pad);
std::any toFixed (const std::any& v, const std::any& digits);

// ---------------------------------------------------------------------------
// math
// ---------------------------------------------------------------------------

std::any mathMin (const std::any& a, const std::any& b);
std::any mathMax (const std::any& a, const std::any& b);
std::any mathAbs (const std::any& v);
std::any mathFloor (const std::any& v);
std::any mathCeil (const std::any& v);
std::any mathRound (const std::any& v);
std::any mathPow (const std::any& a, const std::any& b);
std::any mathLog (const std::any& v);

// ---------------------------------------------------------------------------
// misc
// ---------------------------------------------------------------------------

void consoleLog (const std::any& v);
std::any getCurrentTimestamp ();
void assertTrue (const std::any& condition, const std::any& message = std::any {});
// assertTrue counts its calls so a bare failing assert reports which one it was; the
// test runner resets the count before each test.
void resetAssertionOrdinal ();

std::any jsonStringify (const std::any& v);
std::any parseInt (const std::any& v);
std::any parseFloat (const std::any& v);
std::any parseToInt (const std::any& v);

// TS `null` is emitted verbatim. Defining it as a value rather than rewriting the text
// keeps the transformation out of the regex layer, where it would be unsafe.
inline const std::any null = std::any {};

// ---------------------------------------------------------------------------
// precision constants (ts/src/base/functions/number.ts), referenced unqualified
// ---------------------------------------------------------------------------

inline const std::any TRUNCATE           = 0;
inline const std::any ROUND              = 1;
inline const std::any ROUND_UP           = 2;
inline const std::any ROUND_DOWN         = 3;
inline const std::any DECIMAL_PLACES     = 2;
inline const std::any SIGNIFICANT_DIGITS = 3;
inline const std::any TICK_SIZE          = 4;
inline const std::any NO_PADDING         = 5;
inline const std::any PAD_WITH_ZERO      = 6;

// Emitted for `throw new x[a](msg)` where the class is chosen at runtime; resolved
// against the generated error registry in Errors.h.
[[noreturn]] void throwDynamicException (const std::any& name, const std::any& message);

// `otherExchange.describe()` appears only on WS describe-merge paths, an explicit
// non-goal this iteration; it resolves to an empty descriptor rather than failing to
// compile.
std::any describeOf (const std::any& exchange);

// WS layer free helpers: `x.reset (snapshot)`, `side.store (p, s)`, `side.storeArray
// (delta)`, `book.limit ()`, `cache.append (item)`, `cache.getLimit (s, l)` and
// `cache.clear ()` all funnel through these (the transpiler rewrites member calls on
// std::any receivers to the free form). Every one mutates through the shared store.
std::any resetOrderBook (const std::any& book, const std::any& snapshot);
std::any wsStore (const std::any& side, const std::any& price, const std::any& size);
std::any wsStoreArray (const std::any& side, const std::any& delta);
std::any wsLimit (const std::any& bookOrSide);
std::any wsAppend (const std::any& cache, const std::any& item);
std::any wsGetLimit (const std::any& cache, const std::any& symbol, const std::any& limit);
std::any wsClientFuture (const std::any& client, const std::any& messageHash);
std::any wsClientReusableFuture (const std::any& client, const std::any& messageHash);
std::any wsClientSend (const std::any& client, const std::any& message);
std::any wsClientReset (const std::any& client, const std::any& error);
std::any wsFutureResolve (const std::any& future, const std::any& value = std::any {});
std::any wsFutureReject (const std::any& future, const std::any& error = std::any {});
std::any makeExchangeError (const std::any& errorClass, const std::any& message);
std::any wsClear (const std::any& cache);
std::any wsReset (const std::any& book);
std::any wsClientResolve (const std::any& client, const std::any& result, const std::any& messageHash);
std::any wsClientReject (const std::any& client, const std::any& reason, const std::any& messageHash);
std::any wsClientFuture (const std::any& client, const std::any& messageHash);
std::any wsClientSend (const std::any& client, const std::any& message);
std::any wsClientReset (const std::any& client, const std::any& error);
// Recursively converts ws values (books, sides, caches) to plain dict/list shapes so
// structural comparisons (the test equals) can treat them like their JS originals.
std::any wsToPlain (const std::any& v);
