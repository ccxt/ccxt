import dataclasses
import itertools
from typing import Dict, Iterator, List, Optional


@dataclasses.dataclass
class ContractChanges:
    """
    Represents the changes in a contract instance.
    """

    # The address of the contract.
    addr: int
    # The new nonce of the contract (for account contracts).
    nonce: int
    # The new class hash (if changed).
    class_hash: Optional[int]
    # A map from storage key to its new value.
    storage_changes: Dict[int, int]


@dataclasses.dataclass
class OsOutput:
    """
    Represents the output of the OS.
    """

    # The root before.
    initial_root: int
    # The root after.
    final_root: int
    # The block number.
    block_number: int
    # The block hash.
    block_hash: int
    # The hash of the OS config.
    starknet_os_config_hash: int
    # Whether KZG data availability was used.
    use_kzg_da: int
    # Messages from L2 to L1.
    messages_to_l1: List[int]
    # Messages from L1 to L2.
    messages_to_l2: List[int]
    # The list of contracts that were changed.
    contracts: Optional[List[ContractChanges]]
    # The list of classes that were declared. A map from class hash to compiled class hash.
    classes: Optional[Dict[int, int]]


def parse_bootloader_output(output: List[int]) -> List[OsOutput]:
    """
    Parses the output of the bootloader, assuming the tasks are instances of the Starknet OS.
    """
    output_iter = iter(output)

    n_tasks = next(output_iter)
    tasks = []
    for _ in range(n_tasks):
        next(output_iter)  # Output size.
        next(output_iter)  # Program hash.
        tasks.append(parse_os_output(output_iter))

    assert next(output_iter, None) is None, "Bootloader output wasn't fully consumed."

    return tasks


def parse_os_output(output_iter: Iterator[int]) -> OsOutput:
    """
    Parses the output of the Starknet OS.
    """
    initial_root = next(output_iter)
    final_root = next(output_iter)
    block_number = next(output_iter)
    block_hash = next(output_iter)
    starknet_os_config_hash = next(output_iter)
    use_kzg_da = next(output_iter)

    assert use_kzg_da in [0, 1], f"Invalid KZG flag: {use_kzg_da}"

    if use_kzg_da == 1:
        # Skip KZG data.
        list(itertools.islice(output_iter, 5))

    # Handle messages.
    messages_to_l1_segment_size = next(output_iter)
    messages_to_l1 = list(itertools.islice(output_iter, messages_to_l1_segment_size))
    messages_to_l2_segment_size = next(output_iter)
    messages_to_l2 = list(itertools.islice(output_iter, messages_to_l2_segment_size))

    contracts: Optional[List[ContractChanges]]
    if use_kzg_da == 0:
        # Contract changes.
        n_contracts = next(output_iter)
        contracts = []
        for _ in range(n_contracts):
            contracts.append(parse_contract_changes(output_iter))

        # Class changes.
        n_classes = next(output_iter)
        classes = {}
        for _ in range(n_classes):
            class_hash = next(output_iter)
            compiled_class_hash = next(output_iter)
            classes[class_hash] = compiled_class_hash
    else:
        contracts = classes = None

    return OsOutput(
        initial_root=initial_root,
        final_root=final_root,
        block_number=block_number,
        block_hash=block_hash,
        starknet_os_config_hash=starknet_os_config_hash,
        use_kzg_da=use_kzg_da,
        messages_to_l1=messages_to_l1,
        messages_to_l2=messages_to_l2,
        contracts=contracts,
        classes=classes,
    )


def parse_contract_changes(data: Iterator[int]) -> ContractChanges:
    """
    Parses contract changes.
    """
    addr = next(data)
    class_nonce_n_changes = next(data)
    class_nonce, n_changes = divmod(class_nonce_n_changes, 2**64)
    class_updated, nonce = divmod(class_nonce, 2**64)

    if class_updated:
        class_hash = next(data)
    else:
        class_hash = None

    storage_changes = {}
    for _ in range(n_changes):
        key = next(data)
        value = next(data)
        storage_changes[key] = value

    return ContractChanges(
        addr=addr, nonce=nonce, class_hash=class_hash, storage_changes=storage_changes
    )
