import dataclasses
import re
from unittest.mock import Mock

import pytest

from common import create_sierra_compiled_contract
from contract import Contract, DeclareResult
from net.client_models import InvokeTransactionV1, InvokeTransactionV3
from net.models import DeclareV2
from tests.e2e.fixtures.constants import MAX_FEE, MAX_RESOURCE_BOUNDS_L1
from tests.e2e.fixtures.misc import load_contract


@pytest.mark.asyncio
async def test_declare_deploy_v1(
    account,
    cairo1_minimal_contract_class_hash: int,
):
    compiled_contract = load_contract("MinimalContract")["sierra"]

    declare_result = DeclareResult(
        _account=account,
        _client=account.client,
        _cairo_version=1,
        class_hash=cairo1_minimal_contract_class_hash,
        compiled_contract=compiled_contract,
        hash=0,
        declare_transaction=Mock(spec=DeclareV2),
    )

    deploy_result = await declare_result.deploy_v1(max_fee=MAX_FEE)
    await deploy_result.wait_for_acceptance()

    assert isinstance(deploy_result.hash, int)
    assert deploy_result.hash != 0
    assert deploy_result.deployed_contract.address != 0


@pytest.mark.asyncio
async def test_declare_deploy_v3(
    account,
    cairo1_minimal_contract_class_hash: int,
):
    compiled_contract = load_contract("MinimalContract")["sierra"]

    declare_result = DeclareResult(
        _account=account,
        _client=account.client,
        _cairo_version=1,
        class_hash=cairo1_minimal_contract_class_hash,
        compiled_contract=compiled_contract,
        hash=0,
        declare_transaction=Mock(spec=DeclareV2),
    )

    deploy_result = await declare_result.deploy_v3(
        l1_resource_bounds=MAX_RESOURCE_BOUNDS_L1
    )
    await deploy_result.wait_for_acceptance()

    assert isinstance(deploy_result.hash, int)
    assert deploy_result.hash != 0
    assert deploy_result.deployed_contract.address != 0


@pytest.mark.asyncio
async def test_throws_on_wrong_abi(account, cairo1_minimal_contract_class_hash: int):
    compiled_contract = load_contract("MinimalContract")["sierra"]

    declare_result = DeclareResult(
        _account=account,
        _client=account.client,
        _cairo_version=1,
        class_hash=cairo1_minimal_contract_class_hash,
        compiled_contract=compiled_contract,
        hash=0,
        declare_transaction=Mock(spec=DeclareV2),
    )

    compiled_contract = compiled_contract.replace('"abi":[', '"api": ')

    declare_result = dataclasses.replace(
        declare_result, compiled_contract=compiled_contract
    )
    with pytest.raises(
        ValueError,
        match=re.escape(
            "Contract's ABI can't be converted to format List[Dict]. "
            "Make sure provided compiled_contract is correct."
        ),
    ):
        await declare_result.deploy_v1(max_fee=MAX_FEE)


@pytest.mark.asyncio
async def test_deploy_contract_v1(account, cairo1_hello_starknet_class_hash: int):
    compiled_contract = load_contract("HelloStarknet")["sierra"]
    abi = create_sierra_compiled_contract(
        compiled_contract=compiled_contract
    ).parsed_abi

    deploy_result = await Contract.deploy_contract_v1(
        class_hash=cairo1_hello_starknet_class_hash,
        account=account,
        abi=abi,
        max_fee=MAX_FEE,
        cairo_version=1,
    )
    await deploy_result.wait_for_acceptance()

    contract = deploy_result.deployed_contract

    assert isinstance(contract.address, int)
    assert len(contract.functions) != 0

    transaction = await account.client.get_transaction(tx_hash=deploy_result.hash)
    assert isinstance(transaction, InvokeTransactionV1)

    class_hash = await account.client.get_class_hash_at(
        contract_address=contract.address
    )
    assert class_hash == cairo1_hello_starknet_class_hash


@pytest.mark.asyncio
async def test_deploy_contract_v3(account, cairo1_hello_starknet_class_hash: int):
    compiled_contract = load_contract("HelloStarknet")["sierra"]
    abi = create_sierra_compiled_contract(
        compiled_contract=compiled_contract
    ).parsed_abi

    deploy_result = await Contract.deploy_contract_v3(
        class_hash=cairo1_hello_starknet_class_hash,
        account=account,
        abi=abi,
        l1_resource_bounds=MAX_RESOURCE_BOUNDS_L1,
        cairo_version=1,
    )
    await deploy_result.wait_for_acceptance()

    contract = deploy_result.deployed_contract
    assert isinstance(contract.address, int)
    assert len(contract.functions) != 0

    transaction = await account.client.get_transaction(tx_hash=deploy_result.hash)
    assert isinstance(transaction, InvokeTransactionV3)

    class_hash = await account.client.get_class_hash_at(
        contract_address=contract.address
    )
    assert class_hash == cairo1_hello_starknet_class_hash


@pytest.mark.asyncio
async def test_general_simplified_deployment_flow(account, map_compiled_contract):
    declare_result = await Contract.declare_v1(
        account=account,
        compiled_contract=map_compiled_contract,
        max_fee=MAX_FEE,
    )
    await declare_result.wait_for_acceptance()
    deployment = await declare_result.deploy_v1(max_fee=MAX_FEE)
    await deployment.wait_for_acceptance()

    contract = deployment.deployed_contract

    assert isinstance(contract.address, int)
    assert len(contract.functions) != 0
