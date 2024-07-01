load("//src/starkware/cairo/lang:cairo_rules.bzl", "cairo_library")
load("//bazel_utils:python.bzl", "pytest_test")

cairo_library(
    name = "starknet_common_cairo_lib",
    srcs = [
        "constants.cairo",
        "eth_utils.cairo",
        "messages.cairo",
        "new_syscalls.cairo",
        "storage.cairo",
        "syscalls.cairo",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_cairo_lib",
    ],
)

package(default_visibility = ["//visibility:public"])

exports_files([
    "constants.cairo",
    "new_syscalls.cairo",
    "storage.cairo",
    "syscalls.cairo",
])

pytest_test(
    name = "starknet_common_lib_test",
    srcs = [
        "eth_utils_test.py",
        "storage_test.py",
    ],
    data = [":starknet_common_cairo_lib"],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/python:starkware_python_test_utils_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
    ],
)
