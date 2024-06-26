import dataclasses
import json
from collections import OrderedDict
from typing import Any, Dict, Iterable, List, Optional, Tuple, Union

from common import create_compiled_contract, create_sierra_compiled_contract
from constants import FEE_CONTRACT_ADDRESS, QUERY_VERSION_BASE
from hash.address import compute_address
from hash.selector import get_selector_from_name
from hash.utils import verify_message_signature
from ..account.account_deployment_result import AccountDeploymentResult
from ..account.base_account import BaseAccount
from ..client import Client
from ..client_models import (
    Call,
    Calls,
    EstimatedFee,
    Hash,
    ResourceBounds,
    ResourceBoundsMapping,
    SentTransactionResponse,
    SierraContractClass,
    Tag,
)
from ..full_node_client import FullNodeClient
from ..models import AddressRepresentation, parse_address
from ..models.chains import RECOGNIZED_CHAIN_IDS, Chain, parse_chain
from ..models.transaction import (
    AccountTransaction,
    DeclareV1,
    DeclareV2,
    DeclareV3,
    DeployAccountV1,
    DeployAccountV3,
    InvokeV1,
    InvokeV3,
    TypeAccountTransaction,
)
from ..models.typed_data import TypedDataDict
from ..signer import BaseSigner
from ..signer.stark_curve_signer import KeyPair, StarkCurveSigner
from serialization.data_serializers.array_serializer import ArraySerializer
from serialization.data_serializers.felt_serializer import FeltSerializer
from serialization.data_serializers.payload_serializer import (
    PayloadSerializer,
)
from serialization.data_serializers.struct_serializer import (
    StructSerializer,
)
from utils.iterable import ensure_iterable
from utils.sync import add_sync_methods
from utils.typed_data import TypedData


@add_sync_methods
class Account(BaseAccount):
    """
    Default Account implementation.
    """

    ESTIMATED_FEE_MULTIPLIER: float = 1.5
    """Amount by which each estimated fee is multiplied when using `auto_estimate`."""

    ESTIMATED_AMOUNT_MULTIPLIER: float = 1.5
    ESTIMATED_UNIT_PRICE_MULTIPLIER: float = 1.5
    """Values by which each estimated `max_amount` and `max_price_per_unit` are multiplied when using 
    `auto_estimate`. Used only for V3 transactions"""

    def __init__(
        self,
        *,
        address: AddressRepresentation,
        client: Client,
        signer: Optional[BaseSigner] = None,
        key_pair: Optional[KeyPair] = None,
        chain: Optional[Chain] = None,
    ):
        """
        :param address: Address of the account contract.
        :param client: Instance of Client which will be used to add transactions.
        :param signer: Custom signer to be used by Account.
                       If none is provided, default
                       :py:class:`starknet_py.net.signer.stark_curve_signer.StarkCurveSigner` is used.
        :param key_pair: Key pair that will be used to create a default `Signer`.
        :param chain: Chain ID associated with the account.
            This can be supplied in multiple formats:

            - an enum :py:class:`starknet_py.net.models.StarknetChainId`
            - a string name (e.g. 'SN_SEPOLIA')
            - a hexadecimal value (e.g. '0x1')
            - an integer (e.g. 1)
        """
        self._address = parse_address(address)
        self._client = client
        self._cairo_version = None
        self._chain_id = None if chain is None else parse_chain(chain)

        if signer is not None and key_pair is not None:
            raise ValueError("Arguments signer and key_pair are mutually exclusive.")

        if signer is None:
            if key_pair is None:
                raise ValueError(
                    "Either a signer or a key_pair must be provided in Account constructor."
                )
            if self._chain_id is None:
                raise ValueError("One of chain or signer must be provided.")

            signer = StarkCurveSigner(
                account_address=self.address, key_pair=key_pair, chain_id=self._chain_id
            )
        self.signer: BaseSigner = signer

    @property
    def address(self) -> int:
        return self._address

    @property
    async def cairo_version(self) -> int:
        if self._cairo_version is None:
            assert isinstance(self._client, FullNodeClient)
            contract_class = await self._client.get_class_at(
                contract_address=self._address
            )
            self._cairo_version = (
                1 if isinstance(contract_class, SierraContractClass) else 0
            )
        return self._cairo_version

    @property
    def client(self) -> Client:
        return self._client

    async def _get_max_fee(
        self,
        transaction: AccountTransaction,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> int:
        if auto_estimate and max_fee is not None:
            raise ValueError(
                "Arguments max_fee and auto_estimate are mutually exclusive."
            )

        if auto_estimate:
            estimated_fee = await self.estimate_fee(transaction)
            assert isinstance(estimated_fee, EstimatedFee)

            max_fee = int(estimated_fee.overall_fee * Account.ESTIMATED_FEE_MULTIPLIER)

        if max_fee is None:
            raise ValueError(
                "Argument max_fee must be specified when invoking a transaction."
            )

        return max_fee

    async def _get_resource_bounds(
        self,
        transaction: AccountTransaction,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
    ) -> ResourceBoundsMapping:
        if auto_estimate and l1_resource_bounds is not None:
            raise ValueError(
                "Arguments auto_estimate and l1_resource_bounds are mutually exclusive."
            )

        if auto_estimate:
            estimated_fee = await self.estimate_fee(transaction)
            assert isinstance(estimated_fee, EstimatedFee)

            return estimated_fee.to_resource_bounds(
                Account.ESTIMATED_AMOUNT_MULTIPLIER,
                Account.ESTIMATED_UNIT_PRICE_MULTIPLIER,
            )

        if l1_resource_bounds is None:
            raise ValueError(
                "One of arguments: l1_resource_bounds or auto_estimate must be specified when invoking a transaction."
            )

        return ResourceBoundsMapping(
            l1_gas=l1_resource_bounds, l2_gas=ResourceBounds.init_with_zeros()
        )

    async def _prepare_invoke(
        self,
        calls: Calls,
        *,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> InvokeV1:
        """
        Takes calls and creates Invoke from them.

        :param calls: Single call or list of calls.
        :param max_fee: Max amount of Wei to be paid when executing transaction.
        :param auto_estimate: Use automatic fee estimation, not recommend as it may lead to high costs.
        :return: Invoke created from the calls (without the signature).
        """
        if nonce is None:
            nonce = await self.get_nonce()

        wrapped_calldata = _parse_calls(await self.cairo_version, calls)

        transaction = InvokeV1(
            calldata=wrapped_calldata,
            signature=[],
            max_fee=0,
            version=1,
            nonce=nonce,
            sender_address=self.address,
        )

        max_fee = await self._get_max_fee(transaction, max_fee, auto_estimate)

        return _add_max_fee_to_transaction(transaction, max_fee)

    async def _prepare_invoke_v3(
        self,
        calls: Calls,
        *,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        nonce: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> InvokeV3:
        """
        Takes calls and creates InvokeV3 from them.

        :param calls: Single call or a list of calls.
        :param l1_resource_bounds: Max amount and max price per unit of L1 gas used in this transaction.
        :param auto_estimate: Use automatic fee estimation; not recommended as it may lead to high costs.
        :return: InvokeV3 created from the calls (without the signature).
        """
        if nonce is None:
            nonce = await self.get_nonce()

        wrapped_calldata = _parse_calls(await self.cairo_version, calls)

        transaction = InvokeV3(
            calldata=wrapped_calldata,
            resource_bounds=ResourceBoundsMapping.init_with_zeros(),
            signature=[],
            nonce=nonce,
            sender_address=self.address,
            version=3,
        )

        resource_bounds = await self._get_resource_bounds(
            transaction, l1_resource_bounds, auto_estimate
        )
        return _add_resource_bounds_to_transaction(transaction, resource_bounds)

    async def estimate_fee(
        self,
        tx: Union[AccountTransaction, List[AccountTransaction]],
        skip_validate: bool = False,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> Union[EstimatedFee, List[EstimatedFee]]:
        transactions = (
            await self.sign_for_fee_estimate(tx)
            if isinstance(tx, AccountTransaction)
            else [await self.sign_for_fee_estimate(t) for t in tx]
        )

        return await self._client.estimate_fee(
            tx=transactions,
            skip_validate=skip_validate,
            block_hash=block_hash,
            block_number=block_number,
        )

    async def get_nonce(
        self,
        *,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        """
        Get the current nonce of the account.

        :param block_hash: Block's hash or literals `"pending"` or `"latest"`
        :param block_number: Block's number or literals `"pending"` or `"latest"`
        :return: nonce.
        """
        return await self._client.get_contract_nonce(
            self.address, block_hash=block_hash, block_number=block_number
        )

    async def get_balance(
        self,
        token_address: Optional[AddressRepresentation] = None,
        *,
        block_hash: Optional[Union[Hash, Tag]] = None,
        block_number: Optional[Union[int, Tag]] = None,
    ) -> int:
        if token_address is None:
            chain_id = await self._get_chain_id()
            if chain_id in RECOGNIZED_CHAIN_IDS:
                token_address = FEE_CONTRACT_ADDRESS
            else:
                raise ValueError(
                    "Argument token_address must be specified when using a custom network."
                )

        low, high = await self._client.call_contract(
            Call(
                to_addr=parse_address(token_address),
                selector=get_selector_from_name("balanceOf"),
                calldata=[self.address],
            ),
            block_hash=block_hash,
            block_number=block_number,
        )

        return (high << 128) + low

    async def sign_for_fee_estimate(
        self, transaction: TypeAccountTransaction
    ) -> TypeAccountTransaction:
        version = transaction.version + QUERY_VERSION_BASE
        transaction = dataclasses.replace(transaction, version=version)

        signature = self.signer.sign_transaction(transaction)
        return _add_signature_to_transaction(tx=transaction, signature=signature)

    async def sign_invoke_v1(
        self,
        calls: Calls,
        *,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> InvokeV1:
        execute_tx = await self._prepare_invoke(
            calls,
            nonce=nonce,
            max_fee=max_fee,
            auto_estimate=auto_estimate,
        )
        signature = self.signer.sign_transaction(execute_tx)
        return _add_signature_to_transaction(execute_tx, signature)

    async def sign_invoke_v3(
        self,
        calls: Calls,
        *,
        nonce: Optional[int] = None,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
    ) -> InvokeV3:
        invoke_tx = await self._prepare_invoke_v3(
            calls,
            l1_resource_bounds=l1_resource_bounds,
            nonce=nonce,
            auto_estimate=auto_estimate,
        )
        signature = self.signer.sign_transaction(invoke_tx)
        return _add_signature_to_transaction(invoke_tx, signature)

    async def sign_declare_v1(
        self,
        compiled_contract: str,
        *,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> DeclareV1:
        if _is_sierra_contract(json.loads(compiled_contract)):
            raise ValueError(
                "Signing sierra contracts requires using `sign_declare_v2` method."
            )

        declare_tx = await self._make_declare_v1_transaction(
            compiled_contract, nonce=nonce
        )

        max_fee = await self._get_max_fee(
            transaction=declare_tx, max_fee=max_fee, auto_estimate=auto_estimate
        )
        declare_tx = _add_max_fee_to_transaction(declare_tx, max_fee)
        signature = self.signer.sign_transaction(declare_tx)
        return _add_signature_to_transaction(declare_tx, signature)

    async def sign_declare_v2(
        self,
        compiled_contract: str,
        compiled_class_hash: int,
        *,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> DeclareV2:
        declare_tx = await self._make_declare_v2_transaction(
            compiled_contract, compiled_class_hash, nonce=nonce
        )
        max_fee = await self._get_max_fee(
            transaction=declare_tx, max_fee=max_fee, auto_estimate=auto_estimate
        )
        declare_tx = _add_max_fee_to_transaction(declare_tx, max_fee)
        signature = self.signer.sign_transaction(declare_tx)
        return _add_signature_to_transaction(declare_tx, signature)

    async def sign_declare_v3(
        self,
        compiled_contract: str,
        compiled_class_hash: int,
        *,
        nonce: Optional[int] = None,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
    ) -> DeclareV3:
        declare_tx = await self._make_declare_v3_transaction(
            compiled_contract,
            compiled_class_hash,
            nonce=nonce,
        )
        resource_bounds = await self._get_resource_bounds(
            declare_tx, l1_resource_bounds, auto_estimate
        )
        declare_tx = _add_resource_bounds_to_transaction(declare_tx, resource_bounds)

        signature = self.signer.sign_transaction(declare_tx)
        return _add_signature_to_transaction(declare_tx, signature)

    async def _make_declare_v1_transaction(
        self, compiled_contract: str, *, nonce: Optional[int] = None
    ) -> DeclareV1:
        contract_class = create_compiled_contract(compiled_contract=compiled_contract)

        if nonce is None:
            nonce = await self.get_nonce()

        declare_tx = DeclareV1(
            contract_class=contract_class,
            sender_address=self.address,
            max_fee=0,
            signature=[],
            nonce=nonce,
            version=1,
        )
        return declare_tx

    async def _make_declare_v2_transaction(
        self,
        compiled_contract: str,
        compiled_class_hash: int,
        *,
        nonce: Optional[int] = None,
    ) -> DeclareV2:
        contract_class = create_sierra_compiled_contract(
            compiled_contract=compiled_contract
        )

        if nonce is None:
            nonce = await self.get_nonce()

        declare_tx = DeclareV2(
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            sender_address=self.address,
            max_fee=0,
            signature=[],
            nonce=nonce,
            version=2,
        )
        return declare_tx

    async def _make_declare_v3_transaction(
        self,
        compiled_contract: str,
        compiled_class_hash: int,
        *,
        nonce: Optional[int] = None,
    ) -> DeclareV3:
        contract_class = create_sierra_compiled_contract(
            compiled_contract=compiled_contract
        )

        if nonce is None:
            nonce = await self.get_nonce()

        declare_tx = DeclareV3(
            contract_class=contract_class,
            compiled_class_hash=compiled_class_hash,
            sender_address=self.address,
            signature=[],
            nonce=nonce,
            version=3,
            resource_bounds=ResourceBoundsMapping.init_with_zeros(),
        )
        return declare_tx

    async def sign_deploy_account_v1(
        self,
        class_hash: int,
        contract_address_salt: int,
        constructor_calldata: Optional[List[int]] = None,
        *,
        nonce: int = 0,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> DeployAccountV1:
        # pylint: disable=too-many-arguments
        deploy_account_tx = DeployAccountV1(
            class_hash=class_hash,
            contract_address_salt=contract_address_salt,
            constructor_calldata=(constructor_calldata or []),
            version=1,
            max_fee=0,
            signature=[],
            nonce=nonce,
        )

        max_fee = await self._get_max_fee(
            transaction=deploy_account_tx, max_fee=max_fee, auto_estimate=auto_estimate
        )
        deploy_account_tx = _add_max_fee_to_transaction(deploy_account_tx, max_fee)
        signature = self.signer.sign_transaction(deploy_account_tx)
        return _add_signature_to_transaction(deploy_account_tx, signature)

    async def sign_deploy_account_v3(
        self,
        class_hash: int,
        contract_address_salt: int,
        *,
        constructor_calldata: Optional[List[int]] = None,
        nonce: int = 0,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
    ) -> DeployAccountV3:
        # pylint: disable=too-many-arguments
        deploy_account_tx = DeployAccountV3(
            class_hash=class_hash,
            contract_address_salt=contract_address_salt,
            constructor_calldata=(constructor_calldata or []),
            version=3,
            resource_bounds=ResourceBoundsMapping.init_with_zeros(),
            signature=[],
            nonce=nonce,
        )
        resource_bounds = await self._get_resource_bounds(
            deploy_account_tx, l1_resource_bounds, auto_estimate
        )
        deploy_account_tx = _add_resource_bounds_to_transaction(
            deploy_account_tx, resource_bounds
        )

        signature = self.signer.sign_transaction(deploy_account_tx)
        return _add_signature_to_transaction(deploy_account_tx, signature)

    async def execute_v1(
        self,
        calls: Calls,
        *,
        nonce: Optional[int] = None,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> SentTransactionResponse:
        execute_transaction = await self.sign_invoke_v1(
            calls,
            nonce=nonce,
            max_fee=max_fee,
            auto_estimate=auto_estimate,
        )
        return await self._client.send_transaction(execute_transaction)

    async def execute_v3(
        self,
        calls: Calls,
        *,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        nonce: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> SentTransactionResponse:
        execute_transaction = await self.sign_invoke_v3(
            calls,
            l1_resource_bounds=l1_resource_bounds,
            nonce=nonce,
            auto_estimate=auto_estimate,
        )
        return await self._client.send_transaction(execute_transaction)

    def sign_message(self, typed_data: Union[TypedData, TypedDataDict]) -> List[int]:
        if isinstance(typed_data, TypedData):
            return self.signer.sign_message(typed_data, self.address)
        typed_data_dataclass = TypedData.from_dict(typed_data)
        return self.signer.sign_message(typed_data_dataclass, self.address)

    def verify_message(
        self, typed_data: Union[TypedData, TypedDataDict], signature: List[int]
    ) -> bool:
        if not isinstance(typed_data, TypedData):
            typed_data = TypedData.from_dict(typed_data)
        message_hash = typed_data.message_hash(account_address=self.address)
        return verify_message_signature(message_hash, signature, self.signer.public_key)

    @staticmethod
    async def deploy_account_v1(
        *,
        address: AddressRepresentation,
        class_hash: int,
        salt: int,
        key_pair: KeyPair,
        client: Client,
        constructor_calldata: Optional[List[int]] = None,
        nonce: int = 0,
        max_fee: Optional[int] = None,
        auto_estimate: bool = False,
    ) -> AccountDeploymentResult:
        # pylint: disable=too-many-arguments, too-many-locals

        """
        Deploys an account contract with provided class_hash on Starknet and returns
        an AccountDeploymentResult that allows waiting for transaction acceptance.

        Provided address must be first prefunded with enough tokens, otherwise the method will fail.

        If using Client for MAINNET, SEPOLIA or SEPOLIA_INTEGRATION, this method will verify
        if the address balance is high enough to cover deployment costs.

        :param address: Calculated and prefunded address of the new account.
        :param class_hash: Class hash of the account contract to be deployed.
        :param salt: Salt used to calculate the address.
        :param key_pair: KeyPair used to calculate address and sign deploy account transaction.
        :param client: Client instance used for deployment.
        :param constructor_calldata: Optional calldata to account contract constructor. If ``None`` is passed,
            ``[key_pair.public_key]`` will be used as calldata.
        :param nonce: Nonce of the transaction.
        :param max_fee: Max fee to be paid for deployment, must be less or equal to the amount of tokens prefunded.
        :param auto_estimate: Use automatic fee estimation, not recommend as it may lead to high costs.
        """
        calldata = (
            constructor_calldata
            if constructor_calldata is not None
            else [key_pair.public_key]
        )

        chain = await client.get_chain_id()

        account = _prepare_account_to_deploy(
            address=address,
            class_hash=class_hash,
            salt=salt,
            key_pair=key_pair,
            client=client,
            chain=chain,
            calldata=calldata,
        )

        deploy_account_tx = await account.sign_deploy_account_v1(
            class_hash=class_hash,
            contract_address_salt=salt,
            constructor_calldata=calldata,
            nonce=nonce,
            max_fee=max_fee,
            auto_estimate=auto_estimate,
        )

        if parse_chain(chain) in RECOGNIZED_CHAIN_IDS:
            balance = await account.get_balance()
            if balance < deploy_account_tx.max_fee:
                raise ValueError(
                    "Not enough tokens at the specified address to cover deployment costs."
                )

        result = await client.deploy_account(deploy_account_tx)

        return AccountDeploymentResult(
            hash=result.transaction_hash, account=account, _client=account.client
        )

    @staticmethod
    async def deploy_account_v3(
        *,
        address: AddressRepresentation,
        class_hash: int,
        salt: int,
        key_pair: KeyPair,
        client: Client,
        constructor_calldata: Optional[List[int]] = None,
        nonce: int = 0,
        l1_resource_bounds: Optional[ResourceBounds] = None,
        auto_estimate: bool = False,
    ) -> AccountDeploymentResult:
        # pylint: disable=too-many-arguments

        """
        Deploys an account contract with provided class_hash on Starknet and returns
        an AccountDeploymentResult that allows waiting for transaction acceptance.

        Provided address must be first prefunded with enough tokens, otherwise the method will fail.

        :param address: Calculated and prefunded address of the new account.
        :param class_hash: Class hash of the account contract to be deployed.
        :param salt: Salt used to calculate the address.
        :param key_pair: KeyPair used to calculate address and sign deploy account transaction.
        :param client: Client instance used for deployment.
        :param constructor_calldata: Optional calldata to account contract constructor. If ``None`` is passed,
            ``[key_pair.public_key]`` will be used as calldata.
        :param nonce: Nonce of the transaction.
        :param l1_resource_bounds: Max amount and max price per unit of L1 gas (in Fri) used when executing
            this transaction.
        :param auto_estimate: Use automatic fee estimation, not recommend as it may lead to high costs.
        """
        calldata = (
            constructor_calldata
            if constructor_calldata is not None
            else [key_pair.public_key]
        )

        chain = await client.get_chain_id()

        account = _prepare_account_to_deploy(
            address=address,
            class_hash=class_hash,
            salt=salt,
            key_pair=key_pair,
            client=client,
            chain=chain,
            calldata=calldata,
        )

        deploy_account_tx = await account.sign_deploy_account_v3(
            class_hash=class_hash,
            contract_address_salt=salt,
            constructor_calldata=calldata,
            nonce=nonce,
            l1_resource_bounds=l1_resource_bounds,
            auto_estimate=auto_estimate,
        )

        result = await client.deploy_account(deploy_account_tx)

        return AccountDeploymentResult(
            hash=result.transaction_hash, account=account, _client=account.client
        )

    async def _get_chain_id(self) -> int:
        if self._chain_id is None:
            chain = await self._client.get_chain_id()
            self._chain_id = parse_chain(chain)

        return self._chain_id


def _prepare_account_to_deploy(
    address: AddressRepresentation,
    class_hash: int,
    salt: int,
    key_pair: KeyPair,
    client: Client,
    chain: Chain,
    calldata: List[int],
) -> Account:
    # pylint: disable=too-many-arguments
    address = parse_address(address)

    if address != (
        computed := compute_address(
            salt=salt,
            class_hash=class_hash,
            constructor_calldata=calldata,
            deployer_address=0,
        )
    ):
        raise ValueError(
            f"Provided address {hex(address)} is different than computed address {hex(computed)} "
            f"for the given class_hash and salt."
        )

    return Account(
        address=address,
        client=client,
        key_pair=key_pair,
        chain=chain,
    )


def _is_sierra_contract(data: Dict[str, Any]) -> bool:
    return "sierra_program" in data


def _add_signature_to_transaction(
    tx: TypeAccountTransaction, signature: List[int]
) -> TypeAccountTransaction:
    return dataclasses.replace(tx, signature=signature)


def _add_max_fee_to_transaction(
    tx: TypeAccountTransaction, max_fee: int
) -> TypeAccountTransaction:
    return dataclasses.replace(tx, max_fee=max_fee)


def _add_resource_bounds_to_transaction(
    tx: TypeAccountTransaction, resource_bounds: ResourceBoundsMapping
) -> TypeAccountTransaction:
    return dataclasses.replace(tx, resource_bounds=resource_bounds)


def _parse_calls(cairo_version: int, calls: Calls) -> List[int]:
    if cairo_version == 1:
        parsed_calls = _parse_calls_cairo_v1(ensure_iterable(calls))
        wrapped_calldata = _execute_payload_serializer_v1.serialize(
            {"calls": parsed_calls}
        )
    else:
        call_descriptions, calldata = _merge_calls(ensure_iterable(calls))
        wrapped_calldata = _execute_payload_serializer_v0.serialize(
            {"call_array": call_descriptions, "calldata": calldata}
        )
    return wrapped_calldata


def _parse_call_cairo_v0(call: Call, entire_calldata: List) -> Tuple[Dict, List]:
    _data = {
        "to": call.to_addr,
        "selector": call.selector,
        "data_offset": len(entire_calldata),
        "data_len": len(call.calldata),
    }
    entire_calldata += call.calldata

    return _data, entire_calldata


def _merge_calls(calls: Iterable[Call]) -> Tuple[List[Dict], List[int]]:
    call_descriptions = []
    entire_calldata = []
    for call in calls:
        data, entire_calldata = _parse_call_cairo_v0(call, entire_calldata)
        call_descriptions.append(data)

    return call_descriptions, entire_calldata


def _parse_calls_cairo_v1(calls: Iterable[Call]) -> List[Dict]:
    calls_parsed = []
    for call in calls:
        _data = {
            "to": call.to_addr,
            "selector": call.selector,
            "calldata": call.calldata,
        }
        calls_parsed.append(_data)

    return calls_parsed


_felt_serializer = FeltSerializer()
_call_description_cairo_v0 = StructSerializer(
    OrderedDict(
        to=_felt_serializer,
        selector=_felt_serializer,
        data_offset=_felt_serializer,
        data_len=_felt_serializer,
    )
)
_call_description_cairo_v1 = StructSerializer(
    OrderedDict(
        to=_felt_serializer,
        selector=_felt_serializer,
        calldata=ArraySerializer(_felt_serializer),
    )
)

_execute_payload_serializer_v0 = PayloadSerializer(
    OrderedDict(
        call_array=ArraySerializer(_call_description_cairo_v0),
        calldata=ArraySerializer(_felt_serializer),
    )
)
_execute_payload_serializer_v1 = PayloadSerializer(
    OrderedDict(
        calls=ArraySerializer(_call_description_cairo_v1),
    )
)
