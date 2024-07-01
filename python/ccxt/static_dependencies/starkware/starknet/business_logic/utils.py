import asyncio
import contextlib
import dataclasses
import logging
from typing import Dict, Iterable, List, Optional, Tuple

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.lang.builtins.all_builtins import with_suffix
from starkware.cairo.lang.vm.cairo_pie import ExecutionResources
from starkware.python.utils import from_bytes, sub_counters, to_bytes
from starkware.starknet.business_logic.execution.deprecated_objects import ExecutionResourcesManager
from starkware.starknet.business_logic.execution.gas_usage import calculate_tx_gas_usage
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    CallResult,
    ResourcesMapping,
    TransactionExecutionInfo,
)
from starkware.starknet.business_logic.execution.os_usage import get_tx_additional_os_resources
from starkware.starknet.business_logic.fact_state.contract_class_objects import (
    CompiledClassFact,
    ContractClassFact,
    DeprecatedCompiledClassFact,
)
from starkware.starknet.business_logic.state.state import UpdatesTrackerState
from starkware.starknet.business_logic.state.state_api import SyncState
from starkware.starknet.definitions import constants, fields
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.transaction_type import TransactionType
from starkware.starknet.public import abi as starknet_abi
from starkware.starknet.services.api.contract_class.contract_class import (
    CompiledClass,
    ContractClass,
    DeprecatedCompiledClass,
)
from starkware.starknet.services.api.gateway.deprecated_transaction import DeprecatedInvokeFunction
from starkware.starkware_utils.error_handling import (
    StarkException,
    stark_assert,
    wrap_with_stark_exception,
)
from starkware.storage.storage import Fact, FactFetchingContext

logger = logging.getLogger(__name__)

VALIDATE_BLACKLISTED_SYSCALLS: Tuple[str, ...] = ("call_contract",)


def get_call_result(runner: CairoFunctionRunner, initial_gas: int) -> CallResult:
    """
    Extracts the return values of a StarkNet contract function from the Cairo runner.
    """
    with wrap_with_stark_exception(
        code=StarknetErrorCode.INVALID_RETURN_DATA,
        message="Error extracting return data.",
        logger=logger,
        exception_types=[Exception],
    ):
        return_values = runner.get_return_values(n_ret=5)
        panic_result = return_values[2:]
        # Corresponds to the Cairo 1.0 enum:
        # enum PanicResult<Array::<felt>> { Ok: Array::<felt>, Err: Array::<felt>, }.
        failure_flag, retdata_start, retdata_end = panic_result
        retdata = runner.memory.get_range(addr=retdata_start, size=retdata_end - retdata_start)

    gas = return_values[0]

    return CallResult.create(
        initial_gas=initial_gas,
        updated_gas=gas,
        failure_flag=failure_flag,
        retdata=retdata,
    )


def get_call_result_for_version0_class(runner: CairoFunctionRunner) -> CallResult:
    """
    Extracts the return values of a StarkNet contract function from the Cairo runner.
    """
    with wrap_with_stark_exception(
        code=StarknetErrorCode.INVALID_RETURN_DATA,
        message="Error extracting return data.",
        logger=logger,
        exception_types=[Exception],
    ):
        retdata_size, retdata_ptr = runner.get_return_values(2)
        values = runner.memory.get_range(retdata_ptr, retdata_size)

    stark_assert(
        all(isinstance(value, int) for value in values),
        code=StarknetErrorCode.INVALID_RETURN_DATA,
        message="Return data expected to be non-relocatable.",
    )

    return CallResult.create(initial_gas=0, updated_gas=0, failure_flag=0, retdata=values)


def verify_version(
    version: int, expected_version: int, only_query: bool, old_supported_versions: List[int]
):
    """
    Validates the given transaction version.

    The query flag is used to determine the transaction's type.
    If True, the transaction is assumed to be used for query rather than
    being invoked in the StarkNet OS.
    """
    allowed_versions = [*old_supported_versions, expected_version]
    if only_query:
        error_code = StarknetErrorCode.INVALID_TRANSACTION_QUERYING_VERSION
        allowed_versions += [constants.QUERY_VERSION_BASE + v for v in allowed_versions]
    else:
        error_code = StarknetErrorCode.INVALID_TRANSACTION_VERSION

    stark_assert(
        version in allowed_versions,
        code=error_code,
        message=(
            f"Transaction version {version} is not supported. "
            f"Supported versions: {allowed_versions}."
        ),
    )


def validate_selector_for_fee(tx: DeprecatedInvokeFunction):
    if tx.zero_max_fee or tx.entry_point_selector is None:
        return

    stark_assert(
        tx.entry_point_selector == starknet_abi.EXECUTE_ENTRY_POINT_SELECTOR,
        code=StarknetErrorCode.UNAUTHORIZED_ENTRY_POINT_FOR_INVOKE,
        message=(
            "All transactions should go through the "
            f"{starknet_abi.EXECUTE_ENTRY_POINT_NAME} entrypoint."
        ),
    )


def total_cairo_usage_from_execution_infos(
    execution_infos: Iterable[TransactionExecutionInfo],
) -> ExecutionResources:
    """
    Returns the sum of the Cairo usage (pure Cairo of the EP run, without OS cost) of calls in
    the given execution Infos. Excludes the fee_transfer_info resources,
    since it is part of the OS additional cost.
    """
    cairo_usage = ExecutionResources.empty()

    for execution_info in execution_infos:
        if execution_info.validate_info is not None:
            cairo_usage += execution_info.validate_info.execution_resources
        if execution_info.call_info is not None:
            cairo_usage += execution_info.call_info.execution_resources

    return cairo_usage


def calculate_tx_resources(
    resources_manager: ExecutionResourcesManager,
    call_infos: Iterable[Optional[CallInfo]],
    tx_type: TransactionType,
    state: UpdatesTrackerState,
    fee_token_address: int,
    is_nonce_increment: bool,
    sender_address: Optional[int],
    l1_handler_payload_size: Optional[int] = None,
) -> ResourcesMapping:
    """
    Returns the total resources needed to include the most recent transaction in a StarkNet batch
    (recent w.r.t. application on the given state) i.e., L1 gas usage and Cairo execution resources.
    Used for transaction fee; calculation is made as if the transaction is the first in batch, for
    consistency.
    """
    (
        n_modified_contracts,
        n_storage_changes,
        n_class_hash_updates,
        n_compiled_class_hash_updates,
        _n_nonce_updates,
    ) = state.count_actual_updates_for_fee_charge(
        fee_token_address=fee_token_address,
        is_nonce_increment=is_nonce_increment,
        sender_address=sender_address,
    )

    return calculate_tx_resources_given_usage(
        resources_manager=resources_manager,
        call_infos=call_infos,
        tx_type=tx_type,
        n_modified_contracts=n_modified_contracts,
        n_storage_changes=n_storage_changes,
        n_class_hash_updates=n_class_hash_updates,
        n_compiled_class_hash_updates=n_compiled_class_hash_updates,
        l1_handler_payload_size=l1_handler_payload_size,
    )


def calculate_tx_resources_given_usage(
    resources_manager: ExecutionResourcesManager,
    call_infos: Iterable[Optional[CallInfo]],
    tx_type: TransactionType,
    n_modified_contracts: int,
    n_storage_changes: int,
    n_class_hash_updates: int,
    n_compiled_class_hash_updates: int,
    l1_handler_payload_size: Optional[int] = None,
) -> ResourcesMapping:
    non_optional_call_infos = [call for call in call_infos if call is not None]
    l2_to_l1_messages = []
    for call_info in non_optional_call_infos:
        l2_to_l1_messages += call_info.get_sorted_l2_to_l1_messages()

    l1_gas_usage = calculate_tx_gas_usage(
        l2_to_l1_messages=l2_to_l1_messages,
        n_modified_contracts=n_modified_contracts,
        n_storage_changes=n_storage_changes,
        l1_handler_payload_size=l1_handler_payload_size,
        n_class_hash_updates=n_class_hash_updates,
        n_compiled_class_hash_updates=n_compiled_class_hash_updates,
    )

    cairo_usage_with_segment_arena_builtin = resources_manager.cairo_usage
    # "segment_arena" built-in is not a SHARP built-in - i.e., it is not part of any proof layout.
    # Each instance requires approximately 10 steps in the OS.
    builtin_instance_counter = dict(cairo_usage_with_segment_arena_builtin.builtin_instance_counter)
    n_steps = cairo_usage_with_segment_arena_builtin.n_steps + 10 * builtin_instance_counter.pop(
        with_suffix("segment_arena"), 0
    )
    cairo_usage = dataclasses.replace(
        cairo_usage_with_segment_arena_builtin,
        n_steps=n_steps,
        builtin_instance_counter=builtin_instance_counter,
    )
    tx_syscall_counter = resources_manager.syscall_counter
    # Add additional Cairo resources needed for the OS to run the transaction.
    cairo_usage += get_tx_additional_os_resources(
        syscall_counter=tx_syscall_counter, tx_type=tx_type
    )

    return dict(l1_gas_usage=l1_gas_usage, **cairo_usage.filter_unused_builtins().to_dict())


def extract_l1_gas_and_cairo_usage(resources: ResourcesMapping) -> Tuple[int, ResourcesMapping]:
    cairo_resource_usage = dict(resources)
    return cairo_resource_usage.pop("l1_gas_usage"), cairo_resource_usage


def get_deployed_class_hash_at_address(state: SyncState, contract_address: int) -> int:
    class_hash = state.get_class_hash_at(contract_address=contract_address)
    stark_assert(
        to_bytes(class_hash) != constants.UNINITIALIZED_CLASS_HASH,
        code=StarknetErrorCode.UNINITIALIZED_CONTRACT,
        message=(
            "Requested contract address "
            f"{fields.L2AddressField.format(contract_address)} is not deployed."
        ),
    )

    return class_hash


def validate_contract_deployed(state: SyncState, contract_address: int):
    get_deployed_class_hash_at_address(state=state, contract_address=contract_address)


async def write_class_facts(
    ffc: FactFetchingContext, contract_class: ContractClass, compiled_class: CompiledClass
) -> Tuple[int, int]:
    facts: List[Fact] = [
        ContractClassFact(contract_class=contract_class),
        CompiledClassFact(compiled_class=compiled_class),
    ]
    contract_class_hash, compiled_class_hash = await asyncio.gather(
        *(fact.set_fact(ffc=ffc) for fact in facts)
    )

    return from_bytes(contract_class_hash), from_bytes(compiled_class_hash)


async def write_deprecated_compiled_class_fact(
    deprecated_compiled_class: DeprecatedCompiledClass, ffc: FactFetchingContext
) -> bytes:
    deprecated_compiled_class_fact = DeprecatedCompiledClassFact(
        contract_definition=deprecated_compiled_class
    )
    return await deprecated_compiled_class_fact.set_fact(ffc=ffc)


def get_validate_entrypoint_blacklisted_syscall_counter(
    resources_manager: ExecutionResourcesManager,
) -> Dict[str, int]:
    return {
        syscall_name: resources_manager.syscall_counter.get(syscall_name, 0)
        for syscall_name in VALIDATE_BLACKLISTED_SYSCALLS
    }


@contextlib.contextmanager
def validate_entrypoint_execution_context(resources_manager: ExecutionResourcesManager):
    """
    Context manager for assuring a proper validate.
    """
    syscalls_before_execute = get_validate_entrypoint_blacklisted_syscall_counter(
        resources_manager=resources_manager
    )

    # Exceptions being thrown by this yield are allowed and propagated up.
    yield

    syscalls_after_execute = get_validate_entrypoint_blacklisted_syscall_counter(
        resources_manager=resources_manager
    )
    if syscalls_after_execute == syscalls_before_execute:
        return

    diff = sub_counters(syscalls_after_execute, syscalls_before_execute)

    raise StarkException(
        code=StarknetErrorCode.UNAUTHORIZED_ACTION_ON_VALIDATE,
        message=(
            "One or more unauthorized system calls were performed during 'validate' execution: "
            f"{[name for name, count in diff.items() if count > 0]}."
        ),
    )
