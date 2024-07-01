load("//bazel_utils/python:defs.bzl", "requirement")

py_library(
    name = "starkware_crypto_lib",
    srcs = [
        "//src/starkware/crypto/signature:fast_pedersen_hash.py",
        "//src/starkware/crypto/signature:math_utils.py",
        "//src/starkware/crypto/signature:nothing_up_my_sleeve_gen.py",
        "//src/starkware/crypto/signature:signature.py",
    ],
    data = [
        "//src/starkware/crypto/signature:pedersen_params.json",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/python:starkware_python_utils_lib",
        requirement("ecdsa"),
        requirement("fastecdsa"),
        requirement("mpmath"),
        requirement("sympy"),
    ],
)

package(default_visibility = ["//visibility:public"])
