# ccxt-core: the hand-written engine runtime — value model, exchange core,
# helpers, JSON views, precisions, crypto/ws primitives. The transpiled venues
# (exchanges/pro/prediction) in ../ccxt depend on this package, mirroring the
# rust/ccxt-core split: runtime edits rebuild only these few TUs instead of
# the ~150 venue TUs.
add_library (ccxt_core STATIC
    ccxt/base/helpers.cpp
    ccxt/base/JsonView.cpp
    ccxt/base/ExchangeBase.cpp
    ccxt/base/Number.cpp
    ccxt/base/Crypto.cpp
    ccxt/base/Starknet.cpp
    ccxt/base/ws/Ws.cpp
)

# the package root is the include root: consumers say `#include "ccxt/base/…"`
target_include_directories (ccxt_core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries (ccxt_core PUBLIC Threads::Threads CURL::libcurl OpenSSL::SSL OpenSSL::Crypto)
if (simdjson_FOUND)
    target_link_libraries (ccxt_core PUBLIC simdjson::simdjson)
    target_compile_definitions (ccxt_core PUBLIC CCXT_HAS_SIMDJSON=1)
endif ()

# parseJson/serialise/json hot paths are header-heavy and pay ~12x at -O0
# (parsing the 22MB markets payload drops from ~17s to ~2.5s at -O2).
set_source_files_properties (ccxt/base/ExchangeBase.cpp PROPERTIES COMPILE_OPTIONS "-O2")
# per-key/per-value free helpers (getValue/setValue/isEqual/safeString/…) that
# setMarkets-style generated code calls millions of times through std::any.
set_source_files_properties (ccxt/base/helpers.cpp PROPERTIES COMPILE_OPTIONS "-O2")
# the lazy-view resolution (field scans, sub-parses, the byte-scan counter).
set_source_files_properties (ccxt/base/JsonView.cpp PROPERTIES COMPILE_OPTIONS "-O2")
