from typing import List, Optional, Sequence

import cachetools
import pytest

from starkware.python.test_utils import maybe_raises
from starkware.starknet.core.os.contract_class.compiled_class_hash import (
    compute_compiled_class_hash,
    create_bytecode_segment_structure,
    run_compiled_class_hash,
)
from starkware.starknet.core.os.contract_class.utils import set_class_hash_cache
from starkware.starknet.core.test_contract.test_utils import get_test_compiled_class
from starkware.starknet.services.api.contract_class.contract_class import CompiledClass


def compute_compiled_class_hash_using_cairo(
    compiled_class: CompiledClass, visited_pcs: Optional[Sequence[int]]
) -> int:
    runner = run_compiled_class_hash(compiled_class=compiled_class, visited_pcs=visited_pcs)
    _, class_hash = runner.get_return_values(2)
    return class_hash


CLASS_HASH_WITH_SEGMENTATION = 0x5517AD8471C9AA4D1ADD31837240DEAD9DC6653854169E489A813DB4376BE9C
CLASS_HASH_WITHOUT_SEGMENTATION = 0xB268995DD0EE80DEBFB8718852750B5FD22082D0C729121C48A0487A4D2F64


@pytest.mark.parametrize(
    "compiled_class, expected_hash",
    [
        (
            get_test_compiled_class(contract_segmentation=False),
            CLASS_HASH_WITHOUT_SEGMENTATION,
        ),
        (
            get_test_compiled_class(contract_segmentation=True),
            CLASS_HASH_WITH_SEGMENTATION,
        ),
    ],
)
def test_compiled_class_hash_basic(compiled_class: CompiledClass, expected_hash: int):
    """
    Tests that the hash of a constant contract does not change.
    """
    # Assert that our test Python hash computation is equivalent to static value.
    cairo_computed_compiled_class_hash = compute_compiled_class_hash_using_cairo(
        compiled_class=compiled_class,
        visited_pcs=None,
    )
    assert expected_hash == cairo_computed_compiled_class_hash, (
        f"Computed compiled class hash: {hex(cairo_computed_compiled_class_hash)} "
        f"does not match the expected value: {hex(expected_hash)}."
    )

    cache: cachetools.LRUCache = cachetools.LRUCache(maxsize=10)
    with set_class_hash_cache(cache=cache):
        assert len(cache) == 0

        python_computed_compiled_class_hash: int = compute_compiled_class_hash(
            compiled_class=compiled_class
        )
        assert len(cache) == 1

        assert python_computed_compiled_class_hash == expected_hash, (
            f"Computed compiled class hash: {hex(python_computed_compiled_class_hash)} "
            f"does not match the expected value: {hex(expected_hash)}."
        )


@pytest.mark.parametrize(
    "visited_pcs, expected_bytecode, error_message",
    [
        ([], [-1, -2, -2, -1, -2, -2, -1, -2, -2, -2], None),
        ([0], [1, 2, 3, -1, -2, -2, -1, -2, -2, -2], None),
        ([0, 2, 3, 6, 9], [1, 2, 3, 4, -1, -1, 7, 8, 9, 10], None),
        ([3], [-1, -2, -2, 4, -1, -1, -1, -2, -2, -2], None),
        ([6], [-1, -2, -2, -1, -2, -2, 7, 8, 9, 10], None),
        ([3, 5], [-1, -2, -2, 4, -1, 6, -1, -2, -2, -2], None),
        ([7], None, "PC 7 was visited, but the beginning of the segment (6) was not"),
        ([5], None, "PC 5 was visited, but the beginning of the segment (3) was not"),
        ([10], None, "PC 10 is out of range"),
    ],
)
def test_compiled_class_hash_visited_pcs(
    visited_pcs: List[int],
    expected_bytecode: Optional[List[int]],
    error_message: Optional[str],
):
    compiled_class = get_test_compiled_class(contract_segmentation=True)
    with maybe_raises(expected_exception=(AssertionError, ValueError), error_message=error_message):
        assert (
            compute_compiled_class_hash_using_cairo(
                compiled_class=compiled_class,
                visited_pcs=visited_pcs,
            )
            == CLASS_HASH_WITH_SEGMENTATION
        )

    if error_message is None:
        bytecode_segment_structure = create_bytecode_segment_structure(
            bytecode=compiled_class.bytecode,
            bytecode_segment_lengths=compiled_class.bytecode_segment_lengths,
            visited_pcs=visited_pcs,
        )

        assert bytecode_segment_structure.bytecode_with_skipped_segments() == expected_bytecode
