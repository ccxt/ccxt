#pragma once

// ---------------------------------------------------------------------------
// JsonView — the lazy json view machinery for the ccxt C++ port.
//
// Big response payloads (>= 1MB, the simdjson path) are parsed into a LAZY
// view instead of a materialised `any` tree: the padded buffer + parser +
// document live in a heap JsonViewRoot shared by every view. Field reads on
// the generated surface resolve through find_field_unordered (which cycles
// around within the object, so access order is irrelevant) on ONE shared
// sequential cursor; array elements are advanced one at a time (O(1) in the
// sequential loops the transpiled code emits). Nested containers inside an
// element materialise eagerly via a sub-parse of their byte range, and every
// scalar materialises on access with EXACTLY the eager simdToAny semantics
// (floating -> double, 19+ digit ints -> string), so serialised output stays
// byte-identical. A mutex per root serialises the shared cursor; the rare
// out-of-order access falls back to rewind + at_pointer (O(index), correct).
// ---------------------------------------------------------------------------

#include "Value.h"

#include <simdjson.h>

#include <cstdint>
#include <memory>
#include <mutex>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

namespace ccxt {

struct JsonViewRoot {
    simdjson::padded_string buffer;
    simdjson::ondemand::parser parser;
    simdjson::ondemand::document doc;
    std::mutex mutex;

    // the shared sequential cursor. cursorHot means doc's iterator sits at
    // element (curArrayId, curIdx) with `obj` open at that element's start.
    bool cursorHot = false;
    std::uint32_t curArrayId = 0;
    std::size_t curIdx = 0;
    std::optional<simdjson::ondemand::array_iterator> iter;
    std::optional<simdjson::ondemand::object> obj;

    // top-level array metadata, keyed by the array's byte offset in the buffer
    std::unordered_map<std::uint32_t, std::string> arrayPaths;  // the root key
    std::unordered_map<std::uint32_t, std::size_t> arraySizes;  // raw byte size
    // per-array element start offsets, filled as the cursor advances
    std::unordered_map<std::uint32_t, std::vector<std::uint32_t>> elemStarts;
    // per-array element (start, end) byte ranges, scanned once from the
    // buffer — the cursor-independent source of truth for materialisation
    std::unordered_map<std::uint32_t,
                       std::vector<std::pair<std::uint32_t, std::uint32_t>>>
        elemRanges;

    // materialised sub-values, keyed by (nodeOffset << 32 | idx)
    std::unordered_map<std::uint64_t, ccxt::any> materialized;
};

// the recursive simdjson -> any conversion (moved out of ExchangeBase.cpp so
// both the eager and the lazy path share ONE implementation)
ccxt::any simdToAny (simdjson::ondemand::value v);

// view-aware accessors (implemented in JsonView.cpp)
const jsonView& viewOf (const ccxt::any& v);
ccxt::any viewGet (const jsonView& v, const ccxt::any& key);
bool viewHasKey (const jsonView& v, const ccxt::any& key);
ccxt::any viewArrayLength (const jsonView& v);
ccxt::any viewElement (const jsonView& v, std::uint32_t idx);
ccxt::any viewMaterialize (const jsonView& v);

} // namespace ccxt
