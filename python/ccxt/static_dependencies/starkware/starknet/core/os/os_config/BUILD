load("//bazel_utils:python.bzl", "pytest_test")

package(default_visibility = ["//visibility:public"])

exports_files([
    "os_config.cairo",
    "os_config_hash.json",
])

py_library(
    name = "starknet_os_config_hash_lib",
    srcs = [
        "os_config_hash.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
    ],
)

py_library(
    name = "test_utils",
    srcs = [
        "test_utils.py",
    ],
    data = [
        "os_config_hash.json",
        "private_os_config_hash.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_os_config_hash_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
    ],
)

pytest_test(
    name = "starknet_os_config_hash_test",
    srcs = [
        "os_config_hash_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_os_config_hash_lib",
        ":test_utils",
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/python:starkware_python_test_utils_lib",
        "//src/starkware/starknet/core/os:starknet_os_program_py_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
    ],
)
