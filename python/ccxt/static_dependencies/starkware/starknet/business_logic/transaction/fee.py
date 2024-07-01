import math
from typing import Mapping

from starkware.starknet.business_logic.execution.deprecated_objects import ExecutionResourcesManager
from starkware.starknet.business_logic.execution.execute_entry_point import ExecuteEntryPoint
from starkware.starknet.business_logic.execution.objects import (
    CallInfo,
    ResourcesMapping,
    TransactionExecutionContext,
)
from starkware.starknet.business_logic.state.state_api import SyncState
from starkware.starknet.business_logic.utils import extract_l1_gas_and_cairo_usage
from starkware.starknet.definitions.constants import VERSIONED_CONSTANTS, GasCost
from starkware.starknet.definitions.error_codes import StarknetErrorCode
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.public import abi as starknet_abi
from starkware.starknet.services.api.contract_class.contract_class import EntryPointType
from starkware.starkware_utils.error_handling import StarkException, stark_assert_le


def execute_fee_transfer(
    general_config: StarknetGeneralConfig,
    state: SyncState,
    tx_execution_context: TransactionExecutionContext,
    actual_fee: int,
) -> CallInfo:
    """
    Transfers the amount actual_fee from the caller account to the sequencer.
    Returns the resulting CallInfo of the transfer call.
    """
    stark_assert_le(
        actual_fee,
        tx_execution_context.max_fee,
        code=StarknetErrorCode.FEE_TRANSFER_FAILURE,
        message="Actual fee exceeded max fee.",
    )

    fee_token_address = general_config.deprecated_fee_token_address
    fee_transfer_call = ExecuteEntryPoint.create(
        caller_address=tx_execution_context.account_contract_address,
        contract_address=fee_token_address,
        entry_point_selector=starknet_abi.TRANSFER_ENTRY_POINT_SELECTOR,
        initial_gas=GasCost.INITIAL.value,
        entry_point_type=EntryPointType.EXTERNAL,
        calldata=[general_config.sequencer_address, actual_fee, 0],  # Recipient, amount (128-bit).
    )
    try:
        fee_transfer_info = fee_transfer_call.execute(
            state=state,
            resources_manager=ExecutionResourcesManager.empty(),
            general_config=general_config,
            tx_execution_context=tx_execution_context,
        )
    except StarkException as exception:
        raise StarkException(
            code=StarknetErrorCode.FEE_TRANSFER_FAILURE, message=str(exception)
        ) from exception

    return fee_transfer_info


def calculate_l1_gas_by_cairo_usage(
    cairo_resource_fee_weights: Mapping[str, float],
    cairo_resource_usage: ResourcesMapping,
) -> float:
    """
    Calculates the L1 gas consumed when submitting the underlying Cairo program to SHARP.
    I.e., returns the heaviest Cairo resource weight (in terms of L1 gas), as the size of
    a proof is determined similarly - by the (normalized) largest segment.
    """
    cairo_resource_names = set(cairo_resource_usage.keys())
    assert cairo_resource_names.issubset(
        cairo_resource_fee_weights.keys()
    ), "Cairo resource names must be contained in fee weights dict."

    # Convert Cairo usage to L1 gas usage.
    cairo_l1_gas_usage = max(
        cairo_resource_fee_weights[key] * cairo_resource_usage.get(key, 0)
        for key in cairo_resource_fee_weights
    )

    return cairo_l1_gas_usage


def calculate_tx_fee(resources: ResourcesMapping, l1_gas_price: int) -> int:
    """
    Calculates the fee of a transaction given its execution resources.
    We add the l1_gas_usage (which may include, for example, the direct cost of L2-to-L1
    messages) to the gas consumed by Cairo resource and multiply by the L1 gas price.
    """
    l1_gas_usage, cairo_resource_usage = extract_l1_gas_and_cairo_usage(resources=resources)
    l1_gas_by_cairo_usage = calculate_l1_gas_by_cairo_usage(
        cairo_resource_fee_weights=VERSIONED_CONSTANTS.cairo_resource_fee_weights,
        cairo_resource_usage=cairo_resource_usage,
    )
    total_l1_gas_usage = l1_gas_usage + l1_gas_by_cairo_usage
    return math.ceil(total_l1_gas_usage) * l1_gas_price
