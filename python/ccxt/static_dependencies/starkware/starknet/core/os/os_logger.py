from typing import Dict, List, Optional

import cachetools

from starkware.cairo.lang.builtins.all_builtins import with_suffix
from starkware.cairo.lang.compiler.program import Program
from starkware.cairo.lang.vm.cairo_pie import ExecutionResources
from starkware.cairo.lang.vm.memory_dict import MemoryDict
from starkware.cairo.lang.vm.memory_segments import MemorySegmentManager
from starkware.cairo.lang.vm.relocatable import RelocatableValue
from starkware.cairo.lang.vm.vm_consts import VmConstsReference
from starkware.python.math_utils import safe_div
from starkware.python.utils import as_non_optional
from starkware.starknet.business_logic.transaction.objects import InternalTransaction
from starkware.starknet.core.os.syscall_utils import (
    STARKNET_OLD_SYSCALLS_COMPILED_PATH,
    STARKNET_SYSCALLS_COMPILED_PATH,
    cast_to_int,
    get_builtins_structs,
    get_selector_from_program,
)
from starkware.starknet.definitions.general_config import STARKNET_LAYOUT_INSTANCE

DEPRECATED_CALL_CONTRACT_SYSCALLS = {
    "delegate_call",
    "delegate_l1_handler",
    "library_call_l1_handler",
}

CALL_CONTRACT_SYSCALLS = {
    "call_contract",
    "library_call",
    "deploy",
    *DEPRECATED_CALL_CONTRACT_SYSCALLS,
}

DEPRECATED_SYSCALL_NAMES = {
    "delegate_call",
    "delegate_l1_handler",
    "get_block_number",
    "get_block_timestamp",
    "get_sequencer_address",
    "get_tx_signature",
    "library_call_l1_handler",
    "get_caller_address",
    "get_contract_address",
    "get_tx_info",
    *DEPRECATED_CALL_CONTRACT_SYSCALLS,
}
SYSCALLS_NAMES = {
    "call_contract",
    "library_call",
    "deploy",
    "keccak",
    "emit_event",
    "get_block_hash",
    "get_execution_info",
    "replace_class",
    "send_message_to_l1",
    "secp256k1_new",
    "secp256k1_add",
    "secp256k1_get_point_from_x",
    "secp256k1_get_xy",
    "secp256k1_mul",
    "secp256r1_new",
    "secp256r1_add",
    "secp256r1_get_point_from_x",
    "secp256r1_get_xy",
    "secp256r1_mul",
    "storage_read",
    "storage_write",
}


@cachetools.cached(cache={})
def get_deprecated_syscall_selector_to_name() -> Dict[int, str]:
    with open(STARKNET_OLD_SYSCALLS_COMPILED_PATH, "r") as file:
        syscalls_program = Program.loads(data=file.read())
    return {
        get_selector_from_program(syscall_name=name, syscalls_program=syscalls_program): name
        for name in DEPRECATED_SYSCALL_NAMES
    }


@cachetools.cached(cache={})
def get_syscall_selector_to_name() -> Dict[int, str]:
    with open(STARKNET_SYSCALLS_COMPILED_PATH, "r") as file:
        syscalls_program = Program.loads(data=file.read())
    return {
        get_selector_from_program(syscall_name=name, syscalls_program=syscalls_program): name
        for name in SYSCALLS_NAMES
    }


class OptionalSegmentManager:
    def __init__(self, segments: Optional[MemorySegmentManager]):
        self._segments = segments

    def set_segments(self, segments: MemorySegmentManager):
        assert self._segments is None, "segments is already set."
        self._segments = segments

    @property
    def segments(self) -> MemorySegmentManager:
        assert self._segments is not None, "segments must be set before using the SyscallHandler."
        return self._segments


class SyscallTrace:
    """
    Holds information about syscall execution in the OS.
    """

    def __init__(self, name: str, deprecated: bool, tab_count: int):
        self.name = name
        self.deprecated = deprecated
        self.tab_count = tab_count
        self.inner_syscalls: List[SyscallTrace] = []
        self.builtin_count_dict: Dict[str, int] = {}
        self._resources: Optional[ExecutionResources] = None

    @property
    def resources(self) -> ExecutionResources:
        assert (
            self._resources is not None
        ), "SyscallTrace should be finalized before accessing resources."
        return self._resources

    def finalize_resources(self, resources: ExecutionResources):
        assert self._resources is None, "SyscallTrace should be finalized only once."
        self._resources = resources

    def __str__(self):
        deprecated = "deprecated " if self.deprecated else ""
        builtins = (
            f"\n{'  '*(self.tab_count+1)}Builtins: {self.resources.builtin_instance_counter}"
            if len(self.resources.builtin_instance_counter) > 0
            else ""
        )
        syscall_name_set = set(syscall.name for syscall in self.inner_syscalls)
        inner_syscalls = (
            f"\n{'  '*(self.tab_count+1)}Inner syscalls: {syscall_name_set}"
            if len(syscall_name_set) > 0
            else ""
        )
        return f"""\
{deprecated}Syscall: {self.name}
{'  '*(self.tab_count+1)}Steps: {self.resources.n_steps}{builtins}{inner_syscalls}"""


class TransactionTrace:
    """
    Holds information about transaction execution in the OS.
    """

    def __init__(self, name: str, tx_hash: int):
        self.name = name
        self.tx_hash = tx_hash
        self.syscalls: List[SyscallTrace] = []
        self._resources: Optional[ExecutionResources] = None

    @property
    def resources(self) -> ExecutionResources:
        assert (
            self._resources is not None
        ), "TransactionTrace should be finalized before accessing resources."
        return self._resources

    def finalize_resources(self, resources: ExecutionResources):
        assert self._resources is None, "TransactionTrace should be finalized only once."
        self._resources = resources

    def __str__(self) -> str:
        builtins = (
            f"\n\tBuiltins: {self.resources.builtin_instance_counter}"
            if len(self.resources.builtin_instance_counter) > 0
            else ""
        )
        return f"""\
Transaction: {self.name}
\tHash: {self.tx_hash}
\tSteps: {self.resources.n_steps}{builtins}"""


class ResourceCounter:
    def __init__(
        self,
        n_steps: int,
        builtins_ptrs_dict: VmConstsReference,
        range_check_ptr: RelocatableValue,
        memory: MemoryDict,
    ):
        self.n_steps = n_steps
        self.range_check_ptr = range_check_ptr
        self.builtin_ptrs_dict = self.create_builtins_from_ptr(
            ptr=builtins_ptrs_dict, memory=memory
        )

    @staticmethod
    def create_builtins_from_ptr(
        ptr: VmConstsReference, memory: MemoryDict
    ) -> Dict[str, RelocatableValue]:
        builtins_struct = get_builtins_structs().BuiltinPointers.from_ptr(
            memory=memory, addr=ptr.address_
        )
        builtins_dict = builtins_struct.selectable._asdict()
        builtins_dict.pop("segment_arena")
        builtins_dict.update(builtins_struct.non_selectable._asdict())
        return builtins_dict

    def sub_counter(self, enter_counter: "ResourceCounter") -> ExecutionResources:
        builtins_count_ptr = {
            key: cast_to_int(self.builtin_ptrs_dict[key] - enter_counter.builtin_ptrs_dict[key])
            for key in self.builtin_ptrs_dict.keys()
        }
        builtins_count_ptr["range_check"] += cast_to_int(
            self.range_check_ptr - enter_counter.range_check_ptr
        )
        builtins_count_ptr = {
            with_suffix(builtin_name): safe_div(
                count, STARKNET_LAYOUT_INSTANCE.builtins[builtin_name].memory_cells_per_instance
            )
            for builtin_name, count in builtins_count_ptr.items()
            if count != 0
        }
        final_n_steps = self.n_steps - enter_counter.n_steps
        return ExecutionResources(
            n_steps=final_n_steps, builtin_instance_counter=builtins_count_ptr, n_memory_holes=0
        )


class OsLogger:
    """
    Collects and logs debug information during the OS execution.
    """

    def __init__(self, debug: bool, segments: OptionalSegmentManager):
        self.debug = debug
        self.current_tx: Optional[TransactionTrace] = None
        self.tab_count: int = 0
        self.syscall_stack: List[SyscallTrace] = []
        self.txs: List[TransactionTrace] = []
        self.resource_counter_stack: List[ResourceCounter] = []
        # This segments are shared with the SyscallHandler and
        # DeprecatedSyscallHandler objects through ExecutionHelper.
        self.segments = segments
        self.selector_to_syscall_info = get_syscall_selector_to_name()
        self.deprecated_syscall_selector_to_name = get_deprecated_syscall_selector_to_name()

    def get_name_from_selector(self, selector: int) -> str:
        if selector in self.selector_to_syscall_info:
            return self.selector_to_syscall_info[selector]
        return self.deprecated_syscall_selector_to_name[selector]

    def log(self, msg: str, enter: bool):
        if self.debug:
            if enter:
                self.tab_count += 1
            print(f"{'  ' * self.tab_count}{msg}")
            if not enter:
                self.tab_count -= 1

    def enter_syscall(
        self,
        selector: int,
        deprecated: bool,
        n_steps: int,
        builtin_ptrs: VmConstsReference,
        range_check_ptr: RelocatableValue,
    ):
        assert self.current_tx is not None, "All syscalls should be called inside a transaction."
        if len(self.syscall_stack) > 0:
            parent_syscall_name = self.syscall_stack[-1].name
            assert (
                parent_syscall_name in CALL_CONTRACT_SYSCALLS
            ), f"the {parent_syscall_name} syscall is not suppouse to have an inner syscall."

        self.resource_counter_stack.append(
            ResourceCounter(
                n_steps=n_steps,
                builtins_ptrs_dict=builtin_ptrs,
                range_check_ptr=range_check_ptr,
                memory=self.segments.segments.memory,
            )
        )
        syscall = SyscallTrace(
            name=self.get_name_from_selector(selector=selector),
            deprecated=deprecated,
            tab_count=self.tab_count,
        )
        self.syscall_stack.append(syscall)
        deprecated_str = "deprecated " if deprecated else ""
        self.log(msg=f"Entering {deprecated_str}{syscall.name}.", enter=True)

    def exit_syscall(
        self,
        selector: int,
        n_steps: int,
        builtin_ptrs: VmConstsReference,
        range_check_ptr: RelocatableValue,
    ):
        current_syscall = self.syscall_stack.pop()
        enter_resources_counter = self.resource_counter_stack.pop()
        expected_syscall_name = self.get_name_from_selector(selector=selector)
        # A sanity check to ensure we store the syscall we work on.
        assert expected_syscall_name == current_syscall.name, "Unexpected syscall name."
        exit_resources_counter = ResourceCounter(
            builtins_ptrs_dict=builtin_ptrs,
            range_check_ptr=range_check_ptr,
            n_steps=n_steps,
            memory=self.segments.segments.memory,
        )

        current_syscall.finalize_resources(
            resources=exit_resources_counter.sub_counter(enter_counter=enter_resources_counter)
        )

        self.log(msg=f"Exiting {current_syscall}.\n", enter=False)
        if len(self.syscall_stack) > 0:
            # Handle the case of inner syscalls.
            self.syscall_stack[-1].inner_syscalls.append(current_syscall)
        else:
            as_non_optional(self.current_tx).syscalls.append(current_syscall)

    def enter_tx(
        self,
        tx: InternalTransaction,
        n_steps: int,
        builtin_ptrs: VmConstsReference,
        range_check_ptr: RelocatableValue,
    ):
        assert self.current_tx is None, "No transaction sould call another transaction."
        self.resource_counter_stack.append(
            ResourceCounter(
                n_steps=n_steps,
                builtins_ptrs_dict=builtin_ptrs,
                range_check_ptr=range_check_ptr,
                memory=self.segments.segments.memory,
            )
        )
        self.current_tx = TransactionTrace(name=tx.tx_type.name.lower(), tx_hash=tx.hash_value)
        self.log(msg=f"Entering {tx.tx_type.name.lower()}: {hex(tx.hash_value)}.", enter=True)

    def exit_tx(
        self,
        n_steps: int,
        builtin_ptrs: VmConstsReference,
        range_check_ptr: RelocatableValue,
    ):
        assert self.current_tx is not None, "No transaction sould exit without entering."
        assert len(self.syscall_stack) == 0, "All Syscalls should end when exiting a transaction."
        enter_resources_counter = self.resource_counter_stack.pop()
        exit_resources_counter = ResourceCounter(
            builtins_ptrs_dict=builtin_ptrs,
            range_check_ptr=range_check_ptr,
            n_steps=n_steps,
            memory=self.segments.segments.memory,
        )
        self.current_tx.finalize_resources(
            resources=exit_resources_counter.sub_counter(enter_counter=enter_resources_counter)
        )
        self.log(msg=f"Exiting {self.current_tx}.\n", enter=False)
        self.txs.append(self.current_tx)
        self.current_tx = None
