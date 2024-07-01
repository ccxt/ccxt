load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "pytest_test")

py_library(
    name = "starkware_python_utils_lib",
    srcs = [
        "async_subprocess.py",
        "fixed_point.py",
        "math_utils.py",
        "object_utils.py",
        "python_dependencies.py",
        "utils.py",
        "utils_stub_module.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        requirement("numpy"),
        requirement("pyyaml"),
        requirement("sympy"),
        requirement("typing_extensions"),
        "@bazel_tools//tools/python/runfiles",
    ],
)

package(default_visibility = ["//visibility:public"])

exports_files(glob(["*.py"]))

py_library(
    name = "starkware_expression_string_lib",
    srcs = [
        "expression_string.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
    ],
)

py_library(
    name = "starkware_json_rpc_lib",
    srcs = [
        "//src/starkware/python/json_rpc:client.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
    ],
)

py_library(
    name = "starkware_merkle_tree_lib",
    srcs = [
        "merkle_tree.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
    ],
)

py_library(
    name = "starkware_python_test_utils_lib",
    srcs = [
        "random_test_utils.py",
        "test_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        requirement("mypy_extensions"),
        requirement("pytest"),
    ],
)

pytest_test(
    name = "starkware_python_utils_test",
    srcs = [
        "expression_string_test.py",
        "math_utils_test.py",
        "test_utils_test.py",
        "utils_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starkware_expression_string_lib",
        ":starkware_python_test_utils_lib",
        ":starkware_python_utils_lib",
        requirement("numpy"),
        requirement("pytest_asyncio"),
    ],
)
