if(ENABLE_TESTS)
    add_definitions(-DENABLE_DOCTEST_IN_LIBRARY)
    include(FetchContent)
    FetchContent_Declare(
        DocTest
        GIT_REPOSITORY "https://github.com/onqtam/doctest"
        GIT_TAG "932a2ca50666138256dae56fbb16db3b1cae133a"
    )

    FetchContent_MakeAvailable(DocTest)
    include_directories(${DOCTEST_INCLUDE_DIR})

    set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_SOURCE_DIR}/cmake/")

    set(BASE_TEST_SRCS 
        main.cpp
        TestErrors.cpp
        functions/TestType.cpp        
        functions/TestThrottle.cpp
        functions/TestString.cpp
        functions/TestGeneric.cpp
        TestExchange.cpp)

    add_executable(test-base ${BASE_TEST_SRCS})
    target_link_libraries(test-base PRIVATE ccxt doctest::doctest fmt::fmt)
    target_include_directories(test-base PUBLIC "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp>")
    target_include_directories(test-base PUBLIC "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp/test>")
endif()
