from abc import ABC, abstractmethod
from typing import Dict, Iterable, List, Optional, Tuple, Type, cast

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.common.structs import CairoStructProxy
from starkware.cairo.lang.vm.memory_segments import MemorySegmentManager
from starkware.cairo.lang.vm.relocatable import MaybeRelocatable, RelocatableValue
from starkware.python.utils import camel_to_snake_case
from starkware.starknet.business_logic.execution.deprecated_objects import ExecutionResourcesManager
from starkware.starknet.business_logic.execution.execute_entry_point_base import (
    ExecuteEntryPointBase,
)
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    CallResult,
    CallType,
    OrderedEvent,
    OrderedL2ToL1Message,
    TransactionExecutionContext,
)
from starkware.starknet.business_logic.state.state import ContractStorageState
from starkware.starknet.business_logic.state.state_api import SyncState
from starkware.starknet.business_logic.state.state_api_objects import BlockInfo
from starkware.starknet.core.os.contract_address.contract_address import (
    calculate_contract_address_from_hash,
)
from starkware.starknet.core.os.os_logger import OptionalSegmentManager
from starkware.starknet.core.os.syscall_handler import OsExecutionHelper
from starkware.starknet.core.os.syscall_utils import (
    cast_to_int,
    get_deprecated_syscall_structs_and_info,
    validate_runtime_request_type,
    wrap_with_handler_exception,
)
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.constants import GasCost
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.execution_mode import ExecutionMode
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.public.abi import CONSTRUCTOR_ENTRY_POINT_SELECTOR
from starkware.starknet.services.api.contract_class.contract_class import EntryPointType
from starkware.starkware_utils.error_handling import stark_assert


class DeprecatedSysCallHandlerBase(ABC):
    """
    Base class for execution of system calls in the StarkNet OS.
    """

    def __init__(self, block_info: BlockInfo, segments: OptionalSegmentManager):
        self._segments = segments
        self.block_info = block_info

        self.syscall_structs, self.syscall_info = get_deprecated_syscall_structs_and_info()

    @property
    def segments(self) -> MemorySegmentManager:
        return self._segments.segments

    # Public API.

    # Segments argument is kept in public API for backward compatibility.
    def call_contract(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        self._call_contract_and_write_response(
            syscall_name="call_contract", syscall_ptr=syscall_ptr
        )

    def delegate_call(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        self._call_contract_and_write_response(
            syscall_name="delegate_call", syscall_ptr=syscall_ptr
        )

    def delegate_l1_handler(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        self._call_contract_and_write_response(
            syscall_name="delegate_l1_handler", syscall_ptr=syscall_ptr
        )

    def deploy(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the deploy system call.
        """
        contract_address = self._deploy(syscall_ptr=syscall_ptr)
        response = self.syscall_structs.DeployResponse(
            contract_address=contract_address,
            constructor_retdata_size=0,
            constructor_retdata=0,
        )
        self._write_syscall_response(
            syscall_name="Deploy", response=response, syscall_ptr=syscall_ptr
        )

    def emit_event(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        return

    def get_caller_address(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the get_caller_address system call.
        """
        caller_address = self._get_caller_address(syscall_ptr=syscall_ptr)

        response = self.syscall_structs.GetCallerAddressResponse(caller_address=caller_address)
        self._write_syscall_response(
            syscall_name="GetCallerAddress", response=response, syscall_ptr=syscall_ptr
        )

    def get_contract_address(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        contract_address = self._get_contract_address(syscall_ptr=syscall_ptr)

        response = self.syscall_structs.GetContractAddressResponse(
            contract_address=contract_address
        )
        self._write_syscall_response(
            syscall_name="GetContractAddress", response=response, syscall_ptr=syscall_ptr
        )

    def get_block_number(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the get_block_number system call.
        """
        self._read_and_validate_syscall_request(
            syscall_name="get_block_number", syscall_ptr=syscall_ptr
        )

        if self._is_validate_execution_mode():
            # Round down block number for validate.
            block_number_for_validate = (
                self.block_info.block_number // constants.VALIDATE_BLOCK_NUMBER_ROUNDING
            ) * constants.VALIDATE_BLOCK_NUMBER_ROUNDING
            block_number = block_number_for_validate
        else:
            block_number = self.block_info.block_number

        response = self.syscall_structs.GetBlockNumberResponse(block_number=block_number)
        self._write_syscall_response(
            syscall_name="GetBlockNumber", response=response, syscall_ptr=syscall_ptr
        )

    def get_sequencer_address(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the get_sequencer_address system call.
        """
        self._read_and_validate_syscall_request(
            syscall_name="get_sequencer_address", syscall_ptr=syscall_ptr
        )

        self._verify_execution_mode(syscall_name="get_sequencer_address")

        response = self.syscall_structs.GetSequencerAddressResponse(
            sequencer_address=(
                0
                if self.block_info.sequencer_address is None
                else self.block_info.sequencer_address
            )
        )
        self._write_syscall_response(
            syscall_name="GetSequencerAddress", response=response, syscall_ptr=syscall_ptr
        )

    def get_tx_info(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the get_tx_info system call.
        """
        self._read_and_validate_syscall_request(syscall_name="get_tx_info", syscall_ptr=syscall_ptr)

        response = self.syscall_structs.GetTxInfoResponse(tx_info=self._get_tx_info_ptr())
        self._write_syscall_response(
            syscall_name="GetTxInfo", response=response, syscall_ptr=syscall_ptr
        )

    def send_message_to_l1(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        return

    def get_block_timestamp(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the get_block_timestamp system call.
        """
        self._read_and_validate_syscall_request(
            syscall_name="get_block_timestamp", syscall_ptr=syscall_ptr
        )

        if self._is_validate_execution_mode():
            # Round down block timestamp for validate.
            block_timestamp_for_validate = (
                self.block_info.block_timestamp // constants.VALIDATE_TIMESTAMP_ROUNDING
            ) * constants.VALIDATE_TIMESTAMP_ROUNDING
            block_timestamp = block_timestamp_for_validate
        else:
            block_timestamp = self.block_info.block_timestamp

        response = self.syscall_structs.GetBlockTimestampResponse(block_timestamp=block_timestamp)
        self._write_syscall_response(
            syscall_name="GetBlockTimestamp", response=response, syscall_ptr=syscall_ptr
        )

    def get_tx_signature(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the get_tx_signature system call.
        """
        self._read_and_validate_syscall_request(
            syscall_name="get_tx_signature", syscall_ptr=syscall_ptr
        )
        tx_info_ptr = self._get_tx_info_ptr()
        tx_info = self.syscall_structs.TxInfo.from_ptr(
            memory=self.segments.memory, addr=tx_info_ptr
        )
        response = self.syscall_structs.GetTxSignatureResponse(
            signature_len=tx_info.signature_len, signature=tx_info.signature
        )

        self._write_syscall_response(
            syscall_name="GetTxSignature", response=response, syscall_ptr=syscall_ptr
        )

    def library_call(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        self._call_contract_and_write_response(syscall_name="library_call", syscall_ptr=syscall_ptr)

    def library_call_l1_handler(
        self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue
    ):
        self._call_contract_and_write_response(
            syscall_name="library_call_l1_handler", syscall_ptr=syscall_ptr
        )

    def replace_class(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the replace_class system call.
        """
        request = self._read_and_validate_syscall_request(
            syscall_name="replace_class", syscall_ptr=syscall_ptr
        )
        self._replace_class(class_hash=cast_to_int(request.class_hash))

    def storage_read(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the storage_read system call.
        """
        request = self._read_and_validate_syscall_request(
            syscall_name="storage_read", syscall_ptr=syscall_ptr
        )

        value = self._storage_read(cast_to_int(request.address))
        response = self.syscall_structs.StorageReadResponse(value=value)

        self._write_syscall_response(
            syscall_name="StorageRead", response=response, syscall_ptr=syscall_ptr
        )

    def storage_write(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the storage_write system call.
        """
        request = self._read_and_validate_syscall_request(
            syscall_name="storage_write", syscall_ptr=syscall_ptr
        )
        self._storage_write(address=cast_to_int(request.address), value=cast_to_int(request.value))

    # Private helpers.

    @abstractmethod
    def _get_tx_info_ptr(self):
        """
        Returns a pointer to the TxInfo struct.
        """

    @abstractmethod
    def _deploy(self, syscall_ptr: RelocatableValue) -> int:
        """
        Returns the address of the newly deployed contract.
        """

    def _read_syscall_request(
        self, syscall_name: str, syscall_ptr: RelocatableValue
    ) -> CairoStructProxy:
        """
        Returns the system call request written in the syscall segment, starting at syscall_ptr.
        """
        syscall_info = self.syscall_info[syscall_name]
        return syscall_info.syscall_request_struct.from_ptr(
            memory=self.segments.memory, addr=syscall_ptr
        )

    @abstractmethod
    def _read_and_validate_syscall_request(
        self, syscall_name: str, syscall_ptr: RelocatableValue
    ) -> CairoStructProxy:
        """
        Returns the system call request written in the syscall segment, starting at syscall_ptr.
        Performs validations on the request.
        """

    def _write_syscall_response(
        self,
        syscall_name: str,
        response: CairoStructProxy,
        syscall_ptr: RelocatableValue,
    ):
        assert (
            camel_to_snake_case(syscall_name) in self.syscall_info
        ), f"Illegal system call {syscall_name}."

        syscall_struct: CairoStructProxy = getattr(self.syscall_structs, syscall_name)
        response_offset = syscall_struct.struct_definition_.members["response"].offset
        self.segments.write_arg(ptr=syscall_ptr + response_offset, arg=response)

    @abstractmethod
    def _call_contract(self, syscall_ptr: RelocatableValue, syscall_name: str) -> CallResult:
        """
        Returns the call's result.

        syscall_name can be "call_contract", "delegate_call", "delegate_l1_handler", "library_call"
        or "library_call_l1_handler".
        """

    def _call_contract_and_write_response(self, syscall_name: str, syscall_ptr: RelocatableValue):
        """
        Executes the contract call and fills the CallContractResponse struct.
        """
        result = self._call_contract(syscall_ptr=syscall_ptr, syscall_name=syscall_name)
        assert not result.failure_flag, "Unexpected reverted call."
        response = self.syscall_structs.CallContractResponse(
            retdata_size=len(result.retdata), retdata=self._allocate_segment(data=result.retdata)
        )
        self._write_syscall_response(
            syscall_name="CallContract", response=response, syscall_ptr=syscall_ptr
        )

    def _verify_execution_mode(self, syscall_name: str):
        stark_assert(
            not self._is_validate_execution_mode(),
            code=StarknetErrorCode.UNAUTHORIZED_ACTION_ON_VALIDATE,
            message=(
                f"Unauthorized syscall {syscall_name} "
                f"in execution mode {ExecutionMode.VALIDATE.name}."
            ),
        )

    def _is_validate_execution_mode(self) -> bool:
        """
        Returns False if there is no execution mode, for example when self is
        DeprecatedOsSysCallHandler.
        Returns True if the current execution mode is ExecutionMode.VALIDATE.
        """
        return False

    @abstractmethod
    def _get_caller_address(self, syscall_ptr: RelocatableValue) -> int:
        """
        Specific implementation of the get_caller_address system call.
        """

    @abstractmethod
    def _get_contract_address(self, syscall_ptr: RelocatableValue) -> int:
        """
        Specific implementation of the get_contract_address system call.
        """

    @abstractmethod
    def _replace_class(self, class_hash: int):
        """
        replaces the running contracts class hash with the given hash.
        """

    @abstractmethod
    def _storage_read(self, address: int) -> int:
        """
        Returns the value of the contract's storage at the given address.
        """

    @abstractmethod
    def _storage_write(self, address: int, value: int):
        """
        Write the value to the contract's storage at the given address.
        """

    @abstractmethod
    def _allocate_segment(self, data: Iterable[MaybeRelocatable]) -> RelocatableValue:
        """
        Allocates and returns a new (read-only) segment with the given data.
        Note that unlike MemorySegmentManager.write_arg, this function doesn't work well with
        recursive input - call _allocate_segment for the inner items if needed.
        """


class DeprecatedBlSyscallHandler(DeprecatedSysCallHandlerBase):
    """
    The SysCallHandler implementation that is used by the batcher.
    """

    def __init__(
        self,
        execute_entry_point_cls: Type[ExecuteEntryPointBase],
        tx_execution_context: TransactionExecutionContext,
        state: SyncState,
        resources_manager: ExecutionResourcesManager,
        caller_address: int,
        contract_address: int,
        general_config: StarknetGeneralConfig,
        initial_syscall_ptr: RelocatableValue,
        segments: MemorySegmentManager,
    ):
        super().__init__(block_info=state.block_info, segments=OptionalSegmentManager(segments))

        # Configuration objects.
        self.general_config = general_config

        # Execution-related objects.
        self.execute_entry_point_cls = execute_entry_point_cls
        self.tx_execution_context = tx_execution_context
        self.sync_state = state
        self.resources_manager = resources_manager
        self.caller_address = caller_address
        self.contract_address = contract_address

        # Storage-related members.
        self.starknet_storage = ContractStorageState(
            state=self.sync_state, contract_address=contract_address
        )

        # Internal calls executed by the current contract call.
        self.internal_calls: List[CallInfo] = []
        # Events emitted by the current contract call.
        self.events: List[OrderedEvent] = []
        # Messages sent by the current contract call to L1.
        self.l2_to_l1_messages: List[OrderedL2ToL1Message] = []

        # Kept for validations during the run.
        self.expected_syscall_ptr = initial_syscall_ptr

        # A pointer to the Cairo TxInfo struct.
        self.tx_info_ptr: Optional[RelocatableValue] = None

        # A list of dynamically allocated segments that are expected to be read-only.
        self.read_only_segments: List[Tuple[RelocatableValue, int]] = []

    def _allocate_segment(self, data: Iterable[MaybeRelocatable]) -> RelocatableValue:
        segment_start = self.segments.add()
        segment_end = self.segments.write_arg(ptr=segment_start, arg=data)
        self.read_only_segments.append((segment_start, segment_end - segment_start))
        return segment_start

    def _count_syscall(self, syscall_name: str):
        previous_syscall_count = self.resources_manager.syscall_counter.get(syscall_name, 0)
        self.resources_manager.syscall_counter[syscall_name] = previous_syscall_count + 1

    def _read_and_validate_syscall_request(
        self, syscall_name: str, syscall_ptr: RelocatableValue
    ) -> CairoStructProxy:
        """
        Returns the system call request written in the syscall segment, starting at syscall_ptr.
        Performs validations on the request.
        """
        # Update syscall count.
        self._count_syscall(syscall_name=syscall_name)

        request = self._read_syscall_request(syscall_name=syscall_name, syscall_ptr=syscall_ptr)

        assert (
            syscall_ptr == self.expected_syscall_ptr
        ), f"Bad syscall_ptr, Expected {self.expected_syscall_ptr}, got {syscall_ptr}."

        syscall_info = self.syscall_info[syscall_name]
        self.expected_syscall_ptr += syscall_info.syscall_size

        selector = request.selector
        assert isinstance(selector, int), (
            f"The selector argument to syscall {syscall_name} is of unexpected type. "
            f"Expected: int; got: {type(selector).__name__}."
        )
        assert (
            selector == syscall_info.selector
        ), f"Bad syscall selector, expected {syscall_info.selector}. Got: {selector}"

        validate_runtime_request_type(
            request_values=request, request_struct=syscall_info.syscall_request_struct
        )

        return request

    def _call_contract(self, syscall_ptr: RelocatableValue, syscall_name: str) -> CallResult:
        # Parse request and prepare the call.
        request = self._read_and_validate_syscall_request(
            syscall_name=syscall_name, syscall_ptr=syscall_ptr
        )
        calldata = self.segments.memory.get_range_as_ints(
            addr=request.calldata, size=request.calldata_size
        )

        code_address: Optional[int] = None
        class_hash: Optional[int] = None
        if syscall_name == "call_contract":
            code_address = cast_to_int(request.contract_address)
            contract_address = code_address
            caller_address = self.contract_address
            entry_point_type = EntryPointType.EXTERNAL
            call_type = CallType.Call
        elif syscall_name == "delegate_call":
            code_address = cast_to_int(request.contract_address)
            contract_address = self.contract_address
            caller_address = self.caller_address
            entry_point_type = EntryPointType.EXTERNAL
            call_type = CallType.Delegate
        elif syscall_name == "delegate_l1_handler":
            code_address = cast_to_int(request.contract_address)
            contract_address = self.contract_address
            caller_address = self.caller_address
            entry_point_type = EntryPointType.L1_HANDLER
            call_type = CallType.Delegate
        elif syscall_name == "library_call":
            class_hash = cast_to_int(request.class_hash)
            contract_address = self.contract_address
            caller_address = self.caller_address
            entry_point_type = EntryPointType.EXTERNAL
            call_type = CallType.Delegate
        elif syscall_name == "library_call_l1_handler":
            class_hash = cast_to_int(request.class_hash)
            contract_address = self.contract_address
            caller_address = self.caller_address
            entry_point_type = EntryPointType.L1_HANDLER
            call_type = CallType.Delegate
        else:
            raise NotImplementedError(f"Unsupported call type {syscall_name}.")

        if self._is_validate_execution_mode():
            # Enforce here the no calls to other contracts.
            stark_assert(
                self.contract_address == contract_address,
                code=StarknetErrorCode.UNAUTHORIZED_ACTION_ON_VALIDATE,
                message=(
                    f"Unauthorized syscall {syscall_name} "
                    f"in execution mode {self.tx_execution_context.execution_mode.name}."
                ),
            )

        call = self.execute_entry_point_cls(
            call_type=call_type,
            class_hash=class_hash,
            contract_address=contract_address,
            code_address=code_address,
            entry_point_selector=cast_to_int(request.function_selector),
            initial_gas=GasCost.INITIAL.value,
            entry_point_type=entry_point_type,
            calldata=calldata,
            caller_address=caller_address,
        )

        return self.execute_entry_point(call=call)

    def _deploy(self, syscall_ptr: RelocatableValue) -> int:
        """
        Initializes and runs the constructor of the new contract.
        Returns the address of the newly deployed contract.
        """
        request = self._read_and_validate_syscall_request(
            syscall_name="deploy", syscall_ptr=syscall_ptr
        )
        assert request.deploy_from_zero in [
            0,
            1,
        ], "The deploy_from_zero field in the deploy system call must be 0 or 1."
        constructor_calldata = self.segments.memory.get_range_as_ints(
            addr=cast(RelocatableValue, request.constructor_calldata),
            size=cast_to_int(request.constructor_calldata_size),
        )
        class_hash = cast_to_int(request.class_hash)

        deployer_address = self.contract_address if request.deploy_from_zero == 0 else 0
        contract_address = calculate_contract_address_from_hash(
            salt=cast_to_int(request.contract_address_salt),
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            deployer_address=deployer_address,
        )

        # Instantiate the contract.
        self.sync_state.deploy_contract(contract_address=contract_address, class_hash=class_hash)

        self.execute_constructor_entry_point(
            contract_address=contract_address,
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
        )

        return contract_address

    def execute_constructor_entry_point(
        self, contract_address: int, class_hash: int, constructor_calldata: List[int]
    ):
        contract_class = self.sync_state.get_compiled_class_by_class_hash(class_hash=class_hash)
        constructor_entry_points = contract_class.entry_points_by_type[EntryPointType.CONSTRUCTOR]
        if len(constructor_entry_points) == 0:
            # Contract has no constructor.
            assert (
                len(constructor_calldata) == 0
            ), "Cannot pass calldata to a contract with no constructor."

            call_info = CallInfo.empty_constructor_call(
                contract_address=contract_address,
                caller_address=self.contract_address,
                class_hash=class_hash,
            )
            self.internal_calls.append(call_info)

            return

        call = self.execute_entry_point_cls(
            call_type=CallType.Call,
            class_hash=None,
            contract_address=contract_address,
            code_address=contract_address,
            entry_point_selector=CONSTRUCTOR_ENTRY_POINT_SELECTOR,
            initial_gas=GasCost.INITIAL.value,
            entry_point_type=EntryPointType.CONSTRUCTOR,
            calldata=constructor_calldata,
            caller_address=self.contract_address,
        )
        self.execute_entry_point(call=call)

    def execute_entry_point(self, call: ExecuteEntryPointBase) -> CallResult:
        with wrap_with_handler_exception(call=call):
            # Execute contract call.
            call_info = call.execute(
                state=self.sync_state,
                resources_manager=self.resources_manager,
                tx_execution_context=self.tx_execution_context,
                general_config=self.general_config,
            )

        # Update execution info.
        self.internal_calls.append(call_info)

        return call_info.result()

    def emit_event(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        """
        Handles the emit_event system call.
        """
        request = self._read_and_validate_syscall_request(
            syscall_name="emit_event", syscall_ptr=syscall_ptr
        )

        self.events.append(
            OrderedEvent.create(
                order=self.tx_execution_context.n_emitted_events,
                keys=self.segments.memory.get_range_as_ints(
                    addr=cast(RelocatableValue, request.keys), size=cast_to_int(request.keys_len)
                ),
                data=self.segments.memory.get_range_as_ints(
                    addr=cast(RelocatableValue, request.data), size=cast_to_int(request.data_len)
                ),
            )
        )

        # Update events count.
        self.tx_execution_context.n_emitted_events += 1

    def _get_tx_info_ptr(self) -> RelocatableValue:
        if self.tx_info_ptr is None:
            tx_info = self.syscall_structs.TxInfo(
                version=self.tx_execution_context.version,
                account_contract_address=self.tx_execution_context.account_contract_address,
                max_fee=self.tx_execution_context.max_fee,
                transaction_hash=self.tx_execution_context.transaction_hash,
                signature_len=len(self.tx_execution_context.signature),
                signature=self._allocate_segment(data=self.tx_execution_context.signature),
                chain_id=self.general_config.chain_id.value,
                nonce=self.tx_execution_context.nonce,
            )
            self.tx_info_ptr = self._allocate_segment(data=tx_info)

        return self.tx_info_ptr

    def send_message_to_l1(self, segments: MemorySegmentManager, syscall_ptr: RelocatableValue):
        request = self._read_and_validate_syscall_request(
            syscall_name="send_message_to_l1", syscall_ptr=syscall_ptr
        )
        payload = self.segments.memory.get_range_as_ints(
            addr=cast(RelocatableValue, request.payload_ptr), size=cast_to_int(request.payload_size)
        )

        self.l2_to_l1_messages.append(
            # Note that the constructor of OrderedL2ToL1Message might fail as it is
            # more restrictive than the Cairo code.
            OrderedL2ToL1Message.create(
                order=self.tx_execution_context.n_sent_messages,
                to_address=cast_to_int(request.to_address),
                payload=payload,
            )
        )

        # Update messages count.
        self.tx_execution_context.n_sent_messages += 1

    def _get_caller_address(self, syscall_ptr: RelocatableValue) -> int:
        self._read_and_validate_syscall_request(
            syscall_name="get_caller_address", syscall_ptr=syscall_ptr
        )

        return self.caller_address

    def _get_contract_address(self, syscall_ptr: RelocatableValue) -> int:
        self._read_and_validate_syscall_request(
            syscall_name="get_contract_address", syscall_ptr=syscall_ptr
        )

        return self.contract_address

    def _replace_class(self, class_hash: int):
        # Assert the replacement class is valid (by reading it).
        self.sync_state.get_compiled_class_by_class_hash(class_hash=class_hash)

        # Replace the class.
        self.sync_state.set_class_hash_at(
            contract_address=self.contract_address, class_hash=class_hash
        )

    def _storage_read(self, address: int) -> int:
        return self.starknet_storage.read(address=address)

    def _storage_write(self, address: int, value: int):
        # Read the value before the write operation in order to log it in the read_values list.
        # This value is needed to create the DictAccess while executing the corresponding
        # storage_write system call.
        self.starknet_storage.read(address=address)

        self.starknet_storage.write(address=address, value=value)

    def validate_read_only_segments(self, runner: CairoFunctionRunner):
        """
        Validates that there were no out of bounds writes to read-only segments and marks
        them as accessed.
        """
        assert self.segments is runner.segments, "Inconsistent segments."

        for segment_ptr, segment_size in self.read_only_segments:
            used_size = self.segments.get_segment_used_size(segment_index=segment_ptr.segment_index)
            stark_assert(
                used_size == segment_size,
                code=StarknetErrorCode.SECURITY_ERROR,
                message="Out of bounds write to a read-only segment.",
            )

            runner.mark_as_accessed(address=segment_ptr, size=segment_size)

    def post_run(self, runner: CairoFunctionRunner, syscall_stop_ptr: MaybeRelocatable):
        """
        Performs post run syscall related tasks.
        """
        expected_stop_ptr = self.expected_syscall_ptr
        stark_assert(
            syscall_stop_ptr == expected_stop_ptr,
            code=StarknetErrorCode.SECURITY_ERROR,
            message=f"Bad syscall_stop_ptr, Expected {expected_stop_ptr}, got {syscall_stop_ptr}.",
        )

        self.validate_read_only_segments(runner=runner)

    def _is_validate_execution_mode(self):
        """
        Returns True if the current execution mode is ExecutionMode.VALIDATE.
        """
        return self.tx_execution_context.execution_mode is ExecutionMode.VALIDATE


class DeprecatedOsSysCallHandler(DeprecatedSysCallHandlerBase):
    """
    The SysCallHandler implementation that is used by the gps ambassador.
    """

    def __init__(
        self,
        execution_helper: OsExecutionHelper,
        block_info: BlockInfo,
        # Note that a non-optional segments must be set before using the SysCallHandler.
        segments: Optional[MemorySegmentManager] = None,
    ):
        super().__init__(block_info=block_info, segments=execution_helper.os_logger.segments)
        self.execution_helper = execution_helper
        self.syscall_counter: Dict[str, int] = {}

    def _count_syscall(self, syscall_name: str):
        previous_syscall_count = self.syscall_counter.get(syscall_name, 0)
        self.syscall_counter[syscall_name] = previous_syscall_count + 1

    def _read_and_validate_syscall_request(
        self, syscall_name: str, syscall_ptr: RelocatableValue
    ) -> CairoStructProxy:
        """
        Returns the system call request written in the syscall segment, starting at syscall_ptr.
        Does not perform validations on the request, since it was validated in the BL.
        """
        self._count_syscall(syscall_name)
        return self._read_syscall_request(syscall_name=syscall_name, syscall_ptr=syscall_ptr)

    def _allocate_segment(self, data: Iterable[MaybeRelocatable]) -> RelocatableValue:
        """
        Allocates and returns a new temporary segment.
        """
        segment_start = self.segments.add_temp_segment()
        self.segments.write_arg(ptr=segment_start, arg=data)
        return segment_start

    def _call_contract(self, syscall_ptr: RelocatableValue, syscall_name: str) -> CallResult:
        return next(self.execution_helper.result_iterator)

    def _deploy(self, syscall_ptr: RelocatableValue) -> int:
        next(self.execution_helper.result_iterator)
        return next(self.execution_helper.deployed_contracts_iterator)

    def _get_caller_address(self, syscall_ptr: RelocatableValue) -> int:
        return self.execution_helper.call_info.caller_address

    def _get_contract_address(self, syscall_ptr: RelocatableValue) -> int:
        return self.execution_helper.call_info.contract_address

    def _get_tx_info_ptr(self) -> RelocatableValue:
        assert self.execution_helper.tx_info_ptr is not None
        return self.execution_helper.tx_info_ptr

    def _replace_class(self, class_hash: int):
        return

    def _storage_read(self, address: int) -> int:
        return next(self.execution_helper.execute_code_read_iterator)

    def _storage_write(self, address: int, value: int):
        # Advance execute_code_read_iterators since the previous storage value is written
        # in each write operation. See DeprecatedBlSyscallHandler._storage_write().
        next(self.execution_helper.execute_code_read_iterator)
