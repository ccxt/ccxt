from typing import List, Tuple

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.vm.memory_dict import MemoryDict
from starkware.cairo.lang.vm.relocatable import MaybeRelocatable, RelocatableValue
from starkware.starknet.core.os import segment_utils
from starkware.starknet.core.os.deprecated_syscall_handler import DeprecatedBlSyscallHandler
from starkware.starknet.core.os.syscall_handler import BusinessLogicSyscallHandler
from starkware.starknet.definitions.constants import OsOutputConstant
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.public.abi import SYSCALL_PTR_OFFSET_IN_VERSION0
from starkware.starkware_utils.error_handling import wrap_with_stark_exception

# KZG-related fields, outputted by the Starknet OS program.

# Felt252.
Point = int

# Uint256, split into low and high parts, each of 128 bits.
PointEvaluation = Tuple[int, int]

# 48bytes (as Uint384), split into low and high parts, each of 192 bits.
KzgCommitment = Tuple[int, int]


def update_builtin_pointers(
    memory: MemoryDict,
    n_builtins: int,
    builtins_encoding_addr: RelocatableValue,
    n_selected_builtins: int,
    selected_builtins_encoding_addr: RelocatableValue,
    orig_builtin_ptrs_addr: RelocatableValue,
    selected_builtin_ptrs_addr: RelocatableValue,
):
    """
    Update subsets of the pointer at 'orig_builtin_ptrs_addr' with the pointers at
    'selected_builtin_ptrs_addr' according the location specified by
    'selected_builtins_encoding_addr'.

    Assumption: selected_builtins_encoding is an ordered subset of builtins_encoding_addr
    """
    all_builtins = [memory[builtins_encoding_addr + i] for i in range(n_builtins)]
    selected_builtins = [
        memory[selected_builtins_encoding_addr + i] for i in range(n_selected_builtins)
    ]

    return_builtins = []

    selected_builtin_offset = 0
    for index, builtin in enumerate(all_builtins):
        if builtin in selected_builtins:
            return_builtins.append(memory[selected_builtin_ptrs_addr + selected_builtin_offset])
            selected_builtin_offset += 1
        else:
            # The builtin is unselected, hence its value is the same as before calling the program.
            return_builtins.append(memory[orig_builtin_ptrs_addr + index])

    return return_builtins


def prepare_os_implicit_args(runner: CairoFunctionRunner, gas: int) -> List[MaybeRelocatable]:
    """
    Creates and returns the implicit arguments that are pushed by the OS before running a specific
    contract entrypoint.

    The runner's program is expected to hold the specific entrypoint's builtins in
    program.builtins.
    """
    builtin_segments = prepare_builtins(runner=runner)
    syscall_segment = runner.segments.add()
    return [*builtin_segments, gas, syscall_segment]


def prepare_os_implicit_args_for_version0_class(
    runner: CairoFunctionRunner,
) -> List[MaybeRelocatable]:
    """
    Creates and returns the implicit arguments that are pushed by the OS for old (Cairo 0) compiled
    classes.
    """
    syscall_segment = runner.segments.add()
    builtin_segments = prepare_builtins(runner=runner)
    return [syscall_segment, *builtin_segments]


def prepare_builtins(runner: CairoFunctionRunner) -> List[MaybeRelocatable]:
    """
    Initializes and returns the builtin segments.
    """
    builtin_segments: List[MaybeRelocatable] = []
    for builtin in runner.program.builtins:
        builtin_runner = runner.builtin_runners[f"{builtin}_builtin"]
        builtin_segments.extend(builtin_runner.initial_stack())

    return builtin_segments


def validate_and_process_os_implicit_args(
    runner: CairoFunctionRunner,
    initial_implicit_args: List[MaybeRelocatable],
    syscall_handler: BusinessLogicSyscallHandler,
):
    """
    Validates and processes the OS implicit arguments that were returned by a call.
    """
    # Stack ends with: *builtins, gas, syscall_ptr, vairant_selector, retdata_start, retdata_end.
    builtins_end = runner.vm.run_context.ap - 5
    # Implicit arguments are *builtins, gas, syscall_ptr.
    n_builtins = len(initial_implicit_args[:-2])
    validate_builtins(runner=runner, builtins_end=builtins_end, n_builtins=n_builtins)

    # Validate syscall segment.
    syscall_base_ptr = initial_implicit_args[-1]
    # Stack ends with: syscall_ptr, vairant_selector, retdata_start, retdata_end.
    syscall_stop_ptr = runner.vm_memory[runner.vm.run_context.ap - 4]
    segment_utils.validate_segment_pointers(
        segments=runner.segments,
        segment_base_ptr=syscall_base_ptr,
        segment_stop_ptr=syscall_stop_ptr,
    )
    syscall_handler.post_run(runner=runner, syscall_end_ptr=syscall_stop_ptr)


def validate_builtins(runner: CairoFunctionRunner, builtins_end: MaybeRelocatable, n_builtins: int):
    stack_ptr = builtins_end
    for builtin in runner.program.builtins[::-1]:
        builtin_runner = runner.builtin_runners[f"{builtin}_builtin"]
        with wrap_with_stark_exception(code=StarknetErrorCode.SECURITY_ERROR):
            stack_ptr = builtin_runner.final_stack(runner=runner, pointer=stack_ptr)

    builtins_start = stack_ptr
    assert builtins_start + n_builtins == builtins_end, "Bad returned builtins."


def validate_and_process_os_context_for_version0_class(
    runner: CairoFunctionRunner,
    syscall_handler: DeprecatedBlSyscallHandler,
    initial_os_context: List[MaybeRelocatable],
):
    """
    Validates and processes an OS context that was returned by a transaction.
    """
    # The returned values are syscall_ptr, *builtins, retdata_size, retdata_ptr.
    builtins_end = runner.vm.run_context.ap - 2
    assert SYSCALL_PTR_OFFSET_IN_VERSION0 == 0
    n_builtins = len(initial_os_context[1:])
    validate_builtins(runner=runner, builtins_end=builtins_end, n_builtins=n_builtins)

    # Validate system calls.
    syscall_base_ptr, syscall_stop_ptr = segment_utils.get_os_segment_ptr_range(
        runner=runner, ptr_offset=SYSCALL_PTR_OFFSET_IN_VERSION0, os_context=initial_os_context
    )

    segment_utils.validate_segment_pointers(
        segments=runner.segments,
        segment_base_ptr=syscall_base_ptr,
        segment_stop_ptr=syscall_stop_ptr,
    )
    syscall_handler.post_run(runner=runner, syscall_stop_ptr=syscall_stop_ptr)


def extract_kzg_segment(program_output: List[int]) -> Tuple[KzgCommitment, Point, PointEvaluation]:
    """
    Returns the KZG-related fields out of the given Starknet OS program output.
    """
    assert (
        program_output[OsOutputConstant.USE_KZG_DA_OFFSET.value] == 1
    ), "A blob was attached but the KZG flag is off."

    kzg_segment = program_output[
        OsOutputConstant.HEADER_SIZE.value : OsOutputConstant.HEADER_SIZE.value
        + OsOutputConstant.KZG_SEGMENT_SIZE.value
    ]

    return (kzg_segment[0], kzg_segment[1]), kzg_segment[2], (kzg_segment[3], kzg_segment[4])
