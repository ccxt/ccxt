find_package(fmt REQUIRED)
find_package(nlohmann_json REQUIRED)
find_program(CCACHE_FOUND ccache)
if(CCACHE_FOUND)
    set_property(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)
endif(CCACHE_FOUND)
find_package(OpenSSL REQUIRED)

set (THREADS_PREFER_PTHREAD_FLAG ON)
find_package (Threads REQUIRED)

####################### Boost ##########################
set(Boost_USE_STATIC_LIBS ON)
set(Boost_USE_STATIC_RUNTIME ON)

find_package(Boost REQUIRED)
IF(Boost_FOUND)
    include_directories(${Boost_INCLUDE_DIRS})
ENDIF(Boost_FOUND)
########################################################

set(CCXT_HEADERS_DIR "${CMAKE_CURRENT_LIST_DIR}/cpp")
file(GLOB CCXT_TOP_HEADERS "${CCXT_HEADERS_DIR}/*.h")
set(CCXT_ALL_HEADERS ${CCXT_TOP_HEADERS})

set(CCXT_SRCS 
    ccxt/base/exchange.cpp
    ccxt/base/functions/type.cpp
    ccxt/base/functions/throttle.cpp
    ccxt/base/functions/string.cpp
    ccxt/base/functions/generic.cpp
    binance.cpp)

if(BUILD_SHARED_LIBS)
    add_library(ccxt SHARED ${CCXT_SRCS} ${CCXT_ALL_HEADERS})
else()
    add_library(ccxt STATIC ${CCXT_SRCS} ${CCXT_ALL_HEADERS})
endif()

target_include_directories(ccxt PUBLIC 
    "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp>"
    "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp/3rdparty/plog-1.1.9/include>"
    "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp/3rdparty/certify/include>"
)

add_subdirectory(test)
