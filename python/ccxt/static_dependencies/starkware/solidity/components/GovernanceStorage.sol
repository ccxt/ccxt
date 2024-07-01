// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.6.12;
import {GovernanceInfoStruct} from "./Governance.sol";

/*
  Holds the governance slots for ALL entities, including proxy and the main contract.
*/
contract GovernanceStorage {
    // A map from a Governor tag to its own GovernanceInfoStruct.
    mapping(string => GovernanceInfoStruct) internal governanceInfo; //NOLINT uninitialized-state.
}
