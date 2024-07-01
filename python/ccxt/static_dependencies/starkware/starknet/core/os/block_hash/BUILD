package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_block_hash_lib",
    srcs = [
        "block_hash.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starkware_utils:starkware_utils_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
        "//src/starkware/storage:starkware_dict_storage_lib",
        "//src/starkware/storage:starkware_storage_utils_lib",
    ],
)
