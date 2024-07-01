load("//bazel_utils:python.bzl", "pytest_test")

py_library(
    name = "cairo_aggregator_lib",
    srcs = [
        "output_parser.py",
    ],
)

pytest_test(
    name = "starknet_aggregator_test",
    srcs = [
        "aggregator_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":cairo_aggregator_lib",
    ],
)
