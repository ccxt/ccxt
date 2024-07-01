load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_contract_class_lib",
    srcs = [
        "contract_class.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/everest/definitions:everest_definitions_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        "//src/starkware/starkware_utils:starkware_utils_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_contract_class_utils_lib",
    srcs = [
        "contract_class_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_contract_class_lib",
        "//src/starkware/starknet/compiler/v1:starknet_compile_v1_lib",
    ],
)
