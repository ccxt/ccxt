# pylint: disable=unused-variable
import pytest

from contract import Contract
from net.account.account import Account
from net.full_node_client import FullNodeClient
from net.models import StarknetChainId
from net.signer.stark_curve_signer import KeyPair


def test_init():
    # docs-start: init
    contract = Contract(
        address=0x123,
        abi=[
            {
                "inputs": [{"name": "amount", "type": "felt"}],
                "name": "increase_balance",
                "outputs": [],
                "type": "function",
            },
        ],
        provider=Account(
            address=0x321,
            client=FullNodeClient(node_url="your.node.url"),
            key_pair=KeyPair(12, 34),
            chain=StarknetChainId.SEPOLIA,
        ),
        cairo_version=0,
    )
    # docs-end: init


@pytest.mark.asyncio
async def test_from_address(account, contract_address):
    # docs-start: from_address
    address = 1 or 0x1 or "0x1"
    # docs-end: from_address
    address = contract_address
    # docs-start: from_address
    contract = await Contract.from_address(address=address, provider=account)
    # or if the contract is a proxy (read more about resolving proxies in the `Guide`)
    config = True
    # docs-end: from_address
    config = False
    # docs-start: from_address
    contract = await Contract.from_address(
        address=address, provider=account, proxy_config=config
    )
    # docs-end: from_address


@pytest.mark.asyncio
async def test_declare(account, custom_proxy):
    compiled_contract = custom_proxy
    # docs-start: declare
    declare_result = await Contract.declare_v1(
        account=account, compiled_contract=compiled_contract, max_fee=int(1e15)
    )
    # docs-end: declare


@pytest.mark.asyncio
async def test_deploy_contract(account, class_hash):
    # docs-start: deploy_contract
    deploy_result = await Contract.deploy_contract_v1(
        account=account,
        class_hash=class_hash,
        abi=[
            {
                "inputs": [{"name": "amount", "type": "felt"}],
                "name": "increase_balance",
                "outputs": [],
                "type": "function",
            }
        ],
        max_fee=int(1e15),
    )
    # or when contract has a constructor with arguments
    deploy_result = await Contract.deploy_contract_v1(
        account=account,
        class_hash=class_hash,
        abi=[
            {
                "inputs": [{"name": "value", "type": "felt"}],
                "name": "constructor",
                "outputs": [],
                "type": "constructor",
            },
        ],
        constructor_args={"value": 1},
        max_fee=int(1e15),
    )
    # docs-end: deploy_contract


def test_compute_address(custom_proxy):
    compiled_contract = custom_proxy
    # docs-start: compute_address
    address = Contract.compute_address(
        salt=1, compiled_contract=compiled_contract, constructor_args=[1, 2, [2]]
    )
    # docs-end: compute_address
