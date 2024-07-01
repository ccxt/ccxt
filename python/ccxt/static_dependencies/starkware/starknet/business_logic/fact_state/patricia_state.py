from typing import Dict, Optional

from starkware.python.utils import from_bytes, to_bytes
from starkware.starknet.business_logic.fact_state.contract_class_objects import (
    CompiledClassFact,
    ContractClassLeaf,
    DeprecatedCompiledClassFact,
    get_ffc_for_contract_class_facts,
)
from starkware.starknet.business_logic.fact_state.contract_state_objects import ContractState
from starkware.starknet.business_logic.state.state_api import (
    StateReader,
    get_stark_exception_on_undeclared_contract,
)
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    CompiledClassBase,
    DeprecatedCompiledClass,
)
from starkware.starknet.storage.starknet_storage import StorageLeaf
from starkware.starkware_utils.commitment_tree.patricia_tree.patricia_tree import PatriciaTree
from starkware.storage.storage import FactFetchingContext, Storage


class PatriciaStateReader(StateReader):
    """
    A Patricia implementation of StateReader.
    """

    def __init__(
        self,
        contract_state_root: PatriciaTree,
        contract_class_root: Optional[PatriciaTree],
        ffc: FactFetchingContext,
        contract_class_storage: Storage,
    ):
        # Members related to dynamic retrieval of facts during transaction execution.
        self.ffc = ffc
        self.ffc_for_class_hash = get_ffc_for_contract_class_facts(ffc=ffc)
        self.contract_class_storage = contract_class_storage

        # Last committed state roots.
        self.contract_state_root = contract_state_root
        self.contract_class_root = contract_class_root

        # A mapping from contract address to its state.
        self.contract_states: Dict[int, ContractState] = {}

    # StateReader API.

    async def get_compiled_class(self, compiled_class_hash: int) -> CompiledClassBase:
        # Try the deprecated compiled classes.
        deprecated_compiled_class = await self._get_deprecated_compiled_class(
            compiled_class_hash=compiled_class_hash
        )
        if deprecated_compiled_class is not None:
            return deprecated_compiled_class

        # The given hash does not match any deprecated class; try the new compiled classes.
        compiled_class = await self._get_compiled_class(compiled_class_hash=compiled_class_hash)
        if compiled_class is not None:
            return compiled_class

        # The given hash does not match any class; it is not declared.
        raise get_stark_exception_on_undeclared_contract(class_hash=compiled_class_hash)

    async def get_compiled_class_hash(self, class_hash: int) -> int:
        if self.contract_class_root is None:
            # The tree is not initialized; may happen if the reader is based on an old state
            # without class commitment.
            return 0

        leaf = await self.contract_class_root.get_leaf(
            ffc=self.ffc_for_class_hash, index=class_hash, fact_cls=ContractClassLeaf
        )
        return leaf.compiled_class_hash

    async def get_class_hash_at(self, contract_address: int) -> int:
        contract_state = await self._get_contract_state(contract_address=contract_address)
        return from_bytes(contract_state.contract_hash)

    async def get_nonce_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int
    ) -> int:
        data_availability_mode.assert_l1()
        contract_state = await self._get_contract_state(contract_address=contract_address)
        return contract_state.nonce

    async def get_storage_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int, key: int
    ) -> int:
        data_availability_mode.assert_l1()
        contract_state = await self._get_contract_state(contract_address=contract_address)

        contract_storage_tree_height = contract_state.storage_commitment_tree.height
        assert 0 <= key < 2**contract_storage_tree_height, (
            f"The address {fields.L2AddressField.format(key)} is out of range: [0, "
            f"2**{contract_storage_tree_height})."
        )

        storage_leaf = await self._fetch_storage_leaf(contract_state=contract_state, key=key)

        return storage_leaf.value

    # Internal utilities.

    async def _get_contract_state(self, contract_address: int) -> ContractState:
        if contract_address not in self.contract_states:
            self.contract_states[contract_address] = await self._fetch_contract_state(
                contract_address=contract_address
            )

        return self.contract_states[contract_address]

    async def _fetch_contract_state(self, contract_address: int) -> ContractState:
        return await self.contract_state_root.get_leaf(
            ffc=self.ffc, index=contract_address, fact_cls=ContractState
        )

    async def _fetch_storage_leaf(self, contract_state: ContractState, key: int) -> StorageLeaf:
        return await contract_state.storage_commitment_tree.get_leaf(
            ffc=self.ffc, index=key, fact_cls=StorageLeaf
        )

    async def _get_deprecated_compiled_class(
        self, compiled_class_hash: int
    ) -> Optional[DeprecatedCompiledClass]:
        compiled_class_fact = await DeprecatedCompiledClassFact.get(
            storage=self.contract_class_storage, suffix=to_bytes(compiled_class_hash)
        )
        if compiled_class_fact is None:
            return None

        compiled_class = compiled_class_fact.contract_definition
        compiled_class.validate()
        return compiled_class

    async def _get_compiled_class(self, compiled_class_hash: int) -> Optional[CompiledClass]:
        compiled_class_fact = await CompiledClassFact.get(
            storage=self.contract_class_storage, suffix=to_bytes(compiled_class_hash)
        )
        if compiled_class_fact is None:
            return None

        compiled_class = compiled_class_fact.compiled_class
        compiled_class.validate()
        return compiled_class
