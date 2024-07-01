// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.0;

import "./Output.sol";

library StarknetState {
    struct State {
        uint256 globalRoot;
        int256 blockNumber;
        uint256 blockHash;
    }

    function copy(State storage state, State memory stateFrom) internal {
        state.globalRoot = stateFrom.globalRoot;
        state.blockNumber = stateFrom.blockNumber;
        state.blockHash = stateFrom.blockHash;
    }

    /**
      Validates that the 'blockNumber' and the previous root are consistent with the
      current state and updates the state.
    */
    function update(State storage state, uint256[] calldata starknetOutput) internal {
        // Check the blockNumber first as the error is less ambiguous then INVALID_PREVIOUS_ROOT.
        state.blockNumber += 1;
        require(
            uint256(state.blockNumber) == starknetOutput[StarknetOutput.BLOCK_NUMBER_OFFSET],
            "INVALID_BLOCK_NUMBER"
        );

        state.blockHash = starknetOutput[StarknetOutput.BLOCK_HASH_OFFSET];

        uint256[] calldata commitment_tree_update = StarknetOutput.getMerkleUpdate(starknetOutput);
        require(
            state.globalRoot == CommitmentTreeUpdateOutput.getPrevRoot(commitment_tree_update),
            "INVALID_PREVIOUS_ROOT"
        );
        state.globalRoot = CommitmentTreeUpdateOutput.getNewRoot(commitment_tree_update);
    }
}
