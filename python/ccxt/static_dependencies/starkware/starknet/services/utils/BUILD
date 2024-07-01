package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_sequencer_api_utils_lib",
    srcs = [
        "sequencer_api_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/everest/api/gateway:everest_transaction_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_deprecated_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/business_logic/transaction:starknet_transaction_deprecated_objects_lib",
        "//src/starkware/starknet/business_logic/transaction:starknet_transaction_fee_lib",
        "//src/starkware/starknet/business_logic/transaction:starknet_transaction_state_objects_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/services/api/feeder_gateway:response_objects",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
        "//src/starkware/starkware_utils:starkware_config_utils_lib",
    ],
)
