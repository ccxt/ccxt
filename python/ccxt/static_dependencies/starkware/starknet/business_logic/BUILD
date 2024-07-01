package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_business_logic_utils_lib",
    srcs = [
        "utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang/builtins:cairo_all_builtins_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_deprecated_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_execution_usage_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/fact_state:starknet_business_logic_patricia_state_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
    ],
)
