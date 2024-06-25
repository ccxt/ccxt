# pylint: disable=import-outside-toplevel, duplicate-code
import os

import pytest

directory = os.path.dirname(__file__)


@pytest.mark.asyncio
async def test_using_contract(account, map_contract):
    # pylint: disable=unused-variable,too-many-locals
    # docs: start
    from contract import Contract

    contract_address = (
        "0x01336fa7c870a7403aced14dda865b75f29113230ed84e3a661f7af70fe83e7b"
    )
    key = 1234
    # docs: end

    contract_address = map_contract.address
    # docs: start

    # Create contract from contract's address - Contract will download contract's ABI to know its interface.
    contract = await Contract.from_address(address=contract_address, provider=account)
    # docs: end

    abi = contract.data.abi

    # docs: start

    # If the ABI is known, create the contract directly (this is the preferred way).
    contract = Contract(
        address=contract_address,
        abi=abi,
        provider=account,
        cairo_version=0,
    )

    # All exposed functions are available at contract.functions.
    # Here we invoke a function, creating a new transaction.
    invocation = await contract.functions["put"].invoke_v1(key, 7, max_fee=int(1e16))

    # Invocation returns InvokeResult object. It exposes a helper for waiting until transaction is accepted.
    await invocation.wait_for_acceptance()

    # Calling contract's function doesn't create a new transaction, you get the function's result.
    (saved,) = await contract.functions["get"].call(key)
    # saved = 7 now
    # docs: end

    assert saved == 7
