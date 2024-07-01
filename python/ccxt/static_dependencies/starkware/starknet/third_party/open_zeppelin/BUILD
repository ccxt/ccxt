load("//src/starkware/starknet:starknet_rules_v0.bzl", "starknet_contract_v0")

package(default_visibility = ["//visibility:public"])

starknet_contract_v0(
    name = "account",
    srcs = [
        "Account.cairo",
    ],
    cairoopts = ["--account_contract"],
    compiled_program_name = "account.json",
    main = "Account.cairo",
    deps = [
        "//src/starkware/starknet/third_party/open_zeppelin/utils:constants",
    ],
)

py_library(
    name = "open_zeppelin_contracts_lib",
    srcs = [
        "starknet_contracts.py",
    ],
    data = [
        "account.json",
        "//src/starkware/starknet/common:starknet_common_cairo_lib",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
    ],
)
