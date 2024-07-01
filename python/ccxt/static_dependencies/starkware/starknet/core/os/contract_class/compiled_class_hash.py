from typing import List, Optional, Sequence, Tuple

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.vm.crypto import poseidon_hash_many
from starkware.python.utils import as_non_optional, from_bytes
from starkware.starknet.core.os.contract_class.compiled_class_hash_objects import (
    BytecodeLeaf,
    BytecodeSegment,
    BytecodeSegmentedNode,
    BytecodeSegmentStructure,
)
from starkware.starknet.core.os.contract_class.compiled_class_hash_utils import (
    get_compiled_class_struct,
    load_compiled_class_cairo_program,
)
from starkware.starknet.core.os.contract_class.utils import ClassHashType, class_hash_cache_ctx_var
from starkware.starknet.definitions import constants
from starkware.starknet.public.abi import starknet_keccak
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    CompiledClassEntryPoint,
    EntryPointType,
    NestedIntList,
)


def compute_compiled_class_hash(compiled_class: CompiledClass) -> int:
    """
    Computes the compiled class hash.
    """
    cache = class_hash_cache_ctx_var.get()
    if cache is None:
        return _compute_compiled_class_hash_inner(compiled_class=compiled_class)

    compiled_class_bytes = compiled_class.dumps(sort_keys=True).encode()
    key = (ClassHashType.COMPILED_CLASS, starknet_keccak(data=compiled_class_bytes))

    if key not in cache:
        cache[key] = _compute_compiled_class_hash_inner(compiled_class=compiled_class)

    return cache[key]


def compute_hash_on_entry_points(entry_points: List[CompiledClassEntryPoint]) -> int:
    """
    Computes hash on a list of given entry points.
    """
    entry_point_hash_elements: List[int] = []
    for entry_point in entry_points:
        builtins_hash = poseidon_hash_many(
            [
                from_bytes(builtin.encode("ascii"))
                for builtin in as_non_optional(entry_point.builtins)
            ]
        )
        entry_point_hash_elements.extend([entry_point.selector, entry_point.offset, builtins_hash])

    return poseidon_hash_many(entry_point_hash_elements)


def _compute_compiled_class_hash_inner(compiled_class: CompiledClass) -> int:
    # Compute hashes on each component separately.
    external_funcs_hash = compute_hash_on_entry_points(
        entry_points=compiled_class.entry_points_by_type[EntryPointType.EXTERNAL]
    )
    l1_handlers_hash = compute_hash_on_entry_points(
        entry_points=compiled_class.entry_points_by_type[EntryPointType.L1_HANDLER]
    )
    constructors_hash = compute_hash_on_entry_points(
        entry_points=compiled_class.entry_points_by_type[EntryPointType.CONSTRUCTOR]
    )
    bytecode_hash = create_bytecode_segment_structure(
        bytecode=compiled_class.bytecode,
        bytecode_segment_lengths=compiled_class.bytecode_segment_lengths,
        visited_pcs=None,
    ).hash()

    # Compute total hash by hashing each component on top of the previous one.
    return poseidon_hash_many(
        [
            constants.COMPILED_CLASS_VERSION,
            external_funcs_hash,
            l1_handlers_hash,
            constructors_hash,
            bytecode_hash,
        ]
    )


def create_bytecode_segment_structure(
    bytecode: List[int],
    bytecode_segment_lengths: NestedIntList,
    visited_pcs: Optional[Sequence[int]],
) -> BytecodeSegmentStructure:
    """
    Creates a BytecodeSegmentStructure instance from the given bytecode and
    bytecode_segment_lengths.
    """
    rev_visited_pcs = list(visited_pcs if visited_pcs is not None else range(len(bytecode)))[::-1]

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

        return (BytecodeLeaf(data=bytecode[bytecode_offset:segment_end]), bytecode_segment_lengths)

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
                segment_length=item_len, is_used=is_used, inner_structure=current_structure
            )
        )
        bytecode_offset += item_len
        total_len += item_len

    return BytecodeSegmentedNode(segments=res), total_len


def run_compiled_class_hash(
    compiled_class: CompiledClass, visited_pcs: Optional[Sequence[int]] = None
) -> CairoFunctionRunner:
    program = load_compiled_class_cairo_program()
    runner = CairoFunctionRunner(program=program)

    bytecode_segment_structure = create_bytecode_segment_structure(
        bytecode=compiled_class.bytecode,
        bytecode_segment_lengths=compiled_class.bytecode_segment_lengths,
        visited_pcs=visited_pcs,
    )

    compiled_class_struct = get_compiled_class_struct(
        identifiers=program.identifiers,
        compiled_class=compiled_class,
        bytecode=bytecode_segment_structure.bytecode_with_skipped_segments(),
    )

    runner.run(
        "starkware.starknet.core.os.contract_class.compiled_class.compiled_class_hash",
        range_check_ptr=runner.range_check_builtin.base,
        poseidon_ptr=runner.poseidon_builtin.base,
        compiled_class=compiled_class_struct,
        use_full_name=True,
        verify_secure=False,
        hint_locals={"bytecode_segment_structure": bytecode_segment_structure},
    )
    return runner
