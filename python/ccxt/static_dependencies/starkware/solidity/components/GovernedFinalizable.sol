// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.0;

import "starkware/solidity/interfaces/MGovernance.sol";
import "starkware/solidity/libraries/NamedStorage8.sol";

/**
  A Governor controlled finalizable contract.
  The inherited contract (the one that is GovernedFinalizable) implements the Governance.
*/
abstract contract GovernedFinalizable is MGovernance {
    event Finalized();

    string constant STORAGE_TAG = "STARKWARE_CONTRACTS_GOVERENED_FINALIZABLE_1.0_TAG";

    function isFinalized() public view returns (bool) {
        return NamedStorage.getBoolValue(STORAGE_TAG);
    }

    modifier notFinalized() {
        require(!isFinalized(), "FINALIZED");
        _;
    }

    function finalize() external onlyGovernance notFinalized {
        NamedStorage.setBoolValue(STORAGE_TAG, true);
        emit Finalized();
    }
}
