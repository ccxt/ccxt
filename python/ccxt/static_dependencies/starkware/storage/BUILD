load("//bazel_utils:python.bzl", "pytest_test")
load("//bazel_utils/python:defs.bzl", "requirement")

py_library(
    name = "starkware_storage_metric_lib",
    srcs = [
        "metrics.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        requirement("prometheus_client"),
    ],
)

py_library(
    name = "starkware_storage_test_utils_lib",
    srcs = [
        "test_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [":starkware_abstract_storage_lib"],
)

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starkware_abstract_storage_lib",
    srcs = [
        "__init__.py",
        "storage.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starkware_utils:starkware_config_utils_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        "//src/starkware/starkware_utils:starkware_serializability_utils_lib",
    ],
)

py_library(
    name = "starkware_dict_storage_lib",
    srcs = [
        "dict_storage.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starkware_abstract_storage_lib",
        ":starkware_storage_metric_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        requirement("cachetools"),
    ],
)

py_library(
    name = "starkware_imm_storage_lib",
    srcs = [
        "imm_storage.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starkware_abstract_storage_lib",
    ],
)

pytest_test(
    name = "starkware_abstract_storage_test",
    srcs = [
        "storage_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starkware_abstract_storage_lib",
        ":starkware_dict_storage_lib",
        ":starkware_storage_test_utils_lib",
        requirement("pytest_asyncio"),
    ],
)

py_library(
    name = "starkware_storage_lib",
    srcs = [
        "gated_storage.py",
        "names.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starkware_abstract_storage_lib",
        "//src/starkware/starkware_utils/time:starkware_utils_time_lib",
    ],
)

py_library(
    name = "starkware_storage_utils_lib",
    srcs = [
        "storage_utils.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starkware_storage_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starkware_utils:starkware_commitment_tree_facts_lib",
    ],
)

pytest_test(
    name = "starkware_storage_test",
    srcs = [
        "gated_storage_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starkware_storage_lib",
        ":starkware_storage_test_utils_lib",
        requirement("pytest_asyncio"),
    ],
)
