import pytest


@pytest.mark.asyncio
async def test_sign_offchain_message(account):
    # pylint: disable=import-outside-toplevel, duplicate-code, unused-variable

    # docs: start
    from net.account.account import Account
    from net.full_node_client import FullNodeClient
    from net.models import StarknetChainId
    from net.signer.stark_curve_signer import KeyPair
    from utils.typed_data import TypedData

    # Create a TypedData dictionary
    typed_data = {
        "types": {
            "StarkNetDomain": [
                {"name": "name", "type": "felt"},
                {"name": "version", "type": "felt"},
                {"name": "chainId", "type": "felt"},
            ],
            "Person": [
                {"name": "name", "type": "felt"},
                {"name": "wallet", "type": "felt"},
            ],
            "Mail": [
                {"name": "from", "type": "Person"},
                {"name": "to", "type": "Person"},
                {"name": "contents", "type": "felt"},
            ],
        },
        "primaryType": "Mail",
        "domain": {"name": "StarkNet Mail", "version": "1", "chainId": 1},
        "message": {
            "from": {
                "name": "Cow",
                "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
            },
            "to": {
                "name": "Bob",
                "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
            },
            "contents": "Hello, Bob!",
        },
    }
    # docs: end

    # save account fixture
    account_fixture = account

    # docs: start

    # Create an Account instance
    client = FullNodeClient(node_url="your.node.url")
    account = Account(
        client=client,
        address="0x1111",
        key_pair=KeyPair(private_key=123, public_key=456),
        chain=StarknetChainId.SEPOLIA,
    )
    # docs: end

    # retrieve account
    account = account_fixture

    # docs: start

    # Sign the message
    signature = account.sign_message(typed_data=typed_data)

    # Verify the message
    verify_result = account.verify_message(typed_data=typed_data, signature=signature)

    # Or if just a message hash is needed
    data = TypedData.from_dict(typed_data)
    message_hash = data.message_hash(account.address)

    # docs: end

    assert verify_result
