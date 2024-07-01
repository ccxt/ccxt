// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.6.12;

import "../interfaces/IQueryableFactRegistry.sol";

contract FactRegistry is IQueryableFactRegistry {
    // Mapping: fact hash -> true.
    mapping(bytes32 => bool) private verifiedFact;

    // Indicates whether the Fact Registry has at least one fact registered.
    bool anyFactRegistered = false;

    /*
      Checks if a fact was registered.
    */
    function isValid(bytes32 fact) external view virtual override returns (bool) {
        return internalIsValid(fact);
    }

    /*
      The internal implementation that checks if the fact was registered.
    */
    function internalIsValid(bytes32 fact) internal view virtual returns (bool) {
        return verifiedFact[fact];
    }

    function registerFact(bytes32 factHash) internal {
        // This function stores the fact hash in the mapping.
        verifiedFact[factHash] = true;

        // Mark first time off.
        if (!anyFactRegistered) {
            anyFactRegistered = true;
        }
    }

    /*
      Indicates whether at least one fact was registered.
    */
    function hasRegisteredFact() external view override returns (bool) {
        return anyFactRegistered;
    }
}
