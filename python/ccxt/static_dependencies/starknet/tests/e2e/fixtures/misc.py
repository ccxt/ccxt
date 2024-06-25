# pylint: disable=redefined-outer-name

import json
import sys
from enum import Enum
from pathlib import Path
from typing import Optional

import pytest

from net.full_node_client import FullNodeClient
from net.models.typed_data import TypedDataDict
from tests.e2e.fixtures.constants import (
    CONTRACTS_V1_ARTIFACTS_MAP,
    CONTRACTS_V1_COMPILED,
    CONTRACTS_V2_ARTIFACTS_MAP,
    CONTRACTS_V2_COMPILED,
    TYPED_DATA_DIR,
)


def pytest_addoption(parser):
    parser.addoption(
        "--contract_dir",
        action="store",
        default="",
        help="Contract directory: possible 'v1', 'v2'",
    )


@pytest.fixture(
    params=[
        "typed_data_example.json",
        "typed_data_felt_array_example.json",
        "typed_data_long_string_example.json",
        "typed_data_struct_array_example.json",
    ],
)
def typed_data(request) -> TypedDataDict:
    """
    Returns TypedData dictionary example.
    """
    file_name = getattr(request, "param")
    file_path = TYPED_DATA_DIR / file_name

    with open(file_path, "r", encoding="utf-8") as file:
        typed_data = json.load(file)

    return typed_data


@pytest.fixture(name="get_tx_receipt_path", scope="package")
def get_tx_receipt_full_node_client():
    return f"{FullNodeClient.__module__}.FullNodeClient.get_transaction_receipt"


@pytest.fixture(name="get_tx_status_path", scope="package")
def get_tx_status_full_node_client():
    return f"{FullNodeClient.__module__}.FullNodeClient.get_transaction_status"


class ContractVersion(Enum):
    V1 = "V1"
    V2 = "V2"


class UnknownArtifacts(BaseException):
    pass


def load_contract(contract_name: str, version: Optional[ContractVersion] = None):
    if version is None:
        if "--contract_dir=v1" in sys.argv:
            version = ContractVersion.V1
        if "--contract_dir=v2" in sys.argv:
            version = ContractVersion.V2

    if version == ContractVersion.V1:
        artifacts_map_path = CONTRACTS_V1_ARTIFACTS_MAP
        directory = CONTRACTS_V1_COMPILED
    else:
        artifacts_map_path = CONTRACTS_V2_ARTIFACTS_MAP
        directory = CONTRACTS_V2_COMPILED

    artifacts_map = json.loads((artifacts_map_path).read_text("utf-8"))

    artifact_file_names = next(
        (
            item["artifacts"]
            for item in artifacts_map["contracts"]
            if item["contract_name"] == contract_name
        ),
        None,
    )

    if not isinstance(artifact_file_names, dict):  # pyright: ignore
        raise UnknownArtifacts(f"Artifacts for contract {contract_name} not found")

    sierra = (directory / artifact_file_names["sierra"]).read_text("utf-8")
    casm = (directory / artifact_file_names["casm"]).read_text("utf-8")

    return {"casm": casm, "sierra": sierra}


def read_contract(file_name: str, *, directory: Path) -> str:
    """
    Return contents of file_name from directory.
    """
    return (directory / file_name).read_text("utf-8")
