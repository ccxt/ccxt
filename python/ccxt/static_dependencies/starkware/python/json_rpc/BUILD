load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "pytest_test")

package(default_visibility = ["//visibility:public"])

exports_files([
    "client.py",
    "common.py",
    "server.py",
])

pytest_test(
    name = "json_rpc_client_test",
    srcs = [
        "client_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/python:starkware_expression_string_lib",
        "//src/starkware/python:starkware_json_rpc_lib",
        "//src/starkware/python:starkware_python_test_utils_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        requirement("pytest_asyncio"),
    ],
)
