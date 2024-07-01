from typing import Dict, Mapping

from starkware.starknet.business_logic.state.state import StorageEntry


def to_cached_state_storage_mapping(
    storage_updates: Mapping[int, Mapping[int, int]]
) -> Mapping[StorageEntry, int]:
    """
    Converts StateDiff storage mapping (addresses map to a key-value mapping) to CachedState
    storage mapping (Tuple of address and key map to the associated value).
    """
    storage_writes: Dict[StorageEntry, int] = {}
    for address, contract_storage in storage_updates.items():
        for key, value in contract_storage.items():
            storage_writes[(address, key)] = value

    return storage_writes


def to_state_diff_storage_mapping(
    storage_writes: Mapping[StorageEntry, int]
) -> Mapping[int, Mapping[int, int]]:
    """
    Converts CachedState storage mapping to StateDiff storage mapping.
    See to_cached_state_storage_mapping documentation.
    """
    storage_updates: Dict[int, Dict[int, int]] = {}
    for (address, key), value in storage_writes.items():
        if address in storage_updates:
            storage_updates[address][key] = value
        else:
            storage_updates[address] = {key: value}

    return storage_updates
