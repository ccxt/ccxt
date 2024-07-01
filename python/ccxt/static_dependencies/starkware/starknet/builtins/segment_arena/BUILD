load("//bazel_utils:python.bzl", "pytest_test")
load("//src/starkware/cairo/lang:cairo_rules.bzl", "cairo_library")

package(default_visibility = ["//visibility:public"])

cairo_library(
    name = "segment_arena_cairo_lib",
    srcs = [
        "segment_arena.cairo",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_cairo_lib",
    ],
)

py_library(
    name = "segment_arena_builtin_lib",
    srcs = [
        "segment_arena_builtin_runner.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/lang/vm:cairo_relocatable_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/python:starkware_python_utils_lib",
    ],
)

pytest_test(
    name = "segment_arena_test",
    srcs = [
        "segment_arena_test.py",
    ],
    data = [
        "segment_arena_test.cairo",
        ":segment_arena_cairo_lib",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
    ],
)
