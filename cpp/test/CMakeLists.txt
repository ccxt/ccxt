if(ENABLE_DOCTESTS)
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

    add_executable(tests main.cpp base/TestErrors.cpp base/TestExchange.cpp)
    target_compile_features(tests PRIVATE cxx_std_17)
    target_link_libraries(tests PRIVATE ccxt doctest::doctest fmt::fmt)
    target_include_directories(tests PUBLIC "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp>")
    target_include_directories(tests PUBLIC "$<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}/cpp/test>")
endif()
