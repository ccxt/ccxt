from dataclasses import dataclass

from contract import Contract
from net.account.account import Account
from tests.e2e.fixtures.constants import MAX_FEE
from tests.e2e.utils import (
    AccountToBeDeployedDetails,
    get_deploy_account_transaction,
)


@dataclass
class PreparedNetworkData:
    # pylint: disable=too-many-instance-attributes
    class_hash: int
    contract_address: int
    invoke_transaction_hash: int
    block_with_invoke_number: int
    declare_transaction_hash: int
    block_with_declare_number: int
    block_with_declare_hash: int
    deploy_account_transaction_hash: int
    block_with_deploy_account_number: int
    block_with_deploy_account_hash: int


async def prepare_net_for_tests(
    account: Account,
    compiled_contract: str,
    deploy_account_details: AccountToBeDeployedDetails,
) -> PreparedNetworkData:
    # pylint: disable=too-many-locals
    declare_result = await Contract.declare_v1(
        account=account, compiled_contract=compiled_contract, max_fee=MAX_FEE
    )
    await declare_result.wait_for_acceptance()
    deploy_result = await declare_result.deploy_v1(max_fee=MAX_FEE)
    await deploy_result.wait_for_acceptance()

    declare_receipt = await account.client.get_transaction_receipt(declare_result.hash)
    block_with_declare_number = declare_receipt.block_number
    block_with_declare_hash = declare_receipt.block_hash

    contract = deploy_result.deployed_contract

    invoke_res = await contract.functions["increase_balance"].invoke_v1(
        amount=1234, max_fee=int(1e20)
    )
    await invoke_res.wait_for_acceptance()

    block_with_invoke_number = (
        await account.client.get_transaction_receipt(invoke_res.hash)
    ).block_number

    address, key_pair, salt, class_hash = deploy_account_details
    deploy_account_tx = await get_deploy_account_transaction(
        address=address,
        key_pair=key_pair,
        salt=salt,
        class_hash=class_hash,
        client=account.client,
    )
    deploy_account_result = await account.client.deploy_account(deploy_account_tx)
    await account.client.wait_for_tx(deploy_account_result.transaction_hash)

    declare_account_receipt = await account.client.get_transaction_receipt(
        deploy_account_result.transaction_hash
    )
    block_with_deploy_account_number = declare_account_receipt.block_number
    block_with_deploy_account_hash = declare_account_receipt.block_hash

    assert block_with_invoke_number is not None
    assert block_with_declare_number is not None
    assert block_with_declare_hash is not None
    assert block_with_deploy_account_number is not None
    assert block_with_deploy_account_hash is not None

    return PreparedNetworkData(
        class_hash=declare_result.class_hash,
        contract_address=contract.address,
        invoke_transaction_hash=invoke_res.hash,
        block_with_invoke_number=block_with_invoke_number,
        declare_transaction_hash=declare_result.hash,
        block_with_declare_number=block_with_declare_number,
        block_with_declare_hash=block_with_declare_hash,
        deploy_account_transaction_hash=deploy_account_result.transaction_hash,
        block_with_deploy_account_hash=block_with_deploy_account_hash,
        block_with_deploy_account_number=block_with_deploy_account_number,
    )
