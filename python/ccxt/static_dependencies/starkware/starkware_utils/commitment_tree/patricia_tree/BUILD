load("//bazel_utils/python:defs.bzl", "requirement")
load("//bazel_utils:python.bzl", "pytest_test")

package(default_visibility = ["//visibility:public"])

exports_files([
    "fast_patricia_update.py",
    "nodes.py",
    "patricia_tree.py",
    "test_utils.py",
    "virtual_calculation_node.py",
    "virtual_patricia_node.py",
])

pytest_test(
    name = "patricia_tree_test",
    srcs = [
        "nodes_test.py",
        "patricia_tree_test.py",
        "virtual_calculation_node_test.py",
        "virtual_patricia_node_test.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_lib",
        "//src/starkware/crypto:starkware_crypto_lib",
        "//src/starkware/python:starkware_python_test_utils_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starkware_utils:starkware_utils_lib",
        "//src/starkware/storage:starkware_storage_lib",
        "//src/starkware/storage:starkware_storage_test_utils_lib",
        "//src/starkware/storage:starkware_storage_utils_lib",
        requirement("pytest_asyncio"),
    ],
)
