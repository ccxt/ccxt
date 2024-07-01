// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.0;

import "starkware/solidity/components/Operator.sol";
import "starkware/solidity/libraries/NamedStorage8.sol";

abstract contract StarknetOperator is Operator {
    string constant OPERATORS_MAPPING_TAG = "STARKNET_1.0_ROLES_OPERATORS_MAPPING_TAG";

    function getOperators() internal view override returns (mapping(address => bool) storage) {
        return NamedStorage.addressToBoolMapping(OPERATORS_MAPPING_TAG);
    }
}
