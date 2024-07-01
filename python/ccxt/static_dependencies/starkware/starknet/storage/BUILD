package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_storage_lib",
    srcs = [
        "starknet_storage.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starkware_utils:starkware_commitment_tree_facts_lib",
        "//src/starkware/starkware_utils:starkware_commitment_tree_leaf_fact_utils_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/starkware_utils:starkware_utils_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
        "//src/starkware/storage:starkware_storage_lib",
    ],
)
