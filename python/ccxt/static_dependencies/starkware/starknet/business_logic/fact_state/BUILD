load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_business_logic_fact_state_lib",
    srcs = [
        "state.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_business_logic_fact_state_utils_lib",
        ":starknet_business_logic_patricia_state_lib",
        "//src/services/everest/business_logic:everest_business_logic_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starkware_utils:starkware_config_utils_lib",
        "//src/starkware/starkware_utils:starkware_utils_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_business_logic_patricia_state_lib",
    srcs = [
        "contract_class_objects.py",
        "contract_state_objects.py",
        "patricia_state.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/everest/business_logic:everest_business_logic_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/storage:starknet_storage_lib",
        "//src/starkware/starkware_utils:starkware_commitment_tree_facts_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        "//src/starkware/starkware_utils:starkware_utils_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_business_logic_fact_state_utils_lib",
    srcs = [
        "utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
    ],
)
