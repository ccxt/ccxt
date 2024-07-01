package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_messages_lib",
    srcs = [
        "messages.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/services/everest/definitions:everest_definitions_lib",
        "//src/starkware/cairo/bootloaders:cairo_bootloader_generate_fact_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/transaction:starknet_transaction_deprecated_objects_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
    ],
)
