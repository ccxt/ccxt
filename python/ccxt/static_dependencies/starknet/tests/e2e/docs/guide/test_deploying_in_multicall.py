import pytest

from common import create_compiled_contract


@pytest.mark.asyncio
async def test_deploying_in_multicall(account, map_class_hash, map_compiled_contract):
    # pylint: disable=import-outside-toplevel,
    # docs: start
    from contract import Contract
    from net.udc_deployer.deployer import Deployer

    # First, create Deployer instance. For more details see previous paragraph
    deployer = Deployer()

    # Create contract deployment. We will be deploying the `map` contract
    deploy_call, address = deployer.create_contract_deployment(
        class_hash=map_class_hash
    )
    # docs: end

    map_abi = create_compiled_contract(compiled_contract=map_compiled_contract).abi
    # docs: start

    # Address of the `map` contract is known here, so we can create its instance!
    map_contract = Contract(
        address=address, abi=map_abi, provider=account, cairo_version=0
    )

    # And now we can prepare a call
    put_call = map_contract.functions["put"].prepare_invoke_v1(key=10, value=20)

    # After that multicall transaction can be sent
    # Note that `deploy_call` and `put_call` are two regular calls!
    invoke_tx = await account.sign_invoke_v1(
        calls=[deploy_call, put_call], max_fee=int(1e16)
    )

    resp = await account.client.send_transaction(invoke_tx)
    await account.client.wait_for_tx(resp.transaction_hash)

    (value,) = await map_contract.functions["get"].call(key=10)
    # value = 20
    # docs: end

    assert value == 20
