// SPDX-License-Identifier: Apache-2.0.
pragma solidity >=0.6.12;

abstract contract MGovernance {
    function _isGovernor(address user) internal view virtual returns (bool);

    /*
      Allows calling the function only by a Governor.
    */
    modifier onlyGovernance() {
        require(_isGovernor(msg.sender), "ONLY_GOVERNANCE");
        _;
    }
}
