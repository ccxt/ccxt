load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starkware_eth_test_utils_lib",
    srcs = [
        "eth_test_utils.py",
    ],
    data = ["@npm_ganache//ganache/bin:ganache"],
    visibility = ["//visibility:public"],
    deps = [
        ":web3_wrapper_lib",
        requirement("pytest"),
        requirement("web3"),
    ],
)

py_library(
    name = "web3_wrapper_lib",
    srcs = [
        "web3_wrapper.py",
    ],
    visibility = ["//visibility:public"],
    deps = [requirement("web3")],
)
