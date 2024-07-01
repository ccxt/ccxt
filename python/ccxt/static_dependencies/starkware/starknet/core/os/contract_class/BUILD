load("//src/starkware/cairo/lang:cairo_rules.bzl", "cairo_library")
load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "pytest_test")

cairo_library(
    name = "starknet_os_abi_cairo_lib",
    srcs = [
        "compiled_class.cairo",
        "deprecated_compiled_class.cairo",
    ],
    deps = [
        "//src/starkware/cairo/common:cairo_common_cairo_lib",
    ],
)

package(default_visibility = ["//visibility:public"])

exports_files([
    "compiled_class.cairo",
    "deprecated_compiled_class.cairo",
])

py_library(
    name = "compiled_class_hash_objects",
    srcs = [
        "compiled_class_hash_objects.py",
    ],
    deps = ["//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib"],
)

py_library(
    name = "starknet_os_abi_lib",
    srcs = [
        "class_hash.py",
        "class_hash_utils.py",
        "compiled_class_hash.py",
        "compiled_class_hash_utils.py",
        "deprecated_class_hash.py",
        "utils.py",
    ],
    data = [
        "compiled_class.cairo",
        "contract_class.cairo",
        "deprecated_compiled_class.cairo",
        "//src/starkware/starknet/common:starknet_common_cairo_lib",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":compiled_class_hash_objects",
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/cairo/lang/builtins:cairo_run_builtins_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        requirement("cachetools"),
    ],
)

pytest_test(
    name = "compiled_class_hash_test",
    srcs = [
        "compiled_class_hash_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_os_abi_lib",
        "//src/starkware/python:starkware_python_test_utils_lib",
        "//src/starkware/starknet/core/test_contract:starknet_test_external_contract_test_utils_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        requirement("cachetools"),
    ],
)
