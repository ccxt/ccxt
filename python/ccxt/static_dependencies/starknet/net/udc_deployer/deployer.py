from __future__ import annotations

import random
from typing import List, NamedTuple, Optional, Union, cast

from abi.v0 import AbiParser
from common import int_from_hex
from constants import DEFAULT_DEPLOYER_ADDRESS, FIELD_PRIME
from hash.address import compute_address
from hash.selector import get_selector_from_name
from hash.utils import pedersen_hash
from ..client_models import Call, Hash
from ..models import AddressRepresentation, parse_address
from serialization import serializer_for_function
from ...utils.constructor_args_translator import translate_constructor_args


class ContractDeployment(NamedTuple):
    """
    NamedTuple containing call that can be executed to deploy a contract and
    an address of the contract that will be deployed.
    """

    call: Call
    """
    A call that can be executed to deploy a contract on Starknet.
    """

    address: int
    """
    An address of the contract after deployment.
    """


class Deployer:
    """
    Deployer used to deploy contracts through Universal Deployer Contract (UDC)
    """

    def __init__(
        self,
        *,
        deployer_address: AddressRepresentation = DEFAULT_DEPLOYER_ADDRESS,
        account_address: Optional[AddressRepresentation] = None,
    ):
        """
        :param deployer_address: Address of the UDC. Is set to the address of
            the default UDC (same address on real nets and devnet) by default.
            Must be set when using custom network other than devnet.
        :param account_address: Should be equal to the address of the account which will send the transaction.
            If passed, it will be used to modify the salt, otherwise, salt will not be affected.
        """

        self.deployer_address = parse_address(deployer_address)
        self.account_address = account_address
        self._unique = account_address is not None

    def create_contract_deployment(
        self,
        class_hash: Hash,
        *,
        salt: Optional[int] = None,
        abi: Optional[List] = None,
        cairo_version: int = 1,
        calldata: Optional[Union[List, dict]] = None,
    ) -> ContractDeployment:
        """
        Creates ContractDeployment with a call to the UDC contract.

        :param class_hash: The class_hash of the contract to be deployed.
        :param salt: The salt for a contract to be deployed. Random value is selected if it is not provided.
        :param abi: ABI of the contract to be deployed.
        :param cairo_version: Version of the Cairo [0 or 1] in which contract to be deployed is written.
            Used when abi is provided.
        :param calldata: Constructor args of the contract to be deployed.
        :return: NamedTuple with call and address of the contract to be deployed.
        """
        if not abi and calldata:
            raise ValueError("Argument calldata was provided without an ABI.")

        raw_calldata = translate_constructor_args(
            abi=abi or [], constructor_args=calldata, cairo_version=cairo_version
        )

        return self.create_contract_deployment_raw(
            class_hash=class_hash, salt=salt, raw_calldata=raw_calldata
        )

    def create_contract_deployment_raw(
        self,
        class_hash: Hash,
        *,
        salt: Optional[int] = None,
        raw_calldata: Optional[List[int]] = None,
    ) -> ContractDeployment:
        """
        Creates ContractDeployment with a call to the UDC contract with plain Cairo calldata.

        :param class_hash: The class_hash of the contract to be deployed.
        :param salt: The salt for a contract to be deployed. Random value is selected if it is not provided.
        :param raw_calldata: Plain Cairo constructor args of the contract to be deployed.
        :return: NamedTuple with call and address of the contract to be deployed.
        """
        salt = cast(int, _get_random_salt() if salt is None else salt)
        class_hash = int_from_hex(class_hash)

        calldata = _deployer_serializer.serialize(
            classHash=class_hash,
            salt=salt,
            unique=int(self._unique),
            calldata=raw_calldata or [],
        )

        call = Call(
            to_addr=self.deployer_address,
            selector=get_selector_from_name("deployContract"),
            calldata=calldata,
        )

        address = self._compute_address(salt, class_hash, raw_calldata or [])

        return ContractDeployment(call=call, address=address)

    def _compute_address(
        self, salt: int, class_hash: int, constructor_calldata: List[int]
    ) -> int:
        deployer_address = self.deployer_address if self._unique else 0
        salt = (
            pedersen_hash(parse_address(self.account_address), salt)
            if self.account_address is not None
            else salt
        )
        return compute_address(
            class_hash=class_hash,
            constructor_calldata=constructor_calldata,
            salt=salt,
            deployer_address=deployer_address,
        )


def _get_random_salt() -> int:
    return random.Random().randrange(0, FIELD_PRIME)


_deployer_abi = AbiParser(
    [
        {
            "data": [
                {"name": "address", "type": "felt"},
                {"name": "deployer", "type": "felt"},
                {"name": "unique", "type": "felt"},
                {"name": "classHash", "type": "felt"},
                {"name": "calldata_len", "type": "felt"},
                {"name": "calldata", "type": "felt*"},
                {"name": "salt", "type": "felt"},
            ],
            "keys": [],
            "name": "ContractDeployed",
            "type": "event",
        },
        {
            "inputs": [
                {"name": "classHash", "type": "felt"},
                {"name": "salt", "type": "felt"},
                {"name": "unique", "type": "felt"},
                {"name": "calldata_len", "type": "felt"},
                {"name": "calldata", "type": "felt*"},
            ],
            "name": "deployContract",
            "outputs": [{"name": "address", "type": "felt"}],
            "type": "function",
        },
    ]
).parse()

_deployer_serializer = serializer_for_function(
    _deployer_abi.functions["deployContract"]
)
