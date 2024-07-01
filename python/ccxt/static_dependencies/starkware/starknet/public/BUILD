load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "pytest_test")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_abi_lib",
    srcs = [
        "abi.py",
        "abi_structs.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        requirement("eth_hash"),
        requirement("pycryptodome"),
    ],
)

pytest_test(
    name = "starknet_abi_lib_test",
    srcs = [
        "abi_structs_test.py",
        "abi_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starknet_abi_lib",
    ],
)
