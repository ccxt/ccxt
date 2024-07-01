load("//src/starkware/cairo:vars_cairo_compiler.bzl", "CAIRO_COMPILER_ARCHIVE")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_compile_v1_lib",
    srcs = [
        "compile.py",
    ],
    data = [
        "@" + CAIRO_COMPILER_ARCHIVE,
        "mainnet_libfuncs.json",
        "testnet_libfuncs.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":exe_paths",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
    ],
)

py_library(
    name = "exe_paths",
    srcs = [
        "compiler_exe_paths.py",
    ],
    visibility = ["//visibility:public"],
    deps = ["@bazel_tools//tools/python/runfiles"],
)
