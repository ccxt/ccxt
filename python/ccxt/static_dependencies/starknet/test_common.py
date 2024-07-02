from common import create_sierra_compiled_contract
from net.client_models import SierraCompiledContract


def test_create_new_compiled_contract(sierra_minimal_compiled_contract_and_class_hash):
    compiled_contract, _ = sierra_minimal_compiled_contract_and_class_hash

    contract = create_sierra_compiled_contract(compiled_contract)

    assert isinstance(contract, SierraCompiledContract)
    assert contract.abi is not None
