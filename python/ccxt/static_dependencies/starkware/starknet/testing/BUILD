load("//bazel_utils:solidity.bzl", "sol_contract", "sol_library")
load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "pytest_test")
load("//src/starkware/cairo/lang:cairo_rules.bzl", "cairo_library")

sol_library(
    name = "starknet_mock_messaging_sol",
    srcs = [
        "MockStarknetMessaging.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/starknet/solidity:starknet_messaging_sol",
    ],
)

sol_contract(
    name = "mock_starknet_messaging_sol_env",
    contracts = [
        "MockStarknetMessaging.json",
    ],
    solc_exe = "//bazel_utils:solc-0.8.24",
    deps = [
        "starknet_mock_messaging_sol",
    ],
)

py_library(
    name = "starknet_mock_messaging_contracts_lib",
    srcs = [
        "contracts.py",
    ],
    data = [
        ":mock_starknet_messaging_sol_env",
    ],
    visibility = ["//visibility:public"],
    deps = ["//src/starkware/solidity:starkware_contracts_utils_lib"],
)

cairo_library(
    name = "starknet_testing_cairo_lib",
    srcs = [
        "test.cairo",
        "test_cairo1.cairo",
        "test_unwhitelisted_hint.cairo",
    ],
    deps = [
        "//src/starkware/cairo/common:cairo_common_cairo_lib",
        "//src/starkware/starknet/common:starknet_common_cairo_lib",
    ],
)

pytest_test(
    name = "starknet_testing_test",
    srcs = [
        "conftest.py",
        "contract_test.py",
        "mock_starknet_messaging_test.py",
        "postman_test.py",
        "starknet_test.py",
    ],
    data = [":starknet_testing_cairo_lib"],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_mock_messaging_contracts_lib",
        ":starknet_testing_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/eth:starkware_eth_test_utils_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_transaction_execution_objects_lib",
        "//src/starkware/starknet/compiler:starknet_compile_lib",
        "//src/starkware/starknet/compiler/v1:starknet_compile_v1_lib",
        "//src/starkware/starknet/core/test_contract:starknet_test_external_contract_test_utils_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api:starknet_messages_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/utils:starknet_api_utils_lib",
        requirement("pytest_asyncio"),
    ],
)

py_library(
    name = "starknet_testing_test_utils_lib",
    srcs = [
        "test_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/starknet/business_logic/transaction:starknet_transaction_deprecated_objects_lib",
        "//src/starkware/starknet/core/os/contract_address:starknet_contract_address_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
    ],
)

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_testing_lib",
    srcs = [
        "contract.py",
        "contract_utils.py",
        "objects.py",
        "postman.py",
        "starknet.py",
        "state.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_mock_messaging_contracts_lib",
        ":starknet_testing_test_utils_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/eth:starkware_eth_test_utils_lib",
        "//src/starkware/eth:web3_wrapper_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_execute_entry_point_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/fact_state:starknet_business_logic_fact_state_lib",
        "//src/starkware/starknet/business_logic/fact_state:starknet_business_logic_patricia_state_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/business_logic/transaction:starknet_transaction_deprecated_objects_lib",
        "//src/starkware/starknet/compiler:starknet_compile_lib",
        "//src/starkware/starknet/compiler/v1:starknet_compile_v1_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/core/test_contract:starknet_test_external_contract_test_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api:starknet_messages_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_utils_lib",
        "//src/starkware/starknet/services/api/feeder_gateway:response_objects",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
        "//src/starkware/starknet/utils:starknet_api_utils_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
        "//src/starkware/storage:starkware_dict_storage_lib",
        requirement("typeguard"),
    ],
)
