load("//bazel_utils:solidity.bzl", "sol_library")

package(default_visibility = ["//visibility:public"])

exports_files(glob(["*.sol"]))

sol_library(
    name = "governance_sol",
    srcs = [
        "Governance.sol",
    ],
    deps = [
        "//src/starkware/solidity/interfaces:governance_interface_sol",
    ],
)

sol_library(
    name = "governance_contract_sol",
    srcs = [
        "GenericGovernance.sol",
        "Governance.sol",
        "GovernanceStorage.sol",
        "Operator.sol",
    ],
    deps = [
        "//src/starkware/solidity/interfaces:governance_interface_sol",
    ],
)

sol_library(
    name = "solidity_contracts_components_sol",
    srcs = [
        "FactRegistry.sol",
        "OnchainDataFactTreeEncoder.sol",
    ],
    deps = [
        "//src/starkware/solidity/interfaces:solidity_contracts_interfaces_sol",
        "//src/starkware/solidity/libraries:common_library_sol",
    ],
)

sol_library(
    name = "governed_finalizable_sol",
    srcs = [
        "GovernedFinalizable.sol",
    ],
    deps = [
        "//src/starkware/solidity/interfaces:governance_interface_sol",
        "//src/starkware/solidity/libraries:named_storage8_sol",
    ],
)
