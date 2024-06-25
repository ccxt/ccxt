import pytest

from common import create_compiled_contract


@pytest.mark.asyncio
async def test_simple_deploy(account, map_class_hash, map_compiled_contract):
    # pylint: disable=import-outside-toplevel
    # docs: start
    from contract import Contract

    # docs: end

    class_hash = map_class_hash
    abi = create_compiled_contract(compiled_contract=map_compiled_contract).abi

    # docs: start
    # To deploy contract just use `Contract.deploy_contract_v1` method
    # Note that class_hash and abi of the contract must be known

    # If constructor of the contract requires arguments, pass constructor_args parameter
    constructor_args = {"value": 10}

    # docs: end
    constructor_args = None

    # docs: start
    deploy_result = await Contract.deploy_contract_v1(
        account=account,
        class_hash=class_hash,
        abi=abi,
        constructor_args=constructor_args,
        max_fee=int(1e16),
    )

    # `Contract.deploy_contract_v1` and `Contract.deploy_contract_v3` methods have an optional parameter
    # `deployer_address` that needs to be specified when using other network than mainnet or sepolia
    # Read more about it in the API section

    # Wait for the transaction
    await deploy_result.wait_for_acceptance()

    # To interact with just deployed contract get its instance from the deploy_result
    contract = deploy_result.deployed_contract

    # Now, any of the contract functions can be called
    # docs: end

    assert contract.address != 0
