load("//src/starkware/starknet:starknet_rules_v0.bzl", "starknet_contract_v0")
load("//bazel_utils:get_from_cairo_lang.bzl", "get_from_cairo_lang")

starknet_contract_v0(
    name = "delegate_proxy",
    srcs = [
        "delegate_proxy.cairo",
    ],
    compiled_program_name = "delegate_proxy.json",
    main = "delegate_proxy.cairo",
)

starknet_contract_v0(
    name = "dummy_account",
    srcs = ["dummy_account.cairo"],
    cairoopts = ["--account_contract"],
    compiled_program_name = "dummy_account.json",
    main = "dummy_account.cairo",
)

py_library(
    name = "starknet_external_compiled_contracts_lib",
    data = [
        "delegate_proxy.json",
        "dummy_account.json",
    ],
    visibility = ["//visibility:public"],
)

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_test_external_contract_test_utils_lib",
    srcs = [
        "test_utils.py",
    ],
    data = [
        "delegate_proxy.json",
        "dummy_account.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        get_from_cairo_lang("//src/starkware/cairo/lang:cairo_constants_lib"),
        get_from_cairo_lang("//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib"),
    ],
)
