# CMake generated Testfile for 
# Source directory: /root/new-lang/ccxt/cpp
# Build directory: /root/new-lang/ccxt/cpp/build-asan
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test(value-model "/root/new-lang/ccxt/cpp/build-asan/ccxt-value-tests")
set_tests_properties(value-model PROPERTIES  _BACKTRACE_TRIPLES "/root/new-lang/ccxt/cpp/CMakeLists.txt;54;add_test;/root/new-lang/ccxt/cpp/CMakeLists.txt;0;")
add_test(base-tests "/root/new-lang/ccxt/cpp/build-asan/ccxt-tests" "--baseTests")
set_tests_properties(base-tests PROPERTIES  _BACKTRACE_TRIPLES "/root/new-lang/ccxt/cpp/CMakeLists.txt;55;add_test;/root/new-lang/ccxt/cpp/CMakeLists.txt;0;")
add_test(smoke-binance "/root/new-lang/ccxt/cpp/build-asan/ccxt-smoke-binance")
set_tests_properties(smoke-binance PROPERTIES  _BACKTRACE_TRIPLES "/root/new-lang/ccxt/cpp/CMakeLists.txt;56;add_test;/root/new-lang/ccxt/cpp/CMakeLists.txt;0;")
add_test(static-request-binance "/root/new-lang/ccxt/cpp/build-asan/ccxt-static-binance" "--requestTests")
set_tests_properties(static-request-binance PROPERTIES  _BACKTRACE_TRIPLES "/root/new-lang/ccxt/cpp/CMakeLists.txt;57;add_test;/root/new-lang/ccxt/cpp/CMakeLists.txt;0;")
