find_package(fmt REQUIRED)
find_package(nlohmann_json REQUIRED)
find_program(CCACHE_FOUND ccache)
if (UNIX)
    if(CCACHE_FOUND)
        set_property(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)
    endif(CCACHE_FOUND)
endif(UNIX)
find_package(OpenSSL REQUIRED)

set (THREADS_PREFER_PTHREAD_FLAG ON)
find_package (Threads REQUIRED)

####################### Boost ##########################
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

if(MSVC)
    add_compile_options(
        $<$<CONFIG:>:/MT> #---------|
        $<$<CONFIG:Debug>:/MTd> #---|-- Statically link the runtime libraries
        $<$<CONFIG:Release>:/MT> #--|
    )
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /bigobj /D_WIN32_WINNT=0x0A00 /MP") # more info here https://learn.microsoft.com/en-us/windows/win32/winprog/using-the-windows-headers?redirectedfrom=MSDN#setting_winver_or__win32_winnt    
endif()

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
if (WIN32)
    target_link_options(ccxt INTERFACE "/debug:fastlink")
endif(WIN32)

target_include_directories(ccxt PUBLIC 
    "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp>"
)


add_subdirectory(test)
