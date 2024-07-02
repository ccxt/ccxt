# pylint: disable=line-too-long
# fmt: off
import copy

import pytest

from common import create_contract_class
from hash.class_hash import compute_class_hash
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR
from tests.e2e.fixtures.misc import read_contract


@pytest.mark.parametrize(
    "contract_source, expected_class_hash", [
        ("balance_compiled.json", 0x7a98eab69a2592ef5d3805990a43525d633ddc42b4d5b2524c7f38b7c59265f),
        ("map_compiled.json", 0x5eefff2c17c81fb81b1c34d2a9f324e7baf8c3099165b94d037a84b74b6900e),
        ("erc20_compiled.json", 0x2c709fc176283331897d0c5f113ba64b00e1530c3e91103dcf1b05a056b1aa1),
        ("oz_proxy_compiled.json", 0x382f95037fa7983ff69465b9d3f7394ce336870631066de682cf547dc1899dd),
        ("argent_proxy_compiled.json", 0x743aa3636b7c795931e9c4ed56dc57e7edda223a66c09df04fda40f9ba4cd53),
        ("universal_deployer_compiled.json", 0x710bb1f5ef7f208249a370372a7586b72a759fbd2923013b14bd7f2e51bc4c),
        ("precompiled/oz_proxy_address_0.8.1_compiled.json", 0x413c36c287cb410d42f9e531563f68ac60a2913b5053608d640fb9b643acfe6),
    ]
)
def test_compute_class_hash(contract_source, expected_class_hash):
    compiled_contract = read_contract(contract_source, directory=CONTRACTS_COMPILED_V0_DIR)
    contract_class = create_contract_class(compiled_contract)
    initial_contract_class = copy.deepcopy(contract_class)
    class_hash = compute_class_hash(contract_class)

    assert class_hash == expected_class_hash
    assert contract_class == initial_contract_class
