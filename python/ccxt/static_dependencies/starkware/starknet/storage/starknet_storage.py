import asyncio
import dataclasses
from dataclasses import field
from typing import Collection, Dict, Mapping, Set, Tuple, Type

from starkware.python.utils import execute_coroutine_threadsafe, from_bytes
from starkware.starknet.definitions import fields
from starkware.starkware_utils.commitment_tree.binary_fact_tree import BinaryFactDict
from starkware.starkware_utils.commitment_tree.leaf_fact import LeafFact, TLeafFact
from starkware.starkware_utils.commitment_tree.leaf_fact_utils import FeltLeaf
from starkware.starkware_utils.commitment_tree.patricia_tree.patricia_tree import PatriciaTree
from starkware.starkware_utils.validated_dataclass import ValidatedDataclass
from starkware.storage.storage import FactFetchingContext

ContractStorageMapping = Dict[int, "StorageLeaf"]


class StorageLeaf(FeltLeaf):
    """
    Represents a commitment tree leaf in a Starknet contract storage.
    """

    @classmethod
    def prefix(cls) -> bytes:
        return b"starknet_storage_leaf"


@dataclasses.dataclass(frozen=True)
class CommitmentInfo(ValidatedDataclass):
    """
    Contains hints needed for the commitment tree update in the OS.
    """

    previous_root: int
    updated_root: int
    tree_height: int
    commitment_facts: Mapping[int, Tuple[int, ...]] = field(
        metadata=fields.commitment_facts_metadata
    )

    @classmethod
    async def create_from_expected_updated_tree(
        cls,
        previous_tree: PatriciaTree,
        expected_updated_tree: PatriciaTree,
        expected_accessed_indices: Collection[int],
        leaf_fact_cls: Type[LeafFact],
        ffc: FactFetchingContext,
    ) -> "CommitmentInfo":
        """
        returns a commitment info that corresponds to the expected modifications and updated tree.
        """
        assert previous_tree.height == expected_updated_tree.height, "Inconsistent tree heights."

        # Perform the commitment to collect the facts needed by the OS.
        modifications = await expected_updated_tree.get_leaves(
            ffc=ffc, indices=expected_accessed_indices, fact_cls=leaf_fact_cls
        )
        return await cls.create_from_modifications(
            previous_tree=previous_tree,
            expected_updated_root=from_bytes(expected_updated_tree.root),
            modifications=modifications,
            ffc=ffc,
        )

    @classmethod
    async def create_from_modifications(
        cls,
        previous_tree: PatriciaTree,
        expected_updated_root: int,
        modifications: Dict[int, TLeafFact],
        ffc: FactFetchingContext,
    ) -> "CommitmentInfo":
        """
        returns a commitment info that corresponds to the given modifications.
        """
        commitment_facts: BinaryFactDict = {}
        actual_updated_tree = await previous_tree.update(
            ffc=ffc, modifications=modifications.items(), facts=commitment_facts
        )
        actual_updated_root = from_bytes(actual_updated_tree.root)
        assert actual_updated_root == expected_updated_root, "Inconsistent commitment tree roots."

        return cls(
            previous_root=from_bytes(previous_tree.root),
            updated_root=actual_updated_root,
            tree_height=previous_tree.height,
            commitment_facts=commitment_facts,
        )


class OsSingleStarknetStorage:
    """
    Represents a single contract storage.
    It is used by the Starknet OS run in the GpsAmbassador.
    """

    def __init__(
        self,
        previous_tree: PatriciaTree,
        expected_updated_root: int,
        ongoing_storage_changes: Dict[int, int],
        ffc: FactFetchingContext,
    ):
        """
        The constructor is private.
        """
        self.previous_tree = previous_tree
        self.expected_updated_root = expected_updated_root
        self.ongoing_storage_changes = ongoing_storage_changes
        self.ffc = ffc

        # Current running event loop; used for running async tasks in a synchronous context.
        self.loop: asyncio.AbstractEventLoop = asyncio.get_running_loop()

    @classmethod
    async def create(
        cls,
        previous_tree: PatriciaTree,
        updated_tree: PatriciaTree,
        accessed_addresses: Set[int],
        ffc: FactFetchingContext,
    ) -> "OsSingleStarknetStorage":
        # Fetch initial values of keys accessed by this contract.
        # NOTE: this is an optimization - not all values can be fetched ahead.
        initial_leaves = await previous_tree.get_leaves(
            ffc=ffc, indices=accessed_addresses, fact_cls=StorageLeaf
        )
        initial_entries = {key: leaf.value for key, leaf in initial_leaves.items()}

        return cls(
            previous_tree=previous_tree,
            expected_updated_root=from_bytes(updated_tree.root),
            ongoing_storage_changes=initial_entries,
            ffc=ffc,
        )

    async def compute_commitment(self) -> CommitmentInfo:
        """
        Computes the commitment info based on the ongoing storage changes which is maintained
        during the transaction execution phase; should be called after the execution phase.
        """
        final_modifications = {
            key: StorageLeaf(value) for key, value in self.ongoing_storage_changes.items()
        }
        return await CommitmentInfo.create_from_modifications(
            previous_tree=self.previous_tree,
            expected_updated_root=self.expected_updated_root,
            modifications=final_modifications,
            ffc=self.ffc,
        )

    # Read/write access to ongoing storage changes;
    # used to create a new storage entry (which contains the previous and the new value)
    # when executing the storage_write system call.
    # In addition, used to accumulate storage changes for the commitment computation.

    def read(self, key: int) -> int:
        if key not in self.ongoing_storage_changes:
            # Key was not fetched ahead.
            self.ongoing_storage_changes[key] = self._fetch_storage_leaf(key=key).value
        return self.ongoing_storage_changes[key]

    def write(self, key: int, value: int):
        self.ongoing_storage_changes[key] = value

    def _fetch_storage_leaf(self, key) -> StorageLeaf:
        coroutine = self.previous_tree.get_leaf(ffc=self.ffc, index=key, fact_cls=StorageLeaf)
        return execute_coroutine_threadsafe(coroutine=coroutine, loop=self.loop)
