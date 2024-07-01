load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_business_logic_state_lib",
    srcs = [
        "state.py",
        "state_api.py",
        "state_api_objects.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/everest/business_logic:everest_business_logic_state_api_lib",
        "//src/starkware/cairo/lang:cairo_version_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)
