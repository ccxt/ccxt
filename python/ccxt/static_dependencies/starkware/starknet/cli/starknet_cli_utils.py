import dataclasses
import math
from typing import Any, Awaitable, Callable, Dict, List, Literal, Optional, Tuple, Union

from services.external_api.client import RetryConfig
from starkware.cairo.lang.compiler.ast.cairo_types import TypeFelt, TypePointer
from starkware.cairo.lang.compiler.identifier_manager import IdentifierManager
from starkware.cairo.lang.compiler.parser import parse_type
from starkware.cairo.lang.compiler.type_system import mark_type_resolved
from starkware.cairo.lang.compiler.type_utils import check_felts_only_type
from starkware.python.utils import from_bytes
from starkware.starknet.definitions import constants
from starkware.starknet.definitions.chain_ids import StarknetChainId
from starkware.starknet.public.abi import (
    EXECUTE_ENTRY_POINT_NAME,
    EXECUTE_ENTRY_POINT_SELECTOR,
    AbiType,
    get_selector_from_name,
)
from starkware.starknet.public.abi_structs import identifier_manager_from_abi
from starkware.starknet.services.api.contract_class.contract_class import (
    ContractClass,
    DeprecatedCompiledClass,
)
from starkware.starknet.services.api.feeder_gateway.feeder_gateway_client import (
    CastableToHash,
    FeederGatewayClient,
)
from starkware.starknet.services.api.feeder_gateway.request_objects import (
    CallFunction,
    CallL1Handler,
)
from starkware.starknet.services.api.feeder_gateway.response_objects import (
    PENDING_BLOCK_ID,
    BlockIdentifier,
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
from starkware.starknet.wallets.account import Account
from starkware.starknet.wallets.starknet_context import StarknetContext
from starkware.starkware_utils.error_handling import StarkErrorCode

NETWORKS = {
    "alpha-goerli": "alpha4.starknet.io",
    "alpha-goerli2": "alpha4-2.starknet.io",
    "alpha-mainnet": "alpha-mainnet.starknet.io",
}

CHAIN_IDS = {
    "alpha-goerli": StarknetChainId.TESTNET.value,
    "alpha-goerli2": StarknetChainId.TESTNET2.value,
    "alpha-mainnet": StarknetChainId.MAINNET.value,
}

# Mapping from the network's name to the corresponding allowed libfuncs list file.
LIBFUNC_LIST_FILES = {
    "alpha-goerli": "testnet_libfuncs",
    "alpha-goerli2": "testnet_libfuncs",
    "alpha-mainnet": "mainnet_libfuncs",
}

FEE_MARGIN_OF_ESTIMATION = 1.1
ABI_TYPE_NOT_FOUND_ERROR = "An ABI entry is missing a 'type' entry."
ABI_TYPE_NOT_SUPPORTED_ERROR_FORMAT = "Type '{typ}' is not supported."


class AbiFormatError(Exception):
    """
    A wrapper for ABI format errors.
    """


class NetworkNameError(Exception):
    """
    Unknown network name.
    """


@dataclasses.dataclass
class NetworkData:
    """
    Network related data. Can be constructed from network name.
    """

    network: str
    gateway_url: str
    feeder_gateway_url: str
    network_id: str
    chain_id: str

    @classmethod
    def from_network_name(cls, network: str) -> "NetworkData":
        if network not in NETWORKS:
            networks_str = ", ".join(NETWORKS.keys())
            raise NetworkNameError(
                f"Unknown network '{network}'. Supported networks: {networks_str}."
            )

        dns = NETWORKS[network]
        return cls(
            network=network,
            gateway_url=f"https://{dns}/gateway",
            feeder_gateway_url=f"https://{dns}/feeder_gateway",
            network_id=network,
            chain_id=hex(CHAIN_IDS[network]),
        )


@dataclasses.dataclass
class InvokeFunctionArgs:
    address: int
    selector: int
    calldata: List[int]
    signature: List[int]

    @classmethod
    def from_call_function(
        cls, call_function: CallFunction, signature: List[int]
    ) -> "InvokeFunctionArgs":
        return cls(
            address=call_function.contract_address,
            selector=call_function.entry_point_selector,
            calldata=call_function.calldata,
            signature=signature,
        )


@dataclasses.dataclass
class OldDeclareArgs:
    contract_class: DeprecatedCompiledClass
    sender: Optional[int]
    signature: List[int]


@dataclasses.dataclass
class DeclareArgs:
    contract_class: ContractClass
    compiled_class_hash: int
    sender: Optional[int]
    signature: List[int]


def parse_block_identifiers(
    block_hash: Optional[CastableToHash],
    block_number: Optional[BlockIdentifier],
    default_block_number: Optional[BlockIdentifier] = None,
) -> Tuple[Optional[CastableToHash], Optional[BlockIdentifier]]:
    """
    In most cases, returns the input as given.
    If no block identifiers were given, set the value default_block_number instead of block_number.
    If the value for default_block_number is not provided - it defaults to "pending".
    """
    default_block_number = (
        PENDING_BLOCK_ID if default_block_number is None else default_block_number
    )
    if block_hash is None and block_number is None:
        return block_hash, default_block_number

    return block_hash, block_number


def tx_received(gateway_response: Dict[str, str]) -> bool:
    return gateway_response["code"] == StarkErrorCode.TRANSACTION_RECEIVED.name


def get_chain_id_from_str(chain_id_str: str) -> int:
    """
    Given a string representing a chain ID, returns the integer chain ID (that is a value of the
    CHAIN_IDS dict).
    """
    if chain_id_str.startswith("0x"):
        chain_id_int = int(chain_id_str, 16)
    else:
        chain_id_int = from_bytes(chain_id_str.encode())

    assert chain_id_int in CHAIN_IDS.values(), f"Unsupported chain ID: {chain_id_str}."
    return chain_id_int


def construct_gateway_client(gateway_url: str) -> GatewayClient:
    # Limit the number of retries.
    retry_config = RetryConfig(n_retries=1)
    return GatewayClient(url=gateway_url, retry_config=retry_config)


def construct_feeder_gateway_client(feeder_gateway_url: str) -> FeederGatewayClient:
    # Limit the number of retries.
    retry_config = RetryConfig(n_retries=1)
    return FeederGatewayClient(url=feeder_gateway_url, retry_config=retry_config)


def validate_arguments(
    inputs: List[int], abi_entry: Dict[str, Any], identifier_manager: IdentifierManager
):
    """
    Validates the arguments of an ABI entry of type 'function' or 'constructor'.
    """
    function_name = abi_entry["name"] if abi_entry["type"] == "function" else "constructor"
    previous_felt_input = None
    current_inputs_ptr = 0
    for input_desc in abi_entry["inputs"]:
        # ABI input entry validations.
        if "type" not in input_desc or "name" not in input_desc:
            raise AbiFormatError(
                f"An input in the 'inputs' entry of '{function_name}' is missing either "
                "the 'type' or the 'name' entry."
            )

        try:
            typ = mark_type_resolved(parse_type(input_desc["type"]))
            typ_size = check_felts_only_type(cairo_type=typ, identifier_manager=identifier_manager)
        except Exception as ex:
            raise AbiFormatError(ex) from ex

        if typ_size is not None:
            assert current_inputs_ptr + typ_size <= len(
                inputs
            ), f"Expected at least {current_inputs_ptr + typ_size} inputs, got {len(inputs)}."

            current_inputs_ptr += typ_size
        elif isinstance(typ, TypePointer):
            try:
                typ_size = check_felts_only_type(
                    cairo_type=typ.pointee, identifier_manager=identifier_manager
                )
            except Exception as ex:
                raise AbiFormatError(ex) from ex

            if typ_size is None:
                raise AbiFormatError(ABI_TYPE_NOT_SUPPORTED_ERROR_FORMAT.format(typ=typ.format()))
            assert previous_felt_input is not None, (
                f"The array argument {input_desc['name']} of type felt* must be preceded "
                "by a length argument of type felt."
            )

            current_inputs_ptr += previous_felt_input * typ_size
        else:
            raise AbiFormatError(ABI_TYPE_NOT_SUPPORTED_ERROR_FORMAT.format(typ=typ.format()))
        previous_felt_input = inputs[current_inputs_ptr - 1] if typ == TypeFelt() else None

    assert (
        len(inputs) == current_inputs_ptr
    ), f"Wrong number of arguments. Expected {current_inputs_ptr}, got {len(inputs)}."


def validate_call_args(
    abi: AbiType,
    abi_entry_name: str,
    abi_entry_type: Union[Literal["function"], Literal["l1_handler"]],
    inputs: List[int],
):
    """
    Validates that the function name is in the ABI and that the inputs match the required structure.
    """
    for abi_entry in abi:
        # ABI entry validation.
        if "type" not in abi_entry:
            raise AbiFormatError(ABI_TYPE_NOT_FOUND_ERROR)

        if abi_entry["type"] == abi_entry_type:
            # ABI entry validation.
            # Note that not all ABI entries contain the 'name' entry, e.g., a constructor entry.
            if "name" not in abi_entry:
                raise AbiFormatError(
                    f"An ABI entry of type '{abi_entry_type}' is missing a 'name' entry."
                )

            if abi_entry["name"] == abi_entry_name:
                validate_arguments(
                    inputs=inputs,
                    abi_entry=abi_entry,
                    identifier_manager=identifier_manager_from_abi(abi=abi),
                )
                break
    else:
        raise AbiFormatError(
            f"{abi_entry_type.capitalize().replace('_',' ')} '{abi_entry_name}' not found."
        )


async def load_account(
    starknet_context: StarknetContext, wallet: str, account_name: str
) -> Account:
    """
    Constructs an Account instance for the given account name.

    wallet: the name of the python module and class (module.class).
    """
    try:
        module_name, class_name = wallet.rsplit(".", maxsplit=1)
    except ValueError:
        raise Exception(
            f"Unable to find wallet '{wallet}': Wrong wallet format; expected module.class format."
        ) from None

    # Load the module.
    try:
        module_classes = __import__(module_name, fromlist=[class_name])
    except ModuleNotFoundError as e:
        if e.name == module_name:
            raise Exception(
                f"Unable to find wallet '{wallet}': Module '{module_name}' was not found."
            ) from None
        else:
            # Raise the original exception.
            raise

    # Load the wallet class.
    try:
        account_class = getattr(module_classes, class_name)
    except AttributeError:
        raise Exception(
            f"Unable to find wallet '{wallet}': Class '{class_name}' was not found."
        ) from None

    return account_class.create(starknet_context=starknet_context, account_name=account_name)


async def simulate_tx_at_pending_block(
    feeder_client: FeederGatewayClient, tx: DeprecatedAccountTransaction, skip_validate: bool
) -> TransactionSimulationInfo:
    """
    Simulates a transaction with the given parameters, relative to the state of the latest PENDING
    block.
    """
    return await simulate_tx_at_block(
        feeder_client=feeder_client,
        tx=tx,
        block_hash=None,
        block_number=PENDING_BLOCK_ID,
        skip_validate=skip_validate,
    )


async def simulate_tx_at_block(
    feeder_client: FeederGatewayClient,
    tx: DeprecatedAccountTransaction,
    skip_validate: bool,
    block_hash: Optional[CastableToHash] = None,
    block_number: Optional[BlockIdentifier] = None,
) -> TransactionSimulationInfo:
    """
    Simulates a transaction with the given parameters.
    Returns a TransactionSimulationInfo object.
    """
    return await feeder_client.simulate_transaction(
        tx=tx, block_hash=block_hash, block_number=block_number, skip_validate=skip_validate
    )


async def compute_max_fee_for_tx(
    feeder_client: FeederGatewayClient, tx: DeprecatedAccountTransaction, skip_validate: bool
) -> int:
    """
    Given a transaction, estimates and returns the max fee.
    """
    simulate_tx_info = await simulate_tx_at_pending_block(
        feeder_client=feeder_client, tx=tx, skip_validate=skip_validate
    )
    return math.ceil(simulate_tx_info.fee_estimation.overall_fee * FEE_MARGIN_OF_ESTIMATION)


def construct_nonce_callback(
    explicit_nonce: Optional[int], feeder_client: FeederGatewayClient
) -> Callable[[int], Awaitable[int]]:
    async def get_nonce(address: int) -> int:
        if explicit_nonce is not None:
            return explicit_nonce

        # Obtain the current nonce. Note that you can't invoke a function again before the
        # previous transaction was accepted.
        return await feeder_client.get_nonce(
            contract_address=address, block_hash=None, block_number=PENDING_BLOCK_ID
        )

    return get_nonce


def create_call_function(
    contract_address: int, abi: Optional[AbiType], function_name: str, inputs: List[int]
) -> CallFunction:
    """
    Constructs a CallFunction object for the given parameters.
    """
    if abi is not None:
        validate_call_args(
            abi=abi, abi_entry_name=function_name, abi_entry_type="function", inputs=inputs
        )

    return CallFunction(
        contract_address=contract_address,
        entry_point_selector=get_selector_from_name(function_name),
        calldata=inputs,
    )


def create_call_l1_handler(
    abi: Optional[AbiType],
    handler_name: str,
    from_address: int,
    to_address: int,
    payload: List[int],
) -> CallL1Handler:
    """
    Constructs a CallL1Handler object for the given parameters.
    """
    if abi is not None:
        validate_call_args(
            abi=abi,
            abi_entry_name=handler_name,
            abi_entry_type="l1_handler",
            inputs=[from_address] + payload,
        )

    return CallL1Handler(
        from_address=from_address,
        to_address=to_address,
        entry_point_selector=get_selector_from_name(handler_name),
        payload=payload,
    )


async def construct_deprecated_invoke_tx_for_deploy(
    feeder_client: FeederGatewayClient,
    account: Account,
    salt: int,
    class_hash: int,
    constructor_calldata: List[int],
    chain_id: int,
    max_fee: int,
    call: bool,
    deploy_from_zero: bool,
    explicit_nonce: Optional[int],
) -> Tuple[DeprecatedInvokeFunction, int]:
    """
    Creates and returns a deprecated invoke transaction to deploy a contract with the given
    arguments, which is wrapped and signed by the wallet provider.
    Returns the transaction and the new account address.
    """
    return await account.deprecated_deploy_contract(
        class_hash=class_hash,
        salt=salt,
        constructor_calldata=constructor_calldata,
        deploy_from_zero=deploy_from_zero,
        chain_id=chain_id,
        max_fee=max_fee,
        version=constants.DEPRECATED_QUERY_VERSION
        if call
        else constants.DEPRECATED_TRANSACTION_VERSION,
        nonce_callback=construct_nonce_callback(
            explicit_nonce=explicit_nonce, feeder_client=feeder_client
        ),
    )


async def construct_deprecated_invoke_tx(
    feeder_client: FeederGatewayClient,
    invoke_tx_args: InvokeFunctionArgs,
    chain_id: int,
    max_fee: int,
    account: Optional[Account],
    explicit_nonce: Optional[int],
    simulate: bool,
    dry_run: bool,
) -> DeprecatedInvokeFunction:
    """
    Creates and returns a deprecated invoke transaction with the given parameters.
    If an account is provided, the transaction will be wrapped and signed.
    """
    version = (
        constants.DEPRECATED_QUERY_VERSION if simulate else constants.DEPRECATED_TRANSACTION_VERSION
    )
    nonce_callback = construct_nonce_callback(
        feeder_client=feeder_client, explicit_nonce=explicit_nonce
    )
    if account is None:
        assert invoke_tx_args.selector == EXECUTE_ENTRY_POINT_SELECTOR, (
            f"'--function' can only be {EXECUTE_ENTRY_POINT_NAME} "
            "when invoking with the '--no_wallet' flag."
        )
        return DeprecatedInvokeFunction(
            sender_address=invoke_tx_args.address,
            calldata=invoke_tx_args.calldata,
            max_fee=max_fee,
            version=version,
            nonce=await nonce_callback(invoke_tx_args.address),
            signature=invoke_tx_args.signature,
        )

    assert invoke_tx_args.signature == [], (
        "Signature cannot be passed explicitly when using an account contract. "
        "Consider making a direct contract call using --no_wallet."
    )
    return await account.deprecated_invoke(
        contract_address=invoke_tx_args.address,
        selector=invoke_tx_args.selector,
        calldata=invoke_tx_args.calldata,
        chain_id=chain_id,
        max_fee=max_fee,
        version=version,
        nonce_callback=nonce_callback,
        dry_run=dry_run,
    )


async def construct_deprecated_declare_tx(
    feeder_client: FeederGatewayClient,
    declare_tx_args: DeclareArgs,
    chain_id: int,
    max_fee: int,
    account: Optional[Account],
    explicit_nonce: Optional[int],
    simulate: bool,
) -> DeprecatedDeclare:
    """
    Creates and returns a deprecated declare transaction with the given parameters.
    If an account is provided, the transaction will be wrapped and signed.
    """
    version = (
        constants.DEPRECATED_QUERY_DECLARE_VERSION
        if simulate
        else constants.DEPRECATED_DECLARE_VERSION
    )
    nonce_callback = construct_nonce_callback(
        feeder_client=feeder_client, explicit_nonce=explicit_nonce
    )
    if account is None:
        # Declare directly.
        assert (
            declare_tx_args.sender is not None
        ), "Sender must be passed explicitly when making a direct declaration using --no_wallet."
        return DeprecatedDeclare(
            contract_class=declare_tx_args.contract_class,
            compiled_class_hash=declare_tx_args.compiled_class_hash,
            sender_address=declare_tx_args.sender,
            max_fee=max_fee,
            version=version,
            signature=declare_tx_args.signature,
            nonce=await nonce_callback(declare_tx_args.sender),
        )

    # Declare through the account contract.
    assert declare_tx_args.sender is None, (
        "Sender cannot be passed explicitly when using an account contract. "
        "Consider making a direct declaration using --no_wallet."
    )
    assert declare_tx_args.signature == [], (
        "Signature cannot be passed explicitly when using an account contract. "
        "Consider making a direct declaration using --no_wallet."
    )
    return await account.deprecated_declare(
        contract_class=declare_tx_args.contract_class,
        compiled_class_hash=declare_tx_args.compiled_class_hash,
        chain_id=chain_id,
        max_fee=max_fee,
        version=version,
        nonce_callback=nonce_callback,
    )


async def construct_old_declare_tx(
    feeder_client: FeederGatewayClient,
    declare_tx_args: OldDeclareArgs,
    chain_id: int,
    max_fee: int,
    account: Optional[Account],
    explicit_nonce: Optional[int],
    simulate: bool,
) -> DeprecatedOldDeclare:
    """
    Creates and returns an old declare transaction with the given parameters.
    If an account is provided, that transaction will be wrapped and signed.
    """
    version = (
        constants.DEPRECATED_QUERY_VERSION if simulate else constants.DEPRECATED_TRANSACTION_VERSION
    )
    nonce_callback = construct_nonce_callback(
        feeder_client=feeder_client, explicit_nonce=explicit_nonce
    )
    if account is None:
        # Declare directly.
        assert (
            declare_tx_args.sender is not None
        ), "Sender must be passed explicitly when making a direct declaration using --no_wallet."
        return DeprecatedOldDeclare(
            contract_class=declare_tx_args.contract_class,
            sender_address=declare_tx_args.sender,
            max_fee=max_fee,
            version=version,
            signature=declare_tx_args.signature,
            nonce=await nonce_callback(declare_tx_args.sender),
        )

    # Declare through the account contract.
    assert declare_tx_args.sender is None, (
        "Sender cannot be passed explicitly when using an account contract. "
        "Consider making a direct declaration using --no_wallet."
    )
    assert declare_tx_args.signature == [], (
        "Signature cannot be passed explicitly when using an account contract. "
        "Consider making a direct declaration using --no_wallet."
    )
    return await account.deprecated_old_declare(
        contract_class=declare_tx_args.contract_class,
        chain_id=chain_id,
        max_fee=max_fee,
        version=version,
        nonce_callback=nonce_callback,
    )


async def construct_deprecated_deploy_account_tx(
    account: Account,
    max_fee: int,
    chain_id: int,
    dry_run: bool,
    force_deploy: bool,
) -> Tuple[DeprecatedDeployAccount, int]:
    """
    Creates and returns a deprecated Deploy Account transaction with the given parameters along with
    the new account address.
    """
    version = (
        constants.DEPRECATED_QUERY_VERSION if dry_run else constants.DEPRECATED_TRANSACTION_VERSION
    )
    return await account.deprecated_deploy_account(
        max_fee=max_fee,
        version=version,
        chain_id=chain_id,
        dry_run=dry_run,
        force_deploy=force_deploy,
    )
