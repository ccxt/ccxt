import os

import pytest

from tests.e2e.fixtures.constants import MAX_FEE

directory = os.path.dirname(__file__)


@pytest.mark.asyncio
async def test_using_account(account, map_compiled_contract):
    # pylint: disable=import-outside-toplevel, duplicate-code, too-many-locals
    # docs: start
    from contract import Contract

    # docs: end
    # docs: start
    # Declare and deploy an example contract which implements a simple k-v store.
    declare_result = await Contract.declare_v1(
        account=account, compiled_contract=map_compiled_contract, max_fee=MAX_FEE
    )
    await declare_result.wait_for_acceptance()
    deploy_result = await declare_result.deploy_v1(max_fee=MAX_FEE)
    # Wait until deployment transaction is accepted
    await deploy_result.wait_for_acceptance()

    # Get deployed contract
    map_contract = deploy_result.deployed_contract
    k, v = 13, 4324
    # Adds a transaction to mutate the state of k-v store. The call goes through account proxy, because we've used
    # Account to create the contract object
    await (
        await map_contract.functions["put"].invoke_v1(k, v, max_fee=int(1e16))
    ).wait_for_acceptance()

    # Retrieves the value, which is equal to 4324 in this case
    (resp,) = await map_contract.functions["get"].call(k)

    # There is a possibility of invoking the multicall

    # Creates a list of prepared function calls
    calls = [
        map_contract.functions["put"].prepare_invoke_v1(key=10, value=20),
        map_contract.functions["put"].prepare_invoke_v1(key=30, value=40),
    ]

    # Executes only one transaction with prepared calls
    transaction_response = await account.execute_v1(calls=calls, max_fee=int(1e16))
    await account.client.wait_for_tx(transaction_response.transaction_hash)
    # docs: end

    assert resp == v
