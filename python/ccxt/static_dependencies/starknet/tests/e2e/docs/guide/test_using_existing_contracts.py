import pytest

# docs-abi: start
abi = [
    {
        "inputs": [
            {"name": "sender", "type": "felt"},
            {"name": "recipient", "type": "felt"},
            {"name": "amount", "type": "felt"},
        ],
        "name": "transferFrom",
        "outputs": [{"name": "success", "type": "felt"}],
        "type": "function",
    },
    {
        "inputs": [{"name": "account", "type": "felt"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "felt"}],
        "stateMutability": "view",
        "type": "function",
    },
]
# docs-abi: end


@pytest.mark.asyncio
async def test_using_existing_contracts(account, erc20_contract):
    # pylint: disable=import-outside-toplevel,too-many-locals,unused-variable
    # docs: start
    from contract import Contract

    address = "0x00178130dd6286a9a0e031e4c73b2bd04ffa92804264a25c1c08c1612559f458"

    # When ABI is known statically just use the Contract constructor
    contract = Contract(address=address, abi=abi, provider=account, cairo_version=0)
    # or if it is not known
    # Contract.from_address makes additional request to fetch the ABI
    # docs: end

    address = erc20_contract.address
    # docs: start
    contract = await Contract.from_address(provider=account, address=address)

    sender = "321"
    recipient = "123"

    # Using only positional arguments
    invocation = await contract.functions["transferFrom"].invoke_v1(
        sender, recipient, 10000, max_fee=int(1e16)
    )
    # docs: end
    await invocation.wait_for_acceptance()
    # docs: start

    # Using only keyword arguments
    invocation = await contract.functions["transferFrom"].invoke_v1(
        sender=sender, recipient=recipient, amount=10000, max_fee=int(1e16)
    )
    # docs: end
    await invocation.wait_for_acceptance()
    # docs: start

    # Mixing positional with keyword arguments
    invocation = await contract.functions["transferFrom"].invoke_v1(
        sender, recipient, amount=10000, max_fee=int(1e16)
    )
    # docs: end
    await invocation.wait_for_acceptance()
    # docs: start

    # Creating a prepared function call with arguments
    # It is also possible to use `prepare_invoke_v3`
    transfer = contract.functions["transferFrom"].prepare_invoke_v1(
        sender, recipient, amount=10000, max_fee=int(1e16)
    )
    invocation = await transfer.invoke()

    # Wait for tx
    await invocation.wait_for_acceptance()

    (balance,) = await contract.functions["balanceOf"].call(recipient)

    # You can also use key access, call returns TupleDataclass which behaves similar to NamedTuple
    result = await contract.functions["balanceOf"].call(recipient)
    balance = result.balance
    # docs: end

    assert balance == 200


@pytest.mark.asyncio
async def test_raw_call(account):
    # pylint: disable=import-outside-toplevel
    # docs-raw-call: start
    from hash.selector import get_selector_from_name
    from net.client_models import Call

    # docs-raw-call: end
    # fmt: off
    # docs-raw-call: start
    eth_token_address = 0x049D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7
    # docs-raw-call: end
    # fmt: on
    # docs-raw-call: start

    # Create a call to function "balanceOf" at address `eth_token_address`
    call = Call(
        to_addr=eth_token_address,
        selector=get_selector_from_name("balanceOf"),
        calldata=[account.address],
    )
    # Pass the created call to Client.call_contract
    account_balance = await account.client.call_contract(call)

    # Note that a Contract instance cannot be used here, since it needs ABI to generate the functions
    # docs-raw-call: end

    assert account_balance != [0, 0]
