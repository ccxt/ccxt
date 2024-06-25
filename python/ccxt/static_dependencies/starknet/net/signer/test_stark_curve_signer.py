import pytest

from common import create_compiled_contract
from net.models import StarknetChainId
from net.models.transaction import DeclareV1, DeployAccountV1, InvokeV1
from net.signer.stark_curve_signer import KeyPair, StarkCurveSigner
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR
from tests.e2e.fixtures.misc import read_contract

compiled_contract = read_contract(
    "erc20_compiled.json", directory=CONTRACTS_COMPILED_V0_DIR
)


@pytest.mark.parametrize(
    "transaction",
    [
        InvokeV1(
            sender_address=0x1,
            calldata=[1, 2, 3],
            max_fee=10000,
            signature=[],
            nonce=23,
            version=1,
        ),
        DeployAccountV1(
            class_hash=0x1,
            contract_address_salt=0x2,
            constructor_calldata=[1, 2, 3, 4],
            max_fee=10000,
            signature=[],
            nonce=23,
            version=1,
        ),
        DeclareV1(
            contract_class=create_compiled_contract(
                compiled_contract=compiled_contract
            ),
            sender_address=123,
            max_fee=10000,
            signature=[],
            nonce=23,
            version=1,
        ),
    ],
)
def test_sign_transaction(transaction):
    signer = StarkCurveSigner(
        account_address=0x1,
        key_pair=KeyPair.from_private_key(0x1),
        chain_id=StarknetChainId.MAINNET,
    )

    signature = signer.sign_transaction(transaction)

    assert isinstance(signature, list)
    assert len(signature) > 0
    assert all(isinstance(i, int) for i in signature)
    assert all(i != 0 for i in signature)


def test_key_pair():
    key_pair = KeyPair(public_key="0x123", private_key="0x456")

    assert isinstance(key_pair.public_key, int)
    assert isinstance(key_pair.private_key, int)

    key_pair = KeyPair.from_private_key("0x789")

    assert isinstance(key_pair.public_key, int)
    assert isinstance(key_pair.private_key, int)
