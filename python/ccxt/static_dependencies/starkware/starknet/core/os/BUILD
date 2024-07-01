load("//src/starkware/cairo/lang:cairo_rules.bzl", "cairo_binary", "cairo_library")
load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "pytest_test")

cairo_library(
    name = "starknet_builtins_cairo_lib",
    srcs = [
        "builtins.cairo",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/builtin_selection:cairo_builtin_selection_cairo_lib",
        "//src/starkware/starknet/builtins/segment_arena:segment_arena_cairo_lib",
    ],
)

cairo_binary(
    name = "starknet_builtins",
    cairoopts = [
        "--debug_info_with_source",
    ],
    compiled_program_name = "starknet_builtins.json",
    main = "//src/starkware/starknet/core/os:builtins.cairo",
    deps = [":starknet_builtins_cairo_lib"],
)

cairo_library(
    name = "starknet_os_program_cairo_lib",
    srcs = [
        "block_context.cairo",
        "constants.cairo",
        "os.cairo",
        "output.cairo",
        "//src/starkware/starknet/common:constants.cairo",
        "//src/starkware/starknet/common:storage.cairo",
        "//src/starkware/starknet/core/os/contract_address:contract_address.cairo",
        "//src/starkware/starknet/core/os/contract_class:compiled_class.cairo",
        "//src/starkware/starknet/core/os/contract_class:deprecated_compiled_class.cairo",
        "//src/starkware/starknet/core/os/execution:deprecated_execute_entry_point.cairo",
        "//src/starkware/starknet/core/os/execution:deprecated_execute_syscalls.cairo",
        "//src/starkware/starknet/core/os/execution:execute_entry_point.cairo",
        "//src/starkware/starknet/core/os/execution:execute_syscalls.cairo",
        "//src/starkware/starknet/core/os/execution:execute_transactions.cairo",
        "//src/starkware/starknet/core/os/os_config:os_config.cairo",
        "//src/starkware/starknet/core/os/transaction_hash:transaction_hash.cairo",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_builtins_cairo_lib",
        ":starknet_new_syscalls_cairo_lib",
        ":starknet_syscalls_cairo_lib",
        "//src/starkware/cairo/common:cairo_common_cairo_lib",
        "//src/starkware/starknet/core/os/contract_class:starknet_os_abi_cairo_lib",
        "//src/starkware/starknet/core/os/data_availability:bls_field",
        "//src/starkware/starknet/core/os/data_availability:commitment",
        "//src/starkware/starknet/core/os/state:starknet_os_state_lib",
    ],
)

cairo_library(
    name = "starknet_syscalls_cairo_lib",
    srcs = [
        "//src/starkware/starknet/common:syscalls.cairo",
    ],
)

cairo_binary(
    name = "starknet_syscalls",
    cairoopts = [
        "--debug_info_with_source",
    ],
    compiled_program_name = "starknet_syscalls.json",
    main = "//src/starkware/starknet/common:syscalls.cairo",
    deps = [":starknet_syscalls_cairo_lib"],
)

cairo_library(
    name = "starknet_new_syscalls_cairo_lib",
    srcs = [
        "//src/starkware/starknet/common:new_syscalls.cairo",
    ],
)

cairo_binary(
    name = "starknet_new_syscalls",
    cairoopts = [
        "--debug_info_with_source",
    ],
    compiled_program_name = "starknet_new_syscalls.json",
    main = "//src/starkware/starknet/common:new_syscalls.cairo",
    deps = [":starknet_new_syscalls_cairo_lib"],
)

cairo_binary(
    name = "starknet_os_program",
    cairoopts = [
        "--debug_info_with_source",
    ],
    compiled_program_name = "starknet_os_compiled.json",
    main = "os.cairo",
    deps = [":starknet_os_program_cairo_lib"],
)

py_library(
    name = "starknet_os_utils_lib",
    srcs = [
        "os_utils.py",
        "segment_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_deprecated_syscall_handler_lib",
        ":starknet_syscall_handler_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang/vm:cairo_relocatable_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
    ],
)

py_library(
    name = "starknet_os_program_py_lib",
    srcs = [
        "os_program.py",
    ],
    data = [
        "starknet_os_compiled.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/bootloaders:cairo_hash_program_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/starknet/core/os/data_availability:bls_utils",
        requirement("cachetools"),
    ],
)

py_library(
    name = "syscall_utils_lib",
    srcs = [
        "syscall_utils.py",
    ],
    data = [
        "starknet_builtins.json",
        "starknet_new_syscalls.json",
        "starknet_syscalls.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/vm:cairo_relocatable_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_execute_entry_point_base_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        requirement("cachetools"),
    ],
)

py_library(
    name = "os_logger_lib",
    srcs = [
        "os_logger.py",
    ],
    data = [
        "starknet_builtins.json",
        "starknet_new_syscalls.json",
        "starknet_syscalls.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":syscall_utils_lib",
        "//src/starkware/cairo/lang/builtins:cairo_all_builtins_lib",
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/cairo/lang/vm:cairo_relocatable_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/transaction:starknet_transaction_objects_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        requirement("cachetools"),
    ],
)

py_library(
    name = "starknet_syscall_handler_lib",
    srcs = [
        "syscall_handler.py",
    ],
    data = [
        "starknet_new_syscalls.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":os_logger_lib",
        ":syscall_utils_lib",
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/common/cairo_secp:utils",
        "//src/starkware/cairo/lang/vm:cairo_relocatable_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_deprecated_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_execute_entry_point_base_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/fact_state:starknet_business_logic_patricia_state_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/core/os/contract_address:starknet_contract_address_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/storage:starknet_storage_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
        "//src/starkware/storage:starkware_abstract_storage_lib",
        requirement("cachetools"),
    ],
)

py_library(
    name = "starknet_deprecated_syscall_handler_lib",
    srcs = [
        "deprecated_syscall_handler.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":os_logger_lib",
        ":starknet_syscall_handler_lib",
        ":syscall_utils_lib",
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/cairo/common:cairo_function_runner_lib",
        "//src/starkware/cairo/lang/vm:cairo_relocatable_lib",
        "//src/starkware/cairo/lang/vm:cairo_vm_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_deprecated_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_execute_entry_point_base_lib",
        "//src/starkware/starknet/business_logic/execution:starknet_transaction_execution_objects_lib",
        "//src/starkware/starknet/business_logic/state:starknet_business_logic_state_lib",
        "//src/starkware/starknet/core/os/contract_address:starknet_contract_address_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/public:starknet_abi_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starkware_utils:starkware_error_handling_lib",
    ],
)

package(default_visibility = ["//visibility:public"])

exports_files(["program_hash.json"])

pytest_test(
    name = "starknet_os_program_hash_test",
    srcs = [
        "program_hash_test.py",
    ],
    data = [
        "program_hash.json",
        "starknet_os_compiled.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/bootloaders:program_hash_test_utils_lib",
        "//src/starkware/python:starkware_python_utils_lib",
    ],
)

py_library(
    name = "starknet_os_lib",
    srcs = [
        "os_input.py",
    ],
    data = [
        "output.cairo",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_deprecated_syscall_handler_lib",
        ":starknet_syscall_handler_lib",
        "//src/starkware/starknet/business_logic/fact_state:starknet_business_logic_patricia_state_lib",
        "//src/starkware/starknet/business_logic/transaction:internal_transaction_schema",
        "//src/starkware/starknet/business_logic/transaction:starknet_transaction_objects_lib",
        "//src/starkware/starknet/definitions:starknet_definitions_lib",
        "//src/starkware/starknet/definitions:starknet_general_config_lib",
        "//src/starkware/starknet/services/api/contract_class:starknet_contract_class_lib",
        "//src/starkware/starknet/storage:starknet_storage_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)
