load("//bazel_utils:python.bzl", "pytest_test")
load("//bazel_utils/python:defs.bzl", "requirement")

package(default_visibility = ["//visibility:public"])

py_library(
    name = "starknet_security_lib",
    srcs = [
        "secure_hints.py",
        "simple_references.py",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/lang/compiler:cairo_compile_lib",
        "//src/starkware/starkware_utils:starkware_dataclasses_utils_lib",
        requirement("marshmallow"),
        requirement("marshmallow_dataclass"),
    ],
)

py_library(
    name = "starknet_hints_whitelist_lib",
    srcs = [
        "hints_whitelist.py",
    ],
    data = [
        "//src/starkware/starknet/security/whitelists:0.10.3.json",
        "//src/starkware/starknet/security/whitelists:0.6.0.json",
        "//src/starkware/starknet/security/whitelists:0.8.2.json",
        "//src/starkware/starknet/security/whitelists:384_bit_prime_field.json",
        "//src/starkware/starknet/security/whitelists:cairo_blake2s.json",
        "//src/starkware/starknet/security/whitelists:cairo_keccak.json",
        "//src/starkware/starknet/security/whitelists:cairo_secp.json",
        "//src/starkware/starknet/security/whitelists:cairo_sha256.json",
        "//src/starkware/starknet/security/whitelists:cairo_sha256_arbitrary_input_length.json",
        "//src/starkware/starknet/security/whitelists:ec_bigint.json",
        "//src/starkware/starknet/security/whitelists:ec_recover.json",
        "//src/starkware/starknet/security/whitelists:encode_packed.json",
        "//src/starkware/starknet/security/whitelists:latest.json",
        "//src/starkware/starknet/security/whitelists:uint256_improvements.json",
        "//src/starkware/starknet/security/whitelists:vrf.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starknet_security_lib",
    ],
)

pytest_test(
    name = "starknet_hints_latest_whitelist_test",
    srcs = [
        "latest_whitelist_test.py",
        "secure_hints_test.py",
        "simple_references_test.py",
    ],
    data = [
        "starknet_common.cairo",
        "//src/starkware/starknet/common:starknet_common_cairo_lib",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "starknet_security_lib",
        "//src/starkware/cairo/lang:cairo_constants_lib",
        "//src/starkware/python:starkware_python_utils_lib",
        "//src/starkware/starknet/security:starknet_hints_whitelist_lib",
    ],
)
