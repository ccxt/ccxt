import asyncio
import contextlib
from collections import ChainMap
from typing import (
    Awaitable,
    Callable,
    Dict,
    Iterator,
    List,
    Mapping,
    MutableMapping,
    Optional,
    Set,
    Tuple,
)

from starkware.python.utils import (
    as_non_optional,
    execute_coroutine_threadsafe,
    subtract_mappings,
    to_bytes,
)
from starkware.starknet.business_logic.state.state_api import (
    State,
    StateReader,
    SyncState,
    SyncStateReader,
)
from starkware.starknet.business_logic.state.state_api_objects import BlockInfo
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.public.abi import get_storage_var_address
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClassBase,
    RawCompiledClass,
)
from starkware.starkware_utils.error_handling import stark_assert

CompiledClassCache = MutableMapping[int, CompiledClassBase]
RawCompiledClassCache = MutableMapping[int, RawCompiledClass]
GetCompiledClassCallback = Callable[[int], Awaitable[CompiledClassBase]]
StorageEntry = Tuple[int, int]  # (contract_address, key).


class StateSyncifier(SyncState):
    """
    Acts as a synchronous variant of a given (asynchronous) State object.
    Should be used only from within the given loop.
    """

    def __init__(self, async_state: State, loop: asyncio.AbstractEventLoop):
        # State to synchronize.
        self.async_state = async_state

        # Current running event loop; used for running async tasks in a synchronous context.
        self.loop = loop

    @property
    def block_info(self) -> BlockInfo:
        return self.async_state.block_info

    def update_block_info(self, block_info: BlockInfo):
        self.async_state.block_info = block_info

    def get_compiled_class(self, compiled_class_hash: int) -> CompiledClassBase:
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.get_compiled_class(compiled_class_hash=compiled_class_hash),
            loop=self.loop,
        )

    def get_compiled_class_hash(self, class_hash: int) -> int:
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.get_compiled_class_hash(class_hash=class_hash),
            loop=self.loop,
        )

    def get_class_hash_at(self, contract_address: int) -> int:
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.get_class_hash_at(contract_address=contract_address),
            loop=self.loop,
        )

    def get_nonce_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int
    ) -> int:
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.get_nonce_at(
                data_availability_mode=data_availability_mode, contract_address=contract_address
            ),
            loop=self.loop,
        )

    def get_storage_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int, key: int
    ) -> int:
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.get_storage_at(
                data_availability_mode=data_availability_mode,
                contract_address=contract_address,
                key=key,
            ),
            loop=self.loop,
        )

    def set_compiled_class_hash(self, class_hash: int, compiled_class_hash: int):
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.set_compiled_class_hash(
                class_hash=class_hash, compiled_class_hash=compiled_class_hash
            ),
            loop=self.loop,
        )

    def set_class_hash_at(self, contract_address: int, class_hash: int):
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.set_class_hash_at(
                class_hash=class_hash, contract_address=contract_address
            ),
            loop=self.loop,
        )

    def increment_nonce(self, data_availability_mode: DataAvailabilityMode, contract_address: int):
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.increment_nonce(
                data_availability_mode=data_availability_mode, contract_address=contract_address
            ),
            loop=self.loop,
        )

    def set_storage_at(
        self,
        data_availability_mode: DataAvailabilityMode,
        contract_address: int,
        key: int,
        value: int,
    ):
        return execute_coroutine_threadsafe(
            coroutine=self.async_state.set_storage_at(
                data_availability_mode=data_availability_mode,
                contract_address=contract_address,
                key=key,
                value=value,
            ),
            loop=self.loop,
        )


class StateCache:
    """
    Holds read and write requests.
    """

    def __init__(self):
        # Reader's cached information; initial values, read before any write operation (per cell).
        self._class_hash_initial_values: Dict[int, int] = {}
        self._compiled_class_hash_initial_values: Dict[int, int] = {}
        self._nonce_initial_values: Dict[int, int] = {}
        self._storage_initial_values: Dict[StorageEntry, int] = {}

        # Writer's cached information.
        self._class_hash_writes: Dict[int, int] = {}
        self._compiled_class_hash_writes: Dict[int, int] = {}
        self._nonce_writes: Dict[int, int] = {}
        self._storage_writes: Dict[StorageEntry, int] = {}

        # State view.

        # Mappings from contract address to different attributes.
        self.address_to_class_hash: Mapping[int, int] = ChainMap(
            self._class_hash_writes, self._class_hash_initial_values
        )
        self.address_to_nonce: Mapping[int, int] = ChainMap(
            self._nonce_writes, self._nonce_initial_values
        )
        # Mapping from class hash to compiled class hash.
        self.class_hash_to_compiled_class_hash: Mapping[int, int] = ChainMap(
            self._compiled_class_hash_writes, self._compiled_class_hash_initial_values
        )
        # Mapping from (contract_address, key) to a value in the contract's storage.
        self.storage_view: Mapping[StorageEntry, int] = ChainMap(
            self._storage_writes, self._storage_initial_values
        )

    def update_writes_from_other(self, other: "StateCache"):
        self._class_hash_writes.update(other._class_hash_writes)
        self._compiled_class_hash_writes.update(other._compiled_class_hash_writes)
        self._nonce_writes.update(other._nonce_writes)
        self._storage_writes.update(other._storage_writes)

    def update_writes(
        self,
        address_to_class_hash: Mapping[int, int],
        address_to_nonce: Mapping[int, int],
        class_hash_to_compiled_class_hash: Mapping[int, int],
        storage_updates: Mapping[Tuple[int, int], int],
    ):
        self._class_hash_writes.update(address_to_class_hash)
        self._nonce_writes.update(address_to_nonce)
        self._storage_writes.update(storage_updates)
        self._compiled_class_hash_writes.update(class_hash_to_compiled_class_hash)

    def set_initial_values(
        self,
        address_to_class_hash: Mapping[int, int],
        address_to_nonce: Mapping[int, int],
        class_hash_to_compiled_class_hash: Mapping[int, int],
        storage_updates: Mapping[Tuple[int, int], int],
    ):
        mappings: Tuple[Mapping, ...] = (
            self.address_to_class_hash,
            self.address_to_nonce,
            self.class_hash_to_compiled_class_hash,
            self.storage_view,
        )
        assert all(len(mapping) == 0 for mapping in mappings), "Cache already initialized."

        self._class_hash_initial_values.update(address_to_class_hash)
        self._nonce_initial_values.update(address_to_nonce)
        self._compiled_class_hash_initial_values.update(class_hash_to_compiled_class_hash)
        self._storage_initial_values.update(storage_updates)

    def get_accessed_contract_addresses(self) -> Set[int]:
        return {
            *self.address_to_class_hash.keys(),
            *self.address_to_nonce.keys(),
            *[address for address, _key in self.storage_view.keys()],
        }


class CachedState(State):
    """
    A cached implementation of the State API. See State's documentation.
    """

    def __init__(
        self,
        block_info: BlockInfo,
        state_reader: StateReader,
        compiled_class_cache: Optional[CompiledClassCache] = None,
        raw_compiled_class_cache: Optional[RawCompiledClassCache] = None,
    ):
        self.block_info = block_info
        self.state_reader = state_reader
        self.cache = StateCache()
        self._compiled_classes: Optional[CompiledClassCache] = compiled_class_cache
        self._raw_compiled_classes: Optional[RawCompiledClassCache] = raw_compiled_class_cache

    @property
    def compiled_classes(self) -> CompiledClassCache:
        assert self._compiled_classes is not None, "compiled_classes mapping is not initialized."
        return self._compiled_classes

    @property
    def raw_compiled_classes(self) -> RawCompiledClassCache:
        if self._raw_compiled_classes is None:
            self._raw_compiled_classes = {}
        return self._raw_compiled_classes

    def set_compiled_class_cache(self, compiled_classes: CompiledClassCache):
        assert self._compiled_classes is None, "compiled_classes mapping is already initialized."
        self._compiled_classes = compiled_classes

    def set_raw_compiled_class_cache(self, raw_compiled_classes: RawCompiledClassCache):
        assert (
            self._raw_compiled_classes is None
        ), "raw_compiled_classes mapping is already initialized."
        self._raw_compiled_classes = raw_compiled_classes

    def update_block_info(self, block_info: BlockInfo):
        self.block_info = block_info

    async def get_compiled_class(self, compiled_class_hash: int) -> CompiledClassBase:
        if compiled_class_hash not in self.compiled_classes:
            self.compiled_classes[compiled_class_hash] = await self.state_reader.get_compiled_class(
                compiled_class_hash=compiled_class_hash
            )

        return self.compiled_classes[compiled_class_hash]

    async def get_raw_compiled_class(self, class_hash: int) -> RawCompiledClass:
        if class_hash not in self.raw_compiled_classes:
            self.raw_compiled_classes[class_hash] = await self.state_reader.get_raw_compiled_class(
                class_hash=class_hash
            )

        return self.raw_compiled_classes[class_hash]

    async def get_compiled_class_hash(self, class_hash: int) -> int:
        if class_hash not in self.cache.class_hash_to_compiled_class_hash:
            compiled_class_hash = await self.state_reader.get_compiled_class_hash(
                class_hash=class_hash
            )
            self.cache._compiled_class_hash_initial_values[class_hash] = compiled_class_hash

        return self.cache.class_hash_to_compiled_class_hash[class_hash]

    async def get_class_hash_at(self, contract_address: int) -> int:
        if contract_address not in self.cache.address_to_class_hash:
            class_hash = await self.state_reader.get_class_hash_at(
                contract_address=contract_address
            )
            self.cache._class_hash_initial_values[contract_address] = class_hash

        return self.cache.address_to_class_hash[contract_address]

    async def get_nonce_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int
    ) -> int:
        data_availability_mode.assert_l1()
        if contract_address not in self.cache.address_to_nonce:
            self.cache._nonce_initial_values[
                contract_address
            ] = await self.state_reader.get_nonce_at(
                data_availability_mode=data_availability_mode, contract_address=contract_address
            )

        return self.cache.address_to_nonce[contract_address]

    async def get_storage_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int, key: int
    ) -> int:
        data_availability_mode.assert_l1()
        address_key_pair = (contract_address, key)
        if address_key_pair not in self.cache.storage_view:
            self.cache._storage_initial_values[
                address_key_pair
            ] = await self.state_reader.get_storage_at(
                data_availability_mode=data_availability_mode,
                contract_address=contract_address,
                key=key,
            )

        return self.cache.storage_view[address_key_pair]

    async def set_compiled_class_hash(self, class_hash: int, compiled_class_hash: int):
        self.cache._compiled_class_hash_writes[class_hash] = compiled_class_hash

    async def set_class_hash_at(self, contract_address: int, class_hash: int):
        stark_assert(
            contract_address != 0,
            code=StarknetErrorCode.OUT_OF_RANGE_ADDRESS,
            message=f"Cannot deploy contract at address 0.",
        )

        self.cache._class_hash_writes[contract_address] = class_hash

    async def increment_nonce(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int
    ):
        data_availability_mode.assert_l1()
        current_nonce = await self.get_nonce_at(
            data_availability_mode=data_availability_mode, contract_address=contract_address
        )
        self.cache._nonce_writes[contract_address] = current_nonce + 1

    async def set_storage_at(
        self,
        data_availability_mode: DataAvailabilityMode,
        contract_address: int,
        key: int,
        value: int,
    ):
        data_availability_mode.assert_l1()
        self.cache._storage_writes[(contract_address, key)] = value

    def _copy(self) -> "CachedState":
        # Note that the reader's cache may be updated by this copy's read requests.
        return CachedState(
            block_info=self.block_info,
            state_reader=self,
            compiled_class_cache=self.compiled_classes,
        )

    def _apply(self, parent: "CachedState"):
        """
        Apply updates to parent state.
        """
        assert self.state_reader is parent, "Current reader expected to be the parent state."

        parent.block_info = self.block_info
        parent.cache.update_writes_from_other(other=self.cache)

    @contextlib.contextmanager
    def copy_and_apply(self: "CachedState") -> Iterator["CachedState"]:
        copied_state = self._copy()
        # The exit logic will not be called in case an exception is raised inside the context.
        yield copied_state
        copied_state._apply(parent=self)  # Apply to self.


class CachedSyncState(SyncState):
    """
    A cached implementation of the SyncState API. See CachedState's documentation.
    """

    def __init__(
        self,
        block_info: BlockInfo,
        state_reader: SyncStateReader,
        compiled_class_cache: Optional[CompiledClassCache] = None,
        raw_compiled_class_cache: Optional[RawCompiledClassCache] = None,
    ):
        self._block_info = block_info
        self.state_reader = state_reader
        self.cache = StateCache()
        self._compiled_classes: Optional[CompiledClassCache] = compiled_class_cache
        self._raw_compiled_classes: Optional[RawCompiledClassCache] = raw_compiled_class_cache

    @property
    def block_info(self) -> BlockInfo:
        return self._block_info

    @property
    def compiled_classes(self) -> CompiledClassCache:
        assert self._compiled_classes is not None, "compiled_classes mapping is not initialized."
        return self._compiled_classes

    @property
    def raw_compiled_classes(self) -> RawCompiledClassCache:
        if self._raw_compiled_classes is None:
            self._raw_compiled_classes = {}
        return self._raw_compiled_classes

    def update_block_info(self, block_info: BlockInfo):
        self._block_info = block_info

    def set_compiled_class_cache(self, compiled_classes: CompiledClassCache):
        assert self._compiled_classes is None, "compiled_classes mapping is already initialized."
        self._compiled_classes = compiled_classes

    def set_raw_compiled_class_cache(self, raw_compiled_classes: RawCompiledClassCache):
        assert (
            self._raw_compiled_classes is None
        ), "raw_compiled_classes mapping is already initialized."
        self._raw_compiled_classes = raw_compiled_classes

    def get_compiled_class(self, compiled_class_hash: int) -> CompiledClassBase:
        if compiled_class_hash not in self.compiled_classes:
            self.compiled_classes[compiled_class_hash] = self.state_reader.get_compiled_class(
                compiled_class_hash=compiled_class_hash
            )

        return self.compiled_classes[compiled_class_hash]

    def get_raw_compiled_class(self, class_hash: int) -> RawCompiledClass:
        if class_hash not in self.raw_compiled_classes:
            self.raw_compiled_classes[class_hash] = self.state_reader.get_raw_compiled_class(
                class_hash=class_hash
            )

        return self.raw_compiled_classes[class_hash]

    def get_compiled_class_hash(self, class_hash: int) -> int:
        if class_hash not in self.cache.class_hash_to_compiled_class_hash:
            compiled_class_hash = self.state_reader.get_compiled_class_hash(class_hash=class_hash)
            self.cache._compiled_class_hash_initial_values[class_hash] = compiled_class_hash

        return self.cache.class_hash_to_compiled_class_hash[class_hash]

    def get_class_hash_at(self, contract_address: int) -> int:
        if contract_address not in self.cache.address_to_class_hash:
            self.cache._class_hash_initial_values[
                contract_address
            ] = self.state_reader.get_class_hash_at(contract_address=contract_address)

        return self.cache.address_to_class_hash[contract_address]

    def get_nonce_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int
    ) -> int:
        data_availability_mode.assert_l1()
        if contract_address not in self.cache.address_to_nonce:
            self.cache._nonce_initial_values[contract_address] = self.state_reader.get_nonce_at(
                data_availability_mode=data_availability_mode, contract_address=contract_address
            )

        return self.cache.address_to_nonce[contract_address]

    def get_storage_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int, key: int
    ) -> int:
        data_availability_mode.assert_l1()
        address_key_pair = (contract_address, key)
        if address_key_pair not in self.cache.storage_view:
            self.cache._storage_initial_values[address_key_pair] = self.state_reader.get_storage_at(
                data_availability_mode=data_availability_mode,
                contract_address=contract_address,
                key=key,
            )

        return self.cache.storage_view[address_key_pair]

    def set_compiled_class_hash(self, class_hash: int, compiled_class_hash: int):
        self.cache._compiled_class_hash_writes[class_hash] = compiled_class_hash

    def set_class_hash_at(self, contract_address: int, class_hash: int):
        stark_assert(
            to_bytes(class_hash) != constants.UNINITIALIZED_CLASS_HASH,
            code=StarknetErrorCode.OUT_OF_RANGE_ADDRESS,
            message=f"Cannot set an uninitialized class hash.",
        )

        self.cache._class_hash_writes[contract_address] = class_hash

    def increment_nonce(self, data_availability_mode: DataAvailabilityMode, contract_address: int):
        data_availability_mode.assert_l1()
        current_nonce = self.get_nonce_at(
            data_availability_mode=data_availability_mode, contract_address=contract_address
        )
        self.cache._nonce_writes[contract_address] = current_nonce + 1

    def set_storage_at(
        self,
        data_availability_mode: DataAvailabilityMode,
        contract_address: int,
        key: int,
        value: int,
    ):
        data_availability_mode.assert_l1()
        self.cache._storage_writes[(contract_address, key)] = value

    def _copy(self) -> "CachedSyncState":
        # Note that the reader's cache may be updated by this copy's read requests.
        return CachedSyncState(
            block_info=self.block_info,
            state_reader=self,
            compiled_class_cache=self.compiled_classes,
        )

    def _apply(self, parent: "CachedSyncState"):
        """
        Apply updates to parent state.
        """
        assert self.state_reader is parent, "Current reader expected to be the parent state."

        parent._block_info = self.block_info
        parent.cache.update_writes_from_other(other=self.cache)

    @contextlib.contextmanager
    def copy_and_apply(self: "CachedSyncState") -> Iterator["CachedSyncState"]:
        copied_state = self._copy()
        # The exit logic will not be called in case an exception is raised inside the context.
        yield copied_state
        copied_state._apply(parent=self)  # Apply to self.


class ContractStorageState:
    """
    Defines the API for accessing StarkNet single contract storage state.
    """

    def __init__(self, state: SyncState, contract_address: int):
        self.state = state
        self.contract_address = contract_address

        # Maintain all read request values in chronological order.
        self.read_values: List[int] = []
        self.accessed_keys: Set[int] = set()

    def read(self, address: int) -> int:
        self.accessed_keys.add(address)
        value = self.state.get_storage_at(
            data_availability_mode=DataAvailabilityMode.L1,
            contract_address=self.contract_address,
            key=address,
        )
        self.read_values.append(value)

        return value

    def write(self, address: int, value: int):
        self.accessed_keys.add(address)
        self.state.set_storage_at(
            data_availability_mode=DataAvailabilityMode.L1,
            contract_address=self.contract_address,
            key=address,
            value=value,
        )


class UpdatesTrackerState(SyncState):
    """
    An implementation of the SyncState API that wraps another SyncState object and contains a cache.
    All requests are delegated to the wrapped SyncState, and caches are maintained for storage reads
    and writes.

    The goal of this implementation is to allow more precise and fair computation of the number of
    storage-writes a single transaction performs for the purposes of transaction fee calculation.
    That is, if a given transaction writes to the same storage address multiple times, this should
    be counted as a single storage-write. Additionally, if a transaction writes a value to storage
    which is equal to the initial value previously contained in that address, then no change needs
    to be done and this should not count as a storage-write.
    """

    def __init__(self, state: SyncState):
        self.state = state
        self.cache = StateCache()

    def get_storage_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int, key: int
    ) -> int:
        data_availability_mode.assert_l1()
        # Delegate the request to the actual state anyway (even if the value is already cached).
        return_value = self.state.get_storage_at(
            data_availability_mode=data_availability_mode,
            contract_address=contract_address,
            key=key,
        )
        address_key_pair = (contract_address, key)
        if address_key_pair not in self.cache.storage_view:
            # First access (read or write) to this cell; cache initial value.
            self.cache._storage_initial_values[address_key_pair] = return_value

        return return_value

    def set_storage_at(
        self,
        data_availability_mode: DataAvailabilityMode,
        contract_address: int,
        key: int,
        value: int,
    ):
        """
        This method writes to a storage cell and updates the cache accordingly. If this is the first
        access to the cell (read or write), the method first reads the value at that cell and caches
        it.

        This read operation is necessary for fee calculation. Because if the transaction writes a
        value to storage that is identical to the value previously held at that address, then no
        change is made to that cell and it does not count as a storage-change in fee calculation.
        """
        data_availability_mode.assert_l1()
        address_key_pair = (contract_address, key)
        if address_key_pair not in self.cache.storage_view:
            # First access (read or write) to this cell; cache initial value.
            self.cache._storage_initial_values[address_key_pair] = self.state.get_storage_at(
                data_availability_mode=data_availability_mode,
                contract_address=contract_address,
                key=key,
            )

        self.cache._storage_writes[address_key_pair] = value
        self.state.set_storage_at(
            data_availability_mode=data_availability_mode,
            contract_address=contract_address,
            key=key,
            value=value,
        )

    def get_class_hash_at(self, contract_address: int) -> int:
        # Delegate the request to the actual state anyway (even if the value is already cached).
        class_hash = self.state.get_class_hash_at(contract_address=contract_address)
        if contract_address not in self.cache.address_to_class_hash:
            # First access (read or write) to this cell; cache initial value.
            self.cache._class_hash_initial_values[contract_address] = class_hash

        return class_hash

    def set_class_hash_at(self, contract_address: int, class_hash: int):
        """
        See set_storage_at documentation.
        """
        if contract_address not in self.cache.address_to_class_hash:
            # First access (read or write) to this cell; cache initial value.
            self.cache._class_hash_initial_values[contract_address] = self.state.get_class_hash_at(
                contract_address=contract_address
            )

        self.cache._class_hash_writes[contract_address] = class_hash
        self.state.set_class_hash_at(contract_address=contract_address, class_hash=class_hash)

    def get_nonce_at(
        self, data_availability_mode: DataAvailabilityMode, contract_address: int
    ) -> int:
        data_availability_mode.assert_l1()
        # Delegate the request to the actual state anyway (even if the value is already cached).
        nonce = self.state.get_nonce_at(
            data_availability_mode=data_availability_mode, contract_address=contract_address
        )
        if contract_address not in self.cache.address_to_nonce:
            self.cache._nonce_initial_values[contract_address] = nonce

        return nonce

    def increment_nonce(self, data_availability_mode: DataAvailabilityMode, contract_address: int):
        data_availability_mode.assert_l1()
        if contract_address not in self.cache.address_to_nonce:
            # First access (read or write) to this cell; cache initial value.
            self.cache._nonce_initial_values[contract_address] = self.state.get_nonce_at(
                data_availability_mode=data_availability_mode, contract_address=contract_address
            )

        self.state.increment_nonce(
            data_availability_mode=data_availability_mode, contract_address=contract_address
        )
        new_nonce = self.state.get_nonce_at(
            data_availability_mode=data_availability_mode, contract_address=contract_address
        )
        self.cache._nonce_writes[contract_address] = new_nonce

    def get_compiled_class_hash(self, class_hash: int) -> int:
        # Delegate the request to the actual state anyway (even if the value is already cached).
        compiled_class_hash = self.state.get_compiled_class_hash(class_hash=class_hash)
        if class_hash not in self.cache.class_hash_to_compiled_class_hash:
            # First access (read or write) to this cell; cache initial value.
            self.cache._compiled_class_hash_initial_values[class_hash] = compiled_class_hash

        return compiled_class_hash

    def set_compiled_class_hash(self, class_hash: int, compiled_class_hash: int):
        if class_hash not in self.cache.class_hash_to_compiled_class_hash:
            # First access (read or write) to this cell; cache initial value.
            self.cache._compiled_class_hash_initial_values[
                class_hash
            ] = self.state.get_compiled_class_hash(class_hash=class_hash)
        self.cache._compiled_class_hash_writes[class_hash] = compiled_class_hash
        self.state.set_compiled_class_hash(
            class_hash=class_hash, compiled_class_hash=compiled_class_hash
        )

    @property
    def block_info(self) -> BlockInfo:
        return self.state.block_info

    def update_block_info(self, block_info: BlockInfo):
        self.state.update_block_info(block_info=block_info)

    def get_compiled_class(self, compiled_class_hash: int) -> CompiledClassBase:
        return self.state.get_compiled_class(compiled_class_hash=compiled_class_hash)

    def count_actual_updates_for_fee_charge(
        self,
        fee_token_address: int,
        is_nonce_increment: bool,
        sender_address: Optional[int],
    ) -> Tuple[int, int, int, int, int]:
        """
        Returns a tuple of:
            1. The number of modified contracts.
            2. The number of storage updates.
            3. The number of class hash updates.
            4. The number of nonce updates.

        An update is any a change done through this state; A contract is considered
        modified if its nonce was updated, if its class hash was updated or
        if one of its storage cells has changed.
        Arguments:
        general_config.
        sender_address is the account contract address.
        is_nonce_increment is a flag indicating whether the tx will increment the nonce. In that
        case, this change is added manually to the modified contracts.
        """
        # Storage Update.
        storage_updates = dict(
            subtract_mappings(self.cache._storage_writes, self.cache._storage_initial_values)
        )
        contracts_with_modified_storage = {
            contract_address for (contract_address, _key) in storage_updates.keys()
        }

        # Class hash Update (deploy contracts + replace class syscall).
        class_hash_updates = subtract_mappings(
            self.cache._class_hash_writes, self.cache._class_hash_initial_values
        )
        contracts_with_modified_class_hash = set(class_hash_updates.keys())

        # Nonce Update.
        nonce_updates = subtract_mappings(
            self.cache._nonce_writes, self.cache._nonce_initial_values
        )
        contracts_with_modified_nonce = set(nonce_updates.keys())
        # Adds manually the account contract address since we increment the nonce after computing
        # the state updates.
        if is_nonce_increment:
            contracts_with_modified_nonce.add(as_non_optional(sender_address))

        # Compiled class hash updates (declare Cairo 1 contract).
        compiled_class_hash_updates = subtract_mappings(
            self.cache._compiled_class_hash_writes, self.cache._compiled_class_hash_initial_values
        )

        # Modified contracts.
        modified_contracts = (
            contracts_with_modified_storage
            | contracts_with_modified_class_hash
            | contracts_with_modified_nonce
        )

        # Calculated before executing fee transfer and therefore we add manually the fee transfer
        # changes. Exclude the fee token contract modification, since it is changed one time
        # in a batch.
        if sender_address is not None:
            account_balance_key = get_storage_var_address("ERC20_balances", sender_address)
            storage_updates[(fee_token_address, account_balance_key)] = 0
        modified_contracts.discard(fee_token_address)

        return (
            len(modified_contracts),
            len(storage_updates),
            len(class_hash_updates),
            len(compiled_class_hash_updates),
            len(nonce_updates),
        )
