#include "JsonView.h"
#include "helpers.h"

#include <cstring>

#ifdef CCXT_HAS_SIMDJSON

namespace ccxt {

// ---------------------------------------------------------------------------
// the eager recursive conversion (moved from ExchangeBase.cpp so both the
// eager and the lazy path share ONE implementation). Number semantics mirror
// the pre-pass pipeline exactly: integer literals of 19+ digits stay exact
// strings, shorter integers are int64, floats are doubles. Object field order
// is document order.
// ---------------------------------------------------------------------------
ccxt::any simdToAny (simdjson::ondemand::value v) {
    using simdjson::ondemand::json_type;
    switch (v.type ().value ()) {
    case json_type::null:
        return ccxt::any {};
    case json_type::boolean:
        return ccxt::any (v.get_bool ().value ());
    case json_type::string:
        return ccxt::any (
            std::string (std::string_view (v.get_string ().value ())));
    case json_type::number: {
        const simdjson::ondemand::number_type ntype =
            v.get_number_type ().value ();
        if (ntype == simdjson::ondemand::number_type::floating_point_number) {
            return ccxt::any (v.get_double ().value ());
        }
        const std::string_view raw = v.raw_json_token ();
        std::size_t digits = raw.size ();
        if (!raw.empty () && raw[0] == '-') {
            digits--;
        }
        if (digits >= 19) {
            return ccxt::any (std::string (raw));   // exact, rides as a string
        }
        return ccxt::any (static_cast<long long> (v.get_int64 ().value ()));
    }
    case json_type::array: {
        list out;
        for (auto item : v.get_array ()) {
            out.push (simdToAny (item.value ()));
        }
        return ccxt::any (out);
    }
    case json_type::object: {
        dict out;
        for (auto field : v.get_object ()) {
            const auto rawTok = field.key ().value ();
            const char* k = rawTok.raw ();
            const char* q = static_cast<const char*> (std::memchr (k, '\"', 256));
            if (q != nullptr) {
                const std::string_view rawKey (k, static_cast<std::size_t> (q - k));
                if (rawKey.find ('\\') == std::string_view::npos) {
                    out.store->setNew (InternedKey (rawKey), simdToAny (field.value ()));
                } else {
                    out.store->setNew (
                        InternedKey (std::string_view (field.unescaped_key ().value ())),
                        simdToAny (field.value ()));
                }
            } else {
                out.store->setNew (
                    InternedKey (std::string_view (field.unescaped_key ().value ())),
                    simdToAny (field.value ()));
            }
        }
        return ccxt::any (out);
    }
    }
    return ccxt::any {};
}

// ---------------------------------------------------------------------------
// scalar materialisation — the SAME semantics as simdToAny's scalar cases
// ---------------------------------------------------------------------------
static ccxt::any scalarToAny (simdjson::ondemand::value v) {
    using simdjson::ondemand::json_type;
    switch (v.type ().value ()) {
    case json_type::null:
        return ccxt::any {};
    case json_type::boolean:
        return ccxt::any (v.get_bool ().value ());
    case json_type::string:
        return ccxt::any (
            std::string (std::string_view (v.get_string ().value ())));
    case json_type::number: {
        const simdjson::ondemand::number_type ntype =
            v.get_number_type ().value ();
        if (ntype == simdjson::ondemand::number_type::floating_point_number) {
            return ccxt::any (v.get_double ().value ());
        }
        const std::string_view raw = v.raw_json_token ();
        std::size_t digits = raw.size ();
        if (!raw.empty () && raw[0] == '-') {
            digits--;
        }
        if (digits >= 19) {
            return ccxt::any (std::string (raw));
        }
        return ccxt::any (static_cast<long long> (v.get_int64 ().value ()));
    }
    default:
        return ccxt::any {};
    }
}

// ---------------------------------------------------------------------------
// sub-parse a byte range [start, end) of the root buffer into a real any
// (the parser stops at the node's natural end; no copy — the bytes stay in
// the root's buffer)
// ---------------------------------------------------------------------------
static ccxt::any rangeToAny (const std::shared_ptr<JsonViewRoot>& root,
                             std::uint32_t start, std::uint32_t end) {
    const char* p = root->buffer.data () + start;
    const std::size_t len = end - start;
    simdjson::ondemand::parser sub;
    auto subdoc = sub.iterate (p, len, len + simdjson::SIMDJSON_PADDING);
    if (subdoc.error ()) {
        if (std::getenv ("CCXT_LAZY_DEBUG")) {
            fprintf (stderr, "rangeToAny: sub-parse failed at %u: %s (len %zu)\n",
                     start, simdjson::error_message (subdoc.error ()),
                     len);
        }
        return ccxt::any {};
    }
    try {
        return simdToAny (subdoc.value_unsafe ().get_value ().value ());
    } catch (const std::exception& e) {
        if (std::getenv ("CCXT_LAZY_DEBUG")) {
            fprintf (stderr, "rangeToAny: get_value failed at %u len %zu: %s; "
                     "bytes: '%.48s'\n",
                     start, len, e.what (),
                     std::string (p, std::min<std::size_t> (len, 48)).c_str ());
        }
        throw;
    }
}

// ---------------------------------------------------------------------------
// walk a container node from its opening bracket/brace to the matching close;
// returns the offset one PAST the closing bracket, or 0 on failure. Byte-level
// (no cursor): the fallback simdjson's raw_json_token() is useless for ranges
// (it returns only the opening byte for containers), so the buffer is walked.
// ---------------------------------------------------------------------------
static std::uint32_t scanNodeEnd (const std::shared_ptr<JsonViewRoot>& root,
                                  std::uint32_t off) {
    const char* p = root->buffer.data () + off;
    const char* end = root->buffer.data () + root->buffer.size ();
    if (p >= end || (*p != '[' && *p != '{')) {
        return 0;
    }
    int depth = 0;
    bool inString = false;
    bool escaped = false;
    for (; p < end; ++p) {
        const char c = *p;
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (c == '\\') {
                escaped = true;
            } else if (c == '"') {
                inString = false;
            }
            continue;
        }
        if (c == '"') {
            inString = true;
        } else if (c == '[' || c == '{') {
            depth++;
        } else if (c == ']' || c == '}') {
            depth--;
            if (depth == 0) {
                return static_cast<std::uint32_t> (p + 1 -
                                                   root->buffer.data ());
            }
        }
    }
    return 0;
}

// ---------------------------------------------------------------------------
// the shared sequential cursor
// ---------------------------------------------------------------------------
static bool ensureCursor (const std::shared_ptr<JsonViewRoot>& root,
                          std::uint32_t arrayId, std::uint32_t idx) {
    if (root->cursorHot && root->curArrayId == arrayId && idx == root->curIdx) {
        return true;   // already positioned; obj is open at this element
    }
    if (root->cursorHot && root->curArrayId == arrayId && idx > root->curIdx
        && idx - root->curIdx <= 4096) {
        // sequential advance — the common case in the transpiled loops
        auto& starts = root->elemStarts[arrayId];
        for (std::uint32_t i = root->curIdx; i < idx; ++i) {
            simdjson::ondemand::value el = *(*root->iter);
            auto raw = el.raw_json_token ();
            starts.push_back (static_cast<std::uint32_t> (
                raw.data () - root->buffer.data ()));
            ++(*root->iter);
        }
    } else {
        // full walk: rewind + find the array by its root key + iterate
        root->doc.rewind ();
        auto rootVal = root->doc.get_value ();
        if (rootVal.error ()) {
            return false;
        }
        auto rootObj = rootVal.value ().get_object ();
        if (rootObj.error ()) {
            return false;
        }
        const std::string& path = root->arrayPaths[arrayId];
        auto arrVal = rootObj.value ().find_field_unordered (path);
        if (arrVal.error ()) {
            return false;
        }
        auto arr = arrVal.value ().get_array ();
        if (arr.error ()) {
            return false;
        }
        root->iter = arr.value ().begin ().value ();
        root->elemStarts[arrayId].clear ();
        for (std::uint32_t i = 0; i < idx; ++i) {
            simdjson::ondemand::value el = *(*root->iter);
            auto raw = el.raw_json_token ();
            root->elemStarts[arrayId].push_back (static_cast<std::uint32_t> (
                raw.data () - root->buffer.data ()));
            ++(*root->iter);
        }
    }
    simdjson::ondemand::value el = *(*root->iter);
    auto raw = el.raw_json_token ();
    auto& starts = root->elemStarts[arrayId];
    if (starts.size () == idx) {
        starts.push_back (static_cast<std::uint32_t> (
            raw.data () - root->buffer.data ()));
    }
    auto o = el.get_object ();
    if (o.error ()) {
        return false;
    }
    root->obj = o.value ();
    root->curArrayId = arrayId;
    root->curIdx = idx;
    root->cursorHot = true;
    return true;
}

// ---------------------------------------------------------------------------
// resolve a field value: scalars materialise; containers inside an element
// materialise (their ranges sub-parse); the ROOT's array fields produce lazy
// array views (the top-level "symbols"-style lists stay lazy).
// ---------------------------------------------------------------------------
static ccxt::any fieldToAny (const std::shared_ptr<JsonViewRoot>& root,
                             simdjson::ondemand::value fv, bool atRoot,
                             const std::string& path) {
    using simdjson::ondemand::json_type;
    const json_type t = fv.type ().value ();
    if (t == json_type::array && atRoot) {
        auto raw = fv.raw_json_token ();
        std::uint32_t off = static_cast<std::uint32_t> (
            raw.data () - root->buffer.data ());
        // the fallback's raw_json_token() has no usable size for containers —
        // walk the buffer to the matching close bracket instead
        const std::uint32_t nodeEnd = scanNodeEnd (root, off);
        if (nodeEnd == 0) {
            return ccxt::any {};
        }
        root->arraySizes[off] = nodeEnd - off;
        root->arrayPaths[off] = path;
        return ccxt::any (jsonView { root, kJvArray, off, 0 });
    }
    if (t == json_type::array || t == json_type::object) {
        auto raw = fv.raw_json_token ();
        const char* data = raw.data ();
        std::uint32_t off = static_cast<std::uint32_t> (
            data - root->buffer.data ());
        const std::uint32_t nodeEnd = scanNodeEnd (root, off);
        if (nodeEnd == 0) {
            return ccxt::any {};
        }
        // a range sub-parse of [off, nodeEnd) materialises the node with no
        // extra copy
        return rangeToAny (root, off, nodeEnd);
    }
    return scalarToAny (fv);
}

const jsonView& viewOf (const ccxt::any& v) {
    return *reinterpret_cast<const jsonView*> (v.buf_);
}

ccxt::any viewGet (const jsonView& v, const ccxt::any& key) {
    auto root = v.root;
    std::lock_guard<std::mutex> guard (root->mutex);
    if (v.kind == kJvObject && v.id == 0) {
        // the document root: fresh iteration + unordered field lookup
        root->cursorHot = false;
        root->doc.rewind ();
        auto rootVal = root->doc.get_value ();
        if (rootVal.error ()) {
            return ccxt::any {};
        }
        auto rootObj = rootVal.value ().get_object ();
        if (rootObj.error ()) {
            return ccxt::any {};
        }
        const std::string path = str (key);
        auto f = rootObj.value ().find_field_unordered (path);
        if (f.error ()) {
            return ccxt::any {};
        }
        return fieldToAny (root, f.value (), /*atRoot*/ true, path);
    }
    if (v.kind == kJvDeferred) {
        if (!ensureCursor (root, v.id, v.idx)) {
            return ccxt::any {};
        }
        auto f = root->obj->find_field_unordered (str (key));
        if (f.error ()) {
            return ccxt::any {};
        }
        return fieldToAny (root, f.value (), /*atRoot*/ false, "");
    }
    return ccxt::any {};
}

bool viewHasKey (const jsonView& v, const ccxt::any& key) {
    auto root = v.root;
    std::lock_guard<std::mutex> guard (root->mutex);
    if (v.kind == kJvObject && v.id == 0) {
        root->cursorHot = false;
        root->doc.rewind ();
        auto rootVal = root->doc.get_value ();
        if (rootVal.error ()) {
            return false;
        }
        auto rootObj = rootVal.value ().get_object ();
        if (rootObj.error ()) {
            return false;
        }
        return !rootObj.value ()
                    .find_field_unordered (str (key))
                    .error ();
    }
    if (v.kind == kJvDeferred) {
        if (!ensureCursor (root, v.id, v.idx)) {
            return false;
        }
        return !root->obj->find_field_unordered (str (key)).error ();
    }
    return false;
}

// byte-level element count: walk [start, start + size), depth-count and count
// elements at depth 1 (the array level); quoted spans are skipped so commas
// inside strings don't miscount. No cursor involvement.
static std::size_t countArrayElements (const std::shared_ptr<JsonViewRoot>& root,
                                       std::uint32_t off, std::size_t size) {
    const char* p = root->buffer.data () + off;
    const char* end = p + size;
    // skip to the opening '['
    while (p < end && (*p == ' ' || *p == '\n' || *p == '\t' || *p == '\r')) {
        p++;
    }
    if (p >= end || *p != '[') {
        return 0;
    }
    p++;
    std::size_t count = 0;
    int depth = 1;
    bool inString = false;
    bool escaped = false;
    bool inElement = false;   // seen a non-ws char at depth 1 since a boundary
    while (p < end) {
        const char c = *p;
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (c == '\\') {
                escaped = true;
            } else if (c == '"') {
                inString = false;
            }
            p++;
            continue;
        }
        if (c == '"') {
            inString = true;
            inElement = true;
        } else if (c == '{' || c == '[') {
            depth++;
            inElement = true;
        } else if (c == '}' || c == ']') {
            depth--;
            if (depth == 0) {
                if (inElement) {
                    count++;
                }
                break;
            }
        } else if (c == ',' && depth == 1) {
            count++;
            inElement = false;
        } else if (c != ' ' && c != '\n' && c != '\t' && c != '\r') {
            inElement = true;
        }
        p++;
    }
    return count;
}

ccxt::any viewArrayLength (const jsonView& v) {
    auto root = v.root;
    std::lock_guard<std::mutex> guard (root->mutex);
    auto sizeIt = root->arraySizes.find (v.id);
    if (sizeIt == root->arraySizes.end ()) {
        return ccxt::any (std::size_t (0));
    }
    const std::size_t count = countArrayElements (root, v.id, sizeIt->second);
    return ccxt::any (count);
}

ccxt::any viewElement (const jsonView& v, std::uint32_t idx) {
    // a deferred element view: positioned lazily on first access
    return ccxt::any (jsonView { v.root, kJvDeferred, v.id, idx });
}

// ---------------------------------------------------------------------------
// per-array element byte ranges, scanned once and cached. The fallback's
// ondemand value/iterator raw_json_token() positions drift once field-finds
// advance the shared tape cursor, so element ranges must come from the
// buffer bytes (cursor-independent), not from the iterator's raw tokens.
// ---------------------------------------------------------------------------
static bool ensureElemRanges (const std::shared_ptr<JsonViewRoot>& root,
                              std::uint32_t arrayId) {
    if (root->elemRanges.count (arrayId)) {
        return true;
    }
    auto sizeIt = root->arraySizes.find (arrayId);
    if (sizeIt == root->arraySizes.end ()) {
        return false;
    }
    const char* p = root->buffer.data () + arrayId;
    const char* end = p + sizeIt->second;
    while (p < end && (*p == ' ' || *p == '\n' || *p == '\t' || *p == '\r')) {
        p++;
    }
    if (p >= end || *p != '[') {
        return false;
    }
    p++;
    std::vector<std::pair<std::uint32_t, std::uint32_t>> ranges;
    bool inString = false;
    bool escaped = false;
    int depth = 0;
    std::uint32_t estart = 0;
    bool haveStart = false;
    for (; p < end; ++p) {
        const char c = *p;
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (c == '\\') {
                escaped = true;
            } else if (c == '"') {
                inString = false;
            }
            continue;
        }
        if (!haveStart && c != ' ' && c != '\n' && c != '\t' && c != '\r') {
            if (c == ']') {
                break;
            }
            estart = static_cast<std::uint32_t> (p - root->buffer.data ());
            haveStart = true;
        }
        if (!haveStart) {
            continue;
        }
        if (c == '"') {
            inString = true;
        } else if (c == '[' || c == '{') {
            depth++;
        } else if (c == ']' || c == '}') {
            if (depth == 0) {
                // end of the current element (scalar end or array close)
                ranges.emplace_back (estart, static_cast<std::uint32_t> (
                    p - root->buffer.data ()));
                break;
            }
            depth--;
        } else if (c == ',' && depth == 0) {
            ranges.emplace_back (estart, static_cast<std::uint32_t> (
                p - root->buffer.data ()));
            haveStart = false;
        }
    }
    if (haveStart && depth == 0) {
        // the final element without a trailing comma
        ranges.emplace_back (estart, static_cast<std::uint32_t> (
            p - root->buffer.data () - 1));
    }
    root->elemRanges[arrayId] = std::move (ranges);
    return true;
}

ccxt::any viewMaterialize (const jsonView& v) {
    auto root = v.root;
    std::lock_guard<std::mutex> guard (root->mutex);
    if (v.kind == kJvDeferred) {
        if (!ensureElemRanges (root, v.id)) {
            return ccxt::any {};
        }
        const auto& ranges = root->elemRanges[v.id];
        if (v.idx >= ranges.size ()) {
            return ccxt::any {};
        }
        return rangeToAny (root, ranges[v.idx].first, ranges[v.idx].second);
    }
    // a root or array view: sub-parse the node's raw range
    auto sizeIt = root->arraySizes.find (v.id);
    if (v.kind == kJvArray && sizeIt != root->arraySizes.end ()) {
        return rangeToAny (root, v.id,
                           v.id + static_cast<std::uint32_t> (sizeIt->second));
    }
    return rangeToAny (root, v.id,
                       static_cast<std::uint32_t> (root->buffer.size ()));
}

} // namespace ccxt

#endif   // CCXT_HAS_SIMDJSON
