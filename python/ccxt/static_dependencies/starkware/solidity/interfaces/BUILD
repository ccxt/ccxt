load("//bazel_utils:solidity.bzl", "sol_library")

package(default_visibility = ["//visibility:public"])

exports_files(glob(["*.sol"]))

sol_library(
    name = "solidity_contracts_interfaces_sol",
    srcs = [
        "BlockDirectCall.sol",
        "IFactRegistry.sol",
        "IQueryableFactRegistry.sol",
        "Identity.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [
    ],
)

sol_library(
    name = "governance_interface_sol",
    srcs = [
        "MGovernance.sol",
        "MOperator.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [
    ],
)

sol_library(
    name = "solidity_contract_initializer_sol",
    srcs = [
        "ContractInitializer.sol",
        "ExternalInitializer.sol",
        "ProxySupport.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/solidity/components:governance_contract_sol",
        "//src/starkware/solidity/interfaces:solidity_contracts_interfaces_sol",
        "//src/starkware/solidity/libraries:common_library_sol",
    ],
)
