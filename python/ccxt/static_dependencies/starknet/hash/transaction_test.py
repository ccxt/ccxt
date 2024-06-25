import pytest

from common import create_compiled_contract
from hash.transaction import (
    CommonTransactionV3Fields,
    TransactionHashPrefix,
    compute_declare_transaction_hash,
    compute_declare_v2_transaction_hash,
    compute_declare_v3_transaction_hash,
    compute_deploy_account_transaction_hash,
    compute_deploy_account_v3_transaction_hash,
    compute_invoke_transaction_hash,
    compute_invoke_v3_transaction_hash,
    compute_transaction_hash,
)
from net.client_models import DAMode, ResourceBounds, ResourceBoundsMapping
from tests.e2e.fixtures.constants import CONTRACTS_COMPILED_V0_DIR
from tests.e2e.fixtures.misc import read_contract


@pytest.fixture(name="default_resource_bounds")
def get_resource_bounds():
    return ResourceBoundsMapping(
        l1_gas=ResourceBounds(max_amount=0x186A0, max_price_per_unit=0x5AF3107A4000),
        l2_gas=ResourceBounds(max_amount=0, max_price_per_unit=0),
    )


@pytest.mark.parametrize(
    "data, expected_hash",
    (
        (
            [TransactionHashPrefix.INVOKE, 2, 3, 4, [5], 6, 7, [8]],
            1176541524183318710439453346174486593835028723304878846501762065493748312757,
        ),
        (
            [TransactionHashPrefix.L1_HANDLER, 15, 39, 74, [74], 39, 15, [28]],
            1226653506056503634668815848352741482067480791322607584496401451909331743178,
        ),
        (
            [
                TransactionHashPrefix.INVOKE,
                0x0,
                0x2A,
                0x64,
                [],
                0x0,
                0x534E5F474F45524C49,
            ],
            0x7D260744DE9D8C55E7675A34512D1951A7B262C79E685D26599EDD2948DE959,
        ),
    ),
)
def test_compute_transaction_hash(data, expected_hash):
    assert compute_transaction_hash(*data) == expected_hash


@pytest.mark.parametrize(
    "data, expected_hash",
    (
        (
            {
                "contract_address": 2,
                "class_hash": 3,
                "constructor_calldata": [4],
                "salt": 5,
                "version": 6,
                "max_fee": 7,
                "chain_id": 8,
                "nonce": 9,
            },
            0x6199E956E541CBB06589C4A63C2578A8ED6B697C0FA35B002F48923DFE648EE,
        ),
    ),
)
def test_compute_deploy_account_transaction_hash(data, expected_hash):
    assert compute_deploy_account_transaction_hash(**data) == expected_hash


@pytest.mark.parametrize(
    "contract_json, data",
    [
        ("map_compiled.json", [3, 4, 5, 1, 7]),
        ("balance_compiled.json", [23, 24, 25, 26, 27]),
    ],
)
def test_compute_declare_transaction_hash(contract_json, data):
    contract = read_contract(contract_json, directory=CONTRACTS_COMPILED_V0_DIR)
    compiled_contract = create_compiled_contract(compiled_contract=contract)

    declare_hash = compute_declare_transaction_hash(compiled_contract, *data)

    assert declare_hash > 0


@pytest.mark.parametrize(
    "data, expected_hash",
    (
        (
            {
                "class_hash": 2,
                "sender_address": 3,
                "version": 4,
                "max_fee": 5,
                "chain_id": 6,
                "nonce": 7,
                "compiled_class_hash": 8,
            },
            0x67EA411072DD2EF3BA36D9680F040A02E599F80F4770E204ECBB2C47C226793,
        ),
    ),
)
def test_compute_declare_v2_transaction_hash(data, expected_hash):
    assert compute_declare_v2_transaction_hash(**data) == expected_hash


@pytest.mark.parametrize(
    "data, expected_hash",
    (
        (
            {
                "sender_address": 3,
                "version": 4,
                "calldata": [5],
                "max_fee": 6,
                "chain_id": 7,
                "nonce": 8,
            },
            0x505BBF7CD810531C53526631078DAA314BFD036C80C7C6E3A02C608DB8E31DE,
        ),
    ),
)
def test_compute_invoke_transaction_hash(data, expected_hash):
    assert compute_invoke_transaction_hash(**data) == expected_hash


@pytest.mark.parametrize(
    "common_data, declare_data, expected_hash",
    (
        (
            {
                "address": 0x52125C1E043126C637D1436D9551EF6C4F6E3E36945676BBD716A56E3A41B7A,
                "chain_id": 0x534E5F474F45524C49,
                "nonce": 0x675,
                "tip": 0x0,
                "paymaster_data": [],
                "nonce_data_availability_mode": DAMode.L1,
                "fee_data_availability_mode": DAMode.L1,
                "tx_prefix": TransactionHashPrefix.DECLARE,
                "version": 0x3,
            },
            {
                "class_hash": 0x2338634F11772EA342365ABD5BE9D9DC8A6F44F159AD782FDEBD3DB5D969738,
                "compiled_class_hash": 0x17B5169C770D0E49100AB0FC672A49CA90CC572F21F79A640B5227B19D3A447,
                "account_deployment_data": [],
            },
            0x7B31376D1C4F467242616530901E1B441149F1106EF765F202A50A6F917762B,
        ),
    ),
)
def test_compute_declare_v3_transaction_hash(
    common_data, declare_data, expected_hash, default_resource_bounds
):
    assert (
        compute_declare_v3_transaction_hash(
            **declare_data,
            common_fields=CommonTransactionV3Fields(
                **common_data, resource_bounds=default_resource_bounds
            ),
        )
        == expected_hash
    )


@pytest.mark.parametrize(
    "common_data, invoke_data, expected_hash",
    (
        (
            {
                "address": 0x35ACD6DD6C5045D18CA6D0192AF46B335A5402C02D41F46E4E77EA2C951D9A3,
                "chain_id": 0x534E5F474F45524C49,
                "nonce": 0x5,
                "tip": 0x0,
                "paymaster_data": [],
                "nonce_data_availability_mode": DAMode.L1,
                "fee_data_availability_mode": DAMode.L1,
                "tx_prefix": TransactionHashPrefix.INVOKE,
                "version": 0x3,
            },
            {
                "calldata": [
                    0x2,
                    0x6359ED638DF79B82F2F9DBF92ABBCB41B57F9DD91EAD86B1C85D2DEE192C,
                    0xB17D8A2731BA7CA1816631E6BE14F0FC1B8390422D649FA27F0FBB0C91EEA8,
                    0x0,
                    0x3FE8E4571772BBE0065E271686BD655EFD1365A5D6858981E582F82F2C10313,
                    0x2FD9126EE011F3A837CEA02E32AE4EE73342D827E216998E5616BAB88D8B7EA,
                    0x1,
                    0x2FD9126EE011F3A837CEA02E32AE4EE73342D827E216998E5616BAB88D8B7EA,
                ],
                "account_deployment_data": [],
            },
            0x15F2CF38832542602E2D1C8BF0634893E6B43ACB6879E8A8F892F5A9B03C907,
        ),
    ),
)
def test_compute_invoke_v3_transaction_hash(
    common_data, invoke_data, expected_hash, default_resource_bounds
):
    assert (
        compute_invoke_v3_transaction_hash(
            **invoke_data,
            common_fields=CommonTransactionV3Fields(
                **common_data, resource_bounds=default_resource_bounds
            ),
        )
        == expected_hash
    )


@pytest.mark.parametrize(
    "common_data, deploy_account_data, expected_hash",
    (
        (
            {
                "address": 0x2FAB82E4AEF1D8664874E1F194951856D48463C3E6BF9A8C68E234A629A6F50,
                "chain_id": 0x534E5F474F45524C49,
                "nonce": 0x0,
                "tip": 0x0,
                "paymaster_data": [],
                "nonce_data_availability_mode": DAMode.L1,
                "fee_data_availability_mode": DAMode.L1,
                "tx_prefix": TransactionHashPrefix.DEPLOY_ACCOUNT,
                "version": 0x3,
            },
            {
                "constructor_calldata": [
                    0x5CD65F3D7DAEA6C63939D659B8473EA0C5CD81576035A4D34E52FB06840196C
                ],
                "contract_address_salt": 0x0,
                "class_hash": 0x2338634F11772EA342365ABD5BE9D9DC8A6F44F159AD782FDEBD3DB5D969738,
            },
            0x29FD7881F14380842414CDFDD8D6C0B1F2174F8916EDCFEB1EDE1EB26AC3EF0,
        ),
    ),
)
def test_compute_deploy_account_v3_transaction_hash(
    common_data, deploy_account_data, expected_hash, default_resource_bounds
):
    assert (
        compute_deploy_account_v3_transaction_hash(
            **deploy_account_data,
            common_fields=CommonTransactionV3Fields(
                **common_data,
                resource_bounds=default_resource_bounds,
            ),
        )
        == expected_hash
    )
