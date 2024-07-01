from typing import List, Tuple

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.vm.memory_dict import UnknownMemoryError
from starkware.cairo.lang.vm.memory_segments import MemorySegmentManager
from starkware.cairo.lang.vm.relocatable import MaybeRelocatable, RelocatableValue
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.public.abi import SYSCALL_PTR_OFFSET_IN_VERSION0
from starkware.starkware_utils.error_handling import stark_assert, wrap_with_stark_exception


def get_os_segment_ptr_range(
    runner: CairoFunctionRunner, ptr_offset: int, os_context: List[MaybeRelocatable]
) -> Tuple[MaybeRelocatable, MaybeRelocatable]:
    """
    Returns the base and stop ptr of the OS-designated segment that starts at ptr_offset.
    """
    allowed_offsets = (SYSCALL_PTR_OFFSET_IN_VERSION0,)
    assert (
        ptr_offset in allowed_offsets
    ), f"Illegal OS ptr offset; must be one of: {allowed_offsets}."

    # The returned values are os_context, retdata_size, retdata_ptr.
    os_context_end = runner.vm.run_context.ap - 2
    final_os_context_ptr = os_context_end - len(os_context)

    return os_context[ptr_offset], runner.vm_memory[final_os_context_ptr + ptr_offset]


def get_os_segment_stop_ptr(
    runner: CairoFunctionRunner,
    ptr_offset: int,
    os_context: List[MaybeRelocatable],
) -> RelocatableValue:
    _, stop_ptr = get_os_segment_ptr_range(
        runner=runner, ptr_offset=ptr_offset, os_context=os_context
    )
    assert isinstance(stop_ptr, RelocatableValue), f"stop_ptr is not relocatable: {stop_ptr}."

    return stop_ptr


def get_segment_range(
    runner: CairoFunctionRunner,
    segment_base_ptr: MaybeRelocatable,
    segment_stop_ptr: MaybeRelocatable,
) -> List[MaybeRelocatable]:
    assert isinstance(segment_base_ptr, RelocatableValue)
    assert isinstance(segment_stop_ptr, RelocatableValue)

    with wrap_with_stark_exception(
        code=StarknetErrorCode.SECURITY_ERROR, exception_types=[UnknownMemoryError]
    ):
        return runner.vm_memory.get_range(
            addr=segment_base_ptr, size=segment_stop_ptr - segment_base_ptr
        )


def validate_segment_pointers(
    segments: MemorySegmentManager,
    segment_base_ptr: MaybeRelocatable,
    segment_stop_ptr: MaybeRelocatable,
):
    assert isinstance(segment_base_ptr, RelocatableValue)
    assert (
        segment_base_ptr.offset == 0
    ), f"Segment base pointer must be zero; got {segment_base_ptr.offset}."

    expected_stop_ptr = segment_base_ptr + segments.get_segment_used_size(
        segment_index=segment_base_ptr.segment_index
    )

    stark_assert(
        expected_stop_ptr == segment_stop_ptr,
        code=StarknetErrorCode.SECURITY_ERROR,
        message=(
            f"Invalid stop pointer for segment. "
            f"Expected: {expected_stop_ptr}, found: {segment_stop_ptr}."
        ),
    )
