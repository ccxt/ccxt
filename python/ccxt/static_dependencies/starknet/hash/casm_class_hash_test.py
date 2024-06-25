# fmt: off
import pytest

from common import create_casm_class
from hash.casm_class_hash import compute_casm_class_hash
from tests.e2e.fixtures.constants import PRECOMPILED_CONTRACTS_DIR
from tests.e2e.fixtures.misc import (
    ContractVersion,
    load_contract,
    read_contract,
)


@pytest.mark.parametrize(
    "contract, expected_casm_class_hash",
    [
        ("Account", 0x108977ab61715437fc7097b6499b3cf9491361eb6a8ce6df6c8536b7feec508),
        ("ERC20", 0x5adc857416202a5902c01168542e188c3aa6380f57c911ae98cf20bc52be367),
        ("HelloStarknet", 0x6ff9f7df06da94198ee535f41b214dce0b8bafbdb45e6c6b09d4b3b693b1f17),
        ("TestContract", 0x2193add92c182c9236f0c156f11dc4f18d5a78fd9b763a3c0f4a1d3bd8b87d4),
        ("TokenBridge", 0x41d26534c7ca29e212ae48acfb9f86f69a9624977c979697c15f587fa95204),
    ],
)
def test_compute_casm_class_hash(contract, expected_casm_class_hash):
    casm_contract_class_str = load_contract(
        contract, version=ContractVersion.V2
    )['casm']

    casm_class = create_casm_class(casm_contract_class_str)
    casm_class_hash = compute_casm_class_hash(casm_class)
    assert casm_class_hash == expected_casm_class_hash

@pytest.mark.parametrize(
    "casm_contract_class_source, expected_casm_class_hash",
    [
        ("minimal_contract_compiled_v2_1.casm",
         0x186f6c4ca3af40dbcbf3f08f828ab0ee072938aaaedccc74ef3b9840cbd9fb3),
        ("minimal_contract_compiled_v2_5_4.casm",
         0x1d055a90aa90db474fa08a931d5e63753c6f762fa3e9597b26c8d4b003a2de6),
        ("starknet_contract_v2_6.casm", 0x603dd72504d8b0bc54df4f1102fdcf87fc3b2b94750a9083a5876913eec08e4),
    ],
)
def test_precompiled_compute_casm_class_hash(casm_contract_class_source, expected_casm_class_hash):
    casm_contract_class_str = read_contract(
        casm_contract_class_source, directory=PRECOMPILED_CONTRACTS_DIR
    )

    casm_class = create_casm_class(casm_contract_class_str)
    casm_class_hash = compute_casm_class_hash(casm_class)
    assert casm_class_hash == expected_casm_class_hash
