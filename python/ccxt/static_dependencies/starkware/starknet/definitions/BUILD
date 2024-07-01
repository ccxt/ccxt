load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

exports_files([
    "general_config.yml",
    "versioned_constants.json",
])

py_library(
    name = "starknet_definitions_lib",
    srcs = [
        "constants.py",
        "data_availability_mode.py",
        "error_codes.py",
        "execution_mode.py",
        "fields.py",
        "l1_da_mode.py",
        "transaction_type.py",
        "types.py",
    ],
    data = ["versioned_constants.json"],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/everest/api/gateway:everest_transaction_type_lib",
        "//src/services/everest/definitions:everest_definitions_lib",
        "//src/starkware/cairo/lang/tracer:cairo_tracer_lib",
        "//src/starkware/crypto:starkware_crypto_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_field_utils_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_general_config_lib",
    srcs = [
        "chain_ids.py",
        "general_config.py",
    ],
    data = [
        "general_config.yml",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_definitions_lib",
        "//src/services/everest/definitions:everest_general_config_lib",
        "//src/starkware/cairo/lang:cairo_instances_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starkware_utils:starkware_config_utils_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        requirement("marshmallow_dataclass"),
    ],
)
