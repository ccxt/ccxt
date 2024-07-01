load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_transaction_execution_objects_lib",
    srcs = [
        "objects.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/everest/business_logic:everest_transaction_execution_objects_lib",
        "//src/services/everest/definitions:everest_definitions_lib",
        "//src/starkware/cairo/lang/vm:cairo_relocatable_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/fact_state:starknet_business_logic_patricia_state_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_field_utils_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_deprecated_transaction_execution_objects_lib",
    srcs = [
        "deprecated_objects.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_transaction_execution_objects_lib",
        "//src/services/everest/business_logic:everest_transaction_execution_objects_lib",
        "//src/services/everest/definitions:everest_definitions_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/starknet/business_logic/fact_state:starknet_business_logic_patricia_state_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_field_utils_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_execute_entry_point_base_lib",
    srcs = [
        "execute_entry_point_base.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_deprecated_transaction_execution_objects_lib",
        ":starknet_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
    ],
)

py_library(
    name = "starknet_execute_entry_point_lib",
    srcs = [
        "execute_entry_point.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_deprecated_transaction_execution_objects_lib",
        ":starknet_execute_entry_point_base_lib",
        ":starknet_transaction_execution_objects_lib",
        "//src/services/everest/definitions:everest_definitions_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang/vm:cairo_relocatable_lib",
        "//src/starkware/cairo/lang/vm:cairo_run_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/builtins/segment_arena:segment_arena_builtin_lib",
        "//src/starkware/starknet/business_logic:starknet_business_logic_utils_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/core/os:starknet_deprecated_syscall_handler_lib",
        "//src/starkware/starknet/core/os:starknet_os_utils_lib",
        "//src/starkware/starknet/core/os:starknet_syscall_handler_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
    ],
)

py_library(
    name = "starknet_execution_usage_lib",
    srcs = [
        "gas_usage.py",
        "os_usage.py",
    ],
    data = [
        "//src/starkware/starknet/definitions:versioned_constants.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_transaction_execution_objects_lib",
        "//src/services/external_api:services_eth_gas_constants_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        requirement("marshmallow_dataclass"),
    ],
)
