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
if (WIN32)
    set(Boost_USE_MULTITHREADED ON)
    set(Boost_USE_STATIC_LIBS ON)
    set(Boost_USE_STATIC_RUNTIME ON)
endif (WIN32)

find_package(Boost REQUIRED COMPONENTS system coroutine filesystem) 
IF(Boost_FOUND)
    include_directories(${Boost_INCLUDE_DIRS})
ENDIF(Boost_FOUND)
# ignore BOOST deprecated headers until we can update boost on Ubuntu 22.04
if (UNIX)
    add_definitions("-DBOOST_ALLOW_DEPRECATED_HEADERS")
    add_definitions("-DBOOST_BIND_GLOBAL_PLACEHOLDERS")
endif(UNIX)
########################################################

include_directories(${_INCLUDE_DIRS})


set(CCXT_HEADERS_DIR "${CMAKE_CURRENT_LIST_DIR}/cpp")
file(GLOB CCXT_TOP_HEADERS "${CCXT_HEADERS_DIR}/*.h")
set(CCXT_ALL_HEADERS ${CCXT_TOP_HEADERS})

set(CCXT_SRCS 
    ccxt/base/exchange.cpp
    ccxt/base/functions/type.cpp
    ccxt/base/functions/throttle.cpp
    ccxt/base/functions/string.cpp
    ccxt/base/functions/generic.cpp
    ccxt/base/functions/time.cpp
    url.cpp
    httpsClass.cpp
    binance.cpp)

add_library(ccxt ${CCXT_SRCS} ${CCXT_ALL_HEADERS})
target_link_libraries(ccxt PRIVATE fmt::fmt nlohmann_json::nlohmann_json)

target_include_directories(ccxt PUBLIC 
    "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp>"
    "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp/3rdparty/plog-1.1.9/include>"
    "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp/3rdparty/certify/include>"
)


add_subdirectory(test)
