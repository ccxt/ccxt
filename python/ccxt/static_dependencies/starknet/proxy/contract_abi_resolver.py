import json
import re
from enum import Enum
from typing import AsyncGenerator, List, Tuple, TypedDict, Union, cast

from abi.v0.shape import AbiDictList
from constants import (
    RPC_CLASS_HASH_NOT_FOUND_ERROR,
    RPC_CONTRACT_ERROR,
    RPC_CONTRACT_NOT_FOUND_ERROR,
    RPC_INVALID_MESSAGE_SELECTOR_ERROR,
)
from net.client import Client
from net.client_errors import ClientError, ContractNotFoundError
from net.client_models import ContractClass, SierraContractClass
from net.models import Address
from proxy.proxy_check import (
    ArgentProxyCheck,
    OpenZeppelinProxyCheck,
    ProxyCheck,
)


class ProxyConfig(TypedDict, total=False):
    """
    Proxy resolving configuration.
    """

    proxy_checks: List[ProxyCheck]
    """
    List of classes implementing :class:`~starknet_py.proxy.proxy_check.ProxyCheck` ABC,
    that will be used for checking if contract at the address is a proxy contract.
    """


def prepare_proxy_config(proxy_config: ProxyConfig) -> ProxyConfig:
    if "proxy_checks" in proxy_config:
        return proxy_config

    proxy_checks = [
        OpenZeppelinProxyCheck(),
        ArgentProxyCheck(),
    ]
    return {"proxy_checks": proxy_checks}


class ImplementationType(Enum):
    """
    Enum representing transaction types
    """

    CLASS_HASH = "class_hash"
    ADDRESS = "address"


class ContractAbiResolver:
    """
    Class for resolving abi of a contract
    """

    def __init__(
        self,
        address: Address,
        client: Client,
        proxy_config: ProxyConfig,
    ):
        """
        :param address: Contract's address
        :param client: Client used for resolving abi
        :param proxy_config: Proxy config for resolving proxy
        """
        self.address = address
        self.client = client
        self.proxy_config = proxy_config

    async def resolve(self) -> Tuple[AbiDictList, int]:
        """
        Returns abi and cairo version of either direct contract
        or contract proxied by direct contract depending on proxy_config.

        :raises ContractNotFoundError: when contract could not be found at address
        :raises ProxyResolutionError: when given ProxyChecks were not sufficient to resolve proxy
        :raises AbiNotFoundError: when abi is not present in contract class at address
        """
        if len(self.proxy_config) == 0:
            return await self.get_abi_for_address()
        return await self.resolve_abi()

    async def get_abi_for_address(self) -> Tuple[AbiDictList, int]:
        """
        Returns abi and cairo version of a contract directly from address.

        :raises ContractNotFoundError: when contract could not be found at address
        :raises AbiNotFoundError: when abi is not present in contract class at address
        """
        contract_class = await _get_class_at(address=self.address, client=self.client)

        if contract_class.abi is None:
            raise AbiNotFoundError()

        return self._get_abi_from_contract_class(
            contract_class
        ), self._get_cairo_version(contract_class)

    async def resolve_abi(self) -> Tuple[AbiDictList, int]:
        """
        Returns abi and cairo version of a contract that is being proxied by contract at address.

        :raises ContractNotFoundError: when contract could not be found at address
        :raises ProxyResolutionError: when given ProxyChecks were not sufficient to resolve proxy
        :raises AbiNotFoundError: when abi is not present in proxied contract class at address
        """
        implementation_generator = self._get_implementation_from_proxy()

        # implementation is either a class_hash or address
        async for implementation, implementation_type in implementation_generator:
            try:
                if implementation_type == ImplementationType.CLASS_HASH:
                    contract_class = await self.client.get_class_by_hash(implementation)
                else:
                    contract_class = await _get_class_at(
                        address=implementation, client=self.client
                    )

                if contract_class.abi is None:
                    # Some contract_class has been found, but it does not have abi
                    raise AbiNotFoundError()

                return self._get_abi_from_contract_class(
                    contract_class
                ), self._get_cairo_version(contract_class)
            except ClientError as err:
                if not (
                    "is not declared" in err.message
                    or err.code == RPC_CLASS_HASH_NOT_FOUND_ERROR
                    or isinstance(err, ContractNotFoundError)
                ):
                    raise err

        raise ProxyResolutionError(self.proxy_config.get("proxy_checks", []))

    @staticmethod
    def _get_cairo_version(
        contract_class: Union[ContractClass, SierraContractClass]
    ) -> int:
        return 1 if isinstance(contract_class, SierraContractClass) else 0

    @staticmethod
    def _get_abi_from_contract_class(
        contract_class: Union[ContractClass, SierraContractClass]
    ) -> AbiDictList:
        return (
            cast(AbiDictList, contract_class.abi)
            if isinstance(contract_class, ContractClass)
            else json.loads(cast(str, contract_class.abi))
        )

    async def _get_implementation_from_proxy(
        self,
    ) -> AsyncGenerator[Tuple[int, ImplementationType], None]:
        proxy_checks = self.proxy_config.get("proxy_checks", [])
        for proxy_check in proxy_checks:
            try:
                implementation = await proxy_check.implementation_hash(
                    address=self.address, client=self.client
                )
                if implementation is not None:
                    yield implementation, ImplementationType.CLASS_HASH

                implementation = await proxy_check.implementation_address(
                    address=self.address, client=self.client
                )
                if implementation is not None:
                    yield implementation, ImplementationType.ADDRESS
            except ClientError as err:
                err_msg = (
                    r"(Entry point ((0x[0-9a-f]+)|(EntryPointSelector\(StarkFelt\(\"0x[0-9a-f]+)\"\)\))"
                    r" not found in contract)|(is not declared)|(is not deployed)"
                )
                if not (
                    re.search(err_msg, err.message, re.IGNORECASE)
                    or err.code
                    in [
                        RPC_CLASS_HASH_NOT_FOUND_ERROR,
                        RPC_CONTRACT_NOT_FOUND_ERROR,
                        RPC_CONTRACT_ERROR,
                        RPC_INVALID_MESSAGE_SELECTOR_ERROR,  # removed in RPC v0.3.0, backwards compatibility for nodes
                    ]
                ):
                    raise err


class AbiNotFoundError(Exception):
    """
    Error while resolving contract abi.
    """


class ProxyResolutionError(Exception):
    """
    Error while resolving proxy using ProxyChecks.
    """

    DOCS = "https://starknetpy.readthedocs.io/en/latest/guide/resolving_proxy_contracts.html#proxychecks"

    def __init__(
        self,
        proxy_checks: List[ProxyCheck],
    ):
        proxy_check_names = tuple(
            proxy_check.__class__.__name__ for proxy_check in proxy_checks
        )
        proxy_checks_str = " " + str(proxy_check_names) if proxy_check_names else ""
        self.message = f"""Couldn't resolve proxy using given ProxyChecks{proxy_checks_str}.
        See {self.DOCS} for a guide on writing own ProxyChecks."""
        super().__init__(self.message)


async def _get_class_at(
    address: Address, client: Client
) -> Union[ContractClass, SierraContractClass]:
    try:
        contract_class_hash = await client.get_class_hash_at(contract_address=address)
        contract_class = await client.get_class_by_hash(class_hash=contract_class_hash)
    except ClientError as err:
        if (
            "is not deployed" in err.message
            or err.code == RPC_CLASS_HASH_NOT_FOUND_ERROR
            or err.code == RPC_CONTRACT_NOT_FOUND_ERROR
        ):
            raise ContractNotFoundError(address=address) from err
        raise err

    return contract_class
