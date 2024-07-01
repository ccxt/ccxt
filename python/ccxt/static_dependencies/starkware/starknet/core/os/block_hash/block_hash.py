import dataclasses
from typing import Callable, Iterable, List, Sequence, Tuple

from starkware.cairo.common.hash_state import (
    compute_hash_on_elements,
    compute_hash_on_elements_without_length,
)
from starkware.cairo.lang.vm.crypto import pedersen_hash
from starkware.python.utils import from_bytes, process_concurrently, safe_zip, to_bytes
from starkware.starknet.definitions import constants
from starkware.starkware_utils.commitment_tree.patricia_tree.patricia_tree import PatriciaTree
from starkware.storage.dict_storage import DictStorage
from starkware.storage.storage import FactFetchingContext
from starkware.storage.storage_utils import SimpleLeafFact

BlockHash = int
BlockHashWithoutParent = int


@dataclasses.dataclass(frozen=True)
class BlockCommitments:
    tx_commitment: int
    event_commitment: int


BLOCK_HASH_N_ELEMENTS = 11


async def calculate_block_hash(
    parent_hash: BlockHash,
    block_number: int,
    global_state_root: int,
    sequencer_address: int,
    block_timestamp: int,
    tx_hashes: Sequence[int],
    tx_signatures: Sequence[List[int]],
    event_hashes: Sequence[int],
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> Tuple[BlockHash, BlockCommitments]:
    """
    Calculates the block hash in the Starknet network.
    The block hash is a hash chain of the following information:
        1. Parent block hash.
        2. Block number.
        3. New global state root.
        4. Sequencer address.
        5. Block timestamp.
        6. Number of transactions.
        7. A commitment on the transactions.
        8. Number of events.
        9. A commitment on the events.
        10. Protocol version (not implemented yet).
        11. Extra data (not implemented yet).
    Each hash chain computation begins with 0 as initialization and ends with its length appended.
    The length is appended in order to avoid collisions of the following kind:
    H([x,y,z]) = h(h(x,y),z) = H([w, z]) where w = h(x,y).

    Returns the block hash, the transaction commitment and the event commitment.
    """
    block_hash_without_parent, commitments = await calculate_block_hash_without_parent(
        block_number=block_number,
        global_state_root=global_state_root,
        sequencer_address=sequencer_address,
        block_timestamp=block_timestamp,
        tx_hashes=tx_hashes,
        tx_signatures=tx_signatures,
        event_hashes=event_hashes,
        hash_function=hash_function,
    )

    block_hash = finalize_block_hash(
        block_hash_without_parent=block_hash_without_parent,
        parent_hash=parent_hash,
        hash_function=hash_function,
    )
    return block_hash, BlockCommitments(
        tx_commitment=commitments.tx_commitment, event_commitment=commitments.event_commitment
    )


async def calculate_block_hash_without_parent(
    block_number: int,
    global_state_root: int,
    sequencer_address: int,
    block_timestamp: int,
    tx_hashes: Sequence[int],
    tx_signatures: Sequence[List[int]],
    event_hashes: Sequence[int],
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> Tuple[BlockHashWithoutParent, BlockCommitments]:
    """
    Hashes the prefix of the block hash chain, excluding the parent block hash
    and the total number of elements in the chain.
    See calculate_block_hash documentation for more details.

    Returns the hash, the transaction commitment and the event commitment.
    """

    def bytes_hash_function(x: bytes, y: bytes) -> bytes:
        return to_bytes(hash_function(from_bytes(x), from_bytes(y)))

    ffc = FactFetchingContext(storage=DictStorage(), hash_func=bytes_hash_function)

    # Include signatures in transaction hashes.
    tx_final_hashes = await calculate_tx_hashes_with_signatures(
        tx_hashes=tx_hashes, tx_signatures=tx_signatures, hash_function=hash_function
    )

    # Calculate transaction commitment.
    tx_commitment = await calculate_patricia_root(
        leaves=tx_final_hashes,
        height=constants.TRANSACTION_COMMITMENT_TREE_HEIGHT,
        ffc=ffc,
    )

    event_commitment = await calculate_patricia_root(
        leaves=event_hashes, height=constants.EVENT_COMMITMENT_TREE_HEIGHT, ffc=ffc
    )

    data = [
        block_number,
        global_state_root,
        sequencer_address,
        block_timestamp,
        len(tx_hashes),  # Number of transactions.
        tx_commitment,  # Transaction commitment.
        len(event_hashes),  # Number of events.
        event_commitment,  # Event commitment.
        0,  # Protocol version.
        0,  # Extra data.
    ]
    assert len(data) == BLOCK_HASH_N_ELEMENTS - 1, (
        f"Unexpected number of block hash elements; got {len(data) + 1}; "
        f"expected {BLOCK_HASH_N_ELEMENTS}."
    )

    # Hash all block hash members except parent_hash and the number of hash members.
    block_hash_without_parent = compute_hash_on_elements_without_length(
        data=data, hash_func=hash_function
    )
    return block_hash_without_parent, BlockCommitments(
        tx_commitment=tx_commitment, event_commitment=event_commitment
    )


def finalize_block_hash(
    block_hash_without_parent: BlockHashWithoutParent,
    parent_hash: BlockHash,
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> BlockHash:
    """
    Completes the block hash calculation by hashing prefix hash with the parent hash, and the
    total number of block hash elements.
    """
    return hash_function(
        hash_function(block_hash_without_parent, parent_hash), BLOCK_HASH_N_ELEMENTS
    )


async def calculate_tx_hashes_with_signatures(
    tx_hashes: Iterable[int],
    tx_signatures: Iterable[List[int]],
    hash_function: Callable[[int, int], int],
) -> Iterable[int]:
    """
    Hashes the signature with the transaction hash, for every transaction, to get hash that
    takes into account the entire transaction, as the original hash does not include the
    signature.
    """

    def calculate_single_tx_hash_with_signature(
        tx_hash_signature_pair: Tuple[int, List[int]],
    ) -> int:
        tx_hash, tx_signature = tx_hash_signature_pair
        signature_hash = compute_hash_on_elements(data=tx_signature, hash_func=hash_function)
        return hash_function(tx_hash, signature_hash)

    return await process_concurrently(
        func=calculate_single_tx_hash_with_signature,
        items=list(safe_zip(tx_hashes, tx_signatures)),
        n_chunks=32,
    )


async def calculate_patricia_root(
    leaves: Iterable[int], height: int, ffc: FactFetchingContext
) -> int:
    """
    Calculates and returns the patricia root whose (leftmost) leaves are given.
    """
    empty_tree = await PatriciaTree.empty_tree(
        ffc=ffc, height=height, leaf_fact=SimpleLeafFact.empty()
    )
    modifications = [(index, SimpleLeafFact(value=value)) for index, value in enumerate(leaves)]
    final_tree = await empty_tree.update_efficiently(ffc=ffc, modifications=modifications)

    return from_bytes(final_tree.root)


def calculate_event_hash(
    from_address: int,
    keys: List[int],
    data: List[int],
    hash_function: Callable[[int, int], int] = pedersen_hash,
) -> int:
    """
    Calculates and returns the hash of an event, given its separate fields.
    I.e., H(from_address, H(keys), H(data)), where each hash chain computation begins
    with 0 as initialization and ends with its length appended.
    """
    keys_hash = compute_hash_on_elements(data=keys, hash_func=hash_function)
    data_hash = compute_hash_on_elements(data=data, hash_func=hash_function)
    return compute_hash_on_elements(
        data=[from_address, keys_hash, data_hash], hash_func=hash_function
    )
