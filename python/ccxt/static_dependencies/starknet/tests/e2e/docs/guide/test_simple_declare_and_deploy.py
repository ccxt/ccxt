import pytest


@pytest.mark.asyncio
async def test_simple_declare_and_deploy(account, map_compiled_contract):
    # pylint: disable=import-outside-toplevel
    # docs: start
    from contract import Contract

    # docs: end

    compiled_contract = map_compiled_contract
    # docs: start

    # To declare through Contract class you have to compile a contract and pass it
    # to Contract.declare_v1 or Contract.declare_v3
    declare_result = await Contract.declare_v1(
        account=account, compiled_contract=compiled_contract, max_fee=int(1e18)
    )
    # Wait for the transaction
    await declare_result.wait_for_acceptance()

    # After contract is declared it can be deployed
    deploy_result = await declare_result.deploy_v1(max_fee=int(1e18))
    await deploy_result.wait_for_acceptance()

    # You can pass more arguments to the `deploy` method. Check `API` section to learn more

    # To interact with just deployed contract get its instance from the deploy_result
    contract = deploy_result.deployed_contract

    # Now, any of the contract functions can be called
    # docs: end

    assert contract.address != 0
