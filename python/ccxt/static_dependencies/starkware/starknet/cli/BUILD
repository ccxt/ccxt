load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "py_exe", "pytest_test")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_cli_utils_lib",
    srcs = [
        "starknet_cli_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/external_api:services_external_api_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/services/api/feeder_gateway:response_objects",
        "//src/starkware/starknet/services/api/feeder_gateway:starknet_feeder_gateway_client_lib",
        "//src/starkware/starknet/services/api/feeder_gateway:starknet_feeder_gateway_request_objects_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_gateway_client_lib",
        "//src/starkware/starknet/wallets:starknet_standard_wallets_lib",
        "//src/starkware/starknet/wallets:starknet_wallets_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
    ],
)

py_library(
    name = "compiled_class_hash_lib",
    srcs = [
        "compiled_class_hash.py",
    ],
    deps = [
        "//src/starkware/cairo/lang:cairo_version_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
    ],
)

py_exe(
    name = "compute_compiled_class_hash",
    module = "starkware.starknet.cli.compiled_class_hash",
    deps = [
        ":compiled_class_hash_lib",
    ],
)

py_library(
    name = "starknet_cli_lib",
    srcs = [
        "class_hash.py",
        "reconstruct_starknet_traceback.py",
        "starknet_cli.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":compiled_class_hash_lib",
        ":starknet_cli_utils_lib",
        "//src/starkware/cairo/lang:cairo_version_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_utils_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_utils_lib",
        "//src/starkware/starknet/services/api/feeder_gateway:response_objects",
        "//src/starkware/starknet/services/api/feeder_gateway:starknet_feeder_gateway_client_lib",
        "//src/starkware/starknet/services/api/feeder_gateway:starknet_feeder_gateway_request_objects_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_gateway_client_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_transaction_schema_lib",
        "//src/starkware/starknet/utils:starknet_api_utils_lib",
        "//src/starkware/starknet/wallets:starknet_wallets_lib",
        requirement("eth_utils"),
    ],
)

py_exe(
    name = "starknet_cli",
    module = "starkware.starknet.cli.starknet_cli",
    deps = [
        "starknet_cli_lib",
    ],
)

py_exe(
    name = "compute_class_hash",
    module = "starkware.starknet.cli.class_hash",
    deps = [
        "starknet_cli_lib",
    ],
)

pytest_test(
    name = "starknet_cli_lib_test",
    srcs = [
        "reconstruct_starknet_traceback_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starknet_cli_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
    ],
)
