// SPDX-License-Identifier: Apache-2.0.
pragma solidity >=0.6.12;

/*
  The Fact Registry design pattern is a way to separate cryptographic verification from the
  business logic of the contract flow.

  A fact registry holds a hash table of verified "facts" which are represented by a hash of claims
  that the registry hash check and found valid. This table may be queried by accessing the
  isValid() function of the registry with a given hash.

  In addition, each fact registry exposes a registry specific function for submitting new claims
  together with their proofs. The information submitted varies from one registry to the other
  depending of the type of fact requiring verification.

  For further reading on the Fact Registry design pattern see this
  `StarkWare blog post <https://medium.com/starkware/the-fact-registry-a64aafb598b6>`_.
*/
interface IFactRegistry {
    /*
      Returns true if the given fact was previously registered in the contract.
    */
    function isValid(bytes32 fact) external view returns (bool);
}
