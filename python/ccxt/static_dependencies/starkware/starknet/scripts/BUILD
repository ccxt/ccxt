package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_script_lib",
    data = [
        "starknet",
        "starknet-class-hash",
        "starknet-compile-deprecated",
        "starknet-compiled-class-hash",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/starknet/cli:starknet_cli_lib",
        "//src/starkware/starknet/compiler:starknet_compile_lib",
    ],
)
