load("//src/starkware/cairo/lang:cairo_rules.bzl", "cairo_library")

cairo_library(
    name = "starknet_os_state_lib",
    srcs = [
        "commitment.cairo",
        "output.cairo",
        "squash.cairo",
        "state.cairo",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/cairo/common:cairo_common_cairo_lib",
    ],
)
