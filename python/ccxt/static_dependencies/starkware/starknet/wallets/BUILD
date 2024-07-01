package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_wallets_lib",
    srcs = [
        "account.py",
        "starknet_context.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_account_transaction_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
    ],
)

py_library(
    name = "starknet_standard_wallets_lib",
    srcs = [
        "open_zeppelin.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":signer",
        ":starknet_wallets_lib",
        "//src/services/external_api:services_external_api_lib",
        "//src/starkware/crypto:starkware_crypto_lib",
        "//src/starkware/starknet/core/os/contract_address:starknet_contract_address_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/services/api/feeder_gateway:starknet_feeder_gateway_request_objects_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_account_transaction_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
        "//src/starkware/starknet/third_party/open_zeppelin:open_zeppelin_contracts_lib",
    ],
)

py_library(
    name = "signer",
    srcs = [
        "signer.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/crypto:starkware_crypto_lib",
        "//src/starkware/starknet/core/os/contract_address:starknet_contract_address_lib",
        "//src/starkware/starknet/core/os/transaction_hash",
        "//src/starkware/starknet/core/os/transaction_hash:starknet_deprecated_transaction_hash_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/services/api/feeder_gateway:starknet_feeder_gateway_request_objects_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_account_transaction_lib",
        "//src/starkware/starknet/services/api/gateway:starknet_deprecated_transaction_lib",
    ],
)
