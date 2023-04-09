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

    set(TESTS_SRCS
        main.cpp
        run-tests.cpp
        test.cpp
        TestBinance.cpp
    )

    add_executable(tests ${TESTS_SRCS})    

    link_directories(${Boost_LIBRARY_DIRS})
    target_link_libraries(tests PRIVATE ccxt doctest::doctest fmt::fmt nlohmann_json::nlohmann_json 
                                             ${Boost_LIBRARIES} OpenSSL::SSL OpenSSL::Crypto Threads::Threads)
    target_include_directories(tests PUBLIC "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp>")
    target_include_directories(tests PUBLIC "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp/test>")
endif()

add_subdirectory(base)