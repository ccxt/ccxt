# pylint: disable=line-too-long
# fmt: off

import json
from pathlib import Path

import pytest

from tests.e2e.fixtures.constants import TYPED_DATA_DIR
from utils.typed_data import TypedData, get_hex

TD = "typed_data_example.json"
TD_STRING = "typed_data_long_string_example.json"
TD_FELT_ARR = "typed_data_felt_array_example.json"
TD_STRUCT_ARR = "typed_data_struct_array_example.json"


def load_typed_data(file_name: str) -> TypedData:
    """
    Load TypedData object from file
    """
    file_path = TYPED_DATA_DIR / file_name

    text = Path(file_path).read_text("utf-8")
    typed_data = json.loads(text)

    return TypedData.from_dict(typed_data)


@pytest.mark.parametrize(
    "value, result",
    [(123, "0x7b"), ("123", "0x7b"), ("0x7b", "0x7b"), ("short_string", "0x73686f72745f737472696e67")],
)
def test_get_hex(value, result):
    assert get_hex(value) == result


@pytest.mark.parametrize(
    "example, type_name, encoded_type",
    [
        (TD, "Mail", "Mail(from:Person,to:Person,contents:felt)Person(name:felt,wallet:felt)"),
        (TD_FELT_ARR, "Mail", "Mail(from:Person,to:Person,felts_len:felt,felts:felt*)Person(name:felt,wallet:felt)"),
        (TD_STRING, "Mail", "Mail(from:Person,to:Person,contents:String)Person(name:felt,wallet:felt)String(len:felt,data:felt*)"),
        (TD_STRUCT_ARR, "Mail", "Mail(from:Person,to:Person,posts_len:felt,posts:Post*)Person(name:felt,wallet:felt)Post(title:felt,content:felt)")
    ],
)
def test_encode_type(example, type_name, encoded_type):
    typed_data = load_typed_data(example)
    res = typed_data._encode_type(type_name)  # pylint: disable=protected-access
    assert res == encoded_type


# The expected hashes here and in tests below were calculated using starknet.js (https://github.com/0xs34n/starknet.js)
@pytest.mark.parametrize(
    "example, type_name, type_hash",
    [
        (TD, "StarkNetDomain", "0x1bfc207425a47a5dfa1a50a4f5241203f50624ca5fdf5e18755765416b8e288"),
        (TD, "Person", "0x2896dbe4b96a67110f454c01e5336edc5bbc3635537efd690f122f4809cc855"),
        (TD, "Mail", "0x13d89452df9512bf750f539ba3001b945576243288137ddb6c788457d4b2f79"),
        (TD_STRING, "String", "0x1933fe9de7e181d64298eecb44fc43b4cec344faa26968646761b7278df4ae2"),
        (TD_STRING, "Mail", "0x1ac6f84a5d41cee97febb378ddabbe1390d4e8036df8f89dee194e613411b09"),
        (TD_FELT_ARR, "Mail", "0x5b03497592c0d1fe2f3667b63099761714a895c7df96ec90a85d17bfc7a7a0"),
        (TD_STRUCT_ARR, "Post", "0x1d71e69bf476486b43cdcfaf5a85c00bb2d954c042b281040e513080388356d"),
        (TD_STRUCT_ARR, "Mail", "0x873b878e35e258fc99e3085d5aaad3a81a0c821f189c08b30def2cde55ff27"),
    ],
)
def test_type_hash(example, type_name, type_hash):
    typed_data = load_typed_data(example)
    res = typed_data.type_hash(type_name)
    assert hex(res) == type_hash


@pytest.mark.parametrize(
    "example, type_name, attr_name, struct_hash",
    [
        (TD, "StarkNetDomain", "domain", "0x54833b121883a3e3aebff48ec08a962f5742e5f7b973469c1f8f4f55d470b07"),
        (TD, "Mail", "message", "0x4758f1ed5e7503120c228cbcaba626f61514559e9ef5ed653b0b885e0f38aec"),
        (TD_STRING, "Mail", "message", "0x1d16b9b96f7cb7a55950b26cc8e01daa465f78938c47a09d5a066ca58f9936f"),
        (TD_FELT_ARR, "Mail", "message", "0x26186b02dddb59bf12114f771971b818f48fad83c373534abebaaa39b63a7ce"),
        (TD_STRUCT_ARR, "Mail", "message", "0x5650ec45a42c4776a182159b9d33118a46860a6e6639bb8166ff71f3c41eaef")
    ],
)
def test_struct_hash(example, type_name, attr_name, struct_hash):
    typed_data = load_typed_data(example)
    res = typed_data.struct_hash(type_name, getattr(typed_data, attr_name))
    assert hex(res) == struct_hash


@pytest.mark.parametrize(
    "example, account_address, msg_hash",
    [
        (TD, "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826", "0x6fcff244f63e38b9d88b9e3378d44757710d1b244282b435cb472053c8d78d0"),
        (TD_STRING, "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826", "0x691b977ee0ee645647336f01d724274731f544ad0d626b078033d2541ee641d"),
        (TD_FELT_ARR, "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826", "0x30ab43ef724b08c3b0a9bbe425e47c6173470be75d1d4c55fd5bf9309896bce"),
        (TD_STRUCT_ARR, "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826", "0x5914ed2764eca2e6a41eb037feefd3d2e33d9af6225a9e7fe31ac943ff712c")
    ],
)
def test_message_hash(example, account_address, msg_hash):
    typed_data = load_typed_data(example)
    res = typed_data.message_hash(int(account_address, 16))
    assert hex(res) == msg_hash
