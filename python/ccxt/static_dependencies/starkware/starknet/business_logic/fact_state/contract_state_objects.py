import dataclasses
from dataclasses import field
from typing import ClassVar, FrozenSet, Iterable, Mapping, Optional

import marshmallow_dataclass

from services.everest.business_logic.state import StateSelectorBase
from starkware.python.utils import to_bytes
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.storage.starknet_storage import StorageLeaf
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact
from starkware.starkware_utils.commitment_tree.patricia_tree.nodes import EmptyNodeFact
from starkware.starkware_utils.commitment_tree.patricia_tree.patricia_tree import PatriciaTree
from starkware.starkware_utils.error_handling import stark_assert
from starkware.starkware_utils.validated_dataclass import (
    ValidatedDataclass,
    ValidatedMarshmallowDataclass,
)
from starkware.storage.storage import HASH_BYTES, FactFetchingContext, HashFunctionType


@marshmallow_dataclass.dataclass(frozen=True)
class ContractState(ValidatedMarshmallowDataclass, LeafFact):
    """
    Represents the state of a single contract (sub-commitment tree) in the full StarkNet state
    commitment tree.
    The contract state contains the contract object (None if the contract was not yet deployed)
    and the commitment tree root of the contract storage.
    """

    contract_hash: bytes = field(metadata=fields.class_hash_metadata)
    storage_commitment_tree: PatriciaTree
    nonce: int = field(metadata=fields.non_required_nonce_metadata)

    UNINITIALIZED_CLASS_HASH: ClassVar[bytes] = bytes(HASH_BYTES)

    @classmethod
    async def create(
        cls, contract_hash: bytes, storage_commitment_tree: PatriciaTree, nonce: int
    ) -> "ContractState":
        return cls(
            storage_commitment_tree=storage_commitment_tree,
            contract_hash=contract_hash,
            nonce=nonce,
        )

    @classmethod
    async def empty(
        cls, storage_commitment_tree_height: int, ffc: FactFetchingContext
    ) -> "ContractState":
        empty_tree = await PatriciaTree.empty_tree(
            ffc=ffc, height=storage_commitment_tree_height, leaf_fact=StorageLeaf.empty()
        )

        return cls(
            storage_commitment_tree=empty_tree,
            contract_hash=cls.UNINITIALIZED_CLASS_HASH,
            nonce=0,
        )

    @property
    def is_empty(self) -> bool:
        return (
            self.storage_commitment_tree.root == EmptyNodeFact.EMPTY_NODE_HASH
            and self.contract_hash == self.UNINITIALIZED_CLASS_HASH
            and self.nonce == 0
        )

    def _hash(self, hash_func: HashFunctionType) -> bytes:
        """
        Computes the hash of the node containing the contract's information, including the contract
        definition and storage.
        """
        if self.is_empty:
            return EmptyNodeFact.EMPTY_NODE_HASH

        CONTRACT_STATE_HASH_VERSION = 0

        # Set hash_value = H(H(contract_hash, storage_root), RESERVED).
        hash_value = hash_func(self.contract_hash, self.storage_commitment_tree.root)
        hash_value = hash_func(hash_value, to_bytes(self.nonce))

        # Return H(hash_value, CONTRACT_STATE_HASH_VERSION). CONTRACT_STATE_HASH_VERSION must be in
        # the outermost hash to guarantee unique "decoding".
        return hash_func(hash_value, to_bytes(CONTRACT_STATE_HASH_VERSION))

    @property
    def initialized(self) -> bool:
        uninitialized = self.contract_hash == self.UNINITIALIZED_CLASS_HASH
        if uninitialized:
            assert (
                self.storage_commitment_tree.root == EmptyNodeFact.EMPTY_NODE_HASH
            ), "Contract storage commitment root must be empty if class hash is uninitialized."

        return not uninitialized

    def assert_initialized(self, contract_address: int):
        """
        Asserts that the current ContractState is initialized.

        Takes contract_address as input to improve the error message.
        """
        address_formatter = fields.L2AddressField.format
        stark_assert(
            self.initialized,
            code=StarknetErrorCode.UNINITIALIZED_CONTRACT,
            message=f"Contract with address {address_formatter(contract_address)} is not deployed.",
        )

    async def update(
        self,
        ffc: FactFetchingContext,
        updates: Mapping[int, int],
        nonce: Optional[int],
        class_hash: Optional[int] = None,
    ) -> "ContractState":
        """
        Returns a new ContractState object with the same contract object and a newly calculated
        storage root, according to the given updates of its leaves.
        """
        if class_hash is None:
            class_hash_bytes = self.contract_hash
        else:
            class_hash_bytes = to_bytes(class_hash)

        if nonce is None:
            nonce = self.nonce

        modifications = [(key, StorageLeaf(value=value)) for key, value in updates.items()]

        updated_storage_commitment_tree = await self.storage_commitment_tree.update_efficiently(
            ffc=ffc, modifications=modifications
        )

        return ContractState(
            contract_hash=class_hash_bytes,
            storage_commitment_tree=updated_storage_commitment_tree,
            nonce=nonce,
        )


@dataclasses.dataclass(frozen=True)
class ContractCarriedState(ValidatedDataclass):
    """
    Represents the state of a single contract in the full StarkNet state commitment tree,
    as well as the modifications made to the contract storage, accumulated between transactions.
    """

    state: ContractState
    storage_updates: Mapping[int, int]
    nonce: int

    @property
    def has_pending_updates(self) -> bool:
        """
        Returns whether there are cached storage changes that are not yet applied to the storage
        commitment tree root.
        """
        return len(self.storage_updates) > 0

    @classmethod
    def from_state(cls, state: ContractState) -> "ContractCarriedState":
        return cls(state=state, storage_updates={}, nonce=state.nonce)

    @classmethod
    async def empty(
        cls, storage_commitment_tree_height: int, ffc: FactFetchingContext
    ) -> "ContractCarriedState":
        empty_state = await ContractState.empty(
            storage_commitment_tree_height=storage_commitment_tree_height, ffc=ffc
        )

        return cls(state=empty_state, storage_updates={}, nonce=0)

    async def update(self, ffc: FactFetchingContext) -> "ContractCarriedState":
        updated_state = await self.state.update(
            ffc=ffc, updates=self.storage_updates, nonce=self.nonce
        )

        return ContractCarriedState.from_state(state=updated_state)


@dataclasses.dataclass(frozen=True)
class StateSelector(StateSelectorBase):
    """
    A class that contains a set of StarkNet contract addresses (sub-commitment tree root IDs)
    and a set of hashes of relevant contract classes
    affected by one/many transaction(s).
    Used for fetching those sub-trees and classes from storage before transaction(s) processing.
    """

    contract_addresses: FrozenSet[int]
    class_hashes: FrozenSet[int]

    @classmethod
    def empty(cls) -> "StateSelector":
        return cls(contract_addresses=frozenset(), class_hashes=frozenset())

    @classmethod
    def create(
        cls, contract_addresses: Iterable[int], class_hashes: Iterable[int]
    ) -> "StateSelector":
        return cls(
            contract_addresses=frozenset(contract_addresses), class_hashes=frozenset(class_hashes)
        )

    def __and__(self, other: "StateSelector") -> "StateSelector":
        return StateSelector(
            contract_addresses=self.contract_addresses & other.contract_addresses,
            class_hashes=self.class_hashes & other.class_hashes,
        )

    def __or__(self, other: "StateSelector") -> "StateSelector":
        return StateSelector(
            contract_addresses=self.contract_addresses | other.contract_addresses,
            class_hashes=self.class_hashes | other.class_hashes,
        )

    def __sub__(self, other: "StateSelector") -> "StateSelector":
        return StateSelector(
            contract_addresses=self.contract_addresses - other.contract_addresses,
            class_hashes=self.class_hashes - other.class_hashes,
        )

    def __le__(self, other: "StateSelector") -> bool:
        return (self.contract_addresses <= other.contract_addresses) and (
            self.class_hashes <= other.class_hashes
        )

    def update(self, other: "StateSelector"):
        raise NotImplementedError(f"Unsupported method since the sets are frozen.")
