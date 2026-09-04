# CMake generated Testfile for 
# Source directory: /root/new-lang/ccxt/cpp
# Build directory: /root/new-lang/ccxt/cpp/build
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test(value-model "/root/new-lang/ccxt/cpp/build/ccxt-value-tests")
set_tests_properties(value-model PROPERTIES  _BACKTRACE_TRIPLES "/root/new-lang/ccxt/cpp/CMakeLists.txt;43;add_test;/root/new-lang/ccxt/cpp/CMakeLists.txt;0;")
add_test(base-tests "/root/new-lang/ccxt/cpp/build/ccxt-tests" "--baseTests")
set_tests_properties(base-tests PROPERTIES  _BACKTRACE_TRIPLES "/root/new-lang/ccxt/cpp/CMakeLists.txt;44;add_test;/root/new-lang/ccxt/cpp/CMakeLists.txt;0;")
