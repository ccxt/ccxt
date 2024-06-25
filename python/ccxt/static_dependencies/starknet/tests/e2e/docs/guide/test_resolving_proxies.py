from typing import Optional

import pytest

from hash.selector import get_selector_from_name
from net.client import Client
from net.client_models import Call
from net.models import Address
from proxy.contract_abi_resolver import ProxyConfig
from proxy.proxy_check import ArgentProxyCheck, ProxyCheck


@pytest.mark.asyncio
async def test_resolving_proxies(
    account,
    map_contract,
    proxy_impl_func,
    proxy_oz_argent,
):
    # pylint: disable=import-outside-toplevel
    # docs-1: start
    from contract import Contract

    # docs-1: end
    address = map_contract.address
    # docs-1: start
    # Getting the direct contract from address
    contract = await Contract.from_address(address=address, provider=account)

    # docs-1: end
    address = proxy_oz_argent.deployed_contract.address
    # docs-1: start
    # To use contract behind a proxy as a regular contract, set proxy_config to True
    # It will check if your proxy is OpenZeppelin proxy / ArgentX proxy
    contract = await Contract.from_address(
        address=address, provider=account, proxy_config=True
    )

    # After that contract can be used as usual
    # docs-1: end
    # docs-2: start
    # To resolve proxy contract other than OpenZeppelin / ArgentX, a custom ProxyCheck is needed
    # The ProxyCheck below resolves proxy contracts which have implementation
    # stored in impl() function as class hash
    class CustomProxyCheck(ProxyCheck):
        async def implementation_address(
            self, address: Address, client: Client
        ) -> Optional[int]:
            # Note that None is returned, since our custom Proxy uses
            # the class hash of another contract as implementation and not the address
            return None

        async def implementation_hash(
            self, address: Address, client: Client
        ) -> Optional[int]:
            call = Call(
                to_addr=address,
                selector=get_selector_from_name("impl"),
                calldata=[],
            )
            (implementation,) = await client.call_contract(call=call)
            return implementation

    # Create ProxyConfig with the CustomProxyCheck
    proxy_config = ProxyConfig(proxy_checks=[CustomProxyCheck()])

    # More ProxyCheck instances can be passed to proxy_checks for it to be flexible
    proxy_config = ProxyConfig(proxy_checks=[CustomProxyCheck(), ArgentProxyCheck()])

    # docs-2: end
    address = proxy_impl_func.deployed_contract.address
    # docs-2: start
    contract = await Contract.from_address(
        address=address, provider=account, proxy_config=proxy_config
    )
    # docs-2: end

    assert contract.functions.keys() == {"put", "get"}
