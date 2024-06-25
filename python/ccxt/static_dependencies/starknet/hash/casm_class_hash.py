from typing import List, Optional, Sequence, Tuple

from poseidon_py.poseidon_hash import poseidon_hash_many

from cairo.felt import encode_shortstring
from hash.compiled_class_hash_objects import (
    BytecodeLeaf,
    BytecodeSegment,
    BytecodeSegmentedNode,
    BytecodeSegmentStructure,
    NestedIntList,
)
from net.client_models import CasmClass, CasmClassEntryPoint

CASM_CLASS_VERSION = "COMPILED_CLASS_V1"


def compute_casm_class_hash(casm_contract_class: CasmClass) -> int:
    """
    Calculate class hash of a CasmClass.
    """
    casm_class_version = encode_shortstring(CASM_CLASS_VERSION)

    _entry_points = casm_contract_class.entry_points_by_type

    external_entry_points_hash = poseidon_hash_many(
        _entry_points_array(_entry_points.external)
    )
    l1_handler_entry_points_hash = poseidon_hash_many(
        _entry_points_array(_entry_points.l1_handler)
    )
    constructor_entry_points_hash = poseidon_hash_many(
        _entry_points_array(_entry_points.constructor)
    )

    if casm_contract_class.bytecode_segment_lengths is not None:
        bytecode_hash = create_bytecode_segment_structure(
            bytecode=casm_contract_class.bytecode,
            bytecode_segment_lengths=casm_contract_class.bytecode_segment_lengths,
            visited_pcs=None,
        ).hash()
    else:
        bytecode_hash = poseidon_hash_many(casm_contract_class.bytecode)

    return poseidon_hash_many(
        [
            casm_class_version,
            external_entry_points_hash,
            l1_handler_entry_points_hash,
            constructor_entry_points_hash,
            bytecode_hash,
        ]
    )


def _entry_points_array(entry_points: List[CasmClassEntryPoint]) -> List[int]:
    entry_points_array = []
    for entry_point in entry_points:
        assert entry_point.builtins is not None
        _encoded_builtins = [encode_shortstring(val) for val in entry_point.builtins]
        builtins_hash = poseidon_hash_many(_encoded_builtins)

        entry_points_array.extend(
            [entry_point.selector, entry_point.offset, builtins_hash]
        )

    return entry_points_array


# create_bytecode_segment_structure and _create_bytecode_segment_structure_inner are copied from
# https://github.com/starkware-libs/cairo-lang/blob/v0.13.1/src/starkware/starknet/core/os/contract_class/compiled_class_hash.py


def create_bytecode_segment_structure(
    bytecode: List[int],
    bytecode_segment_lengths: NestedIntList,
    visited_pcs: Optional[Sequence[int]],
) -> BytecodeSegmentStructure:
    """
    Creates a BytecodeSegmentStructure instance from the given bytecode and
    bytecode_segment_lengths.
    """
    rev_visited_pcs = list(
        visited_pcs if visited_pcs is not None else range(len(bytecode))
    )[::-1]

    res, total_len = _create_bytecode_segment_structure_inner(
        bytecode=bytecode,
        bytecode_segment_lengths=bytecode_segment_lengths,
        visited_pcs=rev_visited_pcs,
        bytecode_offset=0,
    )
    assert total_len == len(
        bytecode
    ), f"Invalid length bytecode segment structure: {total_len}. Bytecode length: {len(bytecode)}."
    assert len(rev_visited_pcs) == 0, f"PC {rev_visited_pcs[-1]} is out of range."
    return res


def _create_bytecode_segment_structure_inner(
    bytecode: List[int],
    bytecode_segment_lengths: NestedIntList,
    visited_pcs: List[int],
    bytecode_offset: int,
) -> Tuple[BytecodeSegmentStructure, int]:
    """
    Helper function for `create_bytecode_segment_structure`.
    `visited_pcs` should be given in reverse order, and is consumed by the function.
    Returns the BytecodeSegmentStructure and the total length of the processed segment.
    """
    if isinstance(bytecode_segment_lengths, int):
        segment_end = bytecode_offset + bytecode_segment_lengths

        # Remove all the visited PCs that are in the segment.
        while len(visited_pcs) > 0 and bytecode_offset <= visited_pcs[-1] < segment_end:
            visited_pcs.pop()

        return (
            BytecodeLeaf(data=bytecode[bytecode_offset:segment_end]),
            bytecode_segment_lengths,
        )

    res = []
    total_len = 0
    for item in bytecode_segment_lengths:
        visited_pc_before = visited_pcs[-1] if len(visited_pcs) > 0 else None

        current_structure, item_len = _create_bytecode_segment_structure_inner(
            bytecode=bytecode,
            bytecode_segment_lengths=item,
            visited_pcs=visited_pcs,
            bytecode_offset=bytecode_offset,
        )

        visited_pc_after = visited_pcs[-1] if len(visited_pcs) > 0 else None
        is_used = visited_pc_after != visited_pc_before

        if is_used and visited_pc_before != bytecode_offset:
            raise ValueError(
                f"Invalid segment structure: PC {visited_pc_before} was visited, "
                f"but the beginning of the segment ({bytecode_offset}) was not."
            )

        res.append(
            BytecodeSegment(
                segment_length=item_len,
                is_used=is_used,
                inner_structure=current_structure,
            )
        )
        bytecode_offset += item_len
        total_len += item_len

    return BytecodeSegmentedNode(segments=res), total_len
