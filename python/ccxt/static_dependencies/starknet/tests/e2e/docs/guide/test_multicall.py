import pytest


@pytest.mark.asyncio
async def test_multicall(account, deployed_balance_contract):
    # pylint: disable=import-outside-toplevel
    balance_contract = deployed_balance_contract
    (initial_balance,) = await balance_contract.functions["get_balance"].call()
    # docs: start
    from hash.selector import get_selector_from_name
    from net.client_models import Call

    increase_balance_by_20_call = Call(
        to_addr=balance_contract.address,
        selector=get_selector_from_name("increase_balance"),
        calldata=[20],
    )
    calls = [increase_balance_by_20_call, increase_balance_by_20_call]

    # Execute one transaction with multiple calls
    resp = await account.execute_v1(calls=calls, max_fee=int(1e16))
    await account.client.wait_for_tx(resp.transaction_hash)
    # docs: end

    (final_balance,) = await balance_contract.functions["get_balance"].call()
    assert final_balance == initial_balance + 40
