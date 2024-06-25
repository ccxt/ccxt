import pytest

from common import create_sierra_compiled_contract
from hash.sierra_class_hash import compute_sierra_class_hash
from tests.e2e.fixtures.misc import ContractVersion, load_contract


@pytest.mark.parametrize(
    "contract_name, expected_class_hash",
    # fmt: off
    [
        ("Account", 0x450f568a8cb6ea1bcce446355e8a1c2e5852a6b8dc3536f495cdceb62e8a7e2),
        ("ERC20", 0x746248ba570006607113ae3f4dbb4130e81233fb818d15329c6a4aaccf94812),
        ("HelloStarknet", 0x224518978adb773cfd4862a894e9d333192fbd24bc83841dc7d4167c09b89c5),
        ("MinimalContract", 0x6fb1efd745d57b60023c6dc3209227e5e54d44fa16e0ae75cc03e1a7f3da08a),
        ("TestContract", 0x3adac8a417b176d27e11b420aa1063b07a6b54bbb21091ad77b2a9156af7a3b),
        ("TokenBridge", 0x3d138e923f01b7ed1bb82b9b4e7f6df64e0c429faf8b27539addc71c1407237),
    ],
    # fmt: on
)
def test_compute_sierra_class_hash(contract_name, expected_class_hash):
    sierra_contract_class_str = load_contract(
        contract_name=contract_name, version=ContractVersion.V2
    )["sierra"]

    sierra_contract_class = create_sierra_compiled_contract(sierra_contract_class_str)
    class_hash = compute_sierra_class_hash(sierra_contract_class)

    assert class_hash == expected_class_hash
