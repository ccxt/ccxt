from starkware.starknet.business_logic.state.state_api import (
    StateReader,
    SyncStateReader,
    get_stark_exception_on_undeclared_contract,
)
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.services.api.contract_class.contract_class import CompiledClassBase


class EmptyStateReader(StateReader):
    """
    Implements a reader of an empty state.
    """

    async def get_compiled_class(self, compiled_class_hash: int) -> CompiledClassBase:
        raise get_stark_exception_on_undeclared_contract(class_hash=compiled_class_hash)

    async def get_compiled_class_hash(self, class_hash: int) -> int:
        return 0

    async def get_class_hash_at(self, contract_address: int) -> int:
        return 0

    async def get_nonce_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int
    ) -> int:
        return 0

    async def get_storage_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int, key: int
    ) -> int:
        return 0


class EmptySyncStateReader(SyncStateReader):
    """
    A synchronous version of EmptyStateReader.
    """

    def get_compiled_class(self, compiled_class_hash: int) -> CompiledClassBase:
        raise get_stark_exception_on_undeclared_contract(class_hash=compiled_class_hash)

    def get_compiled_class_hash(self, class_hash: int) -> int:
        return 0

    def get_class_hash_at(self, contract_address: int) -> int:
        return 0

    def get_nonce_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int
    ) -> int:
        return 0

    def get_storage_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int, key: int
    ) -> int:
        return 0
