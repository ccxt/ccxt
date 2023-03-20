find_package(fmt REQUIRED)
find_program(CCACHE_FOUND ccache)
if(CCACHE_FOUND)
    set_property(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)
endif(CCACHE_FOUND)

set(CCXT_HEADERS_DIR "${CMAKE_CURRENT_LIST_DIR}/cpp")
file(GLOB CCXT_TOP_HEADERS "${CCXT_HEADERS_DIR}/*.h")
set(CCXT_ALL_HEADERS ${CCXT_TOP_HEADERS})

set(CCXT_SRCS 
    ccxt/base/exchange.cpp 
    ccxt/base/functions/throttle.cpp)

if(BUILD_SHARED_LIBS)
    add_library(ccxt SHARED ${CCXT_SRCS} ${CCXT_ALL_HEADERS})
else()
    add_library(ccxt STATIC ${CCXT_SRCS} ${CCXT_ALL_HEADERS})
endif()

target_include_directories(ccxt PUBLIC "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp>")

add_subdirectory(test)