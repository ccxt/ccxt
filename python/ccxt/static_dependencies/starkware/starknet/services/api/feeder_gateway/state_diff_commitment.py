import dataclasses
from typing import Callable, Dict, List, Optional, Sequence, Tuple

from starkware.cairo.lang.vm.crypto import poseidon_hash_many
from starkware.crypto.signature.signature import ECSignature, sign
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.data_availability_mode import DataAvailabilityMode
from starkware.starknet.services.api.feeder_gateway.response_objects import (
    BlockSignature,
    BlockSignatureInput,
    ClassHashPair,
    ContractAddressHashPair,
    StateDiff,
    StorageEntry,
)

HashManyFunction = Callable[[List[int]], int]


@dataclasses.dataclass
class FlatDataAvailabilityModeDiff:
    """
    A flat representation of a specific data availability mode diff.
    """

    storage_diff: List[int]
    nonces: List[int]


@dataclasses.dataclass
class FlatStateDiff:
    """
    A flat representation of a state diff.
    """

    version: int
    deployed_contracts: List[int]
    declared_classes: List[int]
    old_declared_contracts: List[int]
    data_availability_mode_diffs: Dict[int, FlatDataAvailabilityModeDiff]


def sign_block(
    signature_input: BlockSignatureInput,
    private_key: int,
    hash_func: Optional[HashManyFunction] = None,
) -> ECSignature:
    """
    Signs on the block hash and the state diff commitment.
    """
    hash_func = hash_func if hash_func is not None else poseidon_hash_many
    msg_hash = hash_func([signature_input.block_hash, signature_input.state_diff_commitment])
    return sign(msg_hash=msg_hash, priv_key=private_key)


def get_signature(
    block_hash: int,
    block_number: int,
    state_diff: StateDiff,
    private_key: int,
    hash_func: Optional[HashManyFunction] = None,
) -> BlockSignature:
    state_diff_commitment = calculate_state_diff_commitment(
        state_diff=state_diff, hash_func=hash_func
    )
    signature_input = BlockSignatureInput(
        block_hash=block_hash, state_diff_commitment=state_diff_commitment
    )
    return BlockSignature(
        block_number=block_number,
        signature_input=signature_input,
        signature=sign_block(
            signature_input=signature_input,
            private_key=private_key,
            hash_func=hash_func,
        ),
    )


def calculate_state_diff_commitment(
    state_diff: StateDiff,
    version: int = constants.BLOCK_SIGNATURE_VERSION,
    hash_func: Optional[HashManyFunction] = None,
) -> int:
    """
    Calculates the commitment on the given state diff.

    We assume that state_diff represents a valid state_diff. For example:
    * In storage_diff, any storage entry key points to a single storage entry value.
    * In declared_classes, any class hash points to a single compiled class hash.

    We do not assume the state diff to be sorted. The function sorts the state diff before computing
    the hash.
    """
    hash_func = hash_func if hash_func is not None else poseidon_hash_many

    flat_state_diff = flatten_state_diff(state_diff=state_diff, version=version)
    return calculate_flat_state_diff_commitment(
        flat_state_diff=flat_state_diff, hash_func=hash_func
    )


def calculate_flat_state_diff_commitment(
    flat_state_diff: FlatStateDiff, hash_func: HashManyFunction
) -> int:
    # Gather the commitments on the state diff members.
    commitment_members = [flat_state_diff.version]

    deployed_contracts_commitment = hash_func(flat_state_diff.deployed_contracts)
    declared_classes_commitment = hash_func(flat_state_diff.declared_classes)
    old_declared_contracts_commitment = hash_func(flat_state_diff.old_declared_contracts)
    l1_members = [
        deployed_contracts_commitment,
        declared_classes_commitment,
        old_declared_contracts_commitment,
    ]
    assert (
        len(l1_members) == 3
    ), "Unexpected number of members that are not data availability mode specific."
    commitment_members += l1_members

    # Flatten each data availability mode diff and add it to the commitment in ascending order.
    commitment_members += [len(flat_state_diff.data_availability_mode_diffs)]
    for data_availability_mode, data_availability_mode_diff in sorted(
        flat_state_diff.data_availability_mode_diffs.items()
    ):
        data_availability_mode_diff_commitment = hash_data_availability_mode_diff(
            flat_data_availability_mode_diff=data_availability_mode_diff, hash_func=hash_func
        )
        commitment_members += [data_availability_mode, data_availability_mode_diff_commitment]

    return hash_func(commitment_members)


def flatten_state_diff(state_diff: StateDiff, version: int = 0) -> FlatStateDiff:
    flattened_deployed_contracts = flatten_deployed_contracts(
        # For commitment purposes, we squash the newly deployed contracts and the contracts with
        # class replacement into one list.
        deployed_contracts=state_diff.deployed_contracts
        + state_diff.replaced_classes
    )
    flattened_declared_classes = flatten_declared_classes(
        declared_classes=state_diff.declared_classes
    )
    flattened_old_declared_contracts = flatten_old_declared_contracts(
        old_declared_contracts=state_diff.old_declared_contracts
    )
    flattened_l1_data_availability_mode_diff = flatten_data_availability_mode_diff(
        storage_diff=state_diff.storage_diffs,
        nonces=state_diff.nonces,
    )

    return FlatStateDiff(
        version=version,
        deployed_contracts=flattened_deployed_contracts,
        declared_classes=flattened_declared_classes,
        old_declared_contracts=flattened_old_declared_contracts,
        data_availability_mode_diffs={
            DataAvailabilityMode.L1.value: flattened_l1_data_availability_mode_diff
        },
    )


def hash_data_availability_mode_diff(
    flat_data_availability_mode_diff: FlatDataAvailabilityModeDiff,
    hash_func: HashManyFunction,
) -> int:
    """
    Computes the hash of a data availability mode diff for commitment purposes.
    Returns the identifier of the data availability mode and the hash of the data availability mode
    diff.
    """
    data_availability_mode_diff_members = (
        flat_data_availability_mode_diff.storage_diff,
        flat_data_availability_mode_diff.nonces,
    )
    assert (
        len(data_availability_mode_diff_members) == 2
    ), "Unexpected number of members in data availability mode diff commitment."
    flat_data_availability_mode_state_diff: List[int] = []
    for member in data_availability_mode_diff_members:
        flat_data_availability_mode_state_diff += member

    return hash_func(flat_data_availability_mode_state_diff)


def flatten_data_availability_mode_diff(
    storage_diff: Dict[int, List[StorageEntry]],
    nonces: Dict[int, int],
) -> FlatDataAvailabilityModeDiff:
    return FlatDataAvailabilityModeDiff(
        storage_diff=flatten_storage_diff(storage_diff=storage_diff),
        nonces=flatten_nonces(nonces=nonces),
    )


def flatten_storage_diff(storage_diff: Dict[int, List[StorageEntry]]) -> List[int]:
    flattened_storage_diff = [len(storage_diff)]
    for address, storage_entries in sorted(storage_diff.items()):
        flattened_storage_diff += [address]
        flattened_storage_diff += flatten_storage_entries(storage_entries=storage_entries)

    return flattened_storage_diff


def flatten_storage_entries(storage_entries: List[StorageEntry]) -> List[int]:
    tupled_storage_entries = [(entry.key, entry.value) for entry in storage_entries]

    return sort_and_flatten_tuples(tuples=tupled_storage_entries)


def flatten_nonces(nonces: Dict[int, int]) -> List[int]:
    return sort_and_flatten_tuples(tuples=list(nonces.items()))


def flatten_deployed_contracts(deployed_contracts: List[ContractAddressHashPair]) -> List[int]:
    tupled_deployed_contracts = [(pair.address, pair.class_hash) for pair in deployed_contracts]

    return sort_and_flatten_tuples(tuples=tupled_deployed_contracts)


def flatten_declared_classes(declared_classes: List[ClassHashPair]) -> List[int]:
    tupled_declared_classes = [
        (pair.class_hash, pair.compiled_class_hash) for pair in declared_classes
    ]

    return sort_and_flatten_tuples(tuples=tupled_declared_classes)


def flatten_old_declared_contracts(old_declared_contracts: Tuple[int, ...]) -> List[int]:
    return [len(old_declared_contracts), *sorted(old_declared_contracts)]


def sort_and_flatten_tuples(tuples: Sequence[Tuple[int, int]]) -> List[int]:
    """
    Flattens a list of tuples to a list of integers.
    Adds the length of the list as the first element.

    For example:
        [(100, 1001), (102, 1003)] -> [2, 100, 1001, 102, 1003]
    """
    flattened_tuples = [len(tuples)]
    for tup in sorted(tuples):
        flattened_tuples += list(tup)

    return flattened_tuples
