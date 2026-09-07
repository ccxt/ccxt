cmake_minimum_required (VERSION 3.16)
project (ccxt-cpp-examples CXX)

set (CMAKE_CXX_STANDARD 17)
set (CMAKE_CXX_STANDARD_REQUIRED ON)
set (CMAKE_CXX_FLAGS_DEBUG "-O0 -g0")

# The examples link the ccxt static library built by the main port
# (cmake -S cpp -B cpp/build && cmake --build cpp/build). The factory registrars
# are static initialisers, so the link must be WHOLE_ARCHIVE like ccxt-tests.
if (NOT EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/../../cpp/build/libccxt.a)
    message (FATAL_ERROR "cpp/build/libccxt.a not found - build the port first (cmake -S cpp -B cpp/build && cmake --build cpp/build)")
endif ()

add_library (ccxt STATIC IMPORTED)
set_target_properties (ccxt PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_SOURCE_DIR}/../../cpp/build/libccxt.a)

find_package (CURL REQUIRED)
find_package (OpenSSL REQUIRED)
find_package (Threads REQUIRED)

set (EXAMPLES
    binance_typed
    exchanges_smoke
    prediction_typed_demo
)

foreach (example ${EXAMPLES})
    add_executable (${example} ${example}.cpp)
    target_include_directories (${example} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/../../cpp)
    target_link_libraries (${example} PRIVATE
        "$<LINK_LIBRARY:WHOLE_ARCHIVE,ccxt>"
        CURL::libcurl OpenSSL::SSL OpenSSL::Crypto Threads::Threads)
    target_compile_options (${example} PRIVATE -g0)
endforeach ()
