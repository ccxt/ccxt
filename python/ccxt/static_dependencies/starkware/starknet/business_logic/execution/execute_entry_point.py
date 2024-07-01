import asyncio
import contextlib
import dataclasses
import functools
import logging
from typing import Any, Dict, List, Optional, Union, cast

from services.everest.definitions.fields import format_felt_list
from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.vm.cairo_pie import ExecutionResources
from starkware.cairo.lang.vm.relocatable import MaybeRelocatable, RelocatableValue
from starkware.cairo.lang.vm.security import SecurityError
from starkware.cairo.lang.vm.utils import ResourcesError, RunResources
from starkware.cairo.lang.vm.vm_exceptions import HintException, VmException, VmExceptionBase
from starkware.python.utils import as_non_optional
from starkware.starknet.builtins.segment_arena.segment_arena_builtin_runner import (
    SegmentArenaBuiltinRunner,
)
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
from starkware.starknet.business_logic.state.state import ContractStorageState, StateSyncifier
from starkware.starknet.business_logic.state.state_api import State, SyncState
from starkware.starknet.business_logic.utils import (
    get_call_result,
    get_call_result_for_version0_class,
    get_deployed_class_hash_at_address,
    validate_contract_deployed,
)
from starkware.starknet.core.os import os_utils, syscall_utils
from starkware.starknet.core.os.deprecated_syscall_handler import DeprecatedBlSyscallHandler
from starkware.starknet.core.os.syscall_handler import BusinessLogicSyscallHandler
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.constants import GasCost
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.execution_mode import ExecutionMode
from starkware.starknet.definitions.general_config import (
    STARKNET_LAYOUT_INSTANCE,
    StarknetGeneralConfig,
)
from starkware.starknet.public import abi as starknet_abi
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    CompiledClassBase,
    CompiledClassEntryPoint,
    DeprecatedCompiledClass,
    EntryPointType,
)
from starkware.starkware_utils.error_handling import (
    ErrorCode,
    StarkException,
    stark_assert,
    wrap_with_stark_exception,
)

logger = logging.getLogger(__name__)

FAULTY_CLASS_HASH = 0x1A7820094FEAF82D53F53F214B81292D717E7BB9A92BB2488092CD306F3993F

EntryPointArgs = List[Union[MaybeRelocatable, List[MaybeRelocatable]]]


class ExecuteEntryPoint(ExecuteEntryPointBase):
    """
    Represents a Cairo entry point execution of a StarkNet contract.
    """

    @classmethod
    def create(
        cls,
        contract_address: int,
        calldata: List[int],
        entry_point_selector: int,
        caller_address: int,
        initial_gas: int,
        entry_point_type: EntryPointType,
        call_type: Optional[CallType] = None,
        class_hash: Optional[int] = None,
    ) -> "ExecuteEntryPoint":
        return cls(
            call_type=CallType.Call if call_type is None else call_type,
            contract_address=contract_address,
            calldata=calldata,
            code_address=None,
            class_hash=class_hash,
            entry_point_selector=entry_point_selector,
            entry_point_type=entry_point_type,
            caller_address=caller_address,
            initial_gas=initial_gas,
        )

    @classmethod
    def create_for_testing(
        cls,
        contract_address: int,
        calldata: List[int],
        entry_point_selector: int,
        entry_point_type: Optional[EntryPointType] = None,
        caller_address: int = 0,
        initial_gas: int = GasCost.INITIAL.value,
        call_type: Optional[CallType] = None,
        class_hash: Optional[int] = None,
    ) -> "ExecuteEntryPoint":
        return cls.create(
            call_type=call_type,
            contract_address=contract_address,
            class_hash=class_hash,
            entry_point_selector=entry_point_selector,
            entry_point_type=(
                EntryPointType.EXTERNAL if entry_point_type is None else entry_point_type
            ),
            calldata=calldata,
            caller_address=caller_address,
            initial_gas=initial_gas,
        )

    def sync_execute_for_testing(
        self,
        state: SyncState,
        general_config: StarknetGeneralConfig,
        support_reverted: bool = False,
    ) -> CallInfo:
        return self.execute(
            state=state,
            resources_manager=ExecutionResourcesManager.empty(),
            tx_execution_context=TransactionExecutionContext.create_for_testing(
                n_steps=general_config.invoke_tx_max_n_steps
            ),
            general_config=general_config,
            support_reverted=support_reverted,
        )

    async def execute_for_testing(
        self,
        state: State,
        general_config: StarknetGeneralConfig,
        resources_manager: Optional[ExecutionResourcesManager] = None,
        tx_execution_context: Optional[TransactionExecutionContext] = None,
        execution_mode: ExecutionMode = ExecutionMode.EXECUTE,
    ) -> CallInfo:
        if tx_execution_context is None:
            tx_execution_context = TransactionExecutionContext.create_for_testing(
                n_steps=general_config.invoke_tx_max_n_steps, execution_mode=execution_mode
            )

        if resources_manager is None:
            resources_manager = ExecutionResourcesManager.empty()

        loop: asyncio.AbstractEventLoop = asyncio.get_running_loop()
        sync_execute = functools.partial(
            self.execute,
            state=StateSyncifier(async_state=state, loop=loop),
            resources_manager=resources_manager,
            tx_execution_context=tx_execution_context,
            general_config=general_config,
        )

        return await loop.run_in_executor(
            executor=None,  # Runs on the default executor.
            func=sync_execute,
        )

    def execute(
        self,
        state: SyncState,
        resources_manager: ExecutionResourcesManager,
        tx_execution_context: TransactionExecutionContext,
        general_config: StarknetGeneralConfig,
        support_reverted: bool = False,
    ) -> CallInfo:
        """
        Executes the selected entry point with the given calldata in the specified contract.

        The information collected from this run (number of steps required, modifications to the
        contract storage, etc.) is saved on the resources manager.

        Returns a CallInfo object that represents the execution.
        """
        validate_contract_deployed(state=state, contract_address=self.contract_address)

        # Get and fix the class hash at the beginning of the execution, as it may change during it,
        # for example, due to a replace class syscall.
        class_hash = self._get_non_optional_class_hash(
            state=state, tx_execution_context=tx_execution_context
        )

        compiled_class = state.get_compiled_class_by_class_hash(class_hash=class_hash)
        if isinstance(compiled_class, DeprecatedCompiledClass):
            return self._execute_version0_class(
                state=state,
                resources_manager=resources_manager,
                tx_execution_context=tx_execution_context,
                class_hash=class_hash,
                compiled_class=compiled_class,
                general_config=general_config,
            )

        assert isinstance(compiled_class, CompiledClass), "Unexpected compiled_class."
        call_info = self._execute(
            class_hash=class_hash,
            compiled_class=compiled_class,
            state=state,
            resources_manager=resources_manager,
            general_config=general_config,
            tx_execution_context=tx_execution_context,
            support_reverted=support_reverted,
        )
        if support_reverted or call_info.failure_flag == 0:
            return call_info

        # Execution was reverted; raise an exception.
        raise StarkException(
            code=StarknetErrorCode.TRANSACTION_FAILED,
            message=(
                f"Execution was reverted; failure reason: {format_felt_list(call_info.retdata)}."
            ),
        )

    def _execute(
        self,
        state: SyncState,
        compiled_class: CompiledClass,
        class_hash: int,
        resources_manager: ExecutionResourcesManager,
        general_config: StarknetGeneralConfig,
        tx_execution_context: TransactionExecutionContext,
        support_reverted: bool,
    ) -> CallInfo:
        # Fix the current resources usage, in order to calculate the usage of this run at the end.
        previous_cairo_usage = resources_manager.cairo_usage

        # Create a dummy layout.
        layout = dataclasses.replace(
            STARKNET_LAYOUT_INSTANCE,
            builtins={**STARKNET_LAYOUT_INSTANCE.builtins, "segment_arena": {}},
        )

        # Prepare runner.
        entry_point = self._get_selected_entry_point(
            compiled_class=compiled_class, class_hash=class_hash
        )
        program = compiled_class.get_runnable_program(
            entrypoint_builtins=as_non_optional(entry_point.builtins)
        )
        with wrap_with_stark_exception(code=StarknetErrorCode.SECURITY_ERROR):
            runner = CairoFunctionRunner(
                program=program,
                layout=layout,
                additional_builtin_factories=dict(
                    segment_arena=lambda name, included: SegmentArenaBuiltinRunner(
                        included=included
                    )
                ),
            )

        # Prepare implicit arguments.
        implicit_args = os_utils.prepare_os_implicit_args(runner=runner, gas=self.initial_gas)

        # Prepare syscall handler.
        initial_syscall_ptr = cast(RelocatableValue, implicit_args[-1])
        syscall_handler = BusinessLogicSyscallHandler(
            state=state,
            resources_manager=resources_manager,
            segments=runner.segments,
            tx_execution_context=tx_execution_context,
            initial_syscall_ptr=initial_syscall_ptr,
            general_config=general_config,
            entry_point=self,
            support_reverted=support_reverted,
        )

        # Load the builtin costs; Cairo 1.0 programs are expected to end with a `ret` opcode
        # followed by a pointer to the builtin costs.
        core_program_end_ptr = runner.program_base + len(runner.program.data)
        builtin_costs = [0, 0, 0, 0, 0]
        # Use allocate_segment to mark it as read-only.
        builtin_cost_ptr = syscall_handler.allocate_segment(data=builtin_costs)
        program_extra_data: List[MaybeRelocatable] = [0x208B7FFF7FFF7FFE, builtin_cost_ptr]
        runner.load_data(ptr=core_program_end_ptr, data=program_extra_data)

        # Arrange all arguments.

        # Allocate and mark the segment as read-only (to mark every input array as read-only).
        calldata_start = syscall_handler.allocate_segment(data=self.calldata)
        calldata_end = calldata_start + len(self.calldata)
        entry_point_args: EntryPointArgs = [
            # Note that unlike old classes, implicit arguments appear flat in the stack.
            *implicit_args,
            calldata_start,
            calldata_end,
        ]

        # Run.
        with clean_leaks(runner=runner, syscall_handler=syscall_handler):
            self._run(
                runner=runner,
                entry_point_offset=entry_point.offset,
                entry_point_args=entry_point_args,
                hint_locals={"syscall_handler": syscall_handler},
                run_resources=tx_execution_context.run_resources,
                program_segment_size=len(runner.program.data) + len(program_extra_data),
                allow_tmp_segments=True,
            )

            # We should not count (possibly) unsued code as holes.
            runner.mark_as_accessed(address=core_program_end_ptr, size=len(program_extra_data))

            # Complete validations.
            os_utils.validate_and_process_os_implicit_args(
                runner=runner,
                syscall_handler=syscall_handler,
                initial_implicit_args=implicit_args,
            )

            # Update resources usage (for the bouncer and fee calculation).
            resources_manager.cairo_usage += runner.get_execution_resources()

            # Build and return the call info.
            return self._build_call_info(
                class_hash=class_hash,
                execution_resources=resources_manager.cairo_usage - previous_cairo_usage,
                storage=syscall_handler.storage,
                result=get_call_result(runner=runner, initial_gas=self.initial_gas),
                events=syscall_handler.events,
                l2_to_l1_messages=syscall_handler.l2_to_l1_messages,
                internal_calls=syscall_handler.internal_calls,
            )

    def _run(
        self,
        runner: CairoFunctionRunner,
        entry_point_offset: int,
        entry_point_args: EntryPointArgs,
        hint_locals: Dict[str, Any],
        run_resources: RunResources,
        allow_tmp_segments: bool,
        program_segment_size: Optional[int] = None,
    ):
        """
        Runs the runner from the entrypoint offset with the given arguments.

        Wraps VM exceptions with StarkException.
        """
        try:
            runner.run_from_entrypoint(
                entry_point_offset,
                *entry_point_args,
                hint_locals=hint_locals,
                static_locals={
                    "__find_element_max_size": 2**20,
                    "__squash_dict_max_size": 2**20,
                    "__keccak_max_size": 2**20,
                    "__usort_max_size": 2**20,
                    "__chained_ec_op_max_len": 1000,
                },
                run_resources=run_resources,
                verify_secure=True,
                program_segment_size=program_segment_size,
                allow_tmp_segments=allow_tmp_segments,
            )
        except VmException as exception:
            code: ErrorCode = StarknetErrorCode.TRANSACTION_FAILED
            if isinstance(exception.inner_exc, HintException):
                hint_exception = exception.inner_exc

                if isinstance(hint_exception.inner_exc, syscall_utils.HandlerException):
                    stark_exception = hint_exception.inner_exc.stark_exception
                    code = stark_exception.code
                    called_contract_address = hint_exception.inner_exc.called_contract_address
                    message_prefix = (
                        f"Error in the called contract ({hex(called_contract_address)}):\n"
                    )
                    # Override python's traceback and keep the Cairo one of the inner exception.
                    exception.notes = [message_prefix + str(stark_exception.message)]

            if isinstance(exception.inner_exc, ResourcesError):
                code = StarknetErrorCode.OUT_OF_RESOURCES

            raise StarkException(code=code, message=str(exception)) from exception
        except VmExceptionBase as exception:
            raise StarkException(
                code=StarknetErrorCode.TRANSACTION_FAILED, message=str(exception)
            ) from exception
        except SecurityError as exception:
            raise StarkException(
                code=StarknetErrorCode.SECURITY_ERROR, message=str(exception)
            ) from exception
        except Exception as exception:
            logger.error("Got an unexpected exception.", exc_info=True)
            raise StarkException(
                code=StarknetErrorCode.UNEXPECTED_FAILURE,
                message="Got an unexpected exception during the execution of the transaction.",
            ) from exception

        # When execution starts the stack holds entry_point_args + [ret_fp, ret_pc].
        args_ptr = runner.initial_fp - (len(entry_point_args) + 2)

        # The arguments are touched by the OS and should not be counted as holes, mark them
        # as accessed.
        assert isinstance(args_ptr, RelocatableValue)  # Downcast.
        runner.mark_as_accessed(address=args_ptr, size=len(entry_point_args))

    def _get_selected_entry_point(
        self, compiled_class: CompiledClassBase, class_hash: int
    ) -> CompiledClassEntryPoint:
        """
        Returns the EP corresponding to the call (self) in the given compiled class.
        Note that the result may be the default entrypoint if the given selector is missing.
        """
        entry_points = compiled_class.entry_points_by_type[self.entry_point_type]
        filtered_entry_points = list(
            filter(
                lambda ep: ep.selector == self.entry_point_selector,
                entry_points,
            )
        )

        if len(filtered_entry_points) == 0 and len(entry_points) > 0:
            first_entry_point = entry_points[0]
            if first_entry_point.selector == starknet_abi.DEFAULT_ENTRY_POINT_SELECTOR:
                return first_entry_point

        selector_formatter = fields.EntryPointSelectorField.format
        hash_formatter = fields.ClassHashIntField.format
        # Non-unique entry points are not possible in a `DeprecatedCompiledClass` object, thus
        # len(filtered_entry_points) <= 1.
        stark_assert(
            len(filtered_entry_points) == 1,
            code=StarknetErrorCode.ENTRY_POINT_NOT_FOUND_IN_CONTRACT,
            message=(
                f"Entry point {selector_formatter(self.entry_point_selector)} not found in contract"
                f" with class hash {hash_formatter(class_hash)}."
            ),
        )

        (entry_point,) = filtered_entry_points
        return entry_point

    def _build_call_info(
        self,
        storage: Optional[ContractStorageState],
        events: List[OrderedEvent],
        l2_to_l1_messages: List[OrderedL2ToL1Message],
        internal_calls: List[CallInfo],
        execution_resources: ExecutionResources,
        result: CallResult,
        class_hash: int,
    ) -> CallInfo:
        return CallInfo.create(
            # Execution params.
            caller_address=self.caller_address,
            call_type=self.call_type,
            contract_address=self.contract_address,
            code_address=self.code_address,
            class_hash=class_hash,
            entry_point_selector=self.entry_point_selector,
            entry_point_type=self.entry_point_type,
            calldata=self.calldata,
            # Execution results.
            gas_consumed=result.gas_consumed,
            failure_flag=result.failure_flag,
            retdata=result.retdata,
            execution_resources=execution_resources.filter_unused_builtins(),
            events=events,
            l2_to_l1_messages=l2_to_l1_messages,
            # Necessary info. for the OS run.
            storage_read_values=storage.read_values if storage is not None else [],
            accessed_storage_keys=storage.accessed_keys if storage is not None else set(),
            # Internal calls.
            internal_calls=internal_calls,
        )

    def _get_non_optional_class_hash(
        self, state: SyncState, tx_execution_context: TransactionExecutionContext
    ) -> int:
        """
        Returns the hash of the executed contract class.
        """
        if self.class_hash is not None:
            # Library call.
            assert self.call_type is CallType.Delegate
            return self.class_hash

        if self.call_type is CallType.Call:
            code_address = self.contract_address
        elif self.call_type is CallType.Delegate:
            # Delegate call (deprecated version).
            assert self.code_address is not None
            code_address = self.code_address
        else:
            raise NotImplementedError(f"Call type {self.call_type} not implemented.")

        # Extract pre-fetched contract code from carried state.
        class_hash = get_deployed_class_hash_at_address(state=state, contract_address=code_address)
        # Hack to prevent version 0 attack on argent accounts.
        assert type(class_hash) is type(FAULTY_CLASS_HASH)
        if (tx_execution_context.version == 0) and (class_hash == FAULTY_CLASS_HASH):
            raise StarkException(
                code=StarknetErrorCode.TRANSACTION_FAILED, message="Fraud attempt blocked."
            )

        return class_hash

    # Deprecated compiled class utilities.

    def _execute_version0_class(
        self,
        state: SyncState,
        resources_manager: ExecutionResourcesManager,
        tx_execution_context: TransactionExecutionContext,
        class_hash: int,
        compiled_class: DeprecatedCompiledClass,
        general_config: StarknetGeneralConfig,
    ) -> CallInfo:
        # Fix the current resources usage, in order to calculate the usage of this run at the end.
        previous_cairo_usage = resources_manager.cairo_usage

        # Prepare runner.
        with wrap_with_stark_exception(code=StarknetErrorCode.SECURITY_ERROR):
            runner = CairoFunctionRunner(
                program=compiled_class.program, layout=STARKNET_LAYOUT_INSTANCE.layout_name
            )

        # Prepare implicit arguments.
        implicit_args = os_utils.prepare_os_implicit_args_for_version0_class(runner=runner)

        # Prepare syscall handler.
        initial_syscall_ptr = cast(
            RelocatableValue, implicit_args[starknet_abi.SYSCALL_PTR_OFFSET_IN_VERSION0]
        )
        syscall_handler = DeprecatedBlSyscallHandler(
            execute_entry_point_cls=ExecuteEntryPoint,
            tx_execution_context=tx_execution_context,
            state=state,
            resources_manager=resources_manager,
            caller_address=self.caller_address,
            contract_address=self.contract_address,
            general_config=general_config,
            initial_syscall_ptr=initial_syscall_ptr,
            segments=runner.segments,
        )

        # Prepare all arguments.
        entry_point_args: EntryPointArgs = [
            self.entry_point_selector,
            implicit_args,
            len(self.calldata),
            # Allocate and mark the segment as read-only (to mark every input array as read-only).
            syscall_handler._allocate_segment(data=self.calldata),
        ]

        # Get offset to run from.
        entry_point = self._get_selected_entry_point(
            compiled_class=compiled_class, class_hash=class_hash
        )
        entry_point_offset = entry_point.offset

        with clean_leaks(runner=runner, syscall_handler=syscall_handler):
            # Run.
            self._run(
                runner=runner,
                entry_point_offset=entry_point_offset,
                entry_point_args=entry_point_args,
                hint_locals={"syscall_handler": syscall_handler},
                run_resources=tx_execution_context.run_resources,
                allow_tmp_segments=False,
            )

            # Complete validations.
            os_utils.validate_and_process_os_context_for_version0_class(
                runner=runner,
                syscall_handler=syscall_handler,
                initial_os_context=implicit_args,
            )

            # Update resources usage (for the bouncer and fee calculation).
            resources_manager.cairo_usage += runner.get_execution_resources()

            # Build and return the call info.
            return self._build_call_info(
                storage=syscall_handler.starknet_storage,
                events=syscall_handler.events,
                l2_to_l1_messages=syscall_handler.l2_to_l1_messages,
                internal_calls=syscall_handler.internal_calls,
                execution_resources=resources_manager.cairo_usage - previous_cairo_usage,
                result=get_call_result_for_version0_class(runner=runner),
                class_hash=class_hash,
            )


@contextlib.contextmanager
def clean_leaks(
    runner: CairoFunctionRunner,
    syscall_handler: Union[DeprecatedBlSyscallHandler, BusinessLogicSyscallHandler],
):
    # There are memory leaks around these objects; delete some of them as a temporary fix.
    try:
        yield
    finally:
        del runner.program
        del runner.memory
        del runner.segments
        del runner.vm.hints
        del runner.vm.exec_scopes
        del runner.vm.program
        del runner.vm.error_message_attributes
        del runner.vm.validated_memory
        del runner.vm.accessed_addresses
        del runner.vm.hint_pc_and_index
        del runner.vm.trace
        del runner.vm.builtin_runners
        del runner.vm.run_context.memory
        del runner.vm.run_context
        del runner

        del syscall_handler.internal_calls
        del syscall_handler.events
        del syscall_handler.segments.memory
        del syscall_handler._segments
        del syscall_handler.read_only_segments
        del syscall_handler.resources_manager
        del syscall_handler.tx_execution_context
        if isinstance(syscall_handler, DeprecatedBlSyscallHandler):
            del syscall_handler.block_info
            del syscall_handler.sync_state
            del syscall_handler.starknet_storage
        else:
            assert isinstance(syscall_handler, BusinessLogicSyscallHandler)
            del syscall_handler.state
            del syscall_handler.storage

        del syscall_handler
