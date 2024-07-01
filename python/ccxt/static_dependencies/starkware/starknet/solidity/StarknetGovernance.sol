// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.0;

import "starkware/solidity/components/Governance.sol";

contract StarknetGovernance is Governance {
    string constant STARKNET_GOVERNANCE_INFO_TAG = "STARKNET_1.0_GOVERNANCE_INFO";

    /*
      Returns the GovernanceInfoStruct associated with the governance tag.
    */
    function getGovernanceInfo() internal view override returns (GovernanceInfoStruct storage gub) {
        bytes32 location = keccak256(abi.encodePacked(STARKNET_GOVERNANCE_INFO_TAG));
        assembly {
            gub.slot := location
        }
    }

    function starknetIsGovernor(address user) external view returns (bool) {
        return _isGovernor(user);
    }

    function starknetNominateNewGovernor(address newGovernor) external {
        _nominateNewGovernor(newGovernor);
    }

    function starknetRemoveGovernor(address governorForRemoval) external {
        _removeGovernor(governorForRemoval);
    }

    function starknetAcceptGovernance() external {
        _acceptGovernance();
    }

    function starknetCancelNomination() external {
        _cancelNomination();
    }
}
