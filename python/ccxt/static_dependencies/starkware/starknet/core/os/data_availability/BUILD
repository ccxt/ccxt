load("//bazel_utils:python.bzl", "pytest_test")
load("//src/starkware/cairo/lang:cairo_rules.bzl", "cairo_library")

package(default_visibility = ["//visibility:public"])

exports_files([
    "commitment.cairo",
])

cairo_library(
    name = "bls_field",
    srcs = [
        "bls_field.cairo",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_cairo_lib",
    ],
)

py_library(
    name = "bls_utils",
    srcs = [
        "bls_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
    ],
)

pytest_test(
    name = "bls_field_test",
    srcs = [
        "bls_field_test.py",
    ],
    data = [":bls_field"],
    visibility = ["//visibility:public"],
    deps = [
        ":bls_utils",
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/python:starkware_python_test_utils_lib",
    ],
)

cairo_library(
    name = "commitment",
    srcs = [
        "commitment.cairo",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":bls_field",
        "//src/starkware/cairo/common:cairo_common_cairo_lib",
    ],
)
