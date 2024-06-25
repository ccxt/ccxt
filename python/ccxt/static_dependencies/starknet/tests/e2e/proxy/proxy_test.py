from typing import Optional

import pytest

from contract import Contract
from hash.storage import get_storage_var_address
from net.client import Client
from net.client_errors import ContractNotFoundError
from net.models import Address
from proxy.contract_abi_resolver import ProxyResolutionError
from proxy.proxy_check import ProxyCheck
from tests.e2e.fixtures.constants import MAX_FEE


async def is_map_working_properly(map_contract: Contract, key: int, val: int) -> bool:
    """Put (key, val) into map_contract's storage and check if value under the key is val"""
    await (
        await map_contract.functions["put"].invoke_v1(key, val, max_fee=int(1e16))
    ).wait_for_acceptance()
    (result,) = await map_contract.functions["get"].call(key=key)
    return result == val


@pytest.mark.asyncio
async def test_contract_from_address_no_proxy(account, map_contract):
    contract = await Contract.from_address(
        address=map_contract.address,
        provider=account,
    )

    assert contract.functions.keys() == {"put", "get"}
    assert contract.address == map_contract.address
    assert await is_map_working_properly(map_contract=contract, key=69, val=13)


@pytest.mark.asyncio
async def test_contract_from_address_with_proxy(account, proxy_oz_argent):
    proxy_contract = await Contract.from_address(
        address=proxy_oz_argent.deployed_contract.address,
        provider=account,
    )
    proxied_contract = await Contract.from_address(
        address=proxy_oz_argent.deployed_contract.address,
        provider=account,
        proxy_config=True,
    )

    assert proxied_contract.functions.keys() == {"put", "get"}
    assert proxied_contract.address == proxy_contract.address
    assert await is_map_working_properly(map_contract=proxied_contract, key=69, val=13)


@pytest.mark.asyncio
async def test_contract_from_invalid_address(account):
    with pytest.raises(ContractNotFoundError):
        await Contract.from_address(
            address=123,
            provider=account,
        )


@pytest.mark.asyncio
async def test_contract_from_address_invalid_proxy_checks(account, proxy_custom):
    message_regex = r"Couldn't resolve proxy using given ProxyChecks .*"

    with pytest.raises(ProxyResolutionError, match=message_regex):
        await Contract.from_address(
            address=proxy_custom.deployed_contract.address,
            provider=account,
            proxy_config=True,
        )


@pytest.mark.asyncio
async def test_contract_from_address_custom_proxy_check(account, proxy_custom):
    class CustomProxyCheck(ProxyCheck):
        async def implementation_address(
            self, address: Address, client: Client
        ) -> Optional[int]:
            return None

        async def implementation_hash(
            self, address: Address, client: Client
        ) -> Optional[int]:
            return await client.get_storage_at(
                contract_address=address,
                key=get_storage_var_address("Proxy_implementation_hash_custom"),
                block_hash="latest",
            )

    contract = await Contract.from_address(
        address=proxy_custom.deployed_contract.address,
        provider=account,
        proxy_config={"proxy_checks": [CustomProxyCheck()]},
    )

    assert contract.functions.keys() == {"put", "get"}
    assert contract.address == proxy_custom.deployed_contract.address
    assert await is_map_working_properly(map_contract=contract, key=69, val=13)


@pytest.mark.asyncio
async def test_contract_from_address_with_old_address_proxy(
    account, old_proxy, map_contract
):
    declare_result = await Contract.declare_v1(
        account=account, compiled_contract=old_proxy, max_fee=MAX_FEE
    )
    await declare_result.wait_for_acceptance()
    deploy_result = await declare_result.deploy_v1(
        constructor_args={"implementation_address": map_contract.address},
        max_fee=MAX_FEE,
    )
    await deploy_result.wait_for_acceptance()

    proxy_contract = await Contract.from_address(
        address=deploy_result.deployed_contract.address,
        provider=account,
    )
    proxied_contract = await Contract.from_address(
        address=deploy_result.deployed_contract.address,
        provider=account,
        proxy_config=True,
    )

    assert proxied_contract.functions.keys() == {"put", "get"}
    assert proxied_contract.address == proxy_contract.address
    assert await is_map_working_properly(map_contract=proxied_contract, key=69, val=13)
