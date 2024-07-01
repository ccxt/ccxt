#!/usr/bin/env python3

import argparse
import asyncio
import json
import os
import sys
import traceback
from typing import Awaitable, Callable, Dict, List, Optional, Tuple

from eth_utils import from_wei

from starkware.cairo.lang.compiler.program import Program
from starkware.cairo.lang.version import __version__
from starkware.cairo.lang.vm.crypto import get_crypto_lib_context_manager
from starkware.python.utils import as_non_optional
from starkware.starknet.cli.reconstruct_starknet_traceback import reconstruct_starknet_traceback
from starkware.starknet.cli.starknet_cli_utils import (
    LIBFUNC_LIST_FILES,
    AbiFormatError,
    DeclareArgs,
    InvokeFunctionArgs,
    NetworkData,
    NetworkNameError,
    OldDeclareArgs,
    compute_max_fee_for_tx,
    construct_deprecated_declare_tx,
    construct_deprecated_deploy_account_tx,
    construct_deprecated_invoke_tx,
    construct_deprecated_invoke_tx_for_deploy,
    construct_feeder_gateway_client,
    construct_gateway_client,
    construct_nonce_callback,
    construct_old_declare_tx,
    create_call_function,
    create_call_l1_handler,
    get_chain_id_from_str,
    load_account,
    parse_block_identifiers,
    simulate_tx_at_block,
    simulate_tx_at_pending_block,
    tx_received,
)
from starkware.starknet.core.os.contract_class.compiled_class_hash import (
    compute_compiled_class_hash,
)
from starkware.starknet.definitions import fields
from starkware.starknet.definitions.chain_ids import StarknetChainId
from starkware.starknet.definitions.general_config import StarknetGeneralConfig
from starkware.starknet.public.abi import AbiType
from starkware.starknet.services.api.contract_class.contract_class import DeprecatedCompiledClass
from starkware.starknet.services.api.contract_class.contract_class_utils import (
    compile_contract_class,
    load_sierra_from_dict,
)
from starkware.starknet.services.api.feeder_gateway.feeder_gateway_client import FeederGatewayClient
from starkware.starknet.services.api.feeder_gateway.request_objects import (
    CallFunction,
    CallL1Handler,
)
from starkware.starknet.services.api.feeder_gateway.response_objects import (
    LATEST_BLOCK_ID,
    FeeEstimationInfo,
    TransactionSimulationInfo,
)
from starkware.starknet.services.api.gateway.deprecated_transaction import (
    DeprecatedAccountTransaction,
    DeprecatedDeclare,
    DeprecatedDeployAccount,
    DeprecatedInvokeFunction,
    DeprecatedOldDeclare,
)
from starkware.starknet.services.api.gateway.gateway_client import GatewayClient
from starkware.starknet.services.api.gateway.transaction_schema import DeprecatedTransactionSchema
from starkware.starknet.utils.api_utils import cast_to_felts
from starkware.starknet.wallets.account import DEFAULT_ACCOUNT_DIR, Account
from starkware.starknet.wallets.starknet_context import StarknetContext

# API functions.


async def declare(args: argparse.Namespace, command_args: List[str]):
    """
    If the `--deprecated` flag is used, creates a version 1 - declare transaction (which is used
    to declare Cairo 0 contracts) and sends it to the gateway. If the `--deprecated` flag is not
    used, creates a version 2 - declare transaction (which is used to declare Cairo 1.0 contracts)
    and sends it to the gateway. In case a wallet is provided, the transaction is wrapped and signed
    by the wallet provider. Otherwise, a sender address and a valid signature must be provided as
    arguments.
    """

    parser = argparse.ArgumentParser(description="Sends a declare transaction to StarkNet.")
    add_declare_tx_arguments(parser=parser)
    parser.parse_args(command_args, namespace=args)
    if args.deprecated:
        assert (
            args.compiler_args is None and args.compiler_dir is None
        ), "compiler_args and compiler_dir are not supported for deprecated declare."
        await deprecated_declare(args=args)
        return

    has_wallet = get_wallet_provider(args=args) is not None
    declare_tx_args = parse_declare_tx_args(args=args)

    declare_tx_for_simulate: Optional[DeprecatedDeclare] = None
    if need_simulate_tx(args=args, has_wallet=has_wallet):
        declare_tx_for_simulate = await create_deprecated_declare_tx(
            args=args,
            declare_tx_args=declare_tx_args,
            max_fee=args.max_fee if args.max_fee is not None else 0,
            has_wallet=has_wallet,
            query=True,
        )
        if args.simulate or args.estimate_fee:
            await simulate_or_estimate_fee(args=args, tx=declare_tx_for_simulate)
            return

    max_fee = await compute_max_fee(
        args=args,
        tx=declare_tx_for_simulate,
        has_wallet=has_wallet,
        skip_validate=args.skip_validate,
    )

    tx = await create_deprecated_declare_tx(
        args=args,
        declare_tx_args=declare_tx_args,
        max_fee=max_fee,
        has_wallet=has_wallet,
        query=False,
    )
    gateway_client = get_gateway_client(args)
    gateway_response = await gateway_client.add_transaction(tx=tx)
    assert_tx_received(gateway_response=gateway_response)
    # Don't end sentences with '.', to allow easy double-click copy-pasting of the values.
    print(
        f"""\
Declare transaction was sent.
Contract class hash: {gateway_response['class_hash']}
Transaction hash: {gateway_response['transaction_hash']}"""
    )


async def deprecated_declare(args: argparse.Namespace):
    """
    Creates an old declare transaction and sends it to the gateway. In case a wallet is
    provided, the transaction is wrapped and signed by the wallet provider. Otherwise, a sender
    address and a valid signature must be provided as arguments.
    """

    declare_tx_args = parse_old_declare_tx_args(args=args)
    has_wallet = get_wallet_provider(args=args) is not None

    declare_tx_for_simulate: Optional[DeprecatedOldDeclare] = None
    if need_simulate_tx(args=args, has_wallet=has_wallet):
        declare_tx_for_simulate = await create_old_declare_tx(
            args=args,
            declare_tx_args=declare_tx_args,
            max_fee=args.max_fee if args.max_fee is not None else 0,
            has_wallet=has_wallet,
            query=True,
        )
        if args.simulate or args.estimate_fee:
            await simulate_or_estimate_fee(args=args, tx=declare_tx_for_simulate)
            return

    max_fee = await compute_max_fee(
        args=args,
        tx=declare_tx_for_simulate,
        has_wallet=has_wallet,
        skip_validate=args.skip_validate,
    )

    tx = await create_old_declare_tx(
        args=args,
        declare_tx_args=declare_tx_args,
        max_fee=max_fee,
        has_wallet=has_wallet,
        query=False,
    )
    gateway_client = get_gateway_client(args)
    gateway_response = await gateway_client.add_transaction(tx=tx)
    assert_tx_received(gateway_response=gateway_response)
    # Don't end sentences with '.', to allow easy double-click copy-pasting of the values.
    print(
        f"""\
DeprecatedDeclare transaction was sent.
Contract class hash: {gateway_response['class_hash']}
Transaction hash: {gateway_response['transaction_hash']}"""
    )


async def deploy(args, command_args):
    parser = argparse.ArgumentParser(description="Deploys a contract to StarkNet.")
    parser.add_argument(
        "--salt",
        type=str,
        help=(
            "An optional salt controlling where the contract will be deployed. "
            "The contract deployment address is determined by the hash "
            "of contract, salt and caller. "
            "If the salt is not supplied, the contract will be deployed with a random salt."
        ),
    )
    parser.add_argument(
        "--inputs", type=str, nargs="*", default=[], help="The inputs to the constructor."
    )
    parser.add_argument(
        "--class_hash", type=str, help="The class hash of the deployed contract.", required=True
    )
    parser.add_argument(
        "--nonce",
        type=int,
        help=(
            "Used for explicitly specifying the transaction nonce. "
            "If not specified, the current nonce of the account contract "
            "(as returned from StarkNet) will be used."
        ),
    )
    parser.add_argument(
        "--max_fee", type=int, help="The maximal fee to be paid for the deployment."
    )
    parser.add_argument(
        "--deploy_from_zero",
        action="store_true",
        help="Use 0 instead of the deployer address for the contract address computation.",
    )
    parser.parse_args(command_args, namespace=args)

    assert (
        get_wallet_provider(args=args) is not None
    ), "You must provide a wallet when deploying a contract."

    await deploy_with_invoke(args=args)


async def deploy_with_invoke(args: argparse.Namespace):
    salt = get_salt(salt=args.salt)
    class_hash = parse_hex_arg(arg=args.class_hash, arg_name="class_hash")
    constructor_calldata = cast_to_felts(values=args.inputs)
    invoke_tx_for_fee_estimation, _ = await create_deprecated_invoke_tx_for_deploy(
        args=args,
        salt=salt,
        class_hash=class_hash,
        constructor_calldata=constructor_calldata,
        max_fee=0,
        call=True,
    )
    max_fee = await compute_max_fee(
        args=args, tx=invoke_tx_for_fee_estimation, has_wallet=True, skip_validate=False
    )
    tx, contract_address = await create_deprecated_invoke_tx_for_deploy(
        args=args,
        salt=salt,
        class_hash=class_hash,
        constructor_calldata=constructor_calldata,
        max_fee=max_fee,
        call=False,
    )

    gateway_client = get_gateway_client(args)
    gateway_response = await gateway_client.add_transaction(tx=tx)
    assert_tx_received(gateway_response=gateway_response)
    # Don't end sentences with '.', to allow easy double-click copy-pasting of the values.
    print(
        f"""\
Invoke transaction for contract deployment was sent.
Contract address: 0x{contract_address:064x}
Transaction hash: {gateway_response['transaction_hash']}"""
    )


async def new_account(args, command_args):
    parser = argparse.ArgumentParser(description="Initializes an account contract.")
    # Use parse_args to add the --help flag for the subcommand.
    parser.parse_args(command_args, namespace=args)
    account = await load_account_from_args(args)
    account.new_account()


async def deploy_account(args: argparse.Namespace, command_args: List[str]):
    parser = argparse.ArgumentParser(
        description=(
            "Deploys an initialized account contract to StarkNet. "
            "For more information, see new_account."
        )
    )
    add_deploy_account_tx_arguments(parser=parser)
    # Use parse_args to add the --help flag for the subcommand.
    parser.parse_args(command_args, namespace=args)
    validate_max_fee(max_fee=args.max_fee)
    account = await load_account_from_args(args)

    deploy_account_tx_for_simulate: Optional[DeprecatedDeployAccount] = None
    if need_simulate_tx(args=args, has_wallet=True):
        deploy_account_tx_for_simulate, _ = await create_deprecated_deploy_account_tx(
            args=args,
            account=account,
            max_fee=args.max_fee if args.max_fee is not None else 0,
            query=True,
        )
        if args.simulate or args.estimate_fee:
            await simulate_or_estimate_fee(args=args, tx=deploy_account_tx_for_simulate)
            return

    max_fee = await compute_max_fee(
        args=args,
        tx=deploy_account_tx_for_simulate,
        has_wallet=True,
        skip_validate=args.skip_validate,
    )

    tx, contract_address = await create_deprecated_deploy_account_tx(
        args=args,
        account=account,
        max_fee=max_fee,
        query=False,
    )

    gateway_client = get_gateway_client(args)
    gateway_response = await gateway_client.add_transaction(tx=tx)
    assert_tx_received(gateway_response=gateway_response)
    # Verify the address received from the gateway.
    assert (actual_address := int(gateway_response["address"], 16)) == contract_address, (
        f"The address returned from the Gateway: 0x{actual_address:064x} "
        f"does not match the address stored in the account: 0x{contract_address:064x}. "
        "Are you using the correct version of the CLI?"
    )

    # Don't end sentences with '.', to allow easy double-click copy-pasting of the values.
    print(
        f"""\
Sent deploy account contract transaction.

Contract address: 0x{contract_address:064x}
Transaction hash: {gateway_response['transaction_hash']}
"""
    )


async def call(args: argparse.Namespace, command_args: List[str]):
    parser = argparse.ArgumentParser(description="Calls a function on a StarkNet contract.")
    add_call_function_arguments(parser=parser)
    add_block_identifier_arguments(
        parser=parser, block_role_description="be used as the context for the call operation"
    )
    parser.parse_args(command_args, namespace=args)
    call_function_args = parse_call_function_args(args=args)
    args.block_hash, args.block_number = parse_block_identifiers(args.block_hash, args.block_number)

    feeder_client = get_feeder_gateway_client(args)
    gateway_response = await feeder_client.call_contract(
        call_function=call_function_args, block_hash=args.block_hash, block_number=args.block_number
    )
    print(*map(fields.felt_formatter, gateway_response["result"]))


async def invoke(args: argparse.Namespace, command_args: List[str]):
    parser = argparse.ArgumentParser(description="Sends an invoke transaction to StarkNet.")
    add_invoke_tx_arguments(parser=parser)
    parser.parse_args(command_args, namespace=args)
    invoke_tx_args = parse_invoke_tx_args(args=args)

    has_wallet = get_wallet_provider(args=args) is not None
    invoke_tx_for_simulate: Optional[DeprecatedInvokeFunction] = None
    if need_simulate_tx(args=args, has_wallet=has_wallet):
        invoke_tx_for_simulate = await create_deprecated_invoke_tx(
            args=args,
            invoke_tx_args=invoke_tx_args,
            max_fee=args.max_fee if args.max_fee is not None else 0,
            has_wallet=has_wallet,
            query=True,
        )

        if args.simulate or args.estimate_fee:
            await simulate_or_estimate_fee(args=args, tx=invoke_tx_for_simulate)
            return

    if args.dry_run:
        assert has_wallet, "--dry_run can only be used for invocation through an account contract."

    max_fee = await compute_max_fee(
        args=args,
        tx=invoke_tx_for_simulate,
        has_wallet=has_wallet,
        skip_validate=args.skip_validate,
    )

    tx = await create_deprecated_invoke_tx(
        args=args,
        invoke_tx_args=invoke_tx_args,
        max_fee=max_fee,
        has_wallet=has_wallet,
        query=False,
    )
    if not args.dry_run:
        gateway_client = get_gateway_client(args)
        gateway_response = await gateway_client.add_transaction(tx=tx)
        assert_tx_received(gateway_response=gateway_response)
        # Don't end sentences with '.', to allow easy double-click copy-pasting of the values.
        print(
            f"""\
Invoke transaction was sent.
Contract address: 0x{invoke_tx_args.address:064x}
Transaction hash: {gateway_response['transaction_hash']}"""
        )
    else:
        print_invoke_tx(tx=tx, chain_id=get_chain_id(args))


async def estimate_message_fee(args: argparse.Namespace, command_args: List[str]):
    parser = argparse.ArgumentParser(description="Estimates the fee of an L1-to-L2 message.")
    add_block_identifier_arguments(
        parser=parser, block_role_description="be used as the context for the call operation"
    )
    add_call_l1_handler_arguments(parser=parser)

    parser.parse_args(command_args, namespace=args)
    args.block_hash, args.block_number = parse_block_identifiers(args.block_hash, args.block_number)
    call_l1_handler = parse_call_l1_handler_args(args=args)

    feeder_client = get_feeder_gateway_client(args=args)
    fee_info = await feeder_client.estimate_message_fee(
        call_l1_handler=call_l1_handler, block_hash=args.block_hash, block_number=args.block_number
    )

    print_fee_info(fee_info=fee_info)


async def tx_status(args, command_args):
    parser = argparse.ArgumentParser(
        description="Queries the status of a transaction given its hash."
    )
    parser.add_argument(
        "--hash", type=str, required=True, help="The hash of the transaction to query."
    )
    parser.add_argument(
        "--contracts",
        type=str,
        required=False,
        help=(
            "Optional paths to compiled contracts with debug information. "
            "If given, the contracts will be used to add location information to errors. "
            "Format: '<addr>:<path.json>,<addr2>:<path2.json>'. "
            "If '<addr>:' is omitted, the path refers to the original contract that was called "
            "(usually, the account contract)."
        ),
    )
    parser.add_argument(
        "--error_message", action="store_true", help="Only print the error message."
    )
    parser.parse_args(command_args, namespace=args)

    feeder_gateway_client = get_feeder_gateway_client(args)
    tx_status_response = await feeder_gateway_client.get_transaction_status(tx_hash=args.hash)

    # Print the error message with reconstructed location information in traceback, if necessary.
    execution_status: str = tx_status_response["execution_status"]
    has_error_message = (
        execution_status == "REJECTED"
        and "tx_failure_reason" in tx_status_response
        and "error_message" in tx_status_response["tx_failure_reason"]
    ) or (execution_status == "REVERTED" and "tx_revert_reason" in tx_status_response)
    error_message: str = ""
    if has_error_message:
        error_message = (
            tx_status_response["tx_failure_reason"]["error_message"]
            if execution_status == "REJECTED"
            else tx_status_response["tx_revert_reason"]
        )
        error_message = error_message.replace(" \n ", "\n")
        if args.contracts is not None:
            contracts: Dict[Optional[int], Program] = {}
            for addr_and_path in args.contracts.split(","):
                addr_and_path_split = addr_and_path.split(":")
                if len(addr_and_path_split) == 1:
                    addr, path = None, addr_and_path_split[0]
                else:
                    addr_str, path = addr_and_path_split
                    addr = parse_hex_arg(arg=addr_str, arg_name="address")
                contracts[addr] = Program.load(data=json.load(open(path.strip()))["program"])
            error_message = reconstruct_starknet_traceback(
                contracts=contracts, traceback_txt=error_message
            )
            if execution_status == "REJECTED":
                tx_status_response["tx_failure_reason"]["error_message"] = error_message
            else:
                tx_status_response["tx_revert_reason"] = error_message

    if args.error_message:
        print(error_message)
    else:
        print(json.dumps(tx_status_response, indent=4, sort_keys=True))


async def get_transaction(args, command_args):
    parser = argparse.ArgumentParser(
        description="Outputs the transaction information given its hash."
    )
    parser.add_argument(
        "--hash", type=str, required=True, help="The hash of the transaction to query."
    )
    parser.parse_args(command_args, namespace=args)

    feeder_gateway_client = get_feeder_gateway_client(args)
    tx_info = await feeder_gateway_client.get_transaction(tx_hash=args.hash)
    print(tx_info.dumps(indent=4, sort_keys=True))


async def get_transaction_trace(args, command_args):
    parser = argparse.ArgumentParser(description="Outputs the transaction trace given its hash.")
    parser.add_argument(
        "--hash", type=str, required=True, help="The hash of the transaction to query."
    )
    parser.parse_args(command_args, namespace=args)

    feeder_gateway_client = get_feeder_gateway_client(args)
    tx_trace = await feeder_gateway_client.get_transaction_trace(tx_hash=args.hash)
    print(tx_trace.dumps(indent=4, sort_keys=True))


async def get_transaction_receipt(args, command_args):
    parser = argparse.ArgumentParser(description="Outputs the transaction receipt given its hash.")
    parser.add_argument(
        "--hash", type=str, required=True, help="The hash of the transaction to query."
    )
    parser.parse_args(command_args, namespace=args)

    feeder_gateway_client = get_feeder_gateway_client(args)
    tx_receipt = await feeder_gateway_client.get_transaction_receipt(tx_hash=args.hash)
    print(tx_receipt.dumps(indent=4, sort_keys=True))


async def get_block(args, command_args):
    parser = argparse.ArgumentParser(
        description=(
            "Outputs the block corresponding to the given identifier (hash or number). "
            "In case no identifier is given, outputs the pending block."
        )
    )
    add_block_identifier_arguments(
        parser=parser, block_role_description="display", with_block_prefix=False
    )

    parser.parse_args(command_args, namespace=args)
    args.hash, args.number = parse_block_identifiers(args.hash, args.number)

    feeder_gateway_client = get_feeder_gateway_client(args)
    block = await feeder_gateway_client.get_block(block_hash=args.hash, block_number=args.number)
    print(block.dumps(indent=4, sort_keys=True))


async def get_block_traces(args, command_args):
    parser = argparse.ArgumentParser(
        description=(
            "Outputs the transaction traces of the block corresponding to the given identifier "
            "(hash or number)."
        )
    )
    add_block_identifier_arguments(
        parser=parser,
        block_role_description="display",
        with_block_prefix=False,
    )

    parser.parse_args(command_args, namespace=args)
    args.hash, args.number = parse_block_identifiers(
        block_hash=args.hash, block_number=args.number, default_block_number=LATEST_BLOCK_ID
    )

    feeder_gateway_client = get_feeder_gateway_client(args)
    block_traces = await feeder_gateway_client.get_block_traces(
        block_hash=args.hash, block_number=args.number
    )
    print(block_traces.dumps(indent=4, sort_keys=True))


async def get_state_update(args, command_args):
    parser = argparse.ArgumentParser(description=("Outputs the state update of a given block"))
    add_block_identifier_arguments(parser=parser, block_role_description="display")

    parser.parse_args(command_args, namespace=args)
    args.block_hash, args.block_number = parse_block_identifiers(
        block_hash=args.block_hash,
        block_number=args.block_number,
        default_block_number=LATEST_BLOCK_ID,
    )

    feeder_gateway_client = get_feeder_gateway_client(args)
    block_state_updates = await feeder_gateway_client.get_state_update(
        block_hash=args.block_hash, block_number=args.block_number
    )
    print(json.dumps(block_state_updates, indent=4, sort_keys=True))


async def get_code(args, command_args):
    parser = argparse.ArgumentParser(
        description=(
            "Outputs the bytecode of the contract at the given address with respect to "
            "a specific block. In case no block identifier is given, uses the pending block."
        )
    )
    parser.add_argument(
        "--contract_address", type=str, help="The address of the contract.", required=True
    )
    add_block_identifier_arguments(parser=parser, block_role_description="extract information from")

    parser.parse_args(command_args, namespace=args)
    args.block_hash, args.block_number = parse_block_identifiers(args.block_hash, args.block_number)

    feeder_gateway_client = get_feeder_gateway_client(args)
    code = await feeder_gateway_client.get_code(
        contract_address=parse_hex_arg(arg=args.contract_address, arg_name="contract address"),
        block_hash=args.block_hash,
        block_number=args.block_number,
    )
    print(json.dumps(code, indent=4, sort_keys=True))


async def get_class_by_hash(args, command_args):
    parser = argparse.ArgumentParser(
        description="Outputs the contract class of the class with the given hash."
    )
    parser.add_argument(
        "--class_hash", type=str, help="The hash of the desired class.", required=True
    )

    parser.parse_args(command_args, namespace=args)

    feeder_gateway_client = get_feeder_gateway_client(args)
    contract_class = await feeder_gateway_client.get_class_by_hash(class_hash=args.class_hash)
    print(json.dumps(contract_class, indent=4, sort_keys=True))


async def get_full_contract(args, command_args):
    parser = argparse.ArgumentParser(
        description=(
            "Outputs the contract class of the contract at the given address with respect to "
            "a specific block. In case no block identifier is given, uses the pending block."
        )
    )
    parser.add_argument(
        "--contract_address", type=str, help="The address of the contract.", required=True
    )
    add_block_identifier_arguments(parser=parser, block_role_description="extract information from")

    parser.parse_args(command_args, namespace=args)
    args.block_hash, args.block_number = parse_block_identifiers(args.block_hash, args.block_number)

    feeder_gateway_client = get_feeder_gateway_client(args)
    contract_class = await feeder_gateway_client.get_full_contract(
        contract_address=parse_hex_arg(arg=args.contract_address, arg_name="contract address"),
        block_hash=args.block_hash,
        block_number=args.block_number,
    )
    print(json.dumps(contract_class, indent=4, sort_keys=True))


async def get_class_hash_at(args, command_args):
    parser = argparse.ArgumentParser(
        description=(
            "Outputs the class hash of the contract at the given address with respect to "
            "a specific block. In case no block identifier is given, uses the pending block."
        )
    )
    parser.add_argument(
        "--contract_address", type=str, help="The address of the contract.", required=True
    )
    add_block_identifier_arguments(parser=parser, block_role_description="extract information from")

    parser.parse_args(command_args, namespace=args)
    args.block_hash, args.block_number = parse_block_identifiers(args.block_hash, args.block_number)

    feeder_gateway_client = get_feeder_gateway_client(args)
    class_hash = await feeder_gateway_client.get_class_hash_at(
        contract_address=parse_hex_arg(arg=args.contract_address, arg_name="contract address"),
        block_hash=args.block_hash,
        block_number=args.block_number,
    )
    print(class_hash)


async def get_contract_addresses(args, command_args):
    argparse.ArgumentParser(description="Outputs the addresses of the StarkNet system contracts.")

    feeder_gateway_client = get_feeder_gateway_client(args)
    contract_addresses = await feeder_gateway_client.get_contract_addresses()
    print(json.dumps(contract_addresses, indent=4, sort_keys=True))


async def get_nonce(args, command_args):
    parser = argparse.ArgumentParser(
        description=(
            "Outputs the nonce of a contract with respect to a specific block. "
            "In case no block identifier is given, uses the pending block."
        )
    )
    parser.add_argument(
        "--contract_address", type=str, help="The address of the contract.", required=True
    )
    add_block_identifier_arguments(parser=parser, block_role_description="extract information from")

    parser.parse_args(command_args, namespace=args)
    args.block_hash, args.block_number = parse_block_identifiers(args.block_hash, args.block_number)

    feeder_gateway_client = get_feeder_gateway_client(args)
    nonce = await feeder_gateway_client.get_nonce(
        contract_address=parse_hex_arg(args.contract_address, "contract_address"),
        block_hash=args.block_hash,
        block_number=args.block_number,
    )
    print(nonce)


async def get_storage_at(args, command_args):
    parser = argparse.ArgumentParser(
        description=(
            "Outputs the storage value of a contract in a specific key with respect to "
            "a specific block. In case no block identifier is given, uses the pending block."
        )
    )
    parser.add_argument(
        "--contract_address", type=str, help="The address of the contract.", required=True
    )
    parser.add_argument(
        "--key", type=int, help="The position in the contract's storage.", required=True
    )
    add_block_identifier_arguments(parser=parser, block_role_description="extract information from")

    parser.parse_args(command_args, namespace=args)
    args.block_hash, args.block_number = parse_block_identifiers(args.block_hash, args.block_number)

    feeder_gateway_client = get_feeder_gateway_client(args)
    print(
        await feeder_gateway_client.get_storage_at(
            contract_address=parse_hex_arg(arg=args.contract_address, arg_name="contract address"),
            key=args.key,
            block_hash=args.block_hash,
            block_number=args.block_number,
        )
    )


# Utilities.


def load_abi(args) -> Optional[AbiType]:
    """
    Raises an error if ABI fails to load. Returns None if ABI doesn't exist.
    """
    try:
        return None if args.abi is None else json.load(args.abi)
    except Exception as ex:
        raise AbiFormatError(ex) from ex


def get_optional_arg_value(args, arg_name: str, environment_var: str) -> Optional[str]:
    """
    Returns the value of the given argument from args. If the argument was not specified, returns
    the value of the environment variable.
    """
    arg_value = getattr(args, arg_name)
    if arg_value is not None:
        return arg_value
    return os.environ.get(environment_var)


def get_arg_value(args, arg_name: str, environment_var: str) -> str:
    """
    Same as get_optional_arg_value, except that if the value is not defined, an exception is
    raised.
    """
    value = get_optional_arg_value(args=args, arg_name=arg_name, environment_var=environment_var)
    if value is None:
        raise Exception(
            f'{arg_name} must be specified with the "{args.command}" subcommand.\n'
            "Consider passing --network or setting the STARKNET_NETWORK environment variable."
        )
    return value


def get_chain_id(args) -> int:
    chain_id_str = get_arg_value(
        args=args, arg_name="chain_id", environment_var="STARKNET_CHAIN_ID"
    )
    return get_chain_id_from_str(chain_id_str=chain_id_str)


def get_network_id(args) -> str:
    """
    Returns a textual identifier of the network. Used for account management.
    By default this is the same as the network name (one of the keys of NETWORKS).
    """
    return get_arg_value(args=args, arg_name="network_id", environment_var="STARKNET_NETWORK_ID")


def get_wallet_provider(args) -> Optional[str]:
    """
    Returns the name of the wallet provider (of the form "module.class") as defined by the user.
    """
    value = get_optional_arg_value(args=args, arg_name="wallet", environment_var="STARKNET_WALLET")
    assert value is not None, (
        "A wallet must be specified (using --wallet or the STARKNET_WALLET environment variable), "
        "unless specifically using --no_wallet."
    )

    if value == "":
        # An empty string means no wallet should be used (direct contract call).
        return None
    return value


def get_compiler_dir(args) -> Optional[str]:
    """
    Returns the path to the directory containing the Cairo 1.0 compiler as defined by the user;
    If no directory was defined, None is returned and the default compiler should be used.
    """
    return get_optional_arg_value(
        args=args, arg_name="compiler_dir", environment_var="CAIRO_COMPILER_DIR"
    )


def get_compiler_args(args) -> Optional[str]:
    """
    Returns the compilation arguments used on a declare request of a Cairo 1.0 contract,
    if given by the user; otherwise returns None.
    """
    return get_optional_arg_value(
        args=args, arg_name="compiler_args", environment_var="CAIRO_COMPILER_ARGS"
    )


def allowed_libfuncs_list_file_from_network(args) -> Optional[str]:
    """
    Returns the name of the allowed libfunc list file corresponding to the network, if exists;
    otherwise return None.
    """
    network = get_network(args=args)
    if network is None:
        return None

    return LIBFUNC_LIST_FILES.get(network, None)


def get_account_dir(args) -> str:
    """
    Returns the directory containing the wallet files. By default, DEFAULT_ACCOUNT_DIR is used.
    """
    value = get_optional_arg_value(
        args=args, arg_name="account_dir", environment_var="STARKNET_ACCOUNT_DIR"
    )
    if value is None:
        return DEFAULT_ACCOUNT_DIR
    return value


def get_gateway_client(args) -> GatewayClient:
    gateway_url = get_arg_value(
        args=args, arg_name="gateway_url", environment_var="STARKNET_GATEWAY_URL"
    )
    return construct_gateway_client(gateway_url=gateway_url)


def get_feeder_gateway_client(args) -> FeederGatewayClient:
    feeder_gateway_url = get_arg_value(
        args=args, arg_name="feeder_gateway_url", environment_var="STARKNET_FEEDER_GATEWAY_URL"
    )
    return construct_feeder_gateway_client(feeder_gateway_url=feeder_gateway_url)


def get_starknet_context(args) -> StarknetContext:
    """
    Returns the StarknetContext object based on the CLI arguments.
    """
    return StarknetContext(network_id=get_network_id(args), account_dir=get_account_dir(args))


def get_network(args) -> Optional[str]:
    """
    Returns the StarkNet network, if specified. The network should be one of the keys in the
    NETWORKS dictionary.
    """
    return os.environ.get("STARKNET_NETWORK") if args.network is None else args.network


def parse_hex_arg(arg: str, arg_name: str) -> int:
    """
    Converts the given argument (hex string, starting with "0x") to an integer.
    """
    arg = arg.strip()
    assert arg.startswith("0x"), f"{arg_name} must start with '0x'. Got: '{arg}'."
    try:
        return int(arg, 16)
    except ValueError:
        raise ValueError(f"Invalid {arg_name} format: '{arg}'.") from None


def get_salt(salt: Optional[str]) -> int:
    """
    Validates the given salt and returns it as an integer.
    If salt is None, returns a random salt.
    """
    if salt is None:
        return fields.ContractAddressSalt.get_random_value()

    return parse_hex_arg(arg=salt, arg_name="salt")


def validate_max_fee(max_fee: Optional[int]):
    if max_fee is None:
        return
    assert max_fee >= 0, f"The 'max_fee' argument, --max_fee, must be non-negative, got {max_fee}."


async def compute_max_fee(
    args: argparse.Namespace,
    tx: Optional[DeprecatedAccountTransaction],
    has_wallet: bool,
    skip_validate: bool,
) -> int:
    """
    Returns max_fee argument if passed, and estimates and returns the max fee otherwise.
    """
    if args.max_fee is not None:
        validate_max_fee(max_fee=args.max_fee)
        return args.max_fee

    if has_wallet:
        max_fee = await compute_max_fee_for_tx(
            feeder_client=get_feeder_gateway_client(args),
            tx=as_non_optional(tx),
            skip_validate=skip_validate,
        )
        max_fee_eth = float(from_wei(number=max_fee, unit="ether"))

        print(f"Sending the transaction with max_fee: {max_fee_eth:.6f} ETH ({max_fee} WEI).")
    else:
        max_fee = 0

    return max_fee


def need_simulate_tx(args: argparse.Namespace, has_wallet: bool) -> bool:
    """
    Returns whether a simulate is required.
    If simulation was not requested, asserts that no other simulation related flags appear.
    """
    simulate_requested = args.simulate or args.estimate_fee
    if not simulate_requested:
        assert args.block_hash is None and args.block_number is None, (
            "--block_hash and --block_number should only be passed when either --simulate or "
            "--estimate_fee flag are used."
        )
        assert not args.skip_validate, (
            "--skip_validate should only be passed when either --simulate or "
            "--estimate_fee flag are used."
        )

    return (args.max_fee is None and has_wallet) or simulate_requested


async def load_account_from_args(args) -> Account:
    wallet = get_wallet_provider(args)
    assert wallet is not None, f'--wallet must be specified with the "{args.command}" subcommand.'
    return await load_account(
        starknet_context=get_starknet_context(args),
        wallet=wallet,
        account_name=args.account,
    )


def handle_network_param(args):
    """
    Gives default values to the gateways if the network parameter is set.
    """
    network = get_network(args)
    if network is not None:
        try:
            data = NetworkData.from_network_name(network=network)
        except NetworkNameError as error:
            print(str(error), file=sys.stderr)
            return 1

        if args.gateway_url is None:
            args.gateway_url = data.gateway_url
        if args.feeder_gateway_url is None:
            args.feeder_gateway_url = data.feeder_gateway_url
        if args.network_id is None:
            args.network_id = data.network_id
        if args.chain_id is None:
            args.chain_id = data.chain_id

    return 0


def parse_call_function_args(args: argparse.Namespace) -> CallFunction:
    """
    Parses the arguments and validates that the function name is in the ABI.
    """
    return create_call_function(
        contract_address=parse_hex_arg(arg=args.address, arg_name="address"),
        abi=load_abi(args=args),
        function_name=args.function,
        inputs=cast_to_felts(values=args.inputs),
    )


def parse_call_l1_handler_args(args: argparse.Namespace) -> CallL1Handler:
    """
    Parses the arguments and validates that the l1_handler name is in the ABI.
    """
    return create_call_l1_handler(
        abi=load_abi(args=args),
        handler_name=args.function,
        from_address=parse_hex_arg(arg=args.from_address, arg_name="from_address"),
        to_address=parse_hex_arg(arg=args.address, arg_name="address"),
        payload=cast_to_felts(values=args.inputs),
    )


def parse_invoke_tx_args(args: argparse.Namespace) -> InvokeFunctionArgs:
    validate_max_fee(max_fee=args.max_fee)
    return InvokeFunctionArgs.from_call_function(
        call_function=parse_call_function_args(args), signature=cast_to_felts(values=args.signature)
    )


def parse_declare_tx_args(args: argparse.Namespace) -> DeclareArgs:
    sender = parse_hex_arg(arg=args.sender, arg_name="sender") if args.sender is not None else None

    try:
        contract_class = load_sierra_from_dict(sierra=json.load(args.contract))
    except Exception as exception:
        raise ValueError(
            "Invalid Cairo 1.0 contract. "
            "To declare a Cairo 0 contract, pass '--deprecated'; "
            "to see the full traceback, pass '--show_trace'."
        ) from exception

    compiler_dir = get_compiler_dir(args=args)
    compiler_args = get_compiler_args(args=args)
    # The explicit compiler_args should override other specific compilation arguments.
    allowed_libfuncs_list_file = (
        allowed_libfuncs_list_file_from_network(args=args) if compiler_args is None else None
    )
    if compiler_args is None and allowed_libfuncs_list_file is None:
        print(
            "The network is unknown. "
            "The default list of allowed libfuncs will be used. "
            "To specify the network, pass '--network' "
            "or set the STARKNET_NETWORK environment variable.",
            file=sys.stderr,
        )

    compiled_class = compile_contract_class(
        contract_class=contract_class,
        compiler_dir=compiler_dir,
        compiler_args=compiler_args,
        allowed_libfuncs_list_file=allowed_libfuncs_list_file,
    )
    compiled_class_hash = compute_compiled_class_hash(compiled_class=compiled_class)

    return DeclareArgs(
        sender=sender,
        signature=cast_to_felts(values=args.signature),
        compiled_class_hash=compiled_class_hash,
        contract_class=contract_class,
    )


def parse_old_declare_tx_args(args: argparse.Namespace) -> OldDeclareArgs:
    validate_max_fee(max_fee=args.max_fee)
    sender = parse_hex_arg(arg=args.sender, arg_name="sender") if args.sender is not None else None
    return OldDeclareArgs(
        sender=sender,
        signature=cast_to_felts(values=args.signature),
        contract_class=DeprecatedCompiledClass.loads(data=args.contract.read()),
    )


async def create_deprecated_invoke_tx_for_deploy(
    args: argparse.Namespace,
    salt: int,
    class_hash: int,
    constructor_calldata: List[int],
    max_fee: int,
    call: bool,
) -> Tuple[DeprecatedInvokeFunction, int]:
    """
    Creates and returns an invoke transaction to deploy a contract with the given
    arguments, which is wrapped and signed by the wallet provider.
    """
    return await construct_deprecated_invoke_tx_for_deploy(
        feeder_client=get_feeder_gateway_client(args=args),
        account=await load_account_from_args(args=args),
        salt=salt,
        class_hash=class_hash,
        constructor_calldata=constructor_calldata,
        deploy_from_zero=args.deploy_from_zero,
        chain_id=get_chain_id(args),
        max_fee=max_fee,
        call=call,
        explicit_nonce=args.nonce,
    )


async def create_deprecated_invoke_tx(
    args: argparse.Namespace,
    invoke_tx_args: InvokeFunctionArgs,
    max_fee: int,
    has_wallet: bool,
    query: bool,
) -> DeprecatedInvokeFunction:
    """
    Creates and returns a deprecated invoke transaction with the given parameters.
    If a wallet provider was provided in args, that transaction will be wrapped and signed.
    """
    return await construct_deprecated_invoke_tx(
        feeder_client=get_feeder_gateway_client(args=args),
        invoke_tx_args=invoke_tx_args,
        chain_id=get_chain_id(args=args),
        max_fee=max_fee,
        account=await load_account_from_args(args=args) if has_wallet else None,
        explicit_nonce=args.nonce,
        simulate=query,
        dry_run=args.dry_run,
    )


async def create_deprecated_declare_tx(
    args: argparse.Namespace,
    declare_tx_args: DeclareArgs,
    max_fee: int,
    has_wallet: bool,
    query: bool,
) -> DeprecatedDeclare:
    """
    Creates and returns an old declare transaction with the given parameters.
    If a wallet provider was provided in args, that transaction will be wrapped and signed.
    """
    return await construct_deprecated_declare_tx(
        feeder_client=get_feeder_gateway_client(args=args),
        declare_tx_args=declare_tx_args,
        chain_id=get_chain_id(args=args),
        max_fee=max_fee,
        account=await load_account_from_args(args=args) if has_wallet else None,
        explicit_nonce=args.nonce,
        simulate=query,
    )


async def create_old_declare_tx(
    args: argparse.Namespace,
    declare_tx_args: OldDeclareArgs,
    max_fee: int,
    has_wallet: bool,
    query: bool,
) -> DeprecatedOldDeclare:
    """
    Creates and returns an old declare transaction with the given parameters.
    If a wallet provider was provided in args, that transaction will be wrapped and signed.
    """
    return await construct_old_declare_tx(
        feeder_client=get_feeder_gateway_client(args=args),
        declare_tx_args=declare_tx_args,
        chain_id=get_chain_id(args=args),
        max_fee=max_fee,
        account=await load_account_from_args(args=args) if has_wallet else None,
        explicit_nonce=args.nonce,
        simulate=query,
    )


async def create_deprecated_deploy_account_tx(
    args: argparse.Namespace,
    account: Account,
    max_fee: int,
    query: bool,
) -> Tuple[DeprecatedDeployAccount, int]:
    """
    Creates and returns a deprecated Deploy Account transaction with the given parameters along with
    the new account address.
    """
    return await construct_deprecated_deploy_account_tx(
        account=account,
        max_fee=max_fee,
        chain_id=get_chain_id(args),
        dry_run=query,
        force_deploy=args.force,
    )


async def simulate_tx_inner(
    args: argparse.Namespace,
    tx: DeprecatedAccountTransaction,
    has_block_info: bool,
) -> TransactionSimulationInfo:
    """
    Simulates a transaction with the given parameters.
    Returns a TransactionSimulationInfo object.
    """
    feeder_client = get_feeder_gateway_client(args=args)
    skip_validate = args.skip_validate
    if has_block_info:
        return await simulate_tx_at_block(
            feeder_client=feeder_client,
            tx=tx,
            block_hash=args.block_hash,
            block_number=args.block_number,
            skip_validate=skip_validate,
        )
    return await simulate_tx_at_pending_block(
        feeder_client=feeder_client, tx=tx, skip_validate=skip_validate
    )


def print_invoke_tx(tx: DeprecatedInvokeFunction, chain_id: int):
    sn_config_dict = StarknetGeneralConfig().dump()
    sn_config_dict["starknet_os_config"]["chain_id"] = StarknetChainId(chain_id).value
    sn_config = StarknetGeneralConfig.load(sn_config_dict)
    tx_hash = tx.calculate_hash(sn_config)
    out_dict = {
        "transaction": DeprecatedTransactionSchema().dump(obj=tx),
        "transaction_hash": hex(tx_hash),
    }
    print(json.dumps(out_dict, indent=4))


def print_fee_info(fee_info: FeeEstimationInfo):
    """
    Prints the fee information based on the FeeEstimationInfo object.
    """
    fee_wei = fee_info.overall_fee
    fee_eth = float(from_wei(number=fee_wei, unit="ether"))
    print(
        f"""\
The estimated fee is: {fee_wei} WEI ({fee_eth:.6f} ETH).
Gas usage: {fee_info.gas_usage}
Gas price: {fee_info.gas_price} WEI"""
    )


def create_get_nonce_callback(args: argparse.Namespace) -> Callable[[int], Awaitable[int]]:
    return construct_nonce_callback(
        explicit_nonce=args.nonce, feeder_client=get_feeder_gateway_client(args)
    )


def assert_tx_received(gateway_response: Dict[str, str]):
    assert tx_received(
        gateway_response=gateway_response
    ), f"Failed to send transaction. Response: {gateway_response}."


async def simulate_or_estimate_fee(args: argparse.Namespace, tx: DeprecatedAccountTransaction):
    args.block_hash, args.block_number = parse_block_identifiers(args.block_hash, args.block_number)
    tx_simulate_info = await simulate_tx_inner(args=args, tx=tx, has_block_info=True)
    print_fee_info(fee_info=tx_simulate_info.fee_estimation)

    if args.simulate:
        print()
        print(tx_simulate_info.trace.dumps(indent=4, sort_keys=True))


# Add arguments.


def add_account_tx_arguments(parser: argparse.ArgumentParser):
    """
    Adds the arguments: max_fee, signature and nonce.
    """
    parser.add_argument(
        "--nonce",
        type=int,
        help=(
            "Used for explicitly specifying the transaction nonce. "
            "If not specified, the current nonce of the account contract "
            "(as returned from StarkNet) will be used."
        ),
    )
    parser.add_argument(
        "--signature",
        type=str,
        nargs="*",
        default=[],
        help="The signature information for transaction.",
    )
    parser.add_argument(
        "--max_fee",
        type=int,
        help="The maximal fee to be paid for the execution of the transaction.",
    )


def add_simulate_tx_arguments(parser: argparse.ArgumentParser):
    """
    Adds the arguments: simulate, estimate_fee and the block identifier arguments.
    """
    parser.add_argument(
        "--simulate",
        action="store_true",
        help="Simulates the transaction and prints its trace and its estimated cost.",
    )
    parser.add_argument(
        "--estimate_fee",
        action="store_true",
        help="Estimates the fee of the transaction.",
    )
    parser.add_argument(
        "--skip_validate",
        action="store_true",
        help="Skips the validate function on simulate and estimate_fee.",
    )
    add_block_identifier_arguments(
        parser=parser,
        block_role_description="be used as the context for the transaction simulation",
    )


def add_declare_tx_arguments(parser: argparse.ArgumentParser):
    """
    Adds arguments for declare.
    """
    parser.add_argument(
        "--contract",
        type=argparse.FileType("r"),
        help="The contract class to declare.",
        required=True,
    )
    parser.add_argument(
        "--sender",
        type=str,
        help="The address of the account contract sending the transaction.",
    )
    parser.add_argument(
        "--deprecated",
        action="store_true",
        help="Send a deprecated declare transaction (i.e., to declare a Cairo v0 contract).",
    )
    parser.add_argument(
        "--compiler_dir",
        type=str,
        # This compiler will be used by the CLI during the creation of the declare tx.
        # Later, during the execution of the transaction in the gateway the contract will be
        # recompiled with the compiler configured there.
        help=(
            "The path to the directory containing the compiler used to compile the given contract. "
            "Assumes a binary file named starknet-sierra-compile is in the directory. "
            "If no directory is provided, uses the default compiler."
        ),
    )
    parser.add_argument(
        "--compiler_args",
        type=str,
        help=(
            "The compilation arguments for the Cairo 1.0 compiler. For example, "
            "--compiler_args='--add-pythonic-hints --allowed-libfuncs-list-file testnet_libfuncs'. "
            "If '--compiler_args' is not specified, "
            "the libfunc list will be chosen according to the specified network."
        ),
    )
    add_account_tx_arguments(parser=parser)
    add_simulate_tx_arguments(parser=parser)


def add_call_function_arguments(parser: argparse.ArgumentParser):
    """
    Adds the arguments: address, abi, function, inputs.
    """
    parser.add_argument(
        "--address", type=str, required=True, help="The address of the invoked contract."
    )
    parser.add_argument("--abi", type=argparse.FileType("r"), help="The Cairo contract ABI.")
    parser.add_argument(
        "--function", type=str, required=True, help="The name of the invoked function."
    )
    parser.add_argument(
        "--inputs", type=str, nargs="*", default=[], help="The inputs to the invoked function."
    )


def add_call_l1_handler_arguments(parser: argparse.ArgumentParser):
    """
    Adds the argument 'from_address' and the call_function arguments.
    """
    parser.add_argument(
        "--from_address", type=str, required=True, help="The L1 address of the caller."
    )

    add_call_function_arguments(parser=parser)


def add_invoke_tx_arguments(parser: argparse.ArgumentParser):
    """
    Adds the arguments: address, abi, function, inputs, nonce, signature, max_fee, dry_run, the
    simulate arguments and the block identifier arguments.
    """
    add_call_function_arguments(parser=parser)
    add_account_tx_arguments(parser=parser)
    parser.add_argument(
        "--dry_run",
        action="store_true",
        help="Prepare the transaction and print it without signing or sending it.",
    )
    add_simulate_tx_arguments(parser=parser)


def add_deploy_account_tx_arguments(parser: argparse.ArgumentParser):
    """
    Adds the arguments: max_fee, the simulate arguments and the block identifier arguments.
    """
    parser.add_argument(
        "--max_fee", type=int, help="The maximal fee to be paid for the deployment."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Send the transaction even if it was already sent.",
    )
    add_simulate_tx_arguments(parser=parser)


def add_block_identifier_arguments(
    parser: argparse.ArgumentParser, block_role_description: str, with_block_prefix: bool = True
):
    identifier_prefix = "block_" if with_block_prefix else ""
    block_identifier_parser_group = parser.add_mutually_exclusive_group(required=False)
    block_identifier_parser_group.add_argument(
        f"--{identifier_prefix}hash",
        type=str,
        help=(f"The hash of the block to {block_role_description}. "),
    )
    block_identifier_parser_group.add_argument(
        f"--{identifier_prefix}number",
        help=(
            f"The number of the block to {block_role_description}; "
            "Additional supported keywords: 'pending', 'latest';"
        ),
    )


async def main():
    subparsers = {
        "call": call,
        "declare": declare,
        "deploy": deploy,
        "deploy_account": deploy_account,
        "estimate_message_fee": estimate_message_fee,
        "get_block": get_block,
        "get_block_traces": get_block_traces,
        "get_class_by_hash": get_class_by_hash,
        "get_class_hash_at": get_class_hash_at,
        "get_code": get_code,
        "get_contract_addresses": get_contract_addresses,
        "get_full_contract": get_full_contract,
        "get_nonce": get_nonce,
        "get_state_update": get_state_update,
        "get_storage_at": get_storage_at,
        "get_transaction": get_transaction,
        "get_transaction_receipt": get_transaction_receipt,
        "get_transaction_trace": get_transaction_trace,
        "invoke": invoke,
        "new_account": new_account,
        "tx_status": tx_status,
    }
    parser = argparse.ArgumentParser(description="A tool to communicate with StarkNet.")
    parser.add_argument("-v", "--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument("--network", type=str, help="The name of the StarkNet network.")
    parser.add_argument(
        "--network_id",
        type=str,
        help="A textual identifier of the network. Used for account management.",
    )
    parser.add_argument(
        "--chain_id",
        type=str,
        help="The chain id (either as a hex number or as a string).",
    )
    wallet_parser_group = parser.add_mutually_exclusive_group(required=False)
    wallet_parser_group.add_argument(
        "--wallet",
        type=str,
        help="The name of the wallet, including the python module and wallet class.",
    )
    wallet_parser_group.add_argument(
        "--no_wallet",
        dest="wallet",
        action="store_const",
        # Set wallet explicitly to an empty string, rather than None, to override the
        # environment variables.
        const="",
        help="Perform a direct contract call without an account contract.",
    )
    parser.add_argument(
        "--account",
        type=str,
        default="__default__",
        help=(
            "The name of the account. If not given, the default account "
            "(as defined by the wallet) is used."
        ),
    )
    parser.add_argument(
        "--account_dir",
        type=str,
        help=f"The directory containing the account files (default: '{DEFAULT_ACCOUNT_DIR}').",
    )
    parser.add_argument(
        "--flavor",
        type=str,
        choices=["Debug", "Release", "RelWithDebInfo"],
        help="Build flavor.",
    )
    parser.add_argument(
        "--show_trace",
        action="store_true",
        help="Print the full Python error trace in case of an internal error.",
    )

    parser.add_argument("--gateway_url", type=str, help="The URL of a StarkNet gateway.")
    parser.add_argument(
        "--feeder_gateway_url", type=str, help="The URL of a StarkNet feeder gateway."
    )
    parser.add_argument("command", choices=subparsers.keys())

    args, unknown = parser.parse_known_args()

    ret = handle_network_param(args)
    if ret != 0:
        return ret

    try:
        with get_crypto_lib_context_manager(args.flavor):
            # Invoke the requested command.
            return await subparsers[args.command](args, unknown)
    except Exception as exc:
        print(f"Error: {type(exc).__name__}: {exc}", file=sys.stderr)
        if args.show_trace:
            print(file=sys.stderr)
            traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
