load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_transaction_lib",
    srcs = [
        "transaction.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/everest/api/gateway:everest_transaction_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
    ],
)

py_library(
    name = "starknet_account_transaction_lib",
    srcs = [
        "account_transaction.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_transaction_lib",
        ":starknet_transaction_utils_lib",
        "//src/starkware/starknet/core/os/contract_address:starknet_contract_address_lib",
        "//src/starkware/starknet/core/os/transaction_hash",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_deprecated_transaction_lib",
    srcs = [
        "deprecated_transaction.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_transaction_lib",
        ":starknet_transaction_utils_lib",
        "//src/starkware/starknet/core/os/contract_address:starknet_contract_address_lib",
        "//src/starkware/starknet/core/os/transaction_hash:starknet_deprecated_transaction_hash_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_transaction_schema_lib",
    srcs = [
        "transaction_schema.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_account_transaction_lib",
        ":starknet_deprecated_transaction_lib",
        ":starknet_transaction_lib",
        ":starknet_transaction_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        requirement("marshmallow"),
        requirement("marshmallow_oneofschema"),
    ],
)

py_library(
    name = "starknet_transaction_utils_lib",
    srcs = [
        "transaction_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/external_api:services_external_api_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
    ],
)

py_library(
    name = "starknet_gateway_client_lib",
    srcs = [
        "gateway_client.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_transaction_lib",
        ":starknet_transaction_schema_lib",
        "//src/services/everest/api/gateway:everest_gateway_client_lib",
    ],
)
