load("//bazel_utils:solidity.bzl", "sol_library")

package(default_visibility = ["//visibility:public"])

exports_files(glob(["*.sol"]))

sol_library(
    name = "named_storage_sol",
    srcs = [
        "NamedStorage.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [],
)

sol_library(
    name = "named_storage8_sol",
    srcs = [
        "NamedStorage8.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [],
)

sol_library(
    name = "common_library_sol",
    srcs = [
        "Addresses.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [],
)

exports_files([
    "Addresses.sol",
])
