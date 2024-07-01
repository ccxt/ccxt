load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "pytest_test")

package(default_visibility = ["//visibility:public"])

exports_files(["contract_address.cairo"])

py_library(
    name = "starknet_contract_address_lib",
    srcs = [
        "contract_address.py",
    ],
    data = [
        "contract_address.cairo",
        "//src/starkware/starknet/common:starknet_common_cairo_lib",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_crypto_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
    ],
)

pytest_test(
    name = "starknet_contract_address_cairo_test",
    srcs = [
        "contract_address_cairo_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_contract_address_lib",
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/crypto:starkware_crypto_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        requirement("pytest_asyncio"),
    ],
)
