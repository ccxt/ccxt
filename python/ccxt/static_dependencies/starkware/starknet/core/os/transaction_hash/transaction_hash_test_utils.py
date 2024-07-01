from typing import List, Optional

from starkware.cairo.common.cairo_function_runner import CairoFunctionRunner
from starkware.cairo.common.structs import CairoStructFactory
from starkware.cairo.lang.compiler.program import Program
from starkware.cairo.lang.vm.crypto import poseidon_hash_many
from starkware.starknet.core.os.os_program import get_os_program
from starkware.starknet.core.os.transaction_hash.deprecated_transaction_hash import (
    TransactionHashPrefix,
)
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.fields import Resource, ResourceBoundsMapping
from starkware.starknet.definitions.general_config import STARKNET_LAYOUT_INSTANCE
from starkware.starknet.public.abi import EXECUTE_ENTRY_POINT_SELECTOR

CAIRO_TX_HASH_PATH = "starkware.starknet.core.os.transaction_hash.transaction_hash"


def hash_fee_related_fields(tip: int, resource_bounds: ResourceBoundsMapping) -> List[int]:
    fee_fields_hash_list = [tip]
    resource_value_offset = constants.MAX_AMOUNT_BITS + constants.MAX_PRICE_PER_UNIT_BITS

    for resource in (Resource.L1_GAS, Resource.L2_GAS):
        bounds = resource_bounds[resource]
        fee_fields_hash_list += [
            (resource.value << resource_value_offset)
            + (bounds.max_amount << constants.MAX_PRICE_PER_UNIT_BITS)
            + bounds.max_price_per_unit,
        ]

    return poseidon_hash_many(array=fee_fields_hash_list)


def create_common_tx_fields(
    program: Program,
    tx_hash_prefix: int,
    version: int,
    sender_address: int,
    chain_id: int,
    nonce: int,
    max_fee: int,
    n_resource_bounds: int = 0,
    resource_bounds: Optional[List[int]] = None,
):
    """
    Creates the common transaction fields struct used in the transaction hash calculation.
    """
    structs = CairoStructFactory.from_program(
        program,
        additional_imports=[
            "starkware.starknet.core.os.transaction_hash.transaction_hash.CommonTxFields",
        ],
    ).structs

    return structs.CommonTxFields(
        tx_hash_prefix=tx_hash_prefix,
        version=version,
        sender_address=sender_address,
        max_fee=max_fee,
        chain_id=chain_id,
        nonce=nonce,
        tip=0,
        n_resource_bounds=n_resource_bounds,
        resource_bounds=resource_bounds if resource_bounds is not None else [],
        paymaster_data_length=0,
        paymaster_data=[],
        nonce_data_availability_mode=0,
        fee_data_availability_mode=0,
    )


def create_execution_context(
    program: Program, contract_address: int, calldata: List[int], selector: int = 0
):
    """
    Creates an execution context containing only the necessary fields for the transaction hash
    calculation.
    """
    structs = CairoStructFactory.from_program(
        program,
        additional_imports=[
            "starkware.starknet.core.os.execution.execute_entry_point.ExecutionContext",
            "starkware.starknet.common.new_syscalls.ExecutionInfo",
        ],
    ).structs

    execution_info = structs.ExecutionInfo(
        block_info=0,
        tx_info=0,
        caller_address=0,
        contract_address=contract_address,
        selector=selector,
    )

    return structs.ExecutionContext(
        entry_point_type=0,
        class_hash=0,
        calldata_size=len(calldata),
        calldata=calldata,
        execution_info=execution_info,
        deprecated_tx_info=0,
    )


def run_cairo_invoke_transaction_hash(
    version: int,
    sender_address: int,
    calldata: List[int],
    chain_id: int,
    nonce: int,
    max_fee: int = 0,
    n_resource_bounds: int = 0,
    resource_bounds: Optional[List[int]] = None,
) -> int:
    program = get_os_program()
    runner = CairoFunctionRunner(program, layout=STARKNET_LAYOUT_INSTANCE)

    runner.run(
        func_name=f"{CAIRO_TX_HASH_PATH}.compute_invoke_transaction_hash",
        range_check_ptr=runner.range_check_builtin.base,
        pedersen_ptr=runner.pedersen_builtin.base,
        poseidon_ptr=runner.poseidon_builtin.base,
        common_fields=create_common_tx_fields(
            program=program,
            tx_hash_prefix=TransactionHashPrefix.INVOKE.value,
            version=version,
            sender_address=sender_address,
            chain_id=chain_id,
            nonce=nonce,
            max_fee=max_fee,
            n_resource_bounds=n_resource_bounds,
            resource_bounds=resource_bounds,
        ),
        execution_context=create_execution_context(
            program=program,
            contract_address=sender_address,
            calldata=calldata,
            selector=EXECUTE_ENTRY_POINT_SELECTOR,
        ),
        account_deployment_data_size=0,
        account_deployment_data=0,
        use_full_name=True,
        verify_secure=False,
    )
    (class_hash,) = runner.get_return_values(1)

    return class_hash


def run_cairo_l1_handler_transaction_hash(
    contract_address: int,
    entry_point_selector: int,
    calldata: List[int],
    chain_id: int,
    nonce: int,
) -> int:
    program = get_os_program()
    runner = CairoFunctionRunner(program, layout=STARKNET_LAYOUT_INSTANCE)

    runner.run(
        func_name=f"{CAIRO_TX_HASH_PATH}.compute_l1_handler_transaction_hash",
        pedersen_ptr=runner.pedersen_builtin.base,
        execution_context=create_execution_context(
            program=program,
            contract_address=contract_address,
            calldata=calldata,
            selector=entry_point_selector,
        ),
        chain_id=chain_id,
        nonce=nonce,
        use_full_name=True,
        verify_secure=False,
    )
    (class_hash,) = runner.get_return_values(1)

    return class_hash


def run_cairo_deploy_account_transaction_hash(
    version: int,
    contract_address: int,
    calldata: List[int],
    chain_id: int,
    nonce: int,
    max_fee: int = 0,
    n_resource_bounds: int = 0,
    resource_bounds: Optional[List[int]] = None,
) -> int:
    program = get_os_program()
    runner = CairoFunctionRunner(program, layout=STARKNET_LAYOUT_INSTANCE)

    runner.run(
        func_name=f"{CAIRO_TX_HASH_PATH}.compute_deploy_account_transaction_hash",
        range_check_ptr=runner.range_check_builtin.base,
        pedersen_ptr=runner.pedersen_builtin.base,
        poseidon_ptr=runner.poseidon_builtin.base,
        common_fields=create_common_tx_fields(
            program=program,
            tx_hash_prefix=TransactionHashPrefix.DEPLOY_ACCOUNT.value,
            version=version,
            sender_address=contract_address,
            chain_id=chain_id,
            nonce=nonce,
            max_fee=max_fee,
            n_resource_bounds=n_resource_bounds,
            resource_bounds=resource_bounds,
        ),
        calldata_size=len(calldata),
        calldata=calldata,
        use_full_name=True,
        verify_secure=False,
    )
    (class_hash,) = runner.get_return_values(1)

    return class_hash


def run_cairo_declare_transaction_hash(
    class_hash: int,
    version: int,
    sender_address: int,
    chain_id: int,
    nonce: int,
    max_fee: int = 0,
    compiled_class_hash: Optional[int] = None,
    n_resource_bounds: int = 0,
    resource_bounds: Optional[List[int]] = None,
) -> int:
    program = get_os_program()
    runner = CairoFunctionRunner(program, layout=STARKNET_LAYOUT_INSTANCE)

    runner.run(
        func_name=f"{CAIRO_TX_HASH_PATH}.compute_declare_transaction_hash",
        range_check_ptr=runner.range_check_builtin.base,
        pedersen_ptr=runner.pedersen_builtin.base,
        poseidon_ptr=runner.poseidon_builtin.base,
        common_fields=create_common_tx_fields(
            program=program,
            tx_hash_prefix=TransactionHashPrefix.DECLARE.value,
            version=version,
            sender_address=sender_address,
            chain_id=chain_id,
            nonce=nonce,
            max_fee=max_fee,
            n_resource_bounds=n_resource_bounds,
            resource_bounds=resource_bounds,
        ),
        execution_context=create_execution_context(
            program=program,
            contract_address=sender_address,
            calldata=[class_hash],
        ),
        compiled_class_hash=0 if compiled_class_hash is None else compiled_class_hash,
        account_deployment_data_size=0,
        account_deployment_data=0,
        use_full_name=True,
        verify_secure=False,
    )
    (class_hash,) = runner.get_return_values(1)

    return class_hash


def run_cairo_transaction_hash(
    tx_hash_prefix: TransactionHashPrefix,
    version: int,
    contract_address: int,
    entry_point_selector: int,
    calldata: List[int],
    max_fee: int,
    chain_id: int,
    additional_data: List[int],
) -> int:
    program = get_os_program()
    runner = CairoFunctionRunner(program, layout=STARKNET_LAYOUT_INSTANCE)

    runner.run(
        func_name=f"{CAIRO_TX_HASH_PATH}.deprecated_get_transaction_hash",
        hash_ptr=runner.pedersen_builtin.base,
        tx_hash_prefix=tx_hash_prefix.value,
        version=version,
        contract_address=contract_address,
        entry_point_selector=entry_point_selector,
        calldata_size=len(calldata),
        calldata=calldata,
        max_fee=max_fee,
        chain_id=chain_id,
        additional_data_size=len(additional_data),
        additional_data=additional_data,
        use_full_name=True,
        verify_secure=False,
    )
    pedersen_ptr, class_hash = runner.get_return_values(2)

    assert pedersen_ptr == runner.pedersen_builtin.base + (
        runner.pedersen_builtin.cells_per_instance * (9 + len(calldata) + len(additional_data))
    )
    return class_hash
