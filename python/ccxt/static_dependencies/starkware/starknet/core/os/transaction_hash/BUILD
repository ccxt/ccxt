load("//bazel_utils:python.bzl", "pytest_test")

package(default_visibility = ["//visibility:public"])

exports_files(["transaction_hash.cairo"])

pytest_test(
    name = "starknet_deprecated_transaction_hash_test",
    srcs = [
        "deprecated_transaction_hash_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_deprecated_transaction_hash_lib",
        ":transaction_hash_test_utils",
        "//src/starkware/crypto:starkware_crypto_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/core/test_contract:starknet_test_external_contract_test_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
    ],
)

py_library(
    name = "starknet_deprecated_transaction_hash_lib",
    srcs = [
        "deprecated_transaction_hash.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
    ],
)

pytest_test(
    name = "transaction_hash_test",
    srcs = [
        "transaction_hash_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_deprecated_transaction_hash_lib",
        ":transaction_hash",
        ":transaction_hash_test_utils",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/crypto:starkware_crypto_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/core/test_contract:starknet_test_external_contract_test_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
    ],
)

py_library(
    name = "transaction_hash",
    srcs = [
        "transaction_hash.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_deprecated_transaction_hash_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
    ],
)

py_library(
    name = "transaction_hash_test_utils",
    srcs = [
        "transaction_hash_test_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_deprecated_transaction_hash_lib",
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/starknet/core/os:starknet_os_program_py_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
    ],
)
