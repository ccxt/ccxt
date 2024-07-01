load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "py_exe", "pytest_test")
load("//src/starkware/cairo/lang/compiler:vars.bzl", "IS_COMPILER_PYPY")

package(default_visibility = ["//visibility:public"])

py_exe(
    name = "starknet_compile_exe",
    is_pypy = IS_COMPILER_PYPY,
    module = "starkware.starknet.compiler.compile",
    deps = [
        "starknet_compile_lib",
    ],
)

py_library(
    name = "starknet_compile_lib",
    srcs = [
        "compile.py",
        "contract_interface.py",
        "data_encoder.py",
        "event.py",
        "external_wrapper.py",
        "starknet_pass_manager.py",
        "starknet_preprocessor.py",
        "storage_var.py",
        "validation_utils.py",
    ],
    data = ["//src/starkware/starknet/common:starknet_common_cairo_lib"],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/security:starknet_hints_whitelist_lib",
        "//src/starkware/starknet/security:starknet_security_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starkware_utils:starkware_utils_lib",
        requirement("typing_extensions"),
    ],
)

py_library(
    name = "starknet_compile_test_utils_lib",
    srcs = [
        "test_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starknet_compile_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_test_utils_lib",
    ],
)

pytest_test(
    name = "starknet_compile_test",
    srcs = [
        "contract_interface_test.py",
        "data_encoder_test.py",
        "event_test.py",
        "external_wrapper_test.py",
        "starknet_preprocessor_test.py",
        "storage_var_test.py",
        "validation_utils_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_compile_lib",
        ":starknet_compile_test_utils_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_test_utils_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
    ],
)
