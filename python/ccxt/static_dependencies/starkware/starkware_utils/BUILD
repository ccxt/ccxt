load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starkware_serializability_utils_lib",
    srcs = [
        "serializable.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/python:starkware_python_utils_lib",
    ],
)

py_library(
    name = "starkware_error_handling_lib",
    srcs = [
        "error_handling.py",
    ],
    visibility = ["//visibility:public"],
    deps = [requirement("marshmallow")],
)

py_library(
    name = "starkware_custom_dict_utils_lib",
    srcs = [
        "custom_raising_dict.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        requirement("frozendict"),
    ],
)

py_library(
    name = "starkware_dataclasses_utils_lib",
    srcs = [
        "marshmallow_dataclass_fields.py",
        "serializable_dataclass.py",
        "validated_dataclass.py",
        "validated_fields.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starkware_custom_dict_utils_lib",
        ":starkware_error_handling_lib",
        ":starkware_serializability_utils_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        requirement("frozendict"),
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
        requirement("mypy_extensions"),
        requirement("typeguard"),
    ],
)

py_library(
    name = "starkware_one_of_schema_utils_lib",
    srcs = [
        "one_of_schema_tracker.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starkware_dataclasses_utils_lib",
        requirement("marshmallow"),
        requirement("marshmallow_oneofschema"),
    ],
)

py_library(
    name = "starkware_dataclasses_field_utils_lib",
    srcs = [
        "field_validators.py",
        "marshmallow_fields_metadata.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starkware_dataclasses_utils_lib",
        "//src/starkware/crypto:starkware_crypto_lib",
        requirement("eth_utils"),
        requirement("marshmallow"),
        requirement("setuptools"),
    ],
)

py_library(
    name = "starkware_config_utils_lib",
    srcs = [
        "config_base.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starkware_dataclasses_field_utils_lib",
        requirement("marshmallow"),
        requirement("pyyaml"),
    ],
)

py_library(
    name = "starkware_commitment_tree_facts_lib",
    srcs = [
        "//src/starkware/starkware_utils/commitment_tree:inner_node_fact.py",
        "//src/starkware/starkware_utils/commitment_tree:leaf_fact.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/storage:starkware_abstract_storage_lib",
    ],
)

py_library(
    name = "starkware_utils_lib",
    srcs = [
        "executor.py",
        "subsequence.py",
        "//src/starkware/starkware_utils/commitment_tree:binary_fact_tree.py",
        "//src/starkware/starkware_utils/commitment_tree:binary_fact_tree_da_utils.py",
        "//src/starkware/starkware_utils/commitment_tree:binary_fact_tree_node.py",
        "//src/starkware/starkware_utils/commitment_tree:calculation.py",
        "//src/starkware/starkware_utils/commitment_tree:update_tree.py",
        "//src/starkware/starkware_utils/commitment_tree/merkle_tree:traverse_tree.py",
        "//src/starkware/starkware_utils/commitment_tree/patricia_tree:fast_patricia_update.py",
        "//src/starkware/starkware_utils/commitment_tree/patricia_tree:nodes.py",
        "//src/starkware/starkware_utils/commitment_tree/patricia_tree:patricia_tree.py",
        "//src/starkware/starkware_utils/commitment_tree/patricia_tree:virtual_calculation_node.py",
        "//src/starkware/starkware_utils/commitment_tree/patricia_tree:virtual_patricia_node.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starkware_commitment_tree_facts_lib",
        ":starkware_dataclasses_field_utils_lib",
        ":starkware_dataclasses_utils_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starkware_commitment_tree_leaf_fact_utils_lib",
    srcs = [
        "//src/starkware/starkware_utils/commitment_tree:leaf_fact_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starkware_commitment_tree_facts_lib",
        "starkware_dataclasses_utils_lib",
        "starkware_utils_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/storage:starkware_storage_lib",
    ],
)
