load("//bazel_utils:solidity.bzl", "sol_contract", "sol_library")

sol_library(
    name = "starknet_messaging_sol",
    srcs = [
        "StarknetMessaging.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_messaging_interface_sol",
        "//src/starkware/solidity/libraries:named_storage8_sol",
    ],
)

sol_library(
    name = "starknet_messaging_interface_sol",
    srcs = [
        "IStarknetMessaging.sol",
        "IStarknetMessagingEvents.sol",
    ],
    visibility = ["//visibility:public"],
)

sol_library(
    name = "starknet_governance_sol",
    srcs = [
        "StarknetGovernance.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [
        "//src/starkware/solidity/components:governance_contract_sol",
    ],
)

sol_library(
    name = "starknet_core_sol",
    srcs = [
        "Output.sol",
        "Starknet.sol",
        "StarknetGovernance.sol",
        "StarknetOperator.sol",
        "StarknetState.sol",
        "//src/starkware/solidity/components:Governance.sol",
        "//src/starkware/solidity/components:GovernedFinalizable.sol",
        "//src/starkware/solidity/components:OnchainDataFactTreeEncoder.sol",
        "//src/starkware/solidity/components:Operator.sol",
        "//src/starkware/solidity/interfaces:BlockDirectCall.sol",
        "//src/starkware/solidity/interfaces:ContractInitializer.sol",
        "//src/starkware/solidity/interfaces:IFactRegistry.sol",
        "//src/starkware/solidity/interfaces:Identity.sol",
        "//src/starkware/solidity/interfaces:MGovernance.sol",
        "//src/starkware/solidity/interfaces:MOperator.sol",
        "//src/starkware/solidity/interfaces:ProxySupport.sol",
    ],
    visibility = ["//visibility:public"],
    deps = [
        ":starknet_messaging_sol",
        "//src/starkware/solidity/libraries:common_library_sol",
        "//src/starkware/solidity/libraries:named_storage8_sol",
    ],
)

sol_contract(
    name = "starknet_core_contract",
    contracts = [
        "Starknet.json",
    ],
    evm_version = "cancun",
    solc_exe = "//bazel_utils:solc-0.8.24",
    deps = [
        "starknet_core_sol",
    ],
)

package(default_visibility = ["//visibility:public"])
