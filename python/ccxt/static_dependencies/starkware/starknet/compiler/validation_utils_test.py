from typing import List, Optional

import pytest

from starkware.cairo.lang.compiler.preprocessor.preprocessor_error import PreprocessorError
from starkware.starknet.compiler.validation_utils import (
    VALIDATE_DECLARE_ARGS,
    VALIDATE_DEPLOY_REQUIRED_ARGS,
    verify_account_contract,
)
from starkware.starknet.public import abi as starknet_abi


def create_account_contract_abi() -> starknet_abi.AbiType:
    abi: starknet_abi.AbiType = [
        {
            "type": "function",
            "name": entry_point_name,
            "inputs": (
                VALIDATE_DECLARE_ARGS
                if entry_point_name != starknet_abi.VALIDATE_DEPLOY_ENTRY_POINT_NAME
                else VALIDATE_DEPLOY_REQUIRED_ARGS
            ),
        }
        for entry_point_name in starknet_abi.EXTENDED_ACCOUNT_ENTRY_POINT_NAMES
    ]

    return abi


def create_faulty_account_contract_abi(
    entry_point_to_remove: Optional[str] = None,
    entry_point_to_corrupt: Optional[str] = None,
    deformed_args: Optional[List[starknet_abi.AbiEntryType]] = None,
) -> starknet_abi.AbiType:
    abi = create_account_contract_abi()
    if entry_point_to_remove is not None:
        abi = [entry_point for entry_point in abi if entry_point["name"] != entry_point_to_remove]

    for entry_point in abi:
        if entry_point_to_corrupt is not None and entry_point["name"] == entry_point_to_corrupt:
            assert deformed_args is not None
            entry_point["inputs"] = deformed_args

    return abi


def test_positive_flow_verify_account_contract():
    # Account contract.
    account_contract_abi = create_account_contract_abi()
    verify_account_contract(contract_abi=account_contract_abi, is_account_contract=True)

    # Account contract without '__validate_declare__'.
    account_contract_abi = create_faulty_account_contract_abi(
        entry_point_to_remove=starknet_abi.VALIDATE_DEPLOY_ENTRY_POINT_NAME
    )
    verify_account_contract(contract_abi=account_contract_abi, is_account_contract=True)

    # Non-account contract.
    abi: starknet_abi.AbiType = [
        {
            "type": "function",
            "name": "increase balance",
            "inputs": [{"name": "amount", "type": "felt"}],
        }
    ]
    verify_account_contract(contract_abi=abi, is_account_contract=False)


def test_negative_flow_verify_account_contract(capsys: pytest.CaptureFixture):
    """
    Test malformed account contracts ABI.
    """
    # Contract missing one or more of the account entry points:
    #   "__execute__", "__validate__", "__validate_declare__", "__validate_deploy__".
    defected_account_contract_abi = create_faulty_account_contract_abi(
        entry_point_to_remove=starknet_abi.VALIDATE_ENTRY_POINT_NAME
    )
    with pytest.raises(
        PreprocessorError,
        match=(
            "Account contracts must have external functions "
            "named: '__execute__', '__validate__', '__validate_declare__'. "
            "Missing: '__validate__'."
        ),
    ):
        verify_account_contract(
            contract_abi=defected_account_contract_abi, is_account_contract=True
        )
    with pytest.raises(PreprocessorError, match="Only account contracts may have functions named"):
        verify_account_contract(
            contract_abi=defected_account_contract_abi, is_account_contract=False
        )

    # Contract where "__validate__" and "__execute__" have different calldata.
    defected_account_contract_abi = create_faulty_account_contract_abi(
        entry_point_to_corrupt=starknet_abi.EXECUTE_ENTRY_POINT_NAME,
        deformed_args=[{"name": "unique_arg", "type": "felt"}],
    )
    with pytest.raises(
        PreprocessorError,
        match=(
            "Account contracts must have the exact same calldata for '__validate__' "
            "and '__execute__' functions."
        ),
    ):
        verify_account_contract(
            contract_abi=defected_account_contract_abi, is_account_contract=True
        )

    # Contract where "__validate_declare__" have malformed calldata.
    defected_account_contract_abi = create_faulty_account_contract_abi(
        entry_point_to_corrupt=starknet_abi.VALIDATE_DECLARE_ENTRY_POINT_NAME,
        deformed_args=VALIDATE_DECLARE_ARGS + [{"name": "contract_address", "type": "felt"}],
    )
    with pytest.raises(
        PreprocessorError,
        match="'__validate_declare__' function must have one argument 'class_hash: felt'.",
    ):
        verify_account_contract(
            contract_abi=defected_account_contract_abi, is_account_contract=True
        )

    # Test "__validate_deploy__".

    warning_template = """\
Warning:
the arguments of '__validate_deploy__' are expected to start with:
'class_hash: felt, contract_address_salt: felt'
followed by the constructor's arguments (if exist). Found:
'{actual_inputs}'.

Deploying this contract using a deploy account transaction is not recommended and would probably
fail.

"""

    # Contract where "__validate_deploy__" arguments are in the wrong order.
    defected_account_contract_abi = create_faulty_account_contract_abi(
        entry_point_to_corrupt=starknet_abi.VALIDATE_DEPLOY_ENTRY_POINT_NAME,
        deformed_args=VALIDATE_DEPLOY_REQUIRED_ARGS[::-1],
    )
    verify_account_contract(contract_abi=defected_account_contract_abi, is_account_contract=True)
    captured = capsys.readouterr()
    assert captured.out == warning_template.format(
        actual_inputs="contract_address_salt: felt, class_hash: felt"
    )

    # Contract without a "__constructor__" and "__validate_deploy__" has additional calldata.
    defected_account_contract_abi = create_faulty_account_contract_abi(
        entry_point_to_corrupt=starknet_abi.VALIDATE_DEPLOY_ENTRY_POINT_NAME,
        deformed_args=(
            VALIDATE_DEPLOY_REQUIRED_ARGS + [{"name": "contract_address", "type": "felt"}]
        ),
    )
    verify_account_contract(contract_abi=defected_account_contract_abi, is_account_contract=True)
    captured = capsys.readouterr()
    assert captured.out == warning_template.format(
        actual_inputs="class_hash: felt, contract_address_salt: felt, contract_address: felt"
    )

    # Contract where "__constructor__" is not contained in "__validate_deploy__" calldata.
    defected_account_contract_abi = create_account_contract_abi() + [
        {
            "type": "constructor",
            "name": starknet_abi.CONSTRUCTOR_ENTRY_POINT_NAME,
            "inputs": [{"name": "amount", "type": "felt"}],
        }
    ]
    verify_account_contract(contract_abi=defected_account_contract_abi, is_account_contract=True)
    captured = capsys.readouterr()
    assert captured.out == warning_template.format(
        actual_inputs="class_hash: felt, contract_address_salt: felt"
    )
